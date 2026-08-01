#!/usr/bin/env python3
"""Component validator (contract/authoring.md step 5).

For every registry/<name>/ directory with a matching anatomy file:
- all required (non-optional) anatomy parts appear as data-slot in the TSX
- the co-located CSS references ONLY contract slots (parsed from base.css)
- data-state values are canonical; data-<axis> attributes match the anatomy
Exit 1 on violations. CI-enforced.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def contract_slots():
    css = (ROOT / "tokens" / "base.css").read_text()
    return set(re.findall(r"--([a-z][a-z0-9.-]*)\s*:", css))

CANONICAL_STATES = {"rest", "hover", "active", "focus-visible", "disabled",
                    "loading", "selected", "indeterminate", "invalid",
                    "readonly", "open", "dragging", "checked", "determinate"}

def check_component(comp_dir, slots):
    errors = []
    name = comp_dir.name
    anatomy_path = ROOT / "contract" / "anatomy" / f"{name}.json"
    if not anatomy_path.exists():
        return [f"{name}: no anatomy file — components exist only if anatomy exists (authoring.md step 1)"]
    anatomy = json.loads(anatomy_path.read_text())

    tsx_files = list(comp_dir.glob("*.tsx"))
    css_files = list(comp_dir.glob("*.css"))
    if not tsx_files:
        errors.append(f"{name}: missing TSX")
    if not css_files:
        errors.append(f"{name}: missing co-located CSS (authoring.md step 3)")
    tsx = "".join(f.read_text() for f in tsx_files)
    css = "".join(f.read_text() for f in css_files)

    # required parts present as data-slot in TSX
    for part in anatomy.get("parts", []):
        if part.get("optional") or part.get("contentSlot") and part["part"] == "root":
            continue
        slot = part["part"]
        if part.get("optional"):
            continue
        if f'data-slot="{slot}"' not in tsx and f"data-slot=\"{slot}\"" not in css:
            # root often carries the component's own slot name
            if slot == "root" and f'data-slot="{name}"' in tsx:
                continue
            errors.append(f"{name}: required part '{slot}' has no data-slot in TSX")

    # CSS: only contract slots
    for var in set(re.findall(r"var\(--([a-z][a-z0-9-]*)", css)):
        if var not in slots:
            errors.append(f"{name}: CSS references unknown slot '--{var}'")
    for raw in re.findall(r":\s*[^;{}]*(#[0-9a-fA-F]{3,8}|oklch\(|rgb\(|hsl\()", css):
        # color-mix over slot vars is allowed; raw literals are not
        errors.append(f"{name}: CSS contains raw color literal ({raw})")

    # CSS scoping: generic part selectors must be scoped under the component root,
    # otherwise one component's recipe leaks onto another's identically-named part.
    GENERIC_PARTS = {"panel", "scrim", "trigger", "content", "header", "footer", "title",
                     "description", "label", "item", "option", "indicator", "close", "track",
                     "thumb", "control", "list", "row", "cell", "group", "value", "glyph",
                     "range", "grip", "mark", "text", "prefix", "suffix"}
    for selector in re.findall(r'^\s*(\[data-slot="([a-z-]+)"\][^{]*)\{', css, re.M):
        part = selector[1]
        if part in GENERIC_PARTS and part != name:
            errors.append(f"{name}: unscoped selector for generic part '{part}' — "
                          f'scope it as [data-slot="{name}"] [data-slot="{part}"]')

    # canonical states
    for state in set(re.findall(r'data-state="([a-z-]+)"', tsx + css)):
        if state not in CANONICAL_STATES:
            errors.append(f"{name}: non-canonical data-state '{state}'")

    # axis attributes match anatomy
    axes = anatomy.get("variantAxes", {})
    for axis, value in re.findall(r'data-(emphasis|prominence|size|orientation|tone|edge)="([a-z-]+)"', css):
        if axis in axes and value not in axes[axis]:
            errors.append(f"{name}: css uses {axis}='{value}' not in anatomy axis {axes[axis]}")
    return errors

def main():
    slots = contract_slots()
    comp_root = ROOT / "registry"
    dirs = [d for d in sorted(comp_root.iterdir()) if d.is_dir()] if comp_root.exists() else []
    all_errors = []
    for d in dirs:
        all_errors += check_component(d, slots)
    print(f"checked {len(dirs)} component(s): "
          f"{'OK' if not all_errors else str(len(all_errors)) + ' violation(s)'}")
    for e in all_errors:
        print(f"  ✗ {e}", file=sys.stderr)
    return 1 if all_errors else 0

if __name__ == "__main__":
    sys.exit(main())
