import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useAppStore } from '#/state/app-store'
import type { FactoryProject } from '#/domain/models/types'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Badge } from '#/components/ui/badge'
import { PROJECT_TEMPLATES } from '#/domain/data/templates'
import { formatPower } from '#/lib/utils'
import { toast } from 'sonner'

export const Route = createFileRoute('/projects')({
  component: ProjectsPage,
})

function ProjectsPage() {
  const projects = useAppStore((s) => s.projects)
  const activeProjectId = useAppStore((s) => s.activeProjectId)
  const setActiveProject = useAppStore((s) => s.setActiveProject)
  const createProject = useAppStore((s) => s.createProject)
  const createFromTemplate = useAppStore((s) => s.createFromTemplate)
  const deleteProject = useAppStore((s) => s.deleteProject)
  const renameProject = useAppStore((s) => s.renameProject)
  const importProject = useAppStore((s) => s.importProject)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const onImport = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text) as FactoryProject
      if (!data.name || !Array.isArray(data.lines)) throw new Error('Invalid project file')
      importProject(data)
      toast.success('Project imported')
    } catch {
      toast.error('Could not import project JSON')
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Factory Projects</h1>
          <p className="text-sm text-[var(--fg-2)]">Local-only · localStorage persistence</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => createProject('New Factory')}>New project</Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Import JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void onImport(f)
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {projects.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Input
                  value={p.name}
                  onChange={(e) => renameProject(p.id, e.target.value)}
                  className="max-w-sm font-bold"
                />
                <div className="mt-1 text-[11px] text-[var(--fg-2)]">
                  {p.lines.length} lines · updated {new Date(p.updatedAt).toLocaleString()}
                  {p.lastSolutionSummary
                    ? ` · ${p.lastSolutionSummary.totalMachines} machines · ${formatPower(p.lastSolutionSummary.totalPowerMW)}`
                    : ''}
                </div>
              </div>
              {p.id === activeProjectId ? <Badge>Active</Badge> : null}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setActiveProject(p.id)}
              >
                Open
              </Button>
              <Button size="sm" variant="danger" onClick={() => setDeleteId(p.id)}>
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create from template</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {PROJECT_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className="rounded-md border border-[var(--border)] bg-[var(--bg-2)] p-3 text-left hover:border-[var(--accent-orange)]/40"
              onClick={() => createFromTemplate(t.id)}
            >
              <div className="text-sm font-bold">{t.name}</div>
              <div className="text-xs text-[var(--fg-2)]">{t.description}</div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>
              This cannot be undone from disk (undo may still work until reload).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteId) deleteProject(deleteId)
                setDeleteId(null)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
