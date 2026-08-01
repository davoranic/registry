#!/usr/bin/env python3
"""Font-delivery checker (contract/typography.md).

The contract declares typography roles as slots (tokens/base.css §2); the
FONT PROGRAM that fills them lives in fonts/. This verifies the two stay
joined:

  1. every theme adapter in themes/ has a matching fonts CSS file and an
     entry in fonts/fonts.json;
  2. every --family-* and --type-* slot declared in tokens/base.css is
     resolved — valued in base, or overridden by each theme's font file —
     and the same for the action-role companions (--action-case,
     --action-tracking);
  3. no theme font file reaches the network: no @import, no @font-face with
     a remote src, no external URL anywhere in the file;
  4. theme font files invent no slots the contract does not declare, and
     reference no var() that nothing defines.

Exit 1 on any violation. Run in CI alongside check-conformance.py.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / "tokens" / "base.css"
FONTS_DIR = ROOT / "fonts"
PROGRAM = FONTS_DIR / "fonts.json"

# role slots this checker governs
ROLE_RE = re.compile(r"--(?:family|type)-[a-z0-9][a-z0-9-]*")
# companion slots: role attributes the CSS `font` shorthand cannot carry
COMPANION_SLOTS = ["action-case", "action-tracking"]

COMMENT_RE = re.compile(r"/\*.*?\*/", re.S)
DECL_RE = re.compile(r"(--[a-zA-Z0-9][a-zA-Z0-9-]*)\s*:\s*([^;}]*)")
VAR_RE = re.compile(r"var\(\s*(--[a-zA-Z0-9][a-zA-Z0-9-]*)")
# a remote address anywhere in the file — even commented out — is a violation
EXTERNAL_URL_RE = re.compile(r"(https?:|url\(\s*['\"]?(?://|data:font))", re.I)
# live at-rules that would make the browser fetch or embed a face
FETCHING_AT_RULE_RE = re.compile(r"@(import|font-face)\b", re.I)


def strip_comments(text, keep_lines=False):
    """Blank out /* … */. keep_lines preserves line numbering for reporting."""
    if not keep_lines:
        return COMMENT_RE.sub(" ", text)
    return COMMENT_RE.sub(lambda m: re.sub(r"[^\n]", " ", m.group(0)), text)


def declarations(text):
    """{slot: value} for every custom property assignment (comments removed)."""
    return {m.group(1): m.group(2).strip() for m in DECL_RE.finditer(strip_comments(text))}


def theme_names():
    return [p.stem[len("theme-"):] for p in sorted((ROOT / "themes").glob("theme-*.json"))]


def check_external(name, path, text):
    """No remote address anywhere (comments included) and no fetching at-rule
    in live CSS. Naming a webfont in a comment is fine — that is how a
    consumer learns what to self-host — linking to one is not."""
    errors = []
    code = strip_comments(text, keep_lines=True)
    for lineno, (raw, live) in enumerate(zip(text.splitlines(), code.splitlines()), 1):
        hit = EXTERNAL_URL_RE.search(raw)
        if hit:
            errors.append(f"{name}: external URL at {path.name}:{lineno} "
                          f"('{hit.group(0)}') — delivery is stacks-only (CSP)")
        rule = FETCHING_AT_RULE_RE.search(live)
        if rule:
            errors.append(f"{name}: {path.name}:{lineno} uses @{rule.group(1)} — theme font "
                          f"files declare stacks only; self-hosting is the consumer's job")
    return errors


def check_theme(name, base_decls, base_slots, program):
    errors = []
    css = FONTS_DIR / f"theme-{name}.fonts.css"
    if not css.exists():
        return [f"{name}: missing font file fonts/{css.name} "
                f"(every theme adapter must ship one — contract/typography.md)"], None

    text = css.read_text()
    errors += check_external(name, css, text)

    decls = declarations(text)
    theme_slots = {s for s in decls if ROLE_RE.fullmatch(s)}

    # 2 — every contract role slot resolved
    for slot in sorted(base_slots):
        in_base = bool(base_decls.get(slot))
        if not in_base and slot not in theme_slots:
            errors.append(f"{name}: slot {slot} has no value in tokens/base.css and is "
                          f"not overridden by fonts/{css.name}")
    for slot in COMPANION_SLOTS:
        full = f"--{slot}"
        if not base_decls.get(full) and not decls.get(full):
            errors.append(f"{name}: action-role companion {full} unresolved "
                          f"(neither base nor fonts/{css.name} values it)")

    # a font file that delivers no families is not delivering fonts
    for family in ("--family-display", "--family-body", "--family-code"):
        if not decls.get(family):
            errors.append(f"{name}: fonts/{css.name} does not assign {family} "
                          f"— the font file must state the theme's stacks")

    # 4a — no invented role slots
    for slot in sorted(theme_slots - base_slots):
        errors.append(f"{name}: fonts/{css.name} declares {slot}, which the contract "
                      f"does not (tokens/base.css). Extend the contract first (LINKING.md R1)")

    # 4b — every var() reference resolves
    known = set(base_decls) | set(decls)
    for ref in sorted({m.group(1) for m in VAR_RE.finditer(strip_comments(text))}):
        if ref not in known:
            errors.append(f"{name}: fonts/{css.name} references {ref}, which is defined "
                          f"neither in tokens/base.css nor in the file itself")

    # 1b — declared in the font program
    entry = program.get("themes", {}).get(name)
    if entry is None:
        errors.append(f"{name}: no entry in fonts/fonts.json (font program must record "
                      f"stacks, weights, source and licensing per theme)")
    else:
        if entry.get("css") != f"fonts/theme-{name}.fonts.css":
            errors.append(f"{name}: fonts.json themes.{name}.css does not point at "
                          f"fonts/theme-{name}.fonts.css")
        families = entry.get("families", {})
        for role in ("display", "body", "code"):
            spec = families.get(role)
            if not isinstance(spec, dict):
                errors.append(f"{name}: fonts.json themes.{name}.families.{role} missing")
                continue
            for field in ("source", "stack", "weights", "licensing"):
                if not spec.get(field):
                    errors.append(f"{name}: fonts.json themes.{name}.families.{role} "
                                  f"missing '{field}'")
    return errors, css


def main():
    if not BASE.exists():
        print(f"missing {BASE.relative_to(ROOT)}", file=sys.stderr)
        return 1
    if not PROGRAM.exists():
        print("missing fonts/fonts.json — no font program declared", file=sys.stderr)
        return 1

    base_text = BASE.read_text()
    base_decls = declarations(base_text)
    base_slots = {s for s in base_decls if ROLE_RE.fullmatch(s)}
    if not base_slots:
        print("tokens/base.css declares no --family-*/--type-* slots", file=sys.stderr)
        return 1

    program = json.loads(PROGRAM.read_text())
    if program.get("policy", {}).get("externalUrls") is not False:
        print("fonts/fonts.json must declare policy.externalUrls: false", file=sys.stderr)
        return 1

    names = theme_names()
    if not names:
        print("no theme adapters found", file=sys.stderr)
        return 1

    all_errors = []
    for name in names:
        errs, _ = check_theme(name, base_decls, base_slots, program)
        status = "OK" if not errs else f"{len(errs)} violation(s)"
        print(f"theme-{name}: {status}")
        all_errors += errs

    for e in all_errors:
        print(f"  ✗ {e}", file=sys.stderr)
    if all_errors:
        print(f"checked {len(names)} themes: {len(all_errors)} violation(s)", file=sys.stderr)
        return 1
    print(f"checked {len(names)} themes: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
