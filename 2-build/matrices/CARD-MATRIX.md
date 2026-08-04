# Card — component template matrix

*Tenth live component in the post-clean-slate pipeline (button, calendar,
spinner, tooltip, alert, input, select, dialog, tabs came before). Same method
as [TABS-MATRIX.md](TABS-MATRIX.md) / [DIALOG-MATRIX.md](DIALOG-MATRIX.md) /
[SELECT-MATRIX.md](SELECT-MATRIX.md) / [INPUT-MATRIX.md](INPUT-MATRIX.md) /
[TOOLTIP-MATRIX.md](TOOLTIP-MATRIX.md) / [ALERT-MATRIX.md](ALERT-MATRIX.md) /
[CALENDAR-MATRIX.md](CALENDAR-MATRIX.md): one master template (union of all six
pieces across systems), columns per design system, rows switched
on/off/inherited per column.*

**Cell legend** · `⟡ slot` = alias to shared contract slot · **bold** = the
system's own switch · `x-ds:` = system's native token, no shared slot yet ·
`OFF` = row switched off in this column · `INHERIT` = system silent,
registry default applies · `[S]` = value extracted from source this
session · `[R]` = not directly sourced (reason always given); needs
verification before treating as authoritative.

**Row policies** · 🔒 locked-on (no column may switch it off) ·
⚪ switchable (on where the system has it) · ⬜ on-with-default.

**Naming rule** — grammar `<piece>.<part>[.<subpart>].<property>[@state]`,
enforced by `contract/template.schema.json`'s `row.id` pattern.

**Card is the third component to ship the third gate.**
`scripts/check-card-behavior.mjs` follows `check-tabs-behavior.mjs`'s contract
exactly, including its `REF_EFFECT_GUARDS` block, and repeats the same honest
closing caveat: it proves code **exists and is bound**, not that it **runs** or
that it is **correct**. Its closing note also carries a new environment warning
for whoever drives the DOM — see the last section.

**The headline of this matrix.** A card looks like the most static component
in the registry and is not. Three systems answer *"what separates this surface
from the page?"* with **three different mechanisms** (a shadow, a fill, a
stroke) and answer *"is this surface a container or a control?"* with **three
different contracts** — one of which, Salt, gives all three answers inside a
single design system.

---

## Scope note

### What is in scope

- **Salt** `packages/core/src/card/` — every file: `Card`, `CardHeader`,
  `CardContent`, `CardFooter`, `hasCardSection.ts`, `index.ts` and their four
  CSS files — **plus** `packages/core/src/interactable-card/`
  (`InteractableCard`, `InteractableCardGroup`, `InteractableCardGroupContext`,
  `useInteractableCard`) and `packages/core/src/link-card/` (`LinkCard`). The
  brief puts a clickable variant in scope **as a behaviour axis, not as a
  separate component**, and source agrees structurally: all three compose the
  *same* `CardHeader`/`CardContent`/`CardFooter` parts and the *same*
  `hasCardSection` detector — `CardContent.css`, `CardFooter.css` and
  `CardHeader.css` each name `.saltCard-sectioned`, `.saltLinkCard-sectioned`
  **and** `.saltInteractableCard-sectioned` in one selector list [S].
- **shadcn** `apps/v4/registry/new-york-v4/ui/card.tsx` — all seven exported
  parts. No cva, no variants object, no props. Examples read for composition:
  `examples/{card-demo,card-with-form}.tsx`.
- **Material 3** all THREE of
  `tokens/versions/latest/sass/_md-comp-{elevated,filled,outlined}-card.scss`,
  modelled as **one canonical component with a variant axis**, the way button
  handled filled/outlined/text and input handled filled/outlined text-field.
  Plus `tokens/versions/v0_192/…` for the edition diff and material-web's own
  hand-authored `tokens/_md-comp-{elevated,filled,outlined}-card.scss` for what
  the shipped library actually supports.

### `link-card` is in scope, and `docs/COMPONENTS.md` disagrees — recorded

`docs/COMPONENTS.md` line 101 reads
`| card | ✓ | ✓ card, interactable-card | ✓ *(filled/outlined/elevated)-card* |`
— so `interactable-card` is already on the card row. But line 28 reads
`| link | — (native <a>) | ✓ link, link-card | — |`, i.e. **`link-card` is
placed on the `link` row, not the card row.**

It is carried here anyway, as the third value of `prop.interaction`, for three
reasons: it composes the identical card parts and detector (above); the brief
explicitly scopes clickable variants in as a behaviour axis; and excluding it
would have dropped the single most interesting behaviour fork in the component
— **an anchor activates on Enter and not on Space, where a button activates on
both.** If `link` is ever built and claims it, these rows migrate:
`prop.interaction`'s `link` value, `style.accent.color@focus`, and the
`interaction === "link"` branch of `behavior.{role,keyboard-activation,
nested-interactive}`. Nothing else moves. **Flagged for the owner.**

### The selection group is modelled here as a PART

Salt is the only system with one. `docs/COMPONENTS.md` has no `card-group` row
today, but if one is ever split out, **these rows migrate wholesale** and
nothing else moves: `structure.group`, `prop.selection-mode`,
`behavior.group-navigation`, `behavior.selection`, `style.group.box`. The
card's own role and tab stop stay with `card`, because they are a property of
its *membership*, not of the group. Same treatment TABS-MATRIX.md gave Salt's
overflow menu and DIALOG-MATRIX.md gave the scrim.

### What is out of scope, and why (structural reasons, declared not dropped)

| excluded | where | structural reason |
|---|---|---|
| `alert` / `banner` | already built — `docs/ALERT-MATRIX.md` | Its own canonical row, and a different contract: a banner is a **live region** (`role="alert"`/`"status"`), it has a semantic **tone** axis (Salt's four-value `ValidationStatus`), a status **icon tied to that tone**, and a dedicated close affordance (M3). M3 tokenises banner **media** (`_md-comp-banners-rich.scss` `image.size` 80px) and deliberately does **not** tokenise card media — the same team, the same edition, two different answers, which is the cleanest possible evidence these are different components [S]. |
| `dialog` | already built — `docs/DIALOG-MATRIX.md` | Its own canonical row. A modal surface: a scrim, a focus trap, scroll locking, two dismissal channels, `aria-modal`, `z-index: 1300`. M3's dialog is `corner-extra-large` (28px) at `level3` over `surface-container-high`; its card is `corner-medium` (12px) at `level1` over `surface-container-low`. Different family, different elevation, different shape [S]. |
| Salt `panel`, `side-panel` | `packages/lab/src/…`, `docs/COMPONENTS.md` line 134 | `docs/COMPONENTS.md` gives `panel` its own canonical row (`— / ✓ panel, side-panel / —`), and the card docs list Panel under `relatedComponents: [{ name: "Panel", relationship: "similarTo" }]` — ***similar to*, not the same as** [S]. |
| `accordion` | `docs/COMPONENTS.md` line 105 | Its own canonical row in all of Salt and shadcn. A disclosure pattern: a `button` header with `aria-expanded` controlling a collapsible region. A card has no expanded state anywhere in any of the three systems [S]. |
| `tile` / `teaser` | — | Not separate exports anywhere. Salt's card docs list them under `alsoKnownAs: ["Tile", "Panel", "Teaser"]`, i.e. they are *names for this component*, not components. Recorded as a naming note rather than an exclusion [S]. |
| shadcn `field-choice-card` | `examples/field-choice-card.tsx` | A composition of `field` + a radio/checkbox, not a variant of `card` — the same double-counting exclusion INPUT-MATRIX.md made for Salt's `search-input` [S]. |
| M3 `dragged-*` tokens | all three card files | A real, complete token family (`dragged-container-elevation` level4/3/3, `dragged-state-layer-opacity` 0.16) and **no column models drag**, so there is no cross-system contract to hang it on. Declared off rather than modelled for one column — the same reasoning TABS-MATRIX.md used for M3's pressed state, inverted here because card's pressed state *does* have two columns [S]. |
| M3 `container-surface-tint-layer-color` | `latest` only | Arrives **`@deprecated` on the edition that adds it** (*"Surfaces no longer use surface-tint layers for tinting, please use the desired surface role directly as the container color"*). Same treatment DIALOG-MATRIX.md gave the dialog's [S]. |

---

## Sources

- **Salt** [S]: `packages/core/src/card/{Card.tsx,Card.css,CardHeader.tsx,CardHeader.css,CardContent.tsx,CardContent.css,CardFooter.tsx,CardFooter.css,hasCardSection.ts,index.ts}`;
  `packages/core/src/interactable-card/{InteractableCard.tsx,InteractableCard.css,InteractableCardGroup.tsx,InteractableCardGroup.css,InteractableCardGroupContext.tsx,useInteractableCard.ts,index.ts}`;
  `packages/core/src/link-card/{LinkCard.tsx,LinkCard.css,index.ts}`;
  `packages/theme/css/next/characteristics/{container,overlayable,actionable,selectable,sentiment,focused,content}.css`;
  `packages/theme/css/next/palette/{background,alpha,accent,shadow,corner}.css`;
  `packages/theme/css/next/foundations/color.css`;
  `packages/theme/css/foundations/{size,spacing,curve,alpha,cursor,borderStyle,duration}.css`.
  Read for defaults and composition: `packages/core/stories/{card/card.stories.tsx,interactable-card/interactable-card.stories.tsx,link-card/link-card.stories.tsx}`.
  Read for the keyboard and nesting contract: `site/docs/components/card/{index,usage,accessibility}.mdx`.
  Reused rather than re-derived: `docs/foundations/{sizes,spacing,density,shape,colors,elevation,cursors,border-style,motion}.md`.
- **shadcn** [S]: `apps/v4/registry/new-york-v4/ui/card.tsx` (canonical, sole
  source for every style cell); `apps/v4/app/globals.css` (token values);
  `apps/v4/registry/new-york-v4/examples/{card-demo,card-with-form}.tsx`.
  Read only to fix the boundary: `apps/v4/registry/bases/radix/ui/card.tsx`,
  `apps/v4/content/docs/components/radix/card.mdx`.
- **Material 3** [S]: `tokens/versions/latest/sass/_md-comp-{elevated,filled,outlined}-card.scss`;
  `tokens/versions/v0_192/_md-comp-{elevated,filled,outlined}-card.scss` (edition diff);
  the hand-authored `tokens/_md-comp-{elevated,filled,outlined}-card.scss`;
  `versions/latest/sass/{_md-sys-color.scss,_md-sys-color__dark.scss,_md-ref-palette.scss,_md-sys-elevation.scss,_md-sys-shape.scss,_md-sys-state.scss,_md-sys-state-focus-indicator.scss}`.
  **material-web is a tokens-only clone** — `find . -maxdepth 2 -type d`
  returns only `tokens/` — so every M3 structure and behavior row is `[R]` and
  every style cell is `[S]`.

### Edition pin — `versions/latest`, and it is load-bearing again

Pinned to **`tokens/versions/latest/sass`**, matching spinner, tooltip, alert,
input, select, dialog and tabs; calendar and button remain on `v0.192`. The
tally becomes **8 latest / 2 v0.192** — the minority shrinks for the fourth
component running, the split is still open, and it still wants one
registry-wide decision. **Flagged for the owner for the eighth time.**

A full mechanical key/value diff of **all three** card files across the two
editions:

1. **Zero value divergences among the shared keys**, in all three files.
2. `latest` adds exactly **four** keys to each file. One,
   `container-surface-tint-layer-color`, arrives **`@deprecated`**.
3. The other three are the **focus-indicator family** —
   `focus-indicator-color` (`secondary`), `focus-indicator-thickness` (3px) and
   `focus-indicator-outline-offset` (`$outer-offset` = **+2px**). Real,
   non-deprecated, and the **only sourced focus affordance an M3 card has**,
   because material-web separately lists `focus-state-layer-color`/`-opacity`
   under `$unsupported-tokens`. On v0.192 an M3 card would have had **no
   sourced focus treatment at all** — which matters for a component whose
   `prop.interaction` carries a `button` value.

**The counter-argument, weighed rather than hidden.** All three of
material-web's own `tokens/_md-comp-*-card.scss` wrappers
`@use 'versions/v0_192/md-comp-*-card'` — **the shipped library pins v0.192 for
this exact component**, exactly as TABS-MATRIX.md finding 11 found for tabs.
The weighing: for tabs the argument was close, because the disowned focus state
layer was the only thing at stake. Here it is **not** close, because
material-web *also* disowns every hover, focus, pressed and disabled token in
all three files (see finding 3), so following the library's pin would leave the
column with a bare four-token surface and no interaction rows to model at all —
and the brief explicitly asks for an interactable axis. `latest` is taken; the
disagreement is stated on the cell and in `card.m3.json`'s provenance.

**One declared borrow.** None of the three card files carries a **single**
spacing, sizing or motion token, in either edition. The container padding
(**16px**) is therefore `[R]`, taken from m3.material.io's published card spec
and flagged on its own cell — the same treatment TOOLTIP-MATRIX.md gave M3's
plain-tooltip padding and DIALOG-MATRIX.md its eight basic-dialog numbers. It
is **one** number, against dialog's eight. **No token name was invented for
it.**

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| surface | 🔒 (invariant) | on — `.saltCard`, and two siblings that are byte-equivalent boxes with different elements [S] | on — `Card`, a `flex flex-col` div [S] | on — the `container-*` family, in three variants [S] |
| **media** | ⬜ | **on, and a three-way ABSENCE**: no dedicated part or rule in *any* system. Salt's `DefaultWithImage` story puts a bare `<img aria-hidden alt="">` as a direct child and lets the card's own `overflow: hidden` clip it [S] | **on** — same absence; blocks place bare `<img>` children, `card.tsx` exports no media part [S] | **on** — same absence, and pointed: `_md-comp-banners-rich.scss` **does** tokenise banner media (`image.size` 80px, `image.shape`) and the card files do not [S] |
| header | ⚪ | **on** — `CardHeader`, a real component whose entire CSS is `padding` + `flex-shrink: 0` [S] | **on** — a CSS **grid** with `auto-rows-min`, `grid-rows-[auto_auto]`, a named `@container/card-header`, a conditional second column and a `[.border-b]:pb-6` opt-in divider hook [S] | **OFF** — no header token [S] |
| **title** | ⚪ | **OFF — and it is the ALERT finding repeating.** No title subcomponent is exported; every story puts an `<H3>` inside `CardHeader`, so the headline is *content formatting* [S] | **on** — `CardTitle` [S] | **OFF** [S] |
| description | ⚪ | **OFF** — the stories use `<Text color="secondary">` [S] | **on** — `CardDescription`, the one part in the component that carries a type size [S] | **OFF** [S] |
| **header action** | ⚪ | **OFF as a part, on as a capability** — `HeaderWithAction` composes a `FlexLayout` + a transparent `Button` inside `CardHeader` [S] | **on** — `CardAction`, and genuinely structural: its *presence* rewires the header to `grid-cols-[1fr_auto]` [S] | OFF [S] |
| content | ⚪ | **on** — `CardContent` [S] | **on** — `CardContent` [S] | OFF [S] |
| footer | ⚪ | **on** — flex row, `align-items: center`, **with** a gap [S] | **on** — flex row, `align-items: center`, **without** a gap [S] | OFF [S] |
| **accent bar** | ⚪ | **on** — a `::after` bar on one of four edges, overhanging the card's 1px border by −1px and then clipped straight back off by the card's own `overflow: hidden` [S] | OFF — confirmed absence [S] | OFF — confirmed absence [S] |
| **state layer** | ⚪ | OFF — Salt uses elevation and border colour instead [S] | OFF — there is no interaction state to drive one [S] | **on** — `{hover,focus,pressed,dragged}-state-layer-{color,opacity}` over `on-surface`, in all three variants [S] |
| **card icon** | ⚪ | OFF [S] | OFF [S] | **on, and it is the ONLY sub-part any M3 card token file describes** — `icon-size: 24px`, `icon-color: primary` [S] |
| selection group | ⚪ | **on** — `InteractableCardGroup`, which changes what its children *are* [S] | OFF [S] | OFF [S] |
| **sectioning** | ⚪ | **`detected`** — `hasCardSection(children)` compares `child.type` to the three section components; a `:has()` rule reaches the same conclusion in pure CSS [S] | **`always`** — no detection; the card keeps `py-6 gap-6` and **never** has horizontal padding of its own [S] | **`never`** — there are no sections [S] |

### The three axes that were nearly smoothed over

**Elevated / filled / outlined are three MECHANISMS, not one surface with a
colour delta.** This is the trap the brief named, and it is real: elevated is a
**level-1 shadow** over `surface-container-low` with *no* outline; filled is a
**flat fill** of `surface-container-highest` with *no* shadow; outlined is
plain `surface` with **no tonal lift, no shadow, and a 1px `outline-variant`
stroke**. Three different token files, three different container roles, and
three different properties doing the separating. Modelled as `prop.variant`,
where each value reassigns the *indirection slots* that the background, border
and elevation rows consume — so switching the axis changes which property
carries the separation, not merely its value.

**Salt's four-value axis is a different question, and merging them would have
been the tooltip-arrow mistake with new labels.** `variant="primary" |
"secondary" | "tertiary" | "ghost"` looks like a peer of M3's axis. It is not.
Reading `Card.css` shows all four rules set exactly **two** properties,
`background` and `border-color`, and that the border-color is **identical in
all four** (every `container-{tone}-borderColor` resolves to
`palette-alpha-contrast-medium`). So Salt's axis moves **one** visible
property. It is a *tone ladder*; M3's is a *mechanism choice*. Two rows,
`prop.container-tone` and `prop.variant`, both off in the other's column.

**A card is a container in one system, a control in another, and all three at
once in the third.** Salt ships `Card` (no role, no tab stop, may hold
focusable children), `InteractableCard` (role=button, or radio/checkbox in a
group, Enter **and** Space) and `LinkCard` (a real `<a href>`, Enter **only**).
shadcn ships only the container. M3's tokens describe a control and its own
library disowns them. Modelled as `prop.interaction` with three values and a
real element branch in the skeleton — a boolean `interactive` flag would have
destroyed `behavior.keyboard-activation`, because *an anchor is not a button*.

## 2 · Behavior

**Every row below is implemented in `skeleton/card.tsx` and asserted by
`scripts/check-card-behavior.mjs`.**

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **role** | 🔒 (info) | **five answers**: none (`Card`); `button` (standalone `InteractableCard`); `radio` / `checkbox` (in a group, by `multiSelect`), with `aria-checked` written only for those two; the platform's own (`LinkCard` is an `<a>`) [S] | **none, ever** — `card.tsx` writes `data-slot` and `className` and nothing else [S] | `button` when interactive [R] |
| tab stop | 🔒 (info) | **four branches**: −1 disabled; **0 on every card** of a multi-select group; **roving** in a single-select group (the selected card, or the *first* while the group has no value); 0 standalone [S] | **none** — the card is never focusable [S] | 0 when interactive [R] |
| **keyboard activation** | 🔒 (info) | **TWO CONTRACTS IN ONE SYSTEM**: `InteractableCard` binds **Enter AND Space**, `preventDefault`s both, and fires from **keydown**; `LinkCard` binds **nothing** — a native anchor navigates on Enter and **Space does not activate it at all** [S] | OFF [S] | Enter+Space [R] |
| pointer activation | 🔒 (info) | `onClick`, **withheld entirely when disabled** (`onClick: !disabled ? handleClick : undefined`) rather than a handler that returns early [S] | OFF [S] | click [R] |
| **pressed flag** | 🔒 (info) | **on** — a JS `active` boolean with a `setTimeout(…,0)` guard whose own comments cite Enter firing as *both* a key and a click, and Firefox failing to enter `:active` on Space [S] | OFF [S] | OFF — no JS in a tokens-only clone; the pressed layer is a ripple in the real library [R] |
| **disabled handling** | 🔒 (info) | `aria-disabled` (not the native attribute), tabIndex −1, no handler, and — uniquely — **`pointer-events: none` on the card's DESCENDANT DIVS, not on the card**, so it can still be hovered to show its `not-allowed` cursor [S] | **OFF — confirmed absence** [S] | tokens exist [S], DOM handling [R] |
| **nested interactive** | 🔒 (info) | **three answers**: `Card` "can contain any UI element, including actionable components"; `LinkCard` "shouldn't contain actionable components … as the card itself is the interactive element"; `InteractableCard` may embed them "for visual affordance" [S] | **one answer** — always a container, never a control [S] | **unanswerable** — no element exists to ask [R] |
| group navigation | ⚪ | **on** — Space always selects; **single-select only**, arrows navigate **and select in one step**, with wrap-around. No manual mode. Multi-select has **no arrow branch at all** [S] | OFF [S] | OFF [S] |
| selection | ⚪ | **on** — the group owns a controlled/uncontrolled value (string, or array under `multiSelect`); the card mirrors it into `aria-checked` [S] | OFF [S] | OFF [S] |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **`variant`** (mechanism) | ⚪ | OFF | OFF | **`elevated` \| `filled` \| `outlined`** — **no source default exists**; the list is in the spec's published order and the absence is recorded, as TABS-MATRIX.md did for `emphasis` [S] |
| **`container-tone`** | ⚪ | **`primary` \| `secondary` \| `tertiary` \| `ghost`, default `primary`** [S]. **Asymmetry:** `ghost` exists on `Card` only — `InteractableCard` and `LinkCard` each declare three [S] | OFF | OFF |
| **`accent-placement`** | ⚪ | **`bottom` \| `top` \| `left` \| `right`** — **the code sets NO default** (see finding 5) [S] | OFF | OFF |
| **`interaction`** | ⚪ | **`static` \| `button` \| `link`, default `static`** — three exported components [S] | **`static` only** — confirmed absence [S] | **`static` \| `button`** — `button`'s style cells are [S], its role and keys are [R] |
| `selection-mode` | ⚪ | **`single` \| `multi`, default `single`** (`multiSelect` defaults false) [S] | OFF | OFF |
| `disabled` | ⚪ | **on** — and **twice**: `Card`'s is **`@deprecated`** and dims the border and text; `InteractableCard`'s is live and dims the whole card to 40% [S] | **OFF — confirmed absence** [S] | **on** — 0.38 container opacity (elevated/filled) / 0.12 outline opacity (outlined), all disowned by material-web [S] |
| **`hoverable`** | ⚪ | **on, default false** — a *decorative* hover with no role, no tab stop and no handler, which no other system has [S] | OFF | OFF |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| media | ⬜ | consumer-owned in all three; **no system styles it**. |
| title | ⚪ | consumer-owned. Salt has no part: **DECLARED COMPOSITION** to `text` (its stories' `<H3>`). |
| description | ⚪ | consumer-owned. Salt: **DECLARED COMPOSITION** to `text` (`<Text color="secondary">`). |
| content | 🔒 | consumer-owned; **no system styles what is inside** — only the container's padding. |
| header action | ⚪ | consumer-owned. **DECLARED COMPOSITION** to `button` — shadcn's own demo puts `<Button variant="link">` here; Salt's puts `<Button appearance="transparent">` in the same place with no part. |
| footer | ⚪ | consumer-owned. **DECLARED COMPOSITION** to `button` and `link`. |
| composes (declared) | ⬜ | **DECLARED COMPOSITION**: (a) **`button`**; (b) **`link`** — Salt's `LinkCard` *is* one, and `docs/COMPONENTS.md` puts it on that row; (c) an **icon set** — Salt's `CloseIcon`, M3's own card `icon-color`/`icon-size`; (d) **`text`** — the only typography a Salt card has; (e) **`checkbox`** / **`radio-button`**, whose ARIA an `InteractableCardGroup` adopts wholesale (Salt's usage doc: an interactable card "serves as a toggle button, button, radio button, radio button group, checkbox or checkbox group"). All render as neutral placeholders. |

## 5 · States

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| rest | 🔒 | 1px `alpha-contrast-medium` border + `shadow-lower` + the tone's background — **unconditional**, even a static card is lifted [S] | 1px `--border` + `shadow-sm` + `--card`, which in **light mode is byte-identical to the page background**, so the separation is border + shadow alone [S] | one of three mechanisms, per `prop.variant` [S] |
| hover | ⚪ | `shadow-lower` → `shadow-low` **and** the border recoloured to the accent — but only when interactable, a link, or opted in with `hoverable`, and only inside `@media (hover: hover)` [S] | **OFF — confirmed absence** [S] | a **state layer** (`on-surface` @ 8%) **and** an elevation lift (1→2 / 0→1 / 0→1) — but the **outlined stroke does not move** [S] |
| focus | ⚪ | 2px dotted `accent-stronger` at offset 0 **plus a lift to the hover shadow** — the only focus ring in this registry that also elevates [S] | **OFF** — the card never takes focus [S] | **3px solid `secondary` at offset +2px** — the **OUTER** offset, where the navigation tab uses `$inner-offset` = −3px — plus a 10% layer. `latest` only [S] |
| pressed | ⚪ | the shadow drops **back to rest** and the border stays accent [S] | OFF [S] | the elevation returns to each variant's **resting** level (1/0/0) from the hovered level (2/1/1), plus a 10% layer [S] |
| selected | ⚪ | **on, and visually identical to pressed** — `.saltInteractableCard-selected`, `:active` and `-active` share **one declaration block** [S] | OFF [S] | OFF — no selected token [S] |
| disabled | ⚪ | **40% opacity**, no shadow, no outline, `not-allowed`, descendants `pointer-events: none`; every interaction rule is re-stated in the disabled selector so none can win [S] | OFF [S] | **38%** container opacity (elevated/filled); a **12%-opacity outline** on outlined — two mechanisms [S] |

## 6 · Styles — the cell matrix

All cells at each system's default: Salt `variant="primary"`, no accent, medium
density; shadcn its only configuration; M3 the **elevated** card.

### surface

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background | 🔒 | ⟡ `surface-bg` → `container-primary-background` → **snow `rgb(255,255,255)` / jet `rgb(16,24,32)`** [S] | ⟡ `--card` → **`oklch(1 0 0)` / `oklch(0.205 0 0)`** — and the light value **is** `--background` [S] | ⟡ `container-color` → `surface-container-low` → **`#f7f2fa` / `#1d1b20`** [S] |
| colour | ⚪ | **OFF — confirmed absence.** `Card.css` declares no `color` outside the deprecated disabled rule [S] | **`--card-foreground`**, which equals `--foreground` in both modes — it **pins** the ambient colour rather than changing it [S] | **OFF** — no text-colour token, only an icon colour [S] |
| **font** | ⚪ | **OFF** [S] | **OFF** [S] | **OFF** [S] — *off in all three; see finding 1* |
| border-width | ⬜ | **1px** (`size-fixed-100`, FIXED scale, density-invariant) [S] | **1px** — bare `border`, Tailwind's undeclared default [S] | **0** on elevated and filled, **1px** (`outline-width`) on outlined — the mechanism axis as a width [S] |
| border-colour | ⚪ | `alpha-contrast-medium` → **`rgba(0,0,0,0.3)` / `rgba(255,255,255,0.3)`**, IDENTICAL in all four tones [S] | `--border` → **`oklch(0.922 0 0)` / `oklch(1 0 0 / 10%)`** [S] | **transparent** on elevated/filled, `outline-variant` **`#cac4d0` / `#49454f`** on outlined [S] |
| shape | ⬜ | `palette-corner` → curve-150 → **3/6/9/12px**, the unsuffixed stop [S] | **14px** (`rounded-xl` → `--radius` × 1.4) — the **roundest surface shadcn has here**; its dialog is 10px [S] | **12px** (`corner-medium`) — and M3 goes the *other* way: its dialog is 28px [S] |
| padding | ⬜ | `spacing-200` → **8/16/24/32px**, through the source's own `--card-padding` [S] | **`24px 0`** — `py-6` and **no horizontal padding at all** [S] | **16px** [R] — the one declared borrow |
| padding @sectioned | ⚪ | **0** — the card hands its padding to its sections [S] | **OFF** — `py-6` survives sectioning [S] | OFF — no sections [S] |
| gap | ⚪ | **OFF**, with a visible consequence: Salt's sections **butt together at zero gap** [S] | **24px** (`gap-6`) between every direct child [S] | OFF [S] |
| overflow | ⚪ | **`hidden`** — clips consumer media to the corner AND clips the accent's own −1px overhang back off [S] | **OFF** — a shadcn card does **not** clip an image to its 14px corners [S] | OFF [S] |
| elevation | ⬜ | `overlayable-shadow` → **`0 2px 4px 0 rgba(0,0,0,0.1)` / `…0.5`** [S] | **`shadow-sm`** [R value], mode-invariant [S/R] | `container-elevation` **level1** elevated, **level0** filled and outlined [S], CSS [R] |
| transition | ⚪ | **`box-shadow var(--salt-duration-instant) ease-in-out`** — and `duration-instant` is **0ms**, so the declared transition has no duration. Reproduced as source has it [S] | OFF [S] | OFF — no motion token [S] |
| elevation @hover | ⚪ | `shadow-low` + accent border + pointer cursor [S] | OFF [S] | the hovered level per variant (2/1/1); **no cursor token exists** [S] |
| pressed | ⚪ | shadow **back to rest** + accent border [S] | OFF | shadow back to the **resting** level [S] |
| selected | ⚪ | the **same block** as pressed [S] | OFF | OFF |
| focus | ⚪ | `outline: 2px dotted` **blue-700 / blue-300** at offset 0, **plus** `shadow-low` [S] | OFF [S] | **3px solid `secondary` at offset +2px**, plus `focus-outline-color: on-surface` on the border (invisible at width 0 on elevated/filled — the correct outcome) and the **resting** elevation, so **focus does not lift an M3 card** [S] |
| disabled | ⚪ | `opacity: 0.4`, `box-shadow: none`, `outline: none`, `not-allowed` [S] | OFF | `opacity: 0.38` [S] |
| pointer-events @disabled | ⚪ | **`none` on the SECTIONS, not the card** [S] | OFF | OFF |

### the two axes, as generated rows

| row | Salt | shadcn | Material 3 |
|---|---|---|---|
| `style.surface.variant@filled` | OFF | OFF | **on** — reassigns `--surface-bg` to `surface-container-highest` (**`#e6e0e9` / `#36343b`**), `--surface-elevation` to `none`, `--surface-elevation-hover` to level1 [S] |
| `style.surface.variant@outlined` | OFF | OFF | **on** — `--surface-bg` `surface` (**`#fef7ff` / `#141218`**), no shadow, `--surface-border-width` **1px**, `--surface-border` `outline-variant` [S] |
| `style.surface.tone@secondary` | **on** — marble / granite [S] | OFF | OFF |
| `style.surface.tone@tertiary` | **on** — limestone / leather [S] | OFF | OFF |
| `style.surface.tone@ghost` | **on** — `alpha-medium`: **30% WHITE light, 30% BLACK dark — it inverts**, and it is the only translucent tone. `Card` only [S] | OFF | OFF |

### state layer / accent / icon

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| state-layer rest | ⚪ | OFF | OFF | **`on-surface` at opacity 0** — one colour for every state and every variant [S] |
| state-layer @hover / @focus / @pressed | ⚪ | OFF | OFF | **0.08 / 0.10 / 0.10** (`latest`; v0.192 says 0.12 for the last two) [S] |
| accent colour | ⚪ | `sentiment-accent-background` → **blue-500 `rgb(0,120,207)`**, mode-invariant [S] | OFF | OFF |
| accent geometry | ⚪ | **`size-bar` thick — 2/4/6/8px by DENSITY** — at a −1px inset with a +2px overhang, on one of four edges [S] | OFF | OFF |
| accent colour @focus | ⚪ | **on, and a NO-OP** — `LinkCard:focus-visible` reassigns the accent to `selectable-foreground-hover`, which resolves to the **same** `palette-accent` [S] | OFF | OFF |
| card-icon size | ⚪ | OFF | OFF | **24px**, density-invariant [S] |
| card-icon colour | ⚪ | OFF | OFF | **`primary`** → **`#6750a4` / `#d0bcff`** — deliberately **not** a text role [S] |
| media box | ⚪ | **OFF** | **OFF** | **OFF** — off in all three, retained as documentation [S] |

### header / title / description / content / footer / group

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| header padding | ⚪ | `spacing-200` uniform [S] | **`0 24px`** (`px-6`) [S] | OFF |
| header gap | ⚪ | **OFF** — `CardHeader.css` is padding + `flex-shrink` and nothing else [S] | **8px** (`gap-2`) [S] | OFF |
| title type | ⚪ | OFF | **`font-weight: 600; line-height: 1`** — **no font-size**, so a shadcn card title matches the text around it. Contrast its own DialogTitle, which carries `text-lg` [S] | OFF |
| description type | ⚪ | OFF | **`0.875rem/1.25rem`** — the **only type size anywhere in this component, in any of the three systems** [S] | OFF |
| description colour | ⚪ | OFF | `--muted-foreground` [S] | OFF |
| content padding | ⚪ | `spacing-200` uniform [S] | `0 24px` [S] | OFF |
| content padding @adjacent | ⚪ | **`padding-top: 0`** on any content following a header or another content — this is the mechanism that produces the zero gap [S] | OFF — a real gap instead [S] | OFF |
| content stretch | ⚪ | **`flex: 1 1 auto`** on a sectioned card, so a row of unequal Salt cards aligns its footers (its own `EqualHeightSections` story) [S] | **OFF** — `CardContent` has no flex utility [S] | OFF |
| footer padding | ⚪ | `spacing-200` uniform [S] | `0 24px`, plus a `[.border-t]:pt-6` consumer hook (declared, not modelled) [S] | OFF |
| footer padding @adjacent | ⚪ | `padding-top: 0` — and note the source lists **header and content only**, not footer-after-footer, unlike the content rule [S] | OFF | OFF |
| footer stretch | ⚪ | **`margin-top: auto`** [S] | **OFF** — deliberately; no source rule pins it [S] | OFF |
| footer gap | ⚪ | `spacing-100` → **4/8/12/16px** [S] | **OFF — confirmed absence**; `card-demo` has to add `flex-col gap-2` per instance [S] | OFF |
| group box | ⚪ | `spacing-200` gap — the same ladder as the card's padding [S] | OFF | OFF |

**Accent scope trim.** `sentiment-accent-background`, `actionable-accented-*`
and `palette-accent-stronger` all resolve through `palette-accent`, which has a
`data-accent` axis (`blue` default, `teal` alternate). This column pins
**blue**, matching `button/input/select/dialog/tabs.salt.json`; only
`calendar.salt.json` models `byAccent`. Recorded, not modelled.

---

## Declared approximations in the chassis

Six, all stated rather than smoothed:

1. **Section detection is props-based.** Salt's `hasCardSection.ts` walks
   `Children.toArray` and compares `child.type` to `CardHeader`/`CardContent`/
   `CardFooter`. The chassis takes the sections as *props* and detects the same
   condition over them. Same observable rule, props-based API — and Salt itself
   states the rule twice for the same reason (once in JS, once as a `:has()`
   selector), so a second expression of it is in keeping.
2. **`@media (hover: hover)` is not reproduced.** Every Salt hover rule in all
   three card files sits inside it. The generator has no `@media` channel
   (INPUT-MATRIX.md finding 9), so the hover rows are emitted unconditionally.
   On a touch-only device a Salt card would therefore lift here where source
   would not.
3. **The pressed state is driven by a `data-active` flag as well as
   `:active`.** For **Salt this is source** — `.saltInteractableCard:active,
   .saltInteractableCard-active` share one declaration block precisely because
   a keyboard activation never produces `:active`. For **M3 the flag is the
   chassis's own mechanism**, standing in for a ripple that a tokens-only clone
   cannot supply. The *values* on the M3 row are `[S]`; the *trigger* is `[R]`.
4. **M3's outlined disabled state is declared, not modelled.** Elevated and
   filled carry `disabled-container-opacity: 0.38`; outlined carries **no
   container-opacity token at all** and instead disables its *stroke*
   (`disabled-outline-color: outline` at `disabled-outline-opacity: 0.12`). The
   0.38 is modelled; the second mechanism is recorded here, because
   material-web disowns the entire disabled family for all three variants
   anyway.
5. **shadcn's consumer-opt-in dividers are not modelled.** `CardHeader` carries
   `[.border-b]:pb-6` and `CardFooter` `[.border-t]:pt-6` — padding that
   appears only when the *consumer* adds a border class to that same element.
   It is a documented composition hook, not a component-owned divider; the
   component never applies the border itself. Likewise `@container/card-header`
   names a container-query context that nothing in `card.tsx` queries.
6. **Salt's header action stacks rather than sitting beside the title.**
   `CardAction` is a shadcn part, so `data-has-action` (and the second grid
   column it opens) is a shadcn-only rewiring. Salt has no action part at all —
   its `HeaderWithAction` story positions the button with a consumer
   `FlexLayout` — so in the Salt column an action passed to the header renders
   as a bare child below the title. Consumer-owned layout in source, consumer-
   owned here.

---

## Findings from building this matrix

1. **Card is the first component in this registry where NO system declares any
   typography, and the absence is unanimous.** Salt's six card CSS files
   declare no `font-family`, `font-size`, `font-weight` or `line-height`
   anywhere. shadcn's `Card` sets no type size. M3's three card files carry no
   typescale token at all — no headline, no supporting text, nothing. The one
   exception in three systems is shadcn's `CardDescription` (`text-sm`), which
   is a modelled row. `style.surface.font` is therefore off in **all three
   columns** and is retained deliberately as documentation, the way
   TABS-MATRIX.md retained `style.tab-icon.color`. Consequence for the harness:
   its demo text carries its own inline font, declared as harness chrome, and
   nothing about it comes from a column.
2. **Three mechanisms, and the naming nearly hid it.** M3's `elevated` /
   `filled` / `outlined` and Salt's `primary` / `secondary` / `tertiary` /
   `ghost` are both called "variant" by their own APIs, and both are
   multi-valued surface axes. They are not the same kind of thing. M3's changes
   **which property separates the surface from the page** — a level-1 shadow,
   a `surface-container-highest` fill, or a 1px `outline-variant` stroke, with
   the other two properties zeroed. Salt's changes **one property**: reading
   all four `.saltCard-{variant}` rules shows each sets `background` and
   `border-color`, and that the border-color is identical in all four. Two
   rows, `prop.variant` and `prop.container-tone`, each off in the other's
   column. Collapsing them would have been TOOLTIP-MATRIX.md's arrow mistake.
3. **material-web declares an interactive, stateful, icon-bearing card and then
   disowns almost all of it.** Each of the three hand-authored wrappers lists
   exactly **four** `$supported-tokens` (`container-color`,
   `container-elevation`, `container-shadow-color`, `container-shape`; outlined
   adds `outline-color`, `outline-width`) and puts **everything else** under
   `$unsupported-tokens`, above two literal TODOs:
   `TODO(b/307362112): Add interactive card tokens (hover, focus, pressed)` and
   `TODO(b/307361748): Add disabled cards tokens.` That is every `hover-*`,
   `focus-*`, `pressed-*`, `dragged-*` and `disabled-*` token, plus
   `icon-color` and `icon-size`. The generated token file and the shipped
   library are two different sources and they disagree — SELECT-MATRIX.md
   finding 6, DIALOG-MATRIX.md finding 8 and TABS-MATRIX.md finding 11
   recurring for the **fourth** time. The generated values are taken and the
   disownment is recorded.
4. **The keyboard fork is inside one design system, and a boolean would have
   destroyed it.** Salt's `useInteractableCard` binds **Enter and Space**,
   `preventDefault`s both, and fires from **keydown**. `LinkCard` binds
   **nothing** — it is a native `<a href>`, so Enter navigates and **Space does
   not activate it at all**. Salt's own `accessibility.mdx` states both halves
   in separate `KeyboardControl` blocks. Modelling interaction as
   `boolean` — or even as `"static" | "interactive"` — would have given a link
   card Space activation that source does not have. It is modelled as three
   values with a real element branch, and the guard in the skeleton is on
   `interaction === "button"`, not on `interactive`.
5. **The accent has no default, and two source comments say it does.**
   `Card.tsx` destructures `accent` with no fallback and applies the accent
   classes only `if (accent)` — so an unadorned Salt card has **no accent**.
   `Card.css` nevertheless comments
   `/* Styles applied to Card if accent="bottom" (default) */`, and
   `InteractableCard.tsx`'s JSDoc says `Accent border position: defaults to
   "bottom"`. The docs and the code disagree; the code wins (CLAUDE.md rule 4),
   and the harness therefore starts with the accent **off**. This is the same
   class of trap as TABS-MATRIX.md finding 4 (Salt's top-edge tab mark) and was
   grepped twice for the same reason.
6. **Salt declares a focus recolour that recolours nothing.**
   `LinkCard.css`'s `:focus-visible` block reassigns
   `--linkCard-accent-color` from `--salt-sentiment-accent-background` to
   `--salt-selectable-foreground-hover`. `next/characteristics/sentiment.css`
   defines the first as `var(--salt-palette-accent)`; `selectable.css` defines
   the second as `var(--salt-palette-accent)`. **They are the same value.** The
   row is carried, with two slots holding identical values, so that the
   identity is visible in the matrix rather than silently collapsed — and so
   that a future accent-palette change that moved one and not the other would
   show up. This is the third source self-contradiction the pipeline has turned
   up (Salt's tooltip arrow, Salt's `fade-out-back` keyframe with no transform,
   and now this), plus a fourth in the same file family: `Card.css` declares
   `transition: box-shadow var(--salt-duration-instant) ease-in-out` and
   `duration-instant` is **0ms**.
7. **Salt and shadcn separate their sections by opposite mechanisms, and the
   visible result is a 24-pixel difference.** shadcn puts a real `gap-6`
   between every direct child of the card. Salt puts **no gap at all** and
   instead collapses the *follower's* top padding to zero
   (`.saltCard-sectioned > .saltCardHeader + .saltCardContent { padding-top: 0 }`),
   so two adjacent 16px insets become one continuous 16px frame instead of
   adding to 32px. Stated once, this is also why Salt's card has to *detect*
   its sections at all: the padding has to move somewhere. And Salt states the
   whole rule twice — once behind the JS-detected class and once inside
   `@supports selector(:has(*))` — for all three card kinds.
8. **shadcn's card is the same colour as its page in light mode.** `--card` is
   `oklch(1 0 0)`; `--background` is `oklch(1 0 0)`. Byte-identical. So a
   resting shadcn card in light mode is separated from the page by its **border
   and shadow alone**, and gains a tonal separation only in dark mode
   (`--card` 0.205 against `--background` 0.145). Worth stating because the
   near-universal expectation is that a card is a lighter patch, and because a
   render on a grey harness page hides it — the stages here sit on the neutral
   chrome background for that reason, which also matters for Salt's `ghost`
   tone, a 30% wash that inverts by mode.
9. **The a11y fork is real, it is three-way, and one system answers it three
   times.** Salt's own usage doc: a plain `Card` "can contain any UI element,
   including actionable components"; a `LinkCard` "shouldn't contain actionable
   components (like buttons or links), as the card itself is the interactive
   element"; an `InteractableCard` may embed them "for visual affordance" —
   which is exactly why its disabled rule needs
   `.saltInteractableCard-disabled div { pointer-events: none }`, disabling the
   card's **descendants** rather than the card. shadcn answers once: always a
   container. M3 cannot answer: no element exists. The chassis refuses to
   guess — it publishes `data-nested-interactive`
   (`container` / `tolerated` / `forbidden`) **and measures** whether focusable
   descendants are actually present, publishing `data-has-focusable`, so a link
   card carrying one is inspectable in the DOM instead of merely discouraged in
   prose. The harness always renders exactly that case.
10. **Frozen-token check, run in both directions, found one real density move
    and three genuine fixed-scale values.** `--salt-size-bar` (the accent bar's
    thickness) is on the **density** scale — **2/4/6/8px** — so snapshotting
    the medium 4px would have been wrong at three of four densities.
    `size-fixed-100` (the 1px border, and the accent's −1px inset) and
    `size-fixed-200` (the accent's +2px overhang) are on the **fixed** scale
    and are density-invariant **by design** per
    `docs/foundations/sizes.md` — carried as plain `1px`/`2px` rather than per
    density. `spacing-200` (the card and section padding, and the group gap)
    and `spacing-100` (the footer gap) and `curve-150` (the radius) all move
    and are carried per density. M3's `icon-size: 24px` and shadcn's 24px
    paddings are genuinely density-invariant because neither system has a
    density capability at all (`docs/foundations/density.md`).
11. **A foundations page is edition-stale, and the grep says so again.**
    `docs/foundations/state-layers.md` tabulates M3's state-layer opacities as
    hover 0.08, **focus 0.12, pressed 0.12**, dragged 0.16, without naming an
    edition. Those are the **v0.192** values
    (`versions/v0_192/_md-sys-state.scss`). In
    `versions/latest/sass/_md-sys-state.scss` focus and pressed are both
    **0.1**. This matrix pins `latest` and uses 0.08 / 0.10 / 0.10, matching
    `tabs.m3.json` and `select.m3.json`. **Reported, not edited** (lesson 9) —
    this is the same report TABS-MATRIX.md finding 12 made, unchanged, so the
    page has now been contradicted by two independent component builds.
    Separately, `docs/foundations/typography.md` is **correct as amended** —
    `_md-ref-typeface.scss` does carry `$brand: Roboto` / `$plain: Roboto` as
    literals — but it happens not to matter here, because no card in any system
    declares a font at all (finding 1).
12. **One cross-column inconsistency found in a file this build must not
    touch.** `themes/columns/button.m3.json`'s level-1 hover shadow is
    `0 1px 3px 1px rgba(0,0,0,0.3), 0 1px 2px 0 rgba(0,0,0,0.3)` — both layers
    at 0.3, and the layer order reversed relative to the level-2 and level-3
    values `select.m3.json` and `dialog.m3.json` derived
    (`0 1px 2px 0 …0.3, 0 Npx …0.15`). `card.m3.json` uses the form consistent
    with those two (`0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)`
    for level 1). **Flagged for the owner, not edited** — it is another
    component's file and scope discipline forbids touching it.
13. **Axis self-audit (run deliberately, per ALERT-MATRIX.md finding 10).**
    Every `channel: "config"` row whose cell is a list of 2+ values, and what
    discriminates each value:
    - **`prop.variant`** — M3 `[elevated, filled, outlined]`: discriminated by
      `style.surface.variant@filled` and `@outlined`, two real CSS blocks that
      between them move **five** properties (`--surface-bg`,
      `--surface-elevation`, `--surface-elevation-hover`,
      `--surface-border-width`, `--surface-border`) — i.e. the background, the
      shadow, the hovered shadow, the border width *and* the border colour.
      **No source default exists**, so the list is in the spec's own published
      order and the absence is recorded rather than a default invented (the
      same treatment TABS-MATRIX.md gave M3's emphasis). Salt and shadcn are
      off, so nothing is undiscriminated.
    - **`prop.container-tone`** — Salt `[primary, secondary, tertiary, ghost]`:
      discriminated by `style.surface.tone@secondary`, `@tertiary` and
      `@ghost`, three real blocks each reassigning the single `--surface-bg`
      indirection the background row consumes — the axis genuinely moves one
      property, which is what source does. Listed **DEFAULT-FIRST**
      (`primary`), because the skeleton and the harness take `value[0]` as the
      resting state and a ghost-first list would have made every Salt card
      render as a translucent wash.
    - **`prop.accent-placement`** — Salt `[bottom, top, left, right]`:
      discriminated by `style.accent.placement@bottom/@top/@left/@right`, four
      real blocks with different geometry (the horizontal pair set `height:
      size-bar` and a full-width span; the vertical pair swap the axes).
      **The code sets no default** (finding 5); listed bottom-first because
      that is the value both source doc comments and every story reach for, and
      because `value[0]` is what the harness shows once the accent is switched
      on. The accent itself starts **off** in the harness, matching the code.
    - **`prop.interaction`** — Salt `[static, button, link]`, M3
      `[static, button]`: discriminated by a **skeleton element branch**
      (`<div>` vs `<a href>`), by the role / tab-stop / keyboard computations,
      and by CSS — `style.surface.elevation@hover`, `.pressed`, `.focus` and
      all three `style.state-layer.opacity@*` rows are gated on
      `[data-interactive]`, and `style.accent.color@focus` on
      `[data-interaction="link"]`. Listed **SOURCE-DEFAULT-FIRST** (`static`):
      `Card` is Salt's unqualified export and the one its docs open with, and
      for M3 every interaction token is state-qualified so the unqualified
      enabled state is the base reading. A button-first list would have made
      every card in the harness focusable against source. shadcn is
      single-valued `[static]`.
    - **`prop.selection-mode`** — Salt `[single, multi]`: discriminated by a
      **skeleton branch** in three places at once — the group's own role
      (`radiogroup` vs `group`), each card's role (`radio` vs `checkbox`), and
      the tab-stop regime (roving vs all-zero) — plus
      `behavior.group-navigation`, since arrows navigate only in single-select.
      Listed **DEFAULT-FIRST** (`single`), because `multiSelect` is undefined
      by default in source.
    - **`prop.disabled`** — Salt and M3 `[true, false]`; **`prop.hoverable`** —
      Salt `[true, false]`. These are **capability lists, not ordered
      defaults**: `false` is the base rendering in every column and the
      skeleton reads the per-instance prop, never `value[0]`. Stated explicitly
      because the ordering convention differs from the enum rows above, and
      because tabs used the same `[true, false]` form for the same reason.
      `disabled` is discriminated by `style.surface.disabled` (two different
      mechanisms — a blanket 40% dim vs a 38% container opacity) **plus**
      `style.surface.pointer-events@disabled` **plus** the tab-stop and
      withheld-handler branches. `hoverable` is discriminated by the
      `[data-hoverable]` half of `style.surface.elevation@hover`'s selector.
    - **Single-valued across every column, so nothing to discriminate:**
      `structure.media` (`true` everywhere — the absence is the finding),
      `structure.sectioning` (three values, one per column, each discriminated
      by a distinct combination of `style.surface.padding@sectioned`,
      `style.surface.gap`, `style.content.padding@adjacent`,
      `style.footer.padding@adjacent`, `style.content.stretch` and
      `style.footer.stretch`), and every boolean `structure.*` /
      `behavior.group-navigation` / `behavior.selection` row.
    **Result: no dead axis values, every enum list is source-default-first,
    every capability list is declared as such, and the one axis with no source
    default (M3's variant) says so.** The rows that are off in every column
    (`style.surface.font`, `style.media.box`) are retained deliberately as
    documentation of findings 1 and the media absence.
14. **The third gate, third outing, plus one environment warning it now
    carries.** `scripts/check-card-behavior.mjs` is
    `check-tabs-behavior.mjs`'s contract unchanged, including the
    `REF_EFFECT_GUARDS` block, over card's **nine** behavior rows (seven
    locked/info) and the skeleton's **two** ref-reading effects — the group's
    element collection (gate: `children`, because the cards *are* the nodes it
    queries) and the focusable-descendant measurement (gate: the props that
    decide which section nodes exist, plus `interaction`, which swaps the
    element the ref points at from a `<div>` to an `<a>`). Its closing note
    repeats the honest caveat *and adds one thing tabs learned the hard way*:
    **in the hidden/background tab this harness runs in, `document.activeElement`
    updates on a programmatic `.focus()` but the focus EVENT is suppressed.**
    Card's focus-visible ring is driven by an `onFocus` handler, so
    `style.surface.focus` and `style.state-layer.opacity@focus` in every column
    must be exercised with a **synthetic bubbling `focusin`**, or the
    environment manufactures a convincing false negative of exactly the shape
    TABS-MATRIX.md's validation pass chased. The outstanding half is unchanged:
    drive the skeleton in a DOM and assert that a link card activates on Enter
    and **not** on Space while an interactable card activates on both, that a
    single-select group has exactly one tab stop and a multi-select group has
    one per card, that arrowing a single-select group selects as it moves and
    arrowing a multi-select group does nothing, that a disabled card has no
    click handler and is filtered out of the arrow ring, and that the pressed
    flag clears. Logged for the owner alongside SELECT-MATRIX.md findings
    13–16.

## Validation pass — behaviours verified, and a NUL byte that blinded grep

**Behaviours driven in the real DOM, all correct.** M3's three variants change
MECHANISM, not colour, confirmed by computed style: `elevated` = tinted
`surface-container-low` + a level-1 shadow + **no border**; `filled` =
`surface-container-highest`, **no shadow, no border**; `outlined` = plain
`surface` + a **1px `outline-variant` stroke**, no shadow. Salt's interaction
axis promotes the surface to `role="button"` with `tabindex="0"`; the
single-select group renders `role="radio"` cards; `Enter` activates
(`aria-checked` flips, the tab stop follows); `ArrowRight` moves focus **and**
selection past the disabled member to the next enabled one — the APG
radiogroup contract, not the tab contract.

**The finding worth carrying forward: `skeleton/card.tsx` contained a literal
NUL byte.** It sat inside a dependency-key expression — `values.join(...)` with
a raw NUL as separator, a legitimate idiom for a collision-proof key — and it
was *valid, working JavaScript*. esbuild compiled it, the component rendered
correctly, and `check-card-behavior.mjs` (which reads the file with
`readFileSync` and matches with `String.includes`) passed honestly.

But one NUL byte makes a file classify as **binary**. `file` reported `data`
rather than `UTF-8 text`, and **every `grep` against it silently returned
nothing** — not an error, not a warning, just no output and exit 1. Three
separate greps for `Enter`, `onKeyDown` and `activate` all came back empty
against a file that contains all three, and the honest reading of that
evidence was "a `role=button` card with no keyboard handler" — a serious a11y
bug that did not exist. The gate was right; the grep was lying.

Fixed by writing the escape as source text (a backslash-u escape) instead of
embedding the raw byte: identical string at runtime, file stays plain text.
All ten skeletons were then scanned; card was the only one affected.

Two transferable points:

- **A source file can be valid, compile, render, and pass its gates while
  being invisible to every text-based tool pointed at it.** Anything that
  greps — a citation lint, a provenance canary, a CI rule, a reviewer — will
  silently skip it and report success. The proposed tier-1 citation lint
  would have skipped this file entirely and said nothing.
- **`grep` returning nothing is not evidence of absence** until the file is
  known to be text. `file <path>` is the one-second check that distinguishes
  "not present" from "not readable", and it is worth running before drawing a
  conclusion from an empty grep — as here, where an empty grep nearly became a
  reported accessibility defect.

Worth adding to the evaluation pass: a repo-wide `file`/NUL scan across
`skeleton/`, `themes/columns/`, `contract/` and `docs/`, so no artifact is
quietly exempt from the tooling meant to police it.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/card.template.json` against every system, read from `columns/card.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 14 light, 8 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `surface-bg-primary` | rgb(255, 255, 255) | rgb(16, 24, 32) | **no** |
| `surface-bg-secondary` | rgb(245, 247, 248) | rgb(26, 34, 41) | **no** |
| `surface-bg-tertiary` | rgb(250, 248, 242) | rgb(38, 41, 43) | **no** |
| `surface-bg-ghost` | rgba(255, 255, 255, 0.3) | rgba(0, 0, 0, 0.3) | **no** |
| `surface-bg` | var(--surface-bg-primary) | — | **no** |
| `surface-border` | rgba(0, 0, 0, 0.3) | rgba(255, 255, 255, 0.3) | yes |
| `border-interactive` | rgb(0, 120, 207) | — | yes |
| `accent-color` | rgb(0, 120, 207) | — | **no** |
| `accent-color-focus` | rgb(0, 120, 207) | — | **no** |
| `shadow-rest` | 0 2px 4px 0 rgba(0, 0, 0, 0.1) | 0 2px 4px 0 rgba(0, 0, 0, 0.5) | **no** |
| `shadow-hover` | 0 4px 8px 0 rgba(0, 0, 0, 0.15) | 0 4px 8px 0 rgba(0, 0, 0, 0.55) | **no** |
| `focus-outline` | 2px dotted rgb(0, 69, 126) | 2px dotted rgb(154, 189, 245) | yes |
| `accent-inset` | 1px | — | **no** |
| `accent-overhang` | 2px | — | **no** |

**shadcn** — 5 light, 4 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `surface-bg` | oklch(1 0 0) | oklch(0.205 0 0) | yes |
| `surface-fg` | oklch(0% 0 0) | oklch(0.985 0 0) | yes |
| `surface-border` | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | yes |
| `muted-fg` | oklch(0.556 0 0) | oklch(0.708 0 0) | yes |
| `shadow-sm` | 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) | — | yes |

**m3** — 15 light, 8 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `surface-bg-elevated` | #f7f2fa | #1d1b20 | **no** |
| `surface-bg-filled` | #e6e0e9 | #36343b | **no** |
| `surface-bg-outlined` | #fef7ff | #141218 | **no** |
| `surface-bg` | var(--surface-bg-elevated) | — | **no** |
| `surface-border` | transparent | — | **no** |
| `surface-border-width` | 0 | — | **no** |
| `outline-color` | #cac4d0 | #49454f | **no** |
| `outline-color-focus` | #1d1b20 | #e6e0e9 | **no** |
| `layer-color` | #1d1b20 | #e6e0e9 | yes |
| `icon-color` | #6750a4 | #d0bcff | **no** |
| `focus-indicator` | #625b71 | #ccc2dc | yes |
| `shadow-level1` | 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15) | — | **no** |
| `shadow-level2` | 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15) | — | **no** |
| `surface-elevation` | var(--shadow-level1) | — | **no** |
| `surface-elevation-hover` | var(--shadow-level2) | — | **no** |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.media` | structure | default | `True` | `True` | `True` |
| 2 | `structure.header` | structure | switchable | `True` | `True` | **off** |
| 3 | `structure.title` | structure | switchable | **off** | `True` | **off** |
| 4 | `structure.description` | structure | switchable | **off** | `True` | **off** |
| 5 | `structure.action` | structure | switchable | **off** | `True` | **off** |
| 6 | `structure.content` | structure | switchable | `True` | `True` | **off** |
| 7 | `structure.footer` | structure | switchable | `True` | `True` | **off** |
| 8 | `structure.accent` | structure | switchable | `True` | **off** | **off** |
| 9 | `structure.state-layer` | structure | switchable | **off** | **off** | `True` |
| 10 | `structure.card-icon` | structure | switchable | **off** | **off** | `True` |
| 11 | `structure.group` | structure | switchable | `True` | **off** | **off** |
| 12 | `structure.sectioning` | structure | switchable | `detected` | `always` | `never` |
| 13 | `behavior.role` | behavior | locked | `none \| button \| radio \| checkbox \| link` | `none` | `[R] button when interactive, none otherwise` |
| 14 | `behavior.tab-stop` | behavior | locked | `roving in a single-select group, all-zero in a multi-select group, zero standalone, -1 when disabled` | `none` | `[R] zero when interactive` |
| 15 | `behavior.keyboard-activation` | behavior | locked | `enter+space on button, enter only on link` | `none` | `[R] enter+space` |
| 16 | `behavior.pointer-activation` | behavior | locked | `click` | `none` | `[R] click` |
| 17 | `behavior.active-flag` | behavior | locked | `True` | `False` | `False` |
| 18 | `behavior.disabled-handling` | behavior | locked | `aria-disabled + tabIndex -1 + no handler + pointer-events on descendants` | `none` | `[R] aria-disabled` |
| 19 | `behavior.nested-interactive` | behavior | locked | `container on Card, control-with-embedded-affordances on InteractableCard, control-only on LinkCard` | `container` | `[R] unanswerable` |
| 20 | `behavior.group-navigation` | behavior | switchable | `True` | **off** | **off** |
| 21 | `behavior.selection` | behavior | switchable | `True` | **off** | **off** |
| 22 | `prop.variant` | prop | switchable | **off** | **off** | `elevated, filled, outlined` |
| 23 | `prop.container-tone` | prop | switchable | `primary, secondary, tertiary, ghost` | **off** | **off** |
| 24 | `prop.accent-placement` | prop | switchable | `bottom, top, left, right` | **off** | **off** |
| 25 | `prop.interaction` | prop | switchable | `static, button, link` | `static` | `static, button` |
| 26 | `prop.selection-mode` | prop | switchable | `single, multi` | **off** | **off** |
| 27 | `prop.disabled` | prop | switchable | `True, False` | **off** | `True, False` |
| 28 | `prop.hoverable` | prop | switchable | `True, False` | **off** | **off** |
| 29 | `slot.media` | slot | default | — | — | — |
| 30 | `slot.title` | slot | switchable | **off** | `True` | **off** |
| 31 | `slot.description` | slot | switchable | **off** | `True` | **off** |
| 32 | `slot.content` | slot | locked | — | — | — |
| 33 | `slot.action` | slot | switchable | **off** | `True` | **off** |
| 34 | `slot.footer` | slot | switchable | `True` | `True` | **off** |
| 35 | `slot.composes` | slot | default | — | — | — |
| 36 | `state.rest` | state | locked | `1px alpha-contrast-medium border + shadow-lower + the tone background` | `1px --border + shadow-sm + --card, which in LIGHT mode is the same colour as the page` | `one of three mechanisms — level-1 shadow / surface-container-highest fill / 1px outline-variant stroke` |
| 37 | `state.hover` | state | switchable | `shadow-low + accent border` | **off** | `state layer on-surface 8% + an elevation lift (1->2 / 0->1 / 0->1)` |
| 38 | `state.focus` | state | switchable | `2px dotted accent-stronger outline at offset 0 + shadow-low + pointer cursor` | **off** | `3px solid secondary at outline-offset +2px, plus a 12% state layer` |
| 39 | `state.pressed` | state | switchable | `accent border + shadow BACK to rest` | **off** | `elevation returns to the variant's resting level, plus a 12% state layer` |
| 40 | `state.selected` | state | switchable | `identical to pressed` | **off** | **off** |
| 41 | `state.disabled` | state | switchable | `40% opacity, no shadow, no outline, not-allowed cursor, descendants pointer-events:none` | **off** | `38% container opacity (elevated, filled) / a 12%-opacity outline stroke (outlined)` |
| 42 | `style.surface.background` | style | locked | ⟡ `surface-bg` | ⟡ `surface-bg` | ⟡ `surface-bg` |
| 43 | `style.surface.color` | style | switchable | **off** | ⟡ `surface-fg` | **off** |
| 44 | `style.surface.font` | style | switchable | **off** | **off** | **off** |
| 45 | `style.surface.border-width` | style | default | `1px` | `1px` | ⟡ `surface-border-width` |
| 46 | `style.surface.border-color` | style | switchable | ⟡ `surface-border` | ⟡ `surface-border` | ⟡ `surface-border` |
| 47 | `style.surface.shape` | style | default | ⟡ `card-radius` | `14px` | `12px` |
| 48 | `style.surface.padding` | style | default | ⟡ `card-padding` | `24px 0` | `16px` |
| 49 | `style.surface.padding@sectioned` | style | switchable | `0` | **off** | **off** |
| 50 | `style.surface.gap` | style | switchable | **off** | `24px` | **off** |
| 51 | `style.surface.overflow` | style | switchable | `hidden` | **off** | **off** |
| 52 | `style.surface.elevation` | style | default | ⟡ `shadow-rest` | ⟡ `shadow-sm` | ⟡ `surface-elevation` |
| 53 | `style.surface.transition` | style | switchable | `box-shadow 0ms ease-in-out` | **off** | **off** |
| 54 | `style.surface.focus` | style | switchable | `outline: var(--focus-outline); outline-offset: 0; box-shadow: var(--shadow-hover); cursor: pointer` | **off** | `outline: 3px solid var(--focus-indicator); outline-offset: 2px; border-color: var(--outline-color-focus); box-shadow: var(--surface-elevation)` |
| 55 | `style.surface.elevation@hover` | style | switchable | `box-shadow: var(--shadow-hover); border-color: var(--border-interactive); cursor: pointer` | **off** | `box-shadow: var(--surface-elevation-hover)` |
| 56 | `style.surface.pressed` | style | switchable | `box-shadow: var(--shadow-rest); border-color: var(--border-interactive); cursor: pointer` | **off** | `box-shadow: var(--surface-elevation)` |
| 57 | `style.surface.selected` | style | switchable | `box-shadow: var(--shadow-rest); border-color: var(--border-interactive); cursor: pointer` | **off** | **off** |
| 58 | `style.surface.disabled` | style | switchable | `opacity: 0.4; box-shadow: none; outline: none; cursor: not-allowed` | **off** | `opacity: 0.38` |
| 59 | `style.surface.pointer-events@disabled` | style | switchable | `none` | **off** | **off** |
| 60 | `style.surface.variant@filled` | style | switchable | **off** | **off** | `--surface-bg: var(--surface-bg-filled); --surface-elevation: none; --surface-elevation-hover: var(--shadow-level1)` |
| 61 | `style.surface.variant@outlined` | style | switchable | **off** | **off** | `--surface-bg: var(--surface-bg-outlined); --surface-elevation: none; --surface-elevation-hover: var(--shadow-level1); --surface-border-width: 1px; --surface-border: var(--outline-color)` |
| 62 | `style.surface.tone@secondary` | style | switchable | `--surface-bg: var(--surface-bg-secondary)` | **off** | **off** |
| 63 | `style.surface.tone@tertiary` | style | switchable | `--surface-bg: var(--surface-bg-tertiary)` | **off** | **off** |
| 64 | `style.surface.tone@ghost` | style | switchable | `--surface-bg: var(--surface-bg-ghost)` | **off** | **off** |
| 65 | `style.state-layer.rest` | style | switchable | **off** | **off** | `background: var(--layer-color); opacity: 0` |
| 66 | `style.state-layer.opacity@hover` | style | switchable | **off** | **off** | `0.08` |
| 67 | `style.state-layer.opacity@focus` | style | switchable | **off** | **off** | `0.12` |
| 68 | `style.state-layer.opacity@pressed` | style | switchable | **off** | **off** | `0.12` |
| 69 | `style.accent.box` | style | switchable | ⟡ `accent-color` | **off** | **off** |
| 70 | `style.accent.placement@bottom` | style | switchable | `left: calc(-1 * var(--accent-inset)); bottom: calc(-1 * var(--accent-inset)); height: var(--accent-size); width: calc(100% + var(--accent-overhang))` | **off** | **off** |
| 71 | `style.accent.placement@top` | style | switchable | `left: calc(-1 * var(--accent-inset)); top: calc(-1 * var(--accent-inset)); height: var(--accent-size); width: calc(100% + var(--accent-overhang))` | **off** | **off** |
| 72 | `style.accent.placement@left` | style | switchable | `left: calc(-1 * var(--accent-inset)); top: calc(-1 * var(--accent-inset)); height: calc(100% + var(--accent-overhang)); width: var(--accent-size)` | **off** | **off** |
| 73 | `style.accent.placement@right` | style | switchable | `right: calc(-1 * var(--accent-inset)); top: calc(-1 * var(--accent-inset)); height: calc(100% + var(--accent-overhang)); width: var(--accent-size)` | **off** | **off** |
| 74 | `style.accent.color@focus` | style | switchable | ⟡ `accent-color-focus` | **off** | **off** |
| 75 | `style.media.box` | style | switchable | **off** | **off** | **off** |
| 76 | `style.header.padding` | style | switchable | ⟡ `card-padding` | `0 24px` | **off** |
| 77 | `style.header.gap` | style | switchable | **off** | `8px` | **off** |
| 78 | `style.title.type` | style | switchable | **off** | `font-weight: 600; line-height: 1` | **off** |
| 79 | `style.description.type` | style | switchable | **off** | `font-size: 0.875rem; line-height: 1.25rem` | **off** |
| 80 | `style.description.color` | style | switchable | **off** | ⟡ `muted-fg` | **off** |
| 81 | `style.content.padding` | style | switchable | ⟡ `card-padding` | `0 24px` | **off** |
| 82 | `style.content.padding@adjacent` | style | switchable | `0` | **off** | **off** |
| 83 | `style.content.stretch` | style | switchable | `1 1 auto` | **off** | **off** |
| 84 | `style.footer.padding` | style | switchable | ⟡ `card-padding` | `0 24px` | **off** |
| 85 | `style.footer.padding@adjacent` | style | switchable | `0` | **off** | **off** |
| 86 | `style.footer.stretch` | style | switchable | `auto` | **off** | **off** |
| 87 | `style.footer.gap` | style | switchable | ⟡ `footer-gap` | **off** | **off** |
| 88 | `style.card-icon.size` | style | switchable | **off** | **off** | `width: 24px; height: 24px` |
| 89 | `style.card-icon.color` | style | switchable | **off** | **off** | ⟡ `icon-color` |
| 90 | `style.group.box` | style | switchable | ⟡ `group-gap` | **off** | **off** |

<details><summary>Citations — 180 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.media` | salt | no dedicated part or rule — card.stories.tsx DefaultWithImage puts a bare <img aria-hidden alt=""> as a direct child of <Card> and lets the card's own overflow:hidden clip it |
| `structure.media` | shadcn | no dedicated part — card.tsx exports seven parts and none is media; the blocks place bare <img> children. Recorded as an absence, same as the other two columns |
| `structure.media` | m3 | no image token in any of the three card files in either edition — and the absence is deliberate, because the BANNER does tokenise its media. CITATION RE-POINTED BY THE v0.192 PIN: this note previously cited versions/latest/sass/_md-comp-banners-rich.scss (image.size 80px, image.shape corner-none), a file that does not exist in the pinned edition. The equivalent in versions/v0_192/_md-comp-banner.s |
| `structure.header` | salt | CardHeader.tsx + CardHeader.css (padding + flex-shrink:0, nothing else) |
| `structure.header` | shadcn | CardHeader — the most structured part of the three systems: a CSS grid with auto-rows-min, grid-rows-[auto_auto], items-start, a named container context and a conditional second column |
| `structure.header` | m3 | CONFIRMED ABSENCE — no header token |
| `structure.title` | salt | CONFIRMED ABSENCE — no title subcomponent is exported from card/index.ts; every story puts an <H3> inside CardHeader, so the headline is content formatting. Identical in kind to alert.salt.json's structure.title |
| `structure.title` | shadcn | CardTitle |
| `structure.title` | m3 | CONFIRMED ABSENCE — no headline/title token, unlike _md-comp-dialog.scss's headline-* family |
| `structure.description` | salt | CONFIRMED ABSENCE — the stories use <Text color="secondary"> inside CardHeader |
| `structure.description` | shadcn | CardDescription |
| `structure.description` | m3 | CONFIRMED ABSENCE — no supporting-text token |
| `structure.action` | salt | no dedicated part; the HeaderWithAction story composes <FlexLayout justify="space-between"> + <Button appearance="transparent"><CloseIcon/></Button> inside CardHeader — the same capability with no element of its own |
| `structure.action` | shadcn | CardAction — col-start-2 row-span-2 row-start-1 self-start justify-self-end, and its presence rewires the header to grid-cols-[1fr_auto] through `has-data-[slot=card-action]` |
| `structure.action` | m3 | CONFIRMED ABSENCE — no action token, unlike _md-comp-dialog.scss's action-* family |
| `structure.content` | salt | CardContent.tsx + CardContent.css |
| `structure.content` | shadcn | CardContent |
| `structure.content` | m3 | CONFIRMED ABSENCE — no content token |
| `structure.footer` | salt | CardFooter.tsx + CardFooter.css — display:flex, align-items:center, gap spacing-100 |
| `structure.footer` | shadcn | CardFooter |
| `structure.footer` | m3 | CONFIRMED ABSENCE — no footer/actions token |
| `structure.accent` | salt | Card.css .saltCard-accent::after + the four .saltCard-accent{Bottom,Top,Left,Right} rules; InteractableCard.css and LinkCard.css carry byte-equivalent copies |
| `structure.accent` | shadcn | CONFIRMED ABSENCE — no stripe, bar or leading-edge decoration of any kind |
| `structure.accent` | m3 | CONFIRMED ABSENCE |
| `structure.state-layer` | salt | CONFIRMED ABSENCE — Salt distinguishes its interaction states with elevation and border colour; there is no overlay element or alpha wash anywhere in the three card CSS files |
| `structure.state-layer` | shadcn | CONFIRMED ABSENCE — no overlay, and no interaction state to drive one |
| `structure.state-layer` | m3 | {hover,focus,pressed,dragged}-state-layer-{color,opacity} in all three variants; listed under $unsupported-tokens by material-web |
| `structure.card-icon` | salt | no card-level icon token or rule; a glyph inside a Salt card is ordinary consumer content |
| `structure.card-icon` | shadcn | CONFIRMED ABSENCE — no card-level icon part or class |
| `structure.card-icon` | m3 | icon-size 24px + icon-color primary — the only sub-part any M3 card token file describes; both listed under $unsupported-tokens by material-web |
| `structure.group` | salt | interactable-card/InteractableCardGroup.tsx + .css + InteractableCardGroupContext.tsx |
| `structure.group` | shadcn | CONFIRMED ABSENCE — no card group, no selection container |
| `structure.group` | m3 | CONFIRMED ABSENCE — no group or selection container token |
| `structure.sectioning` | salt | Card.tsx calls hasCardSection(children) -> hasCardSection.ts tests `child.type === CardHeader\|CardContent\|CardFooter` over Children.toArray, adding .saltCard-sectioned; Card.css then states the SAME rule twice, once for that class and once inside `@supports selector(:has(*))` keyed off `:has(> .saltCardHeader, > .saltCardContent, > .saltCardFooter)` |
| `structure.sectioning` | shadcn | there is no detection: the card unconditionally carries `py-6 gap-6` and every section unconditionally carries `px-6`. A shadcn card therefore NEVER has horizontal padding of its own, and bare (unsectioned) children sit flush to its border — the exact inverse of Salt, whose card pads itself until it finds sections |
| `structure.sectioning` | m3 | there are no section tokens at all, so an M3 card is one padded box; nothing to detect and nothing to hand padding to |
| `behavior.role` | salt | Card.tsx sets no role at all. InteractableCard.tsx: `role = interactableCardGroup ? (multiSelect ? "checkbox" : "radio") : "button"`, with `aria-checked` written only for the radio/checkbox readings. LinkCard.tsx renders a real <a href>. Three components, five roles |
| `behavior.role` | shadcn | CONFIRMED ABSENCE — card.tsx writes data-slot and className and nothing else. Not a container role, not a region, nothing |
| `behavior.role` | m3 | [R] — tokens-only clone, no card element to grep. The state-layer family (present in BOTH editions) says an M3 card CAN be a control; APG makes a clickable card a button. NOTE the focus-indicator family, which used to be half of this argument, does not exist in the pinned v0.192 edition |
| `behavior.tab-stop` | salt | InteractableCard.tsx's four-branch tabIndex block; useInteractableCard.ts additionally returns `tabIndex: disabled ? -1 : 0` for the standalone case. The single-select fallback is `if (!interactableCardGroup.value && isFirstChild) tabIndex = 0` |
| `behavior.tab-stop` | shadcn | the card is never focusable; only its consumer-supplied children are |
| `behavior.tab-stop` | m3 | [R] — no element exists. Under the previous latest pin the argument was that a focus-indicator token implies a focusable element; that token family is gone under the v0.192 pin, so the argument now rests on the state-layer family (which includes focus-state-layer-color/-opacity in BOTH editions) plus the fact that material-web ships an md-focus-ring element for exactly this purpose. Weaker evidenc |
| `behavior.keyboard-activation` | salt | useInteractableCard.ts handleKeyDown: `if (event.key === "Enter" \|\| event.key === " ") { setkeyIsDown; preventDefault(); setActive(true); onClick(event) }` — activation fires on KEYDOWN. LinkCard binds no key handler: it is a native anchor, so Enter navigates and SPACE DOES NOTHING. accessibility.mdx states both halves |
| `behavior.keyboard-activation` | shadcn | no key handler anywhere in the file |
| `behavior.keyboard-activation` | m3 | [R] per APG's button pattern; nothing in the clone to grep |
| `behavior.pointer-activation` | salt | useInteractableCard.ts `onClick: !disabled ? handleClick : undefined` — a disabled card has NO handler rather than a handler that returns early. InteractableCard.tsx's own handleClick additionally calls interactableCardGroup.select(event, value) and flips local selected state |
| `behavior.pointer-activation` | shadcn | no click handler anywhere in the file |
| `behavior.pointer-activation` | m3 | [R] |
| `behavior.active-flag` | salt | useInteractableCard.ts's `active` state + its setTimeout(...,0) effect, whose comments cite Enter producing both key and click events and Firefox failing to enter :active on Space. InteractableCard.tsx applies .saltInteractableCard-active only when role === "button" |
| `behavior.active-flag` | shadcn | no pressed state to track |
| `behavior.active-flag` | m3 | no JS flag exists in a tokens-only clone. M3's pressed layer is a ripple in the real library; the chassis drives its pressed rows from its own data-active flag so a keyboard activation is visible — DECLARED (docs/CARD-MATRIX.md declared approximation 3) |
| `behavior.disabled-handling` | salt | useInteractableCard.ts cardProps `"aria-disabled": disabled ? true : undefined`; InteractableCard.css `.saltInteractableCard-disabled div { pointer-events: none }`; InteractableCardGroup.tsx's element query is `querySelectorAll('.saltInteractableCard:not([disabled])')`, so a disabled card is filtered out of the arrow ring |
| `behavior.disabled-handling` | shadcn | CONFIRMED ABSENCE — no disabled prop, class, attribute or utility on any part |
| `behavior.disabled-handling` | m3 | disabled TOKENS exist [S] (see the disabled-is-two-mechanisms provenance entry) but material-web disowns them and there is no element, so the DOM handling is [R] |
| `behavior.nested-interactive` | salt | site/docs/components/card/usage.mdx: "A default card can contain any UI element, including actionable components"; "Link cards shouldn't contain actionable components (like buttons or links), as the card itself is the interactive element"; "Interactable cards ... allow the user to embed these elements within for visual affordance" |
| `behavior.nested-interactive` | shadcn | the one unambiguous answer of the three systems: a shadcn card is always a container of focusable children and never a control itself — card-demo puts a Button in CardAction and two more in CardFooter |
| `behavior.nested-interactive` | m3 | no element exists to ask. Recorded as unanswerable rather than guessed, because this is the one question where guessing wrong is an accessibility defect rather than a visual one |
| `behavior.group-navigation` | salt | InteractableCardGroup.tsx handleKeyDown: Space always selects; and `if (!multiSelect)` ArrowDown/ArrowRight -> select(next) then elements[next].focus(), ArrowUp/ArrowLeft -> select(prev) then focus, both with wrap-around modular arithmetic. There is NO manual mode — arrowing selects. Multi-select has no arrow branch at all |
| `behavior.selection` | salt | InteractableCardGroup.tsx's useControlled value + select()/isSelected(); multiSelect toggles array membership, single-select replaces and fires onChange only `if (value !== newValue)` |
| `prop.variant` | salt | Salt has no elevated/filled/outlined mechanism axis. Its own multi-value prop is a container TONE ladder and is modelled as prop.container-tone — see that row's note for why the two are not merged |
| `prop.variant` | shadcn | CONFIRMED ABSENCE — card.tsx has no cva, no variants object and no props beyond React.ComponentProps<"div">. One card, one appearance. The sibling `bases/radix` file DOES add a size prop; see the sibling-base-recorded-not-imported provenance entry |
| `prop.variant` | m3 | three generated token files, three mechanisms: a level-1 shadow over surface-container-low; a flat fill of surface-container-highest with no shadow; plain surface with a 1px outline-variant stroke and no shadow. NO SOURCE DEFAULT EXISTS — material-web ships three peer elements and neither the token files nor its wrappers name one as primary, so the list is in the spec's own published order and the |
| `prop.container-tone` | salt | Card.tsx `variant?: "primary" \| "secondary" \| "tertiary" \| "ghost"` with `variant = "primary"` destructured as the default — DEFAULT-FIRST. ASYMMETRY RECORDED: InteractableCard.tsx and LinkCard.tsx each declare `variant?: "primary" \| "secondary" \| "tertiary"` — ghost exists on the plain Card only |
| `prop.container-tone` | m3 | M3 has no tone ladder — the container colour is decided by the variant, not by a separate axis |
| `prop.accent-placement` | salt | Card.tsx / InteractableCard.tsx / LinkCard.tsx `accent?: "bottom" \| "top" \| "left" \| "right"`. THE CODE SETS NO DEFAULT — the accent classes are applied only `if (accent)`. Card.css's comment `/* Styles applied to Card if accent="bottom" (default) */` and InteractableCard.tsx's JSDoc `defaults to "bottom"` both claim one; the code wins, and bottom is listed first only because it is the value th |
| `prop.interaction` | salt | three exported components, listed default-first: Card (the unqualified export the docs open with) / InteractableCard / LinkCard. Card's own `interactable` prop reaches a deprecated in-file styling branch (.saltCard-interactable) that Card.tsx marks **Deprecated: Use the InteractableCard component instead** and that has no role, no tabIndex and no key handling — it is a styling flag only, and is re |
| `prop.interaction` | shadcn | single-valued and confirmed: there is no interactive card in card.tsx and no sibling file in the new-york-v4 registry provides one |
| `prop.interaction` | m3 | static first: every interaction token is state-qualified (hover-*, focus-*, pressed-*) and the unqualified enabled state is the base reading. `button` is carried because the state-layer and hover-elevation families are real, sourced in BOTH editions, and would otherwise be unreachable in the harness (the focus-indicator family that used to be cited here alongside them is latest-only and unreachabl |
| `prop.selection-mode` | salt | InteractableCardGroup.tsx `multiSelect?: boolean`, undefined by default, so single-select is the source default and is listed first. It drives the group role (radiogroup vs group), the card role (radio vs checkbox), the tab-stop regime and whether arrows navigate |
| `prop.disabled` | salt | InteractableCard.tsx `disabled?: boolean`, also inheritable from InteractableCardGroup's own `disabled` through context. A capability list — the skeleton reads the per-instance prop, never value[0]. Card's identically-named prop is deprecated (see the unused-disabled-tokens provenance entry) |
| `prop.disabled` | m3 | disabled-container-opacity 0.38 (elevated, filled) and disabled-outline-color/-opacity 0.12 (outlined), plus disabled-container-color and disabled-container-elevation. A capability list. All of it under $unsupported-tokens |
| `prop.hoverable` | salt | Card.tsx `hoverable?: boolean` (no default, i.e. false) -> .saltCard-hoverable, which grants the hover elevation and accent border to a card that has no role, no tab stop and no handler. A capability list |
| `prop.hoverable` | m3 | hover styling is a property of being interactive; there is no decorative opt-in |
| `slot.title` | salt | DECLARED COMPOSITION to `text` — the stories' <H3> |
| `slot.description` | salt | DECLARED COMPOSITION to `text` — the stories' <Text color="secondary"> |
| `slot.action` | salt | no dedicated part; the affordance is composed inside CardHeader |
| `slot.action` | shadcn | DECLARED COMPOSITION to `button` — card-demo puts <Button variant="link">Sign Up</Button> here |
| `slot.footer` | salt | DECLARED COMPOSITION to `button` / `link` |
| `slot.footer` | shadcn | DECLARED COMPOSITION to `button` — card-demo puts two full-width Buttons here and has to add `flex-col gap-2` per instance because CardFooter has no gap of its own |
| `state.rest` | salt | unconditional — even a static, non-hoverable Salt card is lifted |
| `state.rest` | shadcn | so a light-mode shadcn card is separated from its background by border and shadow alone |
| `state.rest` | m3 | per prop.variant |
| `state.hover` | salt | @media (hover: hover) { .saltCard-hoverable:hover, .saltInteractableCard:hover, .saltLinkCard:hover } |
| `state.hover` | shadcn | CONFIRMED ABSENCE |
| `state.hover` | m3 | and the outlined variant's STROKE does not move: hover-outline-color is outline-variant, the same as at rest |
| `state.focus` | salt | .saltInteractableCard:focus-visible / .saltLinkCard:focus-visible; the LinkCard rule also reassigns --linkCard-accent-color to a value identical to the one it replaces |
| `state.focus` | shadcn | CONFIRMED ABSENCE, with a structural cause — the card is never focusable |
| `state.focus` | m3 | VALUE CHANGED BY THE v0.192 PIN: the state layer was 10% under latest's md-sys-state, and versions/v0_192/_md-sys-state.scss says focus-state-layer-opacity 0.12. The ring itself is unchanged in value but its source moved from the card own focus-indicator family (latest-only) to the edition-independent tokens/_md-comp-focus-ring.scss — see provenance.focus-indicator. Still the OUTWARD offset, where |
| `state.pressed` | salt | .saltInteractableCard-selected, .saltInteractableCard:active, .saltInteractableCard-active share one block; .saltLinkCard:active is the same idea plus cursor-active |
| `state.pressed` | shadcn | CONFIRMED ABSENCE |
| `state.pressed` | m3 | the same direction as Salt's press, by a different mechanism |
| `state.selected` | salt | the same shared declaration block — a selected Salt card and a pressed one cannot be told apart by sight |
| `state.selected` | shadcn | CONFIRMED ABSENCE |
| `state.selected` | m3 | CONFIRMED ABSENCE — no selected token in any card file |
| `state.disabled` | salt | .saltInteractableCard-disabled and its four re-statements (:focus, :focus-visible, :hover, :active) so no interaction rule can win |
| `state.disabled` | shadcn | CONFIRMED ABSENCE |
| `state.disabled` | m3 | two mechanisms; the second is declared, not modelled |
| `style.surface.background` | salt | variant="primary" (the default), read through the indirection the tone rows reassign |
| `style.surface.background` | m3 | variant=elevated (value[0]), read through the indirection the variant rows reassign |
| `style.surface.color` | salt | CONFIRMED ABSENCE — Card.css declares no `color` outside the deprecated disabled rule; a Salt card inherits its text colour |
| `style.surface.color` | shadcn | the only system that colours its card's text; the value is identical to --foreground in both modes, so it pins rather than changes |
| `style.surface.color` | m3 | CONFIRMED ABSENCE — no text colour token on any card variant, only an icon colour |
| `style.surface.font` | salt | CONFIRMED ABSENCE — no font-family, size, weight or line-height in any of the six Salt card CSS files |
| `style.surface.font` | shadcn | CONFIRMED ABSENCE — the Card sets no type size; only CardDescription does |
| `style.surface.font` | m3 | CONFIRMED ABSENCE — no typescale token in any card file |
| `style.surface.border-width` | salt | Card.css `border-width: var(--saltCard-borderWidth, var(--salt-size-fixed-100))` = 1px, FIXED scale, density-invariant by design |
| `style.surface.border-width` | shadcn | bare `border` — Tailwind's undeclared 1px default |
| `style.surface.border-width` | m3 | 0 on elevated and filled; the outlined row raises it to outline-width = 1px — the mechanism axis expressed as a width |
| `style.surface.border-color` | salt | identical in all four tones — verified by reading all four .saltCard-{variant} rules |
| `style.surface.border-color` | m3 | transparent on elevated and filled; the outlined row swaps it for outline-variant |
| `style.surface.shape` | shadcn | `rounded-xl` -> --radius-xl = --radius * 1.4 = 0.875rem |
| `style.surface.shape` | m3 | container-shape -> md-sys-shape.$corner-medium, identical in all three variants and both editions |
| `style.surface.padding` | salt | Card.css `padding: var(--saltCard-padding, var(--card-padding))` with `--card-padding: var(--salt-spacing-200)` declared on the same element |
| `style.surface.padding` | shadcn | `py-6` and NO px utility on the Card — the horizontal padding lives on the sections |
| `style.surface.padding` | m3 | [R] DECLARED BORROW from m3.material.io's published card spec — none of the three card token files carries a spacing token in either edition. The single [R] layout number in this column; no token name invented for it |
| `style.surface.padding@sectioned` | salt | Card.css `.saltCard.saltCard-sectioned { padding: 0 }` and the `:has()` copy — the card hands its padding to its sections |
| `style.surface.padding@sectioned` | shadcn | OFF deliberately, and it is the difference between "always" and "detected": shadcn's py-6 SURVIVES sectioning, where Salt's padding is handed over entirely |
| `style.surface.padding@sectioned` | m3 | no sections exist |
| `style.surface.gap` | salt | CONFIRMED ABSENCE, with a visible consequence: Salt spaces its sections by collapsing the follower's top padding (style.content/footer.padding@adjacent), so its sections BUTT TOGETHER at zero gap where shadcn's sit 24px apart |
| `style.surface.gap` | shadcn | `gap-6` between every direct child of the card — a real gap, where Salt collapses the follower's top padding instead |
| `style.surface.gap` | m3 | no sections and no gap token |
| `style.surface.overflow` | salt | Card.css / InteractableCard.css / LinkCard.css `overflow: hidden` — it clips consumer media to the corner radius AND clips the accent bar's own -1px overhang straight back off |
| `style.surface.overflow` | shadcn | CONFIRMED ABSENCE — a shadcn card does NOT clip its media to its 14px corners |
| `style.surface.overflow` | m3 | no token |
| `style.surface.elevation` | shadcn | [R] value, see the shadow-sm provenance entry |
| `style.surface.elevation` | m3 | [R] CSS derived from container-elevation (level1 elevated / level0 filled and outlined) + container-shadow-color #000; see the surface-elevation provenance entry |
| `style.surface.transition` | salt | Card.css `transition: box-shadow var(--salt-duration-instant) ease-in-out`; foundations/duration.css defines duration-instant as 0ms, so the declared transition has no duration. Reproduced as source has it. (.saltCard-interactable then overrides it to `none` outright.) |
| `style.surface.transition` | shadcn | CONFIRMED ABSENCE — no transition utility, and nothing to transition to |
| `style.surface.transition` | m3 | CONFIRMED ABSENCE — no motion token in any card file, so no transition is claimed even though the elevation demonstrably changes on hover |
| `style.surface.focus` | salt | `.saltInteractableCard:focus-visible` / `.saltLinkCard:focus-visible` — the ring AND a lift to the hover shadow |
| `style.surface.focus` | m3 | tokens/_md-comp-focus-ring.scss $width 3px / $color md-sys-color.secondary / $outward-offset 2px — SOURCE RE-POINTED BY THE v0.192 PIN, values identical to the card focus-indicator family it replaces (see provenance.focus-indicator). border-color reproduces focus-outline-color -> on-surface, which is an outlined-variant token; on elevated and filled the border width is 0 so the recolour is invisib |
| `style.surface.elevation@hover` | salt | @media (hover: hover): `.saltCard-hoverable:hover`, `.saltInteractableCard:hover`, `.saltLinkCard:hover` — shadow-hover + actionable-accented-borderColor-hover + cursor-hover |
| `style.surface.elevation@hover` | m3 | hover-container-elevation: level2 (elevated) / level1 (filled, outlined). No cursor token exists in M3, so unlike Salt this row sets no cursor |
| `style.surface.pressed` | salt | `.saltInteractableCard:active, .saltInteractableCard-active` — box-shadow returns to overlayable-shadow and the border goes to actionable-accented-borderColor-active (the same value as -hover) |
| `style.surface.pressed` | m3 | pressed-container-elevation returns to each variant's RESTING level (1/0/0) from the hovered level (2/1/1) — an M3 card settles back down under the finger |
| `style.surface.selected` | salt | `.saltInteractableCard-selected` shares the declaration block above verbatim |
| `style.surface.disabled` | salt | `.saltInteractableCard-disabled` + its :focus/:focus-visible/:hover/:active restatements |
| `style.surface.disabled` | m3 | disabled-container-opacity 0.38 (elevated, filled). Specified by M3 as the CONTAINER's opacity and applied here to the element, since there is no separate container node. The outlined variant's different mechanism is declared, not modelled |
| `style.surface.pointer-events@disabled` | salt | `.saltInteractableCard-disabled div { pointer-events: none }` — the descendants, not the card, so the card can still show its not-allowed cursor |
| `style.surface.pointer-events@disabled` | m3 | no such rule; Salt's descendant pointer-events trick is Salt's alone |
| `style.surface.variant@filled` | m3 | _md-comp-filled-card.scss: container-color surface-container-highest, container-elevation level0, hover-container-elevation level1. A FILL replaces the shadow — a different mechanism, not a colour delta |
| `style.surface.variant@outlined` | m3 | _md-comp-outlined-card.scss: container-color surface (no tonal lift), container-elevation level0, outline-width 1px, outline-color outline-variant. A STROKE replaces the shadow — the third mechanism |
| `style.surface.tone@secondary` | salt | .saltCard-secondary { background: var(--salt-container-secondary-background) } — marble / granite |
| `style.surface.tone@tertiary` | salt | .saltCard-tertiary — limestone / leather |
| `style.surface.tone@ghost` | salt | .saltCard-ghost { background: var(--salt-container-ghost-background) } -> palette-alpha-medium: 30% WHITE light / 30% BLACK dark — the tone inverts, and it is the only translucent one. Card only; InteractableCard and LinkCard do not declare it |
| `style.state-layer.rest` | m3 | {hover,focus,pressed}-state-layer-color -> on-surface in all three variants — one colour, so the interaction rows only move the opacity |
| `style.state-layer.opacity@hover` | m3 | versions/v0_192/_md-sys-state.scss hover-state-layer-opacity: 0.08 — identical in both editions, so the pin does not move it (unlike focus and pressed beside it) |
| `style.state-layer.opacity@focus` | m3 | versions/v0_192/_md-sys-state.scss focus-state-layer-opacity: 0.12. VALUE CHANGED BY THE PIN — was 0.1, from versions/latest/sass/_md-sys-state.scss $focus-state-layer-opacity. docs/foundations/state-layers.md already tabulates 0.12 for M3, so the foundations page and this cell now agree. |
| `style.state-layer.opacity@pressed` | m3 | versions/v0_192/_md-sys-state.scss pressed-state-layer-opacity: 0.12. VALUE CHANGED BY THE PIN — was 0.1, from versions/latest/sass/_md-sys-state.scss $pressed-state-layer-opacity. docs/foundations/state-layers.md already tabulates 0.12 for M3. |
| `style.accent.box` | salt | Card.css `.saltCard-accent::after { background-color: var(--saltCard-accent-color, var(--card-accent-color)) }` with `--card-accent-color: var(--salt-sentiment-accent-background)` |
| `style.accent.placement@bottom` | salt | .saltCard-accentBottom::after |
| `style.accent.placement@top` | salt | .saltCard-accentTop::after |
| `style.accent.placement@left` | salt | .saltCard-accentLeft::after |
| `style.accent.placement@right` | salt | .saltCard-accentRight::after |
| `style.accent.color@focus` | salt | reproduced faithfully AND flagged: selectable-foreground-hover and sentiment-accent-background both resolve to palette-accent, so this declared recolour changes nothing |
| `style.media.box` | salt | no rule for card media anywhere — the clipping comes from the CARD's overflow:hidden |
| `style.media.box` | shadcn | no media part and no rule |
| `style.header.padding` | salt | CardHeader.css `padding: var(--saltCardHeader-padding, var(--salt-spacing-200))` |
| `style.header.padding` | shadcn | CardHeader `px-6`; the card's own py-6 supplies the block padding |
| `style.header.gap` | salt | CardHeader.css declares padding and flex-shrink and nothing else; the internal rhythm is a consumer StackLayout |
| `style.header.gap` | shadcn | CardHeader `gap-2` — between the title row and the description row of its grid |
| `style.title.type` | shadcn | CardTitle `leading-none font-semibold` — there is NO font-size, so a shadcn card title matches the surrounding text size and is distinguished by weight and leading alone. Contrast its own DialogTitle, which carries text-lg |
| `style.description.type` | shadcn | CardDescription `text-sm` — the only type size in the whole component in any of the three systems |
| `style.description.color` | shadcn | CardDescription `text-muted-foreground` |
| `style.content.padding` | salt | CardContent.css `padding: var(--saltCardContent-padding, var(--salt-spacing-200))` |
| `style.content.padding` | shadcn | CardContent `px-6` |
| `style.content.padding@adjacent` | salt | CardContent.css `.saltCard-sectioned > .saltCardHeader + .saltCardContent, .saltCard-sectioned > .saltCardContent + .saltCardContent { padding-top: 0 }`, restated for LinkCard and InteractableCard and again inside `@supports selector(:has(*))` |
| `style.content.padding@adjacent` | shadcn | not needed — shadcn separates its sections with the card's own gap-6 rather than by collapsing padding |
| `style.content.stretch` | salt | CardContent.css `.saltCard-sectioned > .saltCardContent { flex: 1 1 auto }` — the EqualHeightSections story is the demonstration |
| `style.content.stretch` | shadcn | CONFIRMED ABSENCE — CardContent has no flex utility, so a shadcn card in a row of unequal cards does not stretch its body to align the footers the way a Salt one does |
| `style.footer.padding` | salt | CardFooter.css `padding: var(--saltCardFooter-padding, var(--salt-spacing-200))` |
| `style.footer.padding` | shadcn | CardFooter `px-6` |
| `style.footer.padding@adjacent` | salt | CardFooter.css `.saltCard-sectioned > .saltCardHeader + .saltCardFooter, .saltCard-sectioned > .saltCardContent + .saltCardFooter { padding-top: 0 }` — note the source lists header and content only, NOT footer-after-footer |
| `style.footer.stretch` | salt | CardFooter.css `.saltCard-sectioned > .saltCardFooter { flex-shrink: 0; margin-top: auto }` |
| `style.footer.stretch` | shadcn | OFF deliberately — no source rule pins shadcn's footer to the bottom, and inventing one would change where it sits in a card with an explicit height |
| `style.footer.gap` | salt | CardFooter.css `gap: var(--salt-spacing-100)` |
| `style.footer.gap` | shadcn | CONFIRMED ABSENCE — CardFooter is `flex items-center px-6` with no gap; card-demo has to add `flex-col gap-2` per instance to space two buttons |
| `style.card-icon.size` | m3 | icon-size 24px, density-invariant (M3 has no density capability — docs/foundations/density.md) |
| `style.card-icon.color` | m3 | icon-color -> md-sys-color.$primary — deliberately NOT a text role, so a currentColor glyph would be wrong here |
| `style.group.box` | salt | InteractableCardGroup.css `gap: var(--salt-spacing-200)`; its display/flex-direction/flex-wrap are chassis layout in the template's base |

</details>

<!-- END GENERATED VALUES -->
