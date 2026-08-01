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

## Governance

- The contract (tokens/semantic.md + contract/*) is versioned **semver**:
  patch = clarification · minor = additive slot/axis · major = rename/removal.
- Adapters declare `"contract": "<version>"`; conformance = LINKING.md
  checklist + slot-coverage check against semantic.md.
- Contract changes require: research note (docs/), migration note for
  adapters, and version bump in the same commit.
- Current version: **1.0.0**.
