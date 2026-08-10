/* Combobox skeleton — written from the template's part union: a root, an
   EDITABLE text-input trigger (not a button — the whole reason this is a
   separate component from select), an optional dedicated disclosure-toggle
   button, an optional dedicated clear button, an activation indicator, a
   popup surface, a listbox, optional groups with labels, options, an
   optional selected marker, an optional separator, and an optional dedicated
   empty-state message. Inherits from no design system.

   THE STRUCTURAL DIFFERENCE FROM select.tsx, confirmed real in all three
   systems this session (grep, not assumed): real DOM focus NEVER LEAVES THE
   INPUT. Arrow keys move a "highlighted" option via `aria-activedescendant`
   (virtual focus, the APG combobox pattern's own reason to exist — an input
   that lost focus every keystroke could not be typed into) — options,
   the toggle button and the clear button are all `tabIndex={-1}`. Salt's own
   `ComboBox.tsx` confirms this precisely (`aria-activedescendant`, options
   as `tabIndex={-1}` divs, and `OptionList`'s own onClick handler refocuses
   the input); shadcn's `Combobox` primitive backs this with a real `<input>`
   element rather than a button, the same structural signal.

   FILTERING is a declared, config'd registry default: case-insensitive
   substring match against the option label. NOT invented — see
   COMBOBOX-MATRIX.md's Finding 2: it is the literal algorithm Salt's own
   real `combo-box.stories.tsx` uses when filtering externally (Salt's
   `ComboBox` component itself does NO filtering of its own — the story
   filters before handing the array to the component). shadcn's base-ui
   Combobox filters internally by its own (unvendored, unconfirmable)
   algorithm; this skeleton applies the SAME declared default uniformly so
   the render is checkable across all three columns.

   FOUR STRUCTURAL AXES, all config'd:

   1. `indicator`. Same two-way split select.tsx documents: "underline" is a
      bottom-only rule, "box" is a full four-sided border. Salt's default is
      underline (`ComboBox`'s own `bordered = false`, forwarded to
      `PillInput`, which renders its activation-indicator div
      unconditionally).
   2. `toggleButton`. "swap" (Salt, two different glyphs), "static" (shadcn/
      M3, one glyph never swapped), or `false` (no system currently has
      this, kept for a future column with no disclosure button at all).
   3. `selectedMarker`. Same "check" (shadcn) vs "fill" (Salt/M3) split
      select.tsx documents, for the identical reason (TOOLTIP-MATRIX.md's
      arrow lesson).
   4. `activateOnHover`. Same reasoning select.tsx documents: M3 keeps hover
      (8%) and focus (10%/12%) as separate state layers, so conflating them
      would make the lighter layer unreachable.

   POSITIONING, DECLARED GAP (see docs/COMBOBOX-MATRIX.md
   behavior.positioning-engine): Salt composes `@floating-ui/react` directly;
   shadcn composes base-ui's own `Positioner`. Neither is reimplemented here.
   This component uses a plain absolutely-positioned popup, measuring the
   trigger field to publish `--combobox-trigger-width` (the same inline
   mechanism select.tsx already uses, renamed) — no collision detection, no
   flip-to-fit, no viewport clamp.

   `structure.popup-anchor` is BELOW for all three columns here (a real
   divergence from select, whose shadcn column defaults to an item-aligned
   overlay mode) — see COMBOBOX-MATRIX.md Finding 3. No overlay branch is
   implemented; the popup is always positioned below the trigger field.

   DECLARED COMPOSITIONS, same pattern as select.template.json's
   slot.composes: (a) the `field` wrapper; (b) an icon set (the toggle
   glyph, the clear-button X, the checkmark); (c) the floating-position
   engine above; (d) for M3, the standalone `menu` component. All render as
   neutral placeholders.

   MULTISELECT (pills/chips) is DECLARED OUT OF SCOPE — see
   COMBOBOX-MATRIX.md's scope note. This skeleton is single-select only. */
import * as React from "react"

export interface ComboboxConfig {
  indicator?: string[]
  toggleButton?: string | false
  clearButton?: boolean
  selectedMarker?: string
  activateOnHover?: boolean
  group?: boolean
  separator?: boolean
  emptyState?: boolean
  emptyReadOnlyMarker?: string
  variant?: string[]
  status?: string[]
  disabled?: boolean[]
  readOnly?: boolean[]
  placeholder?: boolean
}

export interface ComboboxOptionModel {
  value: string
  label: string
  disabled?: boolean
}

export interface ComboboxGroupModel {
  label: string
  options: ComboboxOptionModel[]
}

export interface ComboboxProps {
  config: ComboboxConfig
  /** flat option list; used when `groups` is not supplied */
  options?: ComboboxOptionModel[]
  /** grouped option list; only rendered as groups where config.group is on */
  groups?: ComboboxGroupModel[]
  indicator?: string
  variant?: string
  status?: string
  disabled?: boolean
  readOnly?: boolean
  defaultValue?: string
  /** seeds the typed query directly, overriding the defaultValue-derived
      label — used by the harness to exercise the empty-state branch with a
      query that matches nothing, without faking the branch with a prop. */
  initialQuery?: string
  placeholder?: string
  emptyStateText?: string
  /** harness affordance: force the popup open so option states are visible
      without interaction. Not a design-system prop. */
  forceOpen?: boolean
  className?: string
  id?: string
}

function ChevronGlyph({ open }: { open: boolean }) {
  /* DECLARED DEFERRAL, same convention as select.tsx's ChevronGlyph: a
     neutral geometric mark standing in for each system's own icon set. The
     UP form is only ever reached when config.toggleButton === "swap"
     (Salt alone). */
  return (
    <svg viewBox="0 0 12 12" width="100%" height="100%" aria-hidden="true" focusable="false">
      <path
        d={open ? "M2.5 7.5 L6 4 L9.5 7.5" : "M2.5 4.5 L6 8 L9.5 4.5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 12 12" width="100%" height="100%" aria-hidden="true" focusable="false">
      <path d="M2.5 6.5 L5 9 L9.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ClearGlyph() {
  return (
    <svg viewBox="0 0 12 12" width="100%" height="100%" aria-hidden="true" focusable="false">
      <path d="M2.5 2.5 L9.5 9.5 M9.5 2.5 L2.5 9.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function flatten(groups: ComboboxGroupModel[] | undefined, options: ComboboxOptionModel[] | undefined) {
  if (groups) return groups.flatMap((g) => g.options)
  return options ?? []
}

/* behavior.registry-filter-default: case-insensitive substring match — the
   literal algorithm Salt's own real combo-box.stories.tsx uses when
   filtering externally (see the file header comment and
   COMBOBOX-MATRIX.md Finding 2). Applied uniformly across all three
   columns so the render is checkable. */
function matches(label: string, query: string) {
  if (!query.trim()) return true
  return label.toLowerCase().includes(query.trim().toLowerCase())
}

export function Combobox({
  config,
  options,
  groups,
  indicator,
  variant,
  status,
  disabled,
  readOnly,
  defaultValue,
  initialQuery,
  placeholder,
  emptyStateText,
  forceOpen,
  className,
  id,
}: ComboboxProps) {
  const activeIndicator = indicator ?? config.indicator?.[0]
  const activeVariant = variant ?? config.variant?.[0]
  const marker = config.selectedMarker ?? "fill"
  const swapsIcon = config.toggleButton === "swap"
  const hasToggleButton = Boolean(config.toggleButton)
  const activateOnHover = config.activateOnHover !== false

  const isDisabled = Boolean(disabled)
  const isReadOnly = Boolean(readOnly)

  const flat = flatten(groups, options)
  const initialSelected = defaultValue !== undefined ? flat.find((o) => o.value === defaultValue) : undefined

  const [open, setOpen] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [focusVisible, setFocusVisible] = React.useState(false)
  const [selected, setSelected] = React.useState<string | undefined>(defaultValue)
  const [active, setActive] = React.useState<string | undefined>(defaultValue)
  const [query, setQuery] = React.useState(initialQuery ?? (initialSelected ? initialSelected.label : ""))
  const [triggerWidth, setTriggerWidth] = React.useState<number | undefined>(undefined)

  const triggerRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const popupRef = React.useRef<HTMLDivElement | null>(null)

  // Salt's readOnly is more than a style: it suppresses opening entirely
  // and the trigger's own `role` attribute flips (see
  // COMBOBOX-MATRIX.md Finding 6). Gated on the system HAVING a readOnly
  // capability at all, so a column with no read-only concept never
  // inherits Salt's suppression.
  const hasReadOnly = Boolean(config.readOnly)
  const canOpen = !isDisabled && !(isReadOnly && hasReadOnly)

  const filtered = flat.filter((o) => matches(o.label, query))
  const filteredValues = new Set(filtered.map((o) => o.value))
  const enabled = filtered.filter((o) => !o.disabled)
  const isOpen = (open || Boolean(forceOpen)) && canOpen

  // behavior.dismiss-outside — the same proven pattern select.tsx/
  // popover.tsx/dropdown-menu.tsx already carry: a capture-phase
  // pointerdown listener, so a press starting outside closes immediately.
  React.useEffect(() => {
    if (!isOpen || forceOpen) return
    const onPointerDown = (e: Event) => {
      const t = e.target as Node | null
      if (!t) return
      if (triggerRef.current?.contains(t) || popupRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    return () => document.removeEventListener("pointerdown", onPointerDown, true)
  }, [isOpen, forceOpen])

  React.useLayoutEffect(() => {
    if (triggerRef.current) setTriggerWidth(triggerRef.current.offsetWidth)
  }, [isOpen, query])

  const showClear = Boolean(config.clearButton) && query.length > 0 && !isDisabled && !isReadOnly
  const showEmptyState = Boolean(config.emptyState) && isOpen && filtered.length === 0

  // Salt's emptyReadOnlyMarker: an empty read-only control shows a marker
  // instead of nothing, identical mechanism to select.tsx.
  const emptyMarker = config.emptyReadOnlyMarker
  const showAsEmptyReadOnly = isReadOnly && emptyMarker !== undefined && query === ""
  const displayValue = showAsEmptyReadOnly ? emptyMarker : query

  function commit(option: ComboboxOptionModel) {
    setSelected(option.value)
    setActive(option.value)
    setQuery(option.label)
    setOpen(false)
    inputRef.current?.focus()
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isReadOnly) return
    const value = e.target.value
    setQuery(value)
    if (!open) setOpen(true)
    if (value === "") setActive(undefined)
  }

  function move(delta: number) {
    if (enabled.length === 0) return
    const current = enabled.findIndex((o) => o.value === active)
    const next = current < 0 ? (delta > 0 ? 0 : enabled.length - 1) : Math.min(Math.max(current + delta, 0), enabled.length - 1)
    setActive(enabled[next].value)
    setFocusVisible(true)
  }

  // behavior.focus-model: real DOM focus NEVER leaves the input — every
  // key handler here operates on aria-activedescendant / the `active`
  // state, never on document.activeElement. See the file header comment.
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (isDisabled || !canOpen) return
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault()
      setOpen(true)
      setFocusVisible(true)
      return
    }
    if (!open) return
    if (e.key === "ArrowDown") { e.preventDefault(); move(1) }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1) }
    else if (e.key === "Home") { e.preventDefault(); if (enabled[0]) { setActive(enabled[0].value); setFocusVisible(true) } }
    else if (e.key === "End") { e.preventDefault(); const last = enabled[enabled.length - 1]; if (last) { setActive(last.value); setFocusVisible(true) } }
    else if (e.key === "Enter") {
      e.preventDefault()
      const activeOption = enabled.find((o) => o.value === active)
      if (activeOption) commit(activeOption)
    } else if (e.key === "Escape") {
      e.preventDefault()
      setOpen(false)
    }
  }

  function renderOption(o: ComboboxOptionModel) {
    if (!filteredValues.has(o.value)) return null
    const isSelected = o.value === selected
    const isActive = o.value === active && !o.disabled
    return (
      <div
        key={o.value}
        data-slot="combobox-option"
        role="option"
        id={`${id ?? "combobox"}-opt-${o.value}`}
        aria-selected={isSelected}
        aria-disabled={o.disabled ? true : undefined}
        data-selected={isSelected ? "" : undefined}
        data-active={isActive ? "" : undefined}
        data-focus-visible={isActive && focusVisible ? "" : undefined}
        data-disabled={o.disabled ? "" : undefined}
        tabIndex={-1}
        onMouseOver={() => {
          if (o.disabled) return
          // config'd, not assumed: Salt's Option.handleMouseOver calls
          // setActive; base-ui's own data-highlighted styling implies the
          // same pointer-move behaviour. M3 keeps hover and focus separate,
          // so this branch is off for M3 and its 8% hover layer stays
          // reachable.
          if (activateOnHover) { setActive(o.value); setFocusVisible(false) }
        }}
        onClick={() => { if (!o.disabled) commit(o) }}
      >
        <span>{o.label}</span>
        {marker === "check" && isSelected && (
          <span data-slot="combobox-option-marker">
            <CheckGlyph />
          </span>
        )}
      </div>
    )
  }

  const listContent = groups
    ? groups.map((g, gi) => (
        <React.Fragment key={g.label}>
          {config.separator && gi > 0 && <div data-slot="combobox-separator" role="presentation" />}
          {config.group ? (
            <div data-slot="combobox-group" role="group" aria-label={g.label}>
              <div data-slot="combobox-group-label" aria-hidden="true">{g.label}</div>
              {g.options.map(renderOption)}
            </div>
          ) : (
            /* a system with no group part still renders the options — the
               grouping simply disappears, matching M3's own confirmed
               absence, the same shape select.tsx already established. */
            <React.Fragment>{g.options.map(renderOption)}</React.Fragment>
          )}
        </React.Fragment>
      ))
    : (options ?? []).map(renderOption)

  return (
    <div
      data-slot="combobox"
      data-indicator={activeIndicator}
      data-variant={activeVariant}
      data-status={status}
      className={className}
    >
      <div
        ref={triggerRef}
        data-slot="combobox-field"
        data-focused={focused && !isDisabled ? "" : undefined}
        data-disabled={isDisabled ? "" : undefined}
        data-readonly={isReadOnly ? "" : undefined}
        data-open={isOpen ? "" : undefined}
      >
        <input
          ref={inputRef}
          data-slot="combobox-input"
          type="text"
          id={id}
          role={isReadOnly && hasReadOnly ? "textbox" : "combobox"}
          disabled={isDisabled}
          readOnly={isReadOnly}
          aria-expanded={!(isReadOnly && hasReadOnly) ? isOpen : undefined}
          aria-readonly={isReadOnly ? "true" : undefined}
          aria-invalid={status === "error" ? true : undefined}
          aria-autocomplete="list"
          aria-activedescendant={isOpen && active ? `${id ?? "combobox"}-opt-${active}` : undefined}
          data-placeholder={displayValue === "" ? "" : undefined}
          placeholder={config.placeholder ? placeholder : undefined}
          value={displayValue}
          tabIndex={isDisabled ? -1 : 0}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          onFocus={isDisabled ? undefined : () => { setFocused(true); if (canOpen) setOpen(true) }}
          onBlur={() => setFocused(false)}
        />
        {showClear && (
          <button
            type="button"
            data-slot="combobox-clear-button"
            aria-label="Clear"
            tabIndex={-1}
            onClick={() => {
              setQuery("")
              setSelected(undefined)
              setActive(undefined)
              inputRef.current?.focus()
            }}
          >
            <ClearGlyph />
          </button>
        )}
        {hasToggleButton && (
          <button
            type="button"
            data-slot="combobox-toggle-button"
            aria-label="Show options"
            aria-expanded={isOpen}
            tabIndex={-1}
            disabled={isDisabled}
            onClick={() => { if (canOpen) { setOpen((v) => !v); inputRef.current?.focus() } }}
          >
            <ChevronGlyph open={swapsIcon ? isOpen : false} />
          </button>
        )}
        {/* rendered regardless of the active indicator value, mirroring
            select.tsx, which mirrors Salt's own always-rendered div */}
        <span data-slot="combobox-indicator" aria-hidden="true" />
      </div>

      {isOpen && (
        <div
          ref={popupRef}
          data-slot="combobox-popup"
          style={{
            // the same inline mechanism select.tsx uses (mirroring Salt's
            // own floating-ui size() middleware, and shadcn's own base-ui
            // Positioner --anchor-width variable)
            ["--combobox-trigger-width" as string]: triggerWidth ? `${triggerWidth}px` : undefined,
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {showEmptyState ? (
            <div data-slot="combobox-empty">{emptyStateText ?? "No items found."}</div>
          ) : (
            <div data-slot="combobox-listbox" role="listbox" aria-label="options">
              {listContent}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
