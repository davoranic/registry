import * as React from "react"

import "./scroll-area.css"

type Axis = "vertical" | "horizontal"

const FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'

interface ThumbMetrics {
  size: number
  offset: number
  overflowing: boolean
}

const EMPTY: ThumbMetrics = { size: 0, offset: 0, overflowing: false }

export interface ScrollAreaProps extends React.ComponentProps<"div"> {
  /** Which axes get a custom scrollbar. */
  axis?: Axis | "both"
  /** Names the scroll region when it is keyboard-focusable (WCAG 2.1.1). */
  label?: string
}

/**
 * A native scroll container with custom-drawn scrollbars
 * (contract/anatomy/scroll-area.json). No APG pattern: native scrolling,
 * wheel, touch and scroll-anchoring are never intercepted. The viewport stays
 * keyboard-scrollable — it takes tabindex=0 (and a visible focus ring)
 * whenever its content holds no focusable children, and is labelled when it
 * scrolls. The scrollbars are decorative and pointer-draggable only.
 */
function ScrollArea({
  axis = "vertical",
  label,
  children,
  ...props
}: ScrollAreaProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [vertical, setVertical] = React.useState<ThumbMetrics>(EMPTY)
  const [horizontal, setHorizontal] = React.useState<ThumbMetrics>(EMPTY)
  const [focusable, setFocusable] = React.useState(false)
  const [dragging, setDragging] = React.useState<Axis | null>(null)

  const measure = React.useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const vOverflow = viewport.scrollHeight > viewport.clientHeight + 1
    const hOverflow = viewport.scrollWidth > viewport.clientWidth + 1
    setVertical({
      overflowing: vOverflow,
      size: vOverflow ? (viewport.clientHeight / viewport.scrollHeight) * 100 : 0,
      offset: vOverflow ? (viewport.scrollTop / viewport.scrollHeight) * 100 : 0,
    })
    setHorizontal({
      overflowing: hOverflow,
      size: hOverflow ? (viewport.clientWidth / viewport.scrollWidth) * 100 : 0,
      offset: hOverflow ? (viewport.scrollLeft / viewport.scrollWidth) * 100 : 0,
    })
    /* a scroll container with no focusable content must itself be tabbable */
    setFocusable(
      (vOverflow || hOverflow) && !viewport.querySelector(FOCUSABLE)
    )
  }, [])

  React.useEffect(() => {
    measure()
    const viewport = viewportRef.current
    if (!viewport || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    Array.from(viewport.children).forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, [measure, children])

  const startDrag = (thumbAxis: Axis) => (event: React.PointerEvent) => {
    const viewport = viewportRef.current
    if (!viewport) return
    event.preventDefault()
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
    setDragging(thumbAxis)
    const startPointer = thumbAxis === "vertical" ? event.clientY : event.clientX
    const startScroll =
      thumbAxis === "vertical" ? viewport.scrollTop : viewport.scrollLeft
    const trackSize =
      thumbAxis === "vertical" ? viewport.clientHeight : viewport.clientWidth
    const contentSize =
      thumbAxis === "vertical" ? viewport.scrollHeight : viewport.scrollWidth

    const onMove = (moveEvent: PointerEvent) => {
      const pointer =
        thumbAxis === "vertical" ? moveEvent.clientY : moveEvent.clientX
      const delta = ((pointer - startPointer) / trackSize) * contentSize
      if (thumbAxis === "vertical") viewport.scrollTop = startScroll + delta
      else viewport.scrollLeft = startScroll + delta
    }
    const onUp = () => {
      setDragging(null)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  const showVertical = axis !== "horizontal" && vertical.overflowing
  const showHorizontal = axis !== "vertical" && horizontal.overflowing

  return (
    <div data-slot="scroll-area" {...props}>
      <div
        ref={viewportRef}
        data-slot="viewport"
        tabIndex={focusable ? 0 : undefined}
        role={focusable ? "group" : undefined}
        aria-label={focusable ? label : undefined}
        onScroll={measure}
      >
        {children}
      </div>
      {showVertical && (
        <div data-slot="scrollbar" data-orientation="vertical" aria-hidden="true">
          <div
            data-slot="thumb"
            data-state={dragging === "vertical" ? "dragging" : undefined}
            style={{ height: `${vertical.size}%`, insetBlockStart: `${vertical.offset}%` }}
            onPointerDown={startDrag("vertical")}
          />
        </div>
      )}
      {showHorizontal && (
        <div data-slot="scrollbar" data-orientation="horizontal" aria-hidden="true">
          <div
            data-slot="thumb"
            data-state={dragging === "horizontal" ? "dragging" : undefined}
            style={{ width: `${horizontal.size}%`, insetInlineStart: `${horizontal.offset}%` }}
            onPointerDown={startDrag("horizontal")}
          />
        </div>
      )}
      {showVertical && showHorizontal && (
        <div data-slot="corner" aria-hidden="true" />
      )}
    </div>
  )
}

export { ScrollArea }
