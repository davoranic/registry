# Translation mechanics — the two-way rules

## A1 · The authoring rule

Everything new — token, component, pattern, layout — is authored AGAINST THE
CONTRACT and previewed through themes. Nothing is authored inside a theme.
This is what makes the registry two-way instead of N×N converters: with the
contract as the hub, adding a system costs one adapter, and everything ever
authored translates to it immediately.

## Render (contract → theme)

1. Resolve semantic tokens through the theme adapter (mode, density applied).
2. Resolve each anatomy part's recipe; apply state recipes.
3. Resolve canonical variants through the theme's variantMap.
4. Resolve icon roles through the theme's iconRoles (mechanism respected).
5. Apply theme constraints (fixed radius, frozen size axis, case rules).
6. Emit the translation report (below).

## Lift (theme → contract) — for designs captured inside one system

1. Identify components against anatomy files (parts present? states?).
2. Decompose variant names onto canonical axes.
3. Extract styling as token REFERENCES (never values) — anything styled with
   a raw value maps to the nearest slot or fails the lift.
4. Leftovers are one of: (a) a proposed CONTRACT EXTENSION (new slot/axis —
   goes through versioning), or (b) an anatomy-specific component flagged
   `themeBound`. No third category; nothing is dropped silently.

## Fallback ladder (target theme lacks something)

1. Theme-declared fallback (adapter `fallbacks` section)
2. Canonical default for the axis/slot
3. Omit + WARN

## The translation report (every render/lift emits one)

```json
{
  "lossless": false,
  "substitutions": [ { "wanted": "button prominence:link", "used": "Link component", "rule": "salt fallback" } ],
  "omissions": [],
  "warnings": [ "density axis ignored by target theme-shadcn" ]
}
```
Lossiness is allowed; silence about it is not.

## Adoption — systems learning components from each other

When system A has a component that system B lacks (Salt's stepper, shadcn's
input-otp), B may ADOPT it through the contract. Adoption is a lift + render,
with one extra split:

1. **Lift with the intent/character split.** A component's anatomy divides:
   - *intent-anatomy* — the parts, states, behavior, variant axes that make
     it that component (steps + connectors + current/complete/error states).
     This is what ports.
   - *character-anatomy* — the recipe details that are the origin system's
     accent (Salt's dotted connectors, flush borders, density response).
     This STAYS in the origin adapter as its recipe for the component.
2. **The contract component** references only semantic slots, canonical
   axes, icon roles — after the split it contains zero origin flavor by
   construction.
3. **Render through B's adapter.** B's tokens re-express it entirely in B's
   character. Character preservation is not a matter of care — the lifted
   definition has no channel through which foreign character could leak.

**Naturalization test** (an adopted component must be indistinguishable from
a native one):
- [ ] consumes only B's declared capabilities (no phantom density, no missing axes)
- [ ] passes B's constraints (Salt: sharp, uppercase actions; shadcn: radius knob)
- [ ] introduces no new tokens outside the growth loop
- [ ] every variant cell valued or fallback-declared
- [ ] behavior identical to origin (APG — behavior never varies)

Adoption precedents on file: stepper/rating/tree (Salt → contract → shadcn
rendering — the gaps already identified in salt-map.json `onlyInSalt`);
input-otp (shadcn → Salt candidate); status-pill (registry-native, renders
in both characters already — the proof case).

### Capability adoption is different from component adoption

Components adopt WITHOUT changing character (the split above guarantees it).
Capabilities are the opposite: **a capability IS character** — Salt's density
exists because it's a trading-floor system; shadcn's single comfortable scale
is a deliberate simplicity. Therefore:

- Mechanically, any theme can gain an axis cheaply — density is only a
  multiplier over contract rhythm slots (`space-unit`, `control-height-*`,
  `text-ui`, `icon-size`), not private magic of its origin.
- But granting it CHANGES the theme's character by definition, so it may
  never happen silently inside an existing adapter. It requires a NEW,
  explicitly named theme (e.g. `theme-shadcn-dense`) with its own
  capabilities block — a declared descendant, not a mutated original.
- Rule of thumb: **components naturalize; capabilities fork.**

## Governance

- The contract (tokens/semantic.md + contract/*) is versioned **semver**:
  patch = clarification · minor = additive slot/axis · major = rename/removal.
- Adapters declare `"contract": "<version>"`; conformance = LINKING.md
  checklist + slot-coverage check against semantic.md.
- Contract changes require: research note (docs/), migration note for
  adapters, and version bump in the same commit.
- Growth from onboarded systems follows LINKING.md §Growth (the
  most-demanding-teacher rule + acceptance criteria + naming grammar).
- Current version: **1.2.0**.
  - 1.1.0 — first growth pass (Salt color characteristics → border-subtle,
    field-* family, selected-indicator, target-*, content-disabled,
    data-7..12).
  - 1.2.0 — attribute audit (Salt cursor/borderStyle foundations + component
    inventory → cursor policy slots, border-style-emphasis, link-decoration,
    size-overlay ramp; per-corner rule and RTL/logical rule added to §4).
- **Attribute ownership rule** (closes the "any other attribute" question):
  every CSS-expressible attribute is owned by exactly one layer —
  (a) a CONTRACT slot if it carries system character (cursor, radius, case);
  (b) an ANATOMY detail if it's per-component structure (which corners, min
  widths per part, truncation); (c) THEME-INTERNAL otherwise. An attribute
  with no owner is a contract bug — file it through the growth loop.
