import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-0)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--accent-orange)] text-[var(--bg-0)] hover:bg-[var(--accent-amber)]',
        secondary:
          'bg-[var(--bg-2)] text-[var(--fg-0)] border border-[var(--border)] hover:bg-[var(--bg-3)]',
        outline:
          'border border-[var(--border-strong)] bg-transparent text-[var(--fg-0)] hover:bg-[var(--bg-2)]',
        ghost: 'hover:bg-[var(--bg-2)] text-[var(--fg-1)]',
        danger:
          'bg-[var(--danger)]/15 text-[var(--danger)] border border-[var(--danger)]/40 hover:bg-[var(--danger)]/25',
        steel:
          'bg-[var(--accent-steel)] text-white hover:bg-[var(--accent-steel)]/90',
      },
      size: {
        default: 'h-9 px-3 py-2',
        sm: 'h-8 rounded-md px-2.5 text-xs',
        lg: 'h-10 rounded-md px-4',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
