import { Graph, layout } from '@dagrejs/dagre'
import type { Edge, Node } from '@xyflow/react'
import type { ProductionSolution } from '#/domain/calc/production'
import type { ProductionNodeData } from '#/components/production/ProductionNode'

const NODE_W = 220
const NODE_H = 150

export function solutionToFlow(
  solution: ProductionSolution,
  positions: Record<string, { x: number; y: number }>,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = solution.nodes.map((n) => ({
    id: n.id,
    type: 'production',
    position: positions[n.id] ?? { x: 0, y: 0 },
    data: {
      itemId: n.itemId,
      recipeName: n.recipeName,
      buildingName: n.buildingName,
      kind: n.kind,
      outputRatePerMin: n.outputRatePerMin,
      machinesExact: n.machinesExact,
      machinesCeil: n.machinesCeil,
      clockPercent: n.clockPercent,
      powerMW: n.powerMW,
      isBottleneck: n.transport.isBottleneck,
      isTarget: n.isTarget,
      isRaw: n.isRaw,
    } satisfies ProductionNodeData,
  }))

  const edges: Edge[] = solution.edges.map((e) => ({
    id: e.id,
    source: e.fromNodeId,
    target: e.toNodeId,
    animated: !e.isBottleneck,
    label: `${e.ratePerMin.toFixed(1)}/m`,
    style: {
      stroke: e.isBottleneck ? '#ef4444' : '#3b82a0',
      strokeWidth: e.isBottleneck ? 2.5 : 1.5,
      strokeDasharray: e.isBottleneck ? '6 4' : undefined,
    },
    labelStyle: { fill: '#c8cdd5', fontSize: 10, fontWeight: 600 },
  }))

  const needsLayout = nodes.some((n) => !positions[n.id])
  if (needsLayout) {
    return { nodes: autoLayout(nodes, edges, positions), edges }
  }
  return { nodes, edges }
}

function autoLayout(
  nodes: Node[],
  edges: Edge[],
  pinned: Record<string, { x: number; y: number }>,
): Node[] {
  const g = new Graph({ compound: false, multigraph: false, directed: true })
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 80 })

  for (const n of nodes) {
    g.setNode(n.id, { width: NODE_W, height: NODE_H })
  }
  for (const e of edges) {
    g.setEdge(e.source, e.target)
  }
  layout(g)

  return nodes.map((n) => {
    if (pinned[n.id]) return { ...n, position: pinned[n.id]! }
    const pos = g.node(n.id) as { x: number; y: number }
    return {
      ...n,
      position: {
        x: pos.x - NODE_W / 2,
        y: pos.y - NODE_H / 2,
      },
    }
  })
}
