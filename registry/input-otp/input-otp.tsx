import * as React from "react"
import { MinusIcon } from "lucide-react"

import "./input-otp.css"

type Size = "sm" | "md" | "lg"

export interface InputOTPProps
  extends Omit<
    React.ComponentProps<"input">,
    "size" | "value" | "defaultValue" | "onChange"
  > {
  length?: number
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Cell counts per group, e.g. [3, 3] renders 3 cells, a separator, 3 cells. */
  groupSizes?: number[]
  size?: Size
  invalid?: boolean
}

/**
 * Native text-input semantics on a single visually segmented field
 * (contract/anatomy/input-otp.json). ONE control owns the value, the focus
 * and the tab stop (inputMode=numeric, autoComplete=one-time-code,
 * maxLength=length); the cells are presentational and aria-hidden, mirroring
 * the control's characters with the caret drawn on the active one. Arrow
 * keys, Home/End and Backspace therefore behave natively, paste fills every
 * cell at once, and a screen reader announces ONE field — never N fields.
 * Labelling and error wiring come from the field composition.
 */
function InputOTP({
  length = 6,
  value,
  defaultValue = "",
  onValueChange,
  groupSizes,
  size = "md",
  invalid,
  disabled,
  readOnly,
  className,
  onFocus,
  onBlur,
  onSelect,
  "aria-invalid": ariaInvalid,
  ...props
}: InputOTPProps) {
  const controlRef = React.useRef<HTMLInputElement>(null)
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [focused, setFocused] = React.useState(false)
  const [caretIndex, setCaretIndex] = React.useState(0)
  const current = value !== undefined ? value : internalValue
  const isInvalid = invalid ?? (ariaInvalid === true || ariaInvalid === "true")

  const groups = React.useMemo(() => {
    const sizes = groupSizes?.length ? groupSizes : [length]
    const result: number[][] = []
    let cursor = 0
    for (const groupSize of sizes) {
      const cells: number[] = []
      for (let i = 0; i < groupSize && cursor < length; i += 1, cursor += 1) {
        cells.push(cursor)
      }
      if (cells.length) result.push(cells)
    }
    return result
  }, [groupSizes, length])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value.slice(0, length)
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
    setCaretIndex(event.target.selectionStart ?? next.length)
  }

  return (
    <div
      data-slot="input-otp"
      data-size={size === "md" ? undefined : size}
      data-state={isInvalid ? "invalid" : readOnly ? "readonly" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={className}
      onMouseDown={() => controlRef.current?.focus()}
    >
      <input
        ref={controlRef}
        data-slot="control"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        value={current}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={isInvalid || undefined}
        onChange={handleChange}
        onFocus={(event) => {
          setFocused(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          onBlur?.(event)
        }}
        onSelect={(event) => {
          setCaretIndex(event.currentTarget.selectionStart ?? 0)
          onSelect?.(event)
        }}
        {...props}
      />
      {groups.map((cells, groupIndex) => (
        <React.Fragment key={cells[0]}>
          {groupIndex > 0 && (
            <span data-slot="separator" aria-hidden="true">
              <MinusIcon />
            </span>
          )}
          <div data-slot="group" aria-hidden="true">
            {cells.map((cellIndex) => {
              const char = current[cellIndex]
              const active =
                focused && !disabled && !readOnly &&
                Math.min(caretIndex, length - 1) === cellIndex
              return (
                <div
                  key={cellIndex}
                  data-slot="cell"
                  data-active={active ? "" : undefined}
                >
                  {char ?? ""}
                  {active && !char && <span data-slot="caret" />}
                </div>
              )
            })}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

export { InputOTP }
