/* Dropdown-menu skeleton — written from the template's part union: a
   trigger, a popup listing action items, an optional leading item-icon, an
   optional trailing item-shortcut-text, a separator, an optional group +
   group-label, and ONE level of submenu nesting (submenu-trigger +
   submenu-popup — a declared, reasonable simplification of the real
   systems' arbitrary-depth recursion, see DROPDOWN-MENU-MATRIX.md's
   `behavior.pattern` note). Inherits from no design system.

   Every logically distinct part gets its own data-slot from this file's
   first draft (checkbox/radio-group/toast lesson): dropdown-menu-trigger /
   -popup / -submenu-popup / -item / -submenu-trigger / -item-icon /
   -submenu-chevron / -item-label / -item-shortcut / -separator / -group /
   -group-label are never conflated with one another.

   Keyboard (behavior.arrow-navigation / .home-end / .typeahead /
   .item-activation / .submenu-open / .submenu-close / .dismiss-escape):
   ArrowUp/Down move the active item; Home/End jump to first/last; Enter/
   Space activate (and close the whole stack); ArrowRight opens a submenu
   (also hover-openable after config'd delay), ArrowLeft closes it and
   returns focus/active to its own trigger; Escape closes the INNERMOST
   open layer first; typeahead (when config.typeahead) jumps to the next
   item whose label starts with the typed character.
   behavior.dismiss-outside: a real pointerdown listener, not delegated to
   a floating-position library this skeleton does not implement (declared
   gap, same shape select.tsx's own popup positioning note used). */
import * as React from "react"

export interface DropdownMenuConfig {
  itemIcon?: boolean
  itemShortcut?: boolean
  group?: boolean
  groupLabel?: boolean
  submenu?: boolean
  typeahead?: boolean
  itemVariant?: string[]
}

export interface MenuItemModel {
  type: "item"
  value: string
  label: string
  icon?: boolean
  shortcut?: string
  disabled?: boolean
  variant?: "default" | "destructive"
}
export interface MenuSeparatorModel {
  type: "separator"
}
export interface MenuSubmenuModel {
  type: "submenu"
  value: string
  label: string
  icon?: boolean
  items: Array<MenuItemModel | MenuSeparatorModel>
}
export interface MenuGroupModel {
  type: "group"
  label?: string
  items: Array<MenuItemModel | MenuSeparatorModel | MenuSubmenuModel>
}
export type MenuNode = MenuItemModel | MenuSeparatorModel | MenuSubmenuModel | MenuGroupModel

export interface DropdownMenuProps {
  config: DropdownMenuConfig
  items: MenuNode[]
  trigger?: React.ReactNode
  onSelect?: (value: string) => void
  /** harness affordance: force the popup open so item states are visible
      without interaction. Not a design-system prop. */
  forceOpen?: boolean
  /** ms delay before hover opens/closes a submenu — see prop.submenu-hover-delay.
      REGISTRY DEFAULT when unset: 300/300, labelled, not sourced (see the
      template row's own note — Salt's real mechanism, safePolygon, has no
      comparable numeric delay at all; M3's real default is 400/400). */
  submenuHoverDelay?: number
  className?: string
  id?: string
}

function PlaceholderIcon() {
  // DECLARED DEFERRAL, same convention as every prior component's
  // PlaceholderIcon/Glyph: a neutral geometric mark standing in for each
  // system's own icon set until a registry icon-set component exists.
  return (
    <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ChevronRightGlyph() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** flatten a node list into the ordered set of ACTIVATABLE entries (items +
    submenu triggers), descending into groups but NOT into submenus (a
    submenu's own contents are only reachable once it is open, which is
    exactly the real systems' own behaviour). */
function activatable(nodes: MenuNode[]): Array<MenuItemModel | MenuSubmenuModel> {
  const out: Array<MenuItemModel | MenuSubmenuModel> = []
  for (const n of nodes) {
    if (n.type === "item" || n.type === "submenu") out.push(n)
    else if (n.type === "group") out.push(...activatable(n.items))
  }
  return out
}

function firstEnabled(nodes: Array<MenuItemModel | MenuSubmenuModel>) {
  return nodes.find((n) => !(n.type === "item" && n.disabled))
}
function lastEnabled(nodes: Array<MenuItemModel | MenuSubmenuModel>) {
  return [...nodes].reverse().find((n) => !(n.type === "item" && n.disabled))
}

interface RenderCtx {
  config: DropdownMenuConfig
  activeValue: string | null
  submenuOpenValue: string | null
  submenuActiveValue: string | null
  onSelect: (value: string) => void
  openSubmenu: (value: string, focusFirst?: boolean) => void
  closeSubmenu: () => void
  setSubmenuActive: (value: string) => void
  hoverOpen: (value: string) => void
  hoverCancel: () => void
  idBase: string
}

function ItemRow({ node, ctx, isSubmenuLayer }: { node: MenuItemModel | MenuSubmenuModel; ctx: RenderCtx; isSubmenuLayer: boolean }) {
  const active = isSubmenuLayer ? ctx.submenuActiveValue === node.value : ctx.activeValue === node.value
  const disabled = node.type === "item" && !!node.disabled
  const isSubmenuTrigger = node.type === "submenu"
  const isOpenSubmenu = isSubmenuTrigger && ctx.submenuOpenValue === node.value
  const variant = node.type === "item" ? node.variant : undefined

  const commonProps = {
    role: "menuitem" as const,
    id: `${ctx.idBase}-${node.value}`,
    "aria-disabled": disabled ? true : undefined,
    "data-active": active ? "" : undefined,
    "data-disabled": disabled ? "" : undefined,
    tabIndex: -1,
    onMouseEnter: () => {
      if (disabled) return
      if (isSubmenuLayer) ctx.setSubmenuActive(node.value)
      if (isSubmenuTrigger) ctx.hoverOpen(node.value)
      else ctx.hoverCancel()
    },
  }

  if (isSubmenuTrigger) {
    return (
      <div
        {...commonProps}
        data-slot="dropdown-menu-submenu-trigger"
        aria-haspopup="menu"
        aria-expanded={isOpenSubmenu}
        data-open={isOpenSubmenu ? "" : undefined}
        onClick={() => { if (!disabled) ctx.openSubmenu(node.value, true) }}
      >
        {ctx.config.itemIcon && node.icon && (
          <span data-slot="dropdown-menu-item-icon" aria-hidden="true">
            <PlaceholderIcon />
          </span>
        )}
        <span data-slot="dropdown-menu-item-label">{node.label}</span>
        <span data-slot="dropdown-menu-submenu-chevron" aria-hidden="true">
          <ChevronRightGlyph />
        </span>
      </div>
    )
  }

  return (
    <div
      {...commonProps}
      data-slot="dropdown-menu-item"
      data-variant={variant}
      onClick={() => { if (!disabled) ctx.onSelect(node.value) }}
    >
      {ctx.config.itemIcon && node.icon && (
        <span data-slot="dropdown-menu-item-icon" aria-hidden="true">
          <PlaceholderIcon />
        </span>
      )}
      <span data-slot="dropdown-menu-item-label">{node.label}</span>
      {ctx.config.itemShortcut && node.shortcut && (
        <span data-slot="dropdown-menu-item-shortcut">{node.shortcut}</span>
      )}
    </div>
  )
}

function NodeList({ nodes, ctx, isSubmenuLayer }: { nodes: MenuNode[]; ctx: RenderCtx; isSubmenuLayer: boolean }) {
  return (
    <>
      {nodes.map((n, i) => {
        if (n.type === "separator") return <div key={`sep-${i}`} data-slot="dropdown-menu-separator" role="separator" />
        if (n.type === "group") {
          if (!ctx.config.group) return <NodeList key={`grp-${i}`} nodes={n.items} ctx={ctx} isSubmenuLayer={isSubmenuLayer} />
          return (
            <div key={`grp-${i}`} data-slot="dropdown-menu-group" role="group" aria-label={n.label}>
              {ctx.config.groupLabel && n.label && (
                <div data-slot="dropdown-menu-group-label" aria-hidden="true">{n.label}</div>
              )}
              <NodeList nodes={n.items} ctx={ctx} isSubmenuLayer={isSubmenuLayer} />
            </div>
          )
        }
        return <ItemRow key={n.value} node={n} ctx={ctx} isSubmenuLayer={isSubmenuLayer} />
      })}
    </>
  )
}

export function DropdownMenu({
  config,
  items,
  trigger,
  onSelect,
  forceOpen,
  submenuHoverDelay,
  className,
  id,
}: DropdownMenuProps) {
  const idBase = id ?? "dropdown-menu"
  const [open, setOpen] = React.useState(false)
  const [activeValue, setActiveValue] = React.useState<string | null>(null)
  const [submenuOpenValue, setSubmenuOpenValue] = React.useState<string | null>(null)
  const [submenuActiveValue, setSubmenuActiveValue] = React.useState<string | null>(null)
  const [popupWidth, setPopupWidth] = React.useState<number | null>(null)

  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const popupRef = React.useRef<HTMLDivElement | null>(null)
  const submenuPopupRef = React.useRef<HTMLDivElement | null>(null)
  const hoverTimerRef = React.useRef<ReturnType<typeof window.setTimeout> | undefined>(undefined)
  const typeaheadBufferRef = React.useRef("")
  const typeaheadTimerRef = React.useRef<ReturnType<typeof window.setTimeout> | undefined>(undefined)

  const isOpen = (open || Boolean(forceOpen))
  const delay = submenuHoverDelay ?? 300

  const flatRoot = React.useMemo(() => activatable(items), [items])
  const openSubmenuNode = submenuOpenValue
    ? (flatRoot.find((n) => n.type === "submenu" && n.value === submenuOpenValue) as MenuSubmenuModel | undefined)
    : undefined
  const flatSubmenu = React.useMemo(
    () => (openSubmenuNode ? activatable(openSubmenuNode.items) : []),
    [openSubmenuNode],
  )

  function closeAll() {
    setOpen(false)
    setSubmenuOpenValue(null)
    setSubmenuActiveValue(null)
    setActiveValue(null)
  }

  function commit(value: string) {
    onSelect?.(value)
    closeAll()
    // behavior.focus-return
    triggerRef.current?.focus()
  }

  function clearHoverTimer() {
    if (hoverTimerRef.current !== undefined) {
      window.clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = undefined
    }
  }
  function hoverOpen(value: string) {
    if (!config.submenu) return
    clearHoverTimer()
    hoverTimerRef.current = window.setTimeout(() => {
      setSubmenuOpenValue(value)
      setActiveValue(value)
      const node = flatRoot.find((n) => n.type === "submenu" && n.value === value) as MenuSubmenuModel | undefined
      const first = node ? firstEnabled(activatable(node.items)) : undefined
      setSubmenuActiveValue(first ? first.value : null)
    }, delay)
  }
  function hoverCancel() {
    clearHoverTimer()
  }

  function openSubmenu(value: string, focusFirst?: boolean) {
    clearHoverTimer()
    setSubmenuOpenValue(value)
    setActiveValue(value)
    if (focusFirst) {
      const node = flatRoot.find((n) => n.type === "submenu" && n.value === value) as MenuSubmenuModel | undefined
      const first = node ? firstEnabled(activatable(node.items)) : undefined
      setSubmenuActiveValue(first ? first.value : null)
    }
  }
  function closeSubmenu() {
    clearHoverTimer()
    setSubmenuOpenValue(null)
    setSubmenuActiveValue(null)
    // the submenu popup owned real DOM focus (see its own ref callback);
    // removing it from the DOM drops focus to <body> unless the root
    // popup reclaims it — behavior.submenu-close's own "return focus to
    // the trigger item in the PARENT" (matrix §2) requires the parent
    // layer to actually be focusable again, not just visually present.
    popupRef.current?.focus()
  }

  // Measure the popup's real rendered width once it mounts, so the
  // submenu-popup (a SIBLING, see the render below) can be placed exactly
  // beside it — AND move real DOM focus onto the popup (tabIndex=-1, so
  // programmatically focusable), the same "keyboard nav needs something to
  // actually be focused" requirement every real system's own floating-ui/
  // Radix/ElementInternals focus manager satisfies. `isOpen` gates
  // popupRef.current's existence, so it MUST be in this effect's deps
  // (rule 9) — omitting it would read a null ref once, on the render
  // before the popup exists, and never again.
  React.useLayoutEffect(() => {
    if (isOpen && popupRef.current) {
      setPopupWidth(popupRef.current.offsetWidth)
      popupRef.current.focus()
    } else {
      setPopupWidth(null)
    }
  }, [isOpen])

  // behavior.dismiss-outside — a real pointerdown listener (declared
  // floating-position gap, same shape select.tsx's own note).
  React.useEffect(() => {
    if (!open || forceOpen) return
    const onPointerDown = (e: Event) => {
      const t = e.target as Node | null
      if (!t) return
      if (triggerRef.current?.contains(t)) return
      if (popupRef.current?.contains(t)) return
      if (submenuPopupRef.current?.contains(t)) return
      closeAll()
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    return () => document.removeEventListener("pointerdown", onPointerDown, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, forceOpen])

  function moveActive(delta: number) {
    if (submenuOpenValue) {
      if (flatSubmenu.length === 0) return
      const cur = flatSubmenu.findIndex((n) => n.value === submenuActiveValue)
      let next = cur < 0 ? (delta > 0 ? 0 : flatSubmenu.length - 1) : cur + delta
      next = Math.min(Math.max(next, 0), flatSubmenu.length - 1)
      // skip disabled
      while (flatSubmenu[next]?.type === "item" && (flatSubmenu[next] as MenuItemModel).disabled) {
        next += delta > 0 ? 1 : -1
        if (next < 0 || next >= flatSubmenu.length) return
      }
      setSubmenuActiveValue(flatSubmenu[next].value)
      return
    }
    if (flatRoot.length === 0) return
    const cur = flatRoot.findIndex((n) => n.value === activeValue)
    let next = cur < 0 ? (delta > 0 ? 0 : flatRoot.length - 1) : cur + delta
    next = Math.min(Math.max(next, 0), flatRoot.length - 1)
    while (flatRoot[next]?.type === "item" && (flatRoot[next] as MenuItemModel).disabled) {
      next += delta > 0 ? 1 : -1
      if (next < 0 || next >= flatRoot.length) return
    }
    setActiveValue(flatRoot[next].value)
  }

  function resetTypeahead() {
    typeaheadBufferRef.current = ""
    if (typeaheadTimerRef.current !== undefined) window.clearTimeout(typeaheadTimerRef.current)
  }
  function typeaheadKey(k: string) {
    if (!config.typeahead) return
    if (k.length !== 1) return
    typeaheadBufferRef.current += k.toLowerCase()
    if (typeaheadTimerRef.current !== undefined) window.clearTimeout(typeaheadTimerRef.current)
    typeaheadTimerRef.current = window.setTimeout(resetTypeahead, 500)
    const buf = typeaheadBufferRef.current
    const pool = submenuOpenValue ? flatSubmenu : flatRoot
    const match = pool.find((n) => !(n.type === "item" && n.disabled) && n.label.toLowerCase().startsWith(buf))
    if (match) {
      if (submenuOpenValue) setSubmenuActiveValue(match.value)
      else setActiveValue(match.value)
    }
  }

  function onPopupKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); moveActive(1); return }
    if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); return }
    if (e.key === "Home") {
      e.preventDefault()
      const pool = submenuOpenValue ? flatSubmenu : flatRoot
      const f = firstEnabled(pool)
      if (f) (submenuOpenValue ? setSubmenuActiveValue : setActiveValue)(f.value)
      return
    }
    if (e.key === "End") {
      e.preventDefault()
      const pool = submenuOpenValue ? flatSubmenu : flatRoot
      const l = lastEnabled(pool)
      if (l) (submenuOpenValue ? setSubmenuActiveValue : setActiveValue)(l.value)
      return
    }
    if (e.key === "ArrowRight") {
      if (submenuOpenValue) return
      const node = flatRoot.find((n) => n.value === activeValue)
      if (node && node.type === "submenu") { e.preventDefault(); openSubmenu(node.value, true) }
      return
    }
    if (e.key === "ArrowLeft") {
      if (submenuOpenValue) { e.preventDefault(); closeSubmenu(); return }
      return
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (submenuOpenValue) {
        const node = flatSubmenu.find((n) => n.value === submenuActiveValue)
        if (!node) return
        if (node.type === "item" && !node.disabled) commit(node.value)
        return
      }
      const node = flatRoot.find((n) => n.value === activeValue)
      if (!node) return
      if (node.type === "submenu") openSubmenu(node.value, true)
      else if (!node.disabled) commit(node.value)
      return
    }
    if (e.key === "Escape") {
      e.preventDefault()
      // behavior.dismiss-escape — innermost layer first
      if (submenuOpenValue) closeSubmenu()
      else { closeAll(); triggerRef.current?.focus() }
      return
    }
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      typeaheadKey(e.key)
    }
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault()
      setOpen(true)
      const f = e.key === "ArrowUp" ? lastEnabled(flatRoot) : firstEnabled(flatRoot)
      setActiveValue(f ? f.value : null)
    }
  }

  const ctx: RenderCtx = {
    config,
    activeValue,
    submenuOpenValue,
    submenuActiveValue,
    onSelect: commit,
    openSubmenu,
    closeSubmenu,
    setSubmenuActive: setSubmenuActiveValue,
    hoverOpen,
    hoverCancel,
    idBase,
  }

  return (
    <div data-slot="dropdown-menu" className={className} style={{ position: "relative", display: "inline-block" }}>
      <button
        ref={triggerRef}
        data-slot="dropdown-menu-trigger"
        type="button"
        id={id}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        data-open={isOpen ? "" : undefined}
        onClick={() => {
          setOpen((v) => {
            const next = !v
            if (next) setActiveValue(null)
            else closeAll()
            return next
          })
        }}
        onKeyDown={onTriggerKeyDown}
      >
        {trigger ?? "Open"}
      </button>

      {isOpen && (
        <div
          ref={popupRef}
          data-slot="dropdown-menu-popup"
          role="menu"
          aria-orientation="vertical"
          tabIndex={-1}
          onKeyDown={onPopupKeyDown}
          onMouseLeave={() => { if (!submenuOpenValue) hoverCancel() }}
          style={{ top: "100%", left: 0 }}
        >
          <NodeList nodes={items} ctx={ctx} isSubmenuLayer={false} />
        </div>
      )}

      {isOpen && submenuOpenValue && openSubmenuNode && (
        // rendered as a SIBLING of the popup, not a child, deliberately —
        // popup's own base CSS sets overflow-x:hidden (a real, sourced
        // clipping rule for long item labels), which would silently clip
        // an absolutely-positioned child sitting outside the popup's own
        // box. Positioned using the popup's own MEASURED width (the same
        // "measure the real rendered element, don't guess" technique
        // select.tsx's own trigger-width mechanism uses) so it lands
        // immediately beside the root popup with zero overlap regardless
        // of that popup's real (column-dependent) width.
        <div
          ref={(el) => {
            submenuPopupRef.current = el
            // move real focus onto the submenu popup as soon as it mounts
            // (a ref callback, not a third effect — see the layout effect's
            // own comment for why the root popup needs the same thing)
            if (el) el.focus()
          }}
          data-slot="dropdown-menu-submenu-popup"
          role="menu"
          aria-orientation="vertical"
          tabIndex={-1}
          onKeyDown={onPopupKeyDown}
          onMouseEnter={clearHoverTimer}
          style={{ top: "100%", left: popupWidth != null ? `${popupWidth}px` : "100%" }}
        >
          <NodeList nodes={openSubmenuNode.items} ctx={ctx} isSubmenuLayer={true} />
        </div>
      )}
    </div>
  )
}
