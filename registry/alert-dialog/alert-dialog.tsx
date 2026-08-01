import * as React from "react"
import { TriangleAlertIcon } from "lucide-react"

import "./alert-dialog.css"

type Size = "sm" | "md" | "lg"

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export interface AlertDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  title: React.ReactNode
  /* required by the anatomy — an alert dialog always states its consequence */
  description: React.ReactNode
  cancelLabel?: React.ReactNode
  actionLabel?: React.ReactNode
  onCancel?: () => void
  onAction?: () => void
  /* the confirming action carries danger emphasis when the consequence is destructive */
  destructive?: boolean
  showMedia?: boolean
  size?: Size
}

function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = "Cancel",
  actionLabel = "Continue",
  onCancel,
  onAction,
  destructive = false,
  showMedia = false,
  size = "sm",
}: AlertDialogProps) {
  const baseId = React.useId()
  const titleId = `${baseId}-title`
  const descriptionId = `${baseId}-description`
  const panelRef = React.useRef<HTMLDivElement>(null)
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  /* APG alertdialog: initial focus on the least destructive action;
     focus returns to the opener on close */
  React.useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    cancelRef.current?.focus()
    return () => previouslyFocused?.focus()
  }, [open])

  if (!open) return null

  const close = () => onOpenChange?.(false)

  const cancel = () => {
    onCancel?.()
    close()
  }

  const confirm = () => {
    onAction?.()
    close()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation()
      cancel()
      return
    }
    if (event.key !== "Tab") return
    /* Tab cycles inside the panel */
    const panel = panelRef.current
    if (!panel) return
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (focusable.length === 0) {
      event.preventDefault()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div data-slot="alert-dialog" data-state="open">
      {/* no dismissal on the scrim — an alert dialog is answered, not dismissed */}
      <div data-slot="scrim" data-state="open" />
      <div
        ref={panelRef}
        data-slot="panel"
        data-state="open"
        data-size={size === "sm" ? undefined : size}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        {showMedia && (
          <div
            data-slot="media"
            data-tone={destructive ? "critical" : "warning"}
            aria-hidden="true"
          >
            <TriangleAlertIcon />
          </div>
        )}
        <div data-slot="header">
          <h2 data-slot="title" id={titleId}>
            {title}
          </h2>
          <p data-slot="description" id={descriptionId}>
            {description}
          </p>
        </div>
        <div data-slot="footer">
          <button
            ref={cancelRef}
            type="button"
            data-slot="cancel"
            onClick={cancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            data-slot="action"
            data-emphasis={destructive ? "danger" : "primary"}
            onClick={confirm}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export { AlertDialog }
