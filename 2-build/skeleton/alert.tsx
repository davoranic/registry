/* Alert/Banner skeleton — written from the template's part union (leading
   icon-or-image + content column [title + description] + optional actions +
   optional dedicated close button). Inherits from no design system: which
   optional parts render, and which ARIA role (if any) is applied, are
   received as config, not hardcoded to any one system's answer.

   Two DECLARED COMPOSITIONS, same pattern as calendar.template.json's
   slot.composes (see docs/ALERT-MATRIX.md): the status/leading icon and the
   action/close buttons compose future/other registry components (an icon
   set, and the already-built `button`). Rather than importing those
   skeletons directly — which would couple this component's build to
   another component's own template/config — this skeleton renders neutral
   placeholders (a plain geometric SVG glyph, a plain <button>) and flags
   the gap explicitly, exactly as Calendar did for its nav chevrons. */
import * as React from "react"

export interface AlertConfig {
  image?: boolean
  title?: boolean
  actions?: boolean
  close?: boolean
  role?: string
  tone?: string[]
  emphasis?: string[]
}

export interface AlertProps {
  config: AlertConfig
  tone?: string
  emphasis?: string
  icon?: React.ReactNode
  image?: React.ReactNode
  title?: React.ReactNode
  actions?: React.ReactNode
  onClose?: () => void
  children?: React.ReactNode
  className?: string
}

function PlaceholderIcon() {
  // DECLARED DEFERRAL, same convention as Calendar's chevron placeholders:
  // a neutral geometric glyph standing in for each system's own status icon
  // set (Salt's StatusIndicator icons, shadcn's arbitrary lucide icon,
  // M3's Material Symbols) until a registry icon-set component exists.
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5.5v3.5M8 11v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function PlaceholderCloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Alert({
  config,
  tone,
  emphasis,
  icon,
  image,
  title,
  actions,
  onClose,
  children,
  className,
}: AlertProps) {
  const activeTone = tone ?? config.tone?.[0]
  const activeEmphasis = emphasis ?? config.emphasis?.[0]
  const showImage = Boolean(config.image) && Boolean(image ?? true)
  const showTitle = Boolean(config.title) && Boolean(title)
  const showActions = Boolean(config.actions) && Boolean(actions ?? true)
  const showClose = Boolean(config.close)

  return (
    <div
      data-slot="alert"
      data-tone={activeTone}
      data-emphasis={activeEmphasis}
      role={config.role || undefined}
      className={className}
    >
      {showImage ? (
        <span data-slot="alert-image" aria-hidden="true">
          {image ?? <PlaceholderIcon />}
        </span>
      ) : (
        <span data-slot="alert-icon" aria-hidden="true">
          {icon ?? <PlaceholderIcon />}
        </span>
      )}
      <div data-slot="alert-content">
        {showTitle && <div data-slot="alert-title">{title}</div>}
        {children && <div data-slot="alert-description">{children}</div>}
      </div>
      {showActions && (
        <div data-slot="alert-actions">
          {actions ?? <button type="button">Action</button>}
        </div>
      )}
      {showClose && (
        <button data-slot="alert-close" type="button" aria-label="close" onClick={onClose}>
          <PlaceholderCloseIcon />
        </button>
      )}
    </div>
  )
}
