# Semantic naming convention — the standard

The grammar every token name must follow. This exists so that tokens learned
from richer systems (the growth loop, LINKING.md §Growth) connect to the
contract mechanically, not by taste.

## The grammar

```
--[category]-[role](-[tone])(-[part])(-[prominence])(-[state])
```

| Position | Values | Rule |
|---|---|---|
| category | surface, on, content, action, interaction, field, border, status, data, focus, overlay, link, inverse, target, selected | closed list; extending it = contract minor version |
| role/tone | the semantic job (`raised`, `overlay`) or status tone (`info`, `critical`) | nouns/adjectives of INTENT, never of appearance |
| part | `border`, `surface`, `indicator` — when a family has multiple attributes | only when needed |
| prominence | `subtle` \| (default) \| `strong` — an ordered 3-tier scale | never more than 3 tiers |
| state | `hover`, `active`, `selected`, `disabled`, `readonly` | must be a canonical state (contract/states.md) |

Casing: kebab-case, lowercase. Pairing: every surface-like slot has an
`on-<name>` partner.

## Examples (valid)

`--surface-raised` · `--on-surface-raised` · `--field-border-hover` ·
`--status-critical-surface` · `--border-subtle` · `--interaction-selected` ·
`--data-4` · `--target-surface-hover`

## Forbidden

- **Appearance names**: `--blue-600`, `--gray-subtle` — raw ramps live only
  inside theme adapters, never in the contract.
- **Component names**: `--button-bg` — components consume slots; slots don't
  belong to components. (A component may define PRIVATE `--_btn-*` vars
  internally; underscore prefix, never part of the contract.)
- **States not in the state model**; prominence tiers beyond 3; abbreviations
  (`--bg`, `--fg`).
- **Numbered tokens with hidden meaning** — numbers only for ordinal sets
  where order is the only semantics (`data-1..12`).

## Mapping foreign grammars

Every major system's naming decomposes into this grammar; the adapter records
the decomposition:

| System | Their grammar | Example → ours |
|---|---|---|
| Salt | `salt-<characteristic>-<variant>-<attribute>-<state>` | `salt-editable-borderColor-hover` → `field-border-hover` |
| Material 3 | `md-sys-color-<role>` | `md-sys-color-on-primary` → `on-action` |
| Carbon | `<role>-<layer>-<state>` | `border-subtle-01` → `border-subtle` |
| Fluent | `colorNeutralForeground2` | → `content-secondary` |
| shadcn | `<role>(-foreground)` | `muted-foreground` → `content-secondary` |

Rule: the decomposition happens in the ADAPTER (one-way, R3). If a foreign
token cannot be decomposed into this grammar, it is either a growth candidate
(new slot, criteria below) or theme-internal (stays in the adapter).
