import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import "./native-select.css"

type Size = "sm" | "md" | "lg"

export interface NativeSelectProps
  extends Omit<React.ComponentProps<"select">, "size"> {
  size?: Size
  invalid?: boolean
  readOnly?: boolean
}

/**
 * A native <select> (contract/anatomy/native-select.json). The user agent
 * supplies the listbox behaviour — open, typeahead, arrow navigation, Esc —
 * so no APG implementation is authored here and those keys are never
 * intercepted. Labelling and description come from field/form composition.
 *
 * The trigger recipe is deliberately identical to input's root: a native
 * select must be visually indistinguishable from the authored one. There is
 * no open state — the popup belongs to the user agent.
 */
function NativeSelect({
  size = "md",
  invalid,
  readOnly,
  disabled,
  className,
  children,
  onKeyDown,
  onMouseDown,
  "aria-invalid": ariaInvalid,
  ...props
}: NativeSelectProps) {
  const isInvalid = invalid ?? (ariaInvalid === true || ariaInvalid === "true")
  /* readonly: visible, focusable, not editable — the platform gives <select>
     no readOnly attribute, so interaction is blocked without leaving the tab
     order (disabled would remove it). */
  const block = (event: React.SyntheticEvent) => {
    if (readOnly) event.preventDefault()
  }
  return (
    <div
      data-slot="native-select"
      data-size={size === "md" ? undefined : size}
      data-state={isInvalid ? "invalid" : readOnly ? "readonly" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={className}
    >
      <select
        data-slot="control"
        disabled={disabled}
        aria-invalid={isInvalid || undefined}
        aria-readonly={readOnly || undefined}
        onMouseDown={(event) => {
          onMouseDown?.(event)
          block(event)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (readOnly && event.key !== "Tab") event.preventDefault()
        }}
        {...props}
      >
        {children}
      </select>
      <span data-slot="indicator" aria-hidden="true">
        <ChevronDownIcon />
      </span>
    </div>
  )
}

/** Native <option>; the platform paints the popup, so nothing beyond
 *  colour-scheme is themeable inside it. */
function NativeSelectOption(props: React.ComponentProps<"option">) {
  return <option data-slot="option" {...props} />
}

/** Native <optgroup label>. */
function NativeSelectGroup(props: React.ComponentProps<"optgroup">) {
  return <optgroup data-slot="group-label" {...props} />
}

export { NativeSelect, NativeSelectOption, NativeSelectGroup }
