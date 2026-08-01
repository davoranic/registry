import * as React from "react"

import "./popover.css"

/**
 * Popover — contract/anatomy/popover.json.
 *
 * APG disclosure / non-modal dialog pattern: the trigger carries
 * aria-haspopup="dialog" and aria-expanded; focus moves into the panel but is
 * NOT trapped; Esc and outside click dismiss and return focus to the trigger.
 *
 * Salt's Overlay (header + close button + content) is this anatomy with the
 * dialog header/close parts composed inside the panel content slot —
 * composition, not different anatomy.
 */

type Side = "top" | "bottom" | "start" | "end"

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export interface PopoverProps {
  /** the control that opens the panel — typically a button */
  trigger: React.ReactElement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: Side
  /** the panel's accessible name */
  label?: string
  children?: React.ReactNode
}

function Popover({
  trigger,
  open,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  label,
  children,
}: PopoverProps) {
  const baseId = React.useId()
  const panelId = `${baseId}-panel`
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isOpen = open ?? uncontrolled
  const rootRef = React.useRef<HTMLSpanElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLElement>(null)

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (open === undefined) setUncontrolled(next)
      onOpenChange?.(next)
    },
    [onOpenChange, open]
  )

  /* focus moves into the panel on open and returns to the trigger on close —
     but is never trapped: Tab may leave the panel freely (non-modal) */
  React.useEffect(() => {
    if (!isOpen) return
    const panel = panelRef.current
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? panel)?.focus()
  }, [isOpen])

  /* outside click dismisses */
  React.useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [isOpen, setOpen])

  const close = (returnFocus = true) => {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  const triggerNode = React.cloneElement(trigger, {
    ref: triggerRef,
    "data-slot": "trigger",
    "data-state": isOpen ? "open" : undefined,
    "aria-haspopup": "dialog",
    "aria-expanded": isOpen,
    "aria-controls": isOpen ? panelId : undefined,
    onClick: (event: React.MouseEvent) => {
      ;(trigger.props as React.HTMLAttributes<HTMLElement>).onClick?.(
        event as React.MouseEvent<HTMLElement>
      )
      if (!event.defaultPrevented) setOpen(!isOpen)
    },
  } as React.HTMLAttributes<HTMLElement> & { ref: React.Ref<HTMLElement> })

  return (
    <span
      data-slot="popover"
      ref={rootRef}
      onKeyDown={(event) => {
        if (event.key === "Escape" && isOpen) {
          event.stopPropagation()
          close()
        }
      }}
    >
      {triggerNode}
      {isOpen && (
        <div
          data-slot="panel"
          data-side={side}
          data-state="open"
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label={label}
          tabIndex={-1}
        >
          {children}
        </div>
      )}
    </span>
  )
}

export { Popover }
