#!/usr/bin/env python3
"""Pattern renderer — the two-way proof (contract/translation.md §Render).

Usage: render-pattern.py <pattern-name> [<theme-name> ...]

Reads contract/patterns/<name>.json, renders it through each theme adapter
into dist/patterns/<pattern>.<theme>.html (self-contained: base.css + the
compiled theme + component CSS written purely against contract slots), and
emits a translation report per render. Components covered: field, input,
button, switch, separator, badge, table. Anything else lands in the report
as an omission — lossiness is allowed; silence about it is not.
"""
import html
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Component CSS: contract slots ONLY — character arrives via the theme file.
COMPONENT_CSS = """
* { box-sizing: border-box; }
body { margin: 0; padding: 48px 24px; background: var(--surface);
  color: var(--on-surface); font-family: var(--font-sans);
  font-size: var(--text-ui); line-height: 1.45; }
.dark body, body.dark { background: var(--surface); }
[data-pattern] { margin: 0 auto; display: flex; flex-direction: column;
  gap: calc(var(--space-unit) * 4); }
[data-container] { background: var(--surface-raised); color: var(--on-surface-raised);
  border: var(--border-width) solid var(--border);
  border-radius: var(--radius-container); padding: var(--inset-container);
  box-shadow: var(--elevation-raised); display: flex; flex-direction: column;
  gap: calc(var(--space-unit) * 4); }
[data-region] { display: flex; flex-direction: column; gap: calc(var(--space-unit) * 3); }
[data-region][data-flow="row"] { flex-direction: row; align-items: center;
  gap: calc(var(--space-unit) * 2); }
[data-align="end"] { margin-left: auto; }
h2 { margin: 0; font: var(--type-heading-2); letter-spacing: -0.02em; }
p[data-slot="supporting"] { margin: 0; color: var(--content-secondary); }
[data-slot="button"] { display: inline-flex; align-items: center;
  justify-content: center; gap: calc(var(--space-unit) * 2);
  height: var(--control-h); padding: 0 var(--control-px);
  border: var(--border-width) solid transparent;
  border-radius: var(--radius-control); font-family: var(--font-sans);
  font-size: var(--text-ui); font-weight: var(--ui-weight);
  text-transform: var(--action-case); letter-spacing: var(--action-tracking);
  cursor: var(--cursor-interactive); box-shadow: var(--elevation-resting);
  transition: background var(--duration-fast) var(--easing-standard); }
[data-variant~="solid"][data-emphasis="primary"] { background: var(--action); color: var(--on-action); }
[data-variant~="solid"][data-emphasis="secondary"] { background: var(--action-secondary); color: var(--on-action-secondary); }
[data-variant~="outline"] { background: transparent; color: var(--on-surface);
  border-color: var(--border); box-shadow: none; }
[data-variant~="outline"][data-emphasis="primary"] { color: var(--action); border-color: var(--action); }
[data-variant~="ghost"] { background: transparent; color: var(--on-surface); box-shadow: none; }
[data-width="fill"] { width: 100%; }
[data-slot="field"] { display: flex; flex-direction: column; gap: calc(var(--space-unit) * 1.5); }
[data-slot="field"][data-orientation="horizontal"] { flex-direction: row;
  align-items: center; justify-content: space-between; }
[data-slot="label"] { font: var(--type-label); }
[data-slot="meta-link"] { font: var(--type-caption); color: var(--link);
  text-decoration: var(--link-decoration); text-underline-offset: var(--link-decoration-offset);
  margin-left: auto; }
[data-slot="field-header"] { display: flex; align-items: baseline; }
[data-slot="description"] { font: var(--type-caption); color: var(--content-secondary); }
[data-slot="input"] { height: var(--control-h); padding: 0 calc(var(--space-unit) * 3);
  background: var(--field-surface); color: var(--on-surface);
  border: var(--border-width) solid var(--field-border);
  border-radius: var(--radius-control); font-family: var(--font-sans);
  font-size: var(--text-ui); width: 100%; }
[data-slot="input"]:hover { background: var(--field-surface-hover); border-color: var(--field-border-hover); }
[data-slot="input"]:focus { outline: var(--focus-width) solid
  color-mix(in oklab, var(--focus) 60%, transparent); outline-offset: var(--focus-offset);
  border-color: var(--field-border-active); }
[data-slot="switch"] { position: relative; width: calc(var(--control-h) * 0.9);
  height: calc(var(--control-h) * 0.5); border-radius: var(--radius-pill);
  background: var(--field-border); flex-shrink: 0; cursor: var(--cursor-interactive); }
[data-slot="switch"][data-state="checked"] { background: var(--action); }
[data-slot="switch"]::after { content: ""; position: absolute; top: 2px; left: 2px;
  width: calc(var(--control-h) * 0.5 - 4px); height: calc(var(--control-h) * 0.5 - 4px);
  border-radius: var(--radius-pill); background: var(--surface-raised);
  transition: transform var(--duration-fast) var(--easing-standard); }
[data-slot="switch"][data-state="checked"]::after { transform: translateX(calc(var(--control-h) * 0.4)); }
[data-disabled] { opacity: 0.5; pointer-events: none; cursor: var(--cursor-disabled); }
[data-slot="separator"] { border: 0; border-top: var(--border-width) solid var(--border-subtle); margin: 0; }
[data-slot="badge"] { display: inline-flex; align-items: center;
  border-radius: var(--radius-pill); padding: 2px calc(var(--space-unit) * 2.5);
  font: var(--type-caption); font-weight: var(--ui-weight); }
[data-slot="table"] { width: 100%; border-collapse: collapse; }
[data-slot="table"] th { font: var(--type-label); color: var(--content-secondary);
  text-align: left; padding: calc(var(--space-unit) * 2) calc(var(--space-unit) * 3);
  border-bottom: var(--border-width) solid var(--border); }
[data-slot="table"] td { padding: calc(var(--space-unit) * 2) calc(var(--space-unit) * 3);
  border-bottom: var(--border-width) solid var(--border-subtle); }
[data-slot="table"] .data { font: var(--type-data); text-align: right; }
[data-slot="caption"] { font: var(--type-caption); color: var(--content-secondary); }
"""

def esc(s):
    return html.escape(str(s), quote=True)

def render_component(c, theme, report):
    name = c.get("component")
    slots = c.get("contentSlots", {})
    props = c.get("props", {})
    attrs = ""
    if c.get("width"): attrs += f' data-width="{c["width"]}"' if c["width"] == "fill" else f' style="width:{c["width"]}"'
    if c.get("align"): attrs += f' data-align="{c["align"]}"'
    if name == "button":
        v = c.get("variants", {})
        key = f'emphasis:{v.get("emphasis","primary")}+prominence:{v.get("prominence","solid")}'
        vmap = theme.get("variantMaps", {}).get("button", {})
        if key in vmap:
            pass
        elif key in vmap.get("fallbacks", {}):
            report["substitutions"].append({"wanted": f"button {key}", "used": vmap["fallbacks"][key], "rule": "theme fallback"})
        else:
            report["warnings"].append(f"button {key}: no mapping in theme '{theme['name']}' — canonical default applied")
        return (f'<button data-slot="button" data-emphasis="{v.get("emphasis","primary")}" '
                f'data-variant="{v.get("prominence","solid")}"{attrs}>{esc(slots.get("label",""))}</button>')
    if name == "input":
        return (f'<input data-slot="input" type="{props.get("type","text")}" '
                f'placeholder="{esc(props.get("placeholder",""))}" value="{esc(props.get("value",""))}"{attrs}>')
    if name == "switch":
        state = ' data-state="checked"' if props.get("checked") else ""
        dis = ' data-disabled=""' if props.get("disabled") else ""
        return f'<span data-slot="switch" role="switch" aria-checked="{str(bool(props.get("checked"))).lower()}"{state}{dis}></span>'
    if name == "separator":
        return '<hr data-slot="separator">'
    if name == "field":
        header = f'<span data-slot="label">{esc(slots.get("label",""))}</span>'
        if "meta-link" in slots:
            header = f'<span data-slot="field-header">{header}<a data-slot="meta-link" href="#">{esc(slots["meta-link"])}</a></span>'
        desc = f'<span data-slot="description">{esc(slots["description"])}</span>' if "description" in slots else ""
        children = "".join(render_component(ch, theme, report) for ch in c.get("children", []))
        orientation = f' data-orientation="{c["orientation"]}"' if c.get("orientation") else ""
        if c.get("orientation") == "horizontal":
            label_col = f'<span style="display:flex;flex-direction:column;gap:2px">{header}{desc}</span>'
            return f'<div data-slot="field"{orientation}>{label_col}{children}</div>'
        return f'<div data-slot="field">{header}{children}{desc}</div>'
    if name == "table":
        cols = props.get("columns", [])
        data_cls = ' class="data"'
        head = "".join(
            "<th" + (data_cls if col.get("align") == "end" else "") + ">" + esc(col["label"]) + "</th>"
            for col in cols)
        body = ""
        for row in props.get("rows", []):
            cells = ""
            for i, cell in enumerate(row):
                cls = data_cls if cols[i].get("align") == "end" else ""
                if isinstance(cell, dict) and "badge" in cell:
                    b = cell["badge"]
                    tone = b["tone"]
                    badge = ('<span data-slot="badge" style="background:var(--status-' + tone +
                             '-surface);color:var(--status-' + tone + ')">' + esc(b["label"]) + "</span>")
                    cells += "<td>" + badge + "</td>"
                else:
                    cells += "<td" + cls + ">" + esc(cell) + "</td>"
            body += "<tr>" + cells + "</tr>"
        return f'<table data-slot="table"><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>'
    report["omissions"].append(f"component '{name}' not supported by this renderer")
    return f"<!-- omitted: {esc(name)} -->"

def render_region(region, theme, report):
    parts = []
    slots = region.get("contentSlots", {})
    if "headline" in slots: parts.append(f"<h2>{esc(slots['headline'])}</h2>")
    if "supporting" in slots: parts.append(f'<p data-slot="supporting">{esc(slots["supporting"])}</p>')
    for c in region.get("components", []):
        parts.append(render_component(c, theme, report))
    for key in ("prompt", "summary", "placeholder"):
        if key in slots: parts.append(f'<span data-slot="caption">{esc(slots[key])}</span>')
    flow = ' data-flow="row"' if region.get("region") in ("toolbar", "actions", "header") and len(region.get("components", [])) > 1 else ""
    return f'<section data-region="{region["region"]}"{flow}>{"".join(parts)}</section>'

def render(pattern_name, theme_name):
    pattern = json.loads((ROOT / "contract" / "patterns" / f"{pattern_name}.json").read_text())
    theme = json.loads((ROOT / "themes" / f"theme-{theme_name}.json").read_text())
    report = {"pattern": pattern_name, "theme": theme_name, "substitutions": [], "omissions": [], "warnings": []}
    regions = "".join(render_region(r, theme, report) for r in sorted(pattern["regions"], key=lambda r: r["order"]))
    layout = pattern.get("layout", {})
    container = f'<div data-container>{regions}</div>' if layout.get("container", {}).get("surface") == "surface-raised" else regions
    width = layout.get("max", "40rem")
    base_css = (ROOT / "tokens" / "base.css").read_text()
    theme_css = (ROOT / "dist" / f"theme-{theme_name}.css").read_text()
    doc = (f"<!doctype html><html><head><meta charset='utf-8'>"
           f"<title>{pattern_name} · {theme_name}</title>"
           f"<style>{base_css}</style><style>{theme_css}</style><style>{COMPONENT_CSS}</style></head>"
           f"<body><main data-pattern style='max-width:{width}'>{container}</main></body></html>")
    out_dir = ROOT / "dist" / "patterns"
    out_dir.mkdir(parents=True, exist_ok=True)
    html_path = out_dir / f"{pattern_name}.{theme_name}.html"
    html_path.write_text(doc)
    report["lossless"] = not (report["substitutions"] or report["omissions"] or report["warnings"])
    (out_dir / f"{pattern_name}.{theme_name}.report.json").write_text(json.dumps(report, indent=2))
    return html_path, report

if __name__ == "__main__":
    pattern = sys.argv[1] if len(sys.argv) > 1 else "login"
    themes = sys.argv[2:] or ["shadcn", "salt"]
    for t in themes:
        path, report = render(pattern, t)
        status = "lossless" if report["lossless"] else \
            f"{len(report['substitutions'])} substitution(s), {len(report['omissions'])} omission(s), {len(report['warnings'])} warning(s)"
        print(f"{path.relative_to(ROOT)} — {status}")
