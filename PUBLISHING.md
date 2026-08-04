# What goes to the website, and what stays in the repo

The website at **registry.davoranic.com** is a *visual record of what we did*.
It is not the project. The project is this repo.

That line is easy to blur, and blurring it has already caused two mistakes in
one session — both recorded at the bottom — so it is stated here rather than
left to habit.

## The rule

**One file is published. Everything else stays here.**

| | goes to the website | stays in the repo |
|---|---|---|
| `1-intro/site/index.html` | **yes — this, and only this** | generated, gitignored |
| `1-intro/content/*.md` | no — it is the *source* of that file | yes |
| `1-intro/build/` | no | yes |
| `2-build/**` | no | yes |
| `3-source/**` | no | **no** — own repos, ~600MB, gitignored |
| `2-build/out/**` | no | gitignored, except `gates.json` |

The site is a **single self-contained HTML file**: no external scripts, styles,
fonts or images. That is deliberate — it means publishing is a folder upload
with nothing to build, and the page cannot break because something it depended
on moved.

## How to publish

```bash
./build.sh                                  # gates -> generate -> sync -> site
cd 1-intro/site && npx vercel deploy --prod --yes
```

`1-intro/site/` is linked to the **registry** project. Vercel receives that
folder and nothing else — no source, no clones, no build step.

## Git auto-deploy is OFF, on purpose

The Vercel project is **disconnected from GitHub**. Pushing to `main` does not
deploy anything, and that is the intended behaviour.

It was connected once, and merging PR #1 immediately proved why it cannot be:
the git deploy built from the repo root, found no site there — `1-intro/site/`
is generated and gitignored — and published an empty deployment that took the
domain and served **404**. The manual folder deploy from twenty minutes earlier
was silently overridden. Nothing errored; the site simply went dark.

Reconnecting it would require either committing the generated site (and losing
the guarantee that it is always freshly built) or building on the host again
(and taking back both traps below). **Deploy by hand.**

## Three traps, all hit on 2026-08-04

**1 · Never pass a path to `vercel deploy`.** `vercel deploy 1-intro/site`
infers the project from the *folder name*: it silently created a new project
called **`site`** and deployed there, while `registry.davoranic.com` kept
serving the previous build. Nothing errored. `cd` into the folder instead — it
carries its own `.vercel` link.

**2 · A push to `main` used to deploy an empty site.** See above — git
integration is now disconnected.

**3 · Do not build on Vercel.** An earlier setup uploaded the whole workspace
and ran the generator remotely. It worked, but it meant the host needed Python,
the repo's shape became a deploy dependency, and `vercel.json` — which rejects
unknown keys, including a `//` comment — became a thing that could fail a
deploy. Building locally and shipping one file removes all of it.

## The gates are a record, not a live check

The *Where we are* page shows gate results from `2-build/out/gates.json`,
written by the last local `./build.sh` and timestamped. Nothing on the host can
re-run them: they need `3-source/`, which is not published anywhere.

So **run `./build.sh` before publishing**. The page states when the gates last
ran and that they were not re-checked, which makes a stale green visible — but
only if the timestamp is honest.
