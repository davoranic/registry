# Cursor foundations

| role | Salt | shadcn | M3 |
|---|---|---|---|
| interactive/hover | `--salt-cursor-hover`: `pointer` | `default` (shadcn v4 buttons deliberately do NOT use `pointer` — confirmed in the calendar column's provenance notes; this is a stated character choice, not an omission) | `pointer` (convention, not a declared token in the sys files checked) |
| active/pressed | `--salt-cursor-active`: `pointer` | — | — |
| disabled | `--salt-cursor-disabled`: `not-allowed` | `default` (no distinct disabled cursor token) | `not-allowed` (convention) |
| busy/pending | `--salt-cursor-pending`: `progress` | — | — |
| readonly | `--salt-cursor-readonly`: `text` | — | — |
| text | `--salt-cursor-text`: `text` | — | — |
| grab / grab-active | `--salt-cursor-grab`: `grab` · `-grab-active`: `grabbing` | — | — |
| drag (horizontal/vertical) | `--salt-cursor-drag-ew`: `ew-resize` · `-drag-ns`: `ns-resize` | — | — |

Source: `salt-ds/packages/theme/css/foundations/cursor.css` (full file,
10 tokens — this is Salt's entire cursor vocabulary). shadcn/M3 values
are convention citations from component source, not a declared token
file — confirmed absent by direct search, not assumed.

**Flag.** Salt is the only system with a cursor foundation as a named,
reusable set. shadcn's choice to use `default` instead of `pointer` on
interactive controls is real and load-bearing (it changed the calendar's
nav-button and dropdown cursor cells earlier in this pipeline) — but it's
a per-component decision, not drawn from any shared vocabulary.
