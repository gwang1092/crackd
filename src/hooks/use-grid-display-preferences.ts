'use client'

import { useCallback, useSyncExternalStore } from 'react'

export const ITEMS_PER_PAGE_OPTIONS = [4, 6, 8, 10] as const

export const GRID_SHAPES = ['original', 'square', 'wide'] as const

export type GridShape = (typeof GRID_SHAPES)[number]

export const GRID_LAYOUTS = ['grid', 'staggered'] as const

export type GridLayout = (typeof GRID_LAYOUTS)[number]

type GridPreferences = { itemsPerPage: number; shape: GridShape; layout: GridLayout }

const DEFAULTS: GridPreferences = { itemsPerPage: 8, shape: 'original', layout: 'grid' }
const STORAGE_KEY = 'crackd:grid-display'
const CHANGE_EVENT = 'crackd:grid-display-change'

const isItemsPerPage = (value: unknown): value is number =>
  typeof value === 'number' && (ITEMS_PER_PAGE_OPTIONS as readonly number[]).includes(value)

const isGridShape = (value: unknown): value is GridShape =>
  typeof value === 'string' && (GRID_SHAPES as readonly string[]).includes(value)

const isGridLayout = (value: unknown): value is GridLayout =>
  typeof value === 'string' && (GRID_LAYOUTS as readonly string[]).includes(value)

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
    const saved = JSON.parse(raw) as {
      itemsPerPage?: unknown
      shape?: unknown
      layout?: unknown
    }
    return {
      itemsPerPage: isItemsPerPage(saved.itemsPerPage)
        ? saved.itemsPerPage
        : DEFAULTS.itemsPerPage,
      shape: isGridShape(saved.shape) ? saved.shape : DEFAULTS.shape,
      layout: isGridLayout(saved.layout) ? saved.layout : DEFAULTS.layout,
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

// Merge into the latest saved value so each setter never overwrites the others.
const update = (patch: Partial<GridPreferences>) => save({ ...parse(getSnapshot()), ...patch })

/**
 * Remembers how many memes to show per row, the tile shape and the layout
 * (aligned grid or staggered columns), saved in the browser across reloads.
 */
export function useGridDisplayPreferences() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const current = parse(raw)

  const setItemsPerPage = useCallback((value: number) => update({ itemsPerPage: value }), [])
  const setShape = useCallback((value: GridShape) => update({ shape: value }), [])
  const setLayout = useCallback((value: GridLayout) => update({ layout: value }), [])

  return { ...current, setItemsPerPage, setShape, setLayout }
}
