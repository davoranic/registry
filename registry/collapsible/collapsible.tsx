import * as React from "react"

import "./collapsible.css"

interface CollapsibleContextValue {
  open: boolean
  toggle: () => void
  disabled: boolean
  baseId: string
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(
  null
)

function useCollapsible(component: string) {
  const context = React.useContext(CollapsibleContext)
  if (!context) throw new Error(`<${component}> must be used within <Collapsible>`)
  return context
}

export interface CollapsibleProps extends React.ComponentProps<"div"> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

/**
 * APG disclosure pattern (contract/anatomy/collapsible.json): the trigger is
 * a button carrying aria-expanded + aria-controls, Enter/Space toggle, the
 * panel leaves the accessibility tree while collapsed, and focus never moves
 * on toggle. The root owns the state and the id wiring, and paints nothing.
 */
function Collapsible({
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  children,
  ...props
}: CollapsibleProps) {
  const baseId = React.useId()
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isOpen = open !== undefined ? open : internalOpen
  const toggle = () => {
    if (disabled) return
    if (open === undefined) setInternalOpen(!isOpen)
    onOpenChange?.(!isOpen)
  }
  return (
    <CollapsibleContext.Provider
      value={{ open: isOpen, toggle, disabled, baseId }}
    >
      <div
        data-slot="collapsible"
        data-state={isOpen ? "open" : undefined}
        data-disabled={disabled ? "" : undefined}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

/** A real button; its content is caller-supplied — any expand indicator is
 *  composed in, never a part of this anatomy. */
function CollapsibleTrigger({
  onClick,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { open, toggle, disabled, baseId } = useCollapsible("CollapsibleTrigger")
  return (
    <button
      type="button"
      data-slot="trigger"
      id={`${baseId}-trigger`}
      aria-expanded={open}
      aria-controls={`${baseId}-panel`}
      data-state={open ? "open" : undefined}
      data-disabled={disabled ? "" : undefined}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) toggle()
      }}
      {...props}
    >
      {children}
    </button>
  )
}

/** Block size animates between 0 and the content height; the inner element is
 *  the measuring wrapper (RECIPE mechanics, not a part — anatomyNotes). */
function CollapsiblePanel({ children, ...props }: React.ComponentProps<"div">) {
  const { open, baseId } = useCollapsible("CollapsiblePanel")
  const inert = open ? {} : ({ inert: "" } as Record<string, string>)
  return (
    <div
      data-slot="panel"
      id={`${baseId}-panel`}
      role="region"
      aria-labelledby={`${baseId}-trigger`}
      aria-hidden={open ? undefined : true}
      data-state={open ? "open" : undefined}
      {...inert}
      {...props}
    >
      <div>{children}</div>
    </div>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsiblePanel }
