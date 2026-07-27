import { useMemo, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import {
  cellKey,
  portsForCell,
  validateBeltConnectivity,
} from '#/domain/calc/belt-connectivity'
import type { BeltCellType } from '#/domain/models/types'
import { beltTiers } from '#/domain/data/belts-pipes'
import { useAppStore } from '#/state/app-store'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Badge } from '#/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { cn, formatRate } from '#/lib/utils'
import {
  ArrowUpDown,
  CornerDownRight,
  Eraser,
  Grid3x3,
  Merge,
  MousePointer2,
  RotateCw,
  Split,
  Trash2,
  Download,
  Layers,
} from 'lucide-react'

const CELL = 36

const TOOLS: { id: BeltCellType | 'select' | 'erase'; label: string; icon: typeof Grid3x3 }[] = [
  { id: 'select', label: 'Select', icon: MousePointer2 },
  { id: 'straight', label: 'Straight', icon: ArrowUpDown },
  { id: 'corner', label: 'Corner', icon: CornerDownRight },
  { id: 'junction', label: 'Junction', icon: Grid3x3 },
  { id: 'merger', label: 'Merger', icon: Merge },
  { id: 'splitter', label: 'Splitter', icon: Split },
  { id: 'lift', label: 'Lift', icon: Layers },
  { id: 'erase', label: 'Erase', icon: Eraser },
]

export function BeltCanvas() {
  const layout = useAppStore((s) => s.getActiveLayout())
  const beltTool = useAppStore((s) => s.beltTool)
  const setBeltTool = useAppStore((s) => s.setBeltTool)
  const beltTierId = useAppStore((s) => s.beltTierId)
  const setBeltTier = useAppStore((s) => s.setBeltTier)
  const placeBeltCell = useAppStore((s) => s.placeBeltCell)
  const rotateBeltCell = useAppStore((s) => s.rotateBeltCell)
  const clearBeltGrid = useAppStore((s) => s.clearBeltGrid)
  const selectedBeltKey = useAppStore((s) => s.selectedBeltKey)
  const setSelectedBeltKey = useAppStore((s) => s.setSelectedBeltKey)
  const setActiveBeltLevel = useAppStore((s) => s.setActiveBeltLevel)
  const setBeltCellRate = useAppStore((s) => s.setBeltCellRate)
  const svgRef = useRef<SVGSVGElement>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [paint, setPaint] = useState(false)

  const report = useMemo(
    () => (layout ? validateBeltConnectivity(layout) : null),
    [layout],
  )

  const linkMap = useMemo(() => {
    const m = new Map<string, boolean>()
    if (!report) return m
    for (const l of report.links) {
      m.set(`${l.fromKey}->${l.toKey}`, l.valid)
    }
    return m
  }, [report])

  if (!layout) {
    return (
      <div className="p-8 text-center text-sm text-[var(--fg-2)]">
        No belt layout on this project.
      </div>
    )
  }

  const z = layout.activeLevel
  const width = layout.width * CELL
  const height = layout.height * CELL

  const onCell = (x: number, y: number, mode: 'click' | 'drag') => {
    const key = cellKey(z, x, y)
    if (beltTool === 'select') {
      setSelectedBeltKey(key)
      return
    }
    if (beltTool === 'erase') {
      placeBeltCell(key)
      return
    }
    if (mode === 'drag') {
      // paint continuous segments while dragging
    }
    placeBeltCell(key, {
      type: beltTool,
      rotation: 0,
      beltTierId,
    })
    setSelectedBeltKey(key)
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(layout, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${layout.name.replace(/\s+/g, '-').toLowerCase()}-belt.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPng = async () => {
    if (!svgRef.current) return
    const dataUrl = await toPng(svgRef.current as unknown as HTMLElement, {
      backgroundColor: '#0f1115',
    })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${layout.name.replace(/\s+/g, '-').toLowerCase()}-belt.png`
    a.click()
  }

  const selected = selectedBeltKey ? layout.cells[selectedBeltKey] : null
  const selectedWarning = report?.throughputWarnings.find(
    (w) => w.key === selectedBeltKey,
  )

  return (
    <div className="flex h-full min-h-[480px] flex-col lg:flex-row">
      {/* Tools */}
      <div className="w-full border-b border-[var(--border)] p-3 lg:w-56 lg:border-b-0 lg:border-r">
        <Label>Tools</Label>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {TOOLS.map((t) => {
            const Icon = t.icon
            return (
              <Button
                key={t.id}
                size="sm"
                variant={beltTool === t.id ? 'default' : 'secondary'}
                onClick={() => setBeltTool(t.id)}
                className="justify-start"
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </Button>
            )
          })}
        </div>

        <Label className="mt-4 block">Belt tier</Label>
        <select
          className="mt-1.5 flex h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-1)] px-2 text-sm"
          value={beltTierId}
          onChange={(e) => setBeltTier(e.target.value)}
        >
          {beltTiers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.maxItemsPerMin}/m)
            </option>
          ))}
        </select>

        <Label className="mt-4 block">Level</Label>
        <div className="mt-1.5 flex gap-1">
          {Array.from({ length: layout.levels }, (_, i) => (
            <Button
              key={i}
              size="sm"
              variant={z === i ? 'default' : 'secondary'}
              onClick={() => setActiveBeltLevel(i)}
            >
              Z{i}
            </Button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => selectedBeltKey && rotateBeltCell(selectedBeltKey)}
          >
            <RotateCw className="h-3.5 w-3.5" /> Rotate (R)
          </Button>
          <Button size="sm" variant="secondary" onClick={exportJson}>
            <Download className="h-3.5 w-3.5" /> Export JSON
          </Button>
          <Button size="sm" variant="secondary" onClick={() => void exportPng()}>
            <Download className="h-3.5 w-3.5" /> Export PNG
          </Button>
          <Button size="sm" variant="danger" onClick={() => setConfirmClear(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Clear grid
          </Button>
        </div>

        {report ? (
          <div className="mt-4 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--success)]">Valid links</span>
              <span className="font-mono font-bold">{report.validCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--danger)]">Invalid</span>
              <span className="font-mono font-bold">{report.invalidCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--fg-2)]">Over capacity</span>
              <span className="font-mono font-bold">
                {report.throughputWarnings.filter((w) => w.exceeds).length}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Grid */}
      <div className="relative min-h-[400px] flex-1 overflow-auto bg-[var(--bg-0)] p-4">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="mx-auto block rounded-lg border border-[var(--border)] bg-[#12151a] shadow-inner"
          onMouseLeave={() => setPaint(false)}
          role="application"
          aria-label="Belt layout grid"
        >
          {/* grid lines */}
          {Array.from({ length: layout.width + 1 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={i * CELL}
              y1={0}
              x2={i * CELL}
              y2={height}
              stroke="#1e2430"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: layout.height + 1 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={i * CELL}
              x2={width}
              y2={i * CELL}
              stroke="#1e2430"
              strokeWidth={1}
            />
          ))}

          {/* cells hit areas + render */}
          {Array.from({ length: layout.height }, (_, y) =>
            Array.from({ length: layout.width }, (_, x) => {
              const key = cellKey(z, x, y)
              const cell = layout.cells[key]
              return (
                <g key={key}>
                  <rect
                    x={x * CELL}
                    y={y * CELL}
                    width={CELL}
                    height={CELL}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setPaint(true)
                      onCell(x, y, 'click')
                    }}
                    onMouseEnter={() => {
                      if (paint) onCell(x, y, 'drag')
                    }}
                    onMouseUp={() => setPaint(false)}
                    onDoubleClick={() => rotateBeltCell(key)}
                  />
                  {cell ? (
                    <BeltGlyph
                      x={x * CELL}
                      y={y * CELL}
                      type={cell.type}
                      rotation={cell.rotation}
                      selected={selectedBeltKey === key}
                      overCap={
                        cell.ratePerMin != null &&
                        (report?.throughputWarnings.find((w) => w.key === key)
                          ?.exceeds ??
                          false)
                      }
                    />
                  ) : null}
                </g>
              )
            }),
          )}

          {/* connection overlays */}
          {report?.links
            .filter((l) => l.fromKey.startsWith(`${z}:`))
            .map((l) => {
              const [fz, fx, fy] = l.fromKey.split(':').map(Number)
              const [tz, tx, ty] = l.toKey.split(':').map(Number)
              if (fz !== z && tz !== z) return null
              const x1 = (fx! + 0.5) * CELL
              const y1 = (fy! + 0.5) * CELL
              const x2 = (tx! + 0.5) * CELL
              const y2 = (ty! + 0.5) * CELL
              return (
                <line
                  key={`${l.fromKey}-${l.toKey}-${l.dir}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={l.valid ? '#22c55e' : '#ef4444'}
                  strokeWidth={2}
                  strokeOpacity={0.65}
                  pointerEvents="none"
                />
              )
            })}
        </svg>
        <p className="mt-2 text-center text-[11px] text-[var(--fg-2)]">
          Click/drag to paint · double-click rotate · green = valid link · red = invalid
        </p>
      </div>

      {/* Inspector */}
      <div className="w-full border-t border-[var(--border)] p-4 lg:w-72 lg:border-l lg:border-t-0">
        <h3 className="text-sm font-bold">Segment inspector</h3>
        {!selected || !selectedBeltKey ? (
          <p className="mt-2 text-xs text-[var(--fg-2)]">
            Select a belt cell to inspect ports, tier, and throughput.
          </p>
        ) : (
          <div className="mt-3 space-y-3 text-xs">
            <div className="flex flex-wrap gap-1">
              <Badge>{selected.type}</Badge>
              <Badge variant="steel">{selected.rotation}°</Badge>
              <Badge variant="muted">{selected.beltTierId}</Badge>
            </div>
            <div>
              <Label>Annotated rate / min</Label>
              <Input
                type="number"
                className="mt-1"
                value={selected.ratePerMin ?? ''}
                placeholder="optional"
                onChange={(e) =>
                  setBeltCellRate(
                    selectedBeltKey,
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
              />
              {selectedWarning ? (
                <p
                  className={cn(
                    'mt-1 font-mono',
                    selectedWarning.exceeds
                      ? 'text-[var(--danger)]'
                      : 'text-[var(--success)]',
                  )}
                >
                  {formatRate(selectedWarning.ratePerMin)} /{' '}
                  {selectedWarning.capacity} max
                  {selectedWarning.exceeds ? ' — OVER CAPACITY' : ''}
                </p>
              ) : null}
            </div>
            <div>
              <Label>Ports</Label>
              <pre className="mt-1 rounded bg-[var(--bg-2)] p-2 font-mono text-[10px]">
                {JSON.stringify(
                  portsForCell(selected.type, selected.rotation),
                  null,
                  2,
                )}
              </pre>
            </div>
            <Button size="sm" onClick={() => rotateBeltCell(selectedBeltKey)}>
              <RotateCw className="h-3.5 w-3.5" /> Rotate 90°
            </Button>
          </div>
        )}
        {/* silence unused */}
        <span className="hidden">{linkMap.size}</span>
      </div>

      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear belt grid?</DialogTitle>
            <DialogDescription>
              This removes every belt segment on all levels. Undo is available after.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="secondary" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearBeltGrid()
                setConfirmClear(false)
              }}
            >
              Clear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BeltGlyph({
  x,
  y,
  type,
  rotation,
  selected,
  overCap,
}: {
  x: number
  y: number
  type: BeltCellType
  rotation: number
  selected: boolean
  overCap: boolean
}) {
  const cx = x + CELL / 2
  const cy = y + CELL / 2
  const color = overCap ? '#ef4444' : selected ? '#f59e0b' : '#3b82a0'

  return (
    <g transform={`rotate(${rotation} ${cx} ${cy})`}>
      <rect
        x={x + 3}
        y={y + 3}
        width={CELL - 6}
        height={CELL - 6}
        rx={4}
        fill="#1a2030"
        stroke={color}
        strokeWidth={selected ? 2 : 1.25}
      />
      {type === 'straight' || type === 'lift' ? (
        <>
          <line
            x1={x + 6}
            y1={cy}
            x2={x + CELL - 6}
            y2={cy}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            className="belt-flow"
          />
          <polygon
            points={`${x + CELL - 10},${cy - 4} ${x + CELL - 4},${cy} ${x + CELL - 10},${cy + 4}`}
            fill={color}
          />
        </>
      ) : null}
      {type === 'corner' ? (
        <path
          d={`M ${x + 6} ${cy} L ${cx} ${cy} L ${cx} ${y + 6}`}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          className="belt-flow"
        />
      ) : null}
      {type === 'junction' ? (
        <>
          <line x1={x + 6} y1={cy} x2={x + CELL - 6} y2={cy} stroke={color} strokeWidth={2.5} />
          <line x1={cx} y1={y + 6} x2={cx} y2={y + CELL - 6} stroke={color} strokeWidth={2.5} />
        </>
      ) : null}
      {type === 'merger' ? (
        <>
          <line x1={x + 6} y1={cy} x2={cx} y2={cy} stroke={color} strokeWidth={2.5} />
          <line x1={cx} y1={y + 6} x2={cx} y2={y + CELL - 6} stroke={color} strokeWidth={2.5} />
          <line x1={cx} y1={cy} x2={x + CELL - 6} y2={cy} stroke={color} strokeWidth={3} />
          <polygon
            points={`${x + CELL - 10},${cy - 4} ${x + CELL - 4},${cy} ${x + CELL - 10},${cy + 4}`}
            fill={color}
          />
        </>
      ) : null}
      {type === 'splitter' ? (
        <>
          <line x1={x + 6} y1={cy} x2={cx} y2={cy} stroke={color} strokeWidth={3} />
          <line x1={cx} y1={cy} x2={x + CELL - 6} y2={cy} stroke={color} strokeWidth={2.5} />
          <line x1={cx} y1={y + 6} x2={cx} y2={y + CELL - 6} stroke={color} strokeWidth={2.5} />
        </>
      ) : null}
      {type === 'lift' ? (
        <text
          x={cx}
          y={cy + 3}
          textAnchor="middle"
          fontSize={9}
          fontWeight={700}
          fill={color}
        >
          ↕
        </text>
      ) : null}
    </g>
  )
}
