import * as React from "react"

import "./switch.css"

export interface SwitchProps
  extends Omit<React.ComponentProps<"button">, "onChange"> {
  checked?: boolean
  label?: React.ReactNode
  size?: "sm" | "md"
  onCheckedChange?: (checked: boolean) => void
}

function Switch({
  checked = false,
  label,
  size = "md",
  disabled,
  onCheckedChange,
  id,
  ...props
}: SwitchProps) {
  const reactId = React.useId()
  const controlId = id ?? reactId
  return (
    <div data-slot="switch" data-size={size === "md" ? undefined : size}
         data-disabled={disabled ? "" : undefined}>
      <button
        type="button"
        role="switch"
        id={controlId}
        data-slot="track"
        data-state={checked ? "selected" : undefined}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        {...props}
      >
        <span data-slot="thumb" aria-hidden="true" />
      </button>
      {label && (
        <label data-slot="label" htmlFor={controlId}>
          {label}
        </label>
      )}
    </div>
  )
}

export { Switch }
