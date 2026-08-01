# Canonical state model + behavior contract

## States (closed list — components may not invent states)

| State | Meaning | Default token recipe (themes may override per component) |
|---|---|---|
| `rest` | default | the part's base recipe |
| `hover` | pointer over | `interaction-hover` surface (subtle) or `action-hover` (filled) |
| `active` | pressed | `interaction-active` / `action-active` |
| `focus-visible` | keyboard focus | `focus` color at `focus-width`, `focus-style`, `focus-offset` |
| `disabled` | not operable | 50% opacity + pointer-events none (Salt: 40% — theme override) |
| `loading` | busy | `loading` icon role spinning at `duration-slow`; disabled semantics |
| `selected` | chosen | `interaction-selected` / `on-interaction-selected` |
| `indeterminate` | partial | `remove` icon role in place of `success` mark |
| `invalid` | validation error | `status-critical` on `field-border` + focus + caption |
| `readonly` | visible, not editable | `surface-sunken`, `content-secondary`, no hover |
| `open` | expanded/overlay shown | `expand` icon role rotated; `elevation-overlay` |
| `dragging` | being dragged | `elevation-overlay` + `layer-overlay` |

Rules: states are orthogonal to variant axes; `focus-visible` must be
perceivable in every theme and mode (validation checklist); state recipes
reference ONLY semantic slots.

## Behavior contract

Behavior is **theme-invariant** and adopted from the WAI-ARIA Authoring
Practices (APG) pattern named in each anatomy file: keyboard interactions,
ARIA roles/properties, focus management, dismissal (Esc/outside-click),
typeahead. A theme may never alter behavior; if a source design system's
behavior differs from APG, the APG version wins inside this registry and the
difference is recorded in the theme's `constraints`.
