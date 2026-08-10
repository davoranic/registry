# Table — component template matrix

*Twenty-fourth live component in the post-clean-slate pipeline (button,
calendar, spinner, tooltip, alert, input, select, dialog, tabs, card, badge,
progress, chip, checkbox, switch, radio-group, slider, toast, dropdown-menu,
accordion, popover, combobox, toggle-group came before). Canonical id
`table`, matching `1-intro/content/04-component-map.md`'s Data display row:
`table | ✓ | ✓ | ✓ data-table` — all three systems have it, and this is the
first component in this pipeline whose real per-system row count is
DELIBERATELY kept small relative to how large a real table/data-grid
component family can grow (card was 90 rows, select was 113) — see the
scope note below for why.*

## 0 · Scope

### The scope decision, made before any grep, and confirmed by every grep after

Real table/data-grid components in production design systems can balloon
into an enormous surface: sorting, pagination, row selection, column
resizing, virtualization, sticky headers/columns, expandable rows. This
build's scope is DELIBERATELY NARROW, per the owner's own scoping
instruction: **the static structural/visual table** — root, header, body,
footer, row, header-cell, body-cell, caption, and the STYLE of those parts
(borders, padding, striping, hover/selected/disabled row states, alignment,
sticky-header/-footer where a system genuinely has it, density/sizing) —
NOT a full data-grid feature set.

### IN SCOPE

Real DOM structure (does the system use a real `<table>`/`<thead>`/
`<tbody>`/`<tfoot>`/`<tr>`/`<th>`/`<td>`/`<caption>`, or a div-based grid? —
answer, confirmed by reading all three sources: EVERY column already uses
real, native semantic table elements, a first for the structural spine of
this pipeline), caption, header/body/footer sections, cell alignment,
row hover/selected/disabled VISUAL states (the CSS hook only — see below),
striping (zebra), borders/dividers, sticky header/footer where a system's
own real source genuinely has it, and a handful of `prop` rows for the
per-system axes that are genuinely first-class, typed capabilities (Salt's
own `variant`/`zebra`/`divider`/`textAlign`/`sticky` props — the only system
of the three with ANY table-level props at all, a real, notable and
intentional finding, not an oversight — shadcn's whole philosophy for this
component is compose-with-className, and M3 has no live component to carry
props in the first place).

### OUT OF SCOPE, with a structural reason

| excluded | where | structural reason |
|---|---|---|
| Sorting (logic, not the visual hook) | n/a | None of the three real BASE table primitives implement working sort logic. shadcn's own docs (`content/docs/components/base/data-table.mdx`) state directly: *"So instead of a data-table component, I thought it would be more helpful to provide a guide on how to build your own,"* built on `@tanstack/react-table` — EXTERNAL, UNVENDORED (confirmed: `apps/v4/package.json:52` lists it, no `node_modules/@tanstack/react-table` anywhere under `3-source/`) — the identical boundary DROPDOWN-MENU-MATRIX.md/POPOVER-MATRIX.md/COMBOBOX-MATRIX.md/TOGGLE-GROUP-MATRIX.md already recorded for their own external dependencies. Salt has zero sort concept anywhere in `packages/core/src/table/`. M3's pinned token file has exactly ONE sort-adjacent key at all — `header-hover-sorting-icon-button-color`, a colour token for a HYPOTHETICAL sorting icon button's hover state, with no accompanying size/structure/aria-sort tokens of any kind — real evidence of designed INTENT, zero implementation to model. |
| Pagination | n/a | Same TanStack boundary for shadcn (its own `data-table-pagination.tsx` example composes TanStack's page-model API). Salt/M3: no pagination component or token anywhere in either source for THIS component (M3's own component map lists pagination as "no dedicated component" for the whole design system, not specific to tables). |
| Row-selection ENGINE (checkbox column, `onRowSelect`, select-all) | see `behavior.row-selection` | See the finding below — a real, reachable STYLE HOOK exists (shadcn) and real DESIGNED tokens exist (M3), but no system's base table primitive implements a working selection engine. Documented as a capability, not built as a feature. |
| Column resizing | n/a | No resize handle, cursor token, or resize event exists in any of the three real sources for this component. |
| Virtualization | n/a | No windowing/virtualization concept in any of the three real sources; this is an application-level concern layered on top of whichever rendering library a consumer chooses, not a table-component capability. |
| Expandable / nested rows | see Finding 1 | shadcn's own base `TableRow` DOES carry a real, reachable `has-aria-expanded:bg-muted/50` style hook — structurally the SAME shape as the row-selection hook (consumer/external-engine-driven) — but expand/collapse logic itself is, again, TanStack's job, not the base primitive's. Neither Salt nor M3 has any equivalent concept. |
| Column resizing/reordering, sticky COLUMNS (as opposed to sticky header/footer ROWS) | n/a | No system's real source models a sticky/frozen COLUMN concept for this component (Salt's own `sticky` props are header/footer-row-scoped only). |

### A genuinely simple, load-bearing capability that IS in scope, because it's cheap and real

`prop.sticky-header`/`prop.sticky-footer` (Salt only, two real, independent
booleans, `position: sticky` — cheap, structurally simple, and a real,
sourced capability, not a feature engine) and the row-selection/row-disabled
STYLE HOOKS (see `behavior.row-selection`, `state.row.selected`,
`state.row.disabled`) — documenting that a real, reachable attribute-driven
style hook exists (shadcn) or that real, designed colour tokens exist (M3)
is fundamentally different from building the selection ENGINE that would
set that hook, matching CLAUDE.md's own instruction that documenting a real
capability the consumer wires is not the same as building a feature.

---

## Sources

- **Salt** `[S]`: `packages/core/src/table/{Table.tsx,Table.css,TableContext.ts,
  TableContainer.tsx,THead.tsx,TBody.tsx,TFoot.tsx,TR.tsx,TH.tsx,TD.tsx,
  index.ts}` — all eleven files read in full (a REAL, live, canonical
  component — not deprecated, no `-deprecated` sibling exists, confirmed by
  directory listing of `packages/core/src/`). `packages/core/stories/table/
  table.stories.tsx` (confirms real caption usage, THead/TFoot's own
  independent `sticky`/`divider`/`variant` prop wiring, and custom-cell
  composition). Resolution through `packages/theme/css/next/characteristics/
  {content,container,separable,text}.css`, `next/palette/{background,
  foreground,alpha,corner}.css`, `next/foundations/{color,typography}.css`,
  `foundations/{size,spacing,curve}.css`.
- **shadcn** `[S]`: `apps/v4/registry/new-york-v4/ui/table.tsx` — the
  CANONICAL base primitive, all 117 lines read in full (`Table`/
  `TableHeader`/`TableBody`/`TableFooter`/`TableRow`/`TableHead`/
  `TableCell`/`TableCaption`). `content/docs/components/base/{table,
  data-table}.mdx` and `apps/v4/registry/new-york-v4/examples/
  data-table-demo.tsx` plus `app/(app)/examples/tasks/components/
  data-table*.tsx` and `registry/new-york-v4/blocks/dashboard-01/
  components/data-table.tsx` read for the real TanStack-Table boundary
  (behavior.row-selection, slot.composes) — NOT canonical structure/style
  source, cited only for the external-dependency finding and the real
  `data-state={row.getIsSelected() && "selected"}` wiring. `apps/v4/
  package.json:52` confirms `@tanstack/react-table` as an installed but
  UNVENDORED dependency. `radix-ui`/`primitives/` are NOT relevant here —
  unlike dropdown-menu/popover/combobox/toggle-group, `table.tsx` is plain
  markup with Tailwind classes, no Radix primitive underneath it at all.
- **Material 3** `[S, tokens-only]`: `tokens/versions/v0_192/
  _md-comp-data-table.scss` — read in full, and diffed directly against
  `tokens/versions/latest/sass/_md-comp-data-table.scss` (the latest
  edition renames the export format from a Sass map function to flat
  `$variables` and adds several `@deprecated` legacy tokens —
  `row-item-divider-thickness`/`-color`, `footer-outlined-select-text-field-
  container-height` — none present in the pinned v0.192 edition and none
  modelled here). NO LIVE component exists anywhere in the clone for this
  row — confirmed by an exhaustive directory listing (`find ... -iname
  "*data-table*" -o -iname "*datatable*"` outside `tokens/`: zero hits) — a
  genuine divergence from toggle-group's own real `labs/segmentedbutton{,
  set}/` source; every structure/behavior row here is `[R]` by necessity,
  the same tokens-only treatment badge's/card's/checkbox's/radio-group's
  own M3 columns already use for THEIR structure rows.
  `testing/table/internal/test-table.ts` was read in full and REJECTED as a
  source — it is material-web's own internal visual-regression TEST
  scaffold (a generic Lit harness for rendering arbitrary state/template
  grids for screenshot testing), not a public data-table component; citing
  it would have been the exact "confirmed absence, don't invent one" trap
  CLAUDE.md warns against, inverted (inventing a component that doesn't
  really serve consumers). Resolution through `versions/v0_192/
  {_md-sys-color.scss,_md-sys-shape.scss,_md-sys-state.scss,
  _md-sys-typescale.scss,_md-ref-palette.scss,_md-ref-typeface.scss}`.
  Cross-referenced against columns already resolved in this registry:
  `surface`/`on-surface` (calendar.m3.json), `on-surface-variant`
  (checkbox.m3.json), `outline-variant` (card.m3.json/tabs.m3.json),
  `surface-container-highest` (card.m3.json) — all hexes reused verbatim,
  not re-derived.

### Edition pin — `v0.192`, per CLAUDE.md's standing decision, and a real one this time

Unlike toggle-group's own no-op pin, this one moves real ground: the
`latest` edition RENAMES the whole export shape (map-function -> flat
`$variables`) and ADDS several deprecated legacy tokens (a divider-based
row treatment predating the current outline-based one, plus an
outlined-select footer control height) that do not exist in the pinned
v0.192 edition at all. None of the added/renamed tokens changes a VALUE
this column cites — every token this column actually resolves
(`header-container-height`, `row-item-container-height`, `outline-color`,
etc.) is byte-identical in both editions; the pin only affects tokens this
narrow build's own scope never reaches (deprecated aliases for a divider
mechanism this build's `style.row.divider` row already models via the
current, non-deprecated `outline` token family instead).

---

## 1 · Structure

| row | policy | salt | shadcn | m3 |
|---|---|---|---|---|
| `structure.container` | locked | `div` — `TableContainer.tsx` returns a real `<div>`, forwarding the table's own `id` as `aria-labelledby` via `TableContext` [S] | `div` — `Table()`'s own render literally wraps `<table>` in `<div data-slot="table-container" className="relative w-full overflow-x-auto">` [S] | `div` [R] — no live component; the standard responsive horizontal-scroll wrapper convention, presumed |
| `structure.root` | locked | `table` — `Table.tsx`'s own `<table id={tableId} ...>` [S] | `table` — `Table()`'s own `<table data-slot="table" className="w-full caption-bottom text-sm">` [S] | `table` [R] — token namespace presumes conventional semantics; no live element |
| `structure.header` | locked | `thead` — `THead.tsx`, a dedicated component with its own `sticky`/`divider`/`variant` props [S] | `thead` — `TableHeader()`'s own `<thead data-slot="table-header" className="[&_tr]:border-b">` [S] | `thead` [R, tokens] — `header-container-*`/`header-headline-*` presume a distinct region |
| `structure.body` | locked | `tbody` — `TBody.tsx` [S] | `tbody` — `TableBody()`'s own `<tbody data-slot="table-body" className="[&_tr:last-child]:border-0">` [S] | `tbody` [R, tokens] — `row-item-*` presumes a body region |
| `structure.footer` | locked | `tfoot` — `TFoot.tsx`, a dedicated component with its OWN independent `sticky`/`divider`/`variant` props [S] | `tfoot` — `TableFooter()`'s own `<tfoot data-slot="table-footer" className="border-t bg-muted/50 font-medium [&>tr]:last:border-b-0">` [S] | `tfoot` [S, tokens] — `footer-container-color`/`-height`/`footer-supporting-text-*`, a real, distinct namespace |
| `structure.row` | locked | `tr` — `TR.tsx`, reused identically inside thead/tbody/tfoot [S] | `tr` — `TableRow()`'s own `<tr data-slot="table-row" ...>`, likewise reused across all three sections [S] | `tr` [R, tokens] — `row-item-container-height` presumes a uniform row concept |
| `structure.header-cell` | locked | `th` — `TH.tsx`, own `textAlign` prop [S] | `th` — `TableHead()`'s own `<th data-slot="table-head" className="h-10 px-2 text-left ...">` [S] | `th` [R, tokens] — `header-headline-*` presumes a distinct header-cell role |
| `structure.body-cell` | locked | `td` — `TD.tsx`, own `textAlign` prop [S] | `td` — `TableCell()`'s own `<td data-slot="table-cell" className="p-2 align-middle ...">` [S] | `td` [R, tokens] — `row-item-label-text-*` presumes a distinct body-cell role |
| `structure.caption` | switchable | real, plain native `<caption>` as children — NO dedicated Caption sub-component (`table.stories.tsx`'s own `<Table ...><caption>Sample data table</caption>...</Table>`) [S] | real, dedicated `TableCaption` component (`<caption data-slot="table-caption" className="mt-4 text-sm text-muted-foreground">`) [S] | **off** — CONFIRMED ABSENCE, the pinned token file has no caption/title namespace at all [S] |

### The real anatomy convergence — every column already uses genuine native table elements

Unlike select's/combobox's own popup-based anatomy or dialog's own
overlay-portal anatomy, EVERY structural row above converges on the
identical real semantic element (or, for M3, the reasoned presumption of
one) — the first component in this pipeline where the structural SPINE
itself, not just a leaf control, agrees across all three systems from the
start. Character in this component lives almost entirely in `style`/`prop`/
`state`, not `structure` — a genuinely different shape from toggle-group's
own matrix, whose sharpest finding WAS a structural divergence
(`structure.selected-marker`).

## 2 · Behavior

| row | policy | salt | shadcn | m3 |
|---|---|---|---|---|
| `behavior.overflow-region` | switchable | REAL, dynamic — `TableContainer.tsx`'s own `checkOverflow()` (`scrollHeight > clientHeight \|\| scrollWidth > clientWidth`), driven by a real `useResizeObserver` + `useIsomorphicLayoutEffect`-on-mount, promotes the wrapper to `role="region"` + `tabIndex=0` + `aria-labelledby` (forwarded from the table's own id) ONLY while genuinely overflowing [S] | **off** — CONFIRMED ABSENCE, the wrapper is unconditionally `overflow-x-auto` with no role/tabIndex/measurement of any kind, confirmed reading `Table()`'s own five-line render in full [S] | **off** [R] — no live source to confirm any JS overflow-sensing mechanism; presumed absent rather than assumed present |
| `behavior.row-selection` | switchable | **off** — CONFIRMED ABSENCE, no selection concept anywhere in `packages/core/src/table/` (every file read in full) [S] | real, REACHABLE style hook (`data-[state=selected]:bg-muted`), wired by an EXTERNAL, unvendored engine (TanStack's `row.getIsSelected()`, confirmed directly in `data-table.tsx:103`/`dashboard-01/.../data-table.tsx:321`) — no built-in engine in the base primitive itself [S] | real, DESIGNED tokens (`row-item-selected-container-color`/`row-item-unselected-container-color`/hover-state-layer pairs), zero live wiring — genuine intent, zero implementation [S, tokens] |

### Finding 1 — the headline scope finding: a real style hook vs. a real capability with no engine, inverted from toggle-group's own type-artifact shape

`behavior.row-selection` is this matrix's version of TOGGLE-GROUP-MATRIX.md's
own Salt multi-select finding, but the polarity is REVERSED. There, a TYPE
SIGNATURE (Salt's `Value` type permitting an array) over-promised a
capability the runtime never delivered. Here, shadcn's `data-[state=selected]`
class hook is genuinely REAL and REACHABLE — it is not a dead artifact, it
is proven live-wired by TanStack's own example code — but it requires an
EXTERNAL engine outside this component's own scope to ever fire. M3's own
selected/unselected/disabled ROW tokens are real, deliberate DESIGN INTENT
(distinct colour roles for a state no live M3 component can ever produce,
since material-web ships no data-table component at all). Salt has neither
the hook nor the intent — a clean, confirmed absence. This chassis threads
the needle exactly as CLAUDE.md's own scoping instruction asks: the STYLE
HOOK (a `selected`/`disabled` prop on `TableRow` that sets a real data
attribute, styled per-column where a real rule exists) is built and
demonstrated STATICALLY; the SELECTION ENGINE (click-to-toggle, a checkbox
column, `onRowSelect`) is not.

## 3 · Prop

| row | policy | note |
|---|---|---|
| `prop.variant` | switchable | Salt ONLY `["primary","secondary","tertiary"]`, SOURCE-DEFAULT-FIRST (`variant?: ...`, default `"primary"`) [S]. shadcn/M3: **off**, no tone-variant axis in either source. |
| `prop.zebra` | switchable | Salt ONLY `[false,true]`, SOURCE-DEFAULT-FIRST (`zebra?: boolean`, default `false`) [S] — see Finding 2, a real DEAD-CODE discovery this row's own cascade surfaced. shadcn/M3: **off**, no alternating-row concept in either source. |
| `prop.divider` | switchable | Salt ONLY `["tertiary","primary","secondary","none"]` at the TABLE ROOT (governs the body row divider, source default `"tertiary"`) [S] — THead/TFoot each carry their OWN independent `divider` prop (both defaulting to `"primary"`), a real per-region axis cited directly in `style.header.divider`/`style.footer.divider`'s own notes rather than duplicated as a second/third config row (a declared simplification for scope control). shadcn/M3: **off**, a fixed utility class / a single fixed token, no variant family in either. |
| `prop.align` | switchable | Salt ONLY `["left","right"]`, SOURCE-DEFAULT-FIRST, a real TYPED prop on BOTH `TH` and `TD` (`textAlign?: "left"\|"right"`, default `"left"`) [S] — see Finding 3 for why shadcn's own real capability doesn't qualify as a first-class prop by this row's own test. shadcn: **off** — a real capability exists via arbitrary `className` (e.g. `text-right`), but NOT as a typed, validated prop [S]. M3: **off** — CONFIRMED ABSENCE, no alignment token anywhere in the pinned file [S]. |
| `prop.sticky-header` | switchable | Salt ONLY `[false,true]`, SOURCE-DEFAULT-FIRST (`THeadProps.sticky?: boolean`, default `false`) [S]. shadcn/M3: **off**, confirmed absence in both. |
| `prop.sticky-footer` | switchable | Salt ONLY `[false,true]`, SOURCE-DEFAULT-FIRST (`TFootProps.sticky?: boolean`, default `false`) [S] — a genuinely INDEPENDENT prop from `prop.sticky-header` (two separate booleans on two separate real components). shadcn/M3: **off**, same reasoning. |

### Finding 2 — a real dead-CSS discovery in Salt's own zebra mechanism

Resolving `prop.zebra`/`style.row.zebra` surfaced a genuine defect in
Salt's OWN shipped source, the same class of finding TOGGLE-GROUP-MATRIX.md
and several prior matrices have each found once in a different design
system. `Table.css` defines FOUR zebra selectors:
`.saltTable-zebra-tertiary`, `.saltTable-primary.saltTable-zebra`,
`.saltTable-secondary.saltTable-zebra`, `.saltTable-tertiary.saltTable-zebra`.
But `Table.tsx`'s own class-list construction —
`{ [withTableBaseName("zebra")]: zebra }` — NEVER concatenates `zebra` with
a variant suffix; it only ever emits a bare `saltTable-zebra` class. The
selector `.saltTable-zebra-tertiary` (note: no `-primary`/`-secondary`
sibling of THIS shape exists either — it is the ONLY one written this way)
can therefore never match any DOM this component actually renders — dead
CSS, confirmed by reading the whole class-construction call in full. The
THREE reachable rules are the ones combining `saltTable-{variant}` WITH the
bare `saltTable-zebra` class (both independently real). This column's own
`style.row.zebra` cell cites the REACHABLE rule at the source-default
`variant="primary"` (odd rows -> `container-secondary-background`), not the
unreachable one.

### Finding 3 — a real absence-vs-capability line, drawn the opposite way from toggle-group's own version of the same test

`prop.align` required deciding whether shadcn's own real ability to
right-align a cell (`className="text-right"`) counts as the SAME kind of
capability Salt's typed `textAlign` prop represents. It does not, by this
matrix's own test (a genuinely first-class, VALIDATED prop vs. arbitrary
untyped composition) — the identical test TOGGLE-GROUP-MATRIX.md applied to
Salt's own `Value` type, just landing on the opposite side of the line: there
a typed signature over-promised a capability that didn't work; here an
UNtyped capability under-claims relative to a typed sibling that does the
same visible thing. Recorded honestly rather than silently granting shadcn
a `prop.align` row it doesn't structurally earn.

## 4 · Slot

| row | note |
|---|---|
| `slot.header-cell-content` | Consumer-owned column label text, all three. Salt/shadcn: plain `children: ReactNode`. M3 [R]: presumed text content, no live component to confirm the exact API shape. |
| `slot.body-cell-content` | Consumer-owned, all three — genuinely UNCONSTRAINED in Salt/shadcn (arbitrary JSX, not just text; confirmed by `table.stories.tsx`'s own custom-cell examples and shadcn's own `data-table.tsx` rendering a `<Checkbox>`/`<DropdownMenu>` inside a cell). M3 [R]: presumed text content. |
| `slot.caption-content` | Salt/shadcn: consumer-owned. M3: off, no caption concept exists to hold content. |
| `slot.composes` | DECLARED COMPOSITION: shadcn -> `@tanstack/react-table` (external, unvendored) for sorting/pagination/filtering/row-selection, plus a real `checkbox` component (an already-built canonical row) composed into the selection column shown in its own examples. Salt -> its own site examples compose `Table` inside `FlexLayout`/`StackLayout` (Salt-only layout primitives, unbuilt canonical rows). M3 -> MD3's own real product convention composes a data table with icon-buttons for sort affordances (evidenced only by `header-hover-sorting-icon-button-color` existing at all) and pagination controls. None of the three modelled here. |

## 5 · State

| row | policy | note |
|---|---|---|
| `state.row.hover` | switchable | A REAL, notable divergence — see Finding 4. Salt: **off** (no `:hover` rule anywhere in `Table.css`, confirmed by a case-insensitive grep of the whole file — zero matches). shadcn: real, `hover:bg-muted/50`. M3: real, and richer than either sibling — BOTH selected AND unselected rows carry their OWN distinct hover-state-layer token pair. |
| `state.row.selected` | switchable | Salt: off (confirmed absence). shadcn: real, reachable, external-engine-driven (see Finding 1). M3: real, designed tokens, no live wiring (see Finding 1). |
| `state.row.disabled` | switchable | A genuine three-way split where the TOKENS-ONLY source is the one with real evidence and both LIVE sources confirm absence — see Finding 5. M3: real, dedicated tokens (`row-item-disabled-label-text-color`/`-opacity` = 0.38). Salt/shadcn: off, confirmed absence in both. |

### Finding 4 — Salt's table has no hover mechanism at all, a first for this pipeline's own Salt columns

Every other Salt column built in this pipeline so far has had SOME real
interactive hover treatment on its primary actionable surface. `Table.css`
does not — grepped case-insensitively for "hover" across the ENTIRE file:
zero matches. A plain, non-interactive Salt table row renders identically
whether or not the pointer is over it. This is a real, structural
statement about Salt's own design intent for this component (a table is
treated as primarily an INFORMATIONAL surface, not an actionable one,
unless a consumer layers interactivity on top themselves), not an
oversight this build is inferring.

### Finding 5 — M3's disabled-row intent exists only as a token, confirming the value of building even a tokens-only column honestly

`state.row.disabled` is a rare shape in this pipeline: the ONE column with
NO live component (M3) is the ONLY column with any real evidence for this
row at all. `row-item-disabled-label-text-color`/`-opacity` (0.38, the same
convention every other M3 column's disabled text uses) prove real, deliberate
design intent for a disabled row — even though material-web ships no
component that could ever apply it. Both Salt and shadcn, despite being
LIVE, fully-readable components, have no disabled-row concept anywhere.
Recording M3's token-only intent here, rather than dismissing it for lack
of a live component to point at, is the same "absence is data, presence
is data too" discipline the six-segment method asks for uniformly.

## 6 · Style — see the generated `Resolved values` block below for every
cell. Selected findings:

### Findings (continued)

6. **A worthwhile correction of this session's OWN first-draft
   expectation, caught by actually running the gate rather than trusting
   the prediction: `check-structure.py`'s gate B does NOT flag
   `table/shadcn`'s own `structure.body`/`style.body.row-height` pairing**
   (shadcn's row height is genuinely implicit from padding + line-height,
   no explicit token — see `style.body.row-height`'s own note), even
   though that looked like a plausible false-positive candidate before the
   gate actually ran. The gate's real, sole flag for this component is
   `table/salt`'s own `structure.caption` (see Finding 10, below) — a
   different row entirely. Recorded here as a small, concrete instance of
   CLAUDE.md's own standing warning that a gate's behaviour must be
   confirmed by running it, not inferred from reading its source.

7. **A real "same raw token, two unrelated purposes" coincidence, the SAME
   shape this pipeline has now found in several prior columns.** Salt's
   `style.header-cell.divider` (the vertical rule between adjacent header
   cells) and `style.row.divider`'s own SOURCE DEFAULT (the horizontal rule
   under every body row) both resolve to the IDENTICAL raw token,
   `separable-tertiary-borderColor` — confirmed by reading both rules
   directly rather than assuming a shared "divider" concept links them
   architecturally. They do not: one is driven by the ROOT's own `divider`
   prop (default `"tertiary"`), the other is a hardcoded literal in the
   `th + th::before` rule with no prop of its own at all. The numeric
   coincidence is real; the mechanism is not shared.

8. **M3's header and footer text roles are visually near-identical (both
   14px/20px) but structurally DIFFERENT typescale FAMILIES, while Salt's
   and shadcn's own header/footer text treatments diverge from each other
   in the opposite direction.** M3: `header-headline-*` resolves through
   `title-small` (500 weight, 0.1px tracking) while `footer-supporting-
   text-*` resolves through `body-medium` (400 weight, 0.25px tracking,
   the SAME family the body cell itself uses) — a real, sourced FAMILY
   split hiding behind an identical pixel size. Salt: the footer BOLDS
   the same plain body scale the body cell uses (`text-fontWeight-strong`)
   while the header switches to an entirely separate LABEL role
   (`text-label-fontSize`/`-lineHeight`, genuinely smaller by density) —
   the inverse shape, where Salt's header is the odd one out and Salt's
   footer matches the body's own size family. shadcn: header and footer
   both simply inherit the table's own `text-sm`, with only a shared
   `font-medium` weight bump distinguishing them from the body — the
   simplest of the three, and the only one where header/footer/body all
   share one literal type scale.

9. **`check-anatomy.mjs` flags `table` with `⚠ identical part-set:
   salt=shadcn` (9 parts, 8 shared, 0 system-unique) — explained here, per
   the gate's own rule that a convergence must be answerable with data, not
   trust.** Unlike every prior convergence this pipeline has explained
   (radio-group/slider/switch/tabs/spinner/toggle-group), this one is not a
   coarse-measure artifact hiding real per-value divergence underneath —
   it is a GENUINE, direct consequence of this component's own scope note
   (see "The real anatomy convergence" under Structure, above): all three
   systems already use real, native `<table>`/`<thead>`/`<tbody>`/`<tfoot>`/
   `<tr>`/`<th>`/`<td>` elements, a first for the structural SPINE of this
   pipeline (not just a leaf control, the way toggle-group's own `<button>`
   convergence worked). The gate's own M3 column is `off` for
   `structure.caption` (the one structural row that DOES diverge), which is
   exactly why the reported set is salt=shadcn rather than all three —
   confirming the gate is reading real signal, not a measurement blind spot.

10. **`check-structure.py`'s gate B flags `table/salt`'s own
    `structure.caption` as "rendered with no dimensions" — a calibrated
    false positive, matching the exact shape CLAUDE.md already documents
    this gate producing (the identical shape toggle-group/shadcn's and
    toggle-group/m3's own `structure.group` false positives already
    established for THIS gate).** A `<caption>` is inline text content; it
    legitimately sizes to its own text plus the table's own width, the SAME
    "a part may legitimately size to its own content" exception the gate's
    own docstring names. Not a real gap — `style.caption.text` IS a real,
    modelled style row for both Salt and shadcn; gate B's own narrow check
    (sizing-property rows specifically) simply does not look at typography.

### Live verification performed this session

Playwright/Chromium (`/opt/pw-browsers/chromium-1194`, confirmed reachable
before relying on it — this session did NOT assume "no browser access"
without checking first) driven directly against `out/table-check.html` and
`out/conformance.html`. This found and fixed TWO real, live-only defects
neither the generator nor a source-level reading would have caught:

- **A real CSS scoping bug in `style.row.zebra`'s own selector.** The first
  draft's selector, `[data-slot="table-row"]:nth-of-type(odd)`, had no
  gate on the `data-zebra` attribute at all and no scope to the BODY
  specifically — it striped every odd `<tr>` unconditionally, including
  header/footer rows, and did so even when `zebra` was never requested.
  Confirmed live: a Salt table rendered with no `zebra` prop showed uniform
  `rgb(255, 255, 255)` backgrounds across all 8 rows (correct, expected)
  until the SAME harness page's zebra-demo stage revealed every row —
  including ones outside `tbody` — striping regardless of the prop, which
  traced back to the unscoped selector. Fixed to
  `[data-slot="table-root"][data-zebra] [data-slot="table-body"]
  [data-slot="table-row"]:nth-of-type(odd)`, matching Salt's own real
  `tbody tr:nth-of-type(odd)` scope. Re-verified live: the non-zebra stage
  now renders uniform backgrounds (8/8 rows `rgb(255, 255, 255)`) and the
  zebra stage now renders the correct alternating pattern (odd rows
  `rgb(245, 247, 248)`, even rows `rgb(255, 255, 255)`), an exact match to
  Salt's real reachable rule at the source-default variant (see Finding 2).
- **A real architectural bug in this session's OWN harness test (not the
  skeleton) for `prop.sticky-header`/`prop.sticky-footer`, caught only by
  actually scrolling a real DOM.** The first draft of the sticky-header
  demo wrapped the skeleton's own `table-container` (which already carries
  `overflow-x: auto`) inside an ADDITIONAL, external `overflow:auto` div
  for the height constraint. Two nested scroll containers broke
  `position: sticky` — the `<thead>`'s sticky positioning anchored to the
  table-container `div` (the NEAREST ancestor with a non-`visible` overflow
  value), which never itself scrolls, so the header just moved with the
  content instead of pinning. Confirmed by measurement: scrolling the outer
  box by 200px moved the header's own `getBoundingClientRect().top` by the
  full 200px (a header that isn't actually sticking behaves identically to
  one with no `position: sticky` rule at all). This is exactly Salt's OWN
  real usage pattern too (`TableContainer` itself carries the height
  constraint in `table.stories.tsx`'s own `<TableContainer style={{
  height: '300px' }}>` — never an extra wrapper outside it), so the fix was
  to give `Table` a `containerStyle` prop applied directly to
  `structure.container`, removing the redundant outer wrapper. Re-verified
  live: after the fix, scrolling the SAME 200px leaves the header's/
  footer's own bounding rect completely unchanged (pinned to the
  container's own top/bottom), confirmed for both `stickyHeader` and
  `stickyFooter` simultaneously.

`harness/conformance.tsx`'s new `checkTable()` — 13 assertions per column
(39 total across salt/shadcn/m3): every structural part renders with the
correct tag scoped to its own mount (`structure.container`/`.root`/
`.header`/`.body`/`.footer`/`.row`/`.header-cell`/`.body-cell`/`.caption`),
`prop.align` resolves correctly (real prop-driven right-alignment for Salt,
registry-default left for shadcn/M3 even when `align="right"` is
requested), `behavior.overflow-region` correctly promotes the wrapper to
`role="region"`+`tabIndex=0` on a genuinely overflowing table for Salt only,
and `state.row.selected`/`.disabled` correctly differ (or correctly do NOT
differ) from a rest-state sibling's own computed background/opacity, with
the expectation read from `table-panel.json`'s own generated per-cell
`kind` rather than hardcoded per system — passed 39/39 live in the browser
after the two fixes above, bringing the harness total to 317 (39 new), with
**ZERO failures anywhere in the whole suite**. Real column geometry was
also confirmed directly (`getBoundingClientRect()` on all four header
cells of the full-table demo): four real, non-overlapping widths
(288.9px/244.4px/204.6px/241.1px), not a collapsed or zero-width column
anywhere. A full-page screenshot of `table-check.html` was also taken and
inspected directly for gross rendering defects (giant unconstrained
elements, overlapping text, unstyled fallback fonts) — none found; the
zebra, sticky, selected, and disabled demo stages all render visibly
correctly for all three columns in both densities/modes spot-checked.

<!-- BEGIN GENERATED VALUES — written by scripts/sync-matrix-values.py, do not hand-edit -->

## Resolved values — generated from the columns

*Every row of `contract/templates/table.template.json` against every system, read from `columns/table.*.json`. This block is regenerated by `scripts/sync-matrix-values.py`; the prose above is hand-written. If the two ever disagree, this block is the data and the prose is the claim.*

### Slots

**salt** — 9 light, 7 dark overrides, 4 densities

| slot | light | dark | cited |
|---|---|---|---|
| `fg-header` | rgb(76, 81, 87) | rgb(177, 181, 185) | yes |
| `fg-body` | rgb(0, 0, 0) | rgb(255, 255, 255) | yes |
| `bg-primary` | rgb(255, 255, 255) | rgb(16, 24, 32) | yes |
| `bg-secondary` | rgb(245, 247, 248) | rgb(26, 34, 41) | yes |
| `bg-tertiary` | rgb(250, 248, 242) | rgb(38, 41, 43) | yes |
| `divider-primary` | rgba(0, 0, 0, 0.4) | rgba(255, 255, 255, 0.4) | yes |
| `divider-tertiary` | rgba(0, 0, 0, 0.2) | rgba(255, 255, 255, 0.2) | yes |
| `type-fontFamily` | 'Open Sans', sans-serif | — | **no** |
| `type-fontWeight-strong` | 600 | — | yes |

**shadcn** — 4 light, 4 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `fg-rest` | oklch(0% 0 0) | oklch(0.985 0 0) | yes |
| `muted-bg` | oklch(0.97 0 0) | oklch(0.269 0 0) | yes |
| `muted-fg` | oklch(0.556 0 0) | oklch(0.708 0 0) | yes |
| `border` | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | yes |

**m3** — 8 light, 5 dark overrides

| slot | light | dark | cited |
|---|---|---|---|
| `surface` | #fef7ff | #141218 | yes |
| `on-surface` | #1d1b20 | #e6e0e9 | yes |
| `on-surface-variant` | #49454f | #cac4d0 | yes |
| `outline-variant` | #cac4d0 | #49454f | yes |
| `surface-container-highest` | #e6e0e9 | #36343b | yes |
| `type-fontFamily` | 'Roboto', sans-serif | — | **no** |
| `hover-opacity` | 0.08 | — | yes |
| `disabled-opacity` | 0.38 | — | yes |

### Rows

| # | row | piece | policy | salt | shadcn | m3 |
|---|---|---|---|---|---|---|
| 1 | `structure.container` | structure | locked | `div` | `div` | `div` |
| 2 | `structure.root` | structure | locked | `True` | `True` | `True` |
| 3 | `structure.header` | structure | locked | `True` | `True` | `True` |
| 4 | `structure.body` | structure | locked | `True` | `True` | `True` |
| 5 | `structure.footer` | structure | locked | `True` | `True` | `True` |
| 6 | `structure.row` | structure | locked | `True` | `True` | `True` |
| 7 | `structure.header-cell` | structure | locked | `True` | `True` | `True` |
| 8 | `structure.body-cell` | structure | locked | `True` | `True` | `True` |
| 9 | `structure.caption` | structure | switchable | `True` | `True` | **off** |
| 10 | `behavior.overflow-region` | behavior | switchable | `True` | **off** | **off** |
| 11 | `behavior.row-selection` | behavior | switchable | **off** | `real, reachable data-[state=selected]:bg-muted style hook on TableRow; requires an external row-selection engine (TanStack Table) to set data-state — no built-in ENGINE in the base primitive itself` | `real, DESIGNED colour tokens for a selected-row state (row-item-selected-container-color / row-item-unselected-container-color / row-item-selected-hover-state-layer-*), but no live component exists to wire an actual selection ENGINE into, and no data-attribute convention to cite` |
| 12 | `prop.variant` | prop | switchable | `primary, secondary, tertiary` | **off** | **off** |
| 13 | `prop.zebra` | prop | switchable | `False, True` | **off** | **off** |
| 14 | `prop.divider` | prop | switchable | `tertiary, primary, secondary, none` | **off** | **off** |
| 15 | `prop.align` | prop | switchable | `left, right` | **off** | **off** |
| 16 | `prop.sticky-header` | prop | switchable | `False, True` | **off** | **off** |
| 17 | `prop.sticky-footer` | prop | switchable | `False, True` | **off** | **off** |
| 18 | `slot.header-cell-content` | slot | locked | `children: ReactNode` | `children: ReactNode` | `presumed text content (headline)` |
| 19 | `slot.body-cell-content` | slot | locked | `children: ReactNode, unconstrained (arbitrary JSX)` | `children: ReactNode, unconstrained (arbitrary JSX)` | `presumed text content (label)` |
| 20 | `slot.caption-content` | slot | switchable | `children: ReactNode (plain native <caption>)` | `children: ReactNode` | **off** |
| 21 | `slot.composes` | slot | default | `True` | `True` | `True` |
| 22 | `state.row.hover` | state | switchable | **off** | `real, hover:bg-muted/50` | `real, TWO distinct token pairs (selected/unselected), both resolving to on-surface at 0.08 opacity in this edition` |
| 23 | `state.row.selected` | state | switchable | **off** | `real, reachable style hook, external-engine-driven — see behavior.row-selection` | `real, DESIGNED tokens, no live wiring — see behavior.row-selection` |
| 24 | `state.row.disabled` | state | switchable | **off** | **off** | `real, dedicated tokens — row-item-disabled-label-text-color/-opacity` |
| 25 | `style.root.border` | style | switchable | **off** | **off** | `border-color: var(--outline-variant); border-width: 1px` |
| 26 | `style.root.shape` | style | switchable | ⟡ `table-radius` | **off** | `4px` |
| 27 | `style.root.font` | style | switchable | `font-family: var(--type-fontFamily); font-size: var(--type-fontSize); line-height: var(--type-lineHeight)` | `font-family: inherit; font-size: 0.875rem; line-height: 1.25rem` | **off** |
| 28 | `style.header.background` | style | switchable | ⟡ `bg-primary` | **off** | ⟡ `surface` |
| 29 | `style.header.divider` | style | switchable | ⟡ `divider-primary` | ⟡ `border` | **off** |
| 30 | `style.header.height` | style | locked | ⟡ `row-height` | `40px` | `56px` |
| 31 | `style.header.text` | style | locked | `color: var(--fg-header); font-size: var(--type-label-fontSize); line-height: var(--type-label-lineHeight); font-weight: var(--type-fontWeight-strong)` | `color: var(--fg-rest); font-size: 0.875rem; line-height: 1.25rem; font-weight: 500` | `color: var(--on-surface-variant); font-size: 0.875rem; line-height: 1.25rem; font-weight: 500; font-family: var(--type-fontFamily)` |
| 32 | `style.header-cell.divider` | style | switchable | `content: ""; position: absolute; z-index: 1; display: block; left: 0; width: 1px; top: var(--cell-padding-x); height: calc(100% - (var(--cell-padding-x) * 2)); background: var(--divider-tertiary)` | **off** | **off** |
| 33 | `style.body.row-height` | style | switchable | ⟡ `row-height` | **off** | `52px` |
| 34 | `style.body.text` | style | locked | `color: var(--fg-body); font-size: var(--type-fontSize); line-height: var(--type-lineHeight)` | `color: inherit; font-size: 0.875rem; line-height: 1.25rem` | `color: var(--on-surface); font-size: 0.875rem; line-height: 1.25rem; font-family: var(--type-fontFamily)` |
| 35 | `style.footer.background` | style | locked | ⟡ `bg-primary` | ƒ `color-mix(in oklab, var(--muted-bg) 50%, transparent)` | ⟡ `surface` |
| 36 | `style.footer.text` | style | locked | `color: var(--fg-body); font-size: var(--type-fontSize); line-height: var(--type-lineHeight); font-weight: var(--type-fontWeight-strong)` | `color: var(--fg-rest); font-size: 0.875rem; line-height: 1.25rem; font-weight: 500` | `color: var(--on-surface-variant); font-size: 0.875rem; line-height: 1.25rem; font-weight: 400; font-family: var(--type-fontFamily)` |
| 37 | `style.footer.divider` | style | switchable | ⟡ `divider-primary` | ⟡ `border` | **off** |
| 38 | `style.footer.height` | style | switchable | ⟡ `row-height` | **off** | `52px` |
| 39 | `style.row.background` | style | locked | ⟡ `bg-primary` | `transparent` | ⟡ `surface` |
| 40 | `style.row.divider` | style | locked | ⟡ `divider-tertiary` | ⟡ `border` | ⟡ `outline-variant` |
| 41 | `style.row.hover` | style | switchable | **off** | ƒ `color-mix(in oklab, var(--muted-bg) 50%, transparent)` | ƒ `color-mix(in oklab, var(--on-surface) 8%, var(--surface))` |
| 42 | `style.row.selected` | style | switchable | **off** | ⟡ `muted-bg` | ⟡ `surface-container-highest` |
| 43 | `style.row.disabled` | style | switchable | **off** | **off** | `color: var(--on-surface); opacity: var(--disabled-opacity)` |
| 44 | `style.row.zebra` | style | switchable | ⟡ `bg-secondary` | **off** | **off** |
| 45 | `style.cell.padding` | style | default | `var(--cell-padding-y) var(--cell-padding-x)` | `8px` | `12px 16px` |
| 46 | `style.cell.align` | style | default | `left` | `left` | `left` |
| 47 | `style.caption.text` | style | switchable | **off** | `color: var(--muted-fg); font-size: 0.875rem; margin-top: 1rem` | **off** |

<details><summary>Citations — 125 cells carry a source or note</summary>

| row | system | citation |
|---|---|---|
| `structure.container` | salt | TableContainer.tsx <div ref={handleRef} className={clsx(withTableBaseName("container"), className)} {...overflowProps}> |
| `structure.container` | shadcn | Table(): <div data-slot="table-container" className="relative w-full overflow-x-auto"> |
| `structure.container` | m3 | [R] — no live component; the standard responsive horizontal-scroll wrapper convention, presumed rather than independently confirmable |
| `structure.root` | salt | Table.tsx <table id={tableId} className={clsx(withTableBaseName(), ...)} aria-labelledby={labelledBy} ...> |
| `structure.root` | shadcn | Table(): <table data-slot="table" className="w-full caption-bottom text-sm"> |
| `structure.root` | m3 | [R] — token namespace (header/footer/row-item) presumes a conventional semantic <table>; no live element to cite the literal tag |
| `structure.header` | salt | THead.tsx <thead ref={ref} className={clsx(withTableBaseName("thead"), ...)}> |
| `structure.header` | shadcn | TableHeader(): <thead data-slot="table-header" className="[&_tr]:border-b"> |
| `structure.header` | m3 | [R, tokens] header-container-color/-height/header-headline-* presume a distinct header region |
| `structure.body` | salt | TBody.tsx <tbody ref={ref} className={clsx(withTableBaseName("tbody"), ...)}> |
| `structure.body` | shadcn | TableBody(): <tbody data-slot="table-body" className="[&_tr:last-child]:border-0"> |
| `structure.body` | m3 | [R, tokens] row-item-* tokens presume a body region distinct from header/footer |
| `structure.footer` | salt | TFoot.tsx <tfoot ref={ref} className={clsx(withTableBaseName("tfoot"), ...)}> |
| `structure.footer` | shadcn | TableFooter(): <tfoot data-slot="table-footer" className="border-t bg-muted/50 font-medium [&>tr]:last:border-b-0"> |
| `structure.footer` | m3 | [S, tokens] footer-container-color/-height/footer-supporting-text-* — a real, distinct token namespace |
| `structure.row` | salt | TR.tsx <tr ref={ref} className={clsx(withTableBaseName("tr"), className)}> — reused identically inside thead/tbody/tfoot |
| `structure.row` | shadcn | TableRow(): <tr data-slot="table-row" className="border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted"> |
| `structure.row` | m3 | [R, tokens] row-item-container-height presumes a uniform row concept across header/body/footer |
| `structure.header-cell` | salt | TH.tsx <th ref={ref} className={clsx(withTableBaseName("th"), withTableBaseName("th","align",textAlign), className)}> |
| `structure.header-cell` | shadcn | TableHead(): <th data-slot="table-head" className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"> |
| `structure.header-cell` | m3 | [R, tokens] header-headline-* presumes a distinct header-cell text role |
| `structure.body-cell` | salt | TD.tsx <td ref={ref} className={clsx(withTableBaseName("td"), withTableBaseName("td","align",textAlign), className)}> |
| `structure.body-cell` | shadcn | TableCell(): <td data-slot="table-cell" className="p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"> |
| `structure.body-cell` | m3 | [R, tokens] row-item-label-text-* presumes a distinct body-cell text role |
| `structure.caption` | salt | table.stories.tsx: <Table ...><caption>Sample data table</caption>...</Table> — plain native children, no dedicated Caption component |
| `structure.caption` | shadcn | TableCaption(): <caption data-slot="table-caption" className="mt-4 text-sm text-muted-foreground"> |
| `structure.caption` | m3 | CONFIRMED ABSENCE — the pinned token file (read in full, both editions) has no caption/title namespace of any kind |
| `behavior.overflow-region` | salt | see overflow-region |
| `behavior.overflow-region` | shadcn | CONFIRMED ABSENCE — Table()'s own five-line render has no role/tabIndex/measurement of any kind, just a static overflow-x-auto div |
| `behavior.overflow-region` | m3 | no live source to confirm any JS overflow-sensing mechanism (tokens-only); presumed absent rather than assumed present |
| `behavior.row-selection` | salt | CONFIRMED ABSENCE — see no-selection-rule |
| `behavior.row-selection` | shadcn | see tanstack-selection-wiring |
| `behavior.row-selection` | m3 | see no-sort-pagination-tokens for the contrasting absence on the sort side |
| `prop.variant` | salt | TableProps.variant?: "primary"\|"secondary"\|"tertiary", default "primary" |
| `prop.variant` | shadcn | CONFIRMED ABSENCE — no tone-variant axis in table.tsx |
| `prop.variant` | m3 | CONFIRMED ABSENCE — no tone-variant namespace, only one row-item colour family |
| `prop.zebra` | salt | TableProps.zebra?: boolean, default false |
| `prop.zebra` | shadcn | CONFIRMED ABSENCE — no alternating-row class or prop anywhere |
| `prop.zebra` | m3 | CONFIRMED ABSENCE — no alternating-row concept |
| `prop.divider` | salt | TableProps.divider?: "primary"\|"secondary"\|"tertiary"\|"none", default "tertiary" (root/row level) |
| `prop.divider` | shadcn | CONFIRMED ABSENCE — border-b is a single, fixed utility class, not a switchable prop |
| `prop.divider` | m3 | CONFIRMED ABSENCE — row-item-outline-color/-width are single fixed tokens, no variant family |
| `prop.align` | salt | THProps.textAlign / TDProps.textAlign, both default "left" |
| `prop.align` | shadcn | CONFIRMED ABSENCE of a dedicated, typed align prop — TableHead/TableCell accept only an arbitrary className; text-left is a fixed base class, not a prop-driven axis |
| `prop.align` | m3 | CONFIRMED ABSENCE — no alignment token exists anywhere in the pinned file |
| `prop.sticky-header` | salt | THeadProps.sticky?: boolean, default false |
| `prop.sticky-header` | shadcn | CONFIRMED ABSENCE — no sticky/position string anywhere in table.tsx |
| `prop.sticky-header` | m3 | CONFIRMED ABSENCE — tokens do not carry layout strategy |
| `prop.sticky-footer` | salt | TFootProps.sticky?: boolean, default false |
| `prop.sticky-footer` | shadcn | CONFIRMED ABSENCE — same reasoning as prop.sticky-header |
| `prop.sticky-footer` | m3 | CONFIRMED ABSENCE — same reasoning as prop.sticky-header |
| `slot.header-cell-content` | salt | TH.tsx |
| `slot.header-cell-content` | shadcn | TableHead() |
| `slot.header-cell-content` | m3 | [R] — no live component to confirm the exact API shape |
| `slot.body-cell-content` | salt | TD.tsx; table.stories.tsx's own custom-cell examples |
| `slot.body-cell-content` | shadcn | TableCell(); data-table.tsx's own <Checkbox>/<DropdownMenu> cell content |
| `slot.body-cell-content` | m3 | [R] — no live component to confirm whether richer content is supported |
| `slot.caption-content` | salt | table.stories.tsx |
| `slot.caption-content` | shadcn | TableCaption() |
| `slot.caption-content` | m3 | no caption concept exists to hold content |
| `slot.composes` | salt | site/src/examples/table/ compose Table inside FlexLayout/StackLayout (Salt-only layout primitives, unbuilt canonical rows) — not modelled here |
| `slot.composes` | shadcn | @tanstack/react-table (external, unvendored) for sorting/pagination/filtering/row-selection; a real, separate checkbox component (an already-built canonical row) composed into the selection column shown in data-table.tsx's own examples — neither modelled here, see docs-vs-source |
| `slot.composes` | m3 | MD3's own real product convention composes a data table with icon-buttons for sort affordances (evidenced only by header-hover-sorting-icon-button-color existing at all, see no-sort-pagination-tokens) and pagination controls — neither modelled, both out of scope |
| `state.row.hover` | salt | CONFIRMED ABSENCE — see no-hover-rule |
| `state.row.hover` | shadcn | TableRow() className |
| `state.row.hover` | m3 | see typescale/hover-opacity provenance |
| `state.row.selected` | salt | CONFIRMED ABSENCE — see no-selection-rule |
| `state.row.selected` | shadcn | TableRow() data-[state=selected]:bg-muted |
| `state.row.selected` | m3 | row-item-selected-container-color -> surface-container-highest, a visibly deeper tone than the unselected row's own surface |
| `state.row.disabled` | salt | CONFIRMED ABSENCE — see no-selection-rule |
| `state.row.disabled` | shadcn | CONFIRMED ABSENCE — no disabled: variant anywhere on TableRow |
| `state.row.disabled` | m3 | the SAME 0.38-content convention every other M3 column uses |
| `style.root.border` | salt | CONFIRMED ABSENCE — table.saltTable has border-collapse/border-radius but never a border/outline property on the table element itself |
| `style.root.border` | shadcn | CONFIRMED ABSENCE — no whole-table border class anywhere |
| `style.root.border` | m3 | outline-color -> outline-variant; outline-width: 1px |
| `style.root.shape` | shadcn | CONFIRMED ABSENCE — no rounded/shape class on <table> or its container div |
| `style.root.shape` | m3 | container-shape -> corner-extra-small = 4px |
| `style.root.font` | salt | table.saltTable font-family/font-size/line-height |
| `style.root.font` | shadcn | table.tsx <table className="w-full caption-bottom text-sm"> |
| `style.root.font` | m3 | CONFIRMED ABSENCE of a root-level typography token; typography is defined PER REGION only (header-headline-*, row-item-label-text-*, footer-supporting-text-*), never once at a whole-table level |
| `style.header.background` | shadcn | CONFIRMED ABSENCE — no background class on TableHeader, transparent |
| `style.header.divider` | m3 | CONFIRMED ABSENCE of a header-specific divider token distinct from the general row-item-outline-* family (read in full, both editions) |
| `style.header.height` | shadcn | TableHead() h-10 (per-cell, not a section-level rule) |
| `style.header.height` | m3 | header-container-height |
| `style.header.text` | salt | thead { color: content-secondary-foreground; font-size/-line-height: text-label-*; font-weight: text-label-fontWeight-strong } |
| `style.header.text` | shadcn | TableHead() className: text-foreground font-medium, inheriting the table's own text-sm size |
| `style.header.text` | m3 | header-headline-color -> on-surface-variant; header-headline-font/-size/-line-height/-weight -> md-sys-typescale.title-small |
| `style.header-cell.divider` | salt | table.saltTable th + th::before { background: separable-tertiary-borderColor; width: size-fixed-100; top: spacing-100; height: calc(100% - spacing-200) } |
| `style.header-cell.divider` | shadcn | CONFIRMED ABSENCE — no vertical rule between header cells |
| `style.header-cell.divider` | m3 | CONFIRMED ABSENCE — no vertical rule between header cells in the token vocabulary |
| `style.body.row-height` | shadcn | CONFIRMED ABSENCE of an explicit height/min-height on TableRow — implicit from cell padding + line-height, no declared token |
| `style.body.row-height` | m3 | row-item-container-height |
| `style.body.text` | salt | table.saltTable { color: content-primary-foreground }; td inherits table's own font-size/line-height, no override |
| `style.body.text` | shadcn | TableCell() has no explicit colour class — confirmed by reading its full class string; inherits the ambient foreground |
| `style.body.text` | m3 | row-item-label-text-color -> on-surface; row-item-label-text-font/-size/-line-height -> md-sys-typescale.body-medium |
| `style.footer.background` | shadcn | TableFooter() bg-muted/50 |
| `style.footer.text` | salt | tfoot { color: content-primary-foreground; font-size/-line-height: text-fontSize/-lineHeight (plain body scale); font-weight: text-fontWeight-strong } |
| `style.footer.text` | shadcn | TableFooter() className: font-medium, inheriting the table's own text-sm size |
| `style.footer.text` | m3 | footer-supporting-text-color -> on-surface-variant; footer-supporting-text-font/-size/-line-height/-weight -> md-sys-typescale.body-medium (regular weight, NOT bolded — unlike Salt's own footer) |
| `style.footer.divider` | m3 | CONFIRMED ABSENCE — footer.* namespace has only container.color/container.height/supporting-text.*, no divider/outline key of its own (read in full, both editions) |
| `style.footer.height` | shadcn | CONFIRMED ABSENCE — same implicit-from-padding reasoning as style.body.row-height |
| `style.footer.height` | m3 | footer-container-height — the SAME height as row-item-container-height |
| `style.row.background` | shadcn | TableRow() has no background class at rest — confirmed |
| `style.row.divider` | m3 | row-item-outline-color -> outline-variant; row-item-outline-width: 1px |
| `style.row.hover` | salt | CONFIRMED ABSENCE — see no-hover-rule |
| `style.row.hover` | shadcn | TableRow() hover:bg-muted/50 |
| `style.row.hover` | m3 | row-item-unselected-hover-state-layer-color -> on-surface, at hover-state-layer-opacity 0.08 — a state-layer approximation, documented not literally composited as a separate DOM layer |
| `style.row.selected` | salt | CONFIRMED ABSENCE — see no-selection-rule |
| `style.row.selected` | shadcn | see behavior.row-selection for the TanStack wiring that makes this reachable |
| `style.row.selected` | m3 | row-item-selected-container-color — a visibly deeper tone than the unselected row's own plain surface |
| `style.row.disabled` | salt | CONFIRMED ABSENCE — see no-selection-rule |
| `style.row.disabled` | shadcn | CONFIRMED ABSENCE |
| `style.row.disabled` | m3 | row-item-disabled-label-text-color -> on-surface (same hue as rest — dimming carried entirely by opacity); row-item-disabled-label-text-opacity: 0.38 |
| `style.row.zebra` | salt | the REACHABLE zebra rule at the source-default variant="primary" — see zebra-dead-code |
| `style.row.zebra` | shadcn | CONFIRMED ABSENCE — no alternating-row mechanism |
| `style.row.zebra` | m3 | CONFIRMED ABSENCE — no alternating-row mechanism |
| `style.cell.padding` | salt | td/th padding: calc(spacing-75 + spacing-50) spacing-100 |
| `style.cell.padding` | shadcn | TableCell() p-2; TableHead() px-2 (horizontal only, height driven by h-10 instead — see the template row's own note) |
| `style.cell.padding` | m3 | REGISTRY DEFAULT — no cell-padding token exists in the pinned file (only container heights); chosen to sit comfortably inside the real 52px/56px row-height tokens at the body-medium/title-small line-heights already cited, matching the reasoning TOAST-MATRIX.md's own default-policy fix already established |
| `style.cell.align` | salt | THProps.textAlign / TDProps.textAlign default "left" — real, prop-driven |
| `style.cell.align` | shadcn | TableHead() text-left; TableCell() inherits native left-alignment, no override — see prop.align for why this is a REGISTRY DEFAULT rather than an alias to a real prop |
| `style.cell.align` | m3 | REGISTRY DEFAULT — no alignment token exists (see prop.align); matches MD3's own real published convention of consumer-configured per-column alignment, and the same native left-alignment every untouched HTML table cell renders |
| `style.caption.text` | salt | CONFIRMED ABSENCE — no caption-scoped rule anywhere in Table.css; renders with browser default UA caption styling |
| `style.caption.text` | shadcn | TableCaption() className: mt-4 text-sm text-muted-foreground |
| `style.caption.text` | m3 | no caption concept exists — see structure.caption |

</details>

<!-- END GENERATED VALUES -->
