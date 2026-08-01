import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import "./accordion.css"

/**
 * Accordion — contract/anatomy/accordion.json.
 * APG accordion pattern: each trigger is a button inside a heading carrying
 * aria-expanded + aria-controls; Enter/Space toggle (native button semantics);
 * Tab moves through triggers, and the optional arrow/Home/End roving is
 * implemented as APG permits. Single-open vs multi-open is a behavior option
 * on the root, not a variant axis (anatomyNotes).
 */

type AccordionContextValue = {
  openValues: string[]
  toggle: (value: string) => void
  moveFocus: (from: HTMLElement, to: "next" | "previous" | "first" | "last") => void
  headingLevel: number
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

type ItemContextValue = {
  value: string
  open: boolean
  disabled: boolean
  triggerId: string
  panelId: string
}

const ItemContext = React.createContext<ItemContextValue | null>(null)

function useAccordion(part: string) {
  const context = React.useContext(AccordionContext)
  if (!context) throw new Error(`<Accordion${part}> must be used inside <Accordion>`)
  return context
}

function useItem(part: string) {
  const context = React.useContext(ItemContext)
  if (!context) throw new Error(`<Accordion${part}> must be used inside <AccordionItem>`)
  return context
}

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

export interface AccordionProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> {
  /** allow more than one open panel (behavior option, not a variant axis) */
  multiple?: boolean
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string[]) => void
  /** heading level the triggers are wrapped in (APG: a button inside a heading) */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
}

function Accordion({
  multiple = false,
  defaultValue,
  value,
  onValueChange,
  headingLevel = 3,
  children,
  ...props
}: AccordionProps) {
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(() =>
    toArray(defaultValue)
  )
  const openValues = value !== undefined ? toArray(value) : uncontrolled
  const rootRef = React.useRef<HTMLDivElement>(null)

  const toggle = React.useCallback(
    (itemValue: string) => {
      const isOpen = openValues.includes(itemValue)
      const next = isOpen
        ? openValues.filter((entry) => entry !== itemValue)
        : multiple
          ? [...openValues, itemValue]
          : [itemValue]
      if (value === undefined) setUncontrolled(next)
      onValueChange?.(next)
    },
    [multiple, onValueChange, openValues, value]
  )

  const moveFocus = React.useCallback(
    (from: HTMLElement, to: "next" | "previous" | "first" | "last") => {
      const root = rootRef.current
      if (!root) return
      const triggers = Array.from(
        root.querySelectorAll<HTMLButtonElement>(
          '[data-slot="trigger"]:not([disabled])'
        )
      )
      if (triggers.length === 0) return
      const current = triggers.indexOf(from as HTMLButtonElement)
      const index =
        to === "first"
          ? 0
          : to === "last"
            ? triggers.length - 1
            : to === "next"
              ? (current + 1 + triggers.length) % triggers.length
              : (current - 1 + triggers.length) % triggers.length
      triggers[index]?.focus()
    },
    []
  )

  return (
    <AccordionContext.Provider
      value={{ openValues, toggle, moveFocus, headingLevel }}
    >
      <div data-slot="accordion" ref={rootRef} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

export interface AccordionItemProps extends React.ComponentProps<"div"> {
  value: string
  disabled?: boolean
}

function AccordionItem({
  value,
  disabled = false,
  children,
  ...props
}: AccordionItemProps) {
  const { openValues } = useAccordion("Item")
  const baseId = React.useId()
  const open = openValues.includes(value)

  return (
    <ItemContext.Provider
      value={{
        value,
        open,
        disabled,
        triggerId: `${baseId}-trigger`,
        panelId: `${baseId}-panel`,
      }}
    >
      <div
        data-slot="item"
        data-state={open ? "open" : undefined}
        data-disabled={disabled ? "" : undefined}
        {...props}
      >
        {children}
      </div>
    </ItemContext.Provider>
  )
}

export interface AccordionTriggerProps
  extends Omit<React.ComponentProps<"button">, "disabled"> {
  /** trailing (shadcn) or leading (Salt) indicator — a recipe difference, same part */
  indicatorPosition?: "leading" | "trailing"
}

function AccordionTrigger({
  indicatorPosition = "trailing",
  children,
  onClick,
  onKeyDown,
  ...props
}: AccordionTriggerProps) {
  const { toggle, moveFocus, headingLevel } = useAccordion("Trigger")
  const { value, open, disabled, triggerId, panelId } = useItem("Trigger")
  const Heading = `h${headingLevel}` as "h3"

  const indicator = (
    <span data-slot="indicator" aria-hidden="true">
      <ChevronDownIcon />
    </span>
  )

  return (
    <Heading data-slot="heading">
      <button
        type="button"
        data-slot="trigger"
        data-indicator={indicatorPosition}
        data-state={open ? "open" : undefined}
        data-disabled={disabled ? "" : undefined}
        id={triggerId}
        aria-expanded={open}
        aria-controls={panelId}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented && !disabled) toggle(value)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented) return
          const target = event.currentTarget
          /* APG: arrow/Home/End trigger roving is optional — offered here */
          switch (event.key) {
            case "ArrowDown":
              event.preventDefault()
              moveFocus(target, "next")
              break
            case "ArrowUp":
              event.preventDefault()
              moveFocus(target, "previous")
              break
            case "Home":
              event.preventDefault()
              moveFocus(target, "first")
              break
            case "End":
              event.preventDefault()
              moveFocus(target, "last")
              break
            default:
              break
          }
        }}
        {...props}
      >
        {indicatorPosition === "leading" && indicator}
        <span data-slot="label">{children}</span>
        {indicatorPosition === "trailing" && indicator}
      </button>
    </Heading>
  )
}

export type AccordionPanelProps = React.ComponentProps<"div">

function AccordionPanel({ children, ...props }: AccordionPanelProps) {
  const { open, triggerId, panelId } = useItem("Panel")
  /* closed panels stay mounted so the height transition has something to
     animate, and are made non-interactive with inert so nothing inside them
     remains a tab stop */
  const inertProps = open ? {} : ({ inert: "" } as Record<string, string>)

  return (
    <div
      data-slot="panel"
      data-state={open ? "open" : undefined}
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      {...inertProps}
      {...props}
    >
      <div data-slot="panel-inner">{children}</div>
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionPanel }
