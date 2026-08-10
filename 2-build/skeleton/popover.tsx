/* Popover skeleton — written from the template's part union: a trigger
   (clones the consumer's child, the SAME technique tooltip.tsx already uses
   and the one Salt's own real `OverlayTrigger` performs via `cloneElement`),
   an optional separate anchor (shadcn only — a positioning reference
   distinct from the trigger), a popup holding ARBITRARY consumer content,
   an optional arrow, an optional header region (title + description +
   actions), an optional dedicated close button, and an optional dedicated
   scrollable content wrapper. Inherits from no design system.

   THE SHARPEST STRUCTURAL AXIS, config'd: `modalFocusTrap`. Salt's real
   `Overlay` renders `role="dialog"`, `aria-modal="true"`, and passes
   `outsideElementsInert: true` to floating-ui's own `FloatingFocusManager`
   (whose own default `modal` option is `true`, not overridden) — a REAL
   focus-trapping, page-inerting overlay. shadcn's canonical Popover
   (Radix's own documented `modal` prop, default `false`) is NOT modal: Tab
   can leave the panel, and the rest of the page stays fully interactive.
   When `config.modalFocusTrap` is on, this chassis reuses the SAME two
   mechanisms dialog.tsx already proved correct: `suppressBackground()`
   (walks every ancestor level from the popup outward, marking siblings
   `inert`) and a Tab/Shift+Tab wrap handler scoped to the popup's own
   tabbable list. When it is off, neither runs — Tab is free to leave, and
   the rest of the page never has `inert` written onto it. Every `useEffect`/
   `useLayoutEffect` below that reads a ref to a conditionally-rendered node
   lists the state gating that node's existence in its own dependency array
   (the checkbox/dialog "stale null ref" class of bug this pipeline keeps
   re-finding when that rule is skipped).

   POSITIONING is the SAME declared gap tooltip.tsx already carries (see
   behavior.positioning-engine): a `getBoundingClientRect()` placement
   calculation with a fixed offset, not Salt's real `@floating-ui/react`
   middleware stack or shadcn's real (external, unvendored) Radix Popper
   primitive. DISMISS-OUTSIDE is a real document-level pointerdown listener,
   the SAME proven pattern dropdown-menu.tsx/select.tsx already carry.

   `behavior.close-button-action`: Salt's own real `OverlayPanelCloseButton`
   requires the CONSUMER to wire `onClick` by hand (confirmed: the component
   itself has no `useOverlayContext()` call). This chassis, as the union
   component that already owns its own open state, completes that real,
   confirmed gap by wiring its own built-in close button directly to its
   internal close function — a deliberate, LABELLED registry completion
   (see POPOVER-MATRIX.md Finding 3), not a silent liberty. */
import * as React from "react"

export interface PopoverConfig {
  anchor?: boolean
  arrow?: boolean
  header?: boolean
  title?: boolean
  description?: boolean
  headerActions?: boolean
  closeButton?: boolean
  content?: boolean
  modalFocusTrap?: boolean
  placement?: string[]
  align?: string[]
}

export interface PopoverProps {
  config: PopoverConfig
  /** the trigger element — cloned, the same technique tooltip.tsx uses */
  children: React.ReactElement<Record<string, unknown>>
  /** rendered when config.anchor is on (shadcn's PopoverAnchor): a SEPARATE
      positioning reference. When absent, the trigger doubles as the anchor
      (Salt's own real shape — see structure.anchor). */
  anchorElement?: React.ReactElement<Record<string, unknown>>
  title?: React.ReactNode
  description?: React.ReactNode
  headerActions?: React.ReactNode
  content?: React.ReactNode
  placement?: string
  align?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** harness affordance: force the popup open so states are inspectable
      without interaction. Not a design-system prop. */
  forceOpen?: boolean
  className?: string
  id?: string
}

const TABBABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

function tabbablesIn(root: HTMLElement | null): HTMLElement[] {
  if (!root) return []
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  )
}

/* behavior.modal-focus-trap's own background-inert half — the SAME ancestor
   walk dialog.tsx's own suppressBackground() performs (Salt's real
   `outsideElementsInert` mechanism), reused rather than reinvented. Always
   writes/undoes the `inert` attribute — shadcn's own non-modal Popover has
   no background-suppression concept at all to choose an alternate mode
   from, unlike dialog's own Salt-vs-shadcn attribute choice.

   TAKES THE WRAPPER, NOT THE POPUP. Salt's real panel renders through
   `FloatingPortal` — DOM-wise, the trigger and the (portaled) panel are NOT
   siblings, so the ancestor walk that marks "everything outside the
   floating tree" inert never touches the trigger itself. This chassis
   deliberately does NOT portal (the same declared gap dialog.tsx's own "(a)
   NO PORTAL" note already carries) — the trigger and popup are real DOM
   siblings inside one `[data-slot="popover"]` wrapper. Starting the walk
   from the POPUP would therefore inert the TRIGGER too (a sibling within
   the same immediate parent), making it impossible to close by clicking it
   again — confirmed as a real bug during review, not a hypothetical: fixed
   by starting the walk one level up, from the wrapper that contains BOTH
   the trigger and the popup as one atomic non-inert unit. */
function suppressBackground(wrapper: HTMLElement): () => void {
  const undo: Array<() => void> = []
  let node: HTMLElement | null = wrapper
  while (node && node.parentElement) {
    const parent: HTMLElement = node.parentElement
    for (const sibling of Array.from(parent.children)) {
      if (sibling === node || !(sibling instanceof HTMLElement)) continue
      if (sibling.contains(wrapper)) continue
      const had = sibling.hasAttribute("inert")
      if (!had) {
        sibling.setAttribute("inert", "")
        undo.push(() => sibling.removeAttribute("inert"))
      }
    }
    node = parent
    if (parent === document.body) break
  }
  return () => {
    for (const fn of undo) fn()
  }
}

function CloseGlyph() {
  // DECLARED DEFERRAL, the same convention every prior component's
  // PlaceholderIcon/CloseGlyph used: a neutral mark standing in for Salt's
  // semantic-icon-provider CloseIcon / shadcn's own icon set until a
  // registry icon-set component exists.
  return (
    <svg viewBox="0 0 16 16" width="100%" height="100%" aria-hidden="true" focusable="false">
      <path d="M4 4 L12 12 M12 4 L4 12" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

const OFFSET = 8 // fixed approximation of Salt's real offset(11) / shadcn's real sideOffset=4 —
                  // see behavior.positioning-engine's own declared-gap note

export function Popover({
  config,
  children,
  anchorElement,
  title,
  description,
  headerActions,
  content,
  placement,
  align,
  open: openProp,
  onOpenChange,
  forceOpen,
  className,
  id,
}: PopoverProps) {
  const activePlacement = placement ?? config.placement?.[0] ?? "top"
  const activeAlign = align ?? config.align?.[0] ?? "center"

  const [openState, setOpenState] = React.useState(false)
  const isControlled = openProp !== undefined
  const open = Boolean(forceOpen) || (isControlled ? openProp! : openState)
  const live = open && !forceOpen // every global side effect suspends while pinned — dialog.tsx's own convention

  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: -9999, left: -9999 })

  const reactId = React.useId()
  const popoverId = id ?? `popover-${reactId}`
  const titleId = `${popoverId}-title`
  const descriptionId = `${popoverId}-description`

  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const anchorRef = React.useRef<HTMLElement | null>(null)
  const popupRef = React.useRef<HTMLDivElement | null>(null)
  const returnFocusRef = React.useRef<HTMLElement | null>(null)

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setOpenState(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  const close = React.useCallback(() => setOpen(false), [setOpen])

  // behavior.positioning-engine's own declared gap: measure the ANCHOR
  // (config.anchor ? anchorRef : triggerRef — behavior.trigger-interaction /
  // structure.anchor) and the popup, place with a fixed offset. `open` gates
  // popupRef.current's existence, so it is in this effect's own deps.
  const recompute = React.useCallback(() => {
    const ref = config.anchor && anchorRef.current ? anchorRef.current : triggerRef.current
    const popup = popupRef.current
    if (!ref || !popup) return
    const rr = ref.getBoundingClientRect()
    const pr = popup.getBoundingClientRect()
    let top = 0
    let left = 0
    switch (activePlacement) {
      case "bottom":
        top = rr.bottom + OFFSET
        left =
          activeAlign === "start" ? rr.left : activeAlign === "end" ? rr.right - pr.width : rr.left + rr.width / 2 - pr.width / 2
        break
      case "left":
        top = rr.top + rr.height / 2 - pr.height / 2
        left = rr.left - pr.width - OFFSET
        break
      case "right":
        top = rr.top + rr.height / 2 - pr.height / 2
        left = rr.right + OFFSET
        break
      default: // "top"
        top = rr.top - pr.height - OFFSET
        left =
          activeAlign === "start" ? rr.left : activeAlign === "end" ? rr.right - pr.width : rr.left + rr.width / 2 - pr.width / 2
    }
    setPos({ top, left })
  }, [activePlacement, activeAlign, config.anchor])

  React.useLayoutEffect(() => {
    if (open) recompute()
  }, [open, recompute])

  // behavior.initial-focus + behavior.focus-return. `open` gates
  // popupRef.current's existence — listed in this effect's own deps (the
  // checkbox/dialog "stale null ref" lesson).
  React.useEffect(() => {
    if (!live) return
    const popup = popupRef.current
    if (!popup) return
    // FloatingFocusManager's real returnFocus:true restores whatever had
    // focus before open — but that's only meaningful if something OTHER
    // than <body> actually had it. A programmatic `.click()` (this
    // project's own conformance harness, and Safari's real mouse-click-
    // doesn't-focus-buttons quirk) never moves focus onto the trigger in
    // the first place, so document.activeElement is still <body> at this
    // point; falling back to the trigger ref keeps focus-return working in
    // both cases without abandoning the cited library semantic for the
    // common case (a real click or a keyboard Enter/Space DOES focus the
    // trigger, so this fallback is a no-op then).
    const active = document.activeElement
    returnFocusRef.current =
      active instanceof HTMLElement && active !== document.body ? active : triggerRef.current
    popup.setAttribute("tabindex", "-1")
    popup.focus()
    return () => {
      returnFocusRef.current?.focus()
    }
  }, [live])

  // behavior.modal-focus-trap's own background-inert half. Only runs when
  // config.modalFocusTrap is on (Salt) — shadcn's own real non-modal Popover
  // never suppresses the background at all.
  React.useEffect(() => {
    if (!live || !config.modalFocusTrap) return
    const wrapper = wrapperRef.current
    if (!wrapper) return
    return suppressBackground(wrapper)
  }, [live, config.modalFocusTrap])

  // behavior.modal-focus-trap's own Tab-wrap half — reuses dialog.tsx's own
  // proven cycle logic, scoped to the popup's own tabbable list (which
  // includes the popup itself via tabindex=-1 when it holds no other
  // tabbable content).
  const onPopupKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      close()
      return
    }
    if (!config.modalFocusTrap || e.key !== "Tab") return
    const popup = popupRef.current
    if (!popup) return
    const items = tabbablesIn(popup)
    if (items.length === 0) {
      e.preventDefault()
      return
    }
    const current = items.indexOf(document.activeElement as HTMLElement)
    const last = items.length - 1
    if (e.shiftKey && current <= 0) {
      e.preventDefault()
      items[last].focus()
    } else if (!e.shiftKey && current === last) {
      e.preventDefault()
      items[0].focus()
    }
  }

  // behavior.dismiss-outside — a real document-level pointerdown listener,
  // the SAME proven pattern dropdown-menu.tsx/select.tsx already carry.
  React.useEffect(() => {
    if (!live) return
    const onPointerDown = (e: Event) => {
      const t = e.target as Node | null
      if (!t) return
      if (triggerRef.current?.contains(t)) return
      if (anchorRef.current?.contains(t)) return
      if (popupRef.current?.contains(t)) return
      close()
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    return () => document.removeEventListener("pointerdown", onPointerDown, true)
  }, [live, close])

  const trigger = React.cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node
    },
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    "data-slot": "popover-trigger",
    onClick: (e: React.MouseEvent) => {
      ;(children.props.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e)
      setOpen(!open)
    },
  })

  const anchorChild = config.anchor && anchorElement
    ? React.cloneElement(anchorElement, {
        ref: (node: HTMLElement | null) => {
          anchorRef.current = node
        },
        "data-slot": "popover-anchor",
      })
    : null

  const showHeader = Boolean(config.header && (config.title || config.description || (config.headerActions && headerActions)))

  return (
    <div data-slot="popover" className={className} ref={wrapperRef}>
      {trigger}
      {anchorChild}
      {open && (
        <div
          ref={popupRef}
          data-slot="popover-popup"
          id={popoverId}
          role="dialog"
          aria-modal={config.modalFocusTrap ? true : undefined}
          aria-labelledby={config.title && title ? titleId : undefined}
          aria-describedby={config.description && description ? descriptionId : undefined}
          data-placement={activePlacement}
          style={{ top: pos.top, left: pos.left }}
          onKeyDown={onPopupKeyDown}
        >
          {config.arrow && (
            <svg data-slot="popover-arrow" viewBox="0 0 2 1" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,0 H2 L1,1 Z" />
            </svg>
          )}
          {showHeader && (
            <div data-slot="popover-header">
              <div data-slot="popover-header-text">
                {config.title && title && (
                  <h2 data-slot="popover-title" id={titleId}>
                    {title}
                  </h2>
                )}
                {config.description && description && (
                  <p data-slot="popover-description" id={descriptionId}>
                    {description}
                  </p>
                )}
              </div>
              {config.headerActions && headerActions && (
                <div data-slot="popover-header-actions">{headerActions}</div>
              )}
            </div>
          )}
          {config.closeButton && (
            <button
              type="button"
              data-slot="popover-close-button"
              aria-label="Close"
              onClick={close}
            >
              <CloseGlyph />
            </button>
          )}
          {config.content ? (
            <div data-slot="popover-content">{content}</div>
          ) : (
            content
          )}
        </div>
      )}
    </div>
  )
}
