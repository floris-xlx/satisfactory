import { create } from 'zustand'
import type {
  AppSettings,
  BeltCell,
  BeltCellType,
  BeltLayout,
  FactoryProject,
  LineId,
  ProductionLine,
  ProductionTarget,
  RecipeId,
  ItemId,
  Rotation,
} from '#/domain/models/types'
import { DEFAULT_SETTINGS } from '#/domain/models/types'
import {
  ensureProject,
  projectRepo,
  touchProject,
} from '#/lib/storage'
import { createEmptyProject, PROJECT_TEMPLATES } from '#/domain/data/templates'
import { emptyLayout, rotateCell } from '#/domain/calc/belt-connectivity'
import { uid } from '#/lib/utils'
import { solveProduction, summarizeSolution } from '#/domain/calc/production'

interface HistoryEntry {
  projects: FactoryProject[]
  activeProjectId: string | null
}

interface AppState {
  hydrated: boolean
  projects: FactoryProject[]
  activeProjectId: string | null
  settings: AppSettings
  selectedNodeId: string | null
  selectedLineId: LineId | null
  selectedBeltKey: string | null
  beltTool: BeltCellType | 'select' | 'erase'
  beltTierId: string
  past: HistoryEntry[]
  future: HistoryEntry[]
  sidebarOpen: boolean

  hydrate: () => void
  persist: () => void
  pushHistory: () => void
  undo: () => void
  redo: () => void

  setActiveProject: (id: string) => void
  createProject: (name?: string) => void
  createFromTemplate: (templateId: string) => void
  renameProject: (id: string, name: string) => void
  deleteProject: (id: string) => void
  importProject: (project: FactoryProject) => void

  updateSettings: (partial: Partial<AppSettings>) => void
  completeOnboarding: () => void
  clearAllData: () => void

  getActiveProject: () => FactoryProject | null
  updateActiveProject: (fn: (p: FactoryProject) => FactoryProject) => void

  addLine: (name?: string) => void
  removeLine: (lineId: LineId) => void
  renameLine: (lineId: LineId, name: string) => void
  setSelectedLine: (lineId: LineId | null) => void
  addTarget: (lineId: LineId, target: Omit<ProductionTarget, 'id'>) => void
  updateTarget: (lineId: LineId, targetId: string, partial: Partial<ProductionTarget>) => void
  removeTarget: (lineId: LineId, targetId: string) => void
  setRecipeOverride: (lineId: LineId, itemId: ItemId, recipeId: RecipeId | null) => void
  setClockOverride: (lineId: LineId, nodeKey: string, clock: number) => void
  setNodePosition: (lineId: LineId, nodeId: string, pos: { x: number; y: number }) => void
  setSelectedNode: (id: string | null) => void
  refreshSolutionSummary: () => void

  // Belt
  getActiveLayout: () => BeltLayout | null
  addBeltLayout: (name?: string) => void
  setBeltTool: (tool: AppState['beltTool']) => void
  setBeltTier: (tierId: string) => void
  setActiveBeltLevel: (level: number) => void
  placeBeltCell: (key: string, cell?: BeltCell) => void
  rotateBeltCell: (key: string) => void
  eraseBeltCell: (key: string) => void
  clearBeltGrid: () => void
  setSelectedBeltKey: (key: string | null) => void
  setBeltView: (view: Partial<BeltLayout['view']>) => void
  setBeltCellRate: (key: string, rate: number | undefined) => void
  setSidebarOpen: (open: boolean) => void
}

function snapshot(state: Pick<AppState, 'projects' | 'activeProjectId'>): HistoryEntry {
  return {
    projects: structuredClone(state.projects),
    activeProjectId: state.activeProjectId,
  }
}

function mapProject(
  projects: FactoryProject[],
  id: string | null,
  fn: (p: FactoryProject) => FactoryProject,
): FactoryProject[] {
  if (!id) return projects
  return projects.map((p) => (p.id === id ? touchProject(fn(p)) : p))
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  projects: [],
  activeProjectId: null,
  settings: { ...DEFAULT_SETTINGS },
  selectedNodeId: null,
  selectedLineId: null,
  selectedBeltKey: null,
  beltTool: 'straight',
  beltTierId: 'belt-mk2',
  past: [],
  future: [],
  sidebarOpen: true,

  hydrate: () => {
    const raw = ensureProject(projectRepo.load())
    const active = raw.projects.find((p) => p.id === raw.activeProjectId)
    set({
      hydrated: true,
      projects: raw.projects,
      activeProjectId: raw.activeProjectId,
      settings: raw.settings,
      selectedLineId: active?.lines[0]?.id ?? null,
      beltTierId: raw.settings.preferredBeltTierId,
    })
  },

  persist: () => {
    const { projects, activeProjectId, settings } = get()
    projectRepo.save({ version: 1, projects, activeProjectId, settings })
  },

  pushHistory: () => {
    const entry = snapshot(get())
    set((s) => ({
      past: [...s.past.slice(-49), entry],
      future: [],
    }))
  },

  undo: () => {
    const { past, projects, activeProjectId, future } = get()
    if (past.length === 0) return
    const prev = past[past.length - 1]!
    set({
      past: past.slice(0, -1),
      future: [snapshot({ projects, activeProjectId }), ...future].slice(0, 50),
      projects: prev.projects,
      activeProjectId: prev.activeProjectId,
    })
    get().persist()
  },

  redo: () => {
    const { past, projects, activeProjectId, future } = get()
    if (future.length === 0) return
    const next = future[0]!
    set({
      future: future.slice(1),
      past: [...past, snapshot({ projects, activeProjectId })].slice(-50),
      projects: next.projects,
      activeProjectId: next.activeProjectId,
    })
    get().persist()
  },

  setActiveProject: (id) => {
    const p = get().projects.find((x) => x.id === id)
    set({
      activeProjectId: id,
      selectedLineId: p?.lines[0]?.id ?? null,
      selectedNodeId: null,
      selectedBeltKey: null,
    })
    get().persist()
  },

  createProject: (name) => {
    get().pushHistory()
    const p = createEmptyProject(name)
    set((s) => ({
      projects: [p, ...s.projects],
      activeProjectId: p.id,
      selectedLineId: p.lines[0]?.id ?? null,
    }))
    get().persist()
  },

  createFromTemplate: (templateId) => {
    const tpl = PROJECT_TEMPLATES.find((t) => t.id === templateId)
    if (!tpl) return
    get().pushHistory()
    const p = tpl.create()
    set((s) => ({
      projects: [p, ...s.projects],
      activeProjectId: p.id,
      selectedLineId: p.lines[0]?.id ?? null,
    }))
    get().persist()
  },

  renameProject: (id, name) => {
    get().pushHistory()
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? touchProject({ ...p, name }) : p,
      ),
    }))
    get().persist()
  },

  deleteProject: (id) => {
    get().pushHistory()
    set((s) => {
      const projects = s.projects.filter((p) => p.id !== id)
      const activeProjectId =
        s.activeProjectId === id ? (projects[0]?.id ?? null) : s.activeProjectId
      const active = projects.find((p) => p.id === activeProjectId)
      return {
        projects,
        activeProjectId,
        selectedLineId: active?.lines[0]?.id ?? null,
      }
    })
    get().persist()
  },

  importProject: (project) => {
    get().pushHistory()
    const p = { ...project, id: uid(), updatedAt: new Date().toISOString() }
    set((s) => ({
      projects: [p, ...s.projects],
      activeProjectId: p.id,
      selectedLineId: p.lines[0]?.id ?? null,
    }))
    get().persist()
  },

  updateSettings: (partial) => {
    set((s) => ({ settings: { ...s.settings, ...partial } }))
    get().persist()
  },

  completeOnboarding: () => {
    set((s) => ({ settings: { ...s.settings, onboardingComplete: true } }))
    get().persist()
  },

  clearAllData: () => {
    projectRepo.clear()
    const seeded = ensureProject(projectRepo.load())
    set({
      projects: seeded.projects,
      activeProjectId: seeded.activeProjectId,
      settings: { ...DEFAULT_SETTINGS, onboardingComplete: true },
      past: [],
      future: [],
    })
    get().persist()
  },

  getActiveProject: () => {
    const { projects, activeProjectId } = get()
    return projects.find((p) => p.id === activeProjectId) ?? null
  },

  updateActiveProject: (fn) => {
    const { activeProjectId } = get()
    set((s) => ({
      projects: mapProject(s.projects, activeProjectId, fn),
    }))
    get().persist()
  },

  addLine: (name) => {
    get().pushHistory()
    const line: ProductionLine = {
      id: uid(),
      name: name ?? `Line ${String.fromCharCode(65 + (get().getActiveProject()?.lines.length ?? 0))}`,
      targets: [],
      nodePositions: {},
      clockOverrides: {},
      recipeOverrides: {},
    }
    get().updateActiveProject((p) => ({ ...p, lines: [...p.lines, line] }))
    set({ selectedLineId: line.id })
  },

  removeLine: (lineId) => {
    get().pushHistory()
    get().updateActiveProject((p) => ({
      ...p,
      lines: p.lines.length > 1 ? p.lines.filter((l) => l.id !== lineId) : p.lines,
    }))
    const p = get().getActiveProject()
    set({ selectedLineId: p?.lines[0]?.id ?? null })
  },

  renameLine: (lineId, name) => {
    get().updateActiveProject((p) => ({
      ...p,
      lines: p.lines.map((l) => (l.id === lineId ? { ...l, name } : l)),
    }))
  },

  setSelectedLine: (lineId) => set({ selectedLineId: lineId, selectedNodeId: null }),

  addTarget: (lineId, target) => {
    get().pushHistory()
    get().updateActiveProject((p) => ({
      ...p,
      lines: p.lines.map((l) =>
        l.id === lineId
          ? { ...l, targets: [...l.targets, { ...target, id: uid() }] }
          : l,
      ),
    }))
    get().refreshSolutionSummary()
  },

  updateTarget: (lineId, targetId, partial) => {
    get().pushHistory()
    get().updateActiveProject((p) => ({
      ...p,
      lines: p.lines.map((l) =>
        l.id === lineId
          ? {
              ...l,
              targets: l.targets.map((t) =>
                t.id === targetId ? { ...t, ...partial } : t,
              ),
            }
          : l,
      ),
    }))
    get().refreshSolutionSummary()
  },

  removeTarget: (lineId, targetId) => {
    get().pushHistory()
    get().updateActiveProject((p) => ({
      ...p,
      lines: p.lines.map((l) =>
        l.id === lineId
          ? { ...l, targets: l.targets.filter((t) => t.id !== targetId) }
          : l,
      ),
    }))
    get().refreshSolutionSummary()
  },

  setRecipeOverride: (lineId, itemId, recipeId) => {
    get().pushHistory()
    get().updateActiveProject((p) => ({
      ...p,
      lines: p.lines.map((l) => {
        if (l.id !== lineId) return l
        const recipeOverrides = { ...l.recipeOverrides }
        if (!recipeId) delete recipeOverrides[itemId]
        else recipeOverrides[itemId] = recipeId
        return { ...l, recipeOverrides }
      }),
    }))
    get().refreshSolutionSummary()
  },

  setClockOverride: (lineId, nodeKey, clock) => {
    get().pushHistory()
    get().updateActiveProject((p) => ({
      ...p,
      lines: p.lines.map((l) =>
        l.id === lineId
          ? {
              ...l,
              clockOverrides: { ...l.clockOverrides, [nodeKey]: clock },
              targets: l.targets.map((t) => {
                // also update target clock if matches target item
                const itemFromKey = nodeKey.split('::')[0]
                return t.itemId === itemFromKey ? { ...t, clockPercent: clock } : t
              }),
            }
          : l,
      ),
    }))
    get().refreshSolutionSummary()
  },

  setNodePosition: (lineId, nodeId, pos) => {
    get().updateActiveProject((p) => ({
      ...p,
      lines: p.lines.map((l) =>
        l.id === lineId
          ? { ...l, nodePositions: { ...l.nodePositions, [nodeId]: pos } }
          : l,
      ),
    }))
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  refreshSolutionSummary: () => {
    const p = get().getActiveProject()
    if (!p) return
    const { settings } = get()
    const allTargets = p.lines.flatMap((l) => l.targets)
    const sol = solveProduction(allTargets, {
      defaultClockPercent: settings.defaultClockPercent,
      powerExponent: settings.powerExponent,
      recipeOverrides: Object.assign({}, ...p.lines.map((l) => l.recipeOverrides)),
      clockOverrides: Object.assign({}, ...p.lines.map((l) => l.clockOverrides)),
    })
    get().updateActiveProject((proj) => ({
      ...proj,
      lastSolutionSummary: summarizeSolution(sol),
    }))
  },

  getActiveLayout: () => {
    const p = get().getActiveProject()
    return p?.beltLayouts[0] ?? null
  },

  addBeltLayout: (name) => {
    get().pushHistory()
    get().updateActiveProject((p) => ({
      ...p,
      beltLayouts: [...p.beltLayouts, emptyLayout(uid(), name ?? 'New layout')],
    }))
  },

  setBeltTool: (tool) => set({ beltTool: tool }),
  setBeltTier: (tierId) => set({ beltTierId: tierId }),

  setActiveBeltLevel: (level) => {
    get().updateActiveProject((p) => {
      const layouts = [...p.beltLayouts]
      if (!layouts[0]) return p
      layouts[0] = { ...layouts[0], activeLevel: level }
      return { ...p, beltLayouts: layouts }
    })
  },

  placeBeltCell: (key, cell) => {
    get().pushHistory()
    const { beltTool, beltTierId } = get()
    get().updateActiveProject((p) => {
      const layouts = [...p.beltLayouts]
      const layout = layouts[0]
      if (!layout) return p
      const nextCells = { ...layout.cells }
      if (beltTool === 'erase' || beltTool === 'select') {
        if (beltTool === 'erase') delete nextCells[key]
      } else {
        nextCells[key] = cell ?? {
          type: beltTool,
          rotation: 0 as Rotation,
          beltTierId,
        }
      }
      layouts[0] = { ...layout, cells: nextCells }
      return { ...p, beltLayouts: layouts }
    })
  },

  rotateBeltCell: (key) => {
    get().pushHistory()
    get().updateActiveProject((p) => {
      const layouts = [...p.beltLayouts]
      const layout = layouts[0]
      if (!layout?.cells[key]) return p
      const c = layout.cells[key]!
      layouts[0] = {
        ...layout,
        cells: {
          ...layout.cells,
          [key]: { ...c, rotation: rotateCell(c.rotation) },
        },
      }
      return { ...p, beltLayouts: layouts }
    })
  },

  eraseBeltCell: (key) => {
    get().pushHistory()
    get().updateActiveProject((p) => {
      const layouts = [...p.beltLayouts]
      const layout = layouts[0]
      if (!layout) return p
      const next = { ...layout.cells }
      delete next[key]
      layouts[0] = { ...layout, cells: next }
      return { ...p, beltLayouts: layouts }
    })
  },

  clearBeltGrid: () => {
    get().pushHistory()
    get().updateActiveProject((p) => {
      const layouts = [...p.beltLayouts]
      if (!layouts[0]) return p
      layouts[0] = { ...layouts[0], cells: {} }
      return { ...p, beltLayouts: layouts }
    })
  },

  setSelectedBeltKey: (key) => set({ selectedBeltKey: key }),

  setBeltView: (view) => {
    get().updateActiveProject((p) => {
      const layouts = [...p.beltLayouts]
      if (!layouts[0]) return p
      layouts[0] = { ...layouts[0], view: { ...layouts[0].view, ...view } }
      return { ...p, beltLayouts: layouts }
    })
  },

  setBeltCellRate: (key, rate) => {
    get().updateActiveProject((p) => {
      const layouts = [...p.beltLayouts]
      const layout = layouts[0]
      if (!layout?.cells[key]) return p
      const c = { ...layout.cells[key]! }
      if (rate == null) delete c.ratePerMin
      else c.ratePerMin = rate
      layouts[0] = { ...layout, cells: { ...layout.cells, [key]: c } }
      return { ...p, beltLayouts: layouts }
    })
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
