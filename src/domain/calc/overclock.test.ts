import { describe, expect, it } from 'vitest'
import {
  baseOutputPerMin,
  clampClock,
  machinesNeededCeil,
  machinesNeededExact,
  powerMW,
  scaleRate,
} from '#/domain/calc/overclock'

describe('overclock', () => {
  it('clamps clock to 1–250', () => {
    expect(clampClock(0)).toBe(1)
    expect(clampClock(-10)).toBe(1)
    expect(clampClock(100)).toBe(100)
    expect(clampClock(250)).toBe(250)
    expect(clampClock(999)).toBe(250)
  })

  it('scales rate by clock percent', () => {
    expect(scaleRate(60, 100)).toBe(60)
    expect(scaleRate(60, 200)).toBe(120)
    expect(scaleRate(60, 50)).toBe(30)
    expect(scaleRate(60, 1)).toBeCloseTo(0.6)
  })

  it('computes base output per minute from duration', () => {
    // 1 item / 2s = 30/min
    expect(baseOutputPerMin(1, 2)).toBe(30)
    // 2 items / 6s = 20/min
    expect(baseOutputPerMin(2, 6)).toBe(20)
  })

  it('machines exact and ceil at 100% and overclock', () => {
    // need 60/min, base 30/min → 2 machines
    expect(machinesNeededExact(60, 30, 100)).toBe(2)
    expect(machinesNeededCeil(60, 30, 100)).toBe(2)
    // at 200% one machine does 60
    expect(machinesNeededExact(60, 30, 200)).toBe(1)
    expect(machinesNeededCeil(60, 30, 200)).toBe(1)
    // fractional
    expect(machinesNeededExact(45, 30, 100)).toBe(1.5)
    expect(machinesNeededCeil(45, 30, 100)).toBe(2)
  })

  it('power scales with clock exponent', () => {
    const base = 4
    const p100 = powerMW(base, 1, 100, 1.321928)
    const p250 = powerMW(base, 1, 250, 1.321928)
    expect(p100).toBeCloseTo(4)
    expect(p250).toBeGreaterThan(p100)
    expect(p250).toBeCloseTo(4 * Math.pow(2.5, 1.321928))
  })
})
