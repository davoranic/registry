# Tabs — component template matrix

*Ninth live component in the post-clean-slate pipeline (button, calendar,
spinner, tooltip, alert, input, select, dialog came before). Same method as
[DIALOG-MATRIX.md](DIALOG-MATRIX.md) / [SELECT-MATRIX.md](SELECT-MATRIX.md) /
[INPUT-MATRIX.md](INPUT-MATRIX.md) / [TOOLTIP-MATRIX.md](TOOLTIP-MATRIX.md) /
[ALERT-MATRIX.md](ALERT-MATRIX.md) / [CALENDAR-MATRIX.md](CALENDAR-MATRIX.md):
one master template (union of all six pieces across systems), columns per
design system, rows switched on/off/inherited per column.*

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

**Tabs is the second component to ship the third gate.**
`scripts/check-tabs-behavior.mjs` follows `check-dialog-behavior.mjs`'s
contract and **adds one block**: a mechanical assertion that every
ref-reading `useEffect` in the skeleton still names its gating state in its
dependency array — the bug DIALOG-MATRIX.md's closing section found by
driving the render. Its report repeats the same honest caveat: it proves
code **exists and is bound**, not that it **runs**.

---

## Scope note

### What is in scope

- **Salt** `packages/core/src/tabs/` — the whole set: `Tabs`, `TabBar`,
  `TabList`, `Tab`, `TabTrigger`, `TabPanel`, `TabAction`, their CSS, and
  `internal/{contexts,hooks,overflow,registry}` for the behaviour contract
  and the overflow part.
- **shadcn** `apps/v4/registry/new-york-v4/ui/tabs.tsx` — all four exported
  parts plus `tabsListVariants`, built on `radix-ui`'s `Tabs`.
  `primitives/packages/react/tabs/src/tabs.tsx` read for **behaviour only**.
- **Material 3** BOTH `_md-comp-primary-navigation-tab.scss` AND
  `_md-comp-secondary-navigation-tab.scss`. As with input's filled/outlined
  text field and select's filled/outlined select, these are not two
  components: they are one canonical component with an emphasis axis,
  modelled as `prop.emphasis`. Plus material-web's own hand-authored
  `tokens/_md-comp-primary-tab.scss` and `_md-comp-secondary-tab.scss` for
  what the shipped library actually supports.

### Salt: `tabs` vs `tabs-next` — the brief was wrong, and here is what source says

**There is no `tabs-next` directory in this clone.** `find . -type d -name
'*tabs-next*'` over the whole of `salt-ds` returns nothing. What exists is
two implementations:

| | `packages/core/src/tabs` **← taken** | `packages/lab/src/tabs` |
|---|---|---|
| API | compound + context: `Tabs` / `TabBar` / `TabList` / `Tab` / `TabTrigger` / `TabPanel` / `TabAction`, keyed by a `value` registry [S] | legacy `Tabstrip`, with `useTabstrip` / `useKeyboardNavigation` / `useSelection` / `useItemsWithIds` / `drag-drop` / `useEditableItem` [S] |
| docs | `site/docs/components/tabs/index.mdx` names the package **`@salt-ds/core`** and points `sourceCodeUrl` at `.../packages/core/src/tabs` [S] | not surfaced by the site at all [S] |
| indicator | a **static** per-tab `::after`, **no transition anywhere in the CSS** [S] | a **measured sliding thumb** — `TabActivationIndicator` + `useActivationIndicator`, `transition: left 0.3s ease`, a `getBoundingClientRect` diff against the strip, a 50ms `setTimeout` to survive overflow restores [S] |

**Core is taken.** It is the compound/context generation that the `-next`
line introduced, i.e. it *is* the graduated `tabs-next`; it is what the docs
package as `@salt-ds/core`; and lab carries a whole parallel drag-drop /
editable-label layer that is not a tabs concern. The choice is load-bearing:
**taking lab would have flipped Salt's `structure.indicator-motion` cell from
`static` to `slide`**, the single most consequential cell in this matrix.

### The overflow menu is modelled here as a PART

Salt is the only system with one. `docs/COMPONENTS.md` has no `overflow-menu`
row today, but if one is ever split out, **these rows migrate wholesale** and
nothing else moves: `structure.overflow-menu`, `behavior.overflow-navigation`,
`style.overflow-list.box`, `style.overflow-item.box`,
`style.overflow-item.background@hover`. The relationship between the strip and
the menu (which tabs are collapsed) stays with `tabs`, because it is a
measurement of the strip, not a property of the menu.

### What is out of scope, and why (structural reasons, declared not dropped)

| excluded | where | structural reason |
|---|---|---|
| `toggle-group` / `segmented-control` | shadcn `ui/toggle-group.tsx`; Salt `toggle-button-group`; M3 `_md-comp-outlined-segmented-button.scss` | Its own canonical row in `docs/COMPONENTS.md` (`toggle-group`), and a genuinely different pattern: it is a **`role="group"` of independent pressed/unpressed buttons** with `aria-pressed`, optionally **multi**-select, and **no panel relationship at all** — no `aria-controls`, no `tabpanel`, no roving tabindex tied to a selected value. M3's is `outlined-segmented-button`, a *button* family with a `checkmark` token and per-segment shape logic. A tab set answers "which view am I looking at"; a segmented control answers "which options are on". Different roles, different ARIA, different token families [S]. |
| `navigation-bar` / `navigation-rail` | M3 `_md-comp-navigation-bar.scss`, `_md-comp-navigation-rail.scss` | `docs/COMPONENTS.md` puts both on the separate `navigation-menu` row. Structurally different: a bottom/side **destination switcher**, whose active-indicator is a **pill behind the icon** (`active-indicator-{width,height,shape,color}` describing a 32px-tall rounded container) rather than an edge rule, with its own `label-text` typescale, a badge family, and **no panel relationship**. Mapping M3's tab rows onto them would have collapsed two different indicator mechanisms [S]. |
| Salt `navigation-item`, `vertical-navigation` | `packages/core/src/navigation-item` | `docs/COMPONENTS.md`'s `navigation-menu` row; the tabs docs list Navigation item explicitly under `relatedComponents: [{ name: "Navigation item", relationship: "similarTo" }]` — *similar to*, not *the same as* [S]. |
| Salt lab `tabs` (Tabstrip) | `packages/lab/src/tabs` | The superseded implementation — see the table above. Read only to fix the boundary and to establish that Salt's current indicator really is static [S]. |
| shadcn's scroll/overflow affordance | — | There isn't one. Recorded as a confirmed absence rather than excluded [S]. |
| M3's stacked icon+label layout | `with-icon-and-label-text-container-height: 64px` (primary only) | Recorded on `style.tablist.min-height`, not modelled — see declared approximation 2. |

---

## Sources

- **Salt** [S]: `packages/core/src/tabs/{Tabs.tsx,Tabs.css,TabBar.tsx,TabBar.css,TabList.tsx,TabList.css,Tab.tsx,Tab.css,TabTrigger.tsx,TabTrigger.css,TabPanel.tsx,TabPanel.css,TabAction.tsx,index.ts}`;
  `.../internal/registry/useCollection.ts`; `.../internal/overflow/{TabOverflowList.tsx,TabOverflowList.css,useOverflow.ts,useRenderedTabWidth.ts,widthMeasurement.ts,TabSlot.tsx}`;
  `.../internal/contexts/*`; `.../internal/hooks/*`;
  `packages/icons/src/icon/Icon.css` (the tab glyph's box);
  `packages/theme/css/next/characteristics/{navigable,selectable,focused,container,separable,content,text}.css`;
  `packages/theme/css/next/palette/{neutral,accent,background,foreground,alpha,corner}.css`;
  `packages/theme/css/next/foundations/color.css`;
  `packages/theme/css/foundations/{size,spacing,curve,borderStyle,cursor,zindex}.css`.
  Read for the documented keyboard contract: `site/docs/components/tabs/{index,accessibility}.mdx`.
  Read for defaults and composition: `site/src/examples/tabs/{Appearance,ActiveColor,WithIcon,WithBadge,DisabledTabs,DividerAndInset,Overflow}.tsx`.
  Read only to fix the scope boundary: `packages/lab/src/tabs/{Tabstrip.tsx,TabActivationIndicator.tsx,TabActivationIndicator.css,useActivationIndicator.ts}`.
  Reused rather than re-derived: `docs/foundations/{sizes,spacing,density,typography,colors,shape,border-style,cursors,elevation,layers,motion}.md`.
- **shadcn** [S]: `apps/v4/registry/new-york-v4/ui/tabs.tsx` (canonical, sole
  source for every style cell); `apps/v4/app/globals.css` (token values);
  `apps/v4/registry/new-york-v4/examples/tabs-demo.tsx`. Read for **behavior
  only**, never for a style cell: `primitives/packages/react/tabs/src/tabs.tsx`.
- **Material 3** [S]: `tokens/versions/latest/sass/_md-comp-{primary,secondary}-navigation-tab.scss`;
  `tokens/versions/v0_192/_md-comp-{primary,secondary}-navigation-tab.scss` (edition diff);
  the hand-authored `tokens/_md-comp-{primary,secondary}-tab.scss`;
  `versions/latest/sass/{_md-sys-color.scss,_md-sys-color__dark.scss,_md-ref-palette.scss,_md-sys-state.scss,_md-sys-state-focus-indicator.scss,_md-sys-typescale.scss,_md-ref-typeface.scss,_md-sys-shape.scss,_md-sys-elevation.scss}`.
  **material-web is a tokens-only clone** — `find . -maxdepth 2 -type d`
  returns only `tokens/` — so every M3 structure and behavior row is `[R]`.

### Edition pin — `versions/latest`, and this time it is NOT a no-op

Pinned to **`tokens/versions/latest/sass`**, matching spinner, tooltip, alert,
input, select and dialog; calendar and button remain on `v0_192`. The tally
becomes **7 latest / 2 v0.192** — the minority shrinks again, the split is
still open, and it still wants one registry-wide decision. **Flagged for the
owner for the seventh time.**

Unlike dialog and select, the pin changes real output here:

1. A full mechanical key/value diff of both tab files across the two editions
   finds **zero value divergences among the shared keys**.
2. `latest` **adds** `divider-height` (1px) and `divider-color`
   (`surface-variant`) to both — and both arrive **`@deprecated`** (*"Use
   standalone divider component instead of nested tokens"*). They are
   **absent from v0.192 entirely**.
3. `latest` **also adds** `focus-indicator-color` (`secondary`),
   `focus-indicator-outline-offset` (`$inner-offset` = −3px) and
   `focus-indicator-thickness` (`$thickness` = 3px) — a **real,
   non-deprecated** family, and the **only sourced focus affordance an M3 tab
   has**, because material-web's own wrappers list `focus-state-layer-color`
   and `-opacity` under `$unsupported-tokens`. For a keyboard-navigated
   component that is decisive: on v0.192, `style.tab.focus` would have had to
   be `[R]` or off.

**The counter-argument, recorded rather than hidden.** material-web's own
`tokens/_md-comp-primary-tab.scss` and `_md-comp-secondary-tab.scss` both
`@use 'versions/v0_192/md-comp-{primary,secondary}-navigation-tab'` — **the
shipped library pins v0.192 for this exact component.** This matrix takes
`latest` for registry consistency and for the focus indicator, and records
the disagreement rather than pretending it does not exist.

**Two declared borrows**, both because the tab files are silent: **16px**
horizontal tab padding and an **8px** icon-to-label gap, `[R]` from
m3.material.io's published tabs spec, flagged individually on their cells —
the same treatment TOOLTIP-MATRIX.md gave M3's plain-tooltip padding and
DIALOG-MATRIX.md its eight basic-dialog numbers. **No token name was invented
for either.**

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| tab bar (wrapper + divider + inset) | ⚪ | **on** — `TabBar`, a real exported component rendering an outer div plus `.saltTabBar-strip`, with `divider` and `inset` boolean props [S] | **OFF — confirmed absence.** `TabsList` is the outermost strip element; no wrapper, no rule beneath it, no inset [S] | **on** — `divider-height` 1px + `divider-color` `surface-variant` describe exactly that rule [S for the tokens, R for the element]; both **`@deprecated` in `latest`, absent in v0.192** |
| tablist | 🔒 (invariant) | on — `TabList`, `role="tablist"`, always `-horizontal` [S] | on — `TabsList`, `role="tablist"`, `aria-orientation` from context [S] | on [R] — the `container-*` family |
| **tab shell** | 🔒 | **`wrapper`** — `<Tab>` is a `role="presentation"` **div** carrying every box style; `<TabTrigger>` is the `role="tab"` **button** inside it, `all: unset` with a `::before` full-size hit area [S] | **`single`** — `Primitive.button` IS the tab [S] | `single` [R] |
| **active indicator** | 🔒 | on — `.saltTab::after`, `size-indicator` tall [S] | on — the `after:*` utility group [S] | on — `active-indicator-{height,shape,color}` [S] |
| **indicator motion** | ⚪ | **`static`** — no transition anywhere in the component's CSS [S] | **`fade`** — always painted, `opacity 0 → 1` under `transition-opacity` [S] | **`slide`** [R] — see finding 6 |
| tab icon | ⚪ | **on** — an ordinary `@salt-ds/icons` glyph; the box comes from `Icon.css`, not from `Tab.css` [S] | **on** — `[&_svg:not([class*='size-'])]:size-4` [S] | **on** — `with-icon-icon-size` 24px + a full parallel colour family [S] |
| tab actions | ⚪ | **on** — `TabAction`, a composed `<Button appearance="transparent">` inside the tab but outside the button [S] | **OFF — and structurally blocked**: the trigger IS a `<button>` [S] | OFF [S] |
| tab badge | ⚪ | **on** — `WithBadge.tsx` composes `<Badge value={n} aria-hidden/>` inside the trigger [S] | OFF [S] | OFF in the tab files [S] |
| overflow menu | ⚪ | **on** — a real measurement pass and a floating vertical `role="tablist"` [S] | **OFF — confirmed absence** [S] | OFF [S] |
| panel | 🔒 | on — `TabPanel` [S] | on — `TabsContent` [S] | on [R] — **there is no panel token at all**; the families are named `navigation-tab` and describe the tab only |

### The three axes that were nearly smoothed over

**The indicator is three mechanisms, not one underline with a colour delta.**
Salt draws a per-tab `::after` and *jumps* — a grep for `transition|animation`
across all six of its CSS files returns nothing. shadcn draws a per-tab
`::after` that is **always painted** and hidden by `opacity: 0`, so it
*cross-fades in place*. M3 `[R]` slides one measured bar. Collapsing these
would have been TOOLTIP-MATRIX.md's arrow mistake with new labels; it is
modelled as `structure.indicator-motion` with a real DOM branch (per-tab span
vs one span in the strip) and a measured position written **inline on the
indicator**.

**Salt's default active mark is on the TOP edge.** `Tab.css` is explicit:
`.saltTabList-bordered .saltTab::after { top: 0 }` against
`.saltTabList-transparent .saltTab::after { bottom: 0 }`, and `appearance`
defaults to `bordered`. So a default Salt tab set is a row of **top-marked
cards joined to the panel below**, and the familiar underline only appears in
the transparent appearance. Modelled as `style.indicator.edge@contained`.

**A tab is one element in two systems and two in the third, and the reason is
HTML validity.** Salt splits `Tab` (presentation div, all the box styles) from
`TabTrigger` (the role=tab button) so `TabAction` buttons can sit inside the
tab but outside the button. Its own `accessibility.mdx` cites the W3C
"Tabs with Action Buttons" example and the aXe `aria-required-children`
warning it triggers. Rendering one element for all three would have made
Salt's action buttons impossible; rendering two for all three would have put a
spurious wrapper around every shadcn and M3 tab. The skeleton branches, and
**both shells keep the box styles on `[data-slot="tab"]`** so no style row has
to know which shell it is in.

## 2 · Behavior

**Every row below is implemented in `skeleton/tabs.tsx` and asserted by
`scripts/check-tabs-behavior.mjs`.**

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| ARIA roles | 🔒 (info) | `tablist` on the list, `tab` on the **button** (the Tab div is `presentation`), `tabpanel` on the panel [S] | `tablist` / `tab` / `tabpanel` [S] | [R] per APG |
| roving tabindex | 🔒 | **hand-rolled**: `isTabStop = !hidden && (focused \|\| selected \|\| active \|\| fallbackTabStop)`, where the fallback is *the first tab when nothing is selected* [S] | delegated to `@radix-ui/react-roving-focus`, `Item active={isSelected}` [S] | [R] |
| **arrow keys** | 🔒 | **`horizontal`, hard-coded** — `actionMap` is exactly `{ArrowRight, ArrowLeft, Home, End}`; there is **no Up/Down branch on the strip**, because Up/Down belong to the overflow menu [S] | **`orientation`** — `RovingFocusGroup` receives `context.orientation`, so Up/Down when vertical [S] | `horizontal` [R] |
| Home / End | 🔒 | on, in the same `actionMap`; documented [S] | on, via roving-focus [S] | [R] |
| wrap | ⚪ | **on** — `useCollection({ wrap: true })`, hard-coded at the call site [S] | **on** — `TabsList`'s own `loop = true` default [S] | on [R] |
| **activation mode** | ⚪ | **`manual`** — arrowing calls `element.focus({preventScroll:true})` and nothing else; selection is `onClick` and the Enter/Space branch [S] | **`automatic` by default**, prop-exposed — `onFocus` calls `onValueChange` unless `activationMode === Manual` [S] | `automatic` [R] |
| **disabled navigation** | ⚪ | **`reachable`** — `aria-disabled`, **not** the native attribute; `getNavigableItems` filters only on `location === "hidden"` and element presence [S] | **`skipped`** — `focusable={!disabled}` **plus** the native `disabled` attribute [S] | **OFF** — no disabled token exists [S] |
| pointer activation | 🔒 | **`click`** [S] | **`mousedown`**, with a `button === 0 && !ctrlKey` guard and `focus()` **before** the value change (radix-ui/primitives#3600) [S] | `click` [R] |
| `aria-controls` | 🔒 (info) | a **value → panelId registry** in context; the attribute is **undefined until a panel mounts** [S] | **derived from one `baseId`** (`${baseId}-content-${value}`), so always present [S] | [R] |
| `aria-labelledby` | 🔒 (info) | the mirror registry (`getTabId(value)`) [S] | `makeTriggerId(baseId, value)` [S] | [R] |
| **panel focusable** | ⚪ | **`conditional` and MEASURED** — `tabbable(element)` behind a rAF-debounced `MutationObserver` on childList/subtree/attributes; `tabIndex={hidden \|\| hasFocusableChildren ? undefined : 0}` [S] | **`always`** — `tabIndex={0}` hard-coded on every panel [S] | `conditional` [R], which is what APG actually prescribes |
| **panel mounting** | ⚪ | **`hidden`** — every panel always renders, inactive ones carry the `hidden` attribute [S] | **`unmount`** — `<Presence present={forceMount \|\| isSelected}>` + `{present && children}` [S] | `hidden` [R] |
| scroll into view | ⚪ | **on** — `onFocus` scrolls the **parent** (the Tab div) with `{block:"nearest", inline:"nearest"}`, and the arrow handler focuses with `preventScroll` so this is the only scroller [S] | OFF [S] | OFF [R] |
| overflow navigation | ⚪ (info) | **on** — floating popup, ResizeObserver auto-close, Shift+Tab return, Up/Down/Home/End inside. **DECLARED GAP** for the floating engine [S] | OFF [S] | OFF [S] |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| `appearance` (contained / plain) | ⚪ | **`bordered` \| `transparent`, default `bordered`** [S] | **`default` \| `line`, default `default`** (`tabsListVariants`) [S] | **`plain` only** — no selected container colour exists in either file [S] |
| `emphasis` | ⚪ | OFF | OFF | **`primary` \| `secondary`** — the two token files, five sourced differences, **no declared default** [S] |
| `orientation` | ⚪ | **`horizontal` only** — hard-coded `withBaseName("horizontal")`, no vertical rule in the CSS [S] | **`horizontal` \| `vertical`, default horizontal**, with five real style branches [S] | `horizontal` [R] |
| `activeColor` | ⚪ | **`primary` \| `secondary` \| `tertiary`, default primary** — and it reassigns **one** custom property with **one** consumer [S] | OFF [S] | OFF [S] |
| `divider` | ⚪ | **on, `default false`** — although every site example passes it [S] | OFF [S] | **on as tokens, not a prop** — always on where it exists [S] |
| `inset` | ⚪ | **on, `default false`** — `spacing-300` on the **bar**, so the divider still runs full width [S] | OFF [S] | OFF [S] |
| `disabled` | ⚪ | **on** — `aria-disabled` [S] | **on** — the native attribute [S] | **OFF — confirmed absence**, no `disabled-*` token in either file in either edition [S] |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| tab label | 🔒 | consumer-owned in all three. |
| tab icon | ⚪ | consumer-owned. **DECLARED COMPOSITION** to a future icon component. |
| tab actions | ⚪ | Salt only, consumer-owned. **DECLARED COMPOSITION** — `TabAction` *is* a `<Button appearance="transparent" sentiment="neutral">`. |
| panel content | 🔒 | consumer-owned; **no system styles the panel's contents**. |
| composes (declared) | ⬜ | **DECLARED COMPOSITION**: (a) an **icon set** — Salt's `@salt-ds/icons` glyphs and its `semantic-icon-provider` `OverflowIcon`, shadcn's lucide glyphs, M3's `with-icon` glyph; (b) **`badge`**, its own canonical row, composed inside a Salt tab; (c) **`button`**, for `TabAction` and Salt's overflow trigger; (d) the **floating engine** behind the overflow popup; (e) **`divider`**, which M3's own deprecation comment says should replace the nested tokens used here. All render as neutral placeholders. |

## 5 · States

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| selected | 🔒 | the `::after` gains accent; under `contained` the tab **also** gains a container fill and side borders — but **the label's colour and weight do not change at all** [S] | the label goes `foreground/60 → foreground`; under `contained` the tab gains `bg-background` + `shadow-sm` [S] | the label **and** icon recolour (primary / on-surface, per emphasis) and the indicator appears [S] |
| hover | ⚪ | **hovers the INDICATOR, not the label** — a **grey** (`palette-neutral`) preview of where the accent mark will land [S] | hovers the **label only**, no background in either variant [S] | a **state layer** (on-surface @ 8%) **plus** a label recolour [S] |
| focus-visible | 🔒 | 2px dotted accent-stronger on the **Tab div**, with `TabTrigger.css` killing the button's own — **plus** the same grey indicator preview. And the flag is Salt's own, not the pseudo-class: `wasMouseDown` + `event.target.getAttribute("role") === "tab"` [S] | **three layers**: `border-ring`, a 3px `ring-ring/50` shadow, and a 1px `outline-ring` [S] | a 3px **inset** ring in `secondary`, offset −3px — **`latest` only** [S] |
| disabled | ⚪ | `not-allowed` + 40% foreground, and the hover/focus indicator preview is **explicitly cancelled** [S] | `opacity: 0.5` + `pointer-events: none` [S] | **OFF** — no token [S] |
| pressed | ⚪ | **OFF on the strip** — no `:active` rule; the only one in the component belongs to the overflow list [S] | OFF [S] | **on** — a full `pressed-*` family, with an oddity: primary's `inactive-pressed-state-layer-color` is **`primary`** while its inactive hover and focus are both `on-surface` [S] |
| overflowing | ⚪ | **on** — `data-ismeasuring` plus an `@supports`-guarded `:has([data-overflowbutton])` rule capping every tab's max-width [S] | OFF [S] | OFF [S] |

## 6 · Styles — the cell matrix

All cells at each system's default: Salt `appearance="bordered"`,
`activeColor="primary"`, medium density; shadcn `variant="default"`,
horizontal; M3 the **primary** tab.

### tab bar

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| divider | ⚪ | **1px solid `separable-secondary-borderColor`** → **`rgba(0,0,0,0.3)` / `rgba(255,255,255,0.3)`**. Note the **secondary** stop (30%), a step **stronger** than the tertiary 20% Salt's dialog border uses [S] | OFF [S] | **1px `surface-variant`** → **`#e7e0ec` / `#49454f`** — an **opaque tone**, not an alpha [S] |
| inset | ⚪ | `spacing-300` → **12/24/36/48px**, on the **bar**, so the divider still runs full width [S] | OFF | OFF |

### tablist

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background | ⚪ | **`transparent`, DECLARED** [S] | **`--muted`** → `oklch(0.97 0 0)` / `oklch(0.269 0 0)` — the strip is a **tray** [S] | ⟡ `container-color` → `surface` → **`#fef7ff` / `#141218`** [S] |
| background @plain | ⚪ | OFF — transparent in both appearances [S] | **`transparent`** — the tray disappears [S] | OFF |
| colour | ⚪ | OFF — Salt colours the tab [S] | **`--muted-foreground`** on the LIST, which every trigger then overrides [S] | OFF |
| height | ⬜ | **min-height** `calc(size-base + spacing-100)` → **24/36/48/60px**, the same expression its own select *option* uses [S] | **height 36px** (`h-9`) — a **definite** height, because the trigger's `h-[calc(100%-1px)]` resolves against it [S] | **min-height 48px** (`container-height`) [S] |
| gap | ⚪ | `spacing-100` → **4/8/12/16px** — Salt tabs never touch [S] | **OFF** in the default variant — the pills are flush inside the tray [S] | **OFF** — no gap token [S] |
| gap @plain | ⚪ | OFF | **4px** (`gap-1`) [S] | OFF |
| padding | ⚪ | OFF | **3px** (`p-[3px]`) — an arbitrary value, the clearance the pill's corner needs [S] | OFF |
| shape | ⚪ | OFF — square [S] | **10px** (`rounded-lg` → the FULL `--radius`) [S] | OFF — `corner-none` is modelled on the tab [S] |
| shape @plain | ⚪ | OFF | **0** (`rounded-none`) [S] | OFF |
| @vertical | ⚪ | OFF | **`flex-direction: column; height: fit-content`** [S] | OFF |

### tab

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| font | ⬜ | **`400 12px/16px 'Open Sans'`** @medium (11/14 · 12/16 · 14/18 · 16/20). **The only one of the three at REGULAR weight** [S] | **`500 0.875rem/1.25rem`** (`text-sm font-medium`) [S] | **`500 0.875rem/1.25rem Roboto`** (`title-small`) — identical numbers to shadcn by a different route [S] |
| letter-spacing | ⚪ | **0** [S] | OFF [S] | **0.00625rem** — and material-web lists `label-text-tracking` under `$unsupported-tokens` [S] |
| colour | 🔒 | ⟡ `content-primary-foreground` → **black / white, FULL STRENGTH** [S] | **`text-foreground/60`** light, **`--muted-foreground`** dark — two different mechanisms [S] | `on-surface-variant` → **`#49454f` / `#cac4d0`** [S] |
| height | ⬜ | **min-height** `calc(size-base + spacing-100)` [S] | **`height: calc(100% - 1px)`** — one pixel short of the tray [S] | **min-height 48px** [S] |
| min-width | ⚪ | **`4em`** — a bare em literal with no override variable, the same floor its Dropdown declares. Em-relative, so not a frozen density snapshot [S] | OFF — sized by `flex-1` [S] | OFF [S] |
| flex | ⚪ | OFF — content-sized, `flex-shrink: 0` [S] | **1** — shadcn tabs divide the tray equally [S] | OFF [S] |
| padding | ⬜ | `spacing-50 spacing-100` → **2/4 · 4/8 · 6/12 · 8/16 px** [S] | **`4px 8px`** (`py-1 px-2`) — the identical numbers at Salt's medium, by coincidence of scale [S] | **`0 16px`** [R] — declared borrow |
| gap | ⬜ | `spacing-100`, declared on **both** `.saltTab` and `.saltTabTrigger` [S] | **6px** (`gap-1.5`) [S] | **8px** [R] |
| shape | ⚪ | OFF — square [S] | **8px** (`rounded-md`, a step tighter than the tray) [S] | **0** (`corner-none`) — declared and zero [S] |
| border | ⚪ | **sides only**: `border: none` + 1px transparent left/right [S] | **all four**: `border border-transparent` [S] | OFF [S] |
| overflow | ⚪ | **`hidden`** — which clips the `::after`'s own −1px extension back off; reproduced as source has it [S] | **must be absent** — its indicator sits at `bottom: -5px` [S] | OFF |
| cursor | ⚪ | **`pointer`** [S] | OFF [S] | OFF [S] |
| transition | ⚪ | **OFF — confirmed absence across all six CSS files** [S] | **`all`** 150ms [R timing] [S/R] | OFF [S] |
| @vertical | ⚪ | OFF | **`width: 100%; justify-content: flex-start`** [S] | OFF |
| colour @hover | ⚪ | **OFF — confirmed absence** [S] | `--foreground` [S] | `on-surface` [S] |
| colour @selected | ⚪ | **OFF — confirmed absence**, and it is a finding: `.saltTab-selected` touches background and borders and **never** `color` or `font-weight` [S] | `--foreground` [S] | `primary` (→ `on-surface` under secondary emphasis) [S] |
| selected fill @contained | ⚪ | **`--saltTabList-activeColor`** + the two reserved side borders recoloured to `separable-secondary` [S] | **`bg-background`** + `shadow-sm` [R value], with a **dark-only** `bg-input/30` + `border-input` pair [S] | OFF — no selected container colour [S] |
| state layer @hover | ⚪ | OFF | OFF | **`on-surface` @ 8%**, as a `linear-gradient` background-image so it composites over any fill [S] |
| state layer @focus | ⚪ | OFF | OFF | **`on-surface` @ 10%** (`latest`; v0.192 says 0.12) [S] |
| state layer @selected-hover | ⚪ | OFF | OFF | **`primary` @ 8%** (primary) / **`on-surface` @ 8%** (secondary) [S] |
| focus | 🔒 | **2px dotted** `accent-stronger` on the **Tab div** [S] | **three layers**: `border-ring` + `0 0 0 3px ring/50` + `1px outline` [S] | **3px solid `secondary` at offset −3px** — an INSET ring, `latest` only [S] |
| disabled | ⚪ | `not-allowed` + 40% foreground, **no `pointer-events: none`** [S] | `opacity: 0.5` + `pointer-events: none` [S] | OFF [S] |

### indicator

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| height | 🔒 | `size-indicator` → **2/3/4/5px** — on the **density** scale, so it really moves [S] | **2px** (`h-0.5`), density-invariant [S] | **3px** primary / **2px** secondary [S] |
| edge | 🔒 | **`left/right: -1px; bottom: 0`** [S] | **`left/right: 0; bottom: -5px`** — five pixels **below** the tab [S] | flush, `0/0/0` [S/R] |
| edge @contained | ⚪ | **`top: 0`** — Salt's **default** appearance marks the **TOP** edge [S] | OFF — it hides the mark instead of moving it [S] | OFF |
| shape | ⚪ | OFF | OFF | **`3px 3px 0 0`** primary — the top corners rounded to its own height [S] |
| rest | 🔒 | **`background: transparent`** — nothing to transition [S] | **`background: --foreground; opacity: 0`** — always painted [S] | transparent [R] |
| background @hover | ⚪ | **`palette-neutral`** `rgb(114,119,125)`, mode-invariant — **a grey preview no other system has** [S] | **OFF — confirmed absence** [S] | OFF [S] |
| background @focus-visible | ⚪ | **the same grey preview** — and with manual activation it is the *entire* visual feedback of arrowing [S] | OFF | OFF |
| selected | 🔒 | `navigable-accent-indicator-active` → **blue-500**, mode-invariant [S] | **`opacity: 1`** — the colour was already there [S] | `active-indicator-color` → **primary** [S] |
| selected @contained | ⚪ | OFF — Salt's contained appearance *shows* its mark [S] | **`opacity: 0`** — the default variant keeps a fully-formed but invisible indicator [S] | OFF |
| transition | ⚪ | **OFF — confirmed absence** [S] | **`opacity` 150ms** [R timing] [S/R] | **`left`/`width` 300ms `cubic-bezier(0.2,0,0,1)`** [R] |
| @secondary emphasis | ⚪ | OFF | OFF | **height 2px, radius 0** — the 0 supplied by material-web's own `_add-missing-secondary-tokens()` [S] |
| @vertical | ⚪ | OFF | **`inset-y-0; right: -4px; width: 2px`** — note the offset shrinks 5px → 4px [S] | OFF |

### icon / panel / overflow

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| icon size | ⚪ | **12/12/14/16px** — from `Icon.css`'s `max(size-icon, 12px)`, **not** from `Tab.css`. The high-density value is a **live clamp**, not a snapshot [S] | **16px** (`size-4`) [S] | **24px** — half again shadcn's, twice Salt's medium [S] |
| icon colour | ⚪ | **OFF in every column, and that is the finding** — see finding 9 | OFF | OFF |
| panel box | ⚪ | **`height: 100%; width: 100%`** [S] | **`flex: 1 1 0%`** [S] | OFF — **no panel token exists** [S] |
| panel outline | ⚪ | OFF | **`none`** — combined with an unconditional `tabIndex={0}`, a shadcn panel is focusable and shows no ring [S] | OFF |
| panel focus | ⚪ | **2px dotted accent-stronger** — the exact inverse of shadcn [S] | OFF | OFF |
| overflow list | ⚪ | **framed in the ACCENT** (`selectable-borderColor-selected` → blue-500), `palette-corner` 3/6/9/12, `shadow-mediumLow`, `z-index: 1500`, a five-row max-height, 1px `spacing-fixed-100` item gap [S] | OFF | OFF |
| overflow item | ⚪ | the **same Tab element restyled**: transparent background, left-aligned, `spacing-100` side padding, **`::after { display: none }`** [S] | OFF | OFF |
| overflow item @hover | ⚪ | `selectable-background-hover` → **blue-100 / blue-900** — a tab in the menu behaves like an **Option**, not like a tab [S] | OFF | OFF |

### the axes, as generated rows

| row | Salt | shadcn | Material 3 |
|---|---|---|---|
| `style.tab.active-color@secondary` | **on** — `--active-color: marble / granite` [S] | OFF | OFF |
| `style.tab.active-color@tertiary` | **on** — `limestone / leather` [S] | OFF | OFF |
| `style.tab.emphasis@secondary` | OFF | OFF | **on** — reassigns `--tab-fg-active` and `--layer-active` [S] |
| `style.indicator.emphasis@secondary` | OFF | OFF | **on** — height 2px, radius 0 [S] |

**Accent scope trim.** `navigable-accent-indicator-active` and
`selectable-borderColor-selected` resolve through `palette-accent`, which has
a `data-accent` axis (`blue` default, `teal` alternate). This column pins
**blue**, matching `button/input/select/dialog.salt.json`; only
`calendar.salt.json` models `byAccent`. Recorded, not modelled.

---

## Declared approximations in the chassis

Four, all stated rather than smoothed:

1. **Tablist width.** shadcn's `TabsList` is `inline-flex w-fit`; Salt's is
   `flex: 0 1 auto` inside a row strip, which is content-sized for the same
   reason; M3 has no width token. The skeleton's `base` gives every tablist
   `width: fit-content` + `max-width: 100%`, because the outcome converges and
   no sourced value differs. Declared here; not modelled as an axis.
2. **M3's stacked icon layout.** `with-icon-and-label-text-container-height`
   is **64px** on the primary tab, because M3's spec centres the glyph
   **above** the label. The skeleton lays icon and label in a **row** for all
   three, because material-web is a tokens-only clone with no component and no
   layout token to source the stack from. Flagged as the one place an M3
   render will read wrong to a Material-trained eye.
3. **M3's pressed state.** `state.pressed` is documented as a real M3 token
   family and is **not implemented** — the skeleton has no press affordance
   for any system, because Salt's strip has no `:active` rule and shadcn has
   none either, so a press layer would exist for exactly one column with no
   cross-system contract. Declared as a coverage gap, not modelled.
4. **`aria-disabled` on an M3 tab.** M3 has no disabled token, so
   `prop.disabled` is off in that column — but the skeleton still writes
   `aria-disabled` for an instance marked disabled, because "M3 does not
   tokenise the state" is not the same as "an M3 tab can never be disabled",
   and dropping the ARIA would be an accessibility regression invented by the
   registry. The *styling* really is absent, as source says.

---

## Findings from building this matrix

1. **The brief's `tabs-next` does not exist, and the choice it hid was the
   biggest cell in the matrix.** `find . -type d -name '*tabs-next*'` over
   `salt-ds` returns nothing. There are two implementations — `core/src/tabs`
   and `lab/src/tabs` — and they disagree about the single most visible thing
   a tab set does: **lab's indicator is a measured sliding thumb** with
   `transition: left 0.3s ease`, **core's is a static per-tab `::after` with
   no transition anywhere**. Core is taken (the docs package it as
   `@salt-ds/core` and point `sourceCodeUrl` at it; it is the graduated
   compound/context generation). Had the brief been followed on faith, the
   grader would have had to guess which directory `tabs-next` meant, and half
   the guesses produce a Salt column that slides.
2. **The two live systems answer "does focus select?" in opposite ways, and
   nothing visual shows it.** Salt is **manual**: `TabList`'s arrow handler
   calls `element.focus({preventScroll:true})` and stops; `TabTrigger`'s
   `onFocus` records the active tab and scrolls it into view but never calls
   `setSelected`. Radix is **automatic by default**:
   `activationMode = ActivationMode.Automatic` and `onFocus` calls
   `onValueChange`. Arrow across a shadcn tab bar and every panel in turn
   mounts; arrow across a Salt one and nothing happens until you press Enter.
   A screenshot cannot see this, the generator cannot see this, and the axis
   audit cannot see this — which is the entire argument for
   `check-tabs-behavior.mjs`.
3. **They also disagree about whether a disabled tab is reachable, and both
   are defensible.** Salt writes `aria-disabled` (not the native attribute),
   never consults `disabled` when computing the tab stop, and its
   `getNavigableItems` filters only on `location === "hidden"` — so arrow keys
   **land on** a disabled Salt tab and activation is blocked separately
   (`onClick` undefined, Enter/Space `preventDefault`ed). Radix passes
   `focusable={!disabled}` to the roving group **and** sets the native
   `disabled` attribute — arrows **step over** it. Modelled as
   `behavior.disabled-navigation: "reachable" | "skipped"` with a real
   skeleton branch. M3 has no disabled token at all, so its cell is off rather
   than guessed.
4. **Salt's default active mark is on the TOP edge, not the bottom.**
   `.saltTabList-bordered .saltTab::after { top: 0 }` versus
   `.saltTabList-transparent .saltTab::after { bottom: 0 }`, with `appearance`
   defaulting to `bordered`. The near-universal expectation is that a tab is
   underlined; Salt's default is a **top-marked card joined to the panel**.
   This was grepped twice for the same reason DIALOG-MATRIX.md finding 1
   grepped the white scrim twice.
5. **Salt does not change a selected tab's text — at all.**
   `.saltTab.saltTab-selected` and `.saltTabList-bordered .saltTab.saltTab-selected`
   between them set `background`, `border-left`, `border-right` and the
   `::after` fill. Neither touches `color`; neither touches `font-weight`. And
   the resting colour is **full-strength** `content-primary-foreground`, where
   shadcn dims to 60% and M3 uses `on-surface-variant`. So Salt is the only
   system whose unselected tabs are as loud as its selected one, and the only
   one whose labels are **regular weight** (shadcn `font-medium`, M3
   `title-small` — both 500). Three systems, three different ideas of how a
   tab announces itself, and none of them is "make it bold".
6. **Three indicator mechanisms, and one of them is the largest `[R]` in this
   matrix.** Salt: a per-tab pseudo with **no transition anywhere** — it
   jumps. shadcn: a per-tab pseudo that is **always painted** and hidden with
   `opacity: 0`, cross-fading in place under `after:transition-opacity` — and
   only in the `line` variant, so the `default` variant's selected pill has a
   fully-formed **invisible** underline underneath it (which is why
   `style.indicator.selected@contained` exists). M3: `slide`, and there is
   **no motion token and no component in the clone to grep**. It is set to
   `slide` because a static M3 tab set reads wrong to a Material eye and
   because collapsing three mechanisms is the tooltip-arrow mistake — but it
   is a one-cell change to `static` (plus switching
   `style.indicator.transition` off) if the owner disagrees. Flagged as such
   in `tabs.m3.json`'s provenance.
7. **Salt previews the mark on hover, in a different colour, and no other
   system does anything like it.** `.saltTab:hover::after,
   .saltTab-focusVisible::after { background: var(--salt-navigable-indicator-hover) }`
   → `palette-neutral` = grey-500, mode-invariant. Hovering a Salt tab paints
   a **grey ghost of the accent mark in exactly the place the accent one will
   land**. shadcn moves the label colour and has no indicator hover at all;
   M3 draws a state layer. And because Salt's activation is manual, that grey
   preview is the *entire* visual feedback of arrowing across the strip —
   dropping it would have made a keyboard user unable to see where they are.
8. **A tab is two elements in Salt for an HTML-validity reason, and that is
   why `TabAction` exists.** `Tab` is a `role="presentation"` div carrying
   every box style; `TabTrigger` is the `role="tab"` button inside it,
   `all: unset` with a `::before { position: absolute; inset: 0 }` so a press
   anywhere on the tab still activates. The split lets `TabAction` render a
   real `<Button>` *inside the tab* but *outside the button*. Salt's own
   `accessibility.mdx` names the W3C "Tabs with Action Buttons" example and
   openly documents the aXe `aria-required-children` violation it accepts.
   shadcn structurally cannot do this — its trigger IS the button.
9. **M3 declares thirteen icon-colour tokens that are all duplicates of the
   label colour.** `with-icon-{active,inactive}-{,focus,hover,pressed}-icon-color`
   — eight on primary, five on secondary — and **every one resolves to the
   same role as the label colour in the same state** (`on-surface-variant`
   inactive, `primary`/`on-surface` active, `on-surface` hovered). A
   `currentColor` glyph is therefore not an approximation, it is the identical
   output. `style.tab-icon.color` is off in all three columns with the
   reasoning recorded, so a future reader does not add thirteen dead rows.
10. **Frozen-token check, run in both directions, found one live clamp and one
    genuine density move.** Salt's tab glyph has **no size rule in
    `Tab.css`** — the box comes from `Icon.css`'s `max(calc(var(--salt-size-icon)
    * 1), 12px)`, so 12/12/14/16px: the high-density value is a **live floor**
    (Salt's documented 12px readability minimum), not a snapshot, and copying
    `size-icon` blindly would have made it 10px. That is SELECT-MATRIX.md
    finding 9's chevron result, re-verified rather than assumed.
    `--salt-size-indicator` is on the **density** scale (2/3/4/5px), so the
    mark really does thicken — snapshotting the medium 3px would have been
    wrong at three of four densities. Everything else checked out as
    density-invariant **by design**: `size-fixed-100` (the 1px reserved side
    borders, the `-1px` indicator inset, the bar divider) and
    `spacing-fixed-100` (the 1px overflow-item gap) are on the *fixed* scales
    per `docs/foundations/sizes.md` and `spacing.md`. `min-width: 4em` is
    em-relative and already tracks the density-driven font size.
11. **material-web pins v0.192 for tabs while this matrix pins `latest`, and
    the disagreement is stated rather than smoothed.**
    `tokens/_md-comp-primary-tab.scss` and `_md-comp-secondary-tab.scss` both
    `@use 'versions/v0_192/md-comp-*-navigation-tab'`. `latest` nevertheless
    adds the **only sourced focus affordance an M3 tab has**
    (`focus-indicator-{color,thickness,outline-offset}`), which matters
    disproportionately for a keyboard-navigated component — and material-web
    separately disowns the focus **state layer** (`$unsupported-tokens`), so
    on v0.192 an M3 tab would have had *no* sourced focus treatment at all.
    Pinned to `latest`, disagreement recorded. This is SELECT-MATRIX.md
    finding 6 and DIALOG-MATRIX.md finding 8 recurring for the third time: the
    generated token file and the shipped library are two different sources and
    they do not always agree.
12. **A foundations page is edition-stale, and the grep says so.**
    `docs/foundations/state-layers.md` tabulates M3's state-layer opacities as
    hover 0.08, **focus 0.12, pressed 0.12**, dragged 0.16, without naming an
    edition. Those are the **v0.192** values
    (`versions/v0_192/_md-sys-state.scss`). In
    `versions/latest/sass/_md-sys-state.scss` focus and pressed are **both
    0.1**. This matrix pins `latest` and uses 0.08 / 0.10 — which is also what
    `select.m3.json` already used for its menu focus layer, so the divergence
    has been live in the registry for two components. **Reported, not edited**
    (lesson 9): the page is shared, and the fix is to name the edition, not to
    change the numbers from a component build.
13. **Axis self-audit (run deliberately, per ALERT-MATRIX.md finding 10).**
    Every `channel: "config"` row whose cell is a list of 2+ values, and what
    discriminates each value:
    - **`prop.appearance`** — Salt `[contained, plain]`, shadcn
      `[contained, plain]`: discriminated by `style.tablist.background@plain`,
      `.gap@plain`, `.shape@plain`, `style.tab.selected-fill@contained`,
      `style.indicator.edge@contained` and
      `style.indicator.selected@contained` — six real CSS blocks, of which
      Salt uses two and shadcn five. Listed **default-first** in both (Salt
      `bordered`, shadcn `default`), because the skeleton and the harness take
      `value[0]` as the resting state and a plain-first list would have made
      every Salt tab set render as the transparent variant and every shadcn
      one as `line`. M3 is single-valued (`[plain]`), so nothing is
      undiscriminated.
    - **`prop.emphasis`** — M3 `[primary, secondary]`: discriminated by
      `style.tab.emphasis@secondary` (reassigning `--tab-fg-active` and
      `--layer-active`) and `style.indicator.emphasis@secondary` (height and
      radius) — two real blocks moving four properties. **No source default
      exists**, so the list is in the spec's own order and the absence is
      recorded rather than a default invented.
    - **`prop.orientation`** — shadcn `[horizontal, vertical]`: discriminated
      by `style.tablist.orientation@vertical`, `style.tab.orientation@vertical`
      and `style.indicator.orientation@vertical` — **and** by a behaviour
      branch, since `behavior.arrow-keys: "orientation"` changes which keys
      navigate. Listed default-first. Salt `[horizontal]` and M3
      `[horizontal]` are single-valued.
    - **`prop.active-color`** — Salt `[primary, secondary, tertiary]`:
      discriminated by `style.tab.active-color@secondary` and `@tertiary`,
      each reassigning the single `--active-color` property the
      `selected-fill@contained` rule consumes — the source's own indirection.
      Listed **default-first** (`primary`).
    - **`prop.disabled`** — Salt and shadcn `[true, false]`: `false` is the
      base rendering; `true` is discriminated by `style.tab.disabled` (two
      different mechanisms — a recolour vs a blanket dim) **and** by the
      `behavior.disabled-navigation` skeleton branch. M3 is off.
    - **`behavior.activation-mode`** — shadcn `[automatic, manual]`, the only
      behaviour row with a 2-value list: discriminated by a **skeleton
      branch** (`onFocus` commits or does not) and exposed as a harness
      toggle so it can actually be exercised. Listed **default-first**
      (`automatic`), because Radix's default is automatic and a manual-first
      list would have made shadcn behave like Salt against source. Salt
      `[manual]` and M3 `[automatic]` are single-valued.
    - **Single-valued across every column, so nothing to discriminate:**
      `structure.tab-shell`, `structure.active-indicator`,
      `structure.indicator-motion` (three values, but one per column — each
      discriminated by a distinct DOM branch plus `style.indicator.rest`,
      `.selected` and `.transition`), `structure.panel`,
      `behavior.roving-tabindex`, `.arrow-keys`, `.home-end`, `.wrap`,
      `.disabled-navigation`, `.pointer-activation`, `.panel-focusable`,
      `.panel-mounting`, `.scroll-into-view`, and the boolean
      `structure.*` / `prop.divider` / `prop.inset` rows.
    **Result: no dead axis values, and every list is source-default-first.**
    The rows that are off in every column (`style.tab-icon.color`) are
    retained deliberately as documentation of finding 9.
14. **The third gate got a new block, aimed at the bug that got past it last
    time.** `check-dialog-behavior.mjs` passed two behaviour rows whose
    effects never executed, because a `useEffect` read a ref to a
    conditionally-rendered node and its dependency array omitted the state
    gating that node. `check-tabs-behavior.mjs` therefore adds a
    `REF_EFFECT_GUARDS` block that asserts, by literal source match, that each
    of the skeleton's four ref-reading effects still carries the dependency
    array that names its gate — the overflow measurement (`visibleCount`,
    `menuOpen`), the slide-indicator measurement (`visibleCount`, and
    `selected` through `positionSlider`), the panel-focusable measurement
    (`selected`), and the overflow-menu open/dismiss effect (`menuOpen`).
    **It is still not a conformance harness, and the script says so in its own
    closing line**: it checks that a dependency array *looks* right; it cannot
    observe a render. The outstanding half is unchanged — drive the skeleton
    in a DOM and assert that arrows move focus, that automatic mode swaps the
    panel and manual mode does not, that a disabled tab is landed on or
    stepped over per the column, that Home/End reach the ends, that the panel
    is a tab stop only when it should be, and that the overflow menu opens,
    navigates, commits and closes. Logged for the owner alongside
    SELECT-MATRIX.md findings 13–16.

15. **A SECOND false positive, found 2026-08-05 in `harness/conformance.tsx`'s
    later, separate `checkTabs()` — not the same bug as finding 14's hidden-
    tab focus-event issue, and not a regression of it.** Once `checkbox`
    wired up the shared conformance harness (see CLAUDE.md's Known-open
    work), it started reporting `tabs`/shadcn/`behavior.activation-mode` as
    failing — "automatic: selection held" — and it stayed queued as
    unexplained for three components. Root cause: the assertion immediately
    ABOVE it in the same function (`behavior.disabled-navigation`) already
    moves real DOM focus to `tabs()[2]` for any column whose
    `disabledNavigation` is `"skipped"` (shadcn's), and for an automatic-
    activation column that focus move ALSO already committed the selection.
    The activation-mode assertion then re-focused that SAME already-focused
    tab — a browser no-op, since refocusing an already-focused element
    fires no new `focus` event — so `before === after` and the assertion
    read it as "held", exactly mimicking a real failure. Confirmed with a
    from-scratch isolated repro (a fresh mount, no prior test): the
    identical skeleton, identical config, resolves the transition correctly
    every time when nothing has already consumed the focus move.
    **The general lesson, distinct from finding 14's:** a shared, multi-
    assertion test function can silently invalidate a later assertion's own
    precondition. Testing a transition (CLAUDE.md's own method note) is
    necessary but not sufficient — the test also has to guarantee it is
    causing a REAL transition, not observing the tail end of one an earlier
    assertion already caused. Fixed by having the assertion explicitly
    return focus to a neutral tab first, so the move to its actual target is
    always a genuine, event-firing transition regardless of what ran before
    it. Re-verified: all three columns now correctly discriminate (salt
    manual: held; shadcn/M3 automatic: moved), conformance 107/107.

## Validation pass — behaviours driven in a real DOM, and a false positive worth recording

Every keyboard behaviour was exercised against the built harness rather than
read. Results: roving tabindex correct (exactly one `tabindex="0"` per strip,
all three); Salt manual activation moves focus without committing; shadcn
automatic activation commits on focus; shadcn commits on **mousedown** and
correctly ignores a bare `click` (Radix's real pointer contract, so a `.click()`
test that "fails" is the test being wrong); the disabled-tab divergence is real
and correct — `ArrowRight` from Transactions **lands on** the disabled Loans in
Salt and **steps over** it to Checks in shadcn; `End`/`Home` reach both ends.

**The false positive, and why it matters more than the passes.** Automatic
activation initially appeared broken: focus moved to a tab and the panel did
not follow, in three separate probes, including a direct `element.focus()`
with no keyboard involved. The obvious reading was a real bug of exactly the
shape DIALOG-MATRIX.md had just described. It was not. The harness runs in a
**background/hidden tab** — `document.hasFocus() === false`,
`document.visibilityState === "hidden"` — and in that state a browser will set
`document.activeElement` on a programmatic `.focus()` while **suppressing the
focus event entirely**. Zero `focus` listeners fired even on a clean
cross-element transition. The component was correct the whole time;
dispatching a synthetic bubbling `focusin` (which is what React delegates on)
selected the tab immediately.

Two consequences for anyone driving behaviour in this harness:

- **`activeElement` is trustworthy in a hidden tab; focus *events* are not.**
  Assertions about where focus *is* survive. Assertions about anything that
  reacts *to focus arriving* — automatic activation, focus-visible rings,
  focus-triggered popups — need a synthetic `focusin`, or the environment
  produces a convincing false negative.
- **This does not retroactively weaken the dialog finding.** That bug was
  diagnosed on `panel.contains(document.activeElement)`, the half of the API
  that still works here, and the assertion flipped from false to true only
  after the dependency-array fix. Different mechanism, still sound.

The broader point, third component running: a conformance harness is the only
gate that catches these — but a *naive* one manufactures its own bugs. It has
to know which browser APIs degrade when the page is not frontmost, or it will
send someone chasing a defect that does not exist.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/tabs.template.json` against every system, read from `columns/tabs.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 13 light, 9 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `surface-primary` | rgb(255, 255, 255) | rgb(16, 24, 32) | **no** |
| `surface-secondary` | rgb(245, 247, 248) | rgb(26, 34, 41) | **no** |
| `surface-tertiary` | rgb(250, 248, 242) | rgb(38, 41, 43) | **no** |
| `active-color` | var(--surface-primary) | — | yes |
| `fg` | rgb(0, 0, 0) | rgb(255, 255, 255) | **no** |
| `fg-disabled` | rgba(0, 0, 0, 0.4) | rgba(255, 255, 255, 0.4) | **no** |
| `divider` | rgba(0, 0, 0, 0.3) | rgba(255, 255, 255, 0.3) | yes |
| `indicator-hover` | rgb(114, 119, 125) | — | yes |
| `indicator-active` | rgb(0, 120, 207) | — | yes |
| `accent` | rgb(0, 120, 207) | — | **no** |
| `accent-weakest` | rgb(234, 246, 255) | rgb(0, 23, 54) | **no** |
| `focus-outline` | 2px dotted rgb(0, 69, 126) | 2px dotted rgb(154, 189, 245) | yes |
| `popup-shadow` | 0 6px 10px 0 rgba(0, 0, 0, 0.2) | 0 6px 10px 0 rgba(0, 0, 0, 0.55) | yes |

**shadcn** — 10 light, 8 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `muted` | oklch(0.97 0 0) | oklch(0.269 0 0) | **no** |
| `tablist-fg` | oklch(0.556 0 0) | oklch(0.708 0 0) | **no** |
| `fg` | oklch(0% 0 0) | oklch(0.985 0 0) | **no** |
| `tab-fg` | color-mix(in oklab, oklch(0% 0 0) 60%, transparent) | oklch(0.708 0 0) | **no** |
| `tab-active-bg` | oklch(1 0 0) | color-mix(in oklab, oklch(1 0 0 / 15%) 30%, transparent) | **no** |
| `tab-active-border` | transparent | oklch(1 0 0 / 15%) | **no** |
| `ring` | oklch(0.708 0 0) | oklch(0.556 0 0) | **no** |
| `ring-shadow` | 0 0 0 3px color-mix(in oklab, oklch(0.708 0 0) 50%, transparent) | 0 0 0 3px color-mix(in oklab, oklch(0.556 0 0) 50%, transparent) | **no** |
| `shadow-sm` | 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) | — | yes |
| `type-tab` | 500 0.875rem/1.25rem ui-sans-serif, system-ui, sans-serif | — | yes |

**m3** — 10 light, 9 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `surface` | #fef7ff | #141218 | yes |
| `fg` | #1d1b20 | #e6e0e9 | **no** |
| `fg-variant` | #49454f | #cac4d0 | **no** |
| `tab-fg-active` | #6750a4 | #d0bcff | yes |
| `indicator-active` | #6750a4 | #d0bcff | yes |
| `focus-ring` | #625b71 | #ccc2dc | yes |
| `layer-hover` | color-mix(in srgb, #1d1b20 8%, transparent) | color-mix(in srgb, #e6e0e9 8%, transparent) | **no** |
| `layer-focus` | color-mix(in srgb, #1d1b20 12%, transparent) | color-mix(in srgb, #e6e0e9 12%, transparent) | **no** |
| `layer-active` | color-mix(in srgb, #6750a4 8%, transparent) | color-mix(in srgb, #d0bcff 8%, transparent) | **no** |
| `type-tab` | 500 0.875rem/1.25rem Roboto, sans-serif | — | yes |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.tab-bar` | structure | switchable | `True` | **off** | **off** |
| 2 | `structure.tab-shell` | structure | locked | `wrapper` | `single` | `single` |
| 3 | `structure.active-indicator` | structure | locked | `True` | `True` | `True` |
| 4 | `structure.indicator-motion` | structure | switchable | `static` | `fade` | `slide` |
| 5 | `structure.tab-icon` | structure | switchable | `True` | `True` | `True` |
| 6 | `structure.tab-actions` | structure | switchable | `True` | **off** | **off** |
| 7 | `structure.tab-badge` | structure | switchable | `True` | **off** | **off** |
| 8 | `structure.overflow-menu` | structure | switchable | `True` | **off** | **off** |
| 9 | `structure.panel` | structure | locked | `True` | `True` | `True` |
| 10 | `behavior.role` | behavior | locked | — | — | — |
| 11 | `behavior.roving-tabindex` | behavior | locked | `True` | `True` | `True` |
| 12 | `behavior.arrow-keys` | behavior | locked | `horizontal` | `orientation` | `horizontal` |
| 13 | `behavior.home-end` | behavior | locked | `True` | `True` | `True` |
| 14 | `behavior.wrap` | behavior | switchable | `True` | `True` | `True` |
| 15 | `behavior.activation-mode` | behavior | switchable | `manual` | `automatic, manual` | `automatic` |
| 16 | `behavior.disabled-navigation` | behavior | switchable | `reachable` | `skipped` | **off** |
| 17 | `behavior.pointer-activation` | behavior | locked | `click` | `mousedown` | `click` |
| 18 | `behavior.controls` | behavior | locked | — | — | — |
| 19 | `behavior.labelled-by` | behavior | locked | — | — | — |
| 20 | `behavior.panel-focusable` | behavior | switchable | `conditional` | `always` | `conditional` |
| 21 | `behavior.panel-mounting` | behavior | switchable | `hidden` | `unmount` | `hidden` |
| 22 | `behavior.scroll-into-view` | behavior | switchable | `True` | **off** | **off** |
| 23 | `behavior.overflow-navigation` | behavior | switchable | `True` | **off** | **off** |
| 24 | `prop.appearance` | prop | switchable | `contained, plain` | `contained, plain` | `plain` |
| 25 | `prop.emphasis` | prop | switchable | **off** | **off** | `primary, secondary` |
| 26 | `prop.orientation` | prop | switchable | `horizontal` | `horizontal, vertical` | `horizontal` |
| 27 | `prop.active-color` | prop | switchable | `primary, secondary, tertiary` | **off** | **off** |
| 28 | `prop.divider` | prop | switchable | `True` | **off** | **off** |
| 29 | `prop.inset` | prop | switchable | `True` | **off** | **off** |
| 30 | `prop.disabled` | prop | switchable | `True, False` | `True, False` | **off** |
| 31 | `slot.tab-label` | slot | locked | — | — | — |
| 32 | `slot.tab-icon` | slot | switchable | `True` | `True` | `True` |
| 33 | `slot.tab-actions` | slot | switchable | `True` | **off** | **off** |
| 34 | `slot.panel-content` | slot | locked | — | — | — |
| 35 | `slot.composes` | slot | default | — | — | — |
| 36 | `state.selected` | state | locked | — | — | — |
| 37 | `state.hover` | state | switchable | `True` | `True` | `True` |
| 38 | `state.focus-visible` | state | locked | — | — | `True` |
| 39 | `state.disabled` | state | switchable | `True` | `True` | **off** |
| 40 | `state.pressed` | state | switchable | **off** | **off** | `True` |
| 41 | `state.overflowing` | state | switchable | `True` | **off** | **off** |
| 42 | `style.tab-bar.divider` | style | switchable | `border-bottom: 1px solid var(--divider)` | **off** | **off** |
| 43 | `style.tab-bar.inset` | style | switchable | ⟡ `inset-padding` | **off** | **off** |
| 44 | `style.tablist.background` | style | switchable | `transparent` | ⟡ `muted` | ⟡ `surface` |
| 45 | `style.tablist.background@plain` | style | switchable | **off** | `transparent` | **off** |
| 46 | `style.tablist.color` | style | switchable | **off** | ⟡ `tablist-fg` | **off** |
| 47 | `style.tablist.min-height` | style | default | `min-height: var(--tab-min-height)` | `height: 36px` | `min-height: 48px` |
| 48 | `style.tablist.gap` | style | switchable | ⟡ `list-gap` | **off** | **off** |
| 49 | `style.tablist.gap@plain` | style | switchable | **off** | `4px` | **off** |
| 50 | `style.tablist.padding` | style | switchable | **off** | `3px` | **off** |
| 51 | `style.tablist.shape` | style | switchable | **off** | `10px` | **off** |
| 52 | `style.tablist.shape@plain` | style | switchable | **off** | `0` | **off** |
| 53 | `style.tablist.orientation@vertical` | style | switchable | **off** | `flex-direction: column; height: fit-content` | **off** |
| 54 | `style.tab.font` | style | default | ⟡ `type-tab` | ⟡ `type-tab` | ⟡ `type-tab` |
| 55 | `style.tab.letter-spacing` | style | switchable | `0` | **off** | `0.00625rem` |
| 56 | `style.tab.color` | style | locked | ⟡ `fg` | ⟡ `tab-fg` | ⟡ `fg-variant` |
| 57 | `style.tab.height` | style | default | `min-height: var(--tab-min-height)` | `height: calc(100% - 1px)` | `min-height: 48px` |
| 58 | `style.tab.min-width` | style | switchable | `4em` | **off** | **off** |
| 59 | `style.tab.flex` | style | switchable | **off** | `1` | **off** |
| 60 | `style.tab.padding` | style | default | ⟡ `tab-padding` | `4px 8px` | `0 16px` |
| 61 | `style.tab.gap` | style | default | ⟡ `tab-gap` | `6px` | `8px` |
| 62 | `style.tab.shape` | style | switchable | **off** | `8px` | `0` |
| 63 | `style.tab.border` | style | switchable | `border: none; border-left: 1px solid transparent; border-right: 1px solid transparent` | `border: 1px solid transparent` | **off** |
| 64 | `style.tab.overflow` | style | switchable | `hidden` | **off** | **off** |
| 65 | `style.tab.cursor` | style | switchable | `pointer` | **off** | **off** |
| 66 | `style.tab.transition` | style | switchable | **off** | `all 150ms cubic-bezier(0.4, 0, 0.2, 1)` | **off** |
| 67 | `style.tab.orientation@vertical` | style | switchable | **off** | `width: 100%; justify-content: flex-start` | **off** |
| 68 | `style.tab.color@hover` | style | switchable | **off** | ⟡ `fg` | ⟡ `fg` |
| 69 | `style.tab.color@selected` | style | switchable | **off** | ⟡ `fg` | `var(--tab-fg-active)` |
| 70 | `style.tab.selected-fill@contained` | style | switchable | `background: var(--active-color); border-left-color: var(--divider); border-right-color: var(--divider)` | `background: var(--tab-active-bg); border-color: var(--tab-active-border); box-shadow: var(--shadow-sm)` | **off** |
| 71 | `style.tab.state-layer@hover` | style | switchable | **off** | **off** | `background-image: linear-gradient(var(--layer-hover), var(--layer-hover))` |
| 72 | `style.tab.state-layer@focus` | style | switchable | **off** | **off** | `background-image: linear-gradient(var(--layer-focus), var(--layer-focus))` |
| 73 | `style.tab.state-layer@selected-hover` | style | switchable | **off** | **off** | `background-image: linear-gradient(var(--layer-active), var(--layer-active))` |
| 74 | `style.tab.focus` | style | locked | `outline: var(--focus-outline)` | `border-color: var(--ring); box-shadow: var(--ring-shadow); outline: 1px solid var(--ring)` | `outline: 3px solid var(--focus-ring); outline-offset: 0px` |
| 75 | `style.tab.disabled` | style | switchable | `cursor: not-allowed; color: var(--fg-disabled)` | `opacity: 0.5; pointer-events: none` | **off** |
| 76 | `style.tab.active-color@secondary` | style | switchable | `--active-color: var(--surface-secondary)` | **off** | **off** |
| 77 | `style.tab.active-color@tertiary` | style | switchable | `--active-color: var(--surface-tertiary)` | **off** | **off** |
| 78 | `style.tab.emphasis@secondary` | style | switchable | **off** | **off** | `--tab-fg-active: var(--fg); --layer-active: var(--layer-hover)` |
| 79 | `style.indicator.size` | style | locked | ⟡ `indicator-height` | `2px` | `3px` |
| 80 | `style.indicator.edge` | style | locked | `left: -1px; right: -1px; bottom: 0` | `left: 0; right: 0; bottom: -5px` | `left: 0; right: 0; bottom: 0` |
| 81 | `style.indicator.edge@contained` | style | switchable | `top: 0; bottom: auto` | **off** | **off** |
| 82 | `style.indicator.shape` | style | switchable | **off** | **off** | `3px 3px 0px 0px` |
| 83 | `style.indicator.rest` | style | locked | `background: transparent` | `background: var(--fg); opacity: 0` | `background: transparent` |
| 84 | `style.indicator.background@hover` | style | switchable | ⟡ `indicator-hover` | **off** | **off** |
| 85 | `style.indicator.background@focus-visible` | style | switchable | ⟡ `indicator-hover` | **off** | **off** |
| 86 | `style.indicator.selected` | style | locked | `background: var(--indicator-active)` | `opacity: 1` | `background: var(--indicator-active)` |
| 87 | `style.indicator.selected@contained` | style | switchable | **off** | `opacity: 0` | **off** |
| 88 | `style.indicator.transition` | style | switchable | **off** | `opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)` | `left 300ms cubic-bezier(0.2, 0, 0, 1), width 300ms cubic-bezier(0.2, 0, 0, 1)` |
| 89 | `style.indicator.emphasis@secondary` | style | switchable | **off** | **off** | `height: 2px; border-radius: 0` |
| 90 | `style.indicator.orientation@vertical` | style | switchable | **off** | `top: 0; bottom: 0; left: auto; right: -4px; width: 2px; height: auto` | **off** |
| 91 | `style.tab-icon.size` | style | switchable | `width: var(--icon-size); height: var(--icon-size)` | `width: 16px; height: 16px` | `width: 24px; height: 24px` |
| 92 | `style.tab-icon.color` | style | switchable | **off** | **off** | **off** |
| 93 | `style.panel.box` | style | switchable | `height: 100%; width: 100%` | `flex: 1 1 0%` | **off** |
| 94 | `style.panel.outline` | style | switchable | **off** | `none` | **off** |
| 95 | `style.panel.focus` | style | switchable | ⟡ `focus-outline` | **off** | **off** |
| 96 | `style.overflow-list.box` | style | switchable | `background: var(--surface-primary); border: 1px solid var(--accent); border-radius: var(--popup-shape); box-shadow: var(--popup-shadow); max-height: var(--popup-max-height); gap: var(--popup-gap); z-index: 1500` | **off** | **off** |
| 97 | `style.overflow-item.box` | style | switchable | `min-height: var(--tab-min-height); padding: var(--overflow-item-padding); background: transparent; min-width: 0` | **off** | **off** |
| 98 | `style.overflow-item.background@hover` | style | switchable | ⟡ `accent-weakest` | **off** | **off** |

<details><summary>Citations — 230 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.tab-bar` | salt | TabBar.tsx — a separate exported component rendering .saltTabBar wrapping .saltTabBar-strip, with divider and inset boolean props |
| `structure.tab-bar` | shadcn | CONFIRMED ABSENCE — TabsList is the outermost strip element; no bar, no divider, no inset |
| `structure.tab-bar` | m3 | DECLARED GAP. In `latest` this row was ON, and its ON-ness rested entirely on one pair of tokens: divider-height 1px + divider-color surface-variant, which describe exactly a full-width rule beneath the strip ([S] for the tokens, [R] for the element). BOTH ARE ABSENT FROM versions/v0_192. Nothing else in either tab file describes a wrapper around the tablist — provenance.no-panel-token already rec |
| `structure.tab-shell` | salt | Tab.tsx renders a role="presentation" div carrying every box style; TabTrigger.tsx renders the role="tab" button inside it with `all: unset` and a ::before full-size hit area |
| `structure.tab-shell` | shadcn | TabsTrigger renders Radix's Primitive.button directly; the tab IS the button |
| `structure.tab-shell` | m3 | [R] — tokens-only clone. Nothing in the token vocabulary implies a wrapper/trigger split; every token addresses one tab surface. |
| `structure.active-indicator` | salt | Tab.css .saltTab::after |
| `structure.active-indicator` | shadcn | the after:* utility group on TabsTrigger |
| `structure.active-indicator` | m3 | the active-indicator-* family: -height, -shape (primary), -color |
| `structure.indicator-motion` | salt | Tab.css's ::after is a per-tab pseudo-element with NO transition or animation rule anywhere in the component's CSS — the mark appears and disappears instantly. (The legacy packages/lab/src/tabs implementation DOES slide, via TabActivationIndicator's `transition: left 0.3s ease`; that is the other implementation, see the core-tabs-not-lab-tabs note.) |
| `structure.indicator-motion` | shadcn | `after:bg-foreground after:opacity-0 after:transition-opacity` + `group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100` — the mark is always painted and cross-fades in place; it does not move and it does not appear instantly |
| `structure.indicator-motion` | m3 | [R], AND THE BIGGEST INFERENCE IN THIS COLUMN — see the indicator-motion-is-the-biggest-R-in-this-column provenance note. No motion token, no component to grep. A one-cell change to `static` reverses it. |
| `structure.tab-icon` | salt | site/src/examples/tabs/WithIcon.tsx — <TabTrigger><Icon aria-hidden /> {label}</TabTrigger> |
| `structure.tab-icon` | shadcn | `[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4` |
| `structure.tab-icon` | m3 | with-icon-icon-size 24px plus a full parallel icon-colour family (eight tokens on primary, five on secondary) |
| `structure.tab-actions` | salt | TabAction.tsx, exported from packages/core/src/tabs/index.ts |
| `structure.tab-actions` | shadcn | CONFIRMED ABSENCE — and structurally blocked: the trigger IS a <button>, so a nested control would be invalid HTML |
| `structure.tab-actions` | m3 | CONFIRMED ABSENCE — no action or trailing-control token |
| `structure.tab-badge` | salt | site/src/examples/tabs/WithBadge.tsx composes <Badge value={n} aria-hidden/> inside the TabTrigger; DECLARED COMPOSITION to the future badge component |
| `structure.tab-badge` | shadcn | CONFIRMED ABSENCE — no badge convention in tabs.tsx or tabs-demo.tsx |
| `structure.tab-badge` | m3 | CONFIRMED ABSENCE in the tab files. M3 does have a badge token family, but it is attached to navigation-bar/navigation-rail, which are out of scope. |
| `structure.overflow-menu` | salt | internal/overflow/TabOverflowList.tsx + useOverflow.ts + useRenderedTabWidth.ts + widthMeasurement.ts |
| `structure.overflow-menu` | shadcn | CONFIRMED ABSENCE — no measurement and no scroll affordance anywhere |
| `structure.overflow-menu` | m3 | CONFIRMED ABSENCE — no overflow or scroll token. M3's scrollable-tabs guidance is spec, not token, and is not claimed here. |
| `structure.panel` | salt | TabPanel.tsx |
| `structure.panel` | shadcn | TabsContent -> Radix Content, role=tabpanel |
| `structure.panel` | m3 | [R] — locked by the APG pattern. There is NO panel token in either file; the families are named navigation-tab and describe the tab only. |
| `behavior.roving-tabindex` | salt | TabTrigger.tsx: isTabStop = !hidden && (focused \|\| selected \|\| active \|\| fallbackTabStop), where fallbackTabStop = !hasSelectedTab && location === 'main' && order === 0 |
| `behavior.roving-tabindex` | shadcn | RovingFocusGroup.Item active={isSelected}, via @radix-ui/react-roving-focus |
| `behavior.roving-tabindex` | m3 | [R] — APG tabs pattern |
| `behavior.arrow-keys` | salt | TabList.tsx handleKeyDown actionMap = { ArrowRight: getNext, ArrowLeft: getPrevious, Home: getFirst, End: getLast } — no Up/Down branch on the strip. accessibility.mdx: 'Left arrow / Right arrow — moves focus between tab items in tab bar'; 'Up arrow / Down arrow — moves focus between tab items in an overflow menu list'. |
| `behavior.arrow-keys` | shadcn | TabsList passes orientation={context.orientation} to RovingFocusGroup.Root, so the arrow axis follows the orientation prop — Left/Right horizontal, Up/Down vertical |
| `behavior.arrow-keys` | m3 | [R] — APG horizontal tablist. There is no orientation token, and M3's vertical destination switcher is navigation-rail, a different component. |
| `behavior.home-end` | salt | TabList.tsx actionMap Home/End; documented in accessibility.mdx |
| `behavior.home-end` | shadcn | @radix-ui/react-roving-focus handles Home/End |
| `behavior.home-end` | m3 | [R] — APG |
| `behavior.wrap` | salt | Tabs.tsx useCollection({ targetWindow, wrap: true }); getNext does (index + 1) % items.length, getPrevious does (index - 1 + len) % len |
| `behavior.wrap` | shadcn | TabsList's own `loop = true` default, passed to RovingFocusGroup.Root |
| `behavior.wrap` | m3 | [R] — APG makes wrapping optional and recommends it; both live systems wrap, so the registry default is followed rather than a third answer invented |
| `behavior.activation-mode` | salt | MANUAL, and it is explicit on both sides. TabList's arrow handler only calls nextItem.element?.focus({ preventScroll: true }); TabTrigger's handleFocus records activeTab and scrolls, and does NOT call setSelected. Selection happens in handleClick and in handleKeyDown's `if (event.key === 'Enter' \|\| event.key === ' ')` branch. accessibility.mdx: 'Enter / Space — selects a tab item'. |
| `behavior.activation-mode` | shadcn | Tabs takes `activationMode = ActivationMode.Automatic` and TabsTrigger's onFocus does `const isAutomaticActivation = context.activationMode !== ActivationMode.Manual; if (!isSelected && !disabled && isAutomaticActivation) context.onValueChange(value)`. Listed DEFAULT FIRST — the skeleton and the harness take value[0] as the resting mode, and a manual-first list would have made every shadcn tab bar |
| `behavior.activation-mode` | m3 | [R] — APG recommends automatic activation where panels are cheap to render, which is the M3 tab case. Flagged, not grepped; this is the one behaviour cell in this column a Material engineer might dispute. |
| `behavior.disabled-navigation` | salt | Tab.tsx sets aria-disabled, NOT the native disabled attribute; TabTrigger's tabIndex rule never consults `disabled`; and internal/registry/useCollection.ts's getNavigableItems filters only on `item.location === 'hidden'` and `!!item.element`. So arrow keys land on a disabled Salt tab. Activation is blocked separately: onClick is undefined when disabled, and handleKeyDown preventDefaults Enter/Spac |
| `behavior.disabled-navigation` | shadcn | RovingFocusGroup.Item focusable={!disabled} plus the native `disabled` attribute on Primitive.button — a disabled shadcn tab is out of the roving order and out of the pointer entirely |
| `behavior.disabled-navigation` | m3 | CONFIRMED ABSENCE of any disabled token, so no claim is made — see the no-disabled-token provenance note |
| `behavior.pointer-activation` | salt | TabTrigger.tsx handleClick -> setSelected(event, value, selectionSource), bound as onClick. onMouseDown exists on Tab.tsx but only records activeTab and the wasMouseDown flag that suppresses the focus ring. |
| `behavior.pointer-activation` | shadcn | onMouseDown, not onClick: `if (!disabled && event.button === 0 && event.ctrlKey === false) { event.currentTarget.focus(); context.onValueChange(value) } else { event.preventDefault() }`. The focus() BEFORE the value change is deliberate (radix-ui/primitives#3600). |
| `behavior.pointer-activation` | m3 | [R] — the pressed-state-layer family implies a press response but says nothing about which event commits; click is the platform default and the majority answer |
| `behavior.panel-focusable` | salt | TabPanel.tsx tabIndex={hidden \|\| hasFocusableChildren ? undefined : 0}, where hasFocusableChildren comes from tabbable(element).length > 0 re-run behind a rAF-debounced MutationObserver on childList/subtree/attributes |
| `behavior.panel-focusable` | shadcn | Content hard-codes tabIndex={0} with no check for focusable children — the opposite of Salt's measured, conditional answer to the same APG sentence |
| `behavior.panel-focusable` | m3 | [R] — APG: 'if the tab panel does not contain any focusable elements, the panel itself should be focusable'. Salt implements exactly this; Radix does not. |
| `behavior.panel-mounting` | salt | TabPanel.tsx always renders and sets hidden={hidden \|\| undefined}; TabPanel.css .saltTabPanel[hidden] { display: none } |
| `behavior.panel-mounting` | shadcn | <Presence present={forceMount \|\| isSelected}> wrapping `{present && children}` — an inactive panel's subtree is destroyed unless the consumer opts into forceMount |
| `behavior.panel-mounting` | m3 | [R] — no panel token at all; `hidden` is the conservative reading and matches Salt |
| `behavior.scroll-into-view` | salt | TabTrigger.tsx handleFocus: event.currentTarget.parentElement?.scrollIntoView({ block: 'nearest', inline: 'nearest' }) — the PARENT (the Tab div), with the source comment 'Ensures the associated tab is in view.'; TabList focuses with preventScroll: true so this is the only scroller |
| `behavior.scroll-into-view` | shadcn | CONFIRMED ABSENCE — nothing scrolls a focused tab into view |
| `behavior.scroll-into-view` | m3 | no token and no basis to claim it |
| `behavior.overflow-navigation` | salt | TabOverflowList.tsx (floating-ui popup, ResizeObserver auto-close, Shift+Tab return-to-button) + TabTrigger.tsx's location === 'overflow' branch handling ArrowDown/ArrowUp/Home/End through tabListLayout.moveOverflowFocus |
| `prop.appearance` | salt | TabListProps.appearance?: 'bordered' \| 'transparent', DEFAULT 'bordered' -> contained. Listed default-first per the select.shadcn.json convention: the skeleton and the harness both take value[0] as the resting state. |
| `prop.appearance` | shadcn | tabsListVariants variant?: 'default' \| 'line', defaultVariants { variant: 'default' } -> contained / plain. Listed DEFAULT FIRST. |
| `prop.appearance` | m3 | CONFIRMED ABSENCE of a selected-container fill: neither file has a selected/active container-color token, and container-color (surface) belongs to the whole strip. An M3 tab is never a filled pill, so the contained value is unreachable in this column. |
| `prop.emphasis` | salt | no equivalent axis — Salt's two-way axis is appearance (contained/plain), already modelled |
| `prop.emphasis` | shadcn | M3-only axis |
| `prop.emphasis` | m3 | _md-comp-primary-navigation-tab.scss and _md-comp-secondary-navigation-tab.scss — one canonical component with a variant axis, modelled the way button modelled filled/outlined/text and select modelled filled/outlined. No source default is declared between the two; see the no-source-default-emphasis note. |
| `prop.orientation` | salt | TabList.tsx hard-codes withBaseName('horizontal'); there is no orientation prop and TabList.css has no vertical rule. See the horizontal-only provenance note. |
| `prop.orientation` | shadcn | Tabs takes orientation = 'horizontal' and writes both data-orientation and Radix's orientation prop; five style branches in tabs.tsx read it. Listed default-first. |
| `prop.orientation` | m3 | [R] — no orientation token; the primary/secondary tab families are the horizontal strip and navigation-rail is the vertical answer (out of scope) |
| `prop.active-color` | salt | TabListProps.activeColor?: 'primary' \| 'secondary' \| 'tertiary', DEFAULT 'primary'. Listed default-first. |
| `prop.active-color` | shadcn | Salt-only axis |
| `prop.active-color` | m3 | Salt-only axis |
| `prop.divider` | salt | TabBarProps.divider?: boolean — 'Styling variant with a bottom separator. Defaults to false'. Note every site example nevertheless passes it. |
| `prop.divider` | shadcn | no rule under the list |
| `prop.divider` | m3 | DECLARED GAP. Was true, sourced from divider-height 1px / divider-color surface-variant — not a prop in M3 but a pair of tokens, so the rule was always on where it existed. NEITHER TOKEN EXISTS IN versions/v0_192; they are `latest`-only and arrive there @deprecated ('Use standalone divider component instead of nested tokens'). WHAT THE CONSUMER LOSES: the divider capability. Salt has a real boolea |
| `prop.inset` | salt | TabBarProps.inset?: boolean — 'Styling variant with left and right padding. Defaults to false' |
| `prop.inset` | m3 | no inset or padding token anywhere in either file |
| `prop.disabled` | salt | TabProps.disabled?: boolean — 'If true, the tab will be disabled'; rendered as aria-disabled on the trigger and a .saltTab-disabled class on the shell |
| `prop.disabled` | shadcn | Radix TabsTrigger's `disabled = false`, the native attribute; styled with disabled:pointer-events-none disabled:opacity-50 |
| `prop.disabled` | m3 | CONFIRMED ABSENCE — no disabled-* token of any kind in either file in either edition, unusual for an M3 component family and recorded rather than filled in from the 0.38 convention |
| `state.hover` | salt | Tab.css .saltTab:hover::after — the INDICATOR, not the label |
| `state.hover` | shadcn | `hover:text-foreground` and `dark:hover:text-foreground` — a LABEL colour change only; there is no hover background in either variant |
| `state.hover` | m3 | hover-state-layer-color/-opacity (on-surface @ 0.08), hover-label-text-color (on-surface), with-icon-hover-icon-color (on-surface) — and on the primary tab a SEPARATE active-hover set coloured primary |
| `state.focus-visible` | m3 | VALUES CHANGED BY THE v0.192 PIN. The ring is now 3px solid md-sys-color.secondary at outline-offset 0px, sourced from tokens/_md-comp-focus-ring.scss ($width / $color / $inward-offset) rather than from the tab's own focus-indicator family, which is `latest`-only — the offset moved from -3px (inset) to 0px (flush). The focus state layer moved from 10% to 12% (versions/v0_192/_md-sys-state.scss foc |
| `state.disabled` | salt | Tab.css .saltTab.saltTab-disabled plus the explicit .saltTab-disabled:hover::after { background: none } cancellation |
| `state.disabled` | shadcn | disabled:pointer-events-none disabled:opacity-50 |
| `state.disabled` | m3 | no disabled token |
| `state.pressed` | salt | CONFIRMED ABSENCE on the strip — Tab.css has no :active rule. The only :active styling in the whole component is TabOverflowList.css's `.saltTabOverflowList-list .saltTab:active`, which belongs to the overflow menu. |
| `state.pressed` | shadcn | CONFIRMED ABSENCE — no active: utility in tabs.tsx |
| `state.pressed` | m3 | pressed-state-layer-color/-opacity, pressed-label-text-color, pressed-icon-color. NOTE the oddity on primary: inactive-pressed-state-layer-color is md-sys-color.$primary while inactive-hover and inactive-focus are both on-surface, so an unselected primary tab flashes the accent under the finger. Modelled as an info row only — the skeleton has no press affordance, and this is recorded as a coverage |
| `state.overflowing` | salt | TabList.tsx data-ismeasuring + Tab.css's @supports-guarded `.saltTabList:has([data-overflowbutton]) .saltTab { max-width: calc(100% - var(--salt-spacing-100) - var(--salt-size-base)) }` |
| `style.tab-bar.divider` | salt | TabBar.css .saltTabBar-divider::before { inset: auto 0 0 0; height: var(--salt-size-fixed-100); border-bottom: var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-secondary-borderColor) }. size-fixed-100 = 1px on the FIXED scale, density-invariant by design. Reproduced as a border on the bar itself rather than a pseudo-element, since the pseudo carries no other property. |
| `style.tab-bar.divider` | m3 | DECLARED GAP. Was {border-bottom: 1px solid var(--divider)}, sourced from divider-height 1px + divider-color -> md-sys-color.$surface-variant (#e7e0ec / #49454f) — an opaque tone rather than Salt's 30% alpha, which was the finding this cell carried. Both tokens are NESTED IN THE TAB NAMESPACE (md.comp.{primary,secondary}-navigation-tab.divider.*), they exist only in `latest`, and they arrive there |
| `style.tab-bar.inset` | m3 | no inset token |
| `style.tablist.background` | salt | TabList.css `background: transparent` — DECLARED, not merely absent |
| `style.tablist.background` | shadcn | tabsListVariants variant.default: `bg-muted` |
| `style.tablist.background` | m3 | container-color -> md-sys-color.$surface. Note this is the tab's OWN container token applied to the strip, since M3 gives every tab the same surface and never fills the selected one. |
| `style.tablist.background@plain` | salt | the strip is transparent in both appearances; nothing changes |
| `style.tablist.background@plain` | shadcn | tabsListVariants variant.line: `bg-transparent` |
| `style.tablist.background@plain` | m3 | plain is M3's only appearance; there is nothing to override |
| `style.tablist.color` | salt | Salt declares colour on the tab (Tab.css), not the list |
| `style.tablist.color` | shadcn | TabsList base class `text-muted-foreground` |
| `style.tablist.color` | m3 | M3 declares colour on the tab, not the strip |
| `style.tablist.min-height` | salt | TabList.css min-height: calc(var(--salt-size-base) + var(--salt-spacing-100)) — the identical expression Tab.css uses, so the tab exactly fills the strip |
| `style.tablist.min-height` | shadcn | `group-data-[orientation=horizontal]/tabs:h-9` = 36px — a real, DEFINITE height, kept as a height because the trigger's own h-[calc(100%-1px)] resolves against it |
| `style.tablist.min-height` | m3 | container-height 48px, identical in both files and both editions. NOTE the sibling primary alone carries, with-icon-and-label-text-container-height 64px, for the stacked icon-above-label layout — recorded, not modelled, because this skeleton lays icon and label in a row for all three systems. |
| `style.tablist.gap` | shadcn | the default variant declares no gap — the pills sit flush inside the tray |
| `style.tablist.gap` | m3 | CONFIRMED ABSENCE of any gap token — M3 tabs are flush |
| `style.tablist.gap@plain` | salt | the gap does not change with appearance |
| `style.tablist.gap@plain` | shadcn | tabsListVariants variant.line: `gap-1` |
| `style.tablist.padding` | salt | no padding on .saltTabList; horizontal insets belong to the BAR (style.tab-bar.inset) |
| `style.tablist.padding` | shadcn | `p-[3px]` — an arbitrary value, not a scale step; it is the clearance the selected pill's corner needs |
| `style.tablist.padding` | m3 | no strip padding token |
| `style.tablist.shape` | salt | no border-radius in TabList.css — a Salt tab strip is square |
| `style.tablist.shape` | shadcn | `rounded-lg` -> --radius-lg -> --radius = 0.625rem |
| `style.tablist.shape` | m3 | container-shape is corner-none and is modelled on the tab (style.tab.shape); the strip has no shape token of its own |
| `style.tablist.shape@plain` | shadcn | `data-[variant=line]:rounded-none` |
| `style.tablist.orientation@vertical` | salt | horizontal-only; see the horizontal-only provenance note |
| `style.tablist.orientation@vertical` | shadcn | `group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col`; min-height is reset here because the horizontal h-9 is carried as min-height (see style.tablist.min-height) |
| `style.tablist.orientation@vertical` | m3 | horizontal only |
| `style.tab.letter-spacing` | salt | Tab.css letter-spacing: var(--salt-text-letterSpacing) -> next/characteristics/text.css: 0 |
| `style.tab.letter-spacing` | shadcn | no tracking utility |
| `style.tab.letter-spacing` | m3 | title-small-tracking. NOTE material-web's own wrappers list label-text-tracking under $unsupported-tokens for both tabs; the generated token's value is taken and the disownment recorded. |
| `style.tab.color` | salt | Tab.css color: var(--salt-content-primary-foreground) — full strength, no de-emphasis |
| `style.tab.color` | shadcn | `text-foreground/60` light, `dark:text-muted-foreground` dark — two different mechanisms, resolved in the slots block |
| `style.tab.color` | m3 | with-label-text-inactive-label-text-color / inactive-label-text-color -> md-sys-color.$on-surface-variant |
| `style.tab.height` | salt | Tab.css min-height: calc(var(--salt-size-base) + var(--salt-spacing-100)) |
| `style.tab.height` | shadcn | `h-[calc(100%-1px)]` — a real height tied to the tray, one pixel short of it |
| `style.tab.height` | m3 | container-height 48px |
| `style.tab.min-width` | salt | Tab.css min-width: 4em — a bare em literal with no override variable, the same floor Dropdown.css declares. Em-relative, so it tracks the density-driven font size rather than freezing it. |
| `style.tab.min-width` | shadcn | sized by flex-1 instead |
| `style.tab.min-width` | m3 | no min-width token; m3.material.io's published 90px minimum is spec, not token, and is not claimed |
| `style.tab.flex` | salt | Salt tabs are content-sized and flex-shrink: 0; only the TabTrigger inside is flex: 1, which is in the template's base |
| `style.tab.flex` | shadcn | `flex-1` — shadcn tabs divide the tray equally |
| `style.tab.flex` | m3 | no token; M3 tabs are equal-width by spec but there is nothing to source that from |
| `style.tab.padding` | shadcn | `px-2 py-1` |
| `style.tab.padding` | m3 | [R] — CONFIRMED ABSENCE of any spacing token in either file in either edition. 16px is m3.material.io's published tab label inset; flagged on the cell, no token name invented. See the no-spacing-token provenance note. |
| `style.tab.gap` | salt | declared on BOTH .saltTab and .saltTabTrigger in source — one token, two declarations, which the row's doubled selector reproduces |
| `style.tab.gap` | shadcn | `gap-1.5` |
| `style.tab.gap` | m3 | [R] — the same declared borrow as the padding, for the icon-to-label step |
| `style.tab.shape` | salt | no border-radius in Tab.css |
| `style.tab.shape` | shadcn | `rounded-md` -> --radius-md -> --radius * 0.8 = 0.5rem |
| `style.tab.shape` | m3 | container-shape -> md-sys-shape.$corner-none = 0px. Declared and zero, which is not the same as absent — M3 states that a tab is square. |
| `style.tab.border` | salt | Tab.css border: none; border-left/border-right: var(--salt-size-fixed-100) var(--salt-borderStyle-solid) transparent. Only the SIDES are reserved, because only the sides gain a colour when the tab is selected under the bordered appearance. |
| `style.tab.border` | shadcn | `border border-transparent` — all four sides reserved, because dark mode adds a border on the active state |
| `style.tab.border` | m3 | CONFIRMED ABSENCE — no outline or border token; an M3 tab has no edge of its own |
| `style.tab.overflow` | salt | Tab.css overflow: hidden — which clips the ::after's own left/right -1px extension back off. Reproduced as source has it. |
| `style.tab.overflow` | shadcn | MUST be absent: the indicator sits at bottom: -5px, outside the tab's own box, and would be clipped |
| `style.tab.cursor` | salt | Tab.css cursor: var(--salt-cursor-hover) -> foundations/cursor.css: pointer |
| `style.tab.cursor` | shadcn | platform default |
| `style.tab.cursor` | m3 | no cursor token in any M3 file (docs/foundations/cursors.md: Salt is the only system with a cursor scale) |
| `style.tab.transition` | salt | CONFIRMED ABSENCE — no transition or animation rule in any of the six CSS files |
| `style.tab.transition` | shadcn | `transition-all`; duration and easing are Tailwind's defaults [R] — Tailwind is not vendored in this clone |
| `style.tab.transition` | m3 | no motion token on either tab file |
| `style.tab.orientation@vertical` | shadcn | `group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start` |
| `style.tab.color@hover` | salt | CONFIRMED ABSENCE — Tab.css's only :hover rule targets ::after. A hovered Salt tab's label does not change. |
| `style.tab.color@hover` | shadcn | `hover:text-foreground` / `dark:hover:text-foreground` |
| `style.tab.color@hover` | m3 | with-label-text-inactive-hover-label-text-color / hover-label-text-color -> md-sys-color.$on-surface, agreed by both files |
| `style.tab.color@selected` | salt | CONFIRMED ABSENCE — see the no-selected-label-change provenance note. Neither colour nor weight moves. |
| `style.tab.color@selected` | shadcn | `data-[state=active]:text-foreground` / `dark:data-[state=active]:text-foreground` |
| `style.tab.color@selected` | m3 | with-label-text-active-label-text-color -> md-sys-color.$primary on the primary tab; style.tab.emphasis@secondary reassigns the property to on-surface, which is secondary's active-label-text-color |
| `style.tab.selected-fill@contained` | salt | Tab.css `.saltTabList-bordered .saltTab.saltTab-selected { background: var(--saltTabList-activeColor); border-left: var(--salt-size-fixed-100) solid var(--salt-separable-secondary-borderColor); border-right: ... }`. Modelled as a colour reassignment on the reserved transparent borders so the box does not shift. |
| `style.tab.selected-fill@contained` | shadcn | `data-[state=active]:bg-background` + `group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm`, with `dark:data-[state=active]:bg-input/30` and `dark:data-[state=active]:border-input` pushed into the slots block. The line variant restates bg-transparent / shadow-none / (dark) border-transparent, which this row's contained scoping already produces. |
| `style.tab.selected-fill@contained` | m3 | CONFIRMED ABSENCE — no selected container colour, which is why prop.appearance is plain-only here |
| `style.tab.state-layer@hover` | salt | no state-layer mechanism in Salt; the hover feedback is the indicator preview |
| `style.tab.state-layer@hover` | shadcn | no state-layer mechanism; shadcn moves the label colour instead |
| `style.tab.state-layer@hover` | m3 | hover-state-layer-color -> on-surface at hover-state-layer-opacity 0.08. Drawn as a gradient so it composites over any background-color, the mechanism select.m3.json established. |
| `style.tab.state-layer@focus` | m3 | focus-state-layer-color -> on-surface at focus-state-layer-opacity, which versions/v0_192/_md-sys-state.scss gives as 0.12. VALUE CHANGED BY THE PIN — was 0.1, from versions/latest/sass/_md-sys-state.scss. docs/foundations/state-layers.md already tabulates 0.12 for M3, so the foundations page and this cell now agree. material-web lists both tokens under $unsupported-tokens for both tabs; the gener |
| `style.tab.state-layer@selected-hover` | m3 | active-hover-state-layer-color at active-hover-state-layer-opacity 0.08 — md-sys-color.$primary on the primary tab, on-surface on the secondary tab (material-web synthesises secondary's from its plain hover set). The sharpest primary/secondary divergence after the indicator geometry. |
| `style.tab.focus` | salt | Tab.css .saltTab-focusVisible { outline: var(--salt-focused-outline) } — on the TAB DIV, with TabTrigger.css's `:focus-visible { outline: none }` suppressing the button's own so the ring is drawn once |
| `style.tab.focus` | shadcn | `focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring` — three layers at once, and genuinely focus-VISIBLE here unlike the bare focus: on shadcn's dialog close button |
| `style.tab.focus` | m3 | tokens/_md-comp-focus-ring.scss $width: 3px solid $color: md-sys-color.secondary, at $inward-offset: 0px. SOURCE RE-POINTED AND ONE VALUE CHANGED BY THE v0.192 PIN. Previously: focus-indicator-thickness -> md-sys-state-focus-indicator.$thickness 3px, focus-indicator-color -> md-sys-color.$secondary, focus-indicator-outline-offset -> $inner-offset -3px — an INSET ring drawn 3px inside the tab. The  |
| `style.tab.disabled` | salt | Tab.css .saltTab.saltTab-disabled { cursor: var(--salt-cursor-disabled); color: var(--salt-content-primary-foreground-disabled) }. NOTE no pointer-events: none — a disabled Salt tab is still hoverable and still arrow-reachable. |
| `style.tab.disabled` | shadcn | `disabled:pointer-events-none disabled:opacity-50` — one blanket dim, where Salt recolours and keeps the tab reachable |
| `style.tab.disabled` | m3 | no disabled token — see the no-disabled-token provenance note |
| `style.tab.active-color@secondary` | salt | TabList.css .saltTabList-activeColorSecondary { --saltTabList-activeColor: var(--salt-container-secondary-background) } |
| `style.tab.active-color@secondary` | shadcn | Salt-only axis |
| `style.tab.active-color@secondary` | m3 | Salt-only axis |
| `style.tab.active-color@tertiary` | salt | TabList.css .saltTabList-activeColorTertiary |
| `style.tab.active-color@tertiary` | shadcn | Salt-only axis |
| `style.tab.active-color@tertiary` | m3 | Salt-only axis |
| `style.tab.emphasis@secondary` | salt | M3-only axis |
| `style.tab.emphasis@secondary` | shadcn | M3-only axis |
| `style.tab.emphasis@secondary` | m3 | secondary's active-label-text-color -> on-surface (against primary's primary), with-icon-active-icon-color -> on-surface (against primary), and its single on-surface state-layer set (against primary's primary-coloured active set). One rule reassigning two properties the base rows already consume, rather than three duplicated rules — the source's own indirection pattern. Both replacements are plain |
| `style.indicator.size` | salt | Tab.css .saltTab::after { height: var(--salt-size-indicator) } -> 2/3/4/5px by density |
| `style.indicator.size` | shadcn | `group-data-[orientation=horizontal]/tabs:after:h-0.5` = 2px, density-invariant (shadcn has no density capability) |
| `style.indicator.size` | m3 | active-indicator-height 3px on the primary tab; the emphasis row reassigns it to 2px for secondary. Note this equals Salt's medium-density size-indicator by coincidence of two unrelated scales. |
| `style.indicator.edge` | salt | Tab.css .saltTab::after { left: calc(var(--salt-size-fixed-100) * -1); right: calc(var(--salt-size-fixed-100) * -1) } plus `.saltTabList-transparent .saltTab::after { bottom: 0 }`. size-fixed-100 is 1px on the fixed scale, density-invariant, so the literal is correct at every density. |
| `style.indicator.edge` | shadcn | `group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px]` — the mark hangs five pixels BELOW the tab, outside its box, so it lands where the tray's bottom edge is |
| `style.indicator.edge` | m3 | [R] for the flush inset — there is no offset token; the indicator sits on the bottom edge of the tab per m3.material.io. NOTE the skeleton's base gives the slide mechanism `right: auto` at higher specificity so the measured inline width wins. |
| `style.indicator.edge@contained` | salt | Tab.css `.saltTabList-bordered .saltTab::after { top: 0 }` — Salt's DEFAULT appearance marks the TOP edge, not the bottom |
| `style.indicator.edge@contained` | shadcn | shadcn's contained (default) variant keeps the mark at the bottom and hides it instead of moving it; only Salt relocates the edge |
| `style.indicator.edge@contained` | m3 | no contained appearance |
| `style.indicator.shape` | salt | no border-radius on the ::after — a square mark |
| `style.indicator.shape` | shadcn | square mark |
| `style.indicator.shape` | m3 | active-indicator-shape on the primary tab — the mark's TOP corners are rounded to its own height, which only reads correctly because the mark sits at the bottom of the tab. The secondary file has NO such token; material-web's tokens/_md-comp-secondary-tab.scss supplies `'active-indicator-shape': 0` in _add-missing-secondary-tokens(), carried by style.indicator.emphasis@secondary. |
| `style.indicator.rest` | salt | Tab.css's ::after declares content/position/left/right/height and NO background; the fill arrives only from the hover, focus-visible and selected rules |
| `style.indicator.rest` | shadcn | `after:bg-foreground after:opacity-0` — always painted, hidden by opacity, which is what makes after:transition-opacity possible |
| `style.indicator.rest` | m3 | [R] — with the slide mechanism there is one indicator element and it is painted only while a tab is selected |
| `style.indicator.background@hover` | salt | Tab.css .saltTab:hover::after { background: var(--salt-navigable-indicator-hover) } |
| `style.indicator.background@hover` | shadcn | CONFIRMED ABSENCE — no hover state on the indicator at all; Salt is alone in previewing the mark |
| `style.indicator.background@hover` | m3 | CONFIRMED ABSENCE — M3's hover feedback is a state layer on the tab, not a preview of the mark. Salt is alone in previewing it. |
| `style.indicator.background@focus-visible` | salt | Tab.css .saltTab-focusVisible::after — the same rule, the same value; with manual activation this preview is the whole visual feedback of arrowing |
| `style.indicator.selected` | salt | Tab.css .saltTab.saltTab-selected::after { background: var(--salt-navigable-accent-indicator-active) } |
| `style.indicator.selected` | shadcn | `group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100` — the colour was already there; only the opacity moves |
| `style.indicator.selected` | m3 | active-indicator-color -> md-sys-color.$primary, the same value in both emphases |
| `style.indicator.selected@contained` | salt | Salt's contained appearance SHOWS its mark (moved to the top edge); only shadcn hides it |
| `style.indicator.selected@contained` | shadcn | the reveal above is scoped to the LINE variant only, so in the default variant the selected pill keeps a fully-formed but invisible indicator. Restated here so the base row cannot leak; must be emitted after style.indicator.selected, which the template's row order guarantees. |
| `style.indicator.selected@contained` | m3 | no contained appearance |
| `style.indicator.transition` | salt | CONFIRMED ABSENCE |
| `style.indicator.transition` | shadcn | `after:transition-opacity`; Tailwind's default duration/easing [R] |
| `style.indicator.transition` | m3 | [R] — CONFIRMED ABSENCE of any motion token on either tab file. Borrowed from docs/foundations/motion.md's medium2 (300ms) + standard easing, the same principled placeholder tooltip.m3.json and dialog.m3.json used. Depends on structure.indicator-motion = slide; if that cell flips to static this one switches off. |
| `style.indicator.emphasis@secondary` | salt | M3-only axis |
| `style.indicator.emphasis@secondary` | shadcn | M3-only axis |
| `style.indicator.emphasis@secondary` | m3 | secondary's active-indicator-height 2px [S, generated token] and active-indicator-shape 0 [S, material-web's own _add-missing-secondary-tokens()] |
| `style.indicator.orientation@vertical` | shadcn | `group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5` — note the offset shrinks from 5px to 4px when the mark rotates |
| `style.tab-icon.size` | salt | packages/icons/src/icon/Icon.css --icon-size: max(calc(var(--salt-size-icon) * 1), 12px) -> 12/12/14/16px. NOT declared in Tab.css; the 12px is a live floor, not a snapshot. |
| `style.tab-icon.size` | shadcn | `[&_svg:not([class*='size-'])]:size-4`, density-invariant |
| `style.tab-icon.size` | m3 | with-icon-icon-size 24px, identical in both files and both editions — half again the size of shadcn's 16px and twice Salt's medium 12px |
| `style.tab-icon.color` | salt | no .saltIcon-primary/-secondary class is applied inside a tab, so the glyph is currentColor and inherits the tab's colour including the disabled 40% alpha |
| `style.tab-icon.color` | shadcn | no colour utility on the svg — currentColor, so the glyph tracks the label through all four states |
| `style.tab-icon.color` | m3 | M3 DOES declare a full parallel icon-colour family — eight tokens on primary, five on secondary — but every one resolves to the same role as the label colour in the same state (on-surface-variant inactive, primary/on-surface active, on-surface hovered/focused/pressed). A currentColor glyph is therefore not an approximation but the identical output, and thirteen duplicate rows are avoided. Recorded |
| `style.panel.box` | salt | TabPanel.css .saltTabPanel { height: 100%; width: 100% } |
| `style.panel.box` | shadcn | TabsContent `flex-1` |
| `style.panel.box` | m3 | CONFIRMED ABSENCE — no panel token in either file; see the no-panel-token provenance note |
| `style.panel.outline` | salt | Salt does the opposite of suppressing it — see style.panel.focus |
| `style.panel.outline` | shadcn | TabsContent `outline-none` — combined with Radix's unconditional tabIndex={0}, a shadcn panel is focusable and shows no ring, the exact inverse of Salt |
| `style.panel.focus` | salt | TabPanel.css .saltTabPanel:focus-visible { outline: var(--salt-focused-outline) } |
| `style.panel.focus` | shadcn | suppressed, see style.panel.outline |
| `style.overflow-list.box` | salt | TabOverflowList.css .saltTabOverflowList-list { background: var(--salt-container-primary-background); border: var(--salt-size-fixed-100) solid var(--salt-selectable-borderColor-selected); border-radius: var(--salt-palette-corner, 0); box-shadow: var(--salt-overlayable-shadow-popout); z-index: var(--salt-zIndex-flyover) } + .saltTabOverflowList-listContainer { gap: var(--salt-spacing-fixed-100) } + |
| `style.overflow-item.box` | salt | TabOverflowList.css `.saltTabOverflowList-list .saltTab` re-declares background var(--salt-selectable-background) (color-transparent), min-height calc(size-base + spacing-100), padding-left/right var(--salt-spacing-100), justify-content: flex-start, and `::after { display: none }` — the indicator is switched off inside the menu (reproduced in the template's base). The min-width override `max-width |
| `style.overflow-item.background@hover` | salt | TabOverflowList.css .saltTabOverflowList-list .saltTab:hover { background: var(--salt-selectable-background-hover) } -> palette-accent-weakest |

</details>

<!-- END GENERATED VALUES -->
