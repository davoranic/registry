import * as React from "react"

import "./resizable.css"

export interface ResizableProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical"
}

function Resizable({ orientation = "horizontal", children, ...props }: ResizableProps) {
  return (
    <div data-slot="resizable" data-orientation={orientation} {...props}>
      {children}
    </div>
  )
}

function ResizablePanel({ style, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="panel" style={style} {...props} />
}

export interface ResizableHandleProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical"
  value?: number
  label?: string
  withGrip?: boolean
  onResize?: (value: number) => void
}

/** APG window splitter: the handle is role=separator and owns the value. */
function ResizableHandle({
  orientation = "horizontal",
  value = 50,
  label = "Resize panels",
  withGrip = true,
  onResize,
  ...props
}: ResizableHandleProps) {
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const map: Record<string, number> = {
      ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1,
      PageUp: 10, PageDown: -10,
    }
    let next: number | undefined
    if (event.key in map) next = Math.min(100, Math.max(0, value + map[event.key]))
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = 100
    else if (event.key === "Enter") next = value === 0 ? 50 : 0 // collapse toggle
    if (next === undefined) return
    event.preventDefault()
    onResize?.(next)
  }

  return (
    <div
      data-slot="handle"
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={orientation}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      onKeyDown={onKeyDown}
      {...props}
    >
      {withGrip && <span data-slot="grip" aria-hidden="true" />}
    </div>
  )
}

export { Resizable, ResizablePanel, ResizableHandle }
