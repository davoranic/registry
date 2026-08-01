import * as React from "react"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function StatCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-card"
      className={cn(
        "flex flex-col gap-1.5 rounded-xl border bg-card p-6 text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function StatCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-card-title"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function StatCardValue({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-card-value"
      className={cn(
        "text-2xl font-semibold tabular-nums leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function StatCardTrend({
  className,
  direction = "up",
  children,
  ...props
}: React.ComponentProps<"span"> & {
  direction?: "up" | "down"
}) {
  const Icon = direction === "up" ? TrendingUpIcon : TrendingDownIcon
  return (
    <span
      data-slot="stat-card-trend"
      data-direction={direction}
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
        direction === "up"
          ? "bg-success/15 text-success"
          : "bg-destructive/10 text-destructive",
        className
      )}
      {...props}
    >
      <Icon className="size-3" aria-hidden="true" />
      {children}
    </span>
  )
}

function StatCardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-card-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  StatCard,
  StatCardTitle,
  StatCardValue,
  StatCardTrend,
  StatCardDescription,
}
