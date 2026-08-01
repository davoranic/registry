import * as React from "react"

import "./item.css"

type Prominence = "solid" | "outline" | "ghost"
type Size = "sm" | "md" | "lg"

const ItemGroupContext = React.createContext(false)

export interface ItemProps
  extends Omit<React.ComponentProps<"div">, "title" | "onSelect"> {
  prominence?: Prominence
  size?: Size
  /** Leading avatar, framed glyph or thumbnail — decorative. */
  media?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Trailing slot; its children keep their own tab stops. */
  actions?: React.ReactNode
  href?: string
  selected?: boolean
  disabled?: boolean
}

/**
 * Content-row primitive (contract/anatomy/item.json). No behavior of its own:
 * inside a group the wrapper is role=list and each row a listitem; an
 * interactive item adopts the semantics of the element it renders as (link or
 * button) and is then a single tab stop with its own focus ring. It never
 * invents roving focus — a selectable collection is listbox/tree, a different
 * pattern.
 */
function Item({
  prominence = "ghost",
  size = "md",
  media,
  title,
  description,
  actions,
  href,
  selected,
  disabled,
  onClick,
  children,
  ...props
}: ItemProps) {
  const inGroup = React.useContext(ItemGroupContext)
  /* an interactive root may not swallow the actions slot — nested interactive
     content is invalid, so a row with actions stays a plain container and the
     actions carry their own semantics */
  const interactive = Boolean(href || onClick) && !actions
  const Root = (href ? "a" : onClick ? "button" : "div") as "div"

  const row = (
    <Root
      data-slot="item"
      data-prominence={prominence}
      data-size={size === "md" ? undefined : size}
      data-interactive={interactive ? "" : undefined}
      data-state={selected ? "selected" : undefined}
      data-disabled={disabled ? "" : undefined}
      role={!interactive && inGroup ? "listitem" : undefined}
      aria-current={selected && href ? "true" : undefined}
      aria-pressed={selected && interactive && !href ? true : undefined}
      aria-disabled={disabled || undefined}
      {...(href ? { href: disabled ? undefined : href } : null)}
      {...(interactive && !href ? { type: "button" as const } : null)}
      {...(interactive ? { onClick } : null)}
      {...props}
    >
      {media && (
        <div data-slot="media" aria-hidden="true">
          {media}
        </div>
      )}
      <div data-slot="content">
        <div data-slot="title">{title}</div>
        {description && <div data-slot="description">{description}</div>}
      </div>
      {children}
      {actions && <div data-slot="actions">{actions}</div>}
    </Root>
  )

  /* inside a group an interactive row keeps its link/button role, so the
     listitem semantics live on a structural <li> (recipe mechanics, not a
     part) rather than overwriting them */
  return inGroup && interactive ? <li>{row}</li> : row
}

/** role=list wrapper; contributes stacking only. */
function ItemGroup({ children, ...props }: React.ComponentProps<"ul">) {
  return (
    <ItemGroupContext.Provider value={true}>
      <ul data-slot="group" role="list" {...props}>
        {children}
      </ul>
    </ItemGroupContext.Provider>
  )
}

/** Rule between items in a group (anatomy/separator.json). */
function ItemSeparator(props: React.ComponentProps<"li">) {
  return <li data-slot="separator" role="separator" {...props} />
}

export { Item, ItemGroup, ItemSeparator }
