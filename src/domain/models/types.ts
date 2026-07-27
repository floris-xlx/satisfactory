/** Typed domain models for SatisFactory — pure data, no UI. */

export type ItemId = string
export type RecipeId = string
export type BuildingId = string
export type BeltTierId = string
export type PipeTierId = string
export type ProjectId = string
export type LineId = string
export type LayoutId = string
export type NodeId = string

export type ItemForm = 'solid' | 'fluid' | 'gas'
export type ItemCategory =
  | 'raw'
  | 'ingot'
  | 'part'
  | 'component'
  | 'fuel'
  | 'fluid'
  | 'gas'
  | 'ammunition'
  | 'nuclear'
  | 'other'

export type MachineKind =
  | 'miner'
  | 'extractor'
  | 'smelter'
  | 'foundry'
  | 'constructor'
  | 'assembler'
  | 'manufacturer'
  | 'refinery'
  | 'blender'
  | 'packager'
  | 'resource'
  | 'storage'
  | 'output'
  | 'sink'
  | 'generator'

export type ResourcePurity = 'impure' | 'normal' | 'pure'
export type ResourceKind = 'solid' | 'fluid' | 'gas'

/** World resource node / well for mining & extraction planning. */
export interface ResourceNodeDef {
  id: string
  name: string
  itemId: ItemId
  kind: ResourceKind
  purity: ResourcePurity
  /** Approximate map region label (sample data). */
  region: string
  /** Items or m³ per min with Mk.1 miner / standard extractor at 100% clock. */
  rateMk1: number
  /** With Mk.2 miner (solids) or overclocked well (fluids) — sample rates. */
  rateMk2: number
  /** With Mk.3 miner where applicable. */
  rateMk3: number
  description?: string
}

export interface ResourceTypeSummary {
  itemId: ItemId
  nodeCount: number
  impure: number
  normal: number
  pure: number
  maxMk3Total: number
}

export interface Item {
  id: ItemId
  name: string
  category: ItemCategory
  form: ItemForm
  stackSize?: number
  iconKey: string
  description?: string
}

export interface Building {
  id: BuildingId
  name: string
  kind: MachineKind
  powerMW: number
  /** Power scales as clockFactor^powerExponent (Satisfactory-style). */
  powerExponent: number
  inputSlots: number
  outputSlots: number
  iconKey: string
}

export interface RecipeIO {
  itemId: ItemId
  amount: number
}

export interface Recipe {
  id: RecipeId
  name: string
  buildingId: BuildingId
  isAlternate: boolean
  durationSec: number
  inputs: RecipeIO[]
  outputs: RecipeIO[]
}

export interface BeltTier {
  id: BeltTierId
  name: string
  maxItemsPerMin: number
  mark: number
}

export interface PipeTier {
  id: PipeTierId
  name: string
  maxM3PerMin: number
  mark: number
}

export type BeltCellType =
  | 'empty'
  | 'straight'
  | 'corner'
  | 'junction'
  | 'merger'
  | 'splitter'
  | 'lift'

export type Rotation = 0 | 90 | 180 | 270

export type Cardinal = 'N' | 'E' | 'S' | 'W'

export interface BeltCell {
  type: BeltCellType
  rotation: Rotation
  beltTierId: BeltTierId
  /** Optional annotated throughput for capacity warnings. */
  ratePerMin?: number
}

/** Cell key: "z:x:y" */
export type CellKey = string

export interface BeltLayout {
  id: LayoutId
  name: string
  width: number
  height: number
  levels: number
  cells: Record<CellKey, BeltCell>
  view: { zoom: number; panX: number; panY: number }
  activeLevel: number
}

export interface ProductionTarget {
  id: string
  itemId: ItemId
  ratePerMin: number
  recipeOverrideId?: RecipeId
  clockPercent: number
}

export interface ProductionLine {
  id: LineId
  name: string
  targets: ProductionTarget[]
  /** User-pinned React Flow positions keyed by solution node id */
  nodePositions: Record<string, { x: number; y: number }>
  /** Per-solution-node clock overrides (item/recipe key) */
  clockOverrides: Record<string, number>
  /** Per-item recipe overrides for intermediates */
  recipeOverrides: Record<ItemId, RecipeId>
}

export interface FactoryProject {
  id: ProjectId
  name: string
  createdAt: string
  updatedAt: string
  lines: ProductionLine[]
  beltLayouts: BeltLayout[]
  lastSolutionSummary?: ProductionSummarySnapshot
}

export interface ProductionSummarySnapshot {
  totalMachines: number
  totalPowerMW: number
  outputRates: { itemId: ItemId; ratePerMin: number }[]
  bottlenecks: string[]
  rawInputs: { itemId: ItemId; ratePerMin: number }[]
}

export interface AppSettings {
  defaultClockPercent: number
  powerExponent: number
  onboardingComplete: boolean
  preferredBeltTierId: BeltTierId
}

export interface PersistedState {
  version: 1
  projects: FactoryProject[]
  activeProjectId: ProjectId | null
  settings: AppSettings
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultClockPercent: 100,
  powerExponent: 1.321928,
  onboardingComplete: false,
  preferredBeltTierId: 'belt-mk2',
}

export const DEFAULT_CLOCK_MIN = 1
export const DEFAULT_CLOCK_MAX = 250
