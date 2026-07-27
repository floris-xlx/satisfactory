import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { ItemIcon } from '#/components/shared/ItemIcon'
import { Badge } from '#/components/ui/badge'
import { formatRate } from '#/lib/utils'
import { getItem } from '#/domain/data/items'
import type { MachineKind } from '#/domain/models/types'
import { cn } from '#/lib/utils'

export interface ProductionNodeData {
  itemId: string
  recipeName: string
  buildingName: string
  kind: MachineKind
  outputRatePerMin: number
  machinesExact: number
  machinesCeil: number
  clockPercent: number
  powerMW: number
  isBottleneck: boolean
  isTarget: boolean
  isRaw: boolean
  [key: string]: unknown
}

const KIND_ACCENT: Record<MachineKind, string> = {
  miner: 'border-l-amber-600',
  extractor: 'border-l-sky-500',
  smelter: 'border-l-orange-500',
  foundry: 'border-l-red-500',
  constructor: 'border-l-yellow-500',
  assembler: 'border-l-blue-400',
  manufacturer: 'border-l-violet-400',
  refinery: 'border-l-emerald-500',
  blender: 'border-l-teal-400',
  packager: 'border-l-cyan-400',
  resource: 'border-l-stone-400',
  storage: 'border-l-zinc-400',
  output: 'border-l-[var(--accent-orange)]',
  sink: 'border-l-rose-400',
  generator: 'border-l-lime-500',
}

function ProductionNodeComponent({ data, selected }: NodeProps) {
  const d = data as ProductionNodeData
  const item = getItem(d.itemId)

  return (
    <div
      className={cn(
        'min-w-[200px] max-w-[240px] rounded-lg border border-[var(--border)] bg-[var(--bg-1)] shadow-lg border-l-4',
        KIND_ACCENT[d.kind] ?? 'border-l-gray-500',
        selected && 'ring-2 ring-[var(--accent-orange)]',
        d.isBottleneck && 'border-[var(--danger)]',
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-[var(--accent-steel)] !w-2.5 !h-2.5" />
      <div className="flex items-start gap-2 p-2.5">
        <ItemIcon iconKey={item.iconKey} name={item.name} size={32} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-[var(--fg-0)]">{item.name}</div>
          <div className="truncate text-[10px] text-[var(--fg-2)]">{d.buildingName}</div>
          <div className="truncate text-[10px] text-[var(--accent-steel)]">{d.recipeName}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1 border-t border-[var(--border)] px-2.5 py-2 text-[10px]">
        <div>
          <div className="text-[var(--fg-2)]">Out</div>
          <div className="font-mono font-bold text-[var(--accent-amber)]">
            {formatRate(d.outputRatePerMin)}/m
          </div>
        </div>
        <div>
          <div className="text-[var(--fg-2)]">Clock</div>
          <div className="font-mono font-bold">{d.clockPercent}%</div>
        </div>
        <div>
          <div className="text-[var(--fg-2)]">Machines</div>
          <div className="font-mono font-bold">
            {formatRate(d.machinesExact, 2)}
            <span className="text-[var(--fg-2)]"> → {d.machinesCeil}</span>
          </div>
        </div>
        <div>
          <div className="text-[var(--fg-2)]">Power</div>
          <div className="font-mono font-bold">{formatRate(d.powerMW, 2)} MW</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 border-t border-[var(--border)] px-2 py-1.5">
        {d.isTarget ? <Badge variant="default">Target</Badge> : null}
        {d.isRaw ? <Badge variant="muted">Raw</Badge> : null}
        {d.isBottleneck ? <Badge variant="danger">Belt limit</Badge> : null}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-[var(--accent-orange)] !w-2.5 !h-2.5" />
    </div>
  )
}

export const ProductionNode = memo(ProductionNodeComponent)
