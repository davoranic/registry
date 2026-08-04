# Motion foundations

## Duration

| tier | Salt | M3 |
|---|---|---|
| instant | `--salt-duration-instant`: 0ms | `short1`: 50ms |
| fast | — | `short2`: 100ms · `short3`: 150ms · `short4`: 200ms |
| standard | `--salt-duration-perceptible`: 300ms | `medium1`: 250ms · `medium2`: 300ms · `medium3`: 350ms · `medium4`: 400ms |
| slow | `--salt-duration-notable`: 1000ms | `long1`: 450ms · `long2`: 500ms · `long3`: 550ms · `long4`: 600ms |
| extra-slow | `--salt-duration-cutoff`: 10000ms (a ceiling, not a typical animation length) | `extra-long1`: 700ms · `extra-long2`: 800ms · `extra-long3`: 900ms · `extra-long4`: 1000ms |

shadcn: no duration foundation — components use bare Tailwind classes
(`duration-100`, `duration-200`) per-instance, undeclared as a shared
scale.

Source: `salt-ds/packages/theme/css/foundations/duration.css` (4 tokens,
the complete set); `material-web/tokens/versions/v0_192/_md-sys-motion.scss`
(16 duration tokens, the complete set — M3's scale is 4× finer-grained
than Salt's).

## Easing

| Salt | M3 |
|---|---|
| `--salt-animation-timing-function`: `ease-in-out` (Salt declares exactly one easing curve, reused everywhere — no named alternatives) | `standard`: `cubic-bezier(0.2,0,0,1)` · `standard-accelerate`: `(0.3,0,1,1)` · `standard-decelerate`: `(0,0,0,1)` · `emphasized`: `(0.2,0,0,1)` · `emphasized-accelerate`: `(0.3,0,0.8,0.15)` · `emphasized-decelerate`: `(0.05,0.7,0.1,1)` · `legacy`: `(0.4,0,0.2,1)` · `legacy-accelerate`: `(0.4,0,1,1)` · `legacy-decelerate`: `(0,0,0.2,1)` · `linear`: `(0,0,1,1)` |

Source: `salt-ds/packages/theme/css/foundations/animation.css`;
`material-web/tokens/versions/v0_192/_md-sys-motion.scss` (10 easing
tokens, the complete set — M3 Expressive's spring-physics tokens, per
earlier research in ARCHITECTURE-V2.md §8c/§9a, are a **2025 addition not
present in this v0.192 snapshot** — flagged, not fabricated).

## Salt's own keyframes (the only system with named, reusable animations)

`foundations/animation.css` defines 12 complete `@keyframes` blocks, all
parameterized by 2 shared variables (`--salt-animation-opacity-start/end`
= 0/1, `--salt-animation-transform-start/end` = 100%/0,
`--salt-animation-scale-start/end` = 0/1) and one shared duration+easing
pair: `slide-in/out-{top,left,right,bottom}` (8 total),
`fade-in-{back,forward,center}`, `fade-out-back`. shadcn ships motion via
the `tw-animate-css` package (external, per-component, not a Salt-style
shared keyframe library); M3's `_md-sys-motion.scss` defines duration and
easing VALUES only — no keyframes of its own (keyframes are the
implementing framework's job, e.g. Compose/Flutter/CSS consumers write
their own).

Source: `salt-ds/packages/theme/css/foundations/animation.css` (full
file, all 12 keyframe blocks).
