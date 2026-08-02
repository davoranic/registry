# UI Registry — session context

**State: pipeline in progress (started 2026-08-02, after a 2026-08-01
clean-slate reset that deleted the fifth retrofitted build).** Git history
before the reset is evidence, not a base — never restore or copy from it.
Everything from 2026-08-02 onward (this section's own content) IS the
current base — build on it.

## Where the pipeline actually is — READ THIS FIRST

Phase 1 (Foundations) is **done**: `docs/foundations/` has 12 category
pages + README, every value source-cited. Phase 2 (per-component
matrices) is **started**: two components exist, both matrix-built,
generated, and validated by rendering against real source —
- `calendar` — the original pilot, several rounds of owner-caught fidelity
  bugs, all fixed (see CALENDAR-MATRIX.md for the full history/warnings).
- `button` — built 2026-08-02. Caught three real bugs before validation
  passed: an undefined-array crash (a system with no `size` prop), a
  conflated capability-vs-instance flag (silently blanked shadcn's
  labels), and the important one — **a hardcoded selector using Salt's
  own attribute values (`[data-tone="neutral"][data-emphasis="solid"]`)
  in a template meant to be system-agnostic, which silently broke
  shadcn's and M3's base color rules while a stale browser render looked
  fine.** Lesson: default-axis style selectors must never hardcode one
  system's vocabulary — see the generalized selector pattern in
  `contract/templates/button.template.json` (bare `[data-slot="x"]`, with
  non-default axis values as higher-specificity overrides).
- The generator's own completeness gate was strengthened mid-session: it
  only caught single-arg `var(--x)` refs, not `var(--x, fallback)` — the
  exact pattern that let an undefined foundation slot silently no-op via
  its fallback. Now catches both (`scripts/gen-from-template.py`).

**Next component per docs/COMPONENTS.md's stated order**: input or
select. Follow the button build as the template: extract real source →
write template.json + N column files → run
`python3 scripts/gen-from-template.py <name>` until it's OK on every
column → write/reuse the skeleton → build a `<name>-check` validation
page → render it and verify computed styles, not just a screenshot (the
button selector bug would NOT have been caught by eyeballing alone).

## What this repo contains now

- `docs/ARCHITECTURE-V2.md` — the researched architecture (ten research
  passes: industry, Salt/M3/Apple/Fluent internals, academia, agentic AI).
- `docs/CALENDAR-MATRIX.md` — the component-template matrix method and its
  full failure/fix history — read its warnings before touching calendar.
- `docs/COMPONENTS.md` — the master cross-referenced component list
  (union of Salt/shadcn/M3's real component sets, ~70 canonical
  components) — the scope and ordering for phase 2.
- `docs/foundations/` — phase 1, complete (see above).
- `contract/template.schema.json` + `contract/templates/*.json` — the
  matrix schema and one template per component built so far.
- `themes/columns/*.json` — one column file per component per design
  system, values cited to source.
- `skeleton/*.tsx` — component skeletons, built from the template union,
  inheriting from no single design system.
- `scripts/gen-from-template.py` — template+columns → CSS, skeleton
  config, panel data; fails the build on any gap/literal/undefined-ref.
- `page/*` — validation harnesses (`registry.tsx`+`chrome.css` for
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
   enforced by `contract/template.schema.json`). Always expose every
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

## Working with this user

- Designer, not deeply technical. Explain with real-world/physical
  analogies (dictionary/translator/matrix landed well).
- They will pressure-test ("challenge me") — engage honestly, cite
  sources.
- Ask (AskUserQuestion) before big choices; never build on an ambiguous
  yes. Token burn on unwanted work is a serious, repeated grievance.
