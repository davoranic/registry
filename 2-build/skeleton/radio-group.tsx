/* Radio-group skeleton - written from the template's part union: a RadioGroup
   (a real <fieldset role="radiogroup">, a <div role="radiogroup">, or a bare
   unwrapped <div> per structure.group's three strategies) providing context
   to any number of RadioItem children, each an item root (a real <label>
   when structure.shell="label-wrap", a plain <span> otherwise) wrapping a
   real native <input type="radio"> and a dot <span> carrying the glyph per
   structure.dot's three strategies. Inherits from no design system.

   THE HEADLINE STRUCTURAL FACT THIS CHASSIS HAD TO DECIDE FIRST: does a
   "radio-group" need a group wrapper element at all? Salt: yes, a real
   <fieldset>. shadcn: yes, a <div role="radiogroup">, mandatory (a
   RadioGroupItem has no meaning without one). M3: NO GROUP ELEMENT EXISTS -
   each <md-radio> is independently self-sufficient, sharing selection with
   same-name siblings purely via a DOM-query-scoped controller. This chassis
   models that as a real, distinct THIRD strategy ("name-scoped"), not an
   absence - see structure.group in radio-group.template.json.

   DOM SHAPE, chosen DELIBERATELY BEFORE writing a single selector, per
   CLAUDE.md rule 12 and CHECKBOX-MATRIX.md findings 10/11 (a wrong
   combinator silently killed seven rules in checkbox's first draft, and no
   gate caught it). <input> and <dot> are rendered as SIBLINGS, both direct
   children of the item root - this matches Salt's REAL DOM exactly
   (RadioButton.tsx: <label><input/><RadioButtonIcon/>{label}</label>).
   EVERY conditional style rule anchors its :has() at the ITEM ROOT -
   `[data-slot="radio-item"]:has([data-slot="radio-input"]:STATE)
   [data-slot="radio-dot"]` or `...[data-slot="radio-item"]` directly -
   never assuming adjacency or a particular sibling order.

   A DECLARED SIMPLIFICATION, distinct from checkbox/switch's own chassis
   notes: this chassis renders a REAL native <input type="radio"> sharing
   one `name` per group in EVERY column, INCLUDING M3 (which has none in its
   real source - the first M3 column in this whole pipeline to lack a native
   input at all). This is not an arbitrary shortcut: M3's own
   SingleSelectionController exists SPECIFICALLY to reproduce native
   <input type="radio"> selection/keyboard behaviour for a component that
   has no native input to get it from for free ("similar to native <input
   type='radio'> selection", its own doc comment) - so approximating M3 with
   a real native input converges on the SAME observable keyboard behaviour
   its real JS controller was written to imitate. A direct, welcome
   consequence: Tab/Arrow-key roving navigation is achieved FOR FREE by the
   browser's own native same-name-radio-group semantics in all three
   columns, with ZERO custom keydown code in this file - see
   behavior.arrow-navigation's row note for the full reasoning.

   A SECOND DECLARED SIMPLIFICATION: this chassis implements ONE internal
   selection engine - a GROUP-HELD STRING VALUE compared against each item's
   own `value` prop (Salt's/shadcn's own real model) - for all three
   columns, rather than also reproducing M3's structurally different
   per-item-boolean-plus-uncheck-siblings model. The OBSERVABLE outcome
   (exactly one item ends up checked after any interaction) is identical;
   only the internal data-flow route M3's own real source takes differs -
   see behavior.selection-model.

   NO ref-reading effects anywhere in this file - there is no conditionally
   rendered node whose ref a later effect depends on, the same
   dialog-trap-immune shape checkbox.tsx/switch.tsx both already have. */
import * as React from "react"

export interface RadioGroupConfig {
  groupShape?: string
  shell?: string
  dotMode?: string
  disabled?: boolean[]
  readOnly?: boolean[]
  required?: boolean[]
  validation?: string[]
}

interface GroupContextValue {
  value?: string
  name: string
  onChange: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
  validation?: string
}

const RadioGroupContext = React.createContext<GroupContextValue | undefined>(undefined)

export interface RadioGroupProps {
  config: RadioGroupConfig
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  disabled?: boolean
  readOnly?: boolean
  validation?: string
  className?: string
  "aria-label"?: string
  "aria-labelledby"?: string
}

let groupSeq = 0

/* structure.group - three real, distinct strategies (never an absence: M3
   genuinely has a working mechanism, it just is not an element). */
export function RadioGroup({
  config,
  children,
  value: valueProp,
  defaultValue,
  onValueChange,
  name,
  disabled,
  readOnly,
  validation,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: RadioGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolledValue

  /* behavior.selection-model - the single group-held string this chassis's
     one internal engine uses for all three columns; see the file banner. */
  const handleChange = React.useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  const effectiveName = React.useMemo(() => name ?? `radio-group-${++groupSeq}`, [name])

  const context: GroupContextValue = {
    value,
    name: effectiveName,
    onChange: handleChange,
    disabled,
    readOnly,
    validation,
  }

  const commonProps = {
    "data-slot": "radio-group",
    "data-disabled": disabled || undefined,
    className,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
  } as const

  const body = <RadioGroupContext.Provider value={context}>{children}</RadioGroupContext.Provider>

  if (config.groupShape === "fieldset-radiogroup") {
    return (
      <fieldset {...commonProps} role="radiogroup" aria-readonly={readOnly || undefined}>
        {body}
      </fieldset>
    )
  }
  if (config.groupShape === "div-radiogroup") {
    return (
      <div {...commonProps} role="radiogroup">
        {body}
      </div>
    )
  }
  /* "name-scoped" (M3) - CONFIRMED ABSENCE of any group role or element in
     the real source; this chassis still renders a plain wrapper so
     style.group.gap has somewhere to attach for the columns that need it,
     but writes NO role attribute at all, matching the real absence. */
  return <div {...commonProps}>{body}</div>
}

export interface RadioItemProps {
  config: RadioGroupConfig
  value: string
  label?: React.ReactNode
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  id?: string
  className?: string
  "aria-label"?: string
}

/* structure.shell / structure.native-input / structure.dot. */
export function RadioItem({
  config,
  value,
  label,
  disabled,
  readOnly,
  required,
  id,
  className,
  "aria-label": ariaLabel,
}: RadioItemProps) {
  const group = React.useContext(RadioGroupContext)

  const isChecked = group ? group.value === value : false

  /* behavior.disabled-handling - a THREE-way merge in Salt's real source
     (group, ancestor form-field, own prop); this chassis reproduces the
     two-way part it can see directly (group + own prop). */
  const isDisabled = Boolean(disabled) || Boolean(group?.disabled)
  const isReadOnly = Boolean(readOnly) || Boolean(group?.readOnly)

  /* behavior.validation - Salt's own per-item suppression:
     `!disabled ? (...) : undefined`, reproduced literally. */
  const validationMode = !isDisabled && group?.validation && group.validation !== "off" ? group.validation : undefined

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    /* behavior.readonly - the native readonly IDL attribute has no effect on
       type="radio" inputs, so this early return IS the mechanism, the same
       shape checkbox.tsx's/switch.tsx's own handleChange guards use. */
    if (isReadOnly) return
    if (event.target.checked) group?.onChange(value)
  }

  /* structure.dot - three strategies. Salt shows a glyph ONLY when checked
     (and swaps to a lighter donut when read-only); shadcn shows its single
     glyph whenever checked; M3 always renders both circles, CSS-driven. */
  const showDot =
    config.dotMode === "dual-circle"
      ? true // M3: always in the DOM, opacity/animation-driven
      : isChecked

  const dataState = isChecked ? "checked" : "unchecked"
  /* M3's dual-circle strategy needs a per-instance unique mask id - a Safari
     bug (documented directly in radio.ts's own source comment) fails to
     persist a shared reference across instances otherwise, so this chassis
     reproduces the same per-instance-id mechanism radio.ts itself uses. */
  const maskId = React.useId()

  const dot = (
    <span data-slot="radio-dot" data-state={dataState} aria-hidden="true">
      {showDot ? (
        config.dotMode === "dual-circle" ? (
          /* Neither circle sets its own `fill` - both INHERIT the CSS `fill`
             property from the ancestor <svg> (style.dot.fill/@checked/hover/
             disabled all target `[data-slot="radio-dot"] svg`), the same
             fill-lives-on-the-parent technique radio.ts's own `.icon { fill:
             ... }` rule uses - matching the real source's mechanism, not
             merely its appearance. The outer ring is a SOLID filled circle
             with its centre masked out, the same technique radio.ts itself
             uses, rather than a stroked circle (which would read `stroke`,
             a CSS property style.dot.fill deliberately does not set). */
          <svg viewBox="0 0 20 20">
            <mask id={maskId}>
              <rect width="100%" height="100%" fill="white" />
              <circle cx="10" cy="10" r="8" fill="black" />
            </mask>
            <circle className="outer circle" cx="10" cy="10" r="10" mask={`url(#${maskId})`} />
            <circle className="inner circle" cx="10" cy="10" r="5" />
          </svg>
        ) : config.dotMode === "conditional-glyph" && isReadOnly ? (
          <PlaceholderDonutIcon />
        ) : (
          <PlaceholderDotIcon />
        )
      ) : null}
    </span>
  )

  const Root = (config.shell === "label-wrap" ? "label" : "span") as "label" | "span"

  return (
    <Root
      data-slot="radio-item"
      data-state={dataState}
      data-readonly={isReadOnly || undefined}
      data-validation={validationMode}
      className={className}
    >
      <input
        data-slot="radio-input"
        type="radio"
        id={id}
        name={group?.name}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        readOnly={isReadOnly || undefined}
        aria-readonly={isReadOnly || undefined}
        aria-label={ariaLabel}
        required={required}
        onChange={handleChange}
      />
      {dot}
      {config.shell === "label-wrap" && label ? <span data-slot="radio-label">{label}</span> : null}
    </Root>
  )
}

/* DECLARED DEFERRAL, same convention as checkbox.tsx's/switch.tsx's own
   PlaceholderCheckIcon: neutral geometric shapes standing in for each
   system's own icon set. */
/* Neither placeholder sets its own `fill` - both INHERIT the CSS `fill`
   property from the ancestor <svg> ([data-slot="radio-dot"] svg), which the
   theme-invariant `base` block defaults to `currentColor` (matching Salt's
   own literal fill="currentColor" markup) and which shadcn's/M3's own
   style.dot.fill rows override with a real colour later in the cascade -
   see the file's dual-circle comment above for the identical mechanism. */
function PlaceholderDotIcon() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="6" r="6" />
    </svg>
  )
}

function PlaceholderDonutIcon() {
  /* Salt's own real readOnly glyph (RadioButtonIcon.tsx) is a SMALLER solid
     circle, not an open ring - reproduced at the same relative scale. */
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="6" r="3.5" />
    </svg>
  )
}
