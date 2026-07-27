import type { BeltTier, PipeTier } from '#/domain/models/types'

export const beltTiers: BeltTier[] = [
  { id: 'belt-mk1', name: 'Conveyor Mk.1', maxItemsPerMin: 60, mark: 1 },
  { id: 'belt-mk2', name: 'Conveyor Mk.2', maxItemsPerMin: 120, mark: 2 },
  { id: 'belt-mk3', name: 'Conveyor Mk.3', maxItemsPerMin: 270, mark: 3 },
  { id: 'belt-mk4', name: 'Conveyor Mk.4', maxItemsPerMin: 480, mark: 4 },
  { id: 'belt-mk5', name: 'Conveyor Mk.5', maxItemsPerMin: 780, mark: 5 },
]

export const pipeTiers: PipeTier[] = [
  { id: 'pipe-mk1', name: 'Pipeline Mk.1', maxM3PerMin: 300, mark: 1 },
  { id: 'pipe-mk2', name: 'Pipeline Mk.2', maxM3PerMin: 600, mark: 2 },
]

export const beltTiersById = Object.fromEntries(beltTiers.map((b) => [b.id, b]))
export const pipeTiersById = Object.fromEntries(pipeTiers.map((p) => [p.id, p]))
