import { createFileRoute } from '@tanstack/react-router'
import { ProductionCanvas } from '#/components/production/ProductionCanvas'

export const Route = createFileRoute('/production')({
  component: ProductionPage,
})

function ProductionPage() {
  return (
    <div className="flex h-[calc(100vh-3.5rem-2.25rem)] flex-col">
      <div className="border-b border-[var(--border)] px-4 py-2">
        <h1 className="text-sm font-extrabold uppercase tracking-wide text-[var(--fg-0)]">
          Production Calculator
        </h1>
        <p className="text-[11px] text-[var(--fg-2)]">
          Recursive chain solver · alternate recipes · clock 1–250% · belt/pipe bottlenecks
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <ProductionCanvas />
      </div>
    </div>
  )
}
