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

## HANDOFF — in-flight state (2026-08-01 evening)

A repair agent may still be running or have died mid-work. Verify before
trusting: six stylesheets were CORRUPTED by a scoping script that dropped
one-line rule bodies — checkbox, context-menu, dialog, drawer, radio-group,
switch (input already repaired). Repair recipe: restore from
`git show 37682b8:registry/<name>/<name>.css` where it exists
(checkbox/radio-group/switch/dialog), then re-scope selectors WITHOUT
touching bodies; reconstruct context-menu/drawer bodies from TSX + anatomy.
`python3 scripts/check-component.py` must be fully green (it now includes a
brace-balance guard that catches exactly this).

Then ship: `python3 scripts/gen-showroom-meta.py && node
scripts/bundle-showroom.mjs`, LOOK at dist/index.html in a browser (all 55
stories + the 4 System pages: foundations/dictionary/translator/rules),
then push — Vercel serves dist/ statically at registry.davoranic.com.

Known-good latest: stories all fixed against real component APIs (smoke
test: only dual-React useState harness noise remains); System pages built;
scoped themes work (data-theme on any container). Remaining roadmap after
shipping: Phase 5 (onboard Material 3 as the repeatability proof).
