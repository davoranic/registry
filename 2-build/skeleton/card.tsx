/* Card skeleton — written from the template's part union: a surface, an
   optional media block, an optional header carrying a title, a description
   and a header action, an optional content block, an optional footer, an
   optional accent bar, an optional state layer, an optional card icon, and
   an optional selection group.
   Inherits from no design system: which parts render, whether the surface
   is inert / a control / a link, whether it detects its own sections,
   whether it carries a state layer, and how it announces itself are ALL
   received as config.

   FIVE STRUCTURAL / BEHAVIOURAL AXES, all real, all config'd:

   1. `variant` — M3's elevated / filled / outlined. THREE MECHANISMS for
      one job (a shadow, a fill, a stroke), not one surface with a colour
      delta. Modelled as an axis that reassigns the indirection slots the
      background / border / elevation rows consume, so the mechanism really
      changes rather than the colour.

   2. `containerTone` — Salt's primary / secondary / tertiary / ghost.
      Deliberately NOT the same axis: reading Card.css shows all four rules
      move exactly one property, the background, and share one border
      colour. A tone ladder is not a mechanism choice.

   3. `interaction` — "static" (a container, no role, no tab stop),
      "button" (role=button standalone, role=radio/checkbox in a group,
      Enter AND Space), "link" (a real <a href>, Enter only, and SPACE DOES
      NOT ACTIVATE IT). Salt ships all three as separate components; shadcn
      ships only the first; M3's tokens describe the second while its own
      library disowns them.

   4. `sectioning` — "detected" (Salt: the card looks for header/content/
      footer sections and, if it finds any, hands its padding over to them
      and collapses the follower's top padding to zero), "always" (shadcn:
      no detection, the card keeps its block padding and NEVER has
      horizontal padding of its own), "never" (M3: no sections exist).

   5. `selectionMode` — Salt's group only. "single" turns the group into a
      radiogroup with arrow-key navigation that SELECTS as it moves;
      "multi" turns it into a plain group of checkboxes with no arrow
      handling at all, where Tab walks the set and Space toggles.

   EVERY BEHAVIOR ROW IN card.template.json IS IMPLEMENTED HERE, and
   scripts/check-card-behavior.mjs fails the build if one is not. That
   script exists because locked behavior rows have NO generator gate
   (docs/SELECT-MATRIX.md finding 16) — and because two dialog effects
   passed that same gate and never executed (docs/DIALOG-MATRIX.md's
   closing section). Its report repeats that caveat.

   THE DIALOG TRAP, GUARDED HERE. Both useEffects below that read a ref
   list, in their dependency array, the state that gates the nodes they
   read:
     - the group's element collection reads groupRef and queries for its
       card children -> deps [children], because the children ARE the
       nodes; a card added or removed re-runs it, exactly as Salt's own
       effect does.
     - the focusable-descendant measurement reads rootRef and queries the
       sections -> deps [interaction, sectioned, header, content, footer,
       action], because those decide which section nodes are rendered at
       all; a card that grows a footer one render later would otherwise
       keep a stale answer forever.

   DECLARED GAPS / APPROXIMATIONS (all stated in docs/CARD-MATRIX.md):
   (a) Section detection is done over the PROPS this chassis is given, not
       by walking children and comparing `child.type` to CardHeader /
       CardContent / CardFooter the way Salt's hasCardSection.ts does. Same
       observable rule, props-based API.
   (b) Salt states every hover rule inside `@media (hover: hover)`. The
       generator has no @media channel, so the hover rows are emitted
       unconditionally.
   (c) The pressed state is driven by a `data-active` flag as well as
       `:active`, because a keyboard activation never produces `:active`.
       For Salt that IS source (`.saltInteractableCard:active,
       .saltInteractableCard-active` share one block); for M3 the flag is
       the chassis's own mechanism standing in for a ripple.

   DECLARED COMPOSITIONS: the header action and the footer actions are the
   already-built `button`; a link card IS the `link` component; the M3 card
   glyph belongs to a future icon set; Salt's title and description are its
   `text` component; and an InteractableCardGroup adopts `radio-button` /
   `checkbox` ARIA wholesale. All render as neutral placeholders. */
import * as React from "react"

export interface CardConfig {
  media?: boolean
  header?: boolean
  title?: boolean
  description?: boolean
  action?: boolean
  content?: boolean
  footer?: boolean
  accent?: boolean
  stateLayer?: boolean
  cardIcon?: boolean
  group?: boolean
  sectioning?: string
  groupNavigation?: boolean
  selection?: boolean
  interaction?: string[]
  variant?: string[]
  containerTone?: string[]
  accentPlacement?: string[]
  selectionMode?: string[]
  disabled?: boolean[]
  hoverable?: boolean[]
}

export interface CardProps {
  config: CardConfig
  /** axis overrides; each falls back to the column's own value[0] */
  variant?: string
  containerTone?: string
  interaction?: string
  accentPlacement?: string
  /** per-instance flags */
  accent?: boolean
  hoverable?: boolean
  disabled?: boolean
  selected?: boolean
  value?: string
  href?: string
  /** content */
  media?: React.ReactNode
  icon?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  content?: React.ReactNode
  footer?: React.ReactNode
  children?: React.ReactNode
  onActivate?: (value?: string) => void
  className?: string
  style?: React.CSSProperties
}

/* ------------------------------------------------------------------ *
 * The selection group (Salt only — InteractableCardGroup).
 * Modelled as a PART of this component, the same treatment
 * TABS-MATRIX.md gave Salt's overflow menu. If docs/COMPONENTS.md ever
 * grows a card-group row, these pieces migrate wholesale.
 * ------------------------------------------------------------------ */
interface CardGroupContextValue {
  select: (value: string | undefined) => void
  isSelected: (value: string | undefined) => boolean
  isFirstChild: (value: string | undefined) => boolean
  hasValue: boolean
  disabled?: boolean
  multiSelect: boolean
}

const CardGroupContext = React.createContext<CardGroupContextValue | undefined>(undefined)

export interface CardGroupProps {
  config: CardConfig
  selectionMode?: string
  disabled?: boolean
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  children?: React.ReactNode
  className?: string
}

export function CardGroup({
  config,
  selectionMode,
  disabled,
  value,
  onValueChange,
  children,
  className,
}: CardGroupProps) {
  const groupRef = React.useRef<HTMLDivElement | null>(null)
  const [elements, setElements] = React.useState<HTMLElement[]>([])

  const mode = selectionMode ?? config.selectionMode?.[0] ?? "single"
  const multiSelect = mode === "multi"

  /* REF-READING EFFECT #1 — reads groupRef and queries for the cards
     inside it. Its gate is `children`: the cards ARE the nodes, so a card
     added, removed or disabled must re-run the query or the arrow ring
     goes stale. Salt's own effect is the same query with the same single
     dependency (and its own biome-ignore comment saying so). */
  React.useEffect(() => {
    const root = groupRef.current
    if (!root) return
    const found = Array.from(
      root.querySelectorAll<HTMLElement>('[data-slot="card"]:not([data-disabled])'),
    )
    setElements(found)
  }, [children])

  // behavior.selection — the group owns the value; a card only mirrors it.
  const values = Array.isArray(value) ? value : value === undefined ? [] : [value]
  const isSelected = React.useCallback(
    (v: string | undefined) => (v === undefined ? false : values.includes(v)),
    [values.join("\u0000")],
  )
  const select = React.useCallback(
    (v: string | undefined) => {
      if (!config.selection || v === undefined) return
      if (multiSelect) {
        const current = Array.isArray(value) ? value : []
        onValueChange?.(current.includes(v) ? current.filter((x) => x !== v) : [...current, v])
      } else if (value !== v) {
        onValueChange?.(v)
      }
    },
    [config.selection, multiSelect, value, onValueChange],
  )
  const isFirstChild = React.useCallback(
    (v: string | undefined) => elements[0]?.getAttribute("data-value") === v,
    [elements],
  )

  // behavior.group-navigation — Space always selects; arrows navigate AND
  // select, single-select only, with wrap-around. There is no manual mode:
  // this is radio-group semantics, the opposite conclusion to the one
  // Salt's own TabList reaches (docs/TABS-MATRIX.md finding 2).
  const onGroupKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!config.groupNavigation || elements.length === 0) return
    const active = (groupRef.current?.ownerDocument ?? document).activeElement as HTMLElement | null
    const current = active ? elements.indexOf(active) : -1
    if (e.key === " ") {
      e.preventDefault()
      if (current >= 0) select(elements[current].getAttribute("data-value") ?? undefined)
      return
    }
    if (multiSelect) return
    const next = (current + 1 + elements.length) % elements.length
    const prev = (current - 1 + elements.length) % elements.length
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault()
      select(elements[next].getAttribute("data-value") ?? undefined)
      elements[next]?.focus()
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault()
      select(elements[prev].getAttribute("data-value") ?? undefined)
      elements[prev]?.focus()
    }
  }

  const ctx: CardGroupContextValue = {
    select,
    isSelected,
    isFirstChild,
    hasValue: values.length > 0,
    disabled,
    multiSelect,
  }

  if (!config.group) return <>{children}</>

  return (
    <CardGroupContext.Provider value={ctx}>
      <div
        data-slot="card-group"
        role={multiSelect ? "group" : "radiogroup"}
        ref={groupRef}
        className={className}
        onKeyDown={onGroupKeyDown}
      >
        {children}
      </div>
    </CardGroupContext.Provider>
  )
}

/* DECLARED COMPOSITION — a neutral glyph standing in for M3's own card
   icon (icon-size 24px, icon-color primary) until a registry icon-set
   component exists. Same convention as Calendar's chevrons. */
function PlaceholderCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function Card({
  config,
  variant,
  containerTone,
  interaction: interactionProp,
  accentPlacement,
  accent,
  hoverable,
  disabled: disabledProp,
  selected: selectedProp,
  value,
  href,
  media,
  icon,
  title,
  description,
  action,
  content,
  footer,
  children,
  onActivate,
  className,
  style,
}: CardProps) {
  const group = React.useContext(CardGroupContext)
  const rootRef = React.useRef<HTMLElement | null>(null)
  const wasPointerRef = React.useRef(false)

  const interaction = interactionProp ?? config.interaction?.[0] ?? "static"
  const interactive = interaction !== "static"
  const activeVariant = variant ?? config.variant?.[0]
  const activeTone = containerTone ?? config.containerTone?.[0]
  const placement = accentPlacement ?? config.accentPlacement?.[0]
  const disabled = Boolean(disabledProp || group?.disabled)

  const [focusVisible, setFocusVisible] = React.useState(false)
  const [hasFocusable, setHasFocusable] = React.useState(false)

  // behavior.active-flag — Salt's useInteractableCard, reproduced: a JS
  // pressed flag plus a setTimeout(...,0) that refuses to clear while a
  // key is still down, because Enter fires as BOTH a key event and a click
  // and because Firefox does not enter :active on Space.
  const [keyIsDown, setKeyIsDown] = React.useState("")
  const [active, setActive] = React.useState(false)
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (keyIsDown !== "Enter" && keyIsDown !== " " && active) setActive(false)
    }, 0)
    return () => clearTimeout(t)
  }, [active, keyIsDown])

  const sectioning = config.sectioning ?? "never"
  const hasSection = Boolean(
    (config.header && (title || description || action)) ||
      (config.content && content) ||
      (config.footer && footer),
  )
  const sectioned =
    sectioning === "always" ? true : sectioning === "detected" ? hasSection : false

  // only a CONTROL can be selected: a static card sitting inside a group
  // is not part of the selection set, and marking it selected would light
  // style.surface.selected on a surface with no role.
  const isSelected =
    group && config.selection && interactive ? group.isSelected(value) : Boolean(selectedProp)

  // behavior.nested-interactive — the genuine a11y fork, published as a
  // data attribute rather than described in a comment, so the harness can
  // assert it: a static card is a CONTAINER that may hold focusable
  // children; a button card is a CONTROL that Salt nevertheless allows to
  // embed them "for visual affordance"; a link card is a CONTROL whose own
  // docs forbid them. M3 cannot answer — no element exists to ask.
  const nestedInteractive =
    interaction === "link" ? "forbidden" : interaction === "button" ? "tolerated" : "container"

  /* REF-READING EFFECT #2 — reads rootRef and queries the SECTION nodes
     for focusable descendants. Its gate is the set of props that decide
     which sections are rendered at all (plus `interaction`, which changes
     the element the ref points at from a <div> to an <a>): a card that
     grows a footer, or switches from static to link, mounts different
     nodes one render later, and an effect that omitted them would keep a
     stale answer forever. */
  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const focusables = root.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    setHasFocusable(focusables.length > 0)
  }, [interaction, sectioned, config.header, content, footer, action, title, description])

  // behavior.role — five answers across three systems. A static card takes
  // none at all; a button card takes role=button standalone and swaps to
  // radio / checkbox inside a group; a link card is a real <a> and takes
  // the platform's own.
  const role: string | undefined =
    interaction !== "button"
      ? undefined
      : group && config.selection
        ? group.multiSelect
          ? "checkbox"
          : "radio"
        : "button"

  // behavior.tab-stop — Salt's four-branch computation: -1 when disabled;
  // 0 on every card of a MULTI-select group (checkbox semantics); roving
  // in a SINGLE-select group, where the tab stop is the selected card, or
  // the first card while the group has no value yet (radio semantics);
  // and 0 standalone. A static card is never in the tab order.
  const tabIndex: number | undefined = !interactive
    ? undefined
    : disabled
      ? -1
      : group && config.selection
        ? group.multiSelect
          ? 0
          : isSelected || (!group.hasValue && group.isFirstChild(value))
            ? 0
            : -1
        : 0

  const activate = () => {
    if (disabled) return
    setActive(true)
    if (group && config.selection) group.select(value)
    onActivate?.(value)
  }

  // behavior.pointer-activation — bound only when enabled, so a disabled
  // card has NO handler rather than a handler that returns early (Salt's
  // `onClick: !disabled ? handleClick : undefined`).
  const handleClick = disabled || !interactive ? undefined : () => activate()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    // behavior.keyboard-activation — Enter AND Space on a button card,
    // both preventDefaulted, both firing from KEYDOWN. A link card binds
    // nothing: it is a native anchor, so Enter navigates and Space does
    // not activate it at all.
    if (interaction === "button" && (e.key === "Enter" || e.key === " ")) {
      setKeyIsDown(e.key)
      e.preventDefault()
      activate()
    }
  }

  const commonProps: Record<string, unknown> = {
    "data-slot": "card",
    "data-variant": activeVariant,
    "data-tone": activeTone,
    "data-interaction": interaction,
    "data-interactive": interactive ? "" : undefined,
    "data-hoverable": hoverable ? "" : undefined,
    "data-sectioned": sectioned ? "" : undefined,
    "data-accent-placement": config.accent && accent ? placement : undefined,
    "data-state": isSelected ? "selected" : undefined,
    "data-active": active ? "" : undefined,
    "data-disabled": disabled ? "" : undefined,
    "data-focus-visible": focusVisible && !disabled ? "" : undefined,
    "data-nested-interactive": nestedInteractive,
    "data-has-focusable": hasFocusable ? "" : undefined,
    "data-value": value,
    role,
    tabIndex,
    className,
    style,
    // behavior.disabled-handling — aria-disabled, NOT the native
    // attribute, exactly as Salt writes it; the tab stop goes to -1 and
    // the click handler is withheld entirely. Written even where a column
    // has no disabled STYLING (docs/TABS-MATRIX.md declared approximation
    // 4: "the system does not tokenise the state" is not "the state
    // cannot exist", and dropping the ARIA would be a regression the
    // registry invented).
    "aria-disabled": disabled ? true : undefined,
    "aria-checked": role === "radio" || role === "checkbox" ? isSelected : undefined,
    onClick: handleClick,
    onKeyDown: interactive ? handleKeyDown : undefined,
    onKeyUp: interactive
      ? () => {
          setKeyIsDown("")
          setActive(false)
        }
      : undefined,
    onPointerDown: interactive
      ? () => {
          wasPointerRef.current = true
        }
      : undefined,
    onFocus: interactive
      ? () => {
          if (!wasPointerRef.current) setFocusVisible(true)
          wasPointerRef.current = false
        }
      : undefined,
    onBlur: interactive
      ? () => {
          setFocusVisible(false)
          setActive(false)
        }
      : undefined,
  }

  const body = (
    <>
      {config.stateLayer && <span data-slot="card-state-layer" aria-hidden="true" />}
      {config.media && media && <div data-slot="card-media">{media}</div>}
      {config.cardIcon && (icon ?? true) && (
        <span data-slot="card-icon" aria-hidden="true">
          {icon ?? <PlaceholderCardIcon />}
        </span>
      )}
      {/* A column may have the header PART without having a title,
          description or action part — that is precisely Salt, whose
          CardHeader exists but whose headline is an <H3> the consumer
          puts inside it. So each of the three renders in its own part
          where the column has one, and as a bare child where it does
          not. Wrapping them anyway would have invented three Salt parts
          that do not exist. */}
      {config.header && (title || description || action) && (
        <div data-slot="card-header" data-has-action={config.action && action ? "" : undefined}>
          {config.title && title ? <div data-slot="card-title">{title}</div> : title}
          {config.description && description ? (
            <div data-slot="card-description">{description}</div>
          ) : (
            description
          )}
          {config.action && action ? <div data-slot="card-action">{action}</div> : action}
        </div>
      )}
      {/* A column with no header part still receives the same content; it
          renders as plain children, which is exactly what an M3 consumer
          would have to do, since M3 tokenises no header, title, supporting
          text or action. Deliberately NOT wrapped in a part — the absence
          has to stay visible. */}
      {!config.header && (title || description || action) && (
        <>
          {title}
          {description}
          {action}
        </>
      )}
      {config.content && content && <div data-slot="card-content">{content}</div>}
      {!config.content && content}
      {children}
      {config.footer && footer && <div data-slot="card-footer">{footer}</div>}
      {!config.footer && footer}
      {config.accent && accent && <span data-slot="card-accent" aria-hidden="true" />}
    </>
  )

  if (interaction === "link") {
    return (
      <a
        {...(commonProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={disabled ? undefined : (href ?? "#")}
        ref={rootRef as React.Ref<HTMLAnchorElement>}
      >
        {body}
      </a>
    )
  }

  return (
    <div
      {...(commonProps as React.HTMLAttributes<HTMLDivElement>)}
      ref={rootRef as React.Ref<HTMLDivElement>}
    >
      {body}
    </div>
  )
}
