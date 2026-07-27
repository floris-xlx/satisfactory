import type { Item } from '#/domain/models/types'

export const items: Item[] = [
  // Raw solids
  { id: 'iron-ore', name: 'Iron Ore', category: 'raw', form: 'solid', stackSize: 100, iconKey: 'ore-iron', description: 'Common solid resource. Smelt into iron ingots.' },
  { id: 'copper-ore', name: 'Copper Ore', category: 'raw', form: 'solid', stackSize: 100, iconKey: 'ore-copper', description: 'Common solid resource. Smelt into copper ingots.' },
  { id: 'limestone', name: 'Limestone', category: 'raw', form: 'solid', stackSize: 100, iconKey: 'ore-limestone', description: 'Used for concrete and alternate recipes.' },
  { id: 'coal', name: 'Coal', category: 'raw', form: 'solid', stackSize: 100, iconKey: 'ore-coal', description: 'Fuel and steel ingredient.' },
  { id: 'caterium-ore', name: 'Caterium Ore', category: 'raw', form: 'solid', stackSize: 100, iconKey: 'ore-caterium', description: 'High-tier electronics feedstock.' },
  { id: 'raw-quartz', name: 'Raw Quartz', category: 'raw', form: 'solid', stackSize: 100, iconKey: 'ore-quartz', description: 'Crystal resource for silica and quartz crystal.' },
  { id: 'sulfur', name: 'Sulfur', category: 'raw', form: 'solid', stackSize: 100, iconKey: 'ore-sulfur', description: 'Black powder, compacted coal, sulfuric acid.' },
  { id: 'bauxite', name: 'Bauxite', category: 'raw', form: 'solid', stackSize: 100, iconKey: 'ore-bauxite', description: 'Aluminum production ore.' },
  { id: 'uranium', name: 'Uranium', category: 'raw', form: 'solid', stackSize: 100, iconKey: 'ore-uranium', description: 'Radioactive ore for nuclear chains.' },
  { id: 'sam', name: 'SAM Ore', category: 'raw', form: 'solid', stackSize: 100, iconKey: 'ore-sam', description: 'Strange Alien Matter for late-game conversion.' },
  { id: 'leaves', name: 'Leaves', category: 'raw', form: 'solid', stackSize: 500, iconKey: 'ore-leaves', description: 'Biomass from flora.' },
  { id: 'wood', name: 'Wood', category: 'raw', form: 'solid', stackSize: 100, iconKey: 'ore-wood', description: 'Biomass from trees.' },
  { id: 'mycelia', name: 'Mycelia', category: 'raw', form: 'solid', stackSize: 200, iconKey: 'ore-mycelia', description: 'Fungal resource for fabric and filters.' },
  { id: 'flower-petals', name: 'Flower Petals', category: 'raw', form: 'solid', stackSize: 500, iconKey: 'ore-petals', description: 'Colorant resource.' },

  // Fluids / gases
  { id: 'water', name: 'Water', category: 'fluid', form: 'fluid', iconKey: 'fluid-water', description: 'Extracted from water bodies.' },
  { id: 'crude-oil', name: 'Crude Oil', category: 'fluid', form: 'fluid', iconKey: 'fluid-oil', description: 'Oil wells — plastics, rubber, fuel.' },
  { id: 'nitrogen-gas', name: 'Nitrogen Gas', category: 'gas', form: 'gas', iconKey: 'fluid-nitrogen', description: 'Resource well gas.' },
  { id: 'heavy-oil-residue', name: 'Heavy Oil Residue', category: 'fluid', form: 'fluid', iconKey: 'fluid-hor' },
  { id: 'fuel', name: 'Fuel', category: 'fuel', form: 'fluid', iconKey: 'fluid-fuel' },
  { id: 'turbofuel', name: 'Turbofuel', category: 'fuel', form: 'fluid', iconKey: 'fluid-turbo' },
  { id: 'alumina-solution', name: 'Alumina Solution', category: 'fluid', form: 'fluid', iconKey: 'fluid-alumina' },
  { id: 'sulfuric-acid', name: 'Sulfuric Acid', category: 'fluid', form: 'fluid', iconKey: 'fluid-acid' },
  { id: 'nitric-acid', name: 'Nitric Acid', category: 'fluid', form: 'fluid', iconKey: 'fluid-nitric' },

  // Ingots
  { id: 'iron-ingot', name: 'Iron Ingot', category: 'ingot', form: 'solid', stackSize: 100, iconKey: 'ingot-iron' },
  { id: 'copper-ingot', name: 'Copper Ingot', category: 'ingot', form: 'solid', stackSize: 100, iconKey: 'ingot-copper' },
  { id: 'steel-ingot', name: 'Steel Ingot', category: 'ingot', form: 'solid', stackSize: 100, iconKey: 'ingot-steel' },
  { id: 'caterium-ingot', name: 'Caterium Ingot', category: 'ingot', form: 'solid', stackSize: 100, iconKey: 'ingot-caterium' },
  { id: 'aluminum-ingot', name: 'Aluminum Ingot', category: 'ingot', form: 'solid', stackSize: 100, iconKey: 'ingot-aluminum' },

  // Parts
  { id: 'iron-plate', name: 'Iron Plate', category: 'part', form: 'solid', stackSize: 200, iconKey: 'part-plate' },
  { id: 'iron-rod', name: 'Iron Rod', category: 'part', form: 'solid', stackSize: 200, iconKey: 'part-rod' },
  { id: 'screw', name: 'Screw', category: 'part', form: 'solid', stackSize: 500, iconKey: 'part-screw' },
  { id: 'wire', name: 'Wire', category: 'part', form: 'solid', stackSize: 500, iconKey: 'part-wire' },
  { id: 'cable', name: 'Cable', category: 'part', form: 'solid', stackSize: 200, iconKey: 'part-cable' },
  { id: 'concrete', name: 'Concrete', category: 'part', form: 'solid', stackSize: 100, iconKey: 'part-concrete' },
  { id: 'copper-sheet', name: 'Copper Sheet', category: 'part', form: 'solid', stackSize: 200, iconKey: 'part-sheet' },
  { id: 'steel-beam', name: 'Steel Beam', category: 'part', form: 'solid', stackSize: 200, iconKey: 'part-beam' },
  { id: 'steel-pipe', name: 'Steel Pipe', category: 'part', form: 'solid', stackSize: 200, iconKey: 'part-pipe' },
  { id: 'quickwire', name: 'Quickwire', category: 'part', form: 'solid', stackSize: 500, iconKey: 'part-quickwire' },
  { id: 'quartz-crystal', name: 'Quartz Crystal', category: 'part', form: 'solid', stackSize: 200, iconKey: 'part-quartz' },
  { id: 'silica', name: 'Silica', category: 'part', form: 'solid', stackSize: 200, iconKey: 'part-silica' },
  { id: 'plastic', name: 'Plastic', category: 'part', form: 'solid', stackSize: 200, iconKey: 'part-plastic' },
  { id: 'rubber', name: 'Rubber', category: 'part', form: 'solid', stackSize: 200, iconKey: 'part-rubber' },
  { id: 'polymer-resin', name: 'Polymer Resin', category: 'part', form: 'solid', stackSize: 200, iconKey: 'part-resin' },
  { id: 'empty-canister', name: 'Empty Canister', category: 'part', form: 'solid', stackSize: 100, iconKey: 'part-canister' },
  { id: 'packaged-fuel', name: 'Packaged Fuel', category: 'fuel', form: 'solid', stackSize: 100, iconKey: 'part-pack-fuel' },
  { id: 'packaged-water', name: 'Packaged Water', category: 'part', form: 'solid', stackSize: 100, iconKey: 'part-pack-water' },
  { id: 'packaged-oil', name: 'Packaged Oil', category: 'part', form: 'solid', stackSize: 100, iconKey: 'part-pack-oil' },
  { id: 'biomass', name: 'Biomass', category: 'part', form: 'solid', stackSize: 200, iconKey: 'part-biomass' },
  { id: 'solid-biofuel', name: 'Solid Biofuel', category: 'fuel', form: 'solid', stackSize: 200, iconKey: 'part-biofuel' },
  { id: 'fabric', name: 'Fabric', category: 'part', form: 'solid', stackSize: 100, iconKey: 'part-fabric' },
  { id: 'black-powder', name: 'Black Powder', category: 'ammunition', form: 'solid', stackSize: 100, iconKey: 'part-powder' },
  { id: 'compacted-coal', name: 'Compacted Coal', category: 'part', form: 'solid', stackSize: 100, iconKey: 'part-compact' },
  { id: 'petroleum-coke', name: 'Petroleum Coke', category: 'part', form: 'solid', stackSize: 200, iconKey: 'part-coke' },
  { id: 'aluminum-scrap', name: 'Aluminum Scrap', category: 'part', form: 'solid', stackSize: 500, iconKey: 'part-al-scrap' },
  { id: 'aluminum-casing', name: 'Aluminum Casing', category: 'part', form: 'solid', stackSize: 200, iconKey: 'part-al-casing' },
  { id: 'alclad-sheet', name: 'Alclad Aluminum Sheet', category: 'part', form: 'solid', stackSize: 200, iconKey: 'part-alclad' },
  { id: 'encased-industrial-beam', name: 'Encased Industrial Beam', category: 'part', form: 'solid', stackSize: 100, iconKey: 'part-eib' },
  { id: 'crystal-oscillator', name: 'Crystal Oscillator', category: 'component', form: 'solid', stackSize: 100, iconKey: 'comp-oscillator' },
  { id: 'high-speed-connector', name: 'High-Speed Connector', category: 'component', form: 'solid', stackSize: 100, iconKey: 'comp-hsc' },

  // Components
  { id: 'reinforced-iron-plate', name: 'Reinforced Iron Plate', category: 'component', form: 'solid', stackSize: 100, iconKey: 'comp-rip' },
  { id: 'rotor', name: 'Rotor', category: 'component', form: 'solid', stackSize: 100, iconKey: 'comp-rotor' },
  { id: 'modular-frame', name: 'Modular Frame', category: 'component', form: 'solid', stackSize: 50, iconKey: 'comp-frame' },
  { id: 'heavy-modular-frame', name: 'Heavy Modular Frame', category: 'component', form: 'solid', stackSize: 50, iconKey: 'comp-hmf' },
  { id: 'stator', name: 'Stator', category: 'component', form: 'solid', stackSize: 100, iconKey: 'comp-stator' },
  { id: 'motor', name: 'Motor', category: 'component', form: 'solid', stackSize: 50, iconKey: 'comp-motor' },
  { id: 'circuit-board', name: 'Circuit Board', category: 'component', form: 'solid', stackSize: 200, iconKey: 'comp-circuit' },
  { id: 'computer', name: 'Computer', category: 'component', form: 'solid', stackSize: 50, iconKey: 'comp-computer' },
  { id: 'ai-limiter', name: 'AI Limiter', category: 'component', form: 'solid', stackSize: 100, iconKey: 'comp-ai' },
  { id: 'supercomputer', name: 'Supercomputer', category: 'component', form: 'solid', stackSize: 50, iconKey: 'comp-super' },
  { id: 'radio-control-unit', name: 'Radio Control Unit', category: 'component', form: 'solid', stackSize: 50, iconKey: 'comp-rcu' },
  { id: 'battery', name: 'Battery', category: 'component', form: 'solid', stackSize: 100, iconKey: 'comp-battery' },

  // Nuclear-ish sample
  { id: 'encased-uranium-cell', name: 'Encased Uranium Cell', category: 'nuclear', form: 'solid', stackSize: 200, iconKey: 'nuke-cell' },
  { id: 'uranium-fuel-rod', name: 'Uranium Fuel Rod', category: 'nuclear', form: 'solid', stackSize: 50, iconKey: 'nuke-rod' },
  { id: 'electromagnetic-control-rod', name: 'Electromagnetic Control Rod', category: 'component', form: 'solid', stackSize: 100, iconKey: 'comp-emcr' },
]

export const itemsById: Record<string, Item> = Object.fromEntries(
  items.map((i) => [i.id, i]),
)

export function getItem(id: string): Item {
  const item = itemsById[id]
  if (!item) throw new Error(`Unknown item: ${id}`)
  return item
}

export function itemsByCategory(category: Item['category']): Item[] {
  return items.filter((i) => i.category === category)
}

export function rawResources(): Item[] {
  return items.filter(
    (i) =>
      i.category === 'raw' ||
      (i.form === 'fluid' && ['water', 'crude-oil'].includes(i.id)) ||
      i.form === 'gas',
  )
}
