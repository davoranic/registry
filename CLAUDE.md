# UI Registry — session context

**State: pipeline in progress (started 2026-08-02, after a 2026-08-01
clean-slate reset that deleted the fifth retrofitted build).** Git history
before the reset is evidence, not a base — never restore or copy from it.
Everything from 2026-08-02 onward (this section's own content) IS the
current base — build on it.

## Where the pipeline actually is — READ THIS FIRST

Phase 1 (Foundations) is **done**: `1-intro/content/foundations/` has 12 category pages,
every value source-cited. **Three of those pages were later found WRONG by a
component build re-grepping them** — `typography.md` (M3 does ship Roboto as a
literal), `state-layers.md` (M3 focus/pressed opacities are edition-dependent),
`elevation.md` (now carries the registry's canonical M3 dp→CSS shadow
derivations, because four components had each derived level-1 independently and
one diverged). Treat foundations as evidence, not scripture: re-grep before you
rely on a row.

Phase 2 (per-component matrices) is **14 of 79 canonical rows built** —
button, calendar, spinner, tooltip, alert, input, select, dialog, tabs, card,
badge, progress, chip (progress covers two rows). Each has a matrix doc, a
template, three columns, a skeleton, a `<name>-check` harness, and has been
rendered and driven in a browser. `2-build/out/index.html` reports progress against
`1-intro/content/04-component-map.md`, the scope of record.

### Decisions the owner has made — do not relitigate

- **M3 pins the `v0.192` token edition, everywhere.** All 13 columns were
  normalised down to it. Where that edition lacks a token the row is an
  explicit declared gap (alert lost title/actions/close; progress lost the whole
  stop indicator; spinner lost its track). Never silently drop.
- **When a source system is accessibility-deficient, mirror it and document
  loudly.** Badge ships zero ARIA in all three systems; the registry reproduces
  that and records it, rather than inventing semantics. (Progress was the
  inverse — M3 asserted `role="progressbar"` while withholding `aria-valuenow`,
  which is not absence but a false claim, so it was made internally consistent.)

### The five gates, and what each cannot do

Run these; they are cheap. `2-build/tools/` holds all of them.

1. `gen-from-template.py` — literals, undefined `var()` refs, missing cells.
2. `check-provenance.py` — encoding scan (a NUL byte makes a file binary and
   silently defeats every grep), then citation existence. ~2,300 citations.
3. `check-values.py` — tier-2 canary: re-resolves cited tokens from the clones
   and diffs. Colours only; shadcn skipped (Tailwind classes, not tokens).
4. `check-structure.py` — cascade order + structure-without-size. Gate A is
   trustworthy; **gate B has a high false-positive rate** and is a question for
   the render, never a verdict.
5. `check-anatomy.mjs` — proves each system renders a different part-set, i.e.
   that rule 1 is being kept. 12 of 13 diverge; convergences must be explainable.
   Plus `2-build/harness/conformance.tsx` (38 assertions driven in a real DOM) and
   per-component `check-<name>-behavior.mjs`.

**Every one of these produced confident false positives before it produced a
true one** — 158 phantom missing files, 9 phantom colour drifts, 4 phantom
unsized parts, 3 phantom focus failures. A new gate's own bugs are
indistinguishable from the defects it hunts. **Calibrate a gate by deliberately
breaking the thing it watches before trusting its output.**

### Known-open work

- **250 slots carry values but no provenance entry** — invisible to the tier-2
  canary. Concentrated in select (73) and input (42).
- **`button` has a real defect**: Salt's `--secondary-bg-hover` is defined in
  both modes and referenced by no rule, so bordered buttons have no hover — and
  the secondary selector at (0,5,0) would beat `:hover` at (0,4,0) anyway.
  Needs a `@secondary-hover` row. (Fixed on branch `fix-button-secondary-hover`,
  not yet merged.)
- ~~`dialog` shadcn=m3 identical part-set...~~ **Resolved 2026-08-04**: not a
  retrofit — `check-anatomy.mjs` didn't recognise `"none"` as the absence
  signal for config-channel enum rows (`closeButton`, `headerDecoration`), so
  it missed that m3 lacks a close button and shadcn lacks a header
  decoration, and counted both as sharing parts neither has. Gate fixed;
  dialog's real 3-part shared core (scrim/actions/description) now reports
  correctly. See DIALOG-MATRIX.md finding 14.
- 65 canonical rows unbuilt. Order still per `1-intro/content/04-component-map.md`.

### Method notes that cost real time to learn

- The validation harness runs in a **hidden tab**: `setTimeout` is throttled to
  ~1/sec (use `MessageChannel`), and focus EVENTS are suppressed though
  `document.activeElement` still updates (dispatch a synthetic `focusin`).
- **Test the transition a user performs, not the end state.** A dialog mounted
  already-open hides a bug that only appears on closed→open.
- **`grep` returning nothing is not evidence of absence** until `file <path>`
  confirms the file is text.
- A **derivation** can be internally consistent and still wrong — spinner's arc
  radius was only revealed as wrong when progress put a determinate ring beside
  it.

## What this repo contains now

- `1-intro/content/research/architecture-v2.md` — the researched architecture (ten research
  passes: industry, Salt/M3/Apple/Fluent internals, academia, agentic AI).
- `2-build/matrices/CALENDAR-MATRIX.md` — the component-template matrix method and its
  full failure/fix history — read its warnings before touching calendar.
- `1-intro/content/04-component-map.md` — the master cross-referenced component list
  (union of Salt/shadcn/M3's real component sets, ~70 canonical
  components) — the scope and ordering for phase 2.
- `1-intro/content/foundations/` — phase 1, complete (see above).
- `2-build/contract/template.schema.json` + `2-build/contract/templates/*.json` — the
  matrix schema and one template per component built so far.
- `2-build/columns/*.json` — one column file per component per design
  system, values cited to source.
- `2-build/skeleton/*.tsx` — component skeletons, built from the template union,
  inheriting from no single design system.
- `2-build/tools/gen-from-template.py` — template+columns → CSS, skeleton
  config, panel data; fails the build on any gap/literal/undefined-ref.
- `2-build/harness/*` — validation harnesses (`registry.tsx`+`chrome.css` for
  calendar, `button-check.tsx` for button) and their build scripts.
- `fonts/` — self-hosted webfonts (Open Sans, Roboto) for fidelity.
- Design-system source clones live BESIDE this repo in
  "/Users/davoranic/UI registry/": ui (shadcn), salt-ds, primitives
  (Radix), magicui, animate-ui, material-web (tokens only).

## The law — violations of these burned five rebuilds. Do not relearn.

1. **Never retrofit.** No component may be built from one design system's
   material with other systems draped over it. This includes the subtle
   form that killed the pilot: **a component inherited from one DS is
   never a "neutral chassis."** Skeletons are born from the template
   union (every part, every content-format parameter any system needs)
   or they are retrofit.
2. **No building without the owner's explicit go.** Design, research, and
   documents are fine; code is not. When the owner says stop, stop
   entirely — including "obvious" fixes and pushes.
3. **Silence is the enemy.** A row a column turns on that the
   implementation cannot express is a FAILING build, never a silent
   fallback. Character lives in structure and content formatting as much
   as in CSS — a coverage report that only counts style cells lies.
4. **Values come from source clones with provenance, or they don't come.**
   Research notes are [R] until re-verified from the clone [S]; three of
   21 [R] cells in the calendar were wrong.
5. **The owner is the fidelity oracle.** A native-speaker eye (they are a
   designer, Salt-trained) judges every render. Their verdict outranks
   any passing check.

## The pipeline (go given 2026-08-02 — supersedes rule 2 for this scoped work)

Three phases, in order. Do not skip ahead.

1. **Foundations.** One reference page per raw-value category (colors,
   cursors, density, fonts, sizes, spacing, border style, typography, plus
   any other category actually found in a DS — motion, elevation, z-index,
   state/opacity layers, etc.), nested under one parent Foundations page.
   Each page is a matrix: rows = the union of that category's tokens
   across every DS, columns = design systems. **Cite the DS's own token
   name for every cell — never a bare number.** If a system hardcodes a
   value instead of tokenizing it, or has no equivalent at all, say so
   explicitly (flag it) rather than inventing a token name for it.
2. **Per-component matrices**, one per component, structured as the six
   segments (structure/behavior/prop/slot/state/style — see
   CALENDAR-MATRIX.md for the worked example and its terminology: a matrix
   **row = one attribute**, grammar `<piece>.<part>[.<subpart>].<property>[@state]`,
   enforced by `2-build/contract/template.schema.json`). Always expose every
   attribute a component has in any source system — never assume, always
   grep the real clone. This is extraction work, not design work. After
   each component's matrix is written, generate it and validate the
   render against the real DS's own code/site before moving on.
3. **"Building"** — generating every component from its validated matrix,
   the same loop proven on the calendar pilot. Runs unattended. **When a
   question or judgment call comes up with no clear source-backed answer,
   record it as a declared gap/note and move to the next item — do not
   stop and wait.** Decisions needing the owner's taste (not fact) queue
   up for their review later; they are not blockers.



## COMPONENT INDEX — one matrix doc per built component

Each doc is the record for that component: scope note, the six segments, findings, and a **generated `Resolved values` block** carrying every row × every system read straight from `2-build/columns/*.json`. Regenerate that block after ANY column edit with `python3 scripts/sync-matrix-values.py` — if prose and block disagree, the block is the data.

| component | matrix doc | rows | salt | shadcn | m3 | behaviour gate |
|---|---|---|---|---|---|---|
| `alert` | [`ALERT-MATRIX.md`](ALERT-MATRIX.md) | 33 | 17 | 16 | 9 | — |
| `badge` | [`BADGE-MATRIX.md`](BADGE-MATRIX.md) | 50 | 29 | 33 | 18 | ✓ |
| `button` | [`BUTTON-MATRIX.md`](BUTTON-MATRIX.md) | 30 | 19 | 17 | 17 | — |
| `calendar` | [`CALENDAR-MATRIX.md`](CALENDAR-MATRIX.md) | 58 | 40 | 31 | 36 | — |
| `card` | [`CARD-MATRIX.md`](CARD-MATRIX.md) | 90 | 62 | 36 | 37 | ✓ |
| `chip` | [`CHIP-MATRIX.md`](CHIP-MATRIX.md) | 75 | 45 | 7 | 59 | ✓ |
| `dialog` | [`DIALOG-MATRIX.md`](DIALOG-MATRIX.md) | 97 | 73 | 47 | 38 | ✓ |
| `input` | [`INPUT-MATRIX.md`](INPUT-MATRIX.md) | 64 | 50 | 20 | 32 | — |
| `progress` | [`PROGRESS-MATRIX.md`](PROGRESS-MATRIX.md) | 51 | 40 | 23 | 24 | ✓ |
| `select` | [`SELECT-MATRIX.md`](SELECT-MATRIX.md) | 113 | 84 | 53 | 51 | — |
| `spinner` | [`SPINNER-MATRIX.md`](SPINNER-MATRIX.md) | 20 | 12 | 8 | 9 | — |
| `tabs` | [`TABS-MATRIX.md`](TABS-MATRIX.md) | 98 | 64 | 54 | 44 | ✓ |
| `tooltip` | [`TOOLTIP-MATRIX.md`](TOOLTIP-MATRIX.md) | 38 | 27 | 16 | 11 | — |

Numbers are rows the column expresses (not `off`). A high `off` count is not incompleteness — it is how much of another system's surface that system genuinely lacks, recorded with a citation.

Cross-cutting docs: [`01-use-case.md`](1-intro/content/01-use-case.md) is why the project exists (background, problem, outcome) · [`02-discovery.md`](1-intro/content/02-discovery.md) is how the method was determined · [`04-component-map.md`](1-intro/content/04-component-map.md) is the scope of record (79 canonical rows, 14 built) · [`architecture-v2.md`](1-intro/content/research/architecture-v2.md) is the researched design + the gate post-mortems · [`foundations/`](1-intro/content/foundations/) is phase 1, and three of its pages have been corrected by later component builds.

## WHERE THINGS ARE — the paths this loop touches

The full tree and what each folder is for lives in [`README.md`](README.md).
This is only the working set, so you can act without opening it.

| you need | path |
|---|---|
| a component's rows | `2-build/contract/templates/<name>.template.json` |
| a system's answers | `2-build/columns/<name>.{salt,shadcn,m3}.json` |
| the renderer | `2-build/skeleton/<name>.tsx` |
| the matrix doc | `2-build/matrices/<NAME>-MATRIX.md` |
| the check page | `2-build/harness/<name>-check.tsx` |
| generators | `2-build/tools/` |
| gates | `2-build/gates/` |
| generated CSS + pages | `2-build/out/` — never hand-edit |
| the design-system clones | `3-source/<clone>/` — never write here |
| the story, in markdown | `1-intro/content/` — the SOURCE for the site |
| the site | `1-intro/site/index.html` — generated, never hand-edit |

**Rebuild everything with `./build.sh`.** Gates first, then generate, then sync
the values blocks, then the site. Run it after any change: a doc that is not
regenerated is a doc that is already wrong.

**`3-source/` folder names are load-bearing.** 107 provenance strings cite paths
inside them. Moving the folder was safe; renaming one is not.

## THE ANATOMY — the vocabulary, enforced by `2-build/contract/template.schema.json`

Drift starts when this vocabulary gets loose. Every term below is a schema enum,
not a convention. If you find yourself inventing a seventh segment or a new cell
kind, stop: the thing you are describing already has a home.

### A matrix is a table

**Rows are attributes** — one row = one addressable characteristic of one part,
optionally in one state. **Columns are design systems** (salt / shadcn / m3).
A **cell** is one system's answer for one attribute. Say "row" and "cell", never
"token" (that means a resolved value) and never bare "attribute" for a DOM
`data-*` hook (say "data attribute").

### Row id grammar — `<piece>.<part>[.<subpart>].<property>[@state]`

Pattern: `^[a-z]+\.[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*(@[a-z][a-z0-9-]*)?$`
Examples: `style.day.background@hover` · `structure.today-marker` ·
`behavior.range-selection` · `prop.density` · `style.root.background@secondary`.
Narrowest part last. The `@suffix` narrows to ONE state or ONE non-default axis
value.

### The six pieces — what belongs in each

| piece | holds | test |
|---|---|---|
| `structure` | PARTS — does this element exist at all? | would removing it change the DOM tree? |
| `behavior` | what it DOES — ARIA, keyboard, focus, dismissal, announcement | invisible in a screenshot |
| `prop` | the instance API — the axes a consumer sets | does the consumer choose it? |
| `slot` | consumer-owned CONTENT, and its formatting | who supplies the words? |
| `state` | interaction states the component recognises | hover / focus / selected / disabled |
| `style` | everything CSS — colour, size, shape, motion | resolves to a declaration |

**Character lives in `structure` and `slot` as much as in `style`.** A coverage
report counting only style cells lies. Salt clamping a badge to `999+` while
shadcn prints `1000` is a `slot` difference and it is the whole personality.

### Row policy — who may switch it off

- `locked` — every column must express it. Turning it off is a FAILING build.
- `switchable` — on where the system has it, `off` (with a citation) where not.
- `default` — on with a registry default when a column is silent; label it.

### Channel — where the row lands

- `css` → a stylesheet rule. `config` → a skeleton parameter, validated against
  `skeletonParams`. `info` → documentation only (no gate watches these — see the
  behaviour-conformance harness).

### Cell kinds

`value` (a literal) · `alias` (points at a slot) · `expression` (a `color-mix()`
or `calc()`) · `native` (the system's own token, no shared slot yet) · `off`
(the system genuinely lacks it — REQUIRES a note) · `inherit` (registry default
applies — must be labelled).

### Evidence marks

`[S]` = grepped from the clone this session. `[R]` = inferred (spec page, APG
convention, published docs) — say WHY. All M3 structure/behaviour is `[R]`
because material-web is tokens-only. **Three of 21 `[R]` cells in the calendar
were wrong** — `[R]` is a debt, not a citation.

### The seven ways this drifts, all observed

1. **A retrofit** — building on one system's component and draping the others.
   `check-anatomy.mjs` is the tripwire: each system must render a different
   part-set, and any convergence must be explainable.
2. **A dead axis** — `prop` declares values no CSS row discriminates, so 3 of 4
   tones render identically and the generator still says OK.
3. **A structure row with no size** — the part renders with no dimensions; an
   `<svg width="100%">` inside it silently inherits 300px.
4. **Cascade inversion** — a state row emitted before the axis row it overrides.
5. **A documented-but-unimplemented behaviour** — `info` rows have no gate.
6. **An unshared derivation** — when a system tokenises in a different KIND than
   we emit (M3 gives dp, we need a shadow string), the conversion is OURS.
   Publish it in `1-intro/content/foundations/` the first time or it drifts once per
   component.
7. **An unstated denominator** — a check reporting what it examined as though it
   were everything. This one has bitten three separate times; it is the most
   dangerous because the output looks clean.

## HOW we build one component — the loop, step by step

This is the repeatable recipe. It has been run 13 times. Follow it in order;
every step exists because skipping it produced a real bug.

**0 · Claim the scope.** Find the component's row in `1-intro/content/04-component-map.md`. That
row names what each system calls it — they rarely agree (Salt's `banner` is our
`alert`; Salt's `dropdown` is our `select`; M3's four chip files are one row).
Decide what is IN and what is OUT, and write the exclusions into the matrix's
scope note with a STRUCTURAL reason. "Out of scope" without a reason is a hole.

**1 · Grep all three clones. Never recall from memory.**
`3-source/salt-ds/packages/{core,lab}/src/<name>/` — read every `.tsx` AND `.css`.
`3-source/ui/apps/v4/registry/new-york-v4/ui/<name>.tsx` — plus its examples/docs.
`3-source/material-web/tokens/versions/v0_192/_md-comp-<name>*.scss` — tokens only; there
is no M3 component to read, so M3 structure/behaviour rows are `[R]`, style rows
are `[S]`. Radix (`primitives/`) is behaviour reference ONLY — never a style
source. **If a grep comes back empty, run `file <path>` before believing it.**

**2 · Write `2-build/matrices/<NAME>-MATRIX.md` — the six segments.**
structure / behavior / prop / slot / state / style. One row = one attribute,
grammar `<piece>.<part>[.<subpart>].<property>[@state]`. Mark every cell `[S]`
(grepped) or `[R]` (inferred — say why). A row that only one system has still
gets a row; the others are `off` WITH A CITATION. Absence is data.

**3 · Write `2-build/contract/templates/<name>.template.json`.**
Rows + `skeletonParams` + theme-invariant `base` CSS. Selectors must never
hardcode one system's vocabulary. Two hard constraints:
- Every `var(--x)` anywhere — including `base` — must be a real slot key in
  EVERY column. `var(--x, fallback)` does NOT satisfy the gate.
- **State rows must come AFTER the axis rows they override** (`@disabled` after
  `@elevated`), or the state loses at equal specificity.

**4 · Write `2-build/columns/<name>.{salt,shadcn,m3}.json`.**
Slots + provenance + one cell per row. Cite the system's own token name, never a
bare number. **Put the SOURCE DEFAULT first** in any value list — `value[0]` is
what renders. Distinguish a defaults list from a capability list.
A measured-at-runtime value must be read on the element where it is set, never
routed through a theme-scoped slot (it freezes to the fallback).

**5 · Write `2-build/skeleton/<name>.tsx` from the template UNION.**
Not from any one system. Every part any system needs, switched by config.
Implement every behaviour you documented. Any `useEffect` reading a ref to a
conditionally-rendered node MUST list the state gating that node in its deps.

**6 · Generate until clean.** `python3 scripts/gen-from-template.py <name>` →
`OK` on all three columns, zero failures. Non-negotiable.

**7 · Build a harness and LOOK AT IT.**
`2-build/tools/build-<name>-check.mjs` + `2-build/harness/<name>-check.tsx`, copying the newest
existing pair. Toggles for mode, Salt density, and each system's own axes.
Then open it and verify COMPUTED STYLES, not a screenshot — and render at least
one instance with no width constraint, or a runaway intrinsic size hides behind
whatever clamps it.

**8 · Drive the behaviours.** Add assertions to `2-build/harness/conformance.tsx` and write
`2-build/gates/check-<name>-behavior.mjs`. A gate that has never failed proves nothing:
break the thing it watches, confirm it goes red, restore.

**9 · Run every gate, then record.** The five in the list above. Append findings
to the matrix doc — especially anything that contradicts a foundations page or
an earlier component.

### Delegating a component to a subagent

Components 6–13 were built by subagents and it works well. The prompt must
carry: the 11 numbered lessons, the required reading list (newest 2–3 matrix
docs first), the exact deliverable list, the concurrency rules (only files
matching the component's name; `2-build/harness/chrome.css` is off limits if another agent
is running), and "do NOT open a browser — the orchestrating session validates."
**Tell it every expectation in your prompt is a hypothesis to verify.** I have
been wrong five times about what a system contains; each time the agent grepped,
contradicted me, and was right.

## WHERE WE STOPPED — resume here

Last action: rewrote this file, and pointed `2-build/out/index.html` at
`1-intro/content/04-component-map.md` so it reports 14/79 instead of counting only itself.

Everything regenerates clean; all five gates green; conformance 38/38. Nothing
is committed — the working tree holds the entire session.

**Do these in order:**

1. **Fix `button`'s missing secondary hover.** Salt's `--secondary-bg-hover` is
   defined in both modes and referenced by NO rule. Add a
   `style.root.background@secondary-hover` row with a selector of higher
   specificity than the plain `@secondary` row, then fill all three columns.
   Found by `check-structure.py` gate A. (Fixed on branch
   `fix-button-secondary-hover`, not yet merged.)
2. ~~Explain or fix `dialog`'s shadcn=m3 identical part-set.~~ **Done
   2026-08-04** — it was a gate blind spot, not a retrofit; see
   DIALOG-MATRIX.md finding 14 and the Known-open entry above.
3. **Backfill 250 uncited slots** (select 73, input 42, badge, card). They carry
   values with no provenance, so tier-2 cannot see them.
4. **Continue components** — 65 canonical rows remain, order per
   `1-intro/content/04-component-map.md`: rows with real cross-system character first.

## Working with this user

- Designer, not deeply technical. Explain with real-world/physical
  analogies (dictionary/translator/matrix landed well).
- They will pressure-test ("challenge me") — engage honestly, cite
  sources.
- Ask (AskUserQuestion) before big choices; never build on an ambiguous
  yes. Token burn on unwanted work is a serious, repeated grievance.
