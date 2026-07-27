import type { Building } from '#/domain/models/types'

const PEXP = 1.321928

export const buildings: Building[] = [
  { id: 'miner-mk1', name: 'Miner Mk.1', kind: 'miner', powerMW: 5, powerExponent: PEXP, inputSlots: 0, outputSlots: 1, iconKey: 'b-miner' },
  { id: 'miner-mk2', name: 'Miner Mk.2', kind: 'miner', powerMW: 12, powerExponent: PEXP, inputSlots: 0, outputSlots: 1, iconKey: 'b-miner' },
  { id: 'miner-mk3', name: 'Miner Mk.3', kind: 'miner', powerMW: 30, powerExponent: PEXP, inputSlots: 0, outputSlots: 1, iconKey: 'b-miner' },
  { id: 'water-extractor', name: 'Water Extractor', kind: 'extractor', powerMW: 20, powerExponent: PEXP, inputSlots: 0, outputSlots: 1, iconKey: 'b-extractor' },
  { id: 'oil-extractor', name: 'Oil Extractor', kind: 'extractor', powerMW: 40, powerExponent: PEXP, inputSlots: 0, outputSlots: 1, iconKey: 'b-oil' },
  { id: 'resource-well-extractor', name: 'Resource Well Extractor', kind: 'extractor', powerMW: 0, powerExponent: 1, inputSlots: 0, outputSlots: 1, iconKey: 'b-well' },
  { id: 'resource-well-pressurizer', name: 'Resource Well Pressurizer', kind: 'extractor', powerMW: 150, powerExponent: PEXP, inputSlots: 0, outputSlots: 0, iconKey: 'b-pressurizer' },
  { id: 'smelter', name: 'Smelter', kind: 'smelter', powerMW: 4, powerExponent: PEXP, inputSlots: 1, outputSlots: 1, iconKey: 'b-smelter' },
  { id: 'foundry', name: 'Foundry', kind: 'foundry', powerMW: 16, powerExponent: PEXP, inputSlots: 2, outputSlots: 1, iconKey: 'b-foundry' },
  { id: 'constructor', name: 'Constructor', kind: 'constructor', powerMW: 4, powerExponent: PEXP, inputSlots: 1, outputSlots: 1, iconKey: 'b-constructor' },
  { id: 'assembler', name: 'Assembler', kind: 'assembler', powerMW: 15, powerExponent: PEXP, inputSlots: 2, outputSlots: 1, iconKey: 'b-assembler' },
  { id: 'manufacturer', name: 'Manufacturer', kind: 'manufacturer', powerMW: 55, powerExponent: PEXP, inputSlots: 4, outputSlots: 1, iconKey: 'b-manufacturer' },
  { id: 'refinery', name: 'Refinery', kind: 'refinery', powerMW: 30, powerExponent: PEXP, inputSlots: 2, outputSlots: 2, iconKey: 'b-refinery' },
  { id: 'blender', name: 'Blender', kind: 'blender', powerMW: 75, powerExponent: PEXP, inputSlots: 4, outputSlots: 2, iconKey: 'b-blender' },
  { id: 'packager', name: 'Packager', kind: 'packager', powerMW: 10, powerExponent: PEXP, inputSlots: 2, outputSlots: 2, iconKey: 'b-packager' },
  { id: 'coal-generator', name: 'Coal Generator', kind: 'generator', powerMW: -75, powerExponent: 1, inputSlots: 1, outputSlots: 0, iconKey: 'b-gen-coal' },
  { id: 'fuel-generator', name: 'Fuel Generator', kind: 'generator', powerMW: -150, powerExponent: 1, inputSlots: 1, outputSlots: 0, iconKey: 'b-gen-fuel' },
  { id: 'resource-node', name: 'Resource Node', kind: 'resource', powerMW: 0, powerExponent: 1, inputSlots: 0, outputSlots: 1, iconKey: 'b-resource' },
  { id: 'storage', name: 'Storage Container', kind: 'storage', powerMW: 0, powerExponent: 1, inputSlots: 1, outputSlots: 1, iconKey: 'b-storage' },
  { id: 'output', name: 'Factory Output', kind: 'output', powerMW: 0, powerExponent: 1, inputSlots: 1, outputSlots: 0, iconKey: 'b-output' },
]

export const buildingsById: Record<string, Building> = Object.fromEntries(
  buildings.map((b) => [b.id, b]),
)

export function getBuilding(id: string): Building {
  const b = buildingsById[id]
  if (!b) throw new Error(`Unknown building: ${id}`)
  return b
}
