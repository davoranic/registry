/* Tabs skeleton — written from the template's part union: an optional tab
   bar (with an optional full-width divider and an optional horizontal
   inset), a tablist, tabs that are EITHER a single button OR a
   wrapper+trigger pair, an optional icon slot, an optional badge slot, an
   optional per-tab actions slot, an active indicator in one of three
   mechanisms, an optional overflow menu, and panels.
   Inherits from no design system: which parts render, how many elements a
   tab is, whether focus selects, whether a disabled tab is reachable,
   whether an inactive panel is hidden or unmounted, whether the panel is
   always focusable, which edge the mark sits on and how it moves are ALL
   received as config.

   SIX STRUCTURAL / BEHAVIOURAL AXES, all real, all config'd:

   1. `tabShell`. "wrapper" (Salt) — <Tab> is a role="presentation" DIV
      carrying every box style and <TabTrigger> is the role="tab" BUTTON
      inside it, `all: unset` with a ::before full-size hit area. The split
      exists so TabAction buttons can sit inside the tab but outside the
      button (nested interactive content in a <button> is invalid HTML).
      "single" (shadcn, M3) — the tab IS the button. Both shells keep the
      box styles on [data-slot="tab"] so no style row has to know which.

   2. `indicatorMotion`. "static" (Salt) — a per-tab mark with no
      transition anywhere in the source CSS; it jumps. "fade" (shadcn) —
      a per-tab mark that is ALWAYS painted and hidden with opacity 0,
      cross-fading in place. "slide" (M3 [R]) — ONE mark in the strip that
      measures the selected tab and translates to it.
      The measured value is written INLINE ON THE INDICATOR ELEMENT, never
      through an intermediate theme-scoped custom property: a var() inside
      a custom-property declaration is substituted where it is DECLARED,
      and a fallback turns that failure into a plausible-looking number
      (docs/SELECT-MATRIX.md finding 14 — the popup that rendered 190px
      too narrow with every gate green).

   3. `activationMode`. "automatic" (shadcn's Radix default, M3 [R]) —
      focusing a tab selects it, so arrowing swaps the panel on every step.
      "manual" (Salt) — arrowing moves focus only; Enter/Space or a press
      commits. Invisible in a screenshot, which is why it is asserted by
      scripts/check-tabs-behavior.mjs.

   4. `disabledNavigation`. "reachable" (Salt) — aria-disabled, still in
      the roving order, activation blocked separately. "skipped" (shadcn) —
      the native disabled attribute plus removal from the roving order.

   5. `panelMounting` / `panelFocusable`. Salt keeps every panel mounted
      and hidden, and makes it a tab stop only when it has NO focusable
      children (measured with a MutationObserver). Radix unmounts inactive
      panels and hard-codes tabIndex={0} on every one. Two libraries, one
      APG sentence, opposite conclusions — the same shape as dialog's
      aria-modal split.

   6. `overflowMenu`. Salt only. The strip measures its tabs and collapses
      the ones that no longer fit behind a button that opens a second,
      VERTICAL role="tablist".

   EVERY BEHAVIOR ROW IN tabs.template.json IS IMPLEMENTED HERE, and
   scripts/check-tabs-behavior.mjs fails the build if one is not. That
   script exists because locked behavior rows have NO generator gate
   (docs/SELECT-MATRIX.md finding 16) — and because two dialog effects
   passed that same gate and never executed (docs/DIALOG-MATRIX.md's
   closing section). Its report repeats that caveat.

   THE DIALOG TRAP, GUARDED HERE. Every useEffect below that reads a ref
   lists, in its dependency array, the state that gates the node it reads:
     - the overflow measurement reads listRef/tabElsRef  -> deps include
       visibleCount, items and menuOpen
     - the slide-indicator measurement reads indicatorRef and the selected
       tab's element        -> deps include selected, visibleCount,
                               orientation, emphasis and appearance
     - the panel-focusable measurement reads panelRefs   -> deps include
       selected (panels mount/unmount by it) and panelMounting
     - the overflow-menu open effect reads menuRef       -> deps include
       menuOpen
   A ref to a conditionally-rendered node is null on the render where the
   gate flips and is only populated on the next one.

   DECLARED GAPS, three:
   (a) NO FLOATING ENGINE. Salt's overflow popup is @floating-ui/react
       (offset, size writing maxHeight inline, flip, shift) with useClick /
       useDismiss and a focus manager. This renders a plain
       absolutely-positioned list with no collision detection, no flip and
       no viewport clamp. The observable contract — open, vertical arrow
       navigation, Home/End, Escape and outside-press to close, commit and
       close, Shift+Tab back to the button — IS reproduced.
   (b) NO PORTAL / NO ELEMENT MOVING. Salt keeps one DOM element per tab
       and MOVES its display:contents host between measure / main /
       overflow slots so ids and focus survive. This re-renders the tab in
       the other location instead. Same ids, same aria, different identity
       across the move.
   (c) NO STACKED ICON LAYOUT. M3's with-icon-and-label-text container is
       64px tall because the glyph sits ABOVE the label. Every system here
       lays icon and label in a row, because material-web is a tokens-only
       clone with no component and no layout token to source the stack
       from. Declared in docs/TABS-MATRIX.md rather than presented as
       equivalence.

   DECLARED COMPOSITIONS: the tab icons, Salt's Badge, Salt's TabAction
   buttons and its overflow trigger (all literally <Button
   appearance="transparent">), and the standalone divider M3's own
   deprecation comment points at. All render as neutral placeholders. */
import * as React from "react"

export interface TabsConfig {
  tabBar?: boolean
  tabShell?: string
  activeIndicator?: boolean
  indicatorMotion?: string
  tabIcon?: boolean
  tabActions?: boolean
  tabBadge?: boolean
  overflowMenu?: boolean
  panel?: boolean
  rovingTabindex?: boolean
  arrowKeys?: string
  homeEnd?: boolean
  wrapNavigation?: boolean
  activationMode?: string[]
  disabledNavigation?: string
  pointerActivation?: string
  panelFocusable?: string
  panelMounting?: string
  scrollIntoView?: boolean
  appearance?: string[]
  emphasis?: string[]
  orientation?: string[]
  activeColor?: string[]
  divider?: boolean
  inset?: boolean
  disabled?: boolean[]
}

export interface TabsItemSpec {
  value: string
  label: React.ReactNode
  icon?: boolean
  badge?: number
  actions?: React.ReactNode
  disabled?: boolean
  content?: React.ReactNode
}

export interface TabsProps {
  config: TabsConfig
  items: TabsItemSpec[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** non-default axis values, per instance */
  appearance?: string
  emphasis?: string
  orientation?: string
  activeColor?: string
  divider?: boolean
  inset?: boolean
  /** per-INSTANCE override of the system default (Radix exposes the prop;
      Salt does not). Conflating capability with instance is the bug the
      button build already paid for. */
  activationMode?: string
  id?: string
  className?: string
}

const TABBABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

function CountBadge({ value }: { value: number }) {
  /* DECLARED COMPOSITION — stands in for Salt's <Badge value={n}>, which
     is its own canonical row in docs/COMPONENTS.md. No style cell is
     modelled for it. */
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "1.5em",
        padding: "0 0.35em",
        borderRadius: 999,
        border: "1px solid currentColor",
        font: "inherit",
        fontSize: "0.75em",
        lineHeight: 1.6,
      }}
    >
      {value}
    </span>
  )
}

function TabGlyph() {
  /* DECLARED COMPOSITION — a neutral mark standing in for Salt's
     @salt-ds/icons glyphs, shadcn's lucide glyphs and M3's with-icon
     glyph, until a registry icon component exists. */
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v6M5 8h6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function OverflowGlyph() {
  /* stands in for Salt's semantic-icon-provider OverflowIcon */
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="3" cy="8" r="1.4" fill="currentColor" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" />
      <circle cx="13" cy="8" r="1.4" fill="currentColor" />
    </svg>
  )
}

export function Tabs({
  config,
  items,
  value: valueProp,
  defaultValue,
  onValueChange,
  appearance,
  emphasis,
  orientation,
  activeColor,
  divider,
  inset,
  activationMode,
  id,
  className,
}: TabsProps) {
  const reactId = React.useId()
  const baseId = id ?? `tabs-${reactId}`

  const activeAppearance = appearance ?? config.appearance?.[0] ?? "plain"
  const activeEmphasis = emphasis ?? config.emphasis?.[0]
  const activeOrientation = orientation ?? config.orientation?.[0] ?? "horizontal"
  const activeActiveColor = activeColor ?? config.activeColor?.[0]
  const showDivider = divider ?? Boolean(config.divider)
  const showInset = inset ?? Boolean(config.inset)

  const shell = config.tabShell ?? "single"
  const motion = config.indicatorMotion ?? "static"
  const mode = activationMode ?? config.activationMode?.[0] ?? "automatic"
  const skipsDisabled = (config.disabledNavigation ?? "reachable") === "skipped"
  const panelsUnmount = (config.panelMounting ?? "hidden") === "unmount"
  const panelAlwaysFocusable = (config.panelFocusable ?? "conditional") === "always"
  const commitsOnMouseDown = (config.pointerActivation ?? "click") === "mousedown"
  const vertical = activeOrientation === "vertical"

  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? items[0]?.value)
  const selected = valueProp ?? uncontrolled

  const commit = React.useCallback(
    (next: string) => {
      if (valueProp === undefined) setUncontrolled(next)
      onValueChange?.(next)
    },
    [valueProp, onValueChange],
  )

  const tabId = (v: string) => `${baseId}-tab-${v}`
  const panelId = (v: string) => `${baseId}-panel-${v}`

  const listRef = React.useRef<HTMLDivElement | null>(null)
  const indicatorRef = React.useRef<HTMLSpanElement | null>(null)
  const overflowButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const menuRef = React.useRef<HTMLDivElement | null>(null)
  const tabElsRef = React.useRef(new Map<string, HTMLElement | null>())
  const triggerElsRef = React.useRef(new Map<string, HTMLButtonElement | null>())
  const panelElsRef = React.useRef(new Map<string, HTMLDivElement | null>())
  const widthsRef = React.useRef(new Map<string, number>())
  const wasPointerRef = React.useRef(false)

  const [focusVisibleValue, setFocusVisibleValue] = React.useState<string | null>(null)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [visibleCount, setVisibleCount] = React.useState(items.length)

  /* --- structure.overflow-menu / state.overflowing -------------------
     Salt's own approach in miniature: each tab's intrinsic width is
     recorded WHILE IT IS IN THE STRIP and cached, so a tab that has been
     collapsed into the menu can still be measured against a widened
     strip and brought back. DECLARED GAP (b): Salt moves one element
     between slots, this re-renders it in the other location. */
  const overflowOn = Boolean(config.overflowMenu)
  const visible = overflowOn ? items.slice(0, visibleCount) : items
  const hidden = overflowOn ? items.slice(visibleCount) : []

  const measureOverflow = React.useCallback(() => {
    const list = listRef.current
    if (!list) return
    for (const [v, el] of tabElsRef.current) {
      if (el?.isConnected && el.offsetParent !== null) {
        const w = el.getBoundingClientRect().width
        if (w > 0) widthsRef.current.set(v, w)
      }
    }
    const styles = getComputedStyle(list)
    const gap = Number.parseFloat(styles.columnGap) || 0
    const buttonWidth = overflowButtonRef.current?.getBoundingClientRect().width ?? 0
    const total = list.clientWidth
    let used = 0
    let fit = 0
    for (const item of items) {
      const w = widthsRef.current.get(item.value)
      if (w === undefined) {
        fit += 1
        continue
      }
      const next = used + (fit === 0 ? 0 : gap) + w
      const reserve = fit === items.length - 1 ? 0 : buttonWidth + gap
      if (next + reserve > total) break
      used = next
      fit += 1
    }
    const clamped = Math.max(1, Math.min(items.length, fit))
    setVisibleCount((prev) => (prev === clamped ? prev : clamped))
  }, [items])

  React.useLayoutEffect(() => {
    if (!overflowOn) {
      setVisibleCount(items.length)
      return
    }
    measureOverflow()
    const list = listRef.current
    if (!list || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(measureOverflow)
    ro.observe(list)
    return () => ro.disconnect()
    // `visibleCount` and `menuOpen` gate WHICH tabs are rendered in the
    // strip, and the effect reads those elements through tabElsRef. Both
    // must be listed or the second measurement pass never runs — the
    // exact shape of the dialog bug (docs/DIALOG-MATRIX.md, closing
    // section).
  }, [overflowOn, measureOverflow, items, visibleCount, menuOpen])

  /* --- structure.indicator-motion = "slide" --------------------------
     Measures the selected tab and writes left/width INLINE ON THE
     INDICATOR — never into a theme-scoped custom property. */
  const positionSlider = React.useCallback(() => {
    const bar = indicatorRef.current
    const list = listRef.current
    if (!bar || !list) return
    const el = tabElsRef.current.get(selected ?? "")
    if (!el || el.offsetParent === null) {
      bar.style.opacity = "0"
      return
    }
    const a = el.getBoundingClientRect()
    const b = list.getBoundingClientRect()
    bar.style.opacity = "1"
    bar.style.left = `${a.left - b.left + list.scrollLeft}px`
    bar.style.width = `${a.width}px`
  }, [selected])

  React.useLayoutEffect(() => {
    if (motion !== "slide") return
    positionSlider()
    const list = listRef.current
    if (!list || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(positionSlider)
    ro.observe(list)
    for (const el of tabElsRef.current.values()) if (el) ro.observe(el)
    return () => ro.disconnect()
    // `selected` (inside positionSlider) and `visibleCount` both gate the
    // node this reads: a tab collapsed into the overflow menu has no
    // strip element at all. `activeEmphasis`/`activeAppearance`/
    // `activeOrientation` change the tab's box, so a re-measure is owed.
  }, [motion, positionSlider, visibleCount, activeEmphasis, activeAppearance, activeOrientation])

  /* --- behavior.panel-focusable = "conditional" ----------------------
     Salt measures with tabbable() behind a MutationObserver and makes the
     panel a tab stop only when it holds nothing focusable. */
  const [panelNeedsFocus, setPanelNeedsFocus] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    if (panelAlwaysFocusable || !config.panel) return
    const el = panelElsRef.current.get(selected ?? "")
    if (!el) return
    const check = () => {
      const has = el.querySelectorAll(TABBABLE).length > 0
      setPanelNeedsFocus((prev) => (prev[selected ?? ""] === !has ? prev : { ...prev, [selected ?? ""]: !has }))
    }
    check()
    if (typeof MutationObserver === "undefined") return
    const mo = new MutationObserver(check)
    mo.observe(el, { childList: true, subtree: true, attributes: true })
    return () => mo.disconnect()
    // `selected` gates which panel exists (panelMounting = "unmount") and
    // which one is not `hidden`; without it in the deps this effect would
    // read one panel forever.
  }, [panelAlwaysFocusable, config.panel, selected, panelsUnmount])

  /* --- behavior.overflow-navigation: open, dismiss, return focus ----- */
  React.useEffect(() => {
    if (!menuOpen) return
    const menu = menuRef.current
    if (!menu) return
    const first = menu.querySelector<HTMLElement>('[role="tab"]')
    first?.focus()
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node | null
      if (!t) return
      if (menuRef.current?.contains(t)) return
      if (overflowButtonRef.current?.contains(t)) return
      setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    return () => document.removeEventListener("pointerdown", onPointerDown, true)
    // `menuOpen` gates the menu's existence and is therefore the gating
    // state this ref-reading effect must depend on.
  }, [menuOpen])

  /* --- navigation over the strip -------------------------------------
     behavior.roving-tabindex, .arrow-keys, .home-end, .wrap,
     .disabled-navigation. */
  const navigable = React.useMemo(
    () => (skipsDisabled ? visible.filter((t) => !t.disabled) : visible),
    [visible, skipsDisabled],
  )

  const firstNavigable = navigable[0]?.value
  const isTabStop = (v: string, disabled: boolean) => {
    if (config.rovingTabindex === false) return true
    if (skipsDisabled && disabled) return false
    if (focusVisibleValue === v) return true
    if (selected === v && visible.some((t) => t.value === v)) return true
    const selectedIsInStrip = visible.some((t) => t.value === selected)
    return !selectedIsInStrip && v === firstNavigable
  }

  const focusTab = (v: string) => {
    triggerElsRef.current.get(v)?.focus({ preventScroll: true })
  }

  const moveFocus = (from: string, delta: number) => {
    if (navigable.length === 0) return
    const i = navigable.findIndex((t) => t.value === from)
    const at = i === -1 ? 0 : i
    const next = config.wrapNavigation
      ? (at + delta + navigable.length) % navigable.length
      : Math.min(navigable.length - 1, Math.max(0, at + delta))
    focusTab(navigable[next].value)
  }

  const onStripKeyDown = (e: React.KeyboardEvent, from: string) => {
    if (menuOpen) return
    const axis = config.arrowKeys === "orientation" && vertical ? "vertical" : "horizontal"
    const prevKey = axis === "vertical" ? "ArrowUp" : "ArrowLeft"
    const nextKey = axis === "vertical" ? "ArrowDown" : "ArrowRight"
    if (e.key === nextKey) {
      e.preventDefault()
      moveFocus(from, 1)
    } else if (e.key === prevKey) {
      e.preventDefault()
      moveFocus(from, -1)
    } else if (config.homeEnd && e.key === "Home") {
      e.preventDefault()
      if (navigable[0]) focusTab(navigable[0].value)
    } else if (config.homeEnd && e.key === "End") {
      e.preventDefault()
      const last = navigable[navigable.length - 1]
      if (last) focusTab(last.value)
    }
  }

  const onMenuKeyDown = (e: React.KeyboardEvent, from: string) => {
    const list = hidden
    const i = list.findIndex((t) => t.value === from)
    const focusAt = (n: number) => {
      const target = list[Math.min(list.length - 1, Math.max(0, n))]
      if (target) menuRef.current?.querySelector<HTMLElement>(`[id="${CSS.escape(tabId(target.value))}"]`)?.focus()
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      focusAt(i + 1)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      focusAt(i - 1)
    } else if (e.key === "Home") {
      e.preventDefault()
      focusAt(0)
    } else if (e.key === "End") {
      e.preventDefault()
      focusAt(list.length - 1)
    } else if (e.key === "Escape" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault()
      setMenuOpen(false)
      overflowButtonRef.current?.focus()
    }
  }

  /* --- one tab ------------------------------------------------------- */
  function renderTab(item: TabsItemSpec, where: "strip" | "menu") {
    const isSelected = selected === item.value
    const disabled = Boolean(item.disabled)
    const stop = where === "menu" ? false : isTabStop(item.value, disabled)

    const activate = () => {
      if (disabled) return
      commit(item.value)
      if (where === "menu") {
        setMenuOpen(false)
        overflowButtonRef.current?.focus()
      }
    }

    // behavior.pointer-activation — Salt commits on click; Radix commits
    // on mousedown, guarding right-click / ctrl+left and focusing the
    // trigger BEFORE the value changes (radix-ui/primitives#3600).
    const pointerProps = commitsOnMouseDown
      ? {
          onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
            wasPointerRef.current = true
            if (!disabled && e.button === 0 && e.ctrlKey === false) {
              e.currentTarget.focus()
              activate()
            } else {
              e.preventDefault()
            }
          },
        }
      : {
          onMouseDown: () => {
            wasPointerRef.current = true
          },
          onClick: disabled ? undefined : activate,
        }

    const triggerProps = {
      id: tabId(item.value),
      role: "tab" as const,
      type: "button" as const,
      "aria-selected": isSelected,
      "aria-controls": config.panel ? panelId(item.value) : undefined,
      // behavior.disabled-navigation — the native attribute removes the
      // tab from the tab order and the pointer entirely (shadcn); the
      // aria form keeps it reachable and blocks activation instead (Salt).
      ...(skipsDisabled ? { disabled } : { "aria-disabled": disabled || undefined }),
      tabIndex: stop ? 0 : -1,
      ...pointerProps,
      onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (where === "menu") {
          onMenuKeyDown(e, item.value)
          if (e.defaultPrevented) return
        } else {
          onStripKeyDown(e, item.value)
          if (e.defaultPrevented) return
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          activate()
        }
      },
      onFocus: (e: React.FocusEvent<HTMLButtonElement>) => {
        if (!wasPointerRef.current) setFocusVisibleValue(item.value)
        wasPointerRef.current = false
        // behavior.activation-mode — automatic selects on focus.
        if (mode === "automatic" && !disabled && !isSelected) commit(item.value)
        // behavior.scroll-into-view — Salt scrolls the PARENT (the tab
        // box, not the button) so the border and mark come with it, and
        // its arrow handler focuses with preventScroll so this is the
        // only scroller.
        if (config.scrollIntoView) {
          const box = e.currentTarget.closest('[data-slot="tab"]') ?? e.currentTarget
          box.scrollIntoView({ block: "nearest", inline: "nearest" })
        }
      },
      onBlur: () => setFocusVisibleValue((v) => (v === item.value ? null : v)),
    }

    const contents = (
      <>
        {config.tabIcon && item.icon && (
          <span data-slot="tab-icon">
            <TabGlyph />
          </span>
        )}
        <span data-slot="tab-label">{item.label}</span>
        {config.tabBadge && item.badge !== undefined && <CountBadge value={item.badge} />}
      </>
    )

    const indicator =
      config.activeIndicator && motion !== "slide" ? (
        <span data-slot="tabs-indicator" data-motion={motion} aria-hidden="true" />
      ) : null

    const boxProps = {
      "data-slot": "tab",
      "data-state": isSelected ? "active" : "inactive",
      "data-disabled": disabled ? "" : undefined,
      "data-focus-visible": focusVisibleValue === item.value ? "" : undefined,
      "data-value": item.value,
      ref: (el: HTMLElement | null) => {
        if (where === "strip") tabElsRef.current.set(item.value, el)
      },
    }

    if (shell === "wrapper") {
      return (
        <div key={item.value} {...boxProps} role="presentation">
          <button
            {...triggerProps}
            data-slot="tab-trigger"
            ref={(el) => {
              triggerElsRef.current.set(item.value, el)
            }}
          >
            {contents}
          </button>
          {config.tabActions && item.actions && <span data-slot="tab-actions">{item.actions}</span>}
          {indicator}
        </div>
      )
    }

    return (
      <button
        key={item.value}
        {...boxProps}
        {...triggerProps}
        ref={(el) => {
          tabElsRef.current.set(item.value, where === "strip" ? el : null)
          triggerElsRef.current.set(item.value, el)
        }}
      >
        {contents}
        {indicator}
      </button>
    )
  }

  const tablist = (
    <div
      ref={listRef}
      data-slot="tablist"
      role="tablist"
      aria-orientation={activeOrientation}
      aria-label="Tabs"
      data-appearance={activeAppearance}
      data-emphasis={activeEmphasis}
      data-active-color={activeActiveColor}
    >
      {visible.map((item) => renderTab(item, "strip"))}

      {config.activeIndicator && motion === "slide" && (
        <span ref={indicatorRef} data-slot="tabs-indicator" data-motion="slide" aria-hidden="true" />
      )}

      {overflowOn && hidden.length > 0 && (
        <>
          <button
            ref={overflowButtonRef}
            type="button"
            data-slot="tab-overflow-button"
            data-overflowbutton=""
            role="tab"
            tabIndex={-1}
            aria-label="Overflow"
            aria-expanded={menuOpen}
            aria-controls={`${baseId}-overflow`}
            aria-selected={false}
            onClick={() => setMenuOpen((o) => !o)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && menuOpen) {
                e.preventDefault()
                setMenuOpen(false)
              }
            }}
          >
            <OverflowGlyph />
          </button>
          {menuOpen && (
            <div
              ref={menuRef}
              id={`${baseId}-overflow`}
              data-slot="tab-overflow-list"
              role="tablist"
              aria-orientation="vertical"
              aria-label="Overflow tab options"
            >
              {hidden.map((item) => renderTab(item, "menu"))}
            </div>
          )}
        </>
      )}
    </div>
  )

  const strip = config.tabBar ? (
    <div data-slot="tab-bar" data-divider={showDivider ? "" : undefined} data-inset={showInset ? "" : undefined}>
      <div data-slot="tab-bar-strip">{tablist}</div>
    </div>
  ) : (
    tablist
  )

  return (
    <div
      data-slot="tabs"
      data-orientation={activeOrientation}
      data-appearance={activeAppearance}
      className={className}
    >
      {strip}
      {config.panel &&
        items
          // behavior.panel-mounting — Radix destroys an inactive panel's
          // subtree; Salt keeps every one mounted and hides it.
          .filter((item) => !panelsUnmount || item.value === selected)
          .map((item) => {
            const isSelected = item.value === selected
            const focusable = panelAlwaysFocusable || panelNeedsFocus[item.value]
            return (
              <div
                key={item.value}
                id={panelId(item.value)}
                ref={(el) => {
                  panelElsRef.current.set(item.value, el)
                }}
                data-slot="tab-panel"
                data-state={isSelected ? "active" : "inactive"}
                data-orientation={activeOrientation}
                role="tabpanel"
                aria-labelledby={tabId(item.value)}
                hidden={!isSelected || undefined}
                tabIndex={!isSelected ? undefined : focusable ? 0 : undefined}
              >
                {item.content}
              </div>
            )
          })}
    </div>
  )
}
