"use client"

import * as React from "react"
import { ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type TreeContextValue = {
  selected: string | undefined
  select: (value: string) => void
  disabled: boolean
}

const TreeContext = React.createContext<TreeContextValue | null>(null)
const TreeLevelContext = React.createContext(1)

function Tree({
  className,
  selected: selectedProp,
  defaultSelected,
  onSelectedChange,
  disabled = false,
  onFocus,
  ...props
}: React.ComponentProps<"ul"> & {
  selected?: string
  defaultSelected?: string
  onSelectedChange?: (value: string) => void
  disabled?: boolean
}) {
  const ref = React.useRef<HTMLUListElement>(null)
  const [internalSelected, setInternalSelected] =
    React.useState(defaultSelected)
  const selected = selectedProp ?? internalSelected

  const select = React.useCallback(
    (value: string) => {
      setInternalSelected(value)
      onSelectedChange?.(value)
    },
    [onSelectedChange]
  )

  // Roving tabindex: keep exactly one treeitem tabbable (the selected item,
  // else the first). Runs after every render so it survives expand/collapse.
  React.useEffect(() => {
    const tree = ref.current
    if (!tree) return
    const items = Array.from(
      tree.querySelectorAll<HTMLElement>('[role="treeitem"]')
    )
    if (items.length === 0) return
    if (!items.some((item) => item.tabIndex === 0)) {
      const target =
        items.find((item) => item.getAttribute("aria-selected") === "true") ??
        items[0]
      target.tabIndex = 0
    }
  })

  const handleFocus = (event: React.FocusEvent<HTMLUListElement>) => {
    onFocus?.(event)
    const target = event.target as HTMLElement
    if (target.getAttribute("role") !== "treeitem") return
    for (const item of ref.current?.querySelectorAll<HTMLElement>(
      '[role="treeitem"]'
    ) ?? []) {
      item.tabIndex = item === target ? 0 : -1
    }
  }

  const contextValue = React.useMemo(
    () => ({ selected, select, disabled }),
    [selected, select, disabled]
  )

  return (
    <TreeContext.Provider value={contextValue}>
      <ul
        ref={ref}
        role="tree"
        data-slot="tree"
        aria-disabled={disabled || undefined}
        onFocus={handleFocus}
        className={cn("flex w-full flex-col gap-px text-sm", className)}
        {...props}
      />
    </TreeContext.Provider>
  )
}

function TreeItem({
  className,
  value,
  label,
  icon: Icon,
  disabled: disabledProp = false,
  defaultExpanded = false,
  children,
  ...props
}: Omit<React.ComponentProps<"li">, "onSelect"> & {
  value: string
  label: React.ReactNode
  icon?: React.ElementType
  disabled?: boolean
  defaultExpanded?: boolean
}) {
  const context = React.useContext(TreeContext)
  const level = React.useContext(TreeLevelContext)
  const groupId = React.useId()
  const [expanded, setExpanded] = React.useState(defaultExpanded)

  const hasChildren = React.Children.count(children) > 0
  const disabled = disabledProp || (context?.disabled ?? false)
  const selected = context?.selected === value

  const focusItem = (element: Element | null | undefined) => {
    if (element instanceof HTMLElement) element.focus()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    const row = event.currentTarget
    const tree = row.closest('[role="tree"]')
    if (!tree) return
    // Collapsed branches are unmounted, so every queried item is visible.
    const items = Array.from(
      tree.querySelectorAll<HTMLElement>('[role="treeitem"]')
    )
    const index = items.indexOf(row)
    let handled = true

    switch (event.key) {
      case "ArrowDown":
        focusItem(items[index + 1])
        break
      case "ArrowUp":
        focusItem(items[index - 1])
        break
      case "ArrowRight":
        if (!disabled && hasChildren) {
          if (!expanded) setExpanded(true)
          else focusItem(items[index + 1])
        }
        break
      case "ArrowLeft":
        if (!disabled && hasChildren && expanded) {
          setExpanded(false)
        } else {
          const parentGroup = row.closest('ul[role="group"]')
          focusItem(
            parentGroup?.parentElement?.querySelector(
              ':scope > [role="treeitem"]'
            )
          )
        }
        break
      case "Home":
        focusItem(items[0])
        break
      case "End":
        focusItem(items[items.length - 1])
        break
      case "Enter":
      case " ":
        if (!disabled) context?.select(value)
        break
      default:
        if (
          event.key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          // Typeahead: next item whose label starts with the typed character.
          const char = event.key.toLowerCase()
          const ordered = [
            ...items.slice(index + 1),
            ...items.slice(0, index + 1),
          ]
          focusItem(
            ordered.find((item) =>
              item.textContent?.trim().toLowerCase().startsWith(char)
            )
          )
        } else {
          handled = false
        }
    }

    if (handled) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return (
    <li
      data-slot="tree-node"
      role="none"
      className={cn("flex flex-col", className)}
      {...props}
    >
      <div
        role="treeitem"
        data-slot="tree-item"
        aria-level={level}
        aria-selected={selected}
        aria-expanded={hasChildren ? expanded : undefined}
        aria-disabled={disabled || undefined}
        aria-owns={hasChildren && expanded ? groupId : undefined}
        data-state={
          hasChildren ? (expanded ? "open" : "closed") : undefined
        }
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (disabled) return
          if (hasChildren) setExpanded(!expanded)
          context?.select(value)
        }}
        className={cn(
          "flex select-none items-center gap-1.5 rounded-md px-2 py-1.5 outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring",
          selected
            ? "bg-accent text-accent-foreground"
            : !disabled && "hover:bg-accent/50",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <ChevronRightIcon
          data-slot="tree-expand-indicator"
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-150",
            expanded && "rotate-90",
            !hasChildren && "invisible"
          )}
        />
        {Icon && (
          <Icon
            data-slot="tree-item-icon"
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
        )}
        <span data-slot="tree-item-label" className="truncate">
          {label}
        </span>
      </div>
      {hasChildren && expanded && (
        <ul
          id={groupId}
          role="group"
          data-slot="tree-group"
          className="flex flex-col gap-px ps-4"
        >
          <TreeLevelContext.Provider value={level + 1}>
            {children}
          </TreeLevelContext.Provider>
        </ul>
      )}
    </li>
  )
}

export { Tree, TreeItem }
