import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function gradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'bg-green-500 text-white'
    case 'B': return 'bg-blue-500 text-white'
    case 'C': return 'bg-yellow-500 text-white'
    case 'F': return 'bg-red-500 text-white'
    default:  return 'bg-gray-400 text-white'
  }
}

export function scoreColor(score: number): string {
  if (score >= 85) return 'text-green-600'
  if (score >= 70) return 'text-blue-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

export function biasColor(bias: string): string {
  switch (bias) {
    case 'bullish':  return 'text-green-600'
    case 'bearish':  return 'text-red-600'
    case 'neutral':  return 'text-yellow-600'
    case 'no_trade': return 'text-gray-500'
    default:         return 'text-gray-500'
  }
}

export function biasEmoji(bias: string): string {
  switch (bias) {
    case 'bullish':  return '⬆️'
    case 'bearish':  return '⬇️'
    case 'neutral':  return '↔️'
    case 'no_trade': return '🚫'
    default:         return '❓'
  }
}

export function changeColor(change: number): string {
  return change >= 0 ? 'text-green-600' : 'text-red-600'
}

export function pnlColor(pnl: number): string {
  return pnl >= 0 ? 'text-green-600' : 'text-red-600'
}
