import * as React from "react"

import "./tabs.css"

type Orientation = "horizontal" | "vertical"
type Size = "sm" | "md" | "lg"

interface TabsContextValue {
  value: string | undefined
  setValue: (value: string) => void
  orientation: Orientation
  baseId: string
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabs(component: string) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error(`<${component}> must be used within <Tabs>`)
  return context
}

export interface TabsProps extends React.ComponentProps<"div"> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: Orientation
  size?: Size
}

function Tabs({
  value,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  size = "md",
  children,
  ...props
}: TabsProps) {
  const baseId = React.useId()
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const currentValue = value !== undefined ? value : internalValue
  const setValue = (next: string) => {
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
  }
  return (
    <TabsContext.Provider
      value={{ value: currentValue, setValue, orientation, baseId }}
    >
      <div
        data-slot="tabs"
        data-orientation={orientation}
        data-size={size === "md" ? undefined : size}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({ children, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useTabs("TabsList")

  /* roving focus: arrows move between tabs, Home/End to first/last;
     activation is automatic on focus (anatomy behavior default) */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight"
    const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft"
    if (![nextKey, prevKey, "Home", "End"].includes(event.key)) return
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not([data-disabled])'
      )
    )
    const currentIndex = tabs.indexOf(
      document.activeElement as HTMLButtonElement
    )
    if (currentIndex === -1) return
    event.preventDefault()
    let nextIndex = currentIndex
    if (event.key === nextKey)
      nextIndex = (currentIndex + 1) % tabs.length
    else if (event.key === prevKey)
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
    else if (event.key === "Home") nextIndex = 0
    else if (event.key === "End") nextIndex = tabs.length - 1
    tabs[nextIndex].focus()
    tabs[nextIndex].click()
  }

  return (
    <div
      data-slot="list"
      role="tablist"
      aria-orientation={orientation}
      onKeyDown={onKeyDown}
      {...props}
    >
      {children}
    </div>
  )
}

export interface TabsTriggerProps extends React.ComponentProps<"button"> {
  value: string
}

function TabsTrigger({
  value,
  disabled,
  children,
  ...props
}: TabsTriggerProps) {
  const { value: currentValue, setValue, baseId } = useTabs("TabsTrigger")
  const selected = currentValue === value
  return (
    <button
      type="button"
      data-slot="trigger"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      data-state={selected ? "selected" : undefined}
      data-disabled={disabled ? "" : undefined}
      disabled={disabled}
      onClick={() => setValue(value)}
      {...props}
    >
      <span data-slot="label">{children}</span>
      <span data-slot="selected-indicator" aria-hidden="true" />
    </button>
  )
}

export interface TabsPanelProps extends React.ComponentProps<"div"> {
  value: string
}

function TabsPanel({ value, children, ...props }: TabsPanelProps) {
  const { value: currentValue, baseId } = useTabs("TabsPanel")
  const selected = currentValue === value
  return (
    <div
      data-slot="panel"
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={!selected}
      tabIndex={0}
      {...props}
    >
      {selected && children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsPanel }
