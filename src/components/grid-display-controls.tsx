'use client'

import { RectangleHorizontal, RectangleVertical, Square } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ITEMS_PER_PAGE_OPTIONS, type GridShape } from '@/hooks/use-grid-display-preferences'
import { cn } from '@/lib/utils'

const SHAPE_OPTIONS: Array<{ value: GridShape; label: string; Icon: LucideIcon }> = [
  { value: 'original', label: 'Original', Icon: RectangleVertical },
  { value: 'square', label: 'Square', Icon: Square },
  { value: 'wide', label: 'Wide', Icon: RectangleHorizontal },
]

/** Tailwind classes for the image area of a card, per shape. */
export const SHAPE_IMAGE_CLASSES: Record<GridShape, string> = {
  original: [
    'flex-1 min-h-[320px]',
    'lg:group-data-[density=compact]/grid:min-h-[200px]',
    'lg:group-data-[density=mini]/grid:min-h-[110px]',
  ].join(' '),
  square: 'aspect-square',
  wide: 'aspect-video',
}

/** Rows of memes shown before "Load More", whatever the per-row setting. */
export const ROWS_PER_PAGE = 2

export type GridDensity = 'regular' | 'compact' | 'mini'

/** More memes per row means smaller cards: 4 = regular, 8 = compact, 16 = mini. */
export const getGridDensity = (columns: number): GridDensity =>
  columns >= 16 ? 'mini' : columns >= 8 ? 'compact' : 'regular'

export const GRID_GAP_CLASSES: Record<GridDensity, string> = {
  regular: 'gap-6',
  compact: 'gap-6 lg:gap-2',
  mini: 'gap-6 lg:gap-1',
}

// The grid element carries `group/grid` and `data-density`; these react to it from
// `lg` up, where the column count equals the Show setting.
export const DENSITY_CLASSES = {
  header: [
    'lg:group-data-[density=compact]/grid:p-1.5',
    'lg:group-data-[density=mini]/grid:hidden',
  ].join(' '),
  brandLabel: 'lg:group-data-[density=compact]/grid:hidden',
  captionBlock: [
    'lg:group-data-[density=compact]/grid:px-1.5',
    'lg:group-data-[density=compact]/grid:pb-1.5',
    'lg:group-data-[density=mini]/grid:hidden',
  ].join(' '),
  captionText: [
    'lg:group-data-[density=compact]/grid:text-[11px]',
    'lg:group-data-[density=compact]/grid:leading-snug',
    'lg:group-data-[density=compact]/grid:line-clamp-3',
  ].join(' '),
  imageWrap: [
    'lg:group-data-[density=compact]/grid:px-1.5',
    'lg:group-data-[density=compact]/grid:pb-1.5',
    'lg:group-data-[density=mini]/grid:p-0',
  ].join(' '),
  actionBar: [
    'lg:group-data-[density=compact]/grid:p-1',
    'lg:group-data-[density=mini]/grid:hidden',
  ].join(' '),
}

interface GridDisplayControlsProps {
  itemsPerPage: number
  onItemsPerPageChange: (value: number) => void
  shape: GridShape
  onShapeChange: (value: GridShape) => void
}

export function GridDisplayControls({
  itemsPerPage,
  onItemsPerPageChange,
  shape,
  onShapeChange,
}: GridDisplayControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Show</span>
        <Select
          value={String(itemsPerPage)}
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
        >
          <SelectTrigger
            aria-label="Memes per row"
            className="h-9 w-[72px] border-primary/20 bg-background/30 text-primary
                       hover:border-primary/40 focus:ring-0 focus:ring-offset-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border border-primary/20 bg-background">
            {ITEMS_PER_PAGE_OPTIONS.map((value) => (
              <SelectItem key={value} value={String(value)} className="text-primary">
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">per row</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Shape</span>
        <div
          role="radiogroup"
          aria-label="Meme tile shape"
          className="flex overflow-hidden rounded-lg border border-primary/20"
        >
          {SHAPE_OPTIONS.map(({ value, label, Icon }) => {
            const isActive = shape === value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isActive}
                aria-label={label}
                title={label}
                onClick={() => onShapeChange(value)}
                className={cn(
                  'flex h-9 w-10 items-center justify-center transition-colors duration-200',
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'bg-background/30 text-muted-foreground hover:bg-primary/10'
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
