# Deploying the docs site

`vercel.json` is strict JSON and rejects unknown keys, including a `//` comment
block — so the reasoning lives here instead.

## What Vercel runs

| | |
|---|---|
| build | `python3 1-intro/build/build-docs.py` |
| output | `1-intro/site` |
| install | skipped — the generator is stdlib Python, no dependencies |

`1-intro/site/` is gitignored on purpose: the site is **generated**, so Vercel
builds it rather than serving a commit.

## What Vercel does NOT run

**`build.sh` never runs in CI.** The gates need `3-source/` — the six
design-system clones, ~600MB — which are deliberately not in this repo and are
excluded again by `.vercelignore`.

So the gate results on the *Where we are* page come from
`2-build/out/gates.json`, written by the last local `./build.sh`, timestamped
and committed on purpose. The page states that they were not re-checked rather
than implying they were. **Run `./build.sh` locally before pushing**, or that
timestamp is what will tell you the green is stale.

## Routes

The docs occupy `/`. **`/r/*` is deliberately left unrouted** so the shadcn
install endpoint — `npx shadcn add davoranic/registry/<item>` — can be served
from this same project later without moving the docs off the domain.
