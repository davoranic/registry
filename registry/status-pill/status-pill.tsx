import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusPillVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors [&>svg]:size-3",
  {
    variants: {
      variant: {
        neutral: "border-transparent bg-secondary text-secondary-foreground",
        info: "border-transparent bg-primary/10 text-primary",
        success: "border-transparent bg-success/15 text-success",
        warning: "border-transparent bg-warning/15 text-warning",
        destructive: "border-transparent bg-destructive/10 text-destructive",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

function StatusPill({
  className,
  variant,
  showDot = true,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof statusPillVariants> & {
    showDot?: boolean
  }) {
  return (
    <span
      data-slot="status-pill"
      className={cn(statusPillVariants({ variant }), className)}
      {...props}
    >
      {showDot && (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-current"
        />
      )}
      {children}
    </span>
  )
}

export { StatusPill, statusPillVariants }
