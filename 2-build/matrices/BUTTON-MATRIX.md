# Button — component template matrix

*Written retroactively. Button was the SECOND component built (2026-08-02),
before the matrix-doc convention existed — it went straight to template +
columns + skeleton. Everything below is reconstructed from the artifacts it
actually produced (`contract/templates/button.template.json`,
`themes/columns/button.*.json`) and re-verified against the clones, so it is
documentation of a real build, not a retrofit of one.*

**Cell legend** · `⟡ slot` = alias to a shared contract slot · **bold** = the
system's own switch · `OFF` = row switched off in this column · `[S]` = grepped
from the clone · `[R]` = inferred, reason given.

**Row policies** · 🔒 locked-on · ⚪ switchable · ⬜ on-with-default.

**Naming rule** — grammar `<piece>.<part>[.<subpart>].<property>[@state]`,
enforced by `contract/template.schema.json`.

## Scope note

In scope: the standard action button. Out of scope, each a separate canonical
row in `docs/COMPONENTS.md` with a structural reason:

- **icon-button** — shadcn and Salt treat it as a size/shape variant, but M3
  ships `_md-comp-(filled|outlined)-icon-button.scss` as its own token family.
  It is its own row precisely because the systems disagree about whether it is
  one component or two.
- **fab** — M3-only, ~20 token files for one component.
- **toggle / toggle-group** — a selected-state control, not an action.
- **button-group** — shadcn-only container.

Sources: `salt-ds/packages/core/src/button/{Button.tsx,Button.css}` [S];
`ui/apps/v4/registry/new-york-v4/ui/button.tsx` [S];
`material-web/tokens/versions/v0_192/_md-comp-{filled,outlined,text,elevated,filled-tonal}-button.scss` [S].
M3 is a tokens-only clone, so every M3 structure/behaviour row is `[R]` and
every M3 style row is `[S]`.

**Edition pin.** `v0.192`, per the owner's standing decision that all M3
columns pin that edition.

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| root | 🔒 | `<button>` [S] | `<button>`, or any element via `asChild` [S] | `<button>` [R] |
| label | 🔒 | `children` [S] | `children` [S] | `label-text-*` tokens [S] |
| icon | ⚪ | composed child, no dedicated part [S] | `[&_svg]` selector sizes any svg child [S] | `with-icon-*` token family [S] |
| spinner | ⚪ | **on** — `.saltButton-spinner`, shown when `emphasis="loading"` [S] | OFF — no loading concept [S] | OFF — no loading token [S] |

**This component has no `structure` rows in its template** — every part above is
unconditional or handled by the skeleton without a config switch. That is why
`check-anatomy.mjs` reports "no structure rows — nothing to compare" for button,
and it means the anatomy gate cannot speak for this component either way. A
genuine limitation, recorded rather than glossed.

## 2 · Behavior

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| native activation | 🔒 | native `<button>` — Enter and Space, free [S] | native, or delegated by `asChild` [S] | native [R] |
| loading suppresses activation | ⚪ | **on** — `emphasis="loading"` sets `disabled` + `aria-busy` [S] | OFF [S] | OFF [S] |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| tone | ⚪ | **5** — neutral, accent, negative, positive, caution [S] | **2** — default, destructive [S] | **4** — primary, secondary, tertiary, error [S] |
| emphasis | ⚪ | **4** — solid, bordered, transparent, loading [S] | **5** — default, outline, secondary, ghost, link [S] | **5** — filled, outlined, text, elevated, filled-tonal [S] |
| size | ⚪ | **OFF** — height comes from density alone, no per-instance size axis [S] | **4** — xs, sm, default, lg [S] | OFF — single height [S] |
| icon-only | ⚪ | OFF — composed via `aria-label` + `.saltButton-sr-only`, not a size switch [S] | **on** — `icon`, `icon-xs/sm/lg` square variants [S] | OFF — a separate component in M3 [S] |

**The tone axis is the sharpest divergence in the component**: Salt has five
sentiments, M3 has four colour roles, shadcn has two. Only the default tone is
rendered — see the declared deferral on `style.root.height`.

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| label | 🔒 | consumer-owned in all three. **Salt uppercases it** (`text-transform: uppercase`, `letter-spacing: 0.6px`, from `characteristics/text.css`); shadcn and M3 render it as typed. Content formatting is character — this row is the reason a Salt button reads as a Salt button. |

## 5 · States

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| hover | 🔒 | darkening gradient overlay, not a flat swap [S] | `bg-primary/90` [S] | 8% state layer [S] |
| active/pressed | ⚪ | **on** — distinct background [S] | OFF — no `:active` rule [S] | 12% state layer [S] |
| focus-visible | 🔒 | 2px **dotted** outline, 1px offset [S] | 3px translucent ring [S] | 3px ring [S] |
| disabled | 🔒 | opacity 0.4 [S] | opacity 0.5 [S] | **two** opacities — 0.12 container, 0.38 label [S] |

Three systems, three disabled mechanisms: one flat opacity at 0.4, one at 0.5,
and M3 dimming container and text by different amounts. Not a value difference —
a mechanism difference.

## Findings

1. **Fixed.** Salt's `--secondary-bg-hover` slot was defined in both light and
   dark but referenced by no rule, so a Salt bordered button had no hover
   state. A naive hover row would still have lost the cascade — `@secondary`
   is (0,5,0) against `:hover`'s (0,4,0) — so the fix is a dedicated
   `style.root.background@secondary-hover` row combining `@secondary`'s own
   selector predicate with `:hover:not(:disabled)`, landing at (0,7,0), always
   above both. All three columns filled: Salt aliases the pre-existing
   `secondary-bg-hover` slot; shadcn gets a new `outline-hover-bg` slot
   (`hover:bg-accent` light, `dark:hover:bg-input/50` dark, the dark cell
   expressed as `color-mix(in oklab, var(--outline-border) 50%, transparent)`
   since `outline-border`'s dark slot already equals raw `--input` dark and
   `/50` is Tailwind v4's own opacity mechanism); M3 mirrors the button's own
   `@hover` row formula with the container operand swapped from
   `var(--action-bg)` to `transparent` (outlined's real container), same
   `hover-state-layer-opacity: 0.08` token. `gen-from-template.py button` is
   clean on all three columns; `check-structure.py` gate A no longer flags
   this pair. Found by `check-structure.py` gate A, months of renders after
   the component was "validated".
   **Related, still open:** the same gate also flags `@active` against
   `@secondary` at equal specificity — Salt even has an unused
   `secondary-bg-active` slot, the same shape of bug. Out of scope here
   (only the hover row was asked for); needs its own
   `@secondary-active` row the same way.
2. **Three bugs were caught during the original build**, recorded in
   `CLAUDE.md`: an undefined-array crash on a system with no `size` prop; a
   conflated capability-vs-instance flag that silently blanked shadcn's labels;
   and a selector hardcoding Salt's own attribute values
   (`[data-tone="neutral"][data-emphasis="solid"]`) into a template meant to be
   system-agnostic, which silently broke shadcn's and M3's base colour rules
   while a stale render looked correct. That third one is why default-axis
   selectors must be bare `[data-slot="x"]` with non-default axis values as
   higher-specificity overrides.
3. **Declared deferral: only the default tone and size render.** Per-prop-value
   style resolution (a cell keyed by prop value, the way `byDensity` is keyed by
   density) is not built. shadcn's real heights are xs 24 / sm 32 / default 36 /
   lg 40px; only 36px is emitted. Recorded on the cell, not silently dropped.
4. **M3 splits one canonical component across five token files.** filled,
   outlined, text, elevated and filled-tonal are five files that consolidate to
   one `prop.emphasis` axis — the consolidation is matrix work, and getting it
   wrong would have produced five "components".

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/button.template.json` against every system, read from `columns/button.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 15 light, 7 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `action-bg` | rgb(114, 119, 125) | — | yes |
| `action-fg` | rgb(255, 255, 255) | — | yes |
| `action-bg-hover` | linear-gradient(rgba(0,0,0,0.15),rgba(0,0,0,0.15)) rgb(114, 119, 125) | — | yes |
| `action-bg-active` | rgb(211, 213, 216) | rgb(58, 63, 68) | yes |
| `action-border` | rgb(114, 119, 125) | — | yes |
| `action-border-hover` | rgba(0,0,0,0.3) | rgba(255,255,255,0.3) | yes |
| `action-fg-hover` | rgb(255, 255, 255) | — | **no** |
| `action-fg-active` | rgb(0, 0, 0) | rgb(255, 255, 255) | yes |
| `secondary-bg` | transparent | — | **no** |
| `secondary-bg-hover` | rgb(230, 233, 235) | rgb(41, 46, 51) | yes |
| `secondary-bg-active` | rgb(211, 213, 216) | rgb(58, 63, 68) | yes |
| `secondary-border` | rgb(114, 119, 125) | — | yes |
| `secondary-fg` | rgb(0, 0, 0) | rgb(255, 255, 255) | yes |
| `focus` | rgb(0, 69, 126) | rgb(154, 189, 245) | yes |
| `border-width` | 1px | — | **no** |

**shadcn** — 12 light, 9 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `action-bg` | oklch(0% 0 0) | oklch(0.922 0 0) | yes |
| `action-fg` | oklch(0.985 0 0) | oklch(0.205 0 0) | **no** |
| `secondary-bg` | oklch(0.97 0 0) | oklch(0.269 0 0) | yes |
| `secondary-fg` | oklch(0.205 0 0) | oklch(0.985 0 0) | **no** |
| `outline-bg` | oklch(1 0 0) | oklch(1 0 0 / 10%) | yes |
| `outline-border` | oklch(0.922 0 0) | oklch(1 0 0 / 15%) | **no** |
| `ghost-hover-bg` | oklch(0.97 0 0) | oklch(0.371 0 0 / 50%) | yes |
| `focus` | oklch(0.708 0 0) | oklch(0.556 0 0) | yes |
| `radius-control` | calc(0.625rem * 0.8) | — | yes |
| `type-label` | 500 0.875rem/1.25rem ui-sans-serif, system-ui, sans-serif | — | yes |
| `shadow-color` | rgb(0 0 0 / 0.05) | — | **no** |
| `outline-hover-bg` | oklch(0.97 0 0) | color-mix(in oklab, var(--outline-border) 50%, transparent) | yes |

**m3** — 6 light, 5 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `action-bg` | #6750a4 | #d0bcff | yes |
| `action-fg` | #ffffff | #381e72 | yes |
| `on-surface` | #1d1b20 | #e6e0e9 | **no** |
| `outline-color` | #79747e | #938f99 | yes |
| `focus` | #6750a4 | #d0bcff | **no** |
| `type-label` | 500 14px/20px Roboto, sans-serif | — | yes |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `prop.tone` | prop | default | `neutral, accent, negative, positive, caution` | `default` | `primary, secondary, tertiary, error` |
| 2 | `prop.emphasis` | prop | default | `solid, bordered, transparent, loading` | `default, outline, secondary, ghost, link` | `filled, outlined, text, elevated, filled-tonal` |
| 3 | `prop.size` | prop | default | **off** | `xs, sm, default, lg` | **off** |
| 4 | `prop.icon-only` | prop | switchable | **off** | `True` | **off** |
| 5 | `behavior.trigger-active-state` | behavior | locked | — | — | — |
| 6 | `behavior.loading` | behavior | switchable | `loading` | **off** | **off** |
| 7 | `state.disabled` | state | locked | — | — | — |
| 8 | `state.hover` | state | locked | — | — | — |
| 9 | `state.active` | state | locked | — | — | — |
| 10 | `state.focus` | state | locked | — | — | — |
| 11 | `slot.icon` | slot | default | — | — | — |
| 12 | `slot.label` | slot | default | — | — | — |
| 13 | `style.root.height` | style | default | ⟡ `control-size` | `36px` | `40px` |
| 14 | `style.root.padding` | style | default | `calc(var(--inset) - var(--border-width))` | `16px` | `24px` |
| 15 | `style.root.gap` | style | default | ⟡ `gap` | `8px` | `8px` |
| 16 | `style.root.shape` | style | default | `var(--corner-weak, 0)` | ⟡ `radius-control` | `999px` |
| 17 | `style.root.border-width` | style | switchable | `1px` | **off** | **off** |
| 18 | `style.root.font` | style | default | ⟡ `type-action` | ⟡ `type-label` | ⟡ `type-label` |
| 19 | `style.root.text-transform` | style | switchable | `text-transform: uppercase; letter-spacing: 0.6px` | **off** | **off** |
| 20 | `style.root.background` | style | locked | ⟡ `action-bg` | ⟡ `action-bg` | ⟡ `action-bg` |
| 21 | `style.root.color` | style | locked | ⟡ `action-fg` | ⟡ `action-fg` | ⟡ `action-fg` |
| 22 | `style.root.border-color` | style | switchable | ⟡ `action-border` | **off** | **off** |
| 23 | `style.root.background@hover` | style | locked | ⟡ `action-bg-hover` | `color-mix(in oklab, var(--action-bg) 90%, transparent)` | ƒ `color-mix(in srgb, var(--action-fg) 8%, var(--action-bg))` |
| 24 | `style.root.background@active` | style | switchable | ⟡ `action-bg-active` | **off** | ƒ `color-mix(in srgb, var(--action-fg) 12%, var(--action-bg))` |
| 25 | `style.root.opacity@disabled` | style | locked | `opacity: 0.4` | `opacity: 0.5` | `background: color-mix(in srgb, var(--on-surface) 12%, transparent); color: color-mix(in srgb, var(--on-surface) 38%, transparent)` |
| 26 | `style.root.focus` | style | locked | `outline-style: dotted; outline-width: 2px; outline-color: var(--focus); outline-offset: 1px` | `outline: none; box-shadow: 0 0 0 3px color-mix(in oklab, var(--focus) 50%, transparent)` | ƒ `background: color-mix(in srgb, var(--action-fg) 12%, var(--action-bg)); outline: 3px solid var(--focus); outline-offset: 2px` |
| 27 | `style.root.elevation` | style | switchable | **off** | `0 1px 2px 0 var(--shadow-color)` | `none` |
| 28 | `style.root.elevation@hover` | style | switchable | **off** | **off** | `0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)` |
| 29 | `style.root.background@secondary` | style | switchable | `background: var(--secondary-bg); color: var(--secondary-fg); border-color: var(--secondary-border)` | `background: var(--outline-bg); border: 1px solid var(--outline-border); color: inherit` | `background: transparent; border: 1px solid var(--outline-color); color: var(--action-bg)` |
| 30 | `style.root.background@secondary-hover` | style | switchable | ⟡ `secondary-bg-hover` | ⟡ `outline-hover-bg` | ƒ `color-mix(in srgb, var(--action-bg) 8%, transparent)` |
| 31 | `style.icon.size` | style | switchable | ⟡ `icon-size` | `16px` | `18px` |

<details><summary>Citations — 55 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `prop.tone` | salt | Button.css: .saltButton-{neutral,accented,negative,positive,caution} — 5 sentiment classes |
| `prop.tone` | shadcn | button.tsx variant enum: default, destructive |
| `prop.tone` | m3 | M3 color roles apply to any button; filled-button token file defaults to primary, filled-tonal-button uses secondary-container |
| `prop.emphasis` | salt | Button.css: .saltButton-{solid,bordered,transparent,loading} |
| `prop.emphasis` | shadcn | button.tsx variant enum |
| `prop.emphasis` | m3 | 5 distinct comp-token files: _md-comp-{filled,outlined,text,elevated,filled-tonal}-button.scss — these are 5 REAL components in M3, consolidated to one canonical 'button' per COMPONENTS.md, with emphasis as the axis |
| `prop.size` | salt | no size prop — height comes entirely from density (control-size), Salt has no per-instance size axis |
| `prop.size` | shadcn | button.tsx size enum (default/xs/sm/lg + icon/icon-xs/icon-sm/icon-lg for icon-only) |
| `prop.size` | m3 | no size prop in the tokens-only clone; M3 buttons are single-height by convention (container-height 40px), the 2025 Expressive update reportedly adds size variants — not present in this v0.192 snapshot, flagged not fabricated |
| `prop.icon-only` | salt | not a declared variant; icon-only buttons compose via aria-label + sr-only text (`.saltButton-sr-only` is a CLASS, not a token — Button.css:352, applied via withBaseName('sr-only') on a span with role=status at Button.tsx:197), not a size/shape switch. CORRECTED by the tier-1 citation lint: this note previously wrote that class with a custom-property prefix, asserting a design token that exists no |
| `prop.icon-only` | shadcn | button.tsx size: icon/icon-xs/icon-sm/icon-lg — square variants, size-9/6/8/10 |
| `prop.icon-only` | m3 | M3 models icon-only as a SEPARATE component (icon-button, filled-icon-button, outlined-icon-button) — not a button prop, a distinct canonical component per COMPONENTS.md |
| `behavior.loading` | salt | .saltButton-{tone}-loading: cursor progress, bg/fg collapse to the tone's base color, spinner overlay via .saltButton-spinner |
| `behavior.loading` | shadcn | no built-in loading variant; composed by consumer |
| `behavior.loading` | m3 | no loading state in the M3 button token files |
| `style.root.height` | salt | Button.css height: var(--saltButton-height, var(--salt-size-base)) |
| `style.root.height` | shadcn | button.tsx h-6/h-8/h-9/h-10 |
| `style.root.height` | m3 | container-height (hardcoded value in the token file, exclude-hardcoded-values flag off) |
| `style.root.padding` | salt | Button.css padding: 0 var(--saltButton-padding, calc(spacing-100 - borderWidth)) |
| `style.root.padding` | shadcn | size=default: px-4; has-[>svg]:px-3 when carrying an icon |
| `style.root.padding` | m3 | M3 filled-button spec padding convention (not an individual token in the extracted set — [R]-class, needs re-verification) |
| `style.root.gap` | salt | Button.css gap: var(--salt-spacing-50) |
| `style.root.gap` | shadcn | buttonVariants base: gap-2 |
| `style.root.gap` | m3 | M3 button icon-to-label gap convention ([R]-class) |
| `style.root.shape` | salt | Button.css border-radius: var(--saltButton-borderRadius, var(--salt-palette-corner-weak, 0)) — same rounded-edition pin as Calendar |
| `style.root.shape` | shadcn | rounded-md on every size variant |
| `style.root.shape` | m3 | container-shape -> corner-full |
| `style.root.border-width` | salt | Button.css --button-borderWidth: var(--salt-size-fixed-100) = 1px |
| `style.root.font` | salt | Button.css font-family action-fontFamily (Open Sans default edition), fontWeight action-fontWeight (semiBold=600), fontSize/lineHeight from --salt-text-* (same body ramp as Calendar's type-body, density-scoped) |
| `style.root.text-transform` | salt | characteristics/text.css text-action-textTransform: uppercase, -letterSpacing: 0.6px |
| `style.root.text-transform` | shadcn | no text-transform — shadcn buttons are sentence/label case as typed, unlike Salt's forced uppercase |
| `style.root.text-transform` | m3 | M3 buttons use sentence case as typed — no forced case transform |
| `style.root.background@hover` | shadcn | hover:bg-primary/90 |
| `style.root.background@hover` | m3 | hover-state-layer-color on-primary x hover-state-layer-opacity 0.08, composited over the container |
| `style.root.background@active` | shadcn | no distinct active-state background; hover/active share the same treatment (no :active rule in source) |
| `style.root.background@active` | m3 | pressed-state-layer-opacity 0.12 |
| `style.root.opacity@disabled` | salt | Button.css :disabled { opacity: 0.4 } |
| `style.root.opacity@disabled` | shadcn | disabled:opacity-50 — 50%, NOT Salt's 40%; a real cross-system value difference |
| `style.root.opacity@disabled` | m3 | disabled-container-opacity 0.12 (container), disabled-label-text-opacity 0.38 (text) — M3 uses two DIFFERENT opacities, not one shared value like Salt/shadcn |
| `style.root.focus` | salt | focused.css outlineStyle=dotted, outlineWidth=size-fixed-200=2px, same mechanism as Calendar's focus ring |
| `style.root.focus` | shadcn | focus-visible:ring-[3px] ring-ring/50 |
| `style.root.focus` | m3 | focus-state-layer-opacity 0.12 + md-focus-ring default 3px/2px offset |
| `style.root.elevation` | salt | Salt buttons carry no shadow — flat by design |
| `style.root.elevation` | shadcn | variant=outline only: shadow-xs; default/destructive/secondary/ghost/link carry no shadow |
| `style.root.elevation` | m3 | container-elevation: level0 (filled-button is flat; elevated-button is the separate variant that carries level1+ — a declared per-emphasis difference, level0 shown here as the filled default) |
| `style.root.elevation@hover` | m3 | hover-container-elevation: level1 (1dp). M3 tokenises elevation as a dp NUMBER only, so the CSS shadow is a registry derivation [R] — now cited from the canonical table in docs/foundations/elevation.md rather than derived locally. |
| `style.root.background@secondary` | salt | actionable-background/foreground/borderColor (bordered/neutral, no -bold suffix) |
| `style.root.background@secondary` | shadcn | variant=outline: bg-background border shadow-xs hover:bg-accent |
| `style.root.background@secondary` | m3 | _md-comp-outlined-button.scss: transparent container, outline-color border, primary label |
| `style.root.background@secondary-hover` | salt | Button.css .saltButton-neutral.saltButton-bordered: --button-background-hover: var(--salt-actionable-background-hover), consumed by the generic .saltButton:hover rule (background: var(--saltButton-background-hover, var(--button-background-hover))). Slot already existed in this column (secondary-bg-hover) but no row referenced it — exactly the defect this row fixes. |
| `style.root.background@secondary-hover` | shadcn | variant=outline: hover:bg-accent dark:hover:bg-input/50. Light value equals --accent (same token ghost-hover-bg already reads, oklch(0.97 0 0)). Dark value is expressed as color-mix(in oklab, var(--outline-border) 50%, transparent) rather than a hand-computed literal, because outline-border's dark slot already equals raw --input dark (oklch(1 0 0 / 15%)) and /50 is Tailwind v4's own color-mix opac |
| `style.root.background@secondary-hover` | m3 | _md-comp-outlined-button.scss: hover-state-layer-color=primary, hover-state-layer-opacity=0.08 (_md-sys-state.scss, v0.192). Same state-layer opacity token this column's own @hover row already cites; the container operand changes from var(--action-bg) (filled's opaque primary container) to transparent, because outlined's own container (style.root.background@secondary) is transparent. |
| `style.icon.size` | salt | Icon.css --icon-base-size: var(--salt-size-icon), density-scaled, matches Sizes foundations page |
| `style.icon.size` | shadcn | [&_svg:not([class*='size-'])]:size-4 = 1rem = 16px (default size); xs variant drops to size-3=12px |
| `style.icon.size` | m3 | with-icon-icon-size: 18px |

</details>

<!-- END GENERATED VALUES -->
