'use client'

import { useCallback, useSyncExternalStore } from 'react'

export const ITEMS_PER_PAGE_OPTIONS = [4, 8, 12, 16, 20, 24] as const

export const GRID_SHAPES = ['original', 'square', 'wide'] as const

export type GridShape = (typeof GRID_SHAPES)[number]

type GridPreferences = { itemsPerPage: number; shape: GridShape }

const DEFAULTS: GridPreferences = { itemsPerPage: 8, shape: 'original' }
const STORAGE_KEY = 'crackd:grid-display'
const CHANGE_EVENT = 'crackd:grid-display-change'

const isItemsPerPage = (value: unknown): value is number =>
  typeof value === 'number' && (ITEMS_PER_PAGE_OPTIONS as readonly number[]).includes(value)

const isGridShape = (value: unknown): value is GridShape =>
  typeof value === 'string' && (GRID_SHAPES as readonly string[]).includes(value)

// Holds the latest choice even when localStorage is unavailable (private mode).
let memoryValue: string | null = null

const subscribe = (onChange: () => void) => {
  window.addEventListener('storage', onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

const getSnapshot = (): string | null => {
  if (memoryValue !== null) return memoryValue
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

// The server (and the first hydration pass) has no saved choice, so defaults match.
const getServerSnapshot = (): string | null => null

const parse = (raw: string | null): GridPreferences => {
  if (!raw) return DEFAULTS
  try {
    const saved = JSON.parse(raw) as { itemsPerPage?: unknown; shape?: unknown }
    return {
      itemsPerPage: isItemsPerPage(saved.itemsPerPage)
        ? saved.itemsPerPage
        : DEFAULTS.itemsPerPage,
      shape: isGridShape(saved.shape) ? saved.shape : DEFAULTS.shape,
    }
  } catch {
    return DEFAULTS
  }
}

const save = (next: GridPreferences) => {
  const raw = JSON.stringify(next)
  memoryValue = raw
  try {
    window.localStorage.setItem(STORAGE_KEY, raw)
  } catch {
    // storage unavailable; the in-memory value still applies for this visit
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/**
 * Remembers how many memes to show at a time and which tile shape to use,
 * saved in the browser so it survives a reload.
 */
export function useGridDisplayPreferences() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const { itemsPerPage, shape } = parse(raw)

  const setItemsPerPage = useCallback(
    (value: number) => save({ itemsPerPage: value, shape }),
    [shape]
  )

  const setShape = useCallback(
    (value: GridShape) => save({ itemsPerPage, shape: value }),
    [itemsPerPage]
  )

  return { itemsPerPage, setItemsPerPage, shape, setShape }
}
