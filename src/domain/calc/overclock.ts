import { DEFAULT_CLOCK_MAX, DEFAULT_CLOCK_MIN } from '#/domain/models/types'

export function clampClock(percent: number): number {
  if (!Number.isFinite(percent)) return 100
  return Math.min(DEFAULT_CLOCK_MAX, Math.max(DEFAULT_CLOCK_MIN, percent))
}

export function clockFactor(percent: number): number {
  return clampClock(percent) / 100
}

/** Scale a base rate (items/min at 100%) by clock percent. */
export function scaleRate(basePerMin: number, clockPercent: number): number {
  return basePerMin * clockFactor(clockPercent)
}

/**
 * Exact machines needed to hit requiredOutPerMin given baseOutPerMin at 100% clock.
 */
export function machinesNeededExact(
  requiredOutPerMin: number,
  baseOutPerMin: number,
  clockPercent: number,
): number {
  if (requiredOutPerMin <= 0) return 0
  const effective = scaleRate(baseOutPerMin, clockPercent)
  if (effective <= 0) return Infinity
  return requiredOutPerMin / effective
}

export function machinesNeededCeil(
  requiredOutPerMin: number,
  baseOutPerMin: number,
  clockPercent: number,
): number {
  const exact = machinesNeededExact(requiredOutPerMin, baseOutPerMin, clockPercent)
  if (!Number.isFinite(exact)) return Number.POSITIVE_INFINITY
  return Math.ceil(exact - 1e-12)
}

/** Satisfactory-style power: basePower * machines * clockFactor^exponent */
export function powerMW(
  basePowerMW: number,
  machines: number,
  clockPercent: number,
  powerExponent: number,
): number {
  if (machines <= 0 || basePowerMW <= 0) return 0
  const f = clockFactor(clockPercent)
  return basePowerMW * machines * Math.pow(f, powerExponent)
}

/** Recipe cycle: amount produced per minute at 100% for a given output amount. */
export function baseOutputPerMin(amount: number, durationSec: number): number {
  if (durationSec <= 0) return 0
  return (amount / durationSec) * 60
}

export function baseInputPerMin(amount: number, durationSec: number): number {
  return baseOutputPerMin(amount, durationSec)
}
