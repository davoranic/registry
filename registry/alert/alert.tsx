import * as React from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"

import "./alert.css"

type Tone = "info" | "success" | "warning" | "critical"

/* tone → icon role (icons/sets/lucide.json): info → info, success → success,
   warning → warning, critical → error */
const TONE_ICON: Record<Tone, React.ComponentType<Record<string, unknown>>> = {
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  critical: OctagonXIcon,
}

export interface AlertProps extends React.ComponentProps<"div"> {
  tone?: Tone
  /** Overrides the tone's default icon; still decorative. */
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Ghost/link prominence buttons (anatomy/button.json). */
  actions?: React.ReactNode
  onDismiss?: () => void
  dismissLabel?: string
}

/**
 * APG alert pattern (contract/anatomy/alert.json): in-flow, persistent,
 * never auto-dismissed. role=alert for warning/critical, role=status for
 * info/success — announced without moving focus.
 */
function Alert({
  tone = "info",
  icon,
  title,
  description,
  actions,
  onDismiss,
  dismissLabel = "Dismiss",
  ...props
}: AlertProps) {
  const ToneIcon = TONE_ICON[tone]
  const assertive = tone === "warning" || tone === "critical"
  return (
    <div
      data-slot="alert"
      data-tone={tone}
      role={assertive ? "alert" : "status"}
      aria-live={assertive ? "assertive" : "polite"}
      {...props}
    >
      <span data-slot="icon" aria-hidden="true">
        {icon ?? <ToneIcon />}
      </span>
      <div data-slot="title">{title}</div>
      {description && <div data-slot="description">{description}</div>}
      {actions && <div data-slot="action-slot">{actions}</div>}
      {onDismiss && (
        <button
          type="button"
          data-slot="close"
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          <XIcon aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export { Alert }
