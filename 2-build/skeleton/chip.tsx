/* Chip skeleton - written from the template's PART UNION (an optional group
   wrapper, a root, an optional leading icon / avatar / selection-check, a
   label, an optional trailing control, and an optional state-layer overlay).
   Inherits from no design system.

   THREE THINGS ARE CONFIG RATHER THAN HARDCODES, and each one is a place a
   retrofit would have happened:

   1. THE ELEMENT IS DERIVED FROM prop.interaction, not fixed. Salt ships TWO
      exports on one docs/COMPONENTS.md row: Pill.tsx returns a real
      <button type="button"> and Tag.tsx returns a bare <div> with no role and
      no tabindex. A chassis that always rendered a button would have made
      every Salt Tag focusable against source; one that always rendered a div
      would have destroyed the Pill's native Enter/Space activation. M3 is [R]
      - a tokens-only clone has no element - and takes the button reading
      because its token set describes a control unambiguously.

   2. THE SELECTION SCOPE IS CONFIG. In Salt, selection lives on the GROUP:
      Pill.tsx reads usePillGroup() and a pill outside a selectionVariant=
      "multiple" group has no role, no aria-checked and no check icon at all,
      even if you pass it a value. In M3 the selected-/unselected- token
      families sit on the CHIP and no chip-set token exists anywhere. A
      boolean `selectable` flag would have erased that divergence.

   3. THE DELETE AFFORDANCE IS STRUCTURAL, and it is the a11y fork this
      component exists to expose. Salt's documented closable pill puts a bare
      CloseIcon INSIDE the button and makes the whole pill's onClick the
      remove handler - no nested focusable, one tab stop. M3's filter and
      input chips carry a with-trailing-icon-* family with its own spacing and
      its own per-state colours, and the published spec makes the input chip's
      a remove BUTTON - a focusable inside a focusable, two tab stops. The
      chassis renders a real nested <button> only where structure.trailing is
      on, and MEASURES whether a focusable descendant is actually present,
      publishing data-has-nested-focusable so the fork is inspectable in the
      DOM instead of merely described. Same resolution card.tsx reached for
      its nested-interactive question.

   ONE DECLARED API DIVERGENCE, stated rather than smoothed: `selected` is not
   a Salt Pill prop. Salt DERIVES it inside the component from
   pillGroupContext.selected.includes(value). The chassis takes it as an
   instance prop and lets a ChipGroup drive it, which is the same observable
   rule reached through a props-based API - the identical approximation
   card.tsx made for hasCardSection.

   DECLARED COMPOSITIONS, same convention as alert.tsx, card-check.tsx and
   badge-check.tsx: the leading slot composes an icon set and (M3 input-chip)
   `avatar`; the trailing slot composes an icon set and `button`; the group
   composes `form-field` (Salt's PillGroup merges useFormFieldProps). Rather
   than importing those skeletons - which would couple this component's build
   to another component's template - the harness supplies neutral
   placeholders.

   Every behavior row in contract/templates/chip.template.json is implemented
   below and asserted by scripts/check-chip-behavior.mjs, which exists because
   locked behavior rows have NO generator gate (docs/SELECT-MATRIX.md
   finding 16). */
import * as React from "react"

export interface ChipConfig {
  leadingIcon?: boolean
  avatar?: boolean
  selectionCheck?: boolean
  trailing?: boolean
  stateLayer?: boolean
  selectionScope?: string
  interaction?: string[]
  kind?: string[]
  elevation?: string[]
  tagVariant?: string[]
  bordered?: boolean[]
  selected?: boolean[]
  disabled?: boolean[]
  /* No column turns this on. Read from config rather than hardcoded to
     undefined so that "no system binds Delete or Backspace to a standalone
     chip" is a value in the matrix instead of an assumption baked in here -
     see behavior.delete-keys. */
  deleteKeys?: string[]
  /* Off in every column. PillGroup binds no keydown handler and M3 has no
     chip-set token; carried so the absence is a cell - see
     behavior.group-navigation. */
  groupNavigation?: boolean
}

export interface ChipProps {
  config: ChipConfig
  children?: React.ReactNode
  leading?: React.ReactNode
  avatar?: React.ReactNode
  trailingIcon?: React.ReactNode
  /* the axes */
  interaction?: string
  kind?: string
  elevation?: string
  tagVariant?: string
  bordered?: boolean
  /* per-instance capability flags (never read from config[0] - these are
     CAPABILITY LISTS in the columns, not ordered defaults) */
  selected?: boolean
  disabled?: boolean
  value?: string
  onSelectionChange?: (event: React.SyntheticEvent, value: string | undefined) => void
  onActivate?: (event: React.SyntheticEvent) => void
  onDelete?: (event: React.SyntheticEvent) => void
  deleteLabel?: string
  className?: string
  "aria-label"?: string
}

export interface ChipGroupProps {
  config: ChipConfig
  children?: React.ReactNode
  label?: string
  disabled?: boolean
  className?: string
}

/* behavior.group-navigation - OFF IN EVERY COLUMN, implemented anyway.
   PillGroup.tsx binds no keydown handler of any kind: it is a context
   provider around a stripped <fieldset>, every pill keeps its own tab stop,
   and accessibility.mdx documents Tab / Shift+Tab and nothing else. M3 has no
   chip-set token to navigate. The capability exists here so the gap is a
   matrix cell rather than a silent omission, and so the contrast with the
   SAME design system's InteractableCardGroup - a roving-tabindex radiogroup
   with arrow navigation - is inspectable. */
export function ChipGroup({ config, children, label, disabled, className }: ChipGroupProps) {
  const groupNavigation = Boolean(config.groupNavigation)

  const onKeyDown = groupNavigation
    ? (event: React.KeyboardEvent<HTMLFieldSetElement>) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
        const nodes = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>('[data-slot="chip"]:not([data-disabled])'),
        )
        const here = nodes.indexOf(document.activeElement as HTMLElement)
        if (here < 0) return
        event.preventDefault()
        const step = event.key === "ArrowRight" ? 1 : -1
        nodes[(here + step + nodes.length) % nodes.length]?.focus()
      }
    : undefined

  return (
    <fieldset
      data-slot="chip-group"
      data-group-navigation={groupNavigation ? "" : undefined}
      aria-label={label}
      disabled={disabled}
      onKeyDown={onKeyDown}
      className={className}
    >
      {children}
    </fieldset>
  )
}

export function Chip({
  config,
  children,
  leading,
  avatar,
  trailingIcon,
  interaction,
  kind,
  elevation,
  tagVariant,
  bordered,
  selected,
  disabled,
  value,
  onSelectionChange,
  onActivate,
  onDelete,
  deleteLabel,
  className,
  "aria-label": ariaLabel,
}: ChipProps) {
  const rootRef = React.useRef<HTMLElement | null>(null)

  /* Salt holds TWO independent pressed flags and combines them differently
     depending on whether the pill is selectable - see behavior.pressed-flag.
     Reproduced with the same two flags for the same two reasons. */
  const [pressActive, setPressActive] = React.useState(false)
  const [spaceActive, setSpaceActive] = React.useState(false)
  const [hasNestedFocusable, setHasNestedFocusable] = React.useState(false)

  const interactionMode = interaction ?? config.interaction?.[0] ?? "action"
  const kindMode = kind ?? config.kind?.[0]
  const elevationMode = elevation ?? config.elevation?.[0]
  const tagVariantMode = tagVariant ?? config.tagVariant?.[0]

  const isStatic = interactionMode === "static"
  const isToggle = interactionMode === "toggle"
  const groupScoped = config.selectionScope === "group"

  /* structure.selection-check - Salt renders its PillCheckIcon only inside a
     selectionVariant="multiple" group. Gated on BOTH the capability and the
     mode so a column with the part cannot show it on an action pill. */
  const showCheck = Boolean(config.selectionCheck) && isToggle
  const showAvatar = Boolean(config.avatar) && avatar !== undefined
  const showLeading = Boolean(config.leadingIcon) && leading !== undefined && !showAvatar
  const showTrailing = Boolean(config.trailing) && onDelete !== undefined
  const hasLeadingBox = showCheck || showAvatar || showLeading

  /* behavior.disabled-handling - Salt ORs the group's disabled into the
     pill's own (`pillGroupContext.disabled || buttonDisabled`) and writes the
     NATIVE attribute, unlike InteractableCard in the same system, which uses
     aria-disabled and stays focusable. A static chip (Tag) has no disabled
     state in any column, so the flag is clamped off there. */
  const isDisabled = Boolean(disabled) && !isStatic
  const combinedActive = isToggle ? pressActive || spaceActive : pressActive

  /* behavior.pressed-flag - the clear listener is on the WINDOW, exactly as
     Pill.tsx has it, so a pointer released outside the chip still clears the
     flag. Depends only on nothing that is conditionally rendered, so it needs
     no gating state beyond its own guard (lesson 4b does not bite here - the
     effect reads no ref). */
  React.useEffect(() => {
    if (!pressActive) return
    const clear = () => setPressActive(false)
    window.addEventListener("pointerup", clear)
    window.addEventListener("pointercancel", clear)
    return () => {
      window.removeEventListener("pointerup", clear)
      window.removeEventListener("pointercancel", clear)
    }
  }, [pressActive])

  /* behavior.delete-affordance - MEASURED, not assumed. Publishes whether a
     focusable really sits inside this chip, so the Salt reading (no nesting,
     one tab stop) and the M3 reading (a nested remove button, two tab stops)
     are distinguishable in the DOM rather than only in prose.
     LESSON 4b: this effect reads a ref to CONDITIONALLY RENDERED nodes, so
     its dependency array must list every piece of state that decides whether
     those nodes exist - showTrailing (the trailing button), interactionMode
     (which swaps the root between <div> and <button>) and isDisabled (which
     removes the trailing button's tab stop). Omitting any of them would
     repeat the dialog failure: the effect runs once against the wrong tree
     and never again. */
  React.useEffect(() => {
    const node = rootRef.current
    if (!node) return
    const focusables = node.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    setHasNestedFocusable(focusables.length > 0)
  }, [showTrailing, interactionMode, isDisabled])

  /* behavior.role - THREE ANSWERS IN ONE SYSTEM, and the ARIA is conditional.
     An action Salt pill writes NO aria at all and leans on native <button>
     semantics; a toggle pill writes role="checkbox" + aria-checked, and only
     inside a multiple-selection group; a Tag writes nothing whatsoever. There
     is no `radio` reading anywhere, because PillGroup's selectionVariant is
     only "none" | "multiple". M3 is [R] and takes aria-pressed on its toggle
     families, because its selection is chip-scoped rather than group-scoped
     and nothing in a tokens-only clone says otherwise. Computed here rather
     than hardcoded so the divergence is a matrix cell. */
  const role = isToggle && groupScoped ? "checkbox" : undefined
  const ariaChecked = isToggle && groupScoped ? Boolean(selected) : undefined
  const ariaPressed = isToggle && !groupScoped ? Boolean(selected) : undefined

  const fireSelection = (event: React.SyntheticEvent) => {
    if (isToggle) onSelectionChange?.(event, value)
    else onActivate?.(event)
  }

  /* behavior.keyboard-activation - TWO CONTRACTS IN ONE SYSTEM. An action
     pill is a native button: Enter and Space both activate. A TOGGLE pill
     activates on SPACE ONLY, because Pill.tsx explicitly preventDefaults
     Enter inside a selectable group with the comment "Prevent selection on
     enter key for selectable pill". Modelling interaction as a boolean would
     have handed a selectable pill an Enter activation source removes.
     behavior.delete-keys is folded into the same handler: it is OFF in every
     column, so config.deleteKeys is undefined everywhere and the branch never
     fires - carried so the unanimous absence is a capability the chassis has
     rather than a silent omission. */
  const deleteKeys = config.deleteKeys ?? []
  const onKeyDown = isStatic
    ? undefined
    : (event: React.KeyboardEvent<HTMLElement>) => {
        if (isDisabled) return
        if (deleteKeys.length > 0 && deleteKeys.includes(event.key) && onDelete) {
          event.preventDefault()
          onDelete(event)
          return
        }
        if (event.key === "Enter" && isToggle) {
          event.preventDefault()
          return
        }
        if (event.key === " ") {
          if (isToggle) setSpaceActive(true)
          return
        }
      }

  const onKeyUp = isStatic
    ? undefined
    : (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === " " && isToggle) setSpaceActive(false)
      }

  /* behavior.selection / behavior.delete-affordance (the Salt half) - where
     there is no trailing part, the WHOLE CHIP is the delete control and its
     own click is the remove handler, which is exactly what Salt's Closable
     story does. */
  const onClick = isStatic
    ? undefined
    : (event: React.MouseEvent<HTMLElement>) => {
        if (isDisabled) return
        if (!showTrailing && onDelete && !isToggle) {
          onDelete(event)
          return
        }
        fireSelection(event)
      }

  const onPointerDown = isStatic
    ? undefined
    : () => {
        if (isDisabled) return
        setPressActive(true)
      }

  const Comp = (isStatic ? "div" : "button") as "div" | "button"

  return (
    <Comp
      ref={rootRef as React.Ref<never>}
      data-slot="chip"
      data-interaction={interactionMode}
      data-kind={kindMode}
      data-elevation={elevationMode}
      data-tag-variant={isStatic ? tagVariantMode : undefined}
      data-bordered={isStatic && bordered ? "" : undefined}
      data-selected={isToggle && selected ? "" : undefined}
      data-disabled={isDisabled ? "" : undefined}
      data-active={combinedActive ? "" : undefined}
      data-has-leading={hasLeadingBox ? "" : undefined}
      data-has-trailing={showTrailing ? "" : undefined}
      data-has-nested-focusable={hasNestedFocusable ? "" : undefined}
      type={Comp === "button" ? "button" : undefined}
      disabled={Comp === "button" ? isDisabled : undefined}
      role={role}
      aria-checked={ariaChecked}
      aria-pressed={ariaPressed}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onPointerDown={onPointerDown}
      className={className}
    >
      {config.stateLayer ? <span data-slot="chip-state-layer" aria-hidden="true" /> : null}
      {showCheck ? (
        <span data-slot="chip-check" aria-hidden="true">
          {selected ? (
            <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 6.2 L5 8.6 L9.5 3.6" stroke="currentColor" strokeWidth="1.6" fill="none" />
            </svg>
          ) : null}
        </span>
      ) : null}
      {showAvatar ? (
        <span data-slot="chip-avatar" aria-hidden="true">
          {avatar}
        </span>
      ) : null}
      {showLeading ? (
        <span data-slot="chip-leading" aria-hidden="true">
          {leading}
        </span>
      ) : null}
      <span data-slot="chip-label">{children}</span>
      {showTrailing ? (
        <button
          data-slot="chip-trailing"
          type="button"
          aria-label={deleteLabel ?? "Remove"}
          disabled={isDisabled}
          onClick={(event) => {
            /* the nested control must not also activate the chip it sits in */
            event.stopPropagation()
            onDelete?.(event)
          }}
        >
          {trailingIcon}
        </button>
      ) : null}
    </Comp>
  )
}
