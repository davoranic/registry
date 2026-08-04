<!-- docs
title: shadcn/ui — foundation spec
nav: shadcn/ui
group: Foundations
badge: Foundation
description: One flat tier. 41 custom properties, and everything else is a Tailwind utility.
-->

# shadcn/ui — foundation spec

*Edition: **new-york-v4**. Measured from `ui/apps/v4/app/globals.css` on
2026-08-03.*

## Shape: one tier, and it is deliberately small

```
:root  41 custom properties     .dark  40 overrides
      ↓
everything else is a Tailwind utility class, in the component file
```

There is **no semantic tier and no component tier.** A shadcn component reads
`bg-primary` or `h-9` directly. That is not an omission — it is the distribution
model. You copy the component into your repo and edit it, so indirection you
would need in a published library is cost without benefit.

Consequence for this registry: shadcn's character lives in **utility classes
inside one `cva` call**, not in tokens. Extracting it means reading the component
file, not the theme.

## The 41 properties

| group | count | notes |
|---|---|---|
| sidebar | 8 | its own mini palette |
| chart | 5 | `chart-1..5`, all blue steps in v4 |
| code | 4 | code-block surfaces |
| card · popover · primary · secondary · muted · accent · destructive · surface · selection | 2 each | each a background + foreground pair |
| background · foreground · border · input · ring · radius | 1 each | the base |

Every colour is `oklch()`. The radius scale is **derived**, not enumerated:

```css
--radius: 0.625rem;
--radius-sm: calc(var(--radius) * 0.6);
--radius-md: calc(var(--radius) * 0.8);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) * 1.4);
```

So radius is a **single free knob** — the opposite of Salt, where corners are
fixed by the theme. That one difference is why `prop.radius` cannot be a shared
axis.

## What has no token at all

Sizes, spacing, motion and typography are Tailwind utilities, not custom
properties. A registry slot for shadcn's button height cites
`button.tsx: h-9` — a class in a component file — and `[S]` means the class was
read there, not resolved from a theme.

This is the honest asymmetry of the three systems: for Salt and M3 a value has an
address in a theme; for shadcn it often has an address in a component.

## How a registry slot cites into this

```json
"provenance": { "primary": "app/globals.css :root --primary" }
"provenance": { "height":  "button.tsx cva base: h-9" }
```

Both forms are `[S]`. The second cannot be re-resolved by
`scripts/check-values.py`, because there is no token to re-resolve — which is a
known limit of the tier-2 gate, not a gap in the data.
