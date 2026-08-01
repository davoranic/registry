#!/usr/bin/env python3
"""Icon validator: the semantic role list (tokens/semantic.md §8) is the
contract, so every set in icons/sets/ must answer every role in icons/roles.json
with drawable path data.

- icons/roles.json carries exactly the 20 canonical roles, in canonical order
- every set covers every role — no missing roles, no roles outside the list
- every entry has a viewBox and a non-empty path (an entry that cannot be
  drawn is worse than a missing one: it fails silently at render)
- the glyph names recorded in roles.json still match the set files
- the per-entry fill/stroke agrees with the set's declared style
Exit 1 on violations. Companion to check-anatomy.py / check-component.py.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# tokens/semantic.md §8 — the role list a theme must map, in spec order.
CANONICAL_ROLES = ["close", "dismiss", "expand", "collapse", "back", "forward",
                   "search", "add", "remove", "overflow", "error", "warning",
                   "success", "info", "calendar", "user", "upload", "external",
                   "drag", "loading"]

VIEWBOX_RE = re.compile(r"^-?[\d.]+ -?[\d.]+ [\d.]+ [\d.]+$")
PATH_START_RE = re.compile(r"^\s*[Mm]")


def load(path, errors):
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as e:
        errors.append(f"{path.name}: invalid JSON — {e}")
        return None


def check_roles_file(errors):
    path = ROOT / "icons" / "roles.json"
    if not path.exists():
        errors.append("icons/roles.json: missing — the role catalogue is the contract")
        return None
    doc = load(path, errors)
    if doc is None:
        return None
    roles = doc.get("roles")
    if not isinstance(roles, dict):
        errors.append("roles.json: no 'roles' map")
        return None
    listed = list(roles)
    if listed != CANONICAL_ROLES:
        for r in CANONICAL_ROLES:
            if r not in roles:
                errors.append(f"roles.json: missing canonical role '{r}'")
        for r in listed:
            if r not in CANONICAL_ROLES:
                errors.append(f"roles.json: '{r}' is not a canonical role")
        if sorted(listed) == sorted(CANONICAL_ROLES):
            errors.append("roles.json: roles are not in tokens/semantic.md §8 order")
    for name, entry in roles.items():
        if not entry.get("meaning"):
            errors.append(f"roles.json: role '{name}' has no meaning")
        if not isinstance(entry.get("consumers"), list):
            errors.append(f"roles.json: role '{name}' has no consumers list")
    return doc


def check_set(path, catalog, errors):
    doc = load(path, errors)
    if doc is None:
        return
    name = doc.get("set", path.stem)
    style = doc.get("style")
    if style not in ("outline", "filled"):
        errors.append(f"{name}: style must be 'outline' or 'filled', got {style!r}")
    roles = doc.get("roles")
    if not isinstance(roles, dict):
        errors.append(f"{name}: no 'roles' map")
        return

    for role in CANONICAL_ROLES:
        if role not in roles:
            errors.append(f"{name}: missing role '{role}'")
    for role in roles:
        if role not in CANONICAL_ROLES:
            errors.append(f"{name}: '{role}' is not a canonical role")

    for role, entry in roles.items():
        where = f"{name}.{role}"
        if not isinstance(entry, dict):
            errors.append(f"{where}: entry is not an object")
            continue
        viewbox = entry.get("viewBox")
        if not viewbox:
            errors.append(f"{where}: no viewBox")
        elif not VIEWBOX_RE.match(str(viewbox)):
            errors.append(f"{where}: malformed viewBox {viewbox!r}")
        path_data = entry.get("path")
        if not path_data or not str(path_data).strip():
            errors.append(f"{where}: no path data")
        elif not PATH_START_RE.match(str(path_data)):
            errors.append(f"{where}: path does not start with a moveto")
        if not entry.get("name"):
            errors.append(f"{where}: no source glyph name")
        if style == "outline" and entry.get("fill") not in (None, "none"):
            errors.append(f"{where}: outline set but fill is {entry.get('fill')!r}")
        if style == "filled" and entry.get("stroke"):
            errors.append(f"{where}: filled set but stroke is {entry.get('stroke')!r}")

        # roles.json records the glyph each set answers with — keep them in step
        if catalog:
            recorded = catalog["roles"].get(role, {}).get("glyphs", {}).get(name)
            if recorded and recorded != entry.get("name"):
                errors.append(f"{where}: roles.json says '{recorded}', set says "
                              f"'{entry.get('name')}'")


def main():
    errors = []
    catalog = check_roles_file(errors)
    set_files = sorted((ROOT / "icons" / "sets").glob("*.json"))
    if not set_files:
        errors.append("icons/sets/: no set files")
    for f in set_files:
        check_set(f, catalog, errors)

    print(f"checked {len(set_files)} sets x {len(CANONICAL_ROLES)} roles: "
          f"{'OK' if not errors else str(len(errors)) + ' violation(s)'}")
    for e in errors:
        print(f"  ✗ {e}", file=sys.stderr)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
