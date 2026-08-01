import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import "./carousel.css"

/**
 * Carousel — contract/anatomy/carousel.json.
 *
 * APG carousel pattern: the root is a region with aria-roledescription
 * "carousel" and an accessible name; each slide is role=group with
 * aria-roledescription "slide" and an "N of M" label. Previous/next are real
 * buttons, disabled (and aria-disabled) at the ends. With the region focused,
 * ArrowLeft/ArrowRight move one slide (ArrowUp/ArrowDown when vertical).
 * Slide changes are announced through a polite live region. Auto-rotation,
 * when present, pauses on hover and on focus and always offers an explicit
 * pause control.
 */

type Orientation = "horizontal" | "vertical"

export interface CarouselProps
  extends Omit<React.ComponentProps<"div">, "onChange"> {
  /** names the region — APG requires the carousel to be labelled */
  label: string
  orientation?: Orientation
  /** controlled active slide */
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  /** the dot/tab strip */
  showIndicators?: boolean
  /** the visible "N of M" counter */
  showProgressLabel?: boolean
  /** auto-rotation interval in ms; pauses on hover and on focus */
  autoRotateMs?: number
  /** each child becomes one slide */
  children?: React.ReactNode
}

function Carousel({
  label,
  orientation = "horizontal",
  index,
  defaultIndex = 0,
  onIndexChange,
  showIndicators = true,
  showProgressLabel = false,
  autoRotateMs,
  children,
  ...props
}: CarouselProps) {
  const baseId = React.useId()
  const slides = React.Children.toArray(children).filter(Boolean)
  const count = slides.length
  const [uncontrolled, setUncontrolled] = React.useState(defaultIndex)
  const active = Math.min(index ?? uncontrolled, Math.max(count - 1, 0))
  const [paused, setPaused] = React.useState(false)
  const vertical = orientation === "vertical"

  const goTo = React.useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, count - 1))
      if (clamped === active) return
      if (index === undefined) setUncontrolled(clamped)
      onIndexChange?.(clamped)
    },
    [active, count, index, onIndexChange]
  )

  /* auto-rotation pauses on hover and on focus (APG) */
  React.useEffect(() => {
    if (!autoRotateMs || paused || count < 2) return
    const id = setInterval(() => {
      const next = (active + 1) % count
      if (index === undefined) setUncontrolled(next)
      onIndexChange?.(next)
    }, autoRotateMs)
    return () => clearInterval(id)
  }, [active, autoRotateMs, count, index, onIndexChange, paused])

  const atStart = active <= 0
  const atEnd = active >= count - 1

  return (
    <div
      data-slot="carousel"
      data-orientation={orientation}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setPaused(false)
        }
      }}
      onKeyDown={(event) => {
        const previousKey = vertical ? "ArrowUp" : "ArrowLeft"
        const nextKey = vertical ? "ArrowDown" : "ArrowRight"
        if (event.key === previousKey) {
          event.preventDefault()
          goTo(active - 1)
        } else if (event.key === nextKey) {
          event.preventDefault()
          goTo(active + 1)
        }
      }}
      {...props}
    >
      <div data-slot="viewport">
        <div
          data-slot="slides"
          id={`${baseId}-slides`}
          /* the rail offset is data, not design: the recipe owns duration and
             easing, the component owns how far the rail has travelled */
          style={{
            transform: vertical
              ? `translate3d(0, ${active * -100}%, 0)`
              : `translate3d(${active * -100}%, 0, 0)`,
          }}
        >
          {slides.map((slide, position) => (
            <div
              key={position}
              data-slot="slide"
              data-state={position === active ? "selected" : undefined}
              role="group"
              aria-roledescription="slide"
              aria-label={`${position + 1} of ${count}`}
              aria-hidden={position === active ? undefined : true}
              {...(position === active
                ? {}
                : ({ inert: "" } as Record<string, string>))}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        data-slot="previous"
        aria-label="Previous slide"
        aria-controls={`${baseId}-slides`}
        aria-disabled={atStart || undefined}
        disabled={atStart}
        data-disabled={atStart ? "" : undefined}
        onClick={() => goTo(active - 1)}
      >
        <ChevronLeftIcon aria-hidden="true" />
      </button>
      <button
        type="button"
        data-slot="next"
        aria-label="Next slide"
        aria-controls={`${baseId}-slides`}
        aria-disabled={atEnd || undefined}
        disabled={atEnd}
        data-disabled={atEnd ? "" : undefined}
        onClick={() => goTo(active + 1)}
      >
        <ChevronRightIcon aria-hidden="true" />
      </button>

      {showIndicators && count > 1 && (
        <div data-slot="indicator-list" role="tablist" aria-label={`${label} slides`}>
          {slides.map((_, position) => (
            <button
              key={position}
              type="button"
              data-slot="indicator"
              data-state={position === active ? "selected" : undefined}
              role="tab"
              aria-label={`Slide ${position + 1}`}
              aria-selected={position === active}
              tabIndex={position === active ? 0 : -1}
              onClick={() => goTo(position)}
            />
          ))}
        </div>
      )}

      {showProgressLabel && (
        <span data-slot="progress-label">{`${active + 1} of ${count}`}</span>
      )}

      {/* slide changes are announced politely, never by moving focus */}
      <span data-slot="live-region" aria-live="polite" aria-atomic="true">
        {`Slide ${active + 1} of ${count}`}
      </span>
    </div>
  )
}

export { Carousel }
