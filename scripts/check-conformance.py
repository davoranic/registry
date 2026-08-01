#!/usr/bin/env python3
"""Conformance checker (LINKING.md R2 + naming.md grammar).

Verifies every theme adapter resolves every REQUIRED contract slot with a
value, a derivation rule, or a declared constraint — and that all token keys
obey the naming grammar. Exit 1 on any violation. Run in CI on every push.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

REQUIRED_COLOR = [
    "surface", "on-surface", "surface-raised", "on-surface-raised",
    "surface-overlay", "on-surface-overlay", "surface-sunken",
    "content-secondary", "action", "on-action", "action-secondary",
    "on-action-secondary", "interaction-hover", "field-border",
    "border", "focus", "status-critical", "status-success", "status-warning",
]
REQUIRED_STATUS_TONES = ["info", "success", "warning", "critical"]
REQUIRED_GROWTH = [  # value OR rule acceptable (D-slots)
    "border-subtle", "field-surface", "field-surface-hover",
    "content-disabled", "selected-indicator",
    "cursor-interactive", "cursor-disabled",
]
REQUIRED_SECTIONS = {
    "shape": ["radius"],
    "type": ["font-sans", "ui-weight", "ui-case"],
    "focus": ["focus-width", "focus-style"],
    "motion": [],
    "layers": ["modal", "tooltip"],
    "elevation": ["raised", "modal"],
    "typeRoles": ["action"],
    "iconRoles": ["mechanism", "close", "expand", "search", "error", "loading"],
}
NAME_RE = re.compile(r"^[a-z][a-z0-9]*(-[a-z0-9.]+)*$")
NOTE_KEYS = {"source", "strategy", "darkModeNote", "cursorNote", "note"}


def growth_lookup(tokens, slot):
    for section, body in tokens.items():
        if section.startswith("growth-") and slot in body:
            return True
    return False


def check_theme(path):
    errors = []
    theme = json.loads(path.read_text())
    tokens = theme.get("tokens", {})
    name = theme.get("name", path.name)

    modes = theme.get("capabilities", {}).get("modes", ["light"])
    for mode in modes:
        block = tokens.get(mode, {})
        for slot in REQUIRED_COLOR:
            if slot not in block and not growth_lookup(tokens, slot):
                errors.append(f"{name}/{mode}: missing required color slot '{slot}'")
        for key in block:
            if key not in NOTE_KEYS and not NAME_RE.match(key):
                errors.append(f"{name}/{mode}: key '{key}' violates naming grammar")

    status = tokens.get("status", {})
    for tone in REQUIRED_STATUS_TONES:
        parts = status.get(tone, {})
        for part in ("base", "surface", "border"):
            if part not in parts:
                errors.append(f"{name}: status.{tone} missing '{part}'")

    for slot in REQUIRED_GROWTH:
        if not growth_lookup(tokens, slot):
            errors.append(f"{name}: growth slot '{slot}' unresolved (no value or rule)")

    for section, keys in REQUIRED_SECTIONS.items():
        body = tokens.get(section)
        if body is None:
            errors.append(f"{name}: missing section '{section}'")
            continue
        for key in keys:
            if key not in body:
                errors.append(f"{name}: {section} missing '{key}'")

    rhythm = tokens.get("rhythm", {})
    density_cap = theme.get("capabilities", {}).get("density")
    if density_cap:
        by_density = rhythm.get("byDensity", {})
        for option in density_cap.get("options", []):
            need = {"spacing", "control-h", "control-px", "text-ui", "icon-size"}
            have = set(by_density.get(option, {}))
            if not need <= have:
                errors.append(f"{name}: density '{option}' incomplete (missing {sorted(need - have)})")
    else:
        for key in ("spacing", "control-h", "control-px"):
            if key not in rhythm:
                errors.append(f"{name}: rhythm missing '{key}' (no density axis to supply it)")

    if tokens.get("motion", {}).get("duration", {}).get("base") is None:
        errors.append(f"{name}: motion.duration.base missing")

    return errors


def check_registry_items():
    """Registry items may WIRE utilities to contract slots (pure var() refs)
    but may never carry token VALUES — values belong to themes alone."""
    errors = []
    reg = json.loads((ROOT / "registry.json").read_text())
    for item in reg.get("items", []):
        for mode, block in item.get("cssVars", {}).items():
            for key, value in block.items():
                if not (isinstance(value, str) and value.strip().startswith("var(")):
                    errors.append(f"registry.json/{item['name']}/{mode}: '{key}' carries a VALUE "
                                  f"('{value}') — items may only wire var() references; values belong to themes")
    return errors


def main():
    all_errors = []
    themes = sorted((ROOT / "themes").glob("theme-*.json"))
    if not themes:
        print("no theme adapters found", file=sys.stderr)
        return 1
    for path in themes:
        errs = check_theme(path)
        status = "OK" if not errs else f"{len(errs)} violation(s)"
        print(f"{path.name}: {status}")
        all_errors += errs
    reg_errs = check_registry_items()
    print(f"registry.json items: {'OK' if not reg_errs else str(len(reg_errs)) + ' violation(s)'}")
    all_errors += reg_errs
    for e in all_errors:
        print(f"  ✗ {e}", file=sys.stderr)
    return 1 if all_errors else 0


if __name__ == "__main__":
    sys.exit(main())
