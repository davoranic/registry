# Checkbox — component template matrix

*Fourteenth live component in the post-clean-slate pipeline (button, calendar,
spinner, tooltip, alert, input, select, dialog, tabs, card, badge, progress,
chip came before). Same method as [BADGE-MATRIX.md](BADGE-MATRIX.md) /
[CHIP-MATRIX.md](CHIP-MATRIX.md): one master template (union of all six
pieces across systems), columns per design system, rows switched
on/off/inherited per column.*

**Cell legend** · `⟡ slot` = alias to shared contract slot · **bold** = the
system's own switch · `off` = row switched off in this column · `[S]` = value
extracted from source this session · `[R]` = not directly sourced (reason
always given).

**Row policies** · 🔒 locked-on (no column may switch it off) ·
⚪ switchable (on where the system has it) · ⬜ on-with-default.

**Naming rule** — grammar `<piece>.<part>[.<subpart>].<property>[@state]`,
enforced by `contract/template.schema.json`'s `row.id` pattern.

**47 rows in all**: 5 structure, 9 behavior, 5 prop, 2 slot, 7 state, 19 style.

**The headline of this matrix — three genuinely different answers to "what
does checked look like", and one component that is quietly ambitious about
form participation.** Salt never fills the box: only the outline and glyph
recolour, permanently an outline-style control. shadcn fills it solid.
M3 fades a fill in while removing the outline entirely — the *third* time
this registry has found "fill replaces stroke" as a mechanism (after chip's
`elevation@elevated` and `flat-selected`). And this is the first M3 column in
the whole pipeline where the clone was NOT tokens-only — see the Sources
section below, which is a real, load-bearing finding in its own right.

---

## Scope note

### Claiming the row

`1-intro/content/04-component-map.md`'s Forms & inputs section, line 46:
`| checkbox | ✓ | ✓ | ✓ |` — present, unqualified, in all three. No naming
disagreement to resolve (unlike Salt's `dropdown`→our `select` or `banner`→our
`alert`).

### In scope

The tri-state control itself (checked / unchecked / indeterminate), its
visual box, disabled and read-only handling, the validation/error (and, for
Salt, warning) tone, and Salt's `CheckboxGroup` — Salt's own package answer to
"many checkboxes together", modelled here because **no separate
`checkbox-group` row exists anywhere in 04-component-map.md** to send it to
(the reason chip's `pill-input` COULD be excluded — `COMPONENTS.md` already
put it on the `input`/`input-group` rows — does not apply here).

### Out of scope, and why (structural reasons, declared not dropped)

| excluded | where | structural reason |
|---|---|---|
| `label` | 04-component-map.md, its own row, unbuilt | Salt owns a `label` slot (see `slot.label`); shadcn and M3 own none at all — the label a shadcn/M3 consumer sees always belongs to a SEPARATE component associated by `id`/`htmlFor` (checkbox-demo.tsx). Composing with it is declared (`slot.composes`), building it is not this row's job. |
| `field` (label+control+help wrapper) | 04-component-map.md, its own row, unbuilt | Both shadcn (`Field`/`FieldLabel`/`FieldDescription`, checkbox-basic.tsx/checkbox-description.tsx/checkbox-invalid.tsx/checkbox-disabled.tsx) and Salt (`useFormFieldProps()`, Checkbox.tsx lines 148-163) delegate description text, `aria-describedby` and the `data-invalid`/`data-disabled` container styling to this row. Declared composition, not modelled here. |
| `radio-group` | 04-component-map.md, its own row, unbuilt | The explicitly mutually-exclusive sibling. Salt's own usage.mdx draws the line: *"When the checkbox displays a mutually exclusive choice between two or more options. Instead, use RadioButton"* [S]. |
| `switch` | 04-component-map.md, its own row, unbuilt | The immediate-effect sibling. Salt's usage.mdx: *"To display a single option but trigger a state change directly and immediately. Instead, use Switch"* [S]. |
| M3's separate `md-focus-ring` element | `checkbox/internal/checkbox.ts` render() | A shared cross-component focus-ring primitive (also used by button, chip, etc.), not checkbox-specific tokens — the same category of exclusion `md-ripple`'s OWN element gets (its INPUT tokens are modelled as state-layer rows; the ripple mechanism itself is not reproduced as an element). See "Declared approximations". |
| M3's three-layer box (`.outline`/`.background`/`.icon` as independent elements) | `checkbox/internal/_checkbox.scss` | Real, sourced, and NOT modelled as three chassis elements — see `structure.outline-layer` and "Declared approximations". The chassis collapses them onto one box element. |
| Salt's `direction` prop on `CheckboxGroup` | `CheckboxGroup.tsx` | A single Salt-only layout axis with no cross-system counterpart; recorded in `structure.group`'s note, not given its own row. |

---

## Sources

- **Salt** [S]: `packages/core/src/checkbox/{Checkbox.tsx,Checkbox.css,CheckboxIcon.tsx,CheckboxIcon.css,CheckboxGroup.tsx,CheckboxGroup.css,internal/useCheckboxGroup.ts,internal/CheckboxGroupContext.ts,index.ts}` —
  the whole component family, seven files, read in full.
  `packages/core/stories/checkbox/{checkbox.stories.tsx,checkbox.qa.stories.tsx}`;
  `site/docs/components/checkbox/{index,usage,accessibility,examples}.mdx`.
  Resolution through `packages/theme/css/next/characteristics/{selectable,text,status,focused,container}.css`,
  `next/palette/{neutral,accent,negative,warning,background,corner}.css`,
  `next/foundations/color.css`,
  `packages/theme/css/foundations/{size,spacing,curve,cursor,borderStyle,zindex}.css`.
- **shadcn** [S]: `apps/v4/registry/new-york-v4/ui/checkbox.tsx` — one element,
  one literal className string, canonical. Token values from
  `apps/v4/app/globals.css`. `components/cards/payments.tsx` — the tri-state
  proof (see Findings). Read only to fix the boundary, NOT canonical:
  `apps/v4/registry/bases/{radix,base,aria}/ui/checkbox.tsx` (all three move
  an equivalent structure behind `cn-checkbox` class tokens — same
  conclusions, no extra capability) and
  `apps/v4/content/docs/components/radix/checkbox.mdx`. **primitives/ (Radix's
  own source) was NOT cloned** into `3-source/` for this build, per the
  project's standing rule that Radix is behaviour-reference only, never a
  style source. Every cell depending on Radix's internal element/ARIA wiring
  is marked `[R]` and cites the linked docs
  (https://www.radix-ui.com/docs/primitives/components/checkbox) rather than
  a grep.
- **Material 3** [S — see the deviation below]: `checkbox/internal/checkbox.ts`
  (the real Lit component, 210 lines — render(), event handlers, the
  form-association mixins), `checkbox/internal/_checkbox.scss` (the shipped
  styles source), `checkbox/checkbox.ts` (the `<md-checkbox>` registration),
  `checkbox/internal/checkbox_test.ts` (the `aria-checked="mixed"` proof),
  `labs/behaviors/validators/checkbox-validator.ts` (the form-participation
  mechanism). Tokens: `tokens/versions/v0_192/_md-comp-checkbox.scss`
  (the pinned edition) and `tokens/versions/latest/sass/_md-comp-checkbox.scss`
  (edition diff only). Colour/shape/state resolution through
  `tokens/versions/v0_192/{_md-sys-color.scss,_md-sys-shape.scss,_md-sys-state.scss}`.
  Motion: `tokens/versions/v0_192/_md-sys-motion.scss`.

### A deviation from every prior M3 column, found and worth flagging loudly

Every earlier M3 column in this pipeline states *"material-web is a
tokens-only clone... every M3 structure and behaviour row is `[R]`."*
**This session's `3-source/material-web` contains the real component
source.** `checkbox/internal/checkbox.ts` is 210 lines of real Lit component
code — `render()`, event handlers, form-association mixins — not a tokens
fragment. `find 3-source/material-web -maxdepth 1 -type d` lists `checkbox/`,
`dialog/`, `select/`, `chips/`, etc. as real top-level directories, not just
`tokens/`. So for checkbox — and apparently for this whole clone — **M3
structure and behaviour rows are `[S]`, grepped directly**, a strictly
better evidence grade than every earlier M3 column had available. Flagged
for the owner: either this clone was refreshed with the full repository
rather than a tokens-only mirror, or checkbox specifically ships differently;
either way, `find 3-source/material-web -maxdepth 1 -type d` is worth
re-checking before assuming the next component gets the same upgrade.

### Edition pin — `v0.192`, per standing owner decision, not relitigated

CLAUDE.md: *"M3 pins the `v0.192` token edition, everywhere... Decisions the
owner has made — do not relitigate."* A mechanical diff of
`_md-comp-checkbox.scss` across editions finds `latest` ADDS a
`focus-indicator-*` family (colour/thickness/offset), the same addition
CHIP-MATRIX.md and CARD-MATRIX.md recorded for their own components.
**Unlike those components, checkbox does not lose its only focus affordance
to this pin** — v0.192 already carries a component-owned
`focus-outline-color`/`focus-outline-width` pair, because a checkbox's box
already IS an outline-bearing element in every state, unlike a chip or a
card. No other value differs between editions for this component.

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **element/shell** | 🔒 (config) | **`label-wrap`** — Checkbox.tsx returns ONE `<label>` whose children are the native input, the box, and the `label` prop, in that order. Clicking anywhere inside — including the label text — toggles it via native browser semantics [S] | **`unwrapped`** [R] — the rendered root owns no label; paired with a SEPARATE `<Label htmlFor>` on a different canonical row | **`unwrapped`** [S] — `render()` has no label anywhere in the shadow DOM |
| native input | ⚪ (info) | **on** — a REAL `<input type="checkbox">`, opacity 0, absolutely positioned [S] | **on** [R] — Radix's published API documents a hidden bubble input; not independently confirmable without primitives/ cloned | **on** [S] — `render()`'s `<input type="checkbox" ...>`, PLUS a 48×48 invisible touch target under `touch-target="wrapper"` |
| **outline-layer** | ⚪ (info) | **off** — CONFIRMED ABSENCE, border+background+icon all on ONE element [S] | **off** [S] — one element, cva string carries border/bg classes directly | **on** [S] — THREE separate absolutely-positioned layers (`.outline`/`.background`/`.icon`), each independently opacity/transform-animated |
| **mark** | 🔒 (config) | **`svg-plus-pseudo-dash`** — a real SVG checkmark (TWO variants: solid vs a lighter readOnly glyph) for checked; the indeterminate dash is a plain CSS `::before` bar, not an SVG [S] | **`single-icon`** — Radix's `Indicator` renders its ONE child glyph whenever `checked` is truthy, INCLUDING the string `"indeterminate"` — the SAME checkmark for both states [S] | **`dual-rect`** — TWO `<rect>` elements always in the DOM; CSS classes (`.checked` vs `.indeterminate`) rotate/scale the SAME two rects into either shape [S] |
| **group** | ⚪ (config) | **on** — `CheckboxGroup` renders a `<fieldset>` sharing `disabled`/`readOnly`/`validationStatus`/`name`/`checkedValues` context; NO roving tabindex — no keydown handler anywhere [S] | **off** — CONFIRMED ABSENCE, checkbox.mdx: *"Use multiple fields to create a checkbox list"* [S] | **off** — CONFIRMED ABSENCE, no group/set token family anywhere [S] |

## 2 · Behavior

**Every row below is implemented in `skeleton/checkbox.tsx` and asserted by
`scripts/check-checkbox-behavior.mjs`.** Nine rows, four locked.

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **role** | 🔒 | **implicit** — a real native input gives `role="checkbox"` for free, no explicit attribute needed [S] | **`role="checkbox"`, `aria-checked`** [R] — reasoned from shadcn's own `has-[[aria-checked=true]]` selector (checkbox-demo.tsx) plus the linked Radix docs | **implicit**, PLUS an EXPLICIT `aria-checked="mixed"` written only for indeterminate — native semantics have no other way to expose "mixed" (checkbox_test.ts asserts exactly this) [S] |
| **keyboard activation** | 🔒 | **Space only** (native); accessibility.mdx says so in words [S] | **Space only** [R] | **Space only** (native) [S] |
| label click target | ⚪ | **the WHOLE label** — box and text both toggle it, native `<label>` semantics [S] | **the box only** — extending it needs the consumer's own external `<Label htmlFor>` [S/R] | **the box, PLUS an explicit redirect** from any ancestor `<label>` a consumer supplies — `checkbox.ts`'s constructor calls `isActivationClick`/`dispatchActivationClick` from `form-label-activation.js`, even though M3 renders no label of its own [S] |
| **tri-state** | 🔒 | **native** — a click/space always resolves indeterminate to checked and clears it; `useIsomorphicLayoutEffect` syncs the DOM property reactively [S] | **native** [R], PROVEN [S] by shadcn's own `payments.tsx`: `checked={allSelected \|\| (someSelected && "indeterminate")}` with `onCheckedChange` receiving a plain boolean | **native** — `handleInput` reads `target.checked`/`target.indeterminate` back off the browser post-toggle [S] |
| group navigation | ⚪ | **NO roving tabindex** — CONFIRMED ABSENCE, `useCheckboxGroup.ts`/`CheckboxGroupContext.ts` bind no keydown handler; every checkbox its own tab stop [S] | off — no group | off — no group |
| validation | ⚪ | **computed in JS, SUPPRESSED when disabled** — `!disabled ? (...) : undefined` [S] | **a bare boolean** the consumer sets [S] | a full `error-*` token family exists; the trigger mechanism is not visible in this file |
| **disabled handling** | 🔒 | native `disabled`, ORed with the group's, blanket opacity class [S] | native `disabled`, opacity class [S] | native `?disabled`, PLUS transitions EXPLICITLY SUPPRESSED around the disabled boundary to avoid a FOUC (source comment quoted verbatim below) [S] |
| readonly | ⚪ | **implemented in JS, NOT the (spec-inert) native attribute** — `handleChange`'s own early return [S] | off — CONFIRMED ABSENCE | off — CONFIRMED ABSENCE |
| form participation | ⚪ | native — the input IS the real form control [S] | **[R]** a hidden native bubble input, per the linked docs | **a full form-associated custom element** — `getFormValue`/`getFormState`/`formResetCallback`/`formStateRestoreCallback`, plus a `CheckboxValidator` that LAZILY creates a SECOND, invisible, real native input purely to borrow the browser's own constraint-validation engine [S] |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **`value` shape** | 🔒 | **`two-boolean`** — `checked?: boolean` and `indeterminate?: boolean`, two INDEPENDENT props; both can be true at once, and Salt's own render logic decides which wins [S] | **`tri-value`** — ONE `checked: boolean \| "indeterminate"` prop; the type system makes "checked AND indeterminate" literally inexpressible [S, sourced from `payments.tsx`, not just the docs] | **`two-boolean`**, identical shape to Salt — `@property({type:Boolean}) checked` and `@property({type:Boolean}) indeterminate` [S] |
| `validation` | ⚪ | **`[off, error, warning]`**, source-default-first — `validationStatus?: AdornmentValidationStatus`; "success" is TYPED but produces no CSS, so it is not listed as a value [S] | **`[off, error]`** — `aria-invalid` is a bare boolean, no warning concept [S] | **`[off, error]`** — a full `error-*` family exists; no `warning-*` family anywhere, CONFIRMED ABSENCE, grepped directly [S] |
| `disabled` | 🔒 | **`[false, true]`** — CAPABILITY LIST, ORed with the group's [S] | **`[false, true]`** — native `disabled` [S] | **`[false, true]`** — `@property({type:Boolean}) disabled` [S] |
| `readOnly` | ⚪ | **`[false, true]`** [S] | off | off |
| `required` | ⚪ | **`[false, true]`**, but reachable ONLY via `inputProps.required` — `CheckboxProps` has no top-level `required` (its base type omits attributes not valid on a `<label>`) [S] | **`[false, true]`** [R] | **`[false, true]`**, a first-class reflected property wired directly into `CheckboxValidator` [S] |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| label | ⚪ | Salt ONLY owns this — `label?: ReactNode`, rendered as the last child inside the component's own `<label>`, participating in native click semantics for free [S]. shadcn and M3: OFF, always external, associated by `id`/`htmlFor` on a separate component. |
| composes (declared) | ⬜ | **DECLARED COMPOSITION**: (a) `label` — shadcn's and M3's external association; (b) `field` — helper text, `aria-describedby`, the `data-invalid`/`data-disabled` container styling (both directions sourced — shadcn's Field family, Salt's `useFormFieldProps()`); (c) `radio-group` — the explicitly excluded mutually-exclusive sibling. All neutral placeholders in the harness. |

## 5 · States

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| rest | 🔒 | neutral gray-500 outline (MODE-INVARIANT) on a white/near-black fill — never filled solid, at ANY state [S] | an `--input`-coloured border with NO background in light mode, a translucent input-tinted fill ONLY in dark mode — a real asymmetry [S] | a 2px on-surface-variant outline; the fill layer exists in the DOM at opacity 0 [S] |
| **checked** | 🔒 | **the fill NEVER changes** — only the outline and icon recolour to accent blue, confirmed: no background rule anywhere keys off checked [S] | **a SOLID fill appears** (`bg-primary`), border matches, icon becomes `primary-foreground` [S] | **the fill fades AND scales in** (350ms emphasized-decelerate) while the outline's width animates to 0 — fill REPLACES stroke [S] |
| **indeterminate** | 🔒 | **RESETS to the plain neutral colours**, even when `checked` is also true — a compound-selector override [S] | **NO INDETERMINATE-SPECIFIC RULE EXISTS** — the box stays at RESTING colours while the icon still shows a checkmark, see Findings [S] | **IDENTICAL to checked** — `.selected` covers `isChecked \|\| isIndeterminate` as one class [S] |
| hover | ⚪ | border+icon recolour to the `-hover` variant, keyed off the ROOT's `:hover` [S] | **OFF — CONFIRMED ABSENCE**, no `hover:` class of any kind [S] | an 8%-opacity state layer, primary-tinted when selected, on-surface-tinted when not [S] |
| focus | ⚪ | 2px dotted accent-stronger outline at 1px offset, plus the hover recolour [S] | the established translucent 3px `ring-ring/50` box-shadow plus a border recolour [S] | a 2px on-surface outline recolour plus a 12%-opacity state layer; a SEPARATE `md-focus-ring` element also exists, not reproduced here [S] |
| **pressed** | ⚪ | **OFF — CONFIRMED ABSENCE**, no `:active` selector anywhere [S] | **OFF — CONFIRMED ABSENCE** [S] | **on** — a 12%-opacity state layer that previews the colour the box is heading TOWARD, not the one it currently is [S] |
| disabled | 🔒 | blanket **0.4** opacity (a literal), on the whole label [S] | **0.5** opacity [S] | **0.38** opacity (both selected/unselected the SAME value in this edition), applied to outline/background only, never the icon [S] |

## 6 · Styles — the cell matrix

All cells at each system's default: unchecked, enabled, medium Salt density.

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| box size | ⬜ | `size-selectable`, 12/14/16/18px by DENSITY [S] | `size-4` = 16px, fixed [S] | `container-size` = 18px, hardcoded literal, both editions [S] |
| box shape | ⬜ | `corner-weaker` → 1/2/3/4px by DENSITY, → 0px under the sharp edition [S] | `rounded-[4px]`, literal [S] | `container-shape` = 2px, all four logical corners [S] |
| **border-width (rest)** | ⬜ | `size-fixed-100` = 1px, FIXED scale [S] | bare `border` = 1px, undeclared [S] | `unselected-outline-width` = 2px [S] |
| **border-width (checked)** | ⚪ | unchanged, 1px [S] | unchanged, 1px [S] | **`selected-outline-width` = 0px — the outline is REMOVED, not recoloured** [S] |
| icon size | ⬜ | `--saltIcon-size: 100%` — fills whatever box it sits in [S] | `size-3.5` = 14px inside a 16px box [S] | `icon-size` = 18px, EQUAL to container-size, no margin [S] |
| root gap | ⚪ | `spacing-100` = 4/8/12/16px by density, box-to-label [S] | off — no owned label | off — no owned label |
| root cursor | ⚪ | `cursor-hover` = pointer [S] | **OFF — CONFIRMED ABSENCE** at rest, only `disabled:cursor-not-allowed` exists [S] | `:host { cursor: pointer }` [S] |
| root font | ⬜ | the BODY role — REGULAR 400 at 11/14 . 12/16 . 14/18 . 16/20px, Open Sans [S] | off | off |
| **background (rest)** | 🔒 | white/near-black container fill [S] | **transparent in light, translucent input-tint in dark** [S] | transparent (fill layer present, opacity 0) [S] |
| **background (checked)** | 🔒 | **UNCHANGED from rest** [S] | primary, solid [S] | primary, opacity 1 |
| **background (indeterminate)** | ⚪ | unchanged from rest (neutral reset) [S] | **OFF — falls through to rest** [S] | same as checked |
| dash glyph | ⚪ | **on** — a plain CSS `::before` bar, `currentColor` [S] | off — reuses the checkmark instead | off — the `.mark` rects rotate flat instead |
| hover | ⚪ | border+icon recolour to accent [S] | **off** [S] | 8%-opacity state-layer tint |
| focus | ⚪ | 2px dotted, offset 1px [S] | 3px translucent ring + border recolour [S] | 2px outline recolour + 12%-opacity layer [S] |
| **pressed** | ⚪ | off [S] | off [S] | **on — 12%-opacity, primary-tinted (unselected) / on-surface-tinted (selected)** [S] |
| disabled | 🔒 | opacity 0.4 [S] | opacity 0.5 [S] | opacity 0.38 [S] |
| validation (error) | ⚪ | red-500 border+icon [S] | destructive border + permanent (not focus-gated) translucent ring [S] | error-tinted outline [S] |
| validation (warning) | ⚪ | **on** — orange-500 [S] | off — CONFIRMED ABSENCE | off — CONFIRMED ABSENCE |
| transition | ⚪ | **OFF — CONFIRMED ABSENCE** [S] | `transition-shadow` ONLY — the box-shadow eases, the checked fill snaps [S] | a full choreographed two-phase system, 150ms/350ms with distinct easing curves [S] |
| state-layer geometry | ⚪ (info) | off | off | **40px circle** (`state-layer-size`/`state-layer-shape`), documented not rendered |

---

## Declared approximations in the chassis

1. **M3's three independently-animated box layers are collapsed onto one
   element.** `checkbox/internal/_checkbox.scss` gives `.outline`,
   `.background` and `.icon` each their own opacity/transform transition, so
   the fill fades and scales in WHILE the outline recolours instantly — a
   real, visible sequencing this chassis does not reproduce. The observable
   END STATES (which colour, which width, which opacity) are preserved; the
   independent choreography between them is not. Declared on
   `structure.outline-layer` and `style.box.transition`.
2. **M3's `md-focus-ring` element is not reproduced.** `render()` includes a
   SEPARATE `<md-focus-ring part="focus-ring" for="input">` alongside the
   box's own outline recolour — this chassis draws only the box's own
   outline as the focus indicator, the same category of exclusion CARD-
   and CHIP-MATRIX.md made for shared cross-component primitives.
3. **A cascade nuance, found while wiring the CSS, not swept under it.**
   `style.box.validation`'s selector was deliberately given the SAME
   specificity as `style.box.checked`'s (both target
   `[data-slot="checkbox-input"] + [data-slot="checkbox-box"]` with one extra
   attribute qualifier) so an error+checked box shows red rather than losing
   to checked's blue, matching real Salt source (`.saltCheckboxIcon-error`
   appears AFTER `.saltCheckboxIcon-checked` in `CheckboxIcon.css` at equal
   specificity, so error wins). The SAME fix was not extended to
   `style.box.hover`/`.focus`/`.pressed` (all one class-level selector
   lighter than `.checked`), so — in this chassis, not necessarily in real
   M3 — hovering, focusing, or pressing an already-CHECKED box will not
   visibly show the hover/focus/pressed tint layered on top; validation
   still wins over all three. One compound selector short in three places;
   declared rather than papered over, the identical class of gap
   CHIP-MATRIX.md's declared approximation 3 recorded for M3's disabled
   elevated hover shadow.
4. **The disabled opacity is applied at the ROOT, not per-layer.** Real M3
   applies `disabled-container-opacity` to the outline/background layers
   ONLY, never the icon (a disabled checkmark stays full-opacity in real
   M3). This chassis dims the whole root uniformly — faithful for Salt
   (whose real CSS does exactly this) and shadcn (whose opacity class also
   targets the whole control), an approximation only for M3.
5. **Salt's `readOnly` glyph swap and dashed border are sourced but not
   modelled as their own style row**, for scope (`CheckboxIcon.tsx` swaps
   `CheckmarkSolidIcon` for a lighter `CheckmarkIcon` when `readOnly`, and
   `CheckboxIcon.css`'s `.saltCheckboxIcon-readOnly` dashes the border) —
   recorded in `behavior.readonly`'s note, not expanded into a row.
6. **M3's selected-hover/-focus/-pressed state-layer colours are not
   separately expressed** — see approximation 3; `style.box.hover`/`.focus`/
   `.pressed` model the UNSELECTED variant (the one actually reachable given
   approximation 3's specificity gap), and the SELECTED variants (which
   use different tint colours per `checkbox.m3.json`'s provenance — e.g.
   `selected-pressed-state-layer-color: on-surface` against
   `unselected-pressed-state-layer-color: primary`) are recorded in the
   column's provenance but not rendered.

---

## Findings from building this matrix

1. **shadcn's indeterminate checkbox shows a checkmark on an unstyled box —
   a real, sourced, defect-shaped gap.** `checkbox.tsx`'s literal className
   string keys EVERY colour rule off `data-[state=checked]` — there is no
   `data-[state=indeterminate]:` selector anywhere. Radix's `Indicator`,
   meanwhile, renders its child (a lucide `CheckIcon`) whenever `checked` is
   truthy, and the string `"indeterminate"` IS truthy. So an indeterminate
   shadcn checkbox renders the resting (unfilled, `--input`-bordered) box
   with a checkmark floating inside it — visually indistinguishable from "I
   checked this by mistake" rather than "some of these are checked".
   Verified twice: once by reading the cva-free string directly, once by
   confirming shadcn's own `payments.tsx` header checkbox — the ONE place in
   this clone that actually EXERCISES the indeterminate state — never
   overrides the component's own styling to compensate. This is the
   `slot.icon`-shows-regardless class of gap this pipeline has now found in
   three different components (badge's inert hover recolour, chip's dead
   menu-pressed rule, now this).

2. **Salt's Pill/Tag naming trap (CHIP-MATRIX finding 1) has a checkbox
   cousin: the component that LOOKS like a filled control never fills.**
   Across all three systems in this registry that render a "selected" box —
   badge (always filled), chip (Pill fills solid, Tag is a wash), and now
   checkbox — Salt's checkbox is the ONLY one of the three checked-box
   strategies where the FILL genuinely never participates. `CheckboxIcon.css`
   has no background rule of any kind that keys off `.saltCheckboxIcon-checked`.
   A checked Salt checkbox is exactly as filled as an unchecked one; the
   ENTIRE signal is the outline recolouring to accent blue plus a checkmark
   appearing in that same blue. This is the SAME "outline-only signalling"
   character CHIP-MATRIX finding 6 found for Salt's Pill selection (a visible
   checkbox glyph, not a surface swap) — except here the checkbox IS the
   glyph, so the pattern repeats one level down.

3. **A filled-vs-outline fork this registry has now seen three times, and
   the mechanism is identical each time.** M3's checked checkbox does not
   gain a fill ON TOP of its outline — `selected-outline-width: 0px` DELETES
   the outline the instant the box becomes selected, exactly the trick
   CHIP-MATRIX.md documented for `elevation@elevated` (shadow replaces
   stroke) and `flat-selected` (fill replaces stroke, in the SAME
   component). Checkbox is the third sighting of the identical M3 idiom, now
   confirmed across three unrelated components (chip, and twice within
   checkbox's own token set — flat-selected AND selected-focus/hover/pressed
   all zero the outline width).

4. **M3's pressed ripple previews where you're headed, not where you are —
   a real, sourced, symmetrical piece of design intent.**
   `unselected-pressed-state-layer-color: primary` (NOT `on-surface`, unlike
   `unselected-hover`/`-focus`, which both use `on-surface`) — pressing an
   UNSELECTED box ripples in the colour it is about to BECOME.
   `selected-pressed-state-layer-color: on-surface` (NOT `primary`) — the
   mirror image, pressing a SELECTED box ripples in the colour it is about
   to LOSE. Two single-token choices, in a family where every neighbouring
   token (hover, focus) just uses the box's own current role — this one pair
   is deliberately different, and it reads as an actual design decision, not
   a copy-paste value.

5. **This is the first M3 column in the pipeline built from REAL component
   source rather than tokens-only inference — see the Sources section.**
   `checkbox/internal/checkbox.ts` is a real, working Lit component:
   `render()`, the `handleInput`/`handleChange` event handlers, the
   `getFormValue`/`getFormState`/`formResetCallback` form-association
   overrides, a `CheckboxValidator`, and a click listener that redirects
   ancestor-`<label>` clicks into the internal input. Every M3 structure and
   behaviour row in this matrix is `[S]`, not `[R]` — the first time that has
   been true anywhere in this registry's M3 columns. Whether this is true of
   the WHOLE `3-source/material-web` clone or specific to checkbox is not
   established; the next component to touch M3 should re-run
   `find 3-source/material-web -maxdepth 1 -type d` rather than assume.

6. **All three systems have a validation/error tone — a real cross-system
   rarity in this pipeline.** Badge has none in any system. Chip has none.
   Checkbox has one in all three (Salt TWO — error and warning), the first
   time this registry has found a styling axis EVERY column actually ships.
   And the shadcn implementation has its own small surprise: `aria-invalid`
   draws a PERMANENT translucent ring (`aria-invalid:ring-destructive/20`),
   not one gated on `:focus-visible` — an invalid shadcn checkbox is
   perpetually ringed, not just when tabbed to, unlike its OWN focus ring
   mechanism one line above it in the same className string.

7. **The `readOnly` HTML attribute is spec-inert on checkboxes, and Salt
   quietly works around a fact its own JSDoc never states.** The WHATWG HTML
   spec does not give `readonly` any effect on `type="checkbox"` inputs —
   only text-like inputs honour it. Salt's `Checkbox.tsx` passes `readOnly`
   to the native `<input>` anyway (harmless, ignored by the browser) and
   does the REAL work itself: `handleChange`'s
   `if (event.nativeEvent.defaultPrevented || readOnly) { return }`.
   Nothing in Checkbox.tsx or its docs says this out loud; it was found only
   by checking the spec against the code, the same class of "grep the
   platform, not just the component" verification the register's method
   notes call out as easy to skip.

8. **Gate calibration, recorded per the project's rule 11.**
   `check-checkbox-behavior.mjs`'s `REF_EFFECT_GUARDS` block was
   deliberately broken (the `[isIndeterminate]` dependency array in
   `skeleton/checkbox.tsx`'s `useLayoutEffect` was replaced with `[]`) and
   confirmed to fail the gate (`FAIL indeterminate-sync`) before being
   restored and re-confirmed green. This is the first component in the
   pipeline where that guard block is POPULATED rather than the
   badge/chip-style inverted "stays effect-free" check — checkbox's skeleton
   has a real ref-reading effect (syncing the DOM-only `indeterminate`
   property), and the guard proves its dependency array, not merely its
   absence.

9. **A pre-existing infrastructure bug was found and fixed, outside this
   component's own files, because it blocked verifying this component's own
   work.** `harness/conformance.tsx` and `tools/build-conformance.mjs` both
   imported/read from a `dist/gen/` path that does not exist anywhere in
   this checkout — only `out/gen/` does (`gen-from-template.py` writes
   there). The conformance harness could not build AT ALL before this fix,
   for any component, not just checkbox. Both files were corrected to
   `out/gen/`, and `build-conformance.mjs`'s component list was extended to
   include checkbox's own generated CSS. Flagged for the owner rather than
   silently absorbed into "checkbox's work", since it affects every
   component's conformance assertions, not only the four added here.

10. **The single most important defect this component shipped with, found
    during orchestrator review AFTER all five gates and the building
    agent's own visual sign-off ("built cleanly, I did not open a browser —
    that's the orchestrating session's job") — and none of them caught it.**
    `skeleton/checkbox.tsx` nests the native input INSIDE the visual box
    (`<span checkbox-box><input checkbox-input/><span checkbox-icon/></span>`),
    but the first draft of `style.box.checked`, `.indeterminate`, `.dash`,
    `.focus`, `.pressed`, `.validation` and `.validation@warning` all used
    the adjacent-sibling combinator — `[checkbox-input]:checked +
    [checkbox-box]` — which requires input and box to be SIBLINGS. They
    are parent and child. Every one of those seven rules was therefore
    dead CSS in all three columns: no checked/indeterminate/focus/pressed/
    validation box recolour ever applied, in any system, from the moment
    this component was first generated. It went undetected because (a) the
    icon's presence is JS-driven for two of the three `structure.mark`
    strategies (`single-icon`, `svg-plus-pseudo-dash`), so shadcn's
    checkmark still appeared to "work" even though the box underneath it
    never filled, and (b) `check-structure.py` checks cascade ORDER and
    unsized parts, never whether a selector can match its own component's
    DOM shape at all — a real, confirmed gap in gate coverage, not a
    one-off miss. Verified broken with `getComputedStyle` before the fix
    (`background-color: rgba(0,0,0,0)` on a `checked:true` shadcn box,
    identical to unchecked) and verified fixed after rewriting all seven
    selectors to `[checkbox-box]:has([checkbox-input]:checked)` (already
    the pattern `style.box.disabled` used correctly from the start —
    `[checkbox-root]:has([checkbox-input]:disabled)` — which is what
    should have caught the inconsistency during the original build).

11. **The same review pass surfaced that M3's checkmark/dash was never
    given a shape at all — `structure.mark`'s `dual-rect` strategy was
    declared but never implemented in CSS.** `checkbox.ts` always renders
    `<rect class="mark short"/><rect class="mark long"/>` unconditionally,
    sized and shaped entirely by CSS (`width`/`height`/`transform`, no SVG
    attributes) — and no template row ever emitted that CSS, so both rects
    were 0×0 and invisible in every state, for every M3 checkbox rendered
    by this pipeline until now. Fixed by adding eight new rows
    (`style.mark.short-size` / `.long-size` / `.fill` /
    `.selected-opacity` / `.checked-transform` / `.checked-short-size` /
    `.checked-long-size` / `.indeterminate-transform`), all sourced from
    `internal/_checkbox.scss` lines ~160-276 (the exact geometry constants
    — `$_mark-stroke: 2px`, `$_checkmark-bottom-left: 7px, -14px`,
    `$_indeterminate-bottom-left: 4px, -10px`, and the √32/√128 hypotenuse
    derivations, with the source's own comments explaining each). Salt and
    shadcn are `off` on all eight — confirmed structural absence, neither
    strategy renders a `<rect>` — see `structure.mark`. This is the same
    "unshared derivation" drift mode (CLAUDE.md's drift type 6) elevation.md
    was written to prevent for dp→shadow conversions; the fix here is the
    same shape: the source authority (the SCSS) had the numbers, they were
    simply never carried into a row.

12. **Two smaller, pre-existing issues found and left unfixed, flagged
    rather than absorbed.** (a) `check-conformance` now reports 52/53 —
    the one failure, `tabs`/`behavior.activation-mode`/shadcn ("automatic:
    selection held"), is unrelated to checkbox and was invisible before
    finding 9's `dist/gen`→`out/gen` fix made conformance runnable at all;
    it needs its own investigation on the `tabs` matrix, not a fix folded
    into this one. (b) every `build-<name>-check.mjs` harness script
    (badge's, chip's, this one, and presumably every other) references
    `fonts/*.woff2` with a path that resolves against `out/`, where no
    `fonts/` directory exists — the real files live at `2-build/fonts/`.
    Every harness's self-hosted-webfont fidelity check has silently been
    running against the browser's fallback sans-serif, not Open Sans/
    Roboto, since the fonts/ note in CLAUDE.md's "What this repo contains"
    section was written. Worked around locally (copied `2-build/fonts/` to
    `2-build/out/fonts/`) to validate this component's own harness
    visually; the actual `build-*-check.mjs` scripts were not changed,
    since fixing all of them is a cross-component job outside this
    build's scope.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/checkbox.template.json` against every system, read from `columns/checkbox.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 9 light, 3 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `neutral` | rgb(114, 119, 125) | — | yes |
| `neutral-fg` | rgb(95, 100, 106) | rgb(145, 149, 154) | yes |
| `accent` | rgb(0, 120, 207) | — | yes |
| `box-bg` | rgb(255, 255, 255) | rgb(16, 24, 32) | yes |
| `error` | rgb(229, 33, 53) | — | yes |
| `warning` | rgb(199, 83, 0) | — | yes |
| `focus-outline` | rgb(0, 69, 126) | rgb(154, 189, 245) | yes |
| `type-fontFamily` | 'Open Sans', sans-serif | — | **no** |
| `type-fontWeight` | 400 | — | **no** |

**shadcn** — 9 light, 7 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `input-border` | oklch(0.922 0 0) | oklch(1 0 0 / 15%) | yes |
| `primary` | oklch(0% 0 0) | oklch(0.922 0 0) | **no** |
| `primary-fg` | oklch(0.985 0 0) | oklch(0.205 0 0) | **no** |
| `destructive` | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | yes |
| `ring` | oklch(0.708 0 0) | oklch(0.556 0 0) | **no** |
| `ring-alpha-error` | 20% | 40% | **no** |
| `box-bg` | transparent | color-mix(in oklab, oklch(1 0 0 / 15%) 30%, transparent) | yes |
| `shadow-color` | rgb(0 0 0 / 0.05) | — | yes |
| `transition-props` | box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1) | — | yes |

**m3** — 7 light, 7 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `primary` | #6750a4 | #d0bcff | **no** |
| `on-primary` | #fff | #381e72 | **no** |
| `on-surface` | #1d1b20 | #e6e0e9 | **no** |
| `on-surface-variant` | #49454f | #cac4d0 | **no** |
| `surface` | #fef7ff | #141218 | **no** |
| `error` | #b3261e | #f2b8b5 | **no** |
| `on-error` | #fff | #601410 | **no** |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.shell` | structure | locked | `label-wrap` | `unwrapped` | `unwrapped` |
| 2 | `structure.native-input` | structure | switchable | `True` | `True` | `True` |
| 3 | `structure.outline-layer` | structure | switchable | **off** | **off** | `True` |
| 4 | `structure.mark` | structure | locked | `svg-plus-pseudo-dash` | `single-icon` | `dual-rect` |
| 5 | `structure.group` | structure | switchable | `True` | **off** | **off** |
| 6 | `behavior.role` | behavior | locked | `implicit — role=checkbox from the native <input type="checkbox">, no explicit role attribute anywhere` | `[R] role=checkbox, aria-checked — inferred from checkbox-demo.tsx's own `has-[[aria-checked=true]]` selector plus the linked Radix docs` | `implicit — role=checkbox from the native <input>; explicit aria-checked="mixed" is written ONLY for the indeterminate case` |
| 7 | `behavior.keyboard-activation` | behavior | locked | `Space only (native); no keydown override` | `[R] Space only, per the linked Radix docs and the general APG pattern` | `Space only (native); no keydown override anywhere in checkbox.ts` |
| 8 | `behavior.label-click-target` | behavior | switchable | `the WHOLE label — box and text both toggle it` | `only the box itself; extending the target requires the consumer's OWN separate <Label htmlFor>` | `the box itself, PLUS an explicit redirect from any ancestor <label> click a consumer supplies` |
| 9 | `behavior.tri-state` | behavior | locked | `native — a click/space always resolves to checked and clears indeterminate` | `a click/toggle always resolves to a plain boolean, even from an indeterminate header checkbox` | `native — handleInput reads target.checked/target.indeterminate back off the input post-toggle` |
| 10 | `behavior.group-navigation` | behavior | switchable | **off** | **off** | **off** |
| 11 | `behavior.validation` | behavior | switchable | `computed in JS and SUPPRESSED when disabled` | `a bare boolean the consumer sets directly` | `a full error-* token family exists for every interaction state, but the trigger attribute/property is not visible in this file` |
| 12 | `behavior.disabled-handling` | behavior | locked | `native `disabled` on the input (ORed with the group's), plus a blanket opacity class on the whole label` | `native disabled + disabled:cursor-not-allowed disabled:opacity-50` | `native ?disabled on the input; transitions are EXPLICITLY SUPPRESSED around the disabled boundary to avoid a FOUC` |
| 13 | `behavior.readonly` | behavior | switchable | `implemented in JS, NOT relying on the (spec-inert) native readonly attribute` | **off** | **off** |
| 14 | `behavior.form-participation` | behavior | switchable | `native — the input IS the real form control` | `[R] a hidden native bubble input, per the linked Radix docs` | `a full form-associated custom element delegating validity to a second, invisible, real native input` |
| 15 | `prop.value-shape` | prop | locked | `two-boolean` | `tri-value` | `two-boolean` |
| 16 | `prop.validation` | prop | switchable | `off, error, warning` | `off, error` | `off, error` |
| 17 | `prop.disabled` | prop | locked | `False, True` | `False, True` | `False, True` |
| 18 | `prop.read-only` | prop | switchable | `False, True` | **off** | **off** |
| 19 | `prop.required` | prop | switchable | `False, True` | `False, True` | `False, True` |
| 20 | `slot.label` | slot | switchable | `label?: ReactNode, rendered as the LAST child inside the component's own <label>` | **off** | **off** |
| 21 | `slot.composes` | slot | default | `True` | `True` | `True` |
| 22 | `state.rest` | state | locked | `neutral gray-500 outline (mode-invariant) on a white/near-black container fill, never filled solid` | `an --input-coloured border with NO background in light mode; a translucent input-tinted fill ONLY in dark mode` | `a 2px on-surface-variant outline; the fill layer exists in the DOM at opacity 0` |
| 23 | `state.checked` | state | locked | `the fill NEVER changes — only the outline and icon recolour to accent blue` | `a SOLID primary fill appears, border recolours to match, icon becomes primary-foreground` | `the fill fades AND scales in (350ms emphasized-decelerate) while the outline's width animates to 0` |
| 24 | `state.indeterminate` | state | locked | `RESETS to the plain neutral colours, even when checked is also true` | `recognized by the API (checked="indeterminate", data-state="indeterminate") but NO CSS reacts to it — the box stays at RESTING colours while the icon still shows a checkmark` | `IDENTICAL treatment to checked — .selected covers isChecked \|\| isIndeterminate as one class` |
| 25 | `state.hover` | state | switchable | `border and icon recolour to the -hover variant of whichever base they were already on; the root's :hover, not the input's` | **off** | `an 8%-opacity state layer, primary-tinted when selected, on-surface-tinted when not` |
| 26 | `state.focus` | state | switchable | `2px dotted accent-stronger outline at 1px offset, plus the hover recolour riding along` | `the established translucent 3px ring-ring/50 box-shadow plus a border recolour` | `a 2px on-surface outline recolour (unselected) plus a 12%-opacity state layer; a SEPARATE md-focus-ring element also exists and is not reproduced here` |
| 27 | `state.pressed` | state | switchable | **off** | **off** | `a 12%-opacity state layer that previews the colour the box is heading TOWARD, not the one it currently is` |
| 28 | `state.disabled` | state | locked | `blanket opacity 0.4 (a literal) on the whole label, plus not-allowed cursor` | `opacity 0.5, cursor not-allowed` | `0.38 opacity, applied to the outline/background layers ONLY in real source — never the icon` |
| 29 | `style.box.size` | style | default | `width: var(--box-size); height: var(--box-size)` | `width: 16px; height: 16px` | `width: 18px; height: 18px` |
| 30 | `style.box.shape` | style | default | ⟡ `shape-radius` | `4px` | `2px` |
| 31 | `style.box.border-width` | style | default | `1px` | `1px` | `2px` |
| 32 | `style.icon.size` | style | default | `100%` | `14px` | `18px` |
| 33 | `style.root.gap` | style | switchable | ⟡ `root-gap` | **off** | **off** |
| 34 | `style.root.cursor` | style | switchable | `pointer` | **off** | `pointer` |
| 35 | `style.root.font` | style | default | `font-size: var(--type-fontSize); line-height: var(--type-lineHeight); font-family: var(--type-fontFamily); font-weight: var(--type-fontWeight)` | **off** | **off** |
| 36 | `style.box.rest` | style | locked | `border-color: var(--neutral); background-color: var(--box-bg); color: var(--neutral-fg)` | `border-color: var(--input-border); background-color: var(--box-bg); box-shadow: 0 1px 2px 0 var(--shadow-color)` | `border-style: solid; border-color: var(--on-surface-variant); background-color: transparent; color: var(--on-surface-variant)` |
| 37 | `style.box.checked` | style | locked | `border-color: var(--accent); background-color: var(--box-bg); color: var(--accent)` | `border-color: var(--primary); background-color: var(--primary); color: var(--primary-fg)` | `border-width: 0; background-color: var(--primary); color: var(--on-primary)` |
| 38 | `style.box.indeterminate` | style | switchable | `border-color: var(--neutral); background-color: var(--box-bg); color: var(--neutral-fg)` | **off** | `border-width: 0; background-color: var(--primary); color: var(--on-primary)` |
| 39 | `style.box.dash` | style | switchable | `content: ''; position: absolute; top: 50%; left: 50%; width: calc(var(--box-size) - 6px); height: 2px; background-color: currentColor; transform: translate(-50%, -50%)` | **off** | **off** |
| 40 | `style.box.hover` | style | switchable | `border-color: var(--accent); color: var(--accent)` | **off** | `background-color: color-mix(in oklab, var(--on-surface) 8%, transparent)` |
| 41 | `style.box.focus` | style | switchable | `outline: 2px dotted var(--focus-outline); outline-offset: 1px` | `border-color: var(--ring); box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 1px 2px 0 var(--shadow-color)` | `border-color: var(--on-surface); background-color: color-mix(in oklab, var(--on-surface) 12%, transparent)` |
| 42 | `style.box.pressed` | style | switchable | **off** | **off** | `background-color: color-mix(in oklab, var(--primary) 12%, transparent)` |
| 43 | `style.box.disabled` | style | locked | `opacity: 0.4; cursor: not-allowed` | `opacity: 0.5; cursor: not-allowed` | `opacity: 0.38; cursor: default` |
| 44 | `style.box.validation` | style | switchable | `border-color: var(--error); color: var(--error); outline-color: var(--error)` | `border-color: var(--destructive); box-shadow: 0 0 0 3px color-mix(in oklab, var(--destructive) var(--ring-alpha-error), transparent)` | `border-color: var(--error); color: var(--error)` |
| 45 | `style.box.validation@warning` | style | switchable | `border-color: var(--warning); color: var(--warning); outline-color: var(--warning)` | **off** | **off** |
| 46 | `style.box.transition` | style | switchable | **off** | ⟡ `transition-props` | `background-color 350ms cubic-bezier(0.05, 0.7, 0.1, 1), border-width 150ms cubic-bezier(0.3, 0, 0.8, 0.15)` |
| 47 | `style.box.state-layer` | style | switchable | **off** | **off** | `size: 40px; shape: 9999px` |
| 48 | `style.mark.short-size` | style | switchable | **off** | **off** | `width: 2px; height: 2px` |
| 49 | `style.mark.long-size` | style | switchable | **off** | **off** | `width: 10px; height: 2px` |
| 50 | `style.mark.fill` | style | switchable | **off** | **off** | `fill: currentColor; opacity: 0` |
| 51 | `style.mark.selected-opacity` | style | switchable | **off** | **off** | `1` |
| 52 | `style.mark.checked-transform` | style | switchable | **off** | **off** | `scaleY(-1) translate(7px, -14px) rotate(45deg)` |
| 53 | `style.mark.checked-short-size` | style | switchable | **off** | **off** | `5.657px` |
| 54 | `style.mark.checked-long-size` | style | switchable | **off** | **off** | `11.314px` |
| 55 | `style.mark.indeterminate-transform` | style | switchable | **off** | **off** | `scaleY(-1) translate(4px, -10px) rotate(0deg)` |

<details><summary>Citations — 155 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.shell` | salt | Checkbox.tsx returns <label className=saltCheckbox>{input}{CheckboxIcon}{label}</label> — one real <label>, three children |
| `structure.shell` | shadcn | [R] — the rendered root owns no label; checkbox-demo.tsx pairs it with a separate <Label htmlFor> |
| `structure.shell` | m3 | checkbox.ts render() has no label anywhere in the shadow DOM |
| `structure.native-input` | salt | Checkbox.tsx <input type="checkbox" ... /> — a real native input, opacity:0, position:absolute (Checkbox.css) |
| `structure.native-input` | shadcn | [R] — Radix's published API documents a hidden native <input> for form participation behind the styled root; not independently confirmable without primitives/ cloned |
| `structure.native-input` | m3 | checkbox.ts render() — see real-native-input |
| `structure.outline-layer` | salt | CONFIRMED ABSENCE — CheckboxIcon.css puts border, background and icon all on the ONE .saltCheckboxIcon element; no separate outline/fill layer exists |
| `structure.outline-layer` | shadcn | CONFIRMED ABSENCE — one element, border and background both live directly on the cva string's root |
| `structure.outline-layer` | m3 | render(): <div class="outline"></div><div class="background"></div>...<svg class="icon">... — THREE separate absolutely-positioned layers, each independently opacity/transform-animated (internal/_checkbox.scss lines 99-148) |
| `structure.mark` | salt | CheckboxIcon.tsx: CheckmarkSolidIcon (checked, not readOnly) or CheckmarkIcon (checked, readOnly) svg; CheckboxIcon.css `.saltCheckboxIcon-indeterminate::before` draws the dash as a plain CSS bar, not an svg |
| `structure.mark` | shadcn | Indicator renders its ONE child (a lucide CheckIcon) whenever `checked` is truthy, INCLUDING the string "indeterminate" — see no-hover-no-pressed-no-indeterminate-style |
| `structure.mark` | m3 | render(): <svg class="icon" viewBox="0 0 18 18"><rect class="mark short" /><rect class="mark long" /></svg>, always rendered; CSS classes (.checked vs .indeterminate) rotate/scale the SAME two rects into either shape (internal/_checkbox.scss lines 238-276) |
| `structure.group` | salt | CheckboxGroup.tsx renders a <fieldset> providing disabled/readOnly/validationStatus/name/checkedValues via CheckboxGroupContext; no keydown handler anywhere in useCheckboxGroup.ts/CheckboxGroupContext.ts |
| `structure.group` | shadcn | CONFIRMED ABSENCE — see no-group-construct |
| `structure.group` | m3 | CONFIRMED ABSENCE — no group/set token family in _md-comp-checkbox.scss in either edition, and no companion file references one |
| `behavior.role` | salt | Checkbox.tsx — no role prop, no aria-* beyond aria-describedby/aria-labelledby/aria-readonly |
| `behavior.role` | shadcn | not independently confirmable without primitives/ cloned |
| `behavior.role` | m3 | checkbox.ts render(); checkbox_test.ts asserts exactly this toggle |
| `behavior.keyboard-activation` | salt | accessibility.mdx: 'Space changes the state of the checkbox, select or deselect'; no onKeyDown in Checkbox.tsx |
| `behavior.label-click-target` | salt | native <label> semantics, since structure.shell=label-wrap |
| `behavior.label-click-target` | shadcn | checkbox-demo.tsx, checkbox-basic.tsx |
| `behavior.label-click-target` | m3 | see label-click-delegation |
| `behavior.tri-state` | salt | handleChange reads event.target.checked post-toggle; a useIsomorphicLayoutEffect syncs inputRef.current.indeterminate = indeterminate ?? false reactively, because `indeterminate` has no HTML attribute form |
| `behavior.tri-state` | shadcn | payments.tsx onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} — see tri-state-proof |
| `behavior.group-navigation` | salt | CONFIRMED ABSENCE — useCheckboxGroup.ts and CheckboxGroupContext.ts bind no keydown handler; every checkbox keeps its own tab stop, Tab/Shift+Tab only (accessibility.mdx) |
| `behavior.group-navigation` | shadcn | no group construct to navigate |
| `behavior.group-navigation` | m3 | no group construct |
| `behavior.validation` | salt | Checkbox.tsx `const validationStatus = !disabled ? (checkboxGroup?.validationStatus ?? formFieldValidationStatus ?? validationStatusProp) : undefined` |
| `behavior.validation` | shadcn | checkbox-invalid.tsx passes a literal `aria-invalid` prop with no computed suppression logic visible in this clone |
| `behavior.validation` | m3 | the STYLE half is [S]; the exact activation mechanism is not confirmable from this file alone |
| `behavior.disabled-handling` | salt | Checkbox.tsx `const disabled = checkboxGroup?.disabled \|\| formFieldDisabled \|\| disabledProp`; Checkbox.css `.saltCheckbox-disabled { opacity: 0.4 }` |
| `behavior.disabled-handling` | shadcn | checkbox.tsx cva string |
| `behavior.disabled-handling` | m3 | internal/_checkbox.scss: ':where(.disabled, .prev-disabled) :is(.background, .icon, .mark) { animation-duration: 0s; transition-duration: 0s }', comment: "Don't animate to/from disabled states... there'd be a FOUC if the checkbox state is programmatically changed while disabled" |
| `behavior.readonly` | salt | Checkbox.tsx handleChange: `if (event.nativeEvent.defaultPrevented \|\| readOnly) { return }`; also passes readOnly/aria-readonly to the input and swaps the checkmark glyph + border style (CheckboxIcon.tsx/.css) |
| `behavior.readonly` | shadcn | CONFIRMED ABSENCE — see no-readonly |
| `behavior.readonly` | m3 | CONFIRMED ABSENCE — no readonly-* token in either edition |
| `behavior.form-participation` | salt | a real <input type="checkbox" name=... value=... checked=.../>, no custom validity machinery needed |
| `behavior.form-participation` | shadcn | not independently confirmable without primitives/ cloned |
| `behavior.form-participation` | m3 | see form-participation |
| `prop.value-shape` | salt | CheckboxProps: `checked?: boolean; defaultChecked?: boolean; indeterminate?: boolean` — two independent optional booleans |
| `prop.value-shape` | shadcn | payments.tsx's own checked={... \|\| (... && "indeterminate")} — ONE prop typed boolean \| "indeterminate" |
| `prop.value-shape` | m3 | @property({type:Boolean}) checked; @property({type:Boolean}) indeterminate — two independent reflected properties |
| `prop.validation` | salt | CheckboxProps.validationStatus?: AdornmentValidationStatus, undefined/off by default (SOURCE-DEFAULT-FIRST); 'success' is typed but produces no CSS (see no-success-styling), so it is not listed as a value here |
| `prop.validation` | shadcn | aria-invalid is a bare boolean (SOURCE-DEFAULT-FIRST, off/undefined by default); no warning concept exists |
| `prop.validation` | m3 | a full error-* token family exists; no warning-* family anywhere (see no-warning-family) |
| `prop.disabled` | salt | CheckboxProps.disabled?: boolean, ORed with the group's |
| `prop.disabled` | shadcn | native disabled, a real HTML attribute Radix forwards |
| `prop.disabled` | m3 | @property({type:Boolean}) disabled, inherited LitElement convention |
| `prop.read-only` | salt | CheckboxProps.readOnly?: boolean (via the omitted InputHTMLAttributes base, re-destructured explicitly as readOnlyProp) |
| `prop.read-only` | shadcn | CONFIRMED ABSENCE |
| `prop.read-only` | m3 | CONFIRMED ABSENCE |
| `prop.required` | salt | reachable only via `inputProps.required` (CheckboxProps has no top-level `required` — its base type omits attributes not valid on a <label>), a more indirect API shape than M3's first-class reflected property |
| `prop.required` | shadcn | [R] — Radix's published API includes `required`; not independently confirmable without primitives/ cloned |
| `prop.required` | m3 | @property({type:Boolean}) required, wired directly into CheckboxValidator's constraint-validation computation |
| `slot.label` | salt | Checkbox.tsx |
| `slot.label` | shadcn | CONFIRMED ABSENCE — no label text owned; always external (see slot.composes) |
| `slot.label` | m3 | CONFIRMED ABSENCE — no label text owned; always external, see behavior.label-click-target for the click-delegation mechanism that anticipates it |
| `slot.composes` | salt | form-field (useFormFieldProps() pulls aria-describedby/aria-labelledby/disabled/readOnly/validationStatus down from an ancestor <FormField> when NOT inside a CheckboxGroup — Checkbox.tsx lines 148-163), and radio-button (the explicitly-excluded mutually-exclusive sibling, usage.mdx) |
| `slot.composes` | shadcn | label (id/htmlFor, checkbox-demo.tsx), field (Field/FieldLabel/FieldDescription/FieldGroup, checkbox-basic.tsx/checkbox-description.tsx/checkbox-invalid.tsx/checkbox-disabled.tsx) |
| `slot.composes` | m3 | an external, consumer-authored <label> (behavior.label-click-target); the radio family is the explicitly separate mutually-exclusive canonical row |
| `state.rest` | salt | an outline-style box at EVERY state, including checked — see state.checked |
| `state.rest` | shadcn | a real light/dark ASYMMETRY, not a colour inversion — see box-bg provenance |
| `state.rest` | m3 | see structure.outline-layer for the layer this chassis collapses |
| `state.checked` | salt | confirmed: no background rule anywhere keys off checked in CheckboxIcon.css |
| `state.checked` | shadcn | a genuinely filled box, unlike Salt's permanently-outlined one |
| `state.checked` | m3 | fill REPLACES stroke — the CHIP-MATRIX elevation@elevated mechanism again |
| `state.indeterminate` | salt | CheckboxIcon.css `.saltCheckboxIcon-checked.saltCheckboxIcon-indeterminate { border-color: var(--salt-selectable-borderColor); color: var(--salt-selectable-foreground) }` — the compound selector overrides back to neutral |
| `state.indeterminate` | shadcn | see no-hover-no-pressed-no-indeterminate-style; the state exists, the styling for it does not |
| `state.indeterminate` | m3 | render(): const containerClasses = classMap({ 'selected': isChecked \|\| isIndeterminate, ... }) |
| `state.hover` | salt | Checkbox.css/CheckboxIcon.css `.saltCheckbox:hover .saltCheckboxIcon...` |
| `state.hover` | shadcn | CONFIRMED ABSENCE — no hover: class of any kind |
| `state.focus` | salt | Checkbox.css `.saltCheckbox-input:focus-visible + .saltCheckboxIcon` |
| `state.focus` | shadcn | focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 |
| `state.pressed` | salt | CONFIRMED ABSENCE — no :active selector anywhere |
| `state.pressed` | shadcn | CONFIRMED ABSENCE — no active: class |
| `state.pressed` | m3 | see pressed-preview-finding |
| `state.disabled` | salt | Checkbox.css `.saltCheckbox-disabled { opacity: 0.4; cursor: var(--salt-cursor-disabled) }` |
| `state.disabled` | shadcn | disabled:cursor-not-allowed disabled:opacity-50 |
| `state.disabled` | m3 | this chassis applies it at the root level, a declared simplification |
| `style.box.size` | salt | CheckboxIcon.css --checkbox-size: var(--salt-size-selectable) |
| `style.box.size` | shadcn | class `size-4` = 1rem = 16px |
| `style.box.size` | m3 | container-size: 18px, hardcoded literal, both editions |
| `style.box.shape` | shadcn | class `rounded-[4px]`, a literal |
| `style.box.shape` | m3 | container-shape: 2px, all four logical corners |
| `style.box.border-width` | salt | CheckboxIcon.css border: var(--salt-size-fixed-100) solid ... = 1px, FIXED scale |
| `style.box.border-width` | shadcn | bare `border` utility, undeclared width, Tailwind's own default — the same unvendored-Tailwind caveat every prior shadcn column has recorded |
| `style.box.border-width` | m3 | unselected-outline-width: 2px — the REST value; style.box.checked overrides it to 0 |
| `style.icon.size` | salt | CheckboxIcon.css --saltIcon-size: 100% — the Icon component's own default, fills whatever box it sits in |
| `style.icon.size` | shadcn | CheckIcon wrapped `size-3.5` = 0.875rem = 14px, inside a 16px box |
| `style.icon.size` | m3 | icon-size: 18px, EQUAL to container-size — no margin |
| `style.root.gap` | shadcn | no owned label, nothing to space |
| `style.root.gap` | m3 | no owned label, nothing to space |
| `style.root.cursor` | salt | Checkbox.css .saltCheckbox { cursor: var(--salt-cursor-hover) } = pointer |
| `style.root.cursor` | shadcn | CONFIRMED ABSENCE — no cursor-pointer class at rest; only disabled:cursor-not-allowed exists |
| `style.root.cursor` | m3 | :host { cursor: pointer } |
| `style.root.font` | salt | Checkbox.css .saltCheckbox { font-size/line-height/font-family/font-weight: var(--salt-text-*) } — the BODY role, REGULAR (400), not text-notation |
| `style.root.font` | shadcn | no owned label text |
| `style.root.font` | m3 | no owned label text |
| `style.box.rest` | salt | CheckboxIcon.css .saltCheckboxIcon { border-color: selectable-borderColor; background: container-primary-background; color: selectable-foreground } |
| `style.box.rest` | shadcn | border border-input shadow-xs, no bg-* class outside data-[state=checked] (see box-bg provenance) |
| `style.box.rest` | m3 | unselected-outline-color: on-surface-variant; the fill layer is present but opacity:0, collapsed here to a literal transparent (see structure.outline-layer) |
| `style.box.checked` | salt | CheckboxIcon.css .saltCheckboxIcon-checked { border-color: selectable-borderColor-selected; color: selectable-foreground-selected } — no background rule; box-bg is UNCHANGED from rest, repeated here deliberately so the 'fill never changes' finding is visible in the generated CSS rather than merely asserted |
| `style.box.checked` | shadcn | data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground |
| `style.box.checked` | m3 | selected-outline-width: 0px; selected-container-color: primary; selected-icon-color: on-primary |
| `style.box.indeterminate` | salt | CheckboxIcon.css .saltCheckboxIcon-checked.saltCheckboxIcon-indeterminate resets border-color/color BACK to the plain (non-selected) selectable tokens — byte-identical to style.box.rest, which IS the finding |
| `style.box.indeterminate` | shadcn | CONFIRMED ABSENCE — see no-hover-no-pressed-no-indeterminate-style; the box falls through to style.box.rest's colours |
| `style.box.indeterminate` | m3 | identical to style.box.checked — see state.indeterminate |
| `style.box.dash` | salt | CheckboxIcon.css .saltCheckboxIcon-indeterminate::before |
| `style.box.dash` | shadcn | no dash of any kind; indeterminate reuses the checkmark icon |
| `style.box.dash` | m3 | the indeterminate glyph is the .mark <rect> pair rotated flat by CSS transform, not a separate pseudo-element — see structure.mark |
| `style.box.hover` | salt | CheckboxIcon.css `.saltCheckbox:hover .saltCheckboxIcon, .saltCheckbox:hover .saltCheckboxIcon-indeterminate { border-color: selectable-borderColor-hover; color: selectable-foreground-hover }` — both resolve to the SAME accent slot as -selected (see provenance) |
| `style.box.hover` | shadcn | CONFIRMED ABSENCE |
| `style.box.hover` | m3 | unselected-hover-state-layer-color: on-surface, unselected-hover-state-layer-opacity: 0.08 — modelled as the reachable (unselected) case, see the matrix doc's 'Declared approximations' for why the selected-hover primary-tinted variant is not separately expressed |
| `style.box.focus` | salt | Checkbox.css .saltCheckbox-input:focus-visible + .saltCheckboxIcon { outline: var(--salt-focused-outline); outline-offset: var(--salt-spacing-fixed-100) } |
| `style.box.focus` | shadcn | focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 — the shadow-xs layer is repeated after the ring because Tailwind v4 composes box-shadow as var(--tw-ring-shadow), var(--tw-shadow), the same layering input.shadcn.json and select.shadcn.json established |
| `style.box.focus` | m3 | unselected-focus-outline-color: on-surface; unselected-focus-state-layer-color: on-surface, opacity 0.12 |
| `style.box.pressed` | shadcn | CONFIRMED ABSENCE |
| `style.box.pressed` | m3 | unselected-pressed-state-layer-color: primary, opacity 0.12 — see pressed-preview-finding |
| `style.box.disabled` | salt | Checkbox.css .saltCheckbox-disabled { opacity: 0.4; cursor: var(--salt-cursor-disabled) } |
| `style.box.disabled` | shadcn | disabled:cursor-not-allowed disabled:opacity-50 |
| `style.box.disabled` | m3 | disabled-container-opacity / selected-disabled-container-opacity, both 0.38; :host([disabled]) { cursor: default } |
| `style.box.validation` | salt | CheckboxIcon.css .saltCheckboxIcon-error { color: status-error-foreground-decorative; border-color: status-error-borderColor }; Checkbox.css .saltCheckbox-error ...:focus-visible sets outline-color to the same |
| `style.box.validation` | shadcn | aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 — a PERMANENT ring, not gated on focus |
| `style.box.validation` | m3 | error-outline-color (renamed from unselected-error-outline-color): error |
| `style.box.validation@warning` | salt | CheckboxIcon.css .saltCheckboxIcon-warning { color: status-warning-foreground-decorative; border-color: status-warning-borderColor } |
| `style.box.validation@warning` | shadcn | CONFIRMED ABSENCE — aria-invalid is error-only |
| `style.box.validation@warning` | m3 | CONFIRMED ABSENCE — see no-warning-family |
| `style.box.transition` | salt | CONFIRMED ABSENCE — no transition property anywhere in Checkbox.css or CheckboxIcon.css |
| `style.box.transition` | m3 | a single representative transition standing in for the real multi-element, two-phase choreography (150ms emphasized-accelerate exiting / 350ms emphasized-decelerate entering, applied separately to background/icon opacity+scale AND to the mark rectangles' own width/height) — cubic-beziers from tokens/versions/v0_192/_md-sys-motion.scss's easing-emphasized-accelerate/-decelerate, [S] for the curves, |
| `style.box.state-layer` | salt | CONFIRMED ABSENCE — Salt has no ripple/state-layer concept for checkbox; hover and focus recolour the box directly |
| `style.box.state-layer` | m3 | documented, not rendered as its own element — see structure.outline-layer |
| `style.mark.short-size` | salt | markStyle=svg-plus-pseudo-dash — no <rect> in this strategy, see structure.mark |
| `style.mark.short-size` | shadcn | markStyle=single-icon — one lucide CheckIcon glyph, no <rect>, see structure.mark |
| `style.mark.short-size` | m3 | _checkbox.scss .mark.short { width: $_mark-stroke; height: $_mark-stroke }, $_mark-stroke: 2px |
| `style.mark.long-size` | salt | see style.mark.short-size |
| `style.mark.long-size` | shadcn | see style.mark.short-size |
| `style.mark.long-size` | m3 | _checkbox.scss .mark.long { width: 10px; height: $_mark-stroke } |
| `style.mark.fill` | salt | see style.mark.short-size |
| `style.mark.fill` | shadcn | see style.mark.short-size |
| `style.mark.fill` | m3 | .icon { fill: selected-icon-color } reproduced via currentColor (see structure.outline-layer's colour reuse); .background, .icon { opacity: 0 } at rest |
| `style.mark.selected-opacity` | salt | see style.mark.short-size |
| `style.mark.selected-opacity` | shadcn | see style.mark.short-size |
| `style.mark.selected-opacity` | m3 | :where(.selected) :is(.background, .icon) { opacity: 1 }, .selected = isChecked \|\| isIndeterminate |
| `style.mark.checked-transform` | salt | see style.mark.short-size |
| `style.mark.checked-transform` | shadcn | see style.mark.short-size |
| `style.mark.checked-transform` | m3 | .checked .mark { transform: ... }, $_checkmark-bottom-left: 7px, -14px |
| `style.mark.checked-short-size` | salt | see style.mark.short-size |
| `style.mark.checked-short-size` | shadcn | see style.mark.short-size |
| `style.mark.checked-short-size` | m3 | .checked .mark.short { height: 1px * sqrt(32) } |
| `style.mark.checked-long-size` | salt | see style.mark.short-size |
| `style.mark.checked-long-size` | shadcn | see style.mark.short-size |
| `style.mark.checked-long-size` | m3 | .checked .mark.long { width: 1px * sqrt(128) } |
| `style.mark.indeterminate-transform` | salt | see style.mark.short-size |
| `style.mark.indeterminate-transform` | shadcn | see style.mark.short-size |
| `style.mark.indeterminate-transform` | m3 | .indeterminate .mark { transform: ... }, $_indeterminate-bottom-left: 4px, -10px |

</details>

<!-- END GENERATED VALUES -->
