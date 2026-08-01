import * as React from "react"

import "./toggle-group.css"

type Prominence = "solid" | "outline" | "ghost"
type Size = "sm" | "md" | "lg"
type Orientation = "horizontal" | "vertical"
type SelectionMode = "single" | "multiple"

interface ToggleGroupContextValue {
  mode: SelectionMode
  value: string[]
  toggle: (value: string) => void
  orientation: Orientation
  disabled: boolean
  readOnly: boolean
  register: (value: string) => void
  firstValue: () => string | undefined
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(
  null
)

function useToggleGroup(component: string) {
  const context = React.useContext(ToggleGroupContext)
  if (!context) throw new Error(`<${component}> must be used within <ToggleGroup>`)
  return context
}

export interface ToggleGroupProps
  extends Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> {
  /** Selection MODE is behavior, not a variant: it decides the ARIA roles,
   *  which a theme may never alter. */
  mode?: SelectionMode
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  prominence?: Prominence
  size?: Size
  orientation?: Orientation
  disabled?: boolean
  readOnly?: boolean
  label?: string
}

const toArray = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value]

/**
 * APG toolbar over toggle buttons (contract/anatomy/toggle-group.json).
 * single-select → role=radiogroup with role=radio items (aria-checked);
 * multi-select → role=group with aria-pressed toggle buttons. Either way the
 * group is ONE tab stop with a roving tabindex: ArrowRight/ArrowDown move to
 * the next item, ArrowLeft/ArrowUp to the previous (wrapping), Home/End jump
 * to the ends, Enter/Space activates. In single-select mode arrowing moves
 * selection with focus; in multi-select mode focus moves without toggling.
 * Disabled items keep their place and stay reachable so the group's shape
 * never changes.
 */
function ToggleGroup({
  mode = "single",
  value,
  defaultValue,
  onValueChange,
  prominence = "outline",
  size = "md",
  orientation = "horizontal",
  disabled = false,
  readOnly = false,
  label,
  "aria-label": ariaLabel,
  onKeyDown,
  children,
  ...props
}: ToggleGroupProps) {
  const [internalValue, setInternalValue] = React.useState<string[]>(() =>
    toArray(defaultValue)
  )
  const controlled = value !== undefined
  const current = controlled ? toArray(value) : internalValue
  const order = React.useRef<string[]>([])

  const commit = (next: string[]) => {
    if (!controlled) setInternalValue(next)
    onValueChange?.(mode === "single" ? next[0] ?? "" : next)
  }

  const toggle = (itemValue: string) => {
    if (readOnly) return
    if (mode === "single") {
      commit(current[0] === itemValue ? [] : [itemValue])
      return
    }
    commit(
      current.includes(itemValue)
        ? current.filter((v) => v !== itemValue)
        : [...current, itemValue]
    )
  }

  const register = React.useCallback((itemValue: string) => {
    if (!order.current.includes(itemValue)) order.current.push(itemValue)
  }, [])
  const firstValue = React.useCallback(() => order.current[0], [])

  /* roving focus — every item stays reachable, including disabled ones */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight"
    const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft"
    if (![nextKey, prevKey, "Home", "End"].includes(event.key)) return
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[data-slot="item"]'
      )
    )
    if (items.length === 0) return
    const index = items.indexOf(document.activeElement as HTMLButtonElement)
    if (index === -1) return
    event.preventDefault()
    let next = index
    if (event.key === nextKey) next = (index + 1) % items.length
    else if (event.key === prevKey) next = (index - 1 + items.length) % items.length
    else if (event.key === "Home") next = 0
    else next = items.length - 1
    items[next].focus()
    /* single-select: selection follows focus. multi-select: it does not. */
    if (mode === "single" && !items[next].disabled) items[next].click()
  }

  return (
    <ToggleGroupContext.Provider
      value={{
        mode,
        value: current,
        toggle,
        orientation,
        disabled,
        readOnly,
        register,
        firstValue,
      }}
    >
      <div
        data-slot="toggle-group"
        data-prominence={prominence}
        data-size={size === "md" ? undefined : size}
        data-orientation={orientation}
        data-state={readOnly ? "readonly" : undefined}
        data-disabled={disabled ? "" : undefined}
        role={mode === "single" ? "radiogroup" : "group"}
        aria-label={ariaLabel ?? label}
        aria-orientation={orientation}
        aria-disabled={disabled || undefined}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  )
}

export interface ToggleGroupItemProps
  extends Omit<React.ComponentProps<"button">, "value"> {
  value: string
  /** Icon-only items still carry a label — it is only visually hidden. */
  icon?: React.ReactNode
  hideLabel?: boolean
}

function ToggleGroupItem({
  value,
  icon,
  hideLabel = false,
  disabled,
  onClick,
  children,
  ...props
}: ToggleGroupItemProps) {
  const group = useToggleGroup("ToggleGroupItem")
  group.register(value)
  const selected = group.value.includes(value)
  const isDisabled = disabled || group.disabled
  /* one tab stop: the selected item, or the first item when nothing is */
  const focusable = selected || (group.value.length === 0 && group.firstValue() === value)
  return (
    <button
      type="button"
      data-slot="item"
      data-state={selected ? "selected" : undefined}
      data-disabled={isDisabled ? "" : undefined}
      role={group.mode === "single" ? "radio" : undefined}
      aria-checked={group.mode === "single" ? selected : undefined}
      aria-pressed={group.mode === "multiple" ? selected : undefined}
      aria-readonly={group.readOnly || undefined}
      tabIndex={focusable ? 0 : -1}
      disabled={isDisabled}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) group.toggle(value)
      }}
      {...props}
    >
      {icon && (
        <span data-slot="item-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span data-slot="item-label" data-hidden={hideLabel ? "" : undefined}>
        {children}
      </span>
    </button>
  )
}

export { ToggleGroup, ToggleGroupItem }
