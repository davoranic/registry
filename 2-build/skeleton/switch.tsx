/* Switch skeleton - written from the template's part union (a root that is
   either a real <label> or a plain wrapper, a real native <input
   type="checkbox" role="switch">, a track <span>, and a thumb <span> nested
   inside the track carrying an optional icon per structure.icon). Inherits
   from no design system.

   DOM SHAPE, chosen DELIBERATELY BEFORE writing a single selector, per
   CLAUDE.md rule 12 and CHECKBOX-MATRIX.md findings 10/11 (a wrong
   combinator silently killed seven rules in checkbox's first draft, and no
   gate caught it). <input> and <track> are rendered as SIBLINGS, both direct
   children of <root> - this matches Salt's and M3's REAL DOM exactly (both
   sourced clones confirm input-then-track as siblings, never parent/child),
   and is a declared, reasonable approximation for shadcn (whose real Root
   fuses track-styling onto the interactive element itself - see
   structure.track). EVERY conditional style rule in switch.template.json
   anchors its :has() at the ROOT - `[data-slot="switch-root"]:has([data-slot
   ="switch-input"]:STATE) [data-slot="switch-TARGET"]` - never assuming
   input and its target are adjacent siblings or that one wraps the other.
   This is invariant to DOM shape by construction: root is the one ancestor
   guaranteed to contain both input and every visual part as descendants, so
   the selector cannot silently fail to match the way an adjacent-sibling
   combinator can when the assumed shape turns out wrong. See
   switch.template.json's behavior.chassis note for the full reasoning and
   an explicit caveat: this session had no headless browser available to
   verify with getComputedStyle (network-sandboxed; Playwright/Puppeteer
   Chromium download both failed) - the selector logic was hand-traced
   against the DOM this file actually renders, not confirmed live.

   THE ONE DECLARED STRUCTURAL SIMPLIFICATION: M3's real slide mechanism is a
   separate `.handle-container` wrapper around the handle, whose OWN
   `margin-inline-start/-end` moves as a group (with a ripple element also
   inside it). This chassis collapses handle-container onto the thumb
   element itself, applying the margin directly - the observable slide
   distance and easing are preserved, the extra wrapper and its independent
   ripple layer are not (see 'Declared approximations' in the matrix doc).

   NO TRI-STATE HERE, unlike checkbox: none of the three systems give switch
   an indeterminate concept (prop.checked-shape - a plain boolean
   everywhere), so there is no useLayoutEffect, no ref-reading effect, no
   dialog-trap hazard anywhere in this file - the input is unconditionally
   rendered in every branch of every column, matching checkbox's own
   dialog-trap-immune shape for the identical reason.

   DECLARED COMPOSITIONS, same convention as checkbox.tsx: the external label
   (shadcn/M3) and the form-field wrapper (all three) are rendered as neutral
   placeholders in the harness rather than imported. */
import * as React from "react"

export interface SwitchConfig {
  shell?: string
  iconMode?: string
  enterActivates?: boolean
  disabled?: boolean[]
  readOnly?: boolean[]
  required?: boolean[]
  size?: string[]
  icons?: boolean[]
}

export interface SwitchProps {
  config: SwitchConfig
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /* Salt-only owned slot - see slot.label */
  label?: React.ReactNode
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /* shadcn-only axis - see prop.size */
  size?: "default" | "sm"
  name?: string
  id?: string
  className?: string
  "aria-label"?: string
}

export function Switch({
  config,
  checked: checkedProp,
  defaultChecked,
  onCheckedChange,
  label,
  disabled,
  readOnly,
  required,
  size,
  name,
  id,
  className,
  "aria-label": ariaLabel,
}: SwitchProps) {
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(Boolean(defaultChecked))
  const isControlled = checkedProp !== undefined
  const isChecked = isControlled ? Boolean(checkedProp) : uncontrolledChecked

  /* behavior.disabled-handling / behavior.readonly - Switch has no group
     construct anywhere (structure.group does not exist as a row - CONFIRMED
     ABSENCE in all three columns), so unlike CheckboxGroup there is nothing
     to OR-merge here; disabled/readOnly are read straight off props. */
  const isDisabled = Boolean(disabled ?? false)
  const isReadOnly = Boolean(readOnly ?? false)

  /* behavior.keyboard-activation - M3 explicitly adds Enter as a SECOND
     activation key (config.enterActivates=true), reproducing the guarded
     keydown-to-click delegation `internal/switch.ts`'s constructor performs
     (`if (ignoreEvent || this.disabled || !this.input) return; this.input
     .click()`). Salt and this chassis's shadcn approximation leave
     enterActivates=false — native Space-only <input> semantics, untouched. */
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (config.enterActivates && event.key === "Enter" && !isDisabled) {
      event.currentTarget.click()
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    /* behavior.readonly - the native readonly IDL attribute has no effect on
       type="checkbox" inputs (WHATWG HTML spec), so this early return IS the
       mechanism, byte-identical in shape to Salt's own handleChange guard
       (`if (event.nativeEvent.defaultPrevented || readOnly) { return }`) and
       to checkbox.tsx's own identical guard. */
    if (isReadOnly) return
    const next = event.target.checked
    if (!isControlled) setUncontrolledChecked(next)
    onCheckedChange?.(next)
  }

  /* structure.icon - three strategies. Salt shows an icon ONLY when checked
     (and not read-only); M3's icon pair is opt-in via config.icons,
     defaulting off; shadcn never shows one. */
  const showIcon =
    config.iconMode === "conditional-checkmark"
      ? isChecked && !isReadOnly
      : config.iconMode === "optional-pair"
        ? Boolean(config.icons?.includes(true)) && isChecked
        : false

  const dataState = isChecked ? "checked" : "unchecked"
  const effectiveSize = size ?? (config.size?.[0] as "default" | "sm" | undefined) ?? "default"

  const thumb = (
    <span data-slot="switch-thumb" data-state={dataState} data-size={effectiveSize}>
      {showIcon ? (
        <span data-slot="switch-icon" aria-hidden="true">
          <PlaceholderCheckIcon />
        </span>
      ) : null}
    </span>
  )

  const track = (
    <span data-slot="switch-track" data-state={dataState}>
      {thumb}
    </span>
  )

  const Root = (config.shell === "label-wrap" ? "label" : "span") as "label" | "span"

  return (
    <Root
      data-slot="switch-root"
      data-state={dataState}
      data-size={effectiveSize}
      data-readonly={isReadOnly || undefined}
      className={className}
    >
      <input
        data-slot="switch-input"
        type="checkbox"
        role="switch"
        id={id}
        name={name}
        checked={isChecked}
        disabled={isDisabled}
        readOnly={isReadOnly || undefined}
        aria-readonly={isReadOnly || undefined}
        aria-label={ariaLabel}
        required={required}
        data-size={effectiveSize}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {track}
      {config.shell === "label-wrap" && label ? (
        <span data-slot="switch-label">{label}</span>
      ) : null}
    </Root>
  )
}

/* DECLARED DEFERRAL, same convention as checkbox.tsx's PlaceholderCheckIcon:
   a neutral geometric shape standing in for each system's own icon set. */
function PlaceholderCheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.2 L5 8.7 L9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
