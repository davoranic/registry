# Switch — component template matrix

*Fifteenth live component in the post-clean-slate pipeline (button, calendar,
spinner, tooltip, alert, input, select, dialog, tabs, card, badge, progress,
chip, checkbox came before). Same method as
[CHECKBOX-MATRIX.md](CHECKBOX-MATRIX.md): one master template (union of all
six pieces across systems), columns per design system, rows switched
on/off/inherited per column.*

**Cell legend** · `⟡ slot` = alias to shared contract slot · **bold** = the
system's own switch · `off` = row switched off in this column · `[S]` = value
extracted from source this session · `[R]` = not directly sourced (reason
always given).

**Row policies** · 🔒 locked-on (no column may switch it off) ·
⚪ switchable (on where the system has it) · ⬜ on-with-default.

**Naming rule** — grammar `<piece>.<part>[.<subpart>].<property>[@state]`,
enforced by `contract/template.schema.json`'s `row.id` pattern.

**53 rows in all**: 4 structure, 6 behavior, 6 prop, 2 slot, 7 state, 28 style.

**The headline of this matrix — switch and checkbox are siblings, but switch
is the SIMPLER of the two (no third state) and the RICHER of the two (per-part,
per-selection-state disabled opacities; a thumb that changes SIZE on toggle;
a keyboard story that genuinely differs by system for the first time in this
pipeline). Read CHECKBOX-MATRIX.md's findings 10 and 11 before touching this
component's selectors — they describe the exact class of defect (a DOM-shape
assumption baked into a combinator, silently killing seven CSS rules, caught
by no gate) this matrix's chassis was designed from the ground up to be
immune to.**

---

## Scope note

### Claiming the row

`1-intro/content/04-component-map.md`'s Forms & inputs section, line 48:
`| switch | ✓ | ✓ | ✓ |` — present, unqualified, in all three. No naming
disagreement to resolve.

### In scope

The two-state control itself (off/on), its track and thumb, disabled and
read-only handling (Salt only), the `size` axis (shadcn only), the `icons`
axis (M3 only), and the keyboard-activation fork this component is the first
in the pipeline to genuinely need (Salt Space-only, M3 Space+Enter,
shadcn approximated as Space-only — see behavior.keyboard-activation).

### Out of scope, and why (structural reasons, declared not dropped)

| excluded | where | structural reason |
|---|---|---|
| `label` | 04-component-map.md, its own row, unbuilt | Identical boundary to checkbox: Salt owns a `label` slot; shadcn and M3 own none — the label a consumer sees always belongs to a SEPARATE component associated by `id`/`htmlFor`. Composing with it is declared (`slot.composes`), building it is not this row's job. |
| `field` (label+control+help wrapper) | 04-component-map.md, its own row, unbuilt | shadcn's `Field`/`FieldContent`/`FieldLabel`/`FieldDescription` (`field-switch.tsx`) and Salt's `useFormFieldProps()` both delegate description text and container styling to this row. Declared composition, not modelled here. |
| `checkbox` | 04-component-map.md, its own row, ALREADY BUILT | Switch's own `usage.mdx` draws the line: *"To present a list of independent options where the user can select any number of choices. Instead, use Checkbox"* [S]. |
| `radio-group` | 04-component-map.md, its own row, unbuilt | *"To make a single selection between mutually exclusive choices between two or more options. Instead, use RadioButton"* [S]. |
| `toggle-button` | 04-component-map.md, its own row, unbuilt | *"To toggle between two (or more) opposing yet mutually exclusive states or options with visual priority. Instead, use ToggleButton"* [S] — a THIRD declared sibling checkbox's own scope note did not need, since checkbox's usage.mdx draws only two lines where switch's draws three. |
| M3's separate `md-focus-ring` element | `switch/internal/switch.ts` render() | The identical shared cross-component focus-ring primitive checkbox's own scope note already excluded, for the identical reason. |
| M3's `.handle-container` wrapper (a real, independently-transitioned element) | `switch/internal/_handle.scss` | Real, sourced, and NOT modelled as its own chassis element — collapsed onto the thumb itself, see `provenance.handle-slide-mechanism` and "Declared approximations". |
| M3's `showOnlySelectedIcon` sub-property | `switch/internal/switch.ts` | A single related boolean with no cross-system counterpart; recorded in `prop.icons`'s note, not given its own row. |

---

## Sources

- **Salt** [S]: `packages/core/src/switch/{Switch.tsx,Switch.css,index.ts}` —
  the whole component, three files, read in full.
  `packages/core/stories/switch/{switch.stories.tsx,switch.qa.stories.tsx}`;
  `site/docs/components/switch/{index,usage,accessibility,examples}.mdx`;
  `site/src/examples/switch/{Default,DefaultChecked,Disabled,DisabledChecked,Readonly,LeftAlignedLabel}.tsx`.
  Resolution through `packages/theme/css/next/characteristics/{selectable,content,focused}.css`,
  `next/palette/{neutral,accent,background,corner}.css`, `next/foundations/color.css`,
  `packages/theme/css/foundations/{size,spacing,curve,cursor,borderStyle,zindex}.css`.
- **shadcn** [S]: `apps/v4/registry/new-york-v4/ui/switch.tsx` — a Root
  (styled directly as the track) plus a Thumb child, two literal className
  strings, canonical. Token values from `apps/v4/app/globals.css`.
  `switch-demo.tsx`, `field-switch.tsx` for the label/field boundary. Read
  only to fix structural boundaries (NOT canonical):
  `apps/v4/registry/bases/{radix,base,aria}/ui/switch.tsx` (the radix base
  variant moves the identical Root+Thumb+`size` shape behind `cn-switch`
  class tokens — same conclusions, no extra capability) and
  `apps/v4/content/docs/components/radix/switch.mdx`, which links to but does
  not itself document Radix's internal element. **primitives/ was NOT
  cloned**, per the project's standing rule. Every cell depending on Radix's
  internal element/ARIA wiring is `[R]`, citing
  https://www.radix-ui.com/docs/primitives/components/switch.
- **Material 3** [S]: `switch/internal/switch.ts` (the real Lit component,
  251 lines — `render()`, `handleInput`/`handleChange`, the keyboard-Enter
  addition, form-association mixins — re-confirming, not assuming,
  CHECKBOX-MATRIX.md's finding that this clone is not tokens-only),
  `switch/internal/{_switch.scss,_track.scss,_handle.scss,_icon.scss}` (four
  files, read in full), `switch/switch.ts` (the `<md-switch>` registration),
  `switch/internal/switch_test.ts` (the label-activation and form-submission
  proofs). Tokens: `tokens/versions/v0_192/_md-comp-switch.scss` (the pinned
  edition) and `tokens/versions/latest/sass/_md-comp-switch.scss` (edition
  diff only — see below, a genuinely large one). Colour/shape/state
  resolution through `tokens/versions/v0_192/{_md-sys-color.scss,_md-sys-shape.scss,_md-sys-state.scss}`.

### Edition pin — `v0.192`, per standing owner decision, not relitigated, but flagged LOUDLY this time

Every prior component's edition diff has been a small addition (a
`focus-indicator-*` family, mostly). Switch's is not. `latest`'s
`_md-comp-switch.scss` is a WHOLESALE REDESIGN: the token function is
replaced by a flat file of individually `@deprecated`-annotated Sass
variables, several CORE VALUES change (the deprecated flat `$handle-height`/
`$handle-width` become 20px, replacing the 16px/24px unselected/selected
split this whole column's thumb-growth finding depends on), and a new
`focus-indicator-*` family appears that v0.192 lacks entirely. **This is the
largest edition delta this registry has found in any component so far.**
Pinning v0.192 here is not a minor conservatism — it is the difference
between the CURRENT documented Material 3 switch and a design Google has
since deprecated in its own token source. Flagged for the owner; not
relitigated per standing policy.

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **element/shell** | 🔒 (config) | **`label-wrap`** — one real `<label>` wrapping input, track, and label text, byte-identical shape to Checkbox.tsx [S] | **`unwrapped`** [R] — no owned label; paired with a separate `<Label htmlFor>` | **`unwrapped`** [S] — no label anywhere in the shadow DOM |
| native input | ⚪ (info) | **on** — a REAL `<input type="checkbox" role="switch">`, opacity 0 [S] | **on** [R] — Radix's Root is documented as a `<button role="switch">`, not a native input at all; this chassis renders a real input anyway (declared union, same shape checkbox's chassis used) | **on** [S] — `<input type="checkbox" role="switch">`, SIBLING of the track, not its parent |
| **track** | ⚪ (info) | **on** — a real, separate `<span className="track">` wrapping the thumb [S] | **off** — CONFIRMED ABSENCE, the Root IS the track (no separate element); the chassis renders one anyway for cross-system selector uniformity [S] | **on** — a real, separate `<span class="track">` wrapping the handle-container [S] |
| **icon** | 🔒 (config) | **`conditional-checkmark`** — appears ONLY when checked (and swaps to a lighter glyph when read-only), the identical mechanism CheckboxIcon.tsx used [S] | **`none`** — CONFIRMED ABSENCE, the Thumb renders no children of any kind [S] | **`optional-pair`** — an on/off icon pair exists but is OPT-IN (`icons`/`showOnlySelectedIcon`, both default `false`) — at M3's own default, like shadcn, NO icon renders [S] |

## 2 · Behavior

**Every row below is implemented in `skeleton/switch.tsx` and asserted by
`gates/check-switch-behavior.mjs`.** Six rows, two locked-info, one
locked-config.

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **role** | 🔒 | **explicit** `role="switch"` on the native input (never free, unlike checkbox — there is no native HTML switch input type) [S] | **[R]** `role="switch"` on a `<button>`, `aria-checked` JS-maintained | **explicit** `role="switch"` on the native input, `aria-checked` free once applied [S] |
| **keyboard activation** | 🔒 (config: `enterActivates`) | **Space only** (native) [S] | **Space only** in this chassis (declared simplification — real Radix's button-based Root plausibly answers Enter too, not fabricated here) [R] | **Space (native) PLUS Enter EXPLICITLY ADDED**, citing the APG switch pattern directly in a source comment — the headline divergence from checkbox [S] |
| label click target | ⚪ | **the WHOLE label** [S] | **the track only** — consumer's own `<Label htmlFor>` extends it [S/R] | **the track, PLUS an explicit redirect** from any ancestor `<label>`, identical mechanism to checkbox's M3 column [S] |
| **disabled handling** | 🔒 | native `disabled`, blanket opacity [S] | native `disabled`, opacity class [S] | native `?disabled`, PLUS transition suppression around the boundary [S] |
| readonly | ⚪ | **on** — implemented in JS, identical mechanism to Checkbox [S] | off — CONFIRMED ABSENCE | off — CONFIRMED ABSENCE |
| form participation | ⚪ | native — the input IS the real form control [S] | **[R]** a hidden native bubble input | **a full form-associated custom element, REUSING checkbox's own `CheckboxValidator` class verbatim** [S] |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **`checked` shape** | 🔒 | **`boolean`** — no indeterminate field anywhere [S] | **`boolean`** — no `"indeterminate"` union member, unlike checkbox's [R] | **`boolean`** — `@property selected`, no indeterminate property [S] |
| `disabled` | 🔒 | **`[false, true]`** [S] | **`[false, true]`** [S] | **`[false, true]`** [S] |
| `readOnly` | ⚪ | **`[false, true]`** [S] | off | off |
| `required` | ⚪ | **`[false, true]`**, reachable only via `inputProps.required` [S] | **`[false, true]`** [R] | **`[false, true]`**, first-class, wired to `CheckboxValidator` [S] |
| `size` | ⚪ | off — density plays the equivalent role, a different mechanism | **`["default", "sm"]`**, SOURCE-DEFAULT-FIRST — a genuinely NEW axis checkbox never had [S] | off — CONFIRMED ABSENCE, all dimensions are fixed literals |
| `icons` | ⚪ | off — icon visibility is driven by checked/readOnly state, not a toggle | off — CONFIRMED ABSENCE | **`[false, true]`**, SOURCE-DEFAULT-FIRST (`icons = false`) [S] |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| label | ⚪ | Salt ONLY owns this — identical mechanism to checkbox's `slot.label`. shadcn and M3: OFF, always external. |
| composes (declared) | ⬜ | **THREE declared exclusions, not checkbox's one**: `checkbox`, `radio-button`, `toggle-button` — switch's own `usage.mdx` draws three separate lines. Plus `label`/`field` for shadcn's and M3's external association. All neutral placeholders in the harness. |

## 5 · States

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| rest | 🔒 | neutral outline track, SOLID currentColor thumb | a SOLID `--input`-filled track (unlike checkbox's unfilled light-mode rest), `--background` thumb | `surface-container-highest` track, 2px `outline` border, 16px thumb |
| **checked** | 🔒 | track fill NEVER changes (checkbox's own pattern); thumb INVERTS solid→transparent, slides via `translateX(100%)` | track becomes a SOLID `primary` fill; thumb slides `translateX(calc(100%-2px))`; thumb COLOUR only changes in DARK mode | track fill→`primary`, outline REMOVED (4th sighting of fill-replaces-stroke); **thumb GROWS 16px→24px** and slides via `margin-inline-start` (not `transform`) |
| hover | ⚪ | track+thumb recolour, keyed off root `:hover` [S] | **off** — CONFIRMED ABSENCE | **track shows NO change at all** (re-verified against token VALUES); only the thumb recolours |
| focus | ⚪ | 2px dotted outline at ZERO offset (differs from checkbox's 1px) [S] | translucent 3px ring on the track/root | same track-invariant story as hover; separate `md-focus-ring` not reproduced |
| **pressed** | ⚪ | **off** — CONFIRMED ABSENCE | **off** — CONFIRMED ABSENCE | **on** — thumb balloons to 28×28px regardless of selected state, an "overshoot" cubic-bezier the source names explicitly |
| disabled | 🔒 | opacity 0.4 (flat) | opacity 0.5 (flat) | **FOUR numbers**: track 0.12 uniform; thumb 0.38 unselected but **1 (undimmed) selected** — a real asymmetry |
| readonly | ⚪ | **on** — thumb FORCED to the neutral/off look in BOTH states (checkbox's indeterminate-reset finding, switch-shaped) [S] | off | off |

## 6 · Styles — the cell matrix

All cells at each system's default: off, enabled, medium Salt density.

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| track size | ⬜ | 34×20px (density) [S] | 32×18.4px (`size=default`) [S] | 52×32px, hardcoded [S] |
| track shape | ⬜ | `corner-weak` → 8px (density) [S] | `rounded-full` = 9999px [S] | `corner-full` = 9999px [S] |
| **track border-width** | ⬜ | 1px [S] | 1px, always transparent [S] | 2px (rest); 0px (checked) [S] |
| **track background (rest)** | 🔒 | white/near-black container fill [S] | SOLID `--input` fill [S] | `surface-container-highest` [S] |
| **track background (checked)** | 🔒 | UNCHANGED — same fill-never-changes pattern as checkbox [S] | SOLID `primary` fill [S] | `primary`, outline removed [S] |
| track hover/focus/pressed | ⚪ | on (all three) [S] | focus only [S] | **off — track colour is interaction-invariant, verified directly** [S] |
| track disabled | ⚪ | off (flat root opacity instead) | off (flat root opacity instead) | **on** — 0.12, uniform [S] |
| thumb size (rest) | ⬜ | density-matched (12–18px) [S] | 16px default / 12px sm [S] | 16px [S] |
| **thumb size @checked** | ⚪ | off | off | **on — 24px, a real CSS-driven size change** [S] |
| **thumb size @pressed** | ⚪ | off | off | **on — 28px, bigger than either resting size** [S] |
| thumb shape | ⬜ | `corner-weaker` → 2px (density) [S] | `rounded-full` [S] | `corner-full` [S] |
| **thumb background (rest)** | 🔒 | `currentColor` (SOLID) [S] | `--background` [S] | `outline` [S] |
| **thumb background (checked)** | 🔒 | `transparent` — fill INVERTS [S] | `--background`/dark-mode-only override [S] | `on-primary` [S] |
| thumb position mechanism | 🔒 (info) | `transform: translateX(100%)` [S] | `transform: translateX(calc(100%-2px))` [S] | `margin-inline-start/-end`, NOT transform [S] |
| thumb hover | ⚪ | on [S] | off | on — unselected-hover value, reused for focus+pressed too (numerically identical) [S] |
| **thumb disabled (unselected)** | ⚪ | off (flat root) | off (flat root) | 0.38 opacity [S] |
| **thumb disabled (selected)** | ⚪ | off (flat root) | off (flat root) | **1.0 opacity — NOT dimmed, the asymmetry** [S] |
| thumb readonly | ⚪ | on — forced to neutral look in both states [S] | off | off |
| icon size | ⚪ | 100% (fills thumb) [S] | off — no icon | 16px — does NOT grow with the thumb [S] |
| root disabled | ⚪ | 0.4 flat opacity [S] | 0.5 flat opacity [S] | **off — per-part instead, see track/thumb.disabled** |
| root cursor | ⬜ | pointer [S] | off — CONFIRMED ABSENCE | pointer [S] |
| root gap | ⚪ | density-matched [S] | off — no owned label | off — no owned label |
| root font | ⬜ | BODY role, regular, + text colour [S] | off | off |
| state-layer geometry | ⚪ (info) | off | off | **40px circle, centred on the THUMB not the track**, documented not rendered |

---

## Declared approximations in the chassis

1. **shadcn's real Root/track fusion is split back into two elements.**
   `structure.track`'s `off` cell records the real, sourced fact — Radix's
   `SwitchPrimitive.Root` carries the track's own background/shape classes
   directly, with no separate track element at all. The chassis renders a
   track `<span>` for shadcn anyway, purely so every `style.track.*` row has
   ONE uniform selector across all three systems. The OBSERVABLE result
   (what a shadcn switch looks like) is unaffected; only the DOM node count
   differs from real Radix output.
2. **shadcn's Root is approximated as a native `<input>`, not a `<button>`.**
   The linked Radix docs describe the Root as `<button role="switch">` with
   a separate hidden bubble input for form participation — this chassis
   instead always renders one real native input, driving every interaction
   state with real CSS pseudo-classes, the identical declared union
   checkbox.tsx's own chassis note already established for the same reason
   (primitives/ not cloned; the OBSERVABLE contract is what's reproduced).
   The direct consequence: `behavior.keyboard-activation`'s `enterActivates`
   is left `false` for shadcn in this chassis rather than guessed at `true` —
   a native input has no Enter semantics of its own to inherit, and
   inventing a keydown handler for shadcn would fabricate unconfirmable
   behaviour rather than approximate a sourced one.
3. **M3's `.handle-container` wrapper (and its independent `md-ripple`
   layer) is collapsed onto the thumb element itself.** Real M3 slides a
   wrapper via `margin-inline-start/-end` with its own 300ms "overshoot"
   transition, and draws a separate 40px ripple circle inside that wrapper,
   centred on the handle. This chassis applies the margin directly to the
   thumb and does not draw the ripple circle at all (see `style.state-layer`,
   documented not rendered — the identical category of approximation
   checkbox's own `style.box.state-layer` row already made).
4. **M3's track-colour-is-interaction-invariant finding was cross-checked
   twice before being trusted**, because the first pass assumed hover/focus/
   pressed would recolour the track the way checkbox's own M3 box did on
   hover. Re-reading `_md-comp-switch.scss`'s token VALUES (not merely the
   selector NAMES — `unselected-hover-track-color` LOOKS like a real,
   distinct token until you notice it resolves to the exact same value as
   `unselected-track-color`) showed every interaction-state track colour
   equals its own rest value. `style.track.hover/.focus/.pressed` are all
   `off` for M3 as a direct, verified consequence, not an oversight.

---

## Findings from building this matrix

1. **The tri-state fork checkbox's whole matrix organised itself around
   simply does not exist here — and that absence is itself the first real
   finding.** `prop.checked-shape` is `boolean` in all three columns, with
   no indeterminate concept anywhere: Salt's `SwitchProps` has no
   `indeterminate` field, M3's `Switch` class has no `indeterminate`
   property, and shadcn/Radix's `checked` prop is a plain boolean per the
   linked docs (contrast checkbox's `boolean | "indeterminate"`). One direct
   consequence: `skeleton/switch.tsx` has NO `useLayoutEffect`, no
   ref-reading effect, and therefore no dialog-trap-shaped hazard of any
   kind to guard against — confirmed by re-reading the file, not merely
   assumed from the absence of a prop.

2. **Switch's keyboard story is the first genuinely per-system divergence
   this pipeline has found for a `locked` behaviour row.** Checkbox's
   `behavior.keyboard-activation` was Space-only in all three, uniformly.
   Switch's is not: M3's `internal/switch.ts` constructor explicitly adds
   Enter as a second activation key, with a source comment naming the APG
   switch pattern directly (`See https://www.w3.org/WAI/ARIA/apg/patterns/switch/`)
   — the first time in this whole registry that an M3 source comment has
   cited the exact same accessibility pattern this matrix independently
   cites. Salt stays checkbox-like Space-only. shadcn is left `[R]`/declared-off
   in this chassis rather than guessed — see "Declared approximations" #2.

3. **A fourth sighting of M3's fill-replaces-stroke idiom, and the clearest
   one yet.** `selected-outline-width`... no — for switch the actual token is
   `track-outline-width` overridden to `0` the instant the track becomes
   selected (`internal/_track.scss`'s absence of any `border-*` rule under
   `.selected .track::before`, contrasted with `.unselected .track::before`'s
   explicit `border-style: solid; border-width: ...`). Chip's
   `elevation@elevated`/`flat-selected` and checkbox's `selected-outline-width:
   0px` were the first three sightings; this is the fourth, and by far the
   starkest, because the CSS literally never writes a border rule for the
   selected case at all, rather than writing one that resolves to zero.

4. **M3's thumb changing SIZE on toggle is a genuinely new mechanism this
   registry has not seen in either of the two prior "outline vs fill"
   components (chip, checkbox).** `selected-handle-height`/`-width` (24px)
   vs `unselected-handle-height`/`-width` (16px) is a real, CSS-driven
   dimensional change keyed off the identical `.selected`/`.unselected`
   class pair that drives colour elsewhere — meaning M3's checked-state
   signal for switch is not colour-only or even fill-vs-stroke-only, it is
   colour AND geometry together. The icon, by deliberate contrast, does
   NOT grow (`icon-size`/`selected-icon-size` both 16px) — confirmed by
   reading both tokens side by side specifically to check whether the
   growth cascaded to the glyph too. It does not.

5. **The single most surprising finding in this matrix: M3's TRACK is
   interaction-invariant — all of switch's hover/focus/pressed feedback
   lives on the THUMB, never the track.** Documented at length in "Declared
   approximations" #4. The practical effect: this chassis's
   `style.track.hover`/`.focus`/`.pressed` rows are real, populated CSS for
   Salt and (for focus only) shadcn, but are ALL `off` for M3 — not because
   the chassis lacks the capability to express them, but because M3's own
   source, re-verified twice, genuinely has nothing there to express.

6. **M3's disabled-selected thumb opacity is `1` — not dimmed at all —
   while disabled-unselected is `0.38`, a real, deliberate asymmetry this
   registry has not found in either prior "outline vs fill" component.**
   Checkbox's own disabled treatment used ONE flat number per system, no
   asymmetry. Re-checked twice against the raw token value in
   `_md-comp-switch.scss` because `disabled-selected-handle-opacity: 1`
   reads, at a glance, like it should be a typo for some `0.1`-something
   value; it is not. The design intent this asymmetry likely encodes (a
   disabled-but-ON switch should still visibly communicate its ON state,
   where a disabled-but-OFF one is allowed to fade) is plausible but not
   sourced — recorded as observation, not invented rationale.

7. **`disabled-unselected-track-color` and `disabled-unselected-track-outline-color`
   are DEFINED in the token file but genuinely UNUSED anywhere in
   `internal/_track.scss`** — the identical class of "a capability the token
   set declares but the CSS never expresses" finding checkbox.salt.json's
   `no-success-styling` note already recorded for a different system's
   different component. The unselected-disabled track instead falls through
   to its ordinary rest colour, dimmed by the general
   `disabled-track-opacity: 0.12` rule, never touching either named token.

8. **Validation is confirmed absent in ALL THREE systems — the precise
   inverse of checkbox's finding that all three shipped one.** Salt's own
   `useFormFieldProps()` call for Switch deliberately destructures only
   `{ a11yProps, disabled, readOnly }`, NOT `validationStatus`, even though
   the SAME hook exposes `validationStatus` to Checkbox one file over —
   confirmed by reading both destructuring statements side by side. shadcn's
   canonical `switch.tsx` has no `aria-invalid:` class anywhere. M3's
   `_md-comp-switch.scss` contains the string `error` or `warning` nowhere
   in either token edition, grepped directly. This is the first time this
   registry has found a styling axis EVERY column checkbox shipped and
   switch drops uniformly, rather than a partial overlap.

9. **`prop.size` is a genuinely new shadcn-only axis, and the chassis was
   built to make it a REAL, CSS-discriminated one rather than a dead axis
   (CLAUDE.md drift type 2) — caught during the FIRST generator run, not
   after.** The original row plan only modelled `size="default"`'s
   dimensions; `python3 gen-from-template.py switch` would have happily
   reported `OK` with `size="sm"` selectable in the harness but producing
   IDENTICAL CSS to `size="default"`, because no style row keyed off
   `[data-size="sm"]` at all. Caught while writing the harness (which was
   about to render a size toggle with no visible effect) rather than by any
   gate — two new rows, `style.track.size@sm` and `style.thumb.size@sm`,
   were added specifically to close this gap before the harness was ever
   built, not after a broken render was noticed.

10. **The Enter-key fork required a genuine chassis DECISION, not just a
    matrix note, and the decision itself is worth recording plainly.**
    `behavior.keyboard-activation` moved from `channel: "info"` (checkbox's
    shape) to `channel: "config"` with a new `enterActivates` skeleton
    parameter specifically so the skeleton could implement M3's real,
    sourced Enter-key addition without ALSO fabricating it for shadcn (whose
    real capability is [R], unconfirmed, and structurally approximated with
    a native input that has no Enter semantics to inherit in the first
    place). `check-switch-behavior.mjs` was written to make this fork
    load-bearing: it asserts the literal `config.enterActivates` read
    exists AND is declared in `skeletonParams`, and was deliberately broken
    (the `config.enterActivates &&` guard removed) and confirmed to fail
    before being restored — see the gate's own header comment for why this
    particular row was judged worth calibrating over the other five, which
    were not individually broken-and-restored (their shape is identical to
    already-calibrated rows in `check-checkbox-behavior.mjs`).

11. **Verification status, stated plainly rather than implied by a clean
    gate run.** This session had no headless browser available —
    `playwright-chromium`'s postinstall Chromium download failed
    (network-sandboxed), and no system Chromium/Puppeteer was present
    either. Every selector in `switch.template.json` was hand-traced against
    the DOM `skeleton/switch.tsx` actually renders (root → input + track →
    thumb → icon, input and track as siblings, every conditional rule
    anchored at root via `:has()`) rather than confirmed with
    `getComputedStyle` in a live render, which is exactly the verification
    step CHECKBOX-MATRIX.md's findings 10 and 11 say should happen BEFORE
    trusting a passing gate, not instead of it. Flagged explicitly for the
    orchestrating session rather than claimed as done.

    **CLOSED by orchestrator review, same day.** `getComputedStyle` and
    `getBoundingClientRect` were run against a live render of
    `out/switch-check.html` (Playwright/Chromium, available to the
    orchestrating session even though not to this build). Confirmed for
    all three columns: (a) off→on genuinely changes `background-color` on
    the track (or, for Salt, correctly does NOT — see `style.thumb.checked`
    below — matching the sourced fill-to-outline inversion, not a bug);
    (b) the thumb's position genuinely moves — shadcn via
    `transform: translateX`, Salt the same, M3 via margin (no transform,
    by design — see the "declared structural simplification" in
    `skeleton/switch.tsx`'s banner), confirmed with
    `getBoundingClientRect` showing the thumb's centre offset flip from
    -16px to +6px relative to the track's centre; (c) M3's thumb genuinely
    resizes 16px → 24px on check. No selector was found dead, unlike
    checkbox's first draft — the root-anchored `:has()` pattern this build
    used throughout held up under live verification. Conformance: 71
    total assertions (18 new from switch), 1 failure, pre-existing and
    unrelated (`tabs`/shadcn/`behavior.activation-mode` — see CLAUDE.md's
    Known-open work).

12. **`check-anatomy.mjs` flags `switch` with `⚠ identical part-set: salt=m3`
    (4 parts, 3 shared, 0 system-unique) — explained here, per the gate's
    own rule that a convergence must be answerable with data, not trust.**
    The gate counts a structure row as a rendered "part" whenever its cell
    `kind` is not `off`, regardless of whether that part's DEFAULT runtime
    value happens to show anything. On that measure, Salt and M3 both have
    ALL FOUR structure rows populated (`shell`, `native-input`, `track`,
    `icon` — Salt's icon is `conditional-checkmark`, M3's is
    `optional-pair`, both real, non-`off` cell values), while shadcn has
    only TWO of four (`track` and `icon` are both genuinely `off` — see
    structure.track and structure.icon's shadcn cells). So Salt and M3
    converge on WHICH categories of part exist, while shadcn genuinely
    diverges by having fewer. This is not the retrofit shape rule 1
    forbids: Salt and M3 disagree on almost everything else about those
    four parts — the icon STRATEGY (`conditional-checkmark` vs
    `optional-pair`), whether the icon shows by DEFAULT (Salt yes, M3 no),
    the track's colour-changes-on-interaction question (Salt yes, M3 no —
    see "Declared approximations" #4), and the thumb's SIZE behaviour (Salt
    never resizes it, M3 does) are all genuinely different, documented at
    length above. The gate's part-count measure is coarser than the
    matrix's own 53-row grain by design (that coarseness is what makes it
    a cheap, fast tripwire) — this is a case where the coarse measure
    converges while the fine-grained one does not, and CLAUDE.md's "an
    unexplained convergence is the shape rule 1 forbids" is satisfied by
    this paragraph existing, not by the convergence not existing.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/switch.template.json` against every system, read from `columns/switch.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 8 light, 4 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `neutral` | rgb(114, 119, 125) | — | yes |
| `neutral-fg` | rgb(95, 100, 106) | rgb(145, 149, 154) | yes |
| `accent` | rgb(0, 120, 207) | — | yes |
| `box-bg` | rgb(255, 255, 255) | rgb(16, 24, 32) | yes |
| `text-fg` | rgb(0, 0, 0) | rgb(255, 255, 255) | yes |
| `focus-outline` | rgb(0, 69, 126) | rgb(154, 189, 245) | yes |
| `type-fontFamily` | 'Open Sans', sans-serif | — | **no** |
| `type-fontWeight` | 400 | — | **no** |

**shadcn** — 6 light, 5 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `track-rest` | oklch(0.922 0 0) | color-mix(in oklab, oklch(1 0 0 / 15%) 80%, transparent) | yes |
| `primary` | oklch(0% 0 0) | oklch(0.922 0 0) | yes |
| `thumb-bg` | oklch(1 0 0) | oklch(0.985 0 0) | **no** |
| `thumb-bg-checked` | oklch(1 0 0) | oklch(0.205 0 0) | **no** |
| `ring` | oklch(0.708 0 0) | oklch(0.556 0 0) | yes |
| `shadow-color` | rgb(0 0 0 / 0.05) | — | yes |

**m3** — 9 light, 9 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `primary` | #6750a4 | #d0bcff | **no** |
| `on-primary` | #fff | #381e72 | **no** |
| `primary-container` | #eaddff | #4f378b | **no** |
| `on-primary-container` | #21005d | #eaddff | **no** |
| `on-surface` | #1d1b20 | #e6e0e9 | **no** |
| `on-surface-variant` | #49454f | #cac4d0 | **no** |
| `surface` | #fef7ff | #141218 | **no** |
| `surface-container-highest` | #e6e0e9 | #36343b | yes |
| `outline` | #79747e | #938f99 | **no** |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.shell` | structure | locked | `label-wrap` | `unwrapped` | `unwrapped` |
| 2 | `structure.native-input` | structure | switchable | `True` | `True` | `True` |
| 3 | `structure.track` | structure | switchable | `True` | **off** | `True` |
| 4 | `structure.icon` | structure | locked | `conditional-checkmark` | `none` | `optional-pair` |
| 5 | `behavior.role` | behavior | locked | `explicit `role="switch"` written on the native <input type="checkbox">, with a biome-ignore comment noting aria-checked is unnecessary since input+checked already provides it` | `[R] role=switch on a <button> Root, aria-checked maintained by JS (no native `checked` DOM property to read it from, unlike a real input)` | `explicit `role="switch"` written on the native <input>; aria-checked free from the native `checked` property once the role is applied` |
| 6 | `behavior.keyboard-activation` | behavior | locked | `False` | `False` | `True` |
| 7 | `behavior.label-click-target` | behavior | switchable | `the WHOLE label — track/thumb and text both toggle it` | `only the track/root itself; extending the target requires the consumer's OWN separate <Label htmlFor>` | `the track/thumb itself, PLUS an explicit redirect from any ancestor <label> click a consumer supplies` |
| 8 | `behavior.disabled-handling` | behavior | locked | `native `disabled` on the input, merged with the ancestor FormField's (no group merge — switch has none), plus a blanket opacity class on the whole label` | `native disabled + disabled:cursor-not-allowed disabled:opacity-50` | `native ?disabled on the input, PLUS transitions explicitly suppressed on the track/handle around the disabled boundary` |
| 9 | `behavior.readonly` | behavior | switchable | `implemented in JS, NOT relying on the (spec-inert) native readonly attribute — identical mechanism to Checkbox` | **off** | **off** |
| 10 | `behavior.form-participation` | behavior | switchable | `native — the input IS the real form control` | `[R] a hidden native bubble input, per the linked Radix docs` | `a full form-associated custom element delegating validity to a REUSED CheckboxValidator instance` |
| 11 | `prop.checked-shape` | prop | locked | `boolean` | `boolean` | `boolean` |
| 12 | `prop.disabled` | prop | locked | `False, True` | `False, True` | `False, True` |
| 13 | `prop.read-only` | prop | switchable | `False, True` | **off** | **off** |
| 14 | `prop.required` | prop | switchable | `False, True` | `False, True` | `False, True` |
| 15 | `prop.size` | prop | switchable | **off** | `default, sm` | **off** |
| 16 | `prop.icons` | prop | switchable | **off** | **off** | `False, True` |
| 17 | `slot.label` | slot | switchable | `label?: ReactNode, rendered as the LAST child inside the component's own <label>` | **off** | **off** |
| 18 | `slot.composes` | slot | default | `True` | `True` | `True` |
| 19 | `state.rest` | state | locked | `neutral gray-500 outline on a white/near-black track fill; a SOLID currentColor thumb with a matching neutral border` | `a SOLID --input-coloured track fill in every mode (unlike checkbox's box, which had NO fill at rest in light mode), transparent border; a --background-coloured thumb` | `a surface-container-highest-filled track with a 2px outline-coloured border; an outline-coloured, 16px thumb` |
| 20 | `state.checked` | state | locked | `track fill NEVER changes — only track border/icon recolour to accent; thumb INVERTS from solid currentColor to transparent (outline-only), sliding via translateX(100%)` | `track becomes a SOLID primary fill; thumb slides via translateX(calc(100% - 2px)); thumb COLOUR only changes in dark mode` | `track fill moves to primary with its outline REMOVED (0px, not recoloured); thumb GROWS 16px->24px, recolours outline->on-primary, and slides via margin-inline-start (not transform)` |
| 21 | `state.hover` | state | switchable | `track border+icon AND thumb border recolour to the -hover variant, keyed off the ROOT's :hover` | **off** | `the TRACK shows NO colour change at all (re-verified directly against the token values); only the THUMB recolours (on-surface-variant unselected / primary-container selected)` |
| 22 | `state.focus` | state | switchable | `2px dotted accent-stronger outline at ZERO offset, plus the hover recolour riding along` | `the established translucent 3px ring-ring/50 box-shadow plus a border recolour, on the Root/track itself` | `same track-invariant / thumb-only-recolour story as hover, plus a 12%-opacity state layer and a separate md-focus-ring element not reproduced here` |
| 23 | `state.pressed` | state | switchable | **off** | **off** | `same thumb colour as hover/focus (M3 does not differentiate by colour), but the thumb balloons to 28x28px regardless of selected state — the 'overshoot' effect` |
| 24 | `state.disabled` | state | locked | `blanket opacity 0.4 (a literal) on the whole label, plus not-allowed cursor` | `opacity 0.5, cursor not-allowed` | `four different numbers: track 0.12 uniform; thumb 0.38 unselected but 1 (undimmed) selected; icon 0.38 either way` |
| 25 | `state.readonly` | state | switchable | `track border recolours to a dedicated readonly token; thumb is FORCED to the neutral/rest look in BOTH checked and unchecked states; root cursor becomes text, not not-allowed` | **off** | **off** |
| 26 | `style.track.size` | style | default | `width: var(--track-width); height: var(--track-height)` | `width: 32px; height: 18.4px` | `width: 52px; height: 32px` |
| 27 | `style.track.size@sm` | style | switchable | **off** | `width: 24px; height: 14px` | **off** |
| 28 | `style.track.shape` | style | default | ⟡ `track-radius` | `9999px` | `9999px` |
| 29 | `style.track.border-width` | style | default | `1px` | `1px` | `2px` |
| 30 | `style.track.rest` | style | locked | `border-color: var(--neutral); background-color: var(--box-bg); color: var(--neutral-fg)` | `background-color: var(--track-rest); border-color: transparent` | `background-color: var(--surface-container-highest); border-style: solid; border-color: var(--outline)` |
| 31 | `style.track.checked` | style | locked | `border-color: var(--accent); color: var(--accent)` | `background-color: var(--primary); border-color: transparent` | `background-color: var(--primary); border-width: 0` |
| 32 | `style.track.hover` | style | switchable | `border-color: var(--accent); color: var(--accent)` | **off** | **off** |
| 33 | `style.track.focus` | style | switchable | `outline: 2px dotted var(--focus-outline); outline-offset: 0` | `border-color: var(--ring); box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)` | **off** |
| 34 | `style.track.pressed` | style | switchable | **off** | **off** | **off** |
| 35 | `style.track.disabled` | style | switchable | **off** | **off** | `opacity: 0.12` |
| 36 | `style.track.readonly` | style | switchable | `border-color: var(--neutral); color: var(--text-fg)` | **off** | **off** |
| 37 | `style.thumb.size` | style | default | `width: var(--thumb-size); height: var(--thumb-size)` | `width: 16px; height: 16px` | `width: 16px; height: 16px` |
| 38 | `style.thumb.shape` | style | default | ⟡ `thumb-radius` | `9999px` | `9999px` |
| 39 | `style.thumb.size@sm` | style | switchable | **off** | `width: 12px; height: 12px` | **off** |
| 40 | `style.thumb.size@checked` | style | switchable | **off** | **off** | `width: 24px; height: 24px` |
| 41 | `style.thumb.size@pressed` | style | switchable | **off** | **off** | `width: 28px; height: 28px` |
| 42 | `style.thumb.rest` | style | locked | `background-color: currentColor; border-color: var(--neutral)` | `background-color: var(--thumb-bg); transform: translateX(0)` | `background-color: var(--outline); margin-inline-end: 20px` |
| 43 | `style.thumb.checked` | style | locked | `background-color: transparent; border-color: var(--accent); transform: translateX(100%)` | `background-color: var(--thumb-bg-checked); transform: translateX(calc(100% - 2px))` | `background-color: var(--on-primary); margin-inline-start: 20px` |
| 44 | `style.thumb.hover` | style | switchable | `border-color: var(--accent)` | **off** | `background-color: var(--on-surface-variant)` |
| 45 | `style.thumb.disabled` | style | switchable | **off** | **off** | `background-color: var(--on-surface); opacity: 0.38` |
| 46 | `style.thumb.disabled@checked` | style | switchable | **off** | **off** | `background-color: var(--surface); opacity: 1` |
| 47 | `style.thumb.readonly` | style | switchable | `background-color: var(--box-bg); border-style: dashed; border-color: var(--neutral)` | **off** | **off** |
| 48 | `style.icon.size` | style | switchable | `width: 100%; height: 100%` | **off** | `width: 16px; height: 16px` |
| 49 | `style.root.disabled` | style | switchable | `opacity: 0.4; cursor: not-allowed` | `opacity: 0.5; cursor: not-allowed` | **off** |
| 50 | `style.root.cursor` | style | default | `pointer` | **off** | `pointer` |
| 51 | `style.root.gap` | style | switchable | ⟡ `root-gap` | **off** | **off** |
| 52 | `style.root.font` | style | default | `font-size: var(--type-fontSize); line-height: var(--type-lineHeight); font-family: var(--type-fontFamily); font-weight: var(--type-fontWeight); color: var(--text-fg)` | **off** | **off** |
| 53 | `style.state-layer` | style | switchable | **off** | **off** | `size: 40px; shape: 9999px` |

<details><summary>Citations — 155 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.shell` | salt | Switch.tsx returns <label className=saltSwitch>{input}{track{thumb{icon}}}{label}</label> — one real <label>, matching Checkbox.tsx's own shape exactly |
| `structure.shell` | shadcn | [R] — the rendered root owns no label; switch-demo.tsx pairs it with a separate <Label htmlFor> |
| `structure.shell` | m3 | switch.ts render() has no label anywhere in the shadow DOM |
| `structure.native-input` | salt | Switch.tsx <input type="checkbox" role="switch" ... /> — a real native input, opacity:0, position:absolute (Switch.css) |
| `structure.native-input` | shadcn | [R] — the linked Radix docs describe the Root as a <button role="switch"> with a hidden native bubble input for form participation; not independently confirmable without primitives/ cloned. This chassis renders a real native input anyway, the same declared API-shape union checkbox.tsx's chassis already made |
| `structure.native-input` | m3 | switch.ts render(): <input id="switch" type="checkbox" role="switch" .../> |
| `structure.track` | salt | Switch.tsx <span className={withBaseName("track")}><span className={withBaseName("thumb")}>...</span></span> — a real, separate track element |
| `structure.track` | shadcn | CONFIRMED ABSENCE of a separate track element — see no-track-element. The chassis renders one anyway for cross-system CSS selector uniformity (declared approximation) |
| `structure.track` | m3 | render(): <span class="track"> ${this.renderHandle()} </span> — a real, separate track element, SIBLING of the <input> (not its parent) |
| `structure.icon` | salt | Switch.tsx: {checked && !readOnly && <CheckmarkSolidIcon .../>} {checked && readOnly && <CheckmarkIcon .../>} — the identical readOnly-glyph-swap mechanism CheckboxIcon.tsx already used |
| `structure.icon` | shadcn | SwitchPrimitive.Thumb renders no children of any kind — a plain colour-and-position-only circle |
| `structure.icon` | m3 | renderIcons() renders BOTH an on-icon and off-icon <slot>, gated by `icons`/`showOnlySelectedIcon` — @property({type:Boolean}) icons = false, so both default OFF |
| `behavior.role` | salt | Switch.tsx: `role="switch"` plus `// biome-ignore lint/a11y/useAriaPropsForRole: aria-checked is not needed when input and checked is used.` |
| `behavior.role` | shadcn | not independently confirmable without primitives/ cloned |
| `behavior.role` | m3 | switch.ts render(): role="switch" on <input type="checkbox"> |
| `behavior.keyboard-activation` | salt | no onKeyDown anywhere in Switch.tsx; accessibility.mdx: 'Space activates switch to change between checked and unchecked state' — enterActivates=false, Space handled natively |
| `behavior.keyboard-activation` | shadcn | [R/declared] enterActivates=false in THIS chassis (a native-input approximation, see the template row's note) — real Radix's button-based Root plausibly answers Space AND Enter natively; not independently confirmable without primitives/ cloned, and not fabricated here |
| `behavior.keyboard-activation` | m3 | see keyboard-enter-addition — enterActivates=true, Space handled natively PLUS Enter explicitly added via a keydown listener citing the APG switch pattern directly in a source comment |
| `behavior.label-click-target` | salt | native <label> semantics, since structure.shell=label-wrap |
| `behavior.label-click-target` | shadcn | switch-demo.tsx, field-switch.tsx |
| `behavior.label-click-target` | m3 | see label-click-delegation |
| `behavior.disabled-handling` | salt | Switch.tsx `const disabled = formFieldDisabled \|\| disabledProp`; Switch.css `.saltSwitch-disabled { opacity: 0.4 }` |
| `behavior.disabled-handling` | shadcn | switch.tsx className string |
| `behavior.disabled-handling` | m3 | internal/_track.scss `.disabled .track::before, .disabled .track::after { transition: none }`; internal/_handle.scss `.disabled .handle-container { transition: none }`, `.disabled .handle, .disabled .handle::before { transition: none }` |
| `behavior.readonly` | salt | Switch.tsx handleChange: `if (event.nativeEvent.defaultPrevented \|\| readOnly) { return }` |
| `behavior.readonly` | shadcn | CONFIRMED ABSENCE — no readOnly/readonly reference anywhere in switch.tsx |
| `behavior.readonly` | m3 | CONFIRMED ABSENCE — no readonly-* token in either edition, no readOnly property in switch.ts |
| `behavior.form-participation` | salt | a real <input type="checkbox" name=... value=... checked=.../>, no custom validity machinery needed |
| `behavior.form-participation` | shadcn | not independently confirmable without primitives/ cloned |
| `behavior.form-participation` | m3 | see form-participation |
| `prop.checked-shape` | salt | SwitchProps: `checked?: boolean; defaultChecked?: boolean` — NO indeterminate field anywhere |
| `prop.checked-shape` | shadcn | the `checked` prop is a plain boolean per the linked docs — no "indeterminate" union member the way checkbox's is |
| `prop.checked-shape` | m3 | @property({type:Boolean}) selected = false — no indeterminate property anywhere in internal/switch.ts |
| `prop.disabled` | salt | SwitchProps.disabled?: boolean, merged with the ancestor FormField's |
| `prop.disabled` | shadcn | native disabled, a real HTML attribute Radix forwards |
| `prop.disabled` | m3 | @property({type:Boolean}) disabled, inherited LitElement convention |
| `prop.read-only` | salt | SwitchProps.readOnly?: boolean |
| `prop.read-only` | shadcn | CONFIRMED ABSENCE |
| `prop.read-only` | m3 | CONFIRMED ABSENCE |
| `prop.required` | salt | reachable only via `inputProps.required` (SwitchProps has no top-level `required` field), the same indirect shape checkbox's Salt column used |
| `prop.required` | shadcn | [R] — Radix's published API includes `required`; not independently confirmable without primitives/ cloned |
| `prop.required` | m3 | @property({type:Boolean}) required, wired directly into CheckboxValidator's constraint-validation computation |
| `prop.size` | salt | density (a registry-wide, document-level axis) plays the equivalent role but is a different mechanism, not a per-instance prop — see the template row's note |
| `prop.size` | shadcn | switch.tsx's own destructured prop, `size = "default"` typed "sm" \| "default", SOURCE-DEFAULT-FIRST |
| `prop.size` | m3 | CONFIRMED ABSENCE — no size-related @property anywhere; track/handle dimensions are fixed literals in every instance |
| `prop.icons` | salt | Salt's icon visibility is driven entirely by checked/readOnly state (see structure.icon), not an opt-in toggle |
| `prop.icons` | shadcn | CONFIRMED ABSENCE — no icon capability of any kind |
| `prop.icons` | m3 | @property({type:Boolean}) icons = false, SOURCE-DEFAULT-FIRST |
| `slot.label` | salt | Switch.tsx |
| `slot.label` | shadcn | CONFIRMED ABSENCE — no label text owned; always external (see slot.composes) |
| `slot.label` | m3 | CONFIRMED ABSENCE — no label text owned; always external, see behavior.label-click-target |
| `slot.composes` | salt | form-field (useFormFieldProps() pulls aria-describedby/aria-labelledby/disabled/readOnly down from an ancestor <FormField> — Switch.tsx), checkbox/radio-button/toggle-button (the three explicitly-excluded siblings, usage.mdx) |
| `slot.composes` | shadcn | label (id/htmlFor, switch-demo.tsx), field (FieldContent/FieldLabel/FieldDescription, field-switch.tsx) |
| `slot.composes` | m3 | an external, consumer-authored <label> (behavior.label-click-target); checkbox/radio/toggle-button are the explicitly separate canonical rows |
| `state.rest` | salt | an outline-style track at EVERY state, including checked — see state.checked |
| `state.rest` | shadcn | switch's track is filled from the start — a real structural difference from checkbox's own rest state |
| `state.rest` | m3 | smaller than its checked size — see state.checked |
| `state.checked` | salt | the fill direction is the OPPOSITE of checkbox's box, which stayed outline-only at every state |
| `state.checked` | shadcn | a real, sourced light/dark asymmetry — see thumb-bg / thumb-bg-checked provenance |
| `state.checked` | m3 | the fourth sighting of M3's fill-replaces-stroke idiom in this registry |
| `state.hover` | salt | Switch.css `.saltSwitch:hover .saltSwitch-track`, `.saltSwitch:hover .saltSwitch-thumb` |
| `state.hover` | shadcn | CONFIRMED ABSENCE — no hover: class of any kind, on Root or Thumb |
| `state.hover` | m3 | a genuinely different distribution of interactive feedback from Salt, whose track DOES recolour on hover |
| `state.focus` | salt | Switch.css `.saltSwitch-input:focus-visible + .saltSwitch-track { outline: ...; outline-offset: var(--salt-focused-outlineOffset) }` = 0 |
| `state.focus` | shadcn | focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 |
| `state.focus` | m3 | see track-colour-tokens-are-interaction-invariant |
| `state.pressed` | salt | CONFIRMED ABSENCE — no :active selector anywhere |
| `state.pressed` | shadcn | CONFIRMED ABSENCE — no active: class of any kind |
| `state.pressed` | m3 | see container-tokens |
| `state.disabled` | salt | Switch.css `.saltSwitch-disabled { opacity: 0.4; cursor: var(--salt-cursor-disabled) }` |
| `state.disabled` | shadcn | disabled:cursor-not-allowed disabled:opacity-50 |
| `state.disabled` | m3 | a real, deliberate asymmetry — see disabled-opacities |
| `state.readonly` | salt | Switch.css `.saltSwitch-readOnly .saltSwitch-track`, `.saltSwitch-readOnly .saltSwitch-thumb, .saltSwitch-readOnly.saltSwitch-checked .saltSwitch-thumb` (identical rule for both), `.saltSwitch-readOnly { cursor: var(--salt-cursor-text) }` |
| `state.readonly` | shadcn | CONFIRMED ABSENCE — no readonly concept exists |
| `state.readonly` | m3 | no readonly concept |
| `style.track.size` | salt | Switch.css .saltSwitch-track/.saltSwitch-input |
| `style.track.size` | shadcn | size="default": h-[1.15rem] w-8 = 18.4px x 32px (the size="sm" alternative, 14px x 24px, is a declared config axis via prop.size, not a second cell — see the harness's size toggle) |
| `style.track.size` | m3 | track-width/track-height, hardcoded literals, both editions |
| `style.track.size@sm` | salt | Salt has no size prop — density plays the equivalent role, see prop.size |
| `style.track.size@sm` | shadcn | size="sm": h-3.5 w-6 = 14px x 24px |
| `style.track.size@sm` | m3 | CONFIRMED ABSENCE — no size prop, dimensions are fixed literals |
| `style.track.shape` | shadcn | class rounded-full |
| `style.track.shape` | m3 | track-shape: corner-full |
| `style.track.border-width` | salt | Switch.css .saltSwitch-track { border: var(--salt-size-fixed-100) ... } = 1px, FIXED scale |
| `style.track.border-width` | shadcn | bare `border` utility, undeclared width, Tailwind's own default — the same unvendored-Tailwind caveat every prior shadcn column has recorded; colour is permanently transparent (border-transparent), see style.track.rest |
| `style.track.border-width` | m3 | track-outline-width — the UNSELECTED value; style.track.checked removes it entirely |
| `style.track.rest` | salt | box-bg is REUSED from checkbox's identical container-primary-background token — Switch.css does not restate a rest background rule of its own beyond `.saltSwitch-track { background: var(--salt-container-primary-background) }`, which resolves to the same slot |
| `style.track.rest` | shadcn | data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80, border-transparent |
| `style.track.rest` | m3 | unselected-track-color: surface-container-highest; unselected-track-outline-color: outline |
| `style.track.checked` | salt | Switch.css .saltSwitch-checked .saltSwitch-track { border-color: selectable-borderColor-selected; color: selectable-foreground-selected } — no background rule, box-bg is UNCHANGED from rest, repeated here deliberately |
| `style.track.checked` | shadcn | data-[state=checked]:bg-primary — a real fill swap, not an addition on top of a transparent rest |
| `style.track.checked` | m3 | selected-track-color: primary; track-outline-width overridden to 0 for the selected case |
| `style.track.hover` | salt | Switch.css .saltSwitch:hover .saltSwitch-track { border-color: selectable-borderColor-hover; color: selectable-foreground-hover } — both resolve to the SAME accent slot as -selected |
| `style.track.hover` | shadcn | CONFIRMED ABSENCE |
| `style.track.hover` | m3 | CONFIRMED ABSENCE — see track-colour-tokens-are-interaction-invariant; nothing for this row to express |
| `style.track.focus` | salt | Switch.css .saltSwitch-input:focus-visible + .saltSwitch-track { outline: var(--salt-focused-outline); outline-offset: var(--salt-focused-outlineOffset) } = 0 |
| `style.track.focus` | shadcn | focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 |
| `style.track.focus` | m3 | same finding as style.track.hover |
| `style.track.pressed` | salt | CONFIRMED ABSENCE |
| `style.track.pressed` | shadcn | CONFIRMED ABSENCE |
| `style.track.pressed` | m3 | same finding as style.track.hover |
| `style.track.disabled` | salt | Salt applies a single flat opacity at the root instead — see style.root.disabled |
| `style.track.disabled` | shadcn | shadcn applies a single flat opacity at the root instead — see style.root.disabled |
| `style.track.disabled` | m3 | disabled-track-opacity: 0.12, applied uniformly regardless of selection state |
| `style.track.readonly` | salt | Switch.css .saltSwitch-readOnly .saltSwitch-track { border-color: selectable-borderColor-readonly; color: content-primary-foreground } — selectable-borderColor-readonly resolves to the same palette-neutral value as rest |
| `style.track.readonly` | shadcn | no readonly concept |
| `style.track.readonly` | m3 | no readonly concept |
| `style.thumb.size` | salt | Switch.css .saltSwitch-thumb { height: var(--salt-size-selectable) }, aspect-ratio: 1 |
| `style.thumb.size` | shadcn | size="default": group-data-[size=default]/switch:size-4 = 16px (the size="sm" alternative, 12px, is reached via the same prop.size config axis) |
| `style.thumb.size` | m3 | unselected-handle-height/-width: 16px |
| `style.thumb.shape` | shadcn | class rounded-full on the Thumb |
| `style.thumb.shape` | m3 | handle-shape: corner-full |
| `style.thumb.size@sm` | salt | see style.track.size@sm |
| `style.thumb.size@sm` | shadcn | size="sm": group-data-[size=sm]/switch:size-3 = 12px |
| `style.thumb.size@sm` | m3 | see style.track.size@sm |
| `style.thumb.size@checked` | salt | CONFIRMED ABSENCE — Salt's thumb never changes size on check, only colour and position |
| `style.thumb.size@checked` | shadcn | CONFIRMED ABSENCE — shadcn's thumb never changes size on check |
| `style.thumb.size@checked` | m3 | selected-handle-height/-width: 24px |
| `style.thumb.size@pressed` | salt | CONFIRMED ABSENCE — no :active rule of any kind |
| `style.thumb.size@pressed` | shadcn | CONFIRMED ABSENCE — no :active rule of any kind |
| `style.thumb.size@pressed` | m3 | pressed-handle-height/-width: 28px, regardless of selected state |
| `style.thumb.rest` | salt | Switch.css .saltSwitch-thumb { background: currentColor; border: var(--salt-size-fixed-100) solid var(--salt-selectable-borderColor) } |
| `style.thumb.rest` | shadcn | bg-background, data-[state=unchecked]:translate-x-0 |
| `style.thumb.rest` | m3 | unselected-handle-color: outline; margin-inline-end: track-width - track-height = 52-32 = 20px, the REST-side position |
| `style.thumb.checked` | salt | Switch.css .saltSwitch-checked .saltSwitch-thumb { background: transparent; border-color: selectable-borderColor-selected; transform: translateX(100%) } — the fill-to-outline INVERSION |
| `style.thumb.checked` | shadcn | dark:data-[state=checked]:bg-primary-foreground (identical to bg-background in light mode), data-[state=checked]:translate-x-[calc(100%-2px)] |
| `style.thumb.checked` | m3 | selected-handle-color: on-primary; margin-inline-start: 20px, the CHECKED-side position, mirroring style.thumb.rest's margin-inline-end |
| `style.thumb.hover` | salt | Switch.css .saltSwitch-input:focus-visible + .saltSwitch-track .saltSwitch-thumb, .saltSwitch:hover .saltSwitch-thumb { border-color: selectable-borderColor-hover } |
| `style.thumb.hover` | shadcn | CONFIRMED ABSENCE |
| `style.thumb.hover` | m3 | unselected-hover-handle-color: on-surface-variant — the UNSELECTED-hover value; the selected-hover variant (primary-container) is recorded in provenance but not separately expressed, the same declared approximation checkbox.m3.json's own box hover used. Reused for focus and pressed too, since all three tokens are numerically identical for a given selection state |
| `style.thumb.disabled` | salt | Salt applies a single flat opacity at the root instead — see style.root.disabled |
| `style.thumb.disabled` | shadcn | shadcn applies a single flat opacity at the root instead — see style.root.disabled |
| `style.thumb.disabled` | m3 | disabled-unselected-handle-color: on-surface; disabled-unselected-handle-opacity: 0.38 |
| `style.thumb.disabled@checked` | salt | see style.thumb.disabled |
| `style.thumb.disabled@checked` | shadcn | see style.thumb.disabled |
| `style.thumb.disabled@checked` | m3 | disabled-selected-handle-color: surface; disabled-selected-handle-opacity: 1 — NOT dimmed, the real asymmetry |
| `style.thumb.readonly` | salt | Switch.css .saltSwitch-readOnly .saltSwitch-thumb, .saltSwitch-readOnly.saltSwitch-checked .saltSwitch-thumb { background: container-primary-background; border: fixed-100 dashed selectable-borderColor-readonly } — the IDENTICAL rule for both checked and unchecked |
| `style.thumb.readonly` | shadcn | no readonly concept |
| `style.thumb.readonly` | m3 | no readonly concept |
| `style.icon.size` | salt | CheckboxIcon/Icon component default --saltIcon-size: 100% — fills whatever thumb it sits in |
| `style.icon.size` | shadcn | CONFIRMED ABSENCE — no icon element exists (structure.icon = none) |
| `style.icon.size` | m3 | icon-size/selected-icon-size: BOTH 16px — the icon does NOT grow when the handle does, a real, deliberate contrast |
| `style.root.disabled` | salt | Switch.css .saltSwitch-disabled { opacity: 0.4; cursor: var(--salt-cursor-disabled) } |
| `style.root.disabled` | shadcn | disabled:cursor-not-allowed disabled:opacity-50 |
| `style.root.disabled` | m3 | M3's real disabled treatment is per-part and asymmetric by selection state — see style.track.disabled / style.thumb.disabled(@checked); a single flat root number would misrepresent it |
| `style.root.cursor` | salt | Switch.css .saltSwitch { cursor: var(--salt-cursor-hover) } = pointer |
| `style.root.cursor` | shadcn | CONFIRMED ABSENCE — no cursor-pointer class at rest; only disabled:cursor-not-allowed exists |
| `style.root.cursor` | m3 | :host { cursor: pointer } |
| `style.root.gap` | shadcn | no owned label, nothing to space |
| `style.root.gap` | m3 | no owned label, nothing to space |
| `style.root.font` | salt | Switch.css .saltSwitch { font-size/line-height/font-family/font-weight: var(--salt-text-*); color: var(--salt-content-primary-foreground) } — the BODY role, REGULAR (400) |
| `style.root.font` | shadcn | no owned label text |
| `style.root.font` | m3 | no owned label text |
| `style.state-layer` | salt | CONFIRMED ABSENCE — Salt has no ripple/state-layer concept for switch; hover and focus recolour the track/thumb directly |
| `style.state-layer` | m3 | documented, not rendered as its own element — see structure.track / provenance.state-layer-size-shape |

</details>

<!-- END GENERATED VALUES -->
