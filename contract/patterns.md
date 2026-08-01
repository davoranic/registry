# Pattern & layout contract

A pattern is DATA, not pixels: named regions composing contract components
with canonical variants and layout tokens. Because a pattern references only
contract names, it renders into any theme automatically and inherits that
theme's characteristics (Salt density compresses it, sharp corners apply;
shadcn radius rounds it). Patterns are the unit for "design once, translate
everywhere."

## Layout tokens (contract-level data — adapters may override)

- Breakpoints: `sm 640` · `md 768` · `lg 1024` · `xl 1280` (px; data, not CSS vars)
- `container-max`: 1120px default
- Region gaps: `space-stack-*` / `space-inline-*` roles from the token contract
- Label placement axis (forms): `top` | `left` — a theme capability
  (Salt supports both; shadcn convention is `top`)

## Pattern spec format

```json
{
  "name": "<pattern>",
  "intent": "one sentence — what user job this serves",
  "regions": [ { "region": "<name>", "order": 1, "components": [ ... ] } ],
  "components": "referenced by CONTRACT name + canonical variants only",
  "contentSlots": [ "headline", "helper", ... ],
  "layout": { "flow": "stack|split|grid", "gap": "space-stack-md", "max": "24rem" },
  "responsive": [ { "below": "md", "change": "..." } ],
  "a11y": [ "landmark/heading rules" ]
}
```

## Worked example — `login`

```json
{
  "name": "login",
  "intent": "Authenticate a returning user with email and password.",
  "regions": [
    { "region": "brand", "order": 1, "components": [], "contentSlots": ["logo", "headline", "supporting"] },
    { "region": "form", "order": 2, "components": [
      { "component": "field", "contentSlots": ["label:Email"], "children": [{ "component": "input", "props": { "type": "email" } }] },
      { "component": "field", "contentSlots": ["label:Password", "meta-link:Forgot password?"], "children": [{ "component": "input", "props": { "type": "password" } }] }
    ]},
    { "region": "actions", "order": 3, "components": [
      { "component": "button", "variants": { "emphasis": "primary", "prominence": "solid" }, "contentSlots": ["label:Log in"], "width": "fill" },
      { "component": "button", "variants": { "emphasis": "secondary", "prominence": "outline" }, "contentSlots": ["label:Continue with SSO"], "width": "fill" }
    ]},
    { "region": "meta", "order": 4, "components": [], "contentSlots": ["signup-prompt"] }
  ],
  "layout": { "flow": "stack", "gap": "space-stack-md", "max": "24rem", "container": "surface-raised @ elevation-raised, radius-container, inset-container" },
  "responsive": [ { "below": "sm", "change": "container becomes full-bleed on surface; inset-container halves" } ],
  "a11y": [ "form landmark", "headline is heading-2", "meta-link reachable after password field" ]
}
```

Rendered through theme-shadcn: rounded raised card, 36px controls, sentence-
case buttons. Rendered through theme-salt (medium): sharp bordered panel,
28px controls, uppercase blue actions — same data, both directions provable
against the anatomy + variant + token contracts.

## Rules

- Patterns may not reference theme names, raw values, or theme-specific
  components — anatomy-specific components make a pattern theme-bound and
  must be declared as such (`themeBound: "salt"`).
- New layouts (shells, dashboards) follow the same spec: regions + contract
  references. A shell's nav/header/aside/content regions live here, sized by
  layout tokens.
