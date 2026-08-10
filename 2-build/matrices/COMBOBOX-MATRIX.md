# Combobox (editable, filterable single-choice) — component template matrix

*Twenty-second live component in the post-clean-slate pipeline (button,
calendar, spinner, tooltip, alert, input, select, dialog, tabs, card, badge,
progress, chip, checkbox, switch, radio-group, slider, toast, dropdown-menu,
accordion, popover came before). Canonical id `combobox`, matching
`1-intro/content/04-component-map.md`'s Forms & inputs row: `combobox | ✓ | ✓
combo-box, combo-box-deprecated | ✓ *(filled/outlined)-autocomplete*` — all
three systems have it.*

## 0 · Scope

### Why combobox is its own component, not a select variant

**A select's trigger is a button showing the CURRENT value; a combobox's
trigger is a real, editable `<input>` the user TYPES into to filter the
option list.** This is a structural fact in all three systems, not a styling
choice — SELECT-MATRIX.md's own scope note already drew this exact line when
it excluded Salt's `combo-box` and M3's `autocomplete` from select's scope:
*"Adds a real text `<input>` and a filtering layer over the same list — role
flips between combobox and textbox depending on readOnly, and the value is
typed, not chosen."* This matrix is the component that line pointed at.

Confirmed independently in all three clones this session (grep, not memory):

- **Salt**: `Dropdown`'s trigger (`packages/core/src/dropdown/Dropdown.tsx`)
  is `<button role="combobox" type="button">`. `ComboBox`'s trigger
  (`packages/core/src/combo-box/ComboBox.tsx`) renders `PillInput`, whose
  root contains a real `<input>` (`role={readOnly ? "textbox" : "combobox"}`
  on the INPUT itself, not a wrapping button) [S].
- **shadcn**: `SelectTrigger` (`select.tsx`) is a `<button>`. `ComboboxInput`
  (`combobox.tsx`) renders `ComboboxPrimitive.Input` — a real `<input>`
  element via `InputGroupInput` [S].
- **M3**: select's token files are prefixed `text-field-*` (a select IS a
  text-field visually, per the shared `md-comp-filled-field` token family),
  but has no live component to read; autocomplete's own token files carry
  the SAME `text-field-*` prefix plus `caret-color` tokens select's own
  files also have but autocomplete additionally documents error-focus-caret
  — an editable-caret concern select's read-only trigger has no reason to
  need [S, comparative].

### Which Salt combo-box is canonical, and why the other two are excluded

Three real, live Salt implementations exist. Only one is current:

| candidate | package | verdict |
|---|---|---|
| `packages/core/src/combo-box` | core | **CANONICAL** — see below |
| `packages/lab/src/combo-box` | lab | excluded, legacy architecture |
| `packages/lab/src/combo-box-deprecated` | lab | excluded, literally named deprecated |

`packages/lab/CHANGELOG.md:2462` states directly: *"Removed `DropdownNext`,
`Option`, `OptionGroup` and `ComboBoxNext` from labs and promoted to core."*
`packages/core/src/combo-box/ComboBox.tsx` is that promotion — it imports
`OptionList`/`Option` from `../option/OptionList` (the SAME shared parts
`select.tsx`'s Salt column already uses for `Dropdown`), composes
`@floating-ui/react` directly (`useClick`/`useDismiss`/`useFocus`, `offset`/
`size`/`flip` middleware — architecturally identical to `Dropdown.tsx`), and
renders through `PillInput`, core's own modern editable-field chassis.
`packages/lab/src/combo-box/ComboBox.tsx` (no "Next"/"deprecated" suffix, but
NOT what got promoted) is built on `InputLegacy`, `DropdownBase` and `List` —
an older architecture predating the promotion, confirmed by name alone
(`InputLegacy` — `packages/lab/src/input-legacy/`) and by its own
`CollectionProvider`/`useCollectionItems` model, unrelated to the
`useListControl`/`ListControlContext` model `core`'s `Dropdown` AND `core`'s
`ComboBox` both share. `packages/lab/src/combo-box-deprecated` needs no
argument beyond its own directory name. **This matrix uses `core`'s
`ComboBox`, matching the architecture SELECT-MATRIX.md already established
for `Dropdown` — the same shared `OptionList`/`Option`/`ListControlContext`
family, not a different one.**

### Which shadcn combobox is canonical, and a real correction to this
### build's own starting hypothesis

The build prompt for this component hypothesized shadcn has no dedicated
`combobox.tsx` and instead documents a compose-it-yourself `Command` +
`Popover` pattern. **Grepped and found WRONG: shadcn now ships a real,
dedicated, exported `Combobox` primitive** at
`apps/v4/registry/new-york-v4/ui/combobox.tsx` — sixteen exported parts
(`Combobox`, `ComboboxValue`, `ComboboxTrigger`, `ComboboxClear`,
`ComboboxInput`, `ComboboxContent`, `ComboboxList`, `ComboboxItem`,
`ComboboxGroup`, `ComboboxLabel`, `ComboboxCollection`, `ComboboxEmpty`,
`ComboboxSeparator`, `ComboboxChips`, `ComboboxChip`, `ComboboxChipsInput`),
built on `@base-ui/react`'s `Combobox` primitive — the same
external-unvendored-package boundary this pipeline already established for
`radix-ui` (dropdown-menu, popover) and `cmdk`. Confirmed unvendored:
`apps/v4/package.json:29` lists `"@base-ui/react": "1.6.0"` as a dependency;
no `node_modules/@base-ui` directory exists anywhere under `3-source/` [S].

**The OLDER, compose-it-yourself pattern is real too and still documented,**
at `apps/v4/registry/new-york-v4/examples/combobox-demo.tsx`: a `Popover` +
shadcn's own `Command`/`cmdk` wrapper (`CommandInput`/`CommandItem`/
`CommandEmpty`/`CommandGroup`). It predates the dedicated primitive — the
CLI-installable component the docs page (`content/docs/components/base/
combobox.mdx`) actually tells a consumer to install (`npx shadcn@latest add
combobox`) is the dedicated `ui/combobox.tsx` file, not the Command+Popover
composition. **This matrix cites the dedicated primitive as canonical**, the
same "the file the CLI installs is canonical, not an older documented
pattern" precedent this pipeline has followed for every other shadcn column,
and records the Command+Popover pattern's existence here rather than
silently ignoring it (a real, still-live alternative a consumer might choose,
just not the one this registry models).

One more confirmation worth recording: shadcn ships THREE base variants of
this dedicated primitive (`registry/bases/{aria,base,radix}/ui/combobox.tsx`
— a consumer picks their preferred underlying primitive library). **All
three, including the one literally named `radix`, import `Combobox as
ComboboxPrimitive` from `@base-ui/react`** — confirmed by reading
`registry/bases/radix/ui/combobox.tsx` directly. The folder name `radix` is
this registry's own style-variant naming convention, not a claim that
Radix's own primitives package implements this specific component; `@base-
ui/react` is the actual engine behind all three named variants for
combobox specifically.

### M3: autocomplete is the select's editable sibling, one canonical
### component with the same filled/outlined emphasis axis select has

`tokens/versions/v0_192/_md-comp-{filled,outlined}-autocomplete.scss` — the
SAME treatment SELECT-MATRIX.md already gave `{filled,outlined}-select`: not
two components, one canonical component with an emphasis axis, modelled as
`structure.indicator`. Confirmed structurally near-identical to select's own
files: both carry the full `menu-*` family (container/elevation/shadow/
shape) plus the `text-field-*` family, and — like select — carry NO
group-label or divider token of their own (see Finding 5). **Pinned to
`v0_192`, per CLAUDE.md's now-settled decision** ("M3 pins the v0.192 token
edition, everywhere") — this sidesteps the edition-pin debate
SELECT-MATRIX.md flagged five times; combobox does not re-litigate it.

### IN SCOPE

Trigger (a real, editable text input — not a button), an optional dedicated
disclosure-toggle button (distinct from the input), an optional dedicated
clear button, the popup listbox, optional groups with labels, an optional
separator, an optional dedicated empty-state message, options, and an
optional selected marker. Single-select only (see below for why multiselect
is excluded).

### OUT OF SCOPE, with a structural reason

| excluded | where | structural reason |
|---|---|---|
| **multiselect / pills / chips** | Salt `ComboBox`'s `multiselect` prop + `PillInput`'s `pills`; shadcn's `ComboboxChips`/`ComboboxChip`/`ComboboxChipsInput` + base-ui's `multiple` prop | The SAME exclusion SELECT-MATRIX.md already made for Salt's `Dropdown.multiselect` (a different SELECTION MODEL — an array instead of a value, chips rendered where the typed text was, a changed commit/remove interaction — not a style variant), now confirmed to exist as a real, first-class API surface in BOTH live systems for combobox specifically (unlike select, where only Salt had it). Recorded as `behavior.multiselect`, an info row, switched ON where the real capability exists, with no multiselect style/structure modelled. |
| `native-select` | shadcn `ui/native-select.tsx` | Same reason SELECT-MATRIX.md gave: the browser owns the popup, there is nothing to filter. |
| `list-box`, `list`, `list-next` | Salt `core/src/list-box`, `lab/src/list*` | Same reasons SELECT-MATRIX.md gave — no trigger, no floating layer (list-box) or a different canonical component entirely (list). |
| Command+Popover composed pattern | shadcn `examples/combobox-demo.tsx` | Superseded by the dedicated `ui/combobox.tsx` primitive — see above. Recorded as a real, still-documented alternative, not modelled. |
| `lab`'s `ComboBox` / `ComboBoxDeprecated` | Salt `lab/src/combo-box{,-deprecated}` | Superseded by `core`'s promoted `ComboBox` — see above. |

`field` (label + control + help-text wrapper) is a separate canonical
component, as it was for input and select. This matrix covers the *control*
and records Salt's form-field context channel as an info row
(`behavior.status-inheritance`), the identical convention select used.

---

## Sources

- **Salt** [S]: `packages/core/src/combo-box/{ComboBox.tsx,useComboBox.ts}`;
  `packages/core/src/pill-input/{PillInput.tsx,PillInput.css}`;
  `packages/core/src/option/{Option,OptionList,OptionListBase,OptionGroup}.{tsx,css}`
  (identical shared parts select.salt.json already extracted — see Finding 1);
  `packages/core/src/list-control/{ListControlState,ListControlContext}.ts`;
  `packages/core/stories/combo-box/combo-box.stories.tsx` (confirms the
  consumer-owned, case-insensitive-substring filter convention — Finding 2);
  `packages/lab/CHANGELOG.md` (the promotion record); `packages/core/src/
  pill/Pill.tsx` read only to confirm the pill/chip mechanism excluded above.
- **shadcn** [S]: `apps/v4/registry/new-york-v4/ui/combobox.tsx` (canonical,
  sole source for every style cell); `apps/v4/registry/new-york-v4/ui/
  input-group.tsx` (the `has-[[data-slot][aria-invalid=true]]` validation
  wiring `ComboboxInput` composes); `apps/v4/examples/base/combobox-{basic,
  demo,auto-highlight,clear,disabled,groups,multiple,invalid}.tsx`;
  `apps/v4/content/docs/components/base/combobox.mdx`;
  `apps/v4/registry/bases/{radix,aria}/ui/combobox.tsx` (read only to confirm
  all three base variants share the same `@base-ui/react` engine — see
  above). `@base-ui/react` itself is external and unvendored (confirmed:
  `package.json` dependency, no `node_modules` present) — every BEHAVIOR
  cell not independently confirmable from `combobox.tsx`'s own file is
  `[R]`, citing the general WAI-ARIA APG combobox pattern, the same
  citation convention this pipeline already used for Radix/base-ui
  internals in dropdown-menu/popover/select.
- **Material 3** [S]: `tokens/versions/v0_192/_md-comp-{filled,outlined}-
  autocomplete.scss`; cross-referenced against `tokens/versions/v0_192/
  _md-comp-{filled,outlined}-select.scss` (select's own pinned files, to
  confirm the near-identical vocabulary — Finding 5) and the same
  `_md-comp-menu.scss`/`_md-comp-list.scss`/`_md-comp-list-item.scss` menu
  borrow chain select.m3.json already established. **material-web is a
  tokens-only clone** — no live M3 autocomplete exists, so every M3
  structure/behavior row is `[R]`, style rows are `[S]`.

---

## 1 · Structure

| row | policy | salt | shadcn | m3 |
|---|---|---|---|---|
| `structure.trigger` | locked | on — `PillInput`'s inner `<input role={readOnly?"textbox":"combobox"}>`, real, editable, real DOM focus stays here [S] | on — `ComboboxPrimitive.Input` via `InputGroupInput`, real, editable [S] | on [R] — a `text-field` container, editable per the `caret-color` tokens |
| `structure.toggle-button` | switchable | on — `showOptionsButton`, a real `Button` INSIDE `PillInput`'s `endAdornment`, `tabIndex={-1}` (never itself tab-stoppable — see behavior.focus-model), swaps `CollapseIcon`/`ExpandIcon` [S] | on — `ComboboxTrigger`, a real, DEDICATED, separate element from the input (`data-slot="combobox-trigger"`, itself rendered as an `InputGroupButton`), single static `ChevronDownIcon` [S] | on [R] — `text-field-trailing-icon-*`, no live component to say static vs swap |
| `structure.clear-button` | switchable | **off** — CONFIRMED ABSENT, grepped the full `ComboBox.tsx`/`PillInput.tsx`: no clear/reset affordance of any kind. A Salt consumer clears by selecting all and typing over, or backspacing [S, confirmed absent] | on — `ComboboxClear`, a real, opt-in (`showClear` prop, default `false`) `XIcon` button [S] | off — no clear-icon token in either autocomplete file [S, confirmed absent] |
| `structure.popup` | locked | on — `OptionList` (`role="listbox"`), the SAME shared part select's Salt column already documents [S] | on — `ComboboxPrimitive.Portal > Positioner > Popup`, `data-slot="combobox-content"` [S] | on [R] — the `menu-*` family, same borrow shape as select — see Finding 5 |
| `structure.option-group` | switchable | on — `OptionGroup`, the SAME shared part [S] | on — `ComboboxGroup` + `ComboboxLabel` [S] | **off** — CONFIRMED ABSENT, no group/label token in either autocomplete file, matching select's own finding [S, confirmed absent] |
| `structure.separator` | switchable | **off** — no separator element; same border-top-on-the-group mechanism select's Salt column already documents [S] | on — `ComboboxSeparator` (`-mx-1 my-1 h-px bg-border`) [S] | on [R] — `menu-divider-*`, cross-file borrow, same as select |
| `structure.empty-state` | switchable | **off** — CONFIRMED ABSENT, `ComboBox.tsx` renders `children` (options) directly with no "no results" branch of any kind; an empty filtered list renders an empty, zero-height popup [S, confirmed absent] | on — `ComboboxEmpty`, a REAL, DEDICATED part (`hidden ... group-data-empty/combobox-content:flex`), shown automatically when the filtered `items` list is empty [S] | off — no equivalent token anywhere [S, confirmed absent] |
| `structure.selected-marker` | locked | fill — no glyph in single-select, same mechanism select's Salt column has [S] | check — `ComboboxItemIndicator` + `CheckIcon`, `pr-8` reserved, same mechanism select's shadcn column has [S] | fill [R] — `menu-list-item-selected-container-color`, same as select |
| `structure.popup-anchor` | locked | below — `placement: "bottom-start"`, `offset(1)`, identical to select's Salt column [S] | **below — NOT item-aligned.** `ComboboxContent`'s own `side` prop defaults to `"bottom"` [S] — see Finding 3, a real divergence from select's own shadcn column | below [R] |

### The two structural axes real enough to need their own rows

**A separate toggle-DISCLOSURE button exists in all three, distinct from the
input itself — real, not merely styled differently from select's single
trigger element.** Select's whole trigger IS the button; combobox's trigger
is the input, and the disclosure glyph lives on a SECOND, dedicated element
next to it (Salt: a real nested `Button`, `tabIndex={-1}` so Tab skips it and
lands past the field; shadcn: `ComboboxTrigger`, likewise excluded from the
input's own tab stop by base-ui's own convention). This is why
`structure.toggle-button` is a real row here where select had no equivalent
concept (select's `structure.toggle-icon` was a GLYPH inside the one trigger
element, not a second interactive part).

**A dedicated "no results" affordance is a genuine shadcn-only structural
richness.** `ComboboxEmpty` has no counterpart anywhere in Salt's or M3's
real source — see Finding 4.

## 2 · Behavior

| row | policy | salt | shadcn | m3 |
|---|---|---|---|---|
| `behavior.open-trigger` | locked | `useClick(context,{keyboardHandlers:false,toggle:false})` + `useFocus(context)` + `useDismiss(context)`; ArrowDown/ArrowUp from closed also open it (`handleKeyDown`'s own early branch) [S] | `[R]` — general APG combobox convention: focus, typing, or ArrowDown/Up open the popup | `[R]` |
| `behavior.filter` | switchable | **CONSUMER-OWNED.** `ComboBox.tsx` itself does NO filtering — `children` (the `Option` list) is passed through unchanged; `combo-box.stories.tsx`'s own `Template` filters externally: `usStates.filter(s => s.toLowerCase().includes(value.trim().toLowerCase()))` — case-insensitive substring [S] | **BUILT IN** — base-ui's `Combobox` filters its own `items` prop internally when the input value changes [R, mechanism]; the exact algorithm is not independently inspectable (unvendored package) | `[R]` — no live component; the general APG combobox pattern expects app- or library-provided filtering |
| `behavior.registry-filter-default` | default | **REGISTRY DEFAULT: case-insensitive substring match**, chosen because it is the literal algorithm Salt's OWN real story uses (see cell above) — not invented, extracted from the one live implementation this session could read the algorithm of. Applied uniformly in the skeleton so the render is checkable for all three columns; declared, not silent. | same registry default (base-ui's own real algorithm is not independently confirmable) | same registry default |
| `behavior.focus-model` | locked | **virtual — REAL DOM focus never leaves the `<input>`.** `aria-activedescendant={activeState?.id}` on the input; options are `tabIndex={-1}`; the toggle button is `tabIndex={-1}`; `OptionList`'s own `onClick` handler is `handleFocusInput` — even a direct click inside the popup refocuses the input [S] | **virtual — `[R]`, general APG combobox convention.** `ComboboxInput` is a real, plain `<input>`, not a button (the structural reason a combobox MUST keep focus on the input: continuous typing would be impossible if focus moved per keystroke); `ComboboxItem`'s highlight class is `data-highlighted:bg-accent`, the SAME shape select's shadcn column used for REAL moved focus — but here the state is driven by base-ui's own internal "active index" concept, not the DOM focus target, per the pattern's own purpose | `[R]`, same APG convention |
| `behavior.pointer-activates-option` | switchable | on — `Option.handleMouseOver` calls `setActive`, the SAME mechanism select's Salt column has [S] | on `[R]` — `data-highlighted` styling implies pointer-move highlighting, the same convention select's shadcn column documented, though not independently confirmable at the exact event level (unvendored) | off `[R]` — same reasoning select gave: M3 keeps hover (8%) and focus (10%) state layers separate |
| `behavior.enter-commits` | locked | on — `handleKeyDown`'s `"Enter"` case calls `select(event, activeState)` when open and an option is active [S] | on `[R]`, general APG convention | on `[R]` |
| `behavior.dismiss-escape` | locked | on — `useDismiss(context)`'s own default `escapeKey: true`; NOTE `ComboBox.tsx`'s own `handleKeyDown` switch has NO explicit `"Escape"` case — dismissal on Escape is entirely floating-ui's, not hand-coded [S] | on `[R]` | on `[R]` |
| `behavior.dismiss-outside` | locked | on — `useDismiss(context)`'s own default `outsidePress: true` [S] | on `[R]` | on `[R]` |
| `behavior.status-inheritance` | switchable | on — `useFormFieldProps()`, the SAME non-uniform precedence select's Salt column documents (`||` for disabled/readOnly, `??` for validationStatus, plus the necessity channel) [S] | off [S] | off [R] |
| `behavior.empty-readonly-marker` | switchable | on — `emptyReadOnlyMarker` forwarded straight through to `PillInput`, identical mechanism to select's [S] | off | off |
| `behavior.readonly-suppresses-popup` | switchable | on, and it is FOUR things again, same shape as select: `useFloatingUI`'s own `open` expression includes `&& !readOnly`, `handleOpenChange` returns early when `readOnly`, `handleKeyDown` returns early when `readOnly`, and the role flips from `"combobox"` to `"textbox"` on the underlying `<input>` itself (a real accessibility DIFFERENCE from select, whose trigger stays a `<button>` either way — see Finding 6) [S] | off — no `readOnly` concept | off |
| `behavior.multiselect` | switchable (info) | **on, declared OUT OF SCOPE** — `ComboBox`'s `multiselect` prop, an array selection model with `PillInput`'s own `pills`/`onPillRemove` [S] | **on, declared OUT OF SCOPE** — base-ui's `multiple` prop plus `ComboboxChips`/`ComboboxChip`/`ComboboxChipsInput`, has-aria-invalid validation wiring on the CHIPS container itself [S] | off — no multi-select vocabulary in either autocomplete file [S] |
| `behavior.positioning-engine` | locked | DECLARED GAP, identical shape to select's own row — `@floating-ui/react`, `offset(1)`, `size()` writing `--overlay-minWidth`/`--overlay-maxHeight`, `flip({fallbackStrategy:"initialPlacement"})` [S] | DECLARED GAP — base-ui's own `Positioner`, publishing `--anchor-width`/`--available-width`/`--available-height`/`--transform-origin` (seen directly in `combobox.tsx`'s own `className` strings) [S, existence; R, exact algorithm] | `[R]`. NONE reimplemented — see the skeleton note. |

## 3 · Prop

| row | policy | note |
|---|---|---|
| `prop.variant` | switchable | Salt only: `primary`\|`secondary`\|`tertiary`, forwarded straight through to `PillInput`, identical mechanism to select's. shadcn/M3: off. |
| `prop.validation-status` | switchable | Salt: 3 values (`error`\|`warning`\|`success`), same `FormFieldValidationStatus` type select uses. shadcn: 1 — `aria-invalid`, wired through `InputGroup`'s own `has-[[data-slot][aria-invalid=true]]:border-destructive` rule (confirmed real, on the wrapping `InputGroup`, not the input itself) [S]. M3: 1 — the `error-*` family, present in both autocomplete files. |
| `prop.disabled` | locked | all three. Salt: `PillInput`'s `.saltPillInput-disabled` block (background/color/cursor). shadcn: base-ui's own `disabled` prop, threaded through `InputGroupInput`'s `disabled` styling. M3: four per-element `disabled-*` opacities, same family as select. |
| `prop.read-only` | switchable | Salt only, with the role-flip behavior above. shadcn: no `readOnly` prop on `ComboboxInput`'s own destructured props (only `disabled`/`showTrigger`/`showClear`) [S, confirmed absent]. M3: no read-only token. |
| `prop.placeholder` | switchable | Salt: on, `PillInput`'s own `placeholder` prop, styled identically to select's (`content-secondary-foreground` + `font-weight: 300`). shadcn: on, `ComboboxInput`'s `placeholder` prop passed straight to the native `<input>`. M3: **off** — same finding select recorded: neither autocomplete file has a placeholder token; an M3 text field shows a floating LABEL instead, which belongs to the separate `field` component. |

## 4 · Slot

| row | note |
|---|---|
| `slot.value` | consumer-owned, but it is the TYPED text, not a rendered label — a structural difference from select's `slot.value` (which is always exactly one option's label). Salt: `valueState`, directly editable. shadcn: the native input's own `value`. M3: `[R]`. |
| `slot.option-content` | consumer-owned in all three, identical shape to select's. |
| `slot.group-label` | consumer-owned, where the system has the part (Salt/shadcn only). |
| `slot.empty-state-text` | shadcn only — consumer-owned message inside `ComboboxEmpty` (its own docs example: `"No items found."`). |
| `slot.composes` | DECLARED COMPOSITION, same pattern as select: (a) the `field` wrapper; (b) an icon set (toggle glyph — swap for Salt, static for shadcn/M3 — the clear-button X, the checkmark); (c) the floating-position engine; (d) for M3, the standalone `menu` component. |

## 5 · State

| row | policy | note |
|---|---|---|
| `state.open-closed` | locked | all three, identical shape to select's. |
| `state.trigger-focus` | locked | Salt: `.saltPillInput-focused` sets `cursor: var(--salt-cursor-text)` and a dotted outline — see Finding 6, `text` not `pointer` (select's trigger, a button, used `pointer`). shadcn: focus-within ring on `InputGroup`. M3: outline/indicator thickening, same mechanism as select. |
| `state.option` | locked | rest/hover/active/selected/focus-visible/disabled — the SAME widest set select documented, because Salt/shadcn reuse the identical option parts. |
| `state.disabled` | locked | trigger and option, same per-system mechanisms select documents, now on an `<input>` instead of a `<button>` for the trigger half. |
| `state.read-only` | switchable | Salt only, plus the `role="textbox"` flip — see Finding 6. |

## 6 · Style — see the generated `Resolved values` block below for every
cell. Selected findings:

### Findings

1. **Salt's popup and option parts are the IDENTICAL shared components
   select's own Salt column already extracted values from, confirmed by
   import, not assumed by similarity.** `ComboBox.tsx` imports `OptionList`
   from `../option/OptionList` — the literal same module path
   `Dropdown.tsx` imports. Every `style.popup.*`/`style.option.*`/
   `style.group-label.*`/`style.group.border-top`/`style.separator` cell in
   `combobox.salt.json` reuses select.salt.json's own extracted values
   verbatim rather than re-deriving them, with the citation pointing at
   both files. The only genuinely NEW Salt surface this component needed to
   grep was the trigger (`PillInput`, not `Dropdown`) and the filter
   story.
2. **Salt's real combobox does not filter its own option list — the
   consumer does, and its own story shows exactly how.** Grepped `ComboBox.
   tsx`, `useComboBox.ts` and `ListControlState.ts` in full: none of them
   contains a `.filter()` call against the `children`/options the consumer
   passed. `combo-box.stories.tsx`'s own `Template` filters the array
   BEFORE handing it to `<ComboBox>`: `usStates.filter(state =>
   state.toLowerCase().includes(value.trim().toLowerCase()))` — a real,
   case-insensitive substring match, sourced [S] rather than assumed. This
   is the registry's own filter default (`behavior.registry-filter-default`),
   not an invented convenience — it is the one live filter algorithm this
   session could actually read.
3. **The popup anchoring axis flips relative to select — a genuine, sourced
   divergence, not a copy-paste carryover.** SELECT-MATRIX.md's shadcn
   column defaults to Radix's `item-aligned` mode (the popup overlays the
   trigger so the selected option lands on it). shadcn's `Combobox` primitive
   has no such mode: `ComboboxContent`'s own destructured `side = "bottom"`
   default places the popup BELOW the input, left-aligned by `align =
   "start"` — the SAME mechanical shape as Salt's own `bottom-start`
   placement. The reason is structural, not arbitrary: an "overlay the
   selected item on the trigger" mode makes sense for a closed-by-default
   button whose only visible content IS the selected value; it makes no
   sense for an editable text field whose visible content is whatever the
   user is currently typing. `structure.popup-anchor` is therefore `below`
   for ALL THREE columns here, where select had a real two-way split.
4. **`structure.empty-state` is a genuine shadcn-only structural richness,
   with no equivalent anywhere in the other two systems' real source.**
   `ComboboxEmpty` (`hidden ... group-data-empty/combobox-content:flex`) is
   a REAL, dedicated, first-class exported part — not a styling nicety, a
   whole additional anatomy node neither Salt's `ComboBox.tsx` nor either
   M3 autocomplete token file has any equivalent for (grepped Salt's file
   in full: an empty filtered `children` array renders an empty, zero-
   height `OptionList` with no message of any kind). This is TOOLTIP-
   MATRIX.md's arrow lesson in a new shape: a system-unique PART, not a
   system-unique value.
5. **M3's autocomplete token files are structurally near-identical to
   select's, confirmed by direct comparison, with one small but real
   divergence: the leading-icon size.** Both autocomplete files carry the
   full `menu-*` family plus `text-field-*`, no group/label/divider token of
   their own (identical to select — the same cross-file menu-borrow chain
   select.m3.json already established applies here verbatim), and outlined-
   autocomplete's `text-field-container-color` is ALSO `surface-container-
   highest` — the same "outlined is actually filled" surprise SELECT-
   MATRIX.md Finding 1 recorded, re-confirmed on a second M3 component
   rather than assumed to carry over. The one real difference: FILLED
   autocomplete's `text-field-leading-icon-size` is **20px**, where select's
   (and outlined-autocomplete's own) is **24px** — grepped directly, not a
   transcription slip; recorded as `style.adornment.size@filled` were a
   leading adornment modelled (this build declares no start-adornment slot
   for combobox, so the value is recorded here rather than as a live row —
   see the row table's `structure` section, which has no start-adornment
   concept at all for this component; a future session adding one should
   use 20px for filled, 24px for outlined, NOT copy select's flat 24px).
6. **A real accessibility divergence from select that only combobox has:
   Salt's `role` attribute FLIPS on read-only, and it flips on the element
   that ALSO changes structurally.** Select's trigger stays a `<button
   role="combobox">` whether or not it is read-only (only `aria-readonly`
   changes). Combobox's trigger is `role={readOnly ? "textbox" :
   "combobox"}` on the SAME `<input>` element — read-only genuinely changes
   what assistive technology is told this control even IS, not merely that
   it cannot be operated. The source comment explains why: `// Workaround
   to have readonly conveyed by screen readers`, linking
   `jpmorganchase/salt-ds#4586` — a workaround Salt's own team documented,
   confirming this is a deliberate accessibility fix, not an accident.
7. **A dedicated disclosure-toggle BUTTON, separate from the trigger, is a
   real structural axis unique to editable-trigger components — select
   never needed this row because its whole trigger already IS a button.**
   Both Salt's `showOptionsButton` and shadcn's `ComboboxTrigger` are real,
   separate, `tabIndex`-excluded elements nested beside/inside the input,
   confirmed by reading both files (not inferred from the part existing in
   select, where it was a bare glyph with no independent interactive
   element). `structure.toggle-button` (a whole part) is therefore a
   genuinely new row this component's own anatomy required, not a renamed
   copy of select's `structure.toggle-icon` (a style/glyph row on the one
   trigger element).

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/combobox.template.json` against every system, read from `columns/combobox.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

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
| `popup-bg` | rgb(255, 255, 255) | rgb(16, 24, 32) | **no** |
| `popup-shadow` | 0 6px 10px 0 rgba(0, 0, 0, 0.2) | 0 6px 10px 0 rgba(0, 0, 0, 0.55) | **no** |
| `separator-color` | rgba(0, 0, 0, 0.2) | rgba(255, 255, 255, 0.2) | **no** |
| `popup-gap` | 1px | — | **no** |
| `bg-current` | var(--field-bg) | — | **no** |
| `bg-current-disabled` | var(--field-bg-disabled) | — | **no** |
| `bg-current-readonly` | var(--field-bg-readonly) | — | **no** |
| `border-current` | var(--border) | — | **no** |
| `border-current-hover` | var(--border-hover) | — | **no** |
| `border-current-active` | var(--border-active) | — | **no** |
| `outline-current` | var(--border-active) | — | **no** |
| `combobox-trigger-width` | 0px | — | yes |

**shadcn** — 26 light, 12 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `field-bg` | transparent | color-mix(in oklab, oklch(1 0 0 / 15%) 30%, transparent) | yes |
| `fg` | oklch(0% 0 0) | oklch(0.985 0 0) | yes |
| `fg-secondary` | oklch(0.556 0 0) | oklch(0.708 0 0) | yes |
| `border-base` | oklch(0.922 0 0) | oklch(1 0 0 / 15%) | yes |
| `popup-border` | oklch(1 0 0 / 10%) | oklch(1 0 0 / 10%) | yes |
| `popup-bg` | oklch(1 0 0) | oklch(0.205 0 0) | **no** |
| `popup-fg` | oklch(0% 0 0) | oklch(0.985 0 0) | **no** |
| `accent-bg` | oklch(0.97 0 0) | oklch(0.371 0 0) | **no** |
| `accent-fg` | oklch(0.205 0 0) | oklch(0.985 0 0) | **no** |
| `focus` | oklch(0.708 0 0) | oklch(0.556 0 0) | yes |
| `danger` | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | yes |
| `shadow-color` | rgb(0 0 0 / 0.05) | — | **no** |
| `popup-shadow` | 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) | — | **no** |
| `radius-control` | calc(0.625rem * 0.8) | — | **no** |
| `radius-popup` | calc(0.625rem * 0.8) | — | **no** |
| `radius-option` | calc(0.625rem * 0.6) | — | **no** |
| `type-body` | 400 0.875rem/1.25rem ui-sans-serif, system-ui, sans-serif | — | **no** |
| `type-group-label` | 400 0.75rem/1rem ui-sans-serif, system-ui, sans-serif | — | **no** |
| `ring-alpha` | 50% | — | **no** |
| `ring-alpha-invalid` | 20% | 40% | **no** |
| `bg-current` | var(--field-bg) | — | **no** |
| `border-current` | var(--border-base) | — | **no** |
| `border-current-active` | var(--focus) | — | **no** |
| `ring-current` | var(--focus) | — | **no** |
| `ring-alpha-current` | var(--ring-alpha) | — | **no** |
| `combobox-trigger-width` | 0px | — | **no** |

**m3** — 35 light, 22 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `trigger-bg` | #e6e0e9 | #36343b | **no** |
| `trigger-bg-hover` | color-mix(in oklab, #1d1b20 8%, #e6e0e9) | color-mix(in oklab, #e6e0e9 8%, #36343b) | **no** |
| `trigger-bg-disabled` | color-mix(in oklab, #1d1b20 4%, transparent) | color-mix(in oklab, #e6e0e9 4%, transparent) | **no** |
| `fg` | #1d1b20 | #e6e0e9 | **no** |
| `fg-disabled` | color-mix(in oklab, #1d1b20 38%, transparent) | color-mix(in oklab, #e6e0e9 38%, transparent) | **no** |
| `fg-secondary` | #49454f | #cac4d0 | **no** |
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
| `popup-bg` | #f3edf7 | #211f26 | **no** |
| `popup-fg` | #1d1b20 | #e6e0e9 | **no** |
| `popup-shadow` | 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15) | — | **no** |
| `option-bg-selected` | #e6e0e9 | #36343b | **no** |
| `option-layer-hover` | color-mix(in oklab, #1d1b20 8%, transparent) | color-mix(in oklab, #e6e0e9 8%, transparent) | **no** |
| `option-layer-focus` | color-mix(in oklab, #1d1b20 12%, transparent) | color-mix(in oklab, #e6e0e9 12%, transparent) | **no** |
| `separator-color` | #e7e0ec | #49454f | **no** |
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
| `combobox-trigger-width` | 0px | — | **no** |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.trigger` | structure | locked | `True` | `True` | `True` |
| 2 | `structure.indicator` | structure | switchable | `underline, box` | `box` | `underline, box` |
| 3 | `structure.toggle-button` | structure | switchable | `swap` | `static` | `static` |
| 4 | `structure.clear-button` | structure | switchable | **off** | `True` | **off** |
| 5 | `structure.popup` | structure | locked | `True` | `True` | `True` |
| 6 | `structure.option-group` | structure | switchable | `True` | `True` | **off** |
| 7 | `structure.separator` | structure | switchable | **off** | `True` | `True` |
| 8 | `structure.empty-state` | structure | switchable | **off** | `True` | **off** |
| 9 | `structure.selected-marker` | structure | locked | `fill` | `check` | `fill` |
| 10 | `structure.popup-anchor` | structure | locked | `below` | `below` | `below` |
| 11 | `behavior.open-trigger` | behavior | locked | — | — | — |
| 12 | `behavior.filter` | behavior | switchable | — | — | — |
| 13 | `behavior.registry-filter-default` | behavior | default | — | — | — |
| 14 | `behavior.focus-model` | behavior | locked | — | — | — |
| 15 | `behavior.pointer-activates-option` | behavior | switchable | `True` | `True` | `False` |
| 16 | `behavior.enter-commits` | behavior | locked | — | — | — |
| 17 | `behavior.dismiss-escape` | behavior | locked | — | — | — |
| 18 | `behavior.dismiss-outside` | behavior | locked | — | — | — |
| 19 | `behavior.status-inheritance` | behavior | switchable | `True` | **off** | **off** |
| 20 | `behavior.empty-readonly-marker` | behavior | switchable | `—` | **off** | **off** |
| 21 | `behavior.readonly-suppresses-popup` | behavior | switchable | `True` | **off** | **off** |
| 22 | `behavior.multiselect` | behavior | switchable | `True` | `True` | **off** |
| 23 | `behavior.positioning-engine` | behavior | locked | — | — | — |
| 24 | `prop.variant` | prop | switchable | `primary, secondary, tertiary` | **off** | **off** |
| 25 | `prop.validation-status` | prop | switchable | `error, warning, success` | `error` | `error` |
| 26 | `prop.disabled` | prop | locked | `True, False` | `True, False` | `True, False` |
| 27 | `prop.read-only` | prop | switchable | `True, False` | **off** | **off** |
| 28 | `prop.placeholder` | prop | switchable | `True` | `True` | **off** |
| 29 | `slot.value` | slot | locked | — | — | — |
| 30 | `slot.option-content` | slot | locked | — | — | — |
| 31 | `slot.group-label` | slot | switchable | `True` | `True` | **off** |
| 32 | `slot.empty-state-text` | slot | switchable | — | `True` | **off** |
| 33 | `slot.composes` | slot | default | — | — | — |
| 34 | `state.open-closed` | state | locked | — | — | — |
| 35 | `state.trigger-focus` | state | locked | — | — | — |
| 36 | `state.option` | state | locked | — | — | — |
| 37 | `state.disabled` | state | locked | — | — | — |
| 38 | `state.read-only` | state | switchable | `True` | **off** | **off** |
| 39 | `style.trigger.background` | style | locked | ⟡ `bg-current` | ⟡ `bg-current` | ⟡ `bg-current` |
| 40 | `style.trigger.background@box` | style | switchable | **off** | **off** | **off** |
| 41 | `style.trigger.color` | style | locked | ⟡ `fg` | ⟡ `fg` | ⟡ `fg` |
| 42 | `style.trigger.font` | style | default | ⟡ `type-body` | ⟡ `type-body` | ⟡ `type-body` |
| 43 | `style.trigger.letter-spacing` | style | switchable | `0` | **off** | `0.03125rem` |
| 44 | `style.trigger.min-height` | style | default | ⟡ `control-height` | `36px` | **off** |
| 45 | `style.trigger.padding` | style | default | ⟡ `field-padding` | `0 12px` | `16px` |
| 46 | `style.trigger.gap` | style | switchable | ⟡ `trigger-gap` | `8px` | `16px` |
| 47 | `style.trigger.shape` | style | default | ⟡ `corner-weak` | ⟡ `radius-control` | `4px 4px 0 0` |
| 48 | `style.trigger.shape@box` | style | switchable | **off** | **off** | `4px` |
| 49 | `style.trigger.cursor` | style | switchable | `text` | **off** | **off** |
| 50 | `style.trigger.transition` | style | switchable | **off** | `color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)` | **off** |
| 51 | `style.trigger.border@box` | style | switchable | `border-width: 1px; border-style: solid; border-color: var(--border-current)` | `border-width: 1px; border-style: solid; border-color: var(--border-current)` | `border-width: 1px; border-style: solid; border-color: var(--border-current)` |
| 52 | `style.indicator.border@underline` | style | switchable | `border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: var(--border-current)` | **off** | `border-bottom-width: 1px; border-bottom-color: var(--indicator-current)` |
| 53 | `style.trigger.background@hover` | style | switchable | **off** | **off** | ⟡ `bg-current-hover` |
| 54 | `style.trigger.border@box-hover` | style | switchable | `border-color: var(--border-current-hover)` | **off** | `border-color: var(--border-current-hover)` |
| 55 | `style.indicator.border@underline-hover` | style | switchable | `border-bottom-color: var(--border-current-hover)` | **off** | `border-bottom-color: var(--indicator-current-hover)` |
| 56 | `style.trigger.border@box-focus` | style | switchable | `border-color: var(--border-current-active)` | `border-color: var(--border-current-active)` | `border-color: var(--border-current-active); border-width: 2px` |
| 57 | `style.indicator.border@underline-focus` | style | switchable | `border-bottom-width: 2px; border-bottom-color: var(--border-current-active)` | **off** | `border-bottom-width: 2px; border-bottom-color: var(--indicator-current-active)` |
| 58 | `style.trigger.focus` | style | switchable | `outline: 2px dotted var(--outline-current)` | `outline: none; box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring-current) var(--ring-alpha-current), transparent), 0 1px 2px 0 var(--shadow-color)` | **off** |
| 59 | `style.trigger.background@readonly` | style | switchable | ⟡ `bg-current-readonly` | **off** | **off** |
| 60 | `style.trigger.background@disabled` | style | switchable | ⟡ `bg-current-disabled` | **off** | ⟡ `bg-current-disabled` |
| 61 | `style.trigger.background@box-disabled` | style | switchable | **off** | **off** | `var(--trigger-bg)` |
| 62 | `style.trigger.color@disabled` | style | switchable | ⟡ `fg-disabled` | **off** | ⟡ `fg-disabled` |
| 63 | `style.trigger.disabled` | style | switchable | `cursor: not-allowed` | `opacity: 0.5; cursor: not-allowed` | **off** |
| 64 | `style.value.placeholder` | style | switchable | `color: var(--fg-secondary); font-weight: 300` | `color: var(--fg-secondary)` | **off** |
| 65 | `style.toggle-button.size` | style | switchable | `width: var(--toggle-icon-size); height: var(--toggle-icon-size)` | `width: 16px; height: 16px` | `width: 24px; height: 24px` |
| 66 | `style.toggle-button.color` | style | switchable | **off** | `color: var(--fg-secondary)` | `color: var(--fg-secondary)` |
| 67 | `style.clear-button.size` | style | switchable | **off** | `width: 16px; height: 16px` | **off** |
| 68 | `style.popup.background` | style | locked | ⟡ `popup-bg` | ⟡ `popup-bg` | ⟡ `popup-bg` |
| 69 | `style.popup.color` | style | locked | ⟡ `fg` | ⟡ `popup-fg` | ⟡ `popup-fg` |
| 70 | `style.popup.border` | style | switchable | `border-width: 1px; border-style: solid; border-color: var(--accent)` | `border-width: 1px; border-style: solid; border-color: var(--popup-border)` | **off** |
| 71 | `style.popup.shape` | style | default | ⟡ `popup-corner` | ⟡ `radius-popup` | `4px` |
| 72 | `style.popup.shadow` | style | switchable | ⟡ `popup-shadow` | ⟡ `popup-shadow` | ⟡ `popup-shadow` |
| 73 | `style.popup.padding` | style | switchable | `0` | `4px` | `8px 0` |
| 74 | `style.popup.min-width` | style | switchable | ⟡ `combobox-trigger-width` | `var(--combobox-trigger-width, 0px)` | ⟡ `combobox-trigger-width` |
| 75 | `style.popup.z-index` | style | default | `1500` | `50` | **off** |
| 76 | `style.popup.animation` | style | switchable | **off** | `combobox-popup-in 100ms ease-out` | **off** |
| 77 | `style.option.background` | style | locked | `transparent` | `transparent` | `transparent` |
| 78 | `style.option.color` | style | switchable | ⟡ `fg` | **off** | **off** |
| 79 | `style.option.font` | style | default | ⟡ `type-body` | ⟡ `type-body` | ⟡ `type-option` |
| 80 | `style.option.min-height` | style | switchable | ⟡ `option-min-height` | **off** | `48px` |
| 81 | `style.option.padding` | style | default | ⟡ `option-padding` | `6px 32px 6px 8px` | `12px 16px` |
| 82 | `style.option.gap` | style | switchable | ⟡ `option-gap` | `8px` | **off** |
| 83 | `style.option.cursor` | style | switchable | `pointer` | `default` | **off** |
| 84 | `style.option.background@hover` | style | switchable | `background-color: var(--accent-weakest)` | **off** | `background-image: linear-gradient(var(--option-layer-hover), var(--option-layer-hover))` |
| 85 | `style.option.active` | style | switchable | `background-color: var(--accent-weakest)` | `background-color: var(--accent-bg); color: var(--accent-fg)` | `background-image: linear-gradient(var(--option-layer-focus), var(--option-layer-focus))` |
| 86 | `style.option.focus-visible` | style | switchable | `outline: 2px dotted var(--border-active); outline-offset: -2px` | **off** | **off** |
| 87 | `style.option.disabled` | style | switchable | `opacity: 0.4; cursor: not-allowed; color: var(--fg); background-color: transparent` | `opacity: 0.5; pointer-events: none` | `opacity: 0.3` |
| 88 | `style.option.selected` | style | switchable | `background-color: var(--accent-weaker); z-index: 1; box-shadow: -2px 0 0 0 var(--accent-weakest), -1px 0 0 1px var(--accent), 0 -1px 0 var(--accent)` | **off** | `background-color: var(--option-bg-selected)` |
| 89 | `style.selected-marker.box` | style | switchable | **off** | `right: 8px; width: 16px; height: 16px` | **off** |
| 90 | `style.group-label.font` | style | switchable | ⟡ `type-group-label` | ⟡ `type-group-label` | **off** |
| 91 | `style.group-label.color` | style | switchable | ⟡ `fg-secondary` | ⟡ `fg-secondary` | **off** |
| 92 | `style.group-label.padding` | style | switchable | `padding: var(--option-padding); min-height: var(--option-min-height)` | `padding: 6px 8px` | **off** |
| 93 | `style.group.border-top` | style | switchable | `border-top: 1px solid var(--separator-color)` | **off** | **off** |
| 94 | `style.separator` | style | switchable | **off** | `height: 1px; margin: 4px -4px; background-color: var(--popup-border); pointer-events: none` | `height: 1px; background-color: var(--separator-color)` |
| 95 | `style.empty.color` | style | switchable | **off** | ⟡ `fg-secondary` | **off** |
| 96 | `style.empty.font` | style | switchable | **off** | `0.875rem/1.25rem` | **off** |
| 97 | `style.empty.padding` | style | switchable | **off** | `8px 0` | **off** |
| 98 | `style.trigger.variant@secondary` | style | switchable | `--bg-current: var(--field-bg-secondary); --bg-current-disabled: var(--field-bg-secondary-disabled)` | **off** | **off** |
| 99 | `style.trigger.variant@tertiary` | style | switchable | `--bg-current: var(--field-bg-tertiary); --bg-current-disabled: var(--field-bg-tertiary-disabled)` | **off** | **off** |
| 100 | `style.trigger.status@error` | style | switchable | `--border-current: var(--status-error); --border-current-hover: var(--status-error); --border-current-active: var(--status-error); --outline-current: var(--status-error); --bg-current: var(--status-error-bg); --bg-current-readonly: var(--status-error-bg)` | `--border-current: var(--danger); --border-current-active: var(--danger); --ring-current: var(--danger); --ring-alpha-current: var(--ring-alpha-invalid)` | `--border-current: var(--status-error); --border-current-hover: var(--status-error-hover); --border-current-active: var(--status-error); --indicator-current: var(--status-error); --indicator-current-hover: var(--status-error-hover); --indicator-current-active: var(--status-error)` |
| 101 | `style.trigger.status@warning` | style | switchable | `--border-current: var(--status-warning); --border-current-hover: var(--status-warning); --border-current-active: var(--status-warning); --outline-current: var(--status-warning); --bg-current: var(--status-warning-bg); --bg-current-readonly: var(--status-warning-bg)` | **off** | **off** |
| 102 | `style.trigger.status@success` | style | switchable | `--border-current: var(--status-success); --border-current-hover: var(--status-success); --border-current-active: var(--status-success); --outline-current: var(--status-success); --bg-current: var(--status-success-bg); --bg-current-readonly: var(--status-success-bg)` | **off** | **off** |

<details><summary>Citations — 166 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.trigger` | salt | ComboBox.tsx renders PillInput, whose inner <input> carries role={readOnly?"textbox":"combobox"} |
| `structure.trigger` | shadcn | combobox.tsx ComboboxInput renders ComboboxPrimitive.Input via InputGroupInput -> a real <input> element |
| `structure.trigger` | m3 | [R] — a text-field container per the token file's own text-field-* prefix, editable per the caret-related tokens autocomplete carries (select's own file has none — see COMBOBOX-MATRIX.md's scope note) |
| `structure.indicator` | salt | ComboBox.tsx bordered?: boolean, default false; PillInput.css .saltPillInput-bordered vs .saltPillInput-activationIndicator |
| `structure.indicator` | shadcn | input-group.tsx InputGroup class `rounded-md border border-input` |
| `structure.indicator` | m3 | _md-comp-filled-autocomplete.scss text-field-active-indicator-color/-height vs _md-comp-outlined-autocomplete.scss text-field-outline-color/-width |
| `structure.toggle-button` | salt | ComboBox.tsx showOptionsButton: aria-expanded={openState} ... {openState ? <CollapseIcon aria-hidden/> : <ExpandIcon aria-hidden/>} — a real, nested Button, tabIndex={-1}, inside PillInput's endAdornment |
| `structure.toggle-button` | shadcn | combobox.tsx ComboboxTrigger, data-slot="combobox-trigger", a single static ChevronDownIcon, never swapped |
| `structure.toggle-button` | m3 | [R] — text-field-trailing-icon-size/-color exist; no live component to say whether the glyph swaps |
| `structure.clear-button` | salt | CONFIRMED ABSENT — grepped ComboBox.tsx and PillInput.tsx in full, no clear/reset affordance of any kind exists |
| `structure.clear-button` | shadcn | combobox.tsx ComboboxClear, data-slot="combobox-clear", opt-in via ComboboxInput's own showClear prop (default false), holds an XIcon |
| `structure.clear-button` | m3 | CONFIRMED ABSENT — no clear-icon token in either autocomplete file |
| `structure.popup` | salt | ComboBox.tsx <OptionList aria-multiselectable={multiselect} open={...} ...>{children}</OptionList> — the identical shared part select.salt.json documents |
| `structure.popup` | shadcn | combobox.tsx ComboboxPrimitive.Portal > Positioner > Popup, data-slot="combobox-content" |
| `structure.popup` | m3 | [R] — the same menu-* family select.m3.json documents |
| `structure.option-group` | salt | packages/core/src/option/OptionGroup.tsx, the identical shared part select uses |
| `structure.option-group` | shadcn | combobox.tsx ComboboxGroup + ComboboxLabel |
| `structure.option-group` | m3 | CONFIRMED ABSENT — no group/group-label/subheader/overline token in either autocomplete file, in versions/v0_192/_md-comp-menu.scss, or in versions/v0_192/_md-comp-list.scss, matching select's own finding exactly |
| `structure.separator` | salt | no separator component; the same border-top-on-the-group job select's Salt column documents |
| `structure.separator` | shadcn | combobox.tsx ComboboxSeparator |
| `structure.separator` | m3 | menu-divider-height 1px + menu-divider-color -> surface-variant, identical to select |
| `structure.empty-state` | salt | CONFIRMED ABSENT — ComboBox.tsx renders children directly with no empty-list branch of any kind |
| `structure.empty-state` | shadcn | combobox.tsx ComboboxEmpty — a real, dedicated part with no equivalent in Salt or M3 |
| `structure.empty-state` | m3 | CONFIRMED ABSENT — no equivalent token anywhere in either autocomplete file |
| `structure.selected-marker` | salt | shared Option component — no glyph in single-select, identical to select's Salt column |
| `structure.selected-marker` | shadcn | combobox.tsx ComboboxItem renders ComboboxItemIndicator holding a CheckIcon, absolutely positioned right-2, pr-8 reserved on every item |
| `structure.selected-marker` | m3 | menu-list-item-selected-container-color -> surface-container-highest, identical to select |
| `structure.popup-anchor` | salt | ComboBox.tsx useFloatingUI({ placement: "bottom-start", middleware: [offset(1), size(...), flip(...)] }) |
| `structure.popup-anchor` | shadcn | combobox.tsx ComboboxContent side="bottom" (default), align="start" (default) — see the no-item-aligned provenance entry |
| `structure.popup-anchor` | m3 | [R] — no live component and no anchoring token, same flagged convention select's own row uses |
| `behavior.pointer-activates-option` | salt | Option.tsx handleMouseOver -> setActive(optionValue), identical mechanism to select's Salt column |
| `behavior.pointer-activates-option` | shadcn | combobox.tsx ComboboxItem data-highlighted:bg-accent |
| `behavior.pointer-activates-option` | m3 | [R], token-backed — the list-item family keeps hover (0.08) and focus (0.12) as separate state-layer opacities, identical reasoning to select.m3.json's own row |
| `behavior.status-inheritance` | salt | ComboBox.tsx const { a11yProps, disabled: formFieldDisabled, readOnly: formFieldReadOnly } = useFormFieldProps(); disabled = Boolean(disabledProp) \|\| formFieldDisabled; readOnly = Boolean(readOnlyProp) \|\| formFieldReadOnly |
| `behavior.status-inheritance` | shadcn | no context channel |
| `behavior.status-inheritance` | m3 | no context mechanism in a tokens-only clone |
| `behavior.empty-readonly-marker` | salt | ComboBox.tsx forwards emptyReadOnlyMarker straight through to PillInput's own default "—" |
| `behavior.empty-readonly-marker` | shadcn | no equivalent |
| `behavior.readonly-suppresses-popup` | salt | ComboBox.tsx: useFloatingUI({ open: openState && !readOnly && hasValidChildren, ... }); handleOpenChange early-returns `if (readOnly \|\| focusNotBlur) return`; handleKeyDown early-returns `if (readOnly) { return }`; PillInput role prop flips to "textbox" -- see the aria provenance entry and COMBOBOX-MATRIX.md Finding 6 |
| `behavior.readonly-suppresses-popup` | shadcn | ComboboxInput's own destructured props are only disabled/showTrigger/showClear — no readOnly prop exists |
| `behavior.readonly-suppresses-popup` | m3 | no read-only token in either autocomplete file |
| `behavior.multiselect` | salt | ComboBox.tsx multiselect prop, PillInput's own pills/onPillRemove |
| `behavior.multiselect` | shadcn | base-ui's own `multiple` prop plus combobox.tsx's ComboboxChips/ComboboxChip/ComboboxChipsInput |
| `behavior.multiselect` | m3 | no multi-select vocabulary in either autocomplete file |
| `prop.variant` | salt | ComboBox.tsx variant = "primary" forwarded straight to PillInput |
| `prop.variant` | m3 | M3's only variant axis IS filled-vs-outlined, already modelled as structure.indicator |
| `prop.validation-status` | salt | ComboBoxProps extends UseComboBoxProps<Item> & Omit<PillInputProps,...>, which carries validationStatus?: FormFieldValidationStatus |
| `prop.validation-status` | shadcn | input-group.tsx InputGroup: has-[[data-slot][aria-invalid=true]]:border-destructive has-[...]:ring-destructive/20 dark:has-[...]:ring-destructive/40 |
| `prop.validation-status` | m3 | _md-comp-{filled,outlined}-autocomplete.scss text-field-error-* family |
| `prop.disabled` | salt | ComboBox.tsx disabled = Boolean(disabledProp) \|\| formFieldDisabled |
| `prop.disabled` | shadcn | combobox.tsx ComboboxInput disabled = false destructured, forwarded to InputGroupInput -> Input's own disabled styling |
| `prop.disabled` | m3 | disabled-* opacity family: container 0.04 (filled only), outline 0.12 (outlined only), active-indicator 0.38 (filled only), input-text 0.38, label-text 0.38 — identical to select |
| `prop.read-only` | salt | ComboBox.tsx readOnly = Boolean(readOnlyProp) \|\| formFieldReadOnly |
| `prop.read-only` | shadcn | CONFIRMED ABSENT — no readOnly prop on ComboboxInput |
| `prop.read-only` | m3 | no read-only token |
| `prop.placeholder` | salt | PillInputProps placeholder, forwarded through ComboBox's ...rest spread |
| `prop.placeholder` | shadcn | combobox.tsx ComboboxInput placeholder prop passed straight to the native <input> |
| `prop.placeholder` | m3 | CONFIRMED ABSENT — same finding select recorded: neither autocomplete file has a placeholder token, an M3 combobox shows a floating LABEL instead |
| `style.trigger.background` | m3 | the same container colour for both variants — see the outlined-autocomplete-IS-filled-too provenance entry |
| `style.trigger.background@box` | salt | bordered declares only a border, same as select's Salt column |
| `style.trigger.background@box` | shadcn | box is shadcn's only mode |
| `style.trigger.background@box` | m3 | CONFIRMED: _md-comp-outlined-autocomplete.scss carries text-field-container-color -> surface-container-highest, identical to filled |
| `style.trigger.color` | m3 | text-field-input-text-color -> on-surface |
| `style.trigger.letter-spacing` | salt | PillInput.css letter-spacing: var(--saltPillInput-letterSpacing, 0) |
| `style.trigger.letter-spacing` | m3 | text-field-input-text-tracking -> body-large-tracking |
| `style.trigger.min-height` | shadcn | input-group.tsx InputGroup class h-9 |
| `style.trigger.min-height` | m3 | DECLARED GAP, identical shape to select's own row — no height token in either v0.192 autocomplete file |
| `style.trigger.padding` | shadcn | InputGroup composes InputGroupInput, which inherits Input's own horizontal padding via the has-[>[data-align]] rules; combobox.tsx's own ComboboxInput sets no extra padding class |
| `style.trigger.padding` | m3 | DECLARED CROSS-COMPONENT BORROW, tokens/_md-comp-{filled,outlined}-field.scss, identical to select's own borrow (neither autocomplete file carries any spacing token) |
| `style.trigger.gap` | shadcn | InputGroupAddon's own class gap-2 |
| `style.trigger.gap` | m3 | content-space, same cross-component borrow as select |
| `style.trigger.shape` | m3 | filled text-field-container-shape -> corner-extra-small-top |
| `style.trigger.shape@box` | m3 | outlined text-field-container-shape -> corner-extra-small, all four corners |
| `style.trigger.cursor` | salt | PillInput.css .saltPillInput:hover { cursor: var(--salt-cursor-text) } — see COMBOBOX-MATRIX.md Finding 6's sibling note: a real divergence from select's own pointer cursor, because this trigger is an editable field, not a button |
| `style.trigger.cursor` | shadcn | no cursor utility on the input itself; the browser's native text-input cursor applies, which IS text — same rendered result as Salt's explicit token, but shadcn declares nothing |
| `style.trigger.transition` | salt | CONFIRMED ABSENCE — no transition/animation rule anywhere in PillInput.css |
| `style.trigger.transition` | shadcn | input-group.tsx InputGroup class transition-[color,box-shadow] |
| `style.trigger.border@box` | salt | PillInput.css .saltPillInput-bordered { border: var(--pillInput-borderWidth) var(--salt-borderStyle-solid) var(--pillInput-borderColor) } |
| `style.trigger.border@box` | shadcn | input-group.tsx InputGroup class `border border-input` |
| `style.trigger.border@box` | m3 | outlined text-field-outline-color -> outline, text-field-outline-width 1px |
| `style.indicator.border@underline` | salt | PillInput.css .saltPillInput-activationIndicator { border-bottom: var(--salt-size-fixed-100) solid var(--pillInput-borderColor) } |
| `style.indicator.border@underline` | m3 | filled text-field-active-indicator-color -> on-surface-variant, text-field-active-indicator-height 1px |
| `style.trigger.background@hover` | salt | CONFIRMED ABSENCE — PillInput.css changes only the cursor on hover, never the background, identical to select's own Salt column |
| `style.trigger.background@hover` | shadcn | CONFIRMED ABSENCE — see no-hover-on-trigger provenance; a real contrast with select's own dark-mode hover |
| `style.trigger.background@hover` | m3 | text-field-hover-state-layer-color -> on-surface at hover-state-layer-opacity 0.08, composited over the container colour — identical mechanism to select |
| `style.trigger.border@box-hover` | salt | PillInput.css .saltPillInput-bordered.saltPillInput:hover { border-color: var(--pillInput-borderColor-hover) } |
| `style.trigger.border@box-hover` | m3 | outlined text-field-hover-outline-color -> on-surface |
| `style.indicator.border@underline-hover` | salt | PillInput.css .saltPillInput:hover .saltPillInput-activationIndicator { border-bottom-color: var(--pillInput-borderColor-hover) } |
| `style.indicator.border@underline-hover` | m3 | filled text-field-hover-active-indicator-color -> on-surface |
| `style.trigger.border@box-focus` | salt | PillInput.css .saltPillInput-bordered.saltPillInput-focused { border-color: var(--pillInput-borderColor-active) } |
| `style.trigger.border@box-focus` | shadcn | input-group.tsx InputGroup class has-[[data-slot=input-group-control]:focus-visible]:border-ring |
| `style.trigger.border@box-focus` | m3 | outlined text-field-focus-outline-color -> primary, text-field-focus-outline-width 2px (v0_192's own hardcoded value — this column's pinned edition), identical to select's own outlined row under the same pin |
| `style.indicator.border@underline-focus` | salt | PillInput.css .saltPillInput-focused .saltPillInput-activationIndicator { border-bottom: var(--salt-size-fixed-200) solid var(--pillInput-borderColor-active) } |
| `style.indicator.border@underline-focus` | m3 | filled text-field-focus-active-indicator-color -> primary, text-field-focus-active-indicator-height 2px |
| `style.trigger.focus` | salt | PillInput.css .saltPillInput-focused { outline: var(--saltPillInput-outline, var(--salt-focused-outlineWidth) var(--salt-focused-outlineStyle) var(--pillInput-outlineColor)) } -> 2px dotted, reassigned to the status colour |
| `style.trigger.focus` | shadcn | input-group.tsx InputGroup class has-[...]:ring-[3px] has-[...]:ring-ring/50, layered after shadow-xs the same way select.shadcn.json's own style.trigger.focus documents |
| `style.trigger.focus` | m3 | focus is expressed entirely by the indicator/outline thickening and recolouring, identical to select |
| `style.trigger.background@readonly` | salt | PillInput.css .saltPillInput.saltPillInput-readOnly { background: var(--pillInput-background-readonly) } |
| `style.trigger.background@disabled` | salt | PillInput.css .saltPillInput-disabled { background: var(--pillInput-background-disabled) } |
| `style.trigger.background@disabled` | shadcn | one blanket opacity via the composed Input's own disabled styling |
| `style.trigger.background@disabled` | m3 | filled text-field-disabled-container-color -> on-surface at 0.04 |
| `style.trigger.background@box-disabled` | m3 | outlined has a container-color and no disabled-container-color/-opacity, so a disabled outlined combobox keeps its enabled fill — same precision row select's own uses |
| `style.trigger.color@disabled` | salt | PillInput.css .saltPillInput-disabled { color: var(--saltPillInput-color-disabled, var(--salt-content-primary-foreground-disabled)) } |
| `style.trigger.color@disabled` | m3 | text-field-disabled-input-text-color -> on-surface at 0.38 |
| `style.trigger.disabled` | salt | PillInput.css .saltPillInput-disabled { cursor: var(--salt-cursor-disabled) } |
| `style.trigger.disabled` | shadcn | combobox.tsx ComboboxInput forwards disabled to InputGroupInput -> Input, which carries disabled:opacity-50 disabled:cursor-not-allowed |
| `style.trigger.disabled` | m3 | no cursor/pointer-events token; M3's disabled treatment is entirely the per-element opacities |
| `style.value.placeholder` | salt | PillInput.css .saltPillInput-input::placeholder { color: var(--salt-content-secondary-foreground); font-weight: var(--salt-text-fontWeight-small) } |
| `style.value.placeholder` | shadcn | the composed Input's own ::placeholder rule -> text-muted-foreground |
| `style.value.placeholder` | m3 | CONFIRMED ABSENT — same finding select recorded, no placeholder token in either autocomplete file |
| `style.toggle-button.size` | salt | DECLARED COMPOSITION — same Icon.css clamp select's own row uses (max(size-icon, 12px)) |
| `style.toggle-button.size` | shadcn | combobox.tsx ComboboxTrigger's own [&_svg:not([class*='size-'])]:size-4 rule, matching the chevron |
| `style.toggle-button.size` | m3 | text-field-trailing-icon-size 24px |
| `style.toggle-button.color` | salt | currentColor, no .saltIcon-primary/-secondary applied, inherits the field's own colour |
| `style.toggle-button.color` | shadcn | combobox.tsx ChevronDownIcon className text-muted-foreground |
| `style.toggle-button.color` | m3 | text-field-trailing-icon-color -> on-surface-variant |
| `style.clear-button.size` | shadcn | combobox.tsx ComboboxClear composes InputGroupButton size="icon-xs" — see the clear-and-trigger-buttons provenance entry |
| `style.popup.background` | m3 | menu-container-color -> surface-container, identical to select |
| `style.popup.border` | salt | IDENTICAL to select.salt.json's own style.popup.border — OptionList.css border: var(--salt-size-fixed-100) solid var(--salt-selectable-borderColor-selected) |
| `style.popup.border` | shadcn | combobox.tsx ComboboxContent class ring-1 ring-foreground/10 |
| `style.popup.border` | m3 | CONFIRMED ABSENT — no outline/border token in the menu family, identical to select |
| `style.popup.shape` | m3 | menu-container-shape -> corner-extra-small |
| `style.popup.shadow` | m3 | [R] level2 elevation, identical derivation to select |
| `style.popup.padding` | salt | IDENTICAL to select.salt.json — .saltOptionList-container declares no padding |
| `style.popup.padding` | shadcn | combobox.tsx ComboboxList class p-1 |
| `style.popup.padding` | m3 | DECLARED CROSS-FILE BORROW, identical to select's own top/bottom-space |
| `style.popup.min-width` | shadcn | combobox.tsx ComboboxContent class w-(--anchor-width) |
| `style.popup.min-width` | m3 | [R] — no width token in either edition; the same registry convention select's own row uses (matching the trigger's width) |
| `style.popup.z-index` | salt | IDENTICAL to select.salt.json — OptionList.css z-index: var(--salt-zIndex-flyover) |
| `style.popup.z-index` | shadcn | combobox.tsx ComboboxPositioner class isolate z-50 |
| `style.popup.animation` | salt | CONFIRMED ABSENCE, identical to select.salt.json |
| `style.popup.animation` | shadcn | combobox.tsx ComboboxContent class duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 |
| `style.option.background` | m3 | tokens/_md-comp-menu-item.scss explicitly sets container-color to transparent, identical to select |
| `style.option.min-height` | m3 | menu-list-item-container-height, identical to select |
| `style.option.padding` | shadcn | combobox.tsx ComboboxItem class py-1.5 pr-8 pl-2 |
| `style.option.padding` | m3 | DECLARED CROSS-FILE BORROW, identical to select's own |
| `style.option.gap` | salt | Option.css gap: var(--salt-spacing-100) — the FULL spacing step, NOT the trigger's own halved gap (trigger-gap/spacing-50). Identical resolved values to select.salt.json's own style.option.gap (4/8/12/16 by density). |
| `style.option.gap` | shadcn | combobox.tsx ComboboxItem class gap-2 |
| `style.option.gap` | m3 | DECLARED GAP, identical to select's own row — list-item-between-space is a latest-only token |
| `style.option.cursor` | shadcn | combobox.tsx ComboboxItem class cursor-default |
| `style.option.background@hover` | shadcn | CONFIRMED ABSENCE — highlight is data-highlighted, not hover: |
| `style.option.background@hover` | m3 | list-item-hover-state-layer-color -> on-surface at 0.08 |
| `style.option.active` | shadcn | combobox.tsx ComboboxItem class data-highlighted:bg-accent data-highlighted:text-accent-foreground |
| `style.option.active` | m3 | list-item-focus-state-layer-color -> on-surface at 0.12, identical to select |
| `style.option.focus-visible` | m3 | no focus-indicator family in v0_192's menu tokens, identical to select |
| `style.option.disabled` | shadcn | combobox.tsx ComboboxItem class data-[disabled]:pointer-events-none data-[disabled]:opacity-50 |
| `style.option.disabled` | m3 | list-item-disabled-label-text-opacity, identical to select |
| `style.option.selected` | salt | IDENTICAL to select.salt.json's own style.option.selected — shared Option component |
| `style.option.selected` | shadcn | CONFIRMED ABSENCE — marked only by the checkmark, see structure.selected-marker |
| `style.option.selected` | m3 | menu-list-item-selected-container-color -> surface-container-highest, identical to select |
| `style.selected-marker.box` | shadcn | combobox.tsx ComboboxItemIndicator span class absolute right-2 flex size-4, holding a size-4 CheckIcon |
| `style.group-label.padding` | shadcn | combobox.tsx ComboboxLabel class px-2 py-1.5 |
| `style.separator` | shadcn | combobox.tsx ComboboxSeparator class -mx-1 my-1 h-px bg-border |
| `style.separator` | m3 | menu-divider-height/-color, identical to select |
| `style.empty.color` | shadcn | combobox.tsx ComboboxEmpty class text-muted-foreground |
| `style.empty.font` | shadcn | combobox.tsx ComboboxEmpty class text-sm |
| `style.empty.padding` | shadcn | combobox.tsx ComboboxEmpty class py-2 |
| `style.trigger.variant@secondary` | salt | PillInput.css .saltPillInput-secondary |
| `style.trigger.variant@tertiary` | salt | PillInput.css .saltPillInput-tertiary |
| `style.trigger.status@error` | salt | PillInput.css .saltPillInput-error |
| `style.trigger.status@error` | shadcn | input-group.tsx InputGroup class has-[[data-slot][aria-invalid=true]]:border-destructive has-[...]:ring-destructive/20 dark:has-[...]:ring-destructive/40 |
| `style.trigger.status@error` | m3 | identical token chain to select.m3.json's own style.trigger.status@error |
| `style.trigger.status@warning` | salt | PillInput.css .saltPillInput-warning |
| `style.trigger.status@warning` | m3 | no warning-* token exists in either autocomplete file |
| `style.trigger.status@success` | salt | PillInput.css .saltPillInput-success |
| `style.trigger.status@success` | m3 | no success-* token exists in either autocomplete file |

</details>

<!-- END GENERATED VALUES -->
