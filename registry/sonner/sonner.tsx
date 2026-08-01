import * as React from "react"
import { XIcon } from "lucide-react"

import "./sonner.css"

/**
 * Sonner — contract/anatomy/sonner.json.
 *
 * This is the toaster REGION, not the notification: anatomy/toast.json is the
 * item and is normative for a toast's own parts and tone axis. The region is
 * an aria-live area (polite for info/success, assertive for warning/critical)
 * that is never focusable and never moves focus; toasts are appended and
 * announced in place. Pointer hover or keyboard focus anywhere inside pauses
 * every auto-dismiss timer in the region, and each toast's dismiss and action
 * controls stay in the normal Tab order so a keyboard user can always reach
 * them before the timer resumes.
 *
 * New toasts enter at the anchored edge so the stack grows away from it.
 */

type Edge = "start" | "end" | "top" | "bottom"
type Tone = "info" | "success" | "warning" | "critical"

export interface ToastRecord {
  id: string
  content: React.ReactNode
  tone: Tone
  /** ms before auto-dismiss; 0 keeps the toast until dismissed */
  duration: number
}

export interface ToastOptions {
  tone?: Tone
  duration?: number
  id?: string
}

type Listener = (toasts: ToastRecord[]) => void

/* a module-level store so toast() is callable from anywhere, not only from
   inside the React tree that renders the region */
const store = {
  toasts: [] as ToastRecord[],
  listeners: new Set<Listener>(),
  emit() {
    this.listeners.forEach((listener) => listener(this.toasts))
  },
  add(record: ToastRecord) {
    this.toasts = [...this.toasts, record]
    this.emit()
  },
  remove(id: string) {
    this.toasts = this.toasts.filter((entry) => entry.id !== id)
    this.emit()
  },
  subscribe(listener: Listener) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  },
}

let sequence = 0

function toast(content: React.ReactNode, options: ToastOptions = {}) {
  const id = options.id ?? `toast-${++sequence}`
  store.add({
    id,
    content,
    tone: options.tone ?? "info",
    duration: options.duration ?? 5000,
  })
  return id
}

toast.dismiss = (id: string) => store.remove(id)

export interface ToasterProps extends React.ComponentProps<"div"> {
  /** the viewport edge the stack anchors to */
  edge?: Edge
  /** names the live region for assistive tech */
  label?: string
}

function Toaster({ edge = "end", label = "Notifications", ...props }: ToasterProps) {
  const toasts = React.useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.toasts,
    () => store.toasts
  )
  const [paused, setPaused] = React.useState(false)

  /* one timer per toast; hover or focus anywhere inside pauses them all */
  React.useEffect(() => {
    if (paused) return
    const timers = toasts
      .filter((entry) => entry.duration > 0)
      .map((entry) =>
        setTimeout(() => store.remove(entry.id), entry.duration)
      )
    return () => timers.forEach(clearTimeout)
  }, [paused, toasts])

  /* assertive only when something in the stack warrants interrupting */
  const assertive = toasts.some(
    (entry) => entry.tone === "warning" || entry.tone === "critical"
  )

  return (
    <div
      data-slot="sonner"
      data-edge={edge}
      data-state={paused ? "hover" : undefined}
      role="region"
      aria-label={label}
      aria-live={assertive ? "assertive" : "polite"}
      aria-atomic="false"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setPaused(false)
        }
      }}
      {...props}
    >
      {toasts.map((entry) => (
        <div key={entry.id} data-slot="toast" data-tone={entry.tone}>
          <div data-slot="toast-content">{entry.content}</div>
          <button
            type="button"
            data-slot="toast-close"
            aria-label="Dismiss notification"
            onClick={() => store.remove(entry.id)}
          >
            <XIcon aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  )
}

export { Toaster, toast }
