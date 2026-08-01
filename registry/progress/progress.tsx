import * as React from "react"

import "./progress.css"

export interface ProgressProps extends React.ComponentProps<"div"> {
  /** Omit for the indeterminate state (aria-valuenow is then omitted too). */
  value?: number
  min?: number
  max?: number
  label?: string
}

/**
 * Progress — contract/anatomy/progress.json.
 * APG progressbar pattern: role=progressbar with aria-valuemin/aria-valuemax,
 * and aria-valuenow ONLY when determinate. Named via label/aria-labelledby.
 */
function Progress({
  value,
  min = 0,
  max = 100,
  label,
  "aria-labelledby": labelledBy,
  ...props
}: ProgressProps) {
  const indeterminate = value === undefined
  const span = max - min || 1
  const fraction = indeterminate
    ? 0
    : Math.min(1, Math.max(0, (value - min) / span))

  return (
    <div
      data-slot="progress"
      data-state={indeterminate ? "indeterminate" : "determinate"}
      role="progressbar"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : value}
      aria-label={labelledBy ? undefined : (label ?? "Progress")}
      aria-labelledby={labelledBy}
      {...props}
    >
      <div
        data-slot="indicator"
        style={
          indeterminate
            ? undefined
            : { inlineSize: `${(fraction * 100).toFixed(2)}%` }
        }
      />
    </div>
  )
}

export { Progress }
