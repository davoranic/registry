# UI Registry — session context

A design-system **translator**, not a component library. One semantic
contract (the pivot); design systems join as theme adapters; components are
translated through the dictionary, never copied. Everything a session needs
is in this repo — no conversation memory required.

## Read in this order

1. `docs/ROADMAP.md` — phases and current state
2. `tokens/semantic.md` — THE contract (9 slot categories)
3. `docs/LINKING.md` — the rules (R1–R7), growth loop, teaching-flow, upstream sync
4. `contract/translation.md` — render/lift, adoption, capability-fork, character rules
5. `contract/authoring.md` — the 6-step component order

## Non-negotiables (learned the hard way — do not relearn)

- **Never retrofit.** Link through tokens; components render from contract
  slots only; themes carry ALL values. A hardcoded color/size in a component
  or registry item is a defect (CI enforces this).
- **Superiors teach the contract, never each other.** New slots go through
  the growth loop with source evidence. The contract is the IPA.
- **Components naturalize; capabilities fork; identities are immutable.**
- **Constraints are visible, not hidden** (shadcn has no density → the
  control locks, it doesn't disappear).
- **Lossiness is allowed; silence about it is not** (translation reports).
- **Systematic means complete.** Icons, fonts, spacing, colors, every
  component — partial coverage without saying so is unacceptable to the user.
- **Verify before claiming.** Run the validators; smoke-test stories
  (`node scripts/smoke-stories.mjs` — ignore useState/dual-React harness
  noise); screenshot the built page before saying it works.

## Build & check

```
npm install                        # once
python3 scripts/check-conformance.py && python3 scripts/check-anatomy.py \
  && python3 scripts/check-component.py && python3 scripts/check-icons.py \
  && python3 scripts/check-fonts.py
python3 scripts/build-themes.py    # adapters -> dist/theme-*.css (SCOPED:
                                   #  data-theme on any container)
python3 scripts/gen-showroom-meta.py && node scripts/bundle-showroom.mjs
                                   # -> dist/index.html (live React showroom)
python3 scripts/lift.py <name>     # translate a shadcn component to the pivot
python3 scripts/render-pattern.py <pattern>  # pattern -> both themes + reports
```

CI: conformance + anatomy + component + compile-freshness on push; weekly
canary re-lifts against live upstream. Deploy: Vercel serves `dist/`
statically (framework null — do NOT let it auto-build); the showroom
workflow rebuilds dist on push. Site: registry.davoranic.com.

## Layout decisions (user-chosen; don't redesign without asking)

Showroom = Storybook-style: tree | canvas | controls. The canvas is the ONLY
themed element (site chrome stays neutral). Controls panel: theme/mode/
density + compare-all-themes + props GENERATED from anatomy. System pages in
the tree: foundations, dictionary, translator, rules.

## Working with this user

- Designer, not deeply technical. Explain with real-world (old/physical)
  analogies — dictionary/translator/IPA language landed extremely well.
- Never scope down silently. If coverage is partial, say so and fix it.
- They will pressure-test concepts ("challenge me") — engage honestly.
- Ask (AskUserQuestion) before big UX/layout choices; they'd rather choose
  than review a guess.
- Cloud config: clones of ui/, salt-ds/, magicui/, animate-ui/, primitives/
  live BESIDE this repo in "/Users/davoranic/UI registry/".

## HANDOFF — state at session end (2026-08-01 night)

Everything is repaired, validated, bundled, and pushed:
- All 6 corrupted stylesheets fixed (restored from git / reconstructed from
  anatomy); check-component.py fully green incl. brace-balance guard.
- All 55 stories fixed against real component APIs; smoke test shows only
  the known dual-React useState harness noise (browser is fine).
- System pages live in the tree: foundations, dictionary, translator, rules.
- Bundle builds with 0 CSS warnings. dist/ committed; Vercel serves it at
  registry.davoranic.com (framework null — never let Vercel auto-build).

FIRST THING NEXT SESSION: open dist/index.html (or the live site) in a
browser and click through — visual verification was not completed. Then:
ROADMAP Phase 5 (onboard Material 3 as the repeatability proof), and the
Salt-only adoptions (stepper/rating/tree have anatomy but no components
since the clean-slate reset).
