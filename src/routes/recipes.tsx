import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { recipes } from '#/domain/data/recipes'
import { getBuilding } from '#/domain/data/buildings'
import { getItem } from '#/domain/data/items'
import { Input } from '#/components/ui/input'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { ItemIcon } from '#/components/shared/ItemIcon'
import { baseOutputPerMin } from '#/domain/calc/overclock'
import { formatRate } from '#/lib/utils'

export const Route = createFileRoute('/recipes')({
  component: RecipesPage,
})

function RecipesPage() {
  const [q, setQ] = useState('')
  const [altsOnly, setAltsOnly] = useState(false)

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return recipes.filter((r) => {
      if (altsOnly && !r.isAlternate) return false
      if (!needle) return true
      return (
        r.name.toLowerCase().includes(needle) ||
        r.id.includes(needle) ||
        r.outputs.some((o) => getItem(o.itemId).name.toLowerCase().includes(needle))
      )
    })
  }, [q, altsOnly])

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-extrabold">Recipe Browser</h1>
        <p className="text-sm text-[var(--fg-2)]">
          {recipes.length} recipes including alternate production paths.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search recipes…"
          className="max-w-md"
        />
        <label className="flex items-center gap-2 text-sm text-[var(--fg-1)]">
          <input
            type="checkbox"
            checked={altsOnly}
            onChange={(e) => setAltsOnly(e.target.checked)}
          />
          Alternates only
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {list.map((r) => {
          const building = getBuilding(r.buildingId)
          const primary = r.outputs[0]
          const rate = primary
            ? baseOutputPerMin(primary.amount, r.durationSec)
            : 0
          return (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm">{r.name}</CardTitle>
                  {r.isAlternate ? <Badge>Alt</Badge> : <Badge variant="muted">Default</Badge>}
                </div>
                <p className="text-xs text-[var(--fg-2)]">
                  {building.name} · {r.durationSec}s · {formatRate(rate)}/m primary
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div>
                  <div className="mb-1 font-bold text-[var(--fg-2)]">Inputs</div>
                  <div className="flex flex-wrap gap-2">
                    {r.inputs.length === 0 ? (
                      <span className="text-[var(--fg-2)]">—</span>
                    ) : (
                      r.inputs.map((i) => {
                        const item = getItem(i.itemId)
                        return (
                          <span
                            key={i.itemId}
                            className="inline-flex items-center gap-1 rounded bg-[var(--bg-2)] px-1.5 py-0.5"
                          >
                            <ItemIcon iconKey={item.iconKey} name={item.name} size={16} />
                            {item.name} ×{i.amount}
                          </span>
                        )
                      })
                    )}
                  </div>
                </div>
                <div>
                  <div className="mb-1 font-bold text-[var(--fg-2)]">Outputs</div>
                  <div className="flex flex-wrap gap-2">
                    {r.outputs.map((o) => {
                      const item = getItem(o.itemId)
                      return (
                        <span
                          key={o.itemId}
                          className="inline-flex items-center gap-1 rounded bg-[var(--bg-2)] px-1.5 py-0.5"
                        >
                          <ItemIcon iconKey={item.iconKey} name={item.name} size={16} />
                          {item.name} ×{o.amount}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
