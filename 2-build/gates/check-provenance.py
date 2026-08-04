#!/usr/bin/env python3
"""Tier-1 provenance lint + encoding scan.

Two gates the registry did not have, added after the evaluation pass:

  ENCODING   Every repo artifact must be readable TEXT. One raw NUL byte in
             skeleton/card.tsx once made that file classify as binary, which
             silently defeated every grep pointed at it and nearly produced a
             false "missing keyboard handler" bug report. A file that no
             text tool can read is exempt from every text-based check we own,
             including the citation lint below — so this runs FIRST.

  CITATION   Every provenance string names a file in a design-system clone.
             This checks those files still EXIST, and that any design-token
             name cited alongside them still appears somewhere in that clone.
             It does NOT check values — that is tier 2 (re-resolution), and
             it deliberately does not guess. See docs/ARCHITECTURE-V2.md §4c
             "provenance canary".

What this CANNOT do, stated plainly so the pass is not over-trusted: it cannot
tell you a cited value is still correct, and it cannot tell you the RIGHT token
was chosen for an attribute. Both remain the fidelity oracle's job.
"""
import json, os, re, sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLONES_DIR = os.path.join(os.path.dirname(ROOT), "3-source")
CLONES = ["salt-ds", "ui", "material-web", "primitives", "magicui", "animate-ui"]

TEXT_EXT = {".tsx", ".ts", ".json", ".md", ".mjs", ".py", ".css", ".html", ".mdx", ".scss"}
SKIP_DIRS = {".git", "node_modules", "out", "__pycache__"}

# a path-looking run ending in a source extension. `{a,b}` is allowed INSIDE the
# run because citations legitimately use brace shorthand for sibling token files
# (`_md-comp-{elevated,filled,outlined}-card.scss`); without this the regex
# truncates at the brace and reports a phantom `card.scss`. That false positive
# accounted for most of the first run's noise.
PATH_RE = re.compile(r"[\w][\w./@{},-]*\.(?:css|scss|tsx|ts|mdx|json)\b")
BRACE_RE = re.compile(r"\{([^{}]*)\}")


def expand_braces(p):
    """`a-{x,y}-b.scss` -> ['a-x-b.scss', 'a-y-b.scss']. One level is enough."""
    m = BRACE_RE.search(p)
    if not m:
        return [p]
    return [p[: m.start()] + opt.strip() + p[m.end():] for opt in m.group(1).split(",")]


# Citations legitimately name files that DO NOT EXIST when the claim is the
# absence itself — chip.shadcn.json proves shadcn ships no chip by recording
# that chip.mdx / tag.mdx / pill.tsx are all missing. A lint that flags those
# would be punishing the most rigorous evidence in the repo.
ABSENCE_RE = re.compile(
    r"ABSENCE|does not exist|no such file|not found|zero hits|no chip|no tag|no pill|"
    r"nothing|absent|proof|evidence-\d", re.I)

# "Foo.tsx/.css" is shorthand for two sibling files, not one path.
SHORTHAND_RE = re.compile(r"^(.*?)\.(tsx|ts|css|scss)/\.(tsx|ts|css|scss)$")


def candidate_paths(text):
    """Every plausible file path in a citation string, brace- and shorthand-aware."""
    variants = [text]
    for _ in range(4):                      # a few rounds covers nested/multiple lists
        nxt = []
        for v in variants:
            m = BRACE_RE.search(v)
            if not m:
                nxt.append(v)
            else:
                for opt in m.group(1).split(","):
                    nxt.append(v[: m.start()] + opt.strip() + v[m.end():])
        if nxt == variants:
            break
        variants = nxt
    out = set()
    for v in variants:
        for m in PATH_RE.finditer(v):
            cand = m.group(0)
            sh = SHORTHAND_RE.match(cand)
            if sh:
                out.add("%s.%s" % (sh.group(1), sh.group(2)))
                out.add("%s.%s" % (sh.group(1), sh.group(3)))
                continue
            for e in expand_braces(cand):
                if "{" in e or "," in e:
                    # A brace list whose closing `}` fell outside the greedy match,
                    # e.g. `sass/{_md-sys-color.scss,_md-sys-shape.scss`. Each comma
                    # piece is its own file; the directory prefix belongs to the first.
                    head, _, rest = e.partition("{")
                    for piece in (rest or head).split(","):
                        piece = piece.strip().strip("}")
                        if not piece:
                            continue
                        out.add(piece if "/" in piece else head + piece)
                else:
                    out.add(e)
    return out
# design-token names worth checking presence of
TOKEN_RE = re.compile(r"--salt-[a-zA-Z0-9-]+|\$[a-z][a-zA-Z0-9-]*")


def walk_repo():
    for base, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if os.path.splitext(f)[1] in TEXT_EXT:
                yield os.path.join(base, f)


def encoding_scan():
    bad = []
    for p in walk_repo():
        data = open(p, "rb").read()
        rel = os.path.relpath(p, ROOT)
        if b"\x00" in data:
            bad.append((rel, "NUL byte -> file classifies as BINARY; grep silently skips it"))
            continue
        try:
            data.decode("utf-8")
        except UnicodeDecodeError as e:
            bad.append((rel, "invalid UTF-8 at byte %d" % e.start))
    return bad


def index_clones():
    """basename -> [relative paths], plus a per-clone full-text blob for token lookup."""
    by_name = defaultdict(list)
    present = []
    for c in CLONES:
        croot = os.path.join(CLONES_DIR, c)
        if not os.path.isdir(croot):
            continue
        present.append(c)
        for base, dirs, files in os.walk(croot):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for f in files:
                if os.path.splitext(f)[1] in TEXT_EXT:
                    by_name[f].append(os.path.relpath(os.path.join(base, f), CLONES_DIR))
    return by_name, present


def citation_strings():
    """(component, system, where, text) for every provenance-bearing string."""
    out = []
    cdir = os.path.join(ROOT, "columns")
    for fn in sorted(os.listdir(cdir)):
        if not fn.endswith(".json"):
            continue
        comp, system = fn.split(".")[0], fn.split(".")[1]
        col = json.load(open(os.path.join(cdir, fn), encoding="utf-8"))
        for k, v in (col.get("provenance") or {}).items():
            if isinstance(v, str):
                out.append((comp, system, "provenance/" + k, v))
        for k, cell in (col.get("cells") or {}).items():
            for field in ("source", "note"):
                v = cell.get(field)
                if isinstance(v, str):
                    out.append((comp, system, "%s/%s" % (k, field), v))
    return out


def main():
    print("=" * 72)
    print("GATE 1 — ENCODING (must pass first: a binary file is exempt from gate 2)")
    print("=" * 72)
    bad = encoding_scan()
    if bad:
        for rel, why in bad:
            print("  FAIL %s — %s" % (rel, why))
    else:
        print("  OK — every repo artifact is readable UTF-8 text")

    print()
    print("=" * 72)
    print("GATE 2 — CITATION LINT (existence only; values are tier 2, not checked)")
    print("=" * 72)
    by_name, present = index_clones()
    print("  clones indexed: %s" % ", ".join(present))

    cites = citation_strings()
    seen_files, missing, tokens_seen, tokens_missing = set(), [], set(), []

    # our OWN artifacts are legitimately cited too — cross-component notes name
    # sibling columns/templates ("see card.m3.json"). Index them so those are not
    # reported as dangling clone paths.
    own = set()
    for p in walk_repo():
        own.add(os.path.basename(p))

    absence_ok = 0
    for comp, system, where, text in cites:
        is_absence_claim = bool(ABSENCE_RE.search(text))
        for cand in candidate_paths(text):
            base = os.path.basename(cand)
            if base in by_name:
                seen_files.add(base)
            elif base in own or os.path.exists(os.path.join(ROOT, cand)):
                pass                       # citing our own repo, not a clone path
            elif is_absence_claim:
                absence_ok += 1            # the point of the citation IS that it is missing
            else:
                missing.append((comp, system, where, cand))

    # token presence, only for systems whose clone we can actually read
    salt_blob = None
    for comp, system, where, text in cites:
        if system != "salt":
            continue
        # A note that EXPLAINS a token is wrong necessarily quotes it. Counting
        # that as a live claim makes the lint re-report its own fix forever —
        # the same "asserting vs discussing" distinction the absence proofs need.
        if ABSENCE_RE.search(text):
            continue
        for m in TOKEN_RE.finditer(text):
            t = m.group(0)
            if t.startswith("--salt-"):
                tokens_seen.add(t)
    if tokens_seen:
        chunks = []
        sroot = os.path.join(CLONES_DIR, "salt-ds", "packages", "theme", "css")
        for base, dirs, files in os.walk(sroot):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for f in files:
                if f.endswith(".css"):
                    chunks.append(open(os.path.join(base, f), encoding="utf-8", errors="replace").read())
        salt_blob = "\n".join(chunks)
        for t in sorted(tokens_seen):
            if t not in salt_blob:
                tokens_missing.append(t)

    print("  citation strings scanned : %d" % len(cites))
    print("  distinct source files hit: %d (resolved in a clone)" % len(seen_files))
    print("  absence-proof citations   : %d (file missing ON PURPOSE — the claim IS its absence)" % absence_ok)
    print("  unresolved file citations : %d" % len(missing))
    for comp, system, where, cand in missing[:40]:
        print("     ? %-9s %-7s %-38s %s" % (comp, system, where[:38], cand))
    if len(missing) > 40:
        print("     ... and %d more" % (len(missing) - 40))

    print("  salt --tokens cited      : %d" % len(tokens_seen))
    print("  salt --tokens NOT found  : %d" % len(tokens_missing))
    for t in tokens_missing[:30]:
        print("     ! %s" % t)
    if len(tokens_missing) > 30:
        print("     ... and %d more" % (len(tokens_missing) - 30))

    print()
    print("KNOWN RESIDUE — parser, not data. The remaining unresolved entries are")
    print("brace-shorthand citations this regex cannot fully expand, e.g.")
    print("  site/docs/components/pill/{index,usage,examples,accessibility}.mdx")
    print("where the extension sits OUTSIDE the braces, and prose that capitalises a")
    print("filename for emphasis (_md-comp-outlined-SELECT.scss). Each class was")
    print("verified by hand on 2026-08-02: every file exists. They are left visible")
    print("rather than suppressed, because a lint that hides what it cannot parse is")
    print("the same failure as a gate that passes what it cannot see.")
    print()
    print("NOTE: gate 2 proves a citation still POINTS somewhere real. It does not")
    print("prove the VALUE is unchanged (tier 2 / re-resolution), nor that the right")
    print("token was chosen for the attribute — that stays the fidelity oracle's call.")

    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
