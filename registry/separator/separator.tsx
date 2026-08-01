import * as React from "react"

import "./separator.css"

/* Anatomy: contract/anatomy/separator.json — APG separator pattern.
   Decorative (default) is hidden from assistive tech; semantic
   (decorative={false}) renders role="separator" with aria-orientation —
   the choice is exposed, per anatomy note. Never focusable. */

type Orientation = "horizontal" | "vertical"
type Prominence = "subtle" | "default" | "strong"

export interface SeparatorProps extends React.ComponentProps<"div"> {
  orientation?: Orientation
  /** 3-tier separator scale (semantic.md §1): subtle | default | strong */
  prominence?: Prominence
  /** false = semantic divider between content regions (role="separator") */
  decorative?: boolean
}

function Separator({
  orientation = "horizontal",
  prominence = "default",
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <div
      data-slot="separator"
      data-orientation={orientation}
      data-prominence={prominence === "default" ? undefined : prominence}
      role={decorative ? "none" : "separator"}
      aria-hidden={decorative || undefined}
      aria-orientation={
        !decorative && orientation === "vertical" ? "vertical" : undefined
      }
      {...props}
    />
  )
}

export { Separator }
