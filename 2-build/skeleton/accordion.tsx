/* Accordion skeleton — written from the template's part union: an optional
   GROUP wrapper, one or more ITEMs, each an (optionally heading-wrapped)
   TRIGGER button paired with a permanently-mounted CONTENT panel, an
   expand/collapse icon, and an optional status glyph. Inherits from no
   design system.

   Every logically distinct part gets its own data-slot from this file's
   first draft (checkbox/radio-group/toast/dropdown-menu lesson):
   accordion-group / -item / -header / -trigger / -trigger-label / -icon /
   -status-icon / -content / -content-body are never conflated with one
   another. `accordion-content-body` has no matrix STRUCTURE row of its own
   (a chassis-only styling hook — shadcn's own real source leaves this
   equivalent inner div unmarked too, see ACCORDION-MATRIX.md §0) but still
   gets a real, addressable data-slot, per rule 3.

   GROUP-LEVEL EXCLUSIVITY (behavior.exclusive-expand / prop.type): ONE
   internal toggle() function serves every column. When `config.type` is
   undefined (Salt has no group-level type concept at all — see
   ACCORDION-MATRIX.md Finding 2), the `type` prop is IGNORED regardless of
   what a consumer passes, and every item toggles its own membership in the
   expanded set independently — this is not a fallback default, it is the
   real, faithful reproduction of Salt's own architecture (AccordionGroup
   holds no state of its own). When `config.type==="single"` a toggle
   REPLACES the expanded set with just the newly-opened value (or empties it,
   only when `collapsible` is also true) — real Radix exclusivity.

   CONTENT MOUNT TECHNIQUE (structure.content / behavior chassis note): the
   content panel stays PERMANENTLY MOUNTED (native `hidden` + `aria-hidden` +
   a CSS grid-template-rows transition — Salt's own real technique, see
   Finding 4) for EVERY column, rather than reproducing Radix's own
   mount/unmount-on-animation-end `Presence` utility (external, unvendored,
   not independently inspectable at that mechanism level) — a declared,
   reasonable simplification, the same shape as dropdown-menu's one-level
   submenu simplification.

   Keyboard (behavior.expand-toggle / .arrow-navigation / .home-end):
   Enter/Space (native button semantics) toggle the focused trigger's own
   item. When `config.arrowNav` (shadcn/M3 only — CONFIRMED ABSENT from Salt,
   see Finding 3), ArrowUp/ArrowDown move real DOM focus between sibling
   triggers in the same group (skipping disabled ones), and Home/End jump to
   the first/last enabled trigger. */
import * as React from "react"

export interface AccordionConfig {
  /** capability gate: which group-level `type` values this column supports
      (["single","multiple"]), or undefined when the column has no group-level
      type concept at all (Salt — see behavior.exclusive-expand). */
  type?: string[]
  /** capability gate for prop.collapsible. */
  collapsible?: boolean
  /** structure.header: wrap the trigger in a real heading element. */
  headerWrapped?: boolean
  /** capability gate: which prop.indicator-side values this column supports. */
  indicatorSide?: string[]
  /** capability gate: which prop.status values this column supports. */
  status?: string[]
  /** behavior.arrow-navigation / .home-end capability gate. */
  arrowNav?: boolean
}

export interface AccordionItemModel {
  value: string
  trigger: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
  /** only rendered when config.status includes this value. */
  status?: "error" | "warning" | "success"
}

export interface AccordionProps {
  config: AccordionConfig
  items: AccordionItemModel[]
  /** only honoured when config.type is present (see the file-header note). */
  type?: "single" | "multiple"
  /** only honoured when config.collapsible AND type==="single". */
  collapsible?: boolean
  /** only honoured when config.indicatorSide is present; default "left". */
  indicatorSide?: "left" | "right"
  /** controlled expanded-value set. */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** harness affordance: force these values open regardless of state, so
      parts are visible without interaction. Not a design-system prop. */
  forceOpen?: string[]
  className?: string
  id?: string
}

function ChevronGlyph() {
  // DECLARED DEFERRAL, same convention as every prior component's
  // PlaceholderIcon/Glyph: a neutral geometric mark standing in for each
  // system's own icon set until a registry icon-set component exists.
  return (
    <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StatusGlyph({ status }: { status: "error" | "warning" | "success" }) {
  const d = status === "error" ? "M8 4v5M8 11.5v.01" : status === "warning" ? "M8 4v5M8 11.5v.01" : "M4.5 8.5L7 11L11.5 5.5"
  return (
    <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      {status === "success" ? (
        <path d={d} stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d={d} stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

export function Accordion({
  config,
  items,
  type,
  collapsible,
  indicatorSide = "left",
  value,
  defaultValue,
  onValueChange,
  forceOpen,
  className,
  id,
}: AccordionProps) {
  const idBase = id ?? "accordion"
  const isControlled = value !== undefined
  const [uncontrolled, setUncontrolled] = React.useState<Set<string>>(() => new Set(defaultValue ?? []))
  const expandedSet = isControlled ? new Set(value) : uncontrolled
  const groupRef = React.useRef<HTMLDivElement | null>(null)

  const singleMode = Boolean(config.type) && type === "single"
  const showIndicatorSide = config.indicatorSide?.includes(indicatorSide) ? indicatorSide : "left"

  function setExpanded(next: Set<string>) {
    if (!isControlled) setUncontrolled(next)
    onValueChange?.([...next])
  }

  function toggle(itemValue: string, disabled?: boolean) {
    if (disabled) return
    const isOpen = expandedSet.has(itemValue)
    if (singleMode) {
      if (isOpen) {
        const canCollapseToNone = Boolean(config.collapsible) && Boolean(collapsible)
        setExpanded(canCollapseToNone ? new Set() : new Set([itemValue]))
        return
      }
      setExpanded(new Set([itemValue]))
      return
    }
    const next = new Set(expandedSet)
    if (isOpen) next.delete(itemValue)
    else next.add(itemValue)
    setExpanded(next)
  }

  // behavior.arrow-navigation / .home-end — real roving focus between
  // sibling triggers, gated entirely on config.arrowNav (Salt: CONFIRMED
  // ABSENT, see ACCORDION-MATRIX.md Finding 3 — this branch never runs for
  // that column since config.arrowNav is undefined there).
  function onTriggerKeyDown(e: React.KeyboardEvent, index: number) {
    if (!config.arrowNav) return
    const root = groupRef.current
    if (!root) return
    const triggers = [...root.querySelectorAll<HTMLButtonElement>('[data-slot="accordion-trigger"]')]
    const enabled = triggers.filter((t) => !t.disabled)
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      const cur = enabled.indexOf(triggers[index])
      if (cur < 0) return
      const delta = e.key === "ArrowDown" ? 1 : -1
      const next = enabled[(cur + delta + enabled.length) % enabled.length]
      next?.focus()
    } else if (e.key === "Home") {
      e.preventDefault()
      enabled[0]?.focus()
    } else if (e.key === "End") {
      e.preventDefault()
      enabled[enabled.length - 1]?.focus()
    }
  }

  return (
    <div ref={groupRef} data-slot="accordion-group" className={className} id={id}>
      {items.map((item, i) => {
        const expanded = expandedSet.has(item.value) || Boolean(forceOpen?.includes(item.value))
        const headerId = `${idBase}-${item.value}-header`
        const panelId = `${idBase}-${item.value}-panel`
        const status = config.status?.includes(item.status ?? "") ? item.status : undefined

        const triggerEl = (
          <button
            type="button"
            data-slot="accordion-trigger"
            id={headerId}
            aria-expanded={expanded}
            aria-controls={panelId}
            disabled={item.disabled}
            data-disabled={item.disabled ? "" : undefined}
            data-status={status}
            onClick={() => toggle(item.value, item.disabled)}
            onKeyDown={(e) => onTriggerKeyDown(e, i)}
          >
            {showIndicatorSide === "left" && (
              <span data-slot="accordion-icon" aria-hidden="true">
                <ChevronGlyph />
              </span>
            )}
            <span data-slot="accordion-trigger-label">{item.trigger}</span>
            {status && (
              <span data-slot="accordion-status-icon" data-status={status} aria-hidden="true">
                <StatusGlyph status={status} />
              </span>
            )}
            {showIndicatorSide === "right" && (
              <span data-slot="accordion-icon" aria-hidden="true">
                <ChevronGlyph />
              </span>
            )}
          </button>
        )

        return (
          <div
            key={item.value}
            data-slot="accordion-item"
            data-status={status}
            data-disabled={item.disabled ? "" : undefined}
            data-indicator-side={showIndicatorSide}
          >
            {config.headerWrapped ? (
              <h3 data-slot="accordion-header">{triggerEl}</h3>
            ) : (
              triggerEl
            )}
            <div
              data-slot="accordion-content"
              role="region"
              id={panelId}
              aria-labelledby={headerId}
              aria-hidden={!expanded}
              hidden={!expanded}
            >
              <div data-slot="accordion-content-body">{item.content}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
