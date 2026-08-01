import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Timeline({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="timeline"
      className={cn("flex flex-col", className)}
      {...props}
    />
  )
}

function TimelineItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="timeline-item"
      className={cn(
        "relative flex gap-4 pb-8 last:pb-0",
        // the connector line, hidden on the last item
        "before:absolute before:left-[5px] before:top-4 before:h-[calc(100%-0.5rem)] before:w-px before:bg-border last:before:hidden",
        className
      )}
      {...props}
    />
  )
}

const timelineDotVariants = cva(
  "relative mt-1 size-[11px] shrink-0 rounded-full border-2",
  {
    variants: {
      variant: {
        default: "border-border bg-background",
        active: "border-primary bg-primary",
        success: "border-success bg-success",
        warning: "border-warning bg-warning",
        destructive: "border-destructive bg-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TimelineDot({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof timelineDotVariants>) {
  return (
    <div
      data-slot="timeline-dot"
      className={cn(timelineDotVariants({ variant }), className)}
      {...props}
    />
  )
}

function TimelineContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-content"
      className={cn("flex flex-1 flex-col gap-0.5", className)}
      {...props}
    />
  )
}

function TimelineTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-title"
      className={cn("text-sm font-medium leading-tight", className)}
      {...props}
    />
  )
}

function TimelineTime({ className, ...props }: React.ComponentProps<"time">) {
  return (
    <time
      data-slot="timeline-time"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function TimelineDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineContent,
  TimelineTitle,
  TimelineTime,
  TimelineDescription,
  timelineDotVariants,
}
