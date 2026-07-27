import { getBuilding } from '#/domain/data/buildings'
import { getItem } from '#/domain/data/items'
import { defaultRecipeFor, getRecipe, recipesProducing } from '#/domain/data/recipes'
import type {
  ItemId,
  MachineKind,
  ProductionTarget,
  Recipe,
  RecipeId,
} from '#/domain/models/types'
import {
  baseOutputPerMin,
  clampClock,
  machinesNeededCeil,
  machinesNeededExact,
  powerMW,
} from '#/domain/calc/overclock'
import { pickTransport, type ThroughputPick } from '#/domain/calc/throughput'

export interface SolveOptions {
  /** itemId → recipeId overrides (targets + intermediates) */
  recipeOverrides?: Record<ItemId, RecipeId>
  /** solution node key → clock percent */
  clockOverrides?: Record<string, number>
  defaultClockPercent?: number
  powerExponent?: number
  /** Max recursion depth guard */
  maxDepth?: number
}

export interface SolutionNode {
  id: string
  itemId: ItemId
  recipeId: RecipeId
  recipeName: string
  buildingId: string
  buildingName: string
  kind: MachineKind
  /** Required output rate of primary product (items/min) */
  outputRatePerMin: number
  /** All outputs scaled to production rate */
  outputs: { itemId: ItemId; ratePerMin: number }[]
  inputs: { itemId: ItemId; ratePerMin: number }[]
  clockPercent: number
  machinesExact: number
  machinesCeil: number
  powerMW: number
  isRaw: boolean
  isTarget: boolean
  transport: ThroughputPick
}

export interface SolutionEdge {
  id: string
  fromNodeId: string
  toNodeId: string
  itemId: ItemId
  ratePerMin: number
  transport: ThroughputPick
  isBottleneck: boolean
}

export interface ProductionSolution {
  nodes: SolutionNode[]
  edges: SolutionEdge[]
  totalMachines: number
  totalPowerMW: number
  rawInputs: { itemId: ItemId; ratePerMin: number }[]
  bottlenecks: string[]
  targets: { itemId: ItemId; ratePerMin: number }[]
}

function nodeKey(itemId: string, recipeId: string): string {
  return `${itemId}::${recipeId}`
}

function resolveRecipe(
  itemId: ItemId,
  overrideId: RecipeId | undefined,
  overrides: Record<ItemId, RecipeId>,
): Recipe | undefined {
  if (overrideId && recipesProducing(itemId).some((r) => r.id === overrideId)) {
    return getRecipe(overrideId)
  }
  const global = overrides[itemId]
  if (global && recipesProducing(itemId).some((r) => r.id === global)) {
    return getRecipe(global)
  }
  return defaultRecipeFor(itemId)
}

/**
 * Recursively solve production for targets. Merges shared intermediates (DAG).
 */
export function solveProduction(
  targets: ProductionTarget[],
  options: SolveOptions = {},
): ProductionSolution {
  const recipeOverrides = options.recipeOverrides ?? {}
  const clockOverrides = options.clockOverrides ?? {}
  const defaultClock = clampClock(options.defaultClockPercent ?? 100)
  const powerExponent = options.powerExponent ?? 1.321928
  const maxDepth = options.maxDepth ?? 40

  /** itemId → required rate/min (aggregated demand) */
  const demand = new Map<ItemId, number>()
  const targetSet = new Set<ItemId>()
  const targetRecipe = new Map<ItemId, RecipeId | undefined>()
  const targetClock = new Map<ItemId, number>()

  for (const t of targets) {
    if (t.ratePerMin <= 0) continue
    demand.set(t.itemId, (demand.get(t.itemId) ?? 0) + t.ratePerMin)
    targetSet.add(t.itemId)
    targetRecipe.set(t.itemId, t.recipeOverrideId)
    targetClock.set(t.itemId, clampClock(t.clockPercent || defaultClock))
  }

  // Expand demand until stable (worklist of items needing recipes)
  const expanded = new Set<ItemId>()
  const recipeForItem = new Map<ItemId, Recipe>()
  let guard = 0

  const queue: ItemId[] = [...demand.keys()]
  while (queue.length > 0) {
    if (++guard > maxDepth * 50) break
    const itemId = queue.shift()!
    if (expanded.has(itemId)) continue
    expanded.add(itemId)

    const recipe = resolveRecipe(itemId, targetRecipe.get(itemId), recipeOverrides)
    if (!recipe) continue
    recipeForItem.set(itemId, recipe)

    const needed = demand.get(itemId) ?? 0
    if (needed <= 0) continue

    const primary = recipe.outputs.find((o) => o.itemId === itemId) ?? recipe.outputs[0]
    if (!primary) continue
    const baseOut = baseOutputPerMin(primary.amount, recipe.durationSec)
    const clock = targetClock.get(itemId) ?? clockOverrides[nodeKey(itemId, recipe.id)] ?? defaultClock
    const machines = machinesNeededExact(needed, baseOut, clock)
    // scale factor: how many recipe cycles per minute total
    const cyclesPerMin = machines * (60 / recipe.durationSec) * (clampClock(clock) / 100)

    for (const input of recipe.inputs) {
      const rate = input.amount * cyclesPerMin
      const prev = demand.get(input.itemId) ?? 0
      demand.set(input.itemId, prev + rate)
      if (!expanded.has(input.itemId)) queue.push(input.itemId)
      else {
        // Re-expand parents when demand increases for already expanded nodes
        expanded.delete(input.itemId)
        queue.push(input.itemId)
      }
    }
  }

  // Second pass: rebuild with stable demand using iterative refinement
  // Clear and re-run a fixed-point style expansion for correctness on DAGs
  const stableDemand = refineDemand(targets, recipeOverrides, clockOverrides, defaultClock, maxDepth)

  const nodes: SolutionNode[] = []
  const nodeByItem = new Map<ItemId, SolutionNode>()
  const bottlenecks: string[] = []

  for (const [itemId, needed] of stableDemand) {
    if (needed <= 0) continue
    const recipe = resolveRecipe(itemId, targetRecipe.get(itemId), recipeOverrides)
    if (!recipe) {
      // Unknown production path — treat as raw external input
      const item = getItem(itemId)
      const transport = pickTransport(item.form, needed)
      const id = `raw::${itemId}`
      const node: SolutionNode = {
        id,
        itemId,
        recipeId: 'raw',
        recipeName: `${item.name} (external)`,
        buildingId: 'resource-node',
        buildingName: 'Resource',
        kind: 'resource',
        outputRatePerMin: needed,
        outputs: [{ itemId, ratePerMin: needed }],
        inputs: [],
        clockPercent: 100,
        machinesExact: 0,
        machinesCeil: 0,
        powerMW: 0,
        isRaw: true,
        isTarget: targetSet.has(itemId),
        transport,
      }
      if (transport.isBottleneck && transport.message) bottlenecks.push(transport.message)
      nodes.push(node)
      nodeByItem.set(itemId, node)
      continue
    }

    const building = getBuilding(recipe.buildingId)
    const primary = recipe.outputs.find((o) => o.itemId === itemId) ?? recipe.outputs[0]!
    const baseOut = baseOutputPerMin(primary.amount, recipe.durationSec)
    const clock =
      targetClock.get(itemId) ??
      clockOverrides[nodeKey(itemId, recipe.id)] ??
      defaultClock
    const machinesExact = machinesNeededExact(needed, baseOut, clock)
    const machinesCeil = machinesNeededCeil(needed, baseOut, clock)
    const pwr = powerMW(building.powerMW, machinesCeil, clock, powerExponent)
    const scale = needed / primary.amount // batches per min equivalent at output amount

    // cycles: needed / (primary.amount per craft) crafts per min at effective speed
    // inputs: amount * craftsPerMin where craftsPerMin = needed / primary.amount
    // Actually: at 100% one machine does (60/duration) crafts/min producing baseOut
    // machinesExact * baseOut = needed → craftsPerMin total = machinesExact * (60/duration) * clockFactor
    const craftsPerMin =
      machinesExact * (60 / recipe.durationSec) * (clampClock(clock) / 100)

    const inputs = recipe.inputs.map((i) => ({
      itemId: i.itemId,
      ratePerMin: i.amount * craftsPerMin,
    }))
    const outputs = recipe.outputs.map((o) => ({
      itemId: o.itemId,
      ratePerMin: o.amount * craftsPerMin,
    }))

    const item = getItem(itemId)
    const transport = pickTransport(item.form, needed)
    if (transport.isBottleneck && transport.message) bottlenecks.push(transport.message)

    const isRaw = recipe.inputs.length === 0
    const node: SolutionNode = {
      id: nodeKey(itemId, recipe.id),
      itemId,
      recipeId: recipe.id,
      recipeName: recipe.name,
      buildingId: building.id,
      buildingName: building.name,
      kind: building.kind,
      outputRatePerMin: needed,
      outputs,
      inputs,
      clockPercent: clampClock(clock),
      machinesExact,
      machinesCeil,
      powerMW: pwr,
      isRaw,
      isTarget: targetSet.has(itemId),
      transport,
    }
    nodes.push(node)
    nodeByItem.set(itemId, node)
    void scale
  }

  // Edges: producer of input → consumer
  const edges: SolutionEdge[] = []
  for (const node of nodes) {
    for (const inp of node.inputs) {
      const from = nodeByItem.get(inp.itemId)
      if (!from) continue
      const item = getItem(inp.itemId)
      const transport = pickTransport(item.form, inp.ratePerMin)
      if (transport.isBottleneck && transport.message) {
        bottlenecks.push(`${transport.message} → ${node.recipeName}`)
      }
      edges.push({
        id: `${from.id}->${node.id}:${inp.itemId}`,
        fromNodeId: from.id,
        toNodeId: node.id,
        itemId: inp.itemId,
        ratePerMin: inp.ratePerMin,
        transport,
        isBottleneck: transport.isBottleneck,
      })
    }
  }

  // Add output sink nodes for targets
  for (const t of targets) {
    if (t.ratePerMin <= 0) continue
    const producer = nodeByItem.get(t.itemId)
    if (!producer) continue
    const sinkId = `output::${t.itemId}`
    if (nodes.some((n) => n.id === sinkId)) continue
    const item = getItem(t.itemId)
    const transport = pickTransport(item.form, t.ratePerMin)
    nodes.push({
      id: sinkId,
      itemId: t.itemId,
      recipeId: 'output',
      recipeName: `Output: ${item.name}`,
      buildingId: 'output',
      buildingName: 'Factory Output',
      kind: 'output',
      outputRatePerMin: t.ratePerMin,
      outputs: [],
      inputs: [{ itemId: t.itemId, ratePerMin: t.ratePerMin }],
      clockPercent: 100,
      machinesExact: 0,
      machinesCeil: 0,
      powerMW: 0,
      isRaw: false,
      isTarget: true,
      transport,
    })
    edges.push({
      id: `${producer.id}->${sinkId}`,
      fromNodeId: producer.id,
      toNodeId: sinkId,
      itemId: t.itemId,
      ratePerMin: t.ratePerMin,
      transport,
      isBottleneck: transport.isBottleneck,
    })
  }

  const rawInputs = nodes
    .filter((n) => n.isRaw || n.kind === 'resource' || n.kind === 'miner' || n.kind === 'extractor')
    .map((n) => ({ itemId: n.itemId, ratePerMin: n.outputRatePerMin }))

  const totalMachines = nodes.reduce((s, n) => s + (Number.isFinite(n.machinesCeil) ? n.machinesCeil : 0), 0)
  const totalPowerMW = nodes.reduce((s, n) => s + n.powerMW, 0)

  return {
    nodes,
    edges,
    totalMachines,
    totalPowerMW,
    rawInputs,
    bottlenecks: [...new Set(bottlenecks)],
    targets: targets.map((t) => ({ itemId: t.itemId, ratePerMin: t.ratePerMin })),
  }
}

/**
 * Fixed-point demand refinement for DAG production chains.
 */
function refineDemand(
  targets: ProductionTarget[],
  recipeOverrides: Record<ItemId, RecipeId>,
  clockOverrides: Record<string, number>,
  defaultClock: number,
  maxDepth: number,
): Map<ItemId, number> {
  const demand = new Map<ItemId, number>()
  const targetRecipe = new Map<ItemId, RecipeId | undefined>()
  const targetClock = new Map<ItemId, number>()

  for (const t of targets) {
    if (t.ratePerMin <= 0) continue
    demand.set(t.itemId, (demand.get(t.itemId) ?? 0) + t.ratePerMin)
    targetRecipe.set(t.itemId, t.recipeOverrideId)
    targetClock.set(t.itemId, clampClock(t.clockPercent || defaultClock))
  }

  for (let iter = 0; iter < maxDepth; iter++) {
    const next = new Map<ItemId, number>()
    // seed with target outputs only (not intermediates as independent seeds)
    for (const t of targets) {
      if (t.ratePerMin <= 0) continue
      next.set(t.itemId, (next.get(t.itemId) ?? 0) + t.ratePerMin)
    }

    // Process in reverse topological-ish order: expand all known demanded items
    const toProcess = new Set(next.keys())
    const processed = new Set<ItemId>()
    let steps = 0
    while (toProcess.size > 0 && steps < maxDepth * 20) {
      steps++
      const itemId = toProcess.values().next().value as ItemId
      toProcess.delete(itemId)
      if (processed.has(itemId)) continue
      processed.add(itemId)

      const needed = next.get(itemId) ?? 0
      if (needed <= 0) continue

      const recipe = resolveRecipe(itemId, targetRecipe.get(itemId), recipeOverrides)
      if (!recipe || recipe.inputs.length === 0) continue

      const primary = recipe.outputs.find((o) => o.itemId === itemId) ?? recipe.outputs[0]
      if (!primary) continue
      const baseOut = baseOutputPerMin(primary.amount, recipe.durationSec)
      const clock =
        targetClock.get(itemId) ??
        clockOverrides[nodeKey(itemId, recipe.id)] ??
        defaultClock
      const machinesExact = machinesNeededExact(needed, baseOut, clock)
      const craftsPerMin =
        machinesExact * (60 / recipe.durationSec) * (clampClock(clock) / 100)

      for (const input of recipe.inputs) {
        const rate = input.amount * craftsPerMin
        next.set(input.itemId, (next.get(input.itemId) ?? 0) + rate)
        if (!processed.has(input.itemId)) toProcess.add(input.itemId)
      }
    }

    // Compare maps
    let same = next.size === demand.size
    if (same) {
      for (const [k, v] of next) {
        const prev = demand.get(k) ?? 0
        if (Math.abs(prev - v) > 1e-6) {
          same = false
          break
        }
      }
    }
    demand.clear()
    for (const [k, v] of next) demand.set(k, v)
    if (same) break
  }

  return demand
}

export function summarizeSolution(solution: ProductionSolution) {
  return {
    totalMachines: solution.totalMachines,
    totalPowerMW: solution.totalPowerMW,
    outputRates: solution.targets,
    bottlenecks: solution.bottlenecks,
    rawInputs: solution.rawInputs,
  }
}
