import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const tagVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-transparent px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      color: {
        neutral: "bg-secondary text-secondary-foreground",
        "chart-1": "bg-chart-1/15 text-chart-1",
        "chart-2": "bg-chart-2/15 text-chart-2",
        "chart-3": "bg-chart-3/15 text-chart-3",
        "chart-4": "bg-chart-4/20 text-chart-4",
        "chart-5": "bg-chart-5/20 text-chart-5",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: {
      color: "neutral",
    },
  }
)

function Tag({
  className,
  color,
  onRemove,
  children,
  ...props
}: Omit<React.ComponentProps<"span">, "color"> &
  VariantProps<typeof tagVariants> & {
    onRemove?: () => void
  }) {
  return (
    <span
      data-slot="tag"
      className={cn(tagVariants({ color }), className)}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label="Remove"
          onClick={onRemove}
          className="-mr-0.5 inline-flex size-3.5 items-center justify-center rounded-sm opacity-60 outline-none transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <XIcon className="size-3" aria-hidden="true" />
        </button>
      )}
    </span>
  )
}

export { Tag, tagVariants }
