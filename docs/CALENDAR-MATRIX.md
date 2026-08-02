# Calendar / date picker — component template matrix

> **⚠ READ BEFORE TRUSTING — the pilot built from this matrix was deleted
> as retrofit (2026-08-01), and the failure is the document's most
> important content.** The style cells below were largely faithful; the
> pilot still looked like "one calendar in three color schemes" because
> **character lives in structure and content formatting as much as in
> CSS**, and the pilot inherited a shadcn-derived skeleton that silently
> imposed its nav layout, weekday names, and day-number format on every
> column. Verified against the owner's reference screenshots of the real
> systems: Salt's calendar has month+year dropdowns (flush bottom-border),
> zero-padded `01` days, single-letter weekdays, muted (not hidden)
> outside days, dotted focus outline. M3's picker has its "Select date"
> header with headline + input-mode pencil toggle, a month dropdown,
> Cancel/OK action buttons, single-letter weekdays. **Any future build:
> the skeleton must be generated from this template's part union with
> content-format parameters (weekday format, day-number format,
> nav variant, outside-day policy) as first-class switchable rows — and a
> row a column turns on that the implementation cannot express is a
> FAILING build, never a silent fallback.**

*The first concrete instance of the component-template model: one master
template (union of all six pieces across systems), columns per design system,
rows switched on/off/inherited per column. Test artifact — nothing here is
built; this is the matrix the generator would consume.*

**Cell legend** · `⟡ slot` = alias to shared contract slot (Figma: variable
alias) · **bold** = the system's own switch (Figma: detached override) ·
`x-ds:` = system's native token, no shared slot yet (stays in its column
until promoted) · `OFF` = row switched off in this column · `INHERIT` =
system silent, registry default applies (labeled) · `[S]` = value extracted
from source this session · `[R]` = from the research pass, needs an
extraction re-check before build.

**Row policies** · 🔒 locked-on (no column may switch it off) ·
⚪ switchable (on where the system has it) · ⬜ on-with-default (must have a
value; silence inherits, labeled).

Sources: salt-ds clone `packages/date-components/src/calendar/*` [S];
`ui/apps/v4/registry/new-york-v4/ui/calendar.tsx` [S]; material-web /
androidx `date-picker` token files [R].

---

## 1 · Structure (parts) — Figma: the layers panel

| part | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| root | 🔒 | on | on | on |
| navigation (prev / next / caption) | 🔒 | on | on | on |
| weekday header | 🔒 | on | on | on |
| grid (7 × n weeks) | 🔒 | on | on | on |
| day cell | 🔒 | on | on | on |
| day button | 🔒 | on | on | on |
| caption dropdowns (month/year select) | ⚪ | on (dropdown) [S] | on (`captionLayout` dropdowns) [S] | on (year/month selection view) [R] |
| week-number column | ⚪ | OFF | on (optional) [S] | OFF |
| **today marker bar** (separate element) | ⚪ | **on** — 2–5px accent bar under date [S] | OFF (today is a cell style, §6) | OFF (today is a cell style, §6) |
| **event/highlight triangle** | ⚪ | **on** — corner triangle, clip-path [S] | OFF | OFF |
| modal header (selected-date headline) | ⚪ | OFF | OFF | on (modal variant) [R] |
| input-mode toggle (calendar ⇄ text field) | ⚪ | OFF | OFF | on [R] |
| footer | ⚪ | OFF | on (optional) [S] | OFF |

## 2 · Behavior — Figma: prototype interactions (one column, locked)

| row | policy | all systems |
|---|---|---|
| APG grid keyboard pattern (arrows = day, PgUp/PgDn = month, Home/End = week) | 🔒 | identical — carried by the behavior chassis, not the theme |
| roving focus within grid | 🔒 | identical |
| selection logic single/range | 🔒 | identical |
| outside-click / Escape dismiss (in popover use) | 🔒 | identical |
| screen-reader announcements (selected date, month change) | 🔒 | identical |
| modal + input-entry mode switching | ⚪ | Salt OFF · shadcn OFF · M3 on [R] — behavioral capability, flagged |

## 3 · Props — Figma: component properties panel (derived from switched-on rows)

| prop | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| `mode: single \| range` | 🔒 | on [S] | on (+`multiple`) [S] | on [R] |
| `numberOfMonths` | ⚪ | on (multi-month) [R] | on [S] | OFF (single view) [R] |
| `captionLayout` (label / dropdowns) | ⚪ | on [R] | on [S] | OFF (always own header) |
| `density` | ⚪ capability | on — high/medium/low/touch [S] | OFF (locked control shown) | OFF |
| `weekStartsOn` / locale | 🔒 | on | on | on |
| `disabledDates / unselectable ranges` | 🔒 | on [S] | on [S] | on [R] |

## 4 · Content slots — Figma: text overrides / instance swap

| slot | policy | notes |
|---|---|---|
| day content (custom render) | 🔒 | consumer-owned; all three allow it |
| caption / month label format | 🔒 | locale-driven |
| weekday labels | 🔒 | locale-driven |
| footer content | ⚪ | shadcn only (footer part on) |

## 5 · States — Figma: variants (union across systems)

| state | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| rest / hover / focus-visible | 🔒 | on | on | on |
| selected (single) | 🔒 | on | on | on |
| range start / middle / end | 🔒 | on | on | on |
| today | 🔒 (mechanism varies — §6) | on | on | on |
| outside month | ⬜ | **hidden by default** [R] | on — muted 50% [S] | on [R] |
| unselectable / disabled | 🔒 | on | on | on |
| **highlighted (has-event)** | ⚪ | **on** — triangle marker [S] | OFF | OFF |
| dragged (range in progress) | ⚪ | OFF | OFF | on — 16% state layer [R] |

## 6 · Styles — the cell matrix (per part × attribute × state)

### root

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| background | ⬜ | ⟡ surface (`container-primary-background`) [S] | ⟡ surface (`bg-background`) [S] | x-m3: `surface-container-high` [S] |
| padding | ⬜ | **8px @md** (`spacing-100`, by density) [S] | **12px** (`p-3`) [S] | **12dp** [S] |
| shape | ⬜ | **sharp (0)** [S] | ⟡ radius-container (`rounded-md` on dropdown variant) [S] | **16dp** (`corner-large` — docked; 28dp is the modal) [S] |
| width | ⬜ | **formula**: day×7 + gap×6 → 146/202/258/314px by density [S] | **fit-content** (`w-fit`) [S] | **360dp** (docked container-width) [S] |

### day cell / day button

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| size | ⬜ | **`size-base`** → 20/28/36/44px by density [S] | **formula**: `aspect-square`, fluid width, min 32px (`--cell-size`) [S] | **two-layer: 48dp cell around a 40dp circle** (`date-container` / `date-state-layer`) [S] |
| shape | ⬜ | **sharp (0)** (`palette-corner-weak`) [S] | ⟡ radius-control (`rounded-md`) [S] | **circle** (`corner-full`) [R] |
| gap between cells | ⬜ | **1px fixed** (`spacing-fixed-100`) [S] | **0** (cells abut) [S] | INHERIT [R] |
| label font | ⬜ | ⟡ type-body (`text-*` ramp, density-scaled) [S] | ⟡ type-body (`text-xs` in day, `text-sm` caption) [S] | ⟡ type-body (`body-large`) [R] |
| @hover background | 🔒 | ⟡ interaction-hover (`selectable-background-hover`) [S] | ⟡ interaction-hover (ghost-button hover → `accent`) [S] | **expression**: on-surface-variant @ 8% state layer [R] |
| @selected background | 🔒 | ⟡ interaction-selected + **1px border** `selectable-borderColor-selected` [S] | ⟡ action (`bg-primary text-primary-foreground`) [S] | ⟡ action (`primary` / `on-primary`) [R] |
| @range-middle background | 🔒 | ⟡ interaction-hover, bled −1px into gaps, top/bottom borders only [S] | **accent fill, radius 0** [S] | **OFF — M3's inline (docked) calendar has no range mode**; range is modal-only (`secondary-container`) [S] |
| @today (the audit row) | 🔒 | **separate bar part**: height `size-indicator` (2–5px), color `sentiment-accent-borderColor` [S] | **accent fill + radius**; radius 0 when also selected [S] | **1dp outline** in `primary`, label `primary` [R] |
| @outside-month | ⬜ | OFF (hidden) [R] | **muted fg + 50% opacity** [S] | **muted fg** [R] |
| @unselectable | 🔒 | ⟡ content-disabled + `selectable-background-disabled`, cursor-disabled [S] | **muted fg + 50% opacity** [S] | **38% label opacity** [R] |
| @focus-visible | 🔒 ⬜ | ⟡ focus (`focused-outline`, inset offset) [S] | ⟡ focus (`ring-[3px] ring-ring/50`) [S] | ⟡ focus (state layer 12%) [R] |
| @highlighted (event) | ⚪ | **triangle**: `sentiment-accent-background`, clip-path polygon [S] | OFF | OFF |

### navigation

| attribute | policy | Salt | shadcn | Material 3 |
|---|---|---|---|---|
| prev/next buttons | 🔒 | composes registry `button` (secondary/ghost) [S] | composes `button` ghost, `size-(--cell-size)` [S] | composes icon-button [R] |
| chevron icons | 🔒 | ⟡ icon-role: back/forward → Salt set [S] | ⟡ icon-role: back/forward → Lucide [S] | ⟡ icon-role → Material Symbols [R] |
| caption font | ⬜ | ⟡ type-label [S] | **`text-sm font-medium`** [S] | ⟡ type-label [R] |

---

## Findings from building this matrix

1. **Optional parts are real and non-exotic.** Five parts exist in exactly
   one column (today bar, event triangle, modal header, input toggle,
   footer). The template handles them as switchable rows; the anatomy
   schema needs per-theme part activation.
2. **Cells hold three value kinds**, all already on the extension list:
   plain values, aliases, and **formulas/expressions** (Salt's width
   arithmetic, shadcn's aspect-square fluid cell, M3's state-layer
   percentages). shadcn's *fluid* cell vs Salt/M3 *fixed* cells is a
   formula-vs-value difference in the same row — the cell type must be
   per-cell, not per-row.
3. **The today row is the retrofit proof**, now mechanically stated: three
   systems answer "how do we mark today?" with a bar part, a fill style,
   and an outline style respectively. Any single hardcoded answer is wrong
   for two of the three — which is exactly what the audit caught.
4. **Salt's own gap shows the honesty mechanism working**: Salt defines no
   mobile-density highlight size (a real bug in Salt's source) — the cell
   records the absence rather than inventing a value.
5. **[R] cells need an extraction pass** before any build: every M3 value
   and a handful of Salt/shadcn prop claims should be re-verified from
   token files by the extraction tooling, not trusted from research notes.
   Counting them is the honest to-do: 21 of 68 filled cells were [R].

## Pilot outcome (2026-08-01, same session)

The matrix was executed: `contract/templates/calendar.template.json` +
`themes/columns/calendar.{salt,shadcn,m3}.json` →
`scripts/gen-from-template.py` → three generated stylesheets, rendered at
`dist/pilot/index.html` on the untouched calendar component. The style-cell
[R] entries were verified against a sparse clone of material-web
(`tokens/versions/v0_192/_md-comp-date-picker-docked.scss`) and corrected
above — three research errors found: docked shape is corner-large 16dp
(28dp is the modal's), the day cell is a two-layer 48/40dp structure, and
range selection does not exist in M3's inline calendar (modal-only) — now
a switched-off row, honestly rendered as such. Salt's emergent widths
(147/315px at high/touch density) match its source-predicted geometry
(146/314px) within a pixel. Prop/behavior rows marked [R] remain to be
verified when those pieces are wired beyond the style layer.
