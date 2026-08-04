<!-- docs
title: The component map
nav: Component map
badge: Map
group: Reference
description: All 79 canonical components, and what each of the three systems calls them.
-->

# Master component list — cross-referenced across all three systems

*Built by listing each design system's own component directories/token
families directly from the clones (not shadcn's list treated as
canonical), then merging into one union. Where a system names or shapes
the same idea differently, the mapping is noted — that mapping IS matrix
work, not a detail to skip. Source: `ui/apps/v4/registry/new-york-v4/ui/`,
`salt-ds/packages/{core,lab,date-components}/src/`,
`material-web/tokens/{*.scss,versions/v0_192/*.scss}` (component token
family names, consolidated — M3's token files split one component into
many files per variant/size, e.g. `fab-primary-large.scss`; those are
**variants of one component**, not separate components).

Legend: ✓ = present, name shown if it differs from the row's canonical
name · — = absent in that system · *(family)* = the system splits this
into multiple sub-parts/variants, consolidated here.

## Actions

| canonical | shadcn | Salt | M3 |
|---|---|---|---|
| button | ✓ button | ✓ button | ✓ *(filled/outlined/text/elevated/filled-tonal)-button* |
| icon-button | — (button variant) | — (button variant) | ✓ *(filled/outlined)-icon-button* |
| button-group | ✓ | — | — |
| toggle | ✓ toggle | ✓ toggle-button | — |
| toggle-group | ✓ | ✓ toggle-button-group | ✓ outlined-segmented-button |
| fab (floating action button) | — | — | ✓ *(fab, fab-branded, fab-primary/secondary/tertiary/surface × large/small, extended-fab-\*)* |
| link | — (native `<a>`) | ✓ link, link-card | — |

## Forms & inputs

| canonical | shadcn | Salt | M3 |
|---|---|---|---|
| input | ✓ | ✓ input, multiline-input, number-input, pill-input | ✓ *(filled/outlined)-text-field*, filled-field/outlined-field |
| textarea | ✓ | — (multiline-input) | — (text-field multiline) |
| label | ✓ | — (form-field) | — |
| field (label+control+help wrapper) | ✓ | ✓ form-field, form-field-legacy | — |
| checkbox | ✓ | ✓ | ✓ |
| radio-group | ✓ | ✓ radio-button | ✓ radio, radio-button |
| switch | ✓ | ✓ | ✓ |
| slider | ✓ | ✓ | ✓ |
| select | ✓ | ✓ dropdown, list-box, list-control | ✓ *(filled/outlined)-select* |
| native-select | ✓ | — | — |
| combobox | ✓ | ✓ combo-box, combo-box-deprecated | ✓ *(filled/outlined)-autocomplete* |
| input-group | ✓ | ✓ pill-input | — |
| input-otp | ✓ | — | — |
| formatted/tokenized input | — | ✓ formatted-input, tokenized-input(-next) | — |
| search | — (input variant) | ✓ search-input | ✓ search-bar, search-view |
| file-drop-zone | — | ✓ | — |
| color picker | — | ✓ color-chooser | — |
| form (validation wrapper) | ✓ | — | — |

## Feedback & status

| canonical | shadcn | Salt | M3 |
|---|---|---|---|
| alert | ✓ | ✓ banner | ✓ banner |
| alert-dialog | ✓ | — (dialog variant) | ✓ full-screen-dialog (partial) |
| progress (linear) | ✓ | ✓ | ✓ linear-progress(-indicator) |
| progress (circular) | — (spinner only) | ✓ CircularProgress | ✓ circular-progress(-indicator) |  <!-- CORRECTED 2026-08-02 during the progress build: this row previously read "— (spinner)" for Salt. salt-ds/packages/core/src/progress/CircularProgress/ ships CircularProgress.tsx + .css, determinate (value prop, unconditional aria-valuenow, no indeterminate branch). Salt's INDETERMINATE circular is Spinner, which is the separate row below — the two are not the same component. shadcn's dash is correct: its only progress export is the linear progress.tsx. SECOND CORRECTION, same day: that first fix put the values in the WRONG COLUMNS — CircularProgress was written under `shadcn` and the dash under `Salt`, exactly inverted. The header order is canonical | shadcn | Salt | M3. Caught by re-reading the rendered row rather than the diff; a cell edit in a wide markdown table is easy to land one column off, and nothing in the pipeline validates that a table cell sits under its intended header. -->
| spinner | ✓ | ✓ | — (= circular-progress) |
| sonner / toast | ✓ sonner | ✓ toast, toast-group | ✓ snackbar |
| tooltip | ✓ | ✓ tooltip, toggletip | ✓ plain-tooltip, rich-tooltip |
| status indicator/adornment | — | ✓ status-indicator, status-adornment | — (icon+color convention) |
| system status | — | ✓ content-status, system-status | — |
| empty (state) | ✓ | — | — |
| skeleton | ✓ | — | — |

## Overlays

| canonical | shadcn | Salt | M3 |
|---|---|---|---|
| dialog | ✓ | ✓ | ✓ |
| drawer | ✓ | ✓ | ✓ navigation-drawer, sheet-side |
| sheet | ✓ | ✓ side-panel | ✓ sheet-bottom, sheet-floating, sheet-side |
| popover | ✓ | ✓ overlay | — (menu/tooltip cover this) |
| hover-card | ✓ | — | ✓ rich-tooltip (closest) |
| dropdown-menu | ✓ | ✓ menu, cascading-menu, menu-button | ✓ menu, menu-item, *(filled/outlined/standard)-menu-button* |
| context-menu | ✓ | ✓ menu (context mode) | ✓ menu |
| scrim (overlay backdrop) | — (part of dialog) | ✓ scrim | ✓ scrim |

## Navigation

| canonical | shadcn | Salt | M3 |
|---|---|---|---|
| tabs | ✓ | ✓ tabs (core+lab) | ✓ *(primary/secondary)-(navigation-)?tab* |
| breadcrumb | ✓ breadcrumb | ✓ breadcrumbs | — |
| navigation-menu | ✓ | ✓ vertical-navigation, mega-menu, navigation-item | ✓ navigation-bar, navigation-rail, navigation-drawer |
| pagination | ✓ | ✓ | ✓ (list-item pattern, no dedicated component) |
| sidebar | ✓ | ✓ side-panel (partial) | — |
| top-app-bar / toolbar | — | ✓ toolbar | ✓ *(small/medium/large/small-centered)-top-app-bar* |
| menubar | ✓ | — (menu covers it) | — |
| bottom-app-bar | — | — | ✓ |
| skip-link | — | ✓ | — |

## Data display

| canonical | shadcn | Salt | M3 |
|---|---|---|---|
| table | ✓ | ✓ | ✓ data-table |
| card | ✓ | ✓ card, interactable-card | ✓ *(filled/outlined/elevated)-card* |
| avatar | ✓ | ✓ | — (image convention) |
| badge | ✓ | ✓ | ✓ |
| separator | ✓ | ✓ divider | ✓ divider |
| accordion | ✓ | ✓ | — |
| collapsible | ✓ | ✓ | — |
| carousel | ✓ | — | ✓ carousel-item |
| chart | ✓ | — | — |
| kbd | ✓ | ✓ | — |
| list | — (raw markup) | ✓ list, list-box, list-deprecated, list-next, static-list | ✓ list, list-item |
| tag / pill | — (badge) | ✓ tag, pill | ✓ chip family (assist/filter/input/suggestion) |
| item (generic row) | ✓ | — | ✓ item |
| aspect-ratio | ✓ | — | — |
| resizable | ✓ | — | — |
| scroll-area | ✓ | — | — |
| metric (stat display) | — | ✓ | — |
| logo | — | ✓ | — |
| attachment | ✓ | — | — |
| message / message-scroller / bubble | ✓ | — | — |

## Date & time

| canonical | shadcn | Salt | M3 |
|---|---|---|---|
| calendar | ✓ | ✓ | ✓ date-picker-docked |
| date-picker | — (composed) | ✓ | ✓ date-picker-modal, date-input-modal |
| time-picker | — | — | ✓ time-input, time-picker |

## Layout primitives (Salt- and M3-only categories, no shadcn equivalent — shadcn expects Tailwind/CSS for this)

| canonical | shadcn | Salt | M3 |
|---|---|---|---|
| stack/flex/flow/grid/split/border layout | — | ✓ (6 layout components + \*-item parts) | — |
| panel | — | ✓ panel, side-panel | — |
| direction (RTL/LTR helper) | ✓ | — | — |

## Behavior-only / not a visual component (excluded from the matrix pipeline)

Ripple (M3, a state-layer effect), focus-ring (M3, style primitive),
aria-announcer / breakpoints / salt-provider / localization-provider
(Salt, providers/hooks), form (validation logic), portal / responsive /
focus-manager / common-hooks (Salt lab, utilities). These are chassis
concerns, not rows in the component pipeline.

## What this settles

- **The union is ~70 canonical components**, not 63 (shadcn's count) —
  shadcn's own list undercounts by omitting layout primitives (Salt),
  the fab family, top-app-bar/navigation-rail/bottom-app-bar, chips, and
  time-picker (all M3), and several Salt-only inputs (color-chooser,
  file-drop-zone, formatted/tokenized-input).
- **M3's token files split by variant, not by component** — `fab`,
  `fab-primary-large`, `extended-fab-tertiary` etc. are ~20 files for
  ONE canonical `fab` component. Consolidating this correctly is itself
  matrix work: each variant becomes a `prop` row (emphasis/size axis),
  not a separate component.
- **Some canonical rows have no shared name anywhere** — M3's
  `top-app-bar`, `navigation-rail`, `bottom-app-bar`, `search-bar`, and
  Salt's six layout primitives exist in only one system each. These
  still get a full matrix (their own column filled, the other two
  columns "not applicable") — per the rule, absence is data, not a
  reason to drop the row.
- **Order for phase 2** (per-component matrices): start with rows that
  have real cross-system character in ≥2 systems (button, input, select,
  dialog, tabs, card, badge, tooltip, progress, chip/tag) before the
  single-system ones — that's where the translator earns its keep first.
