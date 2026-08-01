import * as React from "react"

import "./table.css"

/* Anatomy: contract/anatomy/table.json — native table semantics (table /
   rowgroup / row / columnheader / cell; caption names the table). APG grid
   applies only when interactive. Compound exports follow the shadcn
   convention; data-slot names come from the ANATOMY: table (root), caption,
   header-row, header-cell, row, cell. The overflow wrapper is a recipe,
   not a part (anatomy note) — it carries horizontal scroll only. */

type Size = "sm" | "md" | "lg"

const TableSectionContext = React.createContext<"header" | "body">("body")

export interface TableProps extends React.ComponentProps<"table"> {
  size?: Size
}

function Table({ size = "md", ...props }: TableProps) {
  return (
    <div data-slot="table-container">
      <table
        data-slot="table"
        data-size={size === "md" ? undefined : size}
        {...props}
      />
    </div>
  )
}

function TableHeader({ children, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead {...props}>
      <TableSectionContext.Provider value="header">
        {children}
      </TableSectionContext.Provider>
    </thead>
  )
}

function TableBody({ children, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody {...props}>
      <TableSectionContext.Provider value="body">
        {children}
      </TableSectionContext.Provider>
    </tbody>
  )
}

/* rows in the header rowgroup are the anatomy's header-row part; body rows
   are the row part. Selection is the consumer's: set data-state="selected"
   (canonical, contract/states.md) on the row. */
function TableRow(props: React.ComponentProps<"tr">) {
  const section = React.useContext(TableSectionContext)
  return <tr data-slot={section === "header" ? "header-row" : "row"} {...props} />
}

function TableHead(props: React.ComponentProps<"th">) {
  return <th data-slot="header-cell" {...props} />
}

export interface TableCellProps extends React.ComponentProps<"td"> {
  /** numeric column: type-data tabular numerals, end-aligned (anatomy note) */
  numeric?: boolean
}

function TableCell({ numeric = false, ...props }: TableCellProps) {
  return (
    <td data-slot="cell" data-type={numeric ? "data" : undefined} {...props} />
  )
}

function TableCaption(props: React.ComponentProps<"caption">) {
  return <caption data-slot="caption" {...props} />
}

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
