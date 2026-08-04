/* Checkbox skeleton - written from the template's part union (a root that is
   either a real <label> or a plain wrapper, a real native <input
   type="checkbox">, a visual box, and a mark rendered per structure.mark).
   Inherits from no design system.

   THE UNION CHOICE, stated plainly: every column in this build genuinely
   uses a REAL native <input type="checkbox"> as its interactive element —
   confirmed by grep for Salt and M3, reasoned from shadcn's own aria-checked
   selector usage and the linked Radix docs for shadcn (primitives/ was not
   cloned; Radix is behavior-reference only, never a style source per project
   convention). So the chassis always renders one, and drives EVERY
   interaction state (:hover on the root, :focus-visible/:active/:disabled/
   :checked/:indeterminate on the input) with real CSS pseudo-classes rather
   than JS-synced data attributes wherever the platform already provides the
   hook - the same "let the browser do the work it already offers" choice
   Salt's and M3's own source make.

   ONE DECLARED STRUCTURAL SIMPLIFICATION (see CHECKBOX-MATRIX.md's
   'Declared approximations'): M3's real box is THREE independently
   opacity/transform-animated layers (.outline / .background / .icon). This
   chassis collapses them onto ONE box element carrying border-color +
   background-color + color together. The observable end states are
   preserved; the independent fade-in choreography between them is not.

   ONE DECLARED API UNION: valueShape. Salt and M3 expose two independent
   booleans (`checked`, `indeterminate`) SIMULTANEOUSLY, and can receive both
   at once. shadcn/Radix collapses them into one `checked: boolean |
   "indeterminate"` prop, making that combination inexpressible. This
   component accepts BOTH the two-boolean props AND a `value` convenience
   prop matching the tri-value shape (`value` wins when supplied), so every
   column's real API shape is reachable without three different component
   files.

   `indeterminate` has no HTML ATTRIBUTE form, only an IDL/DOM PROPERTY one -
   React cannot set it via JSX, so it is synced imperatively in a
   useLayoutEffect, the same thing Salt's own useIsomorphicLayoutEffect does.
   The input is NEVER conditionally rendered (it is unconditional in every
   column), so there is no dialog-style ref-to-a-later-node hazard here - see
   check-checkbox-behavior.mjs's inverted guard block.

   DECLARED COMPOSITIONS, same convention as badge.tsx/chip.tsx: the external
   label (shadcn/M3) and the form-field wrapper (all three) are rendered as
   neutral placeholders in the harness rather than imported, so this
   component's build stays self-contained.

   Every behavior row in contract/templates/checkbox.template.json is
   implemented below and asserted by scripts/check-checkbox-behavior.mjs. */
import * as React from "react"

export interface CheckboxConfig {
  shell?: string
  markStyle?: string
  group?: boolean
  valueShape?: string
  validation?: string[]
  disabled?: boolean[]
  readOnly?: boolean[]
  required?: boolean[]
}

interface GroupContextValue {
  disabled?: boolean
  readOnly?: boolean
  validation?: string
  name?: string
}

const CheckboxGroupContext = React.createContext<GroupContextValue | undefined>(undefined)

export interface CheckboxProps {
  config: CheckboxConfig
  /* Salt/M3 shape: two independent booleans */
  checked?: boolean
  indeterminate?: boolean
  /* shadcn/Radix shape: one prop, three values. Wins over checked/indeterminate when supplied. */
  value?: boolean | "indeterminate"
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /* Salt-only owned slot - see slot.label */
  label?: React.ReactNode
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /* "off" | "error" | "warning" - see prop.validation */
  validation?: string
  name?: string
  id?: string
  className?: string
  "aria-label"?: string
}

export function Checkbox({
  config,
  checked: checkedProp,
  indeterminate: indeterminateProp,
  value,
  defaultChecked,
  onCheckedChange,
  label,
  disabled,
  readOnly,
  required,
  validation,
  name,
  id,
  className,
  "aria-label": ariaLabel,
}: CheckboxProps) {
  const group = React.useContext(CheckboxGroupContext)

  /* behavior.tri-state / prop.value-shape - the tri-value `value` prop, when
     given, DERIVES the two booleans, reproducing shadcn/Radix's narrower
     contract on top of the two-boolean union without a second component. */
  const derivedChecked = value !== undefined ? value === true : checkedProp
  const derivedIndeterminate = value !== undefined ? value === "indeterminate" : indeterminateProp

  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(Boolean(defaultChecked))
  const isControlled = derivedChecked !== undefined
  const isChecked = isControlled ? Boolean(derivedChecked) : uncontrolledChecked
  const isIndeterminate = Boolean(derivedIndeterminate)

  const inputRef = React.useRef<HTMLInputElement>(null)

  /* `indeterminate` has no HTML attribute form - it must be set as a DOM
     property, imperatively, exactly like Salt's own useIsomorphicLayoutEffect
     (Checkbox.tsx: `inputRef.current.indeterminate = indeterminate ?? false`).
     The input this effect reads is never conditionally rendered - see the
     file banner and check-checkbox-behavior.mjs's inverted ref-effect guard. */
  React.useLayoutEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = isIndeterminate
  }, [isIndeterminate])

  /* behavior.disabled-handling - ORed with the group's, the same merge
     Salt's own Checkbox.tsx performs (`checkboxGroup?.disabled || ...`). */
  const isDisabled = Boolean(disabled ?? false) || Boolean(group?.disabled)
  const isReadOnly = Boolean(readOnly ?? false) || Boolean(group?.readOnly)
  const effectiveName = name ?? group?.name

  /* behavior.validation - computed and SUPPRESSED when disabled, reproducing
     Salt's own `const validationStatus = !disabled ? (...) : undefined`. */
  const rawValidation = validation ?? group?.validation
  const validationMode =
    !isDisabled && rawValidation && rawValidation !== "off" ? rawValidation : undefined

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    /* behavior.readonly - the native `readonly` IDL attribute has no effect
       on type="checkbox" per the WHATWG HTML spec, so this early return IS
       the mechanism (Salt's own handleChange does the identical thing);
       the controlled `checked` prop below snaps the DOM back on re-render. */
    if (isReadOnly) return
    const next = event.target.checked
    if (!isControlled) setUncontrolledChecked(next)
    onCheckedChange?.(next)
  }

  /* structure.mark - three strategies for the same two glyphs. */
  const showMark =
    config.markStyle === "single-icon"
      ? isChecked || isIndeterminate // shadcn: reuses ONE icon for both states
      : config.markStyle === "svg-plus-pseudo-dash"
        ? isChecked && !isIndeterminate // Salt: the dash is a pure CSS ::before, no icon element needed
        : true // "dual-rect" - M3 always renders both <rect>s; CSS drives the shape

  const dataState = isIndeterminate ? "indeterminate" : isChecked ? "checked" : "unchecked"

  const box = (
    <span data-slot="checkbox-box" data-state={dataState}>
      <input
        ref={inputRef}
        data-slot="checkbox-input"
        type="checkbox"
        id={id}
        name={effectiveName}
        checked={isChecked}
        disabled={isDisabled}
        readOnly={isReadOnly || undefined}
        aria-readonly={isReadOnly || undefined}
        aria-label={ariaLabel}
        required={required}
        onChange={handleChange}
      />
      {showMark ? (
        <span data-slot="checkbox-icon" aria-hidden="true">
          {config.markStyle === "dual-rect" ? (
            <svg viewBox="0 0 18 18" aria-hidden="true">
              <rect className="mark short" data-state={dataState} />
              <rect className="mark long" data-state={dataState} />
            </svg>
          ) : (
            <PlaceholderCheckIcon />
          )}
        </span>
      ) : null}
    </span>
  )

  const Root = (config.shell === "label-wrap" ? "label" : "span") as "label" | "span"

  return (
    <Root
      data-slot="checkbox-root"
      data-validation={validationMode}
      className={className}
    >
      {box}
      {config.shell === "label-wrap" && label ? (
        <span data-slot="checkbox-label">{label}</span>
      ) : null}
    </Root>
  )
}

export interface CheckboxGroupProps {
  config: CheckboxConfig
  children: React.ReactNode
  direction?: "horizontal" | "vertical"
  disabled?: boolean
  readOnly?: boolean
  validation?: string
  name?: string
  className?: string
}

/* structure.group - Salt ONLY has a real capability here (config.group is
   true only for Salt's column); every other column renders children
   unwrapped, with no fieldset and no context, matching the confirmed absence
   in both other columns. */
export function CheckboxGroup({
  config,
  children,
  direction = "vertical",
  disabled,
  readOnly,
  validation,
  name,
  className,
}: CheckboxGroupProps) {
  if (!config.group) return <>{children}</>
  return (
    <fieldset data-slot="checkbox-group" data-direction={direction} className={className}>
      <CheckboxGroupContext.Provider value={{ disabled, readOnly, validation, name }}>
        {children}
      </CheckboxGroupContext.Provider>
    </fieldset>
  )
}

/* DECLARED DEFERRAL, same convention as badge.tsx/chip.tsx's PlaceholderIcon:
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
