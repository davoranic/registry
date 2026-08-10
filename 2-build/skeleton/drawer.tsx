/* Drawer skeleton — written from the template's part union: a scrim, an
   EDGE-ANCHORED panel (left/top/right/bottom, via `position`), an optional
   header (optional title + optional description), an optional footer, an
   optional close button, an optional drag handle. Inherits from no design
   system.

   THE DEFINING DIFFERENCE FROM dialog.tsx: geometry, not mechanism. Every
   focus/scroll/dismissal mechanism below is copied from dialog.tsx's own
   proven implementation, adapted only where a REAL, sourced difference was
   found in Drawer.tsx itself (see docs/DRAWER-MATRIX.md):

   1. Salt's own Drawer does NOT lock page scroll. Drawer.tsx never passes
      `lockScroll` to its FloatingComponent, unlike Dialog.tsx. So this
      skeleton's `scrollLock` config branch, when off, simply does nothing —
      exactly like Salt's own column.
   2. Salt's own Drawer COUPLES Escape and outside-press dismissal behind a
      single `disableDismiss` flag (useDismiss's own `enabled` option),
      where Dialog only ever gates outside-press with it. This skeleton keeps
      dismissOnEscape and dismissOnOutside as two independent config flags
      (matching the template's own row grain), but the Salt harness instance
      sets them from the SAME source prop so the coupling is reproduced
      faithfully rather than invented as two independent Salt toggles.
   3. shadcn's Drawer (vaul) is NOT vendored in this clone — every shadcn
      behaviour cell this skeleton implements for that column is `[R]`, and
      the skeleton implements the SAME mechanism dialog.tsx already proved
      for its own [R] M3 column: a real, working fallback, not a stub.

   FOUR STRUCTURAL AXES, all real, all config'd:

   1. `position`. Which edge the panel is anchored to and slides in from.
      left/right => height:100%, width from content or config; top/bottom =>
      width:100%, height from content or config. The base CSS sets the
      invariant inset/height/width per position; per-system SIZE/CORNER/
      BORDER/ANIMATION values are config'd on top via data-position.
   2. `header`/`title`/`description`. shadcn renders a real, dedicated
      DrawerHeader/DrawerTitle/DrawerDescription trio. Salt's own Drawer has
      NONE of these — a real, confirmed absence, not a gap: Salt consumers
      compose their own <H2>/<Text> as plain children. The skeleton renders
      nothing extra when `header` is off; `title`/`description` render
      inside the header only when it exists.
   3. `closeButton`. "optional" (Salt) — a separate, consumer-added button,
      positioned flush at the panel's own corner via a fixed + negative-
      margin rule (Salt's OWN mechanism, not Dialog's absolute top:0/right:0
      — see the template row's own note). "manual" (shadcn) — vaul's
      DrawerClose is entirely UNSTYLED; this skeleton therefore renders NO
      default close affordance for that column at all, matching source
      exactly rather than inventing a styled one. "none" (M3) — no close
      token exists.
   4. `dragHandle`. Real in shadcn and in M3's own sheet-bottom tokens, and
      in BOTH cases ONLY for position="bottom" — confirmed independently in
      two different real sources. The skeleton renders the handle ONLY when
      position is "bottom", never approximating with "a handle on every
      edge".

   DECLARED GAPS, four (three inherited from dialog.tsx, one new):
   (a) NO PORTAL — same reasoning as dialog.tsx.
   (b) SCROLL LOCK reproduces Salt's own standard path, when the column asks
       for it — see dialog.tsx's own note; unchanged here.
   (c) M3's spec places sheet chrome the same registry-neutral way dialog.tsx
       already declares for its own icon placement.
   (d) THE DRAG GESTURE ITSELF. vaul's own pointer-tracking/velocity/snap-
       point math is external and unvendored (confirmed: no vaul/ directory
       anywhere under 3-source). This skeleton renders the drag HANDLE (a
       real, sized, positioned bar) but the handle is NOT interactive — no
       swipe-to-dismiss, no snap points. Declared, not silently reimplemented
       and not silently dropped.

   DECLARED COMPOSITIONS: the footer's action buttons, the close glyph,
   Salt's own composed Button inside DrawerCloseButton, the `scrim` (its own
   canonical row in docs/COMPONENTS.md, borrowed here exactly as dialog.tsx
   borrows it), and the portal/floating engine. All render as neutral
   placeholders or, for the portal, nothing at all. */
import * as React from "react"

export interface DrawerConfig {
  scrim?: boolean
  header?: boolean
  title?: boolean
  description?: boolean
  footer?: boolean
  closeButton?: string
  dragHandle?: boolean
  ariaModal?: boolean
  backgroundSuppression?: string
  focusTrap?: boolean
  initialFocus?: string
  focusReturn?: boolean
  dismissOnEscape?: boolean
  dismissOnOutside?: boolean
  scrollLock?: boolean
  describedBy?: boolean
  exitAnimation?: boolean
  position?: string[]
  variant?: string[]
}

export interface DrawerProps {
  config: DrawerConfig
  open: boolean
  onOpenChange?: (open: boolean) => void
  position?: string
  variant?: string
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  /** per-INSTANCE override of config.closeButton's default-rendering rule —
      same capability-vs-instance split dialog.tsx's own showCloseButton
      makes. */
  showCloseButton?: boolean
  /** honoured only when config.initialFocus === "configurable" (Salt) */
  initialFocusIndex?: number
  /** harness affordance, NOT a design-system prop: pin the drawer open and
      neutralise every global side effect, same convention as dialog.tsx. */
  forceOpen?: boolean
  /** harness affordance: render fixed -> absolute so a pinned drawer is
      contained by its stage instead of covering the viewport. */
  contained?: boolean
  /** how long the exit animation runs, when config.exitAnimation is on */
  exitDuration?: number
  id?: string
  className?: string
}

const TABBABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

function tabbablesIn(root: HTMLElement | null): HTMLElement[] {
  if (!root) return []
  // NOT `el.offsetParent !== null`, copied uncritically from dialog.tsx: per
  // spec, offsetParent is ALWAYS null for a position:fixed element,
  // regardless of real visibility — and Salt's own DrawerCloseButton.css
  // genuinely uses position:fixed (the source's own negative-margin corner
  // trick, reproduced verbatim in style.close-button.position). That made
  // the close button silently invisible to this filter whenever it was the
  // only tabbable target, so initial focus fell through to the panel
  // itself. getClientRects().length is unaffected by the positioning
  // scheme and still correctly excludes display:none/detached elements.
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (el) => el.getClientRects().length > 0 || el === document.activeElement,
  )
}

/* --- scroll lock -------------------------------------------------------
   Byte-identical mechanism to dialog.tsx's own — copied, not reinvented,
   per the standing instruction to reuse dialog's proven code. A SEPARATE
   module-level counter from dialog.tsx's own: each skeleton file is
   self-contained, matching every other component pair in this pipeline. */
let scrollLockCount = 0
let restoreScroll: (() => void) | null = null

function lockPageScroll() {
  scrollLockCount += 1
  if (scrollLockCount > 1) return
  const el = document.documentElement
  const prevOverflow = el.style.overflow
  const prevPadding = el.style.paddingRight
  const gap = window.innerWidth - el.clientWidth
  el.style.overflow = "hidden"
  el.style.paddingRight = `${gap}px`
  restoreScroll = () => {
    el.style.overflow = prevOverflow
    el.style.paddingRight = prevPadding
  }
}

function unlockPageScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0 && restoreScroll) {
    restoreScroll()
    restoreScroll = null
  }
}

/* --- background suppression --------------------------------------------
   Byte-identical mechanism to dialog.tsx's own. */
function suppressBackground(panel: HTMLElement, mode: string): () => void {
  const undo: Array<() => void> = []
  let node: HTMLElement | null = panel
  while (node && node.parentElement) {
    const parent: HTMLElement = node.parentElement
    for (const sibling of Array.from(parent.children)) {
      if (sibling === node || !(sibling instanceof HTMLElement)) continue
      if (sibling.contains(panel)) continue
      if (mode === "inert") {
        const had = sibling.hasAttribute("inert")
        if (!had) {
          sibling.setAttribute("inert", "")
          undo.push(() => sibling.removeAttribute("inert"))
        }
      } else {
        const prev = sibling.getAttribute("aria-hidden")
        sibling.setAttribute("aria-hidden", "true")
        undo.push(() => {
          if (prev === null) sibling.removeAttribute("aria-hidden")
          else sibling.setAttribute("aria-hidden", prev)
        })
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
  /* DECLARED DEFERRAL, same convention as dialog.tsx's own CloseGlyph. */
  return (
    <svg viewBox="0 0 16 16" width="100%" height="100%" aria-hidden="true" focusable="false">
      <path d="M4 4 L12 12 M12 4 L4 12" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function Drawer({
  config,
  open,
  onOpenChange,
  position,
  variant,
  title,
  description,
  children,
  footer,
  showCloseButton,
  initialFocusIndex,
  forceOpen,
  contained,
  exitDuration = 300,
  id,
  className,
}: DrawerProps) {
  const activePosition = position ?? config.position?.[0] ?? "left"
  const activeVariant = variant ?? config.variant?.[0]
  const closeMode = config.closeButton ?? "none"

  const reactId = React.useId()
  const drawerId = id ?? `drawer-${reactId}`
  const titleId = `${drawerId}-title`
  const descriptionId = `${drawerId}-description`

  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const returnFocusRef = React.useRef<HTMLElement | null>(null)

  // behavior.exit-animation — same pattern as dialog.tsx: Salt keeps the
  // panel mounted for var(--salt-duration-perceptible) after `open` flips
  // false; shadcn's vaul does the same via its own Presence-like mechanism
  // (asymmetric open/close duration, see the template row's own note). M3
  // (no motion token) unmounts immediately.
  const [mounted, setMounted] = React.useState(open || Boolean(forceOpen))
  React.useEffect(() => {
    if (open || forceOpen) {
      setMounted(true)
      return
    }
    if (!config.exitAnimation) {
      setMounted(false)
      return
    }
    const t = setTimeout(() => setMounted(false), exitDuration)
    return () => clearTimeout(t)
  }, [open, forceOpen, config.exitAnimation, exitDuration])

  const isOpen = open || Boolean(forceOpen)
  const live = isOpen && !forceOpen

  // behavior.scroll-lock — a no-op whenever config.scrollLock is off, which
  // is exactly Salt's own real behaviour (Drawer.tsx never requests it).
  React.useEffect(() => {
    if (!live || !config.scrollLock) return
    lockPageScroll()
    return unlockPageScroll
  }, [live, config.scrollLock])

  // behavior.background-suppression
  React.useEffect(() => {
    if (!live) return
    const panel = panelRef.current
    if (!panel) return
    return suppressBackground(panel, config.backgroundSuppression ?? "aria-hidden")
    // `mounted` — see dialog.tsx's own identical note: the panel exists only
    // once mounted flips true, a render AFTER `live` does.
  }, [live, mounted, config.backgroundSuppression])

  // behavior.initial-focus + behavior.focus-return
  React.useEffect(() => {
    if (!live) return
    const panel = panelRef.current
    if (!panel) return
    if (config.focusReturn) {
      const active = document.activeElement
      returnFocusRef.current = active instanceof HTMLElement ? active : null
    }
    const items = tabbablesIn(panel)
    const wanted =
      config.initialFocus === "configurable" && typeof initialFocusIndex === "number"
        ? initialFocusIndex
        : 0
    const target = items[wanted] ?? items[0] ?? panel
    if (target === panel) panel.setAttribute("tabindex", "-1")
    target.focus()
    return () => {
      if (config.focusReturn) returnFocusRef.current?.focus()
    }
  }, [live, mounted, config.initialFocus, config.focusReturn, initialFocusIndex])

  // behavior.focus-trap
  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    if (!config.focusTrap || e.key !== "Tab" || !live) return
    const panel = panelRef.current
    if (!panel) return
    const items = tabbablesIn(panel)
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

  // behavior.dismiss-escape
  React.useEffect(() => {
    if (!live || !config.dismissOnEscape) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        onOpenChange?.(false)
      }
    }
    document.addEventListener("keydown", onKeyDown, true)
    return () => document.removeEventListener("keydown", onKeyDown, true)
  }, [live, config.dismissOnEscape, onOpenChange])

  // behavior.dismiss-outside
  React.useEffect(() => {
    if (!live || !config.dismissOnOutside) return
    const onPointerDown = (e: PointerEvent) => {
      const isRightClick = e.button === 2 || (e.button === 0 && e.ctrlKey)
      if (isRightClick) return
      const target = e.target as Node | null
      if (!target) return
      if (panelRef.current?.contains(target)) return
      onOpenChange?.(false)
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    return () => document.removeEventListener("pointerdown", onPointerDown, true)
  }, [live, config.dismissOnOutside, onOpenChange])

  if (!mounted) return null

  const hasTitle = Boolean(config.title) && title !== undefined && title !== null
  const hasDescription = Boolean(config.description) && description !== undefined && description !== null
  const hasHeader = Boolean(config.header) && (hasTitle || hasDescription)
  const hasFooter = Boolean(config.footer) && footer !== undefined && footer !== null

  // closeMode "optional" (Salt) and "manual" (shadcn) both require the
  // CONSUMER to add the button — unlike dialog.tsx's shadcn column, NEITHER
  // of this component's non-"none" modes renders one by default (see
  // structure.close-button's own note: shadcn's real DrawerClose is bare
  // and unstyled, with no showCloseButton-style default-on flag at all).
  // Only an explicit showCloseButton=true ever renders it; "none" (M3) can
  // never render one regardless of the instance prop.
  const closeAllowed = closeMode !== "none"
  const renderClose = closeAllowed && Boolean(showCloseButton)

  // structure.drag-handle — real in two sources, and BOTH are bottom-only.
  const showDragHandle = Boolean(config.dragHandle) && activePosition === "bottom"

  return (
    <div data-slot="drawer" data-contained={contained ? "" : undefined}>
      {config.scrim && <div data-slot="drawer-scrim" data-state={isOpen ? "open" : "closed"} />}
      <div
        ref={panelRef}
        id={drawerId}
        data-slot="drawer-panel"
        data-position={activePosition}
        data-variant={activeVariant}
        data-state={isOpen ? "open" : "closed"}
        role="dialog"
        aria-modal={config.ariaModal ? true : undefined}
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-describedby={config.describedBy && hasDescription ? descriptionId : undefined}
        onKeyDown={onPanelKeyDown}
        className={className}
      >
        {showDragHandle && <div data-slot="drawer-drag-handle" aria-hidden="true" />}

        {hasHeader && (
          <div data-slot="drawer-header">
            {hasTitle && (
              <h2 id={titleId} data-slot="drawer-title">
                {title}
              </h2>
            )}
            {hasDescription && (
              <p id={descriptionId} data-slot="drawer-description">
                {description}
              </p>
            )}
          </div>
        )}

        {children}

        {hasFooter && <div data-slot="drawer-footer">{footer}</div>}

        {renderClose && (
          <button
            type="button"
            data-slot="drawer-close"
            aria-label="Close drawer"
            onClick={() => onOpenChange?.(false)}
          >
            <CloseGlyph />
          </button>
        )}
      </div>
    </div>
  )
}
