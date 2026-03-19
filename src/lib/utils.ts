import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | undefined | null, decimals = 2): string {
  if (value == null) return '0.00'
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function calcPotentialPayout(odds: number, stake: number): number {
  return parseFloat((stake * odds).toFixed(2))
}

export function calcLiability(odds: number, stake: number): number {
  return parseFloat((stake * (odds - 1)).toFixed(2))
}

export function betStatusColor(status: string): string {
  switch (status) {
    case 'WON':       return 'badge-green'
    case 'LOST':      return 'badge-red'
    case 'VOID':      return 'badge-yellow'
    case 'MATCHED':   return 'badge-blue'
    case 'PENDING':   return 'badge-gray'
    case 'CANCELLED': return 'badge-gray'
    default:          return 'badge-gray'
  }
}

export function txTypeColor(type: string): string {
  const credit = ['DEPOSIT', 'WIN', 'CASINO_WIN', 'COMMISSION', 'REFUND', 'BONUS']
  return credit.includes(type) ? 'text-win' : 'text-loss'
}
