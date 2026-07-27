import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Cable,
  Factory,
  FolderKanban,
  AlertTriangle,
  Zap,
  Boxes,
} from 'lucide-react'
import { useAppStore } from '#/state/app-store'
import { PROJECT_TEMPLATES } from '#/domain/data/templates'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { formatPower, formatRate } from '#/lib/utils'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const projects = useAppStore((s) => s.projects)
  const setActiveProject = useAppStore((s) => s.setActiveProject)
  const createFromTemplate = useAppStore((s) => s.createFromTemplate)
  const createProject = useAppStore((s) => s.createProject)
  const active = useAppStore((s) => s.getActiveProject())

  const totals = projects.reduce(
    (acc, p) => {
      acc.machines += p.lastSolutionSummary?.totalMachines ?? 0
      acc.power += p.lastSolutionSummary?.totalPowerMW ?? 0
      acc.bottlenecks += p.lastSolutionSummary?.bottlenecks.length ?? 0
      return acc
    },
    { machines: 0, power: 0, bottlenecks: 0 },
  )

  const recent = [...projects]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5)

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-orange)]">
          Operations center
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">
          Factory Dashboard
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--fg-2)]">
          Plan production chains, overclock machines, and orient conveyors — entirely offline
          with sample industrial data.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="Projects"
          value={String(projects.length)}
        />
        <StatCard
          icon={Boxes}
          label="Machines (cached)"
          value={String(totals.machines)}
        />
        <StatCard
          icon={Zap}
          label="Power (cached)"
          value={formatPower(totals.power)}
          accent
        />
        <StatCard
          icon={AlertTriangle}
          label="Bottlenecks"
          value={String(totals.bottlenecks)}
          danger={totals.bottlenecks > 0}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump into planning tools for the active project.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/production">
                <Factory className="h-4 w-4" /> Production calculator
              </Link>
            </Button>
            <Button asChild variant="steel">
              <Link to="/belts">
                <Cable className="h-4 w-4" /> Belt orientation
              </Link>
            </Button>
            <Button variant="secondary" onClick={() => createProject('New Factory')}>
              New blank project
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active project</CardTitle>
            <CardDescription>{active?.name ?? 'None'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--fg-2)]">Lines</span>
              <span className="font-mono font-bold">{active?.lines.length ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--fg-2)]">Targets</span>
              <span className="font-mono font-bold">
                {active?.lines.reduce((s, l) => s + l.targets.length, 0) ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--fg-2)]">Output rates</span>
              <span className="font-mono font-bold">
                {active?.lastSolutionSummary?.outputRates
                  .map((o) => formatRate(o.ratePerMin))
                  .join(', ') || '—'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveProject(p.id)}
                className="flex w-full items-center justify-between rounded-md border border-[var(--border)] bg-[var(--bg-2)] px-3 py-2 text-left transition hover:border-[var(--accent-orange)]/40"
              >
                <div>
                  <div className="text-sm font-bold">{p.name}</div>
                  <div className="text-[11px] text-[var(--fg-2)]">
                    Updated {new Date(p.updatedAt).toLocaleString()}
                  </div>
                </div>
                {p.id === active?.id ? <Badge>Active</Badge> : null}
              </button>
            ))}
            {recent.length === 0 ? (
              <p className="text-sm text-[var(--fg-2)]">No projects yet.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Example templates</CardTitle>
            <CardDescription>Load a ready-made factory plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {PROJECT_TEMPLATES.map((t) => (
              <div
                key={t.id}
                className="flex items-start justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-2)] p-3"
              >
                <div>
                  <div className="text-sm font-bold">{t.name}</div>
                  <div className="text-xs text-[var(--fg-2)]">{t.description}</div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => createFromTemplate(t.id)}>
                  Load
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  danger,
}: {
  icon: typeof Boxes
  label: string
  value: string
  accent?: boolean
  danger?: boolean
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--bg-2)] text-[var(--accent-steel)]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fg-2)]">
            {label}
          </div>
          <div
            className={`font-mono text-xl font-bold ${
              danger
                ? 'text-[var(--danger)]'
                : accent
                  ? 'text-[var(--accent-amber)]'
                  : 'text-[var(--fg-0)]'
            }`}
          >
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
