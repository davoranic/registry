/* Select skeleton — written from the template's part union: a root, a
   trigger, an optional start adornment, the value/placeholder text, an
   optional automatic status adornment, a disclosure toggle icon, an
   activation indicator, a popup surface, a listbox, optional groups with
   labels, options, an optional selected marker and an optional separator.
   Inherits from no design system: which parts render, which edge mechanism
   draws the trigger's boundary, WHERE the popup lands, HOW a selected
   option is marked, whether the pointer moves the active option, and what
   an empty read-only value shows are all received as config.

   FOUR STRUCTURAL AXES, all real, all config'd — none of them a colour
   delta dressed up as a difference:

   1. `indicator`. "underline" is a bottom-only rule that thickens on
      focus; "box" is a full four-sided border. Salt's DEFAULT is underline
      (Dropdown.tsx `bordered = false`, and .saltDropdown-activationIndicator
      is rendered unconditionally), which is the same mechanism as M3's
      FILLED select. shadcn is box-only. The indicator element is rendered
      regardless of the active value, mirroring Salt, so Salt's
      easily-missed bordered+focused rule (the indicator returns at 1px on
      top of the border) can be expressed instead of dropped.

   2. `popupAnchor`. "below" places the popup under the trigger, left edges
      aligned (Salt: floating-ui placement "bottom-start" with offset(1)).
      "overlay" places it so the SELECTED option lands on the trigger
      (shadcn: Radix's default position="item-aligned"). These are
      different placements, not different offsets, and the difference is
      visible the moment a non-first option is selected.

   3. `selectedMarker`. "check" renders a trailing checkmark and leaves the
      option's background alone (shadcn — there is no data-[state=checked]
      class anywhere in select.tsx). "fill" renders no glyph and marks the
      option with a background (Salt's accent-weaker + box-shadow bracket,
      M3's surface-container-highest). Drawing a check for all three would
      be wrong for two of them; filling for all three would be wrong for
      shadcn. This is TOOLTIP-MATRIX.md's arrow lesson applied to selection.

   4. `activateOnHover`. Salt's Option calls setActive on mouseOver and
      Radix focuses the item on pointermove, so in both live systems the
      pointer moves the ACTIVE option. M3 keeps hover (state layer 8%) and
      focus (state layer 10%) as separate states with different opacities,
      so conflating them there would make the 8% layer unreachable — the
      dead-value bug ALERT-MATRIX.md finding 10 was about.

   POSITIONING, DECLARED GAP (see docs/SELECT-MATRIX.md
   behavior.positioning-engine): the three real systems each compose a real
   floating-position engine — Salt uses @floating-ui/react directly
   (offset/size/flip middleware, with size() writing --overlay-minWidth and
   --overlay-maxHeight onto the floating element), shadcn composes Radix's
   own Popper primitive (which publishes --radix-select-trigger-width and
   --radix-select-content-available-height). Reimplementing either is out
   of scope for a phase-2 validation skeleton. This component instead uses
   a plain absolutely-positioned popup inside the select root, measures the
   trigger to publish --select-trigger-width (the same inline mechanism
   Salt's size() middleware uses), and offsets the popup upward by the
   selected option's row for popupAnchor="overlay". There is NO collision
   detection, NO flip-to-fit, NO shift-to-stay-on-screen and no
   available-height clamp. Declared, not silent.

   DECLARED COMPOSITIONS, same pattern as calendar.template.json's
   slot.composes: (a) the `field` wrapper — label, help text, necessity
   marker, and Salt's whole form-field context channel — is a separate
   canonical component and is NOT implemented here; (b) the icon set, for
   the disclosure chevron (both glyphs, since Salt swaps them), the status
   glyph and shadcn's checkmark; (c) the floating-position engine above;
   (d) in M3's case the standalone `menu` component, which its own
   hand-authored token file says the select composes. All render as neutral
   placeholders rather than importing another component's skeleton.

   ONE MORE DECLARED BOUNDARY: the popup surface and the option are
   modelled here as PARTS OF SELECT. docs/COMPONENTS.md has separate
   `popover`, `dropdown-menu` and `list` rows, and Salt's own
   Option/OptionList/OptionGroup are shared components. If those are later
   split out, every select-popup / select-option / select-group /
   select-separator part below migrates with them. */
import * as React from "react"

export interface SelectConfig {
  indicator?: string[]
  size?: string[]
  startAdornment?: boolean
  statusAdornment?: boolean
  toggleIcon?: string
  selectedMarker?: string
  popupAnchor?: string
  activateOnHover?: boolean
  group?: boolean
  separator?: boolean
  emptyReadOnlyMarker?: string
  variant?: string[]
  status?: string[]
  disabled?: boolean[]
  readOnly?: boolean[]
}

export interface SelectOptionModel {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectGroupModel {
  label: string
  options: SelectOptionModel[]
}

export interface SelectProps {
  config: SelectConfig
  /** flat option list; used when `groups` is not supplied */
  options?: SelectOptionModel[]
  /** grouped option list; only rendered as groups where config.group is on */
  groups?: SelectGroupModel[]
  /** render a separator between groups where config.separator is on */
  indicator?: string
  size?: string
  variant?: string
  status?: string
  disabled?: boolean
  readOnly?: boolean
  defaultValue?: string
  placeholder?: string
  /** harness affordance: force the popup open so option states are visible
      without interaction. Not a design-system prop. */
  forceOpen?: boolean
  /** per-INSTANCE, not per-system: config.startAdornment says the system HAS
      the slot, this says this particular instance fills it. Conflating the
      two is the capability-vs-instance bug the button build already paid
      for once (CLAUDE.md, "What this repo contains now"). */
  adornments?: boolean
  startAdornment?: React.ReactNode
  className?: string
  id?: string
}

function ChevronGlyph({ open }: { open: boolean }) {
  /* DECLARED DEFERRAL, same convention as Calendar's chevrons and Input's
     status glyph: a neutral geometric mark standing in for each system's
     own icon set (Salt's semantic-icon-provider Expand/CollapseIcon,
     shadcn's lucide ChevronDown, M3's Material Symbols) until a registry
     icon component exists. The UP form is only ever reached when
     config.toggleIcon === "swap", which is Salt alone. */
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

function PlaceholderGlyph() {
  return (
    <svg viewBox="0 0 12 12" width="100%" height="100%" aria-hidden="true" focusable="false">
      <circle cx="6" cy="6" r="5" fill="currentColor" />
    </svg>
  )
}

function flatten(groups: SelectGroupModel[] | undefined, options: SelectOptionModel[] | undefined) {
  if (groups) return groups.flatMap((g) => g.options)
  return options ?? []
}

export function Select({
  config,
  options,
  groups,
  indicator,
  size,
  variant,
  status,
  disabled,
  readOnly,
  defaultValue,
  placeholder,
  forceOpen,
  adornments,
  startAdornment,
  className,
  id,
}: SelectProps) {
  const activeIndicator = indicator ?? config.indicator?.[0]
  const activeSize = size ?? config.size?.[0]
  const activeVariant = variant ?? config.variant?.[0]
  const marker = config.selectedMarker ?? "fill"
  const anchor = config.popupAnchor ?? "below"
  const swapsIcon = config.toggleIcon === "swap"
  const activateOnHover = config.activateOnHover !== false

  const isDisabled = Boolean(disabled)
  const isReadOnly = Boolean(readOnly)

  const [open, setOpen] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [focusVisible, setFocusVisible] = React.useState(false)
  const [selected, setSelected] = React.useState<string | undefined>(defaultValue)
  const [active, setActive] = React.useState<string | undefined>(defaultValue)
  const [triggerWidth, setTriggerWidth] = React.useState<number | undefined>(undefined)
  const [overlayTop, setOverlayTop] = React.useState(0)

  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const popupRef = React.useRef<HTMLDivElement | null>(null)

  // Dismiss on outside interaction. All three systems do this — Salt via
  // floating-ui's useDismiss, shadcn via Radix's DismissableLayer, M3 per the
  // APG listbox pattern — and behavior.dismiss is a locked row, so the
  // skeleton has to express it rather than leave it to the popup engine it
  // declares as a gap. pointerdown (not click) is deliberate: it is the event
  // both real implementations dismiss on, so a press that starts outside
  // closes immediately instead of waiting for release.
  React.useEffect(() => {
    if (!open || forceOpen) return
    const onPointerDown = (e: Event) => {
      const t = e.target as Node | null
      if (!t) return
      if (triggerRef.current?.contains(t) || popupRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    return () => document.removeEventListener("pointerdown", onPointerDown, true)
  }, [open, forceOpen])

  const flat = flatten(groups, options)
  const enabled = flat.filter((o) => !o.disabled)
  const selectedOption = flat.find((o) => o.value === selected)

  // Salt's readOnly is more than a style: it suppresses opening entirely
  // and removes the chevron (behavior.readonly-suppresses-popup). Gated on
  // the system HAVING a readOnly capability at all, so a column with no
  // read-only concept never inherits Salt's suppression.
  const hasReadOnly = Boolean(config.readOnly)
  const canOpen = !isDisabled && !(isReadOnly && hasReadOnly)
  const isOpen = (open || Boolean(forceOpen)) && canOpen && flat.length > 0

  // Salt's emptyReadOnlyMarker: an empty read-only control shows a marker
  // instead of nothing. CONTENT FORMATTING, config'd rather than assumed.
  const emptyMarker = config.emptyReadOnlyMarker
  const showPlaceholder = selectedOption === undefined && !(isReadOnly && emptyMarker)
  const valueText = selectedOption
    ? selectedOption.label
    : isReadOnly && emptyMarker
      ? emptyMarker
      : (placeholder ?? "")

  React.useLayoutEffect(() => {
    if (triggerRef.current) setTriggerWidth(triggerRef.current.offsetWidth)
  }, [isOpen, activeSize, valueText])

  const showStart = Boolean(config.startAdornment) && (adornments || startAdornment !== undefined)
  const showStatusAdornment = Boolean(config.statusAdornment) && Boolean(status) && !isDisabled
  // Salt removes the chevron entirely when read-only; the other two have no
  // read-only concept at all, so the guard never fires for them.
  const showToggle = !(isReadOnly && hasReadOnly)

  function commit(value: string) {
    setSelected(value)
    setActive(value)
    setOpen(false)
  }

  function move(delta: number) {
    if (enabled.length === 0) return
    const current = enabled.findIndex((o) => o.value === active)
    const next = current < 0 ? (delta > 0 ? 0 : enabled.length - 1) : Math.min(Math.max(current + delta, 0), enabled.length - 1)
    setActive(enabled[next].value)
    setFocusVisible(true)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (isDisabled || !canOpen) return
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
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
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (active) commit(active) }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false) }
  }

  // popupAnchor="overlay": Radix's item-aligned mode places the popup so the
  // SELECTED option sits over the trigger. Measured rather than guessed —
  // the selected row's own offsetTop inside the popup becomes the popup's
  // negative top offset, so that row lands on the trigger. Still an
  // approximation of Popper: no collision handling, no viewport clamp.
  React.useLayoutEffect(() => {
    if (anchor !== "overlay" || !isOpen) { setOverlayTop(0); return }
    const popup = popupRef.current
    if (!popup) return
    const row = popup.querySelector<HTMLElement>("[data-slot=\"select-option\"][data-selected]")
    setOverlayTop(row ? -row.offsetTop : 0)
  }, [anchor, isOpen, selected, activeSize])

  function renderOption(o: SelectOptionModel) {
    const isSelected = o.value === selected
    const isActive = o.value === active && !o.disabled
    return (
      <div
        key={o.value}
        data-slot="select-option"
        role="option"
        id={`${id ?? "select"}-opt-${o.value}`}
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
          // setActive and clears focusVisible; Radix focuses the item on
          // pointermove. M3 keeps hover and focus separate, so this branch
          // is off for M3 and its 8% hover layer stays reachable.
          if (activateOnHover) { setActive(o.value); setFocusVisible(false) }
        }}
        onClick={() => { if (!o.disabled) commit(o.value) }}
      >
        <span>{o.label}</span>
        {marker === "check" && isSelected && (
          <span data-slot="select-option-marker">
            <CheckGlyph />
          </span>
        )}
      </div>
    )
  }

  const listContent = groups
    ? groups.map((g, gi) => (
        <React.Fragment key={g.label}>
          {config.separator && gi > 0 && <div data-slot="select-separator" role="presentation" />}
          {config.group ? (
            <div data-slot="select-group" role="group" aria-label={g.label}>
              <div data-slot="select-group-label" aria-hidden="true">{g.label}</div>
              {g.options.map(renderOption)}
            </div>
          ) : (
            /* a system with no group part still renders the options — the
               grouping simply disappears, which is what M3 does. */
            <React.Fragment>{g.options.map(renderOption)}</React.Fragment>
          )}
        </React.Fragment>
      ))
    : (options ?? []).map(renderOption)

  return (
    <div
      data-slot="select"
      data-indicator={activeIndicator}
      data-size={activeSize}
      data-variant={activeVariant}
      data-status={status}
      className={className}
    >
      <button
        ref={triggerRef}
        data-slot="select-trigger"
        type="button"
        role="combobox"
        id={id}
        disabled={isDisabled}
        aria-expanded={isOpen}
        aria-readonly={isReadOnly ? "true" : undefined}
        aria-invalid={status === "error" ? true : undefined}
        aria-activedescendant={isOpen && active ? `${id ?? "select"}-opt-${active}` : undefined}
        data-placeholder={showPlaceholder ? "" : undefined}
        data-focused={focused && !isDisabled ? "" : undefined}
        data-disabled={isDisabled ? "" : undefined}
        data-readonly={isReadOnly ? "" : undefined}
        data-open={isOpen ? "" : undefined}
        tabIndex={isDisabled ? -1 : 0}
        onClick={() => { if (canOpen) { setOpen((v) => !v); setFocusVisible(false) } }}
        onKeyDown={onKeyDown}
        onFocus={isDisabled ? undefined : () => setFocused(true)}
        onBlur={() => { setFocused(false); setOpen(false) }}
      >
        {showStart && (
          <span data-slot="select-start-adornment">
            {startAdornment ?? <PlaceholderGlyph />}
          </span>
        )}
        <span data-slot="select-value">{valueText}</span>
        {showStatusAdornment && (
          <span data-slot="select-status-adornment" aria-hidden="true">
            <PlaceholderGlyph />
          </span>
        )}
        {showToggle && (
          <span data-slot="select-toggle-icon" aria-hidden="true">
            <ChevronGlyph open={swapsIcon ? isOpen : false} />
          </span>
        )}
        {/* rendered regardless of the active indicator value, mirroring
            Salt, which always renders the div and lets CSS zero its width */}
        <span data-slot="select-indicator" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          ref={popupRef}
          data-slot="select-popup"
          data-anchor={anchor}
          style={{
            // the same inline mechanism Salt's floating-ui size() middleware
            // uses (it writes --overlay-minWidth = the trigger's width); the
            // column's popup-min-width slot reads this custom property.
            ["--select-trigger-width" as string]: triggerWidth ? `${triggerWidth}px` : undefined,
            top: anchor === "overlay" ? `${overlayTop}px` : "100%",
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div data-slot="select-listbox" role="listbox" aria-label="options">
            {listContent}
          </div>
        </div>
      )}
    </div>
  )
}
