# Select (single-choice dropdown) — component template matrix

*Seventh live component in the post-clean-slate pipeline (button, calendar,
spinner, tooltip, alert, input came before). Same method as
[INPUT-MATRIX.md](INPUT-MATRIX.md) / [TOOLTIP-MATRIX.md](TOOLTIP-MATRIX.md) /
[ALERT-MATRIX.md](ALERT-MATRIX.md) / [CALENDAR-MATRIX.md](CALENDAR-MATRIX.md):
one master template (union of all six pieces across systems), columns per
design system, rows switched on/off/inherited per column.*

**Cell legend** · `⟡ slot` = alias to shared contract slot · **bold** = the
system's own switch · `x-ds:` = system's native token, no shared slot yet ·
`OFF` = row switched off in this column · `INHERIT` = system silent,
registry default applies · `[S]` = value extracted from source this
session · `[R]` = not directly sourced (reason always given); needs
verification before treating as authoritative.

**Row policies** · 🔒 locked-on (no column may switch it off) ·
⚪ switchable (on where the system has it) · ⬜ on-with-default.

**Naming rule** — grammar `<piece>.<part>[.<subpart>].<property>[@state]`,
enforced by `contract/template.schema.json`'s `row.id` pattern.

---

## Scope note

### What is in scope

- **Salt** `packages/core/src/dropdown/{Dropdown.tsx,Dropdown.css}` — the
  trigger — plus the parts it composes for the popup:
  `packages/core/src/option/{Option,OptionList,OptionListBase,OptionGroup}.{tsx,css}`.
- **shadcn** `apps/v4/registry/new-york-v4/ui/select.tsx` — all ten exported
  parts, built on `radix-ui`'s `Select`.
- **Material 3** BOTH `_md-comp-filled-select.scss` AND
  `_md-comp-outlined-select.scss`. As with input's filled/outlined text
  field, these are not two components: they are one canonical component with
  an emphasis axis, modelled as the `structure.indicator` row. They share a
  vocabulary almost line for line, including a complete `menu-*` family for
  the popup.

### The option and the popup surface are modelled here as PARTS OF SELECT

This is a deliberate, declared choice, not an oversight —
`docs/COMPONENTS.md` carries separate `popover`, `dropdown-menu` and `list`
rows, and each system says something different about who owns the popup:

| system | who owns the popup and the option |
|---|---|
| Salt | `Option`, `OptionList`, `OptionGroup` are **separate exported components** in `packages/core/src/option`, shared by `Dropdown`, `ComboBox` and `ListBox` [S] |
| shadcn | `SelectContent` / `SelectItem` / `SelectLabel` / `SelectSeparator` live **inside `select.tsx`**; the sibling `dropdown-menu.tsx` has its own parallel set [S] |
| M3 | the select token files declare a full `md.comp.{filled,outlined}-select.menu.*` family — **and then material-web's own hand-authored `tokens/_md-comp-filled-select.scss` lists every one of those `menu-*` tokens under `$unsupported-tokens`**, i.e. the shipped library composes the standalone `md-menu` instead [S] |

**If `popover` / `option` / `list-item` are later split into their own
canonical components, these rows migrate wholesale:** every
`style.popup.*`, `style.option.*`, `style.group-label.*`, `style.separator`,
`style.group.border-top` and `style.selected-marker.*` row, plus the
`structure.popup`, `structure.popup-ownership`, `structure.option-group`,
`structure.separator` and `structure.selected-marker` rows. What would stay
with `select` is the trigger (everything under `style.trigger.*` /
`style.indicator.*` / `style.value.*` / `style.toggle-icon.*`), the
open/close and typeahead behavior rows, and `structure.popup-anchor` —
which is a relationship between the two, not a property of either.

### What is out of scope, and why (structural reasons, declared not dropped)

| excluded | where | structural reason |
|---|---|---|
| `native-select` | shadcn `ui/native-select.tsx` | Renders a real `<select>` with `appearance-none` and an absolutely-positioned chevron. Its popup is the **browser's**, not the component's: there is no option list to style, no group label part, no highlight state, no positioning. `docs/COMPONENTS.md` gives it its own row [S]. |
| `combo-box` | Salt `core/src/combo-box`, plus lab's `combo-box`/`combo-box-deprecated` | Adds a real text `<input>` and a **filtering** layer over the same list — `role` flips between `combobox` and `textbox` depending on readOnly, and the value is typed, not chosen. `docs/COMPONENTS.md` maps it to the separate **`combobox`** row (alongside M3's autocomplete) [S]. |
| `list-box` | Salt `core/src/list-box` | An **always-visible** listbox: a `<div>` with `overflow: auto`, an optional border, and no trigger, no floating layer, no open/close state at all. It shares `Option` and `ListControlState` with Dropdown but has no popup relationship to model [S]. |
| `list`, `list-next`, `static-list`, `list-deprecated` | Salt `lab/src/…` | A different canonical component entirely — `docs/COMPONENTS.md`'s `list` row. `List` ships virtualization (`VirtualizedList`, `useVirtualization`, `useListHeight`), a `Highlighter`, and item *headers*; none of that is a dropdown concern [S]. |
| **multi-select** | Salt: the `multiselect` prop on `Dropdown` (there is no standalone component) | Not separable as a component, only as a behavior — and it is a different **selection model**: an array rather than a value, a comma-joined trigger string, `aria-multiselectable` on the list, a `CheckboxIcon` inside every `Option`, and a changed Tab commit rule. Recorded as `behavior.multiselect` and switched on for Salt as an info row, but no multi-select style or structure is modelled [S]. |
| M3 `autocomplete` | `_md-comp-{filled,outlined}-autocomplete.scss` | M3's own name for the combobox — the text-entry + filtering variant. Same exclusion as Salt's combo-box, and `docs/COMPONENTS.md` puts both on the `combobox` row [S]. |
| shadcn's scroll buttons | `SelectScrollUpButton` / `SelectScrollDownButton` | A scroll **affordance** unique to shadcn/Radix — Salt scrolls natively (`overflow-y: auto`) and M3 has no such token. A one-system part with no cross-system character; declared trim [S]. |

`field` — the **label + control + help-text wrapper** — is a separate
canonical component, as it was for input. This matrix covers the *control*,
and records how Salt's Dropdown reads state out of form-field context as an
info row (`behavior.status-inheritance`).

---

## Sources

- **Salt** [S]: `packages/core/src/dropdown/{Dropdown.tsx,Dropdown.css}`;
  `packages/core/src/option/{Option.tsx,Option.css,OptionList.tsx,OptionList.css,OptionListBase.tsx,OptionGroup.tsx,OptionGroup.css}`;
  `packages/core/src/list-box/{ListBox.tsx,ListBox.css}` (read only to fix the
  scope boundary); `packages/core/src/status-adornment/StatusAdornment.css`;
  `packages/icons/src/icon/Icon.css`;
  `packages/theme/css/next/characteristics/{selectable,editable,container,overlayable,separable,focused,content,status,text}.css`;
  `packages/theme/css/next/palette/{accent,neutral,background,corner,alpha}.css`;
  `packages/theme/css/next/foundations/{color,alpha}.css`;
  `packages/theme/css/foundations/{size,spacing,curve,borderStyle,cursor,zindex}.css`.
  Reused rather than re-derived: `docs/foundations/{sizes,spacing,density,typography,colors,shape,border-style,cursors,elevation,layers}.md`.
- **shadcn** [S]: `apps/v4/registry/new-york-v4/ui/select.tsx` (canonical, sole
  source for every style cell); `apps/v4/app/globals.css` (token values);
  `apps/v4/registry/new-york-v4/examples/{select-demo,select-scrollable,field-select}.tsx`;
  `apps/v4/content/docs/components/radix/select.mdx`. Read for **behavior
  only**, never for a style cell: `primitives/packages/react/select/src/select.tsx`.
  Read only to fix the scope boundary: `ui/native-select.tsx`.
- **Material 3** [S]: `tokens/versions/latest/sass/_md-comp-{filled,outlined}-select.scss`;
  `tokens/versions/v0_192/_md-comp-{filled,outlined}-select.scss` (for the
  edition diff); the hand-authored
  `tokens/_md-comp-{filled,outlined}-select.scss`, `_md-comp-menu.scss`,
  `_md-comp-menu-item.scss`, `_md-comp-list-item.scss`, `_md-comp-filled-field.scss`;
  `versions/latest/sass/_md-comp-{menu,list}.scss`; plus
  `_md-sys-color{,__dark}.scss`, `_md-ref-palette.scss`, `_md-sys-shape.scss`,
  `_md-sys-state.scss`, `_md-sys-state-focus-indicator.scss`,
  `_md-sys-typescale.scss`, `_md-sys-elevation.scss` for resolution.
  **material-web is a tokens-only clone** — no live M3 select exists, so every
  M3 structure/behavior row is `[R]`.

### Edition pin — `versions/latest`, and it narrows the split rather than widening it

Pinned to **`tokens/versions/latest/sass`**, matching spinner, tooltip, alert
and input; calendar and button remain on `v0_192`. That makes the tally
**5 latest / 2 v0.192** — the minority shrinks in proportion, but the split
itself is still open and still wants one registry-wide decision. Flagged for
the owner for the fifth time.

Reasons specific to this component:

1. **A full mechanical key/value diff of both select files across the two
   editions finds ZERO value divergences among the shared keys** (filled: 103
   entries in each; outlined: 101 in each). The only differences are
   additive: `latest` adds `text-field-container-height` (56px),
   `text-field-caret-color`, `text-field-error-focus-caret-color` and
   `menu-container-surface-tint-layer-color` — **all four annotated
   `@deprecated` on arrival** — and expresses v0.192's four composite `-type`
   entries as `@mixin`s. So the pin is very nearly a no-op for select, which
   is the opposite of a reason to agonise over it.
2. The one substantive number that *does* move sits outside the shared set:
   `outlined text-field-focus-outline-width` is a hardcoded **2px in v0.192**
   and `md-sys-state-focus-indicator.$thickness` = **3px in latest** —
   exactly the divergence input recorded. This matrix uses 3px.
3. `latest` is the only edition carrying `container-height`, the only sourced
   height number for the trigger. It arrives `@deprecated` ("Removing fixed
   height token due to conflicts with text fields variants requiring dynamic
   height"), recorded with that caveat rather than replaced by a guess.

**Two declared borrows, both because the select token files are silent:**

- **Cross-component**, to `tokens/_md-comp-{filled,outlined}-field.scss` for
  the trigger's `16px` padding and `16px` content gap. Neither select file —
  versioned or hand-authored — carries *any* spacing token. The borrow is
  legitimate because the select file's own tokens are literally prefixed
  `text-field-*` and material-web's `md-filled-select` composes
  `md-filled-field`; it is the same file input borrowed from.
- **Cross-file**, to `tokens/_md-comp-menu.scss` (popup `top/bottom-space`
  8px; list-item hover/focus state layers; list-item disabled opacity) and
  `tokens/_md-comp-{menu-item,list-item,list}.scss` (option padding 12/16px,
  gap 12px). Where the standalone menu and the select's own file **disagree**
  — `list-item-selected-container-color` is `secondary-container` in the menu
  file and `surface-container-highest` in both select files — **the select's
  own value wins**, and the disagreement is itself recorded as Finding 6.

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| trigger | 🔒 (invariant) | on — `<button role="combobox" type="button">` carrying **every box style itself**; there is no wrapper div [S] | on — Radix `SelectTrigger`, also `role="combobox"`, also one element [S] | on [R] — a `text-field` container per the token prefix |
| **activation indicator** (bottom-only rule) | ⚪ | **on** — `<div class="saltDropdown-activationIndicator">`, ALWAYS rendered; `bordered` defaults to `false` [S] | **OFF** — no underline mechanism of any kind [S] | **on** — `text-field-active-indicator-*`, filled variant only [S] |
| start adornment | ⚪ | **on** — `startAdornment` prop → `.saltDropdown-startAdornmentContainer` [S] | OFF — `SelectTrigger` renders `{children}` then a fixed trailing icon; no leading slot [S] | **on** — `text-field-leading-icon-size: 24px` + `-color` [S] |
| **end adornment** | — | **absent from Dropdown entirely**, unlike Salt's own Input, which has both. The trailing edge belongs to the status adornment and the chevron [S] | — | — |
| status adornment (automatic validation glyph) | ⚪ | **on** — `{!disabled && validationStatus && <StatusAdornment …/>}` [S] | OFF [S] | **OFF** — M3 *recolours* a trailing icon on error but never inserts one [S] |
| toggle / disclosure icon | ⬜ | **on, and it SWAPS** — `CollapseIcon` when open, `ExpandIcon` when closed; **removed from the DOM entirely when readOnly** [S] | on, **static** — one `ChevronDownIcon`, never swapped [S] | on, static [R] — `trailing-icon-size/-color` only |
| popup surface | 🔒 (invariant) | on — `OptionList` → `FloatingComponent` (`role="listbox"`) wrapping `OptionListBase` [S] | on — `Portal > Content (role=listbox) > Viewport` [S] | on — the `menu-container-*` family [S] |
| option group | ⚪ | **on** — `OptionGroup`, `role="group"`, aria-hidden label, border-top between groups [S] | **on** — `SelectGroup` + `SelectLabel` [S] | **OFF** — no group / group-label / subheader token in either select file or in `_md-comp-menu.scss` [S] |
| separator (standalone element) | ⚪ | **OFF** — no separator component; the same job is done by a border on the group itself [S] | **on** — `SelectSeparator` [S] | **on** — `menu-divider-height/-color` [S] |
| selected marker | 🔒 | **fill** — no glyph in single-select [S] | **check** — `ItemIndicator` + `CheckIcon`, `pr-8` reserved [S] | **fill** — `menu-list-item-selected-container-color` [S] |
| popup anchor | 🔒 | **below** — `placement: "bottom-start"`, `offset(1)` [S] | **overlay** — `position="item-aligned"` by default [S] | below [R] |

### The two axes that were nearly smoothed over

**Selected marker is a mechanism split, not a colour delta.** shadcn marks a
chosen option with a **trailing checkmark and no background change at all** —
there is no `data-[state=checked]` class anywhere in `select.tsx`, confirmed
by reading every class. Salt and M3 both do the opposite: **a filled
background and no glyph** (Salt's `CheckboxIcon` renders only when
`multiselect`, which is out of scope). A skeleton that drew a check for all
three would be wrong for two; one that filled for all three would be wrong
for shadcn. Modelled as `structure.selected-marker: "check" | "fill"` with a
skeleton branch, plus `style.option.selected` on for Salt/M3 and OFF for
shadcn.

**Popup anchoring is placement, not offset.** Salt places the list 1px below
the trigger with the left edges aligned. shadcn's default is Radix's
`item-aligned` mode, which places the popup so the **selected option lands on
the trigger** — the list *overlays* the control, native-`<select>` style. The
docs page states this in its own "Align Item With Trigger" section, and
`position="popper"` (below-the-trigger) is the opt-in. This is visible the
moment a non-first option is selected, so it is `structure.popup-anchor`, a
config'd axis, not a tuning constant.

## 2 · Behavior

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| open trigger | 🔒 (info) | `useClick` + `useFocus` + `useDismiss` (floating-ui), ArrowDown/Up from closed, any printable key via typeahead; a `focusNotBlur` guard suppresses focus-opening; readOnly blocks it entirely [S] | pointerdown, plus Radix's `OPEN_KEYS = [' ','Enter','ArrowUp','ArrowDown']`; `SELECTION_KEYS = [' ','Enter']` commit [S] | [R] |
| typeahead buffer | 🔒 (info) | **500ms** — Dropdown.tsx's own `typeaheadString` ref cleared by `setTimeout(…, 500)`; also OPENS the list [S] | **1000ms** — Radix's `useTypeaheadSearch` resets with `setTimeout(() => updateSearch(''), 1000)`; the trigger-level typeahead selects *without* opening [S] | [R] |
| focus model while open | 🔒 (info) | **virtual** — the trigger keeps DOM focus and carries `aria-activedescendant`; options are `tabIndex={-1}` divs [S] | **real DOM focus** moves onto the item — which is exactly why shadcn styles the highlight with `focus:bg-accent` and has no `hover:` class [S] | [R] |
| pointer activates option | ⚪ | **on** — `Option.handleMouseOver → setActive`, and the list's `onMouseOver` clears `focusVisible` [S] | **on** — Radix focuses the item on `pointermove` [S] | **OFF** [R] — M3 keeps hover (8%) and focus (10%) as separate state layers, so conflating them would make the 8% unreachable |
| positioning engine | 🔒 (info) | **DECLARED GAP** — `@floating-ui/react`: `offset(1)`, `size()` writing `--overlay-minWidth`/`--overlay-maxHeight` inline, `flip({fallbackStrategy:"initialPlacement"})` [S] | **DECLARED GAP** — Radix `Popper`, publishing `--radix-select-trigger-width` / `--radix-select-content-available-height` [S] | [R]. **None is reimplemented.** `skeleton/select.tsx` uses an absolutely-positioned popup, measures the trigger to publish `--select-trigger-width` (Salt's own inline mechanism), and for `overlay` measures the selected row's `offsetTop` — no collision detection, no flip, no viewport clamp. |
| status inheritance from form-field context | ⚪ | **on** — same non-uniform precedence as Input (`\|\|` for disabled/readOnly, `??` for validationStatus) **plus a necessity channel Input does not read**: `required = formFieldRequired ? ['required','asterisk'].includes(formFieldRequired) : requiredProp` [S] | OFF [S] | OFF [R] |
| empty read-only marker | ⚪ | **on** — `emptyReadOnlyMarker`, default `"—"` [S] | OFF [S] | OFF [S] |
| read-only suppresses the popup | ⚪ | **on, and it is four things at once**: `handleOpenChange` early-returns, `handleKeyDown` early-returns, the chevron is removed from the DOM, and `aria-readonly="true"` is set (a `<button>` has no native readonly) [S] | **OFF** — Radix's Select has no `readOnly` prop at all [S] | OFF [S] |
| multiselect | ⚪ (info) | **on, declared out of scope** — a different selection model, see the scope note [S] | OFF — Radix Select is single-choice only [S] | OFF [S] |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| indicator / box mechanism | ⚪ | **`bordered?: boolean`, default `false`** → underline by default [S] | **box only**, structural [S] | **filled → underline, outlined → box** [S] |
| `size` | ⚪ | **OFF** — height is `--salt-size-base`, i.e. the *density* capability, not a per-instance prop [S] | **on** — `size?: "sm" \| "default"` → `h-8` / `h-9`. **shadcn's Input has no such prop; its Select does** [S] | OFF — one `container-height` [S] |
| `variant` (background intensity) | ⚪ | **on** — primary / secondary / tertiary, default primary [S] | OFF [S] | OFF as a separate axis — filled/outlined already is the axis [S] |
| `validationStatus` | ⚪ | **on, 3 values** (`Omit<ValidationStatuses,"info">`) [S] | **on, 1** — `aria-invalid` [S] | **on, 1** — the `error-*` family [S] |
| `disabled` | 🔒 | on [S] | on [S] | on [S] |
| `readOnly` | ⚪ | **on**, with a full visual *and* behavioural state [S] | **OFF — the prop does not exist**. A step further than its Input, where the native attribute at least works with no styling [S] | OFF [S] |
| `placeholder` | ⚪ | on, styled (`.saltDropdown-placeholder`) [S] | on, styled (`data-[placeholder]:`) [S] | **OFF — no placeholder token in either select file**, though both *text-field* files have one. An M3 select shows a floating **label** instead [S] |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| value | 🔒 | consumer-owned. Salt derives it from `valueToString` (or the controlled `value`) into an ellipsising span; shadcn's `SelectValue` takes a `placeholder` and line-clamps to 1; M3 [R]. |
| option content | 🔒 | consumer-owned in all three (`children ?? valueToString(value)`, `ItemText`, a label + optional 24px icons). |
| start adornment | ⚪ | consumer-owned, where the system has the part. |
| group label | ⚪ | consumer-owned; Salt's `label` prop, shadcn's `SelectLabel` children. M3 has no group concept. |
| composes (declared) | ⬜ | **DECLARED COMPOSITION**, same pattern as CALENDAR-MATRIX.md's nav buttons: (a) the `field` wrapper; (b) an **icon set** — the chevron (both glyphs, since Salt swaps), the status glyph, shadcn's checkmark; (c) the **floating-position engine**; (d) for M3, the whole standalone `menu` component its own token file says the select composes. All render as neutral placeholders or simplified stand-ins. |

## 5 · States

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| closed / open | 🔒 | on — `openState`; the list is **always rendered** and gets `display: none` when collapsed, and is also mounted-but-collapsed on focus alone [S] | on — portalled mount/unmount + `data-state=open\|closed` for the animation [S] | on [R] |
| trigger hover | ⚪ | **on** — border/indicator recolour to accent, cursor `pointer`; **background never changes** [S] | **on — but DARK MODE ONLY** (`dark:hover:bg-input/50`). Its Input has no hover at all [S] | **on** — an `on-surface` state layer at 8% **plus** an outline/indicator recolour [S] |
| trigger focus | 🔒 | on — dotted outline + border/indicator recolour [S] | on — 3px translucent ring + border recolour [S] | on — outline/indicator thicken to **3px** and recolour [S] |
| option rest / hover / active / selected / focus-visible / disabled | 🔒 | the widest state set here: hover and active share a value through two selectors, and a **focus-visible dotted outline** exists that no other system has [S] | no hover rule at all; the highlight is `focus:`; no selected background [S] | hover 8% vs focus 10% state layers; selected fill [S] |
| read-only | ⚪ | **on** | OFF (no prop) | OFF |
| validation error | 🔒 | on | on | on |
| validation warning / success | ⚪ | **on** | OFF | OFF |

## 6 · Styles — the cell matrix

All cells are shown at each system's default: Salt `variant="primary"`,
`bordered={false}`; shadcn `size="default"`; M3 the **filled** variant.
Non-default axis values are real generated rows — see "the axes, as
generated rows".

### trigger

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background | 🔒 | ⟡ `bg-current` → `editable-primary-background` → **snow `rgb(255,255,255)` / jet `rgb(16,24,32)`** [S] | ⟡ `bg-current` → `bg-transparent` / `dark:bg-input/30` → **`transparent` / `color-mix(… oklch(1 0 0 / 15%) 30%, transparent)`** [S] | ⟡ `bg-current` → `text-field-container-color` → `surface-container-highest` → **`#e6e0e9` / `#36343b`** [S] |
| background @indicator=box | ⚪ | **OFF** — `bordered` declares a border and nothing else [S] | OFF — box is its only mode [S] | **OFF — and this is the surprise.** `_md-comp-outlined-select.scss` **has** `text-field-container-color: surface-container-highest`, identical to filled, in **both** editions — where `_md-comp-outlined-text-field.scss` has no container-color at all. M3's outlined select is *filled* [S] |
| color | 🔒 | ⟡ `content-primary-foreground` → **black / white** [S] | ambient `--foreground` → **`oklch(0% 0 0)` / `oklch(0.985 0 0)`**; `SelectTrigger` sets no text-colour class [S] | `text-field-input-text-color` → `on-surface` → **`#1d1b20` / `#e6e0e9`** [S] |
| font | ⬜ | ⟡ `type-body` → **`400 12px/16px 'Open Sans'` @medium**, 11/14 · 12/16 · 14/18 · 16/20 by density. Unlike `Input.css`, `Dropdown.css` **does** declare `font-weight` [S] | **`400 0.875rem/1.25rem`** (`text-sm`) — a FLAT `text-sm`, not its Input's responsive `text-base md:text-sm`, so the `@media` generator gap does not bite here [S] | **`400 1rem/1.5rem Roboto`** (`body-large`) [S] |
| letter-spacing | ⚪ | **0** [S] | OFF [S] | **0.03125rem** (`body-large-tracking`) [S] |
| width | ⬜ | **100%** — a Salt dropdown fills its container [S] | **`fit-content`** (`w-fit`) — sized to content; every example that wants a width passes `className="w-[180px]"` [S] | 100% [R] — no width token |
| min-height | ⬜ | ⟡ `control-height` → `size-base` → **20/28/36/44px**. Note `min-height`, not `height`, unlike `Input.css` [S] | **36px** (`h-9`) [S] | **56px** (`container-height`, see Edition pin) [S] |
| min-height @size=sm | ⚪ | OFF | **32px** (`h-8`) [S] | OFF |
| min-width | ⚪ | **4em** — a bare literal with **no override variable at all** (Input at least offers `--saltInput-minWidth`) [S] | OFF [S] | OFF [S] |
| padding | ⬜ | ⟡ `field-padding` → **`0 4/8/12/16px`** — zero vertical padding [S] | **`8px 12px`** (`px-3 py-2`; its Input is `py-1`) [S] | **`16px`** — declared cross-component borrow [S] |
| gap | ⚪ | ⟡ `field-gap` → `spacing-100` → **4/8/12/16px**. Salt expresses it as *margins* (`startAdornmentContainer` margin-right, `.toggle` margin-left, StatusAdornment padding-left) — one token, three declarations, modelled as one `column-gap` [S] | **8px** (`gap-2`), a real gap [S] | **16px** (`content-space`, same borrow) [S] |
| shape | ⬜ | ⟡ `corner-weak` → curve-100 → **2/4/6/8px** [S] | **8px** (`rounded-md`) [S] | **`4px 4px 0 0`** (`corner-extra-small-top`) [S] |
| shape @indicator=box | ⚪ | OFF — independent of `bordered` [S] | OFF [S] | **4px**, all four corners [S] |
| cursor | ⚪ | **`pointer`** (`--salt-cursor-hover`) — **not** the `text` cursor its Input uses; a button, not a field [S] | OFF [S] | OFF [S] |
| shadow | ⚪ | OFF [S] | **`0 1px 2px 0 rgb(0 0 0 / 0.05)`** (`shadow-xs`) [S] | OFF on the text-field half [S] |
| transition | ⚪ | OFF — no `transition`/`animation` anywhere in `Dropdown.css` [S] | **`color 150ms, box-shadow 150ms`** — property list [S], Tailwind's default duration/easing [R] | OFF [S] |

### the edge: box border vs activation indicator

Same two-way mechanism split input found, and the same surprise: **Salt's
default is the underline**, which is the same mechanism as M3's **filled**
select.

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| box border @box | ⚪ | **on** — `1px solid var(--border-current)` → `editable-borderColor` → **`rgb(114,119,125)`**, mode-invariant [S] | **on** — `1px solid` → `--input` → **`oklch(0.922 0 0)` / `oklch(1 0 0 / 15%)`** [S] | **on** — `1px solid` → `outline` → **`#79747e` / `#938f99`** [S] |
| box border @hover | ⚪ | **on** — accent [S] | **OFF — confirmed absent** (its only hover utility is the dark background) [S] | **on** — `on-surface` [S] |
| box border @focus | 🔒 | **on** — recolour to accent-stronger, width unchanged [S] | **on** — recolour to `--ring`, width unchanged [S] | **on** — recolour to `primary` **and thicken to 3px** [S] |
| activation indicator @underline | ⚪ | **on** — `1px solid var(--border-current)`, the same indirection as the box border [S] | **OFF** [S] | **on** — `1px`, `on-surface-variant` (a *different* role from outlined's `outline`) [S] |
| activation indicator @hover | ⚪ | **on** — accent [S] | OFF | **on** — `on-surface` [S] |
| activation indicator @focus | 🔒 | **on — thickens to 2px** (`size-fixed-200`) [S] | OFF | **on — thickens to 3px.** The generated token says 2px; material-web's own `tokens/_md-comp-filled-select.scss` overrides it via `_get-override-tokens()` with `TODO(b/259455114): remove when focus tokens update to 3px`. So **M3's select thickens further on focus than M3's text field does** [S] |
| activation indicator @box, focused | ⚪ | **on — 1px**, the same easily-missed Salt rule Input has, with the source comment *"Activation indicator width minus the border from the input."* [S] | OFF | OFF |
| focus decoration | ⚪ | **2px dotted outline** outside the box, reassigned to the status colour [S] | **3px translucent ring** as a `box-shadow` (with `shadow-xs` re-layered after it, because Tailwind composes `var(--tw-ring-shadow), var(--tw-shadow)`) [S] | **OFF** — nothing extra; focus is the thickening alone [S] |

### value / placeholder / icons

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| placeholder | ⚪ | **on** — `content-secondary-foreground` **plus `font-weight: 300`**; same declared rendering approximation as Input (Open Sans is self-hosted at 400/600 only) [S] | **on** — `text-muted-foreground`, colour only, and stamped by Radix on the **trigger** (`data-placeholder`), not the value span [S] | **OFF** — no placeholder token in either select file, though both text-field files have one [S] |
| toggle icon size | ⚪ | ⟡ `toggle-icon-size` → `max(size-icon, 12px)` → **12/12/14/16px**. Note the **12px floor** — Salt's own documented minimum, so the high-density value is a clamp, not a frozen literal [S] | **16px** (`size-4`), density-invariant [S] | **24px** (`trailing-icon-size`) [S] |
| toggle icon colour | ⚪ | **OFF** — `currentColor`, no `.saltIcon-primary/-secondary` applied, so it inherits the trigger's colour including the disabled 40% alpha [S] | **`--muted-foreground` AND `opacity: 0.5`** — two dimming mechanisms stacked [S] | `on-surface-variant` [S] |
| start adornment size | ⚪ | ⟡ same icon box, **[R]** — the container declares only `margin-right`, so its content sizes itself [S/R] | OFF | **24px** (`leading-icon-size`) [S] |
| status adornment size / colour | ⚪ | ⟡ `size-adornment` → **6/8/10/12px**; colour ⟡ `border-current`, the same indirection the border reads (identical value in source) [S] | OFF | OFF |

### disabled / read-only (trigger)

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background @disabled | ⚪ | ⟡ 40%-alpha sibling of the enabled background [S] | **OFF** — one blanket `opacity: 0.5` [S] | **`on-surface` @ 4%** [S] |
| background @box, disabled | ⚪ | OFF | OFF | **restates the enabled fill** — outlined-select has a `container-color` but **no** `disabled-container-color`/`-opacity`, so a disabled outlined select keeps its fill. Without this row the shared filled-only 4% rule would repaint it. The mirror image of input's equivalent row [S] |
| color @disabled | ⚪ | ⟡ black/white @ 40% [S] | OFF [S] | **`on-surface` @ 38%** [S] |
| border / indicator @disabled | ⚪ | `palette-neutral-disabled` `rgba(114,119,125,0.4)` [S] | OFF [S] | **12% (outline) / 38% (indicator)** [S] |
| other @disabled | ⚪ | `cursor: not-allowed` [S] | **`opacity: 0.5; cursor: not-allowed`** — and **no `pointer-events: none`**, which its own Input does carry [S] | OFF [S] |
| background @readonly | ⚪ | **`transparent`** — the control dissolves into the page [S] | OFF | OFF |
| border / indicator @readonly | ⚪ | `palette-neutral-readonly` `rgba(114,119,125,0.1)` [S] | OFF | OFF |

### popup surface

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background | 🔒 | ⟡ `container-primary-background` → **snow / jet** — the *same* value as a primary trigger, reached through the CONTAINER characteristic instead of EDITABLE [S] | ⟡ `--popover` → **`oklch(1 0 0)` / `oklch(0.205 0 0)`**, a dedicated popover role [S] | ⟡ `menu-container-color` → `surface-container` → **`#f3edf7` / `#211f26`** — a **lower** surface tone than the trigger's `surface-container-highest`, so an M3 popup is lighter than the control that opened it [S] |
| color | 🔒 | `content-primary-foreground` (declared on the option in source) [S] | `--popover-foreground` (declared on the content) [S] | `on-surface` (declared on the list item) [S] |
| border | ⚪ | **1px solid `palette-accent` `rgb(0,120,207)`** — the **accent**, not a neutral, and the *same* token the selected option's bracket uses [S] | **1px solid `--border`** — note `--border`, **not** the `--input` its trigger uses; the two diverge in dark (10% vs 15% white) [S] | **OFF** — no outline/border token anywhere in the menu family; an M3 menu is elevation-only [S] |
| shape | ⬜ | ⟡ `palette-corner` → curve-150 → **3/6/9/12px** — a **rounder** stop than the trigger's `corner-weak` [S] | **8px** (`rounded-md`), the same as its trigger [S] | **4px** (`corner-extra-small`) [S] |
| shadow | ⚪ | `overlayable-shadow-popout` → `shadow-mediumLow` [S] | `shadow-md` [R] — Tailwind not vendored | `menu-container-elevation: level2` (3dp) + `shadow-color: #000` → two-layer CSS [R], derived as `button.m3.json` derived its level1 |
| padding | ⬜ | **0** — `.saltOptionList-container` declares no padding at all; options run edge to edge inside the accent frame [S] | **4px** (the Viewport's `p-1`) [S] | **`8px 0`** — `top/bottom-space` 8px, cross-file borrow; no horizontal menu padding token exists [S] |
| gap between options | ⚪ | **1px** (`spacing-fixed-100`, density-invariant by design) [S] | OFF — items stack flush [S] | OFF [S] |
| min-width | ⚪ | **the trigger's width** — floating-ui's `size()` writes `--overlay-minWidth` inline; the skeleton reproduces this with `--select-trigger-width` [S] | **`8rem`** — a fixed floor **independent of the trigger** (the trigger-width var applies only in `position="popper"`) [S] | OFF [S] |
| max-height | ⚪ | **PARTIAL** — source is `max(calc((size-base + spacing-100) * 5), availableHeight − spacing-100)`; only the five-row floor (**120/180/240/300px**) is expressible without the positioning engine [S/declared] | OFF — entirely Popper-computed [S] | OFF [S] |
| z-index | ⬜ | **1500** (`zIndex-flyover`) [S] | **50** (`z-50`, a bare Tailwind index) [S] | OFF [S] |
| entrance animation | ⚪ | **OFF** — no animation or transition in `OptionList.css` or `Dropdown.css`; the list appears instantly [S] | **on** — `animate-in fade-in-0 zoom-in-95` + a per-side slide; utility list [S], 150ms/ease-out [R] (`tw-animate-css` not vendored) | OFF [S] |

### option

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background (rest) | 🔒 | **transparent** — declared (`selectable-background` → `color-transparent`) [S] | transparent — simply no background class [S] | transparent — `_md-comp-menu-item.scss` *explicitly* overrides `container-color` to `transparent` so a selected background can sit on top [S] |
| color | ⚪ | **on** — the only system that declares a colour on the option itself [S] | OFF — inherits the popup [S] | OFF — same role as the popup [S] |
| font | ⬜ | ⟡ `type-body` — **the same role as the trigger**; an option reads exactly like the value it will become [S] | `text-sm` — also the same as its trigger [S] | **`label-large`: 0.875rem/1.25rem at weight-MEDIUM 500** — a different role *and* a heavier weight than the trigger's `body-large` 400. M3 is the only system whose list does not typographically match its control [S] |
| letter-spacing | ⚪ | **0** [S] | OFF [S] | **0.00625rem** (`label-large-tracking`) — different from the trigger's 0.03125rem [S] |
| min-height | ⚪ | `calc(size-base + spacing-100)` → **24/36/48/60px** — an option row is deliberately **taller** than the trigger [S] | **OFF** — no height class; content-driven [S] | **48px** (`menu-list-item-container-height`; the standalone `_md-comp-list.scss` says 56px — the menu family wins, and the select's own file agrees with menu) [S] |
| padding | ⬜ | `calc(spacing-100 + spacing-25)` / `spacing-100` → **5/4 · 10/8 · 15/12 · 20/16 px** (10+16+10 = 36 = medium min-height exactly) [S] | **`6px 32px 6px 8px`** — the asymmetric right padding is the reserved lane for the checkmark, so it exists *only* because of the marker mechanism [S] | **`12px 16px`** — cross-file borrow [S] |
| gap | ⚪ | `spacing-100` → 4/8/12/16px [S] | **8px** (`gap-2`) [S] | **12px** (`list-item-between-space`) [S] |
| shape | ⚪ | OFF — flush to the popup edge [S] | **6px** (`rounded-sm`) — the only system that rounds an individual option, which is also why it pads the popup by 4px [S] | OFF [S] |
| cursor | ⚪ | **`pointer`** [S] | **`default`** — explicitly *not* a pointer, the native-menu convention [S] | OFF [S] |
| background @hover | ⚪ | `selectable-background-hover` → accent-weakest **`rgb(234,246,255)` / `rgb(0,23,54)`** [S] | **OFF — confirmed absent.** Radix focuses the item on pointermove, so the `focus:` rule below produces the hover appearance [S] | **state layer, `on-surface` @ 8%**, drawn as a `background-image` so it composites *over* a selected fill — cross-file borrow from `_md-comp-menu.scss` [S] |
| @active (highlighted) | ⚪ | `.saltOption-active` → **the identical value as hover**, through a different selector [S] | **`bg-accent` + `text-accent-foreground`** — the only system that also moves the **text** colour [S] | **state layer @ 10%** — two points heavier than its hover layer, which is why `activateOnHover` is off for M3 [S] |
| @focus-visible | ⚪ | **on** — `2px dotted` accent-stronger at `outline-offset: -2px`, set only after keyboard navigation and cleared by any mouseover. **No other system has a third highlight state** [S] | OFF — `outline-hidden`, background swap only [S] | OFF — `_md-comp-menu.scss` has focus-indicator tokens but the select file never references them [S] |
| @selected | ⚪ | `selectable-background-selected` → accent-weaker, **plus a three-layer box-shadow bracket** (a 2px accent-weakest strip left, a 1px accent ring shifted left, a 1px accent line on top) and `z-index: 1` so the bracket paints over the 1px inter-option gaps [S] | **OFF** — no selected background at all [S] | `surface-container-highest` [S] |
| @disabled | ⚪ | **opacity 0.4**, plus the rest colour and background *restated* (that is how Salt stops its own hover/active rules winning) and `cursor: not-allowed` [S] | **opacity 0.5** + `pointer-events: none` [S] | **opacity 0.38** — cross-file borrow; the select's own file has no option-disabled token [S] |
| selected marker box | ⚪ | OFF | **`right: 8px`, 14px box around a 16px CheckIcon** [S] | OFF |

### group label / separator

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| group label font | ⚪ | **LABEL typescale at semiBold 600** — 10/13 · 11/14 · 12/16 · 14/18 by density [S] | **`text-xs` at the ambient 400** — smaller than its options but **not bolder**, the exact inverse of Salt [S] | OFF |
| group label colour | ⚪ | `content-secondary-foreground` — **the same token as its placeholder** [S] | `text-muted-foreground` — **likewise the same token as its placeholder**. Two systems, one convention, arrived at independently [S] | OFF |
| group label box | ⚪ | **identical padding and min-height to an Option** — the label occupies a full row in the rhythm [S] | **`6px 8px`** — half an item's height; a caption, not a row [S] | OFF |
| group label background | ⚪ | **on** — re-declares the container background. Same value as the popup, but load-bearing: an opaque label stops a neighbouring selected option's bracket bleeding under it [S] | OFF [S] | OFF |
| group divider | ⚪ | **border-top on the GROUP** — `1px solid separable-tertiary-borderColor` (`rgba(0,0,0,0.2)` / `rgba(255,255,255,0.2)`), removed on `:first-of-type` [S] | OFF — uses the element instead [S] | OFF |
| separator element | ⚪ | OFF | **`h-px`, `my-1 -mx-1`, `bg-border`** — the negative inline margins make the rule bleed through the viewport's own 4px padding [S] | **1px, `surface-variant`**, full width (no divider inset token in the select/menu families) [S] |

### the axes, as generated rows

Every non-default axis value is a real CSS row that reassigns an indirection
custom property the base rows consume — mirroring each system's own
mechanism. `Dropdown.css` does exactly this: `.saltDropdown-secondary {
--dropdown-background: … }`, `.saltDropdown-error { --dropdown-borderColor: …
}`.

| row | Salt | shadcn | Material 3 |
|---|---|---|---|
| `style.trigger.variant@secondary` | **on** — marble `rgb(245,247,248)` / granite `rgb(26,34,41)` + 40a sibling [S] | OFF | OFF |
| `style.trigger.variant@tertiary` | **on** — limestone `rgb(250,248,242)` / leather `rgb(38,41,43)` + 40a sibling [S] | OFF | OFF |
| `style.trigger.status@error` | **on** — reassigns border, border-hover, border-active, focus-outline colour, background AND read-only background to `palette-negative` `rgb(229,33,53)` / `negative-weakest`. **Note `borderColor-hover` is pinned to the status colour** — an errored Salt dropdown does not go accent-blue on hover, where its Input's error block does the same but its non-error hover does [S] | **on** — border + focus-border + ring colour → `--destructive`, ring alpha 50% → **20% light / 40% dark**. Background, popup and options untouched [S] | **on** — outline, outline-hover (**`on-error-container`**, a different role), outline-focus, indicator, indicator-hover, indicator-focus. **No caret entry** — the select's caret tokens are `@deprecated`-and-removed [S] |
| `style.trigger.status@warning` | **on** — `palette-warning` `rgb(199,83,0)` [S] | **OFF — no warning state exists** [S] | **OFF — no `warning-*` token in either select file** [S] |
| `style.trigger.status@success` | **on** — `palette-positive` `rgb(0,135,93)` [S] | OFF [S] | OFF [S] |

**Accent scope trim.** Salt's `editable-borderColor-hover/-active` and every
`selectable-*` stop resolve through `palette-accent*`, which has a
`data-accent` axis (`blue` default, `teal` alternate). This column pins
**blue**, matching `button.salt.json` / `input.salt.json`; only
`calendar.salt.json` models `byAccent`. Recorded, not modelled.

### Cascade ordering, made explicit

Three source orderings had to be reproduced rather than assumed, because the
generator emits rules in template-row order and specificity would otherwise
decide:

1. **Selected beats hover and active.** `Option.css`'s
   `[aria-selected="true"]` block is the last in the file and therefore wins
   over `:hover` and `.saltOption-active` at equal specificity.
   `style.option.selected` is the last option row here, and the
   `:not([data-disabled])` guards on hover/active are wrapped in `:where()`
   so they add no specificity and cannot outrank it.
2. **Focus beats hover on the trigger.** `Dropdown.css` writes
   `.saltDropdown-bordered.saltDropdown:focus, …:focus:hover` — the doubled
   selector exists precisely to beat the hover rule. Reproduced by wrapping
   the hover guards in `:where()` so hover and focus tie on specificity and
   focus wins on order.
3. **Read-only beats focus on the border/indicator colour.** Salt's
   `[aria-readonly="true"]` rules come after the focus rules at equal
   specificity. Reproduced with a zero-specificity
   `:where(:not([data-readonly]))` on the two focus recolour rows — the focus
   *outline*, which Salt does **not** suppress for read-only, is deliberately
   left unguarded.

---

## Findings from building this matrix

1. **M3's outlined select is FILLED — which inverts the finding input
   recorded one component earlier.** `_md-comp-outlined-text-field.scss` has
   no `container-color` token at all, which is why input's
   `style.root.background@box` carries `transparent` for M3.
   `_md-comp-outlined-SELECT.scss` **does** have one:
   `$text-field-container-color: md-sys-color.$surface-container-highest`,
   the same value as filled, confirmed identical in `versions/latest` and
   `versions/v0_192`. So for select the filled/outlined axis moves only the
   edge mechanism and the corner shape, and `style.trigger.background@box` is
   off in **all three** columns. The row is kept anyway, precisely so a
   future reader does not "fix" it by copying input's answer across. Carrying
   input's conclusion over would have made every M3 outlined select
   transparent against source.
2. **shadcn's select reacts to the pointer; shadcn's input does not.**
   INPUT-MATRIX.md finding 5 recorded hover as a confirmed absence across the
   whole of `input.tsx`. `select.tsx` carries `dark:hover:bg-input/50` — a
   real hover background, in **dark mode only**. "shadcn has no hover" is
   therefore a per-component fact, not a system-wide one, and the light/dark
   asymmetry had to be pushed into the slots block (light = the sourced
   non-change) rather than smuggled into a cell.
3. **Three systems, three different selection markers — and one of them
   changes the option's box model.** shadcn: a trailing checkmark, no
   background change, and `pr-8` reserved on *every* item so the list does
   not jump when the selection moves. Salt: no glyph, an accent-weaker fill
   **plus a three-layer box-shadow bracket** and `z-index: 1` so the bracket
   paints across the 1px gaps between rows. M3: no glyph, a plain
   `surface-container-highest` fill. This is TOOLTIP-MATRIX.md's arrow lesson
   with the labels changed: collapsing the three into "a highlighted row"
   would have looked defensible in prose and been wrong on screen for all
   three.
4. **The popup is anchored differently, and it is placement, not offset.**
   Salt puts the list 1px below the trigger. shadcn's default is Radix's
   `item-aligned`, which places the popup so the **selected option lands on
   the trigger** — the list overlays the control. Two systems, two mental
   models of what a dropdown *is* (a panel that drops, versus a native-select
   menu that replaces). Modelled as a config'd axis with a skeleton branch
   that measures the selected row's `offsetTop`.
5. **Salt frames its popup in the ACCENT colour.** `OptionList.css`'s border
   is `var(--salt-selectable-borderColor-selected)` → `palette-accent` →
   blue-500 — the same token the selected option's bracket reads. So the list
   frame and the selection frame are literally one value, and a Salt option
   list is blue-edged rather than neutral-edged. shadcn uses `--border`
   (which, note, is **not** the `--input` token its trigger uses — they
   diverge in dark mode), and M3 has no border token at all: an M3 menu is
   elevation-only. Three systems, three answers to "does a popup have an
   edge".
6. **M3 declares the menu tokens inside select and then disowns them.** Both
   select token files carry a complete
   `md.comp.{filled,outlined}-select.menu.*` family. material-web's own
   hand-authored `tokens/_md-comp-{filled,outlined}-select.scss` then lists
   **every one of those `menu-*` tokens under `$unsupported-tokens`** — the
   shipped library composes the standalone `md-menu`. Both readings are used
   here: the select's own values win where it has them, and
   `_md-comp-menu.scss` fills the gaps. Where they **conflict**, the
   difference is real and material:
   `list-item-selected-container-color` is `secondary-container` (tinted) in
   the standalone menu and `surface-container-highest` (neutral) in both
   select files. This matrix takes the select's value and records the
   conflict rather than silently picking the prettier one.
7. **The two live systems disagree about the typeahead window by 2×, and
   about what focus even means.** Salt clears its typeahead buffer after
   **500ms** and *opens* the list on a printable key; Radix clears after
   **1000ms** and selects from the closed trigger without opening. And the
   focus models are structurally different: Salt keeps DOM focus on the
   trigger and drives `aria-activedescendant` (virtual focus), while Radix
   moves real DOM focus onto the item — which is the direct reason shadcn's
   highlight is a `focus:` rule and it has no `hover:` class at all.
   Two different mechanisms produce what looks like the same hover highlight.
8. **A `[R]` that had to be defended rather than assumed: M3's option does
   not highlight on hover the way the other two do.** `_md-comp-menu.scss`
   keeps `list-item-hover-state-layer-opacity` (0.08) and
   `list-item-focus-state-layer-opacity` (0.10) as **separate** values. If
   the skeleton had set the active state on pointer-move for every system —
   which is correct for Salt and for Radix — M3's 8% layer would have been
   unreachable and six extracted values would have been dead. That is exactly
   ALERT-MATRIX.md finding 10's failure mode, caught this time by asking the
   question before building. It is why `behavior.pointer-activates-option`
   exists as a config'd branch rather than as a hardcoded convenience.
   Relatedly, M3's state layers are modelled as `background-image:
   linear-gradient(<layer>, <layer>)` so they composite **over** a selected
   option's `background-color`, which is how a state layer actually works —
   a `background-color` overlay would have replaced the selection instead of
   layering on it.
9. **Frozen-token check, run in both directions, and it found a clamp rather
   than a snapshot.** Salt's chevron has no size rule in `Dropdown.css`; the
   box comes from `Icon.css`'s `--icon-size: max(calc(var(--salt-size-icon) *
   1), 12px)`. `size-icon` is 10/12/14/16 by density, so the rendered size is
   **12/12/14/16** — the high-density value is *clamped*, with Salt's own
   comment giving the reason ("Icons should never be smaller than 12px for
   readability"). This is the inverse of TOOLTIP-MATRIX.md's frozen arrow: a
   bare 12 that IS the token's medium value, but here it is a live floor, not
   a snapshot, and copying `size-icon` blindly would have made the
   high-density chevron 10px against source. Every other Salt literal was
   checked the same way: `spacing-fixed-100` (1px, the option gap) and
   `size-fixed-100/-200` are on the **fixed** scales, which
   `docs/foundations/sizes.md` and `spacing.md` state are density-invariant
   by design; `min-width: 4em` is em-relative and already tracks the
   density-driven font size. Nothing left frozen.
10. **The trigger's edge repeats input's split exactly; the *focus
    thickening* does not.** Salt's default is an underline that goes 1px → 2px
    on focus, the same mechanism and the same numbers as M3's filled select —
    except that M3's select goes to **3px**, not 2px, because material-web's
    hand-authored `_md-comp-filled-select.scss` overrides its own generated
    `focus-active-indicator-height` in `_get-override-tokens()` with a
    `TODO(b/259455114)` comment. A library overriding a token it generated
    itself is the second instance in this pipeline (after Salt's tooltip
    arrow) of "grep the source" returning two answers; the resolution here is
    the same as there — read one file further and take what the library
    actually ships, with the divergence declared.
11. **shadcn's select has a `size` prop its input does not, and Salt answers
    the same question with density.** `SelectTrigger` takes `size?: "sm" |
    "default"` → `h-8` / `h-9`; `Input` has no equivalent. Salt has no size
    prop either, because its trigger height is `--salt-size-base`, i.e. the
    density capability. Same design question ("how do I get a compact
    control?"), answered per-instance in one system and per-theme in another —
    which is why the harness puts them on two separate toggles rather than
    pretending they are one axis.
12. **Axis self-audit (run deliberately, per ALERT-MATRIX.md finding 10).**
    Every `channel: "config"` row whose cell is a list of two or more values,
    and what discriminates each value:
    - `structure.indicator` — Salt `[underline, box]`, M3 `[underline, box]`:
      `style.indicator.border@underline` (+ its hover/focus rows) vs
      `style.trigger.border@box` (+ `@box-hover`, `@box-focus`,
      `style.trigger.shape@box`, and for M3 `style.trigger.shape@box` = 4px);
      Salt additionally has `style.indicator.border@box-focus`. shadcn's
      `["box"]` is one value, so nothing to discriminate.
    - `prop.size` — shadcn `[default, sm]`: `style.trigger.min-height` (36px)
      vs `style.trigger.min-height@sm` (32px).
    - `prop.variant` — Salt `[primary, secondary, tertiary]`: the default
      background rows plus `style.trigger.variant@secondary` and
      `@tertiary`, each reassigning `--bg-current` / `--bg-current-disabled`.
    - `prop.validation-status` — Salt `[error, warning, success]`:
      `style.trigger.status@error` / `@warning` / `@success`, three real
      blocks with three different palette stops. shadcn `["error"]` and M3
      `["error"]` are single-value.
    - `prop.disabled` — all three `[true, false]`: `false` is the base
      rendering; `true` is discriminated by four colour rows plus
      `style.trigger.disabled` (Salt), by `style.trigger.disabled` alone
      (shadcn, whose one `opacity: 0.5` dims everything), and by four colour
      rows including the `@box-disabled` precision row (M3) — plus
      `style.option.disabled` in every column.
    - `prop.read-only` — Salt `[true, false]`: three `@readonly` CSS rows
      **and** a skeleton branch that removes the chevron and blocks opening.
      shadcn and M3 do not declare the prop at all, so there is no
      undiscriminated value to audit — a stricter position than input, where
      shadcn declared `readOnly` with no styling.
    **Result: no dead axis values.** The one row that is off in every column
    (`style.trigger.background@box`) is a *style* row, not a config axis, and
    is retained deliberately as documentation of Finding 1.
13. **A real generator-adjacent gap, declared: cascade order is load-bearing
    and nothing checks it.** Three source orderings had to be reproduced by
    hand with `:where()` (see "Cascade ordering, made explicit"). The
    generator emits rules in template-row order and has no notion of which
    rule *should* win; a mis-ordered row produces valid CSS, a passing build,
    and a hovered-selected option that renders the wrong colour. That is the
    same class of silent-pass ALERT-MATRIX.md finding 10 logged for config
    axes. Recorded as a tooling gap for the owner rather than fixed silently,
    since adding a cascade assertion is a contract-level change.
14. **A `var()` inside a custom-property declaration resolves where it is
    DECLARED, not where it is used — and it failed silently.** The popup's
    trigger-matched width was modelled correctly in every respect: Salt's
    `OptionList.css` reads `min-width: var(--overlay-minWidth)`, source writes
    `rects.reference.width` onto the floating element, the matrix said so, the
    skeleton measured the trigger and set `--select-trigger-width: 266px`
    inline on the popup, and the generator printed `OK`. The popup still
    rendered **190px narrower than its own trigger**. The cause is a CSS
    substitution rule: the column declared an intermediate slot
    `--popup-min-width: var(--select-trigger-width, 0px)` at *theme* scope,
    and a `var()` inside a custom-property declaration is substituted at the
    element that declares it — the theme root, where the skeleton's inline
    property does not exist. It resolved to the `0px` fallback there and
    inherited down as a computed `0px`, so the inline value could never win.
    Fixed by having the slot carry only the `0px` **default** and letting the
    rule read the property on the popup itself, where it is actually set.
    Two things generalise. **(a)** An intermediate slot whose value is a
    `var()` is not a neutral alias — it silently freezes the fallback unless
    every property it references is in scope at the declaring element.
    **(b)** The fallback made it worse: `var(--x, 0px)` turned a missing value
    into a plausible one, so nothing anywhere reported a failure. Both the
    generator's `var()` gate and the matrix's own review passed a popup that
    was visibly wrong on screen.
15. **The same render pass caught a second layout bug with the same
    signature — correct-looking rules, wrong output.** The popup is a column
    flexbox with a `max-height`; its option and group-label rows carried
    `flex-shrink: 0`, but the `select-listbox` and `select-group` *containers*
    did not. The containers were therefore compressed to the popup's height
    instead of overflowing it, and their non-shrinking children overlapped —
    a group label drawn on top of an option. Fixed in `base` (theme-invariant
    layout, where it belongs) by giving the containers `flex-shrink: 0`, so
    the listbox keeps its natural height and the popup scrolls as intended.
    The lesson is narrower than the last one but worth stating: in a
    constrained flex column, `flex-shrink: 0` on the leaves is not enough —
    every ancestor between the leaf and the scroll container needs it too.
16. **A locked behavior row that the skeleton silently did not implement —
    and the render looked fine.** `behavior.dismiss` is documented above for
    all three systems (Salt's floating-ui `useDismiss`, shadcn's Radix
    `DismissableLayer`, M3 per the APG listbox pattern). The skeleton
    implemented `Escape`, trigger-toggle and commit-on-select — but **not
    outside-interaction dismiss**. Every static screenshot looked correct,
    the generator passed, and the axis self-audit passed too, because the
    audit only checks that *config* values are discriminated by CSS; it has
    nothing to say about a `channel: "info"` behavior row whose chassis code
    is missing. It surfaced only when the owner tried to close a popup and
    could not. Fixed by adding a capture-phase `pointerdown` listener that
    closes when the press lands outside both the trigger and the popup.
    Three notes on the fix. **(a)** `pointerdown`, not `click`, because that
    is the event both real implementations dismiss on — a press beginning
    outside closes immediately rather than waiting for release. **(b)** It
    excludes presses inside the popup, so option commit still works.
    **(c)** It is skipped entirely while `forceOpen` is set, so the harness's
    pinned-open inspection row keeps ignoring dismissal by design.
    The generalisable gap: **behavior rows have no gate at all.** Style rows
    are checked for literals and unresolvable `var()`; config rows are now
    checked (by hand) for discrimination; behavior rows marked 🔒 are checked
    by nothing, in a pipeline whose rule 3 says a switched-on row the
    implementation cannot express is a FAILING build. A behavioural
    conformance harness — one assertion per locked behavior row, driven
    against the real skeleton — is the missing third gate. Logged for the
    owner alongside findings 13 and 14 rather than built here.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/select.template.json` against every system, read from `columns/select.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 36 light, 18 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `field-bg` | rgb(255, 255, 255) | rgb(16, 24, 32) | **no** |
| `field-bg-secondary` | rgb(245, 247, 248) | rgb(26, 34, 41) | **no** |
| `field-bg-tertiary` | rgb(250, 248, 242) | rgb(38, 41, 43) | **no** |
| `field-bg-disabled` | rgba(255, 255, 255, 0.4) | rgba(16, 24, 32, 0.4) | **no** |
| `field-bg-secondary-disabled` | rgba(245, 247, 248, 0.4) | rgba(26, 34, 41, 0.4) | **no** |
| `field-bg-tertiary-disabled` | rgba(250, 248, 242, 0.4) | rgba(38, 41, 43, 0.4) | **no** |
| `field-bg-readonly` | transparent | — | yes |
| `fg` | rgb(0, 0, 0) | rgb(255, 255, 255) | **no** |
| `fg-disabled` | rgba(0, 0, 0, 0.4) | rgba(255, 255, 255, 0.4) | **no** |
| `fg-secondary` | rgb(76, 81, 87) | rgb(177, 181, 185) | yes |
| `border` | rgb(114, 119, 125) | — | **no** |
| `border-hover` | rgb(0, 120, 207) | — | **no** |
| `border-active` | rgb(0, 69, 126) | rgb(154, 189, 245) | **no** |
| `border-readonly` | rgba(114, 119, 125, 0.1) | — | **no** |
| `border-disabled` | rgba(114, 119, 125, 0.4) | — | **no** |
| `accent` | rgb(0, 120, 207) | — | **no** |
| `accent-weakest` | rgb(234, 246, 255) | rgb(0, 23, 54) | **no** |
| `accent-weaker` | rgb(199, 222, 255) | rgb(0, 45, 89) | **no** |
| `status-error` | rgb(229, 33, 53) | — | **no** |
| `status-warning` | rgb(199, 83, 0) | — | **no** |
| `status-success` | rgb(0, 135, 93) | — | **no** |
| `status-error-bg` | rgb(255, 236, 234) | rgb(69, 0, 2) | **no** |
| `status-warning-bg` | rgb(255, 236, 217) | rgb(66, 32, 0) | **no** |
| `status-success-bg` | rgb(234, 245, 242) | rgb(0, 41, 21) | **no** |
| `popup-bg` | rgb(255, 255, 255) | rgb(16, 24, 32) | yes |
| `popup-shadow` | 0 6px 10px 0 rgba(0, 0, 0, 0.2) | 0 6px 10px 0 rgba(0, 0, 0, 0.55) | yes |
| `separator-color` | rgba(0, 0, 0, 0.2) | rgba(255, 255, 255, 0.2) | yes |
| `popup-gap` | 1px | — | yes |
| `bg-current` | var(--field-bg) | — | **no** |
| `bg-current-disabled` | var(--field-bg-disabled) | — | **no** |
| `bg-current-readonly` | var(--field-bg-readonly) | — | **no** |
| `border-current` | var(--border) | — | **no** |
| `border-current-hover` | var(--border-hover) | — | **no** |
| `border-current-active` | var(--border-active) | — | **no** |
| `outline-current` | var(--border-active) | — | **no** |
| `select-trigger-width` | 0px | — | **no** |

**shadcn** — 27 light, 13 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `field-bg` | transparent | color-mix(in oklab, oklch(1 0 0 / 15%) 30%, transparent) | yes |
| `field-bg-hover` | transparent | color-mix(in oklab, oklch(1 0 0 / 15%) 50%, transparent) | yes |
| `fg` | oklch(0% 0 0) | oklch(0.985 0 0) | yes |
| `fg-secondary` | oklch(0.556 0 0) | oklch(0.708 0 0) | yes |
| `border-base` | oklch(0.922 0 0) | oklch(1 0 0 / 15%) | yes |
| `popup-border` | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | yes |
| `popup-bg` | oklch(1 0 0) | oklch(0.205 0 0) | **no** |
| `popup-fg` | oklch(0% 0 0) | oklch(0.985 0 0) | **no** |
| `accent-bg` | oklch(0.97 0 0) | oklch(0.371 0 0) | **no** |
| `accent-fg` | oklch(0.205 0 0) | oklch(0.985 0 0) | **no** |
| `focus` | oklch(0.708 0 0) | oklch(0.556 0 0) | yes |
| `danger` | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | yes |
| `shadow-color` | rgb(0 0 0 / 0.05) | — | yes |
| `popup-shadow` | 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) | — | yes |
| `radius-control` | calc(0.625rem * 0.8) | — | **no** |
| `radius-popup` | calc(0.625rem * 0.8) | — | **no** |
| `radius-option` | calc(0.625rem * 0.6) | — | **no** |
| `type-body` | 400 0.875rem/1.25rem ui-sans-serif, system-ui, sans-serif | — | yes |
| `type-group-label` | 400 0.75rem/1rem ui-sans-serif, system-ui, sans-serif | — | yes |
| `ring-alpha` | 50% | — | **no** |
| `ring-alpha-invalid` | 20% | 40% | **no** |
| `bg-current` | var(--field-bg) | — | **no** |
| `bg-current-hover` | var(--field-bg-hover) | — | **no** |
| `border-current` | var(--border-base) | — | **no** |
| `border-current-active` | var(--focus) | — | **no** |
| `ring-current` | var(--focus) | — | **no** |
| `ring-alpha-current` | var(--ring-alpha) | — | **no** |

**m3** — 35 light, 22 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `trigger-bg` | #e6e0e9 | #36343b | yes |
| `trigger-bg-hover` | color-mix(in oklab, #1d1b20 8%, #e6e0e9) | color-mix(in oklab, #e6e0e9 8%, #36343b) | yes |
| `trigger-bg-disabled` | color-mix(in oklab, #1d1b20 4%, transparent) | color-mix(in oklab, #e6e0e9 4%, transparent) | yes |
| `fg` | #1d1b20 | #e6e0e9 | **no** |
| `fg-disabled` | color-mix(in oklab, #1d1b20 38%, transparent) | color-mix(in oklab, #e6e0e9 38%, transparent) | **no** |
| `fg-secondary` | #49454f | #cac4d0 | yes |
| `indicator` | #49454f | #cac4d0 | **no** |
| `indicator-hover-color` | #1d1b20 | #e6e0e9 | **no** |
| `indicator-focus-color` | #6750a4 | #d0bcff | **no** |
| `indicator-disabled` | color-mix(in oklab, #1d1b20 38%, transparent) | color-mix(in oklab, #e6e0e9 38%, transparent) | **no** |
| `outline` | #79747e | #938f99 | **no** |
| `outline-hover-color` | #1d1b20 | #e6e0e9 | **no** |
| `outline-focus-color` | #6750a4 | #d0bcff | **no** |
| `outline-disabled` | color-mix(in oklab, #1d1b20 12%, transparent) | color-mix(in oklab, #e6e0e9 12%, transparent) | **no** |
| `status-error` | #b3261e | #f2b8b5 | **no** |
| `status-error-hover` | #410e0b | #f9dedc | **no** |
| `popup-bg` | #f3edf7 | #211f26 | yes |
| `popup-fg` | #1d1b20 | #e6e0e9 | **no** |
| `popup-shadow` | 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15) | — | yes |
| `option-bg-selected` | #e6e0e9 | #36343b | **no** |
| `option-layer-hover` | color-mix(in oklab, #1d1b20 8%, transparent) | color-mix(in oklab, #e6e0e9 8%, transparent) | **no** |
| `option-layer-focus` | color-mix(in oklab, #1d1b20 12%, transparent) | color-mix(in oklab, #e6e0e9 12%, transparent) | **no** |
| `separator-color` | #e7e0ec | #49454f | yes |
| `type-body` | 400 1rem/1.5rem 'Roboto', sans-serif | — | **no** |
| `type-option` | 500 0.875rem/1.25rem 'Roboto', sans-serif | — | **no** |
| `bg-current` | var(--trigger-bg) | — | **no** |
| `bg-current-hover` | var(--trigger-bg-hover) | — | **no** |
| `bg-current-disabled` | var(--trigger-bg-disabled) | — | **no** |
| `border-current` | var(--outline) | — | **no** |
| `border-current-hover` | var(--outline-hover-color) | — | **no** |
| `border-current-active` | var(--outline-focus-color) | — | **no** |
| `indicator-current` | var(--indicator) | — | **no** |
| `indicator-current-hover` | var(--indicator-hover-color) | — | **no** |
| `indicator-current-active` | var(--indicator-focus-color) | — | **no** |
| `select-trigger-width` | 0px | — | **no** |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.trigger` | structure | locked | — | — | — |
| 2 | `structure.indicator` | structure | switchable | `underline, box` | `box` | `underline, box` |
| 3 | `structure.start-adornment` | structure | switchable | `True` | **off** | `True` |
| 4 | `structure.status-adornment` | structure | switchable | `True` | **off** | **off** |
| 5 | `structure.toggle-icon` | structure | default | `swap` | `static` | `static` |
| 6 | `structure.popup` | structure | locked | — | — | — |
| 7 | `structure.popup-ownership` | structure | locked | — | — | — |
| 8 | `structure.option-group` | structure | switchable | `True` | `True` | **off** |
| 9 | `structure.separator` | structure | switchable | **off** | `True` | `True` |
| 10 | `structure.selected-marker` | structure | locked | `fill` | `check` | `fill` |
| 11 | `structure.popup-anchor` | structure | locked | `below` | `overlay` | `below` |
| 12 | `behavior.open-trigger` | behavior | locked | — | — | — |
| 13 | `behavior.typeahead` | behavior | locked | — | — | — |
| 14 | `behavior.focus-model` | behavior | locked | — | — | — |
| 15 | `behavior.pointer-activates-option` | behavior | switchable | `True` | `True` | `False` |
| 16 | `behavior.positioning-engine` | behavior | locked | — | — | — |
| 17 | `behavior.status-inheritance` | behavior | switchable | `True` | **off** | **off** |
| 18 | `behavior.empty-readonly-marker` | behavior | switchable | `—` | **off** | **off** |
| 19 | `behavior.readonly-suppresses-popup` | behavior | switchable | `True` | **off** | **off** |
| 20 | `behavior.multiselect` | behavior | switchable | `True` | **off** | **off** |
| 21 | `prop.size` | prop | switchable | **off** | `default, sm` | **off** |
| 22 | `prop.variant` | prop | switchable | `primary, secondary, tertiary` | **off** | **off** |
| 23 | `prop.validation-status` | prop | switchable | `error, warning, success` | `error` | `error` |
| 24 | `prop.disabled` | prop | locked | `True, False` | `True, False` | `True, False` |
| 25 | `prop.read-only` | prop | switchable | `True, False` | **off** | **off** |
| 26 | `slot.value` | slot | locked | — | — | — |
| 27 | `slot.option-content` | slot | locked | — | — | — |
| 28 | `slot.start-adornment` | slot | switchable | `True` | **off** | `True` |
| 29 | `slot.group-label` | slot | switchable | `True` | `True` | **off** |
| 30 | `slot.composes` | slot | default | — | — | — |
| 31 | `state.open-closed` | state | locked | — | — | — |
| 32 | `state.trigger-hover-focus` | state | locked | — | — | — |
| 33 | `state.option` | state | locked | — | — | — |
| 34 | `state.disabled` | state | locked | — | — | — |
| 35 | `state.read-only` | state | switchable | `True` | **off** | **off** |
| 36 | `state.validation` | state | locked | — | — | — |
| 37 | `style.trigger.background` | style | locked | ⟡ `bg-current` | ⟡ `bg-current` | ⟡ `bg-current` |
| 38 | `style.trigger.background@box` | style | switchable | **off** | **off** | **off** |
| 39 | `style.trigger.color` | style | locked | ⟡ `fg` | ⟡ `fg` | ⟡ `fg` |
| 40 | `style.trigger.font` | style | default | ⟡ `type-body` | ⟡ `type-body` | ⟡ `type-body` |
| 41 | `style.trigger.letter-spacing` | style | switchable | `0` | **off** | `0.03125rem` |
| 42 | `style.trigger.width` | style | default | `100%` | `fit-content` | `100%` |
| 43 | `style.trigger.min-height` | style | default | ⟡ `control-height` | `36px` | **off** |
| 44 | `style.trigger.min-height@sm` | style | switchable | **off** | `32px` | **off** |
| 45 | `style.trigger.min-width` | style | switchable | `4em` | **off** | **off** |
| 46 | `style.trigger.padding` | style | default | ⟡ `field-padding` | `8px 12px` | `16px` |
| 47 | `style.trigger.gap` | style | switchable | ⟡ `field-gap` | `8px` | `16px` |
| 48 | `style.trigger.shape` | style | default | ⟡ `corner-weak` | ⟡ `radius-control` | `4px 4px 0 0` |
| 49 | `style.trigger.shape@box` | style | switchable | **off** | **off** | `4px` |
| 50 | `style.trigger.cursor` | style | switchable | `pointer` | **off** | **off** |
| 51 | `style.trigger.shadow` | style | switchable | **off** | `0 1px 2px 0 var(--shadow-color)` | **off** |
| 52 | `style.trigger.transition` | style | switchable | **off** | `color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)` | **off** |
| 53 | `style.trigger.border@box` | style | switchable | `border-width: 1px; border-style: solid; border-color: var(--border-current)` | `border-width: 1px; border-style: solid; border-color: var(--border-current)` | `border-width: 1px; border-style: solid; border-color: var(--border-current)` |
| 54 | `style.indicator.border@underline` | style | switchable | `border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: var(--border-current)` | **off** | `border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: var(--indicator-current)` |
| 55 | `style.trigger.background@hover` | style | switchable | **off** | ⟡ `bg-current-hover` | ⟡ `bg-current-hover` |
| 56 | `style.trigger.border@box-hover` | style | switchable | `border-color: var(--border-current-hover)` | **off** | `border-color: var(--border-current-hover)` |
| 57 | `style.indicator.border@underline-hover` | style | switchable | `border-bottom-color: var(--border-current-hover)` | **off** | `border-bottom-color: var(--indicator-current-hover)` |
| 58 | `style.trigger.border@box-focus` | style | switchable | `border-color: var(--border-current-active)` | `border-color: var(--border-current-active)` | `border-width: 2px; border-color: var(--border-current-active)` |
| 59 | `style.indicator.border@underline-focus` | style | switchable | `border-bottom-width: 2px; border-bottom-color: var(--border-current-active)` | **off** | `border-bottom-width: 3px; border-bottom-color: var(--indicator-current-active)` |
| 60 | `style.indicator.border@box-focus` | style | switchable | `border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: var(--border-current-active)` | **off** | **off** |
| 61 | `style.trigger.focus` | style | switchable | `outline: 2px dotted var(--outline-current)` | `outline: none; box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring-current) var(--ring-alpha-current), transparent), 0 1px 2px 0 var(--shadow-color)` | **off** |
| 62 | `style.trigger.background@readonly` | style | switchable | ⟡ `bg-current-readonly` | **off** | **off** |
| 63 | `style.trigger.border-color@readonly` | style | switchable | ⟡ `border-readonly` | **off** | **off** |
| 64 | `style.indicator.border-color@readonly` | style | switchable | ⟡ `border-readonly` | **off** | **off** |
| 65 | `style.trigger.background@disabled` | style | switchable | ⟡ `bg-current-disabled` | **off** | ⟡ `bg-current-disabled` |
| 66 | `style.trigger.background@box-disabled` | style | switchable | **off** | **off** | `var(--trigger-bg)` |
| 67 | `style.trigger.color@disabled` | style | switchable | ⟡ `fg-disabled` | **off** | ⟡ `fg-disabled` |
| 68 | `style.trigger.border-color@disabled` | style | switchable | ⟡ `border-disabled` | **off** | ⟡ `outline-disabled` |
| 69 | `style.indicator.border-color@disabled` | style | switchable | ⟡ `border-disabled` | **off** | ⟡ `indicator-disabled` |
| 70 | `style.trigger.disabled` | style | switchable | `cursor: not-allowed` | `opacity: 0.5; cursor: not-allowed` | **off** |
| 71 | `style.value.placeholder` | style | switchable | `color: var(--fg-secondary); font-weight: 300` | `color: var(--fg-secondary)` | **off** |
| 72 | `style.toggle-icon.size` | style | switchable | `width: var(--toggle-icon-size); height: var(--toggle-icon-size)` | `width: 16px; height: 16px` | `width: 24px; height: 24px` |
| 73 | `style.toggle-icon.color` | style | switchable | **off** | `color: var(--fg-secondary); opacity: 0.5` | `color: var(--fg-secondary)` |
| 74 | `style.adornment.size` | style | switchable | ⟡ `toggle-icon-size` | **off** | `24px` |
| 75 | `style.status-adornment.size` | style | switchable | `height: var(--adornment-size); width: var(--adornment-size)` | **off** | **off** |
| 76 | `style.status-adornment.color` | style | switchable | ⟡ `border-current` | **off** | **off** |
| 77 | `style.popup.background` | style | locked | ⟡ `popup-bg` | ⟡ `popup-bg` | ⟡ `popup-bg` |
| 78 | `style.popup.color` | style | locked | ⟡ `fg` | ⟡ `popup-fg` | ⟡ `popup-fg` |
| 79 | `style.popup.border` | style | switchable | `border-width: 1px; border-style: solid; border-color: var(--accent)` | `border-width: 1px; border-style: solid; border-color: var(--popup-border)` | **off** |
| 80 | `style.popup.shape` | style | default | ⟡ `popup-corner` | ⟡ `radius-popup` | `4px` |
| 81 | `style.popup.shadow` | style | switchable | ⟡ `popup-shadow` | ⟡ `popup-shadow` | ⟡ `popup-shadow` |
| 82 | `style.popup.padding` | style | default | `0` | `4px` | `8px 0` |
| 83 | `style.popup.gap` | style | switchable | ⟡ `popup-gap` | **off** | **off** |
| 84 | `style.popup.min-width` | style | switchable | ⟡ `select-trigger-width` | `8rem` | ⟡ `select-trigger-width` |
| 85 | `style.popup.max-height` | style | switchable | ⟡ `popup-max-height` | **off** | **off** |
| 86 | `style.popup.z-index` | style | default | `1500` | `50` | **off** |
| 87 | `style.popup.animation` | style | switchable | **off** | `select-popup-in 150ms ease-out` | **off** |
| 88 | `style.option.background` | style | locked | `transparent` | `transparent` | `transparent` |
| 89 | `style.option.color` | style | switchable | ⟡ `fg` | **off** | **off** |
| 90 | `style.option.font` | style | default | ⟡ `type-body` | ⟡ `type-body` | ⟡ `type-option` |
| 91 | `style.option.letter-spacing` | style | switchable | `0` | **off** | `0.00625rem` |
| 92 | `style.option.min-height` | style | switchable | ⟡ `option-min-height` | **off** | `48px` |
| 93 | `style.option.padding` | style | default | ⟡ `option-padding` | `6px 32px 6px 8px` | `12px 16px` |
| 94 | `style.option.gap` | style | switchable | ⟡ `field-gap` | `8px` | **off** |
| 95 | `style.option.shape` | style | switchable | **off** | ⟡ `radius-option` | **off** |
| 96 | `style.option.cursor` | style | switchable | `pointer` | `default` | **off** |
| 97 | `style.option.background@hover` | style | switchable | `background-color: var(--accent-weakest)` | **off** | `background-image: linear-gradient(var(--option-layer-hover), var(--option-layer-hover))` |
| 98 | `style.option.active` | style | switchable | `background-color: var(--accent-weakest)` | `background-color: var(--accent-bg); color: var(--accent-fg)` | `background-image: linear-gradient(var(--option-layer-focus), var(--option-layer-focus))` |
| 99 | `style.option.focus-visible` | style | switchable | `outline: 2px dotted var(--border-active); outline-offset: -2px` | **off** | **off** |
| 100 | `style.option.disabled` | style | switchable | `opacity: 0.4; cursor: not-allowed; color: var(--fg); background-color: transparent` | `opacity: 0.5; pointer-events: none` | `opacity: 0.3` |
| 101 | `style.option.selected` | style | switchable | `background-color: var(--accent-weaker); z-index: 1; box-shadow: -2px 0 0 0 var(--accent-weakest), -1px 0 0 1px var(--accent), 0 -1px 0 var(--accent)` | **off** | `background-color: var(--option-bg-selected)` |
| 102 | `style.selected-marker.box` | style | switchable | **off** | `right: 8px; width: 14px; height: 14px` | **off** |
| 103 | `style.group-label.font` | style | switchable | ⟡ `type-group-label` | ⟡ `type-group-label` | **off** |
| 104 | `style.group-label.color` | style | switchable | ⟡ `fg-secondary` | ⟡ `fg-secondary` | **off** |
| 105 | `style.group-label.padding` | style | switchable | `padding: var(--option-padding); min-height: var(--option-min-height)` | `padding: 6px 8px` | **off** |
| 106 | `style.group-label.background` | style | switchable | ⟡ `popup-bg` | **off** | **off** |
| 107 | `style.group.border-top` | style | switchable | `border-top: 1px solid var(--separator-color)` | **off** | **off** |
| 108 | `style.separator` | style | switchable | **off** | `height: 1px; margin: 4px -4px; background-color: var(--popup-border); pointer-events: none` | `height: 1px; background-color: var(--separator-color)` |
| 109 | `style.trigger.variant@secondary` | style | switchable | `--bg-current: var(--field-bg-secondary); --bg-current-disabled: var(--field-bg-secondary-disabled)` | **off** | **off** |
| 110 | `style.trigger.variant@tertiary` | style | switchable | `--bg-current: var(--field-bg-tertiary); --bg-current-disabled: var(--field-bg-tertiary-disabled)` | **off** | **off** |
| 111 | `style.trigger.status@error` | style | switchable | `--border-current: var(--status-error); --border-current-hover: var(--status-error); --border-current-active: var(--status-error); --outline-current: var(--status-error); --bg-current: var(--status-error-bg); --bg-current-readonly: var(--status-error-bg)` | `--border-current: var(--danger); --border-current-active: var(--danger); --ring-current: var(--danger); --ring-alpha-current: var(--ring-alpha-invalid)` | `--border-current: var(--status-error); --border-current-hover: var(--status-error-hover); --border-current-active: var(--status-error); --indicator-current: var(--status-error); --indicator-current-hover: var(--status-error-hover); --indicator-current-active: var(--status-error)` |
| 112 | `style.trigger.status@warning` | style | switchable | `--border-current: var(--status-warning); --border-current-hover: var(--status-warning); --border-current-active: var(--status-warning); --outline-current: var(--status-warning); --bg-current: var(--status-warning-bg); --bg-current-readonly: var(--status-warning-bg)` | **off** | **off** |
| 113 | `style.trigger.status@success` | style | switchable | `--border-current: var(--status-success); --border-current-hover: var(--status-success); --border-current-active: var(--status-success); --outline-current: var(--status-success); --bg-current: var(--status-success-bg); --bg-current-readonly: var(--status-success-bg)` | **off** | **off** |

<details><summary>Citations — 256 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.indicator` | salt | Dropdown.tsx bordered?: boolean, default false; Dropdown.css .saltDropdown-bordered vs .saltDropdown-activationIndicator |
| `structure.indicator` | shadcn | select.tsx SelectTrigger: `rounded-md border border-input` |
| `structure.indicator` | m3 | _md-comp-filled-select.scss text-field-active-indicator-color/-height vs _md-comp-outlined-select.scss text-field-outline-color/-width |
| `structure.start-adornment` | salt | Dropdown.tsx startAdornment prop -> .saltDropdown-startAdornmentContainer. NOTE there is no endAdornment prop on Dropdown, unlike Input. |
| `structure.start-adornment` | shadcn | SelectTrigger renders {children} followed by a fixed SelectPrimitive.Icon and has no leading slot. A consumer can put an icon inside SelectValue's children, but that is consumer content, not a component part. |
| `structure.start-adornment` | m3 | text-field-leading-icon-size 24px + text-field-leading-icon-color -> on-surface-variant (both files) |
| `structure.status-adornment` | salt | Dropdown.tsx: {!disabled && validationStatus && <StatusAdornment status={validationStatus} />} |
| `structure.status-adornment` | shadcn | no validation glyph concept at all |
| `structure.status-adornment` | m3 | M3 RECOLOURS a trailing icon on error (text-field-error-trailing-icon-color) but never inserts one — the glyph is always consumer-supplied. The same precise distinction input.m3.json recorded. |
| `structure.toggle-icon` | salt | Dropdown.tsx ExpandIcon({open}) returns useIcon().CollapseIcon when open and useIcon().ExpandIcon when closed — two different glyphs; and the whole icon is omitted when readOnly ({!readOnly && <ExpandIcon .../>}) |
| `structure.toggle-icon` | shadcn | select.tsx <SelectPrimitive.Icon asChild><ChevronDownIcon className="size-4 opacity-50" /></SelectPrimitive.Icon> — one glyph, never swapped, never conditional |
| `structure.toggle-icon` | m3 | text-field-trailing-icon-size 24px, text-field-trailing-icon-color -> on-surface-variant |
| `structure.option-group` | salt | packages/core/src/option/OptionGroup.tsx — role="group", aria-labelledby to an aria-hidden label div |
| `structure.option-group` | shadcn | select.tsx SelectGroup (Radix Group, role="group") + SelectLabel |
| `structure.option-group` | m3 | no group, group-label, subheader or overline token in either select file, in versions/v0_192/_md-comp-menu.scss (eight keys) or in versions/v0_192/_md-comp-list.scss — a confirmed absence, re-verified against the pinned edition. latest's list file adds an overline family (list-item-disabled-overline-*, list-item-selected-overline-color), which is still not a group. |
| `structure.separator` | salt | Salt has no separator component in the option package. The same visual job is done by a border-top on the OptionGroup itself — a different mechanism, recorded as style.group.border-top rather than as a missing part. |
| `structure.separator` | shadcn | select.tsx SelectSeparator — `pointer-events-none -mx-1 my-1 h-px bg-border` |
| `structure.separator` | m3 | menu-divider-height 1px + menu-divider-color -> surface-variant |
| `structure.selected-marker` | salt | Option.tsx renders CheckboxIcon ONLY when multiselect (out of scope); a single-select Salt option is marked by Option.css's [aria-selected="true"] background + box-shadow bracket, with no glyph at all |
| `structure.selected-marker` | shadcn | select.tsx SelectItem renders <span data-slot="select-item-indicator" class="absolute right-2 flex size-3.5 …"><SelectPrimitive.ItemIndicator><CheckIcon className="size-4"/></SelectPrimitive.ItemIndicator></span>, and every item reserves pr-8 for it |
| `structure.selected-marker` | m3 | menu-list-item-selected-container-color -> surface-container-highest. There is no checkmark or trailing-indicator token for the selected state anywhere in the select or menu families. |
| `structure.popup-anchor` | salt | Dropdown.tsx useFloatingUI({ placement: "bottom-start", middleware: [offset(1), size({...}), flip({fallbackStrategy:"initialPlacement"})] }) — 1px below the trigger, left edges aligned |
| `structure.popup-anchor` | shadcn | select.tsx SelectContent `position = "item-aligned"` default — see the item-aligned-default provenance entry and the docs page's 'Align Item With Trigger' section |
| `structure.popup-anchor` | m3 | [R] — no live component and no anchoring token; recorded as "below" per M3's published exposed-dropdown-menu convention, flagged rather than presented as sourced |
| `behavior.pointer-activates-option` | salt | Option.tsx handleMouseOver -> setActive(optionValue); Dropdown.tsx handleListMouseOver -> setFocusVisibleState(false), so a pointer makes the option active but suppresses the focus-visible outline |
| `behavior.pointer-activates-option` | shadcn | Radix select.tsx focuses the item element on pointermove, which is precisely why shadcn styles the highlight with focus: rather than hover: |
| `behavior.pointer-activates-option` | m3 | [R], but token-backed: the list-item family keeps HOVER and FOCUS as separate states with different opacities — versions/v0_192/_md-comp-list.scss list-item-hover-state-layer-opacity -> 0.08 and list-item-focus-state-layer-opacity -> 0.12. Modelling a pointer hover as focus would make the 8% layer unreachable, which is precisely the dead-value bug ALERT-MATRIX.md finding 10 was about. THE GAP WIDE |
| `behavior.status-inheritance` | salt | Dropdown.tsx useFormFieldProps() — see the form-field-context provenance entry, including the necessity channel Input does not read |
| `behavior.status-inheritance` | shadcn | no context channel — the docs' Invalid section tells the consumer to put data-invalid on Field AND aria-invalid on SelectTrigger by hand |
| `behavior.status-inheritance` | m3 | [R] — no context mechanism exists in a tokens-only clone |
| `behavior.empty-readonly-marker` | salt | Dropdown.tsx emptyReadOnlyMarker = "—"; valueText = readOnly && displayedValue === "" ? emptyReadOnlyMarker : displayedValue |
| `behavior.empty-readonly-marker` | shadcn | no equivalent |
| `behavior.empty-readonly-marker` | m3 | no equivalent concept |
| `behavior.readonly-suppresses-popup` | salt | Dropdown.tsx handleOpenChange early-returns on readOnly; handleKeyDown early-returns on readOnly; {!readOnly && <ExpandIcon/>}; OptionList open={... && !readOnly && ...}; aria-readonly="true" on the button |
| `behavior.readonly-suppresses-popup` | shadcn | Radix's Select has no readOnly prop at all — unlike shadcn's Input, where the native attribute at least exists with no styling |
| `behavior.readonly-suppresses-popup` | m3 | no read-only token in either select file |
| `behavior.multiselect` | salt | Dropdown.tsx multiselect?: boolean; Option.tsx {multiselect && <CheckboxIcon checked={selected} />} |
| `behavior.multiselect` | shadcn | Radix's Select is single-choice only; there is no `multiple` prop |
| `behavior.multiselect` | m3 | no multi-select vocabulary in the select or menu token families |
| `prop.size` | salt | no size prop — trigger height is --salt-size-base, i.e. the DENSITY capability rather than a per-instance prop. The nearest thing to shadcn's size axis is the density toggle. |
| `prop.size` | shadcn | select.tsx SelectTrigger size?: "sm" \| "default" = "default" -> data-size -> data-[size=default]:h-9 / data-[size=sm]:h-8 |
| `prop.size` | m3 | one container-height token, no size axis |
| `prop.variant` | salt | Dropdown.tsx variant?: "primary" \| "secondary" \| "tertiary", default "primary" |
| `prop.variant` | shadcn | no background-intensity axis |
| `prop.variant` | m3 | M3's only variant axis IS filled-vs-outlined, already modelled as structure.indicator; recording it twice would invent a second axis M3 does not have |
| `prop.validation-status` | salt | Dropdown.tsx validationStatus?: FormFieldValidationStatus |
| `prop.validation-status` | shadcn | select.tsx aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 |
| `prop.validation-status` | m3 | _md-comp-{filled,outlined}-select.scss text-field-error-* family |
| `prop.disabled` | salt | Dropdown.tsx disabled prop, OR-ed with form-field context; written onto the <button> as the native disabled attribute |
| `prop.disabled` | shadcn | select.tsx disabled:cursor-not-allowed disabled:opacity-50 on the trigger; data-[disabled]:pointer-events-none data-[disabled]:opacity-50 on the item |
| `prop.disabled` | m3 | disabled-* opacity family: container 0.04 (filled only), outline 0.12 (outlined only), active-indicator 0.38 (filled only), input-text 0.38, label-text 0.38, leading/trailing icon 0.38 |
| `prop.read-only` | salt | Dropdown.tsx readOnly prop, OR-ed with form-field context; expressed as aria-readonly because a <button> has no native readonly |
| `prop.read-only` | shadcn | no readOnly prop exists |
| `prop.read-only` | m3 | no read-only token |
| `style.trigger.background` | m3 | the SAME container colour for both variants — see the outlined-select-IS-filled provenance entry |
| `style.trigger.background@box` | salt | `bordered` declares a border and nothing else (Dropdown.css .saltDropdown-bordered.saltDropdown) — the background is untouched. A confirmed non-variation. |
| `style.trigger.background@box` | shadcn | box is shadcn's only mode; already covered by style.trigger.background |
| `style.trigger.background@box` | m3 | CONFIRMED, and the opposite of input's answer: _md-comp-outlined-select.scss DOES carry text-field-container-color -> surface-container-highest, identical to filled, in both editions. There is nothing for this row to change. |
| `style.trigger.color` | shadcn | ambient --foreground; SelectTrigger sets no text-colour class |
| `style.trigger.color` | m3 | text-field-input-text-color -> on-surface |
| `style.trigger.font` | m3 | text-field-input-text-font/-size/-weight/-line-height -> body-large |
| `style.trigger.letter-spacing` | salt | Dropdown.css letter-spacing: var(--salt-text-letterSpacing) -> next/characteristics/text.css: 0 |
| `style.trigger.letter-spacing` | shadcn | no tracking utility |
| `style.trigger.letter-spacing` | m3 | text-field-input-text-tracking -> body-large-tracking |
| `style.trigger.width` | salt | Dropdown.css .saltDropdown { width: 100% } — a Salt dropdown fills its container |
| `style.trigger.width` | shadcn | select.tsx SelectTrigger `w-fit` — shadcn's trigger is sized to its content, not to its container; every example that wants a fixed width passes className="w-[180px]" |
| `style.trigger.width` | m3 | [R] — no width token; a container-relative select is M3's published layout for an exposed dropdown menu, and it matches the harness's Salt column so the two are comparable. Flagged. |
| `style.trigger.min-height` | shadcn | select.tsx data-[size=default]:h-9; density-invariant (shadcn has no density capability) |
| `style.trigger.min-height` | m3 | DECLARED GAP. Was 56px, sourced from text-field-container-height in versions/latest/sass/_md-comp-{filled,outlined}-select.scss — a token that arrives there already @deprecated ('Removing fixed height token due to conflicts with text fields variants requiring dynamic height.'). versions/v0_192 has no height token in either select file. WHAT THE CONSUMER LOSES: an explicit minimum trigger height. I |
| `style.trigger.min-height@sm` | salt | no size prop — see prop.size |
| `style.trigger.min-height@sm` | shadcn | select.tsx data-[size=sm]:h-8 |
| `style.trigger.min-height@sm` | m3 | no size axis |
| `style.trigger.min-width` | salt | Dropdown.css min-width: 4em — a bare literal, not even behind an override variable |
| `style.trigger.min-width` | shadcn | no min-width utility — w-fit alone sizes the trigger |
| `style.trigger.min-width` | m3 | no width token |
| `style.trigger.padding` | shadcn | select.tsx px-3 py-2 — note py-2, where shadcn's own Input is py-1 |
| `style.trigger.padding` | m3 | top/bottom/leading/trailing-space, tokens/_md-comp-{filled,outlined}-field.scss — a DECLARED CROSS-COMPONENT BORROW, since neither select file carries any spacing token |
| `style.trigger.gap` | shadcn | select.tsx gap-2, a real flex gap (Salt uses margins for the same job) |
| `style.trigger.gap` | m3 | content-space, tokens/_md-comp-{filled,outlined}-field.scss — same borrow |
| `style.trigger.shape` | m3 | filled text-field-container-shape -> md-sys-shape corner-extra-small-top |
| `style.trigger.shape@box` | salt | corner radius is independent of `bordered` — one border-radius declaration on .saltDropdown serves both |
| `style.trigger.shape@box` | shadcn | box is the only mode; already covered by style.trigger.shape |
| `style.trigger.shape@box` | m3 | outlined text-field-container-shape -> corner-extra-small, all four corners |
| `style.trigger.cursor` | salt | Dropdown.css .saltDropdown:hover and .saltDropdown:focus { cursor: var(--salt-cursor-hover) } -> foundations/cursor.css: pointer |
| `style.trigger.cursor` | shadcn | no cursor utility at rest — a <button> already shows the platform default |
| `style.trigger.cursor` | m3 | no cursor token |
| `style.trigger.shadow` | salt | no box-shadow anywhere in Dropdown.css — a confirmed absence |
| `style.trigger.shadow` | shadcn | select.tsx shadow-xs |
| `style.trigger.shadow` | m3 | no elevation token on the select's text-field half (its menu half has one — see style.popup.shadow) |
| `style.trigger.transition` | salt | no transition and no animation rule anywhere in Dropdown.css |
| `style.trigger.transition` | shadcn | select.tsx transition-[color,box-shadow] |
| `style.trigger.transition` | m3 | no motion token in either select file |
| `style.trigger.border@box` | salt | Dropdown.css .saltDropdown-bordered.saltDropdown { border: var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--dropdown-borderColor) } |
| `style.trigger.border@box` | shadcn | select.tsx `border border-input`; the 1px width is Tailwind's undeclared default |
| `style.trigger.border@box` | m3 | outlined: text-field-outline-width 1px, text-field-outline-color -> md-sys-color.outline |
| `style.indicator.border@underline` | salt | Dropdown.css .saltDropdown-activationIndicator { border-bottom: var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--dropdown-borderColor) } — the SAME indirection the box border reads |
| `style.indicator.border@underline` | shadcn | no underline mechanism of any kind |
| `style.indicator.border@underline` | m3 | filled: text-field-active-indicator-height 1px, text-field-active-indicator-color -> on-surface-variant (a different sys-color role from outlined's `outline`) |
| `style.trigger.background@hover` | salt | CONFIRMED ABSENCE — Dropdown.css's only :hover declarations are the cursor, the border colour and the indicator colour. The background never changes on hover. |
| `style.trigger.background@hover` | shadcn | select.tsx dark:hover:bg-input/50 — a DARK-MODE-ONLY hover, and the one place shadcn's select reacts to the pointer where its input does not at all |
| `style.trigger.background@hover` | m3 | text-field-hover-state-layer-color -> on-surface at text-field-hover-state-layer-opacity 0.08, composited over the container colour |
| `style.trigger.border@box-hover` | salt | Dropdown.css .saltDropdown-bordered.saltDropdown:hover { border-color: var(--dropdown-borderColor-hover) } |
| `style.trigger.border@box-hover` | shadcn | CONFIRMED ABSENCE — the only hover: utility in select.tsx is the dark background above; the border never changes on hover |
| `style.trigger.border@box-hover` | m3 | outlined: text-field-hover-outline-color -> on-surface; hover-outline-width stays 1px |
| `style.indicator.border@underline-hover` | salt | Dropdown.css .saltDropdown:hover .saltDropdown-activationIndicator { border-bottom-color: var(--dropdown-borderColor-hover) } |
| `style.indicator.border@underline-hover` | m3 | filled: text-field-hover-active-indicator-color -> on-surface; hover-active-indicator-height stays 1px |
| `style.trigger.border@box-focus` | salt | Dropdown.css .saltDropdown-bordered.saltDropdown:focus { border-color: var(--dropdown-borderColor-active) } — recolour only, width unchanged |
| `style.trigger.border@box-focus` | shadcn | select.tsx focus-visible:border-ring — recolour only, width unchanged |
| `style.trigger.border@box-focus` | m3 | versions/v0_192/_md-comp-outlined-select.scss 'text-field-focus-outline-width': 2px (hardcoded literal) and 'text-field-focus-outline-color' -> md-sys-color.primary. VALUE CHANGED BY THE PIN: latest binds the width to md-sys-state-focus-indicator.$thickness = 3px, and that file does not exist in v0.192. NOTE the asymmetry this creates and that the previous pin hid: style.indicator.border@underline |
| `style.indicator.border@underline-focus` | salt | Dropdown.css .saltDropdown:focus .saltDropdown-activationIndicator { border-bottom: var(--salt-size-fixed-200) var(--salt-borderStyle-solid) var(--dropdown-borderColor-active) } — 1px -> 2px |
| `style.indicator.border@underline-focus` | m3 | filled: text-field-focus-active-indicator-height — 2px in the generated token in BOTH editions, overridden to 3px by tokens/_md-comp-filled-select.scss's _get-override-tokens() with the comment `TODO(b/259455114): remove when focus tokens update to 3px`; text-field-focus-active-indicator-color -> primary. UNAFFECTED BY THE v0.192 PIN because the override lives in the hand-authored, edition-indepen |
| `style.indicator.border@box-focus` | salt | Dropdown.css zeroes the indicator under .saltDropdown-bordered, EXCEPT .saltDropdown-bordered.saltDropdown:focus .saltDropdown-activationIndicator { border-bottom-width: var(--salt-size-fixed-100) } — source comment: 'Activation indicator width minus the border from the input.' |
| `style.indicator.border@box-focus` | m3 | an outlined M3 select has no activation indicator at all |
| `style.trigger.focus` | salt | Dropdown.css .saltDropdown:focus { outline: var(--salt-focused-outlineWidth) var(--salt-focused-outlineStyle) var(--dropdown-outlineColor) } -> 2px dotted accent-stronger, or the status colour |
| `style.trigger.focus` | shadcn | select.tsx outline-none + focus-visible:ring-[3px] focus-visible:ring-ring/50. The shadow-xs layer is repeated after the ring because Tailwind v4 composes box-shadow as `var(--tw-ring-shadow), var(--tw-shadow)` — a single-layer box-shadow here would silently delete the trigger's shadow. |
| `style.trigger.focus` | m3 | no separate focus ring or overlay — focus is expressed entirely by the indicator/outline thickening and recolouring above |
| `style.trigger.background@readonly` | salt | Dropdown.css .saltDropdown.saltDropdown[aria-readonly="true"] { background: var(--dropdown-background-readonly) } |
| `style.trigger.background@readonly` | m3 | no read-only token |
| `style.trigger.border-color@readonly` | salt | Dropdown.css .saltDropdown-bordered.saltDropdown[aria-readonly="true"] { border-color: var(--salt-editable-borderColor-readonly) } |
| `style.indicator.border-color@readonly` | salt | Dropdown.css .saltDropdown[aria-readonly="true"] .saltDropdown-activationIndicator { border-bottom-color: var(--salt-editable-borderColor-readonly) } |
| `style.trigger.background@disabled` | salt | Dropdown.css .saltDropdown.saltDropdown:disabled { background: var(--dropdown-background-disabled) } |
| `style.trigger.background@disabled` | shadcn | one blanket opacity:0.5 does the whole job |
| `style.trigger.background@disabled` | m3 | filled: text-field-disabled-container-color -> on-surface at text-field-disabled-container-opacity 0.04 |
| `style.trigger.background@box-disabled` | salt | Salt's disabled background is indicator-independent — one rule covers both |
| `style.trigger.background@box-disabled` | m3 | a precision row, and it points the OPPOSITE way from input's equivalent. _md-comp-outlined-select.scss has a container-color but NO disabled-container-color and NO disabled-container-opacity, so a disabled outlined select keeps its enabled fill. Restating the enabled value here stops the shared (filled-only) 4% rule above silently repainting it — the same 'silence is the enemy' shape as ALERT-MATR |
| `style.trigger.color@disabled` | salt | Dropdown.css .saltDropdown.saltDropdown:disabled { color: var(--salt-content-primary-foreground-disabled) } |
| `style.trigger.color@disabled` | shadcn | opacity, not a recolour |
| `style.trigger.color@disabled` | m3 | text-field-disabled-input-text-color -> on-surface at 0.38 |
| `style.trigger.border-color@disabled` | salt | Dropdown.css .saltDropdown-bordered.saltDropdown-disabled { border-color: var(--salt-editable-borderColor-disabled) } |
| `style.trigger.border-color@disabled` | m3 | outlined: text-field-disabled-outline-color -> on-surface at disabled-outline-opacity 0.12 |
| `style.indicator.border-color@disabled` | salt | Dropdown.css .saltDropdown-disabled .saltDropdown-activationIndicator { border-bottom-color: var(--salt-editable-borderColor-disabled) } |
| `style.indicator.border-color@disabled` | m3 | filled: text-field-disabled-active-indicator-color -> on-surface at disabled-active-indicator-opacity 0.38 — three times the outline's 12% |
| `style.trigger.disabled` | salt | Dropdown.css .saltDropdown.saltDropdown:disabled { cursor: var(--salt-cursor-disabled) } |
| `style.trigger.disabled` | shadcn | select.tsx disabled:opacity-50 disabled:cursor-not-allowed |
| `style.trigger.disabled` | m3 | no cursor or pointer-events token; M3's disabled treatment is entirely the per-element opacities already applied in the colour rows |
| `style.value.placeholder` | salt | Dropdown.css .saltDropdown-placeholder { color: var(--salt-content-secondary-foreground); font-weight: var(--salt-text-fontWeight-small) } |
| `style.value.placeholder` | shadcn | select.tsx data-[placeholder]:text-muted-foreground — colour only, and stamped by Radix on the TRIGGER (data-placeholder), not on the value span |
| `style.value.placeholder` | m3 | CONFIRMED ABSENCE, and a real difference from M3's own text field: neither select file has any placeholder token, where both text-field files have input-text-placeholder-color. An M3 select shows a floating label instead, and the label belongs to the separate field wrapper. |
| `style.toggle-icon.size` | salt | packages/icons/src/icon/Icon.css --icon-size: max(calc(var(--salt-size-icon) * var(--icon-size-multiplier)), 12px) with multiplier 1 -> 12/12/14/16 by density |
| `style.toggle-icon.size` | shadcn | select.tsx ChevronDownIcon className="size-4" = 16px, density-invariant |
| `style.toggle-icon.size` | m3 | text-field-trailing-icon-size 24px |
| `style.toggle-icon.color` | salt | CONFIRMED ABSENCE — .saltIcon's fill is currentColor and Dropdown never applies .saltIcon-primary/-secondary, so the chevron inherits the trigger's own colour (including its disabled 40%-alpha value) |
| `style.toggle-icon.color` | shadcn | select.tsx: the chevron's only classes are size-4 and opacity-50, so it matches the trigger's [&_svg:not([class*='text-'])]:text-muted-foreground group rule AND carries its own opacity-50 — two dimming mechanisms stacked |
| `style.toggle-icon.color` | m3 | text-field-trailing-icon-color -> on-surface-variant |
| `style.adornment.size` | salt | [R] as a registry choice: .saltDropdown-startAdornmentContainer declares only margin-right, so whatever it holds sizes itself. Aliased to the same composed-icon box the toggle uses, which is what a Salt icon adornment resolves to in practice. |
| `style.adornment.size` | shadcn | no leading slot |
| `style.adornment.size` | m3 | text-field-leading-icon-size 24px |
| `style.status-adornment.size` | salt | StatusAdornment.css height/min-height: var(--salt-size-adornment) |
| `style.status-adornment.color` | salt | aliased to the border indirection because in source they resolve to the identical value: --statusAdornment-color -> status-{s}-foreground-decorative -> palette-{role}, and --dropdown-borderColor -> status-{s}-borderColor -> the same palette-{role} |
| `style.popup.background` | salt | OptionList.css background: var(--salt-container-primary-background) |
| `style.popup.background` | shadcn | select.tsx SelectContent bg-popover |
| `style.popup.background` | m3 | menu-container-color -> surface-container — a LOWER surface tone than the trigger's surface-container-highest |
| `style.popup.color` | salt | declared on .saltOption rather than on the list in source (Option.css color: var(--salt-content-primary-foreground)); modelled on the popup with the option inheriting, which renders identically |
| `style.popup.color` | shadcn | select.tsx SelectContent text-popover-foreground; the item inherits it |
| `style.popup.color` | m3 | menu-list-item-label-text-color -> on-surface; modelled once on the popup with the option inheriting |
| `style.popup.border` | salt | OptionList.css border: var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-selectable-borderColor-selected) |
| `style.popup.border` | shadcn | select.tsx SelectContent bare `border` -> --border, NOT the --input token its trigger uses; the two diverge in dark mode (10% vs 15% white) |
| `style.popup.border` | m3 | CONFIRMED ABSENCE — no outline or border token anywhere in the menu family; an M3 menu is elevation-only, where Salt frames its list in accent and shadcn frames its in a neutral border |
| `style.popup.shape` | salt | OptionList.css border-radius: var(--salt-palette-corner, 0) -> curve-150 — a ROUNDER stop than the trigger's corner-weak |
| `style.popup.shape` | shadcn | select.tsx SelectContent rounded-md — the same 8px as its trigger, unlike Salt which uses a rounder stop for the popup |
| `style.popup.shape` | m3 | menu-container-shape -> corner-extra-small |
| `style.popup.shadow` | salt | OptionList.css box-shadow: var(--salt-overlayable-shadow-popout) -> shadow-mediumLow |
| `style.popup.shadow` | shadcn | select.tsx SelectContent shadow-md; [R] value, see the popup-shadow provenance entry |
| `style.popup.shadow` | m3 | [R] CSS derived from menu-container-elevation -> level2 (3dp) + menu-container-shadow-color -> shadow (#000); M3 ships a dp height, not a shadow string |
| `style.popup.padding` | salt | OptionList.css .saltOptionList-container declares display/flex-direction/gap/max-height/min-height and NO padding — options run edge to edge inside the accent frame. (Contrast .saltListBox, the standalone component, which does add 1px top/bottom.) |
| `style.popup.padding` | shadcn | select.tsx SelectPrimitive.Viewport className="p-1" — the inset that gives the rounded item highlight somewhere to sit |
| `style.popup.padding` | m3 | top-space / bottom-space = 8px, tokens/_md-comp-menu.scss $new-tokens — a DECLARED CROSS-FILE BORROW; there is no horizontal menu padding token. UNAFFECTED BY THE v0.192 PIN: this is the hand-authored wrapper, which @use's versions/v0_192/md-comp-menu and adds these two spaces itself, so it is edition-independent and the pin does not move it. |
| `style.popup.gap` | salt | OptionList.css .saltOptionList-container { gap: var(--salt-spacing-fixed-100) } = 1px, density-invariant |
| `style.popup.gap` | shadcn | no gap utility — shadcn's items stack flush |
| `style.popup.gap` | m3 | no gap token — M3's list items stack flush |
| `style.popup.min-width` | salt | OptionList.css min-width: var(--overlay-minWidth), written inline by floating-ui's size() middleware as the trigger's own width |
| `style.popup.min-width` | shadcn | select.tsx SelectContent min-w-[8rem] = 128px, a fixed floor independent of the trigger (the trigger-width variable is applied only in position="popper", which is not the default) |
| `style.popup.min-width` | m3 | [R] - no width token exists in either edition of the select token files. m3.material.io's exposed dropdown menu shows the menu matching the text field's width, and the previous build's content-width popup rendered 173px narrower than its own trigger, which is wrong against that published behaviour. Recorded [R] on the same standard this column already uses for structure.popup-anchor, not presented |
| `style.popup.max-height` | salt | PARTIAL — only the five-row floor of Dropdown.tsx's max(...) is expressible; the availableHeight half needs the positioning engine this skeleton declares as a gap |
| `style.popup.max-height` | shadcn | max-h-(--radix-select-content-available-height) is entirely Popper-computed — the positioning-engine gap, not a token |
| `style.popup.max-height` | m3 | no height token on the menu |
| `style.popup.z-index` | salt | OptionList.css z-index: var(--salt-zIndex-flyover) -> foundations/zindex.css: 1500 (docs/foundations/layers.md) |
| `style.popup.z-index` | shadcn | select.tsx SelectContent z-50 — a bare Tailwind stacking index, not a declared token |
| `style.popup.z-index` | m3 | no z-index token; platform-managed |
| `style.popup.animation` | salt | CONFIRMED ABSENCE — no animation or transition rule in OptionList.css or Dropdown.css; the list appears instantly, the same total absence TOOLTIP-MATRIX.md found on Salt's tooltip |
| `style.popup.animation` | shadcn | select.tsx SelectContent data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 |
| `style.popup.animation` | m3 | no motion token in the select or menu token files |
| `style.option.background` | salt | Option.css background: var(--salt-selectable-background) -> next/characteristics/selectable.css -> --salt-color-transparent |
| `style.option.background` | shadcn | select.tsx SelectItem has no background class at rest |
| `style.option.background` | m3 | tokens/_md-comp-menu-item.scss explicitly sets container-color to `transparent`, with the comment that menu items inherit their parent menu's colour so a selected background can sit on top |
| `style.option.color` | salt | Option.css color: var(--salt-content-primary-foreground) — Salt is the only system that declares a colour on the option itself |
| `style.option.color` | shadcn | inherits the popup's text-popover-foreground; no separate token |
| `style.option.color` | m3 | menu-list-item-label-text-color is the same on-surface role the popup already carries; no separate value |
| `style.option.font` | salt | Option.css declares the same five --salt-text-* body properties the trigger does — an option reads exactly like the value it will become |
| `style.option.font` | shadcn | select.tsx SelectItem text-sm — the same size as its trigger |
| `style.option.font` | m3 | menu-list-item-label-text-* -> label-large: 0.875rem/1.25rem at weight-MEDIUM 500 — a different role AND a heavier weight than the trigger's body-large 400 |
| `style.option.letter-spacing` | salt | Option.css letter-spacing: var(--salt-text-letterSpacing) |
| `style.option.letter-spacing` | m3 | menu-list-item-label-text-tracking -> label-large-tracking (the trigger's is body-large-tracking 0.03125rem — a different value on the same component) |
| `style.option.min-height` | salt | Option.css min-height: calc(var(--salt-size-base) + var(--salt-spacing-100)) |
| `style.option.min-height` | shadcn | CONFIRMED ABSENCE — SelectItem has no height class; 6px + 6px padding around a 20px line box makes it content-driven |
| `style.option.min-height` | m3 | menu-list-item-container-height 48px (the standalone _md-comp-list.scss says 56px for a list item; the menu family says 48px and the select's own file agrees with menu) |
| `style.option.padding` | salt | Option.css padding: calc(var(--salt-spacing-100) + var(--salt-spacing-25)) var(--salt-spacing-100) |
| `style.option.padding` | shadcn | select.tsx SelectItem py-1.5 pr-8 pl-2 — the asymmetric right padding is the reserved lane for the checkmark and exists only because of structure.selected-marker |
| `style.option.padding` | m3 | DECLARED CROSS-FILE BORROW: 12px vertical from tokens/_md-comp-list-item.scss's $new-tokens top-space/bottom-space (hand-authored and edition-independent — that wrapper @use's versions/v0_192/md-comp-list, so under this pin the borrow and the pin agree on an edition); 16px horizontal from versions/v0_192/_md-comp-list.scss 'list-item-leading-space' / 'list-item-trailing-space', both 16px and ident |
| `style.option.gap` | salt | Option.css gap: var(--salt-spacing-100) — the same token as the trigger's gap |
| `style.option.gap` | shadcn | select.tsx SelectItem gap-2 |
| `style.option.gap` | m3 | DECLARED GAP. Was 12px, sourced from list-item-between-space in versions/latest/sass/_md-comp-list.scss. versions/v0_192/_md-comp-list.scss contains the string 'between' ZERO times — the token is a `latest` addition. WHAT THE CONSUMER LOSES: the sourced spacing between an option's leading icon / selected marker and its label. The horizontal padding survives (leading-space / trailing-space 16px, pr |
| `style.option.shape` | salt | Option.css declares no border-radius; a Salt option runs flush to the popup's inner edge |
| `style.option.shape` | shadcn | select.tsx SelectItem rounded-sm — shadcn is the only system that rounds an individual option |
| `style.option.shape` | m3 | no per-item shape token in the menu family (the standalone list has list-item-selected-container-shape, but that belongs to the separate `list` component and its selected colour disagrees with the select's too) |
| `style.option.cursor` | salt | Option.css cursor: var(--salt-cursor-hover) -> pointer |
| `style.option.cursor` | shadcn | select.tsx SelectItem `cursor-default` — explicitly NOT a pointer, the native-menu convention; Salt uses pointer for the same element |
| `style.option.cursor` | m3 | no cursor token |
| `style.option.background@hover` | salt | Option.css .saltOption:hover { background: var(--salt-selectable-background-hover) } -> palette-accent-weakest |
| `style.option.background@hover` | shadcn | CONFIRMED ABSENCE — there is no hover: class on SelectItem. Radix focuses the item on pointermove, so the focus rule below produces the hover appearance. |
| `style.option.background@hover` | m3 | versions/v0_192/_md-comp-list.scss 'list-item-hover-state-layer-color' -> md-sys-color.on-surface at 'list-item-hover-state-layer-opacity' -> md-sys-state.hover-state-layer-opacity = 0.08 — a DECLARED CROSS-FILE BORROW, since the select's own menu-list-item-* family names height, label and selected colour but no interaction state. SOURCE RE-POINTED BY THE v0.192 PIN (was versions/latest/sass/_md-c |
| `style.option.active` | salt | Option.css .saltOption-active { background: var(--salt-selectable-background-hover) } — the IDENTICAL value as the hover rule, through a different selector; two rows because they are two rules in source |
| `style.option.active` | shadcn | select.tsx SelectItem focus:bg-accent focus:text-accent-foreground — the only system that also changes the TEXT colour when an option is highlighted |
| `style.option.active` | m3 | versions/v0_192/_md-comp-list.scss 'list-item-focus-state-layer-color' -> md-sys-color.on-surface at 'list-item-focus-state-layer-opacity' -> md-sys-state.focus-state-layer-opacity = 0.12. SOURCE RE-POINTED AND VALUE CHANGED BY THE v0.192 PIN: was versions/latest/sass/_md-comp-menu.scss at 0.10. Now FOUR points heavier than the hover layer rather than two, which makes behavior.pointer-activates-op |
| `style.option.focus-visible` | salt | Option.css .saltOption-focusVisible { outline: var(--salt-focused-outline); outline-offset: calc(var(--salt-size-fixed-100) * -2) } |
| `style.option.focus-visible` | shadcn | SelectItem carries outline-hidden and relies entirely on the background swap |
| `style.option.focus-visible` | m3 | Doubly off under the v0.192 pin. versions/latest/sass/_md-comp-menu.scss has focus-indicator-color/-thickness/-outline-offset tokens, but (a) they belong to the standalone menu component and neither select file references them, and (b) they do not exist in versions/v0_192/_md-comp-menu.scss at all, which has eight keys and no focus family — nor does the md-sys-state-focus-indicator.scss they resol |
| `style.option.disabled` | salt | Option.css .saltOption[aria-disabled="true"] { color: var(--salt-content-primary-foreground); background: var(--salt-selectable-background); opacity: 0.4; cursor: var(--salt-cursor-disabled) } |
| `style.option.disabled` | shadcn | select.tsx SelectItem data-[disabled]:opacity-50 data-[disabled]:pointer-events-none |
| `style.option.disabled` | m3 | versions/v0_192/_md-comp-list.scss 'list-item-disabled-label-text-opacity': 0.3 — a cross-file borrow; the select's own file has no option-disabled token at all. SOURCE RE-POINTED AND VALUE CHANGED BY THE v0.192 PIN: was 0.38, from versions/latest/sass/_md-comp-menu.scss's list-item-disabled-label-text-opacity. This is a genuine edition divergence inside the list family itself (v0.192 says 0.3, la |
| `style.option.selected` | salt | Option.css .saltOption[aria-selected="true"] { z-index: var(--salt-zIndex-default); background: var(--salt-selectable-background-selected); box-shadow: calc(var(--salt-size-fixed-100) * -2) 0 0 0 var(--salt-selectable-background-hover), calc(var(--salt-size-fixed-100) * -1) 0 0 var(--salt-size-fixed-100) var(--salt-selectable-borderColor-selected), 0 calc(var(--salt-size-fixed-100) * -1) 0 var(--s |
| `style.option.selected` | shadcn | CONFIRMED ABSENCE — no data-[state=checked] class exists anywhere in select.tsx. A selected shadcn item is marked ONLY by the checkmark; its background is identical to an unselected one. This is the whole point of structure.selected-marker. |
| `style.option.selected` | m3 | menu-list-item-selected-container-color -> md-sys-color.surface-container-highest, from the SELECT's own file, present and identical in versions/v0_192. NOTE the standalone menu says secondary-container for the same token in BOTH editions (versions/v0_192/_md-comp-menu.scss 'list-item-selected-container-color' -> secondary-container is one of that file's eight keys); the select's own file override |
| `style.selected-marker.box` | salt | no marker element in single-select — see structure.selected-marker |
| `style.selected-marker.box` | shadcn | select.tsx <span data-slot="select-item-indicator" className="absolute right-2 flex size-3.5 items-center justify-center"> holding a size-4 (16px) CheckIcon — a 14px box around a 16px glyph, as written |
| `style.selected-marker.box` | m3 | no marker glyph — see structure.selected-marker |
| `style.group-label.font` | salt | OptionGroup.css .saltOptionGroup-label uses the LABEL typescale at --salt-text-label-fontWeight-strong (semiBold 600) |
| `style.group-label.font` | shadcn | select.tsx SelectLabel text-xs with no weight utility |
| `style.group-label.font` | m3 | no group concept |
| `style.group-label.color` | salt | OptionGroup.css color: var(--salt-content-secondary-foreground) — the same token the placeholder uses |
| `style.group-label.color` | shadcn | select.tsx SelectLabel text-muted-foreground — the same token as its placeholder |
| `style.group-label.padding` | salt | OptionGroup.css repeats Option.css's padding and min-height formulas verbatim, so a Salt group label occupies a full row in the list's rhythm |
| `style.group-label.padding` | shadcn | select.tsx SelectLabel px-2 py-1.5 — half an item's vertical size; a caption, not a row |
| `style.group-label.background` | salt | OptionGroup.css background: var(--salt-container-primary-background) — the same value the list already has, but declared, and load-bearing: an opaque label stops a neighbouring selected option's box-shadow bracket bleeding under it |
| `style.group-label.background` | shadcn | no background utility on SelectLabel |
| `style.group.border-top` | salt | OptionGroup.css .saltOptionGroup { border-top: var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-tertiary-borderColor) } with .saltOptionGroup:first-of-type { border-top: 0 } — reproduced with an adjacent-sibling selector |
| `style.group.border-top` | shadcn | shadcn divides groups with a dedicated SelectSeparator element, not a border on the group — see style.separator |
| `style.group.border-top` | m3 | no group concept; M3 divides with the divider element instead |
| `style.separator` | salt | no separator element — see style.group.border-top |
| `style.separator` | shadcn | select.tsx SelectSeparator `pointer-events-none -mx-1 my-1 h-px bg-border` — the negative inline margins make the rule bleed through the viewport's own 4px padding so it touches both edges |
| `style.separator` | m3 | menu-divider-height 1px + menu-divider-color -> surface-variant. Full width: the select file carries no divider inset token (_md-comp-list.scss's 16px divider-leading/trailing-space belongs to the standalone list). |
| `style.trigger.variant@secondary` | salt | Dropdown.css .saltDropdown-secondary { --dropdown-background: var(--salt-editable-secondary-background); --dropdown-background-disabled: var(--salt-editable-secondary-background-disabled) } |
| `style.trigger.variant@secondary` | shadcn | no variant axis |
| `style.trigger.variant@secondary` | m3 | no such axis — see prop.variant |
| `style.trigger.variant@tertiary` | salt | Dropdown.css .saltDropdown-tertiary { --dropdown-background: var(--salt-editable-tertiary-background); --dropdown-background-disabled: var(--salt-editable-tertiary-background-disabled) } |
| `style.trigger.variant@tertiary` | shadcn | no variant axis |
| `style.trigger.variant@tertiary` | m3 | no such axis — see prop.variant |
| `style.trigger.status@error` | salt | Dropdown.css .saltDropdown-error reassigns --dropdown-color, --dropdown-background, --dropdown-background-readonly, --dropdown-borderColor, --dropdown-borderColor-active and --dropdown-borderColor-hover in one block; --dropdown-color is unchanged from the variant blocks so it needs no entry here |
| `style.trigger.status@error` | shadcn | select.tsx aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 — border and ring only; background, popup and options are untouched |
| `style.trigger.status@error` | m3 | text-field-error-outline-color / -hover-outline-color / -focus-outline-color; text-field-error-active-indicator-color / -hover-active-indicator-color / -focus-active-indicator-color. The hover entries resolve to on-error-container, NOT error. No caret entry, because the select's caret tokens are @deprecated-and-removed. |
| `style.trigger.status@warning` | salt | Dropdown.css .saltDropdown-warning |
| `style.trigger.status@warning` | shadcn | no warning state exists at all |
| `style.trigger.status@warning` | m3 | no warning-* token exists in either select file — confirmed by direct grep |
| `style.trigger.status@success` | salt | Dropdown.css .saltDropdown-success |
| `style.trigger.status@success` | shadcn | no success state exists at all |
| `style.trigger.status@success` | m3 | no success-* token exists in either select file — confirmed by direct grep |

</details>

<!-- END GENERATED VALUES -->
