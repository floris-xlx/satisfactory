import type {
  BeltCell,
  BeltCellType,
  BeltLayout,
  Cardinal,
  CellKey,
  Rotation,
} from '#/domain/models/types'
import { beltTiersById } from '#/domain/data/belts-pipes'

export type PortDir = Cardinal

export interface CellPorts {
  /** Directions this cell accepts input from (neighbor is in that direction) */
  inputs: PortDir[]
  /** Directions this cell outputs toward */
  outputs: PortDir[]
}

const OPPOSITE: Record<Cardinal, Cardinal> = {
  N: 'S',
  S: 'N',
  E: 'W',
  W: 'E',
}

const DELTA: Record<Cardinal, { dx: number; dy: number }> = {
  N: { dx: 0, dy: -1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 },
}

export function cellKey(z: number, x: number, y: number): CellKey {
  return `${z}:${x}:${y}`
}

export function parseCellKey(key: CellKey): { z: number; x: number; y: number } {
  const [z, x, y] = key.split(':').map(Number)
  return { z: z!, x: x!, y: y! }
}

function rot(dirs: Cardinal[], rotation: Rotation): Cardinal[] {
  const order: Cardinal[] = ['N', 'E', 'S', 'W']
  const steps = ((rotation / 90) % 4 + 4) % 4
  return dirs.map((d) => order[(order.indexOf(d) + steps) % 4]!)
}

/**
 * Port model by cell type at rotation 0 (facing North / default).
 * - straight: flow N→S becomes after rot; default: input S, output N (flow northward)
 * Actually default straight at 0: input from W, output to E (left to right)
 */
export function portsForCell(type: BeltCellType, rotation: Rotation): CellPorts {
  if (type === 'empty') return { inputs: [], outputs: [] }

  let base: CellPorts
  switch (type) {
    case 'straight':
      // flow West → East
      base = { inputs: ['W'], outputs: ['E'] }
      break
    case 'corner':
      // flow West → North (turn left)
      base = { inputs: ['W'], outputs: ['N'] }
      break
    case 'junction':
      // cross: W-E and N-S pass-through
      base = { inputs: ['N', 'E', 'S', 'W'], outputs: ['N', 'E', 'S', 'W'] }
      break
    case 'merger':
      // three inputs, one output East
      base = { inputs: ['N', 'S', 'W'], outputs: ['E'] }
      break
    case 'splitter':
      // one input West, three outputs
      base = { inputs: ['W'], outputs: ['N', 'S', 'E'] }
      break
    case 'lift':
      // vertical transition: still needs lateral in/out on same cell for belt attach
      base = { inputs: ['W'], outputs: ['E'] }
      break
    default:
      base = { inputs: [], outputs: [] }
  }

  return {
    inputs: rot(base.inputs, rotation),
    outputs: rot(base.outputs, rotation),
  }
}

export interface ConnectionLink {
  fromKey: CellKey
  toKey: CellKey
  dir: Cardinal
  valid: boolean
  reason?: string
}

export interface CellThroughputWarning {
  key: CellKey
  ratePerMin: number
  capacity: number
  exceeds: boolean
}

export interface ConnectionReport {
  links: ConnectionLink[]
  validCount: number
  invalidCount: number
  orphanCells: CellKey[]
  throughputWarnings: CellThroughputWarning[]
}

export function validateBeltConnectivity(layout: BeltLayout): ConnectionReport {
  const links: ConnectionLink[] = []
  const connected = new Set<CellKey>()
  const nonEmpty = Object.entries(layout.cells).filter(([, c]) => c.type !== 'empty')

  for (const [key, cell] of nonEmpty) {
    const { z, x, y } = parseCellKey(key)
    const ports = portsForCell(cell.type, cell.rotation)

    for (const outDir of ports.outputs) {
      const { dx, dy } = DELTA[outDir]
      const nx = x + dx
      const ny = y + dy
      const nKey = cellKey(z, nx, ny)
      const neighbor = layout.cells[nKey]

      if (!neighbor || neighbor.type === 'empty') {
        // open end — not invalid, just incomplete
        continue
      }

      const nPorts = portsForCell(neighbor.type, neighbor.rotation)
      const needIn = OPPOSITE[outDir]
      const accepts = nPorts.inputs.includes(needIn)
      // also allow if neighbor outputs toward us and we're a junction (bidirectional)
      const mutual =
        accepts ||
        (cell.type === 'junction' && nPorts.outputs.includes(needIn)) ||
        (neighbor.type === 'junction' && nPorts.inputs.includes(needIn))

      const valid = mutual
      links.push({
        fromKey: key,
        toKey: nKey,
        dir: outDir,
        valid,
        reason: valid ? undefined : `No matching input on neighbor from ${needIn}`,
      })
      if (valid) {
        connected.add(key)
        connected.add(nKey)
      }
    }

    // Lift vertical: same x,y adjacent levels
    if (cell.type === 'lift') {
      for (const dz of [1, -1]) {
        const vz = z + dz
        if (vz < 0 || vz >= layout.levels) continue
        const vKey = cellKey(vz, x, y)
        const above = layout.cells[vKey]
        if (above && above.type === 'lift') {
          links.push({
            fromKey: key,
            toKey: vKey,
            dir: 'N',
            valid: true,
            reason: 'vertical lift',
          })
          connected.add(key)
          connected.add(vKey)
        }
      }
    }
  }

  const orphanCells = nonEmpty
    .map(([k]) => k)
    .filter((k) => !connected.has(k) && nonEmpty.length > 1)

  const throughputWarnings: CellThroughputWarning[] = []
  for (const [key, cell] of nonEmpty) {
    if (cell.ratePerMin == null) continue
    const tier = beltTiersById[cell.beltTierId]
    const capacity = tier?.maxItemsPerMin ?? 0
    throughputWarnings.push({
      key,
      ratePerMin: cell.ratePerMin,
      capacity,
      exceeds: cell.ratePerMin > capacity + 1e-9,
    })
  }

  const validCount = links.filter((l) => l.valid).length
  const invalidCount = links.filter((l) => !l.valid).length

  return {
    links,
    validCount,
    invalidCount,
    orphanCells,
    throughputWarnings,
  }
}

export function rotateCell(rotation: Rotation, delta: 90 | -90 | 180 = 90): Rotation {
  const next = (((rotation + delta) % 360) + 360) % 360
  return next as Rotation
}

export function mirrorCell(cell: BeltCell, axis: 'h' | 'v'): BeltCell {
  // Horizontal mirror flips E/W → rotation 180 - r for many types
  let rotation = cell.rotation
  if (axis === 'h') {
    // reflect across vertical axis
    if (cell.type === 'corner') {
      // W→N becomes E→N etc — map via 360 - r
      rotation = ((360 - cell.rotation) % 360) as Rotation
    } else {
      rotation = ((180 - cell.rotation + 360) % 360) as Rotation
    }
  } else {
    rotation = ((360 - cell.rotation) % 360) as Rotation
  }
  return { ...cell, rotation }
}

export function emptyLayout(
  id: string,
  name: string,
  width = 24,
  height = 16,
  levels = 2,
): BeltLayout {
  return {
    id,
    name,
    width,
    height,
    levels,
    cells: {},
    view: { zoom: 1, panX: 0, panY: 0 },
    activeLevel: 0,
  }
}
