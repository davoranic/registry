import * as React from "react"
import { CheckIcon, MinusIcon } from "lucide-react"

import "./checkbox.css"

export interface CheckboxProps
  extends Omit<React.ComponentProps<"button">, "onChange"> {
  checked?: boolean | "indeterminate"
  label?: React.ReactNode
  description?: React.ReactNode
  invalid?: boolean
  readOnly?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function Checkbox({
  checked = false,
  label,
  description,
  invalid,
  readOnly,
  disabled,
  onCheckedChange,
  id,
  ...props
}: CheckboxProps) {
  const reactId = React.useId()
  const controlId = id ?? reactId
  const indeterminate = checked === "indeterminate"
  const isChecked = checked === true

  return (
    <div data-slot="checkbox" data-disabled={disabled ? "" : undefined}>
      <button
        type="button"
        role="checkbox"
        id={controlId}
        data-slot="control"
        data-state={
          indeterminate ? "indeterminate" : isChecked ? "selected" : undefined
        }
        aria-checked={indeterminate ? "mixed" : isChecked}
        aria-invalid={invalid || undefined}
        aria-readonly={readOnly || undefined}
        disabled={disabled}
        onClick={() => !readOnly && onCheckedChange?.(!isChecked)}
        onKeyDown={(event) => {
          // APG checkbox pattern: Space toggles; Enter must not activate.
          if (event.key === "Enter") event.preventDefault()
        }}
        {...props}
      >
        <span data-slot="indicator" aria-hidden="true">
          {indeterminate ? <MinusIcon /> : isChecked ? <CheckIcon /> : null}
        </span>
      </button>
      {(label || description) && (
        <span data-slot="text">
          {label && (
            <label data-slot="label" htmlFor={controlId}>
              {label}
            </label>
          )}
          {description && <span data-slot="description">{description}</span>}
        </span>
      )}
    </div>
  )
}

export { Checkbox }
