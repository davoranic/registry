import * as React from "react"
import { PanelLeftIcon } from "lucide-react"

import "./sidebar.css"

/* logical edge names survive RTL (anatomy/sidebar.json) */
type Edge = "inline-start" | "inline-end"

export interface SidebarMenuEntry {
  label: string
  href?: string
  icon?: React.ReactNode
  badge?: React.ReactNode
  /* the current destination carries aria-current=page */
  current?: boolean
  disabled?: boolean
  onSelect?: () => void
  /* a nested list follows the APG disclosure pattern */
  items?: SidebarMenuEntry[]
}

export interface SidebarGroupDef {
  label?: React.ReactNode
  items: SidebarMenuEntry[]
  /* rule this group off from the previous one */
  separated?: boolean
}

export interface SidebarProps {
  groups: SidebarGroupDef[]
  header?: React.ReactNode
  footer?: React.ReactNode
  edge?: Edge
  /* COLLAPSED is the disclosure state of the region, not a canonical item
     state — it is expressed as data-collapsed on root */
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /* names the nav landmark */
  label?: string
}

function Sidebar({
  groups,
  header,
  footer,
  edge = "inline-start",
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  label = "Sidebar",
}: SidebarProps) {
  const baseId = React.useId()
  const contentId = `${baseId}-content`
  const [internalCollapsed, setInternalCollapsed] =
    React.useState(defaultCollapsed)
  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})

  const toggleCollapsed = () => {
    const next = !isCollapsed
    if (collapsed === undefined) setInternalCollapsed(next)
    onCollapsedChange?.(next)
  }

  const trigger = (
    <button
      type="button"
      data-slot="trigger"
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!isCollapsed}
      aria-controls={contentId}
      onClick={toggleCollapsed}
    >
      <PanelLeftIcon aria-hidden="true" />
    </button>
  )

  const renderEntry = (
    entry: SidebarMenuEntry,
    key: string
  ): React.ReactNode => {
    const hasSubmenu = Boolean(entry.items?.length)
    const submenuId = `${baseId}-submenu-${key}`
    const isExpanded = expanded[key] ?? false

    /* the collapsed rail hides the label, so the accessible name is carried
       by the button itself — never by a tooltip alone. The badge's meaning is
       repeated there for the same reason. */
    const accessibleName =
      entry.badge !== undefined
        ? `${entry.label}, ${String(entry.badge)}`
        : entry.label

    const chrome = (
      <>
        {entry.icon && (
          <span data-slot="menu-icon" aria-hidden="true">
            {entry.icon}
          </span>
        )}
        <span data-slot="menu-label">{entry.label}</span>
        {entry.badge !== undefined && (
          <span data-slot="menu-badge" aria-hidden="true">
            {entry.badge}
          </span>
        )}
      </>
    )

    return (
      <li key={key} data-slot="menu-item">
        {hasSubmenu ? (
          <button
            type="button"
            data-slot="menu-button"
            data-state={isExpanded ? "open" : undefined}
            data-disabled={entry.disabled ? "" : undefined}
            disabled={entry.disabled}
            aria-label={accessibleName}
            aria-expanded={isExpanded}
            aria-controls={submenuId}
            onClick={() =>
              setExpanded((prev) => ({ ...prev, [key]: !isExpanded }))
            }
          >
            {chrome}
          </button>
        ) : entry.href ? (
          <a
            data-slot="menu-button"
            data-state={entry.current ? "selected" : undefined}
            data-disabled={entry.disabled ? "" : undefined}
            href={entry.href}
            aria-label={accessibleName}
            aria-current={entry.current ? "page" : undefined}
            onClick={entry.onSelect}
          >
            {chrome}
          </a>
        ) : (
          <button
            type="button"
            data-slot="menu-button"
            data-state={entry.current ? "selected" : undefined}
            data-disabled={entry.disabled ? "" : undefined}
            disabled={entry.disabled}
            aria-label={accessibleName}
            aria-current={entry.current ? "page" : undefined}
            onClick={entry.onSelect}
          >
            {chrome}
          </button>
        )}
        {hasSubmenu && (
          /* a real nested list, so depth is announced */
          <ul
            id={submenuId}
            data-slot="submenu"
            data-state={isExpanded ? "open" : undefined}
            hidden={!isExpanded}
          >
            {entry.items?.map((child, index) =>
              renderEntry(child, `${key}-${index}`)
            )}
          </ul>
        )}
      </li>
    )
  }

  return (
    <nav
      data-slot="sidebar"
      data-edge={edge}
      data-collapsed={isCollapsed ? "" : undefined}
      aria-label={label}
    >
      {header ? (
        <div data-slot="header">
          {header}
          {trigger}
        </div>
      ) : (
        trigger
      )}
      <div id={contentId} data-slot="content">
        {groups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {group.separated && groupIndex > 0 && (
              <div data-slot="separator" role="separator" />
            )}
            <div data-slot="group">
              {group.label !== undefined && (
                <div data-slot="group-label">{group.label}</div>
              )}
              <ul data-slot="menu">
                {group.items.map((entry, index) =>
                  renderEntry(entry, `${groupIndex}-${index}`)
                )}
              </ul>
            </div>
          </React.Fragment>
        ))}
      </div>
      {footer && <div data-slot="footer">{footer}</div>}
    </nav>
  )
}

export { Sidebar }
