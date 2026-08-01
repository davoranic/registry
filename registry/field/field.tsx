import * as React from "react"

import "./field.css"

export interface FieldProps extends React.ComponentProps<"div"> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: React.ReactNode
  htmlFor?: string
  orientation?: "vertical" | "horizontal"
  disabled?: boolean
  readOnly?: boolean
}

/**
 * Composition wrapper for form controls (contract/anatomy/field.json).
 * Label placement is a THEME capability — orientation="horizontal" renders
 * the label beside the control for themes/screens that call for it.
 */
function Field({
  label,
  description,
  error,
  htmlFor,
  orientation = "vertical",
  disabled,
  readOnly,
  children,
  ...props
}: FieldProps) {
  const reactId = React.useId()
  const controlId = htmlFor ?? reactId
  const describedBy = description ? `${controlId}-description` : undefined
  const errorId = error ? `${controlId}-error` : undefined

  return (
    <div
      data-slot="field"
      data-orientation={orientation === "vertical" ? undefined : orientation}
      data-disabled={disabled ? "" : undefined}
      data-state={error ? "invalid" : readOnly ? "readonly" : undefined}
      {...props}
    >
      {label && (
        <label data-slot="label" htmlFor={controlId}>
          {label}
        </label>
      )}
      <div data-slot="control-slot">
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
              id: controlId,
              "aria-describedby": [describedBy, errorId].filter(Boolean).join(" ") || undefined,
              "aria-invalid": error ? true : undefined,
              disabled,
              readOnly,
            })
          : children}
      </div>
      {description && !error && (
        <span data-slot="description" id={describedBy}>
          {description}
        </span>
      )}
      {error && (
        <span data-slot="error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export { Field }
