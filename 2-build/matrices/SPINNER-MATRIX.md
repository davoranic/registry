# Spinner — component template matrix

*Second live component in the post-clean-slate pipeline (button was first).
Same method as [CALENDAR-MATRIX.md](CALENDAR-MATRIX.md): one master
template (union of all six pieces across systems), columns per design
system, rows switched on/off/inherited per column.*

**Cell legend** · `⟡ slot` = alias to shared contract slot · **bold** = the
system's own switch · `x-ds:` = system's native token, no shared slot yet ·
`OFF` = row switched off in this column · `INHERIT` = system silent,
registry default applies (labeled) · `[S]` = value extracted from source
this session · `[R]` = no source file to grep (see note); needs
verification before treating as authoritative.

**Row policies** · 🔒 locked-on (no column may switch it off) ·
⚪ switchable (on where the system has it) · ⬜ on-with-default.

**Naming rule** — grammar `<piece>.<part>[.<subpart>].<property>[@state]`,
enforced by `contract/template.schema.json`'s `row.id` pattern. Same
terminology as Calendar/Button: a row is an attribute, a cell is the
resolved value.

**Scope note.** `spinner` is the *indeterminate-only* loading glyph.
Determinate progress (a filled percentage) is a separate canonical
component (`progress`, linear + circular) per `COMPONENTS.md` — Salt and
shadcn agree with this split (`Spinner` vs `Progress`/`Circle` are
different components in both). **Material 3 does not**: its token schema
covers one `progress-indicator` family for both determinate and
indeterminate circular use — `stop-indicator-*` tokens (the dot marking
100%) exist in the same file this matrix draws from but are out of scope
here, deferred to the future `progress` component's matrix. This is a real
structural divergence, recorded once rather than re-discovered per row.

Sources: salt-ds clone `packages/core/src/spinner/{Spinner.tsx,Spinner.css,
svgSpinners/SpinnerSVG.tsx}` [S]; `ui/apps/v4/registry/new-york-v4/ui/
spinner.tsx` [S] (wraps lucide-react's `Loader2Icon` + Tailwind's built-in
`animate-spin` utility — grepped `app/globals.css` for an override, none
found, so the *default* Tailwind keyframe applies [S]); material-web
`tokens/versions/latest/sass/{_md-comp-progress-indicator.scss,
_md-comp-progress-indicator-circular.scss}` [S]. **material-web is a
tokens-only clone** (per `CLAUDE.md`) — there is no live M3 spinner
component to read structure/behavior from, only token *values*. Every M3
structure/behavior row below is therefore [R] (from m3.material.io's
published progress-indicator docs, not a grep), while every M3 *style*
row is [S] (grepped from the token file). This mirrors Calendar's M3
column, which had the same split.

**Edition pin.** M3 ships *two* circular-progress token sets in this
clone: a deprecated singular one (`_md-comp-circular-progress-indicator
.scss`, pinned at v0.192 for Calendar/Button — 48px, 4px stroke, no
track, self-marked `@deprecated` even in that edition) and a current one
(`_md-comp-progress-indicator-circular.scss`, latest edition, not
deprecated — 40px baseline, a background track, and Expressive-only
"wave"/"thick" variants). Because the v0.192 file is *itself* flagged
deprecated in favor of the newer schema, this matrix pins M3 to **the
latest circular-baseline schema**, not v0.192 — a deliberate deviation
from the Calendar/Button precedent, recorded here rather than silently
switched. `wave` and `thick` variants are declared out of scope (same
treatment as Architecture v2 §8d's "honestly out of scope" list).

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| root | 🔒 | on — `<div role="img">` wrapping an inline SVG [S] | on — the SVG *is* the root, no wrapper element [S] | on [R] |
| active-indicator (the moving stroke) | 🔒 | on — **two overlapping half-stroked circles**, the second wrapped in a fading linear-gradient (`stroke-dasharray="50 50"`, `pathLength="100"`) [S] | on — single vector glyph path (`Loader2Icon`, a fixed lucide icon, not a drawn arc) [S] | on — single stroke arc [R] |
| track (static background ring) | ⚪ | OFF — no track element or token in Spinner.css [S] | OFF — no track [S] | **on** — `track-color`/`track-thickness`/`track-active-indicator-space` tokens, latest schema only (absent from the deprecated v0.192 file) [S] |
| gradient trail (fading tail behind the arc) | ⚪ | **on** — `<linearGradient>` defs, stop-opacity 1→0 across offset 15%→100%, the visual "comet tail" [S] | OFF — flat single-color glyph [S] | OFF — M3's published arc has a fixed sweep, not a fade [R] |

## 2 · Behavior — no component in any source accepts keyboard focus or fires interaction events; every row here is about *announcing state*, not interaction

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| non-interactive (no tabindex, no keyboard pattern) | 🔒 | identical [S] | identical [S] | identical [R] |
| ARIA role | 🔒 | `role="img"` [S] | `role="status"` [S] | `role="progressbar"` (APG convention for progress meters; indeterminate omits `aria-valuenow`) [R] — **three different roles for the same concept**, not a naming accident: `img` treats the spinner as a static picture, `status`/`progressbar` treat it as a live region an AT should watch |
| label content | 🔒 | `aria-label` **prop**, default `"loading"` (lowercase, consumer-overridable) [S] | `aria-label="Loading"` **hardcoded** in source (capitalized, not a prop — no way to change it without wrapping) [S] | [R] — HIG convention, no clone source |
| repeat-announce (periodic re-announcement while pending) | ⚪ | **on** — `useAriaAnnouncer` hook: re-announces every `announcerInterval` (default 5000ms) until `announcerTimeout` (default 20000ms) elapses, then announces a stop-notice once; announces `completionAnnouncement` (default `"finished {label}"`) on unmount [S] — the most elaborate a11y mechanism found in any component matrixed so far | OFF — static label only, no re-announcement logic [S] | OFF [R] |
| rotation animation mechanism | 🔒 | CSS `@keyframes` on the whole `<svg>` (`transform: rotate(0 → 360deg)`) [S] | Tailwind's `animate-spin` utility class, same `rotate(360deg)` keyframe mechanism [S] | [R] — mechanism unspecified in tokens; CSS `transform: rotate` is the only implementation a CSS consumer has, so treated as identical, but the specific keyframe is not M3-sourced |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| `size` | ⚪ | **discrete enum**: `small \| medium \| large` (+ `default` aliasing to `medium`) [S] | **not a prop** — arbitrary `className` (`size-3`/`size-4`/`size-6`/`size-8` Tailwind utilities in the docs' own examples), continuous, not tokenized [S] | **discrete enum**: `baseline` (in scope) `\| thick` (deprecated variant, out of scope) [S] |
| `color` / `tone` | ⚪ | **fixed** — arc color is `sentiment-accent-background`, not exposed as an instance prop; override only via CSS custom property [S] | **fully open** — no color prop; arc renders in `currentColor`, changed by applying a `text-*` utility class in context (shown in the shadcn docs' own `spinner-color` example) [S] | **fixed** — `active-indicator-color` resolves to the `primary` sys-color role, not instance-configurable in the token set [S] |
| `aria-label` | ⚪ | **prop**, default `"loading"` [S] | **not exposed** as a prop — hardcoded string [S] | [R] |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| *(none)* | 🔒 | Spinner has no consumer-facing content slot in any of the three sources — no `children` prop accepted by Salt's `Spinner` or shadcn's `Spinner` component, no equivalent in the M3 token set. A fully closed, content-free glyph — a genuine shared invariant, not an oversight. |

## 5 · States

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| spinning (the only visual state) | 🔒 | on, always-animating while mounted [S] | on, always-animating while mounted [S] | on [R] |
| rest / hover / focus / active / disabled | 🔒 (info) | **none exist** — confirmed no `:hover`/`:focus`/`:disabled` rule anywhere in `Spinner.css`; shadcn's `spinner.tsx` accepts no `disabled` prop; the M3 token file defines no interaction-state tokens for the indicator | — | — |

## 6 · Styles — the cell matrix (per part × attribute)

### root / active-indicator

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| diameter @ `size=medium`/baseline | ⬜ | ⟡ `size-base` → **28px @ medium density** (20/28/36/44 by density, same foundation as Button's height) [S] | **size-4** = 16px, fixed, no density [S] | **40px** (`_md-comp-progress-indicator-circular.scss $size`, latest schema) [S] |
| diameter @ `size=small` | ⬜ | `max(size-icon, 12px)` → 12px @ medium (icon-size@md=12px, formula only bites at high density where icon-size=10px) [S] | **size-3** = 12px (docs example, not a component default) [S] | *(baseline-only in scope; M3 has no discrete small variant, only baseline/thick)* OFF |
| diameter @ `size=large` | ⬜ | `size-base * 2` → **56px @ medium density** [S] | **size-8** = 32px (docs example) [S] | OFF (thick variant out of scope) |
| stroke-width @ medium/large | ⬜ | ⟡ `size-bar` → **4px @ medium density** (2/4/6/8 by density) [S] | *(not independently controllable — baked into the `Loader2Icon` glyph path, scales with the whole icon, not a separate stroke-width)* — **declared expressibility gap**, not an omission [S] | **4px** (`active-indicator-thickness`) [S] |
| stroke-width @ small | ⬜ | `size-fixed-200` = **2px, fixed** — the one spinner dimension Salt does *not* density-scale [S] | *(same gap as above)* | OFF |
| track thickness | ⚪ | OFF | OFF | **4px** (`track-thickness`) [S] |
| track↔indicator gap | ⚪ | OFF | OFF | **4px** (`track-active-indicator-space`) [S] |
| track color | ⚪ | OFF | OFF | ⟡ `x-m3-secondary-container` → sys `secondary-container` [S] |
| arc/indicator color | 🔒 | ⟡ `accent` → `sentiment-accent-background` → `palette-accent` → **blue #0078CF, both modes** (same base-accent family as Calendar's today-marker and focus-ring-stronger) [S] | ⟡ `currentColor` (inherit — no dedicated slot; ambient text color) [S] | ⟡ `action` → sys `primary` → **#6750a4 / #d0bcff** (same slot Button/Calendar already use) [S] |
| gradient trail opacity ramp | ⚪ | **on** — stop-opacity 1 at 15% offset fading to 0 at 100% offset [S] | OFF | OFF |
| shape / corner-radius | 🔒 (info) | N/A — a circle has no radius token in any of the three sources; shared invariant, not a gap | — | — |
| rotation duration | ⬜ | **0.9s**, hardcoded literal in `Spinner.css` — **not** a `var()` reference to any duration foundation token, despite Salt's own Motion foundations page defining `--salt-duration-notable: 1000ms` right next to it [S] — same class of finding as Architecture v2 §1's hardcoded-values audit | **1s** — Tailwind's built-in `animate-spin` default keyframe, unmodified in this repo (`globals.css` grepped, no override) [S] | **declared absence** — no duration token found anywhere in the tokens-only clone for the indeterminate spin; M3's Motion foundations page (`short`/`medium`/`long` tiers) is never referenced by the progress-indicator files [R] |
| rotation easing | 🔒 | `linear` [S] | `linear` (Tailwind default) [S] | [R] — not sourced |

---

## Findings from building this matrix

1. **Three different ARIA roles for the same concept** (`img` / `status` /
   `progressbar`) is the spinner's version of Calendar's "today marker"
   finding: three systems answer "how do we tell an AT this is loading?"
   three structurally different ways. No single hardcoded role is right
   for the other two.
2. **Salt's repeat-announcer is a real behavioral capability**, not a
   style difference — `announcerInterval`/`announcerTimeout`/
   `completionAnnouncement` are three props with no shadcn or M3
   equivalent. Silently dropping this in the skeleton would be exactly
   the "silent fallback" Rule 3 forbids; it is recorded as a switchable
   behavior row instead.
3. **shadcn's stroke-width is not independently controllable** — because
   the component wraps a fixed lucide glyph rather than drawing its own
   arc, "stroke-width" isn't a real axis in shadcn's spinner the way it
   is in Salt's and M3's. This is a genuine per-system expressibility
   ceiling, not a missing value to fill in.
4. **Two systems hardcode their rotation duration outside their own
   token systems** (Salt: 0.9s inline; shadcn: Tailwind's built-in
   default, also not routed through any project token) — an echo of
   Architecture v2 §1's central diagnosis (component character escaping
   into hand-written literals) showing up again at the DS-source level,
   not just in this repo's old build.
5. **The M3 edition pin had to be made explicitly**, and deliberately
   diverges from Calendar/Button's v0.192 pin — see "Edition pin" note
   above. Recorded here for the owner's review, not assumed.
6. **M3's token schema does not distinguish spinner from progress** —
   only this matrix's own scope note keeps `stop-indicator-*` (a
   determinate-only token) out of a component that has no determinate
   mode. Left as a forward note for the `progress` component's future
   matrix, which will need to explicitly claim those tokens.


## Correction applied 2026-08-02 (found while building `progress`)

`spinner.m3.json`'s `style.arc.radius` was **10px**, derived by subtracting
`$track-active-indicator-space` and `$track-thickness` radially from the
track radius. That placed the active indicator on a different, smaller circle
than its own track — two concentric rings 8px apart, rendering as a dark arc
floating inside a wide light donut.

M3's active indicator and track share ONE circle:
`r = (size − thickness) / 2 = (40 − 4) / 2 = 18px`, identical to
`style.track.radius`. `track-active-indicator-space` is an **angular** gap
along the circumference, not a radial inset; it is now recorded on
`style.track.gap` as a declared, deliberately unrendered value.

Fixed in `themes/columns/spinner.m3.json` and re-rendered. See
`docs/PROGRESS-MATRIX.md` → "Correction 1" for the full reasoning and for why
this survived spinner's own validation pass but could not survive a
determinate ring being built next to it.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/spinner.template.json` against every system, read from `columns/spinner.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 1 light, 1 dark override, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `accent` | rgb(0, 120, 207) | rgb(0, 120, 207) | yes |

**m3** — 1 light, 1 dark override

| slot | light | dark | cited |
|---|---|---|---|
| `action` | #6750a4 | #d0bcff | yes |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.track` | structure | switchable | **off** | **off** | **off** |
| 2 | `structure.gradient-trail` | structure | switchable | `True` | **off** | **off** |
| 3 | `slot.content` | slot | locked | — | — | — |
| 4 | `behavior.non-interactive` | behavior | locked | — | — | — |
| 5 | `behavior.role` | behavior | locked | `img` | `status` | `progressbar` |
| 6 | `behavior.label` | behavior | default | `loading` | `Loading` | `Loading` |
| 7 | `behavior.repeat-announce` | behavior | switchable | `True` | **off** | **off** |
| 8 | `prop.size` | prop | default | `small, medium, large` | **off** | `baseline` |
| 9 | `state.spinning` | state | locked | — | — | — |
| 10 | `state.none-else` | state | locked | — | — | — |
| 11 | `style.root.size` | style | default | ⟡ `spinner-diameter` | `16px` | `48px` |
| 12 | `style.arc.stroke-width` | style | default | ⟡ `spinner-stroke-width` | `2px` | `4px` |
| 13 | `style.arc.radius` | style | default | `calc((var(--spinner-diameter) - var(--spinner-stroke-width)) / 2)` | `7px` | `22px` |
| 14 | `style.track.thickness` | style | switchable | **off** | **off** | **off** |
| 15 | `style.track.radius` | style | switchable | **off** | **off** | **off** |
| 16 | `style.track.color` | style | switchable | **off** | **off** | **off** |
| 17 | `style.arc.color` | style | locked | ⟡ `accent` | `currentColor` | ⟡ `action` |
| 18 | `style.gradient-trail` | style | switchable | ⟡ `accent` | **off** | **off** |
| 19 | `style.root.duration` | style | default | `0.9s` | `1s` | `1s` |
| 20 | `style.root.easing` | style | default | `linear` | `linear` | `linear` |

<details><summary>Citations — 33 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.track` | salt | no track element or token in Spinner.css |
| `structure.track` | m3 | DECLARED GAP, not a silent drop. In `latest` this row was ON, sourced from the merged md.comp.progress-indicator family's track-color/track-thickness plus _md-comp-progress-indicator-circular.scss's $track-thickness and $track-active-indicator-space — those tokens are what proved the component has a background ring. THE PINNED EDITION HAS NO TRACK AT ALL: versions/v0_192/_md-comp-circular-progress |
| `structure.gradient-trail` | salt | SpinnerSVG.tsx: second <circle> wrapped in a <linearGradient>, stop-opacity 1->0 across offset 15%->100% |
| `behavior.role` | salt | Spinner.tsx: role="img" |
| `behavior.role` | shadcn | spinner.tsx role="status" |
| `behavior.role` | m3 | [R] — APG progressbar convention for indeterminate meters (aria-valuenow omitted); not grepped from a live M3 component, this clone is tokens-only. Edition-independent. |
| `behavior.label` | salt | Spinner.tsx: aria-label default "loading" |
| `behavior.label` | shadcn | spinner.tsx aria-label="Loading" (hardcoded, no prop) |
| `behavior.label` | m3 | [R] — m3.material.io convention, no clone source. Edition-independent. |
| `behavior.repeat-announce` | salt | Spinner.tsx useAriaAnnouncer hook |
| `behavior.repeat-announce` | shadcn | no re-announcement logic — static label only |
| `behavior.repeat-announce` | m3 | [R] — no source to confirm either way; treated as off (Salt's mechanism is not a documented M3 pattern) |
| `prop.size` | salt | SpinnerSizeValues: default/large/small/medium (default aliases to medium) |
| `prop.size` | shadcn | not a discrete prop — arbitrary className (size-3/4/6/8 Tailwind utilities), continuous, not expressible as a skeleton enum |
| `prop.size` | m3 | SINGLE-VALUED, AND UNDER THE v0.192 PIN THAT IS NOW A CONFIRMED ABSENCE RATHER THAN A SCOPE DECISION. Previously this cell noted that a thick variant existed in latest's _md-comp-progress-indicator-circular.scss ($thick-size 52px, $thick-active-indicator-thickness 8px) and was declared out of scope. versions/v0_192/_md-comp-circular-progress-indicator.scss has no thick-* token and no size axis of  |
| `style.root.size` | shadcn | size-4 (default, and the only size shipped without an ad-hoc className override) |
| `style.root.size` | m3 | versions/v0_192/_md-comp-circular-progress-indicator.scss 'size': 48px. VALUE CHANGED BY THE PIN: latest's _md-comp-progress-indicator-circular.scss $size was 40px. |
| `style.arc.stroke-width` | shadcn | REGISTRY RENDERING APPROXIMATION, not a shadcn-sourced number — Loader2Icon's stroke is part of the fixed glyph path, not an independent CSS-controllable dimension in the real component (declared expressibility gap) |
| `style.arc.stroke-width` | m3 | versions/v0_192/_md-comp-circular-progress-indicator.scss 'active-indicator-width': 4px. Unchanged by the pin — latest's $active-indicator-thickness is also 4px, only the token NAME differs (width -> thickness). |
| `style.arc.radius` | salt | Spinner.css .saltSpinner-medium .saltSpinner-arc { r: calc((var(--salt-size-base) - var(--spinner-strokeWidth)) / 2) } — same formula, our slot names |
| `style.arc.radius` | shadcn | derived: (16px size - 2px approximated stroke-width) / 2 — inherits the same approximation caveat as stroke-width above |
| `style.arc.radius` | m3 | Derived, and RE-DERIVED for the new diameter: r = (size - active-indicator-width) / 2 = (48 - 4) / 2 = 22px, where it was (40 - 4) / 2 = 18px under the latest pin. The stroke is centred on the path, so half of it falls outside the radius and half inside; 22px keeps the 4px stroke exactly inside a 48px box. (Retained warning from the progress build: M3's active indicator and its track share ONE cir |
| `style.track.thickness` | m3 | DECLARED GAP. Was 4px, sourced from latest's _md-comp-progress-indicator-circular.scss $track-thickness. versions/v0_192/_md-comp-circular-progress-indicator.scss defines no track-thickness token. Consumer loses the ring's stroke weight along with the ring itself (structure.track). |
| `style.track.radius` | m3 | DECLARED GAP. Was 18px, derived as (40px size - 4px track-thickness) / 2 from latest's tokens. With no track-thickness and no track in the pinned edition there is nothing to derive from. Consumer loses the ring's geometry. |
| `style.track.color` | m3 | DECLARED GAP, and the only one here that costs a colour. Was an alias to slot x-m3-secondary-container (#e8def8 light / #4a4458 dark), sourced from latest's merged md.comp.progress-indicator $track-color -> md-sys-color.secondary-container. versions/v0_192/_md-comp-circular-progress-indicator.scss has no track-color token, so under this pin M3 states no opinion about what sits behind the arc. Cons |
| `style.arc.color` | shadcn | no stroke/color override in spinner.tsx — the Loader2Icon glyph inherits ambient text color |
| `style.gradient-trail` | salt | same accent as the flat arc — Salt's own fallback chain resolves the gradient color to sentiment-accent-background by default |
| `style.root.duration` | salt | Spinner.css: animation: spinner 0.9s linear infinite (hardcoded, not a token reference) |
| `style.root.duration` | shadcn | Tailwind's default animate-spin keyframe duration, unmodified in this repo |
| `style.root.duration` | m3 | DECLARED ABSENCE, not fabricated: no animation-duration token anywhere in the tokens-only clone in EITHER edition; the registry default (matching shadcn's own unsourced Tailwind default) applies and is labeled here rather than left silently blank |
| `style.root.easing` | salt | Spinner.css: animation: spinner 0.9s linear infinite |
| `style.root.easing` | shadcn | Tailwind's default animate-spin timing function |
| `style.root.easing` | m3 | [R] — matches the simplified fixed-partial-arc rotate mechanism this matrix uses for shadcn/M3 (see SPINNER-MATRIX.md); M3's real indeterminate motion is a growing/shrinking arc on an emphasized easing curve, out of scope for this CSS-only pass |

</details>

<!-- END GENERATED VALUES -->
