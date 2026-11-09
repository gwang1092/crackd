'use client'

import { useCallback, useEffect, useState } from 'react'

export const ITEMS_PER_PAGE_OPTIONS = [4, 8, 12, 16, 20, 24] as const

export const GRID_SHAPES = ['original', 'square', 'wide'] as const

export type GridShape = (typeof GRID_SHAPES)[number]

const DEFAULT_ITEMS_PER_PAGE = 8
const DEFAULT_SHAPE: GridShape = 'original'
const STORAGE_KEY = 'crackd:grid-display'

const isItemsPerPage = (value: unknown): value is number =>
  typeof value === 'number' && (ITEMS_PER_PAGE_OPTIONS as readonly number[]).includes(value)

const isGridShape = (value: unknown): value is GridShape =>
  typeof value === 'string' && (GRID_SHAPES as readonly string[]).includes(value)

/**
 * Remembers how many memes to show at a time and which tile shape to use.
 * Renders with defaults first (so server and client HTML match), then applies
 * the saved choice. Storage can be unavailable (private mode), so every access
 * is wrapped and the page works fine without it.
 */
export function useGridDisplayPreferences() {
  const [itemsPerPage, setItemsPerPageState] = useState<number>(DEFAULT_ITEMS_PER_PAGE)
  const [shape, setShapeState] = useState<GridShape>(DEFAULT_SHAPE)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as { itemsPerPage?: unknown; shape?: unknown }
      if (isItemsPerPage(saved.itemsPerPage)) setItemsPerPageState(saved.itemsPerPage)
      if (isGridShape(saved.shape)) setShapeState(saved.shape)
    } catch {
      // ignore unreadable or unavailable storage
    }
  }, [])

  const persist = useCallback((next: { itemsPerPage: number; shape: GridShape }) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore unavailable storage
    }
  }, [])

  const setItemsPerPage = useCallback(
    (value: number) => {
      setItemsPerPageState(value)
      persist({ itemsPerPage: value, shape })
    },
    [persist, shape]
  )

  const setShape = useCallback(
    (value: GridShape) => {
      setShapeState(value)
      persist({ itemsPerPage, shape: value })
    },
    [persist, itemsPerPage]
  )

  return { itemsPerPage, setItemsPerPage, shape, setShape }
}
