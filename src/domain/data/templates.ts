import type { FactoryProject } from '#/domain/models/types'
import { emptyLayout } from '#/domain/calc/belt-connectivity'

function id(): string {
  return crypto.randomUUID()
}

export function createEmptyProject(name = 'New Factory'): FactoryProject {
  const now = new Date().toISOString()
  return {
    id: id(),
    name,
    createdAt: now,
    updatedAt: now,
    lines: [
      {
        id: id(),
        name: 'Line A',
        targets: [],
        nodePositions: {},
        clockOverrides: {},
        recipeOverrides: {},
      },
    ],
    beltLayouts: [emptyLayout(id(), 'Main floor')],
  }
}

export function templateIronPlates(): FactoryProject {
  const p = createEmptyProject('Iron Plates Starter')
  p.lines[0]!.targets = [
    {
      id: id(),
      itemId: 'iron-plate',
      ratePerMin: 60,
      clockPercent: 100,
    },
  ]
  return p
}

export function templateReinforcedPlates(): FactoryProject {
  const p = createEmptyProject('Reinforced Iron Plates')
  p.lines[0]!.targets = [
    {
      id: id(),
      itemId: 'reinforced-iron-plate',
      ratePerMin: 10,
      clockPercent: 100,
    },
  ]
  p.lines.push({
    id: id(),
    name: 'Rotors',
    targets: [
      {
        id: id(),
        itemId: 'rotor',
        ratePerMin: 5,
        clockPercent: 100,
      },
    ],
    nodePositions: {},
    clockOverrides: {},
    recipeOverrides: {},
  })
  return p
}

export function templateFuelLoop(): FactoryProject {
  const p = createEmptyProject('Fuel Loop Demo')
  p.lines[0]!.targets = [
    {
      id: id(),
      itemId: 'packaged-fuel',
      ratePerMin: 20,
      clockPercent: 100,
    },
  ]
  return p
}

export function templateBeltPractice(): FactoryProject {
  const p = createEmptyProject('Belt Spaghetti Practice')
  p.lines[0]!.targets = [
    {
      id: id(),
      itemId: 'iron-rod',
      ratePerMin: 30,
      clockPercent: 100,
    },
  ]
  // pre-place a small belt demo
  const layout = p.beltLayouts[0]!
  layout.cells['0:2:2'] = { type: 'straight', rotation: 0, beltTierId: 'belt-mk2' }
  layout.cells['0:3:2'] = { type: 'straight', rotation: 0, beltTierId: 'belt-mk2' }
  layout.cells['0:4:2'] = { type: 'corner', rotation: 0, beltTierId: 'belt-mk2' }
  layout.cells['0:4:1'] = { type: 'straight', rotation: 90, beltTierId: 'belt-mk2' }
  layout.cells['0:5:2'] = { type: 'splitter', rotation: 0, beltTierId: 'belt-mk2' }
  return p
}

export function templateAluminum(): FactoryProject {
  const p = createEmptyProject('Aluminum Starter')
  p.lines[0]!.targets = [
    {
      id: id(),
      itemId: 'alclad-sheet',
      ratePerMin: 30,
      clockPercent: 100,
    },
  ]
  return p
}

export function templateBatteries(): FactoryProject {
  const p = createEmptyProject('Battery Line')
  p.lines[0]!.targets = [
    {
      id: id(),
      itemId: 'battery',
      ratePerMin: 10,
      clockPercent: 100,
    },
  ]
  return p
}

export const PROJECT_TEMPLATES = [
  {
    id: 'tpl-iron-plates',
    name: 'Iron Plates Starter',
    description: '60 iron plates/min from ore through smelter and constructor.',
    create: templateIronPlates,
  },
  {
    id: 'tpl-rip',
    name: 'Reinforced Iron Plates',
    description: 'Multi-line plan: RIP + rotors with shared iron intermediates.',
    create: templateReinforcedPlates,
  },
  {
    id: 'tpl-fuel',
    name: 'Fuel Loop Demo',
    description: 'Oil → fuel → packaged fuel chain with pipes and packager.',
    create: templateFuelLoop,
  },
  {
    id: 'tpl-aluminum',
    name: 'Aluminum Starter',
    description: 'Bauxite → alumina → scrap → alclad sheets with water loop.',
    create: templateAluminum,
  },
  {
    id: 'tpl-battery',
    name: 'Battery Line',
    description: 'Sulfur + bauxite + aluminum casings into batteries.',
    create: templateBatteries,
  },
  {
    id: 'tpl-belt',
    name: 'Belt Spaghetti Practice',
    description: 'Starter belt path with corner and splitter on the grid.',
    create: templateBeltPractice,
  },
] as const
