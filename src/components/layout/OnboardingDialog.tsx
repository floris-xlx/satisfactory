import { useState } from 'react'
import { useAppStore } from '#/state/app-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { PROJECT_TEMPLATES } from '#/domain/data/templates'

export function OnboardingDialog() {
  const complete = useAppStore((s) => s.settings.onboardingComplete)
  const hydrated = useAppStore((s) => s.hydrated)
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)
  const createFromTemplate = useAppStore((s) => s.createFromTemplate)
  const createProject = useAppStore((s) => s.createProject)
  const [step, setStep] = useState(0)

  const open = hydrated && !complete

  return (
    <Dialog open={open} onOpenChange={(o) => !o && completeOnboarding()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {step === 0 && 'Welcome to SatisFactory'}
            {step === 1 && 'Plan production chains'}
            {step === 2 && 'Start from a template'}
          </DialogTitle>
          <DialogDescription>
            {step === 0 &&
              'An offline factory planner for production rates, machines, power, and conveyor orientation — no backend required.'}
            {step === 1 &&
              'Pick an output item and target rate. The graph expands recipes recursively, supports alternate recipes, and overclocks from 1% to 250%.'}
            {step === 2 &&
              'Load a sample factory or start blank. Everything saves to localStorage.'}
          </DialogDescription>
        </DialogHeader>

        {step < 2 ? (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => completeOnboarding()}>
              Skip
            </Button>
            <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {PROJECT_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] p-3 text-left transition hover:border-[var(--accent-orange)]/50"
                  onClick={() => {
                    createFromTemplate(t.id)
                    completeOnboarding()
                  }}
                >
                  <div className="text-sm font-bold">{t.name}</div>
                  <div className="mt-1 text-xs text-[var(--fg-2)]">{t.description}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  createProject('My Factory')
                  completeOnboarding()
                }}
              >
                Blank project
              </Button>
              <Button onClick={() => completeOnboarding()}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
