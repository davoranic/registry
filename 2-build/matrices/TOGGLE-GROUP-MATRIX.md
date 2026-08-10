# Toggle-group — component template matrix

*Twenty-third live component in the post-clean-slate pipeline (button,
calendar, spinner, tooltip, alert, input, select, dialog, tabs, card, badge,
progress, chip, checkbox, switch, radio-group, slider, toast, dropdown-menu,
accordion, popover, combobox came before). Canonical id `toggle-group`,
matching `1-intro/content/04-component-map.md`'s Actions row: `toggle-group
| ✓ | ✓ toggle-button-group | ✓ outlined-segmented-button` — all three
systems have it, under three different names.*

## 0 · Scope

### The sibling row this matrix deliberately does NOT absorb, and why

The component map lists `toggle` (a single, standalone toggle button) one
row above `toggle-group`: `toggle | ✓ toggle | ✓ toggle-button | —`. This
matrix claims ONLY the group row. The decision, checked against real source
rather than assumed from the two rows sitting next to each other:

- **shadcn's `Toggle`/`toggleVariants` genuinely underpins `ToggleGroupItem`
  in code** — `toggle-group.tsx` imports `toggleVariants` from `./toggle`
  directly [S] — but a standalone `Toggle` carries no SELECTION-SET
  semantics of its own: no shared context, no mutual exclusion, no `value`
  comparison. It is a single two-state control, closer in behavioural shape
  to a checkbox/switch than to a member of a set.
- **M3's own real source states directly that its segmented button has no
  standalone existence**: `segmented-button.ts`'s own doc comment reads,
  verbatim, *"It is intended **only** for use as a child of a
  `SegmentedButtonSet` component. It is **not** intended for use in any
  other context."* [S] — and the component-map's own M3 column for the
  standalone `toggle` row is already `—` (absent), confirming this
  structural line was drawn correctly before this session touched it.
- **Salt's `ToggleButton` genuinely IS usable standalone** (`useToggleButtonGroup()`
  returns `undefined` gracefully outside a group, and the component falls
  back to `aria-pressed`/no explicit role) [S] — but that capability is a
  property of the SAME component this row already models, not a second
  anatomy. Recorded as an info note rather than pulled in as a whole
  separate row (which would require solving shadcn's OWN standalone
  `Toggle` — a different className string, different context defaults —
  extraction work belonging to `toggle`'s own future matrix, not this one).

**Structural reason for the split**: two of three systems draw a real line
between "a togglable button" and "a togglable button that is a member of a
mutually-exclusive-or-independent SET" (M3 explicitly forbids the former
outside the latter; shadcn ships both as genuinely different files with
different context defaults). This matrix claims the SET.

### Is M3's `outlined-segmented-button` really the same idea, or something
### subtly different? Grepped, not assumed from the name.

Confirmed: a row of buttons where one (single) or several (multiple) may be
"pressed"/selected — the same conceptual shape as Salt's/shadcn's own real
components, not a filter/chip-adjacent idea with a similar name. Two
structural facts worth stating up front because they shaped this whole
matrix:

1. **material-web's `labs/` directory ships a REAL, LIVE Lit component for
   this one** — `labs/segmentedbutton{,set}/internal/*.ts`, five files, all
   read in full. This is a genuine divergence from most M3 columns in this
   pipeline, whose structure/behavior rows are `[R]` by necessity because
   material-web is tokens-only. Here, `[S]` is available for structure and
   behavior too, not just style.
2. **M3 has exactly ONE visual family** — only an `outlined-` variant exists
   anywhere under `labs/` or `tokens/versions/v0_192/`, confirmed by
   directory listing; no `filled-segmented-button` exists at all.

### IN SCOPE

The group wrapper (however each system does or doesn't tag it with a role),
individual toggle items (real native `<button>`s in all three — a genuine
first for this pipeline, see structure.item), an optional leading icon, a
text label, the single-vs-multiple selection axis, disabled/validation
handling at both item and group level where each system has it, and the
keyboard story (which, unlike radio-group's own converged version of this
row, genuinely forks three ways — see behavior.arrow-navigation).

### OUT OF SCOPE, with a structural reason

| excluded | where | structural reason |
|---|---|---|
| `toggle` (standalone) | 04-component-map.md, its own row, unbuilt | See above — a real, sourced structural line two of three systems draw themselves. |
| Salt's real multi-select capability | n/a — see prop.selection-mode | Not excluded by choice; CONFIRMED NOT TO EXIST in the real source despite the `Value` type alias suggesting otherwise (a type artifact, not a working feature — see the matrix's own `behavior.pattern` note and prop.selection-mode). |
| M3's literal `@keyframes` checkmark draw-in | style.selected-marker.draw-in@checked | `gen-from-template.py` cannot emit raw `@keyframes`, and `harness/chrome.css` (where dialog/radio-group appended their own) is off-limits to this build's concurrency rules — approximated with a plain CSS transition instead, declared not silent. |
| `field` (label+control+help wrapper) | 04-component-map.md, its own row, unbuilt | Neither real source gives this component its own owned label text — see slot.item-content. |

---

## Sources

- **Salt** `[S]`: `packages/core/src/toggle-button-group/{ToggleButtonGroup.tsx,ToggleButtonGroup.css,ToggleButtonGroupContext.ts}`
  and `packages/core/src/toggle-button/{ToggleButton.tsx,ToggleButton.css}` —
  all five files read in full. `packages/core/stories/toggle-button-group/toggle-button-group.stories.tsx`
  (confirms real icon-only `Tooltip`-wrapped usage and the single-select-only
  story — no example anywhere passes an array `value`). Resolution through
  `packages/theme/css/next/characteristics/{actionable,container,focused,text}.css`,
  `next/palette/{neutral,accent,foreground,alpha}.css`, `next/foundations/color.css`,
  `packages/theme/css/foundations/{size,spacing,cursor,curve}.css`.
- **shadcn** `[S]`: `apps/v4/registry/new-york-v4/ui/{toggle.tsx,toggle-group.tsx}` —
  the CANONICAL pair (the CLI-installed `ui/` directory, per this pipeline's
  established precedent — `npx shadcn@latest add toggle-group`), both built
  on `radix-ui`'s `ToggleGroup`, EXTERNAL and UNVENDORED
  (`apps/v4/package.json:80`, `"radix-ui": "^1.4.3"`, no `node_modules/radix-ui`
  anywhere under `3-source/` — the same boundary DROPDOWN-MENU-MATRIX.md/
  POPOVER-MATRIX.md/COMBOBOX-MATRIX.md already recorded). Read for real
  usage: `registry/new-york-v4/examples/{toggle-group-demo,toggle-group-single,
  toggle-group-sm,toggle-group-lg,toggle-group-outline,toggle-group-disabled,
  toggle-group-spacing}.tsx`, `content/docs/components/base/toggle-group.mdx`
  (its own Changelog claims a default `spacing` of 2, CONTRADICTED by the
  literal file's own `spacing = 0` default parameter — see Finding 1). The
  base-nova/`@base-ui/react` style variant (`registry/bases/base/ui/toggle-group.tsx`)
  was read only for contrast, NOT canonical, matching the precedent already
  set for combobox/dropdown-menu/popover. `primitives/` was NOT cloned, per
  the project's standing rule — every BEHAVIOR cell not independently
  confirmable from the literal className/data-attribute strings is `[R]`,
  citing the general Radix ToggleGroup convention.
- **Material 3** `[S]`: `labs/segmentedbutton/internal/{segmented-button.ts,
  outlined-segmented-button.ts,_shared.scss,_outlined-segmented-button.scss}`
  and `labs/segmentedbuttonset/internal/{segmented-button-set.ts,
  outlined-segmented-button-set.ts,_shared.scss,_outlined-segmented-button-set.scss}` —
  ALL FIVE `.ts` files read in full, a genuine divergence from most M3
  columns (real, live component source, not tokens-only). Tokens:
  `tokens/versions/v0_192/_md-comp-outlined-segmented-button.scss` (the
  pinned edition) plus `tokens/versions/latest/sass/_md-comp-outlined-segmented-button.scss`
  for the edition diff. Resolution through `versions/v0_192/{_md-sys-color.scss,
  _md-ref-palette.scss,_md-sys-shape.scss,_md-sys-state.scss,_md-sys-typescale.scss}`.
  Cross-referenced against columns already resolved in this registry:
  `secondary-container`/`on-secondary-container` (chip.m3.json),
  `on-surface`/`outline` (radio-group.m3.json/combobox.m3.json) — all four
  hexes reused verbatim, not re-derived.

### Edition pin — `v0.192`, per CLAUDE.md's standing decision, and a small one

Diffed both editions of `_md-comp-outlined-segmented-button.scss` directly:
every value in the token function is byte-identical across editions — a
small, no-op pin, matching radio-group's own finding rather than chip's/
progress's own large deltas.

---

## 1 · Structure

| row | policy | salt | shadcn | m3 |
|---|---|---|---|---|
| `structure.group` | locked | `div` — `ToggleButtonGroup.tsx` returns a real `<div role="radiogroup">` [S] | `div` [R] — a thin `radix-ui` wrapper, documented/presumed | `span` — `segmented-button-set.ts`'s `render()` literally returns `<span role="group" class="md3-segmented-button-set">` [S], genuinely live cloned source |
| `structure.item` | locked | `button` — real `<button type="button">` [S] | `button` [R] — Radix's primitives are documented as rendering a native `<button>` | `button` — `segmented-button.ts`'s `render()` literally contains `<button ... class="md3-segmented-button">` [S] |
| `structure.icon-slot` | switchable | `children` — plain composition [S] | `children` — plain composition, with the SAME lesson-12 unsized-svg guard `[&_svg:not([class*='size-'])]:size-4` already gives an unclassed icon [S] | `named-slot` — a DEDICATED `<slot name="icon">`, `hasIcon` detected via `queryAssignedElements({slot:'icon'})` [S] |
| `structure.selected-marker` | switchable | **off** — CONFIRMED ABSENCE, no glyph of any kind anywhere in `ToggleButton.tsx`/`.css` [S] | **off** — CONFIRMED ABSENCE, the entire selected signal is `data-[state=on]:bg-accent data-[state=on]:text-accent-foreground` [S] | `checkmark` — a real, dedicated, ALWAYS-PRESENT checkmark `<svg>`, hidden at rest, fading/scaling in on selection, with the leading icon (if any) fading OUT as it fades in so the two glyphs share one visual slot [S] |

### The sharpest structural divergence this matrix found

`structure.selected-marker` is a real, sourced, system-unique PART — the
same shape TOOLTIP-MATRIX.md's arrow / COMBOBOX-MATRIX.md's empty-state
already established: not a value difference, a whole additional anatomy
node neither Salt's nor shadcn's real source has any equivalent for at all.

## 2 · Behavior

| row | policy | salt | shadcn | m3 |
|---|---|---|---|---|
| `behavior.role` | switchable | ALWAYS `role="radio"`+`aria-checked` when inside a group — `role: toggleButtonGroup ? "radio" : undefined` [S] | `[R]` presumed to SWITCH per `type`: `role="radio"`+`aria-checked` for `type="single"`, `aria-pressed` with no special role for `type="multiple"` — general Radix convention | ALWAYS `aria-pressed`, NEVER `role="radio"`, regardless of `multiselect` — confirmed by reading `segmented-button.ts`'s whole `render()` [S] |
| `behavior.group-role` | switchable | ALWAYS `role="radiogroup"`, hardcoded, not conditional on anything [S] | `[R]` presumed to switch: `radiogroup` (single) / `group` (multiple) | ALWAYS `role="group"`, hardcoded — confirmed reading the whole `segmented-button-set.ts` [S] |
| `behavior.arrow-navigation` | switchable | REAL, explicit JS — `handleKeyDown` queries `button:not([disabled])`, ArrowDown/Right forward, ArrowUp/Left backward, WRAPPING, plus a real roving-tabindex story (`isFocused`/`focus`) [S] | `[R]` presumed Radix roving-focus-group (the same shared primitive its Tabs/RadioGroup use) | **off** — CONFIRMED ABSENCE, grepped the ENTIRE `labs/segmentedbutton{,set}/` tree for "keydown"/"ArrowLeft"/"roving": zero hits. Every enabled button's own `tabindex` is a flat `disabled?'-1':'0'` [S] |
| `behavior.keyboard-activate` | locked | native `<button>` Space/Enter, no keydown override [S] | `[R]` native button semantics | native `<button>` Space/Enter, no keydown override — confirmed by the same full-tree grep above [S] |

### A REAL three-way split, not a convergence

`behavior.arrow-navigation` is the mirror image of radio-group's own version
of this row (which converged for a structural reason — see
RADIO-GROUP-MATRIX.md finding 3). Here the three systems genuinely diverge:
Salt has real, sourced JS; shadcn is presumed to via Radix's shared
primitive; M3 has NONE at all, confirmed by an exhaustive grep of its own
real, live source. The skeleton does not force one system's mechanism onto
the others — plain sequential Tab between real `<button>` elements is the
safe common denominator all three columns render correctly.

### One aria pattern for two selection modes — the real headline finding

`behavior.role`/`behavior.group-role` together record the sharpest single
finding this matrix produced: **M3 uses exactly ONE aria pattern —
`role="group"` + `aria-pressed` — for BOTH single- and multi-select modes**,
confirmed by reading `segmented-button-set.ts`'s and `segmented-button.ts`'s
entire source (no branch anywhere checks `multiselect` before choosing an
ARIA pattern). shadcn's Radix implementation is presumed to switch PATTERNS
entirely depending on `type` (radiogroup/radio for single, group/pressed-
button for multiple) — a genuinely different design decision for the exact
same underlying UI idea.

## 3 · Prop

| row | policy | note |
|---|---|---|
| `prop.selection-mode` | switchable | shadcn `["single","multiple"]`, SOURCE-DEFAULT-FIRST — a real, first-class Radix prop, confirmed in `toggle-group-single.tsx`/`toggle-group-demo.tsx`. M3 `["single","multiple"]`, SOURCE-DEFAULT-FIRST — `SegmentedButtonSet.multiselect: boolean`, default `false`. Salt: **`["single"] ONLY`** — see Finding 2, the real "type artifact, not a working feature" finding. |
| `prop.variant` | switchable | Salt `["solid","bordered"]`, default `solid`. shadcn `["default","outline"]`, default `default`. M3: **off** — CONFIRMED ABSENCE of a variant axis, only one visual family exists at all. |
| `prop.size` | switchable | shadcn ONLY `["sm","default","lg"]`, default `default`, confirmed in `toggle-group-sm.tsx`/`toggle-group-lg.tsx`. Salt: off (density is the equivalent global axis, not a per-component prop). M3: off, `container-height: 40px` hardcoded. |
| `prop.sentiment` | switchable | Salt ONLY `["neutral","accented","positive","negative","caution"]`, default `neutral` — five real CSS blocks confirmed directly. shadcn/M3: off, no tone concept. |
| `prop.orientation` | switchable | Salt `["horizontal","vertical"]`, default `horizontal` — but VISUAL ONLY (see Finding 3). shadcn `["horizontal","vertical"]`, confirmed in `toggle-group-vertical.tsx`. M3: **off** — CONFIRMED ABSENCE, the grid layout is hardcoded horizontal-only. |
| `prop.disabled` | locked | item-level, all three: Salt merges group+own; shadcn native `disabled`, confirmed in `toggle-group-disabled.tsx`; M3 `@property disabled` plus programmatic `getButtonDisabled`/`setButtonDisabled`. |
| `prop.group-disabled` | switchable | Salt `[false,true]`, merged via context. shadcn `[false,true]`, confirmed real in `toggle-group-disabled.tsx`'s own `<ToggleGroup type="multiple" disabled>`. M3: **off** — CONFIRMED ABSENCE, `SegmentedButtonSet`'s own `@property` list has exactly ONE field (`multiselect`); disabled must be set per-button. |
| `prop.validation` | switchable | shadcn ONLY `["off","error"]` — `aria-invalid:border-destructive` is real, class-confirmed. Salt/M3: off, confirmed absence in both real sources. |

## 4 · Slot

| row | note |
|---|---|
| `slot.item-content` | Consumer-owned in all three. Salt/shadcn: plain `children`. M3: a plain STRING `label` property PLUS the dedicated named `slot="icon"` — a real, sourced API-shape difference (M3's label is never JSX children). |
| `slot.composes` | DECLARED COMPOSITION: (a) `toggle`, the standalone sibling deliberately not absorbed — see the scope note; (b) Salt's own icon-only usage wraps EACH `ToggleButton` in a real `<Tooltip>` for the aria-label pairing (`toggle-button-group.stories.tsx`'s `IconOnlyTemplate`), a real, sourced composition with `tooltip` (an already-built row), not modelled here. |

## 5 · State

| row | policy | note |
|---|---|---|
| `state.rest` | locked | Salt: transparent bg, `foreground-primary` text, transparent border. shadcn (default): `bg-transparent`; (outline): `border-input` 1px + `shadow-xs`. M3: NO background of any kind — the ONLY background rule in the whole stylesheet is the selected one; the 1px stroke lives on a separate `.md3-segmented-button__outline` span. |
| `state.selected` | locked | ALL THREE genuinely FILL — a real contrast with radio-group's own Salt/M3 columns, whose containers never filled solid. Salt: transparent → `neutral` (gray-500, mode-invariant) SOLID fill. shadcn: `bg-accent`/`text-accent-foreground`. M3: `secondary-container`/`on-secondary-container` PLUS the checkmark fades in. |
| `state.hover` | switchable | Salt: TWO mechanisms — unselected hover is a flat alpha background; SELECTED hover is instead a darkening SCRIM gradient OVER the existing fill (`linear-gradient(alpha-dark-low, alpha-dark-low) neutral`) — see Finding 4. shadcn: default → `bg-muted`; outline variant OVERRIDES to `bg-accent` instead (a real per-variant divergence). M3: BOTH selected and unselected have their OWN real hover token, plus an 8%-opacity ripple, documented not rendered. |
| `state.focus` | switchable | Salt: 2px dotted outline + hover recolour riding along. shadcn: `border-ring` + 3px ring. M3: label/icon recolours to the focus token (numerically identical to hover) + a separate `md-focus-ring`, documented not rendered. |
| `state.pressed` | switchable | Salt: on, real `:active` rule. shadcn: **off** — CONFIRMED ABSENCE, no `active:` class anywhere in the whole `toggleVariants` string. M3: on, numerically identical to hover/focus, plus a 12%-opacity ripple. |
| `state.disabled` | locked | Salt: flat opacity 0.4 + not-allowed, WITH a real nuance — disabled+selected PRESERVES the selected colour scheme (see Finding 5). shadcn: `pointer-events-none`/opacity 0.5. M3: three separate opacity tokens (0.38 icon/label, 0.12 outline). |

## 6 · Style — see the generated `Resolved values` block below for every
cell. Selected findings:

### Findings

1. **A real doc-vs-source contradiction, resolved by trusting the grep over
   the prose, exactly as this build's own prompt warned to expect.**
   shadcn's `content/docs/components/base/toggle-group.mdx` Changelog claims,
   verbatim: *"Changed the default spacing from 0 to 2 so toggle groups
   render with space between items by default."* The literal, current
   `apps/v4/registry/new-york-v4/ui/toggle-group.tsx` file reads
   `function ToggleGroup({ ..., spacing = 0, ...})` — a DEFAULT OF ZERO,
   not two. These two sources genuinely disagree in this clone. Trusted the
   source file, per CLAUDE.md's own instruction that a grep result outranks
   a secondhand summary — `style.group.gap`/`style.item.shape` are modelled
   on the REAL, current default (a connected, zero-gap layout where only the
   first/last items get any corner rounding), not the docs' own claimed
   default. A worthwhile consequence: at this real default, shadcn's own
   layout converges VISUALLY with M3's always-connected segmented look —
   via two completely different mechanisms (a data-attribute-driven
   Tailwind class vs a `::slotted` CSS selector on a grid) — an explainable
   convergence, not a retrofit.

2. **Salt's real multi-select capability does not exist, despite its own
   `Value` type permitting it — a type artifact, not a working feature,**
   confirmed by reading every reference to `value`/`isSelected`/`select` in
   `ToggleButtonGroup.tsx`/`ToggleButton.tsx`/`ToggleButtonGroupContext.ts`.
   `role="radiogroup"` is a hardcoded literal, never conditional on
   anything. `isSelected(id) { return value === id }` is strict equality
   against ONE held value — an array `value` would only ever match by
   REFERENCE, never by content, so no code path in the real source ever
   produces a working multi-select outcome even though `Value = string |
   readonly string[] | number | undefined` suggests one exists. Recorded as
   `prop.selection-mode` = `["single"]` ONLY for Salt, with the full
   reasoning in the row's own note rather than trusting the type alone.

3. **Salt's own `orientation` prop is VISUAL-ONLY, not keyboard-semantic —
   a real, worth-stating nuance found while reading `handleKeyDown` in
   full.** `ToggleButtonGroup.tsx`'s own keydown handler always maps
   ArrowDown/ArrowRight forward and ArrowUp/ArrowLeft backward REGARDLESS
   of `orientation` — only `.saltToggleButtonGroup-vertical { flex-direction:
   column }` actually changes. shadcn's own Radix roving-focus-group is
   presumed (not independently confirmable, `radix-ui` unvendored) to swap
   its arrow-key mapping for vertical orientation, per the general
   convention its shared primitive follows — meaning Salt's and shadcn's
   `vertical` mode may not feel identical even though both expose the same
   named prop value.

4. **Salt uses TWO different mechanisms for "hover" depending on whether the
   item is also selected, confirmed by reading `actionable.css` directly.**
   Unselected hover: a flat alpha-tinted background swap
   (`--salt-actionable-subtle-background-hover`). Selected hover: a
   DARKENING SCRIM GRADIENT layered OVER the existing selected fill
   (`--salt-actionable-bold-background-hover: linear-gradient(var(--salt-palette-alpha-dark-low),
   var(--salt-palette-alpha-dark-low)) var(--salt-palette-neutral)`) — a
   genuinely different CSS technique for the same interaction concept,
   depending on selection state. Not separately modelled as its own row for
   scope control (declared in `style.item.hover`'s own note and the
   column's `selected-hover-scrim` provenance entry), matching this
   pipeline's established precedent for a secondary variant axis.

5. **Salt's disabled treatment PRESERVES a selected item's colours rather
   than resetting them — confirmed by reading the cascade order directly,
   not assumed from the disabled rule alone.** `ToggleButton.css`'s own
   `[aria-disabled="true"]` rule resets background/colour/border to the
   UNSELECTED rest values (plus `opacity: 0.4`), but it is IMMEDIATELY
   FOLLOWED by a second, equally-specific rule —
   `[aria-checked="true"][aria-disabled="true"], [aria-pressed="true"][aria-disabled="true"]`
   — that RE-APPLIES the selected background/colour/border, without
   re-declaring `opacity`. So a disabled+selected item keeps its fill while
   still dimming, via the opacity property alone persisting from the
   earlier rule. This chassis's own `style.item.disabled` row deliberately
   sets ONLY `opacity`/`cursor` (no colour properties) for all three
   columns specifically so this same preservation happens automatically —
   verified live (see the orchestrator's own re-verification note below).

6. **A real, self-caught correction: the FIRST DRAFT of this column cited a
   Salt token, `--salt-text-action-fontSize`, that does not exist anywhere
   in the theme package — caught by `check-provenance.py`'s own `--tokens
   NOT found` scan, not by eye.** `ToggleButton.css`'s real font declaration
   is a HYBRID of two token families, confirmed by reading it line by line:
   `font-size`/`line-height` use the PLAIN, density-scaled body-size tokens
   (`--salt-text-fontSize`/`--salt-text-lineHeight`, the SAME numeric scale
   radio-group's/checkbox's own root-font rows already use), while
   `font-weight`/`font-family`/`letter-spacing`/`text-transform` use the
   ACTION-specific tokens instead. Fixing the citation surfaced a SECOND,
   genuinely visible fact the first draft had also omitted: `next/characteristics/text.css`
   resolves `--salt-text-action-textTransform` to `uppercase` and
   `--salt-text-action-letterSpacing` to `0.6px` — **Salt's real toggle
   button labels render in ALL CAPS with letter-spacing**, a real,
   sourced, visible detail this column's `style.root.font` row now
   includes rather than silently dropping. Exactly the class of defect
   CLAUDE.md's "gates produce confident false positives before true ones"
   warning describes, except this one was a TRUE positive on the first run.

7. **`check-structure.py`'s gate B flags `toggle-group/shadcn` and
   `toggle-group/m3`'s own `structure.group` as "rendered with no
   dimensions" — a calibrated false positive, matching the exact shape
   CLAUDE.md already documents this gate producing.** The group wrapper is
   `display: inline-flex; width: fit-content` for both columns — it
   legitimately sizes to its own CONTENT (the items inside it), the SAME
   "a part may legitimately size to its own content" exception the gate's
   own docstring names, and the SAME shape `dialog/shadcn`'s own
   `structure.actions` false positive (listed in the identical gate run)
   already represents. Not a real gap — `style.group.gap` IS a real,
   modelled style row for both columns; gate B's own narrow check (border/
   padding sizing rows specifically) simply does not look at `gap`.

8. **`check-anatomy.mjs` flags `toggle-group` with `⚠ identical part-set:
   salt=shadcn` (4 parts, 3 shared, 1 system-unique — M3's own
   `selected-marker`) — explained here, per the gate's own rule that a
   convergence must be answerable with data, not trust, the same shape
   RADIO-GROUP-MATRIX.md finding 4 already established for its own coarse
   convergence.** The gate counts a structure row as a rendered "part"
   whenever its cell is not `off`, regardless of the SPECIFIC VALUE within
   that category. On that coarse measure, Salt and shadcn both populate
   `group`/`item`/`icon-slot` and both leave `selected-marker` off — but
   the two columns disagree on almost everything about the SPECIFIC VALUE
   inside each shared category: `behavior.role`'s ALWAYS-radio-when-grouped
   (Salt) vs presumed-switches-by-mode (shadcn); `behavior.arrow-navigation`'s
   real, sourced JS (Salt) vs presumed Radix primitive (shadcn);
   `prop.selection-mode`'s real capability gap (Salt genuinely single-only,
   shadcn genuinely both); and — the sharpest split — `state.hover`'s
   two-mechanism scrim story (Salt) against a flat, per-variant-overridden
   `bg-muted`/`bg-accent` swap (shadcn). This is not the retrofit shape rule
   1 forbids; the convergence is explained, not absent.

### Live verification performed this session

Playwright/Chromium (global install, confirmed available before relying on
it) driven directly against `out/toggle-group-check.html` and
`out/conformance.html`, confirmed LIVE in all three columns: (a) icon `<svg>`
sizing resolves to a real, small, non-default size (12–14px, not the browser's
large replaced-element default) — the CLAUDE.md rule 12 check this pipeline
has now been bitten by twice before, checked proactively here; (b) the real
TRANSITION (not two static mounts): clicking an unselected single-mode item
correctly deselects its sibling and selects itself; clicking the
ALREADY-selected item correctly deselects it (the sourced, declared
divergence from Salt's own more restrictive real behaviour — see the
skeleton's own file banner); (c) multiple mode allows independent toggling
with NO mutual exclusion, confirmed for shadcn/M3 (both items land `on`
after two clicks); (d) M3's real checkmark marker: `opacity`/`transform`
settle to `1`/`scale(1)` on the selected item and stay at `0` on the
unselected one, confirmed after allowing the transition to finish, not
read mid-flight; (e) a real `:hover` pseudo-class (not a class toggle) on
Salt's unselected item resolves to the exact cited
`rgba(0, 0, 0, 0.1)` background; (f) vertical orientation's own
`flex-direction: column` resolves correctly on a live-rendered group.
`harness/conformance.tsx`'s new `checkToggleGroup()` — 21 assertions across
the three columns (7 per column) — passed 21/21 live in the browser,
bringing the harness total to 278 (21 new), with ZERO failures anywhere in
the suite (the previously-known `tabs`/shadcn/`behavior.activation-mode`
issue CLAUDE.md's Known-open work once tracked is already fixed in this
checkout, confirmed by its absence from the failure list).

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/toggle-group.template.json` against every system, read from `columns/toggle-group.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 10 light, 6 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `neutral` | rgb(114, 119, 125) | — | yes |
| `fg-rest` | rgb(0, 0, 0) | rgb(255, 255, 255) | yes |
| `fg-selected` | rgb(255, 255, 255) | — | yes |
| `bg-hover` | rgba(0, 0, 0, 0.1) | rgba(255, 255, 255, 0.1) | yes |
| `bg-active` | rgba(0, 0, 0, 0.15) | rgba(255, 255, 255, 0.15) | yes |
| `group-bg` | rgb(255, 255, 255) | rgb(16, 24, 32) | yes |
| `group-border` | rgba(0, 0, 0, 0.3) | rgba(255, 255, 255, 0.3) | yes |
| `focus-outline` | rgb(0, 69, 126) | rgb(154, 189, 245) | yes |
| `type-fontFamily` | 'Open Sans', sans-serif | — | **no** |
| `type-fontWeight` | 400 | — | **no** |

**shadcn** — 11 light, 9 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `fg-rest` | oklch(0% 0 0) | oklch(0.985 0 0) | yes |
| `muted-bg` | oklch(0.97 0 0) | oklch(0.269 0 0) | **no** |
| `muted-fg` | oklch(0.556 0 0) | oklch(0.708 0 0) | **no** |
| `accent-bg` | oklch(0.97 0 0) | oklch(0.371 0 0) | **no** |
| `accent-fg` | oklch(0.205 0 0) | oklch(0.985 0 0) | **no** |
| `border-input` | oklch(0.922 0 0) | oklch(1 0 0 / 15%) | yes |
| `ring` | oklch(0.708 0 0) | oklch(0.556 0 0) | yes |
| `danger` | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | yes |
| `shadow-color` | rgb(0 0 0 / 0.05) | — | yes |
| `ring-alpha-invalid` | 20% | 40% | yes |
| `radius-control` | calc(0.625rem * 0.8) | — | yes |

**m3** — 8 light, 7 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `fg-rest` | #1d1b20 | #e6e0e9 | **no** |
| `fg-hover` | #1d1b20 | #e6e0e9 | **no** |
| `outline` | #79747e | #938f99 | yes |
| `selected-container` | #e8def8 | #4a4458 | **no** |
| `on-selected-container` | #1d192b | #e8def8 | **no** |
| `on-selected-container-hover` | #1d192b | #e8def8 | **no** |
| `disabled-content` | #1d1b20 | #e6e0e9 | yes |
| `type-fontFamily` | 'Roboto', sans-serif | — | **no** |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.group` | structure | locked | `div` | `div` | `span` |
| 2 | `structure.item` | structure | locked | `True` | `True` | `True` |
| 3 | `structure.icon-slot` | structure | switchable | `children` | `children` | `named-slot` |
| 4 | `structure.selected-marker` | structure | switchable | **off** | **off** | `checkmark` |
| 5 | `behavior.role` | behavior | switchable | `ALWAYS role="radio" + aria-checked when inside a group (regardless of Salt's own single-select-only reality)` | `[R] presumed to switch per `type`: role="radio"+aria-checked for type="single"; aria-pressed with no special role for type="multiple"` | `ALWAYS aria-pressed on a native button, NEVER role="radio"/aria-checked, regardless of multiselect` |
| 6 | `behavior.group-role` | behavior | switchable | `ALWAYS role="radiogroup", hardcoded, not conditional on anything` | `[R] presumed role="radiogroup" for type="single", role="group" (or none) for type="multiple"` | `ALWAYS role="group", regardless of multiselect` |
| 7 | `behavior.arrow-navigation` | behavior | switchable | `real JS roving-tabindex + wrapping arrow-key nav, ArrowDown/Right forward, ArrowUp/Left backward, disabled siblings skipped via a :not([disabled]) query` | `[R] presumed roving-focus-group: arrow keys move a single tab stop, likely Home/End too` | **off** |
| 8 | `behavior.keyboard-activate` | behavior | locked | `native <button> Space/Enter activation, no keydown override` | `[R] native <button> Space/Enter activation` | `native <button> Space/Enter activation, no keydown override for activation` |
| 9 | `prop.selection-mode` | prop | switchable | `single` | `single, multiple` | `single, multiple` |
| 10 | `prop.variant` | prop | switchable | `solid, bordered` | `default, outline` | **off** |
| 11 | `prop.size` | prop | switchable | **off** | `sm, default, lg` | **off** |
| 12 | `prop.sentiment` | prop | switchable | `neutral, accented, positive, negative, caution` | **off** | **off** |
| 13 | `prop.orientation` | prop | switchable | `horizontal, vertical` | `horizontal, vertical` | **off** |
| 14 | `prop.disabled` | prop | locked | `False, True` | `False, True` | `False, True` |
| 15 | `prop.group-disabled` | prop | switchable | `False, True` | `False, True` | **off** |
| 16 | `prop.validation` | prop | switchable | **off** | `off, error` | **off** |
| 17 | `slot.item-content` | slot | locked | `children: ReactNode` | `children: ReactNode` | `label: string property, PLUS slot="icon" for an icon — NOT children-based the way Salt/shadcn are` |
| 18 | `slot.composes` | slot | default | `True` | `True` | `True` |
| 19 | `state.rest` | state | locked | `transparent background, foreground-primary text, transparent border` | `default: bg-transparent, inherited text colour, no border; outline: border-input 1px border + shadow-xs` | `NO background of any kind — unselected genuinely draws nothing; a separate .md3-segmented-button__outline span carries the 1px stroke` |
| 20 | `state.selected` | state | locked | `a REAL SOLID FILL: background moves to neutral (gray-500), text to foreground-primary-alt (white)` | `background moves to accent, text to accent-foreground — a real solid fill` | `background moves to secondary-container, text/icon to on-secondary-container, PLUS the checkmark glyph fades in (and the leading icon, if any, fades out)` |
| 21 | `state.hover` | state | switchable | `unselected: flat alpha-tinted background; selected: a darkening scrim gradient OVER the existing fill` | `default variant: bg-muted/text-muted-foreground; outline variant OVERRIDES to bg-accent/text-accent-foreground` | `BOTH selected and unselected have their own real hover colour token, plus an 8%-opacity ripple state layer (documented not rendered)` |
| 22 | `state.focus` | state | switchable | `2px dotted outline at 1px offset, plus the hover recolour riding along` | `focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50` | `label/icon colour recolours to the focus token (numerically identical to hover) plus a separate md-focus-ring (documented not rendered)` |
| 23 | `state.pressed` | state | switchable | `background/color/border move to the -active variant` | **off** | `label/icon colour recolours to the pressed token (numerically identical to hover/focus) plus a 12%-opacity ripple` |
| 24 | `state.disabled` | state | locked | `flat opacity 0.4 + not-allowed cursor; a disabled+selected item PRESERVES its selected colours` | `disabled:pointer-events-none disabled:opacity-50` | `three separate opacity tokens: icon/label 0.38, outline 0.12 — the same 0.38-content/0.12-container M3 convention every prior M3 column uses` |
| 25 | `style.group.gap` | style | switchable | ⟡ `group-gap` | `0` | `0` |
| 26 | `style.group.background` | style | switchable | ⟡ `group-bg` | **off** | **off** |
| 27 | `style.group.border` | style | switchable | `border-style: solid; border-width: 1px; border-color: var(--group-border)` | **off** | **off** |
| 28 | `style.group.padding` | style | switchable | ⟡ `group-padding` | **off** | **off** |
| 29 | `style.item.height` | style | default | ⟡ `item-height` | `36px` | `40px` |
| 30 | `style.item.padding` | style | default | ⟡ `item-padding-x` | `8px` | `12px` |
| 31 | `style.item.gap` | style | switchable | ⟡ `item-gap` | `8px` | **off** |
| 32 | `style.item.shape` | style | switchable | ⟡ `item-radius` | ⟡ `radius-control` | `9999px` |
| 33 | `style.item.border-width` | style | switchable | `1px` | `1px` | **off** |
| 34 | `style.item.rest` | style | switchable | `background: transparent; color: var(--fg-rest); border-color: transparent` | `background: transparent` | `background: transparent; color: var(--fg-rest)` |
| 35 | `style.item.selected` | style | switchable | `background: var(--neutral); color: var(--fg-selected); border-color: var(--neutral)` | `background: var(--accent-bg); color: var(--accent-fg)` | `background: var(--selected-container); color: var(--on-selected-container)` |
| 36 | `style.item.hover` | style | switchable | `background: var(--bg-hover); color: var(--fg-rest)` | `background: var(--muted-bg); color: var(--muted-fg)` | `color: var(--fg-hover)` |
| 37 | `style.item.focus` | style | switchable | `outline: 2px dotted var(--focus-outline); outline-offset: 1px; background: var(--bg-hover); color: var(--fg-rest)` | `border-color: var(--ring); box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)` | `color: var(--fg-hover)` |
| 38 | `style.item.pressed` | style | switchable | `background: var(--bg-active); color: var(--fg-rest)` | **off** | `color: var(--fg-hover)` |
| 39 | `style.item.disabled` | style | switchable | `opacity: 0.4; cursor: not-allowed` | `opacity: 0.5; cursor: not-allowed` | **off** |
| 40 | `style.item.validation` | style | switchable | **off** | `border-color: var(--danger); box-shadow: 0 0 0 3px color-mix(in oklab, var(--danger) var(--ring-alpha-invalid), transparent)` | **off** |
| 41 | `style.item.transition` | style | switchable | **off** | `color, box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)` | **off** |
| 42 | `style.selected-marker.paint` | style | switchable | **off** | **off** | `stroke: var(--on-selected-container); fill: none` |
| 43 | `style.selected-marker.draw-in@checked` | style | switchable | **off** | **off** | `opacity 140ms cubic-bezier(0.3, 0, 0, 1), transform 140ms cubic-bezier(0.3, 0, 0, 1)` |
| 44 | `style.root.font` | style | default | `font-size: var(--type-fontSize); line-height: var(--type-lineHeight); font-family: var(--type-fontFamily); font-weight: var(--type-fontWeight); letter-spacing: 0.6px; text-transform: uppercase` | `font-size: 0.875rem; line-height: 1.25rem; font-family: ui-sans-serif, system-ui, sans-serif; font-weight: 500` | `font-size: 0.875rem; line-height: 1.25rem; font-family: var(--type-fontFamily); font-weight: 500` |
| 45 | `style.root.cursor` | style | default | `pointer` | **off** | `pointer` |

<details><summary>Citations — 118 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.group` | salt | ToggleButtonGroup.tsx returns <div role="radiogroup" ...>, providing ToggleButtonGroupContext to children |
| `structure.group` | shadcn | ToggleGroupPrimitive.Root, a thin wrapper around radix-ui's own Root element |
| `structure.group` | m3 | segmented-button-set.ts render(): <span role="group" class="md3-segmented-button-set"> |
| `structure.item` | salt | ToggleButton.tsx <button ref={handleRef} type="button" {...toggleButtonProps}> |
| `structure.item` | shadcn | [R] radix-ui's Toggle/ToggleGroup primitives are documented as rendering a native <button> |
| `structure.item` | m3 | segmented-button.ts render(): <button tabindex=... aria-pressed=... ?disabled=... class="md3-segmented-button"> |
| `structure.icon-slot` | salt | toggle-button-group.stories.tsx IconOnlyTemplate: <ToggleButton ...><LightIcon aria-hidden /></ToggleButton> — a plain child, no dedicated slot concept |
| `structure.icon-slot` | shadcn | toggle-group-demo.tsx: <ToggleGroupItem value="bold"><Bold className="h-4 w-4" /></ToggleGroupItem> — a plain child, sized by icon-default-size when unclassed |
| `structure.icon-slot` | m3 | segmented-button.ts: <slot name="icon"></slot>, hasIcon detected via queryAssignedElements({slot: 'icon', flatten: true}) in update() |
| `structure.selected-marker` | salt | CONFIRMED ABSENCE — see no-selected-marker |
| `structure.selected-marker` | shadcn | CONFIRMED ABSENCE — the whole selected signal is data-[state=on]:bg-accent data-[state=on]:text-accent-foreground, no indicator element |
| `structure.selected-marker` | m3 | segmented-button.ts renderLeadingWithLabel/renderLeadingWithoutLabel — a real <svg class="md3-segmented-button__checkmark"> with a drawn <path>, see checkmark-choreography |
| `behavior.role` | salt | ToggleButton.tsx: role: toggleButtonGroup ? "radio" : undefined; aria-checked: toggleButtonGroup ? selected : undefined |
| `behavior.role` | shadcn | the general Radix ToggleGroup convention, not independently confirmable |
| `behavior.role` | m3 | see item-role-always-pressed |
| `behavior.group-role` | salt | ToggleButtonGroup.tsx <div role="radiogroup" ...> |
| `behavior.group-role` | shadcn | per the linked Radix docs and the general convention |
| `behavior.group-role` | m3 | see group-role-always-group |
| `behavior.arrow-navigation` | salt | ToggleButtonGroup.tsx handleKeyDown; ToggleButtonGroupContext.ts isFocused/focus |
| `behavior.arrow-navigation` | shadcn | Radix's own shared roving-focus primitive, the same one its Tabs/RadioGroup use; not independently confirmable |
| `behavior.arrow-navigation` | m3 | CONFIRMED ABSENCE — see no-keyboard-nav. Every enabled button is independently Tab-stoppable in sequence; there is no roving single tab-stop. |
| `behavior.keyboard-activate` | salt | ToggleButton.tsx — no keydown handler bound at all |
| `behavior.keyboard-activate` | shadcn | presumed, per the linked docs |
| `behavior.keyboard-activate` | m3 | segmented-button.ts — no keydown handler bound anywhere (see no-keyboard-nav) |
| `prop.selection-mode` | salt | role="radiogroup" hardcoded + strict === comparison in isSelected — see single-select-only-confirmed |
| `prop.selection-mode` | shadcn | toggle-group-single.tsx: type="single"; toggle-group-demo.tsx: type="multiple" — both real, first-class values |
| `prop.selection-mode` | m3 | SegmentedButtonSet.multiselect: boolean, default false (single) — setButtonSelected() branches directly on it |
| `prop.variant` | salt | appearance?: Extract<ButtonAppearance, "bordered"\|"solid">, default "solid" |
| `prop.variant` | shadcn | toggleVariants defaultVariants: { variant: "default" } |
| `prop.variant` | m3 | CONFIRMED ABSENCE — see only-one-variant-family |
| `prop.size` | salt | no per-component size prop — Salt's equivalent axis is the global density system |
| `prop.size` | shadcn | toggleVariants defaultVariants: { size: "default" }; toggle-group-sm.tsx/toggle-group-lg.tsx |
| `prop.size` | m3 | container-height: 40px is a single hardcoded literal, no size axis |
| `prop.sentiment` | salt | sentiment?: ButtonSentiment, default "neutral" |
| `prop.sentiment` | shadcn | CONFIRMED ABSENCE, no tone/sentiment concept |
| `prop.sentiment` | m3 | CONFIRMED ABSENCE, no tone concept |
| `prop.orientation` | salt | orientation?: "horizontal"\|"vertical", default "horizontal" — VISUAL ONLY, see the template row's own note |
| `prop.orientation` | shadcn | toggle-group-vertical.tsx: <ToggleGroup multiple orientation="vertical" ...> |
| `prop.orientation` | m3 | CONFIRMED ABSENCE — _shared.scss's grid-auto-flow: column layout is hardcoded horizontal-only, no vertical token/class/property anywhere |
| `prop.disabled` | salt | toggleButtonGroup?.disabled \|\| disabledProp |
| `prop.disabled` | shadcn | native disabled on ToggleGroupItem, confirmed in toggle-group-disabled.tsx |
| `prop.disabled` | m3 | SegmentedButton.disabled: boolean, plus programmatic getButtonDisabled(index)/setButtonDisabled(index, disabled) on the SET |
| `prop.group-disabled` | salt | ToggleButtonGroupProps.disabled?: boolean |
| `prop.group-disabled` | shadcn | toggle-group-disabled.tsx: <ToggleGroup type="multiple" disabled> |
| `prop.group-disabled` | m3 | CONFIRMED ABSENCE — SegmentedButtonSet's own @property list has exactly ONE field (multiselect); disabled must be set per-button or via the per-index setButtonDisabled helper, not one group-wide switch |
| `prop.validation` | salt | CONFIRMED ABSENCE — no validationStatus/error/warning field anywhere in either component |
| `prop.validation` | shadcn | toggleVariants base string aria-invalid:border-destructive aria-invalid:ring-destructive/20, a bare boolean the consumer sets directly |
| `prop.validation` | m3 | CONFIRMED ABSENCE, read the whole token file for both editions |
| `slot.item-content` | salt | ToggleButton.tsx |
| `slot.item-content` | shadcn | ToggleGroupItem |
| `slot.item-content` | m3 | segmented-button.ts: @property() label = '' |
| `slot.composes` | salt | toggle-button-group.stories.tsx's IconOnlyTemplate wraps each ToggleButton in a real <Tooltip content="..." >; the four siblings this matrix's scope note declares (toggle, and — inherited from radio-group's own precedent — form-field for status inheritance, not directly used by this component's own real source but the general Salt composition convention) |
| `slot.composes` | shadcn | toggle (the standalone sibling row, deliberately not absorbed — toggleVariants genuinely underpins both) — see the matrix doc's own scope note |
| `slot.composes` | m3 | SegmentedButton's own doc comment: 'intended **only** for use as a child of a SegmentedButtonSet component. It is **not** intended for use in any other context' — the structural reason the standalone `toggle` sibling row is declared out of scope, see the matrix doc's own scope note |
| `state.rest` | salt | the SAME appearance for hover-inactive as active, since fg-rest never changes across rest/hover/active for the neutral/solid family — only background does |
| `state.selected` | salt | unlike radio-group's own Salt column, which never filled solid |
| `state.hover` | salt | see bg-hover and selected-hover-scrim |
| `state.hover` | shadcn | see outline-hover-override |
| `state.focus` | salt | ToggleButton.css :focus-visible |
| `state.pressed` | salt | ToggleButton.css :active |
| `state.pressed` | shadcn | CONFIRMED ABSENCE — see no-active-class |
| `state.disabled` | salt | see disabled-preserves-selected |
| `style.group.gap` | shadcn | spacing=0 default -> gap-[--spacing(var(--gap))] resolves to 0 — see spacing-default-is-zero-not-two |
| `style.group.gap` | m3 | CONFIRMED ABSENCE of any gap declaration in the grid layout — see the template row's own note |
| `style.group.background` | shadcn | CONFIRMED ABSENCE, no bg-* class on the Root |
| `style.group.background` | m3 | CONFIRMED ABSENCE |
| `style.group.border` | salt | ToggleButtonGroup.css border: var(--toggleButtonGroup-borderWidth) solid var(--salt-container-primary-borderColor); --toggleButtonGroup-borderWidth resolves to --salt-size-fixed-100 = 1px, density-invariant |
| `style.group.border` | shadcn | CONFIRMED ABSENCE, no group-level border — bordering happens per-item (variant="outline") |
| `style.group.border` | m3 | CONFIRMED ABSENCE, no group-level border — the 1px stroke lives per-item |
| `style.group.padding` | shadcn | CONFIRMED ABSENCE, no padding on the Root |
| `style.group.padding` | m3 | CONFIRMED ABSENCE |
| `style.item.height` | shadcn | toggleVariants defaultVariants size="default" -> h-9 |
| `style.item.height` | m3 | container-height: 40px, hardcoded, both editions |
| `style.item.padding` | shadcn | toggleVariants defaultVariants size="default" -> px-2 |
| `style.item.padding` | m3 | see hardcoded-spacing-workaround |
| `style.item.gap` | shadcn | toggleVariants base string gap-2 |
| `style.item.gap` | m3 | CONFIRMED ABSENCE of a `gap` property between icon and label; spacing is achieved via the graphic's own calculated width instead — see the template row's own note |
| `style.item.shape` | shadcn | rounded-md base, data-[spacing=0]:rounded-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md |
| `style.item.shape` | m3 | tokens/versions/v0_192/_md-comp-outlined-segmented-button.scss token function 'shape': md-sys-shape.corner-full |
| `style.item.border-width` | salt | --toggleButton-borderWidth: var(--salt-size-fixed-100) = 1px |
| `style.item.border-width` | shadcn | border border-input |
| `style.item.border-width` | m3 | the 1px stroke lives on a separate .md3-segmented-button__outline span, not a border-width property of the button itself — see the template row's own note |
| `style.item.rest` | salt | ToggleButton.css .saltToggleButton-neutral.saltToggleButton-solid |
| `style.item.rest` | shadcn | toggleVariants variant.default: bg-transparent |
| `style.item.rest` | m3 | see state.rest |
| `style.item.selected` | salt | ToggleButton.css [aria-checked="true"], [aria-pressed="true"] |
| `style.item.selected` | shadcn | data-[state=on]:bg-accent data-[state=on]:text-accent-foreground |
| `style.item.selected` | m3 | see selected-container / on-selected-container |
| `style.item.hover` | salt | ToggleButton.css @media(hover:hover) :hover (unselected-item mechanism — see selected-hover-scrim for the selected variant, not separately modelled) |
| `style.item.hover` | shadcn | hover:bg-muted hover:text-muted-foreground (default variant; see outline-hover-override for the outline variant's own divergence, not separately modelled) |
| `style.item.hover` | m3 | unselected-hover-label-text-color -> on-surface, numerically identical to rest — see fg-rest / fg-hover |
| `style.item.focus` | salt | ToggleButton.css :focus-visible |
| `style.item.focus` | shadcn | focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 |
| `style.item.focus` | m3 | unselected-focus-label-text-color -> on-surface, numerically identical to hover |
| `style.item.pressed` | salt | ToggleButton.css :active |
| `style.item.pressed` | shadcn | CONFIRMED ABSENCE |
| `style.item.pressed` | m3 | unselected-pressed-label-text-color -> on-surface, numerically identical to hover/focus |
| `style.item.disabled` | salt | ToggleButton.css [aria-disabled="true"] — see disabled-preserves-selected for why colours are NOT re-declared here |
| `style.item.disabled` | shadcn | disabled:pointer-events-none disabled:opacity-50 |
| `style.item.disabled` | m3 | dimming happens PER-ELEMENT (icon/label/outline each carry their own opacity token) rather than on the item container as a whole — see the template row's own note |
| `style.item.validation` | salt | CONFIRMED ABSENCE |
| `style.item.validation` | shadcn | aria-invalid:border-destructive aria-invalid:ring-destructive/20 (light) dark:aria-invalid:ring-destructive/40 (dark) |
| `style.item.validation` | m3 | CONFIRMED ABSENCE |
| `style.item.transition` | salt | EXPLICIT `transition: none;` — see no-transition |
| `style.item.transition` | shadcn | transition-[color,box-shadow] |
| `style.item.transition` | m3 | M3's own real motion on this component lives on the checkmark/icon choreography, not a general item-level transition — see style.selected-marker.draw-in@checked |
| `style.selected-marker.paint` | salt | no marker glyph exists — see structure.selected-marker |
| `style.selected-marker.paint` | shadcn | no marker glyph exists |
| `style.selected-marker.paint` | m3 | selected-icon-color -> on-secondary-container; .md3-segmented-button__checkmark-path { stroke: var(--_selected-icon-color) }, fill="none" is a literal in the real SVG markup |
| `style.selected-marker.draw-in@checked` | salt | no marker glyph exists |
| `style.selected-marker.draw-in@checked` | shadcn | no marker glyph exists |
| `style.selected-marker.draw-in@checked` | m3 | DECLARED APPROXIMATION of the real stroke-dashoffset @keyframes draw-in — see checkmark-choreography and the template row's own note explaining why a literal keyframe animation could not be reproduced in this build |
| `style.root.font` | salt | ToggleButton.css — a HYBRID of the plain body-size tokens and the ACTION-role weight/family/letter-spacing/text-transform tokens, see action-role-partial |
| `style.root.font` | shadcn | text-sm font-medium |
| `style.root.font` | m3 | label-text-font/-size/-line-height/-weight -> md-sys-typescale.label-large, the same typescale radio-group.m3.json's own type-option row already used |
| `style.root.cursor` | salt | --salt-cursor-hover / --salt-cursor-active, both resolve to pointer — see cursor-hover-equals-cursor-active |
| `style.root.cursor` | shadcn | CONFIRMED ABSENCE, no cursor-pointer class |
| `style.root.cursor` | m3 | _shared.scss .md3-segmented-button:enabled { cursor: pointer } |

</details>

<!-- END GENERATED VALUES -->
