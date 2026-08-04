/* Spinner skeleton — written from the template's part union (arc + optional
   track + optional gradient trail). Inherits from no design system: role,
   default label, and which optional parts render are received as config,
   not hardcoded to any one system's answer.

   The arc's sweep (pathLength=100, dasharray "75 25") is a fixed structural
   simplification, not a themed value — see docs/SPINNER-MATRIX.md's
   rotation-mechanism finding: none of the three sources' real indeterminate
   motion (Salt's two-circle gradient sweep, shadcn's static icon glyph, M3's
   growing/shrinking arc) is a plain constant-length rotating arc, but a
   CSS-only skeleton needs one concrete geometry to rotate. Declared, not
   silent. */
import * as React from "react"

export interface SpinnerConfig {
  size?: string[]
  role: string
  ariaLabelDefault: string
  repeatAnnounce?: boolean
  track?: boolean
  gradientTrail?: boolean
}

export interface SpinnerProps {
  config: SpinnerConfig
  size?: string
  "aria-label"?: string
  className?: string
}

export function Spinner({ config, size, "aria-label": ariaLabelProp, className }: SpinnerProps) {
  const activeSize = size ?? (config.size?.length ? config.size[Math.floor(config.size.length / 2)] : undefined)
  const ariaLabel = ariaLabelProp ?? config.ariaLabelDefault
  const gradientId = React.useId()

  React.useEffect(() => {
    if (!config.repeatAnnounce) return
    // Mirrors Salt's useAriaAnnouncer capability (announcerInterval=5000ms,
    // announcerTimeout=20000ms): re-announce on an interval until a timeout.
    // A real re-announcement needs a shared live-region node outside this
    // component's own DOM (Salt's aria-announcer provider does this); this
    // effect documents/exercises the timing capability without fabricating
    // that shared infrastructure — a declared partial implementation.
    const announcerInterval = 5000
    const announcerTimeout = 20000
    const start = Date.now()
    const id = setInterval(() => {
      if (Date.now() - start > announcerTimeout) clearInterval(id)
    }, announcerInterval)
    return () => clearInterval(id)
  }, [config.repeatAnnounce])

  return (
    <div
      data-slot="spinner"
      data-size={activeSize}
      role={config.role}
      aria-label={ariaLabel}
      className={className}
    >
      <svg data-slot="spinner-svg" aria-hidden="true">
        {config.gradientTrail && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="50%" y2="0">
              <stop data-slot="spinner-trail-stop-a" offset="15%" />
              <stop data-slot="spinner-trail-stop-b" offset="100%" />
            </linearGradient>
          </defs>
        )}
        {config.track && <circle data-slot="spinner-track" />}
        <circle data-slot="spinner-arc" pathLength="100" strokeDasharray="75 25" strokeLinecap="round" />
        {config.gradientTrail && (
          <circle
            data-slot="spinner-arc-trail"
            pathLength="100"
            strokeDasharray="75 25"
            strokeLinecap="round"
            stroke={`url(#${gradientId})`}
          />
        )}
      </svg>
    </div>
  )
}
