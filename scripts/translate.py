#!/usr/bin/env python3
"""translate.py — the translator's front desk.

Usage: translate.py <component> [--to shadcn salt] [--density medium]

One command, component in, any character out: ensures the pivot form exists
(runs lift.py if the component isn't in the cache), builds a sample instance
from the component's ANATOMY (parts as nested data-slots), and emits
dist/translations/<component>.<theme>.html — the same poem, each theme's
own voice. The originals are never touched; the cache is regenerable.
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

SAMPLE_TEXT = {
    "label": "Submit order", "title": "Card title", "description": "Supporting description text.",
    "value": "184.32", "caption": "4 of 24 rows", "content": "Content", "fallback": "DA",
}

def sample_dom(anatomy, name):
    """Build a representative instance from anatomy parts (generic, honest)."""
    parts = anatomy.get("parts", [])
    root = next((p for p in parts if p["part"] == "root"), None)
    inner = []
    for p in parts:
        slot = p["part"]
        if slot == "root" or p.get("optional"):
            continue
        text = SAMPLE_TEXT.get(slot, slot.replace("-", " "))
        inner.append(f'<span data-slot="{slot}">{text}</span>')
    root_slot = name if root else name
    axes = anatomy.get("variantAxes", {})
    attrs = ""
    if "emphasis" in axes: attrs += ' data-emphasis="primary"'
    if "prominence" in axes: attrs += ' data-prominence="solid"'
    tag = "button" if name == "button" else "div"
    return f'<{tag} data-slot="{root_slot}"{attrs}>{"".join(inner)}</{tag}>'

def translate(name, theme, density=None):
    comp_dir = ROOT / "registry" / name
    if not (comp_dir / f"{name}.css").exists():
        print(f"[cache miss] lifting '{name}' into the pivot form…")
        subprocess.run([sys.executable, str(ROOT / "scripts" / "lift.py"), name], check=True)
    anatomy = json.loads((ROOT / "contract" / "anatomy" / f"{name}.json").read_text())
    base = (ROOT / "tokens" / "base.css").read_text()
    theme_css = (ROOT / "dist" / f"theme-{theme}.css").read_text()
    comp_css = (comp_dir / f"{name}.css").read_text()
    density_attr = f' data-density="{density}"' if density else ""
    doc = (f"<!doctype html><html{density_attr}><head><meta charset='utf-8'>"
           f"<title>{name} · {theme}</title>"
           f"<style>{base}</style><style>{theme_css}</style><style>{comp_css}</style>"
           f"<style>body{{margin:0;padding:48px;background:var(--surface);color:var(--on-surface);"
           f"font-family:var(--font-sans);display:grid;place-items:center;min-height:60vh}}</style>"
           f"</head><body>{sample_dom(anatomy, name)}</body></html>")
    out = ROOT / "dist" / "translations"
    out.mkdir(parents=True, exist_ok=True)
    suffix = f".{density}" if density else ""
    path = out / f"{name}.{theme}{suffix}.html"
    path.write_text(doc)
    return path

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    name = args[0] if args else "button"
    themes = ["shadcn", "salt"]
    if "--to" in sys.argv:
        i = sys.argv.index("--to")
        themes = [a for a in sys.argv[i + 1:] if not a.startswith("--")]
    density = None
    if "--density" in sys.argv:
        density = sys.argv[sys.argv.index("--density") + 1]
    for t in themes:
        p = translate(name, t, density if t == "salt" else None)
        print(f"→ {p.relative_to(ROOT)}")
