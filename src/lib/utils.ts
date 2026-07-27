import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRate(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '∞'
  if (Math.abs(n) < 1e-9) return '0'
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(digits).replace(/\.?0+$/, '')
}

export function formatPower(mw: number): string {
  if (mw >= 1000) return `${formatRate(mw / 1000, 2)} GW`
  return `${formatRate(mw, 2)} MW`
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
