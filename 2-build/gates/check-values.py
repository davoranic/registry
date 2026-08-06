#!/usr/bin/env python3
"""Tier-2 provenance canary — RE-RESOLVE cited tokens and diff against recorded values.

Tier 1 (`check-provenance.py`) proves a citation still POINTS somewhere real.
This proves the VALUE behind it has not moved. It is the check
docs/ARCHITECTURE-V2.md §4c asks for: "weekly re-extract source values from the
clones; drift fails."

HOW IT WORKS
  1. Build a token -> value map per design system, straight from the clone.
  2. For every slot we record, pull the token names out of that slot's own
     provenance string.
  3. Resolve those tokens through the clone's own alias chain to a literal.
  4. Compare, colour-normalised (#72777D and rgb(114,119,125) are the same value).

SCOPE, AND WHY — this is deliberately not "all three systems":
  salt  IN  — plain CSS custom-property chains, fully resolvable.
  m3    IN  — machine-generated SCSS, the most regular source in the repo.
  shadcn OUT — its values live in Tailwind utility classes inside cva() strings
        (`bg-primary`, `px-4`, `rounded-md`), not in a token file. Resolving
        them needs a Tailwind class->value table plus the oklch vars from
        globals.css — a different and much larger machine. Declared, not faked;
        shadcn slots are reported as SKIPPED, never as passing.

WHAT IT STILL CANNOT DO
  It cannot tell you the RIGHT token was chosen for an attribute. A slot can
  resolve perfectly and still be the wrong colour for the job. That judgment
  stays with the fidelity oracle — see CLAUDE.md rule 5.
"""
import json, os, re, sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLONES = os.path.join(os.path.dirname(ROOT), "3-source")
SALT_CSS = os.path.join(CLONES, "salt-ds", "packages", "theme", "css")
M3_TOKENS = os.path.join(CLONES, "material-web", "tokens")

# ---------------------------------------------------------------- normalising

HEX_RE = re.compile(r"^#([0-9a-fA-F]{3,8})$")
RGB_RE = re.compile(r"^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)")


def norm_color(v):
    """#72777D and rgb(114, 119, 125) must compare equal, or the canary is noise."""
    if not isinstance(v, str):
        return None
    v = v.strip().rstrip(";").strip()
    m = HEX_RE.match(v)
    if m:
        h = m.group(1)
        if len(h) == 3:
            h = "".join(c * 2 for c in h)
        if len(h) >= 6:
            return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    m = RGB_RE.match(v)
    if m:
        return tuple(int(round(float(g))) for g in m.groups())
    return None


def same_value(a, b):
    ca, cb = norm_color(a), norm_color(b)
    if ca and cb:
        return ca == cb
    if not isinstance(a, str) or not isinstance(b, str):
        return False
    na = a.strip().rstrip(";").strip().lower().replace(" ", "")
    nb = b.strip().rstrip(";").strip().lower().replace(" ", "")
    return na == nb


# ------------------------------------------------------------------- salt

DECL_RE = re.compile(r"(--[\w-]+)\s*:\s*([^;}]+)[;}]")
VAR_RE = re.compile(r"var\(\s*(--[\w-]+)\s*(?:,([^()]*(?:\([^()]*\)[^()]*)*))?\)")


def load_salt():
    """--token -> [(selector_context, raw_value)] from the whole theme package."""
    table = defaultdict(list)
    for base, dirs, files in os.walk(SALT_CSS):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules")]
        for f in files:
            if not f.endswith(".css"):
                continue
            path = os.path.join(base, f)
            edition = "next" if os.sep + "next" + os.sep in path else (
                "legacy" if os.sep + "legacy" + os.sep in path else "shared")
            txt = open(path, encoding="utf-8", errors="replace").read()
            # crude but adequate: track the most recent selector before each decl
            for block in re.finditer(r"([^{}]+)\{([^{}]*)\}", txt):
                sel, body = block.group(1).strip(), block.group(2)
                for m in DECL_RE.finditer(body):
                    table[m.group(1)].append((edition, sel, m.group(2).strip()))
    return table


def pick_salt(cands, mode="light", density="medium"):
    """Salt redefines a token per edition/mode/density/accent. Choose one context."""
    def score(entry):
        edition, sel, _ = entry
        s = 0
        if edition == "next":
            s += 8                       # the registry pins theme-next throughout
        if 'data-mode="%s"' % mode in sel:
            s += 4
        elif "data-mode" in sel:
            s -= 4
        if 'data-density="%s"' % density in sel:
            s += 2
        elif "data-density" in sel:
            s -= 2
        if 'data-accent="blue"' in sel:
            s += 1                        # DEFAULT_ACCENT, per foundations/colors.md
        elif "data-accent" in sel:
            s -= 1
        return s
    return max(cands, key=score) if cands else None


def resolve_salt(token, table, mode="light", depth=0):
    if depth > 12:
        return None
    got = pick_salt(table.get(token, []), mode=mode)
    if not got:
        return None
    val = got[2]
    m = VAR_RE.search(val)
    if not m:
        return val
    inner = resolve_salt(m.group(1), table, mode=mode, depth=depth + 1)
    if inner is None:
        return None
    resolved = val[:m.start()] + inner + val[m.end():]
    # rgb(var(--x-rgb)) -> rgb(0, 120, 207)
    return resolved.strip()


# --------------------------------------------------------------------- m3

SASS_VAR_RE = re.compile(r"^\$([\w-]+)\s*:\s*([^;]+);", re.M)
# v0_192 stores tokens as MAP entries, one per line, whose values contain their
# own commas: `'primary': map.get($deps, 'md-ref-palette', 'primary40'),`.
# Capturing to the first comma truncated every one of them to `map.get($deps`,
# which made the whole v0_192 edition unresolvable. Capture the whole line.
SASS_MAP_RE = re.compile(r"^\s*'([\w-]+)'\s*:\s*(.+?),?\s*$", re.M)
IF_HARDCODED_RE = re.compile(r"^if\(\s*\$exclude-hardcoded-values\s*,\s*null\s*,\s*(.+?)\s*\)$")
SASS_REF_RE = re.compile(r"^([\w-]+)\.\$([\w-]+)$")
MAPGET_RE = re.compile(r"map\.get\(\$deps,\s*'([\w-]+)',\s*'([\w-]+)'\)")


def load_m3(edition):
    """module -> {name: raw} for one edition ('latest' or 'v0_192')."""
    d = (os.path.join(M3_TOKENS, "versions", "latest", "sass") if edition == "latest"
         else os.path.join(M3_TOKENS, "versions", "v0_192"))
    mods = {}
    if not os.path.isdir(d):
        return mods
    for f in sorted(os.listdir(d)):
        if not f.endswith(".scss"):
            continue
        mod = f[1:-5] if f.startswith("_") else f[:-5]      # _md-sys-color.scss -> md-sys-color
        txt = open(os.path.join(d, f), encoding="utf-8", errors="replace").read()

        # v0_192 keeps BOTH schemes in one file as `@function values-dark()` and
        # `@function values-light()`, dark first. A flat parse therefore indexes
        # the dark value for every light role — which is exactly how `layer-color`
        # light resolved to #e6e0e9. Split the file on the function boundaries and
        # register the dark half as its own pseudo-module, matching how `latest`
        # ships it as a separate `_md-sys-color__dark.scss`.
        halves = {mod: txt}
        if "@function values-dark" in txt and "@function values-light" in txt:
            di, li = txt.index("@function values-dark"), txt.index("@function values-light")
            if di < li:
                halves = {mod + "__dark": txt[di:li], mod: txt[li:]}
            else:
                halves = {mod: txt[li:di], mod + "__dark": txt[di:]}

        for name, chunk in halves.items():
            entries = mods.setdefault(name, {})
            for m in SASS_VAR_RE.finditer(chunk):
                entries[m.group(1)] = m.group(2).strip()
            for m in SASS_MAP_RE.finditer(chunk):
                entries.setdefault(m.group(1), m.group(2).strip())
    return mods


def resolve_m3(mod, name, mods, scheme="light", depth=0):
    if depth > 12:
        return None
    # The dark scheme is a SEPARATE module that redefines the same role names
    # (`$primary: md-ref-palette.$primary80` vs `$primary40` in light). It must be
    # consulted FIRST, not as a fallback: md-sys-color always has the light value,
    # so a fallback-only lookup silently returns light for every dark slot. That
    # bug produced 9 phantom drift reports on its first run — every one a dark
    # M3 colour "disagreeing" with its own light value.
    if mod == "md-sys-color" and scheme == "dark":
        raw = mods.get("md-sys-color__dark", {}).get(name)
        if raw is None:
            raw = mods.get(mod, {}).get(name)
    else:
        raw = mods.get(mod, {}).get(name)
    if raw is None:
        return None
    raw = raw.strip().rstrip(",")
    m = IF_HARDCODED_RE.match(raw)
    if m:
        raw = m.group(1).strip()
    m = SASS_REF_RE.match(raw)
    if m:
        return resolve_m3(m.group(1), m.group(2), mods, scheme, depth + 1)
    m = MAPGET_RE.search(raw)
    if m:
        return resolve_m3(m.group(1), m.group(2), mods, scheme, depth + 1)
    return raw


# --------------------------------------------------------------- comparison

SALT_TOK_RE = re.compile(r"--salt-[\w-]+")
# Provenance frequently names Salt tokens WITHOUT the `--salt-` prefix
# ("-> actionable-bold-foreground -> palette-foreground-primary-alt"). Matching
# only the prefixed form left 58 colour slots unresolvable — a blind spot big
# enough to hide real drift, so the bare characteristic/palette families are
# matched too and re-prefixed before lookup.
SALT_FAMILIES = ("actionable", "palette", "container", "content", "status", "sentiment",
                 "focused", "selectable", "editable", "navigable", "overlayable",
                 "separable", "differential", "taggable", "text", "color", "track",
                 "foreground", "background")
SALT_BARE_RE = re.compile(r"\b((?:%s)-[\w-]+)\b" % "|".join(SALT_FAMILIES))

M3_PALETTE_RE = re.compile(r"\b(primary|secondary|tertiary|error|neutral-variant|neutral)(\d{1,3})\b")
# ...and M3 provenance names sys-color ROLES in prose ("-> sys outline",
# "track-color -> md-sys-color.secondary-container"), which resolve one hop
# further than a raw palette tone.
M3_ROLE_RE = re.compile(
    r"\b(on-)?(primary|secondary|tertiary|error|surface|background|outline|shadow|scrim|inverse)"
    r"((?:-(?:container|variant|fixed|dim|bright|highest|high|low|lowest|surface|on-surface))*)\b")


def salt_candidates(text):
    out = []
    for t in SALT_TOK_RE.findall(text):
        if t not in out:
            out.append(t)
    for t in SALT_BARE_RE.findall(text):
        cand = "--salt-" + t
        if cand not in out:
            out.append(cand)
    return out


def m3_candidates(text):
    out = []
    for pal, tone in M3_PALETTE_RE.findall(text):
        out.append(("md-ref-palette", pal + tone))
    for on, base, suffix in M3_ROLE_RE.findall(text):
        role = (on or "") + base + (suffix or "")
        out.append(("md-sys-color", role))
    seen, uniq = set(), []
    for c in out:
        if c not in seen:
            seen.add(c)
            uniq.append(c)
    return uniq


def grouped_provenance_lookup(prov):
    """Expand this codebase's own combined-citation convention — one
    provenance key covering several related slots for readability, e.g.
    "indicator / -hover / -focus / -disabled" documenting indicator,
    indicator-hover(-color), indicator-focus(-color), indicator-disabled
    all in one entry. `prov.get(slot)` alone (the main loop's exact-key
    lookup) cannot see these; a slot documented this way is real, sourced
    prose, not a gap, and CLAUDE.md's Known-open work says so explicitly
    (found while investigating why the "no provenance" count looked too
    high — most of it turned out to be exactly this pattern).

    Returns {slot-or-prefix: group_key} for every "/"-joined provenance
    key. This is used ONLY to reclassify the diagnostic count, never to
    supply text for token re-resolution — a combined entry can name
    several DIFFERENT tokens for several DIFFERENT sub-slots in one
    string, and blindly resolving against the whole string risks a false
    DRIFT signal (this slot's recorded colour genuinely not matching a
    resolved candidate that actually belongs to a sibling sub-slot).
    Diagnostic honesty is worth improving; the drift signal's trustworthiness
    is not worth risking to do it.
    """
    out = {}
    for key in prov:
        if "/" not in key:
            continue
        parts = [p.strip() for p in key.split("/")]
        base = parts[0]
        # keep only the leading identifier-ish token of the base (drop any
        # trailing free-text description some keys carry)
        m = re.match(r"^[a-zA-Z0-9-]+", base)
        if not m:
            continue
        base = m.group(0)
        out[base] = key
        for frag in parts[1:]:
            m = re.match(r"^-?[a-zA-Z0-9-]+", frag)
            if not m:
                continue
            frag = m.group(0)
            name = base + frag if frag.startswith("-") else frag
            out[name] = key
    return out


def covered_by_group(slot, grouped):
    """Exact match, or slot is a suffixed variant of a grouped fragment
    (e.g. "indicator-hover-color" against the expanded "indicator-hover")."""
    if slot in grouped:
        return grouped[slot]
    for name, key in grouped.items():
        if slot.startswith(name + "-") or slot.startswith(name):
            return key
    return None


def main():
    salt = load_salt()
    m3_latest, m3_v0 = load_m3("latest"), load_m3("v0_192")
    print("=" * 74)
    print("TIER 2 — VALUE RE-RESOLUTION (does the cited token still hold our value?)")
    print("=" * 74)
    print("  salt custom properties indexed : %d" % len(salt))
    print("  m3 latest modules / v0_192     : %d / %d" % (len(m3_latest), len(m3_v0)))
    print()

    stats = defaultdict(int)
    drift, unresolved = [], []

    cdir = os.path.join(ROOT, "columns")
    for fn in sorted(os.listdir(cdir)):
        if not fn.endswith(".json"):
            continue
        comp, system = fn.split(".")[0], fn.split(".")[1]
        col = json.load(open(os.path.join(cdir, fn), encoding="utf-8"))
        prov = col.get("provenance") or {}
        slots = col.get("slots") or {}

        if system == "shadcn":
            stats["skipped_shadcn"] += len(slots.get("light", {}))
            continue

        grouped = grouped_provenance_lookup(prov)

        for mode in ("light", "dark"):
            for slot, recorded in (slots.get(mode) or {}).items():
                if not isinstance(recorded, str) or norm_color(recorded) is None:
                    continue                    # tier 2 checks COLOURS; sizes are tier 3
                text = prov.get(slot) or ""
                if not text:
                    if covered_by_group(slot, grouped):
                        # documented, honestly, under a combined key this
                        # exact-match lookup can't see — NOT a gap, but not
                        # safely auto-verifiable either (see
                        # grouped_provenance_lookup's own docstring)
                        stats["grouped_provenance"] += 1
                    else:
                        stats["no_provenance"] += 1
                    continue

                found, tried = None, []
                if system == "salt":
                    for t in salt_candidates(text):
                        r = resolve_salt(t, salt, mode=mode)
                        if r and norm_color(r):
                            tried.append((t, r))
                            if same_value(r, recorded):
                                found = (t, r)
                                break
                else:  # m3
                    mods = m3_latest if "v0_192" not in text and "v0.192" not in text else m3_v0
                    for mod, name in m3_candidates(text):
                        r = resolve_m3(mod, name, mods, scheme=mode)
                        if r and norm_color(r):
                            tried.append((name, r))
                            if same_value(r, recorded):
                                found = (name, r)
                                break
                # Only call it DRIFT when something resolved and nothing agreed.
                # Reporting the first candidate alone would manufacture false
                # drift whenever provenance names several tokens in a chain.
                if not found and tried:
                    found = None
                    stats["drift"] += 1
                    drift.append((comp, system, mode, slot, recorded, tried[:3]))
                    continue

                if not found:
                    stats["unresolvable"] += 1
                    unresolved.append((comp, system, mode, slot, recorded))
                else:
                    stats["verified"] += 1

    print("  VERIFIED (token still resolves to our value) : %d" % stats["verified"])
    print("  DRIFT    (token resolves to something else)  : %d" % stats["drift"])
    print("  unresolvable from provenance text            : %d" % stats["unresolvable"])
    print("  slots with NO provenance entry (a real gap)  : %d" % stats["no_provenance"])
    print("  documented under a GROUPED key (not a gap,")
    print("    but not auto-verified — see the function's")
    print("    own docstring for why)                     : %d" % stats["grouped_provenance"])
    print("  shadcn colour slots SKIPPED (out of scope)   : %d" % stats["skipped_shadcn"])
    print()

    if drift:
        print("  DRIFT DETAIL — recorded value vs what the clone says today:")
        for comp, system, mode, slot, rec, tried in drift[:40]:
            cands = "; ".join("%s -> %s" % (t, v) for t, v in tried)
            print("    ! %-9s %-5s %-5s %-24s recorded=%-22s | %s"
                  % (comp, system, mode, slot[:24], rec[:22], cands[:80]))
        if len(drift) > 40:
            print("    ... and %d more" % (len(drift) - 40))
        print()

    if unresolved:
        print("  UNRESOLVABLE — provenance names no token this resolver could follow.")
        print("  These are NOT failures; they are the limit of prose provenance.")
        for comp, system, mode, slot, rec in unresolved[:20]:
            print("    ? %-9s %-5s %-5s %-26s %s" % (comp, system, mode, slot[:26], rec[:30]))
        if len(unresolved) > 20:
            print("    ... and %d more" % (len(unresolved) - 20))
        print()

    print("LIMITS, stated so this is not over-trusted:")
    print("  - Colours only. Sizes/spacing/typography are not re-resolved here.")
    print("  - shadcn is skipped entirely (Tailwind classes, not tokens).")
    print("  - Salt is resolved at theme-next / blue accent / medium density.")
    print("  - A verified slot can still be the WRONG token for its attribute.")
    return 1 if drift else 0


if __name__ == "__main__":
    sys.exit(main())
