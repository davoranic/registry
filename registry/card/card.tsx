import * as React from "react"

import "./card.css"

/* Anatomy: contract/anatomy/card.json — static grouping container, no APG
   pattern (interactive/selectable cards are a separate component).
   Compound exports follow the shadcn convention; data-slot names come from
   the ANATOMY: header, title, description, action-slot, content, footer. */

function Card(props: React.ComponentProps<"div">) {
  return <div data-slot="card" {...props} />
}

function CardHeader(props: React.ComponentProps<"div">) {
  return <div data-slot="header" {...props} />
}

function CardTitle(props: React.ComponentProps<"div">) {
  return <div data-slot="title" {...props} />
}

function CardDescription(props: React.ComponentProps<"div">) {
  return <div data-slot="description" {...props} />
}

/* trailing header slot for a button/menu; hosts other components,
   adds no recipe of its own beyond placement (anatomy note) */
function CardAction(props: React.ComponentProps<"div">) {
  return <div data-slot="action-slot" {...props} />
}

function CardContent(props: React.ComponentProps<"div">) {
  return <div data-slot="content" {...props} />
}

export interface CardFooterProps extends React.ComponentProps<"div"> {
  /** optional divider above the footer (border-subtle top rule, anatomy note) */
  divider?: boolean
}

function CardFooter({ divider = false, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="footer"
      data-divider={divider ? "" : undefined}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
