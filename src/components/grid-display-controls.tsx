'use client'

import { Monitor, Smartphone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DESKTOP_COLUMN_OPTIONS,
  MOBILE_COLUMN_OPTIONS,
  type GridDensity,
  type Viewport,
} from '@/hooks/use-grid-display-preferences'
import { cn } from '@/lib/utils'

const MODE_OPTIONS: Array<{ value: 'desktop' | 'mobile'; label: string; Icon: LucideIcon }> = [
  { value: 'desktop', label: 'Desktop', Icon: Monitor },
  { value: 'mobile', label: 'Mobile', Icon: Smartphone },
]

/** Every meme sits in a square tile. */
export const IMAGE_AREA_CLASS = 'aspect-square'

export const GRID_GAP_CLASSES: Record<GridDensity, string> = {
  regular: 'gap-6',
  compact: 'gap-3',
}

/**
 * Caption text is never cut off: the longer the caption, the smaller the text, and the
 * more columns there are, the sooner it shrinks. Full class names so Tailwind finds them.
 */
export const getCaptionTextClasses = (text: string, density: GridDensity, tight: boolean) => {
  if (density === 'regular') return 'text-base leading-relaxed'
  const length = text.length
  const size = tight
    ? length <= 40
      ? 'text-xs'
      : length <= 80
        ? 'text-[11px]'
        : length <= 130
          ? 'text-[10px]'
          : 'text-[9px]'
    : length <= 90
      ? 'text-xs'
      : length <= 160
        ? 'text-[11px]'
        : length <= 240
          ? 'text-[10px]'
          : 'text-[9px]'
  return `${size} leading-snug break-words`
}

// The grid element carries `group/grid` and `data-density`; compact cards use less space.
export const DENSITY_CLASSES = {
  header: 'group-data-[density=compact]/grid:p-2',
  brandLabel: 'group-data-[density=compact]/grid:hidden',
  captionBlock: [
    'flex-1',
    'group-data-[density=compact]/grid:px-2',
    'group-data-[density=compact]/grid:pb-2',
  ].join(' '),
  imageWrap: [
    'group-data-[density=compact]/grid:px-2',
    'group-data-[density=compact]/grid:pb-2',
  ].join(' '),
  actionBar: 'group-data-[density=compact]/grid:p-1.5',
}

interface GridDisplayControlsProps {
  viewport: Viewport
  onModeChange: (value: 'desktop' | 'mobile') => void
  desktopColumns: number
  onDesktopColumnsChange: (value: number) => void
  mobileColumns: number
  onMobileColumnsChange: (value: number) => void
}

function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Array<{ value: T; label: string; Icon: LucideIcon }>
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex overflow-hidden rounded-lg border border-primary/20"
      >
        {options.map(({ value: optionValue, label: optionLabel, Icon }) => {
          const isActive = value === optionValue
          return (
            <button
              key={optionValue}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={optionLabel}
              title={optionLabel}
              onClick={() => onChange(optionValue)}
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
  )
}

export function GridDisplayControls({
  viewport,
  onModeChange,
  desktopColumns,
  onDesktopColumnsChange,
  mobileColumns,
  onMobileColumnsChange,
}: GridDisplayControlsProps) {
  const isDesktop = viewport === 'desktop'
  const options = isDesktop ? DESKTOP_COLUMN_OPTIONS : MOBILE_COLUMN_OPTIONS
  const columns = isDesktop ? desktopColumns : mobileColumns
  const onColumnsChange = isDesktop ? onDesktopColumnsChange : onMobileColumnsChange

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-end">
      <ToggleGroup
        label="View"
        options={MODE_OPTIONS}
        value={isDesktop ? 'desktop' : 'mobile'}
        onChange={onModeChange}
      />
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Show</span>
        <Select value={String(columns)} onValueChange={(value) => onColumnsChange(Number(value))}>
          <SelectTrigger
            aria-label="Memes per row"
            className="h-9 w-[72px] border-primary/20 bg-background/30 text-primary
                       hover:border-primary/40 focus:ring-0 focus:ring-offset-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border border-primary/20 bg-background">
            {options.map((value) => (
              <SelectItem key={value} value={String(value)} className="text-primary">
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">per row</span>
      </div>
    </div>
  )
}
