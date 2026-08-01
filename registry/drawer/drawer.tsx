import * as React from "react"

import "./drawer.css"

/**
 * Drawer — contract/anatomy/drawer.json.
 *
 * APG dialog (modal) pattern, edge-anchored: focus is trapped in the panel,
 * Esc closes, focus returns to the opener, aria-modal="true". Bottom-edge
 * drawers may add drag-to-dismiss — a pointer enhancement only; keyboard
 * dismissal stays Esc.
 *
 * shadcn splits sheet (side panel) from drawer (bottom); Salt's Drawer covers
 * all four positions. One anatomy here — the edge axis is the whole
 * difference, and size binds to size-overlay-* along the panel's
 * anchored-edge-normal dimension.
 */

type Edge = "start" | "end" | "top" | "bottom"
type Size = "sm" | "md" | "lg"

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export interface DrawerProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  edge?: Edge
  size?: Size
  /** the drag affordance — conventionally present only when edge is "bottom" */
  showHandle?: boolean
  children?: React.ReactNode
}

function Drawer({
  open,
  onOpenChange,
  title,
  description,
  footer,
  edge = "bottom",
  size = "md",
  showHandle,
  children,
}: DrawerProps) {
  const baseId = React.useId()
  const titleId = `${baseId}-title`
  const descriptionId = `${baseId}-description`
  const panelRef = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const dragStart = React.useRef<number | null>(null)
  const handleVisible = showHandle ?? edge === "bottom"

  /* initial focus into the panel on open, focus returned to the opener on close */
  React.useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE)
    ;(firstFocusable ?? panel)?.focus()
    return () => previouslyFocused?.focus()
  }, [open])

  if (!open) return null

  const close = () => onOpenChange?.(false)

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation()
      close()
      return
    }
    if (event.key !== "Tab") return
    /* Tab cycles inside the panel — this dialog is modal */
    const panel = panelRef.current
    if (!panel) return
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (focusable.length === 0) {
      event.preventDefault()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  /* drag-to-dismiss: pointer enhancement, never the only route out */
  const onHandlePointerDown = (event: React.PointerEvent) => {
    dragStart.current = event.clientY
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const onHandlePointerUp = (event: React.PointerEvent) => {
    const start = dragStart.current
    dragStart.current = null
    setDragging(false)
    if (start !== null && event.clientY - start > 80) close()
  }

  return (
    <>
      <div data-slot="scrim" data-state="open" onClick={close} />
      <div
        data-slot="panel"
        data-edge={edge}
        data-size={size === "md" ? undefined : size}
        data-state={dragging ? "dragging" : "open"}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        {handleVisible && (
          <div
            data-slot="handle"
            aria-hidden="true"
            onPointerDown={onHandlePointerDown}
            onPointerUp={onHandlePointerUp}
          />
        )}
        <div data-slot="header">
          <h2 data-slot="title" id={titleId}>
            {title}
          </h2>
          {description && (
            <p data-slot="description" id={descriptionId}>
              {description}
            </p>
          )}
        </div>
        <div data-slot="content">{children}</div>
        {footer && <div data-slot="footer">{footer}</div>}
      </div>
    </>
  )
}

export { Drawer }
