# Size foundations

Control, icon, and indicator size scale. Cell format: token → value(s).

| token | high | medium | low | touch/mobile | shadcn | M3 |
|---|---|---|---|---|---|---|
| control height (`--salt-size-base`) | 20px | 28px | 36px | 44px | no density scale; `--cell-size: --spacing(8)` = 2rem = 32px, per-component, not a foundation (`ui/.../calendar.tsx`) | 40px (`date-state-layer-width/height`, `_md-comp-date-picker-docked.scss`) — M3 sizes per-component-per-density-class, not a single global control-height foundation |
| icon size (`--salt-size-icon`) | 10px | 12px | 14px | 16px | no foundation; Tailwind `size-3.5`/`size-4` read per-component | no single icon-size foundation token in the tokens-only clone; M3 icon sizing lives in Material Symbols variable-font `opsz` axis (20–48dp), a font axis, not a CSS size token |
| bar/track (`--salt-size-bar`) | 2px | 4px | 6px | 8px | — | — |
| bar-strong (`--salt-size-bar-strong`) | 4px | 8px | 12px | 16px | — | — |
| adornment (`--salt-size-adornment`) | 6px | 8px | 10px | 12px | — | — |
| indicator (`--salt-size-indicator`) | 2px | 3px | 4px | 5px | — | — |
| selectable (`--salt-size-selectable`) | 12px | 14px | 16px | 18px | — | — |
| fixed scale (`--salt-size-fixed-100..900`) | 1px–9px, density-invariant, all 5 densities identical | — | — |

Source: `salt-ds/packages/theme/css/foundations/size.css` (full file, all
density blocks); shadcn per-component citations as noted (no dedicated
size foundation file exists in the clone — confirmed by absence, not
assumed); `material-web/tokens/versions/v0_192/_md-comp-date-picker-docked.scss`.

**Flag.** Salt is the only system with a *foundation-level* size scale
that every component draws from. shadcn's sizes are per-component
Tailwind literals (no shared source). M3 sizes are per-component-token
files (`_md-comp-*.scss`), each hardcoding its own dp values — M3 has a
size *system* (consistent naming, consistent density-class logic) but not
a single shared size-scale *file* the way Salt does.
