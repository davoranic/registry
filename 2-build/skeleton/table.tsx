/* Table skeleton - written from the template's part union: a real, native
   <table> (matching all three sources - the first component in this
   pipeline where every column already renders identical native elements at
   EVERY level of the anatomy, not just the leaf control toggle-group's own
   buttons achieved), wrapped in a real overflow <div data-slot="table-
   container">.

   THE HEADLINE SCOPE DECISION THIS CHASSIS HAD TO ENCODE FIRST: none of the
   three real sources' own BASE table primitive implements a working
   sort/pagination/selection ENGINE - shadcn's own docs frame a "data table"
   as explicitly NOT a shipped component, built instead on
   @tanstack/react-table (external, unvendored). shadcn's base TableRow DOES
   carry a real, reachable data-[state="selected"] STYLE HOOK though, wired
   live in shadcn's own TanStack examples via `row.getIsSelected()`. M3's
   pinned tokens carry real, DESIGNED selected/unselected/disabled row
   colours with zero live component to wire them into. This chassis
   reproduces the STYLE HOOK (a `selected`/`disabled` prop on <TableRow>
   that sets a real data attribute, styled per-column where a real rule
   exists - see TABLE-MATRIX.md Finding 1) as a STATIC, per-instance
   demonstration. It does NOT build a selection/sort/pagination ENGINE -
   declared out of scope, see the matrix doc's own scope note.

   Salt's own TableContainer performs a REAL, sourced, ResizeObserver-driven
   a11y upgrade - promoting the wrapper to role="region"+tabIndex=0 ONLY
   when the table is genuinely overflowing its box (behavior.overflow-
   region) - implemented here behind a `overflowRegionSensing` config flag
   rather than silently flattening every column to the same static
   behaviour shadcn's own simpler wrapper has. */
import * as React from "react"

export interface TableConfig {
  variant?: string[]
  zebra?: boolean[]
  divider?: string[]
  align?: string[]
  stickyHeader?: boolean[]
  stickyFooter?: boolean[]
  captionSupported?: boolean
  overflowRegionSensing?: boolean
}

interface RootContextValue {
  align?: "left" | "right"
}

const TableRootContext = React.createContext<RootContextValue>({})

export interface TableProps {
  config: TableConfig
  children: React.ReactNode
  variant?: string
  zebra?: boolean
  divider?: string
  align?: "left" | "right"
  caption?: React.ReactNode
  className?: string
  "aria-label"?: string
  /* Applied to the OVERFLOW WRAPPER (structure.container), not the
     <table> itself - matching Salt's own real usage pattern, where a
     height constraint on TableContainer (not an extra element outside
     it) is what makes prop.sticky-header/-footer's position:sticky
     actually stick (see TABLE-MATRIX.md's own live-verification note on
     nested scroll containers breaking sticky positioning). */
  containerStyle?: React.CSSProperties
}

/* structure.container / structure.root / structure.caption. The overflow
   wrapper is a real, distinct DOM node OUTSIDE the <table> in all three
   sources - never collapsed into the table element itself. */
export function Table({
  config,
  children,
  variant,
  zebra,
  divider,
  align,
  caption,
  className,
  "aria-label": ariaLabel,
  containerStyle,
}: TableProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const [overflowing, setOverflowing] = React.useState(false)
  const sensing = config.overflowRegionSensing

  /* behavior.overflow-region - Salt's real mechanism: measure, then only
     promote to role="region"/tabIndex=0 while genuinely overflowing. The
     effect reads `sensing` in its own dep array, so a config change that
     turns sensing off correctly tears down the observer rather than
     leaving a stale one running (the ref-effect-dep-array lesson CLAUDE.md
     rule 6 names, applied even though this node is unconditionally
     mounted - the CONDITION that matters here is the sensing flag, not
     the node's own existence). */
  React.useEffect(() => {
    if (!sensing) {
      setOverflowing(false)
      return
    }
    const el = wrapperRef.current
    if (!el) return
    const check = () => {
      setOverflowing(el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [sensing])

  const overflowProps =
    sensing && overflowing
      ? { role: "region" as const, tabIndex: 0, "aria-label": ariaLabel }
      : {}

  const tableId = React.useId()
  const captionOn = config.captionSupported && caption

  return (
    <div ref={wrapperRef} data-slot="table-container" style={containerStyle} {...overflowProps}>
      <table
        data-slot="table-root"
        id={tableId}
        data-variant={variant}
        data-zebra={zebra || undefined}
        data-divider={divider}
        className={className}
        aria-labelledby={ariaLabel ? undefined : captionOn ? `${tableId}-caption` : undefined}
        aria-label={!captionOn ? ariaLabel : undefined}
      >
        {captionOn ? (
          <caption data-slot="table-caption" id={`${tableId}-caption`}>
            {caption}
          </caption>
        ) : null}
        <TableRootContext.Provider value={{ align }}>{children}</TableRootContext.Provider>
      </table>
    </div>
  )
}

export interface TableSectionProps {
  config: TableConfig
  children: React.ReactNode
  divider?: string
  variant?: string
  sticky?: boolean
  className?: string
}

/* structure.header / prop.sticky-header. */
export function TableHeader({ config, children, divider, variant, sticky, className }: TableSectionProps) {
  return (
    <thead
      data-slot="table-header"
      data-divider={divider}
      data-variant={variant}
      data-sticky={config.stickyHeader?.includes(true) && sticky ? "true" : undefined}
      className={className}
    >
      {children}
    </thead>
  )
}

/* structure.body. */
export function TableBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tbody data-slot="table-body" className={className}>
      {children}
    </tbody>
  )
}

/* structure.footer / prop.sticky-footer. */
export function TableFooter({ config, children, divider, variant, sticky, className }: TableSectionProps) {
  return (
    <tfoot
      data-slot="table-footer"
      data-divider={divider}
      data-variant={variant}
      data-sticky={config.stickyFooter?.includes(true) && sticky ? "true" : undefined}
      className={className}
    >
      {children}
    </tfoot>
  )
}

export interface TableRowProps {
  children: React.ReactNode
  /* behavior.row-selection / state.row.selected - a STATIC style-hook
     demonstration, never a click-driven engine (see the file banner). */
  selected?: boolean
  /* state.row.disabled. */
  disabled?: boolean
  className?: string
}

/* structure.row - the SAME component composes into header/body/footer,
   matching every real source's own reuse of one row primitive across all
   three sections. */
export function TableRow({ children, selected, disabled, className }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      data-state={selected ? "selected" : undefined}
      data-disabled={disabled || undefined}
      className={className}
    >
      {children}
    </tr>
  )
}

export interface TableCellProps {
  config: TableConfig
  children?: React.ReactNode
  align?: "left" | "right"
  className?: string
  colSpan?: number
}

/* structure.header-cell / prop.align / slot.header-cell-content. Kept
   structurally distinct from the body cell (CLAUDE.md rule 3) - a real,
   separate component, never a shared "cell" with a role switch. */
export function TableHeadCell({ config, children, align, className, colSpan }: TableCellProps) {
  const root = React.useContext(TableRootContext)
  const resolvedAlign = config.align?.includes("right") ? align ?? root.align ?? "left" : "left"
  return (
    <th
      data-slot="table-header-cell"
      data-align={resolvedAlign}
      scope="col"
      className={className}
      colSpan={colSpan}
    >
      {children}
    </th>
  )
}

/* structure.body-cell / prop.align / slot.body-cell-content. */
export function TableCell({ config, children, align, className, colSpan }: TableCellProps) {
  const root = React.useContext(TableRootContext)
  const resolvedAlign = config.align?.includes("right") ? align ?? root.align ?? "left" : "left"
  return (
    <td data-slot="table-cell" data-align={resolvedAlign} className={className} colSpan={colSpan}>
      {children}
    </td>
  )
}
