import { cn } from '#/lib/utils'

const PALETTE: Record<string, string> = {
  ore: '#8b7355',
  ingot: '#c0c8d0',
  part: '#f59e0b',
  comp: '#3b82a0',
  fluid: '#38bdf8',
  fuel: '#ef4444',
  nuke: '#22c55e',
  b: '#64748b',
}

function colorFor(iconKey: string): string {
  const prefix = iconKey.split('-')[0] ?? 'part'
  return PALETTE[prefix] ?? '#94a3b8'
}

export function ItemIcon({
  iconKey,
  name,
  size = 28,
  className,
}: {
  iconKey: string
  name?: string
  size?: number
  className?: string
}) {
  const fill = colorFor(iconKey)
  const letter = (name ?? iconKey).slice(0, 2).toUpperCase()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={cn('shrink-0 rounded-md', className)}
      role="img"
      aria-label={name ?? iconKey}
    >
      <defs>
        <linearGradient id={`g-${iconKey}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.95" />
          <stop offset="100%" stopColor={fill} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="8"
        fill={`url(#g-${iconKey})`}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
      />
      <path
        d="M8 28 L20 10 L32 28 Z"
        fill="none"
        stroke="rgba(15,17,21,0.45)"
        strokeWidth="2"
      />
      <circle cx="20" cy="22" r="5" fill="rgba(15,17,21,0.35)" />
      <text
        x="20"
        y="35"
        textAnchor="middle"
        fontSize="7"
        fontWeight="700"
        fill="rgba(255,255,255,0.85)"
        fontFamily="ui-monospace, monospace"
      >
        {letter}
      </text>
    </svg>
  )
}
