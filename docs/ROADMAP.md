# Execution roadmap

Discovery is closed (2026-08-01): contract v1.2.0, naming grammar, five
translation contracts, doctrine (growth/adoption/fork/character/teaching-flow),
two source-derived adapters. What remains is execution at scale. Phases are
ordered by dependency; each has a definition of done.

## Phase 0 — Make the law enforceable (foundation, do first)

- **0.1 Theme compiler.** Script: `theme-*.json` + `tokens/base.css` →
  `dist/<theme>.<mode>[.<density>].css`. Kills hand-drift between adapters
  and CSS forever. *Done when: both themes compile and a diff against
  hand-written base.css is empty for shadcn/light.*
- **0.2 Conformance checker.** Script validating every adapter against
  `semantic.md` slot coverage (R2) + `naming.md` grammar; wired as GitHub
  Action on push. *Done when: CI fails on a deliberately broken adapter.*
- **0.3 Themes as registry items** (`registry:theme` in registry.json) so any
  app installs a theme with one command.

## Phase 1R — The stocked dictionary (revised after the library-vs-dictionary challenge)

The registry's product is the reference shelf (contract/ — dictionary,
grammar, phrasebook, translation manual, style manual), NOT a third component
library. Cloned sources remain the bookshelf of originals. We stock exactly
one shelf natively:

- **1R.1 The showroom set (~14):** button, input, field, checkbox,
  radio-group, switch, select, tabs, card, badge, table, separator, dialog,
  avatar — machine-lifted via scripts/lift.py, review-fixed against anatomy,
  validator-enforced. This keeps the machinery exercised daily, gives the
  showroom real inventory, and keeps the native tier inhabited.
- **1R.2 Everything else: on demand.** Lift when a real screen needs it;
  judgment spent only where value is collected.
- **1R.3 The canary:** CI re-lifts a fixed component weekly against the live
  clone and fails if unmapped words grow — upstream drift becomes a failing
  check, not a future mystery.

## Phase 2 — Patterns

- **2.1 Pattern files**: login (exists), app shell, settings form, data-table
  page, auth full flow.
- **2.2 Render proof**: one generator that renders a pattern file through
  both adapters (static HTML is enough) and emits translation reports.
  *Done when: login renders in both characters from one data file with a
  lossless report.*

## Phase 3 — Design-side alignment (Claude Design)

- **3.1 Regenerate the design project** to contract vocabulary: tokens files
  and preview cards consume contract slots; theme switching = token swap.
- **3.2 Rewrite the project SKILL.md** to teach contract-first authoring
  (design against slots, preview through themes).

## Phase 4 — The platform

- **4.1 Showroom rebuilt from repo data** — themes/anatomy/patterns read
  from the repository, zero embedded copies.
- **4.2 Next.js site in this repo → Vercel** when showroom-from-data is
  proven. GitHub remains the source of truth; the site is a renderer.

## Phase 5 — Prove repeatability

- **5.1 Onboard a third system** (Material 3 recommended — richest public
  token spec) end-to-end through LINKING.md unchanged. *The registry is
  "systematic" the day a third system links without touching the contract's
  core — only growth-loop additions.*
- **5.2 First composed theme** (declared lineage) as the character-rule
  proof, if/when a real need appears.

## Standing cadence

Every onboarding runs the growth loop; every contract change bumps semver
with adapter updates in the same commit; translation reports are never
suppressed.
