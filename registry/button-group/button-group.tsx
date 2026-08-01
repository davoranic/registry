import * as React from "react"

import "./button-group.css"

type Orientation = "horizontal" | "vertical"

export interface ButtonGroupProps extends React.ComponentProps<"div"> {
  orientation?: Orientation
  /** role=group requires an accessible name (behavior contract). */
  label?: string
}

/**
 * Grouping container (contract/anatomy/button-group.json): role=group with an
 * accessible name. Each child keeps its own button semantics AND its own tab
 * stop — grouping never changes the children's keyboard model. (A roving
 * toolbar is a different APG pattern and a different component.)
 *
 * The size axis is deliberately absent: size belongs to the hosted buttons.
 */
function ButtonGroup({
  orientation = "horizontal",
  label,
  "aria-label": ariaLabel,
  children,
  ...props
}: ButtonGroupProps) {
  return (
    <div
      data-slot="button-group"
      data-orientation={orientation}
      role="group"
      aria-label={ariaLabel ?? label}
      {...props}
    >
      {React.Children.map(children, (child) =>
        child == null || child === false ? null : (
          <span data-slot="item-slot">{child}</span>
        )
      )}
    </div>
  )
}

/** Static affix segment (unit, prefix) — non-interactive, out of the tab order. */
function ButtonGroupText({ children, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="text" {...props}>
      {children}
    </span>
  )
}

export interface ButtonGroupSeparatorProps
  extends React.ComponentProps<"span"> {
  /** The group's cross axis (anatomy/separator.json). */
  orientation?: Orientation
}

function ButtonGroupSeparator({
  orientation = "vertical",
  ...props
}: ButtonGroupSeparatorProps) {
  return (
    <span
      data-slot="separator"
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  )
}

export { ButtonGroup, ButtonGroupText, ButtonGroupSeparator }
