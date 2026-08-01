# davoranic/registry

A design-system registry built from scratch. This public GitHub repository
**is** the registry — no server, no build step.

## Architecture

1. **Base token contract** — [`tokens/base.css`](./tokens/base.css): the axes
   every theme must value (color roles, radius knob, rhythm, type, icons,
   focus). Components render from these names ONLY.
2. **Themes** — [`themes/`](./themes): a design system's *character* expressed
   as values for the contract plus a `capabilities` declaration. Capabilities
   differ by theme and constraints are explicit: `theme-salt` unlocks density
   (high/medium/low/touch) and fixes corners sharp; `theme-shadcn` has a free
   radius knob and no density.
3. **Components** — [`registry/`](./registry): defined once, themed by tokens.
   Anatomy specific to one system is allowed and flagged in that theme's
   `anatomySpecific` list.

## Consuming projects — two tiers

Theme-switching works by themes overwriting CONTRACT slots. How much of a
project switches depends on which language it speaks:

- **Tier 1 · Native (full switching).** The project authors against contract
  slots (`--surface`, `--action`, `type-action` role, `--control-h`…).
  EVERYTHING switches: colors, radius, type — and the character axes too
  (Salt's density compresses it, action text uppercases, cursors follow).
  All components installed from THIS registry are native (Phase 1.3).
- **Tier 2 · Compat (basic switching).** An existing shadcn-convention
  project (or ecosystem components like Magic UI) plugs in unchanged via the
  alias layer: `--background` → `--surface` etc. Colors, radius, and type
  switch across themes on day one — but the ~30 aliases only cover shadcn's
  vocabulary, so NEW semantics (density, field-* states, action case,
  cursor policy, selected-indicator) don't reach it until it migrates.

Rule: new work is authored native (translation.md A1); compat is a
**migration on-ramp**, not a destination. Migration is incremental — rename
slot by slot; both names resolve identically while you do.

Items are described in [`registry.json`](./registry.json) and installed with
the shadcn CLI:

```bash
npx shadcn@latest add davoranic/registry/theme-salt   # a theme
npx shadcn@latest add davoranic/registry/stepper      # an adopted component
```

## Items

| Item | Type | Description |
| --- | --- | --- |
| `theme-shadcn` | theme | The default character compiled from the semantic contract. |
| `theme-salt` | theme | Salt DS character: sharp, Salt blue, uppercase actions, density axis. |
| `stepper` | ui | Adopted from Salt via the contract — process steps with status states. |
| `rating` | ui | Adopted from Salt via the contract — star/icon rating, APG radio behavior. |
| `tree` | ui | Adopted from Salt via the contract — APG TreeView with full keyboard map. |

## Usage

```tsx
import { Stepper, StepperItem } from "@/components/ui/stepper"
import { Tree, TreeItem } from "@/components/ui/tree"
```

Components are authored against the semantic contract (`contract/anatomy/`)
and carry no token values — install a theme and they wear its character.

## Conventions

Items follow shadcn/ui new-york-v4 conventions: semantic tokens only
(never raw colors in components), cva variants, `data-slot` attributes,
Lucide icons at `size-4`. New tokens ship via the item's `cssVars`
(light + dark + `@theme` mapping) so installs stay one command.

## Adding a new item

1. Add source under `registry/<name>/`.
2. Describe it in `registry.json` (name, type, files, deps, cssVars).
3. Commit and push — the repo is the registry; there is nothing to deploy.
