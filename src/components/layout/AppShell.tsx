import { useEffect } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  Boxes,
  Cable,
  Factory,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  BookOpen,
  Mountain,
  X,
  Undo2,
  Redo2,
  Save,
  Download,
} from 'lucide-react'
import { useAppStore } from '#/state/app-store'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '#/components/ui/tooltip'
import { cn, formatPower } from '#/lib/utils'
import { OnboardingDialog } from '#/components/layout/OnboardingDialog'
import { Toaster } from 'sonner'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/production', label: 'Production', icon: Factory },
  { to: '/belts', label: 'Belt Layout', icon: Cable },
  { to: '/resources', label: 'Resources', icon: Mountain },
  { to: '/recipes', label: 'Recipes', icon: BookOpen },
  { to: '/items', label: 'Items', icon: Package },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrate)
  const hydrated = useAppStore((s) => s.hydrated)
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const project = useAppStore((s) => s.getActiveProject())
  const renameProject = useAppStore((s) => s.renameProject)
  const persist = useAppStore((s) => s.persist)
  const undo = useAppStore((s) => s.undo)
  const redo = useAppStore((s) => s.redo)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if (mod && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault()
        redo()
      }
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault()
        persist()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, persist])

  const summary = project?.lastSolutionSummary

  const exportProject = () => {
    if (!project) return
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-0)] text-[var(--fg-1)]">
        <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-1)] px-6 py-4">
          <Boxes className="h-5 w-5 animate-pulse text-[var(--accent-orange)]" />
          <span className="font-semibold">Booting SatisFactory…</span>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={250}>
      <div className="flex h-screen overflow-hidden bg-[var(--bg-0)] text-[var(--fg-0)]">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-[var(--border)] bg-[var(--bg-1)] transition-transform lg:static lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent-orange)] text-[var(--bg-0)]">
              <Factory className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold tracking-wide">
                SATISFACTORY
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fg-2)]">
                Factory Ops
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Main">
            {NAV.map((item) => {
              const active =
                item.to === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.to)
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                    active
                      ? 'bg-[var(--accent-orange)]/15 text-[var(--accent-amber)]'
                      : 'text-[var(--fg-1)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-[var(--border)] p-3 text-[10px] text-[var(--fg-2)]">
            Offline planner · sample data
          </div>
        </aside>

        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            aria-label="Close overlay"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Toolbar */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[var(--bg-1)]/95 px-3 backdrop-blur">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Input
              value={project?.name ?? ''}
              onChange={(e) =>
                project && renameProject(project.id, e.target.value)
              }
              className="max-w-xs border-transparent bg-transparent font-bold hover:border-[var(--border)]"
              aria-label="Project name"
            />
            <div className="ml-auto flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon" onClick={() => undo()} aria-label="Undo">
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon" onClick={() => redo()} aria-label="Redo">
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon" onClick={() => persist()} aria-label="Save">
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save (Ctrl+S)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon" onClick={exportProject} aria-label="Export">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export project JSON</TooltipContent>
              </Tooltip>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-auto">{children}</main>

          {/* Status bar */}
          <footer className="flex h-9 shrink-0 items-center gap-4 border-t border-[var(--border)] bg-[var(--bg-1)] px-3 text-[11px] font-semibold text-[var(--fg-2)]">
            <span>
              Machines{' '}
              <span className="text-[var(--fg-0)]">{summary?.totalMachines ?? 0}</span>
            </span>
            <span>
              Power{' '}
              <span className="text-[var(--accent-amber)]">
                {formatPower(summary?.totalPowerMW ?? 0)}
              </span>
            </span>
            <span>
              Raw inputs{' '}
              <span className="text-[var(--fg-0)]">
                {summary?.rawInputs?.length ?? 0}
              </span>
            </span>
            {(summary?.bottlenecks?.length ?? 0) > 0 ? (
              <span className="truncate text-[var(--danger)]">
                ⚠ {summary!.bottlenecks.length} bottleneck
                {summary!.bottlenecks.length === 1 ? '' : 's'}
              </span>
            ) : (
              <span className="text-[var(--success)]">Throughput OK</span>
            )}
          </footer>
        </div>
        <OnboardingDialog />
        <Toaster theme="dark" position="top-right" richColors />
      </div>
    </TooltipProvider>
  )
}
