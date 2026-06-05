import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function makeSkuBase(category?: string | null, name?: string | null) {
  const clean = (v?: string | null) =>
    (v || '')
      .toString()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')

  const catPart = (clean(category) || 'PRD').slice(0, 3)
  const namePart = (clean(name) || '000').slice(0, 3)

  return `${catPart}-${namePart}`
}
