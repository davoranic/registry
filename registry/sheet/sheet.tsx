import * as React from "react"
import { XIcon } from "lucide-react"

import "./sheet.css"

/* logical edge names survive RTL (anatomy/sheet.json) */
type Edge = "start" | "end" | "top" | "bottom"
type Size = "sm" | "md" | "lg"

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export interface SheetProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  edge?: Edge
  size?: Size
  showClose?: boolean
  children?: React.ReactNode
}

function Sheet({
  open,
  onOpenChange,
  title,
  description,
  footer,
  edge = "end",
  size = "md",
  showClose = true,
  children,
}: SheetProps) {
  const baseId = React.useId()
  const titleId = `${baseId}-title`
  const descriptionId = `${baseId}-description`
  const panelRef = React.useRef<HTMLDivElement>(null)

  /* APG dialog (modal): initial focus into the panel on open,
     focus returned to the opener on close */
  React.useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE)
    ;(firstFocusable ?? panel)?.focus()
    return () => previouslyFocused?.focus()
  }, [open])

  if (!open) return null

  const close = () => onOpenChange?.(false)

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation()
      close()
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
    <div data-slot="sheet" data-state="open">
      <div data-slot="scrim" data-state="open" onClick={close} />
      <div
        ref={panelRef}
        data-slot="panel"
        data-state="open"
        data-edge={edge}
        data-size={size === "md" ? undefined : size}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div data-slot="header">
          <h2 data-slot="title" id={titleId}>
            {title}
          </h2>
          {description && (
            <p data-slot="description" id={descriptionId}>
              {description}
            </p>
          )}
        </div>
        <div data-slot="content">{children}</div>
        {footer && <div data-slot="footer">{footer}</div>}
        {showClose && (
          <button
            type="button"
            data-slot="close"
            aria-label="Close"
            onClick={close}
          >
            <XIcon aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}

export { Sheet }
