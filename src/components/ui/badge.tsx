import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide',
  {
    variants: {
      variant: {
        default:
          'border-[var(--accent-orange)]/40 bg-[var(--accent-orange)]/15 text-[var(--accent-amber)]',
        steel:
          'border-[var(--accent-steel)]/40 bg-[var(--accent-steel)]/15 text-[var(--accent-steel)]',
        success:
          'border-[var(--success)]/40 bg-[var(--success)]/15 text-[var(--success)]',
        danger:
          'border-[var(--danger)]/40 bg-[var(--danger)]/15 text-[var(--danger)]',
        muted:
          'border-[var(--border)] bg-[var(--bg-2)] text-[var(--fg-2)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
