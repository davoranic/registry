"use client"

import * as React from "react"
import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Rating({
  className,
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  max = 5,
  readOnly = false,
  disabled = false,
  name: nameProp,
  label,
  icon,
  getItemLabel = (itemValue, maxValue) => `${itemValue} of ${maxValue}`,
  "aria-label": ariaLabel,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  max?: number
  readOnly?: boolean
  disabled?: boolean
  name?: string
  label?: React.ReactNode
  icon?: React.ReactNode
  getItemLabel?: (value: number, max: number) => string
}) {
  const generatedName = React.useId()
  const name = nameProp ?? generatedName
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const selected = valueProp ?? internalValue
  const [preview, setPreview] = React.useState(0)
  const interactive = !readOnly && !disabled
  const shown = interactive && preview > 0 ? preview : selected

  function handleChange(next: number) {
    if (!interactive) return
    setInternalValue(next)
    onValueChange?.(next)
  }

  return (
    <div
      data-slot="rating"
      data-disabled={disabled ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
      className={cn(
        "flex w-fit items-center gap-2",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      <div
        role="radiogroup"
        aria-label={ariaLabel ?? "Rating"}
        aria-readonly={readOnly || undefined}
        aria-disabled={disabled || undefined}
        className="flex items-center"
        onMouseLeave={() => setPreview(0)}
      >
        {Array.from({ length: max }, (_, index) => {
          const itemValue = index + 1
          const filled = itemValue <= shown
          return (
            <label
              key={itemValue}
              data-slot="rating-item"
              data-state={filled ? "filled" : "empty"}
              onMouseEnter={
                interactive ? () => setPreview(itemValue) : undefined
              }
              className={cn(
                "flex items-center justify-center p-0.5 transition-colors",
                "has-[:focus-visible]:rounded-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                filled ? "text-primary" : "text-muted-foreground",
                interactive && "cursor-pointer"
              )}
            >
              <input
                type="radio"
                className="sr-only"
                name={name}
                value={itemValue}
                checked={selected === itemValue}
                onChange={() => handleChange(itemValue)}
                disabled={disabled}
                aria-label={getItemLabel(itemValue, max)}
              />
              <span
                data-slot="rating-item-icon"
                aria-hidden="true"
                className={cn(
                  "[&>svg]:size-4",
                  filled && "[&>svg]:fill-current"
                )}
              >
                {icon ?? <StarIcon />}
              </span>
            </label>
          )
        })}
      </div>
      {label && (
        <span
          data-slot="rating-label"
          className="text-xs text-muted-foreground"
        >
          {label}
        </span>
      )}
    </div>
  )
}

export { Rating }
