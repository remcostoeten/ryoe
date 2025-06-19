import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names using clsx and tailwind-merge
 * Handles conditional classes and merges Tailwind classes intelligently
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Creates a class name string from an object of conditional classes
 */
export function createClassNames(classes: Record<string, boolean>): string {
  return Object.entries(classes)
    .filter(([, condition]) => condition)
    .map(([className]) => className)
    .join(' ')
}

/**
 * Merges multiple class name strings
 */
export function mergeClassNames(...classNames: (string | undefined | null)[]): string {
  return classNames.filter(Boolean).join(' ')
}
