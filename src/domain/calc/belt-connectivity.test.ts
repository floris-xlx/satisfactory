import { describe, expect, it } from 'vitest'
import {
  cellKey,
  emptyLayout,
  portsForCell,
  rotateCell,
  validateBeltConnectivity,
} from '#/domain/calc/belt-connectivity'

describe('belt connectivity', () => {
  it('straight ports rotate correctly', () => {
    expect(portsForCell('straight', 0)).toEqual({ inputs: ['W'], outputs: ['E'] })
    expect(portsForCell('straight', 90)).toEqual({ inputs: ['N'], outputs: ['S'] })
  })

  it('connects two aligned straights', () => {
    const layout = emptyLayout('l', 'test', 8, 8, 1)
    layout.cells[cellKey(0, 1, 1)] = {
      type: 'straight',
      rotation: 0,
      beltTierId: 'belt-mk1',
    }
    layout.cells[cellKey(0, 2, 1)] = {
      type: 'straight',
      rotation: 0,
      beltTierId: 'belt-mk1',
    }
    const report = validateBeltConnectivity(layout)
    expect(report.validCount).toBeGreaterThanOrEqual(1)
    expect(report.invalidCount).toBe(0)
  })

  it('rejects mismatched orientation', () => {
    const layout = emptyLayout('l', 'test', 8, 8, 1)
    // first outputs E, second also outputs E (inputs W) but rotated 180 inputs E outputs W — wait
    // straight 0: in W out E
    // neighbor at x+1 with rotation 0: in W out E — should ACCEPT from west
    // broken: neighbor rotation 180: in E out W — does not accept from W
    layout.cells[cellKey(0, 1, 1)] = {
      type: 'straight',
      rotation: 0,
      beltTierId: 'belt-mk1',
    }
    layout.cells[cellKey(0, 2, 1)] = {
      type: 'straight',
      rotation: 180,
      beltTierId: 'belt-mk1',
    }
    const report = validateBeltConnectivity(layout)
    expect(report.invalidCount).toBeGreaterThan(0)
  })

  it('connects lifts vertically', () => {
    const layout = emptyLayout('l', 'test', 8, 8, 2)
    layout.cells[cellKey(0, 3, 3)] = {
      type: 'lift',
      rotation: 0,
      beltTierId: 'belt-mk2',
    }
    layout.cells[cellKey(1, 3, 3)] = {
      type: 'lift',
      rotation: 0,
      beltTierId: 'belt-mk2',
    }
    const report = validateBeltConnectivity(layout)
    expect(report.links.some((l) => l.valid && l.reason === 'vertical lift')).toBe(true)
  })

  it('warns when rate exceeds tier', () => {
    const layout = emptyLayout('l', 'test', 8, 8, 1)
    layout.cells[cellKey(0, 0, 0)] = {
      type: 'straight',
      rotation: 0,
      beltTierId: 'belt-mk1',
      ratePerMin: 120,
    }
    const report = validateBeltConnectivity(layout)
    expect(report.throughputWarnings[0]?.exceeds).toBe(true)
  })

  it('rotateCell steps by 90', () => {
    expect(rotateCell(0)).toBe(90)
    expect(rotateCell(270)).toBe(0)
  })
})
