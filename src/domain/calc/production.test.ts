import { describe, expect, it } from 'vitest'
import { solveProduction } from '#/domain/calc/production'

describe('solveProduction', () => {
  it('solves a simple iron plate chain', () => {
    const sol = solveProduction([
      {
        id: 't1',
        itemId: 'iron-plate',
        ratePerMin: 20,
        clockPercent: 100,
      },
    ])

    expect(sol.targets[0]?.ratePerMin).toBe(20)
    const plate = sol.nodes.find((n) => n.itemId === 'iron-plate' && n.kind !== 'output')
    expect(plate).toBeTruthy()
    // iron plate: 2 per 6s = 20/min base → 1 machine for 20/min
    expect(plate!.machinesExact).toBeCloseTo(1, 5)
    expect(plate!.machinesCeil).toBe(1)

    const ingot = sol.nodes.find((n) => n.itemId === 'iron-ingot')
    expect(ingot).toBeTruthy()
    // plates need 3 ingot per 2 plate → 30 ingot/min for 20 plates
    expect(ingot!.outputRatePerMin).toBeCloseTo(30, 5)

    expect(sol.totalMachines).toBeGreaterThan(0)
    expect(sol.edges.length).toBeGreaterThan(0)
  })

  it('merges shared intermediates (DAG)', () => {
    const sol = solveProduction([
      { id: 'a', itemId: 'iron-rod', ratePerMin: 15, clockPercent: 100 },
      { id: 'b', itemId: 'iron-plate', ratePerMin: 10, clockPercent: 100 },
    ])
    const ingots = sol.nodes.filter((n) => n.itemId === 'iron-ingot' && n.kind !== 'output')
    expect(ingots.length).toBe(1)
    // rods: 15 ingot/min; plates: 15 ingot/min → 30 total
    expect(ingots[0]!.outputRatePerMin).toBeCloseTo(30, 4)
  })

  it('respects alternate recipe override', () => {
    const defaultSol = solveProduction([
      { id: 't', itemId: 'screw', ratePerMin: 40, clockPercent: 100 },
    ])
    const altSol = solveProduction([
      {
        id: 't',
        itemId: 'screw',
        ratePerMin: 40,
        clockPercent: 100,
        recipeOverrideId: 'alt-cast-screw',
      },
    ])
    const def = defaultSol.nodes.find((n) => n.itemId === 'screw' && n.kind !== 'output')
    const alt = altSol.nodes.find((n) => n.itemId === 'screw' && n.kind !== 'output')
    expect(def?.recipeId).toBe('screw')
    expect(alt?.recipeId).toBe('alt-cast-screw')
    // cast screw uses iron ingot directly, not rods
    expect(alt?.inputs.some((i) => i.itemId === 'iron-ingot')).toBe(true)
  })

  it('applies underclock and overclock', () => {
    const slow = solveProduction([
      { id: 't', itemId: 'iron-ingot', ratePerMin: 30, clockPercent: 50 },
    ])
    const fast = solveProduction([
      { id: 't', itemId: 'iron-ingot', ratePerMin: 30, clockPercent: 200 },
    ])
    const s = slow.nodes.find((n) => n.itemId === 'iron-ingot' && n.kind !== 'output')!
    const f = fast.nodes.find((n) => n.itemId === 'iron-ingot' && n.kind !== 'output')!
    // base 30/min at 100%; at 50% need 2; at 200% need 0.5 → 1 ceil
    expect(s.machinesExact).toBeCloseTo(2)
    expect(f.machinesExact).toBeCloseTo(0.5)
    expect(f.machinesCeil).toBe(1)
  })

  it('flags belt bottlenecks for very high rates', () => {
    const sol = solveProduction([
      { id: 't', itemId: 'screw', ratePerMin: 900, clockPercent: 250 },
    ])
    expect(sol.bottlenecks.length).toBeGreaterThan(0)
  })
})
