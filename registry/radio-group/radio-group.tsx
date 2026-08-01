import * as React from "react"

import "./radio-group.css"

interface RadioGroupContextValue {
  value?: string
  setValue: (value: string) => void
  name: string
  disabled?: boolean
  defaultStop: React.MutableRefObject<string | null>
}
const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)

export interface RadioGroupProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  value?: string
  orientation?: "horizontal" | "vertical"
  invalid?: boolean
  disabled?: boolean
  onValueChange?: (value: string) => void
}

function RadioGroup({
  value,
  orientation = "vertical",
  invalid,
  disabled,
  onValueChange,
  children,
  ...props
}: RadioGroupProps) {
  const name = React.useId()
  // First enabled item claims the group's tab stop while nothing is selected
  // (APG radio group: exactly one tab stop at all times).
  const defaultStop = React.useRef<string | null>(null)
  return (
    <RadioGroupContext.Provider
      value={{ value, setValue: (v) => onValueChange?.(v), name, disabled, defaultStop }}
    >
      <div
        role="radiogroup"
        data-slot="radio-group"
        data-orientation={orientation}
        data-disabled={disabled ? "" : undefined}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

export interface RadioGroupItemProps extends React.ComponentProps<"button"> {
  value: string
  label?: React.ReactNode
}

function RadioGroupItem({ value, label, disabled, id, ...props }: RadioGroupItemProps) {
  const ctx = React.useContext(RadioGroupContext)
  const reactId = React.useId()
  const controlId = id ?? reactId
  const selected = ctx?.value === value
  const isDisabled = disabled || ctx?.disabled
  if (
    ctx &&
    !isDisabled &&
    (ctx.defaultStop.current === null || ctx.defaultStop.current === value)
  ) {
    ctx.defaultStop.current = value
  }
  const isTabStop =
    selected || (ctx?.value == null && ctx?.defaultStop.current === value)

  // APG radio group: roving tabindex — only the selected item is tabbable.
  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"]
    if (!keys.includes(event.key)) return
    event.preventDefault()
    const group = event.currentTarget.closest('[data-slot="radio-group"]')
    if (!group) return
    const items = Array.from(
      group.querySelectorAll<HTMLButtonElement>('[data-slot="control"]:not(:disabled)')
    )
    const index = items.indexOf(event.currentTarget)
    const forward = event.key === "ArrowDown" || event.key === "ArrowRight"
    const next = items[(index + (forward ? 1 : -1) + items.length) % items.length]
    next?.focus()
    next?.click()
  }

  return (
    <div data-slot="item" data-disabled={isDisabled ? "" : undefined}>
      <button
        type="button"
        role="radio"
        id={controlId}
        data-slot="control"
        data-state={selected ? "selected" : undefined}
        aria-checked={selected}
        tabIndex={isTabStop ? 0 : -1}
        disabled={isDisabled}
        onClick={() => ctx?.setValue(value)}
        onKeyDown={onKeyDown}
        {...props}
      >
        <span data-slot="indicator" aria-hidden="true" />
      </button>
      {label && (
        <label data-slot="label" htmlFor={controlId}>
          {label}
        </label>
      )}
    </div>
  )
}

export { RadioGroup, RadioGroupItem }
