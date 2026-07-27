import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  PURITY_RATE_MK1,
  PURITY_RATE_MK2,
  PURITY_RATE_MK3,
  RESOURCE_ITEM_IDS,
  resourceNodes,
  summarizeResources,
  totalMaxExtraction,
} from '#/domain/data/resources'
import { getItem } from '#/domain/data/items'
import { ItemIcon } from '#/components/shared/ItemIcon'
import { Input } from '#/components/ui/input'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Label } from '#/components/ui/label'
import { formatRate } from '#/lib/utils'
import type { ResourcePurity } from '#/domain/models/types'
import { Mountain } from 'lucide-react'

export const Route = createFileRoute('/resources')({
  component: ResourcesPage,
})

function ResourcesPage() {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<string>('iron-ore')
  const [purityFilter, setPurityFilter] = useState<ResourcePurity | 'all'>('all')
  const [regionFilter, setRegionFilter] = useState('all')

  const summaries = useMemo(() => summarizeResources(), [])
  const regions = useMemo(
    () =>
      [...new Set(resourceNodes.map((n) => n.region))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [],
  )

  const filteredSummaries = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return summaries.filter((s) => {
      const item = getItem(s.itemId)
      if (!needle) return true
      return (
        item.name.toLowerCase().includes(needle) ||
        s.itemId.includes(needle)
      )
    })
  }, [summaries, q])

  const nodes = useMemo(() => {
    return resourceNodes.filter((n) => {
      if (n.itemId !== selected) return false
      if (purityFilter !== 'all' && n.purity !== purityFilter) return false
      if (regionFilter !== 'all' && n.region !== regionFilter) return false
      return true
    })
  }, [selected, purityFilter, regionFilter])

  const selectedItem = getItem(selected)
  const totalMk1 = totalMaxExtraction(selected, 'mk1')
  const totalMk2 = totalMaxExtraction(selected, 'mk2')
  const totalMk3 = totalMaxExtraction(selected, 'mk3')

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-orange)]">
          World map data
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold">
          <Mountain className="h-7 w-7 text-[var(--accent-steel)]" />
          Resources
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--fg-2)]">
          Sample node catalog with impurity tiers and miner rates. Use this to size
          extractors against your production targets. Counts are demo data — not an
          official dump.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold uppercase text-[var(--fg-2)]">
              Resource types
            </div>
            <div className="font-mono text-2xl font-bold">{RESOURCE_ITEM_IDS.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold uppercase text-[var(--fg-2)]">
              Total nodes / wells
            </div>
            <div className="font-mono text-2xl font-bold">{resourceNodes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold uppercase text-[var(--fg-2)]">
              Regions
            </div>
            <div className="font-mono text-2xl font-bold">{regions.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search resources…"
          />
          <div className="max-h-[28rem] space-y-1.5 overflow-auto pr-1">
            {filteredSummaries.map((s) => {
              const item = getItem(s.itemId)
              const active = selected === s.itemId
              return (
                <button
                  key={s.itemId}
                  type="button"
                  onClick={() => setSelected(s.itemId)}
                  className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition ${
                    active
                      ? 'border-[var(--accent-orange)]/50 bg-[var(--accent-orange)]/10'
                      : 'border-[var(--border)] bg-[var(--bg-1)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <ItemIcon iconKey={item.iconKey} name={item.name} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{item.name}</div>
                    <div className="text-[10px] text-[var(--fg-2)]">
                      {s.nodeCount} nodes · max Mk.3 {formatRate(s.maxMk3Total)}
                      /m
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 text-[9px] font-bold">
                    <span className="text-stone-400">{s.impure} I</span>
                    <span className="text-[var(--accent-steel)]">{s.normal} N</span>
                    <span className="text-[var(--accent-amber)]">{s.pure} P</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-3 lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <ItemIcon
                  iconKey={selectedItem.iconKey}
                  name={selectedItem.name}
                  size={44}
                />
                <div>
                  <CardTitle>{selectedItem.name}</CardTitle>
                  <p className="text-xs text-[var(--fg-2)]">
                    {selectedItem.description ?? selectedItem.form} ·{' '}
                    {selectedItem.category}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <RateStat label="All nodes @ Mk.1" value={`${formatRate(totalMk1)}/m`} />
              <RateStat label="All nodes @ Mk.2" value={`${formatRate(totalMk2)}/m`} />
              <RateStat
                label="All nodes @ Mk.3"
                value={`${formatRate(totalMk3)}/m`}
                accent
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Purity rate reference (solids)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[var(--fg-2)]">
                    <tr>
                      <th className="pb-2 font-semibold">Purity</th>
                      <th className="pb-2 font-semibold">Mk.1</th>
                      <th className="pb-2 font-semibold">Mk.2</th>
                      <th className="pb-2 font-semibold">Mk.3</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {(['impure', 'normal', 'pure'] as ResourcePurity[]).map((p) => (
                      <tr key={p} className="border-t border-[var(--border)]">
                        <td className="py-1.5 capitalize">{p}</td>
                        <td>{PURITY_RATE_MK1[p]}/m</td>
                        <td>{PURITY_RATE_MK2[p]}/m</td>
                        <td>{PURITY_RATE_MK3[p]}/m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <div>
              <Label>Purity</Label>
              <select
                className="mt-1 flex h-9 rounded-md border border-[var(--border)] bg-[var(--bg-1)] px-2 text-sm"
                value={purityFilter}
                onChange={(e) =>
                  setPurityFilter(e.target.value as ResourcePurity | 'all')
                }
              >
                <option value="all">All</option>
                <option value="impure">Impure</option>
                <option value="normal">Normal</option>
                <option value="pure">Pure</option>
              </select>
            </div>
            <div>
              <Label>Region</Label>
              <select
                className="mt-1 flex h-9 rounded-md border border-[var(--border)] bg-[var(--bg-1)] px-2 text-sm"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                <option value="all">All regions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {nodes.map((n) => (
              <div
                key={n.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-1)] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold">{n.name}</div>
                  <PurityBadge purity={n.purity} />
                </div>
                <div className="mt-1 text-[11px] text-[var(--fg-2)]">{n.region}</div>
                <div className="mt-2 grid grid-cols-3 gap-1 font-mono text-[10px]">
                  <span>Mk1 {n.rateMk1}</span>
                  <span>Mk2 {n.rateMk2}</span>
                  <span className="text-[var(--accent-amber)]">Mk3 {n.rateMk3}</span>
                </div>
                {n.description ? (
                  <p className="mt-1 text-[10px] text-[var(--fg-2)]">{n.description}</p>
                ) : null}
              </div>
            ))}
            {nodes.length === 0 ? (
              <p className="text-sm text-[var(--fg-2)] sm:col-span-2">
                No nodes match filters.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function RateStat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-2)] p-3">
      <div className="text-[10px] uppercase tracking-wide text-[var(--fg-2)]">{label}</div>
      <div
        className={`mt-0.5 font-mono text-lg font-bold ${
          accent ? 'text-[var(--accent-amber)]' : ''
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function PurityBadge({ purity }: { purity: ResourcePurity }) {
  if (purity === 'pure') return <Badge>{purity}</Badge>
  if (purity === 'normal') return <Badge variant="steel">{purity}</Badge>
  return <Badge variant="muted">{purity}</Badge>
}
