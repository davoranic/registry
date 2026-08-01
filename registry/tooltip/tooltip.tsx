import * as React from "react"

import "./tooltip.css"

type Side = "top" | "bottom" | "start" | "end"

export interface TooltipProps {
  /** The tooltip text. Never interactive content — APG forbids it here. */
  label: React.ReactNode
  /** The trigger element; receives aria-describedby and the hover/focus handlers. */
  children: React.ReactElement
  side?: Side
  delay?: number
  showArrow?: boolean
  defaultOpen?: boolean
}

/**
 * Tooltip — contract/anatomy/tooltip.json.
 * APG tooltip pattern: shows on trigger hover/focus after a delay, hides on
 * pointer leave / blur, Esc dismisses WITHOUT moving focus, role=tooltip
 * referenced by the trigger's aria-describedby. Focus never enters it, so it
 * must never contain interactive content.
 */
function Tooltip({
  label,
  children,
  side = "top",
  delay = 400,
  showArrow = true,
  defaultOpen = false,
}: TooltipProps) {
  const id = React.useId()
  const [open, setOpen] = React.useState(defaultOpen)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = undefined
  }
  React.useEffect(() => cancel, [])

  const show = (immediate = false) => {
    cancel()
    if (immediate || delay === 0) setOpen(true)
    else timer.current = setTimeout(() => setOpen(true), delay)
  }
  const hide = () => {
    cancel()
    setOpen(false)
  }

  const trigger = React.cloneElement(
    children,
    {
      "aria-describedby": open ? id : undefined,
      onPointerEnter: () => show(),
      onPointerLeave: hide,
      /* focus opens with no delay: keyboard users get no hover dwell */
      onFocus: () => show(true),
      onBlur: hide,
    } as React.HTMLAttributes<HTMLElement>
  )

  return (
    <span
      data-slot="tooltip-anchor"
      onKeyDown={(event) => {
        /* Esc dismisses without moving focus */
        if (event.key === "Escape" && open) hide()
      }}
    >
      {trigger}
      {open && (
        <span
          data-slot="tooltip"
          data-side={side}
          data-state="open"
          role="tooltip"
          id={id}
        >
          <span data-slot="label">{label}</span>
          {showArrow && <span data-slot="arrow" aria-hidden="true" />}
        </span>
      )}
    </span>
  )
}

export { Tooltip }
