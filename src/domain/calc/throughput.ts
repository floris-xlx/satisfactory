import { beltTiers, pipeTiers } from '#/domain/data/belts-pipes'
import type { BeltTier, ItemForm, PipeTier } from '#/domain/models/types'

export interface ThroughputPick {
  ok: boolean
  belt?: BeltTier
  pipe?: PipeTier
  requiredRate: number
  capacity: number
  isBottleneck: boolean
  message?: string
}

export function pickBeltForRate(itemsPerMin: number): ThroughputPick {
  const sorted = [...beltTiers].sort((a, b) => a.maxItemsPerMin - b.maxItemsPerMin)
  const belt = sorted.find((b) => b.maxItemsPerMin + 1e-9 >= itemsPerMin)
  if (!belt) {
    const max = sorted[sorted.length - 1]
    return {
      ok: false,
      belt: max,
      requiredRate: itemsPerMin,
      capacity: max?.maxItemsPerMin ?? 0,
      isBottleneck: true,
      message: `Rate ${fmt(itemsPerMin)}/min exceeds max belt ${max?.name ?? '?'} (${max?.maxItemsPerMin ?? 0}/min)`,
    }
  }
  return {
    ok: true,
    belt,
    requiredRate: itemsPerMin,
    capacity: belt.maxItemsPerMin,
    isBottleneck: false,
  }
}

export function pickPipeForRate(m3PerMin: number): ThroughputPick {
  const sorted = [...pipeTiers].sort((a, b) => a.maxM3PerMin - b.maxM3PerMin)
  const pipe = sorted.find((p) => p.maxM3PerMin + 1e-9 >= m3PerMin)
  if (!pipe) {
    const max = sorted[sorted.length - 1]
    return {
      ok: false,
      pipe: max,
      requiredRate: m3PerMin,
      capacity: max?.maxM3PerMin ?? 0,
      isBottleneck: true,
      message: `Rate ${fmt(m3PerMin)} m³/min exceeds max pipe ${max?.name ?? '?'} (${max?.maxM3PerMin ?? 0}/min)`,
    }
  }
  return {
    ok: true,
    pipe,
    requiredRate: m3PerMin,
    capacity: pipe.maxM3PerMin,
    isBottleneck: false,
  }
}

export function pickTransport(
  form: ItemForm,
  ratePerMin: number,
): ThroughputPick {
  // Gases use pipes in Satisfactory (packaged or pipeline).
  if (form === 'fluid' || form === 'gas') return pickPipeForRate(ratePerMin)
  return pickBeltForRate(ratePerMin)
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}
