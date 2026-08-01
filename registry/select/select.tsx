import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import "./select.css"

type Size = "sm" | "md" | "lg"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  size?: Size
  id?: string
  "aria-label"?: string
  "aria-labelledby"?: string
}

function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  disabled = false,
  invalid = false,
  size = "md",
  id,
  ...aria
}: SelectProps) {
  const autoId = React.useId()
  const baseId = id ?? autoId
  const listboxId = `${baseId}-listbox`
  const optionId = (index: number) => `${baseId}-option-${index}`

  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const selectedValue = value !== undefined ? value : internalValue
  const selectedIndex = options.findIndex((o) => o.value === selectedValue)
  const [activeIndex, setActiveIndex] = React.useState(
    selectedIndex >= 0 ? selectedIndex : 0
  )
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const openListbox = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen(true)
  }

  const selectOption = (index: number) => {
    const option = options[index]
    if (!option || option.disabled) return
    if (value === undefined) setInternalValue(option.value)
    onValueChange?.(option.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const moveActive = (delta: number) => {
    setActiveIndex((current) => {
      let next = current
      do {
        next += delta
      } while (options[next]?.disabled)
      return options[next] ? next : current
    })
  }

  const onTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (
        (event.altKey && event.key === "ArrowDown") ||
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault()
        openListbox()
      }
      return
    }
    switch (event.key) {
      case "Escape":
        event.preventDefault()
        setOpen(false)
        break
      case "ArrowDown":
        event.preventDefault()
        moveActive(1)
        break
      case "ArrowUp":
        event.preventDefault()
        moveActive(-1)
        break
      case "Home":
        event.preventDefault()
        setActiveIndex(options.findIndex((o) => !o.disabled))
        break
      case "End": {
        event.preventDefault()
        const last = options.map((o) => !o.disabled).lastIndexOf(true)
        if (last >= 0) setActiveIndex(last)
        break
      }
      case "Enter":
      case " ":
        event.preventDefault()
        selectOption(activeIndex)
        break
      case "Tab":
        setOpen(false)
        break
    }
  }

  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined

  return (
    <div
      data-slot="select"
      data-size={size === "md" ? undefined : size}
      data-state={open ? "open" : undefined}
      data-disabled={disabled ? "" : undefined}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        data-slot="trigger"
        role="combobox"
        id={baseId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        aria-invalid={invalid || undefined}
        data-disabled={disabled ? "" : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openListbox())}
        onKeyDown={onTriggerKeyDown}
        {...aria}
      >
        <span
          data-slot="value"
          data-placeholder={selectedOption ? undefined : ""}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span data-slot="indicator" aria-hidden="true">
          <ChevronDownIcon />
        </span>
      </button>
      {open && (
        <ul data-slot="listbox" role="listbox" id={listboxId} tabIndex={-1}>
          {options.map((option, index) => {
            const isSelected = option.value === selectedValue
            return (
              <li
                key={option.value}
                data-slot="option"
                role="option"
                id={optionId(index)}
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                data-state={isSelected ? "selected" : undefined}
                data-active={index === activeIndex ? "" : undefined}
                data-disabled={option.disabled ? "" : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                onClick={() => selectOption(index)}
              >
                {option.label}
                {isSelected && (
                  <span data-slot="option-indicator" aria-hidden="true">
                    <CheckIcon />
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export { Select }
