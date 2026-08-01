"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type StepperOrientation = "horizontal" | "vertical"
type StepperStage = "pending" | "active" | "completed" | "error"

const StepperOrientationContext =
  React.createContext<StepperOrientation>("horizontal")
const StepperStageContext = React.createContext<StepperStage>("pending")

function Stepper({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"ol"> & {
  orientation?: StepperOrientation
}) {
  return (
    <StepperOrientationContext.Provider value={orientation}>
      <ol
        data-slot="stepper"
        data-orientation={orientation}
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row items-start" : "flex-col",
          className
        )}
        {...props}
      />
    </StepperOrientationContext.Provider>
  )
}

function StepperStep({
  className,
  stage = "pending",
  children,
  ...props
}: React.ComponentProps<"li"> & {
  stage?: StepperStage
}) {
  const orientation = React.useContext(StepperOrientationContext)
  return (
    <StepperStageContext.Provider value={stage}>
      <li
        data-slot="stepper-step"
        data-stage={stage}
        aria-current={stage === "active" ? "step" : undefined}
        className={cn(
          "group/step relative",
          orientation === "horizontal"
            ? "flex flex-1 flex-col items-center gap-1 text-center"
            : "grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-0.5 pb-8 last:pb-0 [&>[data-slot=stepper-label]]:col-start-2 [&>[data-slot=stepper-sublabel]]:col-start-2",
          className
        )}
        {...props}
      >
        {(stage === "completed" || stage === "error") && (
          <span className="sr-only">{stage}</span>
        )}
        {children}
      </li>
    </StepperStageContext.Provider>
  )
}

const stepperIndicatorVariants = cva(
  "z-10 flex size-6 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-medium transition-colors [&>svg]:size-3.5",
  {
    variants: {
      stage: {
        pending: "border-border text-muted-foreground",
        active: "border-primary bg-primary text-primary-foreground",
        completed: "border-primary text-primary",
        error: "border-destructive text-destructive",
      },
    },
    defaultVariants: {
      stage: "pending",
    },
  }
)

function StepperIndicator({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const stage = React.useContext(StepperStageContext)
  return (
    <div
      data-slot="stepper-indicator"
      aria-hidden="true"
      className={cn(stepperIndicatorVariants({ stage }), className)}
      {...props}
    >
      {stage === "completed" ? (
        <CheckIcon />
      ) : stage === "error" ? (
        <XIcon />
      ) : (
        children
      )}
    </div>
  )
}

function StepperLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stepper-label"
      className={cn(
        "text-sm font-medium leading-tight text-foreground",
        "group-data-[stage=pending]/step:text-muted-foreground group-data-[stage=error]/step:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function StepperSublabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stepper-sublabel"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function StepperConnector({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const orientation = React.useContext(StepperOrientationContext)
  return (
    <div
      data-slot="stepper-connector"
      aria-hidden="true"
      className={cn(
        "absolute bg-border group-last/step:hidden",
        orientation === "horizontal"
          ? "left-[calc(50%+1.25rem)] top-3 h-px w-[calc(100%-2.5rem)]"
          : "left-3 top-8 h-[calc(100%-2.5rem)] w-px -translate-x-px",
        className
      )}
      {...props}
    />
  )
}

export {
  Stepper,
  StepperStep,
  StepperIndicator,
  StepperLabel,
  StepperSublabel,
  StepperConnector,
  stepperIndicatorVariants,
  type StepperOrientation,
  type StepperStage,
}
