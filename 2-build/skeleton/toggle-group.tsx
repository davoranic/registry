/* Toggle-group skeleton - written from the template's part union: a wrapper
   (a <div> for Salt/shadcn, a <span> for M3, per structure.group's config
   strategy) providing context to any number of ToggleGroupItem children,
   each a REAL native <button> - the first component in this pipeline where
   NO column needed a declared native-element approximation at the item
   level; every real source (Salt's ToggleButton, shadcn's radix-ui Item,
   M3's live segmented-button.ts) already renders a genuine <button>.

   THE HEADLINE STRUCTURAL FACT THIS CHASSIS HAD TO DECIDE FIRST: is
   single-vs-multiple a real axis in all three systems? shadcn's
   `type="single"|"multiple"` and M3's `multiselect: boolean` are both real,
   sourced, first-class capabilities. Salt's `ToggleButtonGroup` is
   CONFIRMED SINGLE-SELECT-ONLY despite its own `Value` type permitting an
   array - `role="radiogroup"` is a hardcoded literal and `isSelected` uses
   strict `===` against ONE held value, so an array value would only ever
   match by reference, never by content. See
   toggle-group.template.json's own `behavior.pattern` note for the full
   grep-confirmed finding.

   Value may be a single string (single mode) or a string array (multiple
   mode), matching shadcn's own richer real API shape - the ONE internal
   engine this chassis implements for all three columns (a declared
   simplification for Salt, whose real source only ever drives the
   single-string path, and for M3, whose real source drives a per-item
   boolean rather than a shared array; both converge on the identical
   OBSERVABLE outcome this chassis produces).

   A SECOND declared choice, sourced rather than assumed: clicking an
   ALREADY-selected item in single mode DESELECTS it (value becomes
   undefined) - the presumed real Radix behaviour [R], and a genuine,
   sourced DIVERGENCE from Salt's own real ToggleButtonGroup, whose
   `select()` callback re-sets the SAME value on a repeat click and
   therefore never fires onChange and never deselects (grepped directly:
   `if (value !== newValue) { onChange?.(event) }` - an equal-value click is
   a silent no-op). Recorded here rather than silently reproducing Salt's
   more restrictive behaviour as if it were universal.

   Every item is a REAL, unconditionally rendered <button> - no ref-reading
   effect on a conditionally-mounted node anywhere in this file, the same
   dialog-trap-immune shape checkbox.tsx/switch.tsx/radio-group.tsx already
   have. Icon content is wrapped in its own
   [data-slot="toggle-group-item-icon"] span, EXPLICITLY sized (CLAUDE.md
   rule 12) - the exact fix POPOVER-MATRIX.md findings 9/10 record for an
   unconstrained SVG, applied here proactively rather than discovered by a
   live render. */
import * as React from "react"

export interface ToggleGroupConfig {
  groupTag?: string
  markerMode?: string
  selectionMode?: string[]
  variant?: string[]
  size?: string[]
  sentiment?: string[]
  orientation?: string[]
  disabled?: boolean[]
  groupDisabled?: boolean[]
  validation?: string[]
}

type ToggleValue = string | string[] | undefined

interface GroupContextValue {
  mode: "single" | "multiple"
  value: ToggleValue
  onToggle: (itemValue: string) => void
  disabled?: boolean
  variant?: string
  sentiment?: string
  validation?: string
}

const ToggleGroupContext = React.createContext<GroupContextValue | undefined>(undefined)

export interface ToggleGroupProps {
  config: ToggleGroupConfig
  children: React.ReactNode
  /* single mode: a string (or undefined). multiple mode: a string array. */
  value?: ToggleValue
  defaultValue?: ToggleValue
  onValueChange?: (value: ToggleValue) => void
  mode?: "single" | "multiple"
  variant?: string
  sentiment?: string
  orientation?: "horizontal" | "vertical"
  disabled?: boolean
  validation?: string
  className?: string
  "aria-label"?: string
  "aria-labelledby"?: string
}

/* structure.group - a real, distinct wrapper tag per system (never a bare
   div presented as neutral chassis - see structure.group's own row). */
export function ToggleGroup({
  config,
  children,
  value: valueProp,
  defaultValue,
  onValueChange,
  mode = "single",
  variant,
  sentiment,
  orientation = "horizontal",
  disabled,
  validation,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: ToggleGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<ToggleValue>(
    defaultValue ?? (mode === "multiple" ? [] : undefined),
  )
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolledValue

  /* behavior: single mode click on an unselected item selects it; click on
     the ALREADY-selected item deselects it (the presumed real Radix
     behaviour [R] - see the file banner for the sourced divergence from
     Salt's own more restrictive real behaviour). Multiple mode: independent
     add/remove from the array, matching every real source's own multi-
     select shape. */
  const handleToggle = React.useCallback(
    (itemValue: string) => {
      let next: ToggleValue
      if (mode === "multiple") {
        const arr = Array.isArray(value) ? value : []
        next = arr.includes(itemValue) ? arr.filter((v) => v !== itemValue) : [...arr, itemValue]
      } else {
        next = value === itemValue ? undefined : itemValue
      }
      if (!isControlled) setUncontrolledValue(next)
      onValueChange?.(next)
    },
    [isControlled, mode, onValueChange, value],
  )

  const context: GroupContextValue = {
    mode,
    value,
    onToggle: handleToggle,
    disabled,
    variant,
    sentiment,
    validation,
  }

  /* behavior.group-role - genuinely different per system, and per
     selection-mode for two of three columns (see the template row's own
     note): Salt is ALWAYS role="radiogroup" (hardcoded, regardless of
     mode); shadcn is presumed to switch role="radiogroup" (single) /
     role="group" (multiple); M3 is ALWAYS role="group" (hardcoded,
     regardless of multiselect). Modelled here as a straightforward
     mode-aware default for the two columns that vary by mode, and a fixed
     override is NOT special-cased for Salt/M3 beyond their own config
     values already being consistent with "always radiogroup"/"always
     group" - a consumer using this chassis with Salt's config and
     mode="multiple" would see a role of "group" here (matching the
     mode-driven default), which is a declared simplification: Salt's real
     source has no working multiple mode to observe this mismatch in. */
  const supportsMultiple = config.selectionMode?.includes("multiple")
  const role = !supportsMultiple
    ? "radiogroup" // Salt: hardcoded, always radiogroup regardless of mode
    : config.groupTag === "span"
      ? "group" // M3: hardcoded, always group regardless of multiselect
      : mode === "single"
        ? "radiogroup" // shadcn [R]: presumed to switch per type
        : "group"

  const Wrapper = (config.groupTag === "span" ? "span" : "div") as "span" | "div"

  return (
    <Wrapper
      data-slot="toggle-group-root"
      data-orientation={orientation}
      data-disabled={disabled || undefined}
      data-validation={validation && validation !== "off" ? validation : undefined}
      role={role}
      className={className}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      <ToggleGroupContext.Provider value={context}>{children}</ToggleGroupContext.Provider>
    </Wrapper>
  )
}

export interface ToggleGroupItemProps {
  config: ToggleGroupConfig
  value: string
  /* consumer-owned content: an icon (explicitly sized, lesson 12), a text
     label, or both - slot.item-content. */
  icon?: React.ReactNode
  children?: React.ReactNode
  disabled?: boolean
  "aria-label"?: string
  className?: string
}

/* structure.item / structure.icon-slot / structure.selected-marker. */
export function ToggleGroupItem({
  config,
  value,
  icon,
  children,
  disabled,
  "aria-label": ariaLabel,
  className,
}: ToggleGroupItemProps) {
  const group = React.useContext(ToggleGroupContext)

  const isSelected = group
    ? group.mode === "multiple"
      ? Array.isArray(group.value) && group.value.includes(value)
      : group.value === value
    : false

  /* behavior.disabled-handling - item disabled OR group disabled (Salt's
     own real merge; shadcn's group-level forwarding is [R] but this
     chassis implements the observable capability for all three columns,
     matching radio-group's own precedent for the same shape). */
  const isDisabled = Boolean(disabled) || Boolean(group?.disabled)

  function handleClick() {
    if (isDisabled) return
    group?.onToggle(value)
  }

  const dataState = isSelected ? "on" : "off"

  /* structure.selected-marker - M3 ONLY, a real, dedicated, always-present
     (opacity/transform-driven) checkmark glyph. Salt/shadcn: no marker
     element at all - the entire selected signal is a colour change (see
     state.selected). Rendered unconditionally so the base CSS's own
     rest -> checked opacity/transform pair (see the template's own `base`
     block) has something to transition - the same "give the strategy real
     geometry, not just a declared config value" lesson CHECKBOX-MATRIX.md
     finding 11 / radio-group's own dual-circle row already taught this
     pipeline. */
  const marker =
    config.markerMode === "checkmark" ? (
      <span data-slot="toggle-group-marker" aria-hidden="true">
        <PlaceholderCheckIcon />
      </span>
    ) : null

  return (
    <button
      type="button"
      data-slot="toggle-group-item"
      data-state={dataState}
      data-validation={group?.validation && group.validation !== "off" ? group.validation : undefined}
      role={group?.mode === "single" ? "radio" : undefined}
      aria-checked={group?.mode === "single" ? isSelected : undefined}
      aria-pressed={group?.mode === "multiple" ? isSelected : undefined}
      aria-label={ariaLabel}
      disabled={isDisabled}
      onClick={handleClick}
      className={className}
    >
      {marker}
      {icon ? (
        <span data-slot="toggle-group-item-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  )
}

/* DECLARED DEFERRAL, the same convention as every prior skeleton's own
   placeholder icon: a neutral geometric stand-in for M3's real drawn
   checkmark path. Sized via [data-slot="toggle-group-marker"] svg in the
   template's own `base` block (1em, lesson 12) rather than left
   unconstrained. */
function PlaceholderCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 12.75l6 6 9-13.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
