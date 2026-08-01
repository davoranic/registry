#!/usr/bin/env python3
"""Anatomy validator: every contract/anatomy/*.json must reference only
contract slots (parsed from tokens/base.css), canonical states
(contract/states.md), and canonical variant axes (contract/variants.md).
Exit 1 on violations. Part of CI."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def contract_slots():
    css = (ROOT / "tokens" / "base.css").read_text()
    slots = set(re.findall(r"--([a-z][a-z0-9.-]*)\s*:", css))
    # composite type roles are referenced without the leading 'type-'? No —
    # anatomy references them as written (type-action). Slots parsed as-is.
    return slots

CANONICAL_STATES = {"rest", "hover", "active", "focus-visible", "disabled",
                    "loading", "selected", "indeterminate", "invalid",
                    "readonly", "open", "dragging",
                    # documented aliases used by determinate widgets
                    "determinate"}
CANONICAL_AXES = {"emphasis", "prominence", "size", "orientation", "tone",
                  "edge", "label-placement", "activation"}
ICON_ROLES = {"close", "dismiss", "expand", "collapse", "back", "forward",
              "search", "add", "remove", "overflow", "error", "warning",
              "success", "info", "calendar", "user", "upload", "external",
              "drag", "loading"}

def walk_tokens(node):
    if isinstance(node, dict):
        for k, v in node.items():
            if k == "tokens" and isinstance(v, list):
                yield from v
            else:
                yield from walk_tokens(v)
    elif isinstance(node, list):
        for item in node:
            yield from walk_tokens(item)

def check(path, slots):
    errors = []
    try:
        doc = json.loads(path.read_text())
    except json.JSONDecodeError as e:
        return [f"{path.name}: invalid JSON — {e}"]
    for token in walk_tokens(doc):
        base = token.split("(")[0].strip()
        if base not in slots:
            errors.append(f"{path.name}: unknown token slot '{token}'")
    for state in doc.get("states", []):
        if state not in CANONICAL_STATES:
            errors.append(f"{path.name}: non-canonical state '{state}'")
    for axis in doc.get("variantAxes", {}):
        if axis not in CANONICAL_AXES:
            errors.append(f"{path.name}: non-canonical variant axis '{axis}'")
    def icon_roles(node):
        if isinstance(node, dict):
            for k, v in node.items():
                if k == "iconRole" and isinstance(v, str):
                    yield v
                else:
                    yield from icon_roles(v)
        elif isinstance(node, list):
            for item in node:
                yield from icon_roles(item)
    for role in icon_roles(doc):
        if role not in ICON_ROLES:
            errors.append(f"{path.name}: unknown icon role '{role}'")
    if "behavior" not in doc:
        errors.append(f"{path.name}: missing behavior (APG reference)")
    if "parts" not in doc or not doc["parts"]:
        errors.append(f"{path.name}: missing parts")
    return errors

def main():
    slots = contract_slots()
    files = sorted((ROOT / "contract" / "anatomy").glob("*.json"))
    all_errors = []
    for f in files:
        errs = check(f, slots)
        all_errors += errs
    print(f"checked {len(files)} anatomy files: "
          f"{'OK' if not all_errors else str(len(all_errors)) + ' violation(s)'}")
    for e in all_errors:
        print(f"  ✗ {e}", file=sys.stderr)
    return 1 if all_errors else 0

if __name__ == "__main__":
    sys.exit(main())
