import { createFileRoute } from '@tanstack/react-router'
import { BeltCanvas } from '#/components/belt/BeltCanvas'
import { useEffect } from 'react'
import { useAppStore } from '#/state/app-store'

export const Route = createFileRoute('/belts')({
  component: BeltsPage,
})

function BeltsPage() {
  const hydrate = useAppStore((s) => s.hydrated)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && !(e.ctrlKey || e.metaKey)) {
        const key = useAppStore.getState().selectedBeltKey
        if (key) useAppStore.getState().rotateBeltCell(key)
      }
      if (e.key === '1') useAppStore.getState().setBeltTool('straight')
      if (e.key === '2') useAppStore.getState().setBeltTool('corner')
      if (e.key === '3') useAppStore.getState().setBeltTool('junction')
      if (e.key === '4') useAppStore.getState().setBeltTool('merger')
      if (e.key === '5') useAppStore.getState().setBeltTool('splitter')
      if (e.key === '6') useAppStore.getState().setBeltTool('lift')
      if (e.key === '7') useAppStore.getState().setBeltTool('erase')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!hydrate) return null

  return (
    <div className="flex h-[calc(100vh-3.5rem-2.25rem)] flex-col">
      <div className="border-b border-[var(--border)] px-4 py-2">
        <h1 className="text-sm font-extrabold uppercase tracking-wide">
          Belt Orientation Calculator
        </h1>
        <p className="text-[11px] text-[var(--fg-2)]">
          Grid layout · 90° rotates · mergers/splitters/lifts · connectivity validation
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <BeltCanvas />
      </div>
    </div>
  )
}
