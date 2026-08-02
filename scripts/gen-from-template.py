#!/usr/bin/env python3
"""Generator v2: template + columns -> CSS, skeleton config, panel data, coverage.

Channels:
  css    -> stylesheet rules per theme
  config -> skeleton configuration per theme, VALIDATED against
            template.skeletonParams (a value the skeleton cannot express
            fails the build — the expressibility gate)
  info   -> panel data only

Any locked row that is missing or off fails. Any raw color literal outside
a slots block fails. Failures set a nonzero exit code.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def load(p): return json.loads(Path(p).read_text())

def rule(selector, decls, scopes):
    if isinstance(scopes, str): scopes = [scopes]
    scoped = ", ".join(f"{sc} {s.strip()}" for sc in scopes for s in selector.split(","))
    body = "".join(f"  {k}: {v};\n" for k, v in decls.items())
    return f"{scoped} {{\n{body}}}\n"

def toggle_token(rid):
    """CSS attribute-selector-safe token for a row id, used as one entry in
    the space-separated data-off attribute (attribute selector ~=)."""
    return rid.replace(".", "-").replace("@", "-at-")

def resolve(cell):
    k = cell["kind"]
    if k in ("alias", "inherit"): return f"var(--{cell['slot']})"
    if k == "native": return f"var(--{cell['token']})"
    return cell.get("value")

def display(cell):
    k = cell["kind"]
    if k == "off": return "off"
    if k in ("alias", "inherit"): return f"-> {cell['slot']}"
    if k == "native": return f"-> {cell['token']} (native)"
    v = cell.get("value")
    return json.dumps(v) if isinstance(v, (dict, list, bool)) else str(v)

def generate(tpl, system):
    col = load(ROOT / "themes/columns" / f"{tpl['component']}.{system}.json")
    scope = f'[data-theme="{system}"]'
    css, slot_chunks = [f"/* GENERATED — {tpl['component']} x {system}. Do not edit. */\n"], set()
    fails, config, panel_cells = [], {}, {}
    report = {"system": system, "filled": 0, "off": 0, "inherited": 0}

    for f in col.get("fontFaces", []):
        slot_chunks.add(len(css))
        css.append(f"@font-face {{ font-family: '{f['family']}'; font-weight: {f['weight']}; font-style: normal; font-display: swap; src: url({f['file']}) format('woff2'); }}\n")

    slots = col.get("slots", {})
    def slot_block(sel, mapping):
        slot_chunks.add(len(css))
        css.append(sel + " {\n" + "".join(f"  --{k}: {v};\n" for k, v in mapping.items()) + "}\n")
    if slots.get("light"): slot_block(scope, slots["light"])
    if slots.get("dark"): slot_block(f'{scope}[data-mode="dark"], {scope} [data-mode="dark"]', slots["dark"])
    for d, mapping in (slots.get("byDensity") or {}).items():
        if d == "medium":
            slot_block(scope, mapping)
        else:
            slot_block(f'{scope}[data-density="{d}"], {scope} [data-density="{d}"]', mapping)
    # non-default accents: scoped overrides per mode (default accent lives in
    # the base light/dark blocks)
    for accent, modes in (slots.get("byAccent") or {}).items():
        if modes.get("light"):
            slot_block(f'{scope}[data-accent="{accent}"], {scope} [data-accent="{accent}"]', modes["light"])
        if modes.get("dark"):
            slot_block(f'{scope}[data-accent="{accent}"][data-mode="dark"], {scope}[data-mode="dark"] [data-accent="{accent}"], {scope}[data-accent="{accent}"] [data-mode="dark"]', modes["dark"])

    for sel, decls in tpl.get("base", {}).items():
        css.append(rule(sel, decls, scope))

    for row in tpl["rows"]:
        rid = row["id"]
        cell = col["cells"].get(rid)
        if cell is None:
            if row["channel"] == "info":
                # info rows document template-owned invariants; the template
                # itself is the cell for every column
                panel_cells[rid] = {"kind": "invariant", "display": "template-owned (identical in every column)"}
            elif row["policy"] == "locked":
                fails.append(f"{rid}: locked row has no cell")
                panel_cells[rid] = {"kind": "off", "display": "MISSING"}
            else:
                report["off"] += 1
                panel_cells[rid] = {"kind": "off", "display": "off"}
            continue
        panel_cells[rid] = {"kind": cell["kind"], "display": display(cell), "source": cell.get("source"), "note": cell.get("note")}
        if cell["kind"] == "off":
            if row["policy"] == "locked": fails.append(f"{rid}: locked row switched off")
            else: report["off"] += 1
            continue
        report["inherited" if cell["kind"] == "inherit" else "filled"] += 1

        if row["channel"] == "config":
            allowed = tpl["skeletonParams"].get(row["param"])
            v = cell.get("value")
            # a cell value may be a single value, or (for enum-listing prop
            # rows) a list of every value that prop accepts in this system —
            # check membership per-element in the list case.
            check = v if isinstance(v, list) and allowed is not None and not (len(allowed) and isinstance(allowed[0], list)) else [v]
            if allowed is not None:
                bad = [x for x in check if x not in allowed]
                if bad:
                    fails.append(f"{rid}: value(s) {bad!r} not expressible by skeleton param '{row['param']}' (allowed: {allowed})")
            config[row["param"]] = v
            if row["policy"] == "switchable":
                panel_cells[rid]["toggle"] = {"kind": "config", "param": row["param"]}
        elif row["channel"] == "css":
            # switchable rows with a real value get a live on/off gate: the
            # theme scope also requires the absence of a matching token in
            # data-off, so the panel can flip the token client-side without
            # regenerating CSS.
            css_scope = scope
            if row["policy"] == "switchable":
                token = toggle_token(rid)
                css_scope = f'{scope}:not([data-off~="{token}"])'
                panel_cells[rid]["toggle"] = {"kind": "css", "token": token}
            if row.get("cellIsDeclarations"):
                css.append(rule(row["selector"], cell["value"], css_scope))
            else:
                v = resolve(cell)
                css.append(rule(row["selector"], {k: t.replace("$", v) for k, t in row["declarations"].items()}, css_scope))

    literal = re.compile(r"#[0-9a-fA-F]{3,8}|\boklch\(|\brgb\(")
    for i, chunk in enumerate(css):
        if i == 0 or i in slot_chunks: continue
        if literal.search(chunk): fails.append(f"literal color outside slots: {chunk[:70]}")

    # matrix-completeness checks (owner rule: always check if the matrix is
    # missing a value)
    # 1. every color slot defined in light must be defined in dark, unless
    #    the column declares it modeInvariant (e.g. Salt's accent)
    colorish = re.compile(r"#[0-9a-fA-F]{3,8}|\boklch\(|\brgb\(|color-mix")
    invariant = set(col.get("modeInvariant", []))
    light_slots, dark_slots = slots.get("light", {}), slots.get("dark", {})
    if dark_slots:
        for name, v in light_slots.items():
            if colorish.search(str(v)) and name not in dark_slots and name not in invariant:
                fails.append(f"slot '{name}' has a light color value but no dark value (declare in dark or modeInvariant)")
    # 2. every var(--x) referenced by cells or base must resolve to a slot
    #    defined somewhere in this column
    defined = set(light_slots) | set(dark_slots)
    for mapping in (slots.get("byDensity") or {}).values():
        defined |= set(mapping)
    var_ref = re.compile(r"var\(--([a-zA-Z0-9-]+)(?:\s*,[^)]*)?\)")
    for i, chunk in enumerate(css):
        if i == 0 or i in slot_chunks: continue
        for ref in var_ref.findall(chunk):
            if ref not in defined:
                fails.append(f"var(--{ref}) referenced but not defined in any slot block")

    out = ROOT / "dist/gen"; out.mkdir(parents=True, exist_ok=True)
    (out / f"{tpl['component']}-{system}.css").write_text("".join(css))
    return report, fails, config, panel_cells

def main():
    component = sys.argv[1] if len(sys.argv) > 1 else "calendar"
    tpl = load(ROOT / "contract/templates" / f"{component}.template.json")
    systems = sorted(p.stem.split(".")[1] for p in (ROOT / "themes/columns").glob(f"{component}.*.json"))
    all_fails, configs, panel = [], {}, {"component": component, "behavior": tpl["behavior"], "rows": []}
    per_theme_cells = {}
    for s in systems:
        rep, fails, cfg, cells = generate(tpl, s)
        configs[s] = cfg; per_theme_cells[s] = cells; all_fails += [f"[{s}] {f}" for f in fails]
        print(("FAIL " if fails else "OK   ") + f"{s}: {rep['filled']} filled, {rep['off']} off, {rep['inherited']} inherited")
        for f in fails: print(f"   {f}")
    for row in tpl["rows"]:
        panel["rows"].append({"id": row["id"], "piece": row["piece"], "policy": row["policy"],
                              "channel": row["channel"], "note": row.get("note"),
                              "cells": {s: per_theme_cells[s].get(row["id"]) for s in systems}})
    out = ROOT / "dist/gen"
    (out / f"{component}-config.json").write_text(json.dumps(configs, indent=1))
    (out / f"{component}-panel.json").write_text(json.dumps(panel, indent=1))
    sys.exit(1 if all_fails else 0)

if __name__ == "__main__":
    main()
