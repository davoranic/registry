import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

import "./pagination.css"

/**
 * Pagination — contract/anatomy/pagination.json.
 *
 * A navigation landmark: <nav> with an accessible name containing a list of
 * page links. The current page carries aria-current="page" and is the only
 * item so marked. Previous/next stay in the DOM at the ends and become
 * aria-disabled rather than disappearing, so the control does not reflow.
 * The ellipsis is decorative (aria-hidden) with a visually-hidden "More pages"
 * label beside it. Every item is a normal tab stop — no roving tabindex,
 * because each destination is independently reachable.
 */

type Size = "sm" | "md" | "lg"

const SizeContext = React.createContext<Size>("md")

export interface PaginationProps extends React.ComponentProps<"nav"> {
  label?: string
  size?: Size
}

function Pagination({
  label = "Pagination",
  size = "md",
  children,
  ...props
}: PaginationProps) {
  return (
    <SizeContext.Provider value={size}>
      <nav
        data-slot="pagination"
        data-size={size === "md" ? undefined : size}
        aria-label={label}
        {...props}
      >
        {children}
      </nav>
    </SizeContext.Provider>
  )
}

export type PaginationListProps = React.ComponentProps<"ul">

function PaginationList({ children, ...props }: PaginationListProps) {
  return (
    <ul data-slot="list" {...props}>
      {children}
    </ul>
  )
}

export type PaginationItemProps = React.ComponentProps<"li">

/** the list item; no chrome of its own */
function PaginationItem({ children, ...props }: PaginationItemProps) {
  return (
    <li data-slot="item" {...props}>
      {children}
    </li>
  )
}

export interface PaginationPageProps extends React.ComponentProps<"a"> {
  /** the page this link goes to — used for the accessible name */
  page: number
  /** the one page marked aria-current="page" */
  current?: boolean
}

function PaginationPage({
  page,
  current = false,
  children,
  ...props
}: PaginationPageProps) {
  return (
    <a
      data-slot="page"
      data-state={current ? "selected" : undefined}
      aria-current={current ? "page" : undefined}
      aria-label={`Page ${page}`}
      {...props}
    >
      {children ?? page}
    </a>
  )
}

export interface PaginationStepProps extends React.ComponentProps<"a"> {
  /** at the ends the step goes aria-disabled instead of disappearing */
  disabled?: boolean
  label?: string
}

function PaginationPrevious({
  disabled = false,
  label = "Go to previous page",
  children,
  onClick,
  ...props
}: PaginationStepProps) {
  return (
    <a
      data-slot="previous"
      data-disabled={disabled ? "" : undefined}
      aria-disabled={disabled || undefined}
      aria-label={label}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault()
          return
        }
        onClick?.(event)
      }}
      {...props}
    >
      <ChevronLeftIcon aria-hidden="true" />
      {children && <span data-slot="step-label">{children}</span>}
    </a>
  )
}

function PaginationNext({
  disabled = false,
  label = "Go to next page",
  children,
  onClick,
  ...props
}: PaginationStepProps) {
  return (
    <a
      data-slot="next"
      data-disabled={disabled ? "" : undefined}
      aria-disabled={disabled || undefined}
      aria-label={label}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault()
          return
        }
        onClick?.(event)
      }}
      {...props}
    >
      {children && <span data-slot="step-label">{children}</span>}
      <ChevronRightIcon aria-hidden="true" />
    </a>
  )
}

export type PaginationEllipsisProps = React.ComponentProps<"span">

/** stands for the collapsed page range: decorative glyph + a hidden label */
function PaginationEllipsis({ children, ...props }: PaginationEllipsisProps) {
  return (
    <span data-slot="ellipsis" {...props}>
      <span aria-hidden="true">{children ?? <MoreHorizontalIcon />}</span>
      <span data-slot="visually-hidden">More pages</span>
    </span>
  )
}

export type PaginationCountLabelProps = React.ComponentProps<"span">

/** "Page 3 of 20" — the compact form leans on this instead of a page list */
function PaginationCountLabel({ children, ...props }: PaginationCountLabelProps) {
  return (
    <span data-slot="count-label" {...props}>
      {children}
    </span>
  )
}

export {
  Pagination,
  PaginationList,
  PaginationItem,
  PaginationPage,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationCountLabel,
}
