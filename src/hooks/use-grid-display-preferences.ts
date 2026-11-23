'use client'

import { useCallback, useSyncExternalStore } from 'react'

/** Memes per row on desktop, and on a phone or tablet. */
export const DESKTOP_COLUMN_OPTIONS = [4, 6, 8, 10] as const
export const MOBILE_COLUMN_OPTIONS = [1, 2, 3] as const

export type Viewport = 'phone' | 'tablet' | 'desktop'

/** 'auto' follows the screen size; the others are picked by the person. */
export type ViewMode = 'auto' | 'desktop' | 'mobile'

type GridPreferences = {
  desktopColumns: number
  mobileColumns: number
  mode: ViewMode
}

const DEFAULTS: GridPreferences = {
  desktopColumns: 8,
  mobileColumns: 2,
  mode: 'auto',
}
const STORAGE_KEY = 'crackd:grid-display-v3'
const CHANGE_EVENT = 'crackd:grid-display-change'

const isOneOf = <T extends string | number>(options: readonly T[], value: unknown): value is T =>
  (options as readonly unknown[]).includes(value)

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
    const saved = JSON.parse(raw) as Record<string, unknown>
    return {
      desktopColumns: isOneOf(DESKTOP_COLUMN_OPTIONS, saved.desktopColumns)
        ? saved.desktopColumns
        : DEFAULTS.desktopColumns,
      mobileColumns: isOneOf(MOBILE_COLUMN_OPTIONS, saved.mobileColumns)
        ? saved.mobileColumns
        : DEFAULTS.mobileColumns,
      mode: isOneOf(['auto', 'desktop', 'mobile'] as const, saved.mode)
        ? saved.mode
        : DEFAULTS.mode,
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
 * Remembers memes per row (separately for desktop and mobile) and the view mode,
 * saved in the browser across reloads.
 */
export function useGridDisplayPreferences() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const current = parse(raw)

  const setDesktopColumns = useCallback((value: number) => update({ desktopColumns: value }), [])
  const setMobileColumns = useCallback((value: number) => update({ mobileColumns: value }), [])
  const setMode = useCallback((value: ViewMode) => update({ mode: value }), [])

  return { ...current, setDesktopColumns, setMobileColumns, setMode }
}

const DESKTOP_QUERY = '(min-width: 1024px)'
const TABLET_QUERY = '(min-width: 640px)'

const subscribeViewport = (onChange: () => void) => {
  const queries = [window.matchMedia(DESKTOP_QUERY), window.matchMedia(TABLET_QUERY)]
  queries.forEach((query) => query.addEventListener('change', onChange))
  return () => queries.forEach((query) => query.removeEventListener('change', onChange))
}

const getViewport = (): Viewport => {
  if (window.matchMedia(DESKTOP_QUERY).matches) return 'desktop'
  if (window.matchMedia(TABLET_QUERY).matches) return 'tablet'
  return 'phone'
}

/** Which size class the screen is in. Server render assumes a phone. */
export function useViewport(): Viewport {
  return useSyncExternalStore(subscribeViewport, getViewport, () => 'phone' as const)
}

/** The layout to use: the screen's own size unless the person picked a mode. */
export function resolveViewport(real: Viewport, mode: ViewMode): Viewport {
  if (mode === 'desktop') return 'desktop'
  if (mode === 'mobile') return real === 'desktop' ? 'phone' : real
  return real
}

export type GridDensity = 'regular' | 'compact'

export type GridConfig = {
  columns: number
  density: GridDensity
  /** So many columns that caption text needs the smallest sizes. */
  tight: boolean
  /** How many memes to show before "Load More". */
  pageSize: number
}

const ROWS_PER_PAGE = { desktop: 2, tablet: 4, phone: 6 } as const

/** Turns the screen size plus saved choices into the grid to draw. */
export function getGridConfig(viewport: Viewport, prefs: GridPreferences): GridConfig {
  // A tablet has room for two more columns than a phone at the same setting.
  const columns =
    viewport === 'desktop'
      ? prefs.desktopColumns
      : viewport === 'tablet'
        ? prefs.mobileColumns + 2
        : prefs.mobileColumns

  const compactFrom = viewport === 'desktop' ? 8 : viewport === 'tablet' ? 4 : 2

  return {
    columns,
    density: columns >= compactFrom ? 'compact' : 'regular',
    tight: columns >= (viewport === 'desktop' ? 10 : viewport === 'tablet' ? 5 : 3),
    pageSize: columns * ROWS_PER_PAGE[viewport],
  }
}
