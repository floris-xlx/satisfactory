import { useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Edge,
  type Node,
  type NodeTypes,
  useEdgesState,
  useNodesState,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ProductionNode } from '#/components/production/ProductionNode'
import { solutionToFlow } from '#/components/production/layout-graph'
import { solveProduction } from '#/domain/calc/production'
import { useAppStore } from '#/state/app-store'
import { ProductionInspector } from '#/components/production/ProductionInspector'
import { ProductionTargets } from '#/components/production/ProductionTargets'
import { EmptyState } from '#/components/shared/EmptyState'
import { Factory } from 'lucide-react'

const nodeTypes: NodeTypes = {
  production: ProductionNode,
}

function ProductionCanvasInner() {
  const project = useAppStore((s) => s.getActiveProject())
  const selectedLineId = useAppStore((s) => s.selectedLineId)
  const setSelectedLine = useAppStore((s) => s.setSelectedLine)
  const setSelectedNode = useAppStore((s) => s.setSelectedNode)
  const selectedNodeId = useAppStore((s) => s.selectedNodeId)
  const setNodePosition = useAppStore((s) => s.setNodePosition)
  const settings = useAppStore((s) => s.settings)
  const addLine = useAppStore((s) => s.addLine)

  const line =
    project?.lines.find((l) => l.id === selectedLineId) ?? project?.lines[0]

  useEffect(() => {
    if (project && !selectedLineId && project.lines[0]) {
      setSelectedLine(project.lines[0].id)
    }
  }, [project, selectedLineId, setSelectedLine])

  const solution = useMemo(() => {
    if (!line) return null
    return solveProduction(line.targets, {
      recipeOverrides: line.recipeOverrides,
      clockOverrides: line.clockOverrides,
      defaultClockPercent: settings.defaultClockPercent,
      powerExponent: settings.powerExponent,
    })
  }, [line, settings.defaultClockPercent, settings.powerExponent])

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    if (!solution || !line) {
      setNodes([])
      setEdges([])
      return
    }
    const { nodes: n, edges: e } = solutionToFlow(solution, line.nodePositions)
    setNodes(n)
    setEdges(e)
  }, [solution, line, setNodes, setEdges])

  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      if (!line) return
      setNodePosition(line.id, node.id, node.position)
    },
    [line, setNodePosition],
  )

  const selectedSolutionNode = solution?.nodes.find((n) => n.id === selectedNodeId)

  if (!project) {
    return (
      <EmptyState
        icon={Factory}
        title="No project"
        description="Create a factory project to start planning production."
      />
    )
  }

  return (
    <div className="flex h-full min-h-[480px] flex-col lg:flex-row">
      <div className="flex w-full flex-col border-b border-[var(--border)] lg:w-72 lg:border-b-0 lg:border-r">
        <ProductionTargets
          project={project}
          line={line}
          solution={solution}
          onAddLine={() => addLine()}
        />
      </div>

      <div className="relative min-h-[360px] flex-1 bg-[var(--bg-0)]">
        {line && line.targets.length === 0 ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg-0)]/80 p-6">
            <EmptyState
              icon={Factory}
              title="No production targets"
              description="Add an item and rate on the left to generate the full production graph."
            />
          </div>
        ) : null}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, n) => setSelectedNode(n.id)}
          onPaneClick={() => setSelectedNode(null)}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          colorMode="dark"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1}
            color="#2a3038"
          />
          <Controls className="!bg-[var(--bg-1)] !border-[var(--border)] !shadow-lg" />
          <MiniMap
            className="!bg-[var(--bg-1)] !border-[var(--border)]"
            nodeColor="#f59e0b"
            maskColor="rgba(15,17,21,0.7)"
          />
        </ReactFlow>
      </div>

      <div className="w-full border-t border-[var(--border)] lg:w-80 lg:border-l lg:border-t-0">
        <ProductionInspector
          line={line}
          node={selectedSolutionNode ?? null}
          solution={solution}
        />
      </div>
    </div>
  )
}

export function ProductionCanvas() {
  return (
    <ReactFlowProvider>
      <ProductionCanvasInner />
    </ReactFlowProvider>
  )
}
