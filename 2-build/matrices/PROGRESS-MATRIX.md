# Progress — component template matrix

*Twelfth live component in the post-clean-slate pipeline (button, calendar,
spinner, tooltip, alert, input, select, dialog, tabs, card, badge came before).
Same method as [BADGE-MATRIX.md](BADGE-MATRIX.md) / [CARD-MATRIX.md](CARD-MATRIX.md) /
[TABS-MATRIX.md](TABS-MATRIX.md) / [DIALOG-MATRIX.md](DIALOG-MATRIX.md) /
[SELECT-MATRIX.md](SELECT-MATRIX.md): one master template (union of all six
pieces across systems), columns per design system, rows switched
on/off/inherited per column.*

**Cell legend** · `⟡ slot` = alias to shared contract slot · **bold** = the
system's own switch · `OFF` = row switched off in this column · `INHERIT` =
system silent, registry default applies · `[S]` = value extracted from source
this session · `[R]` = not directly sourced (reason always given).

**Row policies** · 🔒 locked-on (no column may switch it off) ·
⚪ switchable (on where the system has it) · ⬜ on-with-default.

**Naming rule** — grammar `<piece>.<part>[.<subpart>].<property>[@state]`,
enforced by `contract/template.schema.json`'s `row.id` pattern.

**Progress is the fifth component to ship the third gate.**
`scripts/check-progress-behavior.mjs` follows `check-badge-behavior.mjs`'s
contract with **two declared extensions** (see finding 12) and repeats the same
honest closing caveat: it proves code **exists and is bound**, not that it
**runs** or that it is **correct**.

**The headline of this matrix.** Progress is the component where the three
systems agree on the *word* and disagree on almost everything under it. All
three say `role="progressbar"` — the exact inverse of
[SPINNER-MATRIX.md](SPINNER-MATRIX.md) finding 1, where the same three produced
`img` / `status` / `progressbar` for one idea. And then: **three different
mechanisms move the same pixel** (a `width`, a `translateX`, a `scaleX`), and
**two systems solved "tell the user how far along we are" in opposite channels
and neither did both** — Salt draws "75 %" on screen and writes no
`aria-valuetext`; shadcn writes an `aria-valuetext` percentage and draws
nothing.

---

## Scope note — the three boundaries, resolved

### 1 · Determinate vs indeterminate — where does `spinner` stop?

**The rule: `spinner` owns indeterminate-CIRCULAR. `progress` owns determinate
(both shapes) plus indeterminate-LINEAR.** Together they cover the space with
no gap and no double-ownership.

This is not a registry invention. It is what two of the three systems do in
code, and the third's structure forces the same split:

| | indeterminate circular | indeterminate linear | determinate linear | determinate circular |
|---|---|---|---|---|
| **Salt** | `Spinner` — a *separate component* [S] | **`LinearProgress`** — `isIndeterminate = value === undefined && bufferValue === undefined`, a 66% band on a 1.8s keyframe [S] | **`LinearProgress`** [S] | **`CircularProgress`** [S] |
| **shadcn** | `Spinner` — a separate component (lucide `Loader2Icon`) [S] | **`Progress`** — ARIA only; the visual is an EMPTY BAR (finding 3) [S] | **`Progress`** [S] | — none anywhere [S] |
| **M3** | the merged family, **already claimed by spinner** [S] | **the merged family** — the `linear.indeterminate.*` token [S] | **the merged family** [S] | **the merged family** [S] |

Two independent source facts settle it:

- **Salt's `CircularProgress` has no indeterminate mode at all.** It defaults
  `value = 0` and writes `aria-valuenow={Math.round(value)}`
  *unconditionally*; `LinearProgress` has the inference and the keyframe and
  `CircularProgress` has neither [S]. Salt's own `usage.mdx` says the same in
  prose under **When not to use**: *"When a task or operation will take an
  indeterminate length of time to complete. Instead, use `Spinner`."* And
  `index.mdx` lists Spinner under `relatedComponents: [{ relationship:
  "similarTo" }]` — ***similar to*, not the same as** [S].
- **shadcn is identical in shape**: `Spinner` for the circular indeterminate
  glyph, `Progress` for the bar.

**The one genuine overlap is M3, and it is handled by cross-reference, not by
re-modelling.** M3 has *one* token family for both readings, so
`spinner.m3.json` and `progress.m3.json` legitimately draw the same colour and
thickness numbers from the same file. No **row** is owned twice: spinner owns
the rotation (`style.root.duration` / `.easing`, a value-less arc); progress
owns the value-driven arc and the **stop indicator**. The boundary is made a
matrix cell rather than an assumption —
[`structure.indeterminate-circular`](#1--structure-parts) exists and is **OFF
in all three columns**, with a different sourced reason per column, the same
treatment `badge.template.json` gave `behavior.live-region`.

**Was spinner's boundary drawn wrong?** No — but **one of its derivations
was**, and this matrix deliberately diverges from it. See declared
approximation 4.

### 2 · Linear vs circular — one component or two?

**One canonical component with a `shape` axis, and that axis is STRUCTURE
(lesson 6), not a colour delta.** A linear progress is a clipped horizontal box
with an absolutely-positioned fill; a circular progress is a ring whose arc
length is the value. **They share no element.** The chassis branches; the
skeleton renders a `<div>` tree or an `<svg>` and nothing in between.

Source says "one component" three times, in three different ways:

1. **Salt files them as one.** `packages/core/src/progress/` is **one
   directory** containing `LinearProgress/` and `CircularProgress/`, and
   `index.tsx` is two `export *` lines. One docs page, titled *Progress*, whose
   own description reads: *"Two **variants** are available to accommodate
   different layouts: `CircularProgress` and `LinearProgress`."* Their prop
   interfaces are character-for-character identical — `bufferValue`,
   `hideLabel`, `max`, `min`, `value` — and so is their ARIA and their label
   formatter [S].
2. **M3 explicitly MERGED them.** Every token in
   `_md-comp-linear-progress-indicator.scss` and
   `_md-comp-circular-progress-indicator.scss` now carries: *"@deprecated Token
   set deprecated in favour of a merged token set which combines the circular
   and linear progress indicator. Please use `md.com.progress-indicator` tokens
   instead."* [S] And the merged set files tokens **by concern, not by
   component**: colour and shape for all three parts live in the shared
   `_md-comp-progress-indicator.scss`; only geometry splits into
   `-linear.scss` / `-circular.scss` [S].
3. **shadcn is single-valued**, which cannot argue either way — but its
   `Progress` and its `Spinner` being different components is the *determinacy*
   split, not the shape split.

**No source default exists between the two shapes** in either multi-valued
column — Salt's are peer exports, M3's are peer sub-namespaces. `linear` is
listed **first as a DECLARED REGISTRY ORDERING CHOICE**, because it is the only
shape all three columns express, and that is stated rather than passed off as a
source default (the same treatment TABS-MATRIX.md gave M3's `emphasis` and
CARD-MATRIX.md gave M3's `variant`). See the lesson-3 audit, finding 11.

### 3 · `docs/COMPONENTS.md` disagrees, twice — flagged, not edited

`docs/COMPONENTS.md` lines 59–61 (columns are **shadcn | Salt | M3**) read:

```
| progress (linear)   | ✓          | ✓          | ✓ linear-progress(-indicator)   |
| progress (circular) | — (spinner)| — (spinner)| ✓ circular-progress(-indicator) |
| spinner             | ✓          | ✓          | — (= circular-progress)         |
```

Two problems:

1. **The Salt cell on `progress (circular)` is factually wrong.**
   `salt-ds/packages/core/src/progress/CircularProgress/CircularProgress.tsx`
   exists, is exported from `@salt-ds/core`, has its own docs example
   (*"Circular progress"*, the FIRST example on the page) and its own e2e
   suite [S]. The likely cause is visible in COMPONENTS.md's own header note —
   it was built by listing `src/` **directories**, and Salt's two exports live
   in one directory. The shadcn cell on that row is correct.
2. **This matrix collapses its two rows into one**, per boundary 2 above.

**Reported, not edited** — the same treatment CARD-MATRIX.md gave
COMPONENTS.md's `link-card` placement. If the owner keeps two rows, nothing in
this build moves except the row labels: `prop.shape`'s two values and the nine
`[data-shape]`-gated style rows would split, and nothing else.

### What is out of scope, and why (structural reasons, declared not dropped)

| excluded | where | structural reason |
|---|---|---|
| `slider` / `range-slider` | `salt-ds/packages/core/src/slider`, `docs/COMPONENTS.md` line 41 (its own canonical row, ✓ in all three) | **The brief's suspicion is confirmed — they DO share track tokens.** `slider/internal/SliderTrack.css` line 2 is `--slider-track-background: var(--salt-sentiment-neutral-track)`, the identical token backing `.saltLinearProgress-track`, and line 54 is `height: var(--salt-size-bar)`, the identical groove height [S]. **A shared FOUNDATION token is not a shared component.** A progress bar is an **output**: no tab stop, no handler, no keyboard, `role="progressbar"`, and a value the user cannot change. A slider is an **input**: a focusable thumb, `role="slider"`, arrow keys, and a value the user *does* change. Every one of `behavior.non-interactive`'s greps comes back the other way for slider. Modelling them together would have made a progress bar focusable. |
| `skeleton` / shimmer placeholder | `docs/COMPONENTS.md` line 67 (`✓ / — / —`, shadcn only) | Its own canonical row, and a different contract: a skeleton stands in for **content whose shape is known and whose arrival time is not**; it reports **nothing** — no value, no range, no role, no percentage. It is an indeterminate *placeholder*, where a progress bar is a determinate *readout*. It is also single-column, so there is no cross-system contract to hang rows on. |
| M3 `wave` families | `_md-comp-progress-indicator-{linear,circular}.scss` — `active-indicator-wave-amplitude/-wavelength`, `with-wave-height/-size`, `indeterminate-active-indicator-wave-wavelength` | M3 Expressive's wavy indicator, the same exclusion SPINNER-MATRIX.md made. **One exception, claimed rather than dropped:** the *existence* of `linear.indeterminate.active-indicator.wave.wavelength` is used as the [S] evidence that M3 has an indeterminate linear mode at all (`structure.indeterminate-band`); its 20px value is not modelled [S]. |
| M3 `thick` families | both shape files | Every member is `@deprecated` with *"No longer tokenized as a variant, but rather a sample configuration in code"* — self-disowned as a variant by source. Same treatment SPINNER-MATRIX.md gave it [S]. |
| M3 `four-color-*` | the two **deprecated** singular files only | A real four-token family (`primary` / `primary-container` / `tertiary` / `tertiary-container`) that material-web's own wrappers **do** support — and that has **no counterpart in the merged family** and no equivalent in either other system. Excluded with the edition, not on its own merits; recorded because it is the one capability the `latest` pin *loses* [S]. |
| Salt's circular **buffer** geometry | `CircularProgress.tsx` / `.css` | In scope as a *part* (`structure.buffer` is on for Salt) but **not modelled in the circular shape** — see declared approximation 2. Four more nested overlay divs with JS-computed rotations; no style row describes them, and the row says so rather than the chassis silently dropping them. |

---

## Sources

- **Salt** [S]: `packages/core/src/progress/index.tsx`;
  `progress/LinearProgress/{LinearProgress.tsx,LinearProgress.css}`;
  `progress/CircularProgress/{CircularProgress.tsx,CircularProgress.css}`.
  Behaviour and defaults cross-checked against
  `packages/core/src/__tests__/__e2e__/progress/{LinearProgress.cy.tsx,CircularProgress.cy.tsx}`,
  `packages/core/stories/progress/{linear-progress.stories.tsx,circular-progress.stories.tsx,progress.qa.stories.tsx,useProgressingValue.tsx}`
  and `site/docs/components/progress/{index,usage,examples,accessibility}.mdx`.
  Token chains through
  `packages/theme/css/next/characteristics/{sentiment,content,container,text}.css`;
  `packages/theme/css/next/palette/{alpha,foreground,background}.css`;
  `packages/theme/css/next/foundations/color.css`;
  `packages/theme/css/foundations/{size,spacing,typography,alpha,zindex,borderStyle}.css`;
  and `packages/core/src/salt-provider/{SaltProvider.tsx,ThemeApplicator.tsx}`
  for the default heading font. Read only to fix the boundary:
  `packages/core/src/slider/internal/SliderTrack.css`. Reused rather than
  re-derived: `docs/foundations/{sizes,spacing,typography,colors,density,layers,motion,shape}.md`.
- **shadcn** [S]: `apps/v4/registry/new-york-v4/ui/progress.tsx` (canonical,
  **sole** source for every style cell — 31 lines, two elements, two class
  strings, no cva); `apps/v4/app/globals.css` (token values);
  `apps/v4/registry/new-york-v4/examples/progress-demo.tsx`;
  `apps/v4/examples/radix/{progress-demo,progress-label,progress-rtl,progress-controlled}.tsx`.
  Read only to fix the boundary: `apps/v4/registry/bases/{radix,base,aria}/ui/progress.tsx`
  and `apps/v4/content/docs/components/radix/progress.mdx`.
  **Behaviour and ARIA only** (per the brief):
  `primitives/packages/react/progress/src/progress.tsx`.
- **Material 3** [S]: `tokens/versions/latest/sass/_md-comp-progress-indicator.scss`
  (the shared colour/shape family) and `…-progress-indicator-{linear,circular}.scss`
  (geometry); `tokens/versions/latest/sass/_md-comp-{linear,circular}-progress-indicator.scss`
  and `tokens/versions/v0_192/_md-comp-{linear,circular}-progress-indicator.scss`
  (the edition diff); the hand-authored `tokens/_md-comp-{linear,circular}-progress.scss`;
  `versions/latest/sass/{_md-sys-color.scss,_md-sys-color__dark.scss,_md-ref-palette.scss,_md-sys-shape.scss}`.
  **material-web is a tokens-only clone**, so every M3 structure and behavior
  row is `[R]` and every style cell is `[S]`.

### Edition pin — `versions/latest`, and it is load-bearing TWICE

Pinned to **`tokens/versions/latest/sass`**, matching spinner, tooltip, alert,
input, select, dialog, tabs, card and badge; calendar and button remain on
`v0.192`. The tally becomes **10 latest / 2 v0.192** — the minority has not
moved for six components running, the split is still open, and it still wants
one registry-wide decision. **Flagged for the owner for the tenth time.**

The diff here is the largest of any component so far:

1. **The entire merged family does not exist in `v0_192`.** That edition ships
   only `_md-comp-{linear,circular}-progress-indicator.scss`, both of which
   `latest` marks `@deprecated` on **every token**. So on `v0.192` there would
   be **no stop indicator at all** — and the stop indicator is precisely what
   SPINNER-MATRIX.md finding 6 deferred to this matrix to claim [S].
2. **The pin changes modelled values**, unlike badge (where the diff was zero):
   - linear `track-color`: `surface-container-highest` (**#e6e0e9 / #36343b**)
     → `secondary-container` (**#e8def8 / #4a4458**)
   - linear `track-shape` **and** `active-indicator-shape`: `corner-none`
     (**0px**) → `corner-full` (**9999px**)
   - circular `size`: **48px** → **40px**
   - **new in `latest`**: `stop-indicator-{color,shape,size,trailing-space}`,
     `track-active-indicator-space`, the wave families, the indeterminate
     wavelength
   - **lost in `latest`**: the `four-color-*` family
   
   **M3 changed its linear progress from a square-ended bar on a neutral track
   to a fully rounded bar on a tinted track, and gave it an end dot.** That is a
   redesign, not a token rename.
3. Within the two *deprecated* files, `latest` and `v0_192` are
   **value-identical** — the whole change is the arrival of the merged family.

**The counter-argument, weighed rather than hidden.** material-web's own
`tokens/_md-comp-linear-progress.scss` and `_md-comp-circular-progress.scss`
both `@use 'versions/v0_192/md-comp-{linear,circular}-progress-indicator'` —
**the shipped library pins v0.192 for this exact component**, exactly as it does
for card, tabs and badge. Here it carries **no weight**, for a reason specific
to this component: following it would delete the very tokens the previous
matrix explicitly deferred here, and would ship a component whose own token file
says, on every line, to use the other one. `latest` is taken; the disagreement
is recorded on the cells and in `progress.m3.json`'s provenance.

**No borrow was declared, and no token name was invented.** Every M3 number
below is in a file. The two places M3 supplies nothing —
`style.indeterminate.duration` and `.easing` — carry an explicitly **labelled
REGISTRY DEFAULT** rather than an invented M3 value, the same treatment
`spinner.m3.json` gave its rotation duration, and for the same reason: the
structure row is *on*, so a silent no-op would be the fallback CLAUDE.md rule 3
forbids.

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **shape** | 🔒 | **`linear` \| `circular`** — two peer exports from one directory, identical prop sets [S] | **`linear` only** — confirmed absence [S] | **`linear` \| `circular`** — one merged family, two sub-namespaces [S] |
| **fill mechanism** | 🔒 | **`width`** — `style={{ width: `${progress}%` }}` inline on the bar [S] | **`translate`** — `style={{ transform: `translateX(-${100 - value}%)` }}` on a full-width indicator in an `overflow-hidden` track [S] | **`scale`** — material-web's own comment: *"can only control track since scaling is used on buffer/progress"* [S] |
| track | 🔒 (invariant) | on — `.saltLinearProgress-track` / `.saltCircularProgress-track` [S] | on — the **Root element itself** carries `bg-primary/20`; the track is a background, not a child [S] | on — `track-{color,thickness,shape}` [S] |
| **buffer** | ⚪ | **on** — `bufferValue`, a second pending indicator; linear gets one div, circular gets **four more nested overlays** [S] | **OFF — confirmed absence** [S] | **OFF** — no buffer token in either edition [S] |
| **stop indicator** | ⚪ | OFF [S] | OFF [S] | **on — and this is SPINNER-MATRIX.md finding 6's debt, claimed.** `latest` only [S] |
| **label** | ⚪ | **on, AND ON BY DEFAULT** — `hideLabel = false`, so a bare Salt progress shows its percentage. A `<Text styleAs="h2">` part that **moves between the shapes**: beside the bar in linear, absolutely centred over the ring in circular [S] | **OFF** — its own examples build one out of `Field` + `FieldLabel` [S] | **OFF** — no label token [S] |
| **indeterminate band** | ⚪ | **on** — `width: 66%` + a 1.8s `translateX(-100% → 155% → 200%)` keyframe [S] | **OFF — a SOURCED absence with a visible consequence** (finding 3) [S] | **on** — evidenced by a token, not an element: `linear.indeterminate.active-indicator.wave.wavelength` [S] |
| **indeterminate circular** | ⚪ | **OFF** — `CircularProgress` has no indeterminate branch [S] | **OFF** — no circular form [S] | **OFF** — the tokens exist and **spinner already claims that reading** [S] |

### The two axes that were nearly smoothed over

**Linear and circular are two GEOMETRIES, not one box restyled.** They share no
element: one is `position: absolute` inside an `overflow: hidden` box, the other
is a stroked SVG circle. Salt writes them as two components, M3 as two
sub-namespaces with two different *size* concepts (`height` vs `size`). A
`border-radius: 50%` on the linear box would have produced neither.

**The fill mechanism is structure too, and the three answers have three
different consequences.** `width` reflows and cannot be GPU-composited but
honours a radius exactly. `translate` composites but is **not direction-aware**
— shadcn's own RTL example has to add `className="rtl:rotate-180"` and flip the
whole bar by hand [S]. `scale` composites but **distorts everything inside it**,
which is exactly why material-web lists M3's `active-indicator-shape` as
unsupported. One boolean "filled" flag would have hidden all three.

## 2 · Behavior

**Every row below is implemented in `skeleton/progress.tsx` and asserted by
`scripts/check-progress-behavior.mjs`.** There are eight, and **not one of them
is an event handler** — a progress bar is an output.

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **role** | 🔒 | **`progressbar`**, hardcoded on both exports' root div [S] | **`progressbar`**, on `Primitive.div` [S] | **`progressbar`** [R] — *all three agree; see finding 1* |
| **value range** | 🔒 | **`min-max`** — both are real props, both published, and the percentage is normalised over `(max − min)` [S] | **`max-only`** — Radix has **no `min` prop** and hardcodes `aria-valuemin={0}` [S] | **`none`** [R] |
| **determinacy detection** | 🔒 | **inferred, LINEAR ONLY** — `value === undefined && bufferValue === undefined`; `CircularProgress` has no such line [S] | **inferred, three-state** — `data-state` = `indeterminate` / `loading` / `complete` on **both** elements [S] | **unanswerable** [R] |
| **value now** | 🔒 | omitted when **`value === undefined`** — a *different* condition from the visual indeterminacy above (finding 14); **`Math.round`ed** when present [S] | omitted when `value` is not a number; **NOT rounded** [S] | [R] |
| **value text** | ⚪ | **OFF — confirmed absence** [S] | **on** — `aria-valuetext` from `getValueLabel`, default `` `${pct}%` `` — *announced but never drawn* [S] | OFF [R] |
| **label formatting** | ⚪ | **`percent-spaced`** — `` `${Math.round(progress)} %` `` (with a **space**), and the literal **`"— %"`** (em dash) when indeterminate [S] | OFF [S] | OFF [S] |
| **buffer visibility** | ⚪ | **truthy-and-positive** — `bufferValue && bufferValue > 0`, so `bufferValue={0}` renders nothing *yet still suppresses the indeterminate band* [S] | OFF [S] | OFF [S] |
| **non-interactive** | 🔒 | identical — no tabindex, no handler, no `:hover`/`:focus`/`:disabled` [S] | identical [S] | identical — no state-layer, focus-indicator, hover, pressed or disabled family in **either edition** [S] |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **`shape`** | ⚪ | **`linear` \| `circular`** — **NO SOURCE DEFAULT** (two peer exports) [S] | **`linear` only** [S] | **`linear` \| `circular`** — no source default (two peer sub-namespaces) [S] |
| **`determinacy`** | ⚪ | **CAPABILITY LIST** `[determinate, indeterminate]` — inferred, never selected [S] | **CAPABILITY LIST** — both real in ARIA, only one real visually [S] | **CAPABILITY LIST** [S] |
| `hideLabel` | ⚪ | **`false` \| `true`, DEFAULT `false`** — the JSDoc says so in words [S] | OFF [S] | OFF [S] |
| `max` | ⬜ | **100** [S] | **100** (Radix `DEFAULT_MAX`, with a `console.error` on an invalid value — Salt has no such guard) [S] | OFF [S] |
| `min` | ⚪ | **0** [S] | **OFF, and it is a CEILING not an omission** — the concept is unreachable [S] | OFF [S] |
| `size` | — | **no row.** No system has a size axis on progress: Salt scales by *density* only, shadcn hardcodes `h-2`, and M3's only size alternative is the self-disowned `thick`. Recorded here rather than padded. | — | — |
| `variant` / `tone` | — | **no row.** No system has one. A progress bar is one colour in all three: Salt accent blue, shadcn `--primary`, M3 `primary`. | — | — |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| label | ⚪ | **Component-owned in one system, consumer-owned in another — a stronger divergence than a missing part.** Salt formats the string itself and renders it through its own `Text` at `styleAs="h2"` — **DECLARED COMPOSITION** to a future `text` component. shadcn has no part; `progress-label.tsx` and `progress-rtl.tsx` both build the percentage out of `Field` + `FieldLabel` and a hand-written `<span>` — **DECLARED COMPOSITION** to `field`/`label`, both unbuilt. M3 has neither. |
| composes (declared) | ⬜ | **DECLARED COMPOSITION**: (a) **`text`** — Salt's label, and the only typography in this component in any system; (b) **`field`** / **`label`** — where a shadcn progress's visible percentage actually lives; (c) **`button`** — *every* Salt story drives the value with Start/Stop/Reset buttons (`useProgressingValue.tsx`), i.e. the component is always shown under external control; (d) **`card`** — shadcn's `savings-progress` block puts a progress inside one. All render as neutral placeholders; nothing is imported. |

## 5 · States

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| rest | 🔒 | accent blue over a **50%-alpha** groove, **the bar TWICE the groove's thickness** [S] | `bg-primary` over `bg-primary/20` — **the only track of the three derived from the fill's own colour** [S] | `primary` over `secondary-container`, two unrelated roles [S] |
| indeterminate | ⚪ | a 66% band on a 1.8s sweep, label `"— %"`, no `aria-valuenow` [S] | `data-state="indeterminate"`, no `valuenow`, no `valuetext` — **and an EMPTY BAR** [S] | the mode exists; no geometry token for it [S] |
| **complete** | ⚪ | OFF [S] | **on, AND DATA-ONLY** — `data-state="complete"` at `value === max` on both elements, and **nothing in `progress.tsx` selects on it** [S] | OFF as a *state* — but the **stop indicator is the same idea as geometry** [S] |
| rest/hover/focus/pressed/disabled | 🔒 (info) | **none exist** — confirmed absence in all three (see `behavior.non-interactive`). Where the card and tab files both **gained** a focus-indicator family in `latest`, progress did not. | — | — |

## 6 · Styles — the cell matrix

All cells at each system's default: Salt medium density, `linear`; shadcn its
only configuration; M3 the `latest` merged family, `linear` baseline.

### root

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **min-width** | ⚪ | **`400px`** — a hardcoded pixel literal with **no token behind it**, density-invariant, and large enough that a Salt linear progress cannot sit in a narrow column at all [S] | **OFF** — `w-full` and nothing else [S] | OFF [S] |
| colour | ⚪ | `content-primary-foreground` → **black / white** — it exists to colour the label, which takes `color: inherit` [S] | OFF [S] | OFF [S] |

### the track and its groove

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| track height | ⬜ | ⟡ `size-bar-strong` → **4/8/12/16 by density** — the FAT measure [S] | **8px** (`h-2`), density-invariant [S] | **4px** (`linear.height`) [S] |
| **track shape** | ⬜ | **`0` — confirmed absence. A Salt linear progress has SQUARE ENDS** [S] | **9999px** (`rounded-full`) [S/R] | **9999px** (`track-shape` → `corner-full`) — **and `0px` in v0.192** [S] |
| groove height | ⬜ | ⟡ `size-bar` → **2/4/6/8** — **HALF the container** [S] | `100%` (the groove *is* the container in source) [S] | `100%` (`track.thickness` 4px = `height` 4px) [S] |
| groove offset | ⚪ | **`calc((size-bar-strong − size-bar) / 2)`** → 1/2/3/4 — the arithmetic that centres a thin rail in a fat box [S] | OFF [S] | OFF [S] |
| groove colour | 🔒 | ⟡ `sentiment-neutral-track` → `alpha-contrast-high` → **`rgba(0,0,0,0.5)` / `rgba(255,255,255,0.5)`** — a translucent wash that inverts, and much the highest-contrast track of the three [S] | ⟡ `bg-primary/20` → `color-mix(in oklab, --primary 20%, transparent)` — **derived from the fill** [S] | ⟡ `track-color` → `secondary-container` → **`#e8def8` / `#4a4458`** [S] |
| groove shape | ⚪ | OFF [S] | OFF (the radius lives on the track element, which in source is the same element) [S] | **9999px** — the only column where track-box and track-shape are distinct tokens [S] |

### the indicator

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| thickness | ⬜ | **`100%`** — `top: 0; bottom: 0`, so it fills the FAT container and stands proud of the thin groove [S] | `100%` (`h-full`) [S] | **4px** (`active-indicator-thickness`, tokenised **separately** from the track's) [S] |
| colour | 🔒 | ⟡ `sentiment-accent-background` → **blue-500 `rgb(0,120,207)`, MODE-INVARIANT** [S] | ⟡ `--primary` → **`oklch(0% 0 0)` / `oklch(0.922 0 0)`** — it **inverts** where Salt holds still [S] | ⟡ `active-indicator-color` → `primary` → **`#6750a4` / `#d0bcff`** [S] |
| shape | ⚪ | OFF (square) [S] | OFF — clipped by the track's `rounded-full` + `overflow-hidden` rather than carrying a radius [S] | **9999px**, **carried with its disownment** (finding 5) [S] |
| **trailing space** | ⚪ | OFF — the fill sits flush [S] | OFF [S] | **4px** (`track-active-indicator-space`) — a gap between the fill's end and the remaining track. **No equivalent anywhere else**, and absent from v0.192 [S] |
| transition | ⚪ | **`transform 0.2s linear` — AND IT IS DEAD** (finding 4) [S] | **`transition-all`** — property list [S], 150ms / `cubic-bezier(0.4,0,0.2,1)` [R]; it *does* cover what moves [S] | OFF — no motion token [S] |

### indeterminate motion

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| duration | ⚪ | **`1.8s`**, a hardcoded literal — twice its own spinner's 0.9s, and like it not routed through Salt's duration foundation [S] | OFF (nothing to time) [S] | **DECLARED ABSENCE** — labelled registry default [S] |
| easing | ⚪ | **`ease-in-out`** — and here Salt *does* match its own foundation (`--salt-animation-timing-function` is the only easing curve it declares), still written as a literal [S] | OFF [S] | **DECLARED ABSENCE** — M3 defines ten easing tokens and the progress files reference **none** of them [S] |

### buffer / stop indicator / label

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **buffer paint** | ⚪ | **on, and NOT a faded fill** — `background: container-primary-background` (the **page's own surface colour**, snow / jet) with `outline: solid size-fixed-100 accent` at `outline-offset: -1px`, i.e. an **opaque hole punched in the groove with a 1px accent hairline drawn inside its own edge** [S] | OFF [S] | OFF [S] |
| buffer z-index | ⚪ | **`zIndex-default` = 1**, against the bar's `calc(zIndex-default * 2)` = 2 [S] | OFF [S] | OFF [S] |
| **stop-indicator box** | ⚪ | OFF | OFF | **4px square**, `trailing-space: 0px` — flush with the far edge [S] |
| **stop-indicator paint** | ⚪ | OFF | OFF | **`primary` — the ACTIVE INDICATOR'S OWN COLOUR**, `corner-full`. Both live in the **shared** file, not the linear one [S] |
| label type | ⚪ | **`600 18px/24px 'Open Sans'` @medium** (14/18 · 18/24 · 24/32 · 32/42 by density) — **the H2 HEADING role**, so at touch density the percentage is **32px** [S] | OFF [S] | OFF [S] |
| label gap | ⚪ | `spacing-100` → **4/8/12/16**, and it is a **padding on the label**, not a `gap` on the root [S] | OFF [S] | OFF [S] |

### the circular ring

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| diameter | ⚪ | **`size-base × 3`** → 60/84/108/132 — **more than twice the diameter of Salt's own large spinner** (56px @medium) [S] | OFF [S] | **40px** — and **48px** in the deprecated set [S] |
| ring track | ⚪ | `sentiment-neutral-track` at `size-bar`, drawn as an `outline` at `offset: -1.5 × size-bar`, ring centre at `diameter/2 − 2·size-bar` = **26/34/42/50** [S] | OFF | `track-color` at 4px, r = **18px** [S] |
| ring indicator | ⚪ | `accent` at `size-bar-strong` (**again twice the track**), drawn as a border-box `border`, ring centre at `(diameter − size-bar-strong)/2` = **28/38/48/58** — i.e. **OUTSIDE the track's ring, not concentric** [S] | OFF | `active-indicator-color` at 4px, **CONCENTRIC** at r = 18px [S] |

**Accent scope trim.** `sentiment-accent-background` resolves through
`palette-accent`, which has a `data-accent` axis (`blue` default, `teal`
alternate). This column pins **blue**, matching
`button/input/select/dialog/tabs/card/badge.salt.json`; only
`calendar.salt.json` models `byAccent`. Recorded, not modelled.

---

## Declared approximations in the chassis

Five, all stated rather than smoothed.

1. **The circular ring is one SVG circle with a `pathLength`-100 dash.** Salt
   draws its ring as **four rotated half-overlay divs** with JS-computed angles
   (`getRotationAngle = -180 + ((bar - shift) / 50) * 180`); M3's real
   implementation is an SVG arc. A CSS-only chassis needs one concrete
   geometry, the same declaration `skeleton/spinner.tsx` makes for its fixed
   arc sweep. The *radii and thicknesses* are each column's own [S] values; the
   *drawing method* is the chassis's.
2. **The buffer renders in the LINEAR shape only.** Salt has a circular buffer
   too — `bufferOverlay{Right,Left}` / `bufferSubOverlay{Right,Left}` /
   `bufferBackground` / `bufferBorder`, four more nested divs — and no style row
   describes it. Declared here rather than half-drawn.
3. **The groove is always a dedicated full-bleed child.** In Salt it must be
   (its rail is half the container's height and carries an offset). In shadcn
   and M3 the groove *is* the container in source, and painting it on a
   100%-tall child is byte-equivalent.
4. **M3's circular radii deliberately DIVERGE from `spinner.m3.json`, and this
   is the one place this matrix says the earlier component got a derivation
   wrong.** `spinner.m3.json` read `track-active-indicator-space` **radially**,
   putting its arc at **r = 10px** inside a track at **r = 18px**. For an
   indeterminate spinner — an arc orbiting inside a ring — that reads as a
   plausible design. For a **determinate** ring it would put the fill on a
   *different circle* from the track it is filling, which is visibly wrong: you
   could not tell how full the track was. This matrix therefore makes both radii
   **18px (concentric)** and carries the 4px space as an **unmodelled ANGULAR
   gap** — a declared expressibility gap of a CSS-only chassis. **The two
   components now disagree about the same token, on purpose.** M3's published
   circular geometry places the space along the arc, not across the radius, so
   the concentric reading is the better one and **`spinner.m3.json`'s radial
   reading probably wants revisiting.** Not edited — it is another component's
   file and scope discipline forbids touching it. **Flagged for the owner.**
5. **M3's 4px trailing space is exact at 100% and approximate below it.** It is
   emitted as `margin-inline-end` on an indicator that is stretched between both
   insets and then `scaleX`-ed, so at 100% there really is a 4px gap before the
   track's end (the case the token is illustrated with) and at partial fills the
   gap scales with the transform — which is an inherent property of a **scale**
   mechanism and would be true of material-web's own implementation too.
   Reproducing M3's published behaviour exactly would require clipping the track
   at a per-instance offset, which **no token describes**. Related: because the
   groove is full-bleed, the gap region shows the *track* colour rather than the
   page. Declared, and left visible in the harness rather than papered over.

---

## Findings from building this matrix

1. **All three systems agree on `role="progressbar"`, and the agreement is the
   finding — because the same three systems disagreed three ways about the
   spinner.** SPINNER-MATRIX.md finding 1 recorded `img` / `status` /
   `progressbar` for one concept. Here Salt hardcodes `progressbar` on both
   exports, Radix writes it on `Primitive.div`, and the APG convention agrees.
   Set beside BADGE-MATRIX.md finding 2 — where **all three** shipped **zero**
   ARIA — the pattern is now clear: **there is no house a11y style to
   generalise from; it is a per-component question and it has to be re-grepped
   every time.** The brief said so and source confirmed it in the strongest
   possible way, by producing the opposite answer from the immediately
   preceding component.
2. **The divergence moved from the role to the value attributes, and it is a
   perfect inversion.** Salt **draws** "75 %" on screen and writes **no**
   `aria-valuetext`. shadcn writes an `aria-valuetext` percentage and **draws
   nothing** — its own examples make the consumer hand-write the number in a
   `FieldLabel`, where it can silently go stale. **Two systems solved the same
   problem in opposite channels and neither did both.** Beneath that, three more
   sourced divergences: Salt has a real `min` and Radix hardcodes `0` with no
   prop at all; Salt **rounds** `aria-valuenow` and Radix does not
   (`value={35.6}` announces 36 in one and 35.6 in the other); and Salt's
   *label* is normalised over `(max − min)` while its *valuenow* is not, so with
   `min={20} max={40} value={35}` the bar says **"75 %"** and announces **35** —
   deliberately, and its own e2e test asserts exactly that instance.
3. **shadcn's indeterminate exists in ARIA and not on screen, and one `||`
   causes it.** Radix fully supports the mode (`value` null →
   `data-state="indeterminate"`, `aria-valuenow` and `aria-valuetext` both
   omitted). shadcn's style line is
   `transform: translateX(-${100 - (value || 0)}%)`. **`null || 0` is `0`**, so
   an indeterminate shadcn progress renders as a **motionless empty bar** that
   still tells a screen reader it is indeterminate. Confirmed by grep: no
   keyframe, no `animate-` utility and no `data-[state=indeterminate]:` rule
   anywhere in the file. This is not a missing feature to fill in — it is a
   sourced absence with a visible consequence, and it is why
   `structure.indeterminate-band` is a switchable row rather than a locked one.
4. **Salt declares two transitions and neither can ever fire.**
   `.saltLinearProgress-bar` carries `transition: transform 0.2s linear` — and
   the component animates **`width`**, an inline style, not `transform`.
   `.saltLinearProgress-track` carries the identical declaration and **never
   moves at all**. Reproduced as source has it and flagged. It is the same class
   of source self-contradiction as CARD-MATRIX.md finding 6's
   `transition: box-shadow var(--salt-duration-instant)` where the duration is
   **0ms** — and it brings the pipeline's tally of Salt self-contradictions to
   five (the tooltip arrow, the `fade-out-back` keyframe with no transform, the
   `LinkCard` focus recolour that recolours nothing, the 0ms transition, and
   now a transition on a property that never changes). Separately: both `1.8s`
   and `0.2s` are **hardcoded literals**, not references to Salt's own duration
   foundation, which defines `--salt-duration-notable: 1000ms` right next door
   (`docs/foundations/motion.md`) — **the third component to show that
   pattern**, after spinner's 0.9s.
5. **material-web disowns a token and, for the first time, gives a mechanical
   reason.** `tokens/_md-comp-linear-progress.scss` lists
   `active-indicator-shape` under `$unsupported-tokens` above the comment
   *"can only control track since scaling is used on buffer/progress"*, and
   `_md-comp-circular-progress.scss` does the same with *"must be circular"*.
   Every previous instance of this generated-tokens-vs-shipped-library
   disagreement (SELECT finding 6, DIALOG finding 8, TABS finding 11, CARD
   finding 3, BADGE's letter-spacing row) was a bare list or a `TODO(b/…)`.
   **This one explains itself, and the explanation is a structural fact worth
   more than the token:** it is how we know M3's fill mechanism is `scaleX`,
   which is a `structure` row in this matrix and is [S] because of that single
   comment. The generated value is taken and the disownment is recorded; the
   consequence is *visible* in the harness, where an M3 bar at 0% shows its
   `corner-full` radius squashed flat.
6. **Three systems, three fill mechanisms, and each one costs something
   different.** `width` (Salt) reflows and cannot composite but honours a radius
   exactly. `translate` (shadcn) composites but is **not direction-aware** — the
   docs' own RTL example flips the entire bar with `rtl:rotate-180`. `scale`
   (M3) composites but distorts its own contents. This is `structure`, not
   style: a boolean "filled" flag would have hidden a difference that decides
   whether the component can be rounded and whether it works in Arabic.
7. **Salt's fill is TWICE as thick as its track, in BOTH shapes, and it is the
   same two tokens each time.** Linear: the container is `size-bar-strong`
   (8px @ medium) and the groove is `size-bar` (4px), with the groove pushed
   down by `calc((bar-strong − bar) / 2)` to centre it — so the accent bar is a
   fat overlay standing proud of a thin rail. Circular: the track is an
   `outline` of `size-bar` and the indicator a `border` of `size-bar-strong`,
   and because of how `outline-offset: -1.5 × bar` resolves, the indicator's ring
   sits **outside** the track's rather than concentric with it (r = 38 against
   34 at medium). shadcn and M3 both make fill and track the same thickness.
   One system's progress bar is a *marker over a guide*; the other two's is a
   *filled channel*.
8. **Salt's label is an H2, and that is a design decision hiding in a
   typescale.** `<Text styleAs="h2">` resolves to semibold 600 Open Sans at
   **18px/24px at medium** and **32px/42px at touch** — a heading, not a
   caption, for a status readout. It also **moves between the shapes inside one
   system**: a flex sibling with `padding-left: spacing-100` in linear, and
   `position: absolute` full-size flex-centred in circular. This is the only
   typography anywhere in this component in any of the three systems, which puts
   progress between CARD-MATRIX.md finding 1 (no system declares any) and
   BADGE-MATRIX.md (all three do).
9. **Salt's buffer is an opaque hole, not a faded fill — and the construction
   says so twice.** `background: container-primary-background` is the **page's
   own surface colour** (snow / jet), and the 1px accent `outline` at
   `outline-offset: -1px` draws a hairline *inside* its own edge. So a Salt
   buffer reads as an empty outlined segment ahead of the solid fill. It is also
   the only part of this component with **no assistive representation at all**:
   it enters neither the label (`examples.mdx`: *"The buffer is a pending value
   so will not affect the progress label"*) nor any ARIA attribute — a second
   quantity shown to sighted users only.
10. **Frozen-token check, run in both directions, found nine real density moves
    and one genuine fixed-scale value.** Moving with density: `size-bar-strong`
    (4/8/12/16), `size-bar` (2/4/6/8), their difference-over-two (1/2/3/4),
    `spacing-100` (4/8/12/16), `text-h2` (14/18 · 18/24 · 24/32 · 32/42),
    `size-base × 3` (60/84/108/132) and both derived ring radii — snapshotting
    medium would have been wrong at three of four densities in every one of
    them. **Density-invariant by design: `size-fixed-100` = 1px**, the buffer's
    hairline, on the **fixed** scale per `docs/foundations/sizes.md` line 14 —
    carried as a plain `1px` rather than per density, the same finding
    CARD-MATRIX.md finding 10 made for its border. Salt's **`min-width: 400px`**
    is density-invariant for a different and less flattering reason: it is not a
    token at all. shadcn's 8px and all of M3's 4px / 40px values are invariant
    because neither system has a density capability
    (`docs/foundations/density.md`).
11. **Axis self-audit (run deliberately, per ALERT-MATRIX.md finding 10).**
    Every `channel: "config"` row whose cell is a list of 2+ values, and what
    discriminates each value:
    - **`structure.shape` / `prop.shape`** — Salt `[linear, circular]`, M3
      `[linear, circular]`: discriminated by a **real skeleton branch** (a
      `<div>` tree vs an `<svg>`; **the two forms share no element**) and by
      **nine** `[data-shape]`-gated CSS rows. **NO SOURCE DEFAULT EXISTS in
      either column** — Salt's are two peer exports with no umbrella component
      to default, M3's are two peer sub-namespaces — so `linear` is first as a
      **DECLARED REGISTRY ORDERING CHOICE** (it is the only shape all three
      columns express, so a linear-first harness compares three columns rather
      than two), and the absence of a source default is recorded rather than
      papered over, the same treatment TABS-MATRIX.md gave M3's `emphasis` and
      CARD-MATRIX.md gave M3's `variant`. Weak counter-signals were checked and
      rejected as defaults: `index.tsx` exports Circular first (alphabetical)
      and `examples.mdx` shows Circular first — **neither is a default**,
      because there is no single component to default. shadcn is single-valued
      `[linear]`.
    - **`prop.determinacy`** — all three `[determinate, indeterminate]`: a
      **CAPABILITY LIST, not an ordered default**, declared as such because the
      ordering convention differs from the enum rows (the same declaration
      `card.template.json`'s `disabled`/`hoverable` and tabs' `[true,false]`
      rows had to make). **The skeleton never reads `value[0]`** — it infers
      determinacy from the per-instance `value` exactly as Salt and Radix do,
      then clamps it on the shape. Discriminated by `structure.indeterminate-band`
      (a real block: `width: 66%` + a keyframe), by `style.indeterminate.duration`
      and `.easing`, and by three skeleton branches (the band gate, the
      `aria-valuenow` omission, and the `"— %"` label). Listing determinate
      first would have been meaningless and indeterminate first actively
      misleading, so the list is capability-ordered and the row says so.
    - **`prop.hide-label`** — Salt `[false, true]`: also a **capability list**,
      but written **DEFAULT-FIRST** so that `value[0]` and the source default
      agree even though the skeleton reads the per-instance prop. The source
      states the default in words (*"Defaults to `false`"*), so there was no
      excuse to get it backwards.
    - **`prop.max`** (100, two columns) and **`prop.min`** (0, Salt): **single
      sourced defaults**, not lists and not capability lists.
    - **Single-valued across every column, so nothing to discriminate:**
      `structure.fill-mechanism` (three values, one per column, each
      discriminated by a real skeleton branch producing a genuinely different
      inline style), `behavior.role` (one value, three columns — the agreement
      *is* the cell), `behavior.value-range` (three values, one per column,
      discriminated by which ARIA attributes are written and by whether
      `aria-valuenow` is rounded), `behavior.value-text`,
      `behavior.label-formatting`, `state.complete` and every boolean
      `structure.*` row.
    **Result: no dead axis values, every capability list is declared as such,
    every list with a source default is default-first, and the two axes with NO
    source default say so explicitly.** The rows off in every column
    (`structure.indeterminate-circular`) are retained deliberately, as the
    machine-readable form of the spinner boundary.
12. **The third gate, fifth outing, with two declared extensions and an
    inverted guard block.** `scripts/check-progress-behavior.mjs` covers all
    **eight** behavior rows (three locked/info). Two extensions to
    `check-badge-behavior.mjs`'s contract, declared in the script's own header
    rather than slipped in: (a) `symbol` may be an **array**, because two rows
    assert two separate halves of one behaviour — `aria-valuenow` is both
    *omitted when indeterminate* **and** *rounded when present*, and the buffer
    test is both a truthiness check **and** a `> 0` check, and collapsing each
    pair into one fragile multi-line match would have proved less; (b) an entry
    may declare **`forbidden`** tokens that must NOT appear, because
    `behavior.non-interactive` is a confirmed absence in all three systems and
    the only honest way to assert an absence is negatively — a marker constant
    would have been dead code that proved nothing. An entry with **neither**
    `symbol` **nor** `forbidden` fails, so the extension cannot smuggle in a
    vacuous entry. The `REF_EFFECT_GUARDS` block is **inverted**, as badge's is:
    `skeleton/progress.tsx` has zero effects and zero refs, and — this is the
    point for *this* component — the one thing that might have tempted a
    measurement, **the fill percentage, is deliberately an inline style on the
    element that consumes it** rather than a measured width routed through a
    custom property (lesson 2, and SELECT-MATRIX.md's frozen-width bug). Source
    does the same in both Salt and shadcn. Introducing an effect or a ref
    without declaring it fails the gate.
13. **A `docs/foundations/*.md` cross-check: four claims confirmed, none
    contradicted.** `sizes.md` line 9 (`--salt-size-bar` 2/4/6/8) and line 10
    (`--salt-size-bar-strong` 4/8/12/16) match `foundations/size.css` exactly;
    line 14's fixed-scale claim (`size-fixed-*` density-invariant by design) is
    confirmed by `size-fixed-100` = 1px in every density block.
    `typography.md` line 55's title row (Salt `--salt-text-h2-fontSize` 18px /
    `-lineHeight` 24px) matches `next/characteristics/text.css` at medium
    exactly. `shape.md` line 10's pill row (shadcn "no pill token; components
    use `rounded-full`, a bare Tailwind utility"; M3 `corner-full` 9999px) is
    confirmed by `progress.tsx` and `_md-sys-shape.scss` line 51.
    `layers.md`'s claim that Salt is the only system with a shared z-index
    scale is confirmed again (`zIndex-default` on the buffer, against two
    columns with none). `motion.md` is confirmed **and is the source of finding
    4**: `--salt-duration-notable: 1000ms` and a single `ease-in-out` easing
    curve exist and Salt's progress references neither. `state-layers.md` and
    `elevation.md` are **not consulted** — progress has no state layer and no
    elevation in any of the three systems — so **CARD-MATRIX.md finding 11's
    report on `state-layers.md` stands unchanged and unreinforced.**
14. **Salt has TWO different notions of "we do not know", keyed on two
    different conditions — and it was caught by RENDERING the case, not by
    reading the code.** `aria-valuenow` is omitted on
    `value === undefined` **alone**; the visual indeterminacy (the band, the
    `"— %"` label) is gated on `value === undefined && bufferValue ===
    undefined`. They disagree in exactly one instance:
    `<LinearProgress bufferValue={65} />` renders a **static 0% bar labelled
    "0 %"** — visually determinate — **and publishes no `aria-valuenow` at
    all**. The first draft of this chassis keyed both off one flag and
    published `aria-valuenow="0"` there. It passed the generator, the axis
    audit and the behaviour gate; a screenshot would have looked perfect,
    because the pixel output was identical. It was found by rendering sixteen
    instances to static markup and reading the attributes. **That is the
    SELECT-MATRIX.md finding-16 shape again, one layer down**: the gate proves
    the code exists, not that it is right, and the only thing that catches
    "right" is exercising the actual case. Recorded as a method note as much as
    a source note.
15. **One cross-component inconsistency found in a file this build must not
    touch** — see declared approximation 4: `themes/columns/spinner.m3.json`'s
    circular arc radius (10px, a *radial* reading of
    `track-active-indicator-space`) and this matrix's (18px, *concentric*) are
    two different readings of one token. Progress's is the better one for a
    determinate ring and probably the better one full stop. **Flagged for the
    owner, not edited.**

## An owner decision this component surfaces: M3's `latest` pin is now doing real work

For badge the edition pin was a no-op; for card it supplied one focus family.
Here it is the difference between two visibly different components — a
square-ended bar on a neutral track with no end marker, versus a fully rounded
bar on a tinted track with a 4px stop dot and a 4px trailing gap — **and it is
the only edition in which the tokens the previous matrix explicitly deferred to
this one exist at all.** Meanwhile material-web's shipped library pins the
*other* edition for this exact component, as it does for card, tabs and badge.

Ten components now sit on `latest` and two (calendar, button) on `v0.192`. The
pipeline has flagged this ten times and it is no longer a bookkeeping question:
`v0.192` and `latest` disagree about **what an M3 progress bar looks like**.
Three options, no default chosen:

1. **Leave the split** — every matrix pins deliberately and records why. Maximum
   local fidelity, permanent inconsistency across the registry.
2. **Move everything to `latest`** — one edition, and calendar/button get
   re-derived. This matrix's evidence favours it.
3. **Follow material-web's own pins per component** — the shipped library is the
   thing consumers actually get. For progress that would mean **deleting the
   stop indicator**, which is the debt this matrix was asked to claim.

Recorded rather than decided, per the pipeline's instruction to queue taste
decisions instead of blocking on them.

## Owner-validation pass — two corrections, one of them to an already-shipped component

**Verified in the DOM.** The three fill mechanisms are genuinely different and
now confirmed by computed style, not by reading source: Salt sets **`width`**
(152px of a 411px track at 37%); shadcn renders a **full-width box and
translates it** (`matrix(1,0,0,1,-289.8,0)`); M3 renders a full-width box and
**scales it** (`matrix(0.37,0,0,1,0,0)`). Salt's whole-range normalisation is
real: `min=20 max=40 value=35` renders 75% full and labels "75 %" while
`aria-valuenow` stays `35`.

### Correction 1 — `spinner.m3.json` had its arc on the wrong circle

Spinner derived the M3 arc radius by subtracting
`$track-active-indicator-space` (4px) **and** `$track-thickness` (4px)
**radially** from the track radius, giving arc `r=10` inside track `r=18`.
Both strokes are 4px, so that renders two separate concentric rings 8px apart
— visible as a dark arc floating inside a wide light donut, which is not what
M3 looks like. M3's active indicator and track share ONE circle:
`r = (size − thickness) / 2 = 18px`. `track-active-indicator-space` is an
**angular** gap along the circumference where the arc ends meet the track, not
a radial inset. Fixed: arc `r` is now 18px, and the 4px is recorded as a
declared unmodelled angular gap rather than mis-spent radially.

Why it survived spinner's own validation: the value was *derived*, not
extracted, so no provenance check could contradict it; the arithmetic was
internally consistent; and on an indeterminate spinner a smaller inner arc
still reads as "a spinner". It only became obviously wrong once a
**determinate** ring put a fill and its track side by side. **A derivation can
be individually plausible and still wrong in a way only a neighbouring
component reveals.**

### Correction 2 — M3's ARIA was internally inconsistent, and the render was worse than either extreme

`behavior.role` accepted "APG convention" as its `[R]` source, while
`behavior.value-now` and `behavior.value-range` refused the same source as
"unanswerable". The result: every M3 bar, **including determinate ones at
0/37/100%**, rendered `role="progressbar"` with no `aria-valuenow`. That is
not a declared absence — `role=progressbar` without a value means
*indeterminate* to assistive tech, so determinate M3 bars announced as
indeterminate. Withholding half a contract asserts something false.

Corrected to the same `[R]` standard already used for the role, and
triangulated by the two GREPPED columns, which independently agree on the
identical contract. Verified after the fix: determinate M3 bars carry
`valuenow`/`min`/`max`, the indeterminate one omits `valuenow`.

**The transferable rule: apply one evidence standard per column.** If a
`[R]` source is good enough to assert a row, it is good enough for the rows
that row implies — and a partial ARIA contract is worse than none, because it
makes a claim it then contradicts.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/progress.template.json` against every system, read from `columns/progress.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 5 light, 4 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `accent` | rgb(0, 120, 207) | rgb(0, 120, 207) | yes |
| `root-color` | rgb(0, 0, 0) | rgb(255, 255, 255) | yes |
| `groove-color` | rgba(0, 0, 0, 0.5) | rgba(255, 255, 255, 0.5) | yes |
| `buffer-fill` | rgb(255, 255, 255) | rgb(16, 24, 32) | yes |
| `buffer-hairline` | 1px | — | yes |

**shadcn** — 3 light, 2 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `indicator-bg` | oklch(0% 0 0) | oklch(0.922 0 0) | yes |
| `groove-bg` | color-mix(in oklab, oklch(0% 0 0) 20%, transparent) | color-mix(in oklab, oklch(0.922 0 0) 20%, transparent) | yes |
| `track-radius` | 9999px | — | yes |

**m3** — 3 light, 2 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `action` | #6750a4 | #d0bcff | yes |
| `x-m3-surface-container-highest` | #e6e0e9 | #36343b | yes |
| `shape-corner-none` | 0px | — | yes |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.shape` | structure | locked | `linear, circular` | `linear` | `linear, circular` |
| 2 | `structure.fill-mechanism` | structure | locked | `width` | `translate` | `scale` |
| 3 | `structure.track` | structure | locked | — | — | — |
| 4 | `structure.buffer` | structure | switchable | `True` | **off** | **off** |
| 5 | `structure.stop-indicator` | structure | switchable | **off** | **off** | **off** |
| 6 | `structure.label` | structure | switchable | `True` | **off** | **off** |
| 7 | `structure.indeterminate-band` | structure | switchable | `True` | **off** | `True` |
| 8 | `structure.indeterminate-circular` | structure | switchable | **off** | **off** | **off** |
| 9 | `behavior.role` | behavior | locked | `progressbar` | `progressbar` | `progressbar` |
| 10 | `behavior.value-range` | behavior | locked | `min-max` | `max-only` | `min-max` |
| 11 | `behavior.determinacy-detection` | behavior | locked | `inferred-linear-only` | `inferred, three-state` | `unanswerable` |
| 12 | `behavior.value-now` | behavior | locked | `rounded, omitted when indeterminate` | `raw, omitted when indeterminate` | `raw, omitted when indeterminate` |
| 13 | `behavior.value-text` | behavior | switchable | **off** | `True` | **off** |
| 14 | `behavior.label-formatting` | behavior | switchable | `percent-spaced` | **off** | **off** |
| 15 | `behavior.buffer-visibility` | behavior | switchable | `truthy-and-positive` | **off** | **off** |
| 16 | `behavior.non-interactive` | behavior | locked | — | — | — |
| 17 | `prop.shape` | prop | switchable | `linear, circular` | `linear` | `linear, circular` |
| 18 | `prop.determinacy` | prop | switchable | `determinate, indeterminate` | `determinate, indeterminate` | `determinate, indeterminate` |
| 19 | `prop.hide-label` | prop | switchable | `False, True` | **off** | **off** |
| 20 | `prop.max` | prop | default | `100` | `100` | **off** |
| 21 | `prop.min` | prop | switchable | `0` | **off** | **off** |
| 22 | `slot.label` | slot | switchable | `component-owned` | `consumer-owned` | **off** |
| 23 | `slot.composes` | slot | default | `text, button` | `field, label, card` | **off** |
| 24 | `state.rest` | state | locked | `accent bar over a 50%-alpha groove, bar 2x the groove's thickness` | `bg-primary over bg-primary/20 — the track is the fill at 20%` | `primary indicator over a surface-container-highest track, two unrelated colour roles` |
| 25 | `state.indeterminate` | state | switchable | `66% band, 1.8s sweep, label "— %", no aria-valuenow` | `ARIA-only: data-state=indeterminate, no valuenow, no valuetext, EMPTY BAR` | `mode exists [R], no geometry token, no duration token` |
| 26 | `state.complete` | state | switchable | **off** | `True` | **off** |
| 27 | `state.interaction-states` | state | locked | `none` | `none` | `none` |
| 28 | `style.root.min-width` | style | switchable | `400px` | **off** | **off** |
| 29 | `style.root.color` | style | switchable | ⟡ `root-color` | **off** | **off** |
| 30 | `style.track.height` | style | default | ⟡ `linear-track-height` | `8px` | `4px` |
| 31 | `style.track.shape` | style | default | `0` | ⟡ `track-radius` | ⟡ `shape-corner-none` |
| 32 | `style.groove.height` | style | default | ⟡ `linear-groove-height` | `100%` | `100%` |
| 33 | `style.groove.offset` | style | switchable | ⟡ `linear-groove-offset` | **off** | **off** |
| 34 | `style.groove.color` | style | locked | ⟡ `groove-color` | ⟡ `groove-bg` | ⟡ `x-m3-surface-container-highest` |
| 35 | `style.groove.shape` | style | switchable | **off** | **off** | ⟡ `shape-corner-none` |
| 36 | `style.indicator.thickness` | style | default | `100%` | `100%` | `4px` |
| 37 | `style.indicator.color` | style | locked | ⟡ `accent` | ⟡ `indicator-bg` | ⟡ `action` |
| 38 | `style.indicator.shape` | style | switchable | **off** | **off** | ⟡ `shape-corner-none` |
| 39 | `style.indicator.trailing-space` | style | switchable | **off** | **off** | **off** |
| 40 | `style.indicator.transition` | style | switchable | `transform 0.2s linear` | `all 150ms cubic-bezier(0.4, 0, 0.2, 1)` | **off** |
| 41 | `style.indeterminate.duration` | style | switchable | `1.8s` | **off** | `1.8s` |
| 42 | `style.indeterminate.easing` | style | switchable | `ease-in-out` | **off** | `ease-in-out` |
| 43 | `style.buffer.color` | style | switchable | `background: var(--buffer-fill); outline: solid var(--buffer-hairline) var(--accent); outline-offset: calc(var(--buffer-hairline) * -1)` | **off** | **off** |
| 44 | `style.buffer.z-index` | style | switchable | `1` | **off** | **off** |
| 45 | `style.stop-indicator.size` | style | switchable | **off** | **off** | **off** |
| 46 | `style.stop-indicator.paint` | style | switchable | **off** | **off** | **off** |
| 47 | `style.label.font` | style | switchable | ⟡ `label-type` | **off** | **off** |
| 48 | `style.label.gap` | style | switchable | ⟡ `label-gap` | **off** | **off** |
| 49 | `style.circular.size` | style | switchable | `inline-size: var(--circular-diameter); block-size: var(--circular-diameter)` | **off** | `inline-size: 48px; block-size: 48px` |
| 50 | `style.circular.track` | style | switchable | `stroke: var(--groove-color); stroke-width: var(--circular-track-thickness); r: var(--circular-track-radius)` | **off** | **off** |
| 51 | `style.circular.indicator` | style | switchable | `stroke: var(--accent); stroke-width: var(--circular-indicator-thickness); r: var(--circular-indicator-radius)` | **off** | `stroke: var(--action); stroke-width: 4px; r: 22px` |

<details><summary>Citations — 104 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.shape` | salt | packages/core/src/progress/index.tsx exports both; index.mdx: "Two variants are available to accommodate different layouts: CircularProgress and LinearProgress." NO SOURCE DEFAULT — two peer exports; linear is first as a declared registry ordering choice. |
| `structure.shape` | shadcn | CONFIRMED ABSENCE — progress.tsx is a horizontal bar and there is no circular progress file anywhere in the clone. shadcn's circular loading affordance is the separate Spinner component (lucide Loader2Icon), already matrixed. |
| `structure.shape` | m3 | versions/v0_192/_md-comp-linear-progress-indicator.scss and versions/v0_192/_md-comp-circular-progress-indicator.scss — TWO SEPARATE FILES under this pin, one per shape, rather than latest's merged family with linear/circular sub-namespaces. The evidence for the axis is if anything stronger (two whole token sets exist) even though the filing changed; what is lost is the merged family's argument th |
| `structure.fill-mechanism` | salt | LinearProgress.tsx: const barStyle = { width: isIndeterminate ? undefined : `${progress}%` } applied inline to the bar div |
| `structure.fill-mechanism` | shadcn | progress.tsx: style={{ transform: `translateX(-${100 - (value \|\| 0)}%)` }} inline on a full-width indicator inside an overflow-hidden track |
| `structure.fill-mechanism` | m3 | material-web tokens/_md-comp-linear-progress.scss $unsupported-tokens: 'active-indicator-shape', above the comment `// can only control track since scaling is used on buffer/progress` — the shipped library scales the indicator, which is exactly why it cannot honour a corner radius on it. UNAFFECTED BY THE PIN: this is the hand-authored top-level wrapper, not an edition file, and it @use's versions |
| `structure.buffer` | salt | LinearProgress.tsx bufferValue prop -> .saltLinearProgress-buffer; CircularProgress.tsx renders four extra overlay divs when buffer > 0 |
| `structure.buffer` | shadcn | CONFIRMED ABSENCE — neither progress.tsx nor the Radix primitive has a second value of any kind |
| `structure.buffer` | m3 | no buffer token in any of the five progress files in either edition. The word appears once, in material-web's own scaling comment, naming something the token set does not describe. |
| `structure.stop-indicator` | salt | no end marker of any kind in either Salt CSS file |
| `structure.stop-indicator` | shadcn | no end marker; and see state.complete, which is the same idea expressed as a data attribute nothing styles |
| `structure.stop-indicator` | m3 | DECLARED GAP, and the headline loss of this pin. In `latest` this row was ON, sourced from the merged md.comp.progress-indicator family's $stop-indicator-color / $stop-indicator-shape plus _md-comp-progress-indicator-linear.scss's $stop-indicator-size 4px and $stop-indicator-trailing-space 0px — four real, non-deprecated tokens. THE PINNED EDITION HAS NONE OF THEM: the string 'stop' appears ZERO t |
| `structure.label` | salt | LinearProgress.tsx / CircularProgress.tsx: {!hideLabel && <Text styleAs="h2" …>} with hideLabel = false — ON BY DEFAULT |
| `structure.label` | shadcn | CONFIRMED ABSENCE in the component. Its own examples supply one by COMPOSITION — progress-label.tsx wraps the bar in Field + FieldLabel and hand-writes <span className="ml-auto">66%</span>, i.e. consumer-owned text the component neither formats nor keeps in sync. |
| `structure.label` | m3 | no typescale, label or text token in any of the five progress files in either edition |
| `structure.indeterminate-band` | salt | LinearProgress.css .saltLinearProgress-indeterminate: width 66% + a 1.8s translateX keyframe |
| `structure.indeterminate-band` | shadcn | See provenance.indeterminate — the mode exists in ARIA and renders as an empty bar. A sourced absence, not an omission. |
| `structure.indeterminate-band` | m3 | DECLARED SOURCE SUBSTITUTION, WITH AN EVIDENCE DOWNGRADE — read this before trusting the cell. Under the previous `latest` pin the source was $indeterminate-active-indicator-wave-wavelength: 20px in _md-comp-progress-indicator-linear.scss, the only explicitly indeterminate-qualified token in M3's whole progress family. THAT TOKEN DOES NOT EXIST IN v0.192. What survives in versions/v0_192/_md-comp- |
| `structure.indeterminate-circular` | salt | CircularProgress.tsx has NO indeterminate branch — value defaults to 0 and aria-valuenow is written unconditionally. Salt's usage.mdx sends the indeterminate case to Spinner, which docs/SPINNER-MATRIX.md already owns. |
| `structure.indeterminate-circular` | shadcn | no circular form at all; the indeterminate circular case is shadcn's Spinner, owned by docs/SPINNER-MATRIX.md |
| `structure.indeterminate-circular` | m3 | M3's merged family DOES cover indeterminate circular — and docs/SPINNER-MATRIX.md already claims that reading of exactly these tokens. Turning it on here would be double-ownership. Cross-referenced, not re-modelled: spinner owns the rotation and the value-less arc; progress owns the determinate arc and the stop indicator. |
| `behavior.role` | salt | LinearProgress.tsx line 77 and CircularProgress.tsx line 100, both hardcoded role="progressbar" |
| `behavior.role` | shadcn | primitives/packages/react/progress/src/progress.tsx: role="progressbar" on Primitive.div |
| `behavior.role` | m3 | [R] — APG convention; tokens-only clone, no element to grep. Agrees with the two grepped columns, which is itself the finding. |
| `behavior.value-range` | salt | both exports take min = 0 and max = 100 and write aria-valuemin={min} / aria-valuemax={max}; the percentage is normalised as ((value - min) / (max - min)) * 100 |
| `behavior.value-range` | shadcn | Radix takes `max` (DEFAULT_MAX = 100) and hardcodes aria-valuemin={0}; there is NO min prop, so a non-zero floor is unreachable |
| `behavior.value-range` | m3 | CORRECTED alongside behavior.value-now, same reasoning: 0-100, the range both grepped columns use and the one APG's progressbar pattern assumes. [R] — no M3 element exists to grep. |
| `behavior.determinacy-detection` | salt | LinearProgress.tsx: const isIndeterminate = value === undefined && bufferValue === undefined. CircularProgress.tsx: no such line — value = 0 default. |
| `behavior.determinacy-detection` | shadcn | getProgressState(value, max) returns 'indeterminate' \| 'loading' \| 'complete', published as data-state on BOTH the Root and the Indicator |
| `behavior.determinacy-detection` | m3 | [R] — the mode demonstrably exists (structure.indeterminate-band) and there is no element to say how it is selected |
| `behavior.value-now` | salt | aria-valuenow={value === undefined ? undefined : Math.round(value)} (linear); Math.round(value) unconditionally (circular) |
| `behavior.value-now` | shadcn | aria-valuenow={isNumber(value) ? value : undefined} — NOT rounded, unlike Salt |
| `behavior.value-now` | m3 | CORRECTED during the owner-validation pass. This cell previously read "unanswerable" [R], which rendered every M3 bar — including the determinate ones at 0/37/100% — as role="progressbar" with NO aria-valuenow. That is not a declared absence, it is a false assertion: role=progressbar without a value means INDETERMINATE to assistive tech, so a determinate M3 bar announced as indeterminate. The inco |
| `behavior.value-text` | salt | CONFIRMED ABSENCE — neither export writes aria-valuetext. Salt puts the human-readable percentage on screen instead (structure.label), which is the exact inverse of shadcn. |
| `behavior.value-text` | shadcn | aria-valuetext={valueLabel}, from getValueLabel defaulting to `${Math.round((value / max) * 100)}%` — announced but never drawn, the exact inverse of Salt |
| `behavior.value-text` | m3 | [R] |
| `behavior.label-formatting` | salt | isIndeterminate ? "— %" : `${Math.round(progress)} %` — an EM DASH for the unknown case and a SPACE before the percent sign in both |
| `behavior.label-formatting` | shadcn | no visible label to format; the percentage exists only in aria-valuetext |
| `behavior.label-formatting` | m3 | no label |
| `behavior.buffer-visibility` | salt | linear: {bufferValue && bufferValue > 0 ? <div …/> : null}; circular: {buffer > 0 && …} on the normalised figure. The buffer never enters the label or any ARIA attribute — examples.mdx: "The buffer is a pending value so will not affect the progress label." |
| `prop.shape` | salt | two peer exports, no default between them |
| `prop.shape` | shadcn | single-valued, so nothing to discriminate |
| `prop.shape` | m3 | two sub-namespaces, no source default between them |
| `prop.determinacy` | salt | CAPABILITY LIST, not an ordered default — determinacy is inferred from the value (behavior.determinacy-detection). Indeterminate is reachable on the LINEAR shape only. |
| `prop.determinacy` | shadcn | CAPABILITY LIST. Both values are real at the ARIA level (Radix distinguishes them) and only one is real visually (structure.indeterminate-band is off), which is precisely the divergence worth carrying. |
| `prop.determinacy` | m3 | CAPABILITY LIST, WITH ITS EVIDENCE REBUILT BY THE PIN. Determinate was evidenced by the stop indicator (a dot marking 100% only makes sense against a value); THAT EVIDENCE IS GONE — versions/v0_192 has no stop-indicator token (see structure.stop-indicator's declared gap). Indeterminate was evidenced by the wave-wavelength token; that is gone too. What remains in versions/v0_192/_md-comp-linear-pro |
| `prop.hide-label` | salt | hideLabel = false, and the JSDoc says so in words: "Whether to hide the text label within the progress. Defaults to `false`." Capability list, written default-first. |
| `prop.max` | salt | max = 100 in both exports |
| `prop.max` | shadcn | Radix DEFAULT_MAX = 100, applied through isValidMaxNumber with a console.error on an invalid value |
| `prop.max` | m3 | no element, no prop |
| `prop.min` | salt | min = 0 in both exports, written to aria-valuemin |
| `prop.min` | shadcn | A CEILING, NOT AN OMISSION — Radix has no min prop and hardcodes aria-valuemin={0}. |
| `slot.label` | salt | Salt formats the string itself and renders it through its own Text component at styleAs="h2" — DECLARED COMPOSITION to a future `text` component. |
| `slot.label` | shadcn | DECLARED COMPOSITION to `field` / `label`, both unbuilt — progress-label.tsx and progress-rtl.tsx both build the visible percentage out of Field + FieldLabel. |
| `slot.label` | m3 | no label part and no composition example — a tokens-only clone has neither |
| `slot.composes` | salt | DECLARED COMPOSITION: `text` (the label is a <Text>), and `button` (every story in packages/core/stories/progress drives the value with Start/Stop/Reset Buttons via useProgressingValue.tsx). Neutral placeholders in the harness. |
| `slot.composes` | shadcn | DECLARED COMPOSITION: `field`/`label` (its own labelled examples) and `card` (registry/bases/*/blocks/preview-02/cards/savings-progress.tsx puts a progress inside a card). Neutral placeholders in the harness. |
| `slot.composes` | m3 | no element to compose with |
| `state.rest` | salt | LinearProgress.css: bar height = barContainer height = size-bar-strong; track height = size-bar |
| `state.rest` | shadcn | progress.tsx class strings |
| `state.rest` | m3 | versions/v0_192/_md-comp-linear-progress-indicator.scss 'active-indicator-color' / 'track-color'. VALUE CHANGED BY THE PIN: the track role was secondary-container under latest's merged family, so the sentence used to read 'over a secondary-container track'. The 'two unrelated colour roles' observation survives the change — if anything it is starker now, primary against a neutral surface tone. |
| `state.indeterminate` | salt | LinearProgress.css/.tsx |
| `state.indeterminate` | shadcn | Radix + the (value \|\| 0) coercion in progress.tsx |
| `state.indeterminate` | m3 | DOWNGRADED BY THE PIN. Was sourced from $indeterminate-active-indicator-wave-wavelength 20px, which v0.192 does not have. The surviving evidence is the four-color-active-indicator-* family — see structure.indeterminate-band for the full substitution note and its [R] qualification. |
| `state.complete` | salt | no terminal state concept — Salt has no data-state and no rule for value === max |
| `state.complete` | shadcn | getProgressState returns 'complete' when value === max, written as data-state on both elements — and NOTHING in progress.tsx selects on it, so a finished bar looks like a 99% one |
| `state.complete` | m3 | no state attribute — but the stop indicator is the same idea expressed as GEOMETRY: a dot marking where 100% is |
| `state.interaction-states` | salt | grepped: no :hover, :focus, :focus-visible, :active or disabled selector in LinearProgress.css or CircularProgress.css; no disabled prop in either interface |
| `state.interaction-states` | shadcn | grepped: progress.tsx carries none of the focus-visible:/aria-invalid: groups its sibling components paste in, and has no disabled handling |
| `state.interaction-states` | m3 | grepped: no state-layer, focus-indicator, hover, pressed, dragged or disabled family in either of the two v0.192 progress files (nor in any of latest's three). Under this pin the observation is cleaner than before — card.m3.json, chip.m3.json and tabs.m3.json all LOSE their focus-indicator family to the v0.192 pin, so progress is no longer the odd one out for lacking one; nothing in M3 v0.192 has  |
| `style.root.min-width` | salt | LinearProgress.css .saltLinearProgress { min-width: 400px } — a hardcoded pixel literal with no token behind it |
| `style.root.min-width` | shadcn | `w-full` only — a shadcn progress takes whatever width its parent gives it, where a Salt one demands 400px |
| `style.track.height` | shadcn | class h-2 |
| `style.track.height` | m3 | versions/v0_192/_md-comp-linear-progress-indicator.scss 'track-height': 4px. Unchanged in value by the pin — latest's _md-comp-progress-indicator-linear.scss $height was also 4px; only the token name moved (height -> track-height). |
| `style.track.shape` | salt | CONFIRMED ABSENCE — no border-radius anywhere in LinearProgress.css. A Salt linear progress has square ends. |
| `style.track.shape` | m3 | VALUE CHANGED BY THE PIN: 'track-shape' -> md-sys-shape.corner-none = 0px in versions/v0_192/_md-comp-linear-progress-indicator.scss, where latest's merged family said corner-full = 9999px. The bar's container is square-cornered in the pinned edition. See provenance.shape-corner-none. |
| `style.groove.height` | shadcn | in source the groove IS the track element (bg-primary/20 sits on the Root); the chassis paints it on a full-bleed child, which is byte-equivalent here — declared approximation |
| `style.groove.height` | m3 | 'track-height' 4px equals the container height (there is no separate container-height token in v0.192 — 'track-height' IS the bar), so the groove is the full container; expressed as 100% so it follows style.track.height. |
| `style.groove.color` | m3 | VALUE CHANGED BY THE PIN: 'track-color' -> md-sys-color.surface-container-highest (#e6e0e9 / #36343b) in versions/v0_192, where latest's merged family said secondary-container (#e8def8 / #4a4458). This row is LOCKED, so it could not have become a gap — and it did not need to: v0.192 has a track colour, just a different one. See provenance.x-m3-surface-container-highest. |
| `style.groove.shape` | shadcn | the radius lives on the track element (style.track.shape), which in source is the same element |
| `style.groove.shape` | m3 | 'track-shape', declared separately from the indicator's — still the only column where the two are distinct tokens, though under this pin they now carry the SAME value (both corner-none 0px) where latest had them both at corner-full. VALUE CHANGED: 9999px -> 0px. |
| `style.indicator.thickness` | salt | .saltLinearProgress-bar { top: 0; bottom: 0 } — fills the whole (fat) container |
| `style.indicator.thickness` | shadcn | class h-full |
| `style.indicator.thickness` | m3 | versions/v0_192/_md-comp-linear-progress-indicator.scss 'active-indicator-height': 4px — still tokenised separately from 'track-height', and still equal to it. Unchanged in value by the pin. The 8px-against-8px thick variant that latest carried does not exist in this edition at all. |
| `style.indicator.shape` | shadcn | the indicator is clipped by the track's own rounded-full + overflow-hidden rather than carrying a radius |
| `style.indicator.shape` | m3 | VALUE CHANGED BY THE PIN: 'active-indicator-shape' -> corner-none = 0px in versions/v0_192, where latest's merged family said corner-full = 9999px. CARRIED WITH ITS DISOWNMENT, unchanged: material-web's own tokens/_md-comp-linear-progress.scss lists active-indicator-shape under $unsupported-tokens because it scales the indicator (structure.fill-mechanism). Under the v0.192 pin the disagreement is  |
| `style.indicator.trailing-space` | m3 | DECLARED GAP. Was 4px, sourced from $track-active-indicator-space in latest's _md-comp-progress-indicator-linear.scss. versions/v0_192/_md-comp-linear-progress-indicator.scss has no such token — its six real keys are active-indicator-{color,height,shape} and track-{color,height,shape}, nothing else. WHAT THE CONSUMER LOSES: the small breathing gap between the end of the filled portion and the star |
| `style.indicator.transition` | salt | DEAD AS DECLARED — the component animates `width`, not `transform`. Reproduced as source has it and flagged. |
| `style.indicator.transition` | shadcn | class `transition-all` — property list [S], duration/easing [R] (Tailwind not vendored). Unlike Salt's, it covers the property that actually moves. |
| `style.indicator.transition` | m3 | no motion token in any of the five progress files; M3's _md-sys-motion.scss is never referenced by them |
| `style.indeterminate.duration` | salt | animation: 1.8s ease-in-out infinite salt-indeterminate-progress-bar — hardcoded, not a duration token |
| `style.indeterminate.duration` | m3 | DECLARED ABSENCE, NOT A FABRICATION. structure.indeterminate-band is ON for this column (the wavelength token proves the mode) and no duration token exists anywhere in the clone for it. Rather than emit a switched-on structure with no motion — the silent fallback CLAUDE.md rule 3 forbids — the REGISTRY DEFAULT is stated here and labelled. 1.8s is Salt's sourced figure, the only one the registry ha |
| `style.indeterminate.easing` | salt | same declaration; matches --salt-animation-timing-function in value but is written as a literal |
| `style.indeterminate.easing` | m3 | DECLARED ABSENCE, as above. M3 does define ten easing tokens (docs/foundations/motion.md), and the progress files reference NONE of them — the same finding spinner made. Naming one here would fabricate a link source does not have, so the registry default is used and labelled. |
| `style.buffer.color` | salt | .saltLinearProgress-buffer { background: var(--salt-container-primary-background); outline: solid var(--salt-size-fixed-100) var(--salt-sentiment-accent-background); outline-offset: calc(var(--salt-size-fixed-100) * -1) } |
| `style.buffer.z-index` | salt | .saltLinearProgress-buffer { z-index: var(--salt-zIndex-default) } = 1, against the bar's calc(var(--salt-zIndex-default) * 2) = 2 |
| `style.stop-indicator.size` | m3 | DECLARED GAP. Was {inline-size 4px, block-size 4px, inset-inline-end 0px}, sourced from $stop-indicator-size and $stop-indicator-trailing-space in latest's _md-comp-progress-indicator-linear.scss. Neither token exists in versions/v0_192. Consumer loses the end dot's geometry — see structure.stop-indicator for the full loss. |
| `style.stop-indicator.paint` | m3 | DECLARED GAP. Was {background var(--action), border-radius var(--shape-full)}, sourced from $stop-indicator-color -> primary and $stop-indicator-shape -> corner-full in latest's SHARED _md-comp-progress-indicator.scss. That file does not exist in versions/v0_192 in any form. Consumer loses the end dot's paint — see structure.stop-indicator. |
| `style.circular.size` | salt | CircularProgress.css: inline-size / block-size calc(var(--salt-size-base) * 3) |
| `style.circular.size` | m3 | versions/v0_192/_md-comp-circular-progress-indicator.scss 'size': 48px. VALUE CHANGED BY THE PIN: latest's _md-comp-progress-indicator-circular.scss said $size 40px. This is the same 48px spinner.m3.json now carries, from the same token in the same file, so the two components agree again. |
| `style.circular.track` | salt | .saltCircularProgress-track { outline-style: solid; outline-width: var(--salt-size-bar); outline-offset: calc(var(--salt-size-bar) * -1.5); outline-color: var(--salt-sentiment-neutral-track) } |
| `style.circular.track` | m3 | DECLARED GAP. Was {stroke var(--x-m3-secondary-container), stroke-width 4px, r 18px}, sourced from latest's merged $track-color -> secondary-container plus _md-comp-progress-indicator-circular.scss's $track-thickness 4px. versions/v0_192/_md-comp-circular-progress-indicator.scss defines exactly ten keys — active-indicator-{color,shape,width}, size, and the four four-color-* entries — and NOT ONE o |
| `style.circular.indicator` | salt | .saltCircularProgress-bar { border-color: var(--salt-sentiment-accent-background); border-style: solid; border-width: var(--salt-size-bar-strong) } |
| `style.circular.indicator` | m3 | versions/v0_192/_md-comp-circular-progress-indicator.scss 'active-indicator-width' 4px and 'active-indicator-color' -> primary; r RE-DERIVED for the new diameter as (48 - 4) / 2 = 22px, where it was (40 - 4) / 2 = 18px under the latest pin. No longer described as CONCENTRIC WITH THE TRACK, because there is no track (see style.circular.track). The $track-active-indicator-space that this cell used t |

</details>

<!-- END GENERATED VALUES -->
