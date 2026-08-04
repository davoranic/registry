# Badge — component template matrix

*Eleventh live component in the post-clean-slate pipeline (button, calendar,
spinner, tooltip, alert, input, select, dialog, tabs, card came before). Same
method as [CARD-MATRIX.md](CARD-MATRIX.md) / [TABS-MATRIX.md](TABS-MATRIX.md) /
[DIALOG-MATRIX.md](DIALOG-MATRIX.md) / [SELECT-MATRIX.md](SELECT-MATRIX.md) /
[ALERT-MATRIX.md](ALERT-MATRIX.md): one master template (union of all six
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

**This is a SMALL component and the matrix is deliberately short.** Badge has
**5 structure rows, 5 prop rows, 6 behavior rows, 4 slot rows, 3 state rows
and 27 style rows — 50 in all** — against card's 51-row style block alone. Where a segment is
thin it says so rather than being padded, and three of its most useful cells
are **confirmed absences**: no system gives a badge any ARIA, no system gives
it a disabled/pressed/selected state, and only one of the three gives it a
hover.

**Badge is the fourth component to ship the third gate.**
`scripts/check-badge-behavior.mjs` follows `check-card-behavior.mjs`'s contract
exactly, with **one deliberate inversion** — see finding 11 — and repeats the
same honest closing caveat: it proves code **exists and is bound**, not that it
**runs** or that it is **correct**.

**The headline of this matrix.** A badge is the smallest component in the
registry and it is the one where **the component decides its own shape from
what you did not pass**. A Salt badge with no `value` is a dot; a Salt badge
with a child anchors itself to that child's top-right corner. Neither is a
prop. And the second axis, dot-versus-labelled, is not a size variant: M3
tokenises it as **6px against 16px** with two parallel token families in one
file, and Salt anchors the two forms at **two different offsets**.

---

## Scope note

### What is in scope

- **Salt** `packages/core/src/badge/` — all three files (`Badge.tsx`,
  `Badge.css`, `index.ts`); 90 lines of CSS and one component. Plus
  `packages/core/stories/badge/{badge.stories.tsx,badge.qa.stories.tsx}` and
  `site/docs/components/badge/{index,usage,examples,accessibility}.mdx` for
  defaults, composition and the documented contract.
- **shadcn** `apps/v4/registry/new-york-v4/ui/badge.tsx` — one element, one
  `cva` with **six** variants, `asChild`. Examples read for composition.
- **Material 3** `tokens/versions/latest/sass/_md-comp-badge.scss` — **one
  file**, and it is the whole component. It carries **two token families**:
  the unprefixed `size` / `shape` / `color` (a 6px dot) and the `large-*`
  family (a 16px labelled container plus its own label typescale). Per the
  brief, that is a **variant axis, not two components** — and source agrees,
  because they share a file, a colour role and a shape token. Plus
  `tokens/versions/v0_192/_md-comp-badge.scss` for the edition diff and
  material-web's own `tokens/_md-comp-badge.scss` for what the shipped library
  supports.

### What is out of scope, and why (structural reasons, declared not dropped)

| excluded | where | structural reason |
|---|---|---|
| `chip` / `tag` / `pill` | `docs/COMPONENTS.md` line 111 (`tag / pill`), still to be built | Its own canonical row across all three systems: Salt ships `packages/core/src/{tag,pill}`, M3 ships the four-member chip family (assist/filter/input/suggestion). And **Salt's own docs draw the boundary for us, three times**, in `badge/usage.mdx`'s "When not to use": use `Pill` "to trigger an immediate action", use `Pill` "to communicate status through color, such as red/amber/green", use `Tag` "to communicate read-only metadata that categorizes or groups content". A badge is non-interactive, single-coloured and system-driven; a chip is interactive, multi-toned and user-driven. `badge/index.mdx` also lists Tag and Pill under `relatedComponents: [{ relationship: "similarTo" }]` — ***similar to*, not the same as** [S]. |
| Salt `status-indicator`, `status-adornment` | `packages/core/src/{status-indicator,status-adornment}`, `docs/COMPONENTS.md` line 64 | Salt **does** ship them separately, exactly as the brief suspected, and they have their own canonical row (`status indicator/adornment`). Structurally different: they are **icon + semantic colour** driven by a four-value `ValidationStatus` (info/error/warning/success), i.e. the tone axis a badge deliberately does not have. `alert.salt.json` already consumes `StatusIndicator` for its leading glyph, so modelling it here would double-count it — the same exclusion INPUT-MATRIX.md made for `search-input` [S]. |
| shadcn `AvatarBadge` | `apps/v4/examples/*/avatar-badge.tsx`, imported from `ui/avatar` | **This is shadcn's anchored dot, and it is a part of `avatar`, not of `badge`** — a different export from a different file on a different `docs/COMPONENTS.md` row (`avatar`). Recording it here rather than dropping it, because it is the reason shadcn's badge column can honestly say "no dot, no anchoring" without that being a coverage hole [S]. |
| shadcn `SidebarMenuBadge` | `apps/v4/examples/*/sidebar-menu-badge.tsx` | A `sidebar` part, same treatment [S]. |
| M3 `navigation-bar` / `navigation-rail` badge families | `_md-comp-navigation-{bar,rail}.scss`, `latest` only | The **host's** placement tokens, and every one of them is `@deprecated` with the comment *"Badge values were refactored out into their own token set. Replace usage with the equivalent `md.comp.badge.*` tokens."* Recorded as the strongest available evidence that M3 itself treats badge as a canonical standalone component — and as an edition finding, because they carry the **pre-refactor shapes 3px / 8px**, not `corner-full` (finding 4) [S]. |
| M3 `navigation-drawer` `large-badge-label-*` | `_md-comp-navigation-drawer.scss` | A **different badge**, and NOT deprecated: its colour is `on-surface-variant` and its type is `label-large`, i.e. a drawer's trailing count is plain ambient text with no error container at all. The drawer's own slot, not this component [S]. |
| Salt `Badge` composed inside a Salt tab | `stories/badge/badge.stories.tsx` `InlineBadge`, and `docs/TABS-MATRIX.md`'s `structure.tab-badge` row | Already recorded from the other side, in tabs. Carried here as DECLARED COMPOSITION rather than as a badge feature [S]. |
| shadcn's `aria-invalid:*` block | the `cva` base string | shadcn's shared focus/invalid group, pasted verbatim into a component that is never a form control. Declared out of scope: no badge in any of the three systems has a validation state, so there is no cross-system row to hang it on — the same scope trim `input.shadcn.json` made for its `file:` and `selection:` groups [S]. |

---

## Sources

- **Salt** [S]: `packages/core/src/badge/{Badge.tsx,Badge.css,index.ts}`;
  `packages/core/stories/badge/{badge.stories.tsx,badge.qa.stories.tsx}`;
  `site/docs/components/badge/{index,usage,examples,accessibility}.mdx`;
  `packages/theme/css/next/characteristics/{text,sentiment,content}.css`;
  `packages/theme/css/next/palette/{accent,foreground,corner}.css`;
  `packages/theme/css/next/foundations/color.css`;
  `packages/theme/css/foundations/{size,spacing,curve,typography,zindex}.css`.
  Reused rather than re-derived:
  `docs/foundations/{typography,sizes,spacing,shape,colors,density,layers}.md`.
- **shadcn** [S]: `apps/v4/registry/new-york-v4/ui/badge.tsx` (canonical, sole
  source for every style cell); `apps/v4/app/globals.css` (token values);
  `apps/v4/registry/new-york-v4/examples/badge-{demo,secondary,destructive,outline}.tsx`;
  `apps/v4/examples/radix/badge-{variants,icon,link}.tsx`. Read only to fix the
  boundary: `apps/v4/registry/bases/{radix,base,aria}/ui/badge.tsx` and
  `apps/v4/content/docs/components/radix/badge.mdx`, plus
  `apps/v4/examples/radix/avatar-badge.tsx`.
- **Material 3** [S]: `tokens/versions/latest/sass/_md-comp-badge.scss`;
  `tokens/versions/v0_192/_md-comp-badge.scss` (edition diff); the
  hand-authored `tokens/_md-comp-badge.scss`;
  `versions/latest/sass/{_md-sys-color.scss,_md-sys-color__dark.scss,_md-ref-palette.scss,_md-sys-typescale.scss,_md-ref-typeface.scss,_md-sys-shape.scss}`;
  and, for the scope note,
  `versions/latest/sass/_md-comp-navigation-{bar,rail,drawer}.scss`.
  **material-web is a tokens-only clone**, so every M3 structure and behavior
  row is `[R]` and every style cell is `[S]`.

### Edition pin — `versions/latest`, and this time it really is a no-op

Pinned to **`tokens/versions/latest/sass`**, matching spinner, tooltip, alert,
input, select, dialog, tabs and card; calendar and button remain on `v0.192`.
The tally becomes **9 latest / 2 v0.192** — the minority shrinks for the fifth
component running, the split is still open, and it still wants one
registry-wide decision. **Flagged for the owner for the ninth time.**

A full mechanical key/value diff of `_md-comp-badge.scss` across the two
editions finds:

1. **Zero divergences of any kind.** Same thirteen tokens, same values, same
   dependency resolution (`error`, `on-error`, `label-small-*`, `corner-full`,
   6px, 16px). The only difference is in **form**: `latest` emits
   `large-label-text-type` as a `@mixin`, `v0_192` emitted it as a composite
   value with a fidelity warning attached.
2. So the pin **changes no modelled cell**, unlike card (where `latest`
   supplied the only focus indicator an M3 card has) and tabs (same).

**The counter-argument, weighed rather than hidden.** material-web's own
`tokens/_md-comp-badge.scss` does `@use 'versions/v0_192/md-comp-badge'` — the
shipped library pins v0.192 for this exact component, exactly as it does for
card and for tabs. Here that argument **carries no weight in either
direction**, for two independent reasons: the two editions are value-identical,
and the library's one substantive act — dropping `large-label-text-tracking`
and `large-label-text-type` through `$_unsupported-tokens` — happens in the
**edition-independent wrapper** and would apply whichever edition were pinned.
`latest` is taken for registry consistency, and the reasoning is written down
so the choice is not mistaken for indifference.

**No borrow was declared.** Card had to borrow one 16px padding from
m3.material.io because its token files carry no spacing. Badge's file carries
none either — and here **nothing was borrowed**, because "a fixed 16px box with
no padding" is a coherent reading of what the tokens actually say. The visible
consequence (a label wider than 16px has nothing to breathe into) is left
visible in the harness rather than papered over. **No token name was invented.**

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| pill | 🔒 (invariant) | on — `.saltBadge-badge`, the inner span, carrying every box style [S] | on — `Badge`, the only element [S] | on — `container` (unprefixed) / `large` container [S] |
| **shell** | 🔒 | **`wrapper`** — `Badge.tsx` ALWAYS renders two spans; the outer `.saltBadge` is `position: relative` and exists so the inner one can be absolutely positioned out of it. Even an inline Salt badge renders both [S] | **`single`** — one element, no wrapper, nothing to position against [S] | **`single`** [R] — no element in the clone; the token file describes a container and a label and no positioning context |
| **label format** | 🔒 | **`clamped-value`** — the label is NOT children. `value?: number \| string` + `max?: number` (default 999), and the component formats the string itself [S] | **`children`** — and its own demo has to hand-roll the counter look with `className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"`, i.e. the numeric shape is consumer CSS [S] | **`children`** [R] — `large-label-text-*` describes the TYPE of a label and nothing about its source |
| **dot** | ⚪ | **on** — `.saltBadge-dotBadge`; `size-adornment` instead of the notation line-height, `padding: 0`, and a **redeclared `--badge-size` on the pill itself** [S] | **OFF — confirmed absence.** No dot form. shadcn's anchored dot is `AvatarBadge`, a part of `avatar` [S] | **on** — `size: 6px` against `large-size: 16px`, two parallel families in one file [S] |
| **anchoring** | ⚪ | **on** — `.saltBadge-topRight`; absolute, `right: spacing-100`, `translateX(100%) translateY(-badge-size/2)`, with a **different offset for the dot** [S] | **OFF — confirmed absence.** No position, inset or translate utility [S] | **OFF, for a structural reason** — M3 badges do anchor, but the geometry lives on the HOST and is `@deprecated` there; `_md-comp-badge.scss` is placement-agnostic [S] |
| icon | ⚪ | **OFF** — no icon rule and no gap; the pill's only content is the formatted value [S] | **on** — `gap-1`, `[&>svg]:size-3`, `[&>svg]:pointer-events-none` [S] | **OFF** — no icon token [S] |

### The two axes that were nearly smoothed over

**A dot and a labelled badge are two SHAPES, not one shape resized.** M3 says
so with numbers — `size: 6px` versus `large-size: 16px`, plus a whole parallel
`large-label-text-*` typescale that the dot has no use for. Salt says so with
**two different anchoring offsets**: a labelled badge sits `spacing-100` in
from the host's right edge, a dot sits `calc(size-adornment / 2)` in. And Salt
says it a third time by redeclaring `--badge-size` on the dot — because the
anchoring transform is a function of the badge's own height, so changing the
shape changes where it lands. Modelled as `prop.content`, dot-first, with a
real skeleton branch (the dot renders no label element at all).

**Anchored versus standalone is a DOM fork, not a position property.** Salt
needs an outer `position: relative` span to anchor against; shadcn and M3 have
no such element and never will. Rendering the wrapper for all three would have
put a spurious span around every shadcn badge; rendering one element for all
three would have destroyed Salt's anchoring entirely. Modelled as
`structure.shell`, with **both shells keeping every box style on
`[data-slot="badge"]`** so no style row has to know which shell it is in — the
same resolution TABS-MATRIX.md finding 8 reached for its two-element tab.

## 2 · Behavior

**Every row below is implemented in `skeleton/badge.tsx` and asserted by
`scripts/check-badge-behavior.mjs`.** There are six, and **not one of them is
an event handler** — see finding 1.

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **role** | 🔒 (info) | **none** — `Badge.tsx` writes `className`, `ref` and `{...rest}` on two spans and nothing else. `accessibility.mdx` pushes the contract onto the consumer: put the `aria-label` on the **focusable host** [S] | **none** — `data-slot` and `data-variant` only [S] | **[R] none** — no element, and no token implies one |
| **dot detection** | ⚪ (info) | **inferred from the ABSENCE of a value** — `const dotBadge = typeof value === "undefined"` [S] | OFF — nothing to detect [S] | **[R]** — two unambiguous families, no element to say how one is picked |
| **anchor detection** | ⚪ (info) | **inferred from the PRESENCE of a child** — `[withBaseName("topRight")]: children` [S] | OFF [S] | OFF [S] |
| **value clamping** | ⚪ (info) | **on, with a sourced asymmetry**: a NUMBER above `max` renders `` `${max}+` ``; a **STRING is never clamped**, at any length. `usage.mdx` states the second half in prose [S] | OFF — no value prop; a long label is **clipped** by `overflow-hidden` instead [S] | OFF [S] |
| **activation** | 🔒 (info) | **none — inert by design.** `usage.mdx`: *"Badges are independent of user action"*; *"To trigger an immediate action … Instead, use `Pill`"* [S] | **delegated** — no handler of its own, but `asChild` swaps the span for the consumer's element (`badge-link.tsx` supplies `<a href>`), and that is the same moment the `[a&]:hover` rules become reachable [S] | **[R] none**, and unusually well evidenced for a tokens-only clone: no state-layer, focus-indicator, hover, pressed or disabled family in either edition [S] |
| **live region** | ⚪ (config) | **OFF** [S] | **OFF** [S] | **OFF** [S] — *off in all three; see finding 2* |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| **`content`** | ⚪ | **`dot` \| `label`, DEFAULT `dot`** — a bare `<Badge />` is a dot [S] | **`label` only** — confirmed absence [S] | **`dot` \| `label`**; dot is value[0] because the **unprefixed** family is the base reading [S] |
| **`placement`** | ⚪ | **`inline` \| `anchored`, DEFAULT `inline`** — the JSDoc says so in words: *"By defualt renders inline"* (typo in source) [S] | **`inline` only** [S] | **`inline` only** [S] |
| **`variant`** | ⚪ | **OFF — confirmed absence.** `BadgeProps` is exactly `{ value, children, max }` [S] | **`default` \| `secondary` \| `destructive` \| `outline` \| `ghost` \| `link`, default `default`** — **six, not the four its own demo shows** [S] | **OFF** — `color` and `large-color` both resolve to `error` [S] |
| **`interaction`** | ⚪ | **`static` only** [S] | **`static` \| `link`, default `static`** (`asChild = false`) — and it is load-bearing, because **every** hover rule is `[a&]:hover:` [S] | **`static` only** [S] |
| **`max`** | ⚪ | **999** — a single sourced default, not a list [S] | OFF [S] | OFF [S] |
| `disabled` | — | **no row.** No system has one. Not modelled, not padded — recorded here and in finding 2 [S] | — | — |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| label | 🔒 | consumer-owned, through **two different doors**: a formatted `value` prop in Salt, arbitrary children in shadcn and M3. No system styles the label as a separate element — all three put the type on the container. |
| host | ⚪ | **Salt only** — the element the badge hangs off, passed as `children`. **DECLARED COMPOSITION** to `button` (already built) and to an icon set: every anchored story is `<Badge value={9}><Button aria-label="9 Notifications"><NotificationIcon aria-hidden /></Button></Badge>`. |
| icon | ⚪ | **shadcn only** — a glyph inside the badge, sized to 12px and pointer-event-neutralised by the component. **DECLARED COMPOSITION** to a future icon set (lucide's `BadgeCheckIcon` / `BookmarkIcon`). |
| composes (declared) | ⬜ | **DECLARED COMPOSITION**: (a) **`button`** — Salt's anchored hosts and shadcn's `badge-link`; (b) an **icon set**; (c) **`tabs`**, already built, which composes a badge *inside* a tab in both directions (Salt's `InlineBadge` story, and TABS-MATRIX.md's own `structure.tab-badge` row); (d) **`avatar`**, which owns shadcn's anchored dot; (e) **`chip`/`tag`/`pill`**, still to be built, which is where all three systems send you when the annotation needs to be interactive or to carry status colour. All render as neutral placeholders. |

## 5 · States

**Three rows, and two of them are single-column.** There is **no `pressed`,
`selected` or `disabled` row anywhere in this matrix**, because no system has
one: `Badge.css` has no `:active` and no disabled selector, `badge.tsx` has no
`disabled` prop or `data-disabled` variant, and `_md-comp-badge.scss` has no
`pressed-*` or `disabled-*` family in either edition. Recorded here rather than
as three dead rows.

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| rest | 🔒 | accent blue `rgb(0,120,207)` with **white** text — and **both are MODE-INVARIANT**, so a Salt badge looks identical in dark mode [S] | `--primary` / `--primary-foreground`, which **invert by mode** — near-black on near-white light, near-white on near-black dark [S] | `error` / `on-error`, which also invert — `#b3261e` on `#fff` light, `#f2b8b5` on `#601410` dark [S] |
| hover | ⚪ | **OFF — confirmed absence**, no `:hover` selector [S] | **on, and LINK-GATED**, with three mechanisms across six variants: darken your own fill to 90% (default/secondary/destructive), take `--accent` / `--accent-foreground` (outline/ghost), or **underline** (link) [S] | **OFF** — no hover token, and no state-layer family to build one from [S] |
| focus | ⚪ | **OFF** — no `:focus` rule; the badge is never focusable [S] | **on, and DEAD BY DEFAULT** — the `cva` **base** carries `focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50` on an element that is a `<span>`. Reachable only under `asChild`. `destructive` narrows the alpha to 20% / 40% [S] | **OFF** — and pointedly: the card and tab files both **gained** a focus-indicator family in `latest`; the badge did not, in either edition [S] |

## 6 · Styles — the cell matrix

All cells at each system's default: Salt medium density; shadcn
`variant="default"`, `asChild` false; M3 the **labelled** form.

### the pill

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background | 🔒 | ⟡ `pill-bg` → `sentiment-accent-background` → `palette-accent` → **blue-500 `rgb(0,120,207)`**, mode-invariant [S] | ⟡ `pill-bg` → `--primary` → **`oklch(0% 0 0)` / `oklch(0.922 0 0)`** [S] | ⟡ `pill-bg` → `color` **and** `large-color`, both `error` → **`#b3261e` / `#f2b8b5`** [S] |
| colour | 🔒 | `content-bold-foreground` → `palette-foreground-primary-alt` → **WHITE IN BOTH MODES** (`foreground.css` declares the same value under light and dark) [S] | `--primary-foreground`, reassigned per variant — and `destructive` uses the **literal** `text-white`, not a token [S] | `large-label-text-color` → `on-error` → **`#fff` / `#601410`** [S] |
| **font** | ⬜ | **`600 10px/13px 'Open Sans'`** @medium (8/10 · 10/13 · 12/16 · 14/18 by density). **SEMIBOLD** — the heaviest of the three and the smallest [S] | **`500 0.75rem/1rem`** (`text-xs font-medium`) [S] | **`500 0.6875rem/1rem Roboto`** (`label-small`, the smallest role in the M3 typescale) [S] |
| letter-spacing | ⚪ | OFF [S] | OFF [S] | **`0.03125rem`** — and material-web's own wrapper **disowns it** via `$_unsupported-tokens` [S] |
| shape | ⬜ | **999px** (`palette-corner-strongest` → `curve-999`) — and it is **corner-edition-invariant**: `corner.css` keeps `strongest` at `curve-999` under **both** `rounded` and `sharp`, where every other stop collapses to `curve-0`. A Salt badge stays a pill in the sharp edition [S] | **`rounded-full`** — a bare Tailwind utility, no shadcn token ([R] concrete 9999px, Tailwind not vendored) [S/R] | **9999px** (`corner-full`), for **both** `shape` and `large-shape` [S] |
| **size** | ⬜ | **`height` / `min-width` = `--badge-size`, which is the NOTATION LINE-HEIGHT** (10/13/16/18 by density) — Salt sizes its badge off a **type metric**, not off the size scale [S] | **OFF — confirmed absence.** No height, min-height or min-width. A shadcn badge's 22px is entirely emergent (2 + 16 + 2 + 2 of border) [S] | **16px** (`large-size`), with `min-width` equal so a single digit is a circle [S] |
| padding | ⬜ | **`0 spacing-50`** → 0 2/4/6/8px, with a source comment on the very declaration: `/* Should this vary according to touch size */` [S] | **`2px 8px`** (`py-0.5 px-2`) [S] | **OFF — confirmed absence**, no spacing token in either edition. **Nothing was borrowed** [S] |
| gap | ⚪ | OFF [S] | **4px** (`gap-1`) [S] | OFF [S] |
| border-width | ⚪ | OFF [S] | **1px** — `border border-transparent` in the **base**, so every variant carries it and `outline` changes only a colour [S] | OFF [S] |
| border-colour | ⚪ | OFF [S] | ⟡ `pill-border`, `transparent` until `outline` reassigns it to `--border` [S] | OFF [S] |
| overflow | ⚪ | **OFF** — and its `usage.mdx` fills the gap with **prose** instead: four to six characters, with a **consumer-supplied** ellipsis [S] | **`hidden`** — a long label is clipped to the full radius [S] | OFF [S] |
| white-space | ⬜ | **`nowrap`** [S] | **`nowrap`** [S] | OFF — no token [S] |
| z-index | ⚪ | **`zIndex-default` = 1** — so an anchored badge stacks above its host. Salt is the only system with a shared z-index scale at all [S] | OFF [S] | OFF [S] |
| margin | ⚪ | **`auto`** — not decorative: the pill is a flex item of the wrapper, so `auto` centres it on the cross axis [S] | OFF [S] | OFF [S] |
| font-smoothing | ⚪ | **`antialiased` / `grayscale`** — at 10px semibold on a saturated fill this is visible, not a nicety [S] | OFF [S] | OFF [S] |
| transition | ⚪ | **OFF — confirmed absence**; nothing changes [S] | **`color, box-shadow`** — property list [S], 150ms / `cubic-bezier(0.4,0,0.2,1)` [R], Tailwind not vendored [S/R] | OFF — no motion token [S] |
| hover | ⚪ | OFF [S] | **on, gated on `[data-interaction="link"]`**; reads three indirection slots so one rule carries all three mechanisms [S] | OFF [S] |
| focus | ⚪ | OFF [S] | **`border-ring` + a 3px `ring/50` box-shadow**, from the base. **No `outline-none`** — unlike `input.tsx`, so the native outline is left alone [S] | OFF [S] |

### the two shapes, and the anchor

| row | Salt | shadcn | Material 3 |
|---|---|---|---|
| `style.badge.dot` | **on** — `height`/`min-width` = `size-adornment` (**6/8/10/12 by DENSITY**), `padding: 0`, **and `--badge-size` redeclared on the pill** [S] | OFF [S] | **on** — `size: 6px`, density-invariant (M3 has no density capability) [S] |
| `style.badge.anchor` | **on** — `position: absolute; right: spacing-100; transform: translateX(100%) translateY(calc(-1 * (var(--badge-size) / 2)))`. **No `top` is declared** [S] | OFF [S] | OFF [S] |
| `style.badge.anchor@dot` | **on** — `right: calc(size-adornment / 2)`: the dot sits **half its own width** in, where the labelled form sits a full `spacing-100` in [S] | OFF [S] | OFF [S] |

### the variant axis, as generated rows (shadcn only)

| row | what it reassigns |
|---|---|
| `@secondary` | `--pill-bg` `--secondary`, `--pill-fg` `--secondary-fg`, hover at 90% of its own fill [S] |
| `@destructive` | `--pill-bg` `--destructive` (**a 60% mix in dark**), `--pill-fg` the **literal** `#fff`, hover at 90%, **and the only variant that touches the focus ring** — 20% light / 40% dark against the base 50% [S] |
| `@outline` | `--pill-border` `--border`, `--pill-fg` `--foreground`, **no `bg-*` class at all** so the fill falls back to transparent — an outline badge is see-through, not white. Hover takes the accent pair [S] |
| `@ghost` | **the emptiest declaration in the component**: no background, no border colour, no text colour. Its entire content is its `[a&]:hover` pair, so at rest it is invisible [S] |
| `@link` | `--pill-fg` `--primary`, `text-underline-offset: 4px`, and the one hover that moves **`text-decoration`** rather than a colour [S] |

### icon

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| icon box | ⚪ | OFF [S] | **12px square + `pointer-events: none`** (`[&>svg]:size-3`), density-invariant [S] | OFF [S] |

**Accent scope trim.** `sentiment-accent-background` resolves through
`palette-accent`, which has a `data-accent` axis (`blue` default, `teal`
alternate). This column pins **blue**, matching
`button/input/select/dialog/tabs/card.salt.json`; only `calendar.salt.json`
models `byAccent`. Recorded, not modelled.

---

## Declared approximations in the chassis

Three. Badge is small enough that there are not more.

1. **`children` means two different things, and the chassis splits them.** In
   Salt, `children` is the **host** the badge anchors to and `value` is the
   label. In shadcn and M3, children **are** the label. The chassis takes
   `host` and `value`/`children` as separate props so one component can serve
   all three. The observable rule is unchanged —
   `behavior.anchor-detection` still infers "anchored" from the **presence of
   a host**, exactly as Salt infers it from the presence of a child — but the
   API shape differs from Salt's, and that is stated rather than smoothed.
2. **`w-fit` and the flex-centring set are promoted to `base`.** shadcn's
   `inline-flex items-center justify-center shrink-0 w-fit` and Salt's
   `display: inline-flex; align-items: center; justify-content: center;
   flex-shrink: 0` are the same declarations by two routes, and M3 has no
   layout token to contradict them, so they live in the template's
   theme-invariant `base` block. `margin: auto` deliberately did **not** join
   them — see the row's note: auto margins on a flex item absorb free space,
   and emitting Salt's for shadcn's wrapper-less badge would push a row of
   them apart.
3. **The `[a&]:` selector is reproduced as a data attribute, not as an element
   selector.** shadcn's hover rules compile to a selector that matches only
   when the element is an `<a>`. The chassis really does render an `<a>` under
   `interaction="link"`, but the CSS gate is written
   `[data-slot="badge"][data-interaction="link"]:hover` — the generalized
   selector pattern `button.template.json` established, so no template
   selector encodes one system's own vocabulary. The two are equivalent here
   because the chassis writes the attribute exactly when it writes the anchor.

---

## Findings from building this matrix

1. **Badge has six behaviour rows and not one of them is an event handler —
   and the brief's expectation was the opposite.** The brief anticipated
   "no behaviour beyond ARIA labelling". Source says the reverse on both
   counts. There is **no ARIA at all** (finding 2), and there **is** real
   behaviour: a component that decides which of two shapes to be from the
   absence of a `value`, decides where to sit from the presence of a child,
   and formats and clamps its own label with a rule that treats numbers and
   strings differently. All three are pure content-formatting and inference —
   exactly the class of character CLAUDE.md law 3 says a style-only coverage
   report lies about. A chassis that had silently rendered every badge as a
   pill with `children` inside would have passed the generator, the axis audit
   and every screenshot.
2. **No system gives a badge any ARIA, and the unanimity is the finding.**
   Salt writes `className`, `ref` and `{...rest}`; shadcn writes `data-slot`
   and `data-variant`; M3 has no element. For a component whose entire job is
   announcing a changing count, **not one of the three writes `aria-live`,
   `aria-atomic` or `role="status"`.** Salt's `accessibility.mdx` explains its
   reasoning for the inline case — "the screen reader automatically announces
   the contents of the badge" **when the user navigates to it** — and hands the
   anchored case to the host's `aria-label` instead. The consequence is real:
   a Salt badge whose number changes while nothing is focused announces
   nothing. `behavior.live-region` is carried as a capability the chassis has
   and **every column leaves off**, so the gap is a matrix cell rather than a
   silent omission, the same treatment TABS-MATRIX.md declared approximation 4
   gave an M3 tab's `aria-disabled`.
3. **Salt clamps numbers and never clamps strings, and the asymmetry is
   stated in two places.** `typeof value === "number" && value > max` guards
   the comparison, so `value={1000}` renders `999+` while
   `value={"VERYLONGLABEL"}` renders in full. `usage.mdx` confirms it —
   *"When you pass a string, the badge will not clamp the value"* — and then
   recommends four to six characters with a **consumer-supplied** ellipsis,
   i.e. Salt solves overflow with documentation where shadcn solves it with
   `overflow-hidden` and M3 does not solve it at all. Three systems, three
   different answers to "what happens when the label is too long", none of
   them the same mechanism.
4. **M3 refactored badge OUT of its hosts, and `latest` records the shape it
   had before.** `_md-comp-navigation-bar.scss` and `_md-comp-navigation-rail.scss`
   each carry a `badge.*` / `large-badge.*` family, every member marked
   `@deprecated` with *"Badge values were refactored out into their own token
   set. Replace usage with the equivalent `md.comp.badge.*` tokens."* Those
   families are **absent from `v0_192` entirely** — the string "badge" appears
   zero times in either file there. And they preserve something the badge's own
   file does not: the pre-refactor shapes were **`3px` and `8px`**, not
   `corner-full`. **A badge became a full pill at the moment it became its own
   component.** This changes no modelled cell (`_md-comp-badge.scss` is
   authoritative and says `corner-full`), and it is the strongest available
   evidence that M3 itself treats badge as canonical rather than as a
   navigation ornament. Separately, `_md-comp-navigation-drawer.scss` carries a
   `large-badge-label-*` family that is **not** deprecated and does **not**
   point at `md.comp.badge.*`: `on-surface-variant` at `label-large`, i.e. a
   drawer's trailing count is plain ambient text with no error container. Two
   different things called "badge" in one design system, one of them redirected
   here and one of them not.
5. **shadcn ships six variants and documents four.** `badge.tsx`'s `cva` object
   contains `ghost` and `link` alongside the demo's four. `ghost` is the
   emptiest declaration in the component — no background, no border colour, no
   text colour, only its `[a&]:hover` pair — so a resting ghost badge is a
   transparent box with an inherited colour, **invisible until it is a link and
   hovered**. `link` is the only variant whose hover moves `text-decoration`
   rather than a colour, which is why `style.badge.hover` reads a
   `--pill-decoration-hover` slot instead of only a background and a colour.
   Both were found by reading the `cva` object rather than the demo.
6. **shadcn's hover exists only when the badge is a link, and one Tailwind
   prefix carries the whole axis.** Every hover rule in the component is
   written `[a&]:hover:` — an arbitrary variant meaning *only when this element
   is an `<a>`*. Since the component renders a `<span>` unless `asChild` is
   passed, **a default shadcn badge has no hover response whatsoever**.
   Modelled as `prop.interaction` with a real element branch, the same
   resolution CARD-MATRIX.md finding 4 reached for its static/button/link fork.
   The same file then declares `focus-visible:border-ring
   focus-visible:ring-[3px]` in the `cva` **base** — a focus ring on an element
   that cannot receive focus. Reproduced as source has it, and flagged: it is
   dead CSS in five of six variants' normal usage, and it is the fifth source
   self-contradiction the pipeline has turned up.
7. **Salt's badge is the only mode-invariant component in this registry so
   far.** `sentiment-accent-background` → `palette-accent` → `blue-500` is
   declared identically under `[data-mode="light"]` and `[data-mode="dark"]`,
   and `content-bold-foreground` → `palette-foreground-primary-alt` is
   `--salt-color-white` under **both** as well (`foreground.css` lines 4 and
   13). So a Salt badge is white-on-blue in dark mode too, where shadcn's
   inverts (black-on-white → white-on-black) and M3's inverts
   (`#fff` on `#b3261e` → `#601410` on `#f2b8b5`). Salt's own
   `accessibility.mdx` records the cost of holding still: *"the dot badge
   indicator in dark mode falls slightly below the minimum contrast requirement
   of 3:1"*, resolved only in the J.P. Morgan theme. A sourced accessibility
   caveat, carried rather than fixed.
8. **Salt sizes its badge off a TYPE metric, and that decision propagates.**
   `--badge-size: var(--salt-text-notation-lineHeight)` — 10/13/16/18px by
   density — not `size-base`, not `size-selectable`, not anything on the size
   scale. Which means the pill's height, its `min-width`, **and the vertical
   half-lift of its anchoring transform** all move when the type moves. The dot
   form therefore cannot just override a height: it has to **redeclare
   `--badge-size` on the pill itself**, which `Badge.css` does. That is
   **lesson 2 handled correctly in source** — the custom property is read on
   the element the transform applies to, so it must be declared there — and it
   is reproduced with the same placement for the same reason. Declaring it on
   the chassis wrapper instead would have compiled, rendered, and put every
   anchored dot badge at the wrong height.
9. **Frozen-token check, run in both directions, found one real density move
   and no fixed-scale values at all.** `--salt-size-adornment` (the dot
   diameter) is on the **density** scale — **6/8/10/12px** — so snapshotting
   the medium 8px would have been wrong at three of four densities.
   `spacing-50` (the padding), `spacing-100` (the anchor offset) and
   `text-notation-*` (the type, and therefore `--badge-size`) all move too.
   **Nothing in this component is on the `size-fixed-*` or `spacing-fixed-*`
   scales**, so unlike card there was no density-invariant-by-design value to
   identify. Two genuinely invariant values were found by a different route:
   `curve-999` = 999px is identical in **all four density blocks AND both
   corner editions**, and M3's 6px / 16px / 12px are invariant because M3 has
   no density capability at all (`docs/foundations/density.md`).
10. **Axis self-audit (run deliberately, per ALERT-MATRIX.md finding 10).**
    Every `channel: "config"` row whose cell is a list of 2+ values, and what
    discriminates each value:
    - **`prop.content`** — Salt `[dot, label]`, M3 `[dot, label]`:
      discriminated by `style.badge.dot` (a real block moving `height`,
      `min-width`, `padding` and, in Salt, the `--badge-size` indirection the
      anchor transform consumes), by `style.badge.anchor@dot` (a **different
      anchoring offset**, Salt), and by a **skeleton branch** that omits the
      `[data-slot="badge-label"]` element entirely in the dot form. Listed
      **SOURCE-DEFAULT-FIRST (`dot`)** in both, and this one is easy to get
      backwards: a bare Salt `<Badge />` really is a dot, and M3's
      **unprefixed** family really is the 6px one, with `large-*` as the
      qualified reading — the same convention `card.m3.json` used in taking
      the unqualified enabled state as its base. A label-first list would have
      made every unqualified badge in the harness render as a pill against
      source. shadcn is single-valued `[label]`.
    - **`prop.placement`** — Salt `[inline, anchored]`: discriminated by
      `style.badge.anchor` and `style.badge.anchor@dot` (two real blocks) plus
      a **skeleton branch** that renders the host slot and writes
      `data-anchored`. Listed **SOURCE-DEFAULT-FIRST (`inline`)**, and the
      source states it in words rather than only in code (`Badge.tsx`'s JSDoc:
      *"By defualt renders inline"*). shadcn and M3 single-valued `[inline]`.
    - **`prop.variant`** — shadcn `[default, secondary, destructive, outline,
      ghost, link]`: discriminated by **five real CSS blocks**, which between
      them move the background, the label colour, the border colour, both
      hover slots, the hover text-decoration, the focus ring colour and the
      focus ring alpha. Listed **SOURCE-DEFAULT-FIRST**, from the literal
      `defaultVariants: { variant: "default" }`. Salt and M3 are off, so
      nothing is undiscriminated.
    - **`prop.interaction`** — shadcn `[static, link]`: discriminated by
      `style.badge.hover` (gated on `[data-interaction="link"]`) **and** by a
      skeleton element branch (`<span>` vs `<a href>`). Listed
      **SOURCE-DEFAULT-FIRST (`static`)**, from `asChild = false`. Salt and M3
      single-valued `[static]`.
    - **`prop.max`** — Salt `999`: a **single sourced default**, not a list and
      not a capability list; the skeleton reads the per-instance `max` prop and
      falls back to it.
    - **NO CAPABILITY LISTS EXIST IN THIS COMPONENT.** Card had two
      (`disabled`, `hoverable`, both `[true, false]`) and had to declare them
      as such because the ordering convention differs. Badge has none: every
      multi-valued cell is an ordered enum with a real source default, and
      every boolean row (`structure.dot`, `structure.anchoring`,
      `structure.icon`) is a single `true`/off per column rather than a list.
      Stated explicitly so the absence is not read as an oversight.
    - **Single-valued across every column, so nothing to discriminate:**
      `structure.shell` (three values, one per column, discriminated by the
      skeleton's wrapper branch), `structure.label-format` (ditto,
      discriminated by the clamping branch), and `behavior.live-region`
      (off everywhere).
    **Result: no dead axis values, every enum list is source-default-first,
    and no list is a capability list.** The rows that are off in every column
    (`behavior.live-region`) are retained deliberately as documentation of
    finding 2.
11. **The third gate, fourth outing — and its ref-effect block is INVERTED,
    because badge has no effects.** `scripts/check-badge-behavior.mjs` is
    `check-card-behavior.mjs`'s contract unchanged over badge's **six**
    behaviour rows (two locked/info). But `skeleton/badge.tsx` contains no
    `useEffect`, no `useLayoutEffect` and no `useRef`: every behaviour above is
    a pure computation performed during render, so there is nothing for the
    `REF_EFFECT_GUARDS` block to guard. An **empty guard list would be
    vacuously true** and would quietly stop protecting anything the day someone
    added a measurement. So the block asserts the opposite: that the skeleton
    **stays** effect-free. Introducing a `useRef` or a `useEffect` without
    adding a guard entry fails the gate. The honest closing caveat is
    unchanged — it proves the code exists and is bound, not that it runs or is
    correct. The outstanding half, spelled out in the script's own closing
    line: drive the skeleton in a DOM and assert that a Salt badge with no
    value renders as a **dot**, that `value={1000}` renders `999+` while a long
    **string** renders in full, that `value={200} max={99}` renders `99+`, that
    the dot and the labelled form anchor at **different offsets**, that a
    shadcn badge is a `<span>` with **no** hover until `interaction="link"`
    makes it an `<a>`, and that no badge in any column carries a `role`, a
    `tabindex` or an `aria-live`. **Environment caveat for whoever drives it**
    (TABS-MATRIX.md's validation pass): badge has no JS focus handling, so
    nothing here depends on a focus event arriving — but shadcn's
    `style.badge.focus` is a `:focus-visible` rule on an element that is only
    focusable under `interaction="link"`, so it must be exercised with a real
    or synthetic bubbling `focusin` after `.focus()`, or the hidden-tab
    environment manufactures a convincing false negative.
12. **No `docs/foundations/*.md` claim was contradicted by a grep this time,
    and four were confirmed.** `typography.md` line 58's caption/notation row
    (Salt `10px/13px` at medium, shadcn `text-xs` `0.75rem/1rem`, M3 "no
    distinct caption role; `label-small` covers it") matches
    `next/characteristics/text.css` and `_md-sys-typescale.scss` exactly.
    `sizes.md` line 11's adornment row (6/8/10/12) matches
    `foundations/size.css`. `shape.md` line 10's pill row (Salt 999px **all
    editions**, shadcn "no pill token; components use `rounded-full`, a bare
    Tailwind utility", M3 `corner-full` 9999px) matches
    `next/palette/corner.css`, `badge.tsx` and `_md-sys-shape.scss`.
    `layers.md`'s claim that Salt is the only system with a shared z-index
    scale is confirmed by `Badge.css`'s `zIndex-default` against two columns
    with none. `state-layers.md` and `elevation.md` — the two pages
    CARD-MATRIX.md finding 11 reported as edition-stale and as
    canonical-for-shadows respectively — are **not consulted by this
    component**, because a badge has no state layer and no elevation in any of
    the three systems. **The CARD-MATRIX.md finding-11 report on
    `state-layers.md` therefore stands unchanged and unreinforced; nothing here
    either confirms or contradicts it.**

## Validation pass — driven in the real DOM

**Verified by computed style, all correct.** M3's dot is exactly **6px** and its
numeric badge exactly **16px** high with a 16px min-width, matching `$size` and
`$large-size`; its fill is `#b3261e`, the `error` role. Salt's dot is **8px**.
shadcn has **no dot form at all**.

**The clamping divergence is real and only Salt has it.** Given identical
inputs, Salt renders `999+` for 1000 and `99+` for 200 (`max` default 999,
overridable), while shadcn and M3 render `1000` and `200` unchanged. Salt also
clamps **numbers only** — a long string passes through untouched. This is
content-formatting character of exactly the kind CALENDAR-MATRIX.md first
flagged: invisible in a token table, decisive on screen.

**Salt's absent variant axis is a sourced ABSENCE, not a gap.** `BadgeProps` is
exactly `{ value, children, max }` and `Badge.css` declares one background.
Salt's own `usage.mdx` makes it deliberate — status colour belongs to Pill, not
Badge — so the row is `off` with a citation rather than left unfilled.

## An owner decision this component surfaces: all three systems ship no ARIA

Badge is the first component matrixed where **every** system omits
accessibility semantics entirely. Confirmed by grep: neither Salt's nor
shadcn's badge sets `role`, `aria-label`, or `aria-live`, and M3 has no
component to set them. shadcn's only `aria-` strings are Tailwind *selectors*
(`aria-invalid:border-destructive`) that style a consumer-set attribute; the
component asserts nothing itself. Its `focus-visible:` ring sits on a `<span>`
that cannot receive focus unless the consumer makes it an anchor.

That is a genuine shared defect, not a divergence. A badge showing "99+"
unread items is announced to a screen reader as the bare string "99+" with no
indication of what it counts, and a badge that updates live announces nothing
at all.

**This is a taste call, and it is yours** — the pipeline's rule 4 says values
come from source, and the faithful answer is to ship the absence. But the
registry's stated purpose includes being the thing an agent generates
*correct* UI from, and faithfully reproducing three systems' shared a11y gap
propagates it. Three options, no default chosen:

1. **Mirror source** — no ARIA. Maximum fidelity, propagates the defect.
2. **Mirror source, document loudly** — as now, with the absence recorded here
   and in the matrix so a consumer sees it. (What is currently built.)
3. **Add a registry-level default** — e.g. an optional `aria-label` prop and
   `role="status"` on live-updating badges — clearly marked as a REGISTRY
   ADDITION, not sourced from any system, the way declared approximations are
   already marked elsewhere.

Recorded rather than decided, per the pipeline's instruction to queue
taste decisions instead of blocking on them.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/badge.template.json` against every system, read from `columns/badge.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 4 light, 0 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `pill-bg` | rgb(0, 120, 207) | — | yes |
| `pill-fg` | rgb(255, 255, 255) | — | yes |
| `pill-radius` | 999px | — | yes |
| `pill-z` | 1 | — | yes |

**shadcn** — 32 light, 15 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `primary` | oklch(0% 0 0) | oklch(0.922 0 0) | **no** |
| `primary-fg` | oklch(0.985 0 0) | oklch(0.205 0 0) | **no** |
| `secondary` | oklch(0.97 0 0) | oklch(0.269 0 0) | **no** |
| `secondary-fg` | oklch(0.205 0 0) | oklch(0.985 0 0) | **no** |
| `danger` | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | **no** |
| `danger-fg` | #fff | — | **no** |
| `border-base` | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | yes |
| `fg-base` | oklch(0% 0 0) | oklch(0.985 0 0) | yes |
| `accent-bg` | oklch(0.97 0 0) | oklch(0.371 0 0) | **no** |
| `accent-fg` | oklch(0.205 0 0) | oklch(0.985 0 0) | **no** |
| `focus` | oklch(0.708 0 0) | oklch(0.556 0 0) | **no** |
| `pill-bg-default-hover` | color-mix(in oklab, oklch(0% 0 0) 90%, transparent) | color-mix(in oklab, oklch(0.922 0 0) 90%, transparent) | **no** |
| `pill-bg-secondary-hover` | color-mix(in oklab, oklch(0.97 0 0) 90%, transparent) | color-mix(in oklab, oklch(0.269 0 0) 90%, transparent) | **no** |
| `pill-bg-danger` | oklch(0.577 0.245 27.325) | color-mix(in oklab, oklch(0.704 0.191 22.216) 60%, transparent) | **no** |
| `pill-bg-danger-hover` | color-mix(in oklab, oklch(0.577 0.245 27.325) 90%, transparent) | color-mix(in oklab, oklch(0.704 0.191 22.216) 90%, transparent) | **no** |
| `ring-alpha` | 50% | — | **no** |
| `ring-alpha-danger` | 20% | 40% | **no** |
| `pill-radius` | 9999px | — | yes |
| `pill-padding` | 2px 8px | — | **no** |
| `pill-gap` | 4px | — | **no** |
| `pill-border-width` | 1px | — | **no** |
| `icon-size` | 12px | — | yes |
| `type-label` | 500 0.75rem/1rem ui-sans-serif, system-ui, sans-serif | — | yes |
| `transition-props` | color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1) | — | yes |
| `pill-bg` | var(--primary) | — | **no** |
| `pill-fg` | var(--primary-fg) | — | **no** |
| `pill-border` | transparent | — | **no** |
| `pill-bg-hover` | var(--pill-bg-default-hover) | — | **no** |
| `pill-fg-hover` | var(--primary-fg) | — | **no** |
| `pill-decoration-hover` | none | — | **no** |
| `ring-current` | var(--focus) | — | **no** |
| `ring-alpha-current` | var(--ring-alpha) | — | **no** |

**m3** — 7 light, 2 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `pill-bg` | #b3261e | #f2b8b5 | yes |
| `pill-fg` | #fff | #601410 | yes |
| `pill-radius` | 9999px | — | yes |
| `label-size` | 16px | — | **no** |
| `dot-size` | 6px | — | **no** |
| `label-tracking` | 0.03125rem | — | yes |
| `type-label` | 500 0.6875rem/1rem Roboto, sans-serif | — | yes |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.shell` | structure | locked | `wrapper` | `single` | `single` |
| 2 | `structure.label-format` | structure | locked | `clamped-value` | `children` | `children` |
| 3 | `structure.dot` | structure | switchable | `True` | **off** | `True` |
| 4 | `structure.anchoring` | structure | switchable | `True` | **off** | **off** |
| 5 | `structure.icon` | structure | switchable | **off** | `True` | **off** |
| 6 | `prop.content` | prop | switchable | `dot, label` | `label` | `dot, label` |
| 7 | `prop.placement` | prop | switchable | `inline, anchored` | `inline` | `inline` |
| 8 | `prop.variant` | prop | switchable | **off** | `default, secondary, destructive, outline, ghost, link` | **off** |
| 9 | `prop.interaction` | prop | switchable | `static` | `static, link` | `static` |
| 10 | `prop.max` | prop | switchable | `999` | **off** | **off** |
| 11 | `behavior.role` | behavior | locked | `none — no role and no aria-* on either span` | `none — data-slot and data-variant only` | `[R] none` |
| 12 | `behavior.dot-detection` | behavior | switchable | `inferred from the ABSENCE of a value` | **off** | `[R] two token families, selection mechanism unsourced` |
| 13 | `behavior.anchor-detection` | behavior | switchable | `inferred from the PRESENCE of a child` | **off** | **off** |
| 14 | `behavior.value-clamping` | behavior | switchable | `numbers above max render as `${max}+`; strings are never clamped` | **off** | **off** |
| 15 | `behavior.activation` | behavior | locked | `none — inert` | `delegated via asChild` | `[R] none` |
| 16 | `behavior.live-region` | behavior | switchable | **off** | **off** | **off** |
| 17 | `slot.label` | slot | locked | `the formatted `value` prop (number or string)` | `arbitrary children` | `[R] arbitrary text; large-label-text-* describes only its type` |
| 18 | `slot.host` | slot | switchable | `True` | **off** | **off** |
| 19 | `slot.icon` | slot | switchable | **off** | `True` | **off** |
| 20 | `slot.composes` | slot | default | — | — | — |
| 21 | `state.rest` | state | locked | `accent blue fill, white label — MODE-INVARIANT in both properties` | `--primary fill with --primary-foreground text, INVERTING by mode` | `error fill with on-error label, INVERTING by mode` |
| 22 | `state.hover` | state | switchable | **off** | `link-gated; three mechanisms across six variants` | **off** |
| 23 | `state.focus` | state | switchable | **off** | `border-ring + a 3px ring/50 shadow, from the cva BASE` | **off** |
| 24 | `style.badge.background` | style | locked | ⟡ `pill-bg` | ⟡ `pill-bg` | ⟡ `pill-bg` |
| 25 | `style.badge.color` | style | locked | ⟡ `pill-fg` | ⟡ `pill-fg` | ⟡ `pill-fg` |
| 26 | `style.badge.font` | style | default | ⟡ `type-notation` | ⟡ `type-label` | ⟡ `type-label` |
| 27 | `style.badge.letter-spacing` | style | switchable | **off** | **off** | ⟡ `label-tracking` |
| 28 | `style.badge.shape` | style | default | ⟡ `pill-radius` | ⟡ `pill-radius` | ⟡ `pill-radius` |
| 29 | `style.badge.size` | style | default | `height: var(--badge-size); min-width: var(--badge-size)` | **off** | `height: var(--label-size); min-width: var(--label-size)` |
| 30 | `style.badge.padding` | style | default | ⟡ `pill-padding` | ⟡ `pill-padding` | **off** |
| 31 | `style.badge.gap` | style | switchable | **off** | ⟡ `pill-gap` | **off** |
| 32 | `style.badge.border-width` | style | switchable | **off** | ⟡ `pill-border-width` | **off** |
| 33 | `style.badge.border-color` | style | switchable | **off** | ⟡ `pill-border` | **off** |
| 34 | `style.badge.overflow` | style | switchable | **off** | `hidden` | **off** |
| 35 | `style.badge.white-space` | style | default | `nowrap` | `nowrap` | **off** |
| 36 | `style.badge.z-index` | style | switchable | ⟡ `pill-z` | **off** | **off** |
| 37 | `style.badge.margin` | style | switchable | `auto` | **off** | **off** |
| 38 | `style.badge.font-smoothing` | style | switchable | `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale` | **off** | **off** |
| 39 | `style.badge.transition` | style | switchable | **off** | ⟡ `transition-props` | **off** |
| 40 | `style.badge.hover` | style | switchable | **off** | `background: var(--pill-bg-hover); color: var(--pill-fg-hover); text-decoration-line: var(--pill-decoration-hover)` | **off** |
| 41 | `style.badge.focus` | style | switchable | **off** | `border-color: var(--focus); box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring-current) var(--ring-alpha-current), transparent)` | **off** |
| 42 | `style.badge.dot` | style | switchable | `height: var(--badge-size-dot); min-width: var(--badge-size-dot); padding: 0; --badge-size: var(--badge-size-dot)` | **off** | `height: var(--dot-size); min-width: var(--dot-size)` |
| 43 | `style.badge.anchor` | style | switchable | `position: absolute; right: var(--anchor-right); transform: translateX(100%) translateY(calc(-1 * (var(--badge-size) / 2)))` | **off** | **off** |
| 44 | `style.badge.anchor@dot` | style | switchable | `calc(var(--badge-size-dot) / 2)` | **off** | **off** |
| 45 | `style.badge.variant@secondary` | style | switchable | **off** | `--pill-bg: var(--secondary); --pill-fg: var(--secondary-fg); --pill-bg-hover: var(--pill-bg-secondary-hover); --pill-fg-hover: var(--secondary-fg)` | **off** |
| 46 | `style.badge.variant@destructive` | style | switchable | **off** | `--pill-bg: var(--pill-bg-danger); --pill-fg: var(--danger-fg); --pill-bg-hover: var(--pill-bg-danger-hover); --pill-fg-hover: var(--danger-fg); --ring-current: var(--danger); --ring-alpha-current: var(--ring-alpha-danger)` | **off** |
| 47 | `style.badge.variant@outline` | style | switchable | **off** | `--pill-bg: transparent; --pill-fg: var(--fg-base); --pill-border: var(--border-base); --pill-bg-hover: var(--accent-bg); --pill-fg-hover: var(--accent-fg)` | **off** |
| 48 | `style.badge.variant@ghost` | style | switchable | **off** | `--pill-bg: transparent; --pill-fg: inherit; --pill-bg-hover: var(--accent-bg); --pill-fg-hover: var(--accent-fg)` | **off** |
| 49 | `style.badge.variant@link` | style | switchable | **off** | `--pill-bg: transparent; --pill-fg: var(--primary); --pill-bg-hover: transparent; --pill-fg-hover: var(--primary); --pill-decoration-hover: underline; text-underline-offset: 4px` | **off** |
| 50 | `style.icon.box` | style | switchable | **off** | `width: var(--icon-size); height: var(--icon-size); pointer-events: none` | **off** |

<details><summary>Citations — 101 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.shell` | salt | Badge.tsx returns <span className=saltBadge>{children}<span className=saltBadge-badge>{valueText}</span></span> — always two spans, even for an inline badge, because .saltBadge is the position:relative context the anchored form absolutely positions out of |
| `structure.shell` | shadcn | badge.tsx returns one <Comp data-slot="badge">; there is no wrapper element anywhere in the file |
| `structure.shell` | m3 | [R] — no element exists in a tokens-only clone. The token file describes a container and a label and no positioning context, so a single element is the reading with the least invented structure |
| `structure.label-format` | salt | Badge.tsx `const valueText = typeof value === "number" && value > max ? `${max}+` : value` — the component formats its own label from a value prop; children mean something else entirely |
| `structure.label-format` | shadcn | badge.tsx spreads {...props}; the label is whatever the consumer nests. There is no value or max prop |
| `structure.label-format` | m3 | [R] — large-label-text-* describes the TYPE of a label and says nothing about where the string comes from; no value/max/format token exists |
| `structure.dot` | salt | Badge.css .saltBadge-dotBadge + Badge.tsx `const dotBadge = typeof value === "undefined"`; site/docs/components/badge/examples.mdx has dedicated 'Dot badge' and 'Inline dot badge' sections |
| `structure.dot` | shadcn | CONFIRMED ABSENCE — see the no-dot-no-anchoring provenance entry. The anchored dot lives on `avatar` as AvatarBadge |
| `structure.dot` | m3 | the unprefixed `size: 6px` / `shape: corner-full` / `color: error` family, against the parallel `large-*` family. Two forms, one file, [S] |
| `structure.anchoring` | salt | Badge.css .saltBadge-topRight + Badge.tsx `[withBaseName("topRight")]: children`; examples.mdx: 'The Badge is anchored to the top-right corner when attached to a child component such as a button' |
| `structure.anchoring` | shadcn | CONFIRMED ABSENCE — no position, inset, absolute or translate utility in badge.tsx |
| `structure.anchoring` | m3 | OFF for a structural reason — see the anchoring-lives-on-the-host provenance entry. The badge's own token set carries no placement token; the deprecated host families that did are on navigation-bar / navigation-rail |
| `structure.icon` | salt | CONFIRMED ABSENCE — no icon rule and no gap anywhere in Badge.css; the pill's only content is the formatted value |
| `structure.icon` | shadcn | cva base `gap-1 [&>svg]:pointer-events-none [&>svg]:size-3` — the component sizes and neutralises any SVG child; exercised by examples/radix/badge-icon.tsx and by badge-demo.tsx's Verified badge |
| `structure.icon` | m3 | CONFIRMED ABSENCE — no icon token in either edition |
| `prop.content` | salt | Badge.tsx: `value` is optional and `dotBadge = typeof value === "undefined"`, so a bare <Badge /> renders a DOT. DOT IS THE SOURCE DEFAULT and is therefore value[0] — a label-first list would have made every unqualified Salt badge in the harness render as a pill against source |
| `prop.content` | shadcn | single-valued: there is no dot form |
| `prop.content` | m3 | the two token families. DOT IS value[0] because the UNPREFIXED family is the base reading and `large-*` is the qualified one — the same convention card.m3.json used in taking the unqualified enabled state as its base. No source names one as primary |
| `prop.placement` | salt | Badge.tsx JSDoc on `children`: 'If a child is provided the Badge will render top right. By defualt renders inline.' (typo in source). Inline is the stated default and is value[0] |
| `prop.placement` | shadcn | single-valued: there is no anchored form |
| `prop.placement` | m3 | single-valued: no placement token in this file |
| `prop.variant` | salt | CONFIRMED ABSENCE — see the no-variant-axis provenance entry. Three props, none of them an appearance axis |
| `prop.variant` | shadcn | badge.tsx cva variants object, listed SOURCE-DEFAULT-FIRST per `defaultVariants: { variant: "default" }`. A secondary-first or ghost-first list would have made every unqualified shadcn badge in the harness render as the wrong fill |
| `prop.variant` | m3 | CONFIRMED ABSENCE — `color` and `large-color` both resolve to $error and there is no second value. An M3 badge has exactly one colour |
| `prop.interaction` | salt | single-valued confirmed absence: no handler, no tabIndex, no asChild, no interaction rule in the CSS |
| `prop.interaction` | shadcn | badge.tsx `asChild = false` is the declared default, so static is value[0]; `const Comp = asChild ? Slot.Root : "span"`. The `link` value is not cosmetic — every [a&]:hover rule in the component is unreachable without it (see the hover-is-link-only provenance entry) |
| `prop.interaction` | m3 | single-valued confirmed absence, and unusually well evidenced for a tokens-only clone: no state-layer, focus-indicator, hover, pressed, dragged or disabled family exists, where the card and tab files carry several each |
| `prop.max` | salt | Badge.tsx `{ value, max = 999, ... }` — a single sourced default, not a capability list. usage.mdx: 'If you don't pass a max value to the component, it will truncate the value after three digits displaying 999+ for any values over 999' |
| `prop.max` | shadcn | no value prop, so nothing to clamp |
| `prop.max` | m3 | no value prop and no truncation token |
| `behavior.role` | salt | Badge.tsx writes className, ref and {...rest} only. accessibility.mdx puts the whole contract on the consumer: 'ensure the focusable element has an aria-label or aria-labelledby attribute that describes the badge, such as "9 notifications"' |
| `behavior.role` | shadcn | badge.tsx writes data-slot="badge", data-variant and className, and spreads the rest. No role, no aria-label, no aria-live |
| `behavior.role` | m3 | no element to grep, and no token implies one — the absence of any focus or state family is the available evidence that an M3 badge is decoration rather than a control |
| `behavior.dot-detection` | salt | Badge.tsx `const dotBadge = typeof value === "undefined"` |
| `behavior.dot-detection` | shadcn | no dot form to detect |
| `behavior.dot-detection` | m3 | the two forms are unambiguous; how a consumer picks between them is not in the clone |
| `behavior.anchor-detection` | salt | Badge.tsx `[withBaseName("topRight")]: children` |
| `behavior.anchor-detection` | shadcn | no anchored form to detect |
| `behavior.anchor-detection` | m3 | no anchored form in this token set |
| `behavior.value-clamping` | salt | Badge.tsx `typeof value === "number" && value > max ? `${max}+` : value`; usage.mdx confirms the string half: 'When you pass a string, the badge will not clamp the value' |
| `behavior.value-clamping` | shadcn | CONFIRMED ABSENCE — the label is arbitrary children; a long one is clipped by `overflow-hidden` rather than clamped |
| `behavior.value-clamping` | m3 | CONFIRMED ABSENCE — no value, max or truncation token |
| `behavior.activation` | salt | no onClick, no onKeyDown, no tabIndex, no cursor rule. usage.mdx: 'Badges are independent of user action'; 'To trigger an immediate action ... Instead, use Pill' |
| `behavior.activation` | shadcn | badge.tsx binds no handler of its own; `asChild` replaces the span with the consumer's element via Slot.Root, and examples/radix/badge-link.tsx supplies <a href>. Activation is then the platform's, and the [a&]:hover styling becomes reachable at the same moment |
| `behavior.activation` | m3 | no handler can be grepped, and no interaction token exists to imply one |
| `behavior.live-region` | salt | CONFIRMED ABSENCE — no aria-live, aria-atomic or role=status. accessibility.mdx relies on the badge being read when navigated to ('the screen reader automatically announces the contents of the badge'), so a Salt badge whose count changes while unfocused announces nothing |
| `behavior.live-region` | shadcn | CONFIRMED ABSENCE — no aria-live, aria-atomic or role=status |
| `behavior.live-region` | m3 | CONFIRMED ABSENCE — no ARIA of any kind is expressible in a token file, and no live-region convention is documented in the clone |
| `slot.label` | salt | not children — see structure.label-format |
| `slot.label` | shadcn | including an icon: badge-demo.tsx puts <BadgeCheckIcon /> and a text node side by side |
| `slot.label` | m3 | the only sub-part M3's badge grammar names at all |
| `slot.host` | salt | badge.stories.tsx Icon/MaxNumber/DefaultTruncation/String/MultipleButtons/DotBadge all pass a <Button> with an icon as children. DECLARED COMPOSITION to `button` and to an icon set |
| `slot.icon` | shadcn | DECLARED COMPOSITION to a future icon-set component; shadcn's examples use lucide's BadgeCheckIcon and BookmarkIcon |
| `state.rest` | salt | the only badge of the three that looks identical in dark mode |
| `state.rest` | shadcn | near-black on near-white in light, near-white on near-black in dark |
| `state.rest` | m3 | #b3261e with #fff light, #f2b8b5 with #601410 dark |
| `state.hover` | salt | CONFIRMED ABSENCE — no :hover selector in Badge.css |
| `state.hover` | shadcn | [a&]:hover:bg-{primary,secondary,destructive}/90 (self-darken), [a&]:hover:bg-accent + text-accent-foreground (outline, ghost), [a&]:hover:underline (link) |
| `state.hover` | m3 | CONFIRMED ABSENCE — no hover token, and no state-layer family to build one from |
| `state.focus` | salt | CONFIRMED ABSENCE — no :focus or :focus-visible selector; the badge is never focusable |
| `state.focus` | shadcn | declared on an element that cannot take focus unless asChild supplies a focusable one — reproduced as source has it and flagged. The destructive variant narrows the alpha to 20% light / 40% dark |
| `state.focus` | m3 | CONFIRMED ABSENCE — and pointedly so: _md-comp-badge.scss has no focus-indicator family, where _md-comp-{elevated,filled,outlined}-card.scss and _md-comp-{primary,secondary}-navigation-tab.scss all gained one in `latest`. The badge did not, in either edition |
| `style.badge.background` | shadcn | variant=default (value[0]), read through the indirection the five variant rows reassign |
| `style.badge.background` | m3 | `color` / `large-color`, the same value for both forms |
| `style.badge.color` | m3 | `large-label-text-color`; the dot form has no label, so the declaration is inert there |
| `style.badge.font` | m3 | `large-label-text-{weight,size,line-height,font}` = label-small. Declared on the pill for both forms; inert on the dot |
| `style.badge.letter-spacing` | salt | CONFIRMED ABSENCE — Badge.css declares no letter-spacing |
| `style.badge.letter-spacing` | shadcn | CONFIRMED ABSENCE — no tracking utility |
| `style.badge.letter-spacing` | m3 | `large-label-text-tracking`. The ONE row in this component that material-web's own wrapper disowns |
| `style.badge.shape` | m3 | `shape` and `large-shape`, both corner-full, both editions |
| `style.badge.size` | salt | Badge.css `height: var(--badge-size); min-width: var(--badge-size)` with --badge-size = text-notation-lineHeight |
| `style.badge.size` | shadcn | CONFIRMED ABSENCE — see the no-size-token provenance entry; a shadcn badge is sized by its padding and line-height alone |
| `style.badge.size` | m3 | `large-size: 16px`; min-width equal to the height so a single digit renders as a circle |
| `style.badge.padding` | m3 | CONFIRMED ABSENCE — no spacing token of any kind in either edition. NO NUMBER WAS BORROWED (contrast card.m3.json's one declared 16px borrow); the consequence, that a label wider than 16px has no room, is left visible |
| `style.badge.gap` | salt | CONFIRMED ABSENCE — nothing to space |
| `style.badge.border-width` | salt | CONFIRMED ABSENCE — no border token |
| `style.badge.border-width` | shadcn | cva base `border border-transparent` — every variant carries the 1px, so switching to outline changes only a colour |
| `style.badge.border-width` | m3 | CONFIRMED ABSENCE — no outline or border token |
| `style.badge.overflow` | salt | CONFIRMED ABSENCE — no overflow rule. usage.mdx handles long labels in PROSE instead: 'avoid using a badge with more than four to six characters. If needed, truncate strings exceeding this count with an ellipsis' — a consumer instruction, not a component rule |
| `style.badge.overflow` | shadcn | cva base `overflow-hidden` — a long label is clipped to the pill's full radius |
| `style.badge.white-space` | salt | Badge.css `white-space: nowrap` |
| `style.badge.white-space` | shadcn | cva base `whitespace-nowrap` |
| `style.badge.white-space` | m3 | no token; the other two systems both declare nowrap |
| `style.badge.z-index` | shadcn | CONFIRMED ABSENCE — shadcn has no shared z-index scale (docs/foundations/layers.md) and this component sets none |
| `style.badge.z-index` | m3 | M3 has no shared z-index scale (docs/foundations/layers.md) |
| `style.badge.margin` | salt | Badge.css `margin: auto` on the pill. The pill is a flex item of the inline-flex .saltBadge wrapper, so auto centres it on the cross axis; it is deliberately NOT promoted to the chassis base, because on shadcn's and M3's wrapper-less badges an auto margin in a consumer flex row would absorb free space and push them apart |
| `style.badge.font-smoothing` | salt | Badge.css, last two declarations of .saltBadge-badge |
| `style.badge.transition` | salt | CONFIRMED ABSENCE — no transition and nothing that changes |
| `style.badge.transition` | m3 | CONFIRMED ABSENCE — no motion token |
| `style.badge.hover` | shadcn | the [a&]:hover group, expressed once over three indirection slots the variant rows reassign, so one rule carries the self-darken, the accent-pair and the underline mechanisms without restating the selector six times |
| `style.badge.focus` | shadcn | cva base `focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50`, drawn as a translucent box-shadow ring, the rendering input.shadcn.json established. NOTE: badge.tsx does NOT carry `outline-none`, unlike input.tsx, so the native outline is left alone and none is emitted here |
| `style.badge.dot` | salt | Badge.css `.saltBadge-dotBadge { height: var(--salt-size-adornment); min-width: var(--salt-size-adornment); padding: 0; --badge-size: var(--salt-size-adornment) }`. The --badge-size redeclaration is ON THE PILL, not on the wrapper, and that placement is load-bearing: style.badge.anchor's translateY reads --badge-size on the element the transform applies to (lesson 2). Reproduced with the same plac |
| `style.badge.dot` | m3 | `size: 6px`, with the same corner-full shape. Six pixels against the labelled form's sixteen |
| `style.badge.anchor` | salt | Badge.css `.saltBadge-topRight { position: absolute; right: var(--salt-spacing-100); transform: translateX(100%) translateY(calc(-1 * (var(--badge-size) / 2))) }`. No `top` is declared — the vertical placement is the static position plus a half-height lift |
| `style.badge.anchor@dot` | salt | Badge.css `.saltBadge-dotBadge.saltBadge-topRight { right: calc((var(--salt-size-adornment) / 2)) }` — the dot sits half its own width in, where the labelled form sits a full spacing-100 in |
| `style.badge.variant@secondary` | shadcn | badge.tsx `secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90"` |
| `style.badge.variant@destructive` | shadcn | badge.tsx `destructive: "bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90"` — the only variant that touches the focus ring, and the only one whose label colour is a literal rather than a token |
| `style.badge.variant@outline` | shadcn | badge.tsx `outline: "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"` — no bg-* class at all, so the fill falls back to the base's transparent; an outline badge is see-through, not white |
| `style.badge.variant@ghost` | shadcn | badge.tsx `ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground"` — the whole variant is its hover pair. No background, no border colour, no text colour: at rest it is a transparent box with an inherited colour, visible only once it is a link and hovered |
| `style.badge.variant@link` | shadcn | badge.tsx `link: "text-primary underline-offset-4 [a&]:hover:underline"` — the one variant whose hover moves text-decoration rather than a colour |
| `style.icon.box` | shadcn | cva base `[&>svg]:size-3 [&>svg]:pointer-events-none` |

</details>

<!-- END GENERATED VALUES -->
