# UI Registry — session context

**State: clean slate, by the owner's explicit order (2026-08-01).** Every
built artifact — components, recipes, tokens implementation, showroom,
scripts, adapters, pilot — was deleted after the fifth retrofit failure.
What remains is discovery only. Git history contains the old build:
**it is evidence, not a base. Never restore or copy from it.**

## What this repo contains now

- `docs/ARCHITECTURE-V2.md` — the researched architecture (ten research
  passes: industry, Salt/M3/Apple/Fluent internals, academia, agentic AI).
- `docs/CALENDAR-MATRIX.md` — the component-template matrix method, proven
  and *falsified in part* on one pilot: read its warnings.
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

## Working with this user

- Designer, not deeply technical. Explain with real-world/physical
  analogies (dictionary/translator/matrix landed well).
- They will pressure-test ("challenge me") — engage honestly, cite
  sources.
- Ask (AskUserQuestion) before big choices; never build on an ambiguous
  yes. Token burn on unwanted work is a serious, repeated grievance.
