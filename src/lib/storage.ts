import type { FactoryProject, PersistedState, AppSettings } from '#/domain/models/types'
import { DEFAULT_SETTINGS } from '#/domain/models/types'
import {
  PROJECT_TEMPLATES,
  createEmptyProject,
} from '#/domain/data/templates'

export const STORAGE_KEY = 'satisfactory:v1'

export interface ProjectRepository {
  load(): PersistedState
  save(state: PersistedState): void
  clear(): void
}

function seedState(): PersistedState {
  const projects = PROJECT_TEMPLATES.map((t) => t.create())
  return {
    version: 1,
    projects,
    activeProjectId: projects[0]?.id ?? null,
    settings: { ...DEFAULT_SETTINGS },
  }
}

export class LocalStorageProjectRepository implements ProjectRepository {
  load(): PersistedState {
    if (typeof window === 'undefined') return seedState()
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const seeded = seedState()
        this.save(seeded)
        return seeded
      }
      const parsed = JSON.parse(raw) as PersistedState
      if (parsed.version !== 1 || !Array.isArray(parsed.projects)) {
        const seeded = seedState()
        this.save(seeded)
        return seeded
      }
      return {
        ...parsed,
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      }
    } catch {
      return seedState()
    }
  }

  save(state: PersistedState): void {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  clear(): void {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export const projectRepo = new LocalStorageProjectRepository()

export function touchProject(project: FactoryProject): FactoryProject {
  return { ...project, updatedAt: new Date().toISOString() }
}

export function ensureProject(state: PersistedState): PersistedState {
  if (state.projects.length === 0) {
    const p = createEmptyProject()
    return { ...state, projects: [p], activeProjectId: p.id }
  }
  if (!state.activeProjectId || !state.projects.some((p) => p.id === state.activeProjectId)) {
    return { ...state, activeProjectId: state.projects[0]!.id }
  }
  return state
}

export type { AppSettings }
