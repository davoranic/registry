import * as React from "react"

import "./slider.css"

export interface SliderProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  value?: number
  min?: number
  max?: number
  step?: number
  orientation?: "horizontal" | "vertical"
  size?: "sm" | "md" | "lg"
  label?: string
  showValue?: boolean
  onValueChange?: (value: number) => void
}

/** APG slider: the thumb is role=slider and owns the value semantics. */
function Slider({
  value = 50,
  min = 0,
  max = 100,
  step = 1,
  orientation = "horizontal",
  size = "md",
  label,
  showValue,
  disabled,
  onValueChange,
  ...props
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100
  const clamp = (v: number) => Math.min(max, Math.max(min, v))

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const big = (max - min) / 10
    const map: Record<string, number> = {
      ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step,
      PageUp: big, PageDown: -big,
    }
    let next: number | undefined
    if (event.key in map) next = clamp(value + map[event.key])
    else if (event.key === "Home") next = min
    else if (event.key === "End") next = max
    if (next === undefined) return
    event.preventDefault()
    onValueChange?.(next)
  }

  return (
    <div
      data-slot="slider"
      data-orientation={orientation}
      data-size={size === "md" ? undefined : size}
      data-disabled={disabled ? "" : undefined}
      {...props}
    >
      <div data-slot="track">
        <div
          data-slot="range"
          style={orientation === "horizontal" ? { inlineSize: `${pct}%` } : { blockSize: `${pct}%` }}
        />
        <div
          data-slot="thumb"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={label}
          aria-orientation={orientation}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={disabled || undefined}
          onKeyDown={onKeyDown}
          style={orientation === "horizontal" ? { insetInlineStart: `${pct}%` } : { insetBlockEnd: `${pct}%` }}
        />
      </div>
      {showValue && <span data-slot="value-label">{value}</span>}
    </div>
  )
}

export { Slider }
