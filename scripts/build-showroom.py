#!/usr/bin/env python3
"""build-showroom.py — the showroom, generated from the repo. Zero embedded data.

Reads: themes/theme-*.json (characters + capabilities), tokens/base.css (the
contract), contract/anatomy/*.json (structure), registry/*/ (the stocked
components' real CSS), contract/patterns/*.json (compositions).
Emits: dist/showroom.html — live component specimens that re-render under
every theme / mode / density the adapters actually declare. If a component
lands in the repo tomorrow, it appears here on the next build.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "dist" / "showroom.html"

SAMPLE = {
    "label": "Submit order", "title": "Card title",
    "description": "Supporting description.", "value": "184.32",
    "content": "Content", "fallback": "DA", "caption": "4 of 24 rows",
    "text": "Item", "error": "Enter a valid value.", "root": "Badge",
    "trigger": "Open", "option": "Option", "cell": "184.32",
    "header-cell": "Amount", "item": "Item", "panel": "Panel body",
}
# structural parts render as shape, never as their own name
STRUCTURAL = {"scrim", "panel", "track", "thumb", "indicator", "option-indicator",
              "selected-indicator", "control", "image", "list", "row", "header-row",
              "control-slot", "close", "footer", "header", "group"}

def anatomy_specimen(name, anatomy):
    """Build a representative instance from anatomy parts alone."""
    parts = [p for p in anatomy.get("parts", []) if not p.get("optional")]
    axes = anatomy.get("variantAxes", {})
    attrs = ""
    if "emphasis" in axes: attrs += ' data-emphasis="primary"'
    if "prominence" in axes: attrs += ' data-prominence="solid"'
    if "tone" in axes: attrs += ' data-tone="success"'
    if "orientation" in axes: attrs += ' data-orientation="horizontal"'
    inner = []
    for p in parts:
        slot = p["part"]
        if slot == "root":
            continue
        text = "" if slot in STRUCTURAL else SAMPLE.get(slot, slot.replace("-", " "))
        inner.append(f'<span data-slot="{slot}">{text}</span>')
    tag = "button" if name in ("button",) else "div"
    body = "".join(inner) or SAMPLE.get("root", name)
    return f'<{tag} data-slot="{name}"{attrs}>{body}</{tag}>'

def build():
    themes = {}
    for p in sorted((ROOT / "themes").glob("theme-*.json")):
        t = json.loads(p.read_text())
        themes[t["name"]] = {
            "title": t.get("title", t["name"]),
            "capabilities": t.get("capabilities", {}),
            "constraints": t.get("constraints", []),
            "css": (ROOT / "dist" / f"theme-{t['name']}.css").read_text(),
        }

    components = []
    for d in sorted((ROOT / "registry").iterdir()):
        if not d.is_dir():
            continue
        name = d.name
        anatomy_path = ROOT / "contract" / "anatomy" / f"{name}.json"
        css_path = d / f"{name}.css"
        if not (anatomy_path.exists() and css_path.exists()):
            continue
        anatomy = json.loads(anatomy_path.read_text())
        components.append({
            "name": name,
            "behavior": anatomy.get("behavior", ""),
            "parts": [p["part"] for p in anatomy.get("parts", [])],
            "states": anatomy.get("states", []),
            "axes": anatomy.get("variantAxes", {}),
            "css": css_path.read_text(),
            "specimen": anatomy_specimen(name, anatomy),
        })

    patterns = [json.loads(p.read_text()) for p in sorted((ROOT / "contract" / "patterns").glob("*.json"))]
    base_css = (ROOT / "tokens" / "base.css").read_text()
    component_css = "\n".join(c["css"] for c in components)

    theme_blocks = "\n".join(
        f'<style data-theme-css="{n}" media="not all">{t["css"]}</style>'
        for n, t in themes.items())
    theme_meta = json.dumps({n: {"title": t["title"], "capabilities": t["capabilities"],
                                 "constraints": t["constraints"]} for n, t in themes.items()})
    comp_meta = json.dumps([{k: c[k] for k in ("name", "behavior", "parts", "states", "axes")}
                            for c in components])
    pattern_meta = json.dumps([{"name": p["name"], "intent": p.get("intent", ""),
                                "regions": [r["region"] for r in p.get("regions", [])]}
                               for p in patterns])

    shell_css = """
    body { margin:0; background:var(--surface); color:var(--on-surface);
      font-family:var(--family-body); font-size:var(--text-ui); }
    header { position:sticky; top:0; z-index:var(--layer-sticky);
      display:flex; gap:24px; align-items:center; flex-wrap:wrap;
      padding:14px 24px; background:var(--surface);
      border-block-end:var(--border-width) solid var(--border); }
    header b { font:var(--type-heading-3); }
    .ctl { display:inline-flex; gap:6px; align-items:center; }
    .ctl > span { font:var(--type-caption); color:var(--content-secondary);
      text-transform:uppercase; letter-spacing:0.06em; }
    .seg { display:inline-flex; background:var(--surface-sunken);
      border:var(--border-width) solid var(--border); border-radius:var(--radius-pill); padding:2px; }
    .seg button { border:0; background:transparent; color:var(--content-secondary);
      border-radius:var(--radius-pill); padding:3px 10px; font:var(--type-caption);
      font-weight:var(--ui-weight); cursor:var(--cursor-interactive); }
    .seg button[aria-pressed="true"] { background:var(--surface); color:var(--on-surface);
      box-shadow:var(--elevation-resting); }
    .ctl[data-locked] { opacity:0.45; } .ctl[data-locked] button { pointer-events:none; }
    main { padding:24px; display:grid; gap:16px;
      grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); }
    .card { border:var(--border-width) solid var(--border);
      border-radius:var(--radius-container); background:var(--surface-raised);
      overflow:hidden; display:flex; flex-direction:column; }
    .stage { position:relative; min-height:120px; display:grid; place-items:center;
      padding:24px; overflow:hidden; isolation:isolate;
      transform:translateZ(0);          /* contains position:fixed specimens */
      border-block-end:var(--border-width) solid var(--border-subtle); }
    .stage [data-slot="scrim"] { position:absolute; }
    .stage > [data-slot] { max-width:100%; }
    .meta { padding:10px 14px; display:flex; flex-direction:column; gap:4px; }
    .meta b { font:var(--type-label); }
    .meta small { font:var(--type-caption); color:var(--content-secondary); }
    .tagrow { display:flex; gap:4px; flex-wrap:wrap; margin-top:2px; }
    .tag { font:var(--type-caption); background:var(--surface-sunken);
      border-radius:var(--radius-sm,4px); padding:1px 6px; color:var(--content-secondary); }
    section.docs { grid-column:1/-1; padding:16px 0 0; }
    section.docs h2 { font:var(--type-heading-2); margin:0 0 8px; }
    section.docs p { color:var(--content-secondary); margin:0 0 12px; max-width:70ch; }
    """

    js = """
    const THEMES = %s, COMPONENTS = %s, PATTERNS = %s;
    const state = { theme: Object.keys(THEMES)[0], mode: "light", density: null };
    function applyTheme() {
      document.querySelectorAll("[data-theme-css]").forEach(s =>
        s.media = s.dataset.themeCss === state.theme ? "all" : "not all");
      document.documentElement.className = state.mode === "dark" ? "dark" : "";
      const caps = THEMES[state.theme].capabilities;
      const dCtl = document.getElementById("ctl-density");
      const hasDensity = !!caps.density;
      dCtl.toggleAttribute("data-locked", !hasDensity);
      dCtl.title = hasDensity ? "" : `density is not a capability of ${THEMES[state.theme].title}`;
      if (hasDensity) {
        state.density = state.density || caps.density.default;
        document.documentElement.dataset.density = state.density;
      } else { state.density = null; delete document.documentElement.dataset.density; }
      document.querySelectorAll(".seg button").forEach(b => {
        const ctl = b.closest(".ctl").dataset.ctl;
        b.setAttribute("aria-pressed", String(state[ctl] === b.dataset.v));
      });
      const cons = THEMES[state.theme].constraints;
      document.getElementById("constraints").textContent =
        cons.slice(0, 2).join(" · ");
      document.getElementById("constraints").title = cons.join("\n");
    }
    document.addEventListener("click", e => {
      const b = e.target.closest(".seg button"); if (!b) return;
      state[b.closest(".ctl").dataset.ctl] = b.dataset.v; applyTheme();
    });
    applyTheme();
    """ % (theme_meta, comp_meta, pattern_meta)

    theme_buttons = "".join(
        f'<button data-v="{n}">{t["title"]}</button>' for n, t in themes.items())
    cards = "".join(
        f'<div class="card"><div class="stage">{c["specimen"]}</div>'
        f'<div class="meta"><b>{c["name"]}</b>'
        f'<small>{c["behavior"][:70]}</small>'
        f'<span class="tagrow">' +
        "".join(f'<span class="tag">{p}</span>' for p in c["parts"][:6]) +
        f'</span></div></div>'
        for c in components)

    doc = f"""<!doctype html><html><head><meta charset="utf-8">
<title>UI Registry — Showroom (generated)</title>
<style>{base_css}</style>
{theme_blocks}
<style>{component_css}</style>
<style>{shell_css}</style></head>
<body>
<header>
  <b>UI Registry</b>
  <small style="font:var(--type-caption);color:var(--content-secondary)">registry.davoranic.com</small>
  <span class="ctl" data-ctl="theme"><span>Theme</span><span class="seg">{theme_buttons}</span></span>
  <span class="ctl" data-ctl="mode"><span>Mode</span><span class="seg">
    <button data-v="light">Light</button><button data-v="dark">Dark</button></span></span>
  <span class="ctl" data-ctl="density" id="ctl-density"><span>Density</span><span class="seg">
    <button data-v="high">Hi</button><button data-v="medium">Md</button>
    <button data-v="low">Lo</button><button data-v="touch">To</button></span></span>
  <small id="constraints" style="color:var(--content-secondary);font:var(--type-caption)"></small>
</header>
<main>
  <section class="docs">
    <h2>{len(components)} components · {len(patterns)} patterns · {len(themes)} themes</h2>
    <p>Generated from the repository: specimens are built from
    contract/anatomy/*.json and styled by each component's own CSS —
    the same files an app installs. Switch theme, mode, or density and every
    specimen re-renders through the contract. Controls lock when the active
    theme does not declare that capability.</p>
  </section>
  {cards}
</main>
<script>{js}</script>
</body></html>"""
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(doc)
    # index.html so a static host serves the showroom at "/"
    (OUT.parent / "index.html").write_text(doc)
    return len(components), len(patterns), len(themes)

if __name__ == "__main__":
    c, p, t = build()
    print(f"built {OUT.relative_to(ROOT)} — {c} components, {p} patterns, {t} themes (all read from repo)")
