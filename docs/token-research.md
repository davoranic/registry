# Token landscape research

What the major design systems define as tokens, compared, and what our
semantic layer must therefore cover. Sources: local clones (shadcn/ui v4,
@salt-ds/theme — values read from source), plus the published token
architectures of Material Design 3 (Google), Carbon (IBM), Fluent 2
(Microsoft), Radix Themes, and the W3C Design Tokens Community Group format.

## Category coverage by system

| Category | shadcn | Salt | Material 3 | Carbon | Fluent 2 | Radix Themes |
|---|---|---|---|---|---|---|
| Color: surface/on-pairs | ✅ bg/foreground pairs | ✅ container/content | ✅ surface + on-* | ✅ background/layer-01..03 | ✅ neutral ramp aliases | ✅ gray 1–12 steps |
| Color: interaction states | hover via `accent` | ✅ interact palette | ✅ state layers (8/12/12%) | ✅ *-hover tokens | ✅ pressed/hover aliases | ✅ steps 4/5 = hover/active |
| Color: status/sentiment | destructive only | ✅ info/success/warning/error + subtle bg + border | ✅ error family | ✅ support-* | ✅ status palettes | via accent scales |
| Typography: role-based | ❌ sizes only | ✅ display/h1-4/body/label/action/code | ✅ display/headline/title/body/label × L/M/S | ✅ productive/expressive roles | ✅ type ramp roles | size steps 1–9 |
| Spacing scale | 4px grid | ✅ density-scaled scale | 4dp grid | ✅ spacing-01..13 | ✅ spacing ramp | space 1–9 × scaling |
| Density axis | ❌ | ✅ high/medium/low/touch | ❌ (comfortable/compact in spec) | ❌ | ❌ | scaling factor 90–110% |
| Shape/radius | ✅ one knob | fixed sharp + pill | ✅ corner none→full scale | minimal | ✅ none→circular roles | ✅ radius factor |
| Elevation/shadow | raw shadow steps | ✅ shadow-lowest..medium + border strategy | ✅ levels 0–5 | ✅ + layer strategy | ✅ shadow 2–64 | ✅ shadows 1–6 |
| Motion | via tw-animate | ✅ duration instant/perceptible/notable/cutoff + animation vars | ✅ duration + easing roles (standard/emphasized) | ✅ productive/expressive durations + easings | ✅ durations + curves | ❌ |
| Z-index/layers | ad hoc | ✅ default→flyover ladder (1..1500) | ❌ (elevation implies) | ✅ | ✅ | ❌ |
| Iconography axes | size only (lib external) | ✅ size by density + own set + SemanticIconProvider | ✅ Material Symbols (fill/weight/grade/optical axes!) | ✅ 16/20/24/32 sizes | ✅ own set, sized ramp | ❌ (lib external) |
| Focus | ring recipe | ✅ focused characteristic (2px solid) | state layer | ✅ focus token | ✅ stroke tokens | ring color |
| Border widths | 1px implicit | ✅ borderStyle foundation | ✅ outline | ✅ | ✅ strokeWidth ramp | ❌ |

## Ground-truth values captured from clones

Salt (packages/theme/css/foundations): `--salt-duration-instant: 0ms`,
`perceptible: 300ms`, `notable: 1000ms`, `cutoff: 10000ms`; z-index ladder
`default 1 → popout 1000 → appHeader 1100 → drawer 1200 → modal 1300 →
notification 1400 → contextMenu 1450 → flyover 1500`; curve (radius) scale
0–5px + 999 pill; SemanticIconProvider with 33 icon roles.

shadcn (apps/v4): semantic color pairs, `--radius` knob with derived scale,
Tailwind 4px spacing, shadow-xs..lg steps, `.dark` class strategy,
tw-animate-css for motion, icon library external (lucide default).

## Conclusions → requirements for our semantic layer

1. **Every category above must have semantic slots** — the union, not the
   intersection. A theme may FIX a slot (Salt: radius=0) or leave an axis
   unsupported (shadcn: density) — but the slot must exist so linking is
   always a mapping exercise, never an invention exercise.
2. **Color needs paired on-colors, a full status family (with subtle
   backgrounds and borders — Salt/Carbon prove text-only isn't enough), and
   explicit interaction-state slots** (hover/active) rather than overloading
   `accent`.
3. **Typography must be role-based** (display/heading/body/label/caption/
   code), each role a composite (family/size/line/weight/tracking/case) —
   every system except shadcn does this, and Salt's uppercase `action` role
   is unexpressible without it.
4. **Elevation is semantic (resting/raised/overlay/modal), not raw shadows**,
   with a declared strategy: shadow-led (Material/Fluent) vs border-led
   (Salt/shadcn dark mode).
5. **Motion: duration roles + easing roles**, universally present (Material,
   Carbon, Fluent, Salt) — our biggest previous gap.
6. **Z-index must be a named ladder** — Salt/Carbon/Fluent all ship one;
   ad hoc z-indexes don't survive multi-system composition.
7. **Iconography needs four axes**: size role, style (outline/filled — and
   Material's variable axes reduce to this), set, and swap mechanism
   (import-level vs semantic-role provider), plus the semantic role list
   (close/expand/error/...) that Salt's provider and Material's usage prove.
8. **Density is a first-class optional axis** (Salt, Radix scaling) that
   multiplies rhythm slots as a group.
9. **Format**: slots should be expressible in the W3C DTCG token format
   (types: color, dimension, fontFamily, duration, cubicBezier, shadow,
   typography composite) so future tooling interops.
