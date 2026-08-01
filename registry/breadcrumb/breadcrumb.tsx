import * as React from "react"
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

import "./breadcrumb.css"

/**
 * Breadcrumb — contract/anatomy/breadcrumb.json.
 * APG breadcrumb pattern: a nav landmark with an accessible name holding an
 * ordered list of links; the last/current entry carries aria-current="page"
 * and is not a link; separators are decorative and hidden from assistive tech.
 */

export interface BreadcrumbProps extends React.ComponentProps<"nav"> {
  /** names the trail for assistive tech (APG: the nav landmark needs a name) */
  label?: string
}

function Breadcrumb({ label = "Breadcrumb", children, ...props }: BreadcrumbProps) {
  return (
    <nav data-slot="breadcrumb" aria-label={label} {...props}>
      {children}
    </nav>
  )
}

export type BreadcrumbListProps = React.ComponentProps<"ol">

function BreadcrumbList({ children, ...props }: BreadcrumbListProps) {
  return (
    <ol data-slot="list" {...props}>
      {children}
    </ol>
  )
}

export type BreadcrumbItemProps = React.ComponentProps<"li">

function BreadcrumbItem({ children, ...props }: BreadcrumbItemProps) {
  return (
    <li data-slot="item" {...props}>
      {children}
    </li>
  )
}

export type BreadcrumbLinkProps = React.ComponentProps<"a">

function BreadcrumbLink({ children, ...props }: BreadcrumbLinkProps) {
  return (
    <a data-slot="link" {...props}>
      {children}
    </a>
  )
}

export type BreadcrumbCurrentProps = React.ComponentProps<"span">

/** the current page: aria-current="page", not a link, not focusable */
function BreadcrumbCurrent({ children, ...props }: BreadcrumbCurrentProps) {
  return (
    <span data-slot="current" aria-current="page" {...props}>
      {children}
    </span>
  )
}

export type BreadcrumbSeparatorProps = React.ComponentProps<"li">

/** decorative — hidden from assistive tech; chevron or a caller-supplied glyph */
function BreadcrumbSeparator({ children, ...props }: BreadcrumbSeparatorProps) {
  return (
    <li data-slot="separator" role="presentation" aria-hidden="true" {...props}>
      {children ?? <ChevronRightIcon />}
    </li>
  )
}

export interface BreadcrumbOverflowProps extends React.ComponentProps<"button"> {
  /** names the collapse point; the hidden trail entries live behind it */
  label?: string
}

/**
 * Collapse point when the trail exceeds maxItems. Whether activating it
 * expands the trail in place (shadcn) or opens a menu of the hidden items
 * (Salt) is a behavior option declared on the root, not a different part.
 */
function BreadcrumbOverflow({
  label = "Show hidden trail entries",
  children,
  ...props
}: BreadcrumbOverflowProps) {
  return (
    <button type="button" data-slot="overflow" aria-label={label} {...props}>
      {children ?? <MoreHorizontalIcon aria-hidden="true" />}
    </button>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbCurrent,
  BreadcrumbSeparator,
  BreadcrumbOverflow,
}
