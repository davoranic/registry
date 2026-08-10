# Accordion — component template matrix

Component 20 of the pipeline (button, calendar, spinner, tooltip, alert,
input, select, dialog, tabs, card, badge, progress, chip, checkbox, switch,
radio-group, slider, toast, dropdown-menu came before). Canonical id
`accordion`, matching `1-intro/content/04-component-map.md`'s Data display
row: `| accordion | ✓ | ✓ | — |` — shadcn and Salt both have it, M3 does not.

## 0 · Scope

**What "accordion" means per system**, confirmed by reading each clone, not
assumed from the prompt's secondhand summary:

- **shadcn**: `apps/v4/registry/new-york-v4/ui/accordion.tsx` — four exported
  parts (`Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`),
  every one a thin `data-slot`-tagging wrapper around `radix-ui`'s `Accordion`
  primitive. **`radix-ui` is an external, unvendored npm dependency**
  (`apps/v4/package.json:80`, `"radix-ui": "^1.4.3"`, no `node_modules/
  radix-ui` anywhere under `3-source/`) — the SAME external-package boundary
  DROPDOWN-MENU-MATRIX.md and TOAST-MATRIX.md already recorded for their own
  shadcn columns. Every STYLE cell is real, sourced from the wrapper's own
  literal className strings; every BEHAVIOR cell is `[R]` unless
  independently confirmable from the wrapper file itself (the `data-state`/
  `data-disabled` attribute contract its own classes key off IS real source,
  even though the code that SETS those attributes lives in the external
  package). `Accordion`'s own `type: "single" | "multiple"` prop is a real,
  required, literal prop on the wrapper — not external-inferred.
- **Salt**: `packages/core/src/accordion/` — FOUR real, live files
  (`Accordion`, `AccordionGroup`, `AccordionHeader`, `AccordionPanel`, each
  with its own `.tsx`+`.css`) plus `AccordionContext.ts`. Confirmed
  relationship, read directly rather than assumed from the names:
  **`Accordion` IS the single collapsible item** (not a child of a further
  "item" concept — it holds `expanded`/`disabled`/`status`/`indicatorSide`
  and provides `AccordionContext` to its children), **`AccordionGroup` is a
  PURELY PRESENTATIONAL wrapper** (one `border-bottom` rule, no state and no
  context of its own — `AccordionGroup.tsx` is a bare `<div>`), and
  **`AccordionHeader`/`AccordionPanel` are the trigger/content halves**,
  each reading `useAccordion()` from context. The single biggest structural
  finding this component produced: **Salt has NO group-level exclusivity
  mechanism at all** — see Finding 2.
- **M3**: a genuine FIRST for this pipeline, not a token-poor edition gap
  (alert/progress/spinner's shape) and not a tokens-only component (toast/
  snackbar's shape) but a **TOTAL, CONFIRMED ABSENCE**. Checked two ways per
  CLAUDE.md rule 7 ("grep returning nothing is not evidence of absence"):
  (1) `grep -rli "accordion|expansion-panel|disclosure"` across the WHOLE
  clone returned zero real matches (one incidental hit in `divider/
  divider.ts`, unrelated to any accordion concept); (2) a `find -maxdepth 1
  -type d` listing of every top-level component folder in the clone
  (`button, checkbox, chips, dialog, divider, fab, field, iconbutton, list,
  menu, progress, radio, select, slider, switch, tabs, textfield, tokens,
  typography, ...`) shows no accordion-shaped entry among them. See Finding
  1 for what this absence forces on the template's row policies.

**IN SCOPE**: group (presentational-or-stateful, per column), item, an
optional heading wrapper around the trigger, trigger, expand/collapse icon,
an optional status glyph, content (permanently mounted, toggled via
`hidden`/`aria-hidden`), single-vs-multiple exclusivity where a column has
it, disabled items, indicator side (Salt only), status/tone (Salt only, and
narrower than Banner/alert's four-way axis — no `info` member).

**OUT OF SCOPE, with a structural reason**: nested accordions (an accordion
item containing another whole accordion as its content). Grepped
specifically before excluding: neither Salt's stories nor shadcn's own demo
set nests one `Accordion` inside another's `AccordionContent`/
`AccordionPanel` anywhere in this clone — `content` is modelled as arbitrary
`ReactNode` in both real systems (and in this chassis), which already
covers "an accordion could theoretically be dropped in here" without this
template inventing a dedicated nesting contract neither system's own docs
or examples demonstrate. Declared out, not silently dropped.

**Trigger is IN SCOPE as this component's own part**, not composed from a
hypothetical `button` reuse, because both real systems give it genuinely
different, sourced treatment (weight-600 recolour-on-disabled Salt vs.
weight-500 opacity-on-disabled shadcn — see the style rows) and because
Salt's own real API surface (`status`, `indicatorSide`) lives on the ITEM,
one level away from a generic button contract entirely.

## 1 · Structure

| row | policy | salt | shadcn | m3 |
|---|---|---|---|---|
| `structure.group` | switchable | on — `AccordionGroup`, real but PURELY PRESENTATIONAL (one `border-bottom`, no state/context) [S] | on — `Accordion` (root), a REAL STATEFUL container — owns the open-item set and exclusivity logic [S] | **off** — confirmed absent, see §0 |
| `structure.item` | switchable | on — `Accordion` IS the single collapsible unit [S] | on — `AccordionItem` [S] | off |
| `structure.header` | switchable | **off** — CONFIRMED ABSENT, `AccordionHeader.tsx` renders the `<button>` directly, no wrapping heading element of any kind [S, confirmed absent] | on — `AccordionPrimitive.Header className="flex"` wraps the Trigger; Radix's own published API renders this as an `<h3>` by default [S for the wrapper's real presence; R for the exact rendered tag] | off |
| `structure.trigger` | switchable | on — `AccordionHeader`, a real `<button type="button">` [S] | on — `AccordionTrigger` [S] | off |
| `structure.icon` | switchable | on — `ExpansionIcon`, SWAPS between TWO glyphs (`ChevronDownIcon`/`ChevronUpIcon`) via `useIcon()` [S] | on — ONE `ChevronDownIcon`, ROTATED via CSS on `data-state="open"` [S] | off |
| `structure.status-icon` | switchable | on — `StatusIndicator`, rendered when `status` is set and not disabled [S] | **off** — CONFIRMED ABSENT, no tone/status/sentiment concept anywhere in `accordion.tsx` [S, confirmed absent] | off |
| `structure.content` | switchable | on — `AccordionPanel`, `role="region"`, permanently mounted, toggled via `hidden`+`aria-hidden` [S] | on — `AccordionContent` [S] | off |

**A genuine first for this pipeline's `check-anatomy.mjs` output**:
`accordion 7 parts · 0 shared · 2 system-unique` (`only salt: status-icon`,
`only shadcn: header`). Every prior component had at least one part shared
across all three columns; here NOTHING is shared by all three, simply
because the third column (M3) has zero parts to share with anyone. This is
correct, not a gate bug — see Finding 1.

## 2 · Behavior

| row | policy | salt | shadcn | m3 |
|---|---|---|---|---|
| `behavior.role` | switchable | native `<button>`; `role="region"` on the panel — `AccordionPanel.tsx` [S] | native `<button>`; `role="region"` [R] — external package, but the wrapper's own docs state it "adheres to the WAI-ARIA design pattern" (`content/docs/components/radix/accordion.mdx`) | off |
| `behavior.expand-toggle` | switchable | on — `AccordionHeader.tsx`'s `handleClick` -> `toggle()`, native button gives Enter/Space for free [S] | on [R] — native button + Radix state toggle | off |
| `behavior.exclusive-expand` | switchable | **off** — CONFIRMED ABSENT, `AccordionGroup.tsx` holds no state/context of its own; each `Accordion`'s `expanded` boolean is entirely independent (`useControlled`, scoped per instance) [S, confirmed absent] | on when `type="single"` — real Radix root-level state [S] | off |
| `behavior.collapsible-to-none` | switchable | **off** — MOOT, not missing: with no exclusive-expand mechanism, every item already toggles freely regardless of siblings [S, structural non-applicability] | on, config'd via the real `collapsible` boolean prop, single-mode only [S] | off |
| `behavior.arrow-navigation` | switchable | **off** — CONFIRMED ABSENT, grepped directly: no keydown handler of any kind beyond the native button's own Enter/Space anywhere in `packages/core/src/accordion/` [S, confirmed absent] | on [R] — external package, documented APG accordion pattern | off |
| `behavior.home-end` | switchable | off, same reason as arrow-navigation [S, confirmed absent] | on [R] | off |
| `behavior.disabled-item` | switchable | on — `AccordionHeader.tsx` passes `disabled={disabled}` straight to the native `<button>` [S] | on — `AccordionItem`'s own `disabled` prop -> `disabled:pointer-events-none disabled:opacity-50`, confirmed real in `accordion-disabled.tsx` [S] | off |

**A genuinely CONVERGENT row** (per the seven drift modes' rule 7 —
"an unexplained convergence is the shape rule 1 forbids", explained here so
it is not one): `behavior.role`'s `role="region"` lands on the identical
string in both real columns. This is the ARIA accordion pattern's own fixed
vocabulary (APG defines this role for the panel), independently implemented
— Salt via a literal JSX `role="region"`, shadcn via an external package
this pipeline cannot inspect but which is universally documented to do the
same — not one system's convention leaking into the other.

## 3 · Prop

| row | policy | note |
|---|---|---|
| `prop.type` | switchable | shadcn only: `Accordion`'s own `type: "single" \| "multiple"`, required [S]. Salt: off — no group-level type concept exists (see `behavior.exclusive-expand`). M3: off. |
| `prop.collapsible` | switchable | shadcn only: `Accordion`'s `collapsible?: boolean`, single-mode only [S]. Salt: off, moot. M3: off. |
| `prop.disabled` | switchable | Salt: `Accordion`'s own `disabled` prop [S]. shadcn: `AccordionItem`'s own `disabled` prop [S]. M3: off. |
| `prop.indicator-side` | switchable | Salt only: `Accordion`'s `indicatorSide?: "left" \| "right"`, default `"left"` [S] — also drives `style.content.padding@indented`. shadcn: off, the chevron is always trailing with no side prop [S, confirmed absent]. M3: off. |
| `prop.status` | switchable | Salt only: `Accordion`'s `status?: "error" \| "warning" \| "success"` [S] — note NO `"info"` member exists on this component (unlike Banner/alert's four-way tone), a real, narrower axis. shadcn: off. M3: off. |

## 4 · Slot

| row | note |
|---|---|
| `slot.composes` | The expand/collapse chevron and the status glyph compose a future registry icon-set component; rendered as neutral placeholder glyphs here (same convention as toast/select/dropdown-menu). |
| `slot.trigger-label` | Consumer-owned trigger text. Both real systems accept arbitrary children. |
| `slot.content` | Consumer-owned panel content, arbitrary — both real systems accept arbitrary children (Salt's own stories nest `FlowLayout`/`FormField` composites; shadcn's own demo nests paragraphs). |

## 5 · State

| row | policy | note |
|---|---|---|
| `state.rest` | switchable | The item's collapsed, unfocused, enabled appearance. |
| `state.expanded` | switchable | The item's open appearance — see `style.icon.transform@expanded` and `style.content`'s own `[aria-hidden]` toggle. |
| `state.disabled` | switchable | see `behavior.disabled-item`. |
| `state.hover` | switchable | a genuinely LOW-EMPHASIS treatment on both real systems — see Finding 6. |
| `state.focus-visible` | switchable | keyboard-focus ring on the trigger — see `style.trigger.outline@focus-visible`. |

## 6 · Style — see the generated `Resolved values` block below for every
cell. Selected findings:

### Findings

1. **M3's total absence forces every row in this template to be
   `policy: "switchable"` — a genuine first for this pipeline, and a
   deliberate, not accidental, choice.** `gen-from-template.py` fails the
   build on any `locked` row that is `off` for any column ("Any locked row
   that is missing or off fails" — its own docstring). Every prior
   component had at least one column supplying SOME real value for the
   component's most basic parts (a trigger, a role, a rest colour), so
   those rows could honestly be `locked`. Accordion cannot: M3 is `off` on
   every single row, so nothing in this template could be `locked` without
   instantly failing the generator the moment M3's column is read. This is
   not a workaround — it is the schema behaving exactly as designed,
   surfacing a real fact about the source (M3 has no accordion) as a
   structural property of the template rather than something buried in
   prose. Consequently this template also uses ZERO `policy: "default"`
   rows: a `default` row must supply a REGISTRY DEFAULT value rather than
   ever resolving to `off` (the TOAST-MATRIX.md finding-9 lesson), and
   inventing a default VALUE for a system that has no accordion CONCEPT at
   all would mean fabricating structure/style for M3, exactly what rule 1
   forbids. `switchable` is the only policy this component's true shape
   permits.
2. **Salt's `AccordionGroup` has NO group-level exclusivity mechanism at
   all — the sharpest real behavioural divergence this build found.**
   Grepped directly: `AccordionGroup.tsx` is a bare `<div>` with a
   `clsx(withBaseName(), className)` and nothing else — no `useState`, no
   context provider, no children-cloning. Each child `Accordion` manages
   its OWN `expanded` boolean via `useControlled`, entirely independent of
   its siblings. shadcn's `Accordion` root, by contrast, is a REAL
   stateful container (`type="single"|"multiple"` is a required prop on
   it) that owns the open-item set and enforces exclusivity when
   `type="single"`. A Salt consumer wanting "only one open at a time" must
   wire it up by hand (controlled `expanded`/`onToggle` per `Accordion`,
   coordinated externally) — Salt's own component library provides no
   built-in mechanism for it. Modelled as `behavior.exclusive-expand`
   CONFIRMED OFF for Salt, and verified live in the skeleton's own toggle()
   function: when `config.type` is undefined (Salt), the `type` prop is
   IGNORED regardless of what a consumer passes, and every item toggles
   its own membership in the expanded set independently — not a
   simplification, the real, faithful reproduction of `AccordionGroup`'s
   own architecture.
3. **Salt's keyboard story is CONFIRMED ABSENT beyond the native button's
   own Enter/Space — no roving focus, no Home/End.** Grepped directly:
   there is no keydown handler of any kind anywhere in
   `packages/core/src/accordion/` beyond what a plain `<button>` already
   gives for free. shadcn inherits the documented APG accordion pattern
   (ArrowUp/Down moves focus between triggers, Home/End jump to the
   first/last) from the external, unvendored `radix-ui` package — real per
   its own published docs, not independently confirmable at the exact
   keycode level in this clone. The chassis's own `arrowNav` capability
   gate (`config.arrowNav`) is entirely undefined for Salt, so this
   skeleton's roving-focus code — real, and shared by both columns
   mechanically — simply never runs for that column, matching the same
   "off means the code branch never executes, not a silent grant" pattern
   dropdown-menu's own `typeahead` gate established.
4. **The content-mount technique is a genuine UNSHARED DERIVATION (rule
   6), and the chassis picks ONE of the two real, sourced techniques
   uniformly.** Salt's real `AccordionPanel` stays PERMANENTLY MOUNTED and
   toggles `hidden`+`aria-hidden` plus a CSS `grid-template-rows`
   transition (`AccordionPanel.css`: `transition: grid-template-rows
   var(--salt-duration-perceptible) ease-in-out, opacity ..., visibility
   ...`, 300ms). A non-obvious detail worth recording so a future session
   does not "fix" it: the native `hidden` HTML attribute normally forces
   `display: none` via the User-Agent stylesheet, which would make a CSS
   transition impossible to play — but CSS cascade ORIGIN precedence
   (author styles beat user-agent styles regardless of specificity or
   declaration order, whenever neither uses `!important`) means Salt's own
   `.saltAccordionPanel { display: grid; ... }` rule silently WINS over the
   UA's `[hidden] { display: none }`, so the element stays visually
   grid-collapsing rather than snapping invisible — a real, working, if
   subtle, technique, faithfully reproduced in this template's own base
   CSS (`[data-slot="accordion-content"]` sets `display: grid` at equal-or-
   higher specificity than a bare `[hidden]` selector would). shadcn's real
   mechanism is entirely different: Radix's `Presence` utility MOUNTS/
   UNMOUNTS the content from the DOM entirely, playing a keyframe `height`
   animation (driven by the `--radix-accordion-content-height` CSS var,
   owned by the external, unvendored `tw-animate-css` package) and only
   removing the element once the animation completes. This chassis does
   NOT reproduce the mount/unmount timing — it uses Salt's own
   always-mounted `hidden`+`aria-hidden`+grid-transition technique
   UNIFORMLY across every column, a declared, reasonable simplification
   (the same shape as dropdown-menu's one-level submenu simplification),
   and cites shadcn's `style.content.expand-transition` cell as an `[R]`
   equivalent-effect approximation (200ms ease-out, `tw-animate-css`'s
   well-documented default) rather than the literal keyframe mechanism.
5. **shadcn ROTATES one glyph; Salt SWAPS two glyphs — genuinely different
   mechanisms producing the SAME pixels, so the chassis implements only
   one.** shadcn's chevron is a single `ChevronDownIcon` (lucide-react),
   rotated 180° via `[&[data-state=open]>svg]:rotate-180` plus
   `transition-transform duration-200`. Salt's `ExpansionIcon` swaps
   between `ChevronDownIcon` and `ChevronUpIcon` (two DIFFERENT icons from
   `useIcon()`) with no rotation and no transition at all — confirmed,
   `AccordionHeader.css` has no icon-specific `transition` rule of any
   kind. A rotated chevron-down and a swapped-to chevron-up are visually
   IDENTICAL outcomes, so the skeleton renders one persistent glyph and
   applies the rotation CSS row only where a column has it (shadcn); this
   is recorded as a declared simplification rather than silently modelled
   as "Salt also rotates" (it does not — `style.icon.transform@expanded`
   and `style.icon.transition` are both CONFIRMED OFF for Salt).
6. **Neither real system recolours or backgrounds the trigger on hover —
   a genuine, if quiet, two-way agreement.** shadcn's ONLY hover
   affordance is `hover:underline`, a text-decoration change, not a
   background/colour change (unlike almost every other interactive part
   this pipeline has built, which reach for `bg-accent` or similar).
   Salt's `AccordionHeader.css` has NO `:hover` rule of any kind — only
   `:focus-visible` and `:disabled`. Modelled as `style.trigger.
   text-decoration@hover` (shadcn real; Salt CONFIRMED OFF).
7. **shadcn's real item border sits on the BOTTOM edge; Salt's sits on the
   TOP — a real, opposite-edge divergence, approximated as uniform in this
   chassis.** Salt: `Accordion.css`'s own `border-top`, applied identically
   to every item (Salt intentionally borders every item's top edge,
   including the first, creating a full set of internal dividers under the
   group's own outer `border-bottom`). shadcn: `AccordionItem`'s own
   className is `border-b last:border-b-0` — a bottom border on every item
   EXCEPT the last. This chassis approximates shadcn's rule as a UNIFORM
   per-item bottom border (including the last item) — the `:last-child`
   suppression is a static structural nuance this template's flat
   selector model does not carve out — a declared, minor simplification,
   not a silent one (noted directly on the `style.item.border` row).
8. **`check-anatomy.mjs` reports `accordion 7 parts · 0 shared · 2
   system-unique` — explained per the gate's own rule that a result must
   be answerable with data, not trust.** Every OTHER component this
   pipeline has built shares at least one part across all three columns.
   Accordion shares none, simply because M3 supplies zero parts to share
   with anyone (see Finding 1) — not a retrofit signal, not a gate bug,
   the direct, correct consequence of a genuinely, totally absent third
   system. `only salt: status-icon` and `only shadcn: header` are the two
   real, asymmetric divergences the 59-row matrix's own finer grain
   already documents (structure.status-icon, structure.header) — the same
   "coarse measure, real grain" shape SWITCH-MATRIX.md finding 12 and
   RADIO-GROUP-MATRIX.md finding 4 already established for their own
   convergences, applied here to an near-total DIVERGENCE instead.
9. **Orchestrator live-verification found a REAL geometry bug in the
   chassis's own unshared collapse derivation (Finding 4): a "collapsed"
   panel never actually reached zero height — it settled at exactly its
   own vertical padding sum (measured live: 20px for Salt's medium
   density, 16px for shadcn), not 0.** Root cause is a plain CSS fact, not
   a selector or specificity mistake: `grid-template-rows: 0fr` correctly
   drives the row track to 0, and `min-height: 0` on
   `accordion-content-body` correctly suppresses the grid item's
   content-based automatic minimum size — but neither of those touches
   PADDING. With `box-sizing: border-box`, an element's rendered
   (border-box) height can never render smaller than its own
   padding-top + padding-bottom, regardless of what a shrink-to-fit track
   or `min-height: 0` says — the padding box is a hard floor the browser
   will not compress below. Confirmed live via `getComputedStyle`: the
   collapsed element's resolved `grid-template-rows` was `20px`, not
   `0px`, exactly equal to Salt's own cited `content-padding` value
   (`8px 8px 12px` → 20px vertical). shadcn showed the same shape at its
   own padding value (`0 0 16px` → 16px). Real, visible effect before the
   fix: every "collapsed" item still occupied 16-20px of vertical space,
   so a multi-item accordion with several items closed looked like it had
   dead whitespace gaps rather than a clean stack — not a cosmetic
   nit, a genuine structural defect in a `structure.content` row every
   column expresses. Fixed in `contract/templates/accordion.template.json`'s
   `base` block (chassis-owned, not a per-system cited value, so no
   provenance re-derivation needed) by zeroing
   `accordion-content-body`'s own `padding-top`/`padding-bottom` when its
   ancestor `[data-slot="accordion-content"]` carries `aria-hidden="true"`,
   plus a matching `padding-top`/`padding-bottom` transition on the same
   element so the padding collapses in step with the row's own
   grid-template-rows/opacity/visibility transition rather than snapping.
   Re-verified live after the fix: both Salt and shadcn now measure
   exactly `0` for a collapsed panel's `getBoundingClientRect().height`,
   and the full expand/collapse/exclusive-expand/collapsible-to-none/
   arrow-navigation/Home-End sequence was re-driven end to end with no
   other regressions (Salt: independent per-item toggling confirmed —
   both "info" and "ship" stay open together, no exclusivity; shadcn:
   opening "ship" correctly closes "info" via `type="single"`, a second
   click on "ship" correctly closes it to none via `collapsible`, and
   ArrowDown/End correctly move real focus while skipping the disabled
   "Support" trigger).

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/accordion.template.json` against every system, read from `columns/accordion.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 10 light, 7 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `trigger-fg` | rgb(0, 0, 0) | rgb(255, 255, 255) | **no** |
| `trigger-fg-disabled` | rgba(0, 0, 0, 0.4) | rgba(255, 255, 255, 0.4) | **no** |
| `border-color` | rgba(0, 0, 0, 0.2) | rgba(255, 255, 255, 0.2) | yes |
| `focus-outline` | rgb(0, 69, 126) | rgb(154, 189, 245) | yes |
| `tone-error` | rgb(229, 33, 53) | — | **no** |
| `tone-warning` | rgb(199, 83, 0) | — | **no** |
| `tone-success` | rgb(0, 135, 93) | — | **no** |
| `bg-error` | rgb(255, 236, 234) | rgb(69, 0, 2) | **no** |
| `bg-warning` | rgb(255, 236, 217) | rgb(66, 32, 0) | **no** |
| `bg-success` | rgb(234, 245, 242) | rgb(0, 41, 21) | **no** |

**shadcn** — 3 light, 3 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `fg-muted` | oklch(0.556 0 0) | oklch(0.708 0 0) | yes |
| `border-color` | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | yes |
| `ring` | oklch(0.708 0 0) | oklch(0.556 0 0) | yes |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.group` | structure | switchable | `True` | `True` | **off** |
| 2 | `structure.item` | structure | switchable | `True` | `True` | **off** |
| 3 | `structure.header` | structure | switchable | **off** | `True` | **off** |
| 4 | `structure.trigger` | structure | switchable | `True` | `True` | **off** |
| 5 | `structure.icon` | structure | switchable | `True` | `True` | **off** |
| 6 | `structure.status-icon` | structure | switchable | `error, warning, success` | **off** | **off** |
| 7 | `structure.content` | structure | switchable | `True` | `True` | **off** |
| 8 | `behavior.role` | behavior | switchable | `native <button>; role="region" on the panel` | `native <button>; role="region" (documented APG accordion pattern)` | **off** |
| 9 | `behavior.expand-toggle` | behavior | switchable | `True` | `True` | **off** |
| 10 | `behavior.exclusive-expand` | behavior | switchable | **off** | `on when type="single" — real Radix root-level state` | **off** |
| 11 | `behavior.collapsible-to-none` | behavior | switchable | **off** | `on, config'd via the real collapsible boolean prop (single-mode only)` | **off** |
| 12 | `behavior.arrow-navigation` | behavior | switchable | **off** | `True` | **off** |
| 13 | `behavior.home-end` | behavior | switchable | **off** | `True` | **off** |
| 14 | `behavior.disabled-item` | behavior | switchable | `True` | `True` | **off** |
| 15 | `prop.type` | prop | switchable | **off** | `single, multiple` | **off** |
| 16 | `prop.collapsible` | prop | switchable | **off** | `True` | **off** |
| 17 | `prop.disabled` | prop | switchable | `True` | `True` | **off** |
| 18 | `prop.indicator-side` | prop | switchable | `left, right` | **off** | **off** |
| 19 | `prop.status` | prop | switchable | `error, warning, success` | **off** | **off** |
| 20 | `slot.trigger-label` | slot | switchable | — | — | — |
| 21 | `slot.content` | slot | switchable | — | — | — |
| 22 | `slot.composes` | slot | switchable | — | — | — |
| 23 | `state.rest` | state | switchable | — | — | — |
| 24 | `state.expanded` | state | switchable | — | — | — |
| 25 | `state.disabled` | state | switchable | — | — | — |
| 26 | `state.hover` | state | switchable | — | — | — |
| 27 | `state.focus-visible` | state | switchable | — | — | — |
| 28 | `style.group.border` | style | switchable | `1px solid var(--border-color)` | **off** | **off** |
| 29 | `style.item.border` | style | switchable | `border-top: 1px solid var(--border-color)` | `border-bottom: 1px solid var(--border-color)` | **off** |
| 30 | `style.item.border@error` | style | switchable | ⟡ `tone-error` | **off** | **off** |
| 31 | `style.item.border@warning` | style | switchable | ⟡ `tone-warning` | **off** | **off** |
| 32 | `style.item.border@success` | style | switchable | ⟡ `tone-success` | **off** | **off** |
| 33 | `style.trigger.background` | style | switchable | `transparent` | `transparent` | **off** |
| 34 | `style.trigger.color` | style | switchable | ⟡ `trigger-fg` | **off** | **off** |
| 35 | `style.trigger.font` | style | switchable | ⟡ `type-trigger` | `500 0.875rem/1.25rem ui-sans-serif, system-ui, sans-serif` | **off** |
| 36 | `style.trigger.padding` | style | switchable | ⟡ `trigger-padding` | `16px 0` | **off** |
| 37 | `style.trigger.gap` | style | switchable | ⟡ `trigger-gap` | `16px` | **off** |
| 38 | `style.trigger.min-height` | style | switchable | ⟡ `trigger-min-height` | **off** | **off** |
| 39 | `style.trigger.shape` | style | switchable | **off** | `6px` | **off** |
| 40 | `style.trigger.text-decoration@hover` | style | switchable | **off** | `underline` | **off** |
| 41 | `style.trigger.outline@focus-visible` | style | switchable | `outline: 2px dotted var(--focus-outline); outline-offset: -2px` | `border-color: var(--ring); box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)` | **off** |
| 42 | `style.trigger.opacity@disabled` | style | switchable | **off** | `opacity: 0.5; pointer-events: none` | **off** |
| 43 | `style.trigger.cursor@disabled` | style | switchable | `not-allowed` | **off** | **off** |
| 44 | `style.trigger.background@error` | style | switchable | ⟡ `bg-error` | **off** | **off** |
| 45 | `style.trigger.background@warning` | style | switchable | ⟡ `bg-warning` | **off** | **off** |
| 46 | `style.trigger.background@success` | style | switchable | ⟡ `bg-success` | **off** | **off** |
| 47 | `style.icon.size` | style | switchable | ⟡ `icon-height` | `16px` | **off** |
| 48 | `style.icon.color` | style | switchable | **off** | ⟡ `fg-muted` | **off** |
| 49 | `style.icon.transform@expanded` | style | switchable | **off** | `rotate(180deg)` | **off** |
| 50 | `style.icon.transition` | style | switchable | **off** | `transform 200ms` | **off** |
| 51 | `style.content.padding` | style | switchable | ⟡ `content-padding` | `0 0 16px` | **off** |
| 52 | `style.content.padding@indented` | style | switchable | ⟡ `content-indent` | **off** | **off** |
| 53 | `style.content.font-size` | style | switchable | **off** | `0.875rem` | **off** |
| 54 | `style.content.expand-transition` | style | switchable | `grid-template-rows 300ms ease-in-out, opacity 300ms ease-in-out, visibility 300ms ease-in-out` | `grid-template-rows 200ms ease-out, opacity 200ms ease-out, visibility 200ms ease-out` | **off** |
| 55 | `style.content.reduced-motion` | style | switchable | `transition: none` | **off** | **off** |
| 56 | `style.status-icon.color` | style | switchable | ⟡ `tone-error` | **off** | **off** |
| 57 | `style.status-icon.color@warning` | style | switchable | ⟡ `tone-warning` | **off** | **off** |
| 58 | `style.status-icon.color@success` | style | switchable | ⟡ `tone-success` | **off** | **off** |
| 59 | `style.status-icon.size` | style | switchable | ⟡ `icon-height` | **off** | **off** |

<details><summary>Citations — 144 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.group` | salt | AccordionGroup, a real but purely presentational wrapper (AccordionGroup.tsx/.css) |
| `structure.group` | shadcn | Accordion (root), a real STATEFUL container — the Radix primitive owns the open-item set and exclusivity logic |
| `structure.group` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `structure.item` | salt | Accordion — this IS the single collapsible unit (Accordion.tsx) |
| `structure.item` | shadcn | AccordionItem |
| `structure.item` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `structure.header` | salt | CONFIRMED ABSENT — AccordionHeader.tsx renders the <button> directly, no wrapping heading element of any kind |
| `structure.header` | shadcn | AccordionPrimitive.Header className="flex" wraps AccordionPrimitive.Trigger; Radix's own published API renders this as an <h3> by default (external, [R] for the exact tag) |
| `structure.header` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `structure.trigger` | salt | AccordionHeader, a real <button type="button"> |
| `structure.trigger` | shadcn | AccordionTrigger |
| `structure.trigger` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `structure.icon` | salt | ExpansionIcon, swaps ChevronDownIcon/ChevronUpIcon via useIcon() |
| `structure.icon` | shadcn | ONE ChevronDownIcon (lucide-react), rotated via CSS on data-state="open" — not swapped, see Finding 5 |
| `structure.icon` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `structure.status-icon` | salt | StatusIndicator, rendered in AccordionHeader when status is set and not disabled |
| `structure.status-icon` | shadcn | CONFIRMED ABSENT — no tone/status/sentiment concept anywhere in accordion.tsx |
| `structure.status-icon` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `structure.content` | salt | AccordionPanel, role="region", permanently mounted |
| `structure.content` | shadcn | AccordionContent |
| `structure.content` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `behavior.role` | salt | AccordionHeader.tsx (native button), AccordionPanel.tsx role="region" |
| `behavior.role` | shadcn | [R] — external package; the wrapper's own docs state it 'adheres to the WAI-ARIA design pattern' (content/docs/components/radix/accordion.mdx) |
| `behavior.role` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `behavior.expand-toggle` | salt | AccordionHeader.tsx handleClick -> toggle(), native button gives Enter/Space for free |
| `behavior.expand-toggle` | shadcn | [R] — native button plus Radix state toggle |
| `behavior.expand-toggle` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `behavior.exclusive-expand` | salt | CONFIRMED ABSENT — AccordionGroup.tsx holds no state/context; each Accordion's `expanded` boolean is entirely independent (useControlled scoped per instance) |
| `behavior.exclusive-expand` | shadcn | Accordion's own required type prop, accordion-demo.tsx: type="single" collapsible |
| `behavior.exclusive-expand` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `behavior.collapsible-to-none` | salt | MOOT, not missing — with no exclusive-expand mechanism, every individual Accordion already toggles freely to either state regardless of siblings |
| `behavior.collapsible-to-none` | shadcn | accordion-demo.tsx / accordion.mdx: 'Use collapsible on Accordion' |
| `behavior.collapsible-to-none` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `behavior.arrow-navigation` | salt | CONFIRMED ABSENT — grepped directly, no keydown handler of any kind beyond the native button's own Enter/Space anywhere in packages/core/src/accordion/ |
| `behavior.arrow-navigation` | shadcn | [R] — external package, documented APG accordion pattern |
| `behavior.arrow-navigation` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `behavior.home-end` | salt | CONFIRMED ABSENT, same reason as behavior.arrow-navigation — no roving-focus code exists to jump within |
| `behavior.home-end` | shadcn | [R] — external package, documented APG accordion pattern |
| `behavior.home-end` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `behavior.disabled-item` | salt | AccordionHeader.tsx passes disabled={disabled} straight to the native <button> |
| `behavior.disabled-item` | shadcn | AccordionItem's own disabled prop -> disabled:pointer-events-none disabled:opacity-50 on the trigger, confirmed real in accordion-disabled.tsx |
| `behavior.disabled-item` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `prop.type` | salt | no group-level type concept exists — see behavior.exclusive-expand |
| `prop.type` | shadcn | Accordion's own type: "single" \| "multiple", required Radix root prop |
| `prop.type` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `prop.collapsible` | salt | moot — see behavior.collapsible-to-none |
| `prop.collapsible` | shadcn | Accordion's own collapsible?: boolean, single-mode only |
| `prop.collapsible` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `prop.disabled` | salt | Accordion.tsx's own disabled prop |
| `prop.disabled` | shadcn | AccordionItem's own disabled prop |
| `prop.disabled` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `prop.indicator-side` | salt | Accordion.tsx indicatorSide?: "left" \| "right", default "left" |
| `prop.indicator-side` | shadcn | CONFIRMED ABSENT — the chevron is always trailing, no side prop exists |
| `prop.indicator-side` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `prop.status` | salt | Accordion.tsx status?: "error" \| "warning" \| "success" |
| `prop.status` | shadcn | CONFIRMED ABSENT — no sentiment/tone concept anywhere in accordion.tsx |
| `prop.status` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.group.border` | salt | AccordionGroup.css border-bottom: var(--salt-size-fixed-100) solid var(--salt-separable-tertiary-borderColor) |
| `style.group.border` | shadcn | CONFIRMED OFF — the Accordion root sets no border of its own; only w-full appears in the demo's own className, group-level framing is left entirely to the consumer |
| `style.group.border` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.item.border` | salt | Accordion.css border-top: var(--salt-size-fixed-100) solid var(--salt-separable-tertiary-borderColor) |
| `style.item.border` | shadcn | AccordionItem className: border-b last:border-b-0 (uniform-bottom approximation, see the row's own note) |
| `style.item.border` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.item.border@error` | salt | .saltAccordion-error { border-top-color: var(--salt-status-error-borderColor) } |
| `style.item.border@error` | shadcn | no status axis |
| `style.item.border@error` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.item.border@warning` | salt | .saltAccordion-warning { border-top-color: var(--salt-status-warning-borderColor) } |
| `style.item.border@warning` | shadcn | no status axis |
| `style.item.border@warning` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.item.border@success` | salt | .saltAccordion-success { border-top-color: var(--salt-status-success-borderColor) } |
| `style.item.border@success` | shadcn | no status axis |
| `style.item.border@success` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.trigger.background` | salt | AccordionHeader.css background: transparent (rest) |
| `style.trigger.background` | shadcn | AccordionTrigger className: no bg utility at rest |
| `style.trigger.background` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.trigger.color` | shadcn | CONFIRMED OFF — no dedicated colour class, ambient/inherited text colour, the same absence shape dropdown-menu.shadcn.json's own trigger already established |
| `style.trigger.color` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.trigger.font` | shadcn | AccordionTrigger className: text-sm font-medium |
| `style.trigger.font` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.trigger.padding` | shadcn | AccordionTrigger className: py-4 (no horizontal padding) |
| `style.trigger.padding` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.trigger.gap` | shadcn | AccordionTrigger className: gap-4 |
| `style.trigger.gap` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.trigger.min-height` | shadcn | CONFIRMED OFF, content-driven entirely via py-4 |
| `style.trigger.min-height` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.trigger.shape` | salt | CONFIRMED OFF — AccordionHeader.css has no border-radius rule of its own |
| `style.trigger.shape` | shadcn | AccordionTrigger className: rounded-md = calc(0.625rem * 0.8) |
| `style.trigger.shape` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.trigger.text-decoration@hover` | salt | CONFIRMED OFF — AccordionHeader.css has no :hover rule of any kind, only :focus-visible and :disabled |
| `style.trigger.text-decoration@hover` | shadcn | AccordionTrigger className: hover:underline |
| `style.trigger.text-decoration@hover` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.trigger.outline@focus-visible` | salt | AccordionHeader.css :focus-visible { outline: var(--salt-focused-outline); outline-offset: calc(-1 * var(--salt-focused-outlineWidth)) } |
| `style.trigger.outline@focus-visible` | shadcn | AccordionTrigger className: focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px], the SAME ring technique checkbox.shadcn.json's own style.box.focus already resolved |
| `style.trigger.outline@focus-visible` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.trigger.opacity@disabled` | salt | Salt recolours (content-primary-foreground-disabled, see style.trigger.color) rather than reducing opacity — the same 'recolour not opacity' pattern dropdown-menu.salt.json's own item column already established |
| `style.trigger.opacity@disabled` | shadcn | AccordionTrigger className: disabled:pointer-events-none disabled:opacity-50 |
| `style.trigger.opacity@disabled` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.trigger.cursor@disabled` | salt | AccordionHeader.css :disabled { cursor: var(--salt-cursor-disabled) } |
| `style.trigger.cursor@disabled` | shadcn | CONFIRMED OFF — no explicit cursor property, relies entirely on pointer-events-none |
| `style.trigger.cursor@disabled` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.trigger.background@error` | salt | .saltAccordionHeader-error { background: var(--salt-status-error-background) } |
| `style.trigger.background@error` | shadcn | no status axis |
| `style.trigger.background@error` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.trigger.background@warning` | salt | .saltAccordionHeader-warning { background: var(--salt-status-warning-background) } |
| `style.trigger.background@warning` | shadcn | no status axis |
| `style.trigger.background@warning` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.trigger.background@success` | salt | .saltAccordionHeader-success { background: var(--salt-status-success-background) } |
| `style.trigger.background@success` | shadcn | no status axis |
| `style.trigger.background@success` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.icon.size` | shadcn | ChevronDownIcon className: size-4 |
| `style.icon.size` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.icon.color` | salt | CONFIRMED OFF — no dedicated icon-colour rule anywhere in AccordionHeader.css, inherits the trigger's own text colour |
| `style.icon.color` | shadcn | ChevronDownIcon className: text-muted-foreground |
| `style.icon.color` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.icon.transform@expanded` | salt | CONFIRMED OFF — Salt does not rotate anything; it SWAPS the glyph itself (ChevronDown -> ChevronUp) |
| `style.icon.transform@expanded` | shadcn | AccordionTrigger className: [&[data-state=open]>svg]:rotate-180 |
| `style.icon.transform@expanded` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.icon.transition` | salt | CONFIRMED OFF — no icon-specific transition rule, the glyph swap is instantaneous |
| `style.icon.transition` | shadcn | ChevronDownIcon className: transition-transform duration-200 |
| `style.icon.transition` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.content.padding` | shadcn | AccordionContent's inner div className: pt-0 pb-4 (no horizontal padding) |
| `style.content.padding` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.content.padding@indented` | salt | .saltAccordionPanel-indentedContent { padding-left: calc(spacing-200 + size-icon) }, applied when indicatorSide="left" |
| `style.content.padding@indented` | shadcn | no indicator-side axis exists |
| `style.content.padding@indented` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.content.font-size` | salt | CONFIRMED OFF — AccordionPanel.css sets no font property, content is arbitrary consumer markup |
| `style.content.font-size` | shadcn | AccordionContent className: text-sm |
| `style.content.font-size` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.content.expand-transition` | salt | AccordionPanel.css transition: grid-template-rows var(--salt-duration-perceptible) ease-in-out, opacity ..., visibility ... (--salt-duration-perceptible: 300ms) |
| `style.content.expand-transition` | shadcn | [R] — UNSHARED DERIVATION, see ACCORDION-MATRIX.md Finding 4/8. Real mechanism is a keyframe height animation via --radix-accordion-content-height, owned by the external, unvendored tw-animate-css package; not independently confirmable at the exact-ms level in this clone. This chassis reproduces the same VISIBLE effect via its own shared grid-transition technique, timed to tw-animate-css's well-do |
| `style.content.expand-transition` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.content.reduced-motion` | salt | AccordionPanel.css @media (prefers-reduced-motion: reduce) { .saltAccordionPanel { transition: none } } |
| `style.content.reduced-motion` | shadcn | not confirmable either way — external package boundary, [R] unconfirmable |
| `style.content.reduced-motion` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.status-icon.color` | salt | StatusIndicator.css --statusIndicator-error-color -> status-error-foreground-decorative |
| `style.status-icon.color` | shadcn | no structure.status-icon |
| `style.status-icon.color` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.status-icon.color@warning` | shadcn | no structure.status-icon |
| `style.status-icon.color@warning` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.status-icon.color@success` | shadcn | no structure.status-icon |
| `style.status-icon.color@success` | m3 | CONFIRMED ABSENT — see provenance.total-absence |
| `style.status-icon.size` | salt | AccordionHeader.css .saltAccordionHeader-statusIndicator { height: size-base; margin-left: auto } |
| `style.status-icon.size` | shadcn | no structure.status-icon |
| `style.status-icon.size` | m3 | CONFIRMED ABSENT — see provenance.total-absence |

</details>

<!-- END GENERATED VALUES -->
