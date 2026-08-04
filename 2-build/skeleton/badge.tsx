/* Badge skeleton - written from the template's part union (an optional
   positioning root holding an optional host slot, the badge pill itself, an
   optional leading icon, and a label). Inherits from no design system.

   The DOM SHAPE IS CONFIG, not a hardcode. Salt renders two spans (an outer
   position:relative .saltBadge and an inner .saltBadge-badge that carries
   every box style), because the inner one is absolutely positioned out of
   the outer one when a host is present. shadcn renders exactly one element.
   M3 has no element at all in the clone. Emitting the wrapper for every
   column would put a spurious span around every shadcn badge; emitting one
   element for every column would destroy Salt's anchoring. `structure.shell`
   decides, and BOTH shells keep every box style on [data-slot="badge"], so
   no style row has to know which shell it is in.

   ONE DECLARED API DIVERGENCE, stated rather than smoothed. In Salt,
   `children` is the HOST the badge hangs off and `value` is the label. In
   shadcn and M3, children ARE the label. This chassis separates the two into
   `host` and `value` / `children` so one component can serve all three; the
   observable behaviour is identical (see behavior.anchor-detection, which
   infers "anchored" from the presence of a host exactly as Salt infers it
   from the presence of a child).

   DECLARED COMPOSITIONS, same convention as alert.tsx and card-check.tsx:
   the anchored host composes `button` (already built) and an icon set, and
   the in-badge icon slot composes an icon set. Rather than importing those
   skeletons - which would couple this component's build to another
   component's template - the harness supplies neutral placeholders.

   Every behavior row in contract/templates/badge.template.json is
   implemented below and asserted by scripts/check-badge-behavior.mjs. */
import * as React from "react"

export interface BadgeConfig {
  shell?: string
  labelFormat?: string
  dot?: boolean
  anchoring?: boolean
  icon?: boolean
  content?: string[]
  placement?: string[]
  variant?: string[]
  interaction?: string[]
  max?: number
  liveRegion?: string
  /* No column turns this on. It is read from config rather than hardcoded to
     `undefined` so that behavior.role is a matrix cell instead of an
     assumption baked into the chassis - see the row's note. */
  role?: string
}

export interface BadgeProps {
  config: BadgeConfig
  /* the label, Salt-style: a number or string the component formats itself */
  value?: number | string
  max?: number
  /* the label, shadcn/M3-style: arbitrary children */
  children?: React.ReactNode
  /* the element the badge anchors to (Salt's `children`) */
  host?: React.ReactNode
  icon?: React.ReactNode
  content?: string
  placement?: string
  variant?: string
  interaction?: string
  href?: string
  className?: string
  "aria-label"?: string
}

export function Badge({
  config,
  value,
  max,
  children,
  host,
  icon,
  content,
  placement,
  variant,
  interaction,
  href,
  className,
  "aria-label": ariaLabel,
}: BadgeProps) {
  const supportsDot = Boolean(config.dot)
  const supportsAnchor = Boolean(config.anchoring)
  const maxValue = max ?? config.max

  /* behavior.value-clamping - Salt only. A NUMBER above `max` is replaced by
     `max` with a plus suffix; a STRING is never clamped, at any length. Both
     halves are source: Badge.tsx's ternary and usage.mdx's "When you pass a
     string, the badge will not clamp the value". Columns whose
     structure.label-format is "children" carry no `max` at all, so the guard
     falls through and the label is passed unchanged. */
  const clamped =
    typeof value === "number" && typeof maxValue === "number" && value > maxValue
      ? `${maxValue}+`
      : value
  const label = children !== undefined ? children : clamped

  /* behavior.dot-detection - Salt INFERS the dot form from the ABSENCE of a
     value rather than from a prop, which is why prop.content is dot-first.
     An explicit `content` prop overrides the inference; a column with no dot
     form can never reach it. */
  const inferredContent =
    value === undefined && children === undefined && supportsDot ? "dot" : "label"
  const contentMode = supportsDot ? (content ?? inferredContent) : "label"

  /* behavior.anchor-detection - Salt INFERS the anchored form from the
     PRESENCE of a child. Two of its three modes are decided by what you pass
     rather than by what you ask for. */
  const inferredPlacement =
    host !== undefined && supportsAnchor ? "anchored" : "inline"
  const placementMode = supportsAnchor ? (placement ?? inferredPlacement) : "inline"

  const variantMode = variant ?? config.variant?.[0]
  const interactionMode = interaction ?? config.interaction?.[0] ?? "static"

  /* behavior.role - NO system gives a badge a role, an aria-label or an
     aria-live. Computed from config so the unanimous absence is a value in
     the matrix rather than a hardcode here. */
  const role: string | undefined = config.role || undefined

  /* behavior.live-region - off in every column. Implemented so the gap is a
     switchable row rather than a silent omission. */
  const liveRegion =
    config.liveRegion && config.liveRegion !== "off" ? config.liveRegion : undefined

  /* behavior.activation - no system binds a handler. shadcn DELEGATES via
     asChild, which swaps the span for whatever the consumer supplies (its
     own badge-link example supplies an anchor); activation is then the
     platform's, and it is the same moment the [a&]:hover rules become
     reachable. Salt and M3 are inert. */
  const Comp: "span" | "a" = interactionMode === "link" ? "a" : "span"

  const badge = (
    <Comp
      data-slot="badge"
      data-content={contentMode}
      data-variant={variantMode}
      data-interaction={interactionMode}
      data-anchored={placementMode === "anchored" ? "" : undefined}
      role={role}
      aria-live={liveRegion}
      aria-label={ariaLabel}
      href={Comp === "a" ? (href ?? "#") : undefined}
      className={className}
    >
      {config.icon && icon ? (
        <span data-slot="badge-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {contentMode === "label" ? (
        <span data-slot="badge-label">{label}</span>
      ) : null}
    </Comp>
  )

  if (config.shell !== "wrapper") return badge

  return (
    <span data-slot="badge-root" data-placement={placementMode}>
      {placementMode === "anchored" && host !== undefined ? (
        <span data-slot="badge-host">{host}</span>
      ) : null}
      {badge}
    </span>
  )
}
