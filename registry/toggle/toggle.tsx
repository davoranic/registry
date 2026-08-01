import * as React from "react"

import "./toggle.css"

type Prominence = "solid" | "outline" | "ghost"
type Size = "sm" | "md" | "lg"

export interface ToggleProps
  extends Omit<React.ComponentProps<"button">, "onChange"> {
  prominence?: Prominence
  size?: Size
  /** Controlled pressed state. */
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  icon?: React.ReactNode
}

/**
 * Toggle — contract/anatomy/toggle.json.
 * APG button pattern with aria-pressed. Enter/Space toggle (native button
 * semantics); the accessible name never changes with state — the state is
 * carried by aria-pressed alone. A toggle in a group takes radio/checkbox
 * semantics instead; that is toggle-group, a different anatomy.
 */
function Toggle({
  prominence = "ghost",
  size = "md",
  pressed,
  defaultPressed = false,
  onPressedChange,
  icon,
  disabled,
  children,
  onClick,
  ...props
}: ToggleProps) {
  const [internal, setInternal] = React.useState(defaultPressed)
  const isPressed = pressed !== undefined ? pressed : internal

  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || disabled) return
    if (pressed === undefined) setInternal(!isPressed)
    onPressedChange?.(!isPressed)
  }

  return (
    <button
      type="button"
      data-slot="toggle"
      data-prominence={prominence}
      data-size={size === "md" ? undefined : size}
      data-state={isPressed ? "selected" : undefined}
      data-disabled={disabled ? "" : undefined}
      aria-pressed={isPressed}
      disabled={disabled}
      onClick={toggle}
      {...props}
    >
      {icon && (
        <span data-slot="icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span data-slot="label">{children}</span>
    </button>
  )
}

export { Toggle }
