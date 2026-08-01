#!/usr/bin/env python3
"""lift.py — the dictionary, executable (contract/translation.md §Lift).

Reads a component from the shadcn clone, translates its utility classes
through the semantic dictionary (utility -> contract-slot CSS), and emits a
draft contract-native component: registry/<name>/<name>.tsx + <name>.css,
plus a lift report listing every word the dictionary could not translate —
unmapped words are dictionary growth candidates, never silent guesses.

Usage: lift.py <component-name>
Source: ../ui/apps/v4/registry/new-york-v4/ui/<name>.tsx
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHADCN_UI = ROOT.parent / "ui" / "apps" / "v4" / "registry" / "new-york-v4" / "ui"

# ---------------------------------------------------------------- dictionary
# utility -> CSS declaration(s) on contract slots. This IS the semantic
# dictionary; unmapped utilities are growth candidates for it.
DICT = {
    # layout
    "flex": "display: flex", "inline-flex": "display: inline-flex",
    "grid": "display: grid", "block": "display: block", "hidden": "display: none",
    "w-full": "width: 100%", "min-w-0": "min-width: 0", "w-fit": "width: fit-content",
    "items-center": "align-items: center", "justify-center": "justify-content: center",
    "justify-between": "justify-content: space-between",
    "shrink-0": "flex-shrink: 0", "flex-col": "flex-direction: column",
    "relative": "position: relative", "absolute": "position: absolute",
    "overflow-hidden": "overflow: hidden", "whitespace-nowrap": "white-space: nowrap",
    # rhythm (slots)
    "h-9": "height: var(--control-height-md)", "h-8": "height: var(--control-height-sm)",
    "h-10": "height: var(--control-height-lg)",
    "px-3": "padding-inline: calc(var(--space-unit) * 3)",
    "px-4": "padding-inline: var(--inset-control-x)",
    "px-2": "padding-inline: calc(var(--space-unit) * 2)",
    "py-1": "padding-block: var(--space-unit)",
    "py-2": "padding-block: calc(var(--space-unit) * 2)",
    "p-6": "padding: var(--inset-container)",
    "gap-2": "gap: var(--space-inline-md)", "gap-1": "gap: var(--space-inline-sm)",
    "gap-1.5": "gap: calc(var(--space-unit) * 1.5)",
    # shape (slots)
    "rounded-md": "border-radius: var(--radius-control)",
    "rounded-lg": "border-radius: var(--radius-overlay)",
    "rounded-xl": "border-radius: var(--radius-container)",
    "rounded-full": "border-radius: var(--radius-pill)",
    "border": "border: var(--border-width) solid var(--border)",
    "border-input": "border-color: var(--field-border)",
    "border-transparent": "border-color: transparent",
    # color (slots)
    "bg-transparent": "background: transparent",
    "bg-background": "background: var(--surface)",
    "bg-primary": "background: var(--action)",
    "bg-secondary": "background: var(--action-secondary)",
    "bg-muted": "background: var(--surface-sunken)",
    "bg-accent": "background: var(--interaction-hover)",
    "bg-popover": "background: var(--surface-overlay)",
    "text-foreground": "color: var(--on-surface)",
    "text-primary-foreground": "color: var(--on-action)",
    "text-muted-foreground": "color: var(--content-secondary)",
    "text-popover-foreground": "color: var(--on-surface-overlay)",
    # type
    "text-sm": "font-size: var(--text-ui)", "text-base": "font-size: var(--text-ui)",
    "text-xs": "font: var(--type-caption)",
    "font-medium": "font-weight: var(--ui-weight)",
    "leading-none": "line-height: 1",
    # elevation / focus / misc (slots)
    "shadow-xs": "box-shadow: var(--elevation-resting)",
    "shadow-sm": "box-shadow: var(--elevation-raised)",
    "shadow-md": "box-shadow: var(--elevation-overlay)",
    "shadow-lg": "box-shadow: var(--elevation-modal)",
    "outline-none": "outline: none",
    "transition-colors": "transition: color var(--duration-fast) var(--easing-standard), background-color var(--duration-fast) var(--easing-standard), border-color var(--duration-fast) var(--easing-standard)",
    "transition-[color,box-shadow]": "transition: color var(--duration-fast) var(--easing-standard), box-shadow var(--duration-fast) var(--easing-standard)",
    "cursor-default": "cursor: var(--cursor-interactive)",
    "cursor-pointer": "cursor: var(--cursor-interactive)",
    "select-none": "user-select: none",
    # focus-visible compound recipe (matched as whole utilities under prefix)
    "border-ring": "border-color: var(--field-border-active)",
    "ring-ring/50": "outline: var(--focus-width) solid color-mix(in oklab, var(--focus) 50%, transparent); outline-offset: var(--focus-offset)",
    "ring-[3px]": "",  # width carried by --focus-width above
    "ring-destructive/20": "outline: var(--focus-width) solid color-mix(in oklab, var(--status-critical) 20%, transparent)",
    "border-destructive": "border-color: var(--status-critical)",
    "opacity-50": "opacity: 0.5",
    "pointer-events-none": "pointer-events: none",
    "cursor-not-allowed": "cursor: var(--cursor-disabled)",
    # ---- growth pass (words met while lifting the showroom set) ----
    "bg-card": "background: var(--surface-raised)",
    "text-card-foreground": "color: var(--on-surface-raised)",
    "bg-border": "background: var(--border)",
    "bg-black/50": "background: var(--overlay-scrim)",
    "border-b": "border-block-end: var(--border-width) solid var(--border)",
    "border-t": "border-block-start: var(--border-width) solid var(--border)",
    "font-semibold": "font-weight: 600",
    "items-start": "align-items: flex-start",
    "self-start": "align-self: flex-start",
    "justify-self-end": "justify-self: end",
    "flex-1": "flex: 1",
    "flex-col-reverse": "flex-direction: column-reverse",
    "aspect-square": "aspect-ratio: 1 / 1",
    "text-left": "text-align: left",
    "text-center": "text-align: center",
    "align-middle": "vertical-align: middle",
    "caption-bottom": "caption-side: bottom",
    "overflow-x-auto": "overflow-x: auto",
    "overflow-y-auto": "overflow-y: auto",
    "overflow-x-hidden": "overflow-x: hidden",
    "fixed": "position: fixed",
    "inset-0": "inset: 0",
    "z-50": "z-index: var(--layer-modal)",
    "z-10": "z-index: var(--layer-sticky)",
    "size-full": "width: 100%; height: 100%",
    "h-px": "height: var(--border-width)",
    "gap-4": "gap: calc(var(--space-unit) * 4)",
    "gap-6": "gap: var(--inset-container)",
    "p-1": "padding: var(--space-unit)",
    "p-2": "padding: calc(var(--space-unit) * 2)",
    "px-6": "padding-inline: var(--inset-container)",
    "py-6": "padding-block: var(--inset-container)",
    "py-1.5": "padding-block: calc(var(--space-unit) * 1.5)",
    "pl-2": "padding-inline-start: calc(var(--space-unit) * 2)",
    "pr-8": "padding-inline-end: calc(var(--space-unit) * 8)",
    "mt-4": "margin-block-start: calc(var(--space-unit) * 4)",
    "my-1": "margin-block: var(--space-unit)",
    "rounded-sm": "border-radius: calc(var(--radius-knob) * 0.6)",
    "rounded-xs": "border-radius: calc(var(--radius-knob) * 0.4)",
    "size-4": "width: var(--icon-size-control); height: var(--icon-size-control)",
    "size-3": "width: var(--icon-size-inline); height: var(--icon-size-inline)",
    "size-3.5": "width: var(--icon-size-inline); height: var(--icon-size-inline)",
    "text-lg": "font: var(--type-heading-3)",
    "opacity-70": "opacity: 0.7",
    "sr-only": ("position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; "
                "overflow: hidden; clip-path: inset(50%); white-space: nowrap"),
    "transition-all": "transition: all var(--duration-fast) var(--easing-standard)",
    "transition-opacity": "transition: opacity var(--duration-fast) var(--easing-standard)",
    "duration-200": "transition-duration: var(--duration-base)",
    "focus-visible:outline-ring": "outline-color: var(--focus)",
    "focus:ring-ring": "outline-color: var(--focus)",
}

PREFIX_SELECTOR = {
    "": "{base}",
    "hover": "{base}:hover",
    "focus-visible": "{base}:focus-visible",
    "focus": "{base}:focus",
    "active": "{base}:active",
    "disabled": "{base}:disabled",
    "placeholder": "{base}::placeholder",
    "aria-invalid": '{base}[aria-invalid="true"]',
    "data-disabled": "{base}[data-disabled]",
}
SKIP_PREFIXES = {"dark", "md", "lg", "sm", "file", "selection", "peer", "group"}


def lift(name):
    src_path = SHADCN_UI / f"{name}.tsx"
    if not src_path.exists():
        sys.exit(f"no source: {src_path}")
    src = src_path.read_text()
    # class strings appear in className="…", cn("…"), and cva("…", {variants})
    class_strings = re.findall(r'(?:className=|cn\(|cva\()\s*"([^"]+)"', src)
    class_strings += re.findall(r'"([a-z][^"]*?(?:bg-|text-|border-|rounded-|h-|px-|py-|gap-|shadow-)[^"]*)"', src)
    utilities = [u for s in class_strings for u in s.split()]

    base_sel = f'[data-slot="{name}"]'
    rules, report = {}, {"component": name, "mapped": 0, "unmapped": [], "skipped_variants": []}
    for util in utilities:
        *prefixes, base = util.split(":")
        if any(p in SKIP_PREFIXES for p in prefixes):
            report["skipped_variants"].append(util)
            continue
        prefix = prefixes[-1] if prefixes else ""
        if prefix not in PREFIX_SELECTOR:
            report["unmapped"].append(util)
            continue
        decl = DICT.get(base)
        if decl is None:
            report["unmapped"].append(util)
            continue
        if decl:
            sel = PREFIX_SELECTOR[prefix].format(base=base_sel)
            rules.setdefault(sel, []).append(decl)
        report["mapped"] += 1

    out_dir = ROOT / "registry" / name
    out_dir.mkdir(parents=True, exist_ok=True)
    css = [f"/* LIFTED from shadcn/{name}.tsx via scripts/lift.py — the dictionary run in reverse.",
           f"   Review against contract/anatomy/{name}.json + the button exemplar before accepting.",
           f"   Unmapped words: see {name}.lift-report.json */\n"]
    for sel, decls in rules.items():
        body = "".join(f"  {d};\n" for d in dict.fromkeys(decls))
        css.append(f"{sel} {{\n{body}}}\n")
    (out_dir / f"{name}.css").write_text("\n".join(css))

    component = name.replace("-", " ").title().replace(" ", "")
    tag = "input" if name in ("input",) else "div"
    if tag == "input":
        jsx = f'<{tag} data-slot="{name}" {{...props}} />'
    else:
        jsx = f'<{tag} data-slot="{name}" {{...props}}>{{props.children}}</{tag}>'
    tsx = (f'import * as React from "react"\n\n'
           f'import "./{name}.css"\n\n'
           f'function {component}(props: React.ComponentProps<"{tag}">) {{\n'
           f'  return {jsx}\n'
           f'}}\n\n'
           f'export {{ {component} }}\n')
    (out_dir / f"{name}.tsx").write_text(tsx)
    (out_dir / f"{name}.lift-report.json").write_text(json.dumps(report, indent=2))
    return report


if __name__ == "__main__":
    name = sys.argv[1] if len(sys.argv) > 1 else "input"
    r = lift(name)
    print(f"lifted '{r['component']}': {r['mapped']} words translated, "
          f"{len(r['unmapped'])} unmapped, {len(r['skipped_variants'])} variant-skipped")
    if r["unmapped"]:
        print("unmapped (dictionary growth candidates):")
        for u in sorted(set(r["unmapped"])):
            print(f"  · {u}")
