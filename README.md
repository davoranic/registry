# davoranic/registry

A personal [shadcn registry](https://ui.shadcn.com/docs/registry). This public
GitHub repository **is** the registry — no server, no build step. Items are
described in [`registry.json`](./registry.json) and installed with the shadcn
CLI:

```bash
npx shadcn@latest add davoranic/registry/status-pill
```

## Items

| Item | Type | Description |
| --- | --- | --- |
| `status-pill` | ui | Pill-shaped status indicator with sentiment variants and an optional dot. Ships `success`/`warning` theme tokens. |
| `stat-card` | ui | KPI/metric card: title, tabular value, up/down trend badge, description. Composable parts. |
| `timeline` | ui | Vertical timeline with status dots, connector lines, titles, times, and descriptions. |
| `tag` | ui | Categorization label colored from the chart palette (`chart-1..5`), optional remove button. |

## Usage

```tsx
import { StatusPill } from "@/components/ui/status-pill"

<StatusPill variant="success">Filled</StatusPill>
<StatusPill variant="warning">Threshold</StatusPill>
<StatusPill variant="destructive">Rejected</StatusPill>
<StatusPill variant="info" showDot={false}>Queued</StatusPill>
```

## Conventions

Items follow shadcn/ui new-york-v4 conventions: semantic tokens only
(never raw colors in components), cva variants, `data-slot` attributes,
Lucide icons at `size-4`. New tokens ship via the item's `cssVars`
(light + dark + `@theme` mapping) so installs stay one command.

## Adding a new item

1. Add source under `registry/<name>/`.
2. Describe it in `registry.json` (name, type, files, deps, cssVars).
3. Commit and push — the repo is the registry; there is nothing to deploy.
