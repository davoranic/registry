# Alert / Banner — component template matrix

*Third live component in the post-clean-slate pipeline (button, then
spinner, then alert). Same method as
[CALENDAR-MATRIX.md](CALENDAR-MATRIX.md)/[SPINNER-MATRIX.md](SPINNER-MATRIX.md):
one master template (union of all six pieces across systems), columns per
design system, rows switched on/off/inherited per column.*

**Canonical name.** shadcn calls this component "alert"; Salt and M3 both
call the same component "banner" — confirmed by `docs/COMPONENTS.md`'s
Feedback & status table (`| alert | ✓ | ✓ banner | ✓ banner |`). This
document and the generated artifacts use "alert" as the canonical id.

**Cell legend** · `⟡ slot` = alias to shared contract slot · **bold** = the
system's own switch · `x-ds:` = system's native token, no shared slot yet ·
`OFF` = row switched off in this column · `INHERIT` = system silent,
registry default applies · `[S]` = value extracted from source this
session · `[R]` = no source file to grep (see note); needs verification
before treating as authoritative.

**Row policies** · 🔒 locked-on (no column may switch it off) ·
⚪ switchable (on where the system has it) · ⬜ on-with-default.

**Naming rule** — grammar `<piece>.<part>[.<subpart>].<property>[@state]`,
enforced by `contract/template.schema.json`'s `row.id` pattern.

Sources: salt-ds clone `packages/core/src/banner/{Banner.tsx,Banner.css,
BannerContent.tsx,BannerContent.css,BannerActions.tsx,BannerActions.css}`
[S] (composes `packages/core/src/status-indicator/{StatusIndicator.tsx,
StatusIndicator.css,ValidationStatus.ts}` [S]), `stories/banner/
banner.stories.tsx` [S], `site/docs/components/banner/*.mdx` [S];
`ui/apps/v4/registry/new-york-v4/ui/alert.tsx` [S], plus
`registry/new-york-v4/examples/alert-{demo,destructive}.tsx` [S] and, as
supplementary cross-checked evidence only (not the canonical source),
`registry/bases/radix/ui/alert.tsx` [S] (ships a dedicated `AlertAction`
part the canonical new-york-v4 base doesn't have); material-web
`tokens/versions/latest/sass/_md-comp-banner{,s,s-basic,s-rich}.scss` [S]
(tokens-only clone — no live M3 component, see Edition pin below) plus
`_md-sys-color.scss`/`_md-sys-color__dark.scss`/`_md-ref-palette.scss`/
`_md-sys-typescale{,-emphasized}.scss` [S] for color/type resolution.
`docs/foundations/{colors,spacing,sizes,shape,border-style,typography}.md`
[S] reused/cross-checked for shared foundation values rather than
re-deriving them.

**Edition pin.** Same class of deliberate deviation as Spinner's pin. The
`v0_192` checkout has only the OLDER singular `_md-comp-banner.scss`,
whose own action tokens are internally marked `@deprecated` ("Use
standalone components tokens instead of embedded divider and button
components"). The `latest` checkout adds a newer PLURAL "banners" token
family: `_md-comp-banners.scss` (color roles: standard/vibrant, shared by
both layouts below), `_md-comp-banners-basic.scss` (a compact single/
two-line banner: fixed height, dedicated close-button spacing, round-or-
square shape choice, no title concept), `_md-comp-banners-rich.scss` (a
banner with a leading icon-or-image, a distinct title-text token family,
body text, and actions; shape is always the rounded "extra-large" corner,
no square option). **This matrix pins M3 to the LATEST "banners-rich"
schema** (plus the shared "banners" color-role file), not v0.192 and not
"basic" — rich is the only M3 schema with a title-text token, the closest
structural match to shadcn's `AlertTitle`/Salt's bolded-first-line content
convention. "basic" is a real, sourced, alternate M3 layout (fixed
56/64px height, dedicated close-button spacing, optional square corners)
declared explicitly out of scope rather than silently ignored — see the
Findings section.

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| root | 🔒 | on | on | on |
| icon (leading status/glyph) | 🔒 | on — always renders `StatusIndicator` [S] | on — arbitrary `<svg>` child, optional per-instance but structurally supported (`has-[>svg]:` selector) [S] | on — rich schema's leading element [S] |
| image (leading image, alt. to icon) | ⚪ | OFF — no image-leading-element concept [S] | OFF [S] | **on** — `image.size` 80px, `image.shape` corner-none [S] |
| content column (title + description wrapper) | 🔒 | on — `BannerContent` [S] | on — implicit (title/description share a CSS grid column) [S] | on — implicit (rich schema lays out title above body) [S] |
| title (dedicated headline part) | ⚪ | **OFF** — no dedicated subcomponent; a bold first line is a content-formatting convention only (`<Text><strong>` inside `BannerContent`, see `banner.stories.tsx` "Issue"/"MultipleLines") [S] | **on** — `AlertTitle` (`col-start-2`, `font-medium`, `line-clamp-1`) [S] | **on** — rich schema's `title-text-*` token family, emphasized typescale [S] |
| description / body | 🔒 | on — `BannerContent`, required children [S] | on — `AlertDescription`, optional per-instance [S] | on — rich schema's `body-text-*` [S] |
| actions (button group) | ⚪ | **on** — `BannerActions`, optional wrapper [S] | **on** — no dedicated wrapper in new-york-v4 canonical (arbitrary children); supplementary evidence: sibling `bases/radix` variant ships a dedicated `AlertAction` part [S] | **on** — `actions.*` spacing tokens, both basic and rich [S] |
| close (dedicated dismiss part) | ⚪ | OFF — dismiss is an ordinary composed `<Button aria-label="close">` INSIDE `BannerActions`, not a distinct part (`banner.stories.tsx` "Dismissible") [S] | OFF — same composition convention, no distinct part in any base checked [S] | **on** — `close-button-color`/`-focused`/`-hovered`/`-pressed` + `actions-close-button-space`, a genuinely first-class dedicated part [S] |

## 2 · Behavior — one column, mostly locked (no source implements interaction on the root itself)

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| non-interactive root (no tabindex, no keyboard pattern of its own) | 🔒 | identical [S] | identical [S] | identical [R] |
| ARIA role | ⚪ | **OFF — no default at all.** `Banner.tsx` sets no `role`; `accessibility.mdx` instructs the consumer to apply `role="alert"` or `role="status"` themselves per use case, with a documented screen-reader caveat about `role="status"` on dynamically-inserted content [S] | **on, hardcoded** — `role="alert"` always, not a prop [S] | on — treated as `role="status"` per the general APG live-region/banner convention [R], no clone source |
| dismiss / open-close state machine | 🔒 (info) | **none exists** — the "Dismissible" story manages `open` with an external `useState`, entirely consumer-owned [S] | none exists, same consumer-owned pattern expected [S] | none exists in the token set [R] |
| keyboard (Tab through focusable children only) | 🔒 | identical, `accessibility.mdx` keyboard-interactions section [S] | identical [S] | identical [R] |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| `tone` / `status` / `variant` (semantic color axis) | ⚪ | **4-value enum**: info/error/warning/success (`ValidationStatus`), default `"info"` [S] | **2-value enum**: default/destructive — the same tone-coverage gap already found in Button [S] | **OFF — no status axis at all**, confirmed by direct grep of every banner-family token file [S]. The marquee finding of this matrix (see Findings). |
| `emphasis` / `variant` (decorative-intensity axis) | ⚪ | **on** — `variant`: primary (default, neutral) / secondary (tone-tinted bg) [S] | **OFF** — no separate emphasis axis; background never varies with `variant` at all (see §6) [S] | **on** — standard (surface-container) / vibrant (primary-container) — notably NOT status-driven, since M3 has no status axis to begin with [S] |
| `role` (see Behavior) | ⚪ | off (no default) [S] | on, hardcoded [S] | on [R] |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| icon | 🔒 | consumer-owned glyph; Salt fixes it to the status via `StatusIndicator`, shadcn/M3 leave the specific icon fully up to the consumer |
| title | ⚪ | consumer-owned headline text, where the system has a title part (shadcn, M3 — see §1) |
| description | 🔒 | consumer-owned body content; accepted by all three |
| actions | ⚪ | consumer-owned action buttons, where the system has an actions part (all three) |
| close | ⚪ | consumer-owned close affordance, first-class only in M3; composed as a generic action in Salt/shadcn |

## 5 · States

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| rest (the only state of the root itself) | 🔒 | on | on | on |
| hover / focus / active / disabled (of the root) | 🔒 (info) | **none exist** — confirmed no such rule in `Banner.css`; interactive states belong entirely to composed action/close buttons, owned by the future `button` component's own matrix | — | — |

## 6 · Styles — the cell matrix (per part × attribute)

All cells below are shown at each system's DEFAULT emphasis/tone (Salt:
tone=info, emphasis=primary; shadcn: variant=default; M3: emphasis=
standard) — the same "one representative value, declared deferral" pattern
Spinner used for its size prop and Button used for its tone/emphasis grid.
One extra row (`background@emphasis`) demonstrates the non-default
emphasis axis, mirroring `button.template.json`'s `style.root.background@secondary`
row exactly (a generalized selector unioning each system's own attribute
vocabulary, never a single hardcoded system's values).

### root

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background (default emphasis) | 🔒 | ⟡ `container-bg` → `container-primary-background` → snow #FFFFFF / jet #101820 — **does not vary by status** at this emphasis level [S] | ⟡ `card-bg` → `bg-card` → #FFFFFF / oklch(0.205 0 0) — **identical for variant=destructive too**, a real non-variation [S] | ⟡ `standard-bg` → `surface-container` → #F3EDF7 / #211F26 [S] |
| background (non-default emphasis) | ⚪ | **on** — `bg-info-secondary` → `status-info-background` → blue-100 #EAF6FF / blue-900 #001736 (tone-tinted, only at emphasis=secondary) [S] | **OFF** — no separate emphasis axis to demonstrate [S] | **on** — `vibrant-bg` → `primary-container` → #EADDFF / #4F378B [S] |
| border-color | ⚪ | **on, status-driven** — same `palette-{status}` value the icon uses → #0078CF (info, mode-invariant) [S] | **on, fixed** — `border` token, never varies by tone — a real non-variation vs Salt [S] | **OFF — no border/outline token anywhere** in the banner token family; M3's banners are color-fill only [S] |
| border-width | ⚪ | 1px, `size-fixed-100`, density-invariant [S] | 1px, Tailwind's undeclared default [S] | **explicitly 0** (not left absent — see Findings on why) [S] |
| shape / corner-radius | ⬜ | `palette-corner` (rounded-edition pin) = curve-150, **3/6/9/12px by density** [S] | `--radius-lg` = 10px [S] | `corner-extra-large` = 28px (rich schema; "basic" also offers a square/corner-none option, out of scope) [S] |
| padding | ⬜ | `spacing-50`(block) `spacing-100`(inline), **2/4·4/8·6/12·8/16px by density** [S] | 12px 16px (`py-3 px-4`), fixed [S] | 12px uniform (rich container spacing; the with-image 20px leading override is out of scope) [S] |
| gap (icon ↔ content) | ⬜ | `spacing-75`, **3/6/9/12px by density** [S] | 12px (`has-[>svg]:gap-x-3`), rendered here as a flex gap — shadcn's real layout is a CSS grid, a declared structural approximation [S] | 4px (`icon-text-space`) [S] |
| min-height | ⚪ | `calc(size-base + spacing-100)`, **24/36/48/60px by density** [S] | **OFF** — content-driven, no token exists [S] | **OFF under the rich-schema pin** — rich has no container min-height token; "basic" has one (56px/64px two-line) but is out of scope [S] |
| font (body) | ⬜ | `--salt-text-*` body role, Open Sans, weight-regular(400), **12/16px @ medium, density-scaled** [S] | `text-sm` = 0.875rem/1.25rem, no shadcn type-scale foundation exists — read off the component's own Tailwind classes [S] | `body-medium` = 0.875rem/1.25rem, weight-regular(400), Roboto (self-hosted, same precedent as Calendar/Button — this tokens-only clone never spells out the literal family string, only the `plain` role) [S] |
| color (body/root text) | 🔒 | `content-primary-foreground` — **neutral, does not vary by status** [S] | `text-card-foreground` at variant=default; **`text-destructive` at variant=destructive** — shadcn is the only system where the tone axis moves the *text* colour rather than a border or a fill [S] | `on-surface` (standard variant) [S] |

### the tone axis, as generated rows

Every non-default tone is a real row, not a description. Each reassigns one
indirection custom property that the base rows above consume — **mirroring
Salt's own mechanism**, which declares `border-color: var(--banner-borderColor)`
once and then reassigns that single property per status
(`.saltBanner-error { --banner-borderColor: var(--salt-status-error-borderColor) }`),
including the emphasis interaction (`.saltBanner-secondary.saltBanner-error`).

| row | Salt | shadcn | Material 3 |
|---|---|---|---|
| `style.root.tone@error` | **on** — reassigns border+icon to `tone-error` #E52135, and the secondary-emphasis background to `bg-error-secondary` #FFECEA [S] | OFF — not a shadcn variant name [S] | OFF [S] |
| `style.root.tone@warning` | **on** — `tone-warning` #C75300 / `bg-warning-secondary` #FFECD9 [S] | OFF — **no warning tone exists at all**, the same coverage gap recorded for Button [S] | OFF [S] |
| `style.root.tone@success` | **on** — `tone-success` #00875D / `bg-success-secondary` #EAF5F2 [S] | OFF — no success tone exists at all [S] | OFF [S] |
| `style.root.tone@destructive` | OFF — not a Salt tone name [S] | **on** — reassigns root/title/icon text to `destructive`, and the description to `destructive` at 90% alpha; background deliberately untouched [S] | OFF [S] |

### icon / image

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| color (default tone) | 🔒 | ⟡ `tone-info` → `status-info-foreground-decorative` → palette-info → **#0078CF, distinct from and independent of the body text color** [S] | ⟡ `card-fg` → `[&>svg]:text-current` → **inherits the root's own color, same value as `style.root.color`, no separate token** [S] | ⟡ `standard-fg` → `standard-icon-color` → `on-surface` → **the SAME role as the title/body text, no separate token** [S] |

### title

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| font | ⚪ | **OFF** — no distinct title part to style [S] | `font-medium`(500), inherits the root's 0.875rem/1.25rem size (no independent font-size) [S] | **emphasized** `body-medium` typescale — weight-medium(500), **same 0.875rem/1.25rem size/line-height as the regular body** — the emphasis is a real, CSS-expressible weight bump, not merely a variable-font-axis effect [S] |

### description

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| color | ⚪ | **OFF** — `BannerContent.css` sets no color; inherits `content-primary-foreground`, same value as `style.root.color`, no separate token [S] | **on** — `text-muted-foreground`, the ONLY system with a distinct description color, separate from the title/root color [S] | **OFF** — `body-text-color` resolves to the SAME `on-surface` role as `title-text-color` (standard variant), no separate token [S] |

---

## Findings from building this matrix

1. **M3's banner has no status/tone axis at all — the marquee finding.**
   Direct grep of all four banner-family token files
   (`_md-comp-banner{,s,s-basic,s-rich}.scss`) turns up exactly one color
   axis: standard vs vibrant, a pure decorative-intensity choice. There is
   no info/error/warning/success mapping anywhere in the banner-specific
   tokens. M3 does have a general `error`/`error-container` sys-color role
   elsewhere in the design system (already resolved for other future
   components), but applying it here would mean inventing a mapping the
   banner component itself never makes — so `prop.tone` is recorded as a
   genuine, structural absence for M3, not a research gap to close later.
   This is the spinner-role finding's mirror image: instead of three
   systems answering the same question three different ways, one system
   doesn't have the question at all.
2. **Salt is the only system with NO default ARIA role**, and the absence
   is *itself* documented — `accessibility.mdx` explicitly instructs the
   consumer to choose `role="alert"` (interrupt) or `role="status"`
   (notify) per use case, with a real caveat about `role="status"`'s
   known screen-reader announcement issues on dynamic content. shadcn
   hardcodes `role="alert"` unconditionally; M3's role is unverifiable in
   this tokens-only clone ([R]). Three systems, three different postures
   toward the same question: a required per-instance decision, a fixed
   default, and an undocumented unknown.
3. **Icon color independence is a genuine three-way split.** Salt's status
   icon is colored by a token that is completely separate from — and can
   diverge from — the body text color (the body stays neutral
   `content-primary-foreground` regardless of status; only the icon and
   border react to status). shadcn and M3 both tie icon color to the SAME
   role as the body/root text (`currentColor` inheritance and
   `on-surface` respectively) — no dedicated icon-color token exists in
   either. Salt is the outlier, not the norm, on this specific axis.
4. **Three different answers to "how do I dismiss this," none of them a
   built-in behavior.** M3 is the only system that tokenizes a close
   button as a first-class dedicated part (`close-button-color` family +
   dedicated spacing). Salt and shadcn both achieve the identical visual
   and functional result by composing an ordinary close-labeled button
   inside the generic actions area — a structural difference in
   vocabulary, not in capability. None of the three systems implements
   dismiss/open-close STATE internally; Salt's own "Dismissible" story
   demonstrates the consumer-owned `useState` pattern any build needs
   regardless of which system it's themed as.
5. **shadcn's background never varies by tone — a real, sourced
   non-variation, not an oversight.** Reading `alertVariants` directly:
   `variant=destructive` changes `text-destructive` (root/title) and the
   description's color, and nothing else — background stays `bg-card`,
   border stays the fixed neutral `border` token. This is the opposite of
   Salt, where border color (always) and background (at emphasis=
   secondary) both react to status. A single hardcoded "tone changes the
   background" assumption would have been wrong for shadcn specifically.
6. **The description-color divergence mirrors the icon-color one, with
   the labels swapped.** shadcn is the ONLY system with a distinct (muted)
   description color, separate from its title/root color. Salt and M3
   both use ONE uniform text color across title and body (Salt: no
   separate token, both inherit `content-primary-foreground`; M3: title
   and body both resolve to `on-surface` in the standard variant). Two
   findings (icon color, description color) from the same matrix, same
   shape, different owner each time.
7. **A real supplementary-source situation, handled explicitly.** shadcn's
   canonical new-york-v4 alert has no dedicated actions/close wrapper —
   but a sibling base variant in the SAME shadcn monorepo
   (`registry/bases/radix/ui/alert.tsx`) ships one (`AlertAction`,
   `data-slot="alert-action"`), used in a real example file. This is
   cited as supplementary, cross-checked evidence that the pattern is a
   genuine shadcn-family convention — not invented by this registry — while
   being clear that the PRIMARY/canonical source (new-york-v4) does not
   itself ship the part. `structure.actions` is recorded as "on" for
   shadcn on that basis, with the split noted rather than silently
   resolved either way.
8. **M3's "basic" vs "rich" banner schemas are a real internal fork, not
   noise.** "basic" is a compact, fixed-height, title-less banner with a
   dedicated close-button-space token and a round/square shape choice.
   "rich" has a title, a leading icon-OR-image choice, and only the
   rounded shape. This matrix pins to "rich" because it is the only
   schema with a title token — the closest match to the shadcn/Salt union
   — and records "basic" as a real, sourced, declared-out-of-scope
   alternative (its 56/64px height tokens are noted at the
   `style.root.min-height` row rather than silently dropped), the same
   discipline Spinner's edition pin used for the deprecated v0.192
   circular-progress file.
9. **Border-width required an explicit override, not just an "off."** M3's
   root style.root.border-width cell is set to the literal `0`, not left
   absent — because this template's theme-invariant `base` block sets
   `border-style: solid` for cross-system layout convenience (matching
   Button's own base pattern), an absent border-width would let the
   browser's initial `medium` (~3px) width render an unwanted visible
   border for M3. Declaring `0` explicitly is the honest way to express
   "no border" without that silent side effect — a small but real
   instance of CLAUDE.md's "silence is the enemy" rule applying to a
   *default value*, not just a missing cell.
10. **The tone axis was declared before it was expressible — caught in the
    render check, not by the generator.** The first generated pass had a
    `prop.tone` config row (four Salt values, two shadcn ones, so the
    validation harness drew four tone buttons) but **no CSS row that varied
    by tone**: every style cell aliased the default tone's slot directly
    (`tone-info`, `card-fg`). The generator printed `OK` for all three
    columns, because its completeness checks cover missing locked rows,
    literal colours, and unresolvable `var()` references — but *not* "a
    declared prop axis that produces no per-value CSS." Six of Salt's eight
    tone slots and shadcn's `destructive` slot were extracted correctly and
    then never referenced: dead values, and three of four Salt tones
    rendering identically to info. That is precisely the silent fallback
    CLAUDE.md rule 3 forbids, and it was invisible until the render was
    clicked through. Two consequences worth carrying forward: **(a)** the
    four `style.root.tone@*` rows above now exist, and **(b)** this is a
    real gap in the generator's own gates — a future check should fail any
    `channel: "config"` row whose parameter values are not discriminated by
    at least one CSS row or skeleton branch. Logged here as a declared
    tooling gap rather than fixed silently, since changing the generator's
    gate set is a contract-level decision for the owner.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/alert.template.json` against every system, read from `columns/alert.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 12 light, 6 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `container-bg` | rgb(255, 255, 255) | rgb(16, 24, 32) | yes |
| `content-fg` | rgb(0, 0, 0) | rgb(255, 255, 255) | yes |
| `tone-info` | rgb(0, 120, 207) | — | **no** |
| `tone-error` | rgb(229, 33, 53) | — | **no** |
| `tone-warning` | rgb(199, 83, 0) | — | **no** |
| `tone-success` | rgb(0, 135, 93) | — | **no** |
| `bg-info-secondary` | rgb(234, 246, 255) | rgb(0, 23, 54) | **no** |
| `bg-error-secondary` | rgb(255, 236, 234) | rgb(69, 0, 2) | **no** |
| `bg-warning-secondary` | rgb(255, 236, 217) | rgb(66, 32, 0) | **no** |
| `bg-success-secondary` | rgb(234, 245, 242) | rgb(0, 41, 21) | **no** |
| `tone-active` | var(--tone-info) | — | **no** |
| `bg-secondary-active` | var(--bg-info-secondary) | — | **no** |

**shadcn** — 7 light, 5 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `card-bg` | oklch(1 0 0) | oklch(0.205 0 0) | **no** |
| `card-fg` | oklch(0% 0 0) | oklch(0.985 0 0) | **no** |
| `muted-fg` | oklch(0.556 0 0) | oklch(0.708 0 0) | yes |
| `destructive` | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | yes |
| `border` | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | yes |
| `content-active` | var(--card-fg) | — | **no** |
| `description-active` | var(--muted-fg) | — | **no** |

**m3** — 3 light, 2 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `banner-bg` | #f7f2fa | #1d1b20 | yes |
| `banner-fg` | #49454f | #cac4d0 | yes |
| `type-body` | 400 0.875rem/1.25rem 'Roboto', sans-serif | — | yes |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.image` | structure | switchable | **off** | **off** | `True` |
| 2 | `structure.title` | structure | switchable | **off** | `True` | **off** |
| 3 | `structure.actions` | structure | switchable | `True` | `True` | **off** |
| 4 | `structure.close` | structure | switchable | **off** | **off** | **off** |
| 5 | `slot.composes` | slot | default | — | — | — |
| 6 | `behavior.non-interactive-root` | behavior | locked | — | — | — |
| 7 | `behavior.role` | behavior | switchable | **off** | `alert` | `status` |
| 8 | `behavior.dismiss` | behavior | locked | — | — | — |
| 9 | `prop.tone` | prop | default | `info, error, warning, success` | `default, destructive` | **off** |
| 10 | `prop.emphasis` | prop | default | `primary, secondary` | **off** | **off** |
| 11 | `slot.icon` | slot | default | — | — | — |
| 12 | `slot.title` | slot | switchable | — | — | **off** |
| 13 | `slot.description` | slot | locked | — | — | — |
| 14 | `slot.actions` | slot | switchable | — | — | **off** |
| 15 | `slot.close` | slot | switchable | — | — | **off** |
| 16 | `state.rest-only` | state | locked | — | — | — |
| 17 | `style.root.background` | style | locked | ⟡ `container-bg` | ⟡ `card-bg` | ⟡ `banner-bg` |
| 18 | `style.root.background@emphasis` | style | switchable | ⟡ `bg-secondary-active` | **off** | **off** |
| 19 | `style.root.border-color` | style | switchable | ⟡ `tone-active` | ⟡ `border` | **off** |
| 20 | `style.root.border-width` | style | switchable | `1px` | `1px` | `0` |
| 21 | `style.icon.color` | style | locked | ⟡ `tone-active` | ⟡ `content-active` | ⟡ `banner-fg` |
| 22 | `style.root.padding` | style | default | ⟡ `banner-padding` | `12px 16px` | **off** |
| 23 | `style.root.gap` | style | default | ⟡ `banner-gap` | `12px` | **off** |
| 24 | `style.root.shape` | style | default | ⟡ `banner-radius` | `10px` | `0px` |
| 25 | `style.root.min-height` | style | switchable | ⟡ `banner-min-height` | **off** | `52px` |
| 26 | `style.root.font` | style | default | ⟡ `type-body` | `400 0.875rem/1.25rem ui-sans-serif, system-ui, sans-serif` | ⟡ `type-body` |
| 27 | `style.root.color` | style | locked | ⟡ `content-fg` | ⟡ `content-active` | ⟡ `banner-fg` |
| 28 | `style.title.font` | style | switchable | **off** | `500 0.875rem/1.25rem ui-sans-serif, system-ui, sans-serif` | **off** |
| 29 | `style.description.color` | style | switchable | **off** | ⟡ `description-active` | **off** |
| 30 | `style.root.tone@error` | style | switchable | `--tone-active: var(--tone-error); --bg-secondary-active: var(--bg-error-secondary)` | **off** | **off** |
| 31 | `style.root.tone@warning` | style | switchable | `--tone-active: var(--tone-warning); --bg-secondary-active: var(--bg-warning-secondary)` | **off** | **off** |
| 32 | `style.root.tone@success` | style | switchable | `--tone-active: var(--tone-success); --bg-secondary-active: var(--bg-success-secondary)` | **off** | **off** |
| 33 | `style.root.tone@destructive` | style | switchable | **off** | `--content-active: var(--destructive); --description-active: color-mix(in oklab, var(--destructive) 90%, transparent)` | **off** |

<details><summary>Citations — 69 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.image` | salt | no leading-image concept — StatusIndicator is icon-only |
| `structure.image` | shadcn | no image-leading-element concept |
| `structure.image` | m3 | versions/v0_192/_md-comp-banner.scss 'with-image-image-size' 40px and 'with-image-image-shape' -> md-sys-shape.corner-full — a leading image is the one optional part this edition's banner does describe. VALUES CHANGED BY THE PIN, though alert.template.json has no row that renders them: latest's _md-comp-banners-rich.scss said image.size 80px, image.shape corner-none and image-text-space 8px, i.e.  |
| `structure.title` | salt | no dedicated title subcomponent in Banner/BannerContent — bold-first-line is a content-formatting convention only, see banner.stories.tsx 'Issue'/'MultipleLines' |
| `structure.title` | shadcn | alert.tsx AlertTitle: col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight |
| `structure.title` | m3 | DECLARED GAP. In `latest` this row was ON, sourced from _md-comp-banners-rich.scss's title-text-height / -top-space / -bottom-space and its title-text-type mixin — a dedicated, separately-typeset title run. versions/v0_192/_md-comp-banner.scss contains the string 'title' ZERO times. Its only text run is 'supporting-text-*'. WHAT THE CONSUMER LOSES: the bolded first line. An M3 alert under this pin |
| `structure.actions` | salt | BannerActions.tsx/.css — optional wrapper, min-height size-base, gap spacing-100 |
| `structure.actions` | shadcn | registry/bases/radix/ui/alert.tsx AlertAction |
| `structure.actions` | m3 | DECLARED GAP. In `latest` this row was ON, sourced from _md-comp-banners-rich.scss's actions.between/leading/trailing/top/bottom-space family. versions/v0_192/_md-comp-banner.scss contains the string 'action' ZERO times — confirmed by grep, not inferred. WHAT THE CONSUMER LOSES: the trailing button row. Worth recording precisely because it is NOT purely an edition artefact: `latest`'s OWN singular |
| `structure.close` | salt | no dedicated close part — a close-labeled Button composed inside the generic BannerActions, see banner.stories.tsx 'Dismissible' |
| `structure.close` | shadcn | no dedicated close part in any shadcn base variant checked (new-york-v4 or radix) — dismiss would be an ordinary composed button with no distinct data-slot hook |
| `structure.close` | m3 | DECLARED GAP. In `latest` this row was ON, sourced from _md-comp-banners.scss's close-button-color / -focused / -hovered / -pressed family plus _md-comp-banners-basic.scss's actions-close-button-space — a first-class dedicated part, and one of this column's marquee findings against Salt and shadcn. versions/v0_192/_md-comp-banner.scss contains the string 'close' ZERO times. WHAT THE CONSUMER LOSES |
| `behavior.role` | salt | Banner.tsx sets no role attribute; site/docs/components/banner/accessibility.mdx instructs the consumer to apply role="alert" or role="status" themselves depending on use case — a real, sourced absence of a default, not a research gap |
| `behavior.role` | shadcn | alert.tsx: role="alert" hardcoded, always, not a prop |
| `behavior.role` | m3 | [R] — no live M3 component in this tokens-only clone, in either edition; treated as role="status" per the general APG live-region/banner convention, not grepped from code. Unaffected by the pin. |
| `prop.tone` | salt | Banner.tsx status?: ValidationStatus, default "info" -> status-indicator/ValidationStatus.ts ValidationStatusValues |
| `prop.tone` | shadcn | alert.tsx alertVariants variants.variant enum |
| `prop.tone` | m3 | CONFIRMED ABSENCE, and the pin makes it easier to confirm, not harder. Under `latest` this took a four-file grep (_md-comp-banner.scss, _md-comp-banners.scss, _md-comp-banners-basic.scss, _md-comp-banners-rich.scss) to establish that none defines a semantic status/tone axis. Under the v0.192 pin there is ONE file and it has no colour axis at all — not even the standard/vibrant emphasis axis that u |
| `prop.emphasis` | salt | Banner.tsx variant?: "primary" \| "secondary", default "primary" |
| `prop.emphasis` | shadcn | no separate emphasis/intensity axis — variant (default/destructive) is entirely the tone axis; background never changes with it (see style.root.background) |
| `prop.emphasis` | m3 | DECLARED GAP. In `latest` this row was ON with ["standard","vibrant"], sourced from _md-comp-banners.scss's standard-color / vibrant-color pair — M3's only banner colour axis. versions/v0_192/_md-comp-banner.scss has ONE container-color and no axis of any kind. WHAT THE CONSUMER LOSES: the high-emphasis primary-container-tinted banner. M3 now offers a single appearance, which also empties style.ro |
| `slot.title` | m3 | DECLARED GAP, following structure.title. versions/v0_192/_md-comp-banner.scss has no title token, so there is no title part for a consumer to fill. Was implicitly on under the rich schema. |
| `slot.actions` | m3 | DECLARED GAP, following structure.actions. versions/v0_192/_md-comp-banner.scss has no actions family, so there is no actions region for a consumer to fill. |
| `slot.close` | m3 | DECLARED GAP, following structure.close. versions/v0_192/_md-comp-banner.scss has no close-button family, so there is no close slot for a consumer to fill. |
| `style.root.background` | salt | variant=primary (default) — always the neutral container background regardless of status |
| `style.root.background` | shadcn | variant=default; IDENTICAL for variant=destructive — background does not vary by tone in shadcn, unlike Salt |
| `style.root.background` | m3 | LOCKED row, and it survives the pin with a changed value rather than becoming a gap: v0.192's banner does have a container-color, just a different role. surface-container-low #f7f2fa / #1d1b20, where latest's standard-color -> surface-container gave #f3edf7 / #211f26. See provenance.banner-bg. |
| `style.root.background@emphasis` | salt | variant=secondary. Resolves through the tone indirection (defaults to bg-info-secondary, reassigned by the style.root.tone@* rows) — Banner.css .saltBanner-secondary.saltBanner-{status} |
| `style.root.background@emphasis` | shadcn | no separate emphasis axis to demonstrate — see prop.emphasis |
| `style.root.background@emphasis` | m3 | DECLARED GAP. Was an alias to the removed `vibrant-bg` slot (#eaddff / #4f378b), sourced from _md-comp-banners.scss 'vibrant-color' -> md-sys-color.primary-container. That file does not exist in versions/v0_192 and no replacement token carries a second container colour. WHAT THE CONSUMER LOSES: the vibrant/high-emphasis banner appearance — see prop.emphasis for the axis-level loss. |
| `style.root.border-color` | salt | border color IS status-driven in Salt (unlike shadcn). Consumes the tone indirection slot, matching Banner.css's own `border-color: var(--banner-borderColor)` + per-status reassignment |
| `style.root.border-color` | shadcn | fixed regardless of variant — no per-tone border-color override anywhere in alertVariants, a real non-variation vs Salt |
| `style.root.border-color` | m3 | no border/outline token exists anywhere in the banner token family, in EITHER edition — M3's banners are colour-fill only. Unchanged by the pin; re-verified against versions/v0_192/_md-comp-banner.scss, whose twenty-two keys include no outline entry. |
| `style.root.border-width` | salt | Banner.css border-width: var(--saltBanner-borderWidth, var(--salt-size-fixed-100)) = 1px, density-invariant |
| `style.root.border-width` | shadcn | alertVariants base class: "border" -> Tailwind default border-width (undeclared token, per foundations/border-style.md) |
| `style.root.border-width` | m3 | explicitly zeroed, not left off, so the base chassis's cross-system border-style:solid rule cannot produce an unwanted default browser border. Unchanged by the pin. |
| `style.icon.color` | salt | StatusIndicator resolves to the SAME palette-{status} value as the border — Salt is the only system where this is a distinct token from the body text color. Same tone indirection as the border |
| `style.icon.color` | shadcn | [&>svg]:text-current — no separate icon color token, inherits the root's own color (same value as style.root.color), so it follows the same tone indirection |
| `style.icon.color` | m3 | DECLARED SOURCE GAP UNDER A LOCKED ROW — read this before trusting the cell. In `latest` this was [S], sourced from _md-comp-banners.scss 'standard-icon-color' -> md-sys-color.on-surface, a dedicated icon colour token. versions/v0_192/_md-comp-banner.scss HAS NO ICON TOKEN AT ALL — the string 'icon' appears zero times. This row is LOCKED in alert.template.json, so it cannot be switched off without |
| `style.root.padding` | shadcn | px-4 py-3 |
| `style.root.padding` | m3 | DECLARED GAP. Was 12px, sourced from _md-comp-banners-rich.scss's top/bottom/leading/trailing-space, which are uniform at 12px. versions/v0_192/_md-comp-banner.scss HAS NO SPACING TOKEN OF ANY KIND — no space, padding, margin, inset or gap entry among its twenty-two keys. WHAT THE CONSUMER LOSES: all interior breathing room. The M3 alert renders flush to its container edges. This is deliberately l |
| `style.root.gap` | shadcn | has-[>svg]:gap-x-3 |
| `style.root.gap` | m3 | DECLARED GAP. Was 4px, sourced from _md-comp-banners-rich.scss 'icon-text-space'. versions/v0_192/_md-comp-banner.scss has no gap or space token — see style.root.padding for the full absence. WHAT THE CONSUMER LOSES: the separation between the leading icon and the text; the two now sit flush against each other. |
| `style.root.shape` | shadcn | rounded-lg -> --radius-lg = var(--radius) = 0.625rem |
| `style.root.shape` | m3 | versions/v0_192/_md-comp-banner.scss 'container-shape' -> md-sys-shape.corner-none -> versions/v0_192/_md-sys-shape.scss 'corner-none' = 0px. VALUE CHANGED BY THE PIN, and it is the most visible single change in this column: latest's _md-comp-banners-rich.scss said shape -> corner-extra-large = 28px. M3's banner was a heavily rounded card in the rich schema and is a square-cornered full-bleed stri |
| `style.root.min-height` | shadcn | content-driven, no min-height token anywhere in alert.tsx — a real gap, not fabricated |
| `style.root.min-height` | m3 | versions/v0_192/_md-comp-banner.scss 'desktop-with-single-line-container-height': 52px. ROW GAINED BY THE PIN — the one thing this column wins. It was previously OFF, on the sourced grounds that latest's rich schema has no single container height (only the out-of-scope `basic` schema had one, at 56px). v0.192's singular banner carries SIX height tokens; 52px is the desktop single-line baseline, ch |
| `style.root.font` | shadcn | text-sm on the root; family follows --font-sans's Next.js next/font resolution (foundations/typography.md flag — literal family string lives in font-loader config, not CSS) |
| `style.root.font` | m3 | unchanged in value by the pin — v0.192's 'supporting-text-*' and latest's rich-schema body-text-type both resolve to md-sys-typescale.body-medium. See provenance.type-body. |
| `style.root.color` | shadcn | defaults to card-fg; variant=destructive reassigns the indirection to --destructive (see style.root.tone@destructive) |
| `style.root.color` | m3 | LOCKED row, and it survives the pin with a changed value rather than becoming a gap. 'supporting-text-color' -> on-surface-variant #49454f / #cac4d0, where latest's standard-body-text-color -> on-surface gave #1d1b20 / #e6e0e9. See provenance.banner-fg. |
| `style.title.font` | salt | no distinct title part to style (see structure.title) |
| `style.title.font` | shadcn | AlertTitle: font-medium (500), no independent font-size (inherits the root's text-sm) |
| `style.title.font` | m3 | DECLARED GAP. Was an alias to the removed `type-title` slot (500 0.875rem/1.25rem Roboto), sourced from _md-comp-banners-rich.scss's title-text-type -> md-sys-typescale-emphasized.body-medium — same size and line-height as the body, one weight step heavier. Neither _md-comp-banners-rich.scss nor _md-sys-typescale-emphasized.scss exists in versions/v0_192; the emphasized typescale is a `latest`-onl |
| `style.description.color` | salt | BannerContent.css sets no color of its own — inherits content-primary-foreground from the root, i.e. the same value as style.root.color, not a separate token |
| `style.description.color` | shadcn | AlertDescription: text-muted-foreground — the only system with a distinct description color, separate from the title/root color. Defaults to muted-fg; variant=destructive reassigns it to destructive/90 |
| `style.description.color` | m3 | still off, and for a stronger reason than before. Under `latest` the argument was a convergence: body-text-color and title-text-color both resolved to on-surface, so no separate description colour existed. Under v0.192 there is only ONE text colour token in the entire file ('supporting-text-color'), which style.root.color already carries — so a separate description colour is not merely redundant,  |
| `style.root.tone@error` | salt | Banner.css .saltBanner-error { --banner-borderColor: var(--salt-status-error-borderColor) } + .saltBanner-secondary.saltBanner-error { --banner-background: var(--salt-status-error-background) } |
| `style.root.tone@error` | shadcn | not a shadcn variant name — shadcn's two-value enum is default/destructive (see prop.tone) |
| `style.root.tone@error` | m3 | M3 has NO status/tone axis in its banner token family. Under the v0.192 pin this is a one-file check: versions/v0_192/_md-comp-banner.scss has a single container-color and no colour axis at all. (Under `latest` it took a four-file grep across _md-comp-banner.scss, _md-comp-banners.scss, _md-comp-banners-basic.scss and _md-comp-banners-rich.scss to establish the same thing, and there the answer cam |
| `style.root.tone@warning` | salt | Banner.css .saltBanner-warning + .saltBanner-secondary.saltBanner-warning |
| `style.root.tone@warning` | shadcn | not a shadcn variant name; no warning tone exists at all — the same tone-coverage gap vs Salt's four values already recorded for Button |
| `style.root.tone@warning` | m3 | M3 has NO status/tone axis in its banner token family. Under the v0.192 pin this is a one-file check: versions/v0_192/_md-comp-banner.scss has a single container-color and no colour axis at all. (Under `latest` it took a four-file grep across _md-comp-banner.scss, _md-comp-banners.scss, _md-comp-banners-basic.scss and _md-comp-banners-rich.scss to establish the same thing, and there the answer cam |
| `style.root.tone@success` | salt | Banner.css .saltBanner-success + .saltBanner-secondary.saltBanner-success |
| `style.root.tone@success` | shadcn | not a shadcn variant name; no success tone exists at all |
| `style.root.tone@success` | m3 | M3 has NO status/tone axis in its banner token family. Under the v0.192 pin this is a one-file check: versions/v0_192/_md-comp-banner.scss has a single container-color and no colour axis at all. (Under `latest` it took a four-file grep across _md-comp-banner.scss, _md-comp-banners.scss, _md-comp-banners-basic.scss and _md-comp-banners-rich.scss to establish the same thing, and there the answer cam |
| `style.root.tone@destructive` | salt | not a Salt tone name — Salt's four-value enum is info/error/warning/success (see prop.tone) |
| `style.root.tone@destructive` | shadcn | alert.tsx variant=destructive: "text-destructive" (root/title/icon, via [&>svg]:text-current) and "*:data-[slot=alert-description]:text-destructive/90" (description at 90% alpha). Background deliberately NOT included — bg-card is identical in both variants, a real non-variation |
| `style.root.tone@destructive` | m3 | M3 has NO status/tone axis in its banner token family. Under the v0.192 pin this is a one-file check: versions/v0_192/_md-comp-banner.scss has a single container-color and no colour axis at all. (Under `latest` it took a four-file grep across _md-comp-banner.scss, _md-comp-banners.scss, _md-comp-banners-basic.scss and _md-comp-banners-rich.scss to establish the same thing, and there the answer cam |

</details>

<!-- END GENERATED VALUES -->
