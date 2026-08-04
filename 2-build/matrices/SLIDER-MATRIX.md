# Slider — component template matrix

*Seventeenth live component in the post-clean-slate pipeline (button, calendar,
spinner, tooltip, alert, input, select, dialog, tabs, card, badge, progress,
chip, checkbox, switch, radio-group came before). Same method as
[RADIO-GROUP-MATRIX.md](RADIO-GROUP-MATRIX.md)/[SWITCH-MATRIX.md](SWITCH-MATRIX.md):
one master template (union of all six pieces across systems), columns per
design system, rows switched on/off/inherited per column.*

**Cell legend** · `⟡ slot` = alias to shared contract slot · **bold** = the
system's own slider · `off` = row switched off in this column · `[S]` = value
extracted from source this session · `[R]` = not directly sourced (reason
always given).

**Row policies** · 🔒 locked-on (no column may switch it off) ·
⚪ switchable (on where the system has it) · ⬜ on-with-default.

**Naming rule** — grammar `<piece>.<part>[.<subpart>].<property>[@state]`,
enforced by `contract/template.schema.json`'s `row.id` pattern.

**53 rows in all**: 7 structure, 8 behavior, 7 prop, 3 slot, 5 state, 23
style.

**Slider is architecturally different from the checked/unchecked family
(checkbox, switch, radio-group) that came before it — a continuous,
drag-or-key-positioned NUMERIC control, not a discrete toggle.** No
`state.checked` row exists here at all; the meaningful "state" is a
CONTINUOUS position, expressed as instance-level inline style (percentages
computed from value/min/max), never a theme-level cell. The headline
question this matrix answers is not "does it need a wrapper" (radio-group's
own question) but **"is range a separate component, or an axis of the same
one" — and the three systems give THREE genuinely different answers**, the
busiest structural fork this registry has found for a single canonical row
yet. See prop.value-shape and finding 1.**

---

## Scope note

### Claiming the row

`1-intro/content/04-component-map.md`'s Forms & inputs section, line 49:
`| slider | ✓ | ✓ | ✓ |` — present, unqualified, in all three. No naming
disagreement to resolve (unlike radio-group's three-way name split).

### In scope

The continuous single-value control, its track/fill/thumb, a two-thumb
**range** mode (see below), an optional value-readout (tooltip/label) near
the thumb, optional tick marks, disabled handling, and the keyboard/pointer
value-change story.

### The range-slider scope decision — IN scope, as ONE shared config axis

**Salt's `RangeSlider` is a REAL, independently-exported component** —
grepped this session, not assumed from the directory listing: `RangeSlider.tsx`
(297 lines, its own `RangeSliderProps` with `value: [number,number]`,
`startName`/`endName`, its own `useRangeSliderThumb` hook with a
`preventThumbOverlap` mechanism) [S]. It is NOT a story, NOT an example of
`Slider` with two values — a structurally separate component that happens to
share `SliderTrack`/`SliderThumb` internals with `Slider`.

Given that, the decision was NOT "absorb silently" or "drop silently" —
it was **decided deliberately as ONE shared config axis (`range:
[false,true]`) rather than a second component**, for a structural reason
found by reading the OTHER two systems' own range mechanisms first:
- **shadcn's `Slider` is a single component whose THUMB COUNT is driven
  entirely by `value`/`defaultValue` array length** (`Array.from({length:
  _values.length}, ...)`) — range is reached by passing a 2-element array to
  the identical component used for a single value, a genuinely UNCAPPED
  N-thumb capability [S].
- **M3's `<md-slider>` is a single custom element with a literal `range:
  boolean` property**, forking `value` into `valueStart`/`valueEnd` [S].

Two of three systems answer "range is an axis of the same component," and
Salt's own two components share every internal PART this matrix already
models (`SliderTrack`/`SliderThumb` are the literal same files for both
`Slider` and `RangeSlider`). Modelling range as a shared chassis axis
therefore captures Salt's real internals faithfully while matching shadcn's
and M3's own real API shape — declared explicitly as a simplification of
shadcn's own uncapped N-thumb capability (this chassis caps at exactly two
thumbs) and of Salt's own two-component split (one shared `range` boolean
drives both). See prop.value-shape, prop.range, structure.thumb, and
finding 1.

### Out of scope, and why (structural reasons, declared not dropped)

| excluded | where | structural reason |
|---|---|---|
| `label` | 04-component-map.md, its own row, unbuilt | Identical boundary to every prior form-control row: the visible label a consumer sees is always a SEPARATE component associated by `id`/`htmlFor`/`aria-label`. Declared composition (`slot.composes`), not this row's job. |
| `field` (label+control+help wrapper) | 04-component-map.md, its own row, unbuilt | shadcn's `field-slider.tsx` (`Field`/`FieldTitle`/`FieldDescription`) and Salt's `useFormFieldProps()` both delegate description text and container styling to this row. |
| shadcn's uncapped N-thumb (`Array.from({length: _values.length})`, 3+ thumbs, `slider-multiple.tsx`) | `slider.tsx` | A real, sourced, GENUINELY UNCAPPED capability, no cross-system counterpart beyond two — see the range decision above. Declared, not silently matched or silently dropped: `prop.value-shape`'s own cell records the real capability, `prop.range`'s cell records this chassis's own cap. |
| shadcn's `orientation="vertical"` | `slider.tsx`, `slider-vertical.tsx` | Real, sourced, shadcn-only (`data-[orientation=vertical]:...` on Root/Track/Range). Neither Salt's `SliderTrack.tsx` (a fixed horizontal flex row) nor M3's `slider.ts` (no orientation-related `@property` anywhere, confirmed by reading the class directly) has any equivalent axis — modelling it would fork every geometry row for a capability 2 of 3 systems genuinely lack, the identical category of exclusion RADIO-GROUP-MATRIX.md's own Salt-only `direction`/`wrap` decision already made. |
| Salt's `.saltSliderTrack-marks` value-legend (an array of `{label,value}` text nodes under each mark, independent of `showTicks`) | `SliderTrack.tsx` | A distinct, DATA-DRIVEN multi-item content mechanism from the single min/max endpoint labels this template DOES model (`slot.min-label`/`slot.max-label`), with no cross-system counterpart — declared under `structure.ticks`'s own note rather than given a row. |
| M3's handle-overlap outline (`with-overlap-handle-outline-*`, drawn while two range thumbs' pixel positions coincide) | `slider.ts`/`_slider.scss` | Requires LIVE pixel-overlap detection between two thumbs — a JS behaviour, not a themeable CSS declaration. Declared under `state.pressed`'s note, the same documented-not-modelled convention this registry's ripple/state-layer rows already use. |
| M3's separate `md-focus-ring`/`md-ripple` elements | `slider.ts` render() | The identical shared cross-component focus-ring/ripple primitives every prior M3 column's own scope note already excluded, for the identical reason. |

---

## Sources

- **Salt** [S]: `packages/core/src/slider/{Slider.tsx,RangeSlider.tsx,internal/SliderTrack.tsx,internal/SliderTrack.css,internal/SliderThumb.tsx,internal/SliderThumb.css,internal/SliderTooltip.tsx,internal/SliderTooltip.css,internal/useSliderThumb.ts,internal/useRangeSliderThumb.ts,internal/utils.ts}` —
  TEN files, the whole component family (two exported components, five
  internal files, one shared utils module), read in full.
  `packages/core/stories/{slider,range-slider}/*.stories.tsx`;
  `site/docs/components/slider/{index,usage,accessibility,examples}.mdx` and
  its `range-slider/` subfolder. Resolution through
  `packages/theme/css/next/characteristics/{sentiment,container,content,focused}.css`,
  `next/palette/{alpha,accent,foreground,corner}.css`,
  `next/foundations/{color,alpha,size,spacing,curve}.css`,
  `next/characteristics/text.css` (the LABEL role — a role no prior column in
  this pipeline needed for its own root text).
- **shadcn** [S]: `apps/v4/registry/new-york-v4/ui/slider.tsx` — ONE
  component (`SliderPrimitive.Root`), rendering `Track`/`Range` (always-real)
  and N `Thumb`s. Token values from `apps/v4/app/globals.css`. Read for
  range/orientation/disabled: `slider-demo.tsx`, `slider-range.tsx`,
  `slider-multiple.tsx`, `slider-vertical.tsx`, `slider-disabled.tsx`,
  `slider-controlled.tsx`, `field-slider.tsx`, `slider-rtl.tsx`. Read only to
  fix structural boundaries (NOT canonical):
  `apps/v4/registry/bases/{radix,base,aria}/ui/slider.tsx` and
  `apps/v4/content/docs/components/radix/slider.mdx`, which LINKS to but does
  not itself document Radix's internal element. **primitives/ was NOT
  cloned**, per the project's standing rule. Every cell depending on Radix's
  internal element/ARIA wiring is `[R]`, citing
  https://www.radix-ui.com/docs/primitives/components/slider.
- **Material 3** [S]: `slider/internal/slider.ts` (the real Lit component,
  799 lines — `render()`, the pointer-drag action/flip/clamp state machine
  for range-overlap prevention, `ElementInternals` form participation, read
  in full), `slider/internal/_slider.scss` (the shipped styles source, 521
  lines, read in full — the CSS clip-path math for range-mode input
  restriction is the single most intricate stylesheet this registry has
  read), `slider/slider.ts` (the `<md-slider>` registration), `slider/
  slider_test.ts` (spot-checked). Tokens: `tokens/versions/v0_192/
  _md-comp-slider.scss` (the pinned edition) and
  `tokens/versions/latest/sass/_md-comp-slider*.scss` (edition diff — see
  below, a LARGE one). Colour/state resolution through
  `tokens/versions/v0_192/{_md-sys-color.scss,_md-sys-state.scss}`.

### Edition pin — `v0.192`, per standing owner decision, checked and found LARGE

`latest`'s token set SPLITS into FIVE size variants
(`_md-comp-slider-{xsmall,small,medium,large,xlarge}.scss`), replacing
v0.192's single flat token set entirely — a real, sourced redesign (M3
sliders gained a `size` axis at some point after v0.192). Flagged loudly
rather than silently followed; every value in this column is v0.192's single
size, per standing policy.

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **root** | 🔒 (info) | `.saltSliderTrack`, the outermost element | `SliderPrimitive.Root`, a single flex div that is ALSO the interactive host | the `<md-slider>` custom element itself |
| **track** | 🔒 (info) | `.saltSliderTrack-rail`, two-tone look via `::before`/`::after` PSEUDO-elements | `SliderPrimitive.Track`, a real, always-present div | `.track`, a real div whose OWN two-tone look is ALSO via `::before`/`::after` |
| **fill** | 🔒 (info) | pseudo-element in SINGLE mode; a REAL `<div className=saltSliderTrack-fill>` ONLY when `isRange` | `SliderPrimitive.Range`, a real, ALWAYS-present div | `.track::after`, a pseudo-element, always |
| **thumb** | 🔒 (info) | a 2px-WIDE FIXED-width BAR (not a circle), height scales by density | a circular 16px disc, ring-bordered, white fill | a solid-filled circular disc (`.handleNub`) inside a 40px ripple hit-area |
| native input | ⚪ (info) | **on** — a REAL `<input type="range">`, `opacity: 0.0001` [S] | **on** [R] — Radix's Thumb is documented as `<span role="slider">`, not a native input; this chassis renders one anyway (declared union) | **on** — a REAL `<input type="range">`, `opacity: 0` [S] |
| **value-readout** | 🔒 (config) | **`tooltip`** — a JS-timer-hover-delayed bubble, DEFAULT ON | **`none`** — CONFIRMED ABSENCE | **`label`** — a CSS-only `scale(0)->scale(1)` pill, DEFAULT OFF |
| ticks | ⚪ (config) | **on** (capability) — opt-in via `showTicks`+`marks`, DEFAULT OFF | **off** — CONFIRMED ABSENCE | **on** (capability) — opt-in via `ticks`, DEFAULT OFF |

## 2 · Behavior

**Every row below is implemented in `skeleton/slider.tsx` and asserted by
`gates/check-slider-behavior.mjs`. Eight rows, seven locked-info, one
switchable-info.**

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **role** | 🔒 | implicit, free from the native input [S] | **[R]** explicit `role="slider"` on a `<span>` | implicit, free from the native input [S] |
| **value announcement** | 🔒 | explicit `aria-valuenow`/`aria-valuetext`, redundant with the native input [S] | **[R]** all set explicitly in JS | implicit `aria-valuenow` + explicit PER-THUMB `aria-valuemin`/`aria-valuemax` [S] |
| **keyboard value-change** | 🔒 | **JS OVERRIDE** reproducing native semantics, to support `restrictToMarks`/`marks`/`stepMultiplier` [S] | **[R]** JS, no native input to delegate to | **genuinely NATIVE**, zero override [S] |
| **pointer drag** | 🔒 | fully JS-driven (`handlePointerMove` on window) [S] | **[R]** JS pointer tracking | **genuinely NATIVE** (real input drives it) [S] |
| **track click jump** | 🔒 | explicit JS (`handlePointerDownOnTrack`) [S] | **[R]** presumed, standard Radix convention | **genuinely FREE** (native input spans the full track) [S] |
| value-readout visibility | ⚪ | hover(300ms delay)/drag/focus, opt-OUT [S] | **off** — nothing to show | hover/focus-within/active, opt-IN, CSS-only [S] |
| **disabled handling** | 🔒 | ancestor FormField merge, `pointer-events:none` on wrapper [S] | native `disabled` forwarded to every input [S] | native `?disabled` PLUS component-wide opacity/colour treatment [S] |
| **form participation** | 🔒 | native; range mode = TWO separately-named inputs [S] | **[R]** hidden bubble input(s) | a full form-associated element; range mode = TWO named FormData entries, the SAME shape Salt independently uses [S] |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **value shape** | 🔒 | TWO components (`Slider`/`RangeSlider`), sharing internals [S] | ONE component, thumb count = array length, UNCAPPED [S] | ONE component, `range: boolean` property [S] |
| **range** (this chassis's axis) | 🔒 | `[false, true]` (via choosing RangeSlider) | `[false, true]` (capped from an uncapped N) | `[false, true]` (native) |
| bounds (`min`/`max`) | 🔒 | `0`/`100` — see finding 2 (Salt's own JSDoc says `@default 10`, the CODE says 100) [S] | `0`/`100` [S] | `0`/`100` [S] |
| step | 🔒 | `1`, plus a Salt-only `stepMultiplier=2` for PageUp/PageDown [S] | `1` [S/R] | `1` [S] |
| `disabled` | 🔒 | `[false, true]` [S] | `[false, true]` [S] | `[false, true]` [S] |
| value-format | ⚪ | a `format` CALLBACK [S] | **off** | STATIC STRING overrides (`valueLabel*`) — a different mechanism [S] |
| restrict-to-marks | ⚪ | `[false, true]`, ignores `step`, snaps to `marks` [S] | **off** | **off** |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| min-label | ⚪ | Salt ONLY — text flanking the track's start [S]. shadcn/M3: off. |
| max-label | ⚪ | Salt ONLY — text flanking the track's end [S]. shadcn/M3: off. |
| composes (declared) | ⬜ | `label`/`field` (external association + wrapper); Salt's own `.saltSliderTrack-marks` value legend declared OUT OF SCOPE (see the scope table). |

## 5 · States

**No `checked` state exists here — see the matrix's own headline note. The
five rows below are the full state family.**

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| rest | 🔒 | semi-transparent (50% alpha) neutral track, accent-filled bar thumb | muted track, primary fill, WHITE ring-bordered thumb (the only non-solid-filled thumb) | `surface-container-highest` track, `primary` fill, solid `primary` disc |
| hover | ⚪ | **off** for colour — cursor-only | **on** — translucent 4px ring | **off** — colour-INVARIANT, see finding 3 |
| **focus** | 🔒 | shared `--salt-focused-*` outline family [S] | SAME ring as hover, no separate treatment [S] | colour-invariant; only the CSS value-label + ripple respond |
| pressed | ⚪ | **off** for colour, cursor-only (`grabbing`) [S] | **off** — CONFIRMED ABSENCE | colour-invariant; overlap-outline declared out of scope |
| **disabled** | 🔒 | flat opacity 0.4 + `pointer-events:none` [S] | flat opacity 0.5 [S] | per-part: host 0.38 × colour swap × (track only) compensated local opacity — see finding 4 |

## 6 · Styles — the cell matrix

All cells at each system's default: single value, enabled, medium Salt
density.

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| track size (height) | ⬜ | 2-8px by density | 6px | 4px |
| track shape | ⬜ | 1-4px by density | 9999px | 9999px |
| track rest | 🔒 | `rgba(0,0,0,.5)`/`rgba(255,255,255,.5)` | `var(--muted)` | `var(--surface-container-highest)` |
| track disabled | ⚪ | off (root instead) | off (root instead) | `on-surface` @ `calc((1/.38)*.12)` |
| fill rest | 🔒 | accent `rgb(0,120,207)` | `var(--primary)` | `var(--primary)` |
| fill disabled | ⚪ | off | off | `on-surface` |
| **thumb size** | ⬜ | `2px × var(--thumb-height)` (12-18px) — a BAR | `16px × 16px` | `20px × 20px` |
| thumb shape | ⚪ | off — no radius rule at all | 9999px | 9999px |
| thumb rest | 🔒 | accent fill | white + primary ring border | `primary` fill |
| thumb hover | ⚪ | off | translucent ring | off |
| thumb focus | ⚪ | dotted outline | SAME ring as hover | off |
| thumb cursor | ⬜ | `grab` | `pointer` | `pointer` |
| thumb cursor@dragging | ⚪ | `grabbing` | off | off |
| thumb disabled | ⚪ | off (root instead) | off (root instead) | `on-surface` (relies on host opacity) |
| value-label rest | ⚪ | container/border/shadow tooltip | off | primary pill, `on-primary` text |
| value-label visible | ⚪ | CSS-only simplification of a JS-timer mechanism | off | the real mechanism |
| ticks appearance | ⚪ | 2px rects | off | 2px dots |
| root disabled | ⚪ | opacity 0.4 + pointer-events | opacity 0.5 | opacity 0.38 — see finding 4 |
| root cursor | ⚪ | `pointer` | off | off — see finding 5, a real CONTRAST with switch's own M3 column |
| root min-width | ⚪ | off | off | `200px` |
| root gap | ⚪ | ⟡ alias | off | off |
| end-labels font | ⚪ | LABEL role, by density | off | off |

---

## Declared approximations in the chassis

1. **shadcn's real Thumb is approximated as a native `<input>`, not a
   `<span role="slider">`.** The linked Radix docs describe the Thumb as a
   plain span driven entirely by JS pointer/keyboard handling, with no
   native input at all — this chassis renders a real native input anyway,
   the identical declared union checkbox.tsx/switch.tsx/radio-group.tsx
   already established.
2. **The fill is ALWAYS a real DOM element in this chassis, in every mode,
   for every column** — a declared approximation of Salt's own per-mode
   split (pseudo-element in single mode, a real `.saltSliderTrack-fill` div
   only in range mode) and M3's own always-pseudo-element mechanism,
   matching shadcn's own always-real `Range` shape instead.
3. **Every thumb gets its OWN narrow, per-thumb-centred native input**,
   matching Salt's real `SliderThumb.css` mechanism exactly — NOT M3's real
   full-track-width, clip-path-restricted input pair. Chosen because a
   narrow input needs no clip-path midpoint math to keep two range thumbs
   independently draggable, and is the SAME mechanism this component's own
   Salt source ships in production.
4. **Thumbs nest INSIDE the track**, matching Salt's real DOM exactly — a
   declared simplification for shadcn (whose real Thumbs are siblings of
   Track under Root) and M3 (whose real handles live in a separate
   `.handleContainer` sibling of `.track`). Visually and behaviourally
   equivalent since every part is absolutely positioned against a shared
   coordinate space either way, and every style row targets its own
   `data-slot` regardless of nesting depth.
5. **Value-readout visibility is CSS-only** (`:hover`/`:focus-within`/
   `:has(input:active)`, all scoped to one thumb via `:has()`), matching
   M3's own real mechanism exactly and simplifying Salt's own real
   JS-timer hover-delay. A `forceShowValue` prop exists purely for
   demonstration/testing without simulating a real pointer hover.
6. **Ticks render as real, evenly-spaced `<span>`s**, not Salt's discrete
   rect elements or M3's `radial-gradient` `background-image` trick.
7. **M3's handle-overlap outline mechanism is not reproduced** — see the
   scope table.

---

## Findings from building this matrix

1. **The busiest structural fork this registry has found for a single
   canonical row: "is range a separate component, or an axis of the same
   one" has THREE different real answers.** Salt: two exported components
   sharing internals. shadcn: thumb COUNT driven by value array length,
   genuinely uncapped (`slider-multiple.tsx` renders 3+ thumbs with zero
   code change beyond the array). M3: a `range: boolean` property. This
   matrix's own decision — one shared `range` config axis, capped at two
   thumbs — is recorded as `prop.value-shape` (the fact) and `prop.range`
   (this chassis's own resolution), not conflated into one row. See the
   scope note's own "range-slider scope decision" section for the full
   reasoning chain (grep RangeSlider.tsx first, confirm it's real, THEN
   check whether the other two systems treat range as a fork or an axis,
   THEN decide based on what the MAJORITY shape and Salt's own shared
   internals both support).

2. **A real, sourced doc-vs-code mismatch in Salt's own source, found by
   reading the destructuring statement instead of trusting the JSDoc
   comment above it.** `SliderProps.max`'s own JSDoc reads `@default 10`,
   but `Slider.tsx`'s ACTUAL destructured default is `max = 100` — the
   comment is stale relative to the code. `min = 0` is consistent in both.
   Recorded under `prop.bounds` as a fact about the CODE, not the comment,
   per CLAUDE.md's "grep, never recall" rule applied one level deeper than
   usual: even Salt's own documentation is not ground truth without
   checking the executable statement it claims to describe.

3. **M3's slider handle is colour-INVARIANT across every interaction
   state — a starker version of switch's own M3 finding, re-verified by
   reading all four tokens side by side.** `handle-color`,
   `hover-handle-color`, `focus-handle-color`, and `pressed-handle-color`
   are ALL literally `primary` — the identical value, confirmed directly in
   `_md-comp-slider.scss`. Switch's own M3 column at least varied handle
   colour by SELECTED state even when hover/focus/pressed collapsed
   together within each; slider's own handle never changes colour at ANY
   state, ever, in v0.192. Every real interaction affordance lives in the
   ripple/state-layer (documented, not rendered — the same convention every
   prior M3 column's own ripple rows use) and, at focus/hover/active, the
   CSS-only value-label appearing.

4. **A real defect, found by live Playwright verification, not by any of
   the five gates.** The first draft of `style.root.disabled` set M3's cell
   to `off`, reasoning that "M3's real disabled treatment is per-part
   (track/fill/thumb), so a flat root number would misrepresent it." That
   reasoning was TRUE about the per-part COLOUR swaps and WRONG about
   opacity: M3's real source applies a HOST-LEVEL `opacity: 0.38`
   (`:host([disabled])`) **UNCONDITIONALLY, IN ADDITION TO** the per-part
   colour swaps and the inactive track's own locally-compensated opacity —
   not one mechanism instead of the other. Verified broken live: a disabled
   M3 slider's fill/thumb rendered at `opacity: 1` (colour-swapped to
   `on-surface` but completely undimmed), and the inactive track's own
   `calc((1/0.38)*0.12)` local opacity rendered as its RAW value (~0.316)
   instead of the NET ~0.12 the compensating math is written to produce
   once multiplied by the host's own 0.38. Fixed by giving `style.root.
   disabled` a real M3 value (`opacity: 0.38`) that applies TOGETHER WITH
   the existing per-part rows, re-verified live afterward
   (`getComputedStyle` on the disabled block: root `0.38`, track's own
   local opacity `0.315789` — which compounds with the parent's `0.38`
   during paint to the intended ~0.12 net, per ordinary CSS opacity
   compounding — fill/thumb both recoloured to `rgb(29,27,32)` = `#1d1b20`
   = on-surface). Neither `gen-from-template.py` (no opinion on whether an
   `off` cell is the RIGHT choice, only whether a `locked` row has one) nor
   `check-structure.py`/`check-anatomy.mjs` (neither watches opacity
   compounding across a parent/child pair) could have caught this — only
   the live render did, exactly the point of CLAUDE.md rule 12.

5. **M3's slider writes NO `:host { cursor: ... }` rule at all — a real,
   sourced CONTRAST with switch's own M3 column, which does write one
   (SWITCH-MATRIX.md finding 6).** Re-checked specifically because that
   precedent made "M3 writes an explicit host cursor" feel like a safe
   default expectation for the next M3 column; grepping the whole of
   `_slider.scss` found no such rule. The slider's own cursor comes
   entirely from the native `input[type=range] { cursor: pointer }` rule
   instead — an M3 sibling component reaching the same VISIBLE cursor
   through a genuinely different CSS mechanism.

6. **`check-anatomy.mjs` flags `slider` with `⚠ identical part-set:
   salt=m3` (7 parts, 6 shared, 0 system-unique) — explained here, per the
   gate's own rule that a convergence must be answerable with data, not
   trust.** The gate counts a structure row as a rendered "part" whenever
   its cell `kind` is not `off`/`false`/`null`, regardless of the SPECIFIC
   VALUE. On that coarse measure, Salt and M3 both have ALL SEVEN structure
   rows populated (`root`, `track`, `fill`, `thumb`, `native-input`,
   `value-readout`, `ticks`), while shadcn has only FIVE (`value-readout`
   and `ticks` are both genuinely `off` for shadcn). So Salt and M3
   converge on WHICH categories of part exist, while shadcn genuinely has
   fewer — but Salt and M3 disagree on almost everything about the SPECIFIC
   VALUE within each category: the fill's own mechanism (Salt's per-mode
   pseudo-element-vs-real-div split vs M3's always-pseudo-element), the
   thumb's own SHAPE (Salt's fixed-width bar vs M3's solid disc), the
   value-readout's own MECHANISM (Salt's JS-timer tooltip vs M3's CSS-only
   label), and — the sharpest split — whether the handle's colour EVER
   changes on interaction (Salt: yes, hover/focus recolour the outline;
   M3: no, colour-invariant at every state, see finding 3). This is not the
   retrofit shape rule 1 forbids, for the identical reason SWITCH-MATRIX.md
   finding 12 and RADIO-GROUP-MATRIX.md finding 4 already established for
   their own coarse convergences: the gate's part-count measure is coarser
   than this matrix's own 53-row grain by design, and this paragraph is
   what satisfies "an unexplained convergence is the shape rule 1 forbids"
   — the convergence is explained, not absent.

7. **Live verification, stated plainly.** Playwright/Chromium WAS available
   this session (`executablePath: '/opt/pw-browsers/chromium'`, the same
   approach RADIO-GROUP-MATRIX.md's own build used successfully) and was run
   against BOTH `out/slider-check.html` and `out/conformance.html`. Confirmed
   live, in ALL THREE columns: (a) a real keyboard `ArrowRight` on the
   native input moves the thumb's own computed `left` position AND resizes
   the fill segment (behavior.keyboard-value-change, the real TRANSITION,
   not two static mounts); (b) a programmatic drag-equivalent value change
   (`valueAsNumber` set + a real `input` event) does the same
   (behavior.pointer-drag); (c) a range slider renders exactly two
   DISTINCT, non-overlapping thumbs whose fill spans between them and stays
   within the track's own bounds (`getBoundingClientRect` on track/fill/
   both thumbs, prop.range/prop.value-shape); (d) the value-readout, forced
   visible, sits ABOVE the thumb with zero overlap
   (`valueLabelAboveThumb: true` for both Salt and M3,
   `getBoundingClientRect` on both elements — the exact class of check
   RADIO-GROUP-MATRIX.md finding 8 says is NOT the same guarantee as a
   state-change check alone, applied here from the FIRST draft rather than
   discovered on a second pass, because thumb/value-label were given
   separate `data-slot`s deliberately up front, per this build's own
   prompt); (e) `harness/conformance.tsx`'s new `checkSlider()` — 18
   assertions across the three columns — passed 18/18, bringing the harness
   total to **107** (18 new), with the ONE pre-existing failure being the
   already-known `tabs`/shadcn/`behavior.activation-mode` issue (CLAUDE.md's
   Known-open work), unrelated to and unaffected by this build. The ONE real
   defect this session found (finding 4) was caught by the SAME live-render
   discipline that caught radio-group's own finding 1 — a missing baseline
   rule, not a wrong selector.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/slider.template.json` against every system, read from `columns/slider.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 10 light, 7 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `track-bg` | rgba(0, 0, 0, 0.5) | rgba(255, 255, 255, 0.5) | yes |
| `accent` | rgb(0, 120, 207) | — | yes |
| `tooltip-bg` | rgb(255, 255, 255) | rgb(16, 24, 32) | **no** |
| `tooltip-border` | rgba(0, 0, 0, 0.3) | rgba(255, 255, 255, 0.3) | **no** |
| `tooltip-shadow` | 0 6px 10px 0 rgba(0, 0, 0, 0.2) | 0 6px 10px 0 rgba(0, 0, 0, 0.55) | **no** |
| `tooltip-fg` | rgb(0, 0, 0) | rgb(255, 255, 255) | **no** |
| `focus-outline` | rgb(0, 69, 126) | rgb(154, 189, 245) | yes |
| `label-fg` | rgb(76, 81, 87) | rgb(177, 181, 185) | yes |
| `type-fontFamily` | 'Open Sans', sans-serif | — | **no** |
| `type-fontWeight` | 400 | — | **no** |

**shadcn** — 5 light, 3 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `muted` | oklch(0.97 0 0) | oklch(0.269 0 0) | yes |
| `primary` | oklch(0% 0 0) | oklch(0.922 0 0) | yes |
| `thumb-bg` | oklch(1 0 0) | — | yes |
| `ring` | oklch(0.708 0 0) | oklch(0.556 0 0) | yes |
| `shadow-color` | rgb(0 0 0 / 0.05) | — | yes |

**m3** — 5 light, 5 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `primary` | #6750a4 | #d0bcff | **no** |
| `on-primary` | #fff | #381e72 | **no** |
| `on-surface` | #1d1b20 | #e6e0e9 | **no** |
| `on-surface-variant` | #49454f | #cac4d0 | **no** |
| `surface-container-highest` | #e6e0e9 | #36343b | **no** |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.root` | structure | locked | `track-wrapper` | `flex host` | `the custom element itself` |
| 2 | `structure.track` | structure | locked | `pseudo-element rail` | `always-real div` | `pseudo-element track` |
| 3 | `structure.fill` | structure | locked | `pseudo-element in single mode; a REAL <div className=saltSliderTrack-fill> ONLY when isRange` | `always-real div` | `pseudo-element, always present` |
| 4 | `structure.thumb` | structure | locked | `a 2px-wide fixed-width bar, height scales by density` | `a circular 16px disc, ring-bordered, not solid-filled` | `a solid-filled circular disc (.handleNub) nested inside a larger 40px ripple/state-layer hit-area (.handle)` |
| 5 | `structure.native-input` | structure | switchable | `True` | `True` | `True` |
| 6 | `structure.value-readout` | structure | locked | `tooltip` | `none` | `label` |
| 7 | `structure.ticks` | structure | switchable | `False, True` | **off** | `False, True` |
| 8 | `behavior.role` | behavior | locked | `implicit, free from the native <input type="range">` | `[R] explicit role="slider" on a <span>, per the linked docs — no native element to get it for free from` | `implicit, free from the native <input type="range">` |
| 9 | `behavior.value-announcement` | behavior | locked | `aria-valuenow/aria-valuetext set EXPLICITLY on the input despite being implicit from a native range input already` | `[R] aria-valuenow/aria-valuemin/aria-valuemax set explicitly in JS, per the linked docs` | `implicit aria-valuenow from the native input, PLUS explicit PER-THUMB aria-valuemin/aria-valuemax (narrower than the overall min/max in range mode) and a getter-computed aria-valuetext` |
| 10 | `behavior.keyboard-value-change` | behavior | locked | `a JS OVERRIDE reproducing native Arrow/Home/End/PageUp/PageDown semantics, done so restrictToMarks/marks/stepMultiplier can be supported` | `[R] presumed JS reproducing the APG slider pattern (Arrow/Home/End/PageUp/PageDown), since there is no native input to delegate to` | `genuinely NATIVE — no keydown override computes new values at all; handleKeydown exists only to track which input is being dragged for the range-overlap flip/clamp logic` |
| 11 | `behavior.pointer-drag` | behavior | locked | `fully JS-driven — handlePointerMove recomputes the value from clientX on every window pointermove while dragging` | `[R] JS pointer tracking, since there is no native input to delegate to` | `genuinely NATIVE — the real input spans the full interactive area and the browser performs the drag; M3's own pointer listeners exist only to track hover state for the ripple` |
| 12 | `behavior.track-click-jump` | behavior | locked | `explicit JS — handlePointerDownOnTrack computes a value from the click position and jumps the thumb` | `[R] presumed, the standard Radix Slider convention per the linked docs` | `genuinely FREE — the native input's own hit area spans the full track width, so clicking anywhere on the track is clicking the input directly` |
| 13 | `behavior.value-readout-visibility` | behavior | switchable | `shown on pointer-hover (300ms-delayed hide via setTimeout), on drag, or on keyboard focus-visible; opt-OUT via showTooltip` | **off** | `shown on hover, focus-within, or active — PURE CSS, no JS state at all` |
| 14 | `behavior.disabled-handling` | behavior | locked | `const disabled = formFieldDisabled \|\| disabledProp (ancestor FormField merge, no group construct — Slider has none); .saltSliderTrack-disabled sets pointer-events:none on the wrapper` | `native disabled on Root, forwarded to every input; data-disabled:opacity-50 on Root, disabled:pointer-events-none on Thumb` | `native ?disabled on each input, PLUS a component-wide opacity dimming and per-part colour swap — see disabled-math` |
| 15 | `behavior.form-participation` | behavior | locked | `native — the input(s) ARE the real form control(s); range mode submits TWO separately-named inputs (startName/endName)` | `[R] a hidden native bubble input per thumb, per the linked docs` | `a full form-associated custom element — single mode: String(this.value); range mode: a FormData with TWO entries (nameStart/nameEnd), the SAME two-named-values shape Salt's own RangeSlider uses, arrived at independently` |
| 16 | `prop.value-shape` | prop | locked | `two separate exported components: Slider (value:number) and RangeSlider (value:[number,number]), sharing SliderTrack/SliderThumb internals` | `ONE component, thumb count driven by value/defaultValue ARRAY LENGTH — a genuinely uncapped N-thumb capability` | `ONE component, a range:boolean property forking value into valueStart/valueEnd` |
| 17 | `prop.range` | prop | locked | `False, True` | `False, True` | `False, True` |
| 18 | `prop.bounds` | prop | locked | `min: 0; max: 100` | `min: 0; max: 100` | `min: 0; max: 100` |
| 19 | `prop.step` | prop | locked | `1` | `1` | `1` |
| 20 | `prop.step-multiplier` | prop | switchable | `2` | **off** | **off** |
| 21 | `prop.disabled` | prop | locked | `False, True` | `False, True` | `False, True` |
| 22 | `prop.value-format` | prop | switchable | `a format?: (value:number) => string\|number CALLBACK, applied to the tooltip text, min/max labels, and aria-valuetext` | **off** | `STATIC STRING overrides per instance (valueLabel/valueLabelStart/valueLabelEnd) — a genuinely different mechanism from Salt's own callback, falls back to the raw value when unset` |
| 23 | `prop.restrict-to-marks` | prop | switchable | `False, True` | **off** | **off** |
| 24 | `slot.min-label` | slot | switchable | `minLabel?: string, falls back to format?.(min)` | **off** | **off** |
| 25 | `slot.max-label` | slot | switchable | `maxLabel?: string, falls back to format?.(max)` | **off** | **off** |
| 26 | `slot.composes` | slot | default | `True` | `True` | `True` |
| 27 | `state.rest` | state | locked | `a semi-transparent (50% alpha) neutral track, an accent-filled 2px-wide thumb bar` | `a muted-coloured track, a primary-coloured fill, a WHITE thumb disc with a primary-coloured 1px ring border` | `a surface-container-highest inactive track, a primary active track, a primary-filled circular handle` |
| 28 | `state.hover` | state | switchable | **off** | `a translucent 4px ring appears around the thumb` | **off** |
| 29 | `state.focus` | state | locked | `the shared --salt-focused-* outline family (2px dotted, 1px offset) on .saltSliderThumb-focusVisible` | `the SAME translucent 4px ring as hover — no separate focus-only treatment` | `colour-invariant on the handle (see handle-colour-is-interaction-invariant) — the CSS-only value-label appearing (structure.value-readout) plus a 0.12-opacity ripple and a separate md-focus-ring (not reproduced) are M3's real focus affordance` |
| 30 | `state.pressed` | state | switchable | `cursor-only — grab becomes grab-active; NO colour change` | **off** | **off** |
| 31 | `state.disabled` | state | locked | `flat opacity 0.4 on the whole track PLUS pointer-events:none on the wrapper` | `opacity 0.5 on the Root, pointer-events:none on the Thumb specifically` | `a component-wide opacity(0.38) PLUS per-part colour swap to on-surface, with the inactive track's own local opacity independently compensated back to a net 0.12` |
| 32 | `style.track.size` | style | default | `height: var(--track-height)` | `height: 6px` | `height: 4px` |
| 33 | `style.track.shape` | style | default | ⟡ `track-radius` | `9999px` | `9999px` |
| 34 | `style.track.rest` | style | locked | `background-color: var(--track-bg)` | `background-color: var(--muted)` | `background-color: var(--surface-container-highest)` |
| 35 | `style.track.disabled` | style | switchable | **off** | **off** | `background-color: var(--on-surface); opacity: calc((1 / 0.38) * 0.12)` |
| 36 | `style.fill.rest` | style | locked | `background-color: var(--accent)` | `background-color: var(--primary)` | `background-color: var(--primary)` |
| 37 | `style.fill.disabled` | style | switchable | **off** | **off** | `background-color: var(--on-surface)` |
| 38 | `style.thumb.size` | style | default | `width: 2px; height: var(--thumb-height)` | `width: 16px; height: 16px` | `width: 20px; height: 20px` |
| 39 | `style.thumb.shape` | style | switchable | **off** | `9999px` | `9999px` |
| 40 | `style.thumb.rest` | style | locked | `background-color: var(--accent)` | `background-color: var(--thumb-bg); border: 1px solid var(--primary); box-shadow: var(--shadow-color)` | `background-color: var(--primary)` |
| 41 | `style.thumb.hover` | style | switchable | **off** | `box-shadow: 0 0 0 4px color-mix(in oklab, var(--ring) 50%, transparent)` | **off** |
| 42 | `style.thumb.focus` | style | switchable | `outline: 2px dotted var(--focus-outline); outline-offset: 1px` | `box-shadow: 0 0 0 4px color-mix(in oklab, var(--ring) 50%, transparent)` | **off** |
| 43 | `style.thumb.cursor` | style | default | `grab` | `pointer` | `pointer` |
| 44 | `style.thumb.cursor@dragging` | style | switchable | `grabbing` | **off** | **off** |
| 45 | `style.thumb.disabled` | style | switchable | **off** | **off** | `background-color: var(--on-surface)` |
| 46 | `style.value-label.rest` | style | switchable | `background-color: var(--tooltip-bg); border: 1px solid var(--tooltip-border); border-radius: var(--track-radius); box-shadow: var(--tooltip-shadow); padding: 4px 8px; color: var(--tooltip-fg)` | **off** | `background-color: var(--primary); color: var(--on-primary); border-radius: 9999px; padding: 4px; min-inline-size: 28px; min-block-size: 28px` |
| 47 | `style.value-label.visible` | style | switchable | `a declared CSS-only simplification of Salt's real JS-timer hover-delay mechanism — see structure.value-readout` | **off** | `the real mechanism this chassis's own CSS-only rule matches exactly` |
| 48 | `style.ticks.appearance` | style | switchable | `width: 2px; height: var(--tick-height); background-color: var(--track-bg)` | **off** | `width: 2px; height: 2px; border-radius: 9999px; background-color: var(--on-surface-variant)` |
| 49 | `style.root.disabled` | style | switchable | `opacity: 0.4; pointer-events: none` | `opacity: 0.5` | `opacity: 0.38` |
| 50 | `style.root.cursor` | style | switchable | `pointer` | **off** | **off** |
| 51 | `style.root.min-width` | style | switchable | **off** | **off** | `200px` |
| 52 | `style.root.gap` | style | switchable | ⟡ `root-gap` | **off** | **off** |
| 53 | `style.end-labels.font` | style | switchable | `font-size: var(--label-fontSize); line-height: var(--label-lineHeight); font-family: var(--type-fontFamily); font-weight: var(--type-fontWeight); color: var(--label-fg)` | **off** | **off** |

<details><summary>Citations — 156 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.root` | salt | SliderTrack.tsx returns <div className=saltSliderTrack><div className=saltSliderTrack-container>...</div></div> |
| `structure.root` | shadcn | SliderPrimitive.Root, data-slot="slider", also the interactive touch-none host |
| `structure.root` | m3 | :host { display: inline-flex; min-inline-size: 200px } |
| `structure.track` | salt | SliderTrack.tsx <div className=saltSliderTrack-rail>; two-tone look drawn via ::before/::after in SliderTrack.css |
| `structure.track` | shadcn | SliderPrimitive.Track, data-slot="slider-track", overflow-hidden rounded-full bg-muted |
| `structure.track` | m3 | .track div; two-tone look drawn via ::before (inactive)/::after (active) in _slider.scss |
| `structure.fill` | salt | SliderTrack.tsx: `{isRange && <div className={clsx(withBaseName("fill"))} />}` |
| `structure.fill` | shadcn | SliderPrimitive.Range, data-slot="slider-range", absolutely positioned inside Track |
| `structure.fill` | m3 | .track::after — the SAME pseudo-element handles both single and range modes, range geometry done via clip-path |
| `structure.thumb` | salt | SliderThumb.css .saltSliderThumb { width: var(--salt-size-fixed-200); height: var(--salt-size-selectable) } — see width-is-fixed-not-selectable |
| `structure.thumb` | shadcn | SliderPrimitive.Thumb, data-slot="slider-thumb", size-4 rounded-full border border-primary bg-white shadow-sm |
| `structure.thumb` | m3 | _slider.scss .handleNub { border-radius: var(--_handle-shape); background: var(--_handle-color) } |
| `structure.native-input` | salt | SliderThumb.tsx <input type="range" ref={inputRef} .../>, opacity: 0.0001 (SliderThumb.css) |
| `structure.native-input` | shadcn | [R] — the linked Radix docs describe the Thumb as a <span role="slider">, not a native input at all; this chassis renders a real native input anyway, the same declared union checkbox.tsx/switch.tsx/radio-group.tsx already made |
| `structure.native-input` | m3 | slider.ts renderInput(): <input type="range" .../>, opacity:0 (_slider.scss) |
| `structure.value-readout` | salt | SliderTooltip, visibility toggled via a JS-timed hover/drag/focus state, DEFAULT ON (showTooltip=true) |
| `structure.value-readout` | shadcn | CONFIRMED ABSENCE — see no-value-display; recorded as the genuine third STRATEGY value (not a bare absence) since this row is locked with three real per-system answers |
| `structure.value-readout` | m3 | renderLabel(), a scale(0)->scale(1) pill, opt-IN via `labeled` (@property, default false) |
| `structure.ticks` | salt | SliderTrack.tsx: {marks && showTicks && <div className=saltSliderTrack-ticks>...}, opt-in, DEFAULT FALSE (showTicks unset) |
| `structure.ticks` | shadcn | CONFIRMED ABSENCE — see no-ticks-no-marks |
| `structure.ticks` | m3 | renderTrack(): ${this.ticks ? html`<div class="tickmarks">` : nothing}, opt-in via `ticks` (@property, default false) |
| `behavior.role` | salt | no explicit role attribute anywhere in SliderThumb.tsx |
| `behavior.role` | shadcn | not independently confirmable without primitives/ cloned |
| `behavior.role` | m3 | no explicit role written anywhere in slider.ts |
| `behavior.value-announcement` | salt | SliderThumb.tsx: aria-valuenow={value}, aria-valuetext={ariaValueText \|\| format?.(value).toString()} |
| `behavior.value-announcement` | shadcn | no native input to read them from |
| `behavior.value-announcement` | m3 | renderInput()'s ariaMin/ariaMax computation, renderAriaValueTextStart/End getters |
| `behavior.keyboard-value-change` | salt | see keyboard-is-js-override |
| `behavior.keyboard-value-change` | shadcn | not independently confirmable without primitives/ cloned |
| `behavior.keyboard-value-change` | m3 | slider.ts handleKeydown -> startAction(), no value computation |
| `behavior.pointer-drag` | salt | useSliderThumb.ts handlePointerMove |
| `behavior.pointer-drag` | shadcn | not independently confirmable without primitives/ cloned |
| `behavior.pointer-drag` | m3 | handleMove/handleEnter/handleLeave update handleStartHover/handleEndHover only |
| `behavior.track-click-jump` | salt | useSliderThumb.ts handlePointerDownOnTrack, wired to SliderTrack's onPointerDown |
| `behavior.track-click-jump` | shadcn | not independently confirmable without primitives/ cloned |
| `behavior.track-click-jump` | m3 | _slider.scss input[type=range] { width:100%; height:100% } |
| `behavior.value-readout-visibility` | salt | SliderThumb.tsx handlePointerEnter/handlePointerLeave, open={(isTooltipVisible \|\| trackDragging \|\| isFocusVisible) && !disabled} |
| `behavior.value-readout-visibility` | shadcn | no readout to show — see no-value-display |
| `behavior.value-readout-visibility` | m3 | _slider.scss :host(:focus-within) .label, .handleContainer.hover .label, :where(:has(input:active)) .label { transform: scale(1) } |
| `behavior.disabled-handling` | salt | Slider.tsx, SliderTrack.css |
| `behavior.disabled-handling` | shadcn | slider.tsx className strings |
| `behavior.disabled-handling` | m3 | slider.ts, _slider.scss :host([disabled]) |
| `behavior.form-participation` | salt | RangeSlider.tsx thumbProps + startName/endName |
| `behavior.form-participation` | shadcn | not independently confirmable without primitives/ cloned |
| `behavior.form-participation` | m3 | slider.ts [getFormValue]() |
| `prop.value-shape` | salt | see range-slider-is-real |
| `prop.value-shape` | shadcn | see n-thumb-capability |
| `prop.value-shape` | m3 | see range-is-a-boolean-prop |
| `prop.range` | salt | capability list — reached by choosing RangeSlider over Slider, not a prop on one component; this chassis's own config axis unifies both into one shared boolean |
| `prop.range` | shadcn | reached by passing a 2-element array; this chassis caps the real, uncapped N-thumb capability at exactly two — see n-thumb-capability |
| `prop.range` | m3 | @property({type:Boolean}) range = false |
| `prop.bounds` | salt | min=0/max=100 per the ACTUAL destructuring default in Slider.tsx — see bounds-doc-vs-code-mismatch for the stale @default 10 JSDoc |
| `prop.bounds` | shadcn | slider.tsx destructured defaults: min = 0, max = 100 |
| `prop.bounds` | m3 | @property({type:Number}) min = 0; max = 100 |
| `prop.step` | salt | Slider.tsx destructured default: step = 1 |
| `prop.step` | shadcn | [S/R] no explicit default in slider.tsx's own destructuring, but every canonical example passes step={1}; Radix's own published library default is also 1 |
| `prop.step` | m3 | @property({type:Number}) step = 1 |
| `prop.step-multiplier` | salt | Slider.tsx destructured default: stepMultiplier = 2, used by getKeyboardValue for PageUp/PageDown |
| `prop.step-multiplier` | shadcn | CONFIRMED ABSENCE — no equivalent prop; PageUp/PageDown use whatever large-step heuristic Radix's own JS implements internally, not independently configurable |
| `prop.step-multiplier` | m3 | CONFIRMED ABSENCE — no equivalent property; PageUp/PageDown use the browser's own native range-input large-step heuristic |
| `prop.disabled` | salt | SliderProps.disabled?: boolean, merged with the ancestor FormField's |
| `prop.disabled` | shadcn | native disabled, a real HTML attribute Radix forwards |
| `prop.disabled` | m3 | @property({type:Boolean}) disabled |
| `prop.value-format` | salt | SliderProps.format |
| `prop.value-format` | shadcn | CONFIRMED ABSENCE — see no-format |
| `prop.value-format` | m3 | slider.ts @property valueLabel/valueLabelStart/valueLabelEnd |
| `prop.restrict-to-marks` | salt | SliderProps.restrictToMarks?: boolean, DEFAULT FALSE — when true, step is IGNORED and the value snaps to the nearest marks[].value (utils.ts clamp) |
| `prop.restrict-to-marks` | shadcn | CONFIRMED ABSENCE — no marks/ticks capability at all, see no-ticks-no-marks |
| `prop.restrict-to-marks` | m3 | CONFIRMED ABSENCE — no equivalent concept; relies purely on step |
| `slot.min-label` | salt | SliderTrack.tsx minLabel Text |
| `slot.min-label` | shadcn | CONFIRMED ABSENCE — no endpoint text of its own |
| `slot.min-label` | m3 | CONFIRMED ABSENCE — no endpoint text element of its own (valueLabelStart overrides the START HANDLE's own readout text, it does not add a separate flanking label) |
| `slot.max-label` | salt | SliderTrack.tsx maxLabel Text |
| `slot.max-label` | shadcn | CONFIRMED ABSENCE |
| `slot.max-label` | m3 | CONFIRMED ABSENCE, same reasoning as slot.min-label |
| `slot.composes` | salt | form-field (useFormFieldProps() pulls disabled/aria-labelledby down from an ancestor <FormField>); the .saltSliderTrack-marks value-legend is declared OUT OF SCOPE, see structure.ticks |
| `slot.composes` | shadcn | label/field (id/htmlFor, field-slider.tsx's own Field/FieldTitle/FieldDescription — which is ALSO where the raw value ever becomes visible text, entirely outside this component) |
| `slot.composes` | m3 | an external, consumer-authored <label> (ariaLabel/ariaLabelStart/ariaLabelEnd); a REUSED CheckboxValidator-adjacent constraint-validation path is NOT used here (slider has its own inline form-value logic, no separate validator class) |
| `state.rest` | salt | genuinely different from every other Salt column's own opaque neutral tokens — see track-bg provenance |
| `state.rest` | shadcn | the only column whose thumb is NOT solid-accent-filled — an outline-style thumb on a filled track |
| `state.rest` | m3 | no border/outline mechanism anywhere — the handle is a solid disc, not an outlined ring |
| `state.hover` | salt | CONFIRMED ABSENCE for colour — no dedicated :hover rule in SliderThumb.css beyond the cursor change (style.thumb.cursor); the wrapper's own cursor:hover is the only rest/hover distinction |
| `state.hover` | shadcn | hover:ring-4 |
| `state.hover` | m3 | CONFIRMED ABSENCE for colour — see handle-colour-is-interaction-invariant; all visible feedback lives in the (documented, not rendered) 0.08-opacity ripple |
| `state.focus` | salt | SliderThumb.css .saltSliderThumb-focusVisible |
| `state.focus` | shadcn | focus-visible:ring-4 |
| `state.focus` | m3 | focus-handle-color equals handle-color; see behavior.value-readout-visibility |
| `state.pressed` | salt | see no-pressed-color |
| `state.pressed` | shadcn | CONFIRMED ABSENCE — no active: class of any kind; the same ring as hover/focus is the only feedback at every interaction state |
| `state.pressed` | m3 | CONFIRMED ABSENCE for colour, same finding again — a 0.12-opacity ripple plus the (declared out of scope) handle-overlap outline are the only real pressed-adjacent visuals |
| `state.disabled` | salt | SliderTrack.css .saltSliderTrack-disabled |
| `state.disabled` | shadcn | data-disabled:opacity-50, disabled:pointer-events-none |
| `state.disabled` | m3 | see disabled-math |
| `style.track.size` | salt | SliderTrack.css .saltSliderTrack-rail { height: var(--salt-size-bar) } |
| `style.track.size` | shadcn | h-1.5 |
| `style.track.size` | m3 | --_inactive-track-height, hardcoded literal, both editions |
| `style.track.shape` | shadcn | rounded-full |
| `style.track.shape` | m3 | inactive-track-shape: corner-full |
| `style.track.rest` | salt | see track-bg provenance |
| `style.track.rest` | shadcn | bg-muted |
| `style.track.rest` | m3 | inactive-track-color |
| `style.track.disabled` | salt | Salt applies a single flat opacity at the root instead — see style.root.disabled |
| `style.track.disabled` | shadcn | shadcn applies a single flat opacity at the root instead — see style.root.disabled |
| `style.track.disabled` | m3 | see disabled-math |
| `style.fill.rest` | salt | see accent provenance — the SAME --slider-track-fill custom property SliderTrack.css's own ::before rule and SliderThumb.css's own background rule both reference |
| `style.fill.rest` | shadcn | bg-primary |
| `style.fill.rest` | m3 | active-track-color |
| `style.fill.disabled` | salt | see style.track.disabled |
| `style.fill.disabled` | shadcn | see style.track.disabled |
| `style.fill.disabled` | m3 | disabled-active-track-color; the host's own opacity:0.38 applies on top, no separate local override needed |
| `style.thumb.size` | salt | see width-is-fixed-not-selectable |
| `style.thumb.size` | shadcn | size-4 |
| `style.thumb.size` | m3 | handle-height/handle-width, hardcoded literals, both editions |
| `style.thumb.shape` | salt | CONFIRMED ABSENCE — no border-radius rule anywhere in SliderThumb.css; a plain rectangular bar |
| `style.thumb.shape` | shadcn | rounded-full |
| `style.thumb.shape` | m3 | handle-shape: corner-full |
| `style.thumb.rest` | salt | SliderThumb.css .saltSliderThumb { background: var(--slider-track-fill) } |
| `style.thumb.rest` | shadcn | bg-white border border-primary shadow-sm |
| `style.thumb.rest` | m3 | handle-color |
| `style.thumb.hover` | salt | CONFIRMED ABSENCE — see state.hover |
| `style.thumb.hover` | shadcn | hover:ring-4 ring-ring/50 |
| `style.thumb.hover` | m3 | CONFIRMED ABSENCE — see handle-colour-is-interaction-invariant |
| `style.thumb.focus` | salt | SliderThumb.css .saltSliderThumb-focusVisible { outline-style: var(--salt-focused-outlineStyle); outline-width: var(--salt-focused-outlineWidth); outline-offset: var(--salt-focused-outlineOffset); outline-color: var(--salt-focused-outlineColor) } — the SAME accent-stronger focus-outline slot every prior Salt column (checkbox/switch/radio-group) already resolves |
| `style.thumb.focus` | shadcn | focus-visible:ring-4 ring-ring/50 |
| `style.thumb.focus` | m3 | same finding as style.thumb.hover |
| `style.thumb.cursor` | salt | SliderThumb.css .saltSliderThumb { cursor: var(--salt-cursor-grab) } |
| `style.thumb.cursor` | shadcn | [R] Tailwind's own default interactive-element cursor; no dedicated cursor-grab class in the canonical source |
| `style.thumb.cursor` | m3 | inherited from the native input[type=range] { cursor: pointer } rule — see no-host-cursor |
| `style.thumb.cursor@dragging` | salt | SliderThumb.css .saltSliderThumb:active, .saltSliderThumb-dragging { cursor: var(--salt-cursor-grab-active) } |
| `style.thumb.cursor@dragging` | shadcn | CONFIRMED ABSENCE — no dedicated active-cursor rule |
| `style.thumb.cursor@dragging` | m3 | CONFIRMED ABSENCE — no dedicated active-cursor rule |
| `style.thumb.disabled` | salt | see style.track.disabled |
| `style.thumb.disabled` | shadcn | see style.track.disabled |
| `style.thumb.disabled` | m3 | disabled-handle-color; relies on the host's own opacity:0.38, no separate opacity override |
| `style.value-label.rest` | salt | SliderTooltip.css — border-radius reuses --saltTooltip-borderRadius's own fallback to palette-corner-weak, approximated here with the same corner-weaker slot track-radius already resolves for a self-contained column; padding is spacing-50/spacing-100 at medium density, 4px/8px |
| `style.value-label.rest` | shadcn | no value-label element renders — see no-value-display |
| `style.value-label.rest` | m3 | label-container-color, label-label-text-color, corner-full, label-container-height=28px |
| `style.value-label.visible` | shadcn | nothing to show or hide |
| `style.value-label.visible` | m3 | see behavior.value-readout-visibility |
| `style.ticks.appearance` | salt | SliderTrack.css .saltSliderTrack-tick { background: var(--slider-track-background); height: var(--slider-tick-height); width: var(--salt-size-fixed-200) } |
| `style.ticks.appearance` | shadcn | CONFIRMED ABSENCE — see no-ticks-no-marks |
| `style.ticks.appearance` | m3 | with-tick-marks-container-size=2px, with-tick-marks-container-shape=corner-full, with-tick-marks-inactive-container-color=on-surface-variant — rendered here as real dots rather than M3's own radial-gradient background-image trick |
| `style.root.disabled` | salt | SliderTrack.css .saltSliderTrack-disabled { opacity: 0.4 }, .saltSliderTrack-disabled .saltSliderTrack-wrapper { pointer-events: none } |
| `style.root.disabled` | shadcn | data-disabled:opacity-50 on Root |
| `style.root.disabled` | m3 | :host([disabled]) { opacity: var(--_disabled-active-track-opacity) } — see disabled-math; applies TOGETHER WITH the per-part colour swaps (style.track.disabled/style.fill.disabled/style.thumb.disabled), not instead of them |
| `style.root.cursor` | salt | SliderTrack.css .saltSliderTrack-wrapper { cursor: var(--salt-cursor-hover) } |
| `style.root.cursor` | shadcn | CONFIRMED ABSENCE — no cursor utility on Root itself |
| `style.root.cursor` | m3 | CONFIRMED ABSENCE — see no-host-cursor |
| `style.root.min-width` | salt | no minimum-width floor — the track is width:100% of its parent with no minimum |
| `style.root.min-width` | shadcn | CONFIRMED ABSENCE — no min-width utility on Root |
| `style.root.min-width` | m3 | see min-width-floor |
| `style.root.gap` | shadcn | no owned end-label text, nothing to space |
| `style.root.gap` | m3 | no owned end-label text, nothing to space |
| `style.end-labels.font` | salt | SliderTrack.tsx <Text color="secondary" styleAs="label">, see byDensity.label-fontSize/label-lineHeight and label-fg provenance |
| `style.end-labels.font` | shadcn | no end-label element renders |
| `style.end-labels.font` | m3 | no end-label element renders |

</details>

<!-- END GENERATED VALUES -->
