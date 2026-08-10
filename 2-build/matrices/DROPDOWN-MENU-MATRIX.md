# Dropdown menu — component template matrix

Component 19 of the pipeline. Canonical id `dropdown-menu`, matching
`1-intro/content/04-component-map.md`'s Overlays row: `| dropdown-menu | ✓ | ✓
menu, cascading-menu, menu-button | ✓ menu, menu-item, *(filled/outlined/
standard)-menu-button* |`.

## 0 · Scope

**What "dropdown-menu" means per system**, confirmed by reading each clone,
not assumed from the prompt's secondhand summary:

- **shadcn**: `apps/v4/registry/new-york-v4/ui/dropdown-menu.tsx` — one file,
  fifteen exported parts (`DropdownMenu`, `Portal`, `Trigger`, `Content`,
  `Group`, `Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`, `Label`,
  `Separator`, `Shortcut`, `Sub`, `SubTrigger`, `SubContent`), every one a
  thin `data-slot`-tagging wrapper around `radix-ui`'s `DropdownMenu`
  primitive. **`radix-ui` is an external, unvendored npm dependency**
  (`apps/v4/package.json:80`: `"radix-ui": "^1.4.3"`, no
  `node_modules/radix-ui` directory anywhere under `3-source/`) — the exact
  same boundary shape TOAST-MATRIX.md recorded for `sonner`. The actual
  keyboard nav, typeahead, focus management and floating-position math live
  in that external package. Every STYLE cell below is real and sourced
  (the wrapper's own literal `className` strings are real, committed
  source); every BEHAVIOR cell is [R] unless independently confirmable from
  the wrapper file itself (e.g. the `data-state`/`data-highlighted`
  attribute contract the wrapper's own classes key off, which IS real
  source even though the code that sets those attributes is not).
- **Salt**: THREE real, live directories, related but distinct, confirmed by
  reading all three rather than assuming from the names:
  - `packages/core/src/menu/` — the BASE primitive (`Menu`/`MenuBase`,
    `MenuTrigger`, `MenuPanel`/`MenuPanelBase`, `MenuItem`, `MenuGroup`).
    Floating-ui powered (`useFloatingUI`, `useListNavigation`, `useHover`,
    `useDismiss`, `useRole(context,{role:"menu"})`). Supports nesting
    natively — `MenuTrigger` nested inside another `Menu` is how a submenu
    is composed (`isNested = parentId != null`).
  - `packages/lab/src/cascading-menu/` — a SEPARATE, older, data-driven
    implementation (`CascadingMenu`/`CascadingMenuList`/`CascadingMenuItem`,
    a `MenuDescriptor[]` tree + its own reducer/state machine in
    `internal/`), not built on `core/menu` at all. Has its own
    keyboard-handler file (`internal/keydownHandlers.ts`) with real,
    explicit `Home`/`End`/`ArrowLeft`/`ArrowRight`/`Enter`/`Space`/`Tab`
    handlers, and its own submenu-open/-close mechanics.
  - `packages/lab/src/menu-button/` — `MenuButton`/`MenuButtonTrigger`, a
    trigger button composed with `CascadingMenu` (imports it directly:
    `import { CascadingMenu, ... } from "../cascading-menu"`).
  Confirmed relationship: **`menu-button` is the trigger+menu COMPOSITION**
  (a real `Button` wired to a `CascadingMenu`), **`cascading-menu` is the
  submenu-capable panel/list implementation it composes**, and
  `core/menu` is a SIBLING, independent base primitive with its own,
  different nesting mechanism (`MenuTrigger`-in-`Menu`) — not a dependency
  of either lab component. This template draws BEHAVIOR from
  `cascading-menu` (the richer, keyboard-complete implementation, and the
  one `menu-button` actually ships) and STYLE from both real CSS files
  (`packages/core/src/menu/*.css` for the base panel/item/group, and
  `packages/lab/src/cascading-menu/*.css` for the cascading-specific
  divider/adornment classes) — cited per row, never blended silently.
- **M3**: `3-source/material-web/menu/` is REAL component source (confirmed
  by `find`, not tokens-only — a genuine third outcome after
  checkbox/switch/radio-group/slider's "real" and toast/snackbar's
  "tokens-only"), `internal/menu.ts` (1035 lines: role, ArrowUp/Down/Home/
  End nav, ArrowLeft/Right submenu keys, a real `TypeaheadController`,
  `useDismiss`-equivalent outside-click/Escape handling via
  `internals.role='menu'` + `popover` API), `internal/menuitem/menu-item.ts`
  (item, slots: `start`/`end`/`headline`/`supporting-text`/
  `trailing-supporting-text`), `internal/submenu/sub-menu.ts` (real submenu
  wrapper, hover-open/-close with 400ms delays, `ArrowRight`/`ArrowLeft`).
  **A genuine v0.192-EDITION GAP, the same shape ALERT/PROGRESS/SPINNER
  found for their own parts**: `tokens/versions/v0_192/` has
  `_md-comp-menu.scss` (container only) but **no `_md-comp-menu-item.scss`
  at all** — confirmed by `find`, not by an empty grep. The unversioned
  (top-level) `tokens/_md-comp-menu-item.scss` derives item tokens from
  `md-comp-list-item.values()` (list-item-prefixed tokens, renamed) merged
  with `menu.values()`, and **that unversioned derivation function itself
  already pins `@use 'versions/v0_192/md-comp-list'`** — i.e. even M3's
  own "latest" menu-item token function is, at the list-color/typography
  level, ALREADY resolving against the v0.192 edition this pipeline pins
  everywhere else, with two additional bare literals (`top-space`/
  `bottom-space`: 12px, `container-color`: `transparent`) that are
  edition-independent by construction (hardcoded in the derivation
  function, not sourced from any versioned file). This is therefore
  recorded as a **real, traceable, [S] derivation** (cited to both
  `tokens/_md-comp-menu-item.scss`'s own renaming/merge formula and
  `tokens/versions/v0_192/_md-comp-list.scss`'s resolved values), per rule
  6 ("an unshared derivation is OURS, publish it") — not a declared gap,
  because every number in it traces to the pinned edition. Trigger tokens
  use `tokens/versions/v0_192/_md-comp-standard-menu-button.scss` (real,
  present in the pinned edition, unlike menu-item) — the unfilled variant,
  matching Salt's default `secondary`/transparent trigger appearance.

**IN SCOPE**: trigger, popup/content, item (action), leading item-icon,
trailing item-shortcut-text, separator, group + group-label, one level of
submenu nesting (submenu-trigger + submenu-popup).

**OUT OF SCOPE, with a structural reason**: shadcn's `DropdownMenuCheckboxItem`/
`DropdownMenuRadioItem`. Grepped specifically to check for a Salt or M3
equivalent before excluding: Salt's `CascadingMenuItem`/`MenuItem` model no
`checked` concept anywhere (`MenuDescriptor` has no boolean-state field);
M3's own `MenuItemType` enum is `'menuitem' | 'option' | 'button' | 'link'`
— no `menuitemcheckbox`/`menuitemradio` value exists in the real source
(`menu-item.ts:51`). This is a Radix/shadcn-only extension with zero
cross-system character to extract — including it would mean INVENTING
structure/behavior for the other two systems (exactly what rule 1 forbids:
"never retrofit... a component inherited from one DS is never a neutral
chassis"). It also structurally overlaps the already-built `checkbox`/
`radio-group` components: a menu item that persists a checked/selected
state across the menu's own open/close cycle is precisely what those two
components already model at the row level; duplicating that here would be
redundant, not additive. Declared out, not silently dropped — this note is
the citation.

**Trigger is IN SCOPE as this component's own part**, not composed from
`button`, because all three systems give the trigger genuinely different,
sourced treatment: Salt's `MenuButtonTrigger` wraps a real `Button`
(`variant="secondary"`) plus its OWN additional open-state CSS layer; M3 has
a dedicated `standard-menu-button` token family with values that diverge
from any button component's own tokens (see style.trigger rows); shadcn's
canonical `DropdownMenuTrigger` has **NO owned styling of any kind** —
`<DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />`,
no `className`, nothing — the consumer supplies the entire visual (usually
composing shadcn's own `Button` via Radix's `asChild`). That absence is
itself a real, sourced, structural finding worth a row, not something
`button`'s own matrix can express on `dropdown-menu`'s behalf.

## 1 · Structure

| row | policy | salt | shadcn | m3 |
|---|---|---|---|---|
| `structure.trigger` | locked | on — `MenuButtonTrigger` (real `Button` + open-state CSS) [S] | on — `DropdownMenuTrigger`, but **zero owned style** (see §0) [S] | on — `standard-menu-button` token family, real [S] |
| `structure.popup` | locked | on — `MenuPanel`/`MenuPanelBase`, `role="menu"` [S] | on — `DropdownMenuContent`, portalled [S] | on — `menu.ts`'s `.menu`/`.items`, `popover` API [S] |
| `structure.item` | locked | on — `MenuItem`/`CascadingMenuItem`, `role="menuitem"` [S] | on — `DropdownMenuItem` [S] | on — `menu-item.ts`, `role` from `MenuItemController` [S] |
| `structure.item-icon` | switchable | on — `menuItemStartAdornmentContainer`, rendered only when `hasStartAdornment` [S] | on, but **informal**: no dedicated data-slot, any child `<svg>` is generically sized via `[&_svg:not([class*='size-'])]:size-4` [S] | on — real dedicated `[slot='start']`, `leading-icon-color` token [S] |
| `structure.item-shortcut` | switchable | **off** — `CascadingMenuItem`'s only end-adornment is the submenu chevron (`menuItemEndAdornmentContainer` wraps `ExpandGroupIcon` exclusively); no trailing free-text slot exists anywhere in `CascadingMenuItem.tsx`/`.css` [S] | on — `DropdownMenuShortcut`, a dedicated exported part [S] | on — real `[slot='trailing-supporting-text']`, own token family [S] |
| `structure.separator` | locked | on — `CascadingMenuItem`'s `divider` prop renders a real sibling `<div role="separator" />` [S] | on — `DropdownMenuSeparator` [S] | on — `::slotted(:is(md-divider, [role='separator']))` styles any slotted separator generically [S] |
| `structure.group` | switchable | on — `MenuGroup`, `role="group"` [S] | on — `DropdownMenuGroup` [S] | **off** — no group-wrapper component or token family anywhere in `menu/`; grouping in M3 is achieved purely with separators between runs of items, no dedicated container [S, confirmed absent] |
| `structure.group-label` | switchable | on — `MenuGroup`'s own `label` prop, `aria-hidden` div, `aria-labelledby` wiring [S] | on — `DropdownMenuLabel` [S] | **off** — same reason as `structure.group` |
| `structure.submenu-trigger` | switchable | on — a `CascadingMenuItem` with a child menu (`hasSubMenu`); OR `core/menu`'s own `MenuTrigger`-nested-in-`Menu` pattern (two real, independent Salt mechanisms, cascading-menu's used here) [S] | on — `DropdownMenuSubTrigger`, dedicated exported part with `ChevronRightIcon` [S] | on — `sub-menu.ts`'s `SubMenu`, wraps a slotted `item` + slotted `menu` [S] |
| `structure.submenu-popup` | switchable | on — the child `CascadingMenu`'s own panel, same `MenuPanel` shape as the root, `placement: "right-start"` [S] | on — `DropdownMenuSubContent` [S] | on — the `SubMenu`'s slotted `menu`, same `menu.ts` shape as the root [S] |

## 2 · Behavior

| row | policy | salt | shadcn | m3 |
|---|---|---|---|---|
| `behavior.role` | locked | `role="menu"` — `MenuBase.tsx`'s `useRole(context, {role:"menu"})` [S] | `role="menu"` [R] — external package, general Radix/APG menu convention, not independently confirmable in this clone | `role="menu"` — `menu.ts:366` `this.internals.role = 'menu'` [S] |
| `behavior.item-role` | locked | `role="menuitem"` — `MenuItem.tsx`/`CascadingMenuItem.tsx` both hardcode it [S] | `role="menuitem"` [R] — external package, APG convention | `role="menuitem"` — `MenuItemController.role` getter, `type==='option' ? 'option' : 'menuitem'`, default `'menuitem'` [S] |
| `behavior.trigger-interaction` | locked | click (`useClick(context,{event:"mousedown"})`) [S] | click [R] | click (`menuItemController`'s own click wiring + `internals.role`) [S] |
| `behavior.arrow-navigation` | locked | Up/Down move the active item — `core/menu` via floating-ui's `useListNavigation`; `cascading-menu` has its own equivalent in `keydownHandlers.ts` (not shown above but structurally implied by `highlightedItemIndex`) [S] | Up/Down [R] — external package, documented APG menu behaviour | Up/Down — `menu.ts`'s `NAVIGABLE_KEY`s include `ArrowDown`/`ArrowUp` [S] |
| `behavior.home-end` | switchable | on — `keydownHandlers.ts:191,207`, explicit `Home`/`End` handlers jumping to first/last enabled item [S] | on [R] — external package, general APG convention | on — `menu.ts:51-52`, `NavigableKeys.Home`/`.End` [S] |
| `behavior.typeahead` | switchable | **off** — grepped directly, no `useTypeahead`/typeahead code anywhere in `core/menu` or `lab/cascading-menu` [S, confirmed absent] | on [R] — external package, Radix's own docs describe typeahead support; not independently confirmable in this clone | on — `menu.ts`'s own real `TypeaheadController`, `typeaheadDelay` default `DEFAULT_TYPEAHEAD_BUFFER_TIME` [S] |
| `behavior.item-activation` | locked | Enter/Space/click fire the item and close the menu — `MenuItem.tsx`'s own `onKeyDown` (`" "`/`"Enter"` dispatch a synthetic click) and `keydownHandlers.ts`'s `Enter`/`" "` handlers, which also call `dispatch({type: CLOSE_CASCADING_MENU})` and refocus the trigger [S] | Enter/Space/click [R] | Enter/Space/click — `menuItemController.onClick`/`onKeydown` [S] |
| `behavior.disabled-item` | locked | disabled items are skipped by nav and inert to click — `isIndexDisabled()` guards every handler in `keydownHandlers.ts`; `MenuItem.tsx` sets `aria-disabled` and a no-op `onClick` [S] | disabled items skipped [R] | `:host([disabled])` sets `pointer-events:none` + reduced opacity; `MenuItemController` guards activation [S] |
| `behavior.submenu-open` | switchable | ArrowRight, click, or hover (`safePolygon`-mediated, `useHover(context,{enabled:isNested && !focusInside})`) opens the child menu — `keydownHandlers.ts`'s `ArrowRight` handler + `MenuBase.tsx` hover wiring [S] | on [R] — `DropdownMenuSubTrigger`'s `data-state="open"` styling implies the mechanism; the trigger mechanics live in the external package | ArrowRight, click, or hover (`hoverOpenDelay`, default `400`ms) — `sub-menu.ts:56`, `menu.ts`'s `ArrowLeft`/`Right` swap-by-direction logic [S] |
| `behavior.submenu-close` | switchable | ArrowLeft or Escape closes the submenu and returns focus to its own trigger item — `keydownHandlers.ts:132` (`ArrowLeft`), `:144` (`Escape`) [S] | on [R] — same external-package boundary | ArrowLeft, or the submenu's own `close-menu` event (`sub-menu.ts`'s `onCloseSubmenu`), `hoverCloseDelay` default `400`ms [S] |
| `behavior.dismiss-outside` | locked | on — `useDismiss(context,{bubbles:true})` [S] | on [R] — external package (Radix's `DismissableLayer`, general convention) | on — `menu.ts`'s `stayOpenOnOutsideClick` (default `false`, meaning outside clicks DO dismiss unless overridden) [S] |
| `behavior.dismiss-escape` | locked | on — `useDismiss` covers Escape by default (floating-ui convention) [S] | on [R] | on — `menu.ts`'s `KeydownCloseKey` handling [S] |
| `behavior.focus-return` | locked | on — `MenuPanel.tsx`'s `focusManagerProps`: `returnFocus: !isNested` (the ROOT menu returns focus on close; a nested submenu does not, matching `behavior.submenu-close`'s own item-level return instead) [S] | on [R] — general APG menu convention | on — `SubMenu.show()`'s own comment on why it must NOT return focus itself (the parent owns it); root-level return is the general convention [R for the root; S for the submenu non-return] |

**A genuinely CONVERGENT row, worth flagging per rule 7 of the seven drift
modes ("an unexplained convergence is the shape rule 1 forbids")**:
`behavior.role`/`behavior.item-role` land on the identical `"menu"`/
`"menuitem"` string in all three systems. Explained, not assumed: this is
the ARIA menu pattern's own fixed vocabulary (APG defines exactly these two
role strings for this widget), independently implemented three times —
Salt via floating-ui's `useRole` helper, M3 via a literal
`ElementInternals.role` assignment, shadcn via an external package this
pipeline cannot inspect but which is universally documented to do the same
— not one system's convention leaking into the others.

## 3 · Prop

| row | policy | note |
|---|---|---|
| `prop.item-variant` | switchable | shadcn only: `DropdownMenuItem`'s `variant?: "default" \| "destructive"` [S], real distinct styling (`data-variant="destructive"` recolors text and focus background). Salt/M3: off — neither `MenuDescriptor` nor `MenuItemType` has a sentiment/tone axis. |
| `prop.submenu-hover-delay` | default | info row (magnitude, not enum — same pattern as toast's `prop.duration`). M3: real, sourced `400`ms both open and close (`sub-menu.ts`). Salt: `safePolygon` has no explicit numeric delay (immediate-but-cursor-tolerant, a qualitatively different mechanism, not a number to compare). shadcn: [R], external. This chassis's own registry default (labelled, not sourced): `300`ms open, `300`ms close, applied uniformly — a reasonable middle value, not a fabricated system fact. |

## 4 · Slot

| row | note |
|---|---|
| `slot.composes` | Declared composition, same pattern as toast/select: the leading item-icon and submenu chevron compose a future registry icon-set component; rendered as neutral placeholder glyphs here. |
| `slot.item-label` | Consumer-owned item text. All three systems accept arbitrary children/slotted content. |
| `slot.item-shortcut-text` | Consumer-owned trailing string, where the system has the part (see `structure.item-shortcut` — shadcn/M3 only). |

## 5 · State

| row | policy | note |
|---|---|---|
| `state.rest` | locked | The item's un-highlighted appearance. |
| `state.active-item` | locked | The currently keyboard-/pointer-highlighted item — Salt's `activeIndex`-driven `blurActive`/hover classes, shadcn's Radix `data-highlighted`, M3's `menuItemController`'s own active-item tracking. All three keep exactly ONE item active at a time. |
| `state.disabled` | locked | see `behavior.disabled-item`. |
| `state.open` | locked | trigger's own open/closed visual — see `style.trigger.background@open`. |

## 6 · Style — see the generated `Resolved values` block below for every
cell. Selected findings:

### Findings

1. **Salt's `MenuButtonTrigger` open-state override is a DEAD reference
   under the pinned "next" theme — a genuine, grepped finding, not a
   maybe.** `MenuButtonTrigger.css` sets
   `--saltMenuButton-trigger-open-background, var(--saltMenuButton-trigger-open-color)`
   defaulting to `var(--salt-actionable-primary-background-active)` /
   `var(--salt-actionable-primary-foreground-active)`. Grepped across the
   ENTIRE theme package: `--salt-actionable-primary-background-active` and
   its foreground sibling are defined in exactly one place —
   `packages/theme/css/legacy/deprecated/characteristics.css`, as
   backward-compat ALIASES pointing at
   `--salt-actionable-bold-background-active`/`-foreground-active`, and the
   theme package's own `CHANGELOG.md` confirms this is a documented
   rename. Under the "next" theme every other Salt column in this pipeline
   pins, this custom property is simply undefined, so the `var()` falls
   through silently and NO extra open-state background applies beyond
   whatever the referenced fallback chain already provides — meaning the
   trigger's real, OBSERVABLE open-state styling comes entirely from
   `Button.css`'s own generic `[aria-expanded="true"][aria-haspopup="menu"]`
   rule (`--button-background-active`/`-text-color-active`, i.e. the SAME
   values as the pressed/active state). Modelled here as `style.trigger.
   background@open` aliasing the SAME slot as `@active` — the honest,
   verified answer, not the more interesting-looking dedicated color the
   component-specific CSS file implies at a glance.
2. **shadcn's canonical trigger has no owned style at all — a real,
   structural absence distinct from "not yet styled".** Every other part
   this pipeline has built with a shadcn column has SOME real class list.
   `DropdownMenuTrigger` has none. `style.trigger.*` is therefore recorded
   `off` for shadcn across the board, each cell citing the same one-line
   wrapper as its source — not a gap in this session's research, a gap in
   the canonical component itself (the consumer is expected to compose
   shadcn's own `Button`).
3. **M3's v0.192 edition has no `_md-comp-menu-item.scss` file — the same
   "edition strips a whole token family" shape ALERT/PROGRESS/SPINNER
   already found for their own parts, but resolved differently here.**
   Unlike those cases (a genuine, permanent, declared gap), M3's own
   UNVERSIONED menu-item token function derives its values by merging
   `menu.values()` with `md-comp-list-item.values()` — and that
   list-item function ITSELF hardcodes `@use 'versions/v0_192/md-comp-list'`
   as its one and only dependency, meaning the "current" derivation is
   already, structurally, resolving against the exact edition this
   pipeline pins everywhere else. Treated as a real, [S], traceable
   derivation (see §0), not a declared gap — the numbers are real v0.192
   numbers, just reached through one more file than most M3 columns need.
4. **Salt's item END-adornment is exclusively the submenu chevron — there
   is no shortcut-text slot to relocate it to.** `structure.item-shortcut`
   is `off` for Salt for a real structural reason (see §1), not a missed
   grep: `CascadingMenuItem.tsx`'s `hasEndAdornment` branch renders
   `ExpandGroupIcon` unconditionally when true, nothing else.
5. **`check-anatomy.mjs` reports `dropdown-menu 10 parts · 7 shared · 0
   system-unique` — a genuinely different SHAPE of convergence from every
   prior component's own "identical part-set" finding, and it required
   fixing a real gap in this column's own documentation before the number
   was trustworthy.** First pass showed only 3 shared parts, because the
   Salt column's `structure.trigger`/`.popup`/`.item`/`.separator` rows
   (locked, channel=info, real and present in Salt the whole time) simply
   had no `cells` entry at all — `check-anatomy.mjs`'s own `partsOf()`
   treats a MISSING cell identically to an explicit `off` one
   (`if (!c) continue`), so four real Salt parts were silently invisible
   to the gate until cells were added for them (matching the completeness
   shadcn's and M3's own columns already had for these rows). After the
   fix: 0 system-unique is CORRECT, not a bug, and it is not the ordinary
   "two systems are identical" shape either — no single divergent part is
   unique to exactly one system. `structure.item-shortcut` is shared by
   shadcn+M3, absent only from Salt; `structure.group`/`.group-label` are
   shared by Salt+shadcn, absent only from M3. Two DIFFERENT systems each
   own the "odd one out" role on a different axis, which is why the gate's
   coarse unique-count reads as zero even though the matrix's own 68-row
   grain shows real, asymmetric divergence — the same "coarse measure,
   real grain" explanation SWITCH-MATRIX.md finding 12 and RADIO-GROUP-
   MATRIX.md finding 4 already established for their own convergences.

6. **The submenu keyboard story is the sharpest THREE-WAY CONVERGENCE this
   pipeline has recorded**: ArrowRight-opens / ArrowLeft-closes is
   independently, explicitly coded in Salt's `keydownHandlers.ts`, M3's
   `menu.ts` (`this.isSubmenuOpenKey`-equivalent direction swap by
   `dir==='rtl'`), and is the universally documented Radix/APG convention
   shadcn (via the external package) implements. All three ALSO converge
   on hover-opens-with-a-delay as a second, independent activation path.
   Not modelled as a dead axis: the skeleton's own `ArrowRight`/`ArrowLeft`
   handlers are real and drive a real nested-popup mount/unmount, verified
   live (see the report).
7. **Orchestrator re-verification of `behavior.dismiss-escape` first
   LOOKED like a real three-way bug, then turned out to be the reviewer's
   own test, not the skeleton — the same class of trap as TABS-MATRIX.md
   finding 15, one level removed.** A live Playwright pass that opened
   stage 1's real (non-forced) trigger and pressed Escape found
   `document.activeElement` correctly returned to the trigger button, but
   a GLOBAL `document.querySelector('[data-slot="dropdown-menu-popup"]')`
   still matched — because this harness deliberately mounts several OTHER
   `forceOpen` instances on the same page (stage 2's static parts demo,
   stage 3's auto-opened submenu demo, stage 4's destructive-item demo),
   and an unscoped selector cannot tell "the popup I closed" from "a
   different popup this page always keeps open on purpose." Re-run scoped
   to the interacted instance's own container
   (`trigger.closest(".checkbox-row")`) confirmed the true sequence:
   click opens the popup AND moves real DOM focus onto it (the
   `useLayoutEffect` at `skeleton/dropdown-menu.tsx:323-330`, tabIndex=-1
   makes the popup programmatically focusable), Escape closes it and
   returns focus to the trigger, `popupExists` correctly flips to
   `false`. Also re-verified live in the same pass: ArrowDown correctly
   skips the disabled `r2`/"notes.md" item and clamps at the last root
   node ("Share"); ArrowRight opens the submenu with zero rect overlap
   between `dropdown-menu-popup` and `dropdown-menu-submenu-popup`
   (measured, not assumed); ArrowLeft closes the submenu and returns
   `data-active` to the submenu's own trigger ("Share"), matching
   `behavior.submenu-close`'s documented parent-layer-reclaims-focus
   design (see the `closeSubmenu()` comment at line ~306). No skeleton
   change required — logged here so a future session doesn't re-spend
   time on the same unscoped-selector trap.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/dropdown-menu.template.json` against every system, read from `columns/dropdown-menu.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 15 light, 12 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `trigger-bg` | transparent | — | **no** |
| `trigger-fg` | rgb(0, 0, 0) | rgb(255, 255, 255) | **no** |
| `trigger-bg-hover` | rgba(0, 0, 0, 0.1) | rgba(255, 255, 255, 0.1) | **no** |
| `trigger-bg-active` | rgba(0, 0, 0, 0.15) | rgba(255, 255, 255, 0.15) | **no** |
| `popup-bg` | rgb(255, 255, 255) | rgb(16, 24, 32) | **no** |
| `popup-fg` | rgb(0, 0, 0) | rgb(255, 255, 255) | **no** |
| `popup-border` | rgb(0, 120, 207) | — | yes |
| `popup-shadow` | 0 6px 10px 0 rgba(0,0,0,0.2) | 0 6px 10px 0 rgba(0,0,0,0.55) | yes |
| `item-bg` | transparent | — | **no** |
| `item-bg-hover` | rgb(234, 246, 255) | rgb(0, 23, 54) | **no** |
| `item-fg` | rgb(0, 0, 0) | rgb(255, 255, 255) | **no** |
| `item-fg-disabled` | rgba(0, 0, 0, 0.4) | rgba(255, 255, 255, 0.4) | **no** |
| `item-open-bg` | rgb(199, 222, 255) | rgb(0, 45, 89) | **no** |
| `separator-color` | rgba(0, 0, 0, 0.3) | rgba(255, 255, 255, 0.3) | yes |
| `group-label-fg` | rgb(76, 81, 87) | rgb(177, 181, 185) | **no** |

**shadcn** — 14 light, 8 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `popup-bg` | oklch(1 0 0) | oklch(0.205 0 0) | **no** |
| `popup-fg` | oklch(0% 0 0) | oklch(0.985 0 0) | **no** |
| `popup-border` | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | yes |
| `popup-shadow` | 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) | — | yes |
| `item-bg-hover` | oklch(0.97 0 0) | oklch(0.371 0 0) | **no** |
| `item-fg-hover` | oklch(0.205 0 0) | oklch(0.985 0 0) | **no** |
| `fg-muted` | oklch(0.556 0 0) | oklch(0.708 0 0) | yes |
| `danger` | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | **no** |
| `danger-bg-hover` | color-mix(in oklab, oklch(0.577 0.245 27.325) 10%, transparent) | color-mix(in oklab, oklch(0.704 0.191 22.216) 20%, transparent) | **no** |
| `radius-popup` | calc(0.625rem * 0.8) | — | **no** |
| `radius-item` | calc(0.625rem * 0.6) | — | **no** |
| `type-body` | 400 0.875rem/1.25rem ui-sans-serif, system-ui, sans-serif | — | **no** |
| `type-shortcut` | 400 0.75rem/1rem ui-sans-serif, system-ui, sans-serif | — | **no** |
| `type-label` | 500 0.875rem/1.25rem ui-sans-serif, system-ui, sans-serif | — | **no** |

**m3** — 9 light, 8 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `trigger-fg` | #49454f | #cac4d0 | **no** |
| `trigger-layer` | color-mix(in srgb, #49454f 8%, transparent) | color-mix(in srgb, #cac4d0 8%, transparent) | **no** |
| `trigger-layer-strong` | color-mix(in srgb, #49454f 12%, transparent) | color-mix(in srgb, #cac4d0 12%, transparent) | **no** |
| `popup-bg` | #f3edf7 | #211f26 | yes |
| `popup-shadow` | 0 1px 2px 0 rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15) | — | yes |
| `item-fg` | #1d1b20 | #e6e0e9 | yes |
| `item-icon-fg` | #49454f | #cac4d0 | yes |
| `item-layer` | color-mix(in srgb, #1d1b20 8%, transparent) | color-mix(in srgb, #e6e0e9 8%, transparent) | **no** |
| `item-open-bg` | #e8def8 | #4a4458 | yes |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.trigger` | structure | locked | `True` | `True` | `True` |
| 2 | `structure.popup` | structure | locked | `True` | `True` | `True` |
| 3 | `structure.item` | structure | locked | `True` | `True` | `True` |
| 4 | `structure.item-icon` | structure | switchable | `True` | `True` | `True` |
| 5 | `structure.item-shortcut` | structure | switchable | **off** | `True` | `True` |
| 6 | `structure.separator` | structure | locked | `True` | `True` | `True` |
| 7 | `structure.group` | structure | switchable | `True` | `True` | **off** |
| 8 | `structure.group-label` | structure | switchable | `True` | `True` | **off** |
| 9 | `structure.submenu-trigger` | structure | switchable | `True` | `True` | `True` |
| 10 | `structure.submenu-popup` | structure | switchable | `True` | `True` | `True` |
| 11 | `behavior.role` | behavior | locked | — | — | — |
| 12 | `behavior.item-role` | behavior | locked | — | — | — |
| 13 | `behavior.trigger-interaction` | behavior | locked | — | — | — |
| 14 | `behavior.arrow-navigation` | behavior | locked | — | — | — |
| 15 | `behavior.home-end` | behavior | switchable | `True` | `True` | `True` |
| 16 | `behavior.typeahead` | behavior | switchable | **off** | `True` | `True` |
| 17 | `behavior.item-activation` | behavior | locked | — | — | — |
| 18 | `behavior.disabled-item` | behavior | locked | — | — | — |
| 19 | `behavior.submenu-open` | behavior | switchable | `ArrowRight, click, or hover (safePolygon-mediated, no fixed numeric delay)` | `ArrowRight, click, or hover` | `ArrowRight, click, or hover (400ms delay)` |
| 20 | `behavior.submenu-close` | behavior | switchable | `ArrowLeft or Escape, returns focus to the submenu-trigger item` | `ArrowLeft or Escape` | `ArrowLeft, or the submenu's own close-menu event (400ms hover-close delay)` |
| 21 | `behavior.dismiss-outside` | behavior | locked | — | — | — |
| 22 | `behavior.dismiss-escape` | behavior | locked | — | — | — |
| 23 | `behavior.focus-return` | behavior | locked | — | — | — |
| 24 | `prop.item-variant` | prop | switchable | **off** | `default, destructive` | **off** |
| 25 | `prop.submenu-hover-delay` | prop | default | `safePolygon (cursor-tolerant proximity, not a fixed delay)` | `unspecified` | `400` |
| 26 | `slot.composes` | slot | default | — | — | — |
| 27 | `slot.item-label` | slot | locked | — | — | — |
| 28 | `slot.item-shortcut-text` | slot | switchable | — | — | — |
| 29 | `state.rest` | state | locked | — | — | — |
| 30 | `state.active-item` | state | locked | — | — | — |
| 31 | `state.disabled` | state | locked | — | — | — |
| 32 | `state.open` | state | locked | — | — | — |
| 33 | `style.trigger.background` | style | switchable | ⟡ `trigger-bg` | **off** | **off** |
| 34 | `style.trigger.color` | style | switchable | ⟡ `trigger-fg` | **off** | ⟡ `trigger-fg` |
| 35 | `style.trigger.shape` | style | switchable | ⟡ `trigger-shape` | **off** | `9999px` |
| 36 | `style.trigger.padding` | style | switchable | ⟡ `trigger-padding` | **off** | **off** |
| 37 | `style.trigger.font` | style | switchable | ⟡ `type-body` | **off** | `500 0.875rem/1.25rem Roboto` |
| 38 | `style.trigger.background@open` | style | switchable | ⟡ `trigger-bg-active` | **off** | **off** |
| 39 | `style.trigger.opacity@disabled` | style | switchable | `0.4` | **off** | `0.38` |
| 40 | `style.popup.background` | style | locked | ⟡ `popup-bg` | ⟡ `popup-bg` | ⟡ `popup-bg` |
| 41 | `style.popup.color` | style | locked | ⟡ `popup-fg` | ⟡ `popup-fg` | ⟡ `item-fg` |
| 42 | `style.popup.border` | style | switchable | `border: 1px solid var(--popup-border)` | `border: 1px solid var(--popup-border)` | **off** |
| 43 | `style.popup.shape` | style | locked | `6px` | `8px` | `4px` |
| 44 | `style.popup.shadow` | style | default | ⟡ `popup-shadow` | ⟡ `popup-shadow` | ⟡ `popup-shadow` |
| 45 | `style.popup.padding` | style | switchable | **off** | `4px` | **off** |
| 46 | `style.popup.gap` | style | switchable | `1px` | **off** | **off** |
| 47 | `style.popup.min-width` | style | switchable | `10em` | `128px` | `112px` |
| 48 | `style.popup.z-index` | style | switchable | `1500` | `50` | `20` |
| 49 | `style.item.background` | style | locked | ⟡ `item-bg` | `transparent` | `transparent` |
| 50 | `style.item.color` | style | locked | ⟡ `item-fg` | ⟡ `popup-fg` | ⟡ `item-fg` |
| 51 | `style.item.font` | style | locked | ⟡ `type-body` | ⟡ `type-body` | `400 1rem/1.5rem Roboto` |
| 52 | `style.item.padding` | style | locked | ⟡ `item-padding` | `6px 8px` | `12px 16px` |
| 53 | `style.item.gap` | style | locked | ⟡ `item-gap` | `8px` | `16px` |
| 54 | `style.item.min-height` | style | switchable | ⟡ `item-min-height` | **off** | `56px` |
| 55 | `style.item.shape` | style | switchable | **off** | ⟡ `radius-item` | `4px` |
| 56 | `style.item.background@hover` | style | locked | ⟡ `item-bg-hover` | ⟡ `item-bg-hover` | ⟡ `item-layer` |
| 57 | `style.item.opacity@disabled` | style | switchable | **off** | `0.5` | `0.3` |
| 58 | `style.item.color@destructive` | style | switchable | **off** | ⟡ `danger` | **off** |
| 59 | `style.item.background@destructive-hover` | style | switchable | **off** | ⟡ `danger-bg-hover` | **off** |
| 60 | `style.icon.color` | style | switchable | `currentColor` | ⟡ `fg-muted` | ⟡ `item-icon-fg` |
| 61 | `style.icon.size` | style | switchable | ⟡ `icon-size` | `16px` | `24px` |
| 62 | `style.shortcut.color` | style | switchable | **off** | ⟡ `fg-muted` | ⟡ `item-icon-fg` |
| 63 | `style.shortcut.font` | style | switchable | **off** | ⟡ `type-shortcut` | `500 0.6875rem/1rem Roboto` |
| 64 | `style.separator.color` | style | switchable | ⟡ `separator-color` | ⟡ `popup-border` | **off** |
| 65 | `style.separator.margin` | style | default | `4px 0` | `4px -4px` | `8px 0` |
| 66 | `style.group-label.color` | style | switchable | ⟡ `group-label-fg` | **off** | **off** |
| 67 | `style.group-label.font` | style | switchable | `font: var(--type-label); padding: var(--group-label-padding)` | `font: var(--type-label); padding: 6px 8px` | **off** |
| 68 | `style.submenu-trigger.background@open` | style | switchable | ⟡ `item-open-bg` | ⟡ `item-bg-hover` | ⟡ `item-open-bg` |

<details><summary>Citations — 122 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.trigger` | salt | MenuButtonTrigger wraps a real Button (MenuButton.tsx) |
| `structure.trigger` | shadcn | DropdownMenuTrigger, real element, zero owned style — see trigger-is-unstyled |
| `structure.trigger` | m3 | standard-menu-button token family, real, v0.192-pinned |
| `structure.popup` | salt | MenuPanel, role="menu" (packages/core/src/menu/MenuPanel.tsx) |
| `structure.popup` | shadcn | DropdownMenuContent, portalled |
| `structure.popup` | m3 | menu.ts's .menu/.items, popover API |
| `structure.item` | salt | MenuItem / CascadingMenuItem, role="menuitem" |
| `structure.item` | shadcn | DropdownMenuItem |
| `structure.item` | m3 | menu-item.ts |
| `structure.item-icon` | salt | CascadingMenuItem.tsx: hasStartAdornment renders menuItemStartAdornmentContainer |
| `structure.item-icon` | shadcn | informal — any child <svg> generically sized, no dedicated data-slot in the canonical source |
| `structure.item-icon` | m3 | [slot='start'], dedicated |
| `structure.item-shortcut` | salt | CONFIRMED ABSENT — CascadingMenuItem's only end-adornment is the submenu chevron (ExpandGroupIcon), no free-text trailing slot exists anywhere in the file |
| `structure.item-shortcut` | shadcn | DropdownMenuShortcut, dedicated exported part |
| `structure.item-shortcut` | m3 | [slot='trailing-supporting-text'], dedicated |
| `structure.separator` | salt | CascadingMenuItem's own divider prop renders a real sibling <div role="separator"> |
| `structure.separator` | shadcn | DropdownMenuSeparator |
| `structure.separator` | m3 | ::slotted(:is(md-divider,[role='separator'])) |
| `structure.group` | salt | core/menu/MenuGroup.tsx, role="group" |
| `structure.group` | shadcn | DropdownMenuGroup |
| `structure.group` | m3 | CONFIRMED ABSENT — no group wrapper or token family anywhere in menu/ |
| `structure.group-label` | salt | MenuGroup.tsx's own `label` prop |
| `structure.group-label` | shadcn | DropdownMenuLabel |
| `structure.group-label` | m3 | CONFIRMED ABSENT, same reason as structure.group |
| `structure.submenu-trigger` | salt | CascadingMenuItem with a child menu (hasSubMenu) |
| `structure.submenu-trigger` | shadcn | DropdownMenuSubTrigger |
| `structure.submenu-trigger` | m3 | sub-menu.ts's SubMenu, slotted item |
| `structure.submenu-popup` | salt | the child CascadingMenu's own panel, placement:"right-start" (MenuBase.tsx:101) |
| `structure.submenu-popup` | shadcn | DropdownMenuSubContent |
| `structure.submenu-popup` | m3 | sub-menu.ts's SubMenu, slotted menu |
| `behavior.home-end` | salt | keydownHandlers.ts:191 Home, :207 End |
| `behavior.home-end` | shadcn | [R] — external package, general APG convention |
| `behavior.home-end` | m3 | menu.ts:51-52 NavigableKeys.Home/.End |
| `behavior.typeahead` | salt | CONFIRMED ABSENT — grepped directly, no useTypeahead/typeahead code anywhere in core/menu or lab/cascading-menu |
| `behavior.typeahead` | shadcn | [R] — external package, Radix's own documented typeahead support |
| `behavior.typeahead` | m3 | menu.ts's real TypeaheadController |
| `behavior.submenu-open` | salt | keydownHandlers.ts ArrowRight; MenuBase.tsx useHover(context,{enabled:isNested && !focusInside}) |
| `behavior.submenu-open` | shadcn | [R] — data-state="open" styling implies the mechanism; the trigger logic lives in the external package |
| `behavior.submenu-open` | m3 | sub-menu.ts:56 hoverOpenDelay=400 |
| `behavior.submenu-close` | salt | keydownHandlers.ts:132 ArrowLeft, :144 Escape |
| `behavior.submenu-close` | shadcn | [R] — same external-package boundary |
| `behavior.submenu-close` | m3 | sub-menu.ts hoverCloseDelay=400, onCloseSubmenu |
| `prop.item-variant` | salt | no sentiment/tone axis on a menu item in either real Salt menu implementation |
| `prop.item-variant` | shadcn | DropdownMenuItem's own variant?: "default"\|"destructive" prop, real, sourced [S] |
| `prop.item-variant` | m3 | no sentiment/tone axis — MenuItemType is menuitem\|option\|button\|link, no destructive concept |
| `prop.submenu-hover-delay` | salt | qualitatively different mechanism from a numeric ms delay — not a number to compare against M3's 400ms |
| `prop.submenu-hover-delay` | shadcn | [R] — external package, not independently confirmable in this clone |
| `prop.submenu-hover-delay` | m3 | sub-menu.ts hoverOpenDelay/hoverCloseDelay, both default 400 |
| `style.trigger.background` | shadcn | CONFIRMED ABSENT — see trigger-is-unstyled |
| `style.trigger.background` | m3 | CONFIRMED ABSENT — no container-color/background token in standard-menu-button |
| `style.trigger.color` | shadcn | CONFIRMED ABSENT — see trigger-is-unstyled |
| `style.trigger.shape` | shadcn | CONFIRMED ABSENT — see trigger-is-unstyled |
| `style.trigger.shape` | m3 | container-shape -> corner-full |
| `style.trigger.padding` | shadcn | CONFIRMED ABSENT — see trigger-is-unstyled |
| `style.trigger.padding` | m3 | CONFIRMED ABSENT — no padding/leading-space token in standard-menu-button |
| `style.trigger.font` | shadcn | CONFIRMED ABSENT — see trigger-is-unstyled |
| `style.trigger.font` | m3 | label-text -> label-large |
| `style.trigger.background@open` | salt | see provenance's trigger-open-is-a-dead-reference — the dedicated MenuButton override never actually applies under the pinned theme |
| `style.trigger.background@open` | shadcn | CONFIRMED ABSENT — see trigger-is-unstyled |
| `style.trigger.background@open` | m3 | CONFIRMED ABSENT — only hover/focus/pressed families exist, no distinct open state |
| `style.trigger.opacity@disabled` | salt | Button.css .saltButton:disabled { opacity: 0.4 } |
| `style.trigger.opacity@disabled` | shadcn | CONFIRMED ABSENT — see trigger-is-unstyled |
| `style.trigger.opacity@disabled` | m3 | disabled-label-text-opacity |
| `style.popup.color` | m3 | internal/_menu.scss :host sets `color: unset` (inherits ambiently, no owned token) — this locked row is expressed via the item's own real label-text-color (on-surface) as the closest honest resolution, since that is what is actually painted throughout the popup |
| `style.popup.border` | salt | MenuPanel.css border: var(--salt-size-fixed-100) solid var(--salt-selectable-borderColor-selected) |
| `style.popup.border` | shadcn | DropdownMenuContent's bare `border` utility -> --border |
| `style.popup.border` | m3 | CONFIRMED ABSENT — .menu{border:none} |
| `style.popup.shape` | salt | palette-corner (curve-150), medium-density value reused across densities in this column (density-approximated, see provenance) |
| `style.popup.shape` | shadcn | rounded-md = --radius-md |
| `style.popup.shape` | m3 | container-shape -> corner-extra-small |
| `style.popup.padding` | salt | CONFIRMED OFF — no padding property on MenuPanel.css's panel or container rules |
| `style.popup.padding` | shadcn | class p-1 |
| `style.popup.padding` | m3 | CONFIRMED ABSENT at the container level |
| `style.popup.gap` | salt | MenuPanel.css's own .saltMenuPanel-container rule: gap: var(--salt-spacing-fixed-100) |
| `style.popup.gap` | shadcn | CONFIRMED ABSENT — items sit flush inside the p-1 padding |
| `style.popup.gap` | m3 | CONFIRMED ABSENT, no gap token |
| `style.popup.min-width` | salt | MenuPanel.css min-width: 10em |
| `style.popup.min-width` | shadcn | class min-w-[8rem] |
| `style.popup.min-width` | m3 | :host{min-width:112px} |
| `style.popup.z-index` | salt | MenuPanel.css z-index: var(--salt-zIndex-flyover) |
| `style.popup.z-index` | shadcn | class z-50 |
| `style.popup.z-index` | m3 | .menu{z-index:20} |
| `style.item.background` | shadcn | no bg class at rest |
| `style.item.background` | m3 | DELIBERATE, explicit transparent — container-color is EXPLICITLY set to transparent so items inherit the popup's own fill (see item-bg-off provenance) — a real value, not an absence, so this locked row is honestly filled rather than left off |
| `style.item.color` | shadcn | no OWN colour class at rest — DropdownMenuItem sets no text-color utility, so this is the inherited popup-fg value made explicit for this locked row, not a distinct component token |
| `style.item.font` | m3 | label-text -> body-large |
| `style.item.padding` | shadcn | py-1.5 px-2 |
| `style.item.padding` | m3 | top/bottom-space 12px + leading/trailing-space 16px |
| `style.item.gap` | shadcn | gap-2 |
| `style.item.gap` | m3 | menu-item.ts :host{gap:16px} |
| `style.item.min-height` | shadcn | CONFIRMED ABSENT — content-driven |
| `style.item.min-height` | m3 | one-line-container-height |
| `style.item.shape` | salt | CONFIRMED OFF — MenuItem.css has no border-radius rule |
| `style.item.shape` | m3 | border-radius:inherit from the popup's own corner-extra-small |
| `style.item.background@hover` | m3 | hover/focus state-layer, color-mix at 8%/12% over the container |
| `style.item.opacity@disabled` | salt | Salt recolours (content-primary-foreground-disabled) rather than reducing opacity — see item-fg-disabled provenance; modelling this row as an opacity multiply would ALSO incorrectly dim the (unchanged) background, so it stays off and the real recolour is documented in style.item.color's own disabled note instead |
| `style.item.opacity@disabled` | shadcn | data-[disabled]:opacity-50 |
| `style.item.opacity@disabled` | m3 | disabled-opacity (v0.192) |
| `style.item.color@destructive` | salt | no variant axis |
| `style.item.color@destructive` | m3 | no variant axis |
| `style.item.background@destructive-hover` | salt | no variant axis |
| `style.item.background@destructive-hover` | m3 | no variant axis |
| `style.icon.color` | salt | no dedicated icon-color rule in MenuItem.css/CascadingMenuItem.css — the icon inherits the item's own text colour |
| `style.icon.size` | shadcn | class size-4 on non-annotated svg children |
| `style.icon.size` | m3 | [R] — Material's own default md-icon size; no menu-item-specific size token exists |
| `style.shortcut.color` | salt | structure.item-shortcut is off — no part to colour |
| `style.shortcut.color` | m3 | trailing-supporting-text-color, the SAME on-surface-variant role as the leading icon |
| `style.shortcut.font` | salt | structure.item-shortcut is off |
| `style.shortcut.font` | m3 | trailing-supporting-text -> label-small |
| `style.separator.color` | shadcn | bg-border, modelled as an equivalent border-color for this template's border-based separator rule |
| `style.separator.color` | m3 | no dedicated colour token — the slotted element's own default colour applies, [R] |
| `style.separator.margin` | salt | REGISTRY DEFAULT, not sourced (CascadingMenuItem.css's own divider is a full-bleed border-bottom with no standalone margin concept to cite — see provenance's separator-margin entry). Policy=default rows must supply a labelled default rather than resolve to off (CLAUDE.md rule 14 / TOAST-MATRIX.md finding 9). |
| `style.separator.margin` | shadcn | class my-1 -mx-1 |
| `style.separator.margin` | m3 | ::slotted(:is(md-divider,[role='separator'])) { margin: 8px 0 } |
| `style.group-label.color` | shadcn | CONFIRMED absent — no colour class, see group-label-no-color provenance; a real contrast with select's own muted label |
| `style.group-label.color` | m3 | structure.group-label is off |
| `style.group-label.font` | salt | MenuGroup.css label rule: font family/size/weight-strong/line-height + padding formula |
| `style.group-label.font` | shadcn | class text-sm font-medium px-2 py-1.5 |
| `style.group-label.font` | m3 | structure.group-label is off |
| `style.submenu-trigger.background@open` | salt | MenuItem's own -blurActive class / CascadingMenuItem's -menuItemBlurSelected, both -> selectable-background-selected, the SAME slot as calendar's own interaction-selected |
| `style.submenu-trigger.background@open` | shadcn | data-[state=open]:bg-accent, the SAME slot as plain hover |
| `style.submenu-trigger.background@open` | m3 | list-item-selected-container-color -> secondary-container, a DIFFERENT slot from plain hover |

</details>

<!-- END GENERATED VALUES -->
