import * as React from "react"

import "./menubar.css"

export interface MenubarItem {
  type?: "item"
  /* the item's accessible name; also the typeahead key */
  label: string
  icon?: React.ReactNode
  shortcut?: string
  disabled?: boolean
  onSelect?: () => void
}

export interface MenubarSeparator {
  type: "separator"
}

export interface MenubarGroupLabel {
  type: "group-label"
  label: React.ReactNode
}

export type MenubarEntry = MenubarItem | MenubarSeparator | MenubarGroupLabel

export interface MenubarMenu {
  label: string
  disabled?: boolean
  entries: MenubarEntry[]
}

function isMenubarItem(entry: MenubarEntry): entry is MenubarItem {
  return entry.type === undefined || entry.type === "item"
}

export interface MenubarProps {
  menus: MenubarMenu[]
  /* names the menubar for assistive tech */
  label?: string
}

/* APG menubar: one tab stop for the whole bar; Left/Right rove and wrap;
   Down/Up open the focused trigger's menu on its first/last item; while a menu
   is open Left/Right close it and open the adjacent one; typeahead in both the
   bar and the menu; Esc closes and returns focus to its trigger. */
function Menubar({ menus, label = "Main" }: MenubarProps) {
  const baseId = React.useId()
  const [focusedMenu, setFocusedMenu] = React.useState(0)
  const [openMenu, setOpenMenu] = React.useState(-1)
  const [activeItem, setActiveItem] = React.useState(-1)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const triggerRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const typeaheadBuffer = React.useRef("")
  const typeaheadTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const enabledMenus = menus.reduce<number[]>((acc, menu, index) => {
    if (!menu.disabled) acc.push(index)
    return acc
  }, [])

  const entriesOf = (index: number) => menus[index]?.entries ?? []
  const enabledItems = (menuIndex: number) =>
    entriesOf(menuIndex).reduce<number[]>((acc, entry, index) => {
      if (isMenubarItem(entry) && !entry.disabled) acc.push(index)
      return acc
    }, [])

  React.useEffect(
    () => () => {
      if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current)
    },
    []
  )

  /* roving focus follows the model: the open menu's active item, else the
     focused trigger — but only once the bar already owns focus */
  React.useEffect(() => {
    if (openMenu < 0 || activeItem < 0) return
    itemRefs.current[activeItem]?.focus()
  }, [openMenu, activeItem])

  React.useEffect(() => {
    if (!rootRef.current?.contains(document.activeElement)) return
    if (openMenu < 0) triggerRefs.current[focusedMenu]?.focus()
  }, [focusedMenu, openMenu])

  React.useEffect(() => {
    if (openMenu < 0) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(-1)
        setActiveItem(-1)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [openMenu])

  const typeahead = (key: string, onMatch: (query: string) => void) => {
    if (key.length !== 1 || key === " ") return false
    typeaheadBuffer.current += key.toLowerCase()
    if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current)
    typeaheadTimer.current = setTimeout(() => {
      typeaheadBuffer.current = ""
    }, 500)
    onMatch(typeaheadBuffer.current)
    return true
  }

  const open = (menuIndex: number, edge: "first" | "last" | "none") => {
    const items = enabledItems(menuIndex)
    setFocusedMenu(menuIndex)
    setOpenMenu(menuIndex)
    setActiveItem(
      edge === "first"
        ? (items[0] ?? -1)
        : edge === "last"
          ? (items[items.length - 1] ?? -1)
          : -1
    )
  }

  const close = (returnFocus = true) => {
    const trigger = triggerRefs.current[openMenu]
    setOpenMenu(-1)
    setActiveItem(-1)
    if (returnFocus) trigger?.focus()
  }

  const moveTrigger = (delta: number) => {
    if (enabledMenus.length === 0) return
    const position = enabledMenus.indexOf(focusedMenu)
    const next =
      (position + delta + enabledMenus.length) % enabledMenus.length
    const target = enabledMenus[position === -1 ? 0 : next]
    /* while a menu is open, roving also swaps which menu is down */
    if (openMenu >= 0) open(target, "none")
    else setFocusedMenu(target)
  }

  const moveItem = (delta: number) => {
    const items = enabledItems(openMenu)
    if (items.length === 0) return
    const position = items.indexOf(activeItem)
    const next = (position + delta + items.length) % items.length
    setActiveItem(items[position === -1 ? 0 : next])
  }

  const selectItem = (menuIndex: number, itemIndex: number) => {
    const entry = entriesOf(menuIndex)[itemIndex]
    if (!entry || !isMenubarItem(entry) || entry.disabled) return
    entry.onSelect?.()
    close()
  }

  const onTriggerKeyDown =
    (menuIndex: number) => (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowRight":
          event.preventDefault()
          moveTrigger(1)
          return
        case "ArrowLeft":
          event.preventDefault()
          moveTrigger(-1)
          return
        case "Home":
          event.preventDefault()
          setFocusedMenu(enabledMenus[0] ?? 0)
          return
        case "End":
          event.preventDefault()
          setFocusedMenu(enabledMenus[enabledMenus.length - 1] ?? 0)
          return
        case "ArrowDown":
        case "Enter":
        case " ":
          event.preventDefault()
          open(menuIndex, "first")
          return
        case "ArrowUp":
          event.preventDefault()
          open(menuIndex, "last")
          return
        case "Escape":
          event.preventDefault()
          close()
          return
        default:
          /* typeahead across the bar */
          if (
            typeahead(event.key, (query) => {
              const found = enabledMenus.find((index) =>
                menus[index].label.toLowerCase().startsWith(query)
              )
              if (found !== undefined) setFocusedMenu(found)
            })
          )
            event.preventDefault()
      }
    }

  const onPanelKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        moveItem(1)
        return
      case "ArrowUp":
        event.preventDefault()
        moveItem(-1)
        return
      case "ArrowRight":
        event.preventDefault()
        moveTrigger(1)
        return
      case "ArrowLeft":
        event.preventDefault()
        moveTrigger(-1)
        return
      case "Home":
        event.preventDefault()
        setActiveItem(enabledItems(openMenu)[0] ?? -1)
        return
      case "End": {
        event.preventDefault()
        const items = enabledItems(openMenu)
        setActiveItem(items[items.length - 1] ?? -1)
        return
      }
      case "Escape":
        event.preventDefault()
        event.stopPropagation()
        close()
        return
      case "Tab":
        close(false)
        return
      case "Enter":
      case " ":
        event.preventDefault()
        selectItem(openMenu, activeItem)
        return
      default:
        /* typeahead inside the menu */
        if (
          typeahead(event.key, (query) => {
            const found = enabledItems(openMenu).find((index) => {
              const entry = entriesOf(openMenu)[index]
              return (
                isMenubarItem(entry) &&
                entry.label.toLowerCase().startsWith(query)
              )
            })
            if (found !== undefined) setActiveItem(found)
          })
        )
          event.preventDefault()
    }
  }

  return (
    <div
      ref={rootRef}
      data-slot="menubar"
      role="menubar"
      aria-label={label}
      aria-orientation="horizontal"
    >
      {menus.map((menu, menuIndex) => {
        const isOpen = openMenu === menuIndex
        const panelId = `${baseId}-menu-${menuIndex}`
        return (
          <div key={menuIndex} data-slot="menubar-menu">
            <button
              ref={(node) => {
                triggerRefs.current[menuIndex] = node
              }}
              type="button"
              data-slot="trigger"
              data-state={isOpen ? "open" : undefined}
              data-disabled={menu.disabled ? "" : undefined}
              role="menuitem"
              /* one tab stop for the whole bar */
              tabIndex={focusedMenu === menuIndex ? 0 : -1}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-controls={isOpen ? panelId : undefined}
              aria-disabled={menu.disabled || undefined}
              disabled={menu.disabled}
              onClick={() =>
                isOpen ? close() : open(menuIndex, "none")
              }
              onFocus={() => setFocusedMenu(menuIndex)}
              onMouseEnter={() => {
                if (openMenu >= 0 && !menu.disabled) open(menuIndex, "none")
              }}
              onKeyDown={onTriggerKeyDown(menuIndex)}
            >
              {menu.label}
            </button>
            {isOpen && (
              <div
                id={panelId}
                data-slot="panel"
                data-state="open"
                role="menu"
                aria-label={menu.label}
                onKeyDown={onPanelKeyDown}
              >
                {menu.entries.map((entry, index) => {
                  if (entry.type === "separator") {
                    return (
                      <div key={index} data-slot="separator" role="separator" />
                    )
                  }
                  if (entry.type === "group-label") {
                    return (
                      <div
                        key={index}
                        data-slot="group-label"
                        role="presentation"
                      >
                        {entry.label}
                      </div>
                    )
                  }
                  return (
                    <div
                      key={index}
                      ref={(node) => {
                        itemRefs.current[index] = node
                      }}
                      data-slot="item"
                      data-disabled={entry.disabled ? "" : undefined}
                      role="menuitem"
                      tabIndex={-1}
                      aria-disabled={entry.disabled || undefined}
                      onClick={() => selectItem(menuIndex, index)}
                      onMouseEnter={() =>
                        !entry.disabled && setActiveItem(index)
                      }
                    >
                      {entry.icon && (
                        <span data-slot="item-icon" aria-hidden="true">
                          {entry.icon}
                        </span>
                      )}
                      <span data-slot="item-label">{entry.label}</span>
                      {entry.shortcut && (
                        <span data-slot="item-shortcut" aria-hidden="true">
                          {entry.shortcut}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export { Menubar }
