import * as React from "react"

import "./context-menu.css"

/**
 * ContextMenu — contract/anatomy/context-menu.json.
 *
 * APG menu pattern invoked by a context action: pointer contextmenu,
 * Shift+F10, or the ContextMenu key on the focused target. The panel opens at
 * the invocation point (at the target's box for keyboard invocation) with
 * focus moved into it; arrow keys rove focus; Home/End jump; typeahead jumps
 * to the first item starting with the typed characters; Esc closes and
 * returns focus to the target. role=menu / role=menuitem.
 *
 * Part-for-part identical to anatomy/dropdown-menu.json — dropdown-menu is
 * normative for the shared parts. The whole difference is invocation and
 * anchoring: there is no visible trigger control and no aria-haspopup, and
 * the panel positions at the pointer rather than a trigger edge.
 */

type ContextMenuContextValue = {
  close: (returnFocus?: boolean) => void
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | null>(null)

export interface ContextMenuProps extends React.ComponentProps<"div"> {
  /** the menu's accessible name */
  label?: string
  /** the menu items — ContextMenuItem / ContextMenuSeparator / ContextMenuGroupLabel */
  menu: React.ReactNode
  /** the target region */
  children?: React.ReactNode
}

function ContextMenu({
  label = "Context menu",
  menu,
  children,
  ...props
}: ContextMenuProps) {
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(
    null
  )
  const open = position !== null
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const typeahead = React.useRef({ buffer: "", timer: 0 })

  const items = () =>
    Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(
        '[data-slot="item"]:not([data-disabled])'
      ) ?? []
    )

  const close = React.useCallback((returnFocus = true) => {
    setPosition(null)
    if (returnFocus) triggerRef.current?.focus()
  }, [])

  /* focus moves into the menu when it opens (APG) */
  React.useEffect(() => {
    if (!open) return
    items()[0]?.focus()
  }, [open])

  /* an outside pointer press dismisses */
  React.useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) close(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [close, open])

  const openAtEvent = (event: React.MouseEvent) => {
    event.preventDefault()
    setPosition({ x: event.clientX, y: event.clientY })
  }

  const openAtTarget = () => {
    const box = triggerRef.current?.getBoundingClientRect()
    setPosition({ x: box?.left ?? 0, y: box?.bottom ?? 0 })
  }

  const moveFocus = (to: "next" | "previous" | "first" | "last") => {
    const list = items()
    if (list.length === 0) return
    const current = list.indexOf(document.activeElement as HTMLElement)
    const index =
      to === "first"
        ? 0
        : to === "last"
          ? list.length - 1
          : to === "next"
            ? (current + 1 + list.length) % list.length
            : (current - 1 + list.length) % list.length
    list[index]?.focus()
  }

  const onPanelKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "Escape":
        event.preventDefault()
        event.stopPropagation()
        close()
        return
      case "ArrowDown":
        event.preventDefault()
        moveFocus("next")
        return
      case "ArrowUp":
        event.preventDefault()
        moveFocus("previous")
        return
      case "Home":
        event.preventDefault()
        moveFocus("first")
        return
      case "End":
        event.preventDefault()
        moveFocus("last")
        return
      case "Tab":
        /* Tab dismisses a menu rather than walking through it (APG) */
        close()
        return
      default:
        break
    }
    /* typeahead */
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const state = typeahead.current
      window.clearTimeout(state.timer)
      state.buffer += event.key.toLowerCase()
      state.timer = window.setTimeout(() => {
        state.buffer = ""
      }, 500)
      const match = items().find((item) =>
        (item.textContent ?? "").trim().toLowerCase().startsWith(state.buffer)
      )
      if (match) {
        event.preventDefault()
        match.focus()
      }
    }
  }

  return (
    <ContextMenuContext.Provider value={{ close }}>
      <div
        data-slot="trigger"
        data-invocation="context"
        data-state={open ? "open" : undefined}
        ref={triggerRef}
        /* focusable so keyboard invocation exists; it carries no visible
           chrome and no aria-haspopup — it is a region, not a button */
        tabIndex={0}
        onContextMenu={openAtEvent}
        onKeyDown={(event) => {
          if (
            (event.shiftKey && event.key === "F10") ||
            event.key === "ContextMenu"
          ) {
            event.preventDefault()
            openAtTarget()
          }
        }}
        {...props}
      >
        {children}
      </div>
      {open && (
        <div
          data-slot="panel"
          data-state="open"
          ref={panelRef}
          role="menu"
          aria-label={label}
          tabIndex={-1}
          style={{ top: position.y, left: position.x }}
          onKeyDown={onPanelKeyDown}
        >
          {menu}
        </div>
      )}
    </ContextMenuContext.Provider>
  )
}

export interface ContextMenuItemProps
  extends Omit<React.ComponentProps<"div">, "onSelect"> {
  icon?: React.ReactNode
  shortcut?: React.ReactNode
  disabled?: boolean
  /** destructive items are emphasis:danger at item level, as in dropdown-menu */
  emphasis?: "primary" | "secondary" | "danger"
  onSelect?: () => void
}

function ContextMenuItem({
  icon,
  shortcut,
  disabled = false,
  emphasis = "secondary",
  onSelect,
  children,
  ...props
}: ContextMenuItemProps) {
  const context = React.useContext(ContextMenuContext)

  const select = () => {
    if (disabled) return
    onSelect?.()
    context?.close()
  }

  return (
    <div
      data-slot="item"
      data-emphasis={emphasis}
      data-disabled={disabled ? "" : undefined}
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      onClick={select}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          select()
        }
      }}
      {...props}
    >
      {icon && (
        <span data-slot="item-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span data-slot="item-label">{children}</span>
      {shortcut && <span data-slot="item-shortcut">{shortcut}</span>}
    </div>
  )
}

export type ContextMenuSeparatorProps = React.ComponentProps<"div">

function ContextMenuSeparator(props: ContextMenuSeparatorProps) {
  return <div data-slot="separator" role="separator" {...props} />
}

export type ContextMenuGroupLabelProps = React.ComponentProps<"div">

function ContextMenuGroupLabel({ children, ...props }: ContextMenuGroupLabelProps) {
  return (
    <div data-slot="group-label" role="presentation" {...props}>
      {children}
    </div>
  )
}

export {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroupLabel,
}
