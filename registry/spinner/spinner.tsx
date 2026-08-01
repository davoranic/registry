import * as React from "react"

import "./spinner.css"

type Size = "sm" | "md" | "lg"

export interface SpinnerProps extends React.ComponentProps<"span"> {
  size?: Size
  /** Accessible name announced while busy. */
  label?: string
}

/**
 * Spinner — contract/anatomy/spinner.json.
 * APG progressbar in its indeterminate form: role=progressbar with an
 * accessible name and NO aria-valuenow. Never focusable, never a tab stop.
 * The rotation is decorative; under prefers-reduced-motion the recipe stops
 * it and the polite announcement carries the meaning.
 */
function Spinner({ size = "md", label = "Loading", ...props }: SpinnerProps) {
  return (
    <span
      data-slot="spinner"
      data-size={size === "md" ? undefined : size}
      data-state="loading"
      role="progressbar"
      aria-label={label}
      aria-live="polite"
      {...props}
    >
      {/* track and arc are separate elements (anatomy root/indicator) so a
          theme can decide whether the track is visible */}
      <svg data-slot="indicator" viewBox="0 0 24 24" aria-hidden="true">
        <circle data-slot="indicator-track" cx="12" cy="12" r="10" fill="none" />
        <path
          data-slot="indicator-arc"
          d="M22 12a10 10 0 0 1-10 10"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export { Spinner }
