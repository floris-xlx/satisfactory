import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { items } from '#/domain/data/items'
import { recipesProducing } from '#/domain/data/recipes'
import { Input } from '#/components/ui/input'
import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { ItemIcon } from '#/components/shared/ItemIcon'

export const Route = createFileRoute('/items')({
  component: ItemsPage,
})

function ItemsPage() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<string>('all')
  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category))].sort(),
    [],
  )
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return items.filter((i) => {
      if (category !== 'all' && i.category !== category) return false
      if (!needle) return true
      return (
        i.name.toLowerCase().includes(needle) ||
        i.id.includes(needle) ||
        i.category.includes(needle) ||
        i.description?.toLowerCase().includes(needle)
      )
    })
  }, [q, category])

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-extrabold">Item Browser</h1>
        <p className="text-sm text-[var(--fg-2)]">
          {items.length} catalog items · {list.length} shown
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search items…"
          className="max-w-md"
        />
        <select
          className="flex h-9 rounded-md border border-[var(--border)] bg-[var(--bg-1)] px-2 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((item) => {
          const prods = recipesProducing(item.id)
          return (
            <Card key={item.id}>
              <CardContent className="flex items-start gap-3 p-3">
                <ItemIcon iconKey={item.iconKey} name={item.name} size={40} />
                <div className="min-w-0">
                  <div className="truncate font-bold">{item.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="muted">{item.category}</Badge>
                    <Badge variant="steel">{item.form}</Badge>
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--fg-2)]">
                    {prods.length} recipe{prods.length === 1 ? '' : 's'}
                    {item.stackSize ? ` · stack ${item.stackSize}` : ''}
                  </div>
                  {item.description ? (
                    <p className="mt-1 line-clamp-2 text-[10px] text-[var(--fg-2)]">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
