import * as React from "react"

import "./badge.css"

/* Anatomy: contract/anatomy/badge.json — non-interactive status label.
   NEVER for actions: a badge only reports status; anything clickable is a
   Button. Status components take the tone axis, never emphasis.
   Count-only badges require an accessible text alternative on the host. */

type Tone = "info" | "success" | "warning" | "critical"
type Prominence = "solid" | "outline"

export interface BadgeProps extends React.ComponentProps<"span"> {
  tone?: Tone
  prominence?: Prominence
}

function Badge({
  tone = "info",
  prominence = "solid",
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-tone={tone}
      data-prominence={prominence}
      {...props}
    />
  )
}

export { Badge }
