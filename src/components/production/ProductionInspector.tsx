import type { ProductionLine } from '#/domain/models/types'
import type { ProductionSolution, SolutionNode } from '#/domain/calc/production'
import { recipesProducing } from '#/domain/data/recipes'
import { getItem } from '#/domain/data/items'
import { useAppStore } from '#/state/app-store'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
import { Input } from '#/components/ui/input'
import { Badge } from '#/components/ui/badge'
import { ItemIcon } from '#/components/shared/ItemIcon'
import { formatPower, formatRate } from '#/lib/utils'
import { ScrollArea } from '#/components/ui/scroll-area'

export function ProductionInspector({
  line,
  node,
  solution,
}: {
  line: ProductionLine | undefined
  node: SolutionNode | null
  solution: ProductionSolution | null
}) {
  const setRecipeOverride = useAppStore((s) => s.setRecipeOverride)
  const setClockOverride = useAppStore((s) => s.setClockOverride)
  const updateTarget = useAppStore((s) => s.updateTarget)

  if (!line) {
    return (
      <div className="p-4 text-sm text-[var(--fg-2)]">Select a production line.</div>
    )
  }

  if (!node) {
    return (
      <ScrollArea className="h-full">
        <div className="space-y-3 p-4">
          <h3 className="text-sm font-bold">Inspector</h3>
          <p className="text-xs text-[var(--fg-2)]">
            Select a node on the graph to override recipes, adjust clock speed (1–250%),
            and inspect rates.
          </p>
          {solution?.bottlenecks.length ? (
            <div>
              <Label>Bottlenecks</Label>
              <ul className="mt-2 space-y-1">
                {solution.bottlenecks.map((b) => (
                  <li
                    key={b}
                    className="rounded border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-2 py-1 text-[11px] text-[var(--danger)]"
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </ScrollArea>
    )
  }

  const item = getItem(node.itemId)
  const alts = recipesProducing(node.itemId)
  const clock = node.clockPercent

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <ItemIcon iconKey={item.iconKey} name={item.name} size={36} />
          <div>
            <div className="font-bold">{item.name}</div>
            <div className="text-xs text-[var(--fg-2)]">{node.buildingName}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          <Badge variant="steel">{node.kind}</Badge>
          {node.isTarget ? <Badge>Target</Badge> : null}
          {node.transport.isBottleneck ? <Badge variant="danger">Throughput</Badge> : null}
        </div>

        <div>
          <Label>Recipe</Label>
          <select
            className="mt-1.5 flex h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-1)] px-2 text-sm"
            value={node.recipeId}
            disabled={node.recipeId === 'raw' || node.recipeId === 'output'}
            onChange={(e) => {
              const rid = e.target.value
              setRecipeOverride(line.id, node.itemId, rid)
              const t = line.targets.find((x) => x.itemId === node.itemId)
              if (t) updateTarget(line.id, t.id, { recipeOverrideId: rid })
            }}
          >
            {alts.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
                {r.isAlternate ? ' (ALT)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Clock speed</Label>
            <span className="font-mono text-xs font-bold text-[var(--accent-amber)]">
              {clock}%
            </span>
          </div>
          <Slider
            className="mt-3"
            min={1}
            max={250}
            step={1}
            value={[clock]}
            onValueChange={([v]) => {
              if (v == null) return
              setClockOverride(line.id, node.id, v)
              const t = line.targets.find((x) => x.itemId === node.itemId)
              if (t) updateTarget(line.id, t.id, { clockPercent: v })
            }}
          />
          <Input
            type="number"
            min={1}
            max={250}
            className="mt-2"
            value={clock}
            onChange={(e) => {
              const v = Number(e.target.value)
              setClockOverride(line.id, node.id, v)
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Stat label="Output" value={`${formatRate(node.outputRatePerMin)}/m`} />
          <Stat label="Machines" value={`${formatRate(node.machinesExact)} → ${node.machinesCeil}`} />
          <Stat label="Power" value={formatPower(node.powerMW)} />
          <Stat
            label="Transport"
            value={
              node.transport.belt?.name ??
              node.transport.pipe?.name ??
              '—'
            }
          />
        </div>

        <div>
          <Label>Inputs</Label>
          <ul className="mt-1 space-y-1">
            {node.inputs.map((i) => (
              <li key={i.itemId} className="flex justify-between font-mono text-xs">
                <span>{getItem(i.itemId).name}</span>
                <span>{formatRate(i.ratePerMin)}/m</span>
              </li>
            ))}
            {node.inputs.length === 0 ? (
              <li className="text-xs text-[var(--fg-2)]">None (source)</li>
            ) : null}
          </ul>
        </div>

        <div>
          <Label>Outputs</Label>
          <ul className="mt-1 space-y-1">
            {node.outputs.map((o) => (
              <li key={o.itemId} className="flex justify-between font-mono text-xs">
                <span>{getItem(o.itemId).name}</span>
                <span>{formatRate(o.ratePerMin)}/m</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ScrollArea>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-2)] p-2">
      <div className="text-[10px] uppercase tracking-wide text-[var(--fg-2)]">{label}</div>
      <div className="mt-0.5 font-mono font-bold">{value}</div>
    </div>
  )
}
