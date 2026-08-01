import * as React from "react"

import "./dropdown-menu.css"

export interface DropdownMenuItem {
  type?: "item"
  /* the option's accessible name; also the typeahead key */
  label: string
  icon?: React.ReactNode
  shortcut?: string
  disabled?: boolean
  /* emphasis:danger applied at item level — same anatomy, no extra part */
  destructive?: boolean
  onSelect?: () => void
}

export interface DropdownMenuSeparator {
  type: "separator"
}

export interface DropdownMenuGroupLabel {
  type: "group-label"
  label: React.ReactNode
}

export type DropdownMenuEntry =
  | DropdownMenuItem
  | DropdownMenuSeparator
  | DropdownMenuGroupLabel

export function isMenuItem(entry: DropdownMenuEntry): entry is DropdownMenuItem {
  return entry.type === undefined || entry.type === "item"
}

/* typeahead shared by dropdown-menu and menubar (APG: both bar and menu) */
export function useTypeahead(onMatch: (query: string) => void) {
  const buffer = React.useRef("")
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )
  return (key: string) => {
    if (key.length !== 1 || key === " ") return false
    buffer.current += key.toLowerCase()
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      buffer.current = ""
    }, 500)
    onMatch(buffer.current)
    return true
  }
}

export interface DropdownMenuProps {
  /* the trigger's own label; the trigger delegates its chrome to anatomy/button.json */
  trigger: React.ReactNode
  entries: DropdownMenuEntry[]
  disabled?: boolean
  /* the expand icon role, rendered inside the trigger when supplied */
  triggerIcon?: React.ReactNode
}

function DropdownMenu({
  trigger,
  entries,
  disabled = false,
  triggerIcon,
}: DropdownMenuProps) {
  const baseId = React.useId()
  const panelId = `${baseId}-menu`
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([])

  const enabledIndexes = entries.reduce<number[]>((acc, entry, index) => {
    if (isMenuItem(entry) && !entry.disabled) acc.push(index)
    return acc
  }, [])

  /* roving focus: the active item holds DOM focus (APG menu) */
  React.useEffect(() => {
    if (!open || activeIndex < 0) return
    itemRefs.current[activeIndex]?.focus()
  }, [open, activeIndex])

  /* dismissal on outside pointer press */
  React.useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open])

  const openMenu = (edge: "first" | "last") => {
    setOpen(true)
    setActiveIndex(
      edge === "first"
        ? (enabledIndexes[0] ?? -1)
        : (enabledIndexes[enabledIndexes.length - 1] ?? -1)
    )
  }

  const closeMenu = (returnFocus = true) => {
    setOpen(false)
    setActiveIndex(-1)
    if (returnFocus) triggerRef.current?.focus()
  }

  const moveBy = (delta: number) => {
    if (enabledIndexes.length === 0) return
    const position = enabledIndexes.indexOf(activeIndex)
    const next =
      (position + delta + enabledIndexes.length) % enabledIndexes.length
    setActiveIndex(enabledIndexes[position === -1 ? 0 : next])
  }

  const matchTypeahead = (query: string) => {
    const found = enabledIndexes.find((index) => {
      const entry = entries[index]
      return (
        isMenuItem(entry) && entry.label.toLowerCase().startsWith(query)
      )
    })
    if (found !== undefined) setActiveIndex(found)
  }
  const typeahead = useTypeahead(matchTypeahead)

  const selectItem = (index: number) => {
    const entry = entries[index]
    if (!isMenuItem(entry) || entry.disabled) return
    entry.onSelect?.()
    closeMenu()
  }

  const onTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openMenu("first")
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      openMenu("last")
    }
  }

  const onPanelKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        moveBy(1)
        return
      case "ArrowUp":
        event.preventDefault()
        moveBy(-1)
        return
      case "Home":
        event.preventDefault()
        setActiveIndex(enabledIndexes[0] ?? -1)
        return
      case "End":
        event.preventDefault()
        setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? -1)
        return
      case "Escape":
        event.preventDefault()
        event.stopPropagation()
        closeMenu()
        return
      case "Tab":
        closeMenu(false)
        return
      case "Enter":
      case " ":
        event.preventDefault()
        selectItem(activeIndex)
        return
      default:
        if (typeahead(event.key)) event.preventDefault()
    }
  }

  return (
    <div ref={rootRef} data-slot="dropdown-menu">
      <button
        ref={triggerRef}
        type="button"
        data-slot="trigger"
        data-state={open ? "open" : undefined}
        data-disabled={disabled ? "" : undefined}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => (open ? closeMenu() : openMenu("first"))}
        onKeyDown={onTriggerKeyDown}
      >
        <span data-slot="trigger-label">{trigger}</span>
        {triggerIcon && (
          <span data-slot="trigger-icon" aria-hidden="true">
            {triggerIcon}
          </span>
        )}
      </button>
      {open && (
        <div
          id={panelId}
          data-slot="panel"
          data-state="open"
          role="menu"
          aria-label={typeof trigger === "string" ? trigger : undefined}
          onKeyDown={onPanelKeyDown}
        >
          {entries.map((entry, index) => {
            if (entry.type === "separator") {
              return (
                <div
                  key={index}
                  data-slot="separator"
                  role="separator"
                />
              )
            }
            if (entry.type === "group-label") {
              return (
                <div key={index} data-slot="group-label" role="presentation">
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
                data-emphasis={entry.destructive ? "danger" : undefined}
                data-disabled={entry.disabled ? "" : undefined}
                role="menuitem"
                tabIndex={-1}
                aria-disabled={entry.disabled || undefined}
                onClick={() => selectItem(index)}
                onMouseEnter={() => !entry.disabled && setActiveIndex(index)}
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
}

export { DropdownMenu }
