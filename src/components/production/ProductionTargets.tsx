import { useMemo, useState } from 'react'
import type { FactoryProject, ProductionLine } from '#/domain/models/types'
import type { ProductionSolution } from '#/domain/calc/production'
import { items } from '#/domain/data/items'
import { useAppStore } from '#/state/app-store'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { SearchSelect } from '#/components/shared/SearchSelect'
import { ItemIcon } from '#/components/shared/ItemIcon'
import { formatPower, formatRate } from '#/lib/utils'
import { getItem } from '#/domain/data/items'
import { Plus, Trash2 } from 'lucide-react'

export function ProductionTargets({
  project,
  line,
  solution,
  onAddLine,
}: {
  project: FactoryProject
  line: ProductionLine | undefined
  solution: ProductionSolution | null
  onAddLine: () => void
}) {
  const setSelectedLine = useAppStore((s) => s.setSelectedLine)
  const addTarget = useAppStore((s) => s.addTarget)
  const updateTarget = useAppStore((s) => s.updateTarget)
  const removeTarget = useAppStore((s) => s.removeTarget)
  const removeLine = useAppStore((s) => s.removeLine)
  const [pickItem, setPickItem] = useState('iron-plate')
  const [rate, setRate] = useState(30)

  const options = useMemo(
    () =>
      items.map((i) => ({
        id: i.id,
        label: i.name,
        hint: i.category,
        iconKey: i.iconKey,
      })),
    [],
  )

  if (!line) return null

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--border)] p-3">
        <Label>Production lines</Label>
        <div className="mt-2 flex flex-wrap gap-1">
          {project.lines.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setSelectedLine(l.id)}
              className={`rounded-md px-2 py-1 text-xs font-bold ${
                l.id === line.id
                  ? 'bg-[var(--accent-orange)] text-[var(--bg-0)]'
                  : 'bg-[var(--bg-2)] text-[var(--fg-1)]'
              }`}
            >
              {l.name}
            </button>
          ))}
          <Button size="sm" variant="ghost" onClick={onAddLine} aria-label="Add line">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 overflow-auto p-3">
        <div>
          <Label>Add target</Label>
          <SearchSelect
            options={options}
            value={pickItem}
            onChange={setPickItem}
            placeholder="Search items…"
            className="mt-2"
          />
          <div className="mt-2 flex gap-2">
            <Input
              type="number"
              min={0.01}
              step={1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              aria-label="Rate per minute"
            />
            <Button
              onClick={() =>
                addTarget(line.id, {
                  itemId: pickItem,
                  ratePerMin: rate,
                  clockPercent: 100,
                })
              }
            >
              Add
            </Button>
          </div>
        </div>

        <div>
          <Label>Targets on {line.name}</Label>
          <ul className="mt-2 space-y-2">
            {line.targets.map((t) => {
              const item = getItem(t.itemId)
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-2)] p-2"
                >
                  <ItemIcon iconKey={item.iconKey} name={item.name} size={24} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold">{item.name}</div>
                    <Input
                      type="number"
                      className="mt-1 h-7 text-xs"
                      value={t.ratePerMin}
                      onChange={(e) =>
                        updateTarget(line.id, t.id, {
                          ratePerMin: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeTarget(line.id, t.id)}
                    aria-label="Remove target"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </li>
              )
            })}
            {line.targets.length === 0 ? (
              <li className="text-xs text-[var(--fg-2)]">No targets yet.</li>
            ) : null}
          </ul>
        </div>

        {solution ? (
          <div className="rounded-md border border-[var(--border)] bg-[var(--bg-2)] p-3 text-xs">
            <div className="font-bold text-[var(--fg-0)]">Line summary</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[var(--fg-1)]">
              <span>Machines</span>
              <span className="text-right font-mono font-bold">
                {solution.totalMachines}
              </span>
              <span>Power</span>
              <span className="text-right font-mono font-bold text-[var(--accent-amber)]">
                {formatPower(solution.totalPowerMW)}
              </span>
              <span>Nodes</span>
              <span className="text-right font-mono font-bold">
                {solution.nodes.length}
              </span>
              <span>Bottlenecks</span>
              <span className="text-right font-mono font-bold text-[var(--danger)]">
                {solution.bottlenecks.length}
              </span>
            </div>
            {solution.rawInputs.length > 0 ? (
              <div className="mt-3 border-t border-[var(--border)] pt-2">
                <div className="mb-1 font-bold">Raw inputs</div>
                {solution.rawInputs.map((r) => (
                  <div key={r.itemId} className="flex justify-between font-mono">
                    <span>{getItem(r.itemId).name}</span>
                    <span>{formatRate(r.ratePerMin)}/m</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {project.lines.length > 1 ? (
          <Button variant="danger" size="sm" onClick={() => removeLine(line.id)}>
            Delete line
          </Button>
        ) : null}
      </div>
    </div>
  )
}
