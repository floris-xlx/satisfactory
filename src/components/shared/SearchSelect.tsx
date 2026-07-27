import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { ScrollArea } from '#/components/ui/scroll-area'
import { ItemIcon } from '#/components/shared/ItemIcon'
import { cn } from '#/lib/utils'

export interface SearchOption {
  id: string
  label: string
  hint?: string
  iconKey?: string
}

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: {
  options: SearchOption[]
  value?: string
  onChange: (id: string) => void
  placeholder?: string
  className?: string
}) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return options.slice(0, 80)
    return options
      .filter(
        (o) =>
          o.label.toLowerCase().includes(needle) ||
          o.id.toLowerCase().includes(needle) ||
          o.hint?.toLowerCase().includes(needle),
      )
      .slice(0, 80)
  }, [options, q])

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-2)]" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="pl-8"
          aria-label={placeholder}
        />
      </div>
      <ScrollArea className="h-48 rounded-md border border-[var(--border)]">
        <ul className="p-1" role="listbox">
          {filtered.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                role="option"
                aria-selected={value === o.id}
                onClick={() => onChange(o.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-[var(--bg-2)]',
                  value === o.id && 'bg-[var(--accent-orange)]/15 text-[var(--accent-amber)]',
                )}
              >
                {o.iconKey ? (
                  <ItemIcon iconKey={o.iconKey} name={o.label} size={22} />
                ) : null}
                <span className="min-w-0 flex-1 truncate font-medium">{o.label}</span>
                {o.hint ? (
                  <span className="truncate text-[10px] text-[var(--fg-2)]">{o.hint}</span>
                ) : null}
              </button>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-[var(--fg-2)]">
              No matches
            </li>
          ) : null}
        </ul>
      </ScrollArea>
    </div>
  )
}
