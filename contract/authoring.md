# Component authoring law

How every component in this registry is built. This is the systematic order —
no step may be skipped, and steps 4–5 are machine-checked in CI.

## The order

1. **Anatomy first.** A component exists only if `contract/anatomy/<name>.json`
   exists. Structure, parts, states, variant axes, behavior (APG), motion —
   all decided there, before any code.
2. **Structure from anatomy.** The TSX renders exactly the anatomy's parts:
   every part is an element carrying `data-slot="<part>"`; optional parts are
   conditional; content slots are children/props. Behavior implements the
   APG pattern named in the anatomy — nothing more, nothing less.
3. **Recipe as co-located CSS.** `<name>.css` next to the TSX, selectors on
   `[data-slot=…]` and `[data-state=…]` / `[data-*]` attributes, values
   referencing **contract slots only** — `var(--action)`, `var(--control-h)`,
   `var(--radius-control)`, `var(--duration-fast)`. No raw colors, no raw
   sizes, no theme names, no Tailwind color utilities. Character arrives
   entirely through the active theme's compiled CSS.
4. **States via canonical attributes.** `data-state` values come from
   contract/states.md; disabled uses `data-disabled` + `--cursor-disabled`;
   focus uses the `--focus-*` recipe. Variants via `data-<axis>` attributes
   matching contract/variants.md.
5. **Validation.** `scripts/check-component.py` verifies: all required
   anatomy parts appear as data-slots; the CSS references only contract
   slots; states/axes are canonical. CI-enforced with the other checks.
6. **Registry entry.** `registry.json` item lists both files; items wire
   (`var()` refs) but never carry values (conformance-guarded).

## Why co-located CSS, not utility classes

Utilities bind a component to one CSS framework's vocabulary; contract-slot
CSS binds it to the contract. The renderer (Phase 2), the showroom, and any
future framework target consume the identical recipe. Apps using Tailwind
still consume these components untouched — the CSS ships with the item.

## The exemplar

`registry/button/` is the reference implementation. Every later component is
reviewed against it. When in doubt, do what button does.
