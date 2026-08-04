# Radio-group — component template matrix

*Sixteenth live component in the post-clean-slate pipeline (button, calendar,
spinner, tooltip, alert, input, select, dialog, tabs, card, badge, progress,
chip, checkbox, switch came before). Same method as
[SWITCH-MATRIX.md](SWITCH-MATRIX.md)/[CHECKBOX-MATRIX.md](CHECKBOX-MATRIX.md):
one master template (union of all six pieces across systems), columns per
design system, rows switched on/off/inherited per column.*

**Cell legend** · `⟡ slot` = alias to shared contract slot · **bold** = the
system's own radio · `off` = row switched off in this column · `[S]` = value
extracted from source this session · `[R]` = not directly sourced (reason
always given).

**Row policies** · 🔒 locked-on (no column may switch it off) ·
⚪ switchable (on where the system has it) · ⬜ on-with-default.

**Naming rule** — grammar `<piece>.<part>[.<subpart>].<property>[@state]`,
enforced by `contract/template.schema.json`'s `row.id` pattern.

**53 rows in all**: 4 structure, 10 behavior, 7 prop, 2 slot, 7 state, 23
style.

**The headline of this matrix is a question, not a fact: does a
"radio-group" need a group wrapper element at all?** The answer splits three
ways — Salt and shadcn both say yes (a real `<fieldset>`/`<div>` carrying
`role="radiogroup"`), M3 says no (no group element, role, or fieldset exists
anywhere; selection-sharing is a pure DOM-query side effect scoped to the
connected root node). This is the first component in the pipeline where the
CANONICAL ROW ITSELF ("radio-group") already names a structural claim two of
three systems make and one genuinely does not — decided as `structure.group`,
a locked row with three real strategies, never an absence for M3.**</br>
Read CHECKBOX-MATRIX.md's findings 10 and 11 before touching this
component's selectors — they describe the exact class of defect (a
DOM-shape assumption baked into a combinator, and a structure row declared
but never given real CSS, both silently invisible) this matrix's chassis
was designed from the ground up to be immune to, and — see finding 1 below —
one of the two defects recurred here anyway, on a NEW row this matrix
introduced, and was caught by exactly the verification step CLAUDE.md rule
12 exists to require.

---

## Scope note

### Claiming the row

`1-intro/content/04-component-map.md`'s Forms & inputs section, line 47:
`| radio-group | ✓ | ✓ radio-button | ✓ radio, radio-button |` — present in
all three, but under THREE DIFFERENT NAMES, the busiest naming mismatch this
matrix has resolved yet: shadcn's own component is literally called
`radio-group` (the canonical name IS shadcn's own); Salt splits the idea
across two files, `RadioButton` (the item) and `RadioButtonGroup` (the
wrapper); M3 has a `radio` component directory and an `<md-radio>` custom
element, with NO group wrapper of any kind — the component-map's own second
M3 entry, "radio-button", refers to the SAME `radio/` directory (the token
FILE is literally named `_md-comp-radio-button.scss` even though the
component and custom element are both named `radio`/`md-radio` — confirmed
by grepping the directory structure directly, not assumed from the token
file's name alone).

### In scope

The multi-item selection construct itself (however each system wraps or
doesn't wrap it), the individual item's native input + visual dot, disabled
and read-only handling (both item- and, where it exists, group-level), the
`validation` axis (Salt/shadcn only), and the keyboard story — which, unlike
switch's own genuine per-system fork, converges on IDENTICAL observable
behaviour across all three columns for a structurally interesting reason
(see behavior.arrow-navigation and finding 3).

### Out of scope, and why (structural reasons, declared not dropped)

| excluded | where | structural reason |
|---|---|---|
| `label` | 04-component-map.md, its own row, unbuilt | Identical boundary to checkbox's/switch's: Salt owns a `label` slot; shadcn and M3 own none — the label a consumer sees always belongs to a SEPARATE component associated by `id`/`htmlFor`. Composing with it is declared (`slot.composes`), building it is not this row's job. |
| `field` (label+control+help wrapper) | 04-component-map.md, its own row, unbuilt | shadcn's `FieldSet`/`FieldLegend`/`FieldDescription`/`FieldLabel` (`field-radio.tsx`) and Salt's `useFormFieldProps()` both delegate description text and container styling to this row. Declared composition, not modelled here. |
| `switch` | 04-component-map.md, its own row, ALREADY BUILT | Salt's own `usage.mdx`: *"When you have a Boolean selection (on/off). Instead, use Switch"* [S]. |
| `checkbox`/`CheckboxGroup` | 04-component-map.md, its own row, ALREADY BUILT | *"When you have fewer than five options and multiple selection is necessary. Instead, use CheckboxGroup"* [S]. |
| `select`/`dropdown` | 04-component-map.md, its own row, unbuilt | *"When you have more than five and fewer than 10 options. Instead, use Dropdown"* [S] — a boundary neither checkbox's nor switch's own scope notes needed, since radio's usage.mdx draws a line the other two do not. |
| `combo-box` | 04-component-map.md, its own row, unbuilt | *"When you have more than 10 options. Instead, use ComboBox"* [S] — a SECOND boundary unique to radio, making it the busiest declared-composition table this registry has written (five siblings, versus switch's three and checkbox's one). |
| M3's separate `md-focus-ring`/`md-ripple` elements | `radio/internal/radio.ts` render() | The identical shared cross-component focus-ring/ripple primitives checkbox's and switch's own scope notes already excluded, for the identical reason. |
| M3's separate 48x48 `.touch-target` div | `radio/internal/_radio.scss` | Real, sourced, and NOT modelled as its own row — folded into `structure.native-input`'s note (matching checkbox's own precedent of declaring a similar M3 touch-target fact without giving it a row). |
| Salt's `direction`/`wrap` props on `RadioButtonGroup` | `RadioButtonGroup.tsx` | A single Salt-only layout axis with no cross-system counterpart, the identical scope-control decision checkbox's own `CheckboxGroup` `direction` prop received. |

---

## Sources

- **Salt** [S]: `packages/core/src/radio-button/{RadioButton.tsx,RadioButton.css,RadioButtonIcon.tsx,RadioButtonIcon.css,RadioButtonGroup.tsx,RadioButtonGroup.css,internal/useRadioGroup.ts,internal/RadioGroupContext.tsx,index.ts}` —
  the whole component family, seven files, read in full.
  `site/docs/components/radio-button/{index,usage,accessibility,examples}.mdx`.
  Resolution through `packages/theme/css/next/characteristics/{selectable,focused}.css`,
  `next/palette/{neutral,accent,negative,warning,background}.css`,
  `next/foundations/color.css`, `packages/theme/css/foundations/{size,spacing,cursor,borderStyle,zindex}.css`.
- **shadcn** [S]: `apps/v4/registry/new-york-v4/ui/radio-group.tsx` — TWO
  elements (`RadioGroupPrimitive.Root`, `RadioGroupPrimitive.Item`), two
  literal className strings, canonical. Token values from
  `apps/v4/app/globals.css`. Read for the label/field boundary and real
  usage: `radio-group-demo.tsx`, `field-radio.tsx`, `radio-group-disabled.tsx`,
  `radio-group-invalid.tsx`, `radio-group-rtl.tsx`, `radio-group-choice-card.tsx`,
  `radio-group-fieldset.tsx`, `radio-group-description.tsx`. Read only to fix
  structural boundaries (NOT canonical):
  `apps/v4/registry/bases/{radix,base,aria}/ui/radio-group.tsx` (the radix
  base variant moves the identical Root+Item+Indicator shape behind
  `cn-radio-group`/`cn-radio-group-item` class tokens — same conclusions, no
  extra capability) and `apps/v4/content/docs/components/radix/radio-group.mdx`,
  which links to but does not itself document Radix's internal element.
  **primitives/ was NOT cloned**, per the project's standing rule. Every cell
  depending on Radix's internal element/ARIA wiring is `[R]`, citing
  https://www.radix-ui.com/docs/primitives/components/radio-group.
- **Material 3** [S]: `radio/internal/radio.ts` (the real Lit component, 197
  lines — `render()`, `handleClick`/`handleKeydown`, `ElementInternals`
  role/checked wiring, form-association mixins),
  `radio/internal/single-selection-controller.ts` (the root-node-scoped
  selection sharing AND arrow-key roving controller, 246 lines, read in
  full — the single most important file this matrix cites, since it is the
  entire answer to "how does M3 do without a group element"),
  `radio/internal/_radio.scss` (the shipped styles source, read in full),
  `radio/radio.ts` (the `<md-radio>` registration), `radio/radio_test.ts`
  (spot-checked for the `ElementInternals` role/checked proof).
  `labs/behaviors/validators/radio-validator.ts` (the group-aware
  required/checked validator, genuinely different from checkbox's/switch's
  own reused `CheckboxValidator`). Tokens:
  `tokens/versions/v0_192/_md-comp-radio-button.scss` (the pinned edition —
  note the FILE name says `radio-button`, the component directory and
  custom element both say `radio`; a real naming split, not a typo) and
  `tokens/versions/latest/sass/_md-comp-radio-button.scss` (edition diff
  only — see below, a genuinely SMALL one, in contrast to switch's own
  wholesale-redesign delta). Colour/state resolution through
  `tokens/versions/v0_192/{_md-sys-color.scss,_md-sys-state.scss}`.

### Edition pin — `v0.192`, per standing owner decision, checked and found SMALL this time

Radio's edition diff is a plain FORMAT change only: `latest` replaces
v0.192's `values()` function with a flat file of individually-annotated
`$variable` declarations, but every VALUE is byte-identical between
editions, diffed line by line, confirmed directly. Flagged here specifically
BECAUSE switch's own matrix trained the expectation of a large delta on
every M3 component — this one genuinely does not have one, and that absence
is itself worth recording so the next session does not assume the worst
without checking.

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **group wrapper** | 🔒 (config) | **`fieldset-radiogroup`** — a real `<fieldset role="radiogroup">` (RadioButtonGroup.tsx) [S] | **`div-radiogroup`** [R] — a `<div role="radiogroup">` per the linked Radix docs, mandatory (an Item has no meaning without a Root) | **`name-scoped`** [S] — CONFIRMED ABSENCE of any group element/role; selection-sharing is a pure `querySelectorAll('[name=...]')` side effect at the connected root node |
| **item shell** | 🔒 (config) | **`label-wrap`** — one real `<label>` wrapping input, dot, and label text, byte-identical shape to Checkbox/Switch [S] | **`unwrapped`** [R] — no owned label; paired with a separate `<Label htmlFor>` | **`unwrapped`** [S] — no label anywhere in the shadow DOM |
| native input | ⚪ (info) | **on** — a REAL `<input type="radio">`, opacity 0 [S] | **on** [R] — Radix's Item is documented as a `<button role="radio">`, not a native input at all; this chassis renders a real input anyway (declared union, same shape checkbox's/switch's chassis used) | **off** — CONFIRMED ABSENCE, the FIRST M3 column in this whole pipeline with NO native input at all (checkbox's and switch's own M3 columns both had one); role/checked are set purely via `ElementInternals` in JS |
| **dot** | 🔒 (config) | **`conditional-glyph`** — appears ONLY when checked (and swaps to a lighter glyph when read-only), the identical mechanism CheckboxIcon.tsx/Switch's icon used [S] | **`single-glyph`** — one lucide `CircleIcon`, mounted only while checked [S/R] | **`dual-circle`** — a masked outer ring plus a scaling inner dot, BOTH always in the DOM, CSS-driven opacity/animation [S] |

## 2 · Behavior

**Every row below is implemented in `skeleton/radio-group.tsx` and asserted
by `gates/check-radio-group-behavior.mjs`.** Ten rows, five locked-info, one
locked-config-equivalent(role branching lives in the config-driven
`groupShape` fork).

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **role** | 🔒 | **implicit**, free from the native `<input type="radio">` [S] | **[R]** `role="radio"` on a `<button>` Item, `aria-checked` JS-maintained | **explicit, via `ElementInternals`** — `this[internals].role = 'radio'`, never a rendered attribute [S] |
| group role | ⚪ | **explicit** `role="radiogroup"` on the `<fieldset>` [S] | **[R]** presumed `role="radiogroup"` on the Root | **off** — CONFIRMED ABSENCE, no group entity to carry it |
| **keyboard select** | 🔒 | Space activates the focused, not-yet-checked radio (native) [S] | **[R]** native `<button>` default-activation answers Space | Space (native listener) calls `this.click()` [S] |
| **arrow navigation** | 🔒 | **native** — free browser behaviour for same-name siblings [S] | **[R]** presumed JS roving-tabindex | **explicit, RTL-aware JS** (`SingleSelectionController.handleKeyDown`), built to imitate native `<input type="radio">` selection [S] |
| **selection model** | 🔒 | GROUP-held string `value` compared per item [S] | **[R]** same group-value model | each item owns its OWN boolean, imperatively unchecking siblings [S] |
| **disabled handling** | 🔒 | native `disabled`, a THREE-WAY merge (group/form-field/own) [S] | native `disabled` [S], group forwarding **[R]** | native `?disabled`, PLUS disabled siblings SKIPPED by arrow-key nav [S] |
| readonly | ⚪ | **on** — implemented in JS at BOTH item and group level [S] | off — CONFIRMED ABSENCE | off — CONFIRMED ABSENCE |
| label click target | ⚪ | **the WHOLE label** [S] | **the dot only** — consumer's own `<Label htmlFor>` extends it [S/R] | **the dot, PLUS an explicit redirect** from any ancestor `<label>`, identical mechanism to checkbox's/switch's M3 columns [S] |
| form participation | ⚪ | native — the input IS the real form control [S] | **[R]** a hidden native bubble input | a full form-associated custom element with its OWN radio-SPECIFIC, GROUP-AWARE `RadioValidator` — genuinely different from checkbox's/switch's reused `CheckboxValidator` [S] |
| validation | ⚪ | computed PER ITEM, suppressed when THAT item is disabled [S] | a bare `aria-invalid` boolean [S] | **off** — CONFIRMED ABSENCE, second sighting after switch's own M3 column |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **selection shape** | 🔒 | `group-value`: group `value: string` compared against item `value: string` [S] | `group-value`, same shape [R] | `item-checked`: `checked: boolean` per item; `value` used ONLY for form submission [S] |
| `disabled` (item) | 🔒 | **`[false, true]`** [S] | **`[false, true]`** [S] | **`[false, true]`** [S] |
| `disabled` (group) | ⚪ | **`[false, true]`** [S] | **`[false, true]`** [R] | off — CONFIRMED ABSENCE, no group entity to hold it |
| `readOnly` (item) | ⚪ | **`[false, true]`** [S] | off | off |
| `readOnly` (group) | ⚪ | **`[false, true]`** [S] | off | off |
| `required` | ⚪ | **`[false, true]`**, indirect via `inputProps.required` [S] | **`[false, true]`** [R] | **`[false, true]`**, first-class — AND group-scoped: *"If any radio is required in a group, all radios are implicitly required"* [S] |
| `validation` | ⚪ | **`["off","error","warning"]`** [S] | **`["off","error"]`** [S] | off — CONFIRMED ABSENCE |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| label | ⚪ | Salt ONLY owns this — identical mechanism to checkbox's/switch's `slot.label`. shadcn and M3: OFF, always external. |
| composes (declared) | ⬜ | **FIVE declared exclusions**, the busiest in this registry: `switch`, `checkbox`/`CheckboxGroup`, `select`/`dropdown`, `combo-box` — radio's own `usage.mdx` draws four separate lines (a fifth, `label`/`field`, is the composition itself). All neutral placeholders in the harness. |

## 5 · States

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| rest | 🔒 | neutral outline item, no dot | `border-input` item, NO background in EITHER mode, no dot | NO container styling of any kind — the visible ring is the dot's own outer circle |
| **checked** | 🔒 | item fill NEVER changes; border+dot recolour to accent | **THE ITEM NEVER CHANGES AT ALL** — the entire signal is the dot's presence | outer ring recolours AND inner circle animates in (opacity 0→1, 300ms scale-grow) |
| hover | ⚪ | item border+dot recolour, keyed off item `:hover` [S] | **off** — CONFIRMED ABSENCE | dot recolours; item shows nothing (no drawable surface) |
| focus | ⚪ | 2px dotted outline at 1px offset [S] | translucent 3px ring on the item | same dot-only story as hover; separate `md-focus-ring` not reproduced |
| pressed | ⚪ | **off** — CONFIRMED ABSENCE | **off** — CONFIRMED ABSENCE | **on** — dot recolours to the SAME value as hover/focus (M3 does not differentiate) |
| disabled | 🔒 | opacity 0.4 (flat) | opacity 0.5 (flat) | 0.38 on the dot ONLY, IDENTICAL for selected/unselected — a real CONTRAST to switch's own asymmetry |
| readonly | ⚪ | **on** — dashed border, glyph swap [S] | off | off |

## 6 · Styles — the cell matrix

All cells at each system's default: unchecked, enabled, medium Salt density.

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| group gap | ⚪ | 4-16px by density (vertical) [S] | `gap-3` = 12px, fixed [S] | off — no group element |
| item size | ⬜ | 12-18px by density [S] | 16px (`size-4`) [S] | 20px (`icon-size`), hardcoded [S] |
| **item shape** | ⚪ | `50%`, a PLAIN LITERAL (not a corner token) [S] | `9999px` (`rounded-full`) [S] | **off** — the item draws no box to shape at all |
| **item border-width** | ⚪ | 1px, fixed scale [S] | 1px, undeclared [S] | **off** — no `border`/stroke mechanism anywhere; the ring is a masked FILLED circle |
| item rest/checked colours | ⚪ | outline-only, fill never changes; recolours on check [S] | **NO CHANGE ON CHECK** — see state.checked [S] | **off** — everything lives on the dot instead |
| item hover/focus/pressed | ⚪ | on (all three) [S] | focus only [S] | **off** — all real feedback lives on the dot |
| item disabled | ⚪ | flat opacity 0.4 [S] | flat opacity 0.5 [S] | **off** — dimming happens on the dot, never the item |
| dot size | ⚪ | `100%`, fills the item [S] | `8px` (`size-2`), inside a 16px item [S] | **off** — fixed SVG markup geometry (`r="10"`/`r="5"`), not a themed CSS row |
| **dot fill (rest)** | ⚪ | off — literal `fill="currentColor"` in markup, inherits item colour | `var(--primary)` — a LITERAL, ALWAYS-primary colour, never overridden by any interaction [S] | `var(--on-surface-variant)`, the shared baseline for both circles [S] |
| dot fill @checked | ⚪ | off (see above) | off — no unchecked counterpart to compare against | `var(--primary)`, overriding the baseline [S] |
| **dot hover** (reused for focus+pressed) | ⚪ | off (item carries it via `currentColor`) | off — fixed literal never changes | `var(--on-surface)`, numerically IDENTICAL across hover/focus/pressed [S] |
| dot disabled | ⚪ | off (item dims uniformly) | off (item dims uniformly) | `on-surface` @ 0.38 opacity — ONE cell covers BOTH selection states, unlike switch's asymmetry [S] |
| **dot inner-grow @checked** | ⚪ | off — no inner/outer circle pair | off — no inner/outer circle pair | `opacity: 1` + `animation: inner-circle-grow 300ms` — see finding 1 |
| root cursor | ⬜ | pointer [S] | off — CONFIRMED ABSENCE | pointer, PLUS an EXPLICIT `disabled → default` override — the first M3 column in this pipeline to write one [S] |
| root font | ⬜ | BODY role, regular, + text colour [S] | off | off |
| state-layer geometry | ⚪ (info) | off | off | 40px circle, centred on the 20px icon, documented not rendered |

---

## Declared approximations in the chassis

1. **shadcn's real Item is approximated as a native `<input>`, not a
   `<button>`.** The linked Radix docs describe the Item as
   `<button role="radio">` with a hidden bubble input for form
   participation — this chassis instead always renders one real native
   input, driving every interaction state with real CSS pseudo-classes, the
   identical declared union checkbox.tsx's/switch.tsx's own chassis notes
   already established for the same reason (primitives/ not cloned).
2. **M3's Item is approximated as a native `<input>` too — a NEW instance of
   the same declared union, but a bigger leap than checkbox's/switch's own
   shadcn approximations, because M3's real source has NO input-like element
   of any kind, native or otherwise.** Real `<md-radio>` sets role and
   checked state purely through `ElementInternals`, with selection-sharing
   done by a JS controller querying the DOM for same-name siblings. This
   chassis's declared native-input union converges on the SAME OBSERVABLE
   keyboard behaviour that controller was written to imitate (see finding
   3), which is why this approximation is judged reasonable rather than
   fabricated — but it is worth stating plainly that this is the LARGEST
   structural leap this registry has taken for an M3 column so far.
3. **M3's `.handle-container`-equivalent — the separate `md-ripple` and
   `md-focus-ring` elements — are collapsed onto the dot itself**, the
   identical category of approximation checkbox's/switch's own M3 columns
   already made for their own ripple-adjacent state layers (see
   `style.state-layer`, documented not rendered).
4. **This chassis implements ONE internal selection engine (Salt's/shadcn's
   own group-value model) for all three columns**, rather than also
   reproducing M3's structurally different per-item-boolean model. The
   OBSERVABLE outcome (exactly one item checked after any interaction) is
   identical for all three; only M3's own internal data-flow route differs
   — see behavior.selection-model and finding 3's live verification.

---

## Findings from building this matrix

1. **A real defect, of EXACTLY the class CHECKBOX-MATRIX.md finding 11
   warns about, found on a brand-new row this matrix introduced — and
   caught by live `getComputedStyle`/`getBoundingClientRect` verification,
   not by any of the five gates.** `structure.dot`'s `"dual-circle"`
   strategy declares M3's inner circle grows in via
   `style.dot.inner-grow@checked` (`opacity: 1` + a named `animation`), but
   the FIRST DRAFT of `base` never gave the inner circle a REST-state
   `opacity: 0` — meaning it rendered at its browser-default opacity (1)
   in EVERY state, checked or not, making the "grows in from nothing"
   effect invisible because there was nothing for it to grow FROM. Verified
   broken with a live Playwright render (`innerOpacity: "1"` on BOTH the
   checked AND unchecked M3 items, identical, before the fix) and verified
   fixed after adding `"[data-slot=\"radio-dot\"] .inner": { "opacity": "0" }`
   to `base` (`innerOpacity: "0"` unchecked → `"1"` checked, after). A
   SECOND, smaller instance of the identical drift mode was found in the
   same pass: `style.dot.inner-grow@checked`'s cell cited a named
   `@keyframes inner-circle-grow` that was never actually DEFINED anywhere
   — `gen-from-template.py` has no mechanism to emit a raw `@keyframes`
   block, only `selector { declarations }` rules, a limit
   `dialog.template.json`'s own animation rows already worked around by
   appending real keyframes to `harness/chrome.css` directly (its own
   `style.panel.animation@enter` note says so explicitly: *"The two
   keyframes are appended to page/chrome.css"*). Fixed the same way here.
   Neither defect was caught by `gen-from-template.py` (which has no
   opinion on whether a referenced animation-name resolves to anything),
   `check-structure.py` (gate B checks for sizing rows, not opacity
   baselines), or `check-radio-group-behavior.mjs` (a STYLE-piece row, not
   a behaviour one) — only the live browser render caught it, which is
   exactly the point of CLAUDE.md rule 12 and this session's explicit
   verification step.

2. **The canonical row's own name asks a real structural question, and the
   three systems answer it three different ways.** `structure.group` is the
   first `locked` structure row in this whole pipeline where one column's
   real, correct answer is "there is no element" (M3's `name-scoped`) rather
   than an `off` cell — modelled as a genuine third STRATEGY value, not an
   absence, because M3 unambiguously HAS a working group mechanism
   (`SingleSelectionController`, root-node-scoped selection sharing), it
   simply is not a rendered element. Getting this row's `policy` right
   (`locked`, not `switchable`) was a real decision this matrix had to make
   deliberately: a `switchable`/`off` cell would have understated M3's real
   capability by implying a bare absence where a real, working, sourced
   mechanism exists.

3. **The keyboard story CONVERGES across all three columns, and the reason
   why is itself the finding — the mirror image of switch's own genuine
   divergence.** Switch's own `behavior.keyboard-activation` was the first
   `locked` behaviour row this pipeline found genuinely different per
   system (Salt/shadcn Space-only, M3 Space+Enter). Radio's own
   `behavior.arrow-navigation` looks like it should diverge the same way —
   Salt is native, shadcn is presumed JS, M3 is EXPLICIT, real, sourced JS
   (`SingleSelectionController.handleKeyDown`) — but M3's own controller
   class doc comment states its design intent directly: *"provides root
   node-scoped single selection for elements, SIMILAR TO NATIVE
   `<input type="radio">` SELECTION"* — meaning M3's real JS was written
   SPECIFICALLY to reproduce the exact browser behaviour Salt gets for
   free. Because this chassis already renders a real native
   `<input type="radio">` for every column (a declared approximation, see
   above), all three columns converge on IDENTICAL observable keyboard
   behaviour for free, verified live: `behavior.arrow-navigation`'s
   conformance assertion confirms all three siblings share one `name`
   attribute (the native-roving prerequisite) in every column. This is not
   an accident of the approximation — it is the approximation converging on
   the exact target M3's own source states it was built to hit.

4. **`check-anatomy.mjs` flags `radio-group` with `⚠ identical part-set:
   salt=shadcn` (4 parts, 3 shared, 0 system-unique) — explained here, per
   the gate's own rule that a convergence must be answerable with data, not
   trust.** The gate counts a structure row as a rendered "part" whenever
   its cell `kind` is not `off`/`false`/`null`, regardless of the SPECIFIC
   VALUE. On that coarse measure, Salt and shadcn both have ALL FOUR
   structure rows populated (`group`, `shell`, `native-input`, `dot`), while
   M3 has only THREE (`native-input` is genuinely `off` — the finding this
   whole matrix is built around). So Salt and shadcn converge on WHICH
   categories of part exist, while M3 genuinely diverges by having fewer —
   but Salt and shadcn disagree on almost everything about the SPECIFIC
   VALUE within each category: the group wrapper element (`fieldset` vs
   `div`), the dot strategy (`conditional-glyph`'s readOnly-glyph-swap vs
   `single-glyph`'s single conditional mount), and — the sharpest split in
   this whole matrix — whether the ITEM CONTAINER visually changes on check
   AT ALL (Salt: yes, border+fill recolour; shadcn: NO, confirmed by both
   the literal className string and a live `getComputedStyle` render
   showing an IDENTICAL `border-color` before and after clicking). This is
   not the retrofit shape rule 1 forbids, for the identical reason
   SWITCH-MATRIX.md finding 12 already established for its own coarse
   `salt=m3` convergence: the gate's part-count measure is coarser than the
   matrix's own 53-row grain by design, and this paragraph existing is what
   satisfies CLAUDE.md's "an unexplained convergence is the shape rule 1
   forbids" — the convergence is explained, not absent.

5. **M3's disabled treatment is COMPLETELY selection-invariant — a real
   CONTRAST to switch's own asymmetric finding, re-checked specifically
   because of it.** Switch's own M3 column found `disabled-selected-handle-
   opacity: 1` (undimmed) against `disabled-unselected-handle-opacity: 0.38`
   — a real, deliberate asymmetry. Radio's own token file was read
   side-by-side specifically to check for the same pattern, and found none:
   `disabled-selected-icon-opacity`/`disabled-unselected-icon-opacity` are
   BOTH `0.38`, and `disabled-selected-icon-color`/`disabled-unselected-icon-
   color` are BOTH `on-surface` — genuinely identical, confirmed twice
   against the raw token file. `style.dot.disabled` therefore needs no
   `@checked` variant at all, unlike what switch's own precedent might have
   suggested was the default expectation.

6. **M3's own source is the first M3 column in this pipeline to write an
   EXPLICIT `disabled → cursor: default` override.** Checkbox's and
   switch's own M3 columns both left `cursor: pointer` in place even when
   disabled (neither wrote a `:host([disabled]) { cursor: ... }` rule at
   all) — radio's own `_radio.scss` does write one, a small but real,
   sourced divergence from its own sibling components' cursor treatment,
   confirmed by grepping all three files side by side.

7. **Live verification, stated plainly rather than implied by a clean gate
   run — the strongest verification pass in this pipeline so far, because a
   headless browser WAS available this session.** Unlike SWITCH-MATRIX.md
   finding 11 (no browser available, selectors hand-traced, closed later by
   orchestrator review) or CHECKBOX-MATRIX.md's own post-hoc discovery (a
   real defect found only during ORCHESTRATOR review, after the building
   session's own sign-off), this session ran Playwright/Chromium directly
   (`NODE_PATH=$(npm root -g)`, global install, confirmed available before
   relying on it) against `out/radio-group-check.html` and
   `out/conformance.html`, and confirmed, LIVE, in ALL THREE columns:
   (a) `getComputedStyle` on the item shows Salt's border-color genuinely
   changing (`rgb(114,119,125)` unchecked → `rgb(0,120,207)` checked) while
   shadcn's stays BYTE-IDENTICAL (`oklch(0.922 0 0)` both states) and M3's
   never carries a border-color rule at all (both states read the
   browser's inherited text colour, `rgb(24,24,27)`, confirming NO CSS
   targets the item container for M3 at all); (b) the dot's own child count
   toggles 0→1 for Salt/shadcn (glyph mounts only when checked) while M3's
   stays at 1 always (dual-circle strategy, always in the DOM); (c) the
   dot's own colour changes for Salt (inherits accent via `currentColor`)
   and M3 (`rgb(73,69,79)` unselected → `rgb(103,80,164)` selected,
   `on-surface-variant` → `primary`) while shadcn's stays fixed
   (`oklch(0 0 0)`, the literal `fill-primary`); (d) `getBoundingClientRect`
   confirms real, distinct dot SIZES per column — Salt 12×12 (item minus
   border), shadcn 8×8 (inside a 16×16 item), M3 20×20 (fills the item
   exactly) — matching `style.dot.size`'s own row exactly; (e) the
   TRANSITION itself (not a static mount) was driven: clicking a real
   `value="compact"` radio in a live, mounted three-item group resolved
   the group's own displayed state from "comfortable" to "compact"; (f)
   `harness/conformance.tsx`'s new `checkRadioGroup()` — 18 assertions
   across the three columns — passed 18/18, bringing the harness total to
   89 (18 new), with the ONE pre-existing failure being the already-known
   `tabs`/shadcn/`behavior.activation-mode` issue (CLAUDE.md's Known-open
   work), unrelated to and unaffected by this build. No selector was found
   dead; the one real defect this session found (finding 1) was a MISSING
   baseline rule, not a wrong combinator, and was caught by exactly the
   verification step that exists to catch it.

8. **A second real defect, found by a SECOND round of orchestrator review
   AFTER finding 7's live verification had already passed — proof that a
   passing live check on the STATES a matrix thought to test does not mean
   the LAYOUT is right.** `style.item.size` and eleven sibling `style.item.*`
   rows (shape/border-width/rest/checked/hover/focus/pressed/disabled/
   readonly/validation/validation@warning/transition) all originally
   targeted `[data-slot="radio-item"]` — the ROOT `<label>` — not
   `[data-slot="radio-dot"]`. For shadcn and M3 this is harmless (neither
   renders an owned label inside the item, so item and dot are visually
   co-extensive and the bug is invisible). For SALT it is not: the root
   also contains the label text as a sibling of the dot, so forcing the
   root to a fixed 14-18px width squeezed "Default"/"Comfortable"/"Compact"
   into a box sized for a bare circle, with the text rendering flush
   against — visually overlapping — the dot, at ZERO gap (the row for the
   internal dot-to-label gap didn't exist at all). Confirmed directly
   against Salt's own source: `RadioButtonIcon.css`'s `width`/`height`/
   `border`/`background`/`color` rules are on `.saltRadioButtonIcon`, a
   SEPARATE element from `.saltRadioButton` (the root), which
   `RadioButton.css` shows is `width: fit-content` with its own `gap`.
   This chassis's `radio-dot` span is already the structural equivalent of
   `RadioButtonIcon` — it just was never the SELECTOR target. Fixed by
   retargeting all twelve rows to `radio-dot` (state-conditional ones via
   `[data-slot="radio-item"]:has(...) [data-slot="radio-dot"]`, matching
   the pattern every other component in this pipeline already uses), and
   adding the missing `style.item.gap` row (Salt only, `--salt-spacing-100`
   — the SAME token `style.group.gap` cites for the gap BETWEEN items, a
   real sourced coincidence). `style.dot.size` was retargeted in the same
   pass from `radio-dot` itself to `radio-dot svg`, since its own values
   were always about the GLYPH's size relative to the now-separately-sized
   box, not the box's own footprint. Re-verified live after the fix:
   `getBoundingClientRect` shows the item auto-sizing to content (62.8px
   for "Comfortable" at medium density, was hard-capped at 14px), the dot
   holding its exact 14×14px circle, and an 8px gap with zero overlap
   between the dot's right edge and the label's left edge. Gates and the
   conformance harness (89/89, same one pre-existing unrelated `tabs`
   failure) were re-run clean after the fix. **The lesson beyond
   checkbox's and switch's own findings: a selector CAN match its intended
   element and still be the WRONG element** — `:has()` anchoring solves
   "does this rule fire at all", not "does this rule fire on the right
   part of the DOM." Verifying computed *state changes* (finding 7) is not
   the same check as verifying computed *layout* (this finding) — both are
   needed.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/radio-group.template.json` against every system, read from `columns/radio-group.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 10 light, 4 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `neutral` | rgb(114, 119, 125) | — | yes |
| `neutral-fg` | rgb(95, 100, 106) | rgb(145, 149, 154) | yes |
| `accent` | rgb(0, 120, 207) | — | yes |
| `box-bg` | rgb(255, 255, 255) | rgb(16, 24, 32) | yes |
| `text-fg` | rgb(0, 0, 0) | rgb(255, 255, 255) | yes |
| `error` | rgb(229, 33, 53) | — | yes |
| `warning` | rgb(199, 83, 0) | — | yes |
| `focus-outline` | rgb(0, 69, 126) | rgb(154, 189, 245) | yes |
| `type-fontFamily` | 'Open Sans', sans-serif | — | **no** |
| `type-fontWeight` | 400 | — | **no** |

**shadcn** — 6 light, 5 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `input-border` | oklch(0.922 0 0) | oklch(1 0 0 / 15%) | yes |
| `primary` | oklch(0% 0 0) | oklch(0.922 0 0) | yes |
| `destructive` | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | yes |
| `ring` | oklch(0.708 0 0) | oklch(0.556 0 0) | **no** |
| `ring-alpha-error` | 20% | 40% | **no** |
| `shadow-color` | rgb(0 0 0 / 0.05) | — | yes |

**m3** — 3 light, 3 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `primary` | #6750a4 | #d0bcff | **no** |
| `on-surface` | #1d1b20 | #e6e0e9 | **no** |
| `on-surface-variant` | #49454f | #cac4d0 | **no** |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.group` | structure | locked | `fieldset-radiogroup` | `div-radiogroup` | `name-scoped` |
| 2 | `structure.shell` | structure | locked | `label-wrap` | `unwrapped` | `unwrapped` |
| 3 | `structure.native-input` | structure | switchable | `True` | `True` | **off** |
| 4 | `structure.dot` | structure | locked | `conditional-glyph` | `single-glyph` | `dual-circle` |
| 5 | `behavior.role` | behavior | locked | `implicit — role=radio from the native <input type="radio">, no explicit role attribute anywhere` | `[R] role=radio on a <button> Item, aria-checked JS-maintained (no native checked DOM property to read it from)` | `explicit, via ElementInternals — this[internals].role = 'radio' set in JS, not a rendered attribute` |
| 6 | `behavior.group-role` | behavior | switchable | `explicit role="radiogroup" on the <fieldset>, plus aria-readonly reflecting the group's own readOnly` | `[R] presumed role="radiogroup" on the Root, per the linked docs and the general APG pattern` | **off** |
| 7 | `behavior.keyboard-select` | behavior | locked | `Space activates the focused radio if not already checked (native); no keydown override` | `[R] native <button> default-activation semantics answer Space for free; no extra JS needed` | `Space (native listener) calls this.click() — no Enter, unlike switch's own M3 column` |
| 8 | `behavior.arrow-navigation` | behavior | locked | `native — Up/Down/Left/Right move focus AND selection between same-name sibling inputs, entirely free from the browser` | `[R] presumed roving-tabindex behaviour implemented in Radix's own JS, per the general Radix primitives convention` | `explicit, RTL-aware JS — SingleSelectionController.handleKeyDown moves focus AND selection among same-name, non-disabled siblings` |
| 9 | `behavior.selection-model` | behavior | locked | `a GROUP-held string value compared against each item's own value prop, shared via RadioGroupContext` | `a GROUP-held string value compared against each item's own value prop, shared via Radix's own context` | `each radio owns its OWN independent checked boolean; becoming checked imperatively unchecks every other same-name sibling` |
| 10 | `behavior.disabled-handling` | behavior | locked | `native disabled on the input, a THREE-WAY merge of group/form-field/own prop, plus a blanket opacity class on the whole label` | `native disabled + disabled:cursor-not-allowed disabled:opacity-50 on the Item` | `native ?disabled, PLUS transitions explicitly suppressed around the disabled boundary, PLUS disabled siblings are skipped by arrow-key navigation` |
| 11 | `behavior.readonly` | behavior | switchable | `implemented in JS at BOTH item and group level and merged, NOT relying on the (spec-inert) native readonly attribute; own JSDoc recommends group-level readOnly over item-level` | **off** | **off** |
| 12 | `behavior.label-click-target` | behavior | switchable | `the WHOLE label — dot and text both toggle it` | `only the dot/button itself; extending the target requires the consumer's OWN separate <Label htmlFor>` | `the dot itself, PLUS an explicit redirect from any ancestor <label> click a consumer supplies` |
| 13 | `behavior.form-participation` | behavior | switchable | `native — the input IS the real form control` | `[R] a hidden native bubble input, per the linked Radix docs` | `a full form-associated custom element delegating validity to a radio-SPECIFIC, group-aware validator` |
| 14 | `behavior.validation` | behavior | switchable | `computed PER ITEM and suppressed when THAT item is disabled` | `a bare boolean the consumer sets directly, per-item` | **off** |
| 15 | `prop.selection-shape` | prop | locked | `group-value` | `group-value` | `item-checked` |
| 16 | `prop.disabled` | prop | locked | `False, True` | `False, True` | `False, True` |
| 17 | `prop.group-disabled` | prop | switchable | `False, True` | `False, True` | **off** |
| 18 | `prop.read-only` | prop | switchable | `False, True` | **off** | **off** |
| 19 | `prop.group-read-only` | prop | switchable | `False, True` | **off** | **off** |
| 20 | `prop.required` | prop | switchable | `False, True` | `False, True` | `False, True` |
| 21 | `prop.validation` | prop | switchable | `off, error, warning` | `off, error` | **off** |
| 22 | `slot.label` | slot | switchable | `label?: ReactNode, rendered as the LAST child inside the component's own <label>` | **off** | **off** |
| 23 | `slot.composes` | slot | default | `True` | `True` | `True` |
| 24 | `state.rest` | state | locked | `neutral gray-500 outline on a white/near-black container fill, never filled solid` | `a border-input 1px border, NO background of any kind in either mode` | `no container styling of any kind — the visible ring is the dot's own outer masked circle at on-surface-variant` |
| 25 | `state.checked` | state | locked | `the fill NEVER changes — only the border recolours to accent AND a solid inner circle glyph appears` | `THE ITEM CONTAINER ITSELF NEVER CHANGES AT ALL — the entire checked signal is whether the Indicator (and its dot) is present in the DOM` | `the outer ring's fill moves on-surface-variant -> primary AND the inner circle animates in (opacity 0->1, 300ms scale-grow)` |
| 26 | `state.hover` | state | switchable | `item border+icon colour move to the -hover variant, keyed off the item's own :hover` | **off** | `the icon's fill recolours (unselected: on-surface); the item container shows nothing, having no drawable surface of its own` |
| 27 | `state.focus` | state | switchable | `2px dotted accent-stronger outline at 1px offset, plus the hover recolour riding along` | `the established translucent 3px ring-ring/50 box-shadow plus a border recolour, on the item itself` | `the icon recolours to the SAME value as hover, plus a 12%-opacity state layer and a separate 44x44 md-focus-ring not reproduced here` |
| 28 | `state.pressed` | state | switchable | **off** | **off** | `the icon recolours to the SAME value as hover/focus (M3 does not differentiate icon colour among the three interaction states), plus a 12%-opacity ripple` |
| 29 | `state.disabled` | state | locked | `blanket opacity 0.4 on the whole label, plus not-allowed cursor` | `opacity 0.5, cursor not-allowed` | `0.38 opacity on the icon only, IDENTICAL for both selected and unselected — a real contrast to switch's own asymmetric finding` |
| 30 | `state.readonly` | state | switchable | `border recolours to a dedicated readonly token AND switches to a dashed style; the glyph itself swaps to a lighter donut-ring svg` | **off** | **off** |
| 31 | `style.group.gap` | style | switchable | ⟡ `group-gap` | `12px` | **off** |
| 32 | `style.item.size` | style | default | `width: var(--item-size); height: var(--item-size)` | `width: 16px; height: 16px` | `width: 20px; height: 20px` |
| 33 | `style.item.shape` | style | switchable | `50%` | `9999px` | **off** |
| 34 | `style.item.border-width` | style | switchable | `1px` | `1px` | **off** |
| 35 | `style.item.rest` | style | switchable | `border-color: var(--neutral); background-color: var(--box-bg); color: var(--neutral-fg)` | `border-color: var(--input-border); box-shadow: 0 1px 2px 0 var(--shadow-color)` | **off** |
| 36 | `style.item.checked` | style | switchable | `border-color: var(--accent); color: var(--accent)` | **off** | **off** |
| 37 | `style.item.hover` | style | switchable | `border-color: var(--accent); color: var(--accent)` | **off** | **off** |
| 38 | `style.item.focus` | style | switchable | `outline: 2px dotted var(--focus-outline); outline-offset: 1px` | `border-color: var(--ring); box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 1px 2px 0 var(--shadow-color)` | **off** |
| 39 | `style.item.pressed` | style | switchable | **off** | **off** | **off** |
| 40 | `style.item.disabled` | style | switchable | `opacity: 0.4; cursor: not-allowed` | `opacity: 0.5; cursor: not-allowed` | **off** |
| 41 | `style.item.readonly` | style | switchable | `border-color: var(--neutral); border-style: dashed; color: var(--text-fg)` | **off** | **off** |
| 42 | `style.item.validation` | style | switchable | `border-color: var(--error); color: var(--error)` | `border-color: var(--destructive); box-shadow: 0 0 0 3px color-mix(in oklab, var(--destructive) var(--ring-alpha-error), transparent)` | **off** |
| 43 | `style.item.validation@warning` | style | switchable | `border-color: var(--warning); color: var(--warning)` | **off** | **off** |
| 44 | `style.item.transition` | style | switchable | **off** | `color, box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)` | **off** |
| 45 | `style.item.gap` | style | switchable | ⟡ `item-gap` | **off** | **off** |
| 46 | `style.dot.size` | style | switchable | `100%` | `8px` | **off** |
| 47 | `style.dot.fill` | style | switchable | **off** | `var(--primary)` | `var(--on-surface-variant)` |
| 48 | `style.dot.fill@checked` | style | switchable | **off** | **off** | `var(--primary)` |
| 49 | `style.dot.hover` | style | switchable | **off** | **off** | `var(--on-surface)` |
| 50 | `style.dot.disabled` | style | switchable | **off** | **off** | `fill: var(--on-surface); opacity: 0.38` |
| 51 | `style.dot.inner-grow@checked` | style | switchable | **off** | **off** | `animation: inner-circle-grow 300ms cubic-bezier(0.3, 0, 0, 1); opacity: 1` |
| 52 | `style.root.cursor` | style | default | `pointer` | **off** | `pointer` |
| 53 | `style.root.font` | style | default | `font-size: var(--type-fontSize); line-height: var(--type-lineHeight); font-family: var(--type-fontFamily); font-weight: var(--type-fontWeight); color: var(--text-fg)` | **off** | **off** |
| 54 | `style.state-layer` | style | switchable | **off** | **off** | `size: 40px` |

<details><summary>Citations — 157 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.group` | salt | RadioButtonGroup.tsx returns <fieldset role="radiogroup" aria-readonly={readOnly} ...>, providing RadioGroupContext to children |
| `structure.group` | shadcn | [R] — RadioGroupPrimitive.Root, documented as role="radiogroup" per the linked Radix docs; not independently confirmable without primitives/ cloned |
| `structure.group` | m3 | see no-group-no-radiogroup-role; selection sharing via SingleSelectionController querying the root node for shared [name] |
| `structure.shell` | salt | RadioButton.tsx returns <label className=saltRadioButton>{input}{RadioButtonIcon}{label}</label> — one real <label>, matching Checkbox.tsx's own shape exactly |
| `structure.shell` | shadcn | [R] — the rendered Item owns no label; radio-group-demo.tsx pairs it with a separate <Label htmlFor> |
| `structure.shell` | m3 | radio.ts render() has no label anywhere in the shadow DOM |
| `structure.native-input` | salt | RadioButton.tsx <input type="radio" className={withBaseName("input")} ... /> — a real native input, opacity:0, position:absolute (RadioButton.css) |
| `structure.native-input` | shadcn | [R] — Radix's published API documents the Item as a <button role="radio">, not a native input; not independently confirmable without primitives/ cloned. This chassis renders a real native input anyway, the same declared union checkbox.tsx's/switch.tsx's own chassis already made |
| `structure.native-input` | m3 | CONFIRMED ABSENCE — see no-native-input-first-divergence-from-own-pattern |
| `structure.dot` | salt | RadioButtonIcon.tsx: {checked && !readOnly && <solid filled-circle svg>} {checked && readOnly && <lighter donut-ring svg>} — the identical readOnly-glyph-swap mechanism CheckboxIcon.tsx/Switch's icon already used |
| `structure.dot` | shadcn | RadioGroupPrimitive.Indicator wraps one lucide CircleIcon (fill-primary, size-2), the only child of the Item; [R] the exact mount condition (presumed checked-only) per the general Radix Indicator convention this pipeline's own checkbox.shadcn.json column already used |
| `structure.dot` | m3 | see dual-circle-geometry |
| `behavior.role` | salt | RadioButton.tsx — no role prop written; the native input type supplies it for free, the same free-role mechanism checkbox's own column used |
| `behavior.role` | shadcn | not independently confirmable without primitives/ cloned |
| `behavior.role` | m3 | radio.ts constructor |
| `behavior.group-role` | salt | RadioButtonGroup.tsx <fieldset role="radiogroup" aria-readonly={readOnly} ...> |
| `behavior.group-role` | m3 | CONFIRMED ABSENCE — see no-group-no-radiogroup-role |
| `behavior.keyboard-select` | salt | accessibility.mdx: "If the focused radio button isn't checked, Space changes the state to checked"; no onKeyDown in RadioButton.tsx |
| `behavior.keyboard-select` | m3 | radio.ts handleKeydown: if (event.key !== ' ' \|\| event.defaultPrevented) return; this.click() |
| `behavior.arrow-navigation` | salt | accessibility.mdx: "This action moves focus between the available radio button options, and simultaneously selects an option"; see no-arrow-key-js |
| `behavior.arrow-navigation` | shadcn | not independently confirmable without primitives/ cloned |
| `behavior.arrow-navigation` | m3 | see arrow-key-controller |
| `behavior.selection-model` | salt | see selection-comparison |
| `behavior.selection-model` | shadcn | [R] the sharing mechanism itself; [S] the value/onValueChange API surface, confirmed in every example file |
| `behavior.selection-model` | m3 | Radio.checked setter calls this.selectionController.handleCheckedChange(), which calls uncheckSiblings() |
| `behavior.disabled-handling` | salt | see three-way-disabled-merge; RadioButton.css .saltRadioButton-disabled { opacity: 0.4 } |
| `behavior.disabled-handling` | shadcn | radio-group.tsx cva string; radio-group-disabled.tsx confirms item-level disabled directly |
| `behavior.disabled-handling` | m3 | _radio.scss :host([disabled]) .circle { animation-duration: 0s; transition-duration: 0s }; single-selection-controller.ts skips hasAttribute('disabled') siblings |
| `behavior.readonly` | salt | RadioButton.tsx handleChange: `if (readOnly) return`; see readonly-caveat |
| `behavior.readonly` | shadcn | CONFIRMED ABSENCE — no readOnly/readonly/aria-readonly reference anywhere in radio-group.tsx or any example file |
| `behavior.readonly` | m3 | CONFIRMED ABSENCE — no readonly-* token in either edition, no readOnly property in radio.ts |
| `behavior.label-click-target` | salt | native <label> semantics, since structure.shell=label-wrap |
| `behavior.label-click-target` | shadcn | radio-group-demo.tsx, field-radio.tsx |
| `behavior.label-click-target` | m3 | radio.ts handleClick: if (isActivationClick(event)) { this.focus() } |
| `behavior.form-participation` | salt | a real <input type="radio" name=... value=... checked=.../>, no custom validity machinery needed |
| `behavior.form-participation` | shadcn | not independently confirmable without primitives/ cloned |
| `behavior.form-participation` | m3 | see radio-specific-validator |
| `behavior.validation` | salt | RadioButton.tsx `const validationStatus = !disabled ? (radioGroup?.validationStatus ?? formFieldValidationStatus ?? validationStatusProp) : undefined` |
| `behavior.validation` | shadcn | radio-group-invalid.tsx passes a literal aria-invalid prop with no computed suppression logic visible in this clone |
| `behavior.validation` | m3 | CONFIRMED ABSENCE — see no-warning-no-error-family |
| `prop.selection-shape` | salt | RadioButtonGroupProps.value: string, RadioButtonProps.value: string — see prop.selection-shape's row note |
| `prop.selection-shape` | shadcn | radio-group-demo.tsx: <RadioGroup defaultValue="comfortable"><RadioGroupItem value="default".../>...</RadioGroup> — a group-level string compared against each item's own value |
| `prop.selection-shape` | m3 | @property({type:Boolean}) checked (getter/setter pair); @property() value = 'on', used ONLY for form submission, never cross-item comparison |
| `prop.disabled` | salt | RadioButtonProps.disabled?: boolean, merged with the group's |
| `prop.disabled` | shadcn | native disabled, confirmed directly in radio-group-disabled.tsx: <RadioGroupItem value="option1" disabled /> |
| `prop.disabled` | m3 | @property({type:Boolean}) disabled, inherited LitElement convention (mixinFocusable) |
| `prop.group-disabled` | salt | RadioButtonGroupProps.disabled?: boolean |
| `prop.group-disabled` | shadcn | [R] — see no-group-disabled-confirmed |
| `prop.group-disabled` | m3 | CONFIRMED ABSENCE — no group entity exists to hold a group-level prop, see structure.group |
| `prop.read-only` | salt | RadioButtonProps.readOnly?: boolean |
| `prop.read-only` | shadcn | CONFIRMED ABSENCE |
| `prop.read-only` | m3 | CONFIRMED ABSENCE |
| `prop.group-read-only` | salt | RadioButtonGroupProps.readOnly?: boolean |
| `prop.group-read-only` | shadcn | CONFIRMED ABSENCE — no readOnly concept anywhere in this clone |
| `prop.group-read-only` | m3 | CONFIRMED ABSENCE — no group entity |
| `prop.required` | salt | reachable only via inputProps.required (RadioButtonProps has no top-level required field), see required-implicit |
| `prop.required` | shadcn | [R] — Radix's published API includes required on the Root; not independently confirmable without primitives/ cloned |
| `prop.required` | m3 | @property({type:Boolean}) required = false — see required-is-group-scoped |
| `prop.validation` | salt | RadioButtonProps.validationStatus?: AdornmentValidationStatus, undefined/off by default (SOURCE-DEFAULT-FIRST) |
| `prop.validation` | shadcn | aria-invalid is a bare boolean (SOURCE-DEFAULT-FIRST, off/undefined by default), confirmed in radio-group-invalid.tsx; no warning concept exists |
| `prop.validation` | m3 | CONFIRMED ABSENCE — see no-warning-no-error-family |
| `slot.label` | salt | RadioButton.tsx |
| `slot.label` | shadcn | CONFIRMED ABSENCE — no label text owned; always external (see slot.composes) |
| `slot.label` | m3 | CONFIRMED ABSENCE — no label text owned; always external, see behavior.label-click-target |
| `slot.composes` | salt | form-field (useFormFieldProps() pulls aria-describedby/aria-labelledby down from an ancestor <FormField> when NOT inside a RadioButtonGroup), switch/checkbox/dropdown/combo-box (the four explicitly-excluded siblings, usage.mdx) |
| `slot.composes` | shadcn | label (id/htmlFor, radio-group-demo.tsx), field (FieldSet/FieldLegend/FieldDescription/FieldLabel, field-radio.tsx/radio-group-description.tsx/radio-group-invalid.tsx/radio-group-choice-card.tsx) |
| `slot.composes` | m3 | an external, consumer-authored <label> (behavior.label-click-target); checkbox/switch are the explicitly separate canonical rows |
| `state.rest` | salt | an outline-style item at EVERY state, including checked — see state.checked |
| `state.rest` | shadcn | unlike checkbox's own item, which had a dark-mode-only translucent fill — radio's item has none in EITHER mode |
| `state.rest` | m3 | see no-border-no-background-on-container |
| `state.checked` | salt | matches checkbox's own outline-stays-outline pattern |
| `state.checked` | shadcn | see no-item-state-classes; the sharpest split this registry has found on this row |
| `state.checked` | m3 | see checked-animation |
| `state.hover` | salt | RadioButtonIcon.css .saltRadioButton:hover .saltRadioButtonIcon { border-color: selectable-borderColor-hover; color: selectable-foreground-hover } |
| `state.hover` | shadcn | CONFIRMED ABSENCE — see no-hover-no-pressed |
| `state.hover` | m3 | the most extreme version yet of the 'feedback lives on the glyph, not the container' finding switch's own track already showed |
| `state.focus` | salt | RadioButton.css .saltRadioButton-input:focus-visible + .saltRadioButtonIcon |
| `state.focus` | shadcn | focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 |
| `state.focus` | m3 | see colour-tokens-are-interaction-invariant-by-magnitude-not-existence |
| `state.pressed` | salt | CONFIRMED ABSENCE — see no-pressed-state |
| `state.pressed` | shadcn | CONFIRMED ABSENCE — see no-hover-no-pressed |
| `state.pressed` | m3 | see colour-tokens-are-interaction-invariant-by-magnitude-not-existence |
| `state.disabled` | salt | RadioButton.css .saltRadioButton-disabled { opacity: 0.4; cursor: var(--salt-cursor-disabled) } |
| `state.disabled` | shadcn | disabled:cursor-not-allowed disabled:opacity-50 |
| `state.disabled` | m3 | see disabled-opacities-selection-invariant |
| `state.readonly` | salt | RadioButtonIcon.css .saltRadioButtonIcon-readOnly { border-color: selectable-borderColor-readonly; border-style: dashed } |
| `state.readonly` | shadcn | CONFIRMED ABSENCE — no readonly concept exists |
| `state.readonly` | m3 | no readonly concept |
| `style.group.gap` | shadcn | RadioGroup className: grid gap-3 — see root-gap |
| `style.group.gap` | m3 | no group element to apply a gap to — see structure.group |
| `style.item.size` | salt | aliases the item-size density slot for both dimensions |
| `style.item.size` | shadcn | class size-4 = 1rem = 16px |
| `style.item.size` | m3 | icon-size: 20px, hardcoded literal, both editions — see icon-container-tokens |
| `style.item.shape` | salt | RadioButtonIcon.css border-radius: 50% — a plain literal, see shape-is-a-literal-not-a-density-token |
| `style.item.shape` | shadcn | class rounded-full |
| `style.item.shape` | m3 | CONFIRMED ABSENCE — see no-border-no-background-on-container; the item draws no shape-bearing box at all |
| `style.item.border-width` | salt | RadioButtonIcon.css border: var(--salt-size-fixed-100) solid ... = 1px, FIXED scale |
| `style.item.border-width` | shadcn | bare border utility, undeclared width, Tailwind's own default — the same unvendored-Tailwind caveat every prior shadcn column has recorded |
| `style.item.border-width` | m3 | CONFIRMED ABSENCE — see no-border-no-background-on-container; the ring is a masked filled circle, not a stroked border |
| `style.item.rest` | salt | RadioButtonIcon.css .saltRadioButtonIcon { border-color: selectable-borderColor; background: container-primary-background; color: selectable-foreground } |
| `style.item.rest` | shadcn | border border-input shadow-xs, no bg-* class at all — see state.rest |
| `style.item.rest` | m3 | see no-border-no-background-on-container; every visible pixel at rest comes from style.dot.fill instead |
| `style.item.checked` | salt | RadioButtonIcon.css .saltRadioButtonIcon-checked { border-color: selectable-borderColor-selected; color: selectable-foreground-selected } — no background rule, box-bg UNCHANGED from rest |
| `style.item.checked` | shadcn | CONFIRMED ABSENCE — see no-item-state-classes; the item container never changes on check |
| `style.item.checked` | m3 | the item draws nothing; everything M3 changes on check happens on the dot — see style.dot.fill@checked / style.dot.inner-grow@checked |
| `style.item.hover` | salt | RadioButtonIcon.css .saltRadioButton:hover .saltRadioButtonIcon — resolves to the SAME accent slot as -checked |
| `style.item.hover` | shadcn | CONFIRMED ABSENCE |
| `style.item.hover` | m3 | the item draws nothing; M3's real hover feedback lives on style.dot.hover |
| `style.item.focus` | salt | RadioButton.css .saltRadioButton-input:focus-visible + .saltRadioButtonIcon { outline: var(--saltRadioButton-outline, var(--salt-focused-outline)); outline-offset: var(--salt-spacing-fixed-100) } = 1px |
| `style.item.focus` | shadcn | focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 — the shadow-xs layer repeated after the ring, the same Tailwind v4 layering checkbox.shadcn.json already established |
| `style.item.focus` | m3 | the item draws nothing; M3's real focus feedback lives on style.dot.hover (reused) plus the separate, not-reproduced md-focus-ring |
| `style.item.pressed` | salt | CONFIRMED ABSENCE |
| `style.item.pressed` | shadcn | CONFIRMED ABSENCE |
| `style.item.pressed` | m3 | the item draws nothing; M3's real pressed feedback lives on style.dot.hover (reused) |
| `style.item.disabled` | salt | RadioButton.css .saltRadioButton-disabled { opacity: 0.4; cursor: var(--salt-cursor-disabled) } |
| `style.item.disabled` | shadcn | disabled:cursor-not-allowed disabled:opacity-50 |
| `style.item.disabled` | m3 | M3's disabled dimming happens on the icon (style.dot.disabled), never the item container |
| `style.item.readonly` | salt | RadioButtonIcon.css .saltRadioButtonIcon-readOnly { border-color: selectable-borderColor-readonly; border-style: dashed; color: content-primary-foreground } |
| `style.item.readonly` | shadcn | no readonly concept |
| `style.item.readonly` | m3 | no readonly concept |
| `style.item.validation` | salt | RadioButtonIcon.css .saltRadioButtonIcon-error { color: status-error-foreground-decorative; border-color: status-error-borderColor } |
| `style.item.validation` | shadcn | aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 — a PERMANENT ring, not gated on focus |
| `style.item.validation` | m3 | CONFIRMED ABSENCE — see no-warning-no-error-family |
| `style.item.validation@warning` | salt | RadioButtonIcon.css .saltRadioButtonIcon-warning { color: status-warning-foreground-decorative; border-color: status-warning-borderColor } |
| `style.item.validation@warning` | shadcn | CONFIRMED ABSENCE — aria-invalid is error-only |
| `style.item.validation@warning` | m3 | CONFIRMED ABSENCE |
| `style.item.transition` | salt | CONFIRMED ABSENCE — see no-transition |
| `style.item.transition` | shadcn | class transition-[color,box-shadow]; timing is Tailwind's own default [R], the same unvendored-Tailwind caveat every prior shadcn column has recorded |
| `style.item.transition` | m3 | the item draws nothing to transition; M3's own fill/opacity transitions live on the dot's two circles instead — see style.dot.inner-grow@checked |
| `style.item.gap` | shadcn | no owned label to put a gap before — see slot.composes |
| `style.item.gap` | m3 | no owned label to put a gap before — see slot.composes |
| `style.dot.size` | salt | Icon component default --saltIcon-size: 100% — fills whatever item it sits in |
| `style.dot.size` | shadcn | CircleIcon wrapped size-2 = 0.5rem = 8px, inside a 16px item |
| `style.dot.size` | m3 | the dot's two <circle>s are sized entirely by fixed SVG attributes in markup (r=10 / r=5 inside a 20x20 viewBox), not a themed CSS row — see icon-container-tokens |
| `style.dot.fill` | salt | the glyph's fill="currentColor" is a literal in markup, inheriting the item's own color property — no separate CSS row needed |
| `style.dot.fill` | shadcn | CircleIcon's own fill-primary class — a LITERAL, always-primary colour, not inherited and never overridden by any interaction state |
| `style.dot.fill` | m3 | unselected-icon-color: on-surface-variant, the REST baseline shared by both circles via the parent .icon element's own fill property |
| `style.dot.fill@checked` | salt | see style.dot.fill — colour already tracks style.item.checked's own color property via currentColor |
| `style.dot.fill@checked` | shadcn | the dot has no unchecked counterpart to compare against — the Indicator only mounts when checked, so there is nothing for an @checked variant to override |
| `style.dot.fill@checked` | m3 | selected-icon-color: primary, overriding the unselected baseline the instant .checked applies |
| `style.dot.hover` | salt | already carried by style.item.hover's color, which the dot inherits via currentColor |
| `style.dot.hover` | shadcn | CONFIRMED ABSENCE — the dot's fixed fill-primary literal never changes on any interaction |
| `style.dot.hover` | m3 | hover-icon-color (unselected): on-surface — REUSED for focus and pressed too, see colour-tokens-are-interaction-invariant-by-magnitude-not-existence; the selected-hover/-focus/-pressed variant (primary) is recorded here in provenance but not separately expressed, the same declared approximation switch's own style.thumb.hover row already made |
| `style.dot.disabled` | salt | Salt dims the whole item uniformly instead — see style.item.disabled |
| `style.dot.disabled` | shadcn | shadcn dims the whole item uniformly instead — see style.item.disabled |
| `style.dot.disabled` | m3 | disabled-unselected-icon-color: on-surface, disabled-unselected-icon-opacity: 0.38 — IDENTICAL for the selected case too, see disabled-opacities-selection-invariant, so this one cell covers both |
| `style.dot.inner-grow@checked` | salt | structure.dot=conditional-glyph renders no inner/outer circle pair |
| `style.dot.inner-grow@checked` | shadcn | structure.dot=single-glyph renders no inner/outer circle pair |
| `style.dot.inner-grow@checked` | m3 | see checked-animation — easing-emphasized-decelerate resolves to cubic-bezier(0.3, 0, 0, 1) per tokens/versions/v0_192/_md-sys-motion.scss, the same curve family checkbox.m3.json's own style.box.transition row already cited |
| `style.root.cursor` | salt | RadioButton.css .saltRadioButton { cursor: var(--salt-cursor-hover) } = pointer |
| `style.root.cursor` | shadcn | CONFIRMED ABSENCE — no cursor-pointer class at rest; only disabled:cursor-not-allowed exists |
| `style.root.cursor` | m3 | :host { cursor: pointer } PLUS :host([disabled]) { cursor: default } — see state-layer-and-cursor |
| `style.root.font` | salt | RadioButton.css .saltRadioButton { font-size/line-height/font-family/font-weight: var(--salt-text-*) } — the BODY role, REGULAR (400) |
| `style.root.font` | shadcn | no owned label text |
| `style.root.font` | m3 | no owned label text |
| `style.state-layer` | salt | CONFIRMED ABSENCE — Salt has no ripple/state-layer concept for radio; hover and focus recolour the item/icon directly |
| `style.state-layer` | m3 | documented, not rendered as its own element — see state-layer-and-cursor |

</details>

<!-- END GENERATED VALUES -->
