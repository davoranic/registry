/* Button skeleton — written from the APG button pattern for the template
   union. Inherits from no design system: tone/emphasis/size are received
   as config, not hardcoded to any one system's variant names. */
import * as React from "react"

export interface ButtonConfig {
  tone: string[]
  emphasis: string[]
  size: string[]
  iconOnly: boolean
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  config: ButtonConfig
  tone?: string
  emphasis?: string
  size?: string
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({ config, tone, emphasis, size, loading, icon, children, disabled, ...rest }: ButtonProps) {
  const activeTone = tone ?? config.tone[0]
  const activeEmphasis = loading && config.emphasis.includes("loading") ? "loading" : emphasis ?? config.emphasis[0]
  const activeSize = size ?? (config.size?.length ? config.size[Math.floor(config.size.length / 2)] : undefined)
  return (
    <button
      type="button"
      data-slot="button"
      data-tone={activeTone}
      data-emphasis={activeEmphasis}
      data-size={activeSize}
      disabled={disabled || activeEmphasis === "loading"}
      aria-busy={activeEmphasis === "loading" || undefined}
      {...rest}
    >
      {icon && <svg data-slot="button-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 8h8M8 4v8" /></svg>}
      {children}
      {activeEmphasis === "loading" && (
        <span data-slot="button-spinner" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" className="button-spin">
            <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="26 26" strokeLinecap="round" />
          </svg>
        </span>
      )}
    </button>
  )
}
