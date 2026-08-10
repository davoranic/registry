/* Toast/Snackbar skeleton — written from the template's part union. TWO
   exported parts of ONE chassis (see toast.template.json's behavior.pattern
   note for the full reasoning):

     `Toast`      — a single notification surface: optional leading icon,
                    a message, an optional description, an optional action
                    button, an optional dedicated close button. Owns its own
                    REAL auto-dismiss timer (behavior.auto-dismiss) and
                    pauses it on pointer hover (behavior.pause-on-interaction)
                    — this pipeline's first genuinely TIME-based behaviour.
     `ToastGroup` — a PRESENTATION-ONLY positioned stacking container,
                    modelled directly on Salt's own real ToastGroup
                    (packages/lab/src/toast-group/ToastGroup.tsx), which is
                    itself just a flex-column wrapper with NO imperative
                    API — the consumer (here, the harness) owns an array of
                    live toast entries with ordinary useState, exactly the
                    pattern toast-group.stories.tsx demonstrates. Reproducing
                    an imperative `toast()` singleton manager is explicitly
                    OUT of scope (see the SCOPE DECISION in the template).

   Every logically distinct part gets its own data-slot from this file's
   first draft (checkbox/radio-group/slider lesson): toast-group / toast-item
   / toast-icon / toast-content / toast-message / toast-description /
   toast-action / toast-close are never conflated with one another. */
import * as React from "react"

export interface ToastConfig {
  icon?: boolean
  description?: boolean
  action?: boolean
  close?: boolean
  role?: string
  type?: string[]
  position?: string[]
}

export interface ToastGroupConfig {
  position?: string[]
}

/* REGISTRY DEFAULT, labelled explicitly per toast.template.json's own
   prop.duration note — not sourced from either clone (Salt has no timer at
   all; shadcn/M3's own defaults live in external, unvendored packages). */
export const DEFAULT_AUTO_DISMISS_MS = 5000

const POSITION_INSET: Record<string, React.CSSProperties> = {
  "top-left": { top: 0, left: 0, bottom: "auto", right: "auto", transform: "none" },
  "top-center": { top: 0, left: "50%", bottom: "auto", right: "auto", transform: "translateX(-50%)" },
  "top-right": { top: 0, right: 0, bottom: "auto", left: "auto", transform: "none" },
  "bottom-left": { bottom: 0, left: 0, top: "auto", right: "auto", transform: "none" },
  "bottom-center": { bottom: 0, left: "50%", top: "auto", right: "auto", transform: "translateX(-50%)" },
  "bottom-right": { bottom: 0, right: 0, top: "auto", left: "auto", transform: "none" },
}

function PlaceholderIcon({ type }: { type?: string }) {
  // DECLARED DEFERRAL, same convention as alert's own PlaceholderIcon: a
  // neutral geometric glyph standing in for each system's real per-type
  // icon set until a registry icon-set component exists.
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" data-icon-type={type}>
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

export interface ToastProps {
  config: ToastConfig
  type?: string
  message: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  onClose?: () => void
  /** ms until auto-dismiss; 0/undefined means persistent (matches Salt's
   *  own real behaviour). See DEFAULT_AUTO_DISMISS_MS. */
  duration?: number
  className?: string
  "aria-label"?: string
}

export function Toast({
  config,
  type,
  message,
  description,
  icon,
  actionLabel,
  onAction,
  onClose,
  duration,
  className,
}: ToastProps) {
  const activeType = type ?? config.type?.[0]
  const showIcon = Boolean(config.icon)
  const showDescription = Boolean(config.description) && Boolean(description)
  const showAction = Boolean(config.action) && Boolean(actionLabel)
  const showClose = Boolean(config.close)

  // behavior.auto-dismiss / behavior.pause-on-interaction — a REAL internal
  // timer, not a documented-only row. remainingRef survives a pause/resume
  // cycle; startedAtRef lets a pause compute exactly how much time is left.
  const timerRef = React.useRef<ReturnType<typeof window.setTimeout> | undefined>(undefined)
  const remainingRef = React.useRef<number>(duration ?? 0)
  const startedAtRef = React.useRef<number>(0)
  const onCloseRef = React.useRef(onClose)
  onCloseRef.current = onClose

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current)
      timerRef.current = undefined
    }
  }, [])

  const arm = React.useCallback((ms: number) => {
    clearTimer()
    if (!ms || ms <= 0) return
    startedAtRef.current = Date.now()
    timerRef.current = window.setTimeout(() => {
      timerRef.current = undefined
      onCloseRef.current?.()
    }, ms)
  }, [clearTimer])

  React.useEffect(() => {
    remainingRef.current = duration ?? 0
    arm(remainingRef.current)
    return clearTimer
    // re-arm only when the DURATION itself changes — not on every render,
    // and not keyed on onClose's identity (onCloseRef absorbs that).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration])

  function handlePointerEnter() {
    if (timerRef.current === undefined) return
    const elapsed = Date.now() - startedAtRef.current
    remainingRef.current = Math.max(remainingRef.current - elapsed, 0)
    clearTimer()
  }
  function handlePointerLeave() {
    if (remainingRef.current > 0) arm(remainingRef.current)
  }

  return (
    <div
      data-slot="toast-item"
      data-type={activeType}
      role={config.role || undefined}
      className={className}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {showIcon && (
        <span data-slot="toast-icon" aria-hidden="true">
          {icon ?? <PlaceholderIcon type={activeType} />}
        </span>
      )}
      <div data-slot="toast-content">
        <div data-slot="toast-message">{message}</div>
        {showDescription && <div data-slot="toast-description">{description}</div>}
      </div>
      {showAction && (
        <button data-slot="toast-action" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {showClose && (
        <button data-slot="toast-close" type="button" aria-label="Close" onClick={() => onClose?.()}>
          <PlaceholderCloseIcon />
        </button>
      )}
    </div>
  )
}

export interface ToastGroupProps {
  config: ToastGroupConfig
  /** per-instance choice within config.position's own capability list */
  position?: string
  children?: React.ReactNode
  className?: string
}

export function ToastGroup({ config, position, children, className }: ToastGroupProps) {
  const activePosition = position ?? config.position?.[0]
  // prop.position's real, testable skeleton branch (toast.template.json's
  // own note on this row): every position value moves REAL inset geometry,
  // not just an inert config value the CSS never reads.
  const inset = activePosition ? POSITION_INSET[activePosition] : undefined
  return (
    <div data-slot="toast-group" data-position={activePosition} className={className} style={inset}>
      {children}
    </div>
  )
}
