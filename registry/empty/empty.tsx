import * as React from "react"

import "./empty.css"

export interface EmptyProps extends React.ComponentProps<"div"> {
  /** Illustration or framed glyph — decorative, aria-hidden. */
  media?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Heading level so the placeholder sits correctly in the document outline. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
}

/**
 * Presentational empty-state container (contract/anatomy/empty.json) — no APG
 * pattern of its own. The title is a real heading so the region is reachable
 * by heading navigation; recovery affordances keep their own button/link
 * semantics. Announcing a completed load is the host region's job (aria-live),
 * not this container's.
 */
function Empty({
  media,
  title,
  description,
  headingLevel = 3,
  children,
  ...props
}: EmptyProps) {
  const Heading = `h${headingLevel}` as "h3"
  return (
    <div data-slot="empty" {...props}>
      <div data-slot="header">
        {media && (
          <div data-slot="media" aria-hidden="true">
            {media}
          </div>
        )}
        <Heading data-slot="title">{title}</Heading>
        {description && <p data-slot="description">{description}</p>}
      </div>
      {children && <div data-slot="content">{children}</div>}
    </div>
  )
}

export { Empty }
