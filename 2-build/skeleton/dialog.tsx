/* Dialog skeleton — written from the template's part union: a scrim, a
   panel, a header (optional decoration + optional preheader + title +
   optional description + optional header actions), an optional dedicated
   content scroller, an actions row, and an optional close button.
   Inherits from no design system: which parts render, WHERE the close
   affordance sits and whether it is on by default, whether the body is its
   own scroll region, how the background is suppressed, whether aria-modal
   is set at all and whether the description is programmatically associated
   are ALL received as config.

   FIVE STRUCTURAL AXES, all real, all config'd:

   1. `headerDecoration`. "accent-bar" is a density-scaled vertical stripe
      down the left edge of the header (Salt), which Salt itself SWAPS for a
      status glyph whenever a status is set — the source condition is
      `!disableAccent && !status`, reproduced below. "icon" is a 24px glyph
      (M3's with-icon variant). "none" is shadcn, which has no decoration of
      any kind. Three different marks, not one with a colour delta.

   2. `closeButton`. "optional" (Salt) — DialogCloseButton is a separate
      export the consumer adds, pinned flush at top:0/right:0. "default"
      (shadcn) — showCloseButton defaults to true and the X sits 16px in
      from both edges. "none" (M3) — no close token exists; a basic M3
      dialog closes through its actions or the scrim. The default-ness is
      part of the axis, not just the placement.

   3. `contentScroller`. Salt renders TWO extra divs (a margin box wrapping
      an overflow-y:auto inner with reserved 1px scroll-divider borders) and
      attaches overflow detection to them. shadcn and M3 have NO content
      element at all — children are direct children of the panel, which is
      why shadcn's gap-4 lands between every child. Rendering a wrapper for
      all three would have changed shadcn's box model, the same mistake
      INPUT-MATRIX.md finding 2 corrected with display:contents.

   4. `backgroundSuppression`. "inert" (Salt, via floating-ui's
      outsideElementsInert) removes outside content from hit-testing, focus
      AND the a11y tree using the platform attribute. "aria-hidden" (shadcn,
      via the aria-hidden package's hideOthers) removes it from the a11y
      tree only. Both walk the ancestor chain and mark siblings at every
      level; the branch below does the same and restores exactly what it
      changed.

   5. `initialFocus`. "configurable" (Salt) honours an ordinal into the
      tabbable list — DialogProps.initialFocus, default 0, and Salt's own
      a11y docs prescribe which control should get it. "first-tabbable"
      (shadcn, M3) has no such API.

   EVERY BEHAVIOR ROW IN dialog.template.json IS IMPLEMENTED HERE, and
   scripts/check-dialog-behavior.mjs fails the build if one is not. That
   script exists because locked behavior rows have NO generator gate:
   docs/SELECT-MATRIX.md finding 16 records a documented-but-unimplemented
   dismiss row that passed the generator, passed the axis audit, and was
   found only when the owner tried to close a popup.

   DECLARED GAPS, three:
   (a) NO PORTAL. Salt renders through floating-ui's FloatingPortal (and
       re-applies a SaltProvider inside it because the portal escapes the
       theme scope); shadcn renders through Radix's DialogPortal. This
       component renders the scrim and panel in place as position:fixed
       siblings under a display:contents root, which keeps them inside the
       harness's [data-theme] scope. Different stacking behaviour under a
       transformed ancestor. Declared, not silent.
   (b) SCROLL LOCK reproduces Salt's standard path only (documentElement
       overflow:hidden plus a paddingRight equal to the vanished
       scrollbar's width, ref-counted across nested dialogs). Salt's
       mobile-Safari path (touchmove interception, visualViewport
       handling) is not reproduced.
       Note it is written INLINE ON documentElement, never through a
       theme-scoped custom property — docs/SELECT-MATRIX.md finding 14.
   (c) M3's spec centres the with-icon glyph ABOVE the headline; the row
       layout used here for all three is the registry's neutral choice,
       because material-web is a tokens-only clone with no dialog component
       and no layout token to source that from. Declared in
       docs/DIALOG-MATRIX.md rather than presented as equivalence.

   DECLARED COMPOSITIONS: the action buttons, the close glyph, Salt's
   StatusIndicator glyph and M3's with-icon glyph, the `scrim` (its own
   canonical row in docs/COMPONENTS.md), and Salt's H2/Text typography
   components. All render as neutral placeholders. */
import * as React from "react"

export interface DialogConfig {
  scrim?: boolean
  headerDecoration?: string
  preheader?: boolean
  headerActions?: boolean
  closeButton?: string
  contentScroller?: boolean
  actions?: boolean
  description?: boolean
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
  scrollRegionFocusable?: boolean
  size?: string[]
  status?: string[]
}

export interface DialogProps {
  config: DialogConfig
  open: boolean
  onOpenChange?: (open: boolean) => void
  size?: string
  status?: string
  title?: React.ReactNode
  preheader?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  actions?: React.ReactNode
  headerActions?: React.ReactNode
  /** per-INSTANCE, not per-system: config.closeButton says what the system
      does by default, this overrides it for one dialog. Conflating the two
      is the capability-vs-instance bug the button build already paid for. */
  showCloseButton?: boolean
  /** honoured only when config.initialFocus === "configurable" (Salt) */
  initialFocusIndex?: number
  /** harness affordance, NOT a design-system prop: pin the dialog open and
      neutralise every global side effect (scroll lock, background
      suppression, focus trap, dismissal) so a page can show several at
      once for inspection. Label such an instance PINNED in the harness. */
  forceOpen?: boolean
  /** harness affordance: render fixed -> absolute so a pinned dialog is
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
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  )
}

/* --- scroll lock -----------------------------------------------------
   A refactor of Salt's usePreventScroll standard path (which is itself a
   refactor of react-spectrum's). Ref-counted, so nested dialogs do not
   restore early. The scrollbar-width compensation is the reason a locked
   page does not visibly jump sideways. Written inline on documentElement:
   a measured runtime value must be applied where it is measured, never
   through an intermediate theme-scoped custom property. */
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

/* --- background suppression -----------------------------------------
   The same ancestor walk aria-hidden's hideOthers performs: from the
   dialog outward, mark every sibling at every level. Which ATTRIBUTE is
   written is the config'd difference — Salt inerts, shadcn/M3 aria-hide. */
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
  /* DECLARED DEFERRAL, same convention as select's chevron: a neutral mark
     standing in for Salt's semantic-icon-provider CloseIcon and shadcn's
     lucide XIcon until a registry icon component exists. */
  return (
    <svg viewBox="0 0 16 16" width="100%" height="100%" aria-hidden="true" focusable="false">
      <path d="M4 4 L12 12 M12 4 L4 12" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function DecorationGlyph() {
  /* stands in for Salt's StatusIndicator and M3's with-icon glyph */
  return (
    <svg viewBox="0 0 16 16" width="100%" height="100%" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2.5" fill="currentColor" />
    </svg>
  )
}

export function Dialog({
  config,
  open,
  onOpenChange,
  size,
  status,
  title,
  preheader,
  description,
  children,
  actions,
  headerActions,
  showCloseButton,
  initialFocusIndex,
  forceOpen,
  contained,
  exitDuration = 300,
  id,
  className,
}: DialogProps) {
  const activeSize = size ?? config.size?.[0]
  const decoration = config.headerDecoration ?? "none"
  const closeMode = config.closeButton ?? "none"
  const useScroller = Boolean(config.contentScroller)

  const reactId = React.useId()
  const dialogId = id ?? `dialog-${reactId}`
  const titleId = `${dialogId}-title`
  const descriptionId = `${dialogId}-description`

  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const innerRef = React.useRef<HTMLDivElement | null>(null)
  const returnFocusRef = React.useRef<HTMLElement | null>(null)

  // behavior.exit-animation — Salt keeps the panel mounted for
  // var(--salt-duration-perceptible) after `open` flips false and unmounts
  // early on animationend; Radix does the same through Presence. When the
  // column turns the row off (M3, which has no motion token) the unmount
  // is immediate.
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
  // every GLOBAL side effect is suspended while pinned, so a harness page
  // can show three pinned dialogs at once and stay usable
  const live = isOpen && !forceOpen

  // behavior.scroll-lock
  React.useEffect(() => {
    if (!live || !config.scrollLock) return
    lockPageScroll()
    return unlockPageScroll
  }, [live, config.scrollLock])

  // behavior.background-suppression (+ the mechanism behind aria-modal)
  React.useEffect(() => {
    if (!live) return
    const panel = panelRef.current
    if (!panel) return
    return suppressBackground(panel, config.backgroundSuppression ?? "aria-hidden")
    // `mounted` is a dependency, not decoration: the panel is rendered only
    // once mounted flips true, which happens a render AFTER `live` does. An
    // effect that reads panelRef must re-run on that second render or it
    // sees a null ref once and never fires again.
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
    // `mounted` — see the note on the suppression effect above. Without it
    // this effect ran once against a null panelRef and focus never entered
    // the dialog, while scroll-lock (which reads no ref) worked, so the bug
    // was invisible in a screenshot and to the behavior-checklist gate.
  }, [live, mounted, config.initialFocus, config.focusReturn, initialFocusIndex])

  // behavior.focus-trap — Tab/Shift+Tab cycle, with the wrap both live
  // systems document (Salt accessibility.mdx; Radix FocusScope `loop`)
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
    if (e.shiftKey && (current <= 0)) {
      e.preventDefault()
      items[last].focus()
    } else if (!e.shiftKey && current === last) {
      e.preventDefault()
      items[0].focus()
    }
  }

  // behavior.dismiss-escape — capture phase, so a keypress inside the panel
  // still closes even if a child stops propagation
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

  // behavior.dismiss-outside — pointerdown (not click), the event both real
  // implementations dismiss on, with Radix's own right-click guard
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

  // state.content-overflow + behavior.scroll-region-focusable — Salt's
  // DialogContent measures overflow with a ResizeObserver and toggles
  // scrollTop/scrollBottom on scroll; the same three attributes drive both
  // the scroll dividers and the focusable region.
  const [overflowing, setOverflowing] = React.useState(false)
  const [canScrollUp, setCanScrollUp] = React.useState(false)
  const [canScrollDown, setCanScrollDown] = React.useState(false)

  const measure = React.useCallback(() => {
    const el = innerRef.current
    if (!el) return
    setOverflowing(el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
    setCanScrollUp(el.scrollTop > 0)
    // the source's tolerance is `> 1`, not `> 0`
    setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 1)
  }, [])

  React.useLayoutEffect(() => {
    if (!mounted || !useScroller) return
    measure()
    const el = innerRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [mounted, useScroller, measure, children])

  if (!mounted) return null

  const hasTitle = title !== undefined && title !== null
  const hasDescription = Boolean(config.description) && description !== undefined && description !== null
  const hasPreheader = Boolean(config.preheader) && preheader !== undefined && preheader !== null
  const hasHeaderActions = Boolean(config.headerActions) && headerActions !== undefined && headerActions !== null
  const hasHeader = hasTitle || hasDescription || hasPreheader || hasHeaderActions
  const hasActions = Boolean(config.actions) && actions !== undefined && actions !== null

  // Salt's own condition: the accent bar renders only when there is no
  // status, and a StatusIndicator takes its place when there is one.
  const showAccentBar = decoration === "accent-bar" && !status
  const showIcon = decoration === "icon" || (decoration === "accent-bar" && Boolean(status))

  const renderClose =
    closeMode === "none" ? false : showCloseButton ?? closeMode === "default"

  const body = useScroller ? (
    <div data-slot="dialog-content">
      <div
        ref={innerRef}
        data-slot="dialog-content-inner"
        data-overflow={overflowing ? "" : undefined}
        data-scroll-top={overflowing && canScrollUp ? "" : undefined}
        data-scroll-bottom={overflowing && canScrollDown ? "" : undefined}
        onScroll={measure}
        {...(config.scrollRegionFocusable && overflowing
          ? { role: "region", tabIndex: 0, "aria-labelledby": hasTitle ? titleId : dialogId }
          : {})}
      >
        {children}
      </div>
    </div>
  ) : (
    /* no content element at all — children are direct children of the
       panel, as they are in shadcn and (per spec) M3 */
    children
  )

  return (
    <div data-slot="dialog" data-contained={contained ? "" : undefined}>
      {config.scrim && <div data-slot="dialog-scrim" data-state={isOpen ? "open" : "closed"} />}
      <div
        ref={panelRef}
        id={dialogId}
        data-slot="dialog-panel"
        data-size={activeSize}
        data-status={status}
        data-state={isOpen ? "open" : "closed"}
        role="dialog"
        aria-modal={config.ariaModal ? true : undefined}
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-describedby={config.describedBy && hasDescription ? descriptionId : undefined}
        onKeyDown={onPanelKeyDown}
        className={className}
      >
        {hasHeader && (
          <div data-slot="dialog-header" data-decoration={decoration}>
            {showAccentBar && <span data-slot="dialog-accent-bar" aria-hidden="true" />}
            {showIcon && (
              <span data-slot="dialog-header-icon" aria-hidden="true">
                <DecorationGlyph />
              </span>
            )}
            <div data-slot="dialog-header-text">
              {hasTitle && (
                <h2 id={titleId} data-slot="dialog-title">
                  {hasPreheader && <span data-slot="dialog-preheader">{preheader}</span>}
                  {title}
                </h2>
              )}
              {hasDescription && (
                <p id={descriptionId} data-slot="dialog-description">
                  {description}
                </p>
              )}
            </div>
            {hasHeaderActions && <div data-slot="dialog-header-actions">{headerActions}</div>}
          </div>
        )}

        {body}

        {hasActions && <div data-slot="dialog-actions">{actions}</div>}

        {renderClose && (
          <button
            type="button"
            data-slot="dialog-close"
            aria-label="Close dialog"
            onClick={() => onOpenChange?.(false)}
          >
            <CloseGlyph />
          </button>
        )}
      </div>
    </div>
  )
}
