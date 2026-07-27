# SatisFactory

Industrial offline factory planner for **Satisfactory-style** production chains and conveyor belt orientation.

Built with **TanStack Start**, **React**, **TypeScript**, **Tailwind CSS**, **shadcn-style UI**, **Zustand**, **@xyflow/react**, and **Vitest**.

## Features

- **Production calculator** — recursive recipe expansion, multi-line plans, alternate recipes, clock 1–250%, machine counts (exact + rounded), power, belt/pipe bottlenecks, React Flow graph
- **Belt orientation editor** — grid layout, straights/corners/junctions/mergers/splitters/lifts, connectivity validation (green/red), multi-level lifts, export JSON/PNG
- **Browsers** — searchable items & recipes
- **Projects** — localStorage persistence, templates, import/export JSON
- **Dashboard** — recent projects, aggregates, quick actions

Game data is **sample / approximate** (not an official dump). Icons are original SVG placeholders — no copyrighted game assets.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm test      # unit tests (calc + belts)
pnpm build     # production build
```

## Architecture

```
src/
  domain/models     # typed domain models
  domain/data       # static items, recipes, buildings, templates
  domain/calc       # pure solvers (production, overclock, belt connectivity)
  state/            # Zustand + localStorage
  components/       # layout, production graph, belt grid, UI
  routes/           # TanStack file routes
```

Calculation logic is pure and independent of React — easy to unit test and swap persistence later via `ProjectRepository`.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd+Z | Undo |
| Ctrl/Cmd+Y | Redo |
| Ctrl/Cmd+S | Save |
| R | Rotate selected belt |
| 1–7 | Belt tools |

## License

Sample planning tool for personal use. Not affiliated with Coffee Stain Studios.
