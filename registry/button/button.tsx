import * as React from "react"
import { Loader2Icon } from "lucide-react"

import "./button.css"

type Emphasis = "primary" | "secondary" | "danger"
type Prominence = "solid" | "outline" | "ghost" | "link"
type Size = "sm" | "md" | "lg"

export interface ButtonProps extends React.ComponentProps<"button"> {
  emphasis?: Emphasis
  prominence?: Prominence
  size?: Size
  loading?: boolean
  iconLeading?: React.ReactNode
  iconTrailing?: React.ReactNode
}

function Button({
  emphasis = "primary",
  prominence = "solid",
  size = "md",
  loading = false,
  iconLeading,
  iconTrailing,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading
  return (
    <button
      data-slot="button"
      data-emphasis={emphasis}
      data-prominence={prominence}
      data-size={size === "md" ? undefined : size}
      data-state={loading ? "loading" : undefined}
      data-disabled={isDisabled ? "" : undefined}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span data-slot="loading-indicator" aria-hidden="true">
          <Loader2Icon />
        </span>
      ) : (
        iconLeading && (
          <span data-slot="icon-leading" aria-hidden="true">
            {iconLeading}
          </span>
        )
      )}
      <span data-slot="label">{children}</span>
      {iconTrailing && !loading && (
        <span data-slot="icon-trailing" aria-hidden="true">
          {iconTrailing}
        </span>
      )}
    </button>
  )
}

export { Button }
