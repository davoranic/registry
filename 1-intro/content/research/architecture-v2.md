# Architecture v2 — the report

> **⚠ STATUS (2026-08-01, end of session): all implementation deleted by
> the owner's order; this document and CALENDAR-MATRIX.md are the only
> survivors. Git history is evidence, not a base — never restore old code
> from it.** The calendar pilot validated the matrix's *style* layer and
> then failed the native-speaker test on structure and content formatting,
> adding one non-negotiable this document's four-layer model must absorb:
> **no inherited chassis.** The component skeleton itself is generated
> from the template's part union with content-format parameters as
> switchable rows; "theme-invariant structure" is only what remains after
> every per-system structural difference has been made a row. Coverage
> gates must count structure/content rows, not just style cells — a
> switched-on row the implementation cannot express fails the build.
> Building anything requires the owner's explicit go, given per artifact.

*Research-based proposal for restructuring the registry so any design system
plugs in without retrofit. Based on ten verified research passes
(2026-08-01): industry token architectures (W3C DTCG, EightShapes, Style
Dictionary), the salt-ds clone's internals, the four other clones (shadcn,
Radix, MagicUI, Animate UI), a line-by-line gap audit of this repo, deep
adversarial evaluations of Material Design 3, Apple (HIG/SF/Liquid Glass),
and Microsoft Fluent 2 (§8), and a horizon pass on industry trajectory,
the academic literature, and agentic-AI fit (§9). Nothing in this document
is built. This is the map, not the road.*

---

## 1 · The diagnosis, in one sentence

The registry has a **semantic tier only** — and its own rulebook *prohibits*
the tier where per-component character must live, so every per-component
decision (spinner sizes, disabled opacity, tooltip arrow geometry, hover
tint percentages) was hand-written into 55 CSS files with shadcn-flavored
values that no theme can reach. That is the retrofit, mechanically.

The receipts, from this repo:

- `contract/naming.md:34` forbids component-scoped tokens outright
  ("slots don't belong to components") — while 23 of the 142 "semantic"
  slots are component tokens in disguise (`--field-border`,
  `--inverse-surface` "for tooltips", `--layer-tooltip`, `--size-overlay-*`)
  because they had nowhere legal to live.
- `contract/translation.md:58` already *names* the missing layer —
  "character-anatomy… STAYS in the origin adapter as its recipe for the
  component" — but the theme schema has **no key where such a recipe could
  be written**, and the compiler emits only flat global variables.
- The recipes contain what the tier would have held: **82** hardcoded
  opacity lines, **66** `calc(var(--x) * magic-number)` multipliers, **55**
  `color-mix(… N%)` calls (the focus-ring alpha alone is hardcoded in 43
  places — at 60%, while shadcn's real value is 50%), one hardcoded 1s
  animation, breakpoint literals that contradict the contract's own
  breakpoints. CI checks none of it — the validator only rejects raw
  *colors*.
- Per-slot provenance ("this value came from Salt's
  `editable-borderColor-hover`") exists only as prose strings that
  `build-themes.py` **strips at compile time** (`NOTE_KEYS`, line 15).
  Fidelity to the source is therefore undocumented, unqueryable, unchecked.

## 2 · What the industry does (verified, with the sources in §8)

Every mature multi-system token architecture converges on **three value
tiers, with tier-skipping forbidden**:

| Tier | Material 3 | Salt | What lives there |
|---|---|---|---|
| 1 Foundations | `md.ref.*` | foundations + palettes (1,973 tokens total) | Raw stock: hex ramps, size scales. Per-system, no meaning. |
| 2 Semantic | `md.sys.*` | **characteristics** (15 intent groups, 446 tokens) | The shared contract. Named by *intent*, never appearance. |
| 3 Component | `md.comp.*` | `--saltButton-*` (189 public slots) | Per-component, per-part, per-attribute decisions. |

Components consume tier 3; tier 3 defaults to tier 2; tier 2 resolves from
tier 1. **Salt writes this as one CSS pattern**, on every styleable property
of every component:

```css
height: var(--saltButton-height, var(--salt-size-base));
/*      ^ override switch (empty)  ^ semantic default        */
```

The override slot is *deliberately never filled by Salt itself* — it exists
so someone plugging in can flip that one switch without forking the
component. This is the "switches per design system" mechanism, in
production at JPMorgan.

Two more findings that shape the design:

- **Salt names its semantic groups by behavioral intent** — actionable,
  editable, selectable, navigable, overlayable, separable, focused, status,
  sentiment, container, content, text — not by visual role. Intent names
  are the hardest for any one brand's aesthetics to contaminate.
- **The documented anti-pattern we hit has a name**: *"semantic tokens that
  are one brand's decisions in disguise."* The published defense: prove the
  contract against ≥2 visually divergent systems **before freezing it**, and
  (EightShapes' rule) promote a decision from component tier to semantic
  tier only when **3+ components** demonstrably share it. Semantic tokens
  are *earned by reuse*, never designed speculatively from one system.
- **Even Salt violates its own prose rules** (61 components reference the
  palette layer directly, against their own docs) — but the rules they
  encode as **build-failing lint** (cross-theme token parity) hold
  perfectly. Rules in prose decay; rules in CI hold.

## 3 · The five clones are not five peers

The audit of the clones changes the mental model: they occupy different
*layers* of a design system, and the architecture must classify every
joining system before linking it.

| System | What it actually is | What it contributes |
|---|---|---|
| **salt-ds** | Full visual identity (4-layer token system, 1,973 tokens, 548 icons, 5 densities) | A complete theme: values for every tier + capabilities |
| **shadcn/ui** | Visual identity. Its current generation *extracted character out of components* into 8 swappable "style" sheets — they hit our exact problem and solved it the same direction | A complete theme (colors + radius + fonts themable; geometry/motion live in its style layer) |
| **Radix primitives** | Behavior chassis. Zero CSS in any published package; provides state attributes + measurement vars | **Not a theme.** The behavioral reference implementation |
| **MagicUI** | Motion identity on top of shadcn's contract (23 `--animate-*` tokens; but 31/78 components hardcode hex) | Motion tokens + effect components |
| **Animate UI** | Motion identity, tokenless — its character is ~100 inline physics literals, clustering tightly (durations {0.15…0.6}, springs stiffness {100–350} × damping {16–35}); every primitive already accepts a `transition` prop | Proof that motion character is tokenizable; a motion-theme once tokens exist |

Consequence: **motion becomes a first-class token category** (durations,
easings, spring presets) — Salt barely has it, the motion systems *are* it —
and the contract records each system's layer (`theme`, `motion-theme`,
`behavior`) so we stop translating apples into orchestras.

## 4 · The proposed architecture

The registry becomes four layers. The middle two are the contract; the
outer two belong to each design system.

```
┌──────────────────────────────────────────────────────────────────┐
│  L1  SOURCE FOUNDATIONS (per DS, in its clone, untouched)        │
│      Salt's 612 foundation tokens · shadcn's :root vars · etc.   │
└────────────────────────┬─────────────────────────────────────────┘
                         │  linked by the adapter, with compiled provenance
┌────────────────────────▼─────────────────────────────────────────┐
│  L2  SEMANTIC CONTRACT (shared — the pivot / IPA)                │
│      ~120 slots after the purge, organized by INTENT             │
│      (Salt-style groups: action, field/editable, selection,      │
│       navigation, container, content, status, focus, overlay,    │
│       separation, text, motion, icon-roles, layer)               │
│      + capabilities (density, corner, modes, motion-physics)     │
└────────────────────────┬─────────────────────────────────────────┘
                         │  every component token defaults to a semantic slot
┌────────────────────────▼─────────────────────────────────────────┐
│  L3  COMPONENT TOKENS (shared names, per-DS values — NEW)        │
│      Generated FROM the anatomy attribute inventory:             │
│      --reg-spinner-size-md, --reg-button-disabled-opacity,       │
│      --reg-tooltip-arrow-size, --reg-calendar-range-tint …       │
│      Adapters override any of them: the "switches".              │
└────────────────────────┬─────────────────────────────────────────┘
                         │  recipes consume ONLY these (CI-enforced)
┌────────────────────────▼─────────────────────────────────────────┐
│  L4  COMPONENT RECIPES (generated where possible)                │
│      property: var(--reg-button-height, var(--control-height-md))│
│      Zero literals. Zero direct foundation references.           │
└──────────────────────────────────────────────────────────────────┘
```

### 4a · The anatomy upgrade — the inventory the user asked for

Today's anatomy JSONs list *which* slots a part consumes but never *what
for* ("root: [action, radius-control]"). They become the **attribute
inventory** — per part, per attribute, per state:

```json
"parts": [{
  "part": "root",
  "attributes": {
    "background":     { "token": "button-background",     "semantic": "action" },
    "height":         { "token": "button-height",         "semantic": "control-height-md" },
    "border-radius":  { "token": "button-radius",         "semantic": "radius-control" },
    "opacity@disabled": { "token": "button-disabled-opacity", "semantic": "opacity-disabled" }
  }
}]
```

From this single file three things are *generated*: the component-token
list (L3), the recipe skeleton (L4), and the showroom controls. The
inventory is written once per component, **before** any CSS exists —
inventory-first is now the only possible order because the CSS is derived
from it.

### 4b · The adapter — how a design system plugs in

One file per DS. Structure (extends the current theme schema):

```
layer:            theme | motion-theme | behavior
capabilities:     density, corner, modes, icon-sets, motion-physics
semantics:        value per L2 slot   ── each value carries `source:`
components:       sparse per-component overrides (the switches)
                    button: { disabled-opacity: {value: 0.4,
                              source: "salt: opacity via actionable spec"} }
gaps:             declared misses — "salt has no --x; substituting Y"
iconMap:          semantic role → this DS's icon (34-role model, Salt's own
                  SemanticIconProvider pattern; missing role → visible
                  placeholder, never a borrowed icon)
motion:           durations/easings/springs (for motion-theme systems)
```

**Provenance is data, not prose.** `source:` survives compilation into a
queryable map, and a canary CI job diffs declared values against the live
clone — "in the spirit of Salt" becomes a failing check instead of a
designer's trained eye catching it after the fact.

### 4c · Enforcement — retrofit made impossible, not forbidden

The research is unambiguous: every prose rule in this repo *and in Salt
itself* got violated; every CI rule held. Four gates:

1. **No literals in recipes.** Extend `check-component.py` beyond colors:
   px/rem/ms literals, opacity floats, calc multipliers, color-mix
   percentages, cursor keywords — all rejected. (Generated recipes make
   this cheap to satisfy.)
2. **Coverage parity** (Salt's stylelint model): every L3 token is either
   valued by an adapter, inherited from its declared semantic default, or
   listed in `gaps` — a token that is none of the three fails the build.
3. **Provenance canary**: weekly re-extract source values from the clones;
   drift fails.
4. **Two-system proof before freeze** (the anti-disguise rule): no L2 slot
   is added to the contract until it resolves sensibly for both Salt and
   shadcn; no L3 token is *promoted* to L2 without 3+ component reuse.

### 4d · What survives from today (this is not a restart from zero)

| Exists today | Fate |
|---|---|
| 142 semantic slots | ~85 genuinely semantic ones survive, regrouped by intent; ~23 component-shaped ones move down to L3; ~34 reference-shaped ones move into adapters |
| 59 anatomy JSONs (parts/states/axes/behavior all correct) | Survive; gain the attribute inventory |
| 2 adapters (356 + 263 values, capabilities model) | Survive; gain `components`, `gaps`, structured `source` |
| Dictionary (108 shadcn-word mappings + 53 lift reports) | Survives as shadcn's dictionary; becomes per-DS data files, not Python source |
| contract/*.md governance, states, variants | Survive; naming.md's component-token prohibition is **repealed** and replaced by the L3 grammar |
| 55 hand-written recipes | Replaced by generated ones as each component's inventory is written |

## 5 · Scale, honestly

Salt needed 1,973 + 189 tokens for 82 components. Our 55 components ×
~6 parts × ~8 characterful attributes ≈ **2,500–3,000 component tokens**,
generated from inventories, not hand-written. The inventories themselves
are the real work: 55 files, each demanding the discipline of naming every
attribute that carries character. That is the "comprehensive systematic
list" — and it is exactly the work that was skipped the first time.

## 6 · The order of work (when — and only when — approved)

1. **Contract v2 spec** — L2 purge/regroup, L3 grammar, adapter schema,
   the four CI gates. Documents only. You review.
2. **Prove on 5** — the components whose Salt character failed worst
   (spinner, alert/banner, calendar, tooltip, button): write inventories,
   extract Salt's real values from the clone (they're in this research —
   e.g. spinner md = 28px box / 4px bar at medium density; disabled
   opacity 0.4; banner min-height 36px), generate tokens + recipes, run
   all four gates, put them in the showroom next to Salt's originals.
   You judge fidelity.
3. **Scale to 55** with the proven machinery; icons move to per-component
   role resolution at the same time.
4. **Then** the repeatability proof (Material 3 or Animate UI as
   motion-theme) — a new system should plug in by writing an adapter
   *only*, touching zero component files. That is the acceptance test of
   the whole architecture.

## 7 · The two decisions that are yours

1. **Semantic naming style**: keep current visual-role names
   (`--action`, `--surface`) or adopt Salt-style intent groups
   (`actionable-*`, `editable-*`)? Intent naming is more contamination-
   resistant (the research is clear) but renames most of the contract.
2. **Component-token surface**: full surface for every component (M3/Salt
   style — maximum switchability, ~3,000 tokens) or earned-only (start
   with what the inventories prove, promote on reuse — leaner, but some
   switches won't exist until someone needs them)?

## 8 · Validation round — Material 3, Apple, Fluent 2

*Added 2026-08-01, second research pass. Each system was evaluated in depth and
adversarially stress-tested against §4. Verdict first, evidence after.*

### 8a · The verdict

**The four-layer model held against all three.** M3 maps onto it almost
one-to-one (ref/sys/comp ↔ L1/L2/L3); Fluent's global/alias tiers are L1/L2;
Apple's semantic color API *is* an L2 in the intent-naming style we chose —
Apple essentially invented that idiom. Nothing in any of the three requires a
redesign. But the stress tests surfaced **one structural flaw in our rules and
eleven named, additive schema extensions.**

### 8b · The structural flaw the stress test caught

Our own anti-retrofit gate — *"no semantic slot without proof across ≥2
systems"* — would have **recreated the retrofit disease one layer up.** M3
has 51 semantic color roles (a five-step surface-container ladder, fixed
roles, inverse roles); no second system has most of them, so the gate bars
them from L2 forever — and their values would have had nowhere to live except
per-component switches, destroying "sparse overrides" for every
container-shaped component. Same failure, new address.

**Fix: adapter-private semantic namespaces.** A DS may declare its own
semantic slots (`x-m3-surface-container-high`) that live one level above its
component switches, resolvable only inside its own fallback chains. The
shared contract stays lean and proven; a rich system keeps its full semantic
vocabulary without leaking it into components. Promotion to the shared
contract still requires the 2-system proof.

### 8c · What each system taught us

**Material 3** (easiest and most dangerous adapter):
- Three of its most characterful subsystems are **functions, not values**:
  color is *derived* (seed → HCT → tonal palettes → scheme; 9 variants ×
  continuous contrast), density is arithmetic (`height = baseline − 4px ×
  n`, and applying it silently removes touch-target compliance), motion
  includes spring physics (damping/stiffness) and even a two-segment curve
  CSS cannot express. A static snapshot of baseline M3 is faithful (Google
  publishes one), but capturing M3's *identity* needs **generator
  provenance**: `{fn, inputs, libraryVersion}` executed at build time.
- Its component tokens have **four axes** (part × attribute × interaction
  state × configuration variant, e.g. `with-icon-hover-icon-color`), plus
  composite values. Our inventory schema needs the state and variant axes.
- States are **color algebra, not colors**: hover = content color at 8% over
  the container (8/12/12/16%). Adapters must be able to declare *expressions*
  (`color-mix(...)`) as values — notably, the color-mix literals littering
  our current recipes were the right mechanism in the wrong layer.
- Scale calibration: one M3 date picker carries **112 component tokens** —
  liter­ally more than our entire semantic contract. The 2,500–3,000 estimate
  in §5 is realistic, maybe low.
- Source pinning matters: the clean web token source is frozen at v0.192;
  the living Expressive spec (springs, emphasized type) exists only in
  Android source. An adapter must record *which edition* it translates.

**Apple** (the boundary test — it is not a token system, on purpose):
- The stable contract is **API names whose values officially fluctuate** per
  OS release, contrast setting, and elevation (dark mode has *two* value
  sets: base and elevated). Provenance needs a **snapshot type**:
  `{value, os, appearance, contrast, elevation, capturedAt}`.
- **"Declared absence" must exist beside "declared gap."** Apple publishes
  no spacing scale at all. Forcing an adapter to fill every slot fabricates
  opinions the source never had — the precise disease this project treats.
  An adapter may abstain; the registry default applies *and is labeled*.
- **Fallback chains must be capability-conditional**: vibrant text colors
  are only legal on materials; if the material capability degrades, the
  correct color fallback changes. One fallback per token is not always
  enough.
- SF Symbols are **legally unshippable** outside Apple platforms — the icon
  map needs a `reference-only` flag plus a substitute set with its own
  provenance. Materials/Liquid Glass are a rendering runtime: a graded
  fallback capability (glass → blur → translucent → opaque), not a theme
  value.
- Honest scope: an Apple-flavored theme fills ~45–55% of the contract from
  source (semantic colors, 11-role type ramp, control sizes, 44pt targets,
  spring presets) and is genuinely recognizable. Anything claiming more is
  draping.

**Fluent 2** (friendliest adapter, 8 of 12 findings fit as-is):
- **No component-token tier exists** — 467 alias tokens flow straight into
  component styles; per-component values (button min-widths 64/96px) are
  literals in style source. Two consequences: L3 values for Fluent are
  extracted from *code*, with `file:line` provenance; and our L3 tier gives
  Fluent users an override API Microsoft itself doesn't offer.
- Its brand system is **fully static** (16 hex stops chosen at design time)
  — the counterexample proving derivation is not universal.
- **High contrast is a first-class third mode** built on CSS system colors
  (`CanvasText`, `Highlight`), plus per-component `forced-colors` recipe
  blocks that no token remapping can produce — one of the extensions
  reaches into L4 structure, not just data.
- **Density models are genuinely plural**: Salt rescales global foundations;
  M3 subtracts from component heights; Fluent sizes per instance
  (`small/medium/large` props); shadcn has none. The capability must be a
  discriminated descriptor, and the recipe generator must branch on it —
  the single biggest generator implication of the round.

### 8d · The consolidated extension list (all additive, none a redesign)

1. Adapter-private semantic namespaces (`x-<ds>-*`) — §8b.
2. Provenance as a typed union: `token-ref | source-literal(file:line) |
   snapshot(os/appearance/…) | generator(fn/inputs/version)`.
3. Density descriptor: `foundation-rescale | component-ladder(+a11y
   side-effects) | per-component-size | none`.
4. Open mode list (light/dark/high-contrast/…), system-color values, and a
   `forcedColors` recipe block in L4.
5. Motion value-type union: `duration | bezier | spring(damping,stiffness |
   duration,bounce) | curve-path`, springs compiled to CSS `linear()`;
   motion schemes as modes.
6. L3 inventory gains interaction-state and configuration-variant axes, and
   composite/tuple value types.
7. Icon map gains: style/variant dimension, per-state instances
   (selected=filled), per-size asset strategy, delivery mechanism,
   `reference-only` legal flag.
8. Typography as a structured sub-schema: role matrix (category × size ×
   font/size/line-height/weight/tracking) with a brand/plain typeface split
   (portable: Salt, M3, and Apple all make it).
9. "Declared absence" beside "declared gap."
10. Capability-conditional fallback chains.
11. Expression values (`color-mix` state algebra) as first-class adapter
    declarations.
12. Source-edition pinning per adapter (which M3, which OS snapshot).

**Honestly out of scope, permanently** (declared, never faked): runtime
seed retheming (unless the registry ships M3's generator as a build step),
continuous icon-axis animation, Liquid Glass optics and vibrancy
compositing, the full Dynamic Type matrix, ripple ink (behavior layer),
concentric hardware-derived geometry, SF Symbol asset distribution.

## 9 · The horizon — where the industry, academia, and agents are going

*Added 2026-08-01, third research pass: industry trajectory 2024–26, the
academic literature (including why this idea's ancestors failed), and the
agentic-AI fit. Full citations in §10.*

### 9a · Industry: the bets, and where we stand on each

1. **The W3C token format (DTCG) went stable in October 2025** and every
   serious tool speaks it or is adding it (Figma, Style Dictionary v5,
   Tokens Studio, Penpot, Supernova, zeroheight). → **Decision: DTCG
   2025.10 JSON becomes our internal canonical format.** We stop inventing
   a wire format; adapters read/write the industry's one.
2. **Theming is converging on "resolvers"** — declarative context
   resolution with fallback chains (dark-protanopia falls back to dark,
   not light). Structurally what our adapters already do; align the
   terminology and the mode model with the resolver draft.
3. **The tier verdict matches §4**: primitive → heavyweight semantic →
   component tokens *only as generated artifacts*. Adobe Spectrum publicly
   retreated from token maximalism (v11 "unnecessarily large" → v12
   reduced); Salesforce SLDS 2 shipped semantic "styling hooks" first and
   component hooks not at all; nobody hand-writes 400-token component
   tiers anymore. Our generated-L3-from-inventory is the *only* form of a
   component tier the industry still endorses.
4. **CSS ate half the old token machinery**: `light-dark()` (dark mode
   without duplicated sets), `color-mix()` + relative color (state algebra
   computed in-browser — M3's state layers become native expressions),
   `@property`, cascade layers. → Emit fewer, smarter variables; let CSS
   do the math; put theme/override precedence in `@layer`, not
   specificity.
5. **Design systems are becoming agent infrastructure**: 84% of teams use
   tokens (56% a year earlier) while DS headcount shrinks; MCP servers are
   replacing docs sites; Figma's stated strategy is tokens + Code Connect
   as the machinery that keeps *AI-generated* code on-system.
6. **Motion physics has no standard** — M3's spring tokens are the only
   formalized system; DTCG has no spring type. Our motion value-union
   stays a vendor extension, correctly.

### 9b · Academia: the ancestors failed — here is exactly how we differ

Our architecture has a 25-year academic ancestor: model-based UI
development (the CAMELEON framework: abstract UI → concrete UI → final UI
— literally "one semantic contract, many renderings"). The languages built
on it (UsiXML, MARIA, even OMG-standardized IFML) **all failed to spread**,
and the field wrote honest post-mortems. Four documented traps, and our
answer to each:

| Trap (documented cause of death) | Our countermeasure |
|---|---|
| **Universal-vocabulary trap** — required everyone to author in a new abstract language; high threshold, low ceiling | The contract is *extracted bottom-up from real systems* (lift + growth loop), never authored top-down; no source system has to know we exist. The one robust empirical study of design systems (Lamine & Cheng 2022) found exactly this: systems survive by absorbing variation bottom-up. |
| **Full-automation trap** — regeneration destroyed manual polish, designers rejected the tools (the "lost-delta" problem) | **Schema addition: preserved human deltas** — hand-tuned overrides live in a dedicated layer that survives regeneration, exactly like adapter overrides survive contract updates. This was the single deadliest MBUID failure and we must build the answer in from day one. |
| **Generic-output trap** — generated UIs looked lowest-common-denominator | Character lives in per-DS values (L3 switches + private namespaces), not in the shared transformation; fidelity is *checked against source clones*, and the modern escape — critic/repair loops — is our validator. |
| **Unpredictability trap** — designers couldn't foresee what the transformation would emit | Deterministic generation from inspectable inventories; translation reports; no ML in the value path. |

Also from the literature: the psychophysics validates *semantic* tokens as
the scientifically correct structure — touch targets are physical
millimeters (hence 44pt/48dp divergence), readable type has a measurable
critical size, and dark mode is **not** an inversion (positive-polarity
advantage is replicated; dark values must be tuned per mode — which Salt
and Apple both do with dedicated dark/elevated sets). And one honest gap:
**no peer-reviewed work exists on design tokens as LLM constraints** — the
territory this registry occupies is publishable, unclaimed ground.

### 9c · Agentic AI: the numbers, and the interface

The central empirical result (CHI 2026, comparative study of context
strategies for design-system-compliant LLM generation):

| Strategy | Compliance |
|---|---|
| Prompt instructions only | 70.98% ± 13.93 |
| Docs pasted into context | 84.55% ± 9.51 |
| **Structured registry the agent queries** | **95.08% ± 4.77** |

Registries don't just raise compliance — they collapse its variance by
two-thirds. Independent convergence: Storybook's auto-generated Component
Manifests ("most useful context in fewest tokens"), Vercel v0's adapter
files ("verified sources only"), Atlassian's agent-restructured system
(+52% AI accuracy, 26% fewer tool calls), Apple's UICoder and ICSE 2025's
DesignRepair (machine-readable guidelines as a repair oracle). And the
constrained-generation literature warns against the opposite approach:
hard output masking degrades model reasoning — **reason freely, then
validate and repair** is the proven loop.

**What we already are, in agent terms:** the attribute inventories ARE
component manifests (richer — per-attribute semantic fallbacks and
provenance); the CI gates ARE the deterministic validator the loop needs;
declared gaps/absences are anti-hallucination data nobody else ships;
typed provenance is the answer to the 32%-trust problem; and
`translate(component, from, to)` is an operation no product on the market
offers — every existing solution is single-DS.

**The agent interface (additions, all thin layers over existing data):**

1. **MCP server**, small dense tool surface: `list_components` /
   `search` / `get_component` (returns the full inventory: slots, resolved
   values, fallbacks, provenance, gaps) / `resolve_intent` (semantic
   lookup with alias chains pre-flattened — agents must never multi-hop) /
   `translate` / **`validate`** (the CI gates as an on-demand tool
   returning structured, actionable errors) / `diff_provenance`.
2. **shadcn-registry-format export** — the de-facto agent-install standard
   (v0, Lovable, Bolt, Cursor consume it natively).
3. **Generated DESIGN.md per adapter** for rules-file agents without MCP.
4. **Usage snippets in inventories** (examples monotonically improve
   agent output — Storybook RFC).

**The highest-leverage decision** (unanimous across the research): the
agent's path must run through the resolving registry plus the
deterministic validation loop — never through prose. We already own both
halves; the decision is to expose them as the agent's *runtime* interface,
not only as build-time infrastructure.

### 9d · Consequences folded back into the plan

- New schema requirement from §9b: **preserved human deltas** (the
  MBUID-killer). Added to the §8d extension list as #13.
- New format decision from §9a: DTCG 2025.10 as canonical; resolver-style
  mode model; CSS output leaning on `light-dark()`, `color-mix()`,
  `@layer`.
- New deliverable class from §9c: the MCP tool surface and registry
  export are Phase-4-adjacent deliverables, designed alongside the
  contract rather than bolted on later — the schemas should be written
  with the agent's `get_component`/`validate` calls in mind from day one.

## 10 · Sources

- W3C DTCG format: designtokens.org/TR/drafts/format/
- Material 3 tokens: m3.material.io/foundations/design-tokens/overview;
  material-web theming README (github.com/material-components/material-web)
- Nathan Curtis: "Naming Tokens in Design Systems", "Tokens in Design
  Systems" (medium.com/eightshapes-llc)
- Style Dictionary multi-brand: styledictionary.com/info/tokens/ +
  examples/advanced/multi-brand-multi-platform
- Salt: saltdesignsystem.com/salt/themes/index, …/design-tokens/
  how-to-read-tokens.mdx; verified against the local clone
  (salt-ds @ e3c0230, @salt-ds/theme 1.43.0) — file-level index in the
  session research
- Anti-patterns: sujeet.pro/articles/design-tokens-and-theming;
  contentful.com/blog/design-token-system; design.gitlab.com token docs
- Local audits: salt-ds clone (Spinner/Banner/Calendar deep-dives with
  computed per-density values), ui/ (shadcn Gen A vs Gen B), primitives/,
  magicui/, animate-ui/ (transition-literal frequency tables), and this
  repo's tokens/, contract/, themes/, registry/, scripts/.

Validation round (§8):

- Material 3: material-web token source incl. versions/v0_192
  (github.com/material-components/material-web/tree/main/tokens);
  material-color-utilities (github.com/material-foundation);
  androidx Compose material3 tokens (DatePickerModalTokens.kt);
  MDC density README; MDC-Android Motion.md; m3.material.io
  (design-tokens/overview, styles/motion, interaction/states,
  typography/type-scale-tokens); Material Symbols
  (developers.google.com/fonts/docs/material_symbols)
- Apple: developer.apple.com/design/human-interface-guidelines
  (Color, Dark Mode, Typography, Materials, Motion, Accessibility,
  SF Symbols, Buttons, Layout — extracted from the documentation data
  payloads, current through Dec 2025); UIKit UI element colors;
  SwiftUI Spring and ControlSize; Liquid Glass technology overviews
- Fluent 2: fluent2.microsoft.design/design-tokens;
  github.com/microsoft/fluentui packages/tokens (types.ts, tokens.ts,
  global/*, alias/lightColor.ts, alias/highContrastColor.ts);
  react-button useButtonStyles.styles.ts;
  github.com/microsoft/fluentui-system-icons

Horizon round (§9):

- Industry: W3C DTCG spec v2025.10 stable (designtokens.org/tr/2025.10) +
  Resolver draft; Style Dictionary v4/v5 releases; Figma Schema 2025
  (DTCG export, extended collections) + Dev Mode MCP docs; Salesforce
  SLDS 2 styling hooks; Adobe spectrum-tokens README (v11→v12
  reduction) + spectrum-design-data; Shopify Polaris web-components
  deprecation notice; Nate Baldwin "Component-level Design Tokens: are
  they worth it?"; zeroheight Design Systems Reports 2025/2026; Brad
  Frost "Agentic Design Systems in 2026"
- Academia: Lamine & Cheng EMSE 2022 (arXiv:2205.10713); CAMELEON
  reference framework (Calvary et al. 2003); MARIA (Paternò et al.,
  TOCHI 2009); IFML (OMG 2014); UIDL review (UBICOMM 2016); Myers,
  Hudson & Pausch TOCHI 2000 (threshold/ceiling); Vanderdonckt ROCHI
  2008 post-mortem; Akiki et al. ACM CSUR 2014; Pleuss et al. EICS 2012
  (automation-vs-usability dilemma); SUPPLE (Gajos et al., AIJ 2010);
  Paulheim & Probst IJSWIS 2010 + UI2Ont; de Souza, Semiotic
  Engineering (MIT Press 2005); Piepenbrock et al. 2013/2014 (positive
  polarity); Parhi, Karlson & Bederson MobileHCI 2006 (9.2mm targets);
  Legge & Bigelow JoV 2011 (critical print size); WCAG3 contrast status
  (Roselli, Apr 2026; w3c/wcag3#29); Design2Code (arXiv:2403.03163);
  UICoder (arXiv:2406.07739); DesignRepair ICSE 2025
  (arXiv:2411.01606); SynCode/XGrammar/GAD (constrained decoding);
  "Let Me Speak Freely?" EMNLP 2024 (arXiv:2408.02442); UIClip UIST 2024
- Agentic: CHI 2026 comparative study (DOI 10.1145/3772363.3798616,
  registry 95.08% vs instructions 70.98%); shadcn CLI 3.0 + MCP
  changelog (Aug 2025); Storybook MCP + Component Manifests + the
  ds-mcp-experiment RFC; Vercel v0 Design Systems 2.0 (v0.json skills)
  + registry-starter; Figma "Design Systems And AI: Why MCP Servers Are
  The Unlock" (Aug 2025, 32%-trust figure); Atlassian "Building the
  context engine for the AI era" (May 2026, +52% accuracy); Google
  Stitch DESIGN.md; Supernova/zeroheight MCP docs; llms.txt adoption
  studies (~10%, no citation lift)


## §4c gate 3 — the provenance canary, built 2026-08-02

`scripts/check-provenance.py` (tier 1) and `scripts/check-values.py` (tier 2)
implement the "provenance canary" this document asks for. Run both; tier 1
first, because a file that fails its encoding gate is invisible to every
text-based check including tier 2.

**Tier 1 — citation lint.** Does the cited file still exist, and does the cited
token still appear in that clone? 2,318 citation strings, 299 distinct source
files resolved. Found and fixed one real defect: a Salt CSS *class* cited with
a `--` custom-property prefix, asserting a token that exists nowhere.

**Tier 2 — value re-resolution.** Parses the clones into token tables and
resolves each cited token through its own alias chain to a literal, then diffs
against the recorded value, colour-normalised. **210 colour slots verified,
zero drift.**

### What building it actually cost, and the warning that carries

Every number above is the *fifth* run. The first four were wrong, and each was
wrong in a way that produced confident, plausible output:

1. **158 phantom missing files** — the regex could not expand brace shorthand
   (`_md-comp-{elevated,filled}-card.scss`) and reported the truncated tail as a
   missing file.
2. **13 "missing" files that are missing on purpose** — chip proves shadcn has
   no chip by citing files that do not exist. A naive lint punishes the most
   rigorous evidence in the repo.
3. **9 phantom drifts** — M3's dark scheme is a separate module that redefines
   the same role names; consulting it as a *fallback* rather than *first* meant
   `md-sys-color` always returned the light value, so every dark slot
   "disagreed" with itself.
4. **1 phantom drift** — in v0_192 both schemes live in ONE file as
   `values-dark()` then `values-light()`; a flat parse indexes dark for every
   light role.
5. **Its own fix re-flagged** — a note explaining that a token is wrong must
   quote it, and the lint could not tell asserting from discussing.

**The transferable warning: a canary's own bugs look exactly like the drift it
is hunting.** Four of those five failures rendered as authoritative "this value
is wrong" reports. Had the repo been noisier, or had these run unattended into
a CI badge, the rational response to each would have been to "fix" correct data
to match a broken resolver — the canary would have *caused* the drift it exists
to catch. Every finding was disproved by re-reading source, not by trusting the
tool.

Practical consequence for §4c: **a drift report is a question, not a verdict.**
Before changing any value it accuses, confirm the resolver handles that value's
scheme, edition and scoping. Both scripts print their own limits for this reason.

### Known limits, deliberately not papered over

- **Colours only.** Sizes, spacing and typography are not re-resolved. That is
  tier 3 and is not built.
- **shadcn is skipped entirely** — 142 colour slots. Its values are Tailwind
  utility classes inside `cva()` strings, not tokens; resolving them needs a
  class-to-value table plus the oklch vars from `globals.css`. Reported as
  SKIPPED, never as passing.
- **175 slots carry no provenance entry at all** — they are values without a
  citation, so nothing can be re-resolved. This is the single largest coverage
  gap the canary exposes, and it is in our own data, not the clones.
- Salt resolves at theme-next / blue accent / medium density; other contexts are
  unchecked.
- A verified slot can still be the WRONG token for its attribute. Tier 2 proves
  a value has not moved, never that it was right. That stays rule 5's job.


## The third gate, built 2026-08-02 — behaviour conformance

`page/conformance.tsx` + `scripts/build-conformance.mjs` drive the real
skeletons in a real DOM and assert **observable behaviour**, one assertion per
behavior row. 38 assertions across dialog, select, tabs and card × 3 systems.

This closes the gap the per-component `check-*-behavior.mjs` gates could not:
they prove a row's code EXISTS and is bound to it; they cannot prove it RUNS.
Dialog shipped two effects that existed, were correctly written, correctly
cited, passed that gate, and never executed.

### It was verified by breaking it, and that mattered three times

A gate that has never failed proves nothing. The dialog defect was
deliberately reintroduced (dropping `mounted` from the effect's dependency
array) to confirm the harness turns red. It did not — and each failure to fail
taught something:

1. **The harness mounted the dialog already-open.** The defect only appears on
   the closed->open TRANSITION: with `open` true from the first render,
   `mounted` initialises true, the panel exists when the effect first runs, and
   the missing dependency never bites. **Test the transition a user performs,
   not the end state.**
2. **`setTimeout` is throttled to ~1/sec in a hidden tab.** The harness makes
   hundreds of yields; a timer-based settle turned a 2-second run into minutes
   and read as a hang. Now yields via `MessageChannel`, which is unthrottled and
   is what React's own scheduler uses.
3. **Fixed settles race React's scheduler.** A two-phase mount intermittently
   reported "no panel", and polling for focus arrival turned two more phantom
   failures (shadcn, M3 — focus lands a tick later than Salt) back into passes.
   **Asserting once cannot distinguish "never" from "not yet"**, and reading the
   second as a defect is how a harness manufactures bugs.

Final state: with the bug present the harness fails on all three systems; with
it fixed, 38/38 pass. Both directions confirmed.

### The pattern across all three gates built this session

Tier-2's canary, the two static gates, and this harness each produced confident
false positives before they produced a true one — 158 phantom missing files, 9
phantom colour drifts, 4 phantom unsized parts, 3 phantom focus failures. **A
new gate's own bugs are indistinguishable from the defects it hunts**, so every
one of them must be calibrated by deliberately breaking the thing it watches
before its output is trusted. An uncalibrated gate does not reduce risk; it
relocates it, and its authority makes the relocation harder to see.


## Correction to the tier-2 edition analysis (recorded 2026-08-02)

While re-pinning every M3 column to `v0.192`, the claim made here that **"all
104 M3 colour slots resolve identically in both editions"** was found to be
WRONG, and the method that produced it was unsound.

**The fact:** four light-mode roles differ between editions —
`on-primary-container`, `on-secondary-container`, `on-tertiary-container` and
`on-error-container` resolve to the **10** ramp step in v0.192 and the **30**
step in `latest` (verified directly: `_md-sys-color.scss:79` says
`$on-secondary-container: md-ref-palette.$secondary30` in latest, against
`'secondary10'` in v0.192's `values-light()`). Dark mode is identical and the
palette hexes are identical, which is why a spot check looked reassuring.

**The methodological error, which matters more than the fact.** The edition
diff only compared a candidate token when its *latest* value already matched
the recorded value:

    if not (a and same_value(a, rec)): continue    # then compare v0

Any slot whose recorded value did not agree with `latest` was skipped
silently — and a `continue` inside a candidate loop reports nothing at all,
so the run ended "0 changed" with no indication of how much it had declined to
look at. A filter that discards the cases most likely to be interesting, and
then reports totals as if it had examined everything, is worse than no check:
it converts unexamined into verified.

Two corrections follow, both applied:

1. **State the denominator.** "104 slots unchanged" was true only of slots that
   carried provenance AND already matched `latest`. The honest form is
   "104 of N examined, M skipped, for these reasons".
2. **Diff the source, not the subset.** The reliable method was the one used
   during the re-pin: diff the two editions' role maps directly and let the
   components fall out of it, rather than walking our own records and asking
   whether each still agrees.

This is the same failure the canary section already warns about, arriving from
the opposite direction. There the risk was a broken resolver manufacturing
false drift; here it was a well-behaved resolver manufacturing false calm. Both
come from trusting a tool's summary line without asking what it declined to
examine.
