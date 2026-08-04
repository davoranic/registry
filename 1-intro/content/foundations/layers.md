# Z-index / layer foundations

## Salt (`foundations/zindex.css`, complete set, density-invariant)

| layer | value |
|---|---|
| default | 1 |
| popout | 1000 |
| appHeader | 1100 |
| drawer | 1200 |
| modal | 1300 |
| notification | 1400 |
| dragObject | 1420 |
| contextMenu | 1450 |
| flyover | 1500 |

Salt is the only system with a named, shared z-index scale. shadcn and M3
both manage stacking per-component (each overlay component sets its own
`z-index` literal, or relies on DOM/portal order) — confirmed absent as a
shared token in both clones, not assumed.

Source: `salt-ds/packages/theme/css/foundations/zindex.css` (full file,
9 tokens).
