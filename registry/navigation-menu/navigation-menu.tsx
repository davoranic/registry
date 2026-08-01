import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import "./navigation-menu.css"

type Orientation = "horizontal" | "vertical"

export interface NavigationMenuLink {
  label: React.ReactNode
  href: string
  /* the current destination carries aria-current=page */
  current?: boolean
  description?: React.ReactNode
}

export interface NavigationMenuItemDef {
  label: string
  /* a plain destination renders the link part… */
  href?: string
  current?: boolean
  /* …an item that owns a panel renders the trigger part instead */
  links?: NavigationMenuLink[]
  panel?: React.ReactNode
  disabled?: boolean
}

export interface NavigationMenuProps {
  items: NavigationMenuItemDef[]
  orientation?: Orientation
  /* names the nav landmark */
  label?: string
}

/* APG disclosure navigation inside a nav landmark: links stay links, a parent
   item's trigger is a button with aria-expanded + aria-controls. Left/Right
   (horizontal) or Up/Down (vertical) rove the top level, Home/End jump,
   Enter/Space toggle a panel, Down moves into the open panel, Esc closes it and
   returns focus to its trigger, Tab always leaves the menu. */
function NavigationMenu({
  items,
  orientation = "horizontal",
  label = "Main",
}: NavigationMenuProps) {
  const baseId = React.useId()
  const [focusedIndex, setFocusedIndex] = React.useState(0)
  const [openIndex, setOpenIndex] = React.useState(-1)
  const rootRef = React.useRef<HTMLElement>(null)
  const topRefs = React.useRef<(HTMLElement | null)[]>([])
  const panelRefs = React.useRef<(HTMLDivElement | null)[]>([])

  const enabled = items.reduce<number[]>((acc, item, index) => {
    if (!item.disabled) acc.push(index)
    return acc
  }, [])

  React.useEffect(() => {
    if (openIndex < 0) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenIndex(-1)
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [openIndex])

  const focusTop = (index: number) => {
    setFocusedIndex(index)
    topRefs.current[index]?.focus()
  }

  const move = (delta: number) => {
    if (enabled.length === 0) return
    const position = enabled.indexOf(focusedIndex)
    const next = (position + delta + enabled.length) % enabled.length
    focusTop(enabled[position === -1 ? 0 : next])
  }

  const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight"
  const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft"

  const onTopKeyDown =
    (index: number, ownsPanel: boolean) => (event: React.KeyboardEvent) => {
      switch (event.key) {
        case nextKey:
          event.preventDefault()
          move(1)
          return
        case prevKey:
          event.preventDefault()
          move(-1)
          return
        case "Home":
          event.preventDefault()
          focusTop(enabled[0] ?? 0)
          return
        case "End":
          event.preventDefault()
          focusTop(enabled[enabled.length - 1] ?? 0)
          return
        case "Escape":
          if (openIndex < 0) return
          event.preventDefault()
          setOpenIndex(-1)
          topRefs.current[index]?.focus()
          return
        case "Enter":
        case " ":
          if (!ownsPanel) return
          event.preventDefault()
          setOpenIndex(openIndex === index ? -1 : index)
          return
        case "ArrowDown": {
          /* Down moves into the open panel (horizontal bars only —
             vertically Down is the roving key) */
          if (orientation !== "horizontal" || !ownsPanel) return
          event.preventDefault()
          if (openIndex !== index) {
            setOpenIndex(index)
            return
          }
          panelRefs.current[index]
            ?.querySelector<HTMLElement>('a[href], button:not([disabled])')
            ?.focus()
          return
        }
        default:
      }
    }

  const onPanelKeyDown = (index: number) => (event: React.KeyboardEvent) => {
    if (event.key !== "Escape") return
    event.preventDefault()
    event.stopPropagation()
    setOpenIndex(-1)
    topRefs.current[index]?.focus()
  }

  return (
    <nav
      ref={rootRef}
      data-slot="navigation-menu"
      data-orientation={orientation}
      aria-label={label}
    >
      <ul data-slot="list" data-orientation={orientation}>
        {items.map((item, index) => {
          const ownsPanel = Boolean(item.links?.length || item.panel)
          const isOpen = openIndex === index
          const panelId = `${baseId}-panel-${index}`
          const tabIndex = focusedIndex === index ? 0 : -1
          return (
            <li key={index} data-slot="item">
              {ownsPanel ? (
                <button
                  ref={(node) => {
                    topRefs.current[index] = node
                  }}
                  type="button"
                  data-slot="trigger"
                  data-state={isOpen ? "open" : undefined}
                  data-disabled={item.disabled ? "" : undefined}
                  tabIndex={tabIndex}
                  disabled={item.disabled}
                  aria-expanded={isOpen}
                  aria-controls={isOpen ? panelId : undefined}
                  onFocus={() => setFocusedIndex(index)}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  onKeyDown={onTopKeyDown(index, true)}
                >
                  {item.label}
                  <span data-slot="trigger-icon" aria-hidden="true">
                    <ChevronDownIcon />
                  </span>
                </button>
              ) : (
                <a
                  ref={(node) => {
                    topRefs.current[index] = node
                  }}
                  data-slot="link"
                  data-state={item.current ? "selected" : undefined}
                  data-disabled={item.disabled ? "" : undefined}
                  href={item.href}
                  tabIndex={tabIndex}
                  aria-current={item.current ? "page" : undefined}
                  onFocus={() => setFocusedIndex(index)}
                  onKeyDown={onTopKeyDown(index, false)}
                >
                  {item.label}
                  <span
                    data-slot="selected-indicator"
                    data-orientation={orientation}
                    aria-hidden="true"
                  />
                </a>
              )}
              {ownsPanel && isOpen && (
                <div
                  id={panelId}
                  ref={(node) => {
                    panelRefs.current[index] = node
                  }}
                  data-slot="panel"
                  data-state="open"
                  data-orientation={orientation}
                  onKeyDown={onPanelKeyDown(index)}
                >
                  {item.panel}
                  {item.links?.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      data-slot="link"
                      data-state={link.current ? "selected" : undefined}
                      href={link.href}
                      aria-current={link.current ? "page" : undefined}
                    >
                      {link.label}
                      {link.description && (
                        <span data-slot="link-description">
                          {link.description}
                        </span>
                      )}
                      <span
                        data-slot="selected-indicator"
                        data-orientation={orientation}
                        aria-hidden="true"
                      />
                    </a>
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export { NavigationMenu }
