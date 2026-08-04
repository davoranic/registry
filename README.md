# UI Registry

**One component definition, rendered as a native of three different design systems.**

This repo tests one question: *can any UI repository on GitHub be consumed as a
theme?* Salt, shadcn/ui and Material 3 were chosen for their distance from each
other — young to enterprise to spec-first — and every value is extracted from
their source with a citation back to the file it came from.

Start with **[1-intro/site/index.html](1-intro/site/index.html)** (open it in a
browser) or read the markdown it is built from in
[`1-intro/content/`](1-intro/content/).

```bash
./build.sh      # gates -> generate -> sync -> rebuild the site. Run after ANY change.
```

## The tree

Three folders, three verbs: **read**, **build**, **explain**. Nothing in
`3-source/` is ever written; nothing in `site/` or `out/` is ever hand-edited.

```
1-intro/                     the story, and the site built from it
├── content/                 MARKDOWN IS THE SOURCE — edit here
│   ├── 01-use-case.md       why the project exists: background, problem, outcome
│   ├── 02-discovery.md      how the method was determined
│   ├── 03-matrix.md         what a matrix is, and how we got to it
│   ├── 04-component-map.md  all 79 canonical components across the three systems
│   ├── foundations/         one spec per design system + the raw-value categories
│   └── research/            architecture-v2.md — the researched design
├── build/                   build-docs.py + docs-shell.css (the generator)
└── site/                    index.html — GENERATED, never hand-edited

2-build/                     the machine: where a component is cast
├── contract/                template.schema.json (the enforced vocabulary)
│   └── templates/           one per component — the ROWS
├── columns/                 one per system per component — the ANSWERS
├── skeleton/                the union renderers
├── matrices/                per-component *-MATRIX.md (prose + generated values)
├── harness/                 check pages + the behaviour conformance rig
├── tools/                   generators: gen-from-template, sync-matrix-values, build-index
├── gates/                   the checks: provenance, values, structure, anatomy, behaviour
└── out/                     generated CSS + rendered pages — GENERATED

3-source/                    READ ONLY. Never edited, only grepped
├── salt-ds/  ui/  material-web/        the three under test
└── primitives/  magicui/  animate-ui/  behaviour and motion reference
```

**The folder names in `3-source/` must not change.** 107 provenance strings in
`2-build/columns/` cite paths inside them; renaming `ui/` would silently
invalidate every one of those citations.

## State, measured 2026-08-04

| | |
|---|---|
| components built | **13**, covering 14 of 79 canonical rows |
| attributes in the contract | **817**, of which **658** differ across the three systems |
| verified to render a different part-set per system | **12 of 13** |
| citations | **2,334**, resolving to 305 distinct source files |
| token values re-resolved against source | **208 verified, 0 drift** |
| value slots with no citation yet | **246 of 497** — the largest open debt |

The claim is proven at 13 components, not at 79.

## Two rules that outrank convenience

**Never retrofit.** A component built on one system's chassis with the others
draped over it can never express a part the chassis lacks. Five rebuilds died
this way; `gates/check-anatomy.mjs` exists solely to make it detectable.

**Values come from source, with provenance.** Never a bare number, never a value
recalled from memory. If it cannot be found, that is a recorded gap — not a
plausible guess.

The operating manual — the law, the six-segment anatomy, the ten-step build
loop, and where work stopped — is [`CLAUDE.md`](CLAUDE.md).
