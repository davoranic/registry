/* Input skeleton — written from the template's part union: a root box, the
   native <input> control, an activation indicator, optional start/end
   adornment containers, and an optional automatic status adornment.
   Inherits from no design system: which parts render, WHERE the chrome
   lives, which edge mechanism draws the boundary, and what an empty
   read-only value shows are all received as config, not hardcoded to any
   one system's answer.

   TWO STRUCTURAL AXES, both real, both config'd — not approximations:

   1. `chrome`. Salt and M3 need a wrapper element: adornments and an
      activation indicator have to sit inside the box beside the text.
      shadcn does not — its input.tsx renders a bare <input> and puts every
      box style on that element. So when chrome === "control" the wrapper
      is given `display: contents` (template base rule) and the generated
      box rules target the <input> itself. shadcn's rendered box model is
      genuinely one element, as it is in source. Wrapping shadcn in a
      styled div would be the box-model version of the tooltip's
      one-rotated-square arrow: invisible in a screenshot, wrong in source.

   2. `indicator`. "underline" is a bottom-only rule that thickens on
      focus; "box" is a full four-sided border. These are DIFFERENT
      MECHANISMS and get different parts, never one bordered box with a
      colour delta. Note which way the split actually falls, because it is
      not the obvious one: Salt's DEFAULT is underline (`bordered` defaults
      to false and .saltInput-activationIndicator is always rendered), and
      that is the same mechanism, with the same 1px -> 2px focus
      thickening, as M3's FILLED text field. Salt-bordered, shadcn and
      M3-outlined are the box side.

   The indicator element is rendered whenever chrome === "wrapper",
   regardless of the active indicator value — mirroring Salt, which always
   renders the div and lets CSS zero its width. That also lets Salt's
   easily-missed bordered+focused rule (the indicator returns at 1px on top
   of the border) be expressed instead of dropped.

   DECLARED COMPOSITIONS, same pattern as calendar.template.json's
   slot.composes: (a) the `field` wrapper — label, help text, necessity
   marker, and Salt's whole form-field context channel — is a separate
   canonical component and is NOT implemented here; (b) adornment content
   composes the registry's `button` and a future icon set; (c) the status
   adornment's glyph belongs to that icon set. All render as neutral
   placeholders rather than importing another component's skeleton, keeping
   this build self-contained. */
import * as React from "react"

export interface InputConfig {
  chrome?: string
  indicator?: string[]
  startAdornment?: boolean
  endAdornment?: boolean
  statusAdornment?: boolean
  emptyReadOnlyMarker?: string
  variant?: string[]
  status?: string[]
  textAlign?: string[]
  disabled?: boolean[]
  readOnly?: boolean[]
}

export interface InputProps {
  config: InputConfig
  indicator?: string
  variant?: string
  status?: string
  textAlign?: string
  disabled?: boolean
  readOnly?: boolean
  value?: string
  defaultValue?: string
  placeholder?: string
  /* Adornments are per-INSTANCE, not per-system: `config.startAdornment`
     says the system HAS the slot, this says this particular instance fills
     it. Conflating the two is the capability-vs-instance bug the button
     build already paid for once (CLAUDE.md, "What this repo contains now"). */
  adornments?: boolean
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
  className?: string
  id?: string
}

function PlaceholderGlyph({ size = 12 }: { size?: number | string }) {
  // DECLARED DEFERRAL, same convention as Calendar's chevrons and Alert's
  // status glyph: a neutral geometric mark standing in for each system's
  // own icon set (Salt's StatusAdornment icons, M3's Material Symbols)
  // until a registry icon component exists.
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <circle cx="6" cy="6" r="5" fill="currentColor" />
    </svg>
  )
}

function PlaceholderAdornment() {
  // Stands in for a composed registry `button` (Salt) or a leading/trailing
  // icon (M3). Deliberately unstyled beyond the generated size rule.
  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: "100%", aspectRatio: "1", opacity: 0.55 }}
    >
      <PlaceholderGlyph size={10} />
    </span>
  )
}

function isEmptyValue(v: string | undefined) {
  return v === undefined || v === ""
}

export function Input({
  config,
  indicator,
  variant,
  status,
  textAlign,
  disabled,
  readOnly,
  value,
  defaultValue,
  placeholder,
  adornments,
  startAdornment,
  endAdornment,
  className,
  id,
}: InputProps) {
  const chrome = config.chrome ?? "wrapper"
  const activeIndicator = indicator ?? config.indicator?.[0]
  const activeVariant = variant ?? config.variant?.[0]
  const activeTextAlign = textAlign ?? config.textAlign?.[0]

  const [focused, setFocused] = React.useState(false)
  const [internal, setInternal] = React.useState(defaultValue ?? "")
  const current = value ?? internal

  const isDisabled = Boolean(disabled)
  const isReadOnly = Boolean(readOnly)

  // Salt's emptyReadOnlyMarker: an empty read-only input shows a marker
  // instead of nothing. A CONTENT-FORMATTING behavior, config'd rather than
  // assumed — a system that does not have it renders empty.
  const marker = config.emptyReadOnlyMarker
  const shown =
    isReadOnly && isEmptyValue(current) && marker ? marker : current

  const showStart =
    Boolean(config.startAdornment) && chrome === "wrapper" && (adornments || startAdornment !== undefined)
  const showEnd =
    Boolean(config.endAdornment) && chrome === "wrapper" && (adornments || endAdornment !== undefined)
  const showStatusAdornment =
    Boolean(config.statusAdornment) && chrome === "wrapper" && Boolean(status) && !isDisabled

  const control = (
    <input
      data-slot="input-control"
      id={id}
      type="text"
      value={shown}
      placeholder={placeholder}
      disabled={isDisabled}
      readOnly={isReadOnly}
      aria-invalid={status === "error" ? true : undefined}
      // Salt writes tabIndex explicitly rather than relying on the native
      // disabled default (behavior.disabled-tabindex).
      tabIndex={isDisabled ? -1 : 0}
      onChange={(e) => setInternal(e.target.value)}
      onFocus={isDisabled ? undefined : () => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )

  return (
    <div
      data-slot="input"
      data-chrome={chrome}
      data-indicator={activeIndicator}
      data-variant={activeVariant}
      data-status={status}
      data-text-align={activeTextAlign}
      data-focused={focused && !isDisabled ? "" : undefined}
      data-disabled={isDisabled ? "" : undefined}
      data-readonly={isReadOnly ? "" : undefined}
      className={className}
    >
      {showStart && (
        <span data-slot="input-start-adornment">
          {startAdornment ?? <PlaceholderAdornment />}
        </span>
      )}
      {control}
      {showStatusAdornment && (
        <span data-slot="input-status-adornment" aria-hidden="true">
          {/* sized by the generated style.status-adornment.size rule (Salt:
              --salt-size-adornment, 6/8/10/12px by density), so the glyph
              fills its box rather than carrying a literal of its own */}
          <PlaceholderGlyph size="100%" />
        </span>
      )}
      {showEnd && (
        <span data-slot="input-end-adornment">
          {endAdornment ?? <PlaceholderAdornment />}
        </span>
      )}
      {chrome === "wrapper" && <span data-slot="input-indicator" aria-hidden="true" />}
    </div>
  )
}
