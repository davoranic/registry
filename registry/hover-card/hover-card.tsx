import * as React from "react"

import "./hover-card.css"

/**
 * HoverCard — contract/anatomy/hover-card.json.
 *
 * APG tooltip pattern widened to a non-modal preview disclosure: opens on
 * pointer hover AND on keyboard focus of the trigger after an open delay,
 * closes after a close delay on leave/blur; Esc dismisses without moving
 * focus; focus is never pulled into the card; the trigger references it via
 * aria-describedby.
 *
 * Unlike a tooltip the card MAY hold rich content — and any interactive
 * content inside it must also be reachable by Tab from the trigger. The card
 * stays open while focus is inside it for exactly that reason: content only
 * reachable by hovering is a contract violation.
 */

type Side = "top" | "bottom" | "start" | "end"

export interface HoverCardProps {
  /** conventionally a link or a name — the thing being previewed */
  trigger: React.ReactElement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: Side
  openDelay?: number
  closeDelay?: number
  showArrow?: boolean
  children?: React.ReactNode
}

function HoverCard({
  trigger,
  open,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  openDelay = 300,
  closeDelay = 150,
  showArrow = true,
  children,
}: HoverCardProps) {
  const id = React.useId()
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isOpen = open ?? uncontrolled
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  const cancel = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = undefined
  }, [])
  React.useEffect(() => cancel, [cancel])

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (open === undefined) setUncontrolled(next)
      onOpenChange?.(next)
    },
    [onOpenChange, open]
  )

  const scheduleOpen = React.useCallback(
    (delay: number) => {
      cancel()
      if (delay === 0) setOpen(true)
      else timer.current = setTimeout(() => setOpen(true), delay)
    },
    [cancel, setOpen]
  )

  const scheduleClose = React.useCallback(() => {
    cancel()
    if (closeDelay === 0) setOpen(false)
    else timer.current = setTimeout(() => setOpen(false), closeDelay)
  }, [cancel, closeDelay, setOpen])

  const triggerNode = React.cloneElement(trigger, {
    "data-slot": "trigger",
    "data-state": isOpen ? "open" : undefined,
    "aria-describedby": isOpen ? id : undefined,
    onPointerEnter: () => scheduleOpen(openDelay),
    onPointerLeave: scheduleClose,
    /* focus opens with no dwell: keyboard users get no hover delay */
    onFocus: () => scheduleOpen(0),
    onBlur: scheduleClose,
  } as React.HTMLAttributes<HTMLElement>)

  return (
    <span
      data-slot="hover-card"
      /* keeping the card open while the pointer or focus is inside it is what
         makes its interactive content reachable at all */
      onPointerEnter={cancel}
      onPointerLeave={scheduleClose}
      onFocus={cancel}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          scheduleClose()
        }
      }}
      onKeyDown={(event) => {
        /* Esc dismisses without moving focus */
        if (event.key === "Escape" && isOpen) {
          event.stopPropagation()
          cancel()
          setOpen(false)
        }
      }}
    >
      {triggerNode}
      {isOpen && (
        <div data-slot="panel" data-side={side} data-state="open" id={id}>
          {children}
          {showArrow && <span data-slot="arrow" aria-hidden="true" />}
        </div>
      )}
    </span>
  )
}

export { HoverCard }
