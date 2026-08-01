import * as React from "react"

import "./textarea.css"

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  invalid?: boolean
  /** Grow with content instead of scrolling (recipe capability, not anatomy). */
  autosize?: boolean
}

/**
 * Native <textarea> semantics — no APG pattern; labelling and description
 * arrive through field/form composition (contract/anatomy/textarea.json).
 * The root paints the field chrome so the control itself stays bare.
 */
function Textarea({
  invalid,
  autosize = false,
  disabled,
  readOnly,
  className,
  "aria-invalid": ariaInvalid,
  ...props
}: TextareaProps) {
  const isInvalid = invalid ?? (ariaInvalid === true || ariaInvalid === "true")
  return (
    <div
      data-slot="textarea"
      data-autosize={autosize ? "" : undefined}
      data-state={isInvalid ? "invalid" : readOnly ? "readonly" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={className}
    >
      <textarea
        data-slot="control"
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={isInvalid || undefined}
        {...props}
      />
    </div>
  )
}

export { Textarea }
