import { describe, expect, it } from 'vitest'
import {
  nodesForItem,
  resourceNodes,
  summarizeResources,
  totalMaxExtraction,
} from '#/domain/data/resources'
import { itemsById } from '#/domain/data/items'

describe('resource nodes', () => {
  it('has sample nodes for major raw resources', () => {
    expect(resourceNodes.length).toBeGreaterThan(50)
    expect(nodesForItem('iron-ore').length).toBeGreaterThan(5)
    expect(nodesForItem('crude-oil').length).toBeGreaterThan(3)
    expect(nodesForItem('nitrogen-gas').length).toBeGreaterThan(0)
  })

  it('every node item exists in catalog', () => {
    for (const n of resourceNodes) {
      expect(itemsById[n.itemId]).toBeTruthy()
    }
  })

  it('summaries and totals are consistent', () => {
    const summaries = summarizeResources()
    const iron = summaries.find((s) => s.itemId === 'iron-ore')
    expect(iron).toBeTruthy()
    expect(iron!.impure + iron!.normal + iron!.pure).toBe(iron!.nodeCount)
    expect(totalMaxExtraction('iron-ore', 'mk3')).toBe(iron!.maxMk3Total)
    expect(totalMaxExtraction('iron-ore', 'mk3')).toBeGreaterThan(
      totalMaxExtraction('iron-ore', 'mk1'),
    )
  })
})
