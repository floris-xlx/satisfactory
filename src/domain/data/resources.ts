import type {
  ItemId,
  ResourceNodeDef,
  ResourcePurity,
  ResourceTypeSummary,
} from '#/domain/models/types'

/** Mk.1 solid node rates (items/min @ 100% clock). */
export const PURITY_RATE_MK1: Record<ResourcePurity, number> = {
  impure: 30,
  normal: 60,
  pure: 120,
}

export const PURITY_RATE_MK2: Record<ResourcePurity, number> = {
  impure: 60,
  normal: 120,
  pure: 240,
}

export const PURITY_RATE_MK3: Record<ResourcePurity, number> = {
  impure: 120,
  normal: 240,
  pure: 480,
}

function solidNodes(
  itemId: ItemId,
  regionCounts: { region: string; impure: number; normal: number; pure: number }[],
): ResourceNodeDef[] {
  const out: ResourceNodeDef[] = []
  let n = 0
  for (const r of regionCounts) {
    const add = (purity: ResourcePurity, count: number) => {
      for (let i = 0; i < count; i++) {
        n++
        out.push({
          id: `${itemId}-${r.region.toLowerCase().replace(/\s+/g, '-')}-${purity}-${i + 1}`,
          name: `${label(itemId)} node (${purity})`,
          itemId,
          kind: 'solid',
          purity,
          region: r.region,
          rateMk1: PURITY_RATE_MK1[purity],
          rateMk2: PURITY_RATE_MK2[purity],
          rateMk3: PURITY_RATE_MK3[purity],
        })
      }
    }
    add('impure', r.impure)
    add('normal', r.normal)
    add('pure', r.pure)
  }
  void n
  return out
}

function label(itemId: string): string {
  return itemId
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Sample world resource nodes — approximate counts/regions for planning demos.
 * Not an official node map dump.
 */
export const resourceNodes: ResourceNodeDef[] = [
  ...solidNodes('iron-ore', [
    { region: 'Grass Fields', impure: 2, normal: 4, pure: 1 },
    { region: 'Rocky Desert', impure: 1, normal: 3, pure: 2 },
    { region: 'Northern Forest', impure: 2, normal: 2, pure: 1 },
    { region: 'Dune Desert', impure: 1, normal: 2, pure: 2 },
  ]),
  ...solidNodes('copper-ore', [
    { region: 'Grass Fields', impure: 1, normal: 3, pure: 1 },
    { region: 'Rocky Desert', impure: 2, normal: 2, pure: 1 },
    { region: 'Northern Forest', impure: 1, normal: 2, pure: 1 },
    { region: 'Dune Desert', impure: 1, normal: 1, pure: 2 },
  ]),
  ...solidNodes('limestone', [
    { region: 'Grass Fields', impure: 1, normal: 3, pure: 1 },
    { region: 'Rocky Desert', impure: 2, normal: 2, pure: 1 },
    { region: 'Northern Forest', impure: 1, normal: 2, pure: 0 },
    { region: 'Dune Desert', impure: 0, normal: 2, pure: 1 },
  ]),
  ...solidNodes('coal', [
    { region: 'Rocky Desert', impure: 1, normal: 2, pure: 1 },
    { region: 'Northern Forest', impure: 2, normal: 2, pure: 1 },
    { region: 'Dune Desert', impure: 1, normal: 1, pure: 1 },
    { region: 'Spire Coast', impure: 0, normal: 2, pure: 1 },
  ]),
  ...solidNodes('caterium-ore', [
    { region: 'Northern Forest', impure: 1, normal: 2, pure: 1 },
    { region: 'Rocky Desert', impure: 1, normal: 1, pure: 1 },
    { region: 'Red Bamboo Fields', impure: 0, normal: 2, pure: 1 },
    { region: 'Dune Desert', impure: 1, normal: 1, pure: 0 },
  ]),
  ...solidNodes('raw-quartz', [
    { region: 'Northern Forest', impure: 1, normal: 2, pure: 1 },
    { region: 'Red Bamboo Fields', impure: 1, normal: 1, pure: 1 },
    { region: 'Rocky Desert', impure: 0, normal: 1, pure: 1 },
  ]),
  ...solidNodes('sulfur', [
    { region: 'Rocky Desert', impure: 1, normal: 2, pure: 0 },
    { region: 'Dune Desert', impure: 1, normal: 1, pure: 1 },
    { region: 'Red Jungle', impure: 0, normal: 2, pure: 1 },
  ]),
  ...solidNodes('bauxite', [
    { region: 'Red Jungle', impure: 1, normal: 2, pure: 1 },
    { region: 'Red Bamboo Fields', impure: 1, normal: 1, pure: 1 },
    { region: 'Spire Coast', impure: 0, normal: 1, pure: 1 },
  ]),
  ...solidNodes('uranium', [
    { region: 'Red Jungle', impure: 1, normal: 1, pure: 0 },
    { region: 'Dune Desert', impure: 0, normal: 1, pure: 1 },
    { region: 'Spire Coast', impure: 1, normal: 0, pure: 1 },
  ]),
  ...solidNodes('sam', [
    { region: 'Rocky Desert', impure: 1, normal: 1, pure: 0 },
    { region: 'Northern Forest', impure: 1, normal: 0, pure: 1 },
    { region: 'Dune Desert', impure: 0, normal: 1, pure: 0 },
  ]),

  // Oil wells (fluid) — rates in m³/min
  ...(['Grass Fields', 'Spire Coast', 'Dune Desert', 'Red Jungle'] as const).flatMap(
    (region, ri) =>
      (['impure', 'normal', 'pure'] as ResourcePurity[]).flatMap((purity, pi) => {
        const count = purity === 'normal' ? 2 : 1
        return Array.from({ length: count }, (_, i) => {
          const rates = { impure: 60, normal: 120, pure: 240 }
          return {
            id: `crude-oil-${region.toLowerCase().replace(/\s+/g, '-')}-${purity}-${i + 1}`,
            name: `Oil well (${purity})`,
            itemId: 'crude-oil' as ItemId,
            kind: 'fluid' as const,
            purity,
            region,
            rateMk1: rates[purity],
            rateMk2: rates[purity] * 1.5,
            rateMk3: rates[purity] * 2,
            description: `Sample well cluster ${ri + 1}.${pi + 1}`,
          }
        })
      }),
  ),

  // Water — abstract extractor sites (not purity nodes, but listed for planning)
  ...(['Grass Fields', 'Rocky Desert', 'Northern Forest', 'Spire Coast'] as const).map(
    (region, i) => ({
      id: `water-${i + 1}`,
      name: 'Water body',
      itemId: 'water' as ItemId,
      kind: 'fluid' as const,
      purity: 'normal' as ResourcePurity,
      region,
      rateMk1: 120,
      rateMk2: 120,
      rateMk3: 120,
      description: 'Water extractor site (unlimited body, rate per extractor).',
    }),
  ),

  // Nitrogen gas wells
  ...(['Red Jungle', 'Spire Coast', 'Dune Desert'] as const).flatMap((region) =>
    (['normal', 'pure'] as ResourcePurity[]).map((purity, i) => ({
      id: `nitrogen-${region.toLowerCase().replace(/\s+/g, '-')}-${purity}-${i + 1}`,
      name: `Nitrogen well (${purity})`,
      itemId: 'nitrogen-gas' as ItemId,
      kind: 'gas' as const,
      purity,
      region,
      rateMk1: purity === 'pure' ? 60 : 30,
      rateMk2: purity === 'pure' ? 120 : 60,
      rateMk3: purity === 'pure' ? 180 : 90,
    })),
  ),
]

export function nodesForItem(itemId: ItemId): ResourceNodeDef[] {
  return resourceNodes.filter((n) => n.itemId === itemId)
}

export function summarizeResources(): ResourceTypeSummary[] {
  const byItem = new Map<ItemId, ResourceNodeDef[]>()
  for (const n of resourceNodes) {
    const list = byItem.get(n.itemId) ?? []
    list.push(n)
    byItem.set(n.itemId, list)
  }
  return [...byItem.entries()]
    .map(([itemId, nodes]) => ({
      itemId,
      nodeCount: nodes.length,
      impure: nodes.filter((n) => n.purity === 'impure').length,
      normal: nodes.filter((n) => n.purity === 'normal').length,
      pure: nodes.filter((n) => n.purity === 'pure').length,
      maxMk3Total: nodes.reduce((s, n) => s + n.rateMk3, 0),
    }))
    .sort((a, b) => a.itemId.localeCompare(b.itemId))
}

export function totalMaxExtraction(itemId: ItemId, miner: 'mk1' | 'mk2' | 'mk3' = 'mk3'): number {
  const key = miner === 'mk1' ? 'rateMk1' : miner === 'mk2' ? 'rateMk2' : 'rateMk3'
  return nodesForItem(itemId).reduce((s, n) => s + n[key], 0)
}

export const RESOURCE_ITEM_IDS = [
  'iron-ore',
  'copper-ore',
  'limestone',
  'coal',
  'caterium-ore',
  'raw-quartz',
  'sulfur',
  'bauxite',
  'uranium',
  'sam',
  'water',
  'crude-oil',
  'nitrogen-gas',
] as const
