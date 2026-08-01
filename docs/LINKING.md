# Linking a design system to the registry

The systematic procedure. Input: any design system. Output: a
`themes/theme-<name>.json` adapter + zero component changes. If a step can't
be completed, the DS doesn't get partially wired — the gap gets declared.

## The rules

**R1 — Components consume only semantic slots.** Never a raw value, never a
source-system token name. If a component needs something the contract lacks,
the CONTRACT gets extended first (with research), then themes fill it.

**R2 — Every slot is resolved, never silently missing.** For each contract
slot a theme provides exactly one of: a value · a derivation rule
("action-hover = action ramp +1 step") · a fixed constant ("radius-*: 0,
not configurable") · a declared unsupported capability ("density: false").

**R3 — Mapping flows one way.** Source-system values → contract slots.
The adapter references the source's own semantic layer where it has one
(Salt characteristics, Material sys-tokens), its raw ramps only when it
doesn't. Nothing in the registry ever imports a source token name.

**R4 — Optional axes are capabilities.** Density, corner-knob, mode count,
icon-set freedom: declared in `capabilities` with options and default.
A UI exposes an axis only when the active theme declares it — constraints
are visible, not hidden.

**R5 — Anatomy is allowed and flagged.** Components whose structure exists
in only one system (Salt stepper/rating/tree, shadcn input-otp) are listed
in `anatomySpecific` and remain installable under that theme. Token-themable
vs composed vs anatomy is decided per component, recorded in the map file
(e.g. `themes/salt-map.json` pattern: direct / composedInShadcn / onlyIn*).

**R6 — Icons link by role.** The adapter states: default set, allowed sets,
swap mechanism (`import` | `provider`), and a mapping for the contract's
semantic icon roles (close, expand, error, …) to that system's icon names.

**R7 — Modes.** Both light and dark valued, or single-mode declared as a
constraint. Dark mode is a token swap under the same slot names — never a
second component set.

## The procedure

1. **Inventory** the source system's token architecture from its source of
   truth (clone/package, not screenshots). Identify its own semantic layer
   if it has one.
2. **Map colors** to §1 slots (both modes). Status family must include
   subtle backgrounds and borders; derive only where the source derives.
3. **Map typography roles** (§2) — this is where a system's voice lives
   (Salt: action = uppercase 600 tracked). Family stacks included.
4. **Map rhythm & shape** (§3–4): unit, control heights, insets, radii,
   border widths. Declare density if the source scales rhythm.
5. **Map elevation, motion, layers** (§5–7): semantic levels + strategy,
   duration/easing roles, z-ladder — from source values.
6. **Link icons** per R6.
7. **Classify components** per R5 into the map file.
8. **Validate** (checklist below), then commit adapter + map.

## Validation checklist

- [ ] Every §1–§9 slot resolved per R2 (script-checkable against semantic.md)
- [ ] All on-* pairs meet WCAG AA (4.5:1 text, 3:1 large/UI)
- [ ] Status colors distinguishable from action color in both modes
- [ ] Focus visible on every interactive slot in both modes
- [ ] `action` typography role renders the system's true button voice
- [ ] Density (if declared) scales unit, control-h, text-ui, icon together
- [ ] Icon roles map covers the full contract role list
- [ ] Reduced-motion collapses all durations
- [ ] Anatomy list reviewed — nothing token-themable mislabeled as anatomy

## Growth — learning the contract from design systems

No single system is globally "superior"; the rule is **the most demanding
system teaches each category** — and it teaches THE CONTRACT, never another
system directly. All teaching routes through the semantic token list: the
superior contributes CAPACITY (a slot — the ability to express an intent),
never its VALUES (its character). Every other system then meets the new slot
its own way — natively or by derivation (R2) — producing the same intent in
its own accent. The contract is the registry's IPA: a notation rich enough to
transcribe every system, owned by none of them. Salt's ~560 color characteristics teach color
granularity; shadcn teaches the radius knob; Material teaches state layers
and icon axes. Onboarding a system therefore includes a growth pass:

1. **Diff** the system's full token inventory against `tokens/semantic.md`.
2. Tokens we lack become **growth candidates**.
3. A candidate becomes a contract slot only if ALL hold:
   - it expresses a UI **intent** not currently expressible (not a finer
     shade of an existing intent);
   - it is needed by a component/pattern we ship, OR appears in ≥2 major
     systems;
   - simpler systems can satisfy it by **derivation** (R2) — no system is
     excluded by the contract growing;
   - it fits the naming grammar (`contract/naming.md`).
4. Accepted candidates → contract **minor version** bump; every adapter gains
   a value or derivation in the same commit.
5. Rejected candidates are recorded in the adapter as theme-internal — the
   diff is never thrown away.

First growth pass (Salt → contract 1.1.0) added: `border-subtle` (3-tier
separators), the `field-*` family (surface, surface-hover, border-hover,
border-active — from Salt `editable`), `selected-indicator` (from
`navigable`), `target-surface-hover`/`target-border-hover` (drop targets),
`content-disabled`, and `data-7..12` (Salt's 20-color categorical proves 6 is
too few; 12 with derivation).

## Upstream sync — when source systems update

Adapters are portraits of a moving subject. The sync loop (run per release or
quarterly): pull the source clone → regenerate inventory → diff against the
adapter. Every delta falls into exactly three bins:

1. **Value change** (a color shifts, a duration tightens) → adapter patch;
   contract untouched; consumers get it via the compiled theme.
2. **New tokens/capabilities** → growth candidates through §Growth, as if
   onboarding fresh.
3. **Renames/removals** → adapter-internal only — nothing outside the
   adapter references source names (R3), so upstream refactors cannot break
   the registry.

Adapters record their source pin (`"sourceRef": "<repo>@<version/commit>"`)
so every portrait states which sitting it was painted from. Installed
component code follows open-code rules: updates are reviewed diffs
(`shadcn diff`), adopted deliberately, never auto-applied.

## Current adapters

| System | Adapter | Map | Status |
|---|---|---|---|
| shadcn/ui | `themes/theme-shadcn.json` | native | complete |
| Salt DS | `themes/theme-salt.json` | `themes/salt-map.json` (in design project) | complete |
| (future: Material, Carbon, Fluent…) | — | — | procedure above applies unchanged |
