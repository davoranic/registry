/* Tooltip skeleton — written from the template's part union (root panel +
   optional arrow + optional status icon + consumer-owned trigger/content).
   Inherits from no design system: which optional parts render, the ARIA
   role, and open/close delays are received as config, not hardcoded to
   any one system's answer.

   POSITIONING, DECLARED GAP (see docs/TOOLTIP-MATRIX.md
   behavior.positioning-engine): the three real systems each compose a
   real floating-position engine — Salt uses @floating-ui/react directly
   (offset/shift/flip/arrow middleware), shadcn composes Radix's own
   Popper primitive. Reimplementing either is out of scope for a
   phase-2 validation skeleton. This component instead measures the
   trigger and panel with getBoundingClientRect() on open and places the
   panel with a fixed 8px offset in the requested direction — real
   hover-triggered positioning, but with NO collision detection, no
   flip-to-fit, no shift-to-stay-on-screen. Declared, not silent.

   ARROW SHAPE is a real two-way structural split, received as config —
   NOT one shared shape. "triangle" (Salt) renders floating-ui's
   FloatingArrow geometry: an SVG triangle filled with the panel colour
   and stroked on its two OUTER edges only, so the open base merges into
   the panel's border. "diamond" (shadcn) renders a borderless rotated
   square whose inner half the panel covers. M3 renders no arrow at all.
   Drawing one rotated square for both was the earlier approach and it
   broke Salt visibly: a 1px border outlined all four edges of a rhombus
   instead of two edges of a triangle. */
import * as React from "react"

export interface TooltipConfig {
  role: string
  placement: string[]
  arrow?: boolean
  arrowShape?: string
  statusIcon?: boolean
  status?: string[]
  enterDelay?: number
  leaveDelay?: number
  supplementaryAnnounce?: boolean
}

export interface TooltipProps {
  config: TooltipConfig
  content: React.ReactNode
  children: React.ReactElement<Record<string, unknown>>
  placement?: string
  status?: string
  disabled?: boolean
  className?: string
}

const OFFSET = 8 // fixed approximation of floating-ui's offset(8) / Radix's sideOffset — see header note

export function Tooltip({ config, content, children, placement, status, disabled, className }: TooltipProps) {
  const activePlacement = placement ?? config.placement[0]
  const [open, setOpen] = React.useState(false)
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: -9999, left: -9999 })
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const announceRef = React.useRef<HTMLDivElement | null>(null)
  const openTimer = React.useRef<ReturnType<typeof setTimeout>>()
  const closeTimer = React.useRef<ReturnType<typeof setTimeout>>()
  const panelId = React.useId()

  const recompute = React.useCallback(() => {
    const trigger = triggerRef.current
    const panel = panelRef.current
    if (!trigger || !panel) return
    const tr = trigger.getBoundingClientRect()
    const pr = panel.getBoundingClientRect()
    let top = 0
    let left = 0
    switch (activePlacement) {
      case "bottom":
        top = tr.bottom + OFFSET
        left = tr.left + tr.width / 2 - pr.width / 2
        break
      case "left":
        top = tr.top + tr.height / 2 - pr.height / 2
        left = tr.left - pr.width - OFFSET
        break
      case "right":
        top = tr.top + tr.height / 2 - pr.height / 2
        left = tr.right + OFFSET
        break
      default: // "top"
        top = tr.top - pr.height - OFFSET
        left = tr.left + tr.width / 2 - pr.width / 2
    }
    setPos({ top, left })
  }, [activePlacement])

  React.useLayoutEffect(() => {
    if (open) recompute()
  }, [open, recompute])

  const clearTimers = () => {
    window.clearTimeout(openTimer.current)
    window.clearTimeout(closeTimer.current)
  }

  const show = React.useCallback(() => {
    if (disabled) return
    clearTimers()
    openTimer.current = setTimeout(() => {
      setOpen(true)
      if (config.supplementaryAnnounce && announceRef.current) {
        // Mirrors Salt's useAriaAnnounce: push the panel's text through a
        // live region on open, layered on top of (not replacing) the
        // native role="tooltip"/aria-describedby wiring below.
        announceRef.current.textContent = typeof content === "string" ? content : ""
      }
    }, config.enterDelay ?? 0)
  }, [disabled, config.enterDelay, config.supplementaryAnnounce, content])

  const hide = React.useCallback(() => {
    clearTimers()
    closeTimer.current = setTimeout(() => setOpen(false), config.leaveDelay ?? 0)
  }, [config.leaveDelay])

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  React.useEffect(() => clearTimers, [])

  const child = children
  const trigger = React.cloneElement(child, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node
    },
    "aria-describedby": open ? panelId : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      ;(child.props.onMouseEnter as ((e: React.MouseEvent) => void) | undefined)?.(e)
      show()
    },
    onMouseLeave: (e: React.MouseEvent) => {
      ;(child.props.onMouseLeave as ((e: React.MouseEvent) => void) | undefined)?.(e)
      hide()
    },
    onFocus: (e: React.FocusEvent) => {
      ;(child.props.onFocus as ((e: React.FocusEvent) => void) | undefined)?.(e)
      show()
    },
    onBlur: (e: React.FocusEvent) => {
      ;(child.props.onBlur as ((e: React.FocusEvent) => void) | undefined)?.(e)
      hide()
    },
  })

  return (
    <>
      {trigger}
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          data-slot="tooltip"
          data-placement={activePlacement}
          data-arrow-shape={config.arrow ? config.arrowShape : undefined}
          data-status={status}
          role={config.role}
          style={{ top: pos.top, left: pos.left }}
          className={className}
        >
          {config.statusIcon && status && <span data-slot="tooltip-icon" aria-hidden="true" />}
          <span data-slot="tooltip-content">{content}</span>
          {config.arrow &&
            (config.arrowShape === "triangle" ? (
              // viewBox is normalised (2 wide x 2 tall) rather than carrying any one
              // system's pixel numbers: the triangle spans the full width and half the
              // height, i.e. the 90-degree apex FloatingArrow uses. The square box lets
              // the per-placement CSS rotate about the centre without bounding-box maths.
              <svg data-slot="tooltip-arrow" viewBox="0 0 2 2" preserveAspectRatio="none" aria-hidden="true">
                <path data-slot="tooltip-arrow-fill" d="M0,0 H2 L1,1 Z" />
                <path data-slot="tooltip-arrow-stroke" d="M0,0 L1,1 L2,0" vectorEffect="non-scaling-stroke" />
              </svg>
            ) : (
              <span data-slot="tooltip-arrow" aria-hidden="true" />
            ))}
        </div>
      )}
      {config.supplementaryAnnounce && (
        <div ref={announceRef} role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }} />
      )}
    </>
  )
}
