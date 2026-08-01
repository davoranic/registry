import * as React from "react"

import "./input-group.css"

type Size = "sm" | "md" | "lg"
type Edge = "inline-start" | "inline-end" | "block-start" | "block-end"

export interface InputGroupProps extends React.ComponentProps<"div"> {
  size?: Size
  invalid?: boolean
  disabled?: boolean
  readOnly?: boolean
  /** role=group wants an accessible name. */
  label?: string
}

/**
 * One native control plus adornments (contract/anatomy/input-group.json).
 * The group is never focusable: focus lands on the hosted control and the
 * group reflects it via :focus-within. Clicking a non-interactive adornment
 * forwards focus to the control; interactive adornments are real buttons
 * that stay in the tab order after the control.
 */
function InputGroup({
  size = "md",
  invalid,
  disabled,
  readOnly,
  label,
  "aria-label": ariaLabel,
  children,
  ...props
}: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      role="group"
      aria-label={ariaLabel ?? label}
      data-size={size === "md" ? undefined : size}
      data-state={invalid ? "invalid" : readOnly ? "readonly" : undefined}
      data-disabled={disabled ? "" : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

export interface InputGroupAddonProps extends React.ComponentProps<"div"> {
  /** inline-start/inline-end sit in the control row; block-start/block-end
   *  are full-width bands above/below it. */
  edge?: Edge
}

function InputGroupAddon({
  edge = "inline-start",
  onMouseDown,
  children,
  ...props
}: InputGroupAddonProps) {
  /* forward focus to the control unless the pointer landed on something
     interactive inside the addon (behavior contract) */
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    onMouseDown?.(event)
    if (event.defaultPrevented) return
    const target = event.target as HTMLElement
    if (target.closest("button, a, input, select, textarea, [tabindex]")) return
    const group = event.currentTarget.closest('[data-slot="input-group"]')
    const control = group?.querySelector<HTMLElement>('[data-slot="control"]')
    if (control) {
      event.preventDefault()
      control.focus()
    }
  }
  return (
    <div data-slot="addon" data-edge={edge} onMouseDown={handleMouseDown} {...props}>
      {children}
    </div>
  )
}

export interface InputGroupControlProps
  extends Omit<React.ComponentProps<"input">, "size"> {
  /** Render the hosted control as a textarea instead of an input. */
  multiline?: boolean
  rows?: number
}

/** The hosted input or textarea — borderless and unshadowed, because the
 *  group owns the field chrome. */
function InputGroupControl({ multiline, ...props }: InputGroupControlProps) {
  if (multiline) {
    return (
      <textarea
        data-slot="control"
        {...(props as unknown as React.ComponentProps<"textarea">)}
      />
    )
  }
  return <input data-slot="control" {...props} />
}

export { InputGroup, InputGroupAddon, InputGroupControl }
