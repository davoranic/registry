#!/usr/bin/env python3
"""Generate showroom metadata from the repo — the page reflects reality."""
import json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "showroom"

themes = {}
for p in sorted((ROOT / "themes").glob("theme-*.json")):
    t = json.loads(p.read_text())
    themes[t["name"]] = {"title": t.get("title", t["name"]),
                         "capabilities": t.get("capabilities", {}),
                         "constraints": t.get("constraints", [])}
(OUT / "theme-meta.gen.json").write_text(json.dumps(themes, indent=1))

slots = sorted(set(re.findall(r"--([a-z][a-z0-9-]*)\s*:", (ROOT / "tokens" / "base.css").read_text())))
roles = list(json.loads((ROOT / "icons" / "roles.json").read_text())["roles"].keys())
patterns = [{"name": j["name"], "intent": j.get("intent", ""),
             "regions": [r["region"] for r in j.get("regions", [])]}
            for j in (json.loads(p.read_text()) for p in sorted((ROOT / "contract" / "patterns").glob("*.json")))]
dict_words = len(re.findall(r'^\s*"[^"]+":', (ROOT / "scripts" / "lift.py").read_text(), re.M))
(OUT / "contract-meta.gen.json").write_text(json.dumps({
    "slotCount": len(slots), "slots": slots,
    "anatomyCount": len(list((ROOT / "contract" / "anatomy").glob("*.json"))),
    "iconRoles": roles, "patterns": patterns, "dictionaryWords": dict_words,
}, indent=1))

sets = {}
for p in sorted((ROOT / "icons" / "sets").glob("*.json")):
    d = json.loads(p.read_text())
    sets[d["set"]] = d["roles"]
(OUT / "icon-sets.gen.json").write_text(json.dumps(sets, indent=1))

BOOL_STATES = {"disabled","loading","selected","invalid","readonly","indeterminate","open"}
controls = {}
for f in sorted((ROOT / "contract" / "anatomy").glob("*.json")):
    a = json.loads(f.read_text())
    controls[f.stem] = {
        "axes": {k: v for k, v in (a.get("variantAxes") or {}).items() if v},
        "states": [s for s in (a.get("states") or []) if s in BOOL_STATES],
        "parts": [p["part"] for p in a.get("parts", [])],
        "behavior": a.get("behavior", ""),
        "tokens": sorted({t for p in a.get("parts", []) for t in (p.get("tokens") or [])}),
    }
(OUT / "controls.gen.json").write_text(json.dumps(controls, indent=1))


# ---- system pages: dictionary, rules, translator proofs ----
import ast
lift_src = (ROOT / "scripts" / "lift.py").read_text()
dict_start = lift_src.index("DICT = {")
dict_end = lift_src.index("\n}", dict_start) + 2
DICT = ast.literal_eval(lift_src[dict_start + 7:dict_end])
linking = (ROOT / "docs" / "LINKING.md").read_text()
def section(md, head):
    i = md.find(head)
    if i < 0: return ""
    j = md.find("\n## ", i + len(head))
    return md[i:j if j > 0 else len(md)].strip()
renders = []
for rp in sorted((ROOT / "dist" / "patterns").glob("*.report.json")):
    r = json.loads(rp.read_text())
    renders.append({"pattern": r["pattern"], "theme": r["theme"],
                    "lossless": r.get("lossless", False),
                    "href": f"patterns/{r['pattern']}.{r['theme']}.html"})
(OUT / "system.gen.json").write_text(json.dumps({
    "dictionary": DICT,
    "rules": section(linking, "## The rules"),
    "growth": section(linking, "## Growth"),
    "sync": section(linking, "## Upstream sync"),
    "patternRenders": renders,
}, indent=1))

print(f"meta: {len(themes)} themes, {len(slots)} slots, {len(roles)} icon roles, {len(sets)} icon sets")
