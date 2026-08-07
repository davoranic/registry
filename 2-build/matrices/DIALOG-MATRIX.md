# Dialog (modal) — component template matrix

*Eighth live component in the post-clean-slate pipeline (button, calendar,
spinner, tooltip, alert, input, select came before). Same method as
[SELECT-MATRIX.md](SELECT-MATRIX.md) / [INPUT-MATRIX.md](INPUT-MATRIX.md) /
[TOOLTIP-MATRIX.md](TOOLTIP-MATRIX.md) / [ALERT-MATRIX.md](ALERT-MATRIX.md) /
[CALENDAR-MATRIX.md](CALENDAR-MATRIX.md): one master template (union of all
six pieces across systems), columns per design system, rows switched
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

**This component adds a third gate.** Locked behavior rows are checked by
nothing in this pipeline — SELECT-MATRIX.md finding 16. Dialog is by far the
most behaviour-dense component built so far, so it ships
`scripts/check-dialog-behavior.mjs`, which fails the build if a behavior row
has no stated implementation and if the code that implementation cites is not
actually present in `skeleton/dialog.tsx`. See Finding 12.

---

## Scope note

### What is in scope

- **Salt** `packages/core/src/dialog/` — all six files and their CSS
  (`Dialog`, `DialogHeader`, `DialogContent`, `DialogActions`,
  `DialogCloseButton`, `DialogContext`) — plus
  `packages/core/src/scrim/{Scrim.tsx,Scrim.css}` for the backdrop and
  `packages/core/src/utils/{useFloatingUI/useFloatingUI.tsx,usePreventScroll.ts}`
  for the focus/scroll chassis the dialog composes.
- **shadcn** `apps/v4/registry/new-york-v4/ui/dialog.tsx` — all ten exported
  parts, built on `radix-ui`'s `Dialog`.
- **Material 3** `tokens/versions/latest/sass/_md-comp-dialog.scss` AND
  `_md-comp-scrim.scss`, plus material-web's hand-authored
  `tokens/_md-comp-dialog.scss` for what the library actually ships.

### The scrim is modelled here as a PART — and it has its own canonical row

`docs/COMPONENTS.md` carries `| scrim (overlay backdrop) | — (part of
dialog) | ✓ scrim | ✓ scrim |`, i.e. two of three systems own it separately:

| system | who owns the backdrop |
|---|---|
| Salt | `Scrim` is a **separate exported component** in `packages/core/src/scrim`, wrapped around the dialog by `ConditionalScrimWrapper` and shared with `Drawer`, which composes it identically [S] |
| shadcn | `DialogOverlay` is declared **inside `dialog.tsx`** and rendered unconditionally by `DialogContent`; `alert-dialog.tsx` declares its own byte-identical copy [S] |
| M3 | `md.comp.scrim` is its **own token file** (`_md-comp-scrim.scss`, two tokens) referenced by every scrimmed component [S] |

**If `scrim` is later split into its own canonical component, these rows
migrate wholesale:** `structure.scrim`, `prop.disable-scrim`,
`style.scrim.background`, `style.scrim.z-index`, `style.scrim.animation`.
Nothing else moves — the panel, header, content, actions and close button all
stay with `dialog`, and the relationship between them (the scrim sits under
the panel and a press on it dismisses) lives in `behavior.dismiss-outside`,
which is a relationship, not a property of either.

### What is out of scope, and why (structural reasons, declared not dropped)

| excluded | where | structural reason |
|---|---|---|
| `alert-dialog` | shadcn `ui/alert-dialog.tsx`; M3 `_md-comp-full-screen-dialog.scss` (partial) | Its own canonical row in `docs/COMPONENTS.md`. shadcn's is not a restyle: it has a `size?: "default" \| "sm"` prop this Dialog does not, a **media** slot with grid-row rewiring (`has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr]`), dedicated `Action`/`Cancel` parts, a centred-then-left-aligned header, **no close X at all**, and — the decisive part — Radix's `AlertDialog` is `role="alertdialog"` and prevents outside dismissal, so `behavior.dismiss-outside` inverts. A different behaviour contract, not a variant [S]. |
| `full-screen-dialog` | M3 `_md-comp-full-screen-dialog.scss` | A materially different token family, not a size of this one: `container-color` **surface** (not `surface-container-high`), `container-elevation` **level0** (not level3), `container-shape` **corner-none** (not corner-extra-large), a **`title-large`** headline (not `headline-small`), a 56px `header-container-height`, a `header-icon`/`header-action` family, and an **on-scroll elevation change** (`header-on-scroll-container-elevation: level2`). `docs/COMPONENTS.md` puts it on the alert-dialog row [S]. |
| `drawer` / `sheet` / `side-panel` | Salt `core/src/drawer`; shadcn `ui/drawer.tsx`, `ui/sheet.tsx`; M3 navigation-drawer / sheet-* | Separate canonical rows. Salt's `Drawer` is **edge-anchored** — `position?: "left" \| "top" \| "right" \| "bottom"`, four slide-in/slide-out animation pairs, `top: 0` with the opposite edge free — sits on `zIndex-drawer` (1200) rather than `zIndex-modal` (1300), carries a `variant` background axis Dialog does not, and has no header/content/actions parts of its own. It composes the same `Scrim`, which is precisely why the scrim is its own row [S]. |
| Salt `Toggletip` / `Overlay` | `core/src/toggletip`, `core/src/overlay` | Non-modal floating surfaces; `docs/COMPONENTS.md`'s `popover` row. Already excluded by TOOLTIP-MATRIX.md's scope note for the same reason. |
| shadcn `command-dialog`, `drawer-dialog`, `dropdown-menu-dialog` | `examples/` | Compositions of this component with others, not variants of it — the same double-counting exclusion INPUT-MATRIX.md made for Salt's `search-input` [S]. |
| M3 `action-*` state layers | `_md-comp-dialog.scss` | Declared in the generated token file and then listed **in full** under `$unsupported-tokens` by material-web's own `tokens/_md-comp-dialog.scss`, with the comment *"currently ignoring tokens for `action-*-label-text` and `action-*-state-layer` since actions are spec'd as standard text buttons"*. DECLARED COMPOSITION to the future `button` component, not modelled here [S]. |
| M3 `subhead-*` and `with-divider-*` | `_md-comp-dialog.scss` (`latest` only) | Both families arrive **`@deprecated` on the edition that adds them** — subhead points at `headline`, with-divider points at the standalone divider component. Recorded in the M3 column's provenance and declared off rather than mapped onto Salt's scroll dividers, which are a different mechanism entirely (state-conditional, not static) [S]. |

---

## Sources

- **Salt** [S]: `packages/core/src/dialog/{Dialog.tsx,Dialog.css,DialogHeader.tsx,DialogHeader.css,DialogContent.tsx,DialogContent.css,DialogActions.tsx,DialogActions.css,DialogCloseButton.tsx,DialogCloseButton.css,DialogContext.ts}`;
  `packages/core/src/scrim/{Scrim.tsx,Scrim.css}`;
  `packages/core/src/utils/{useFloatingUI/useFloatingUI.tsx,usePreventScroll.ts,useResponsiveProp.ts}`;
  `packages/core/src/breakpoints/Breakpoints.tsx`;
  `packages/core/src/salt-provider/SaltProvider.tsx` (for `DEFAULT_HEADING_FONT`);
  `packages/core/src/status-indicator/ValidationStatus.ts`;
  `packages/core/src/text/Text.css`;
  `packages/theme/css/next/characteristics/{overlayable,container,separable,sentiment,status,content,text}.css`;
  `packages/theme/css/next/palette/{alpha,corner,shadow,accent,info,negative,warning,positive}.css`;
  `packages/theme/css/foundations/{spacing,size,curve,zindex,animation,duration,alpha,color}.css`.
  Read only to fix the scope boundary: `packages/core/src/drawer/{Drawer.tsx,Drawer.css}`.
  Read for the documented behaviour contract: `site/docs/components/dialog/accessibility.mdx`;
  `site/src/examples/dialog/{Default,CloseButton}.tsx`.
  Reused rather than re-derived: `docs/foundations/{spacing,sizes,density,typography,colors,shape,elevation,layers,motion}.md`.
- **shadcn** [S]: `apps/v4/registry/new-york-v4/ui/dialog.tsx` (canonical, sole
  source for every style cell); `apps/v4/app/globals.css` (token values);
  `apps/v4/registry/new-york-v4/examples/{dialog-demo,dialog-close-button}.tsx`;
  `apps/v4/content/docs/components/radix/dialog.mdx`. Read for **behavior
  only**, never for a style cell:
  `primitives/packages/react/dialog/src/dialog.tsx`. Cross-checked but not
  canonical: `apps/v4/registry/bases/radix/ui/dialog.tsx`. Read only to fix
  the scope boundary: `ui/alert-dialog.tsx`.
- **Material 3** [S]: `tokens/versions/latest/sass/{_md-comp-dialog.scss,_md-comp-scrim.scss}`;
  `tokens/versions/v0_192/{_md-comp-dialog.scss,_md-comp-scrim.scss}` (for the
  edition diff); the hand-authored `tokens/_md-comp-dialog.scss`;
  `versions/latest/sass/{_md-sys-color.scss,_md-sys-color__dark.scss,_md-ref-palette.scss,_md-sys-shape.scss,_md-sys-elevation.scss,_md-sys-typescale.scss,_md-ref-typeface.scss}`.
  Read only to fix the scope boundary:
  `versions/latest/sass/_md-comp-full-screen-dialog.scss`.
  **material-web is a tokens-only clone** — there is no `dialog/` directory,
  so every M3 structure and behavior row is `[R]`.

### Edition pin — `versions/latest`, and it narrows the split again

Pinned to **`tokens/versions/latest/sass`**, matching spinner, tooltip, alert,
input and select; calendar and button remain on `v0_192`. The tally becomes
**6 latest / 2 v0.192** — the minority shrinks in proportion for the second
component running, but the split itself is still open and still wants one
registry-wide decision. **Flagged for the owner for the sixth time.**

Reasons specific to this component:

1. A full mechanical key/value diff of `_md-comp-dialog.scss` across the two
   editions finds **zero value divergences among the shared keys**. `latest`
   adds exactly two things and **both arrive `@deprecated`**: the
   `with-divider-divider-{height,color}` pair (*"Depcrecating all divider
   tokens nested across components. Please use the standalone divider
   component token"*) and the whole `subhead-*` family (*"Tokens deprecated to
   align taxonomy with full-screen dialogs. Please use
   md.comp.dialog.headline.… instead"*). It also adds
   `container-surface-tint-layer-color`, likewise `@deprecated`.
2. `_md-comp-scrim.scss` is identical in value across editions
   (`container-color: md-sys-color.$scrim`, `container-opacity: 0.32`).
3. So for dialog the pin is very nearly a no-op — which, as with select, is
   the opposite of a reason to agonise over it. **It neither widens the split
   nor changes a single rendered value.**

**One declared borrow.** `_md-comp-dialog.scss` carries **no spacing, width,
height or motion token in either edition** — it is colours, type, shape,
elevation, one icon size and one deprecated divider pair. Eight layout numbers
(panel padding 24px, panel gap 16px, header gap 16px, header text-gap 16px,
min-width 280px, max-width 560px, actions padding-top 24px, actions gap 8px)
and the entrance motion are therefore `[R]`, taken from m3.material.io's
published basic-dialog spec and `docs/foundations/motion.md` respectively, and
flagged individually on their cells — the same treatment TOOLTIP-MATRIX.md
gave M3's plain-tooltip padding. **No token name was invented for any of
them.**

---

## 1 · Structure (parts)

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| scrim / backdrop | 🔒 | on — a **separate exported component**, `<Scrim fixed>`, shared with Drawer [S] | on — `DialogOverlay`, declared inside `dialog.tsx`, rendered unconditionally by `DialogContent` [S] | on — its **own token file**, `_md-comp-scrim.scss` [S] |
| panel | 🔒 (invariant) | on — `.saltDialog`, `position: fixed` with `inset: 0; margin: auto; height: min-content` [S] | on — `DialogContent`, a **grid** at `top/left 50%` with `translate(-50%,-50%)` [S] | on — the `container-*` family [R] |
| header | ⬜ | on — `DialogHeader`, a real component with `header`/`preheader`/`description`/`actions`/`status`/`disableAccent` props and its own id-publishing context effect [S] | on — `DialogHeader`, a **layout div only** (`flex flex-col gap-2 text-center sm:text-left`) [S] | no header token; `headline-*` and `supporting-text-*` are direct families [R] |
| **header decoration** | ⚪ | **accent bar** — a `size-bar`-wide accent stripe, `::before` on the header, **swapped for a StatusIndicator when a status is set** [S] | **none** — confirmed absent [S] | **icon** — `with-icon-icon-size: 24px` + `-color: secondary` [S] |
| preheader | ⚪ | **on** — rendered *inside* the H2, so it is part of the accessible name [S] | OFF [S] | OFF [S] |
| title / headline | 🔒 (invariant) | on — `<H2>` (a composed `Text`) [S] | on — Radix `Title`, a `Primitive.h2` [S] | on — `headline-*` [S] |
| description / supporting text | ⚪ | **on** — `<Text color="secondary">` [S] | **on** — Radix `Description`, a `<p>` [S] | **on** — `supporting-text-*` [S] |
| header actions | ⚪ | **on** — `actions` prop → `.saltDialogHeader-actionsContainer`, `align-self: flex-start` [S] | OFF [S] | OFF — `header-action-*` belongs to full-screen-dialog [S] |
| content scroller | ⚪ | **on, and it is two extra elements with behaviour attached** — a margin box wrapping an `overflow-y: auto` inner with **reserved 1px transparent scroll-divider borders**, a ResizeObserver overflow check and an `onScrollCapture` handler [S] | **OFF** — children are direct grid items; no overflow handling anywhere in `dialog.tsx` [S] | OFF — no content token [S] |
| actions / footer | ⚪ | **on** — `DialogActions`, `justify-content: flex-end` [S] | **on** — `DialogFooter`, **`flex-col-reverse` below 640px**, `flex-row justify-end` at and above [S] | **on** — an `action-*` family material-web then disowns [S] |
| close button | ⚪ | **optional** — a separate export, pinned **flush at `top: 0; right: 0`** [S] | **default-on** — `showCloseButton = true`, at **16px in from both edges** [S] | **none** — no close token of any kind [S] |

### The three axes that were nearly smoothed over

**The close affordance is a three-way split on TWO dimensions at once.** Not
just *where* the X sits, but whether it exists unless asked for. Salt makes it
opt-in and pins it flush into the corner **over** the panel's own padding;
shadcn makes it opt-out and insets it a full 16px; M3 has no close token at
all and expects the actions or the scrim to do the job. A chassis that always
rendered an inset X would have been wrong for two of three, and one that never
rendered it would have been wrong for shadcn's default. Modelled as
`structure.close-button: "optional" | "default" | "none"` with a skeleton
branch **and** distinct placement rows.

**The content scroller is structure, not padding.** Salt's `DialogContent`
adds two elements, an overflow measurement, three state hooks and a focusable
scroll region. shadcn has literally no content element — its children are
direct children of a grid, which is exactly why its `gap-4` lands between
*every* child. Rendering a wrapper for all three would have changed shadcn's
box model, the same mistake INPUT-MATRIX.md finding 2 corrected with
`display: contents`. The skeleton branches: `contentScroller` on renders the
two divs, off renders `{children}` bare.

**The header decoration is three different marks.** An accent bar, nothing,
and a glyph. Salt's bar is additionally *replaced* by a status glyph — the
source condition is literally `!disableAccent && !status` — so a single
`decoration` value has to carry a swap, which the skeleton reproduces rather
than approximating with "an optional icon everywhere".

## 2 · Behavior

**Every row below is implemented in `skeleton/dialog.tsx` and asserted by
`scripts/check-dialog-behavior.mjs`.** That is new for this component and it
exists because SELECT-MATRIX.md finding 16 caught a documented-but-missing
behaviour that three passing gates did not.

| row | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| ARIA role | 🔒 (info) | `role="dialog"` (Dialog.tsx:153) [S] | `role="dialog"` on `DismissableLayer` [S] | `role="dialog"` [R] |
| **`aria-modal`** | ⚪ | **`aria-modal="true"`** (Dialog.tsx:154) [S] | **ABSENT, and deliberately so** — the source comment is *"aria-hide everything except the content (better supported equivalent to setting aria-modal)"* [S] | on [R], per APG |
| **background suppression** | 🔒 | **`inert`** — `outsideElementsInert: true` on `FloatingFocusManager`, the platform attribute, which removes outside content from hit-testing, focus **and** the a11y tree [S] | **`aria-hidden`** — `hideOthers(content)` from the `aria-hidden` package; pointer suppression is done separately by `disableOutsidePointerEvents` [S] | `aria-hidden` [R] |
| focus trap | 🔒 | floating-ui `FloatingFocusManager`; the a11y doc states Tab wraps from last to first [S] | Radix `FocusScope` with **`loop`** and `trapped={context.open}` [S] | [R] |
| **initial focus** | 🔒 | **configurable** — `initialFocus` takes a tabbable **index or a ref**, default 0, and the a11y doc prescribes which control gets it per dialog kind [S] | **first tabbable** — `FocusScope`'s `onMountAutoFocus` default; no ordinal API [S] | first tabbable [R] |
| focus return | 🔒 | `FloatingFocusManager` `returnFocus` default; documented [S] | **explicit** — `onCloseAutoFocus` does `event.preventDefault(); context.triggerRef.current?.focus()` [S] | [R] |
| Escape dismiss | 🔒 | `useDismiss` — `escapeKey` is on by default and `disableDismiss` does **not** turn it off [S] | `DismissableLayer` `onEscapeKeyDown` [S] | [R] |
| outside-press dismiss | ⚪ | **on by default** — `useDismiss(context, { outsidePress: !disableDismiss })` [S] | **on**, with a **right-click guard**: `button === 2` or ctrl+left is prevented, and `onFocusOutside` is prevented so a trapped focusout cannot dismiss [S] | on [R] |
| scroll lock | 🔒 | **`overflow: hidden` on `documentElement` PLUS a `paddingRight` equal to the vanished scrollbar's width**, ref-counted across nested locks (`usePreventScroll`, a react-spectrum refactor) [S] | `react-remove-scroll` on the overlay when modal [S] | [R] |
| `aria-labelledby` | 🔒 (info) | a **child-to-parent context channel**: `DialogHeader` generates an id and pushes it up through `DialogContext.setId`; `Dialog` reads it back. The `idProp` prop is `@deprecated` precisely because of it [S] | Radix **counts mounted Titles** — the attribute is absent when no Title is rendered [S] | [R] |
| **`aria-describedby`** | ⚪ | **OFF — confirmed absence.** A direct grep of `packages/core/src/dialog` returns no `aria-describedby`; Salt's description is visible text with no programmatic association [S] | **on** — wired to the Description's id, but only when one is mounted [S] | on [R] |
| exit animation (delayed unmount) | ⚪ | **on, and doubly** — a `setTimeout(…, 300); // var(--salt-duration-perceptible)` **and** an `onAnimationEnd` early unmount [S] | **on** — Radix `Presence` + `data-[state=closed]:animate-out` [S] | **OFF** — no motion token exists, so no exit is claimed [S] |
| scroll region focusable | ⚪ | **on** — when the body overflows, the inner scroller gets `role="region"`, `tabIndex={0}` and `aria-labelledby`; the a11y doc cites WCAG 2.1.1 [S] | OFF [S] | OFF [R] |
| portal | 🔒 (info) | **DECLARED GAP** — floating-ui `FloatingPortal`, with a `SaltProvider applyClassesTo="scope"` re-applied inside because the portal escapes the theme scope [S] | **DECLARED GAP** — Radix `DialogPortal` [S] | [R]. **Neither is reimplemented.** `skeleton/dialog.tsx` renders the scrim and panel in place as `position: fixed` siblings under a `display: contents` root, so they stay inside the harness's `[data-theme]` scope. |

## 3 · Props

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| `size` | ⚪ | **on — `"small" \| "medium" \| "large"`, default `"medium"`**, and it is really a size × **breakpoint** matrix: `withBaseName(size, currentBreakpoint)` produces fifteen classes, each a percentage width and a percentage max-height [S] | **OFF on Dialog.** Its sibling `alert-dialog` **does** have `size?: "default" \| "sm"` — recorded so a future reader does not import it across [S] | OFF — no size token [S] |
| `status` | ⚪ | **on, FOUR values** — `ValidationStatus` = error/warning/success/**info**. Note: Salt's own Input and Dropdown take `Omit<ValidationStatuses,"info">` and get three [S] | OFF [S] | OFF — no error/status token anywhere in the dialog file, which is unusual for M3 [S] |
| `disableDismiss` | ⚪ | **on** — sets `outsidePress: false`. Does **not** disable Escape [S] | OFF — a consumer prevents `onPointerDownOutside` per instance [S] | OFF [S] |
| `disableScrim` | ⚪ | **on** [S] | **OFF — structurally impossible.** `DialogOverlay` is rendered unconditionally by `DialogContent`; removing it is a source edit, the same class of expressibility gap as shadcn's always-on tooltip arrow [S] | OFF [S] |
| `disableAccent` | ⚪ | **on**, and note the interaction: the accent bar needs `!disableAccent && !status`, so **setting a status also removes it** — two props, one slot [S] | OFF [S] | OFF [S] |
| `showCloseButton` | ⚪ | OFF — the close button is an opt-in component instead [S] | **on, TWICE, with opposite defaults in one file**: `DialogContent`'s defaults to **true** (the corner X), `DialogFooter`'s defaults to **false** (a composed `<Button variant="outline">Close</Button>`) [S] | OFF [S] |
| `initialFocus` | 🔒 (via behavior) | **on** — index or ref [S] | OFF [S] | OFF [R] |

## 4 · Content slots

| slot | policy | notes |
|---|---|---|
| title / headline | 🔒 | consumer-owned in all three. |
| description | ⚪ | consumer-owned in all three. |
| content | 🔒 | consumer-owned; only the scrolling chrome around it is modelled, and only Salt has any. |
| actions | ⚪ | consumer-owned. **DECLARED COMPOSITION** — the buttons belong to the future `button` component: Salt's examples use `<Button sentiment="accented" appearance="bordered">`, shadcn's `<Button variant="outline">`, M3 defers explicitly to "standard text buttons". |
| preheader | ⚪ | Salt only, consumer-owned. |
| header actions | ⚪ | Salt only, consumer-owned. |
| composes (declared) | ⬜ | **DECLARED COMPOSITION**, same pattern as CALENDAR-MATRIX.md's nav buttons: (a) `button`; (b) an **icon set** — the close X, Salt's StatusIndicator glyph, M3's with-icon glyph; (c) **`scrim`**, its own canonical row, borrowed here as a part; (d) the **portal / floating engine**; (e) `text`, for Salt's H2/Text components which supply the title and description type. All render as neutral placeholders. |

## 5 · States

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| closed / open | 🔒 | on; the panel stays mounted through a 300ms exit [S] | on; Radix `Presence` keeps it mounted through `data-state="closed"` [S] | on [R] |
| content overflow | ⚪ | **on — three sub-states**: `isOverflowing`, `canScrollUp`, `canScrollDown`, driving four class hooks plus a state-conditional right padding [S] | OFF [S] | OFF [S] |
| status | ⚪ | **on, four values** [S] | OFF | OFF |
| close-button interaction | ⚪ | **OFF** — `DialogCloseButton.css` has exactly three declarations (`position`, `top`, `right`); every state belongs to the composed Button [S] | **on** — opacity 70 → 100 on hover, a 2px focus ring with a 2px offset, `data-[state=open]:bg-accent` [S] | OFF — no close button [S] |

## 6 · Styles — the cell matrix

All cells are shown at each system's default: Salt `size="medium"`, no status,
medium density; shadcn its only configuration at ≥640px; M3 the basic dialog.

### scrim

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background | 🔒 | ⟡ `scrim-bg` → `overlayable-background` → `palette-alpha-higher` → **`rgba(255,255,255,0.65)` light / `rgba(0,0,0,0.65)` dark** [S] | ⟡ `scrim-bg` → `bg-black/50` → **`color-mix(in oklab, #000 50%, transparent)`**, mode-invariant [S] | ⟡ `scrim-bg` → `container-color` (`scrim` → `neutral0` `#000`) at `container-opacity` **0.32**, mode-invariant [S] |
| z-index | ⬜ | **1199** — `calc(var(--salt-zIndex-drawer) - 1)`, deliberately one below the drawer layer and 101 below the modal layer its own panel uses [S] | **50** (`z-50`) [S] | OFF — no z-index token [S] |
| entrance animation | ⚪ | **OFF — confirmed absence.** `Scrim.css` has no animation or transition rule of any kind; the veil appears instantly beneath a panel that fades [S] | **on** — `data-[state=open]:animate-in fade-in-0`; 200ms [S], easing [R] [S/R] | OFF — no motion token [S] |

### panel

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background | 🔒 | ⟡ `container-primary-background` → **snow / jet** [S] | ⟡ `--background` → **`oklch(1 0 0)` / `oklch(0.145 0 0)`** [S] | ⟡ `container-color` → `surface-container-high` → **`#ece6f0` / `#2b2930`** — a *higher* tone than the select popup's `surface-container` [S] |
| text colour | ⚪ | **OFF — confirmed absence.** `.saltDialog` declares no `color`; the header inherits `currentColor` and only `DialogContent` declares one [S] | **on** — ambient `--foreground` via the `bg-background` pairing; `DialogContent` sets no text class [S] | **OFF** — M3 colours the headline and supporting text individually [S] |
| border | ⚪ | **on** — `size-fixed-100` (1px, density-invariant) solid `separable-tertiary-borderColor` → `rgba(0,0,0,0.2)` / `rgba(255,255,255,0.2)`, through the `--status-active` indirection [S] | **on** — bare `border` → `--border` [S] | **OFF** — no outline token; an M3 dialog is elevation-only, exactly as its menu is [S] |
| shape | ⬜ | ⟡ `palette-corner` → curve-150 → **3/6/9/12px** — the **unsuffixed** stop, rounder than the `corner-weak` its input and dropdown use [S] | **10px** (`rounded-lg` → `--radius-lg` → `--radius` = `0.625rem`) — note this is the FULL radius where its own controls use `--radius-md` (×0.8) [S] | **28px** (`corner-extra-large`) — by far the roundest surface in this registry [S] |
| shadow | ⚪ | `overlayable-shadow-modal` → **`shadow-medium`**, the heaviest stop in Salt's scale and the only component here to use it [S] | `shadow-lg` [R] — Tailwind not vendored | `container-elevation: level3` (6dp) → M3's published two-layer level-3 shadow [R], derived as button/select derived theirs |
| padding | ⬜ | **`24px 0`** — `spacing-300` top and bottom, **no horizontal padding at all**; the header, content and actions each carry their own insets [S] | **24px** uniform (`p-6`) [S] | **24px** uniform [R] |
| gap | ⚪ | **OFF** — Salt spaces its parts with per-part padding, not a container gap [S] | **16px** (`gap-4` on the grid) [S] | **16px** [R] |
| width | ⚪ | OFF — width **is** the size axis [S] | **100%** (`w-full`) [S] | 100% [R] |
| min-width | ⚪ | OFF | OFF | **280px** [R] — the only system that declares a floor |
| max-width | ⚪ | OFF | **32rem** (`sm:max-w-lg` at ≥640px; below that only `max-w-[calc(100%-2rem)]`) [S] | **560px** [R] |
| max-height | ⚪ | OFF here — set **per size** (below) [S] | **OFF — confirmed absence**, and it matters: a long shadcn dialog grows past the viewport; its own docs solve it per instance [S] | OFF [S] |
| overflow | ⚪ | **`auto` on the panel itself**, in addition to the inner scroller — **two nested scroll containers** [S] | OFF [S] | OFF [S] |
| z-index | ⬜ | **1300** (`zIndex-modal`) [S] | **50** — the **same index as its own overlay**; the panel wins on DOM order [S] | OFF [S] |
| outline | ⚪ | OFF | **`none`** — Radix focuses the panel itself when nothing tabbable is inside [S] | OFF |
| entrance animation | ⬜ | **`fade-in-center` 300ms ease-in-out** — `--salt-duration-perceptible`; the keyframe is **opacity only** [S] | **fade + `zoom-in-95`**, 200ms [S], ease-out [R] | 300ms `cubic-bezier(0.2,0,0,1)` [R], borrowed from `docs/foundations/motion.md` |
| exit animation | ⚪ | **`fade-out-back` 300ms ease-in-out both** — and **despite the name the keyframe has no transform**, opacity only [S] | fade + `zoom-out-95` [S] | OFF [S] |

### the size axis (Salt only), and the breakpoint pin

`Dialog.tsx` composes `withBaseName(size, currentBreakpoint)`, so Salt emits
**fifteen** classes — three sizes × five breakpoints — each setting a
percentage `width` and a percentage `max-height`, under the source's own
comment `/* Pending design decision on heights and widths */`. Salt computes
the breakpoint **in JavaScript** (`useCurrentBreakpoint` over
`DEFAULT_BREAKPOINTS` xs:0 sm:600 md:960 lg:1280 xl:1920), so these are real
classes, not media queries.

This generator has no `@media` channel (INPUT-MATRIX.md finding 9) and the
template carries one row per size, so **one breakpoint column is carried**:
`lg` (1280–1919px), the harness's own viewport, matching input's desktop-value
precedent. The full matrix is recorded in `dialog.salt.json`'s provenance:

| size | xs | sm | md | **lg (carried)** | xl |
|---|---|---|---|---|---|
| small | 100% / 48% | 56% / 48% | 36% / 48% | **24% / 48%** | 24% / 48% |
| medium | 100% / 72% | 84% / 72% | 68% / 72% | **48% / 72%** | 48% / 72% |
| large | 100% / 84% | 96% / 84% | 84% / 84% | **72% / 84%** | 72% / 84% |

### header and decoration

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| padding | ⚪ | **`0 24px 24px`** — bottom/left/right `spacing-300`, **no padding-top** (the panel supplies it) [S] | OFF — the panel's `p-6` covers it [S] | OFF [R] |
| row gap (decoration ↔ text) | ⚪ | `spacing-100` → **4/8/12/16px** [S] | OFF — no decoration to gap from [S] | **16px** [R] |
| text gap (title ↔ description) | ⬜ | `spacing-50` → **2/4/6/8px**, i.e. **half its row gap** [S] | **8px** (`gap-2`) [S] | **16px** [R] |
| text optical offset | ⚪ | **a formula**: `calc((size-base − text-h2-lineHeight) / 2)` → **1/2/2/1px** by density, so the H2's first line optically centres against a `size-base`-tall row [S] | OFF | OFF |
| accent bar | ⚪ | **on** — `width: size-bar` **2/4/6/8px**, `background: sentiment-accent-background` (blue-500), `bottom: spacing-300` so it stops above the header's own padding [S] | OFF | OFF |
| header icon size | ⚪ | **`--icon-size: text-h2-lineHeight`** → **18/24/32/42px**, i.e. exactly one line of the title beside it — **not** `size-icon` [S] | OFF | **24px** (`with-icon-icon-size`), density-invariant [S] |
| header icon colour | ⚪ | ⟡ `status-active` — the **same indirection the border reads** (DECLARED COMPOSITION for the glyph itself) [S] | OFF | `secondary` → **`#625b71` / `#ccc2dc`** — the only appearance of the secondary role in an M3 dialog [S] |
| header icon offset | ⚪ | the identical `calc((size-base − text-h2-lineHeight)/2)` [S] | OFF | OFF |

### title / preheader / description

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| title font | ⬜ | **`600 18px/24px 'Open Sans'` @medium** (14/18 · 18/24 · 24/32 · 32/42 by density). The family is Open Sans, **not Amplitude**, because `SaltProvider.tsx:42` sets `DEFAULT_HEADING_FONT = "Open Sans"` and `text.css` keys the Amplitude block off `[data-heading-font="Amplitude"]` [S] | **`600 1.125rem/1`** (`text-lg leading-none font-semibold`) — the only title in this registry with a line-height of exactly **1** [S] | **`400 1.5rem/2rem Roboto`** (`headline-small`) — the **largest** title and the **lightest** weight of the three [S] |
| title colour | ⚪ | **OFF — confirmed absence.** No `color` prop on the `<H2>`, so `Text.css`'s `--text-color` default (`currentColor`) applies [S] | **OFF** — no text-colour class on `DialogTitle` [S] | **on** — `headline-color` → `on-surface`. The only system that tokenises it [S] |
| title letter-spacing | ⚪ | **0** [S] | OFF | **0rem** — declared and zero, which is not the same as absent [S] |
| preheader font | ⚪ | **the BODY ramp inside a heading** — a plain `.saltText` nested in the H2, and `Text.css`'s heading rule is `h2.saltText, .saltText-h2.saltText`, which a nested span does not match. Sourced by reading which selector wins [S] | OFF | OFF |
| preheader colour | ⚪ | **`content-primary-foreground`** — the **primary** foreground, so the preheader reads *stronger* than the description below it despite being smaller than the title [S] | OFF | OFF |
| description font | ⬜ | **`400 12px/16px 'Open Sans'`** @medium [S] | **`400 0.875rem/1.25rem`** (`text-sm`) [S] | **`400 0.875rem/1.25rem Roboto`** (`body-medium`) — shadcn and M3 land on identical numbers by different routes [S] |
| description colour | 🔒 | `content-secondary-foreground` → **`rgb(76,81,87)` / `rgb(177,181,185)`** [S] | `--muted-foreground` → **`oklch(0.556 0 0)` / `oklch(0.708 0 0)`** [S] | `on-surface-variant` → **`#49454f` / `#cac4d0`** [S] |
| description letter-spacing | ⚪ | **0** [S] | OFF [S] | **0.015625rem** (`body-medium-tracking`) [S] |

### content (Salt only)

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| colour | ⚪ | **on** — `content-primary-foreground`, declared on the body wrapper, which is why the panel carries none [S] | OFF | OFF |
| box | ⚪ | **asymmetric, and it is in source**: `margin-left: spacing-200` (8/16/24/32), `margin-right: spacing-300` (12/24/36/48), `padding-left: spacing-100` (4/8/12/16). Left inset = 16 + 8 = 24 = `spacing-300` at medium, so the text still aligns with the header while the padding sits **inside** the scroll container. Also re-declares the container background [S] | OFF | OFF |
| min-height | ⚪ | **`text-lineHeight`** → 14/16/18/20px — an empty body still reserves exactly one line [S] | OFF | OFF |
| padding @overflow | ⚪ | **`spacing-100` right padding, applied ONLY while overflowing** — a state-conditional spacing rule, rarer than it sounds [S] | OFF | OFF |
| scroll dividers | ⚪ | **1px transparent top and bottom borders always**, recoloured to `separable-tertiary-borderColor` when `scrollTop > 0` / `scrollHeight − scrollTop − clientHeight > 1`. The transparent reserve is the point: the box does not jump when a divider appears. Note the source's `> 1` tolerance, not `> 0` [S] | OFF | **declared off** — `with-divider-divider-*` is a *static* divider variant, `@deprecated` in favour of the standalone divider component, and mapping it here would manufacture a false parallel [S] |

### actions

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| padding | ⬜ | **`24px 24px 0`** — `spacing-300` with `padding-bottom: 0`; the panel's own bottom padding finishes the box [S] | OFF [S] | **`24px 0 0`** [R] |
| gap | ⬜ | `spacing-100` → 4/8/12/16px [S] | **8px** (`gap-2`) [S] | **8px** [R] |

All three right-align at desktop width, so the justification lives in the
template's `base` rather than in a row.

### close button

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| position | ⚪ | **`top: 0; right: 0`** — flush into the panel corner, **over** the panel's own padding [S] | **`top: 16px; right: 16px`** (`top-4 right-4`) [S] | OFF |
| shape | ⚪ | DECLARED COMPOSITION | **`0.125rem`** (`rounded-xs`) [R] **and flagged**: `globals.css` defines `--radius-sm` … `--radius-4xl` but **not `--radius-xs`**, so this one utility falls through to Tailwind's own default instead of shadcn's `--radius` scale [S/R] | OFF |
| glyph size | ⚪ | DECLARED COMPOSITION | **16px** (`size-4`) + `shrink-0` + `pointer-events-none`, density-invariant [S] | OFF |
| opacity / @hover | ⚪ | OFF — `appearance="transparent"` is a Button appearance, not a dimming [S] | **0.7 → 1** [S] | OFF |
| focus | ⚪ | DECLARED COMPOSITION — the Button supplies its own ring [S] | **a 2px ring outside a 2px background-coloured offset** (`ring-2 ring-offset-2 ring-offset-background`), as a two-layer box-shadow [S] | OFF |
| transition | ⚪ | OFF [S] | `opacity` 150ms [R] [S/R] | OFF |

### the status axis, as generated rows (Salt only)

Every status value is a real CSS row that reassigns **one** indirection
custom property (`--status-active`) which **two** rules consume — the panel's
`border-color` and the header glyph's `color` — mirroring `Tooltip.css`'s
`--tooltip-status-borderColor` and INPUT-MATRIX.md finding 3.

| row | Salt | shadcn | Material 3 |
|---|---|---|---|
| `style.panel.status@info` | **on** — `palette-info` `rgb(0,120,207)` [S] | OFF | OFF |
| `style.panel.status@error` | **on** — `palette-negative` `rgb(229,33,53)` [S] | OFF | OFF |
| `style.panel.status@warning` | **on** — `palette-warning` `rgb(199,83,0)` [S] | **OFF — no warning state exists** [S] | **OFF** [S] |
| `style.panel.status@success` | **on** — `palette-positive` `rgb(0,135,93)` [S] | OFF | OFF |

**Accent scope trim.** `sentiment-accent-background` resolves through
`palette-accent`, which has a `data-accent` axis (`blue` default, `teal`
alternate). This column pins **blue**, matching `button/input/select.salt.json`;
only `calendar.salt.json` models `byAccent`. Recorded, not modelled.

---

## Declared approximations in the chassis

Three, all stated rather than smoothed:

1. **Centring mechanism.** Salt centres with `inset: 0; margin: auto;
   height: min-content`; shadcn with `top/left: 50%` +
   `translate(-50%, -50%)`. The skeleton uses Salt's for all three because
   the outcome is identical at every size the harness renders, and because
   `margin: auto` clamps an over-tall panel where the translate form pushes
   it off both edges. Declared here; not modelled as an axis because no
   sourced value differs.
2. **M3's icon placement.** m3.material.io centres the `with-icon` glyph
   **above** the headline and centres the headline with it. The skeleton uses
   the same leading-glyph row layout as Salt, because material-web is a
   tokens-only clone with **no dialog component and no layout token** to
   source that from — an `[R]` layout is not enough to justify a second
   structural branch. Flagged for the owner as the one place an M3 render
   will read wrong to a Material-trained eye.
3. **shadcn's close-button focus pseudo-class.** Source uses `focus:`, not
   `focus-visible:` — unlike the rings on shadcn's own `input.tsx` and
   `select.tsx`. The skeleton applies it on `:focus-visible`, so a
   mouse-clicked close button does not leave a ring in the harness. Declared
   on the row rather than hidden.

---

## Findings from building this matrix

1. **Three systems, three scrims — and Salt's is WHITE in light mode.**
   `Scrim.css` reads `--salt-overlayable-background` →
   `--salt-palette-alpha-higher`, and `next/palette/alpha.css` defines
   `alpha-higher` as `color-white-65a` under `[data-mode="light"]` and
   `color-black-65a` under `[data-mode="dark"]`. So a Salt modal veils the
   page in **65% white**, not black. shadcn is **50% black**, mode-invariant.
   M3 is **32% of `scrim`** (`neutral0` = `#000`), also mode-invariant. Three
   different opacities, and one of them inverts by mode. This was grepped
   twice because it contradicts the near-universal expectation that a scrim
   is a dark wash — and "a scrim is a dark wash" is exactly the kind of
   assumption that would have shipped a wrong Salt render with every gate
   green.
2. **shadcn does not set `aria-modal`, and it is on purpose.** Salt writes
   `aria-modal="true"` (Dialog.tsx:154). Radix writes `role="dialog"` and
   nothing else, then calls `hideOthers(content)` with the source comment
   *"aria-hide everything except the content (better supported equivalent to
   setting aria-modal)"*. Two libraries, two readings of the same spec
   sentence — and two genuinely different mechanisms underneath: Salt asks
   floating-ui for `outsideElementsInert: true`, i.e. the **platform `inert`
   attribute**, which suppresses hit-testing, focus *and* the a11y tree;
   Radix suppresses the a11y tree with `aria-hidden` and handles pointers
   separately. Modelled as two rows (`behavior.aria-modal`,
   `behavior.background-suppression`) with two skeleton branches, because
   collapsing them into "it's modal" would have lost both.
3. **Salt never associates its own description with its own dialog.** A
   direct grep of `packages/core/src/dialog` for `aria-describedby` returns
   nothing. `DialogHeader` renders a `description` as visible text, and
   `Dialog` wires only `aria-labelledby` — through a **child-to-parent
   context channel** (`DialogHeader` generates the id, pushes it up through
   `DialogContext.setId`, `Dialog` reads it back; the `idProp` prop is
   `@deprecated` precisely because that channel replaced it). Radix does the
   opposite on both counts: it *counts* mounted Titles and Descriptions and
   wires each attribute only when the element exists. Recorded as a confirmed
   absence rather than "not found yet", and switched off in the Salt column
   rather than quietly hoisted to a locked row.
4. **Salt's `size` prop is a fifteen-cell matrix and the source says it is
   unfinished.** `withBaseName(size, currentBreakpoint)` emits one of
   `.saltDialog-{small,medium,large}-{xs,sm,md,lg,xl}`, each a percentage
   width plus a percentage max-height, and `Dialog.css` carries the comment
   `/* Pending design decision on heights and widths */` directly above the
   block. Salt computes the breakpoint in **JS**, not CSS, so these are real
   classes — which means the generator's missing `@media` channel is not
   even the right objection here; the row model is. One breakpoint column
   (`lg`) is carried and all fifteen values are recorded in provenance.
5. **The close affordance splits three ways on placement AND on default.**
   Salt: opt-in, pinned flush at `0/0` *over* the panel's padding.
   shadcn: opt-out (`showCloseButton = true`), inset 16px. M3: does not exist.
   And shadcn has **two props called `showCloseButton` in one file with
   opposite defaults** — `DialogContent`'s is true (the corner X),
   `DialogFooter`'s is false (a composed "Close" button). Reading only the
   first would have produced a matrix that says shadcn always shows a close
   button and never shows a close *action*.
6. **Only one of three systems has a content scroller, and it is a whole
   sub-component.** Salt's `DialogContent` renders two divs, measures overflow
   with a ResizeObserver, tracks `canScrollUp`/`canScrollDown` on scroll with
   a `> 1` tolerance, reserves 1px transparent borders so the box does not
   jump when a divider appears, adds right padding **only while overflowing**,
   and promotes the scroller to `role="region" tabIndex={0}` with a label
   when it overflows — citing WCAG 2.1.1 in its own docs. shadcn has **no
   content element at all** and no overflow handling anywhere in `dialog.tsx`;
   its docs solve scrolling per instance. M3 has no content token. This is
   INPUT-MATRIX.md finding 2's lesson at a larger scale: the skeleton
   branches, and for shadcn/M3 the children really are direct children of the
   panel, so shadcn's `gap-4` lands between every child exactly as in source.
7. **Salt's exit keyframe does not do what its name says.**
   `--salt-animation-fade-out-back` sounds like a fade plus a scale-back;
   `foundations/animation.css`'s `fade-out-back` body is `opacity: 1 → 0` with
   **no transform**. (Its sibling `fade-in-back` *does* scale.) The registry
   reproduces the body, not the name. Two components in a row have now turned
   up a source that contradicts itself in some small way — Salt's tooltip
   arrow, M3's select focus thickening, and now this — which is why the
   procedure is always "read one file further".
8. **material-web declares a dialog elevation and then disowns it.**
   `_md-comp-dialog.scss` sets `container-elevation: md-sys-elevation.$level3`
   (6dp), and material-web's own hand-authored `tokens/_md-comp-dialog.scss`
   lists `container-elevation` under `$unsupported-tokens` with the comment
   *"Unused without a shadow color"* — alongside the entire `action-*` family
   (*"actions are spec'd as standard text buttons"*). This is SELECT-MATRIX.md
   finding 6 recurring: the token file and the shipped library disagree, and
   the resolution is the same — take the generated token's value, record the
   disownment, do not silently pick one reading.
9. **A registry document was wrong and source corrected it.**
   `docs/foundations/typography.md` flags M3's font family as unresolvable in
   this tokens-only clone (*"the literal family strings live in font-loader
   config"* / *"concrete family name not resolved"*). It is resolvable:
   `tokens/versions/latest/sass/_md-ref-typeface.scss` carries `$brand: Roboto;`
   and `$plain: Roboto;` as literals, and `versions/v0_192/_md-ref-typeface.scss`
   carries the same values inside its `values()` map. So M3's dialog headline
   family is **[S], not [R]**. Recorded here and flagged for the owner rather
   than edited into the foundations page from a component build.
10. **The frozen-token check, run in both directions, found nothing frozen —
    and one near-miss worth stating.** Every bare literal in Salt's dialog was
    tested against TOOLTIP-MATRIX.md lesson 7. `size-fixed-100` (the 1px panel
    border and the 1px scroll dividers) is on the **fixed** scale, which
    `docs/foundations/sizes.md` states is density-invariant by design.
    `size-bar` (the accent bar) is on the **density** scale — 2/4/6/8px — and
    really does move. The near-miss is the header glyph: it would have been
    natural to size it with `--salt-size-icon` (10/12/14/16), and Salt
    explicitly does not — `DialogHeader.css` overrides the StatusIndicator's
    own box with `--icon-size: var(--salt-text-h2-lineHeight)` (18/24/32/42),
    so the glyph is exactly one line of the title beside it. Copying the icon
    token would have made every Salt dialog glyph roughly half the right size
    at every density. Two `calc()` formulas were likewise expanded per density
    rather than snapshotted at medium: the header text offset and the glyph
    offset, both `calc((size-base − text-h2-lineHeight) / 2)` → **1/2/2/1px**,
    which is *not* monotonic and would have been wrong if assumed constant.
11. **Axis self-audit (run deliberately, per ALERT-MATRIX.md finding 10).**
    Every `channel: "config"` row, and what discriminates its values:
    - **`prop.size`** — Salt `[medium, small, large]`, the only list of 3+
      besides status: discriminated by `style.panel.size@small` (24%/48%),
      `@medium` (48%/72%) and `@large` (72%/84%) — three real CSS blocks with
      two differing properties each. Listed **default-first**, per the
      convention `select.shadcn.json` set with `["default","sm"]`, because the
      skeleton and the harness both take `value[0]` as the resting state; a
      size-ordered list would have rendered every Salt dialog small against
      source. shadcn and M3 are `off`, so there is no undiscriminated value.
    - **`prop.status`** — Salt `[error, warning, success, info]`, a list of 4:
      discriminated by `style.panel.status@error/@warning/@success/@info`,
      four real blocks reassigning `--status-active` to four different palette
      stops, consumed by **both** the panel border and the header glyph —
      **plus** a skeleton branch, since setting a status swaps the accent bar
      for the glyph. Listed in source order because there is no default.
    - `structure.header-decoration` — one value per column, three distinct
      across columns (`accent-bar` / `none` / `icon`): discriminated by
      `style.accent-bar.box` (Salt only), `style.header-icon.size` and
      `.color` (Salt + M3), and two skeleton branches.
    - `structure.close-button` — `optional` / `default` / `none`:
      discriminated by the skeleton's default-on logic plus
      `style.close-button.position` (0/0 vs 16/16) and five shadcn-only rows.
    - `structure.content-scroller` — Salt `true`, others off: a skeleton
      branch that changes the DOM, plus six Salt-only CSS rows.
    - `structure.preheader`, `structure.header-actions` — Salt only: skeleton
      branches; preheader additionally has two CSS rows.
    - `behavior.aria-modal` (`true`/`false`), `behavior.background-suppression`
      (`inert`/`aria-hidden`), `behavior.initial-focus`
      (`configurable`/`first-tabbable`), `behavior.described-by`
      (`true`/`false`), `behavior.exit-animation` (`true`/`false`),
      `behavior.scroll-region-focusable` (`true`/`false`) — all discriminated
      by **skeleton branches**, none by CSS, which is correct: these are ARIA
      attributes, event wiring and mount timing. Each is asserted by
      `scripts/check-dialog-behavior.mjs`, which is the only reason a reader
      can trust that claim (see Finding 12).
    - `structure.scrim`, `structure.actions`, `structure.description`,
      `behavior.focus-trap`, `behavior.focus-return`,
      `behavior.dismiss-escape`, `behavior.dismiss-outside`,
      `behavior.scroll-lock` — **single-valued across all three columns**, so
      there is nothing to discriminate.
    **Result: no dead axis values.** The one row that is off in every column
    (`style.panel.max-height`) is a *style* row, not a config axis, and is
    retained deliberately as documentation of shadcn's confirmed absence.
12. **The missing third gate, built (partially) rather than only logged.**
    SELECT-MATRIX.md finding 16 ended with *"a behavioural conformance harness
    is the missing third gate. Logged for the owner rather than built here."*
    Dialog has **fourteen** behavior rows, nine of them locked, covering focus
    trapping, focus return, two dismissal channels, scroll locking, two ARIA
    wirings and a background-suppression mechanism — none of which a
    screenshot or a generator can see. So this component ships
    `scripts/check-dialog-behavior.mjs`: an ordered checklist, in code, that
    fails with exit 1 if a behavior row has no stated implementation, if the
    code an entry cites is not literally present in `skeleton/dialog.tsx`, or
    if a config-channel row's param is missing from `skeletonParams` or never
    read by the skeleton. It also reports the brief's narrower minimum
    (`policy=locked, channel=info`) explicitly, so it is visible that the
    wider check subsumes it.
    **What it does NOT do, stated plainly: it proves the code exists and is
    bound to its row; it does not prove the code is correct.** A real
    conformance harness would drive the skeleton in a DOM and assert
    observable behaviour — focus lands here, Escape closes, the body stops
    scrolling, the invoker gets focus back. That remains the outstanding half,
    and it is scoped to dialog only; the other seven components still have no
    behaviour gate at all. Logged for the owner alongside SELECT-MATRIX.md's
    findings 13 and 14.
13. **Scroll lock is the row where SELECT-MATRIX.md finding 14 would have bitten
    again, and it was designed around rather than discovered.** The scrollbar
    compensation is a **measured runtime value** —
    `window.innerWidth − documentElement.clientWidth` — and the tempting
    modelling is a slot like `--dialog-scrollbar-gutter: var(--measured, 0px)`.
    That is exactly the shape that froze select's popup to `0px`: a `var()`
    inside a custom-property declaration is substituted **at the element that
    declares it**, and a fallback turns the failure into a plausible-looking
    number. The skeleton therefore writes `documentElement.style.paddingRight`
    **inline on the element it measured**, with no custom property anywhere in
    the path. Same reasoning for the content-overflow state: it is expressed as
    data attributes the CSS selects on, not as a measured value threaded
    through a theme slot.
14. **`check-anatomy.mjs` flagged shadcn=m3 as an identical part-set — a gate
    blind spot, not a retrofit.** `structure.close-button` and
    `structure.header-decoration` are `channel: "config"` rows with a 3-way
    enum (finding 5 and finding 11's axis self-audit already document all
    three values per row in full). The gate's absence check only recognised
    `kind:"off"`/`value:false`/`value:null` — the css-channel vocabulary — so
    it missed that shadcn's `header-decoration: "none"` and m3's
    `close-button: "none"` are the SAME absence signal in enum form, and
    counted both as present. That made m3 (which has no close button) and
    shadcn (which has no header decoration) look like they share a part
    neither actually has. Fixed in `check-anatomy.mjs` (`partsOf`) to also
    treat `value === "none"` as absent; verified no other structure row in
    any component uses `"none"` as a real, present value. Re-run: dialog
    drops from 5 shared parts to the real 3 (`scrim`, `actions`,
    `description`), the shadcn=m3 flag clears, and the true divergence —
    shadcn has a close button and no decoration, m3 the reverse — is now
    what the gate actually reports instead of something a human had to
    already know from finding 5.

## Correction found by driving the render (owner-validation pass)

**Two behaviour rows were implemented, wired to the checklist gate, and
still did not work.** `behavior.initial-focus` and
`behavior.background-suppression` both read `panelRef.current` inside a
`useEffect`. The panel only renders once `mounted` flips true, and that
happens one render *after* `live` does — so on the render where `live`
became true the ref was still `null`, both effects hit their `if (!panel)
return` guard, and neither dependency array listed `mounted`, so neither
ever ran again. Opening the dialog moved no focus into it and suppressed
nothing behind it. Fixed by adding `mounted` to both dependency arrays.

Why nothing caught it, in order of how much each gate *should* have:

- **A screenshot could not**: the dialog looked perfect. Focus position and
  `inert` are invisible to a still image.
- **The generator could not**: no CSS is involved.
- **The axis self-audit could not**: these are `channel: "info"` behaviour
  rows, not config axes.
- **`check-dialog-behavior.mjs` could not, and this is the important one.**
  The gate written *for exactly this class of bug* passed, because it
  verifies that each behaviour row maps to code that EXISTS in the
  skeleton. Both effects existed, were correctly written, and were
  correctly cited. The gate proves binding, not behaviour — as its own
  closing line admits.
- **Scroll lock masked it.** `behavior.scroll-lock` reads no ref, so it
  worked, and the dialog *felt* modal: the page stopped scrolling. Two of
  the three global modal side effects were silently absent behind one that
  worked.

What actually caught it was scripting the real DOM — open the dialog, then
assert `panel.contains(document.activeElement)`. That is the missing third
gate in concrete form, and this is now the second consecutive component
where a behaviour row shipped documented-but-not-working (SELECT-MATRIX.md
finding 16 was the first). The generalisable rule for this codebase:
**any effect that reads a ref to a conditionally-rendered node must list the
state that gates that node's rendering in its dependency array** — and the
only gate that can prove a behaviour row is a harness that drives it.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/dialog.template.json` against every system, read from `columns/dialog.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 12 light, 6 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `surface` | rgb(255, 255, 255) | rgb(16, 24, 32) | yes |
| `fg` | rgb(0, 0, 0) | rgb(255, 255, 255) | yes |
| `fg-secondary` | rgb(76, 81, 87) | rgb(177, 181, 185) | yes |
| `divider` | rgba(0, 0, 0, 0.2) | rgba(255, 255, 255, 0.2) | yes |
| `scrim-bg` | rgba(255, 255, 255, 0.65) | rgba(0, 0, 0, 0.65) | yes |
| `shadow-modal` | 0 12px 40px 0 rgba(0, 0, 0, 0.3) | 0 12px 40px 0 rgba(0, 0, 0, 0.65) | yes |
| `accent` | rgb(0, 120, 207) | — | yes |
| `status-info` | rgb(0, 120, 207) | — | **no** |
| `status-error` | rgb(229, 33, 53) | — | **no** |
| `status-warning` | rgb(199, 83, 0) | — | **no** |
| `status-success` | rgb(0, 135, 93) | — | **no** |
| `status-active` | var(--divider) | — | yes |

**shadcn** — 11 light, 5 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `surface` | oklch(1 0 0) | oklch(0.145 0 0) | yes |
| `fg` | oklch(0% 0 0) | oklch(0.985 0 0) | yes |
| `fg-secondary` | oklch(0.556 0 0) | oklch(0.708 0 0) | yes |
| `border-base` | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | yes |
| `ring` | oklch(0.708 0 0) | oklch(0.556 0 0) | yes |
| `scrim-bg` | color-mix(in oklab, #000 50%, transparent) | — | yes |
| `shadow-lg` | 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) | — | yes |
| `radius-panel` | 0.625rem | — | yes |
| `radius-close` | 0.125rem | — | yes |
| `type-title` | 600 1.125rem/1 ui-sans-serif, system-ui, sans-serif | — | yes |
| `type-body` | 400 0.875rem/1.25rem ui-sans-serif, system-ui, sans-serif | — | yes |

**m3** — 9 light, 4 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `surface` | #ece6f0 | #2b2930 | yes |
| `fg` | #1d1b20 | #e6e0e9 | yes |
| `fg-secondary` | #49454f | #cac4d0 | yes |
| `icon-color` | #625b71 | #ccc2dc | yes |
| `scrim-bg` | color-mix(in srgb, #000 32%, transparent) | — | yes |
| `shadow-level3` | 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15) | — | yes |
| `radius-panel` | 28px | — | yes |
| `type-title` | 400 1.5rem/2rem Roboto, sans-serif | — | yes |
| `type-body` | 400 0.875rem/1.25rem Roboto, sans-serif | — | yes |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.scrim` | structure | locked | `True` | `True` | `True` |
| 2 | `structure.header-decoration` | structure | switchable | `accent-bar` | `none` | `icon` |
| 3 | `structure.preheader` | structure | switchable | `True` | **off** | **off** |
| 4 | `structure.header-actions` | structure | switchable | `True` | **off** | **off** |
| 5 | `structure.close-button` | structure | switchable | `optional` | `default` | `none` |
| 6 | `structure.content-scroller` | structure | switchable | `True` | **off** | **off** |
| 7 | `structure.actions` | structure | switchable | `True` | `True` | `True` |
| 8 | `structure.description` | structure | switchable | `True` | `True` | `True` |
| 9 | `behavior.role` | behavior | locked | — | — | — |
| 10 | `behavior.aria-modal` | behavior | switchable | `True` | `False` | `True` |
| 11 | `behavior.background-suppression` | behavior | locked | `inert` | `aria-hidden` | `aria-hidden` |
| 12 | `behavior.focus-trap` | behavior | locked | `True` | `True` | `True` |
| 13 | `behavior.initial-focus` | behavior | locked | `configurable` | `first-tabbable` | `first-tabbable` |
| 14 | `behavior.focus-return` | behavior | locked | `True` | `True` | `True` |
| 15 | `behavior.dismiss-escape` | behavior | locked | `True` | `True` | `True` |
| 16 | `behavior.dismiss-outside` | behavior | switchable | `True` | `True` | `True` |
| 17 | `behavior.scroll-lock` | behavior | locked | `True` | `True` | `True` |
| 18 | `behavior.labelled-by` | behavior | locked | — | — | — |
| 19 | `behavior.described-by` | behavior | switchable | `False` | `True` | `True` |
| 20 | `behavior.exit-animation` | behavior | switchable | `True` | `True` | **off** |
| 21 | `behavior.scroll-region-focusable` | behavior | switchable | `True` | **off** | **off** |
| 22 | `behavior.portal` | behavior | locked | — | — | — |
| 23 | `prop.size` | prop | switchable | `medium, small, large` | **off** | **off** |
| 24 | `prop.status` | prop | switchable | `error, warning, success, info` | **off** | **off** |
| 25 | `prop.disable-dismiss` | prop | switchable | `True` | **off** | **off** |
| 26 | `prop.disable-scrim` | prop | switchable | `True` | **off** | **off** |
| 27 | `prop.disable-accent` | prop | switchable | `True` | **off** | **off** |
| 28 | `prop.show-close-button` | prop | switchable | **off** | `True` | **off** |
| 29 | `slot.title` | slot | locked | — | — | — |
| 30 | `slot.description` | slot | switchable | `True` | `True` | `True` |
| 31 | `slot.content` | slot | locked | — | — | — |
| 32 | `slot.actions` | slot | switchable | `True` | `True` | `True` |
| 33 | `slot.preheader` | slot | switchable | `True` | **off** | **off** |
| 34 | `slot.header-actions` | slot | switchable | `True` | **off** | **off** |
| 35 | `slot.composes` | slot | default | — | — | — |
| 36 | `state.closed-open` | state | locked | — | — | — |
| 37 | `state.content-overflow` | state | switchable | `True` | **off** | **off** |
| 38 | `state.status` | state | switchable | `True` | **off** | **off** |
| 39 | `state.close-button-interaction` | state | switchable | **off** | `True` | **off** |
| 40 | `style.scrim.background` | style | locked | ⟡ `scrim-bg` | ⟡ `scrim-bg` | ⟡ `scrim-bg` |
| 41 | `style.scrim.z-index` | style | default | `1199` | `50` | **off** |
| 42 | `style.scrim.animation` | style | switchable | **off** | `dialog-fade-in 200ms ease-out` | **off** |
| 43 | `style.panel.background` | style | locked | ⟡ `surface` | ⟡ `surface` | ⟡ `surface` |
| 44 | `style.panel.color` | style | switchable | **off** | ⟡ `fg` | **off** |
| 45 | `style.panel.border` | style | switchable | `border-width: 1px; border-style: solid; border-color: var(--status-active)` | `border-width: 1px; border-style: solid; border-color: var(--border-base)` | **off** |
| 46 | `style.panel.shape` | style | default | ⟡ `panel-shape` | ⟡ `radius-panel` | ⟡ `radius-panel` |
| 47 | `style.panel.shadow` | style | switchable | ⟡ `shadow-modal` | ⟡ `shadow-lg` | ⟡ `shadow-level3` |
| 48 | `style.panel.padding` | style | default | ⟡ `panel-padding` | `24px` | `24px` |
| 49 | `style.panel.gap` | style | switchable | **off** | `16px` | `16px` |
| 50 | `style.panel.width` | style | switchable | **off** | `100%` | `100%` |
| 51 | `style.panel.min-width` | style | switchable | **off** | **off** | `280px` |
| 52 | `style.panel.max-width` | style | switchable | **off** | `32rem` | `560px` |
| 53 | `style.panel.max-height` | style | switchable | **off** | **off** | **off** |
| 54 | `style.panel.overflow` | style | switchable | `auto` | **off** | **off** |
| 55 | `style.panel.z-index` | style | default | `1300` | `50` | **off** |
| 56 | `style.panel.outline` | style | switchable | **off** | `none` | **off** |
| 57 | `style.panel.animation` | style | default | `dialog-fade-in 300ms ease-in-out` | `dialog-zoom-in 200ms ease-out` | `dialog-fade-in 300ms cubic-bezier(0.2, 0, 0, 1)` |
| 58 | `style.panel.animation@exit` | style | switchable | `dialog-fade-out 300ms ease-in-out both` | `dialog-zoom-out 200ms ease-out both` | **off** |
| 59 | `style.panel.size@small` | style | switchable | `width: 24%; max-height: 48%` | **off** | **off** |
| 60 | `style.panel.size@medium` | style | switchable | `width: 48%; max-height: 72%` | **off** | **off** |
| 61 | `style.panel.size@large` | style | switchable | `width: 72%; max-height: 84%` | **off** | **off** |
| 62 | `style.header.padding` | style | switchable | ⟡ `header-padding` | **off** | **off** |
| 63 | `style.header.gap` | style | switchable | ⟡ `header-gap` | **off** | `16px` |
| 64 | `style.header.text-gap` | style | default | ⟡ `header-text-gap` | `8px` | `16px` |
| 65 | `style.header.text-offset` | style | switchable | ⟡ `header-text-offset` | **off** | **off** |
| 66 | `style.accent-bar.box` | style | switchable | `width: var(--accent-bar-width); bottom: var(--accent-bar-bottom); background: var(--accent)` | **off** | **off** |
| 67 | `style.header-icon.size` | style | switchable | `width: var(--icon-size); height: var(--icon-size)` | **off** | `width: 24px; height: 24px` |
| 68 | `style.header-icon.color` | style | switchable | ⟡ `status-active` | **off** | ⟡ `icon-color` |
| 69 | `style.header-icon.offset` | style | switchable | ⟡ `header-text-offset` | **off** | **off** |
| 70 | `style.title.font` | style | default | ⟡ `type-title` | ⟡ `type-title` | ⟡ `type-title` |
| 71 | `style.title.color` | style | switchable | **off** | **off** | ⟡ `fg` |
| 72 | `style.title.letter-spacing` | style | switchable | `0` | **off** | `0rem` |
| 73 | `style.preheader.font` | style | switchable | ⟡ `type-body` | **off** | **off** |
| 74 | `style.preheader.color` | style | switchable | ⟡ `fg` | **off** | **off** |
| 75 | `style.description.font` | style | default | ⟡ `type-body` | ⟡ `type-body` | ⟡ `type-body` |
| 76 | `style.description.color` | style | locked | ⟡ `fg-secondary` | ⟡ `fg-secondary` | ⟡ `fg-secondary` |
| 77 | `style.description.letter-spacing` | style | switchable | `0` | **off** | `0.015625rem` |
| 78 | `style.content.color` | style | switchable | ⟡ `fg` | **off** | **off** |
| 79 | `style.content.box` | style | switchable | `margin: var(--content-margin); padding-left: var(--content-padding-left); background: var(--surface)` | **off** | **off** |
| 80 | `style.content.min-height` | style | switchable | ⟡ `content-min-height` | **off** | **off** |
| 81 | `style.content.padding@overflow` | style | switchable | ⟡ `content-overflow-padding` | **off** | **off** |
| 82 | `style.content.scroll-divider` | style | switchable | `border-top: 1px solid transparent; border-bottom: 1px solid transparent` | **off** | **off** |
| 83 | `style.content.scroll-divider@top` | style | switchable | ⟡ `divider` | **off** | **off** |
| 84 | `style.content.scroll-divider@bottom` | style | switchable | ⟡ `divider` | **off** | **off** |
| 85 | `style.actions.padding` | style | default | ⟡ `actions-padding` | **off** | `24px 0 0` |
| 86 | `style.actions.gap` | style | default | ⟡ `actions-gap` | `8px` | `8px` |
| 87 | `style.close-button.position` | style | switchable | `top: 0; right: 0` | `top: 16px; right: 16px` | **off** |
| 88 | `style.close-button.shape` | style | switchable | **off** | ⟡ `radius-close` | **off** |
| 89 | `style.close-button.glyph-size` | style | switchable | **off** | `width: 16px; height: 16px; flex-shrink: 0; pointer-events: none` | **off** |
| 90 | `style.close-button.opacity` | style | switchable | **off** | `0.7` | **off** |
| 91 | `style.close-button.opacity@hover` | style | switchable | **off** | `1` | **off** |
| 92 | `style.close-button.focus` | style | switchable | **off** | `outline: none; box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--ring)` | **off** |
| 93 | `style.close-button.transition` | style | switchable | **off** | `opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)` | **off** |
| 94 | `style.panel.status@info` | style | switchable | `--status-active: var(--status-info)` | **off** | **off** |
| 95 | `style.panel.status@error` | style | switchable | `--status-active: var(--status-error)` | **off** | **off** |
| 96 | `style.panel.status@warning` | style | switchable | `--status-active: var(--status-warning)` | **off** | **off** |
| 97 | `style.panel.status@success` | style | switchable | `--status-active: var(--status-success)` | **off** | **off** |

<details><summary>Citations — 187 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.scrim` | salt | Dialog.tsx ConditionalScrimWrapper renders <Scrim fixed> around the floating component when showComponent && !disableScrim |
| `structure.scrim` | shadcn | dialog.tsx DialogOverlay, rendered unconditionally inside DialogContent's DialogPortal |
| `structure.scrim` | m3 | tokens/versions/latest/sass/_md-comp-scrim.scss — its OWN token file, and its own canonical row in docs/COMPONENTS.md |
| `structure.header-decoration` | salt | DialogHeader.css .saltDialogHeader-withAccent::before, applied when !disableAccent && !status; when a status IS set the bar is dropped and a <StatusIndicator status={status}/> renders in its place (DialogHeader.tsx) |
| `structure.header-decoration` | shadcn | CONFIRMED ABSENCE — DialogHeader is `flex flex-col gap-2 text-center sm:text-left` and nothing else; there is no accent bar, icon slot or status glyph anywhere in dialog.tsx |
| `structure.header-decoration` | m3 | with-icon-icon-size 24px + with-icon-icon-color -> secondary; M3's dialog decoration is an optional glyph above the headline, not a bar |
| `structure.preheader` | salt | DialogHeaderProps.preheader -> <Text color="primary"> rendered inside the <H2> |
| `structure.preheader` | shadcn | no equivalent slot |
| `structure.preheader` | m3 | no equivalent token. The deprecated subhead-* family is a RENAMED headline, not a second line above it ('Tokens deprecated to align taxonomy with full-screen dialogs. Please use md.comp.dialog.headline.… instead'). |
| `structure.header-actions` | salt | DialogHeaderProps.actions -> <div className={withBaseName("actionsContainer")}> |
| `structure.header-actions` | shadcn | no header-level action region; the close X is positioned against the CONTENT, not the header |
| `structure.header-actions` | m3 | header-action-* tokens exist only in _md-comp-full-screen-dialog.scss, which is out of scope |
| `structure.close-button` | salt | DialogCloseButton is a separate export the consumer adds; site/src/examples/dialog/Default.tsx has none, CloseButton.tsx adds one |
| `structure.close-button` | shadcn | dialog.tsx DialogContent({ showCloseButton = true }) renders a DialogPrimitive.Close with an XIcon unless switched off |
| `structure.close-button` | m3 | CONFIRMED ABSENCE — no close/dismiss token in _md-comp-dialog.scss in either edition |
| `structure.content-scroller` | salt | DialogContent.tsx renders .saltDialogContent wrapping .saltDialogContent-inner (overflow-y: auto), with a ResizeObserver overflow check and an onScrollCapture handler |
| `structure.content-scroller` | shadcn | CONFIRMED ABSENCE — children are direct grid items of DialogContent; no scroll container, no overflow detection, no scroll dividers |
| `structure.content-scroller` | m3 | no content or scroll token |
| `structure.actions` | salt | DialogActions.tsx |
| `structure.actions` | shadcn | dialog.tsx DialogFooter |
| `structure.actions` | m3 | the action-* token family (action-label-text-*, action-{hover,focus,pressed}-state-layer-*) — declared in the generated file and then listed under $unsupported-tokens by material-web's own wrapper because 'actions are spec'd as standard text buttons' |
| `structure.description` | salt | DialogHeaderProps.description -> <Text color="secondary" className={withBaseName("description")}> |
| `structure.description` | shadcn | dialog.tsx DialogDescription (Radix Description, rendered as a <p>) |
| `structure.description` | m3 | the supporting-text-* token family |
| `behavior.aria-modal` | salt | Dialog.tsx line 154: aria-modal="true" on the FloatingComponent |
| `behavior.aria-modal` | shadcn | CONFIRMED ABSENCE, and deliberate: primitives/packages/react/dialog/src/dialog.tsx sets role="dialog" but never aria-modal, with the source comment 'aria-hide everything except the content (better supported equivalent to setting aria-modal)' |
| `behavior.aria-modal` | m3 | [R] — tokens-only clone, no component to grep. APG's dialog (modal) pattern specifies aria-modal="true" on the dialog element. |
| `behavior.background-suppression` | salt | Dialog.tsx focusManagerProps={{ context, initialFocus, outsideElementsInert: true }} — floating-ui's FloatingFocusManager applies the platform `inert` attribute to everything outside the dialog |
| `behavior.background-suppression` | shadcn | primitives dialog.tsx DialogContentModal: `const content = contentRef.current; if (content) return hideOthers(content)` — the aria-hidden package, which sets aria-hidden="true" on every sibling. Pointer suppression is separate (disableOutsidePointerEvents on DismissableLayer). |
| `behavior.background-suppression` | m3 | [R] — APG's own note that aria-modal support is uneven and that hiding background content is the reliable fallback. Recorded as the same mechanism shadcn chose, not as Salt's inert. |
| `behavior.focus-trap` | salt | FloatingFocusManager via useFloatingUI's DefaultFloatingComponent; documented in site/docs/components/dialog/accessibility.mdx (Tab wraps from last to first) |
| `behavior.focus-trap` | shadcn | primitives dialog.tsx DialogContentImpl wraps the layer in <FocusScope asChild loop trapped={trapFocus}>; DialogContentModal passes trapFocus={context.open} |
| `behavior.focus-trap` | m3 | [R] — APG dialog-modal: Tab and Shift+Tab cycle within the dialog. |
| `behavior.initial-focus` | salt | DialogProps.initialFocus?: ComponentProps<typeof FloatingFocusManager>["initialFocus"] — a tabbable index or a ref, default 0 |
| `behavior.initial-focus` | shadcn | FocusScope's onMountAutoFocus default; Radix exposes onOpenAutoFocus as an escape hatch but no index prop, so there is no Salt-style initialFocus ordinal |
| `behavior.initial-focus` | m3 | [R] — APG: focus moves to the first focusable element unless the author specifies otherwise. No M3 API exists to specify an ordinal, so the Salt-style `configurable` value is not claimed. |
| `behavior.focus-return` | salt | FloatingFocusManager returnFocus default; accessibility.mdx: 'When the dialog is closed, focus will return to the element that triggered the dialog' |
| `behavior.focus-return` | shadcn | primitives dialog.tsx DialogContentModal onCloseAutoFocus: `event.preventDefault(); context.triggerRef.current?.focus()` — an EXPLICIT restore, not a library default |
| `behavior.focus-return` | m3 | [R] — APG: focus returns to the element that invoked the dialog. |
| `behavior.dismiss-escape` | salt | Dialog.tsx useDismiss(context, { outsidePress: !disableDismiss }) — escapeKey is floating-ui's default and is never disabled here; accessibility.mdx documents Escape explicitly |
| `behavior.dismiss-escape` | shadcn | DismissableLayer's onEscapeKeyDown -> onDismiss -> context.onOpenChange(false) |
| `behavior.dismiss-escape` | m3 | [R] — APG dialog-modal keyboard interaction. |
| `behavior.dismiss-outside` | salt | Dialog.tsx useDismiss(context, { outsidePress: !disableDismiss }); disableDismiss defaults to undefined, so outsidePress is true |
| `behavior.dismiss-outside` | shadcn | DismissableLayer pointerdown-outside -> onDismiss. Two guards in DialogContentModal: right-click and ctrl+left-click are prevented (`if (isRightClick) event.preventDefault()`), and onFocusOutside is prevented so a focusout while trapped cannot dismiss. |
| `behavior.dismiss-outside` | m3 | [R] — m3.material.io states a basic dialog is dismissed by tapping the scrim. Recorded as [R] because there is no component in this clone to confirm it. |
| `behavior.scroll-lock` | salt | Dialog.tsx passes lockScroll to FloatingComponent -> useFloatingUI.tsx usePreventScroll({ isDisabled: !lockScroll \|\| !open }) -> usePreventScroll.ts preventScrollStandard(): documentElement.style.overflow = 'hidden' plus paddingRight = window.innerWidth - documentElement.clientWidth |
| `behavior.scroll-lock` | shadcn | primitives dialog.tsx wraps the modal overlay in <RemoveScroll> (react-remove-scroll) |
| `behavior.scroll-lock` | m3 | [R] — implied by the modal pattern; no token or code to grep. |
| `behavior.described-by` | salt | CONFIRMED ABSENCE — no aria-describedby anywhere in packages/core/src/dialog. Salt's description is visible text with no programmatic association. |
| `behavior.described-by` | shadcn | primitives dialog.tsx: aria-describedby={context.descriptionPresent ? concatAriaDescribedby(ariaDescribedby, context.descriptionId) : ariaDescribedby} — wired only when a Description is actually mounted. The one system of the three that does this. |
| `behavior.described-by` | m3 | [R] — APG associates the supporting text with the dialog via aria-describedby. Note this puts M3 with shadcn and against Salt, which wires no describedby at all. |
| `behavior.exit-animation` | salt | Dialog.tsx useEffect keeps showComponent true for `300); // var(--salt-duration-perceptible)` after open flips false, and onAnimationEnd unmounts early if the animation finishes first |
| `behavior.exit-animation` | shadcn | Radix Presence keeps the content mounted while data-state="closed" plays data-[state=closed]:animate-out fade-out-0 zoom-out-95 at duration-200 |
| `behavior.exit-animation` | m3 | no motion token of any kind in _md-comp-dialog.scss, so no exit is claimed. Declared absence, not an assumed zero. |
| `behavior.scroll-region-focusable` | salt | DialogContent.tsx overflowProps = isOverflowing ? { role: "region", tabIndex: 0, "aria-labelledby": headerId ?? dialogId } : {} |
| `behavior.scroll-region-focusable` | shadcn | no scroll region exists, so there is nothing to make focusable |
| `behavior.scroll-region-focusable` | m3 | no scroll region concept in the token file |
| `prop.size` | salt | DialogProps.size?: "small" \| "medium" \| "large", default "medium". Listed DEFAULT FIRST, per the convention select.shadcn.json set with ["default", "sm"] — the skeleton and the harness both take value[0] as the resting state, so a size-ordered list would have made every Salt dialog render small by default against source. |
| `prop.size` | shadcn | CONFIRMED ABSENCE on Dialog. Its sibling alert-dialog.tsx DOES take size?: "default" \| "sm" (data-[size=sm]:max-w-xs) — one of the structural reasons alert-dialog is a separate canonical row. |
| `prop.size` | m3 | no size token; M3 sizes a basic dialog by its min/max width alone |
| `prop.status` | salt | DialogProps.status?: ValidationStatus -> status-indicator/ValidationStatus.ts ValidationStatusValues = [error, warning, success, info]. FOUR values, unlike Salt's own Input/Dropdown which take Omit<ValidationStatuses,"info">. |
| `prop.status` | shadcn | no status/tone axis of any kind |
| `prop.status` | m3 | no status/error token anywhere in _md-comp-dialog.scss — unusual for M3, which tokenises error states heavily on its text fields and selects |
| `prop.disable-dismiss` | salt | DialogProps.disableDismiss?: boolean — 'Prevent the dialog closing on click away'. Escape is unaffected. |
| `prop.disable-dismiss` | shadcn | no prop; a consumer prevents onPointerDownOutside per instance instead |
| `prop.disable-scrim` | salt | DialogProps.disableScrim?: boolean — 'Prevent Scrim from rendering' |
| `prop.disable-scrim` | shadcn | DialogOverlay is rendered unconditionally by DialogContent — removing it is a source edit, not an instance toggle. Same class of expressibility gap as shadcn's always-on tooltip arrow. |
| `prop.disable-scrim` | m3 | the scrim is a separate component/token set, not a dialog flag |
| `prop.disable-accent` | salt | DialogHeaderProps.disableAccent?: boolean; the withAccent class needs !disableAccent && !status, so a status also removes the bar |
| `prop.disable-accent` | shadcn | no accent decoration to disable |
| `prop.show-close-button` | salt | no such prop — Salt's close button is an opt-in component, not a flag on the dialog |
| `prop.show-close-button` | shadcn | dialog.tsx has TWO props of this name: DialogContent's showCloseButton defaults to TRUE (renders the corner X), DialogFooter's defaults to FALSE (renders a composed <Button variant="outline">Close</Button>) |
| `state.content-overflow` | salt | DialogContent.tsx isOverflowing / canScrollUp / canScrollDown -> -overflow / -scrollTop / -scrollBottom classes |
| `state.content-overflow` | shadcn | no overflow detection anywhere in dialog.tsx |
| `state.close-button-interaction` | salt | DialogCloseButton.css declares only position/top/right; every interaction state belongs to the composed Button (DECLARED COMPOSITION) |
| `state.close-button-interaction` | shadcn | dialog.tsx close button: opacity-70 at rest, hover:opacity-100, focus:ring-2 focus:ring-offset-2, data-[state=open]:bg-accent, disabled:pointer-events-none |
| `state.close-button-interaction` | m3 | no close button to have states |
| `style.scrim.z-index` | salt | Scrim.css z-index: calc(var(--salt-zIndex-drawer) - 1) -> foundations/zindex.css zIndex-drawer 1200, so 1199 — deliberately one below the drawer layer and 101 below the modal layer the panel uses |
| `style.scrim.z-index` | shadcn | dialog.tsx DialogOverlay z-50 — a bare Tailwind stacking index, not a declared token |
| `style.scrim.z-index` | m3 | no z-index token; docs/foundations/layers.md records that only Salt has a shared stacking scale |
| `style.scrim.animation` | salt | CONFIRMED ABSENCE — Scrim.css has no animation or transition rule at all |
| `style.scrim.animation` | shadcn | dialog.tsx DialogOverlay data-[state=open]:animate-in data-[state=open]:fade-in-0 |
| `style.scrim.animation` | m3 | no motion token |
| `style.panel.background` | shadcn | dialog.tsx DialogContent bg-background |
| `style.panel.color` | salt | CONFIRMED ABSENCE — .saltDialog declares no color; DialogContent does (style.content.color) and the header inherits currentColor |
| `style.panel.color` | shadcn | ambient --foreground; DialogContent sets no text-colour class of its own |
| `style.panel.color` | m3 | no panel-level text token — M3 colours the headline (on-surface) and supporting text (on-surface-variant) individually |
| `style.panel.border` | salt | Dialog.css border: var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-tertiary-borderColor). size-fixed-100 is 1px on the FIXED scale, density-invariant by design (docs/foundations/sizes.md), so the literal is correct at every density. The colour goes through the --status-active indirection so the status rows recolour it. |
| `style.panel.border` | shadcn | dialog.tsx DialogContent bare `border` -> --border; the 1px is Tailwind's undeclared default |
| `style.panel.border` | m3 | CONFIRMED ABSENCE — no outline/border token; an M3 dialog is elevation-only, exactly as its menu is (SELECT-MATRIX.md finding 5) |
| `style.panel.shape` | shadcn | dialog.tsx rounded-lg = --radius-lg = --radius = 0.625rem |
| `style.panel.shadow` | shadcn | dialog.tsx shadow-lg; [R] value, see the shadow-lg provenance entry |
| `style.panel.shadow` | m3 | [R] CSS derived from container-elevation level3 (6dp) + shadow #000; see the shadow-level3 and material-web-disowns-elevation provenance entries |
| `style.panel.padding` | shadcn | dialog.tsx DialogContent p-6 |
| `style.panel.padding` | m3 | [R] — no spacing token exists in either edition; m3.material.io's basic-dialog spec, 24dp all round |
| `style.panel.gap` | salt | Salt spaces its parts with per-part padding, not a container gap; adding one would double every seam |
| `style.panel.gap` | shadcn | dialog.tsx DialogContent gap-4 — the single rhythm between header, body and footer, since it is a grid |
| `style.panel.gap` | m3 | [R] — spec's headline-to-supporting-text step, applied as the panel rhythm since M3 has no per-part spacing token |
| `style.panel.width` | salt | width IS the size axis here — see style.panel.size@small/@medium/@large |
| `style.panel.width` | shadcn | dialog.tsx DialogContent w-full |
| `style.panel.width` | m3 | [R] — no width token; the panel fills up to its max-width |
| `style.panel.min-width` | salt | no floor declared |
| `style.panel.min-width` | shadcn | no min-w utility |
| `style.panel.min-width` | m3 | [R] — m3.material.io basic-dialog spec. The only system of the three that declares a floor. |
| `style.panel.max-width` | salt | no absolute cap — the size classes set a percentage width |
| `style.panel.max-width` | shadcn | dialog.tsx sm:max-w-lg = 32rem at >=640px; below that only max-w-[calc(100%-2rem)] applies — see the media-gap provenance entry |
| `style.panel.max-width` | m3 | [R] — m3.material.io basic-dialog spec. Wider than shadcn's 32rem/512px. |
| `style.panel.max-height` | salt | set per size, not globally — see the size rows |
| `style.panel.max-height` | shadcn | CONFIRMED ABSENCE — no max-h utility at all; a long shadcn dialog grows past the viewport and its docs solve it per instance |
| `style.panel.max-height` | m3 | no height token |
| `style.panel.overflow` | salt | Dialog.css overflow-y: auto on .saltDialog itself, IN ADDITION to the inner content scroller — two nested scroll containers |
| `style.panel.overflow` | shadcn | no overflow utility |
| `style.panel.overflow` | m3 | no overflow token |
| `style.panel.z-index` | salt | Dialog.css z-index: var(--salt-zIndex-modal) -> foundations/zindex.css 1300 |
| `style.panel.z-index` | shadcn | dialog.tsx DialogContent z-50 — the SAME index as its own overlay; the panel wins on DOM order |
| `style.panel.z-index` | m3 | no z-index token |
| `style.panel.outline` | salt | no outline declaration; the platform default applies |
| `style.panel.outline` | shadcn | dialog.tsx DialogContent outline-none — Radix focuses the panel itself when nothing tabbable is inside |
| `style.panel.animation` | salt | Dialog.css .saltDialog-enterAnimation { animation: var(--salt-animation-fade-in-center) } -> fade-in-center 300ms ease-in-out; the keyframe body is opacity 0 -> 1 only |
| `style.panel.animation` | shadcn | dialog.tsx data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 + duration-200 |
| `style.panel.animation` | m3 | [R] — no motion token in _md-comp-dialog.scss; borrowed from docs/foundations/motion.md's medium2 (300ms) + standard easing, a principled placeholder rather than a fabrication. The same treatment TOOLTIP-MATRIX.md gave M3's tooltip entrance. |
| `style.panel.animation@exit` | salt | Dialog.css .saltDialog-exitAnimation { animation: var(--salt-animation-fade-out-back) } -> fade-out-back 300ms ease-in-out both. Despite the name, foundations/animation.css's fade-out-back keyframe is opacity 1 -> 0 with NO transform. |
| `style.panel.animation@exit` | shadcn | dialog.tsx data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 |
| `style.panel.animation@exit` | m3 | no exit claimed — see the no-motion-token provenance entry |
| `style.panel.size@small` | salt | Dialog.css .saltDialog-small-lg |
| `style.panel.size@small` | shadcn | no size axis on Dialog |
| `style.panel.size@medium` | salt | Dialog.css .saltDialog-medium-lg (the default size) |
| `style.panel.size@large` | salt | Dialog.css .saltDialog-large-lg |
| `style.header.padding` | shadcn | DialogHeader has no padding utility; the panel's p-6 supplies it |
| `style.header.padding` | m3 | no header token; the panel's 24px covers it |
| `style.header.gap` | shadcn | no decoration to gap from — DialogHeader's gap is a COLUMN gap, carried by style.header.text-gap |
| `style.header.gap` | m3 | [R] — spec's icon-to-headline step |
| `style.header.text-gap` | shadcn | dialog.tsx DialogHeader `flex flex-col gap-2` — the title-to-description step, and shadcn's only header gap |
| `style.header.text-gap` | m3 | [R] — spec's headline-to-supporting-text step. Twice shadcn's 8px and four times Salt's 4px at medium: M3 gives a dialog's title far more air than either. |
| `style.header.text-offset` | shadcn | no optical offset; Salt's is a density formula with no shadcn equivalent |
| `style.accent-bar.box` | salt | DialogHeader.css .saltDialogHeader-withAccent::before { content: ""; position: absolute; top: 0; left: 0; bottom: var(--salt-spacing-300); width: var(--salt-size-bar); background: var(--salt-sentiment-accent-background) } — position/top/left live in the template's base, the three theme values here |
| `style.accent-bar.box` | m3 | no accent-bar concept |
| `style.header-icon.size` | salt | DialogHeader.css --icon-size: var(--salt-text-h2-lineHeight) on the composed StatusIndicator |
| `style.header-icon.size` | m3 | with-icon-icon-size: 24px, a hardcoded literal in both editions and density-invariant (M3 has no density capability) |
| `style.header-icon.color` | salt | DECLARED COMPOSITION: the glyph itself belongs to StatusIndicator/semantic-icon-provider. Only the colour source is modelled, and it rides the SAME indirection the panel border reads, so one status reassignment moves both. |
| `style.header-icon.color` | m3 | with-icon-icon-color -> md-sys-color.$secondary |
| `style.header-icon.offset` | salt | DialogHeader.css repeats calc((var(--salt-size-base) - var(--salt-text-h2-lineHeight)) / 2) on the StatusIndicator, the identical expression the text container uses |
| `style.header-icon.offset` | m3 | no optical offset token |
| `style.title.font` | shadcn | dialog.tsx DialogTitle text-lg leading-none font-semibold |
| `style.title.color` | salt | CONFIRMED ABSENCE — <H2> is given no color prop, so Text.css's --text-color default (currentColor) applies and the title inherits |
| `style.title.color` | shadcn | CONFIRMED ABSENCE — DialogTitle has no text-colour class; it inherits the panel's ambient --foreground |
| `style.title.color` | m3 | headline-color -> on-surface. The ONLY system of the three that tokenises the dialog title's colour. |
| `style.title.letter-spacing` | salt | Text.css .saltText letter-spacing: var(--salt-text-letterSpacing) -> next/characteristics/text.css: 0 |
| `style.title.letter-spacing` | shadcn | no tracking utility |
| `style.title.letter-spacing` | m3 | headline-small-tracking = 0rem — declared and zero, not absent |
| `style.preheader.font` | salt | the preheader is a plain .saltText nested inside the H2; Text.css's heading rule is `h2.saltText, .saltText-h2.saltText`, which a nested span does not match, so the body ramp wins |
| `style.preheader.color` | salt | <Text color="primary"> -> .saltText-primary -> content-primary-foreground |
| `style.description.font` | shadcn | dialog.tsx DialogDescription text-sm |
| `style.description.color` | shadcn | dialog.tsx DialogDescription text-muted-foreground |
| `style.description.letter-spacing` | salt | Text.css .saltText letter-spacing |
| `style.description.letter-spacing` | m3 | body-medium-tracking |
| `style.content.color` | salt | DialogContent.css color: var(--salt-content-primary-foreground) |
| `style.content.color` | shadcn | no content part |
| `style.content.box` | salt | DialogContent.css margin-left: spacing-200; margin-right: spacing-300; padding-left: spacing-100; background: var(--salt-container-primary-background) — the background is re-declared on the body wrapper in source and is reproduced rather than dropped |
| `style.content.scroll-divider` | salt | DialogContent.css .saltDialogContent-inner border-top/border-bottom: var(--salt-size-fixed-100) var(--salt-borderStyle-solid) transparent. size-fixed-100 = 1px, density-invariant. The transparent reserve is the point: the box does not jump when a divider appears. |
| `style.content.scroll-divider` | m3 | the with-divider-divider-* pair is a STATIC divider variant, deprecated in favour of the standalone divider component, and is not Salt's scroll-conditional rule — see the divider-declared-off provenance entry |
| `style.content.scroll-divider@top` | salt | DialogContent.css .saltDialogContent-scrollTop.saltDialogContent-inner { border-top-color: var(--salt-separable-tertiary-borderColor) } |
| `style.content.scroll-divider@bottom` | salt | DialogContent.css .saltDialogContent-scrollBottom.saltDialogContent-inner { border-bottom-color: var(--salt-separable-tertiary-borderColor) } |
| `style.actions.padding` | shadcn | DialogFooter has no padding; the panel's p-6 and gap-4 do the work |
| `style.actions.padding` | m3 | [R] — spec's supporting-text-to-actions step; no token exists |
| `style.actions.gap` | shadcn | dialog.tsx DialogFooter gap-2 |
| `style.actions.gap` | m3 | [R] — spec's between-actions step; no token exists |
| `style.close-button.position` | salt | DialogCloseButton.css .saltButton.saltDialogCloseButton { position: absolute; top: 0; right: 0 } — flush into the panel corner, with NO inset, over the panel's own padding |
| `style.close-button.position` | shadcn | dialog.tsx close button `absolute top-4 right-4` — a full 16px inset, where Salt pins its close flush at 0/0 |
| `style.close-button.position` | m3 | no close button |
| `style.close-button.shape` | salt | DECLARED COMPOSITION — the corner belongs to the composed Button |
| `style.close-button.shape` | shadcn | dialog.tsx rounded-xs; [R], see the radius-close provenance entry |
| `style.close-button.glyph-size` | salt | DECLARED COMPOSITION — the glyph box belongs to the composed Button + semantic-icon-provider CloseIcon |
| `style.close-button.glyph-size` | shadcn | dialog.tsx [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 [&_svg]:pointer-events-none. Density-invariant — shadcn has no density capability. |
| `style.close-button.opacity` | salt | no opacity rule; appearance="transparent" is a Button appearance, not a dimming |
| `style.close-button.opacity` | shadcn | dialog.tsx opacity-70 |
| `style.close-button.opacity@hover` | shadcn | dialog.tsx hover:opacity-100 |
| `style.close-button.focus` | salt | DECLARED COMPOSITION — Button supplies its own focus ring |
| `style.close-button.focus` | shadcn | dialog.tsx focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background — a 2px ring sitting outside a 2px offset painted in the background colour, expressed here as the two-layer box-shadow Tailwind compiles it to |
| `style.close-button.transition` | salt | no transition in DialogCloseButton.css |
| `style.close-button.transition` | shadcn | dialog.tsx transition-opacity |
| `style.panel.status@info` | salt | Dialog.css .saltDialog-info { border-color: var(--salt-status-info-borderColor) } |
| `style.panel.status@info` | shadcn | no status axis |
| `style.panel.status@info` | m3 | no status axis |
| `style.panel.status@error` | salt | Dialog.css .saltDialog-error |
| `style.panel.status@warning` | salt | Dialog.css .saltDialog-warning |
| `style.panel.status@success` | salt | Dialog.css .saltDialog-success |

</details>

<!-- END GENERATED VALUES -->
