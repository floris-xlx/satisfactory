import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAppStore } from '#/state/app-store'
import { beltTiers } from '#/domain/data/belts-pipes'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const clearAllData = useAppStore((s) => s.clearAllData)
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-extrabold">Settings</h1>
        <p className="text-sm text-[var(--fg-2)]">Defaults for calculations and local data.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Production defaults</CardTitle>
          <CardDescription>Applied when targets omit overrides.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Default clock %</Label>
            <Input
              type="number"
              min={1}
              max={250}
              className="mt-1.5"
              value={settings.defaultClockPercent}
              onChange={(e) =>
                updateSettings({ defaultClockPercent: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <Label>Power exponent</Label>
            <Input
              type="number"
              step={0.000001}
              className="mt-1.5"
              value={settings.powerExponent}
              onChange={(e) =>
                updateSettings({ powerExponent: Number(e.target.value) })
              }
            />
            <p className="mt-1 text-[11px] text-[var(--fg-2)]">
              Power ≈ base × machines × clockFactor^exponent
            </p>
          </div>
          <div>
            <Label>Preferred belt tier</Label>
            <select
              className="mt-1.5 flex h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-1)] px-2 text-sm"
              value={settings.preferredBeltTierId}
              onChange={(e) =>
                updateSettings({ preferredBeltTierId: e.target.value })
              }
            >
              {beltTiers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Keyboard shortcuts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 font-mono text-xs text-[var(--fg-1)]">
          <div>Ctrl/Cmd+Z — Undo</div>
          <div>Ctrl/Cmd+Y — Redo</div>
          <div>Ctrl/Cmd+S — Save</div>
          <div>R — Rotate selected belt</div>
          <div>1–7 — Belt tools</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data</CardTitle>
          <CardDescription>Reset localStorage and reseed sample projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="danger" onClick={() => setConfirm(true)}>
            Clear all local data
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all data?</DialogTitle>
            <DialogDescription>
              Deletes every project from this browser and restores sample templates.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearAllData()
                setConfirm(false)
                toast.success('Local data cleared')
              }}
            >
              Clear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
