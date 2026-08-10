# Drawer — component template matrix

*Twenty-fifth live component in the post-clean-slate pipeline (button,
calendar, spinner, tooltip, alert, input, select, dialog, tabs, card, badge,
progress, chip, checkbox, switch, radio-group, slider, toast, dropdown-menu,
accordion, popover, combobox, toggle-group, table came before). Same method
as [DIALOG-MATRIX.md](DIALOG-MATRIX.md): a modal, edge-anchored overlay that
reuses dialog.tsx's own proven focus-trap/background-suppression/dismissal
mechanisms wholesale, narrowing them only where a real, sourced difference
was found in Drawer.tsx itself.*

---

## 0 · Scope

### The drawer/sheet naming overlap, resolved before any code

`1-intro/content/04-component-map.md`'s Overlays section carries TWO adjacent
rows: `drawer | ✓ | ✓ | ✓ navigation-drawer, sheet-side` and `sheet | ✓ | ✓
side-panel | ✓ sheet-bottom, sheet-floating, sheet-side`. Both list M3's
`sheet-side` — the map's own way of flagging an ambiguity, not a typo. Every
grep this session performed confirms the two rows are genuinely different
real components in every system, not one pattern under two names:

| system | `drawer`'s real component | `sheet`'s real component | how they differ, confirmed by reading both |
|---|---|---|---|
| Salt | `Drawer` (`packages/core/src/drawer/`) | `SidePanel` (`packages/core/src/side-panel/`) | `Drawer` is MODAL: composes `<Scrim fixed>`, `role="dialog"`, `aria-modal="true"`, `outsideElementsInert:true`. `SidePanel` is **non-modal**: `role="region"`, no Scrim anywhere in its source, no focus trap, no `aria-modal` — confirmed by reading `SidePanel.tsx` in full [S]. |
| shadcn | `Drawer` (`ui/drawer.tsx`, vaul) | `Sheet` (`ui/sheet.tsx`, `radix-ui`'s `Dialog`) | Both files exist side by side in this exact clone [S] — confirmed by directory listing before assuming from general shadcn knowledge, per this prompt's own instruction. `Sheet` has a default-rendered, pre-styled close X (`showCloseButton = true`) and no shadow-less/duration-asymmetric/drag-handle treatment; `Drawer` has none of Sheet's default close X, has an explicit asymmetric open/close duration, and has a real (if gesture-inert here) drag handle. Two visually similar but behaviourally distinct primitives, confirmed by reading both files in full [S]. |
| M3 | `_md-comp-sheet-side.scss` (docked-modal-\*) + `_md-comp-sheet-bottom.scss` (docked-drag-handle-\*) chassis tokens, cross-cited against `_md-comp-navigation-drawer.scss`'s own bare chassis family | `_md-comp-sheet-side.scss` (docked-STANDARD, the non-modal half of the SAME file) + `_md-comp-sheet-floating.scss` + `_md-comp-sheet-bottom.scss`'s own non-drag tokens | M3's own token vocabulary genuinely SPLITS one file (`sheet-side`) into a docked-**modal** half (temporary, dismissible, Scrim-adjacent — `docked-modal-container-*`) and a docked-**standard** half (persistent, no dismissal — `docked-standard-container-*`), which is exactly the same real modal/non-modal split Salt draws with two SEPARATE components (`Drawer` vs `SidePanel`) and shadcn draws with two separate primitives (`Drawer`/`Sheet` vs no persistent-panel primitive at all). |

**Resolution:** this row covers the MODAL, temporary, edge-anchored overlay —
Salt's `Drawer`, shadcn's `Drawer` (vaul), and M3's `docked-modal-*` /
`docked-drag-handle-*` chassis tokens. The **separate** `sheet` canonical row
(shadcn's `Sheet`, Salt's `SidePanel`, M3's `docked-standard-*` half of
`sheet-side` plus `sheet-floating`) is explicitly OUT OF SCOPE here, with the
structural reason being modality itself, not a naming preference — the same
class of distinction DIALOG-MATRIX.md's own scope note already drew between
`dialog` and `drawer` (a decision this row inherits and does not relitigate).

### Which edges are real, per system — verified, not assumed

| system | edges | source |
|---|---|---|
| Salt | left (default) / top / right / bottom | `DrawerProps.position?: "left" \| "top" \| "right" \| "bottom"` — all four confirmed with real, distinct CSS rules in `Drawer.css` [S] |
| shadcn | top / right / bottom (default) / left | vaul's own `direction` prop, forwarded through `data-vaul-drawer-direction` selectors on all four values in `drawer.tsx`'s own className string [S]; default confirmed `"bottom"` by `drawer-demo.tsx`'s own usage, which never passes a direction |
| M3 | left/right (`sheet-side`) and bottom (`sheet-bottom`) only | **no M3 top-sheet file exists anywhere in this clone** — confirmed by an exhaustive directory listing of `tokens/versions/v0_192/` for `*sheet*`/`*drawer*`: exactly four files (`navigation-drawer`, `sheet-bottom`, `sheet-floating`, `sheet-side`), none top-anchored. `@top` is genuinely `off` for M3 on every style row, not a gap — there is nothing to be a gap IN [S] |

### Drag-to-dismiss: a declared gap, not a rebuild

Real in two of three sources, and **only for the bottom edge in both**:
shadcn's vaul-based `DrawerContent` renders a real, sized drag-HANDLE bar
(`mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted`), shown via
`group-data-[vaul-drawer-direction=bottom]/drawer-content:block` — i.e.
`hidden` by CSS default and switched on ONLY for `direction="bottom"` [S].
M3's `_md-comp-sheet-bottom.scss` independently carries its OWN real
`docked-drag-handle-color/-height/-width` family — no equivalent exists in
`_md-comp-sheet-side.scss` or `_md-comp-navigation-drawer.scss` [S]. Two
unrelated sources landing on the identical "handle only for bottom" shape is
strong, independent confirmation, not a coincidence this build invented.

**The gesture engine itself is out of scope.** vaul's own pointer-tracking,
velocity calculation and snap-point math are NOT vendored anywhere in this
clone — confirmed by an exhaustive directory search of `3-source/` for
`*vaul*`: zero hits outside `apps/v4/package.json:101`'s own dependency
listing. This is the identical boundary TABLE-MATRIX.md drew for TanStack
Table, POPOVER-MATRIX.md/DROPDOWN-MENU-MATRIX.md drew for their own
positioning engines, and COMBOBOX-MATRIX.md drew for its own filtering
library: a real, external, unvendored dependency is a declared gap, not
something to reimplement from a description. This skeleton renders the
HANDLE — a real, sized, positioned bar — but the handle is not interactive.

### A structurally weaker evidence base than this pipeline's other overlays, declared up front

Unlike `radix-ui` (vendored under `3-source/ui/primitives/`, the real
behaviour source for `Sheet`'s and `Dialog`'s own shadcn columns), **`vaul`
is not vendored anywhere in this clone.** Every shadcn behaviour cell this
column could not read directly in `drawer.tsx`'s own JSX is marked `[R]`,
not `[S]` — a real, admitted asymmetry from this pipeline's other overlay
builds, not smoothed over by inferring confidence the clone does not
support.

---

## Sources

- **Salt** `[S]`: `packages/core/src/drawer/{Drawer.tsx,Drawer.css,
  DrawerCloseButton.tsx,DrawerCloseButton.css}` — all four files read in
  full. `packages/core/src/scrim/{Scrim.tsx,Scrim.css}` for the backdrop
  (the SAME component dialog.salt.json already cites — `Drawer.tsx`'s own
  `ConditionalScrimWrapper` renders the identical `<Scrim fixed>`).
  `packages/core/src/utils/{useFloatingUI/useFloatingUI.tsx,
  usePreventScroll.ts}` read again specifically to confirm `Drawer.tsx`
  never passes `lockScroll` (see Finding 4). `packages/core/stories/drawer/
  drawer.stories.tsx` read in full for real usage patterns (no default
  width/height, `aria-labelledby` wired by hand, `DrawerCloseButton`
  composition). `packages/core/src/side-panel/SidePanel.tsx` read only to
  fix the drawer-vs-sheet scope boundary (see Scope, above).
  `foundations/{zindex.css,animation.css}` for the stacking-layer and
  slide-keyframe evidence.
- **shadcn** `[S/R]`: `apps/v4/registry/new-york-v4/ui/drawer.tsx` — the
  CANONICAL base primitive, all 136 lines read in full. `apps/v4/registry/
  new-york-v4/examples/drawer-demo.tsx` read for real usage (no default
  close X anywhere; `DrawerClose` composed inside the footer as a plain
  "Cancel" button). `apps/v4/content/docs/components/radix/drawer.mdx` read
  for the documented external dependency. `apps/v4/package.json:101`
  confirms `vaul: 1.1.2` as an installed but UNVENDORED dependency — see
  Scope's own evidence-base note for what this means for every behaviour
  row. `apps/v4/registry/new-york-v4/ui/sheet.tsx` read ONLY to fix the
  scope boundary, never as a style/structure source for this row.
- **Material 3** `[S, tokens-only]`: `tokens/versions/v0_192/
  _md-comp-sheet-side.scss` (94 lines, read in full) for the `docked-modal-*`
  chassis family. `tokens/versions/v0_192/_md-comp-sheet-bottom.scss` (46
  lines, read in full) for the drag-handle family and the bottom-anchored
  corner treatment. `tokens/versions/v0_192/_md-comp-navigation-drawer.scss`
  (165 lines, read in full) cross-checked per the map's own dual citation —
  its bare chassis tokens agree in kind with `sheet-side`'s own
  `docked-modal-*` family; its large nav-item-list family (roughly 40 of its
  55 keys) is explicitly OUT OF SCOPE (see below). `tokens/versions/v0_192/
  _md-comp-sheet-floating.scss` (35 lines, read in full) read only to
  confirm it is NOT edge-anchored (`container-shape: corner-extra-large`, a
  single uniform value, unlike every other file here's partial/top/start
  form) and therefore belongs to `sheet`, not this row. Resolution through
  `versions/v0_192/{_md-sys-color.scss,_md-sys-shape.scss,
  _md-sys-elevation.scss,_md-sys-typescale.scss,_md-ref-typeface.scss}`.
  Values cross-referenced against columns already resolved in this
  registry rather than re-derived: `surface-container-low` (card.m3.json),
  `on-surface-variant` (dialog.m3.json/checkbox.m3.json), `outline`
  (select.m3.json), the canonical `level1` shadow CSS
  (`1-intro/content/foundations/elevation.md`).

### Edition pin — `v0.192`, matching the majority of this pipeline

No `latest`-edition diff was performed for this component specifically —
the four M3 files this column reads are chassis-only (colour, shape,
elevation, one drag-handle dimension family) with no deprecated-token
history to speak of, unlike dialog's own divider/subhead families.

### `navigation-drawer`'s large nav-item-list family, declared out of scope

`_md-comp-navigation-drawer.scss` is dominated (roughly 40 of its 55 keys)
by an `active-*`/`inactive-*`/`large-badge-*` token family styling a
NAVIGATION LIST composed inside a drawer chassis — icon colour, label-text
colour, state-layer colour, all split by active/inactive/focus/hover/
pressed. This is a structurally different and much bigger surface than a
generic content drawer: it belongs to a future `navigation-menu`/list-item
component, the same "declared composition, not modelled" treatment
DIALOG-MATRIX.md gives its own action buttons. Only `navigation-drawer`'s
BARE chassis tokens (`modal-container-color`/`-elevation`,
`container-width`/`-shape`, `standard-container-*`) are cross-referenced
here, and only to confirm they agree in kind with `sheet-side`'s own
`docked-modal-*` family — no row in this template cites a
nav-item-list token directly.

---

## 1 · Structure

| row | policy | salt | shadcn | m3 |
|---|---|---|---|---|
| `structure.scrim` | locked | on — `<Scrim fixed>`, the SAME borrowed component/row dialog.template.json already declares [S] | on — `DrawerOverlay`, rendered unconditionally by `DrawerContent` [S] | on — the shared `_md-comp-scrim.scss` token file [S] |
| `structure.panel` | locked (info) | `div`, Salt's own `FloatingComponent` [S] | `div`, vaul's `DrawerPrimitive.Content` [S] | `div` [R] |
| `structure.header` | switchable | **off — CONFIRMED ABSENCE**, no dedicated header sub-component exists in `packages/core/src/drawer/` at all [S] | **on** — `DrawerHeader`, a real `flex flex-col gap-0.5 p-4` wrapper [S] | off — no dedicated header element in the tokens-only chassis (the real headline token family is modelled at `style.title.font` instead) |
| `structure.title` | switchable | **off — CONFIRMED ABSENCE**; every real Salt usage composes its own `<H2>` as a plain child [S] | on — `DrawerTitle` [S] | on [R, tokens] — `docked-headline-*` exists, no live element to confirm a distinct Title component |
| `structure.description` | switchable | off — same reasoning as `structure.title` | on — `DrawerDescription` [S] | **off — CONFIRMED ABSENCE**, neither sheet chassis file carries a supporting-text token [S] |
| `structure.footer` | switchable | **off — CONFIRMED ABSENCE**, no `DrawerActions`/`DrawerFooter` export exists [S] | on — `DrawerFooter`, `mt-auto flex flex-col gap-2 p-4` [S] | off — CONFIRMED ABSENCE in both sheet chassis files |
| `structure.close-button` | switchable | **`optional`** — a separate export, consumer-added [S] | **`manual`** — `DrawerClose` is entirely UNSTYLED, no className at all [S] — see Finding 2 | **`none`** — no close/dismiss token of any kind [S] |
| `structure.drag-handle` | switchable | **off — CONFIRMED ABSENCE**, no drag/gesture concept anywhere in `Drawer.css`/`Drawer.tsx` [S] | **on**, bottom-direction-only [S] | **on**, `_md-comp-sheet-bottom.scss`'s own `docked-drag-handle-*` family, also bottom-only [S] |

## 2 · Behavior

**Every behaviour row is implemented in `skeleton/drawer.tsx`, reusing
`dialog.tsx`'s own proven mechanisms VERBATIM except where a real, sourced
difference was found** (Findings 1 and 4). `2-build/gates/
check-drawer-behavior.mjs` fails the build if a behaviour row has no stated
implementation or if the code it cites is not actually present in
`skeleton/drawer.tsx` — the same third-gate discipline DIALOG-MATRIX.md's
own Finding 12 established for this pipeline.

| row | policy | salt | shadcn | m3 |
|---|---|---|---|---|
| `behavior.role` | locked (info) | `role="dialog"`, byte-identical to `Dialog.tsx`'s own literal [S] | `[R]` — vaul unvendored; inferred from its own published docs | `[R]` per APG |
| `behavior.aria-modal` | switchable | on, `aria-modal="true"`, byte-identical to Dialog.tsx [S] | `[R]` on, per APG | `[R]` on |
| `behavior.background-suppression` | locked | `inert` — the SAME `outsideElementsInert:true` mechanism Dialog.tsx uses [S] | `[R]` `aria-hidden` — inferred to mirror Sheet's own [S]-confirmed mechanism | `[R]` `aria-hidden` |
| `behavior.focus-trap` | locked | on — the SAME `FloatingFocusManager` mechanism [S] | `[R]` on, vaul's own docs describe trapping | `[R]` on |
| `behavior.initial-focus` | locked | `configurable` — `initialFocus`, index or ref, default 0, byte-identical shape to `DialogProps.initialFocus` [S] | `[R]` `first-tabbable` | `[R]` `first-tabbable` |
| `behavior.focus-return` | locked | on — the same `FloatingFocusManager` `returnFocus` default [S] | `[R]` on | `[R]` on |
| `behavior.dismiss-escape` | locked | on, but COUPLED — see Finding 1 [S] | `[R]` on | `[R]` on |
| `behavior.dismiss-outside` | switchable | on, COUPLED to Escape via the same `enabled` flag — see Finding 1 [S] | `[R]` on | `[R]` on, basic sheets dismiss on scrim tap per m3.material.io |
| `behavior.scroll-lock` | switchable | **off — CONFIRMED ABSENCE** — see Finding 4 [S] | `[R]` on — genuinely WEAKER evidence than Sheet's own [S] citation for the identical row | `[R]` on |
| `behavior.labelled-by` | locked (info) | **manual** — no context channel; `aria-labelledby` threaded by hand through `{...rest}` — see Finding 3 [S] | `[R]` — likely mirrors Radix's mounted-Title counting | `[R]` per APG |
| `behavior.described-by` | switchable | off — CONFIRMED ABSENCE, no `aria-describedby` anywhere and no description part to associate [S] | `[R]` on when a Description is mounted | off — no supporting-text token exists to associate |
| `behavior.exit-animation` | switchable | on — the identical 300ms deferred-unmount pattern Dialog.tsx uses [S] | on — asymmetric `duration-300`/`duration-500` — see Finding 3 [S] | off — no motion token in either sheet chassis file |
| `behavior.portal` | locked (info) | DECLARED GAP — floating-ui's `FloatingPortal`, same as Dialog [S] | DECLARED GAP — vaul's own real `DrawerPortal`, confirmed in source; its INTERNAL portalling is unvendored [S] | `[R]` |

## 3 · Prop

| row | policy | note |
|---|---|---|
| `prop.position` | switchable | Salt `["left","top","right","bottom"]`, source-default-first (`left`) [S]. shadcn (vaul's own `direction`) `["bottom","top","right","left"]`, source-default-first (`bottom`, confirmed by `drawer-demo.tsx`'s own real usage) [S]. M3: **off as a runtime prop** — no live component — but the AXIS itself is real, carried by two chassis files (see the per-position style rows). |
| `prop.variant` | switchable | Salt only `["primary","secondary","tertiary"]`, source-default-first (`primary`) [S] — the SAME three-way background axis `table.salt.json`'s own `prop.variant` row already resolves, notably a capability Dialog does NOT have. shadcn/M3: off, no tone-variant axis. |
| `prop.disable-dismiss` | switchable | Salt only — see Finding 1 for the real scope difference from Dialog's own `disableDismiss`. shadcn/M3: off (vaul's own `dismissible` is unvendored and not a per-instance DrawerContent prop). |
| `prop.disable-scrim` | switchable | Salt only — `disableScrim`, the identical mechanism `DialogProps.disableScrim` uses [S]. shadcn/M3: off. |

## 4 · Slot

| row | note |
|---|---|
| `slot.title` | Consumer-owned where a title part exists (shadcn's real `DrawerTitle`; Salt's own free-form `<H2>` child, which is NOT a component-provided slot). |
| `slot.description` | Consumer-owned, shadcn only as a real structural part. |
| `slot.content` | Consumer-owned, all three — genuinely UNCONSTRAINED (`drawer.stories.tsx` composes `FormField`/`ComboBox`/`Card` grids directly as plain children, with no scrolling chrome of any kind — unlike Dialog, Drawer has NO dedicated content-scroller part in any of the three sources; the panel itself is the scroll container). |
| `slot.footer` | Consumer-owned, shadcn only. DECLARED COMPOSITION: the buttons belong to the future `button` component — `drawer-demo.tsx`'s own footer composes a plain `<Button>` and a `<DrawerClose asChild><Button variant="outline"></DrawerClose>`. |
| `slot.composes` | DECLARED COMPOSITION, same pattern as DIALOG-MATRIX.md's own row: `button`, an icon set, `scrim` (borrowed, its own canonical row), the portal/floating engine, AND the drag GESTURE engine itself (vaul's own pointer-tracking math — a DECLARED GAP, not a composition, since no canonical component currently owns it; recorded so a future reader does not assume the drag handle this row renders is interactive). |

## 5 · State

| row | policy | note |
|---|---|---|
| `state.open-closed` | locked (info) | the primary state in all three; Salt and shadcn both keep the panel mounted through the exit animation, M3 has no motion token. |

## 6 · Style — see the generated `Resolved values` block below for every
cell.

### Findings

1. **Salt's own `disableDismiss` has DIFFERENT real scope on `Drawer` than
   on `Dialog` — the headline finding of this component.** `Dialog.tsx`
   writes `useDismiss(context, { outsidePress: !disableDismiss })`, which
   only ever gates the outside-press channel — Dialog's Escape dismissal is
   NEVER disabled by `disableDismiss`, confirmed directly in
   DIALOG-MATRIX.md's own row. `Drawer.tsx` instead writes
   `useDismiss(context, { enabled: !disableDismiss })` — a SINGLE `enabled`
   flag that gates the WHOLE `useDismiss` hook, both Escape AND
   outside-press together. Two Salt components, the identical prop name,
   genuinely different real scope, confirmed by reading both call sites
   directly rather than assuming the shared name implies shared behaviour.
2. **Two chassis files' own real absences, arrived at independently, land
   on the identical shape.** shadcn's `Drawer`, unlike shadcn's own
   `Dialog` (a default-rendered, pre-styled corner X) and shadcn's own
   `Sheet` (`showCloseButton = true` by default), ships **NO default close
   affordance of any visual kind** — `DrawerClose` is declared with no
   className at all, a bare wrapper around vaul's own `Close` primitive, and
   `drawer-demo.tsx`'s own real usage places it INSIDE the footer as a full
   "Cancel" button, not a corner glyph. M3 independently has no close token
   of any kind in either sheet chassis file. Two of three columns confirm
   "no default close X" from completely unrelated sources — Salt is the
   outlier, and only because it ships a SEPARATE, opt-in close-button
   component (the same `optional` shape Dialog's own close button already
   established for that system).
3. **shadcn's own Drawer opens SLOWER than it closes, a deliberate,
   asymmetric timing choice neither Dialog nor Sheet make.**
   `DrawerContent`'s own className carries `data-[state=closed]:duration-300
   data-[state=open]:duration-500` — a real, sourced 500ms open / 300ms
   close split. Both Dialog's and Sheet's own className strings leave
   duration unset (defaulting to whatever `animate-in`/`animate-out`
   themselves default to). Recorded as a real style choice, not smoothed
   into a single "the animation duration" row.
4. **Salt's own `Drawer` does NOT lock page scroll — a real, confirmed
   absence, unlike every other Salt overlay this pipeline has built.**
   `Drawer.tsx`'s own JSX never passes `lockScroll` to its
   `FloatingComponent` — grepped the whole file, zero matches — where
   `Dialog.tsx` passes it explicitly at its own line 159.
   `useFloatingUI.tsx`'s own `usePreventScroll({ isDisabled: !lockScroll ||
   !open })` defaults `isDisabled` to `true` whenever `lockScroll` is
   falsy/undefined, so a Salt `Drawer`, unlike a Salt `Dialog`, never locks
   the page. Live-verified (see below): the page keeps scrolling behind an
   open Salt drawer on purpose, while shadcn's and M3's own columns (this
   skeleton's `[R]` fallback for both) DO lock it.
5. **Salt's own top/bottom slide animations pair with a keyframe whose NAME
   says the opposite edge — the SAME class of source self-contradiction
   DIALOG-MATRIX.md Finding 7 already found once in this same design
   system.** `Drawer.css` pairs `.saltDrawer-top` with
   `--salt-animation-slide-in-BOTTOM` (not `slide-in-top`) and
   `.saltDrawer-bottom` with `--salt-animation-slide-in-TOP` (not
   `slide-in-bottom`) — while `.saltDrawer-left`/`.saltDrawer-right` DO
   match their own position name. The KEYFRAME BODIES are reproduced
   correctly regardless of the confusing name: `foundations/animation.css`'s
   own `transform-start: 100%`/`transform-end: 0` values mean each keyframe
   genuinely originates the panel fully off-screen on ITS OWN anchor edge
   and animates to rest — a top drawer really does slide down from above, a
   bottom drawer really does slide up from below — which is the physically
   correct outcome despite the name swap. The registry reproduces the body,
   not the name, per the same discipline Finding 7 established.
6. **A real, live-only bug this build's own harness found and fixed:
   `tabbablesIn`'s `offsetParent !== null` filter, copied uncritically from
   `dialog.tsx`, silently excludes Salt's own close button.** Per spec,
   `offsetParent` is ALWAYS `null` for a `position: fixed` element,
   regardless of real visibility — and Salt's own `DrawerCloseButton.css`
   genuinely uses `position: fixed` (its negative-margin corner trick,
   reproduced verbatim at `style.close-button.position`; Dialog's own close
   button, by contrast, uses plain `position: absolute` and never triggered
   this). Confirmed live in Playwright: with the filter unfixed, opening a
   Salt drawer whose only tabbable content was its own close button sent
   initial focus to the PANEL itself (`activeElement.tagName === "DIV"`)
   instead of the button. Fixed by switching the filter to
   `el.getClientRects().length > 0`, which is unaffected by the positioning
   scheme; re-verified live, focus now correctly lands on the close button
   (`activeElement.tagName === "BUTTON"`, `data-slot="drawer-close"`).
   `2-build/gates/check-drawer-behavior.mjs`'s own `behavior.initial-focus`
   entry cites the fixed symbol directly, and its own header comment
   records the calibration (reverting the fix and confirming the gate's
   sibling conformance assertion goes red) per CLAUDE.md rule 11. **This is
   worth flagging for the orchestrating session:** `dialog.tsx`'s own
   `tabbablesIn` still uses the unfixed `offsetParent` filter — it happens
   to never matter there because Dialog's own close button is never
   `position: fixed`, but the SAME latent bug exists in that file and would
   bite the moment any future Dialog column's close affordance used a
   fixed-position trick.
   **UPDATE, orchestrator review:** applied the identical
   `getClientRects().length > 0` fix to `dialog.tsx`'s own `tabbablesIn`
   proactively rather than leaving it as a known trap; re-ran the full
   conformance suite (338/338, including every `dialog`-tagged assertion)
   to confirm zero regression.
7. **`check-structure.py`'s gate B flags `drawer/shadcn`'s own
   `structure.close-button` as "rendered with no dimensions" — a calibrated
   false positive, the SAME shape DIALOG-MATRIX.md's own Finding 14
   already established for a config-enum row.** `structure.close-button`'s
   real value for shadcn is `"manual"`, not the schema's `off` marker — a
   real STRATEGY (the consumer places and styles it entirely themselves),
   which still registers as "populated" to the gate's binary measure even
   though nothing has a default size to report. Not a gap: `style.
   close-button.position`'s own cell is correctly `off` for shadcn, with
   the note explaining exactly why there is no default to size.

### Live verification performed this session

Playwright/Chromium (`/opt/node22/lib/node_modules/playwright`, confirmed
reachable before relying on it) driven directly against `out/
drawer-check.html`. This found and fixed the ONE real defect recorded as
Finding 6, then re-verified every behaviour row live across all three
columns and all four positions:

- **Real, measured CLOSED→OPEN geometry**, not assumed from the CSS text:
  a right-anchored panel's `getBoundingClientRect()` sits flush against the
  viewport's right edge at full viewport height for all three columns
  (Salt: intrinsic content width, ~597px in the harness's own demo content;
  shadcn: 384px, matching `sm:max-w-sm`; M3: 256px, matching
  `docked-container-width`) — confirmed BOTH the resting-open position and,
  separately, that the exit-animation-carrying columns (Salt, shadcn) stay
  mounted with `data-state="closed"` for roughly their own declared
  duration before unmounting, while M3 (no motion token) unmounts
  immediately.
- **Focus**: initial focus lands inside the panel for all three columns
  (after the Finding 6 fix); Tab wraps at both ends inside the panel for
  all three; focus correctly returns to the trigger button after Escape for
  all three.
- **Background suppression**: Salt's own sibling gets a real `inert`
  attribute; shadcn's and M3's own siblings get `aria-hidden="true"` —
  confirmed by walking the real DOM tree, not asserted from the config.
- **Scroll lock, confirmed to genuinely DIFFER by column**:
  `getComputedStyle(document.documentElement).overflow` reads `"visible"`
  while a Salt drawer is open (Finding 4, live-confirmed) and `"hidden"`
  while a shadcn or M3 drawer is open.
- **Dismissal**: Escape closes all three; a real outside pointer-down
  closes the Salt column (its own coupled `dismissOnOutside`, Finding 1).
- **Drag handle**: present and correctly sized at `position="bottom"` for
  shadcn (100px × 8px) and M3 (32px × 4px — roughly a third of shadcn's own
  bar in both dimensions, a real, sourced size contrast recorded rather
  than averaged away) and correctly ABSENT for Salt at every position and
  for shadcn/M3 at every position other than `bottom`.
- A full-page screenshot of `drawer-check.html` was taken and inspected
  directly: Salt's own near-invisible white-tinted scrim (the same real
  finding DIALOG-MATRIX.md Finding 1 already established, visually
  confirmed again here) versus shadcn's/M3's own visibly dark scrims in the
  pinned demo stages; no unstyled fallback fonts, no giant unconstrained
  elements, no overlapping text.

`harness/conformance.tsx`'s new `checkDrawer()` — up to 8 assertions per
column across `structure.panel`, real right-anchored `style.panel.size`
geometry (checked SEPARATELY from state, per the standing lesson), `behavior.
initial-focus`, `behavior.role`, `behavior.scroll-lock` (read from the
column's own generated config rather than hardcoded per system, so the
assertion stays honest if a future column edit changes it),
`behavior.focus-trap`, `behavior.dismiss-escape`, and `structure.drag-handle`
(present at bottom, absent at right) — passed live in the browser with
**ZERO failures**, bringing the harness total to 338 (21 new), with zero
failures anywhere in the whole suite.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/drawer.template.json` against every system, read from `columns/drawer.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 5 light, 5 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `bg-primary` | rgb(255, 255, 255) | rgb(16, 24, 32) | **no** |
| `bg-secondary` | rgb(245, 247, 248) | rgb(26, 34, 41) | **no** |
| `bg-tertiary` | rgb(250, 248, 242) | rgb(38, 41, 43) | **no** |
| `scrim-bg` | rgba(255, 255, 255, 0.65) | rgba(0, 0, 0, 0.65) | yes |
| `shadow-modal` | 0 12px 40px 0 rgba(0, 0, 0, 0.3) | 0 12px 40px 0 rgba(0, 0, 0, 0.65) | yes |

**shadcn** — 7 light, 5 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `surface` | oklch(1 0 0) | oklch(0.145 0 0) | **no** |
| `border-base` | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | **no** |
| `muted-bg` | oklch(0.97 0 0) | oklch(0.269 0 0) | **no** |
| `muted-fg` | oklch(0.556 0 0) | oklch(0.708 0 0) | **no** |
| `fg` | oklch(0% 0 0) | oklch(0.985 0 0) | **no** |
| `scrim-bg` | color-mix(in oklab, #000 50%, transparent) | — | yes |
| `radius-panel` | 0.625rem | — | yes |

**m3** — 4 light, 3 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `surface-container-low` | #f7f2fa | #1d1b20 | yes |
| `on-surface-variant` | #49454f | #cac4d0 | yes |
| `outline` | #79747e | #938f99 | yes |
| `scrim-bg` | color-mix(in srgb, #000 32%, transparent) | — | **no** |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.scrim` | structure | locked | `True` | `True` | `True` |
| 2 | `structure.panel` | structure | locked | `True` | `True` | `True` |
| 3 | `structure.header` | structure | switchable | **off** | `True` | **off** |
| 4 | `structure.title` | structure | switchable | **off** | `True` | `True` |
| 5 | `structure.description` | structure | switchable | **off** | `True` | **off** |
| 6 | `structure.footer` | structure | switchable | **off** | `True` | **off** |
| 7 | `structure.close-button` | structure | switchable | `optional` | `manual` | **off** |
| 8 | `structure.drag-handle` | structure | switchable | **off** | `True` | `True` |
| 9 | `behavior.role` | behavior | locked | `True` | `True` | `True` |
| 10 | `behavior.aria-modal` | behavior | switchable | `True` | `True` | `True` |
| 11 | `behavior.background-suppression` | behavior | locked | `inert` | `aria-hidden` | `aria-hidden` |
| 12 | `behavior.focus-trap` | behavior | locked | `True` | `True` | `True` |
| 13 | `behavior.initial-focus` | behavior | locked | `configurable` | `first-tabbable` | `first-tabbable` |
| 14 | `behavior.focus-return` | behavior | locked | `True` | `True` | `True` |
| 15 | `behavior.dismiss-escape` | behavior | locked | `True` | `True` | `True` |
| 16 | `behavior.dismiss-outside` | behavior | switchable | `True` | `True` | `True` |
| 17 | `behavior.scroll-lock` | behavior | switchable | **off** | `True` | `True` |
| 18 | `behavior.labelled-by` | behavior | locked | `manual` | `True` | `True` |
| 19 | `behavior.described-by` | behavior | switchable | **off** | `True` | **off** |
| 20 | `behavior.exit-animation` | behavior | switchable | `True` | `True` | **off** |
| 21 | `behavior.portal` | behavior | locked | — | — | — |
| 22 | `prop.position` | prop | switchable | `left, top, right, bottom` | `bottom, top, right, left` | **off** |
| 23 | `prop.variant` | prop | switchable | `primary, secondary, tertiary` | **off** | **off** |
| 24 | `prop.disable-dismiss` | prop | switchable | `True` | **off** | **off** |
| 25 | `prop.disable-scrim` | prop | switchable | `True` | **off** | **off** |
| 26 | `slot.title` | slot | switchable | **off** | `True` | `True` |
| 27 | `slot.description` | slot | switchable | **off** | `True` | **off** |
| 28 | `slot.content` | slot | locked | — | — | — |
| 29 | `slot.footer` | slot | switchable | **off** | `True` | **off** |
| 30 | `slot.composes` | slot | default | — | — | — |
| 31 | `state.open-closed` | state | locked | — | — | — |
| 32 | `style.scrim.background` | style | locked | ⟡ `scrim-bg` | ⟡ `scrim-bg` | ⟡ `scrim-bg` |
| 33 | `style.scrim.z-index` | style | default | `1199` | `50` | **off** |
| 34 | `style.scrim.animation` | style | switchable | **off** | `drawer-fade-in 200ms` | **off** |
| 35 | `style.panel.background` | style | locked | ⟡ `bg-primary` | ⟡ `surface` | ⟡ `surface-container-low` |
| 36 | `style.panel.background@secondary` | style | switchable | ⟡ `bg-secondary` | **off** | **off** |
| 37 | `style.panel.background@tertiary` | style | switchable | ⟡ `bg-tertiary` | **off** | **off** |
| 38 | `style.panel.shadow` | style | switchable | ⟡ `shadow-modal` | **off** | `0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)` |
| 39 | `style.panel.padding` | style | switchable | `24px` | **off** | **off** |
| 40 | `style.panel.z-index` | style | default | `1200` | `50` | **off** |
| 41 | `style.panel.size@left` | style | switchable | **off** | `width: 75vw; max-width: 24rem` | `width: 256px` |
| 42 | `style.panel.size@right` | style | switchable | **off** | `width: 75vw; max-width: 24rem` | `width: 256px` |
| 43 | `style.panel.size@top` | style | switchable | **off** | `max-height: 80vh` | **off** |
| 44 | `style.panel.size@bottom` | style | switchable | **off** | `max-height: 80vh` | **off** |
| 45 | `style.panel.inset-margin@top` | style | switchable | **off** | `96px` | **off** |
| 46 | `style.panel.inset-margin@bottom` | style | switchable | **off** | `96px` | **off** |
| 47 | `style.panel.corner@top` | style | switchable | **off** | ⟡ `radius-panel` | **off** |
| 48 | `style.panel.corner@bottom` | style | switchable | **off** | ⟡ `radius-panel` | `28px 28px 0px 0px` |
| 49 | `style.panel.border@left` | style | switchable | **off** | ⟡ `border-base` | **off** |
| 50 | `style.panel.border@right` | style | switchable | **off** | ⟡ `border-base` | ⟡ `outline` |
| 51 | `style.panel.border@top` | style | switchable | **off** | ⟡ `border-base` | **off** |
| 52 | `style.panel.border@bottom` | style | switchable | **off** | ⟡ `border-base` | **off** |
| 53 | `style.panel.animation@left` | style | switchable | `drawer-slide-in-left 300ms ease-in-out` | `drawer-slide-in-left 500ms` | `drawer-slide-in-left 300ms cubic-bezier(0.2,0,0,1)` |
| 54 | `style.panel.animation@right` | style | switchable | `drawer-slide-in-right 300ms ease-in-out` | `drawer-slide-in-right 500ms` | `drawer-slide-in-right 300ms cubic-bezier(0.2,0,0,1)` |
| 55 | `style.panel.animation@top` | style | switchable | `drawer-slide-in-from-above 300ms ease-in-out` | `drawer-slide-in-from-above 500ms` | **off** |
| 56 | `style.panel.animation@bottom` | style | switchable | `drawer-slide-in-from-below 300ms ease-in-out` | `drawer-slide-in-from-below 500ms` | `drawer-slide-in-from-below 300ms cubic-bezier(0.2,0,0,1)` |
| 57 | `style.header.padding` | style | switchable | **off** | `16px` | **off** |
| 58 | `style.title.font` | style | switchable | **off** | `600 inherit` | `400 1.375rem/1.75rem Roboto, sans-serif` |
| 59 | `style.title.color` | style | switchable | **off** | ⟡ `fg` | ⟡ `on-surface-variant` |
| 60 | `style.description.font` | style | switchable | **off** | `400 0.875rem/1.25rem` | **off** |
| 61 | `style.footer.padding` | style | switchable | **off** | `16px` | **off** |
| 62 | `style.footer.gap` | style | switchable | **off** | `8px` | **off** |
| 63 | `style.close-button.position` | style | switchable | `position: fixed; margin-top: calc(24px * -1); margin-right: calc(24px * -1)` | **off** | **off** |
| 64 | `style.drag-handle.box` | style | switchable | **off** | `width: 100px; height: 8px; border-radius: 9999px; background: var(--muted-bg); margin: 16px auto 0` | `width: 32px; height: 4px; border-radius: 9999px; background: var(--on-surface-variant); margin: 16px auto 0` |

<details><summary>Citations — 154 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.scrim` | salt | Drawer.tsx ConditionalScrimWrapper renders <Scrim fixed> around the floating component when showComponent && !disableScrim |
| `structure.scrim` | shadcn | DrawerOverlay, declared inside drawer.tsx and rendered unconditionally by DrawerContent's own DrawerPortal wrapper |
| `structure.scrim` | m3 | the shared _md-comp-scrim.scss token file, borrowed exactly as dialog.m3.json borrows it |
| `structure.panel` | salt | Drawer.tsx's own FloatingComponent |
| `structure.panel` | shadcn | DrawerPrimitive.Content (vaul) |
| `structure.panel` | m3 | [R] — tokens-only, conventional |
| `structure.header` | salt | CONFIRMED ABSENCE — see no-header-title-description-footer |
| `structure.header` | shadcn | DrawerHeader — a real, dedicated `flex flex-col gap-0.5 p-4` wrapper |
| `structure.header` | m3 | no dedicated header ELEMENT in the tokens-only chassis; the real headline token family is modelled at style.title.font instead — see the template row's own note |
| `structure.title` | salt | CONFIRMED ABSENCE — see no-header-title-description-footer |
| `structure.title` | shadcn | DrawerTitle (vaul's own Title primitive) |
| `structure.title` | m3 | _md-comp-sheet-side.scss docked-headline-* |
| `structure.description` | salt | CONFIRMED ABSENCE — see no-header-title-description-footer |
| `structure.description` | shadcn | DrawerDescription (vaul's own Description primitive) |
| `structure.description` | m3 | CONFIRMED ABSENCE — see no-supporting-text |
| `structure.footer` | salt | CONFIRMED ABSENCE — see no-header-title-description-footer |
| `structure.footer` | shadcn | DrawerFooter — `mt-auto flex flex-col gap-2 p-4` |
| `structure.footer` | m3 | CONFIRMED ABSENCE — see no-close-footer-action |
| `structure.close-button` | salt | DrawerCloseButton is a separate export the consumer adds; several real drawer.stories.tsx examples (Default, Position) have none at all |
| `structure.close-button` | shadcn | DrawerClose is a bare, unstyled wrapper the consumer places anywhere and styles by hand |
| `structure.close-button` | m3 | CONFIRMED ABSENCE — see no-close-footer-action |
| `structure.drag-handle` | salt | CONFIRMED ABSENCE — see no-drag-handle |
| `structure.drag-handle` | shadcn | DrawerContent's own hard-coded child div |
| `structure.drag-handle` | m3 | _md-comp-sheet-bottom.scss docked-drag-handle-* |
| `behavior.role` | salt | Drawer.tsx passes role={"dialog"} to FloatingComponent, the identical literal Dialog.tsx uses |
| `behavior.role` | shadcn | https://vaul.emilkowal.ski/getting-started (cited in radix/drawer.mdx), not readable from this clone's own source |
| `behavior.role` | m3 | [R] per APG |
| `behavior.aria-modal` | salt | Drawer.tsx aria-modal="true" on FloatingComponent, byte-identical to Dialog.tsx |
| `behavior.aria-modal` | shadcn | [R] — unvendored, inferred true per APG's dialog-modal pattern (the same inference dialog.template.json makes for M3) |
| `behavior.aria-modal` | m3 | [R] per APG's dialog-modal pattern |
| `behavior.background-suppression` | salt | Drawer.tsx focusManagerProps={{ context, initialFocus, outsideElementsInert: true }} — the identical shape Dialog.tsx passes |
| `behavior.background-suppression` | shadcn | [R] — unvendored; inferred to mirror Sheet's own Radix-documented hideOthers() mechanism, since vaul's docs describe the same page-hiding contract without exposing which primitive attribute performs it |
| `behavior.background-suppression` | m3 | [R], the APG-documented fallback |
| `behavior.focus-trap` | salt | the same FloatingFocusManager mechanism Dialog.tsx relies on, via focusManagerProps |
| `behavior.focus-trap` | shadcn | [R] — unvendored; vaul's own published docs describe focus trapping while open |
| `behavior.focus-trap` | m3 | [R] per APG |
| `behavior.initial-focus` | salt | DrawerProps.initialFocus?: ComponentProps<typeof FloatingFocusManager>["initialFocus"] — a tabbable index or ref, default 0 |
| `behavior.initial-focus` | shadcn | [R] — unvendored, no ordinal API documented anywhere in radix/drawer.mdx |
| `behavior.initial-focus` | m3 | [R] per APG |
| `behavior.focus-return` | salt | FloatingFocusManager's own returnFocus default |
| `behavior.focus-return` | shadcn | [R] — unvendored; vaul's own docs describe returning focus to the trigger on close |
| `behavior.focus-return` | m3 | [R] per APG |
| `behavior.dismiss-escape` | salt | Drawer.tsx useDismiss(context, { enabled: !disableDismiss }) — floating-ui's default escapeKey handling applies whenever the hook is enabled (disableDismiss defaults to undefined, so enabled) |
| `behavior.dismiss-escape` | shadcn | [R] — unvendored, inferred from vaul's own documented `dismissible` default (true) |
| `behavior.dismiss-escape` | m3 | [R] per APG |
| `behavior.dismiss-outside` | salt | Drawer.tsx useDismiss(context, { enabled: !disableDismiss }) |
| `behavior.dismiss-outside` | shadcn | [R] — unvendored, inferred on by default per vaul's own docs |
| `behavior.dismiss-outside` | m3 | [R] — basic M3 sheets dismiss on scrim tap, per m3.material.io |
| `behavior.scroll-lock` | salt | CONFIRMED ABSENCE — see no-scroll-lock |
| `behavior.scroll-lock` | shadcn | [R] — unvendored; inferred ON, since vaul wraps the same modal-overlay contract Sheet's own Radix Dialog fulfils with react-remove-scroll — genuinely WEAKER evidence than Sheet's own [S] citation for the identical row, and declared as such rather than silently upgraded |
| `behavior.scroll-lock` | m3 | [R] per APG |
| `behavior.labelled-by` | salt | no context channel exists; aria-labelledby is threaded through the spread {...rest} prop by the consumer — see no-header-title-description-footer |
| `behavior.labelled-by` | shadcn | [R] — likely mirrors Radix's own mounted-Title counting (Sheet's confirmed [S] mechanism), unvendored so not directly readable in vaul's own internals |
| `behavior.labelled-by` | m3 | [R] per APG |
| `behavior.described-by` | salt | CONFIRMED ABSENCE — no aria-describedby anywhere in packages/core/src/drawer, and no description part exists to associate |
| `behavior.described-by` | shadcn | [R] — unvendored; inferred on when a Description is mounted, mirroring Sheet's own [S]-confirmed pattern |
| `behavior.described-by` | m3 | no supporting-text token exists to associate — see no-supporting-text |
| `behavior.exit-animation` | salt | Drawer.tsx useEffect keeps showComponent true for `300); // var(--salt-duration-perceptible)` after open flips false — the identical pattern Dialog.tsx uses |
| `behavior.exit-animation` | shadcn | DrawerContent className: data-[state=closed]:animate-out ... data-[state=open]:animate-in ... |
| `behavior.exit-animation` | m3 | no motion token in either sheet chassis file |
| `prop.position` | salt | DrawerProps.position?: "left"\|"top"\|"right"\|"bottom", default "left" — listed SOURCE-DEFAULT-FIRST |
| `prop.position` | shadcn | vaul's own `direction` prop (top\|right\|bottom\|left), forwarded through data-vaul-drawer-direction selectors; default "bottom" confirmed by drawer-demo.tsx's own usage, which never passes a direction and renders bottom-anchored. Listed SOURCE-DEFAULT-FIRST. |
| `prop.position` | m3 | no runtime prop — no live M3 component. The AXIS itself is still real: see canonical-source and no-m3-top-sheet for which per-position style rows carry real evidence |
| `prop.variant` | salt | DrawerProps.variant?: "primary"\|"secondary"\|"tertiary", default "primary" — listed SOURCE-DEFAULT-FIRST |
| `prop.variant` | shadcn | no tone-variant axis |
| `prop.disable-dismiss` | salt | DrawerProps.disableDismiss?: boolean |
| `prop.disable-dismiss` | shadcn | no per-instance prop on DrawerContent itself; vaul's own Root accepts `dismissible` (unvendored) |
| `prop.disable-scrim` | salt | DrawerProps.disableScrim?: boolean |
| `prop.disable-scrim` | shadcn | DrawerOverlay is rendered unconditionally inside DrawerContent's DrawerPortal, so removing it is a source edit |
| `slot.title` | salt | no dedicated part — consumer composes a plain <H2> child, not a registry-owned slot; see structure.title |
| `slot.title` | m3 | presumed text content (headline); no live component to confirm the exact API shape |
| `slot.description` | salt | same reasoning as slot.title |
| `slot.footer` | salt | CONFIRMED ABSENCE — see no-header-title-description-footer |
| `style.scrim.background` | m3 | reused from the shared scrim slot — see structure.scrim |
| `style.scrim.z-index` | salt | Scrim.css — see z-index-drawer |
| `style.scrim.z-index` | shadcn | DrawerOverlay className: z-50 |
| `style.scrim.z-index` | m3 | no z-index token anywhere |
| `style.scrim.animation` | salt | CONFIRMED ABSENCE — the same Scrim.css with no animation rule dialog.salt.json already found |
| `style.scrim.animation` | shadcn | DrawerOverlay className: data-[state=open]:animate-in data-[state=open]:fade-in-0 |
| `style.scrim.animation` | m3 | no motion token |
| `style.panel.shadow` | shadcn | CONFIRMED ABSENCE — see no-panel-shadow |
| `style.panel.shadow` | m3 | _md-comp-sheet-side.scss docked-modal-container-elevation -> level1 |
| `style.panel.padding` | salt | Drawer.css padding: var(--salt-spacing-300) — UNIFORM on all four sides, unlike Dialog's asymmetric top/bottom-only padding |
| `style.panel.padding` | shadcn | DrawerContent itself carries no padding class; the header/footer/drag-handle each carry their own |
| `style.panel.padding` | m3 | neither chassis file carries a padding token |
| `style.panel.z-index` | salt | Drawer.css z-index: var(--salt-zIndex-drawer) — see z-index-drawer |
| `style.panel.z-index` | shadcn | DrawerContent className: z-50 |
| `style.panel.z-index` | m3 | no z-index token |
| `style.panel.size@left` | salt | CONFIRMED ABSENCE — see no-default-size |
| `style.panel.size@left` | shadcn | DrawerContent className: data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:sm:max-w-sm |
| `style.panel.size@left` | m3 | _md-comp-sheet-side.scss docked-container-width |
| `style.panel.size@right` | salt | CONFIRMED ABSENCE — see no-default-size |
| `style.panel.size@right` | shadcn | DrawerContent className: data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:sm:max-w-sm |
| `style.panel.size@right` | m3 | _md-comp-sheet-side.scss docked-container-width — see docked-container-width |
| `style.panel.size@top` | salt | CONFIRMED ABSENCE — see no-default-size |
| `style.panel.size@top` | shadcn | DrawerContent className: data-[vaul-drawer-direction=top]:max-h-[80vh] (height itself is h-auto, from base) |
| `style.panel.size@top` | m3 | CONFIRMED ABSENCE — see no-m3-top-sheet |
| `style.panel.size@bottom` | salt | CONFIRMED ABSENCE — see no-default-size |
| `style.panel.size@bottom` | shadcn | DrawerContent className: data-[vaul-drawer-direction=bottom]:max-h-[80vh] |
| `style.panel.size@bottom` | m3 | _md-comp-sheet-bottom.scss carries a shape/elevation/drag-handle family but no explicit height or max-height token |
| `style.panel.inset-margin@top` | salt | no equivalent reserve |
| `style.panel.inset-margin@top` | shadcn | DrawerContent className: data-[vaul-drawer-direction=top]:mb-24 |
| `style.panel.inset-margin@bottom` | salt | no equivalent reserve |
| `style.panel.inset-margin@bottom` | shadcn | DrawerContent className: data-[vaul-drawer-direction=bottom]:mt-24 |
| `style.panel.corner@top` | salt | CONFIRMED ABSENCE — Drawer.css declares no border-radius on .saltDrawer at any position |
| `style.panel.corner@top` | shadcn | DrawerContent className: data-[vaul-drawer-direction=top]:rounded-b-lg — the BOTTOM (far) corners only |
| `style.panel.corner@top` | m3 | CONFIRMED ABSENCE — see no-m3-top-sheet |
| `style.panel.corner@bottom` | salt | CONFIRMED ABSENCE — same reasoning |
| `style.panel.corner@bottom` | shadcn | DrawerContent className: data-[vaul-drawer-direction=bottom]:rounded-t-lg — the TOP (far) corners only |
| `style.panel.corner@bottom` | m3 | _md-comp-sheet-bottom.scss docked-container-shape |
| `style.panel.border@left` | salt | CONFIRMED ABSENCE — Drawer.css declares no border property at all |
| `style.panel.border@left` | shadcn | DrawerContent className: data-[vaul-drawer-direction=left]:border-r |
| `style.panel.border@left` | m3 | mirror of @right not sourced — see the @right cell's own note |
| `style.panel.border@right` | salt | CONFIRMED ABSENCE — same reasoning |
| `style.panel.border@right` | shadcn | DrawerContent className: data-[vaul-drawer-direction=right]:border-l |
| `style.panel.border@right` | m3 | _md-comp-sheet-side.scss docked-divider-color |
| `style.panel.border@top` | salt | CONFIRMED ABSENCE — same reasoning |
| `style.panel.border@top` | shadcn | DrawerContent className: data-[vaul-drawer-direction=top]:border-b |
| `style.panel.border@top` | m3 | CONFIRMED ABSENCE — see no-m3-top-sheet |
| `style.panel.border@bottom` | salt | CONFIRMED ABSENCE — same reasoning |
| `style.panel.border@bottom` | shadcn | DrawerContent className: data-[vaul-drawer-direction=bottom]:border-t |
| `style.panel.border@bottom` | m3 | CONFIRMED ABSENCE — _md-comp-sheet-bottom.scss has no divider/outline token of any kind |
| `style.panel.animation@left` | salt | Drawer.css .saltDrawer-left.saltDrawer-enterAnimation { animation: var(--salt-animation-slide-in-left) } — see animation-slide |
| `style.panel.animation@left` | shadcn | DrawerContent className: data-[vaul-drawer-direction=left]:slide-in-from-left |
| `style.panel.animation@left` | m3 | [R] — borrowed from docs/foundations/motion.md, the same registry-neutral placeholder dialog.m3.json uses, since neither sheet chassis file carries a motion token |
| `style.panel.animation@right` | salt | Drawer.css .saltDrawer-right.saltDrawer-enterAnimation { animation: var(--salt-animation-slide-in-right) } |
| `style.panel.animation@right` | shadcn | DrawerContent className: data-[vaul-drawer-direction=right]:slide-in-from-right |
| `style.panel.animation@right` | m3 | [R] — see @left |
| `style.panel.animation@top` | salt | Drawer.css .saltDrawer-top.saltDrawer-enterAnimation { animation: var(--salt-animation-slide-in-bottom) } |
| `style.panel.animation@top` | shadcn | DrawerContent className: data-[vaul-drawer-direction=top]:slide-in-from-top |
| `style.panel.animation@top` | m3 | CONFIRMED ABSENCE — see no-m3-top-sheet |
| `style.panel.animation@bottom` | salt | Drawer.css .saltDrawer-bottom.saltDrawer-enterAnimation { animation: var(--salt-animation-slide-in-top) } |
| `style.panel.animation@bottom` | shadcn | DrawerContent className: data-[vaul-drawer-direction=bottom]:slide-in-from-bottom |
| `style.panel.animation@bottom` | m3 | [R] — see @left |
| `style.header.padding` | salt | no header part exists |
| `style.header.padding` | shadcn | DrawerHeader className: p-4 |
| `style.header.padding` | m3 | no header part exists |
| `style.title.font` | salt | CONFIRMED ABSENCE — see structure.title |
| `style.title.font` | shadcn | DrawerTitle className: font-semibold text-foreground |
| `style.title.font` | m3 | _md-comp-sheet-side.scss docked-headline-* |
| `style.title.color` | shadcn | DrawerTitle className: text-foreground |
| `style.title.color` | m3 | _md-comp-sheet-side.scss docked-headline-color |
| `style.description.font` | salt | CONFIRMED ABSENCE — see structure.description |
| `style.description.font` | shadcn | DrawerDescription className: text-sm text-muted-foreground |
| `style.description.font` | m3 | CONFIRMED ABSENCE — see no-supporting-text |
| `style.footer.padding` | salt | no footer part exists |
| `style.footer.padding` | shadcn | DrawerFooter className: p-4 |
| `style.footer.gap` | shadcn | DrawerFooter className: gap-2 |
| `style.close-button.position` | salt | DrawerCloseButton.css — see close-button-position |
| `style.close-button.position` | shadcn | CONFIRMED ABSENCE — see no-close-default; there is no default rendering to place |
| `style.close-button.position` | m3 | CONFIRMED ABSENCE — see no-close-footer-action |
| `style.drag-handle.box` | salt | CONFIRMED ABSENCE — see no-drag-handle |
| `style.drag-handle.box` | shadcn | DrawerContent's own child div — see drag-handle |
| `style.drag-handle.box` | m3 | _md-comp-sheet-bottom.scss docked-drag-handle-* — see drag-handle |

</details>

<!-- END GENERATED VALUES -->
