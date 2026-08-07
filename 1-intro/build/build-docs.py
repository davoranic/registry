#!/usr/bin/env python3
"""Generate the docs site from markdown. The markdown is the source.

Why this exists: the case study and the discovery each existed twice — once as
a hand-written markdown file and once as hand-written HTML in a page. That is
the same duplication that produced the prose-vs-values drift inside the matrix
docs, and it was fixed there the same way: generate the derived copy.

    1-intro/content/*.md  +  2-build/{contract,columns}  ->  1-intro/site/index.html

Layout geometry is read from the shadcn/ui clone rather than approximated:
  app/(app)/docs/layout.tsx      --sidebar-width: spacing*72 = 18rem
  app/(app)/docs/.../page.tsx    max-w-160 = 40rem, TOC w-72 = 18rem
  components/docs-sidebar.tsx    --sidebar-menu-width: spacing*56 = 14rem
Theme tokens are copied verbatim from ui/apps/v4/app/globals.css.

Markdown supported: the subset these docs actually use — headings, paragraphs,
bold/italic/code/links, blockquotes, lists, tables, fenced code, rules. Two
directives, written as HTML comments so GitHub ignores them:

    <!-- stats -->   before a table -> render it as the figure grid
    <!-- cards -->   before a table -> render it as the card grid

Each page starts with a metadata comment:

    <!-- docs
    title: The matrix
    badge: Reference
    description: One sentence, shown under the title.
    -->

Run:  python3 1-intro/build/build-docs.py
"""
import glob
import html
import json
import os
import re
import sys

INTRO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # 1-intro/
WORK = os.path.dirname(INTRO)                                        # the workspace root
BUILD = os.path.join(WORK, "2-build")                                # where the matrix data lives
DOCS = os.path.join(INTRO, "content")
OUT = os.path.join(INTRO, "site", "index.html")

# every component with a built harness page (2-build/harness/<name>-check.tsx,
# or harness/registry.tsx for calendar) — order matches CLAUDE.md's component
# index table
COMPONENTS = ["alert", "badge", "button", "calendar", "card", "checkbox", "chip",
              "dialog", "input", "progress", "radio-group", "select", "slider",
              "spinner", "switch", "tabs", "tooltip"]

# order in the sidebar; slug -> source file
PAGES = [
    ("overview", "01-use-case.md"),
    ("discovery", "02-discovery.md"),
    ("matrix", "03-matrix.md"),
    ("status", None),            # generated: where the work actually stands
    ("matrices", None),          # generated from 2-build/ JSON, not markdown
    ("components", "04-component-map.md"),
] + [("comp-%s" % c, None) for c in COMPONENTS] + [   # one live page per component
    ("f-salt", "foundations/salt.md"),
    ("f-shadcn", "foundations/shadcn.md"),
    ("f-m3", "foundations/m3.md"),
]


# ---------------------------------------------------------------- inline

def slugify(text):
    s = re.sub(r"<[^>]+>", "", text).lower()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    return re.sub(r"[\s-]+", "-", s).strip("-")


def inline(text):
    """Inline markdown. Code spans are extracted first so nothing rewrites them."""
    spans = []

    def stash(m):
        spans.append(m.group(1))
        return "\x00%d\x00" % (len(spans) - 1)

    text = re.sub(r"`([^`]+)`", stash, text)
    text = html.escape(text, quote=False)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)",
                  lambda m: '<a href="%s">%s</a>' % (html.escape(m.group(2)), m.group(1)), text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"<em>\1</em>", text)
    text = re.sub(r"(?<![\w_])_([^_\n]+)_(?![\w_])", r"<em>\1</em>", text)
    text = text.replace("--", "—") if False else text
    for i, code in enumerate(spans):
        text = text.replace("\x00%d\x00" % i, "<code>%s</code>" % html.escape(code, quote=False))
    return text


# ---------------------------------------------------------------- blocks

def render_table(rows, kind):
    head, body = rows[0], rows[2:]

    if kind == "stats":
        cells = []
        for r in body:
            v = inline(r[0])
            label = inline(r[1]) if len(r) > 1 else ""
            neg = " neg" if len(r) > 2 and r[2].strip().lower() in ("open", "debt", "neg") else ""
            cells.append('<div class="stat%s"><span class="v">%s</span>'
                         '<span class="l">%s</span></div>' % (neg, v, label))
        return '<div class="grid-4">%s</div>' % "".join(cells)

    if kind == "cards":
        cells = []
        for r in body:
            cells.append('<div class="card"><p class="card-title">%s</p>'
                         '<p class="card-desc">%s</p></div>'
                         % (inline(r[0]), inline(r[1]) if len(r) > 1 else ""))
        return '<div class="cardstack">%s</div>' % "".join(cells)

    th = "".join("<th>%s</th>" % inline(c) for c in head)
    trs = []
    for r in body:
        trs.append("<tr>%s</tr>" % "".join("<td>%s</td>" % inline(c) for c in r))
    return ('<div class="table-wrap"><table><thead><tr>%s</tr></thead>'
            "<tbody>%s</tbody></table></div>" % (th, "".join(trs)))


def render(md):
    """Markdown -> HTML. Returns (html, [(id, text), ...]) for the table of contents."""
    lines = md.split("\n")
    out, toc = [], []
    i, n = 0, len(lines)
    pending = None  # a <!-- stats --> / <!-- cards --> directive

    def para_flush(buf):
        if buf:
            out.append("<p>%s</p>" % inline(" ".join(buf).strip()))
            buf.clear()

    buf = []
    while i < n:
        line = lines[i]

        m = re.match(r"^<!--\s*(stats|cards)\s*-->\s*$", line.strip())
        if m:
            pending = m.group(1)
            i += 1
            continue
        if line.strip().startswith("<!--"):           # metadata / notes: skip block
            while i < n and "-->" not in lines[i]:
                i += 1
            i += 1
            continue

        if line.startswith("```"):                    # fenced code
            para_flush(buf)
            i += 1
            code = []
            while i < n and not lines[i].startswith("```"):
                code.append(lines[i])
                i += 1
            i += 1
            out.append("<pre><code>%s</code></pre>"
                       % html.escape("\n".join(code), quote=False))
            continue

        if re.match(r"^\s*---+\s*$", line):            # rule
            para_flush(buf)
            out.append('<hr class="separator">')
            i += 1
            continue

        m = re.match(r"^(#{1,4})\s+(.*)$", line)       # heading
        if m:
            para_flush(buf)
            lvl, text = len(m.group(1)), m.group(2).strip()
            if lvl == 1:                               # page title comes from metadata
                i += 1
                continue
            hid = slugify(text)
            if lvl == 2:
                toc.append((hid, re.sub(r"<[^>]+>", "", inline(text))))
                out.append('<h2 id="%s">%s</h2>' % (hid, inline(text)))
            else:
                out.append("<h%d>%s</h%d>" % (lvl, inline(text), lvl))
            i += 1
            continue

        if line.startswith(">"):                       # blockquote
            para_flush(buf)
            q = []
            while i < n and lines[i].startswith(">"):
                q.append(lines[i].lstrip(">").strip())
                i += 1
            out.append("<blockquote><p>%s</p></blockquote>" % inline(" ".join(q)))
            continue

        if line.lstrip().startswith("|"):              # table
            para_flush(buf)
            rows = []
            while i < n and lines[i].lstrip().startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")])
                i += 1
            if len(rows) >= 2:
                out.append(render_table(rows, pending))
            pending = None
            continue

        m = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)$", line)   # list
        if m:
            para_flush(buf)
            ordered = not m.group(2) in ("-", "*")
            items = []
            while i < n:
                mm = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)$", lines[i])
                if not mm:
                    if lines[i].startswith("  ") and lines[i].strip() and items:
                        items[-1] += " " + lines[i].strip()
                        i += 1
                        continue
                    break
                items.append(mm.group(3))
                i += 1
            tag = "ol" if ordered else "ul"
            out.append('<%s class="bullets">%s</%s>'
                       % (tag, "".join("<li>%s</li>" % inline(x) for x in items), tag))
            continue

        if not line.strip():
            para_flush(buf)
            i += 1
            continue

        buf.append(line.strip())
        i += 1

    para_flush(buf)
    return "\n".join(out), toc


def meta_of(md):
    m = re.search(r"<!--\s*docs\s*(.*?)-->", md, re.S)
    data = {}
    if m:
        for line in m.group(1).strip().split("\n"):
            if ":" in line:
                k, v = line.split(":", 1)
                data[k.strip()] = v.strip()
    return data


# ------------------------------------------------- where the work stands

# Which canonical row does each built component satisfy? Spelled out rather than
# fuzzy-matched: `chip` answers the row named "tag / pill", and `progress`
# answers two. A silent near-match here would overstate coverage.
BUILT_FOR = {
    "alert": ["alert"], "badge": ["badge"], "button": ["button"],
    "calendar": ["calendar"], "card": ["card"], "chip": ["tag / pill"],
    "dialog": ["dialog"], "input": ["input"],
    "progress": ["progress (linear)", "progress (circular)"],
    "select": ["select"], "spinner": ["spinner"], "tabs": ["tabs"],
    "tooltip": ["tooltip"],
}


def canonical_sections():
    """The scope of record, read from the component map's own tables."""
    md = read(os.path.join(DOCS, "04-component-map.md"))
    sections, cur = [], None
    for line in md.split("\n"):
        h = re.match(r"^##\s+(.+)$", line)
        if h:
            title = re.sub(r"\s*\(.*$", "", h.group(1)).strip()
            cur = None if re.match(r"^(Behavior-only|What this settles)", title) \
                else {"title": title, "rows": []}
            if cur:
                sections.append(cur)
            continue
        if not cur:
            continue
        m = re.match(r"^\|\s*([^|]+?)\s*\|", line)
        if not m:
            continue
        name = m.group(1).strip()
        if not name or name == "canonical" or re.match(r"^-+$", name):
            continue
        cur["rows"].append(name)
    return sections


def build_status():
    comps = sorted(os.path.basename(f).replace(".template.json", "")
                   for f in glob.glob(os.path.join(BUILD, "contract/templates/*.template.json")))
    built_rows = {r for c in comps for r in BUILT_FOR.get(c, [])}
    sections = canonical_sections()
    total = sum(len(s["rows"]) for s in sections)
    covered = sum(1 for s in sections for r in s["rows"] if r in built_rows)

    rows_total = dis_total = cites = slots_total = slots_cited = 0
    per = []
    for c in comps:
        tpl = json.load(open(os.path.join(BUILD, "contract/templates/%s.template.json" % c),
                             encoding="utf-8"))
        rows = tpl["rows"]
        rows_total += len(rows)
        cols, filled, sl_n, sl_c = {}, {}, 0, 0
        for sy in SYSTEMS:
            fp = os.path.join(BUILD, "columns/%s.%s.json" % (c, sy))
            d = json.load(open(fp, encoding="utf-8")) if os.path.exists(fp) else {}
            cols[sy] = d.get("cells") or {}
            filled[sy] = sum(1 for r in rows
                             if cols[sy].get(r["id"]) and cols[sy][r["id"]].get("kind") != "off")
            light = (d.get("slots") or {}).get("light") or {}
            prov = d.get("provenance") or {}
            sl_n += len(light)
            sl_c += sum(1 for k in light if k in prov)
            cites += sum(1 for cell in cols[sy].values()
                         if cell.get("source") or cell.get("note"))
        slots_total += sl_n
        slots_cited += sl_c
        dis = sum(1 for r in rows if len({sig(cols[s].get(r["id"])) for s in SYSTEMS}) > 1)
        dis_total += dis
        per.append({
            "c": c, "rows": len(rows), "dis": dis, "filled": filled,
            "slots": sl_n, "uncited": sl_n - sl_c,
            "matrix": os.path.exists(os.path.join(BUILD, "matrices/%s-MATRIX.md" % c.upper())),
            "check": os.path.exists(os.path.join(BUILD, "harness/%s-check.tsx" % c)),
            "gate": os.path.exists(os.path.join(BUILD, "gates/check-%s-behavior.mjs" % c)),
        })

    # gate results, written by build.sh on its last run
    gates, ran_at = [], ""
    gp = os.path.join(BUILD, "out", "gates.json")
    if os.path.exists(gp):
        try:
            rec = json.load(open(gp, encoding="utf-8"))
            if isinstance(rec, dict):
                gates, ran_at = rec.get("gates", []), rec.get("ranAt", "")
            else:
                gates = rec          # older flat format
        except Exception:
            gates = []

    out = []
    out.append('<div class="grid-4">'
               '<div class="stat"><span class="v">%d</span><span class="l">components built, '
               'covering %d of %d canonical rows</span></div>'
               '<div class="stat"><span class="v">%d</span><span class="l">attributes in the '
               'contract</span></div>'
               '<div class="stat"><span class="v">%d</span><span class="l">of them differ across '
               'the three systems</span></div>'
               '<div class="stat neg"><span class="v">%d</span><span class="l">value slots with '
               'no citation</span></div></div>'
               % (len(comps), covered, total, rows_total, dis_total, slots_total - slots_cited))

    out.append('<h2 id="gates">Gates, last run</h2>')
    if ran_at:
        out.append('<p class="muted small">Run locally at <b>%s</b>. CI cannot re-run these \u2014 '
                   "they need the design-system clones, which are not in this repo \u2014 so this "
                   "is the last real result, not a fresh one.</p>" % html.escape(ran_at))
    if gates:
        out.append('<div class="table-wrap"><table><thead><tr><th>gate</th><th>what it watches</th>'
                   "<th>result</th></tr></thead><tbody>")
        for g in gates:
            out.append('<tr><td><code>%s</code></td><td>%s</td>'
                       '<td class="%s">%s</td></tr>'
                       % (html.escape(g.get("name", "?")), html.escape(g.get("watches", "")),
                          "gate-ok" if g.get("ok") else "gate-bad",
                          "pass" if g.get("ok") else "FAIL"))
        out.append("</tbody></table></div>")
    else:
        out.append('<p class="muted">No gate record yet \u2014 run <code>./build.sh</code>, which '
                   "writes one.</p>")

    out.append('<h2 id="coverage">Coverage against the map</h2>')
    out.append('<p class="muted small">Every canonical component, by section. The denominator is '
               "the whole map, not the built set.</p>")
    out.append('<div class="table-wrap"><table><thead><tr><th>section</th><th>built</th>'
               "<th>remaining</th><th></th></tr></thead><tbody>")
    for s in sections:
        n = sum(1 for r in s["rows"] if r in built_rows)
        pct = round(100 * n / len(s["rows"])) if s["rows"] else 0
        out.append('<tr><td>%s</td><td><b>%d</b> of %d</td><td class="muted">%s</td>'
                   '<td style="width:120px"><span class="bar"><i style="width:%d%%"></i></span></td></tr>'
                   % (html.escape(s["title"]), n, len(s["rows"]), len(s["rows"]) - n, pct))
    out.append("</tbody></table></div>")

    out.append('<h2 id="components">What each component owes</h2>')
    out.append('<div class="table-wrap"><table><thead><tr><th>component</th><th>attrs</th>'
               "<th>salt</th><th>shadcn</th><th>m3</th><th>matrix</th><th>check page</th>"
               "<th>behaviour gate</th><th>uncited slots</th></tr></thead><tbody>")
    tick = '<span class="yes">\u2713</span>'
    cross = '<span class="no">\u2014</span>'
    for r in per:
        out.append("<tr><td><b>%s</b></td><td>%d</td><td>%d</td><td>%d</td><td>%d</td>"
                   "<td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>"
                   % (r["c"], r["rows"], r["filled"]["salt"], r["filled"]["shadcn"],
                      r["filled"]["m3"],
                      tick if r["matrix"] else cross,
                      tick if r["check"] else cross,
                      tick if r["gate"] else cross,
                      ('<span class="uncited">%d</span>' % r["uncited"]) if r["uncited"] else tick))
    out.append("</tbody></table></div>")

    no_check = [r["c"] for r in per if not r["check"]]
    no_gate = [r["c"] for r in per if not r["gate"]]
    out.append('<h2 id="owed">The open debts, stated plainly</h2>')
    out.append("<ul class='bullets'>"
               "<li><b>%d of %d value slots carry no citation.</b> They were read from source, but "
               "the pointer back was never written down \u2014 so they cannot currently be "
               "re-verified.</li>"
               "<li><b>%d of %d components have no behaviour gate</b>%s.</li>"
               "<li><b>%d component%s generated but never visually checked</b>%s.</li>"
               "<li><b>%d canonical components remain unbuilt.</b> The claim is proven at %d, "
               "not at %d.</li></ul>"
               % (slots_total - slots_cited, slots_total,
                  len(no_gate), len(per),
                  (" \u2014 " + ", ".join(no_gate)) if no_gate else "",
                  len(no_check), "" if len(no_check) == 1 else "s",
                  (" \u2014 " + ", ".join(no_check)) if no_check else "",
                  total - covered, covered, total))
    return "\n".join(out), [("gates", "Gates, last run"),
                            ("coverage", "Coverage against the map"),
                            ("components", "What each component owes"),
                            ("owed", "The open debts, stated plainly")]


# ------------------------------------------------- the matrices, from JSON

SYSTEMS = ["salt", "shadcn", "m3"]


def cell_html(cell):
    """One system's answer, plus its citation as a hover title."""
    if cell is None:
        return '<td class="mc none">—</td>'
    kind = cell.get("kind")
    # BOTH source and note — the note is often where a scoping caveat lives, and
    # showing only the source made a deliberately narrowed cell read as a gap.
    cite = " — ".join(x for x in (cell.get("source"), cell.get("note")) if x)
    cite = cite.replace('"', "&quot;")
    t = ' title="%s"' % html.escape(cite, quote=False)[:400] if cite else ""
    dot = '<i class="cited"></i>' if cite else ""
    if kind == "off":
        return '<td class="mc off"%s>off%s</td>' % (t, dot)
    if kind == "alias":
        return '<td class="mc"%s><span class="alias">%s</span>%s</td>' % (
            t, html.escape(str(cell.get("slot", "?"))), dot)
    if kind == "inherit":
        return '<td class="mc none"%s>inherit%s</td>' % (t, dot)
    v = cell.get("value")
    if isinstance(v, bool):                       # was rendering as Python's True
        v = "yes" if v else "no"
    elif isinstance(v, dict):
        v = "; ".join("%s: %s" % (k, x) for k, x in v.items())
    elif isinstance(v, list):
        v = ", ".join("yes" if x is True else "no" if x is False else str(x) for x in v)
    if kind == "expression":
        return '<td class="mc"%s><span class="expr">%s</span>%s</td>' % (
            t, html.escape(str(v)), dot)
    if kind == "native":
        return '<td class="mc"%s><span class="native">%s</span>%s</td>' % (
            t, html.escape(str(cell.get("token") or v)), dot)
    return '<td class="mc"%s>%s%s</td>' % (t, html.escape(str(v)), dot)


def sig(cell):
    if cell is None:
        return None
    return json.dumps({k: cell.get(k) for k in ("kind", "slot", "value", "token")},
                      sort_keys=True)


def component_html_path(name):
    """Where that component's built harness page lives. Calendar built the
    pilot page (harness/registry.tsx -> out/index.html); every later
    component built the lighter harness/<name>-check.tsx -> out/<name>-check.html
    pattern instead (see CLAUDE.md's build loop, step 7)."""
    fname = "index.html" if name == "calendar" else "%s-check.html" % name
    return os.path.join(BUILD, "out", fname)


def build_component_page(name):
    """Embed that component's already-built harness page (live render, all
    three themes, plus its value side panel) via <iframe srcdoc>, so the site
    stays ONE published file (PUBLISHING.md) instead of linking out to 13
    more. The harness page itself is untracked (2-build/out/ is generated,
    gitignored) — built by node 2-build/tools/build-page.mjs (calendar) or
    build-<name>-check.mjs (everyone else), which build.sh now runs first."""
    path = component_html_path(name)
    build_cmd = ("node 2-build/tools/build-page.mjs" if name == "calendar"
                 else "node 2-build/tools/build-%s-check.mjs" % name)
    if not os.path.exists(path):
        return (
            '<p class="callout">Not built in this checkout. Run '
            '<code>cd 2-build &amp;&amp; npm install</code> once, then '
            '<code>%s</code> from the workspace root and rebuild the site.</p>'
            % html.escape(build_cmd)
        ), []
    raw = read(path)
    body = (
        '<p>Live render, all three themes, generated straight from '
        '<code>2-build/contract/templates/%s.template.json</code> + '
        '<code>2-build/columns/%s.*.json</code> — drag the theme tabs in the '
        'frame’s right-hand panel to see every row for that theme, the same '
        'data behind the <a href="#" data-doc="matrices">Matrices</a> page. '
        '(<code>%s</code>)</p>'
        '<iframe class="comp-frame" data-comp-frame srcdoc="%s"></iframe>'
        % (name, name, html.escape(build_cmd), html.escape(raw))
    )
    return body, []


def build_matrices():
    """ONE table per component. Attributes down, the three systems across.
    Segments are collapsible category rows inside the same table, so the grid
    stays a single continuous matrix rather than six stacked ones."""
    SEG_ORDER = ["structure", "behavior", "prop", "slot", "state", "style"]
    comps = sorted(os.path.basename(f).replace(".template.json", "")
                   for f in glob.glob(os.path.join(BUILD, "contract/templates/*.template.json")))
    tabs, panels, total_rows, total_dis = [], [], 0, 0

    for ci, c in enumerate(comps):
        tpl = json.load(open(os.path.join(BUILD, "contract/templates/%s.template.json" % c),
                             encoding="utf-8"))
        rows = tpl["rows"]
        cols, meta = {}, {}
        for sy in SYSTEMS:
            fp = os.path.join(BUILD, "columns/%s.%s.json" % (c, sy))
            d = json.load(open(fp, encoding="utf-8")) if os.path.exists(fp) else {}
            cols[sy] = d.get("cells") or {}
            meta[sy] = d

        dis = sum(1 for r in rows if len({sig(cols[s].get(r["id"])) for s in SYSTEMS}) > 1)
        total_rows += len(rows)
        total_dis += dis

        buckets = {}
        for r in rows:
            bits = r["id"].split(".")
            piece = r.get("piece") or bits[0]
            rest = bits[1:]
            part = rest[0] if len(rest) > 1 else ""
            label = ".".join(rest[1:]) if len(rest) > 1 else (rest[0] if rest else r["id"])
            buckets.setdefault(piece, {}).setdefault(part, []).append((label, r))

        body = []
        for seg in SEG_ORDER + [k for k in buckets if k not in SEG_ORDER]:
            if seg not in buckets:
                continue
            n = sum(len(v) for v in buckets[seg].values())
            body.append(
                '<tr class="catrow" data-cat="%s"><th colspan="4">'
                '<button class="cattoggle" data-cat="%s" aria-expanded="true">'
                '<i class="caret"></i><span class="seg seg-%s">%s</span>'
                '<em>%d</em></button></th></tr>' % (seg, seg, seg, seg, n))
            for part, items in buckets[seg].items():
                if part:
                    body.append('<tr class="partrow" data-in="%s"><td colspan="4">%s</td></tr>'
                                % (seg, html.escape(part)))
                for label, r in items:
                    cells = [cols[s].get(r["id"]) for s in SYSTEMS]
                    differs = len({sig(x) for x in cells}) > 1
                    pol = r.get("policy", "")
                    info = r.get("channel") == "info" and not any(cells)
                    kl = " ".join(x for x in ("differs" if differs else "",
                                              "inforow" if info else "") if x)
                    body.append(
                        '<tr data-in="%s"%s><th scope="row" class="attr" title="%s">%s%s%s</th>%s</tr>'
                        % (seg, ' class="%s"' % kl if kl else "", r["id"],
                           html.escape(label or r["id"]),
                           '<i class="pol pol-%s" title="%s"></i>' % (pol, pol) if pol else "",
                           '<i class="chinfo" title="info channel — documented in prose, '
                           'no cell data, no gate watches it"></i>' if info else "",
                           "".join('<td class="mc none">not encoded</td>' for _ in cells)
                           if info else "".join(cell_html(x) for x in cells)))

        # slot VALUES as rows in the same table: union of slot names across systems
        names, prov, light, dark = [], {}, {}, {}
        for sy in SYSTEMS:
            sl = meta[sy].get("slots") or {}
            light[sy] = sl.get("light") or {}
            dark[sy] = sl.get("dark") or {}
            prov[sy] = meta[sy].get("provenance") or {}
            for k in light[sy]:
                if k not in names:
                    names.append(k)
        if names:
            body.append(
                '<tr class="catrow" data-cat="values"><th colspan="4">'
                '<button class="cattoggle" data-cat="values" aria-expanded="true">'
                '<i class="caret"></i><span class="seg">slot values</span>'
                "<em>%d</em></button></th></tr>" % len(names))
            for k in names:
                tds = []
                for sy in SYSTEMS:
                    v = light[sy].get(k)
                    if v is None:
                        tds.append('<td class="mc none">—</td>')
                        continue
                    d = dark[sy].get(k)
                    extra = ('<span class="dk"> / %s</span>' % html.escape(str(d))
                             if d and str(d) != str(v) else "")
                    cited = "" if k in prov[sy] else '<span class="uncited" title="no citation">!</span>'
                    tds.append('<td class="mc">%s%s%s</td>'
                               % (html.escape(str(v)), extra, cited))
                body.append('<tr data-in="values"><th scope="row" class="attr">%s</th>%s</tr>'
                            % (html.escape(k), "".join(tds)))

        tabs.append('<button class="ctab%s" data-comp="%s">%s<span>%d</span></button>'
                    % (" on" if ci == 0 else "", c, c, len(rows)))
        panels.append(
            '<section class="cpanel" data-comp="%s"%s>'
            '<div class="cstats"><span><b>%d</b> attributes</span>'
            '<span><b>%d</b> where the three disagree</span>'
            '<span><b>%d</b> identical across all three</span>'
            '<button class="collapse-all">collapse all</button></div>'
            '<div class="table-wrap"><table class="mt matrix"><thead><tr>'
            '<th class="attr">attribute</th><th>salt</th><th>shadcn</th><th>m3</th>'
            "</tr></thead><tbody>%s</tbody></table></div></section>"
            % (c, "" if ci == 0 else " hidden", len(rows), dis, len(rows) - dis,
               "".join(body)))

    return (
        '<p>One table per component: <strong>attributes down, design systems across</strong>. '
        "Segments collapse. Read from <code>contract/templates/*.json</code> and "
        "<code>themes/columns/*.json</code> at build time — nothing hand-written, so it "
        "cannot drift from the data.</p>"
        '<div class="legend">'
        '<span><i class="cited"></i> has a citation — hover the cell</span>'
        '<span>hover an attribute for its full row id</span>'
        '<span><span class="alias">name</span> aliases a slot</span>'
        '<span class="off">off = the system genuinely lacks it</span>'
        '<span><i class="chinfo"></i> info row — prose only, no gate</span>'
        '<span><i class="dbar"></i> the three disagree</span>'
        '<span><span class="uncited">!</span> slot value with no citation</span></div>'
        '<h2 id="all-components">All components</h2>'
        '<div class="cstats total"><span><b>%d</b> attributes total</span>'
        '<span><b>%d</b> disagree across systems</span>'
        '<span><b>%d</b> components</span></div>'
        '<div class="ctabs">%s</div>%s'
        % (total_rows, total_dis, len(comps), "".join(tabs), "".join(panels))
    ), [("all-components", "All components")]


# ---------------------------------------------------------------- shell

def read(p):
    return open(p, encoding="utf-8").read()


def build():
    pages = []
    for slug, fname in PAGES:
        if fname is None:
            if slug == "status":
                body, toc = build_status()
                pages.append({"slug": slug, "file": "2-build/ (measured at build time)",
                              "body": body, "toc": toc, "title": "Where we are",
                              "badge": "Status", "nav": "Where we are", "group": "Start here",
                              "desc": "What is built, what each component still owes, and "
                                      "what the gates said on the last run."})
                continue
            if slug == "matrices":
                body, toc = build_matrices()
                pages.append({"slug": slug, "file": "contract/ + columns/",
                              "body": body, "toc": toc, "title": "Matrices",
                              "badge": "Data", "nav": "Matrices", "group": "Reference",
                              "desc": "The real thing: every row, every system, every value."})
                continue
            name = slug[len("comp-"):]
            body, toc = build_component_page(name)
            pages.append({
                "slug": slug, "file": os.path.relpath(component_html_path(name), WORK),
                "body": body, "toc": toc, "title": name.capitalize(),
                "badge": "Live", "nav": name.capitalize(), "group": "Components",
                "desc": "All three themes, rendered from the generated CSS and skeleton, "
                        "with the full value panel alongside.",
            })
            continue
        path = os.path.join(DOCS, fname)
        if not os.path.exists(path):
            print("MISSING: docs/%s — skipped" % fname)
            continue
        md = read(path)
        body, toc = render(md)
        meta = meta_of(md)
        pages.append({
            "slug": slug, "file": fname, "body": body, "toc": toc,
            "title": meta.get("title", fname),
            "badge": meta.get("badge", ""),
            "desc": meta.get("description", ""),
            "nav": meta.get("nav", meta.get("title", fname)),
            "group": meta.get("group", "Documentation"),
        })

    css = read(os.path.join(INTRO, "build", "docs-shell.css"))

    nav_items, seen = [], []
    for p in pages:
        if p["group"] not in seen:
            seen.append(p["group"])
    for g in seen:
        nav_items.append('<div class="navgroup"><h4>%s</h4><div class="navmenu">' % html.escape(g))
        for p in [x for x in pages if x["group"] == g]:
            subs = "".join('<a class="navlink" href="#%s">%s</a>' % (i, t) for i, t in p["toc"])
            nav_items.append(
                '<button class="navlink" data-doc="%s"%s>%s</button>'
                '<nav class="subnav" data-for="%s"%s>%s</nav>'
                % (p["slug"], ' aria-current="page"' if p is pages[0] else "",
                   html.escape(p["nav"]), p["slug"], "" if p is pages[0] else " hidden", subs))
        nav_items.append("</div></div>")

    articles = []
    for p in pages:
        articles.append(
            '<article id="doc-%s"%s>\n'
            '<div class="page-head">%s<h1>%s</h1>'
            '<p class="lead">%s</p></div>\n'
            '<div class="body-copy">%s</div>\n</article>'
            % (p["slug"], "" if p is pages[0] else " hidden",
               ('<span class="badge badge-secondary">%s</span>' % html.escape(p["badge"]))
               if p["badge"] else "",
               html.escape(p["title"]), inline(p["desc"]), p["body"]))

    options = "".join('<option value="%s">%s</option>' % (p["slug"], html.escape(p["title"]))
                      for p in pages)
    header_links = "".join('<a href="#" data-doc="%s">%s</a>' % (p["slug"], html.escape(p["nav"]))
                           for p in pages if p["group"] in ("Start here", "Reference"))
    sources = "".join('<span class="navnote">%s</span>'
                      % (("docs/" + p["file"]) if p["file"].endswith(".md") else p["file"])
                      for p in pages)

    doc = TEMPLATE.format(css=css, nav="".join(nav_items), articles="\n".join(articles),
                          options=options, header_links=header_links, sources=sources,
                          component_count=len(COMPONENTS),
                          slugs=repr([p["slug"] for p in pages]))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, "w", encoding="utf-8").write(doc)
    print("built %s — %d pages, %d sections, %d bytes"
          % (os.path.relpath(OUT, WORK),
             len(pages), sum(len(p["toc"]) for p in pages), len(doc)))
    for p in pages:
        print("  %-10s %-16s %d sections" % (p["slug"], p["file"], len(p["toc"])))
    return 0


TEMPLATE = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>UI Registry — documentation</title>

<style>
{css}
</style>

<header class="site-header"><div class="inner">
  <p class="brand"><span class="dot"></span> UI Registry</p>
  <span class="header-sep"></span>
  <nav class="header-links">{header_links}</nav>
  <span class="header-meta">{component_count} / 79 components</span>
</div></header>

<div class="mobile-nav">
  <label for="docsel" class="small muted">Page</label>
  <select id="docsel">{options}</select>
</div>

<div class="layout">
  <aside class="sidebar"><div class="rail">
    {nav}
    <div class="navgroup"><h4>Generated from</h4>{sources}
      <span class="navnote">by scripts/build-docs.py</span></div>
  </div></aside>

  <div class="main-row">
    <div class="main-col"><div class="content">
{articles}
    </div></div>
    <aside class="toc"><div class="inner"><div class="list">
      <p class="label">On This Page</p>
      <div id="toclinks"></div>
    </div></div></aside>
  </div>
</div>

<script>
const docs = {slugs};
function buildToc(id){{
  const box = document.getElementById('toclinks'); box.innerHTML = '';
  document.querySelectorAll('#doc-' + id + ' h2[id]').forEach(h => {{
    const a = document.createElement('a');
    a.href = '#' + h.id; a.textContent = h.textContent; box.appendChild(a);
  }});
}}
function fitFrame(f){{
  try {{ f.style.height = (f.contentWindow.document.documentElement.scrollHeight + 24) + 'px'; }}
  catch (e) {{ /* cross-origin or not yet laid out — the CSS min-height covers it */ }}
}}
function show(id){{
  docs.forEach(d => {{
    document.getElementById('doc-' + d).hidden = (d !== id);
    document.querySelectorAll('.navlink[data-doc="' + d + '"]').forEach(b => {{
      if (d === id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    }});
    const sub = document.querySelector('.subnav[data-for="' + d + '"]');
    if (sub) sub.hidden = (d !== id);
  }});
  const sel = document.getElementById('docsel'); if (sel.value !== id) sel.value = id;
  // the matrices page has a single heading, and a component page is one big
  // embedded frame — the TOC is 288px of waste on both
  const wide = (id === 'matrices' || id.indexOf('comp-') === 0);
  document.querySelector('.content').classList.toggle('wide', wide);
  document.querySelector('.toc').hidden = wide;
  // a frame laid out while its article was [hidden] reports scrollHeight 0 —
  // re-measure now that it is visible
  document.querySelectorAll('#doc-' + id + ' iframe.comp-frame').forEach(f => setTimeout(() => fitFrame(f), 30));
  buildToc(id); window.scrollTo(0, 0);
}}
document.querySelectorAll('[data-doc]').forEach(b =>
  b.addEventListener('click', e => {{ e.preventDefault(); show(b.dataset.doc); }}));
document.getElementById('docsel').addEventListener('change', e => show(e.target.value));
// attached here, not as an inline onload= attribute, so fitFrame already
// exists by the time a frame that loads fast (all srcdoc, no network) fires
document.querySelectorAll('iframe[data-comp-frame]').forEach(f => {{
  const attempt = () => fitFrame(f);
  if (f.contentDocument && f.contentDocument.readyState === 'complete') attempt();
  f.addEventListener('load', attempt);
}});

const obs = new IntersectionObserver(es => {{
  es.forEach(e => {{
    if (!e.isIntersecting) return;
    const h = '#' + e.target.id;
    document.querySelectorAll('.subnav .navlink, .toc a').forEach(a =>
      a.classList.toggle('active', a.getAttribute('href') === h));
  }});
}}, {{ rootMargin: '-10% 0px -75% 0px' }});
document.querySelectorAll('article h2[id]').forEach(h => obs.observe(h));
buildToc(docs[0]);
document.querySelector('.content').classList.toggle('wide', docs[0] === 'matrices' || docs[0].indexOf('comp-') === 0);
document.querySelector('.toc').hidden = (docs[0] === 'matrices' || docs[0].indexOf('comp-') === 0);

/* matrices: collapse a segment inside the one big table */
document.addEventListener('click', e => {{
  const t = e.target.closest('.cattoggle');
  if (t) {{
    const open = t.getAttribute('aria-expanded') === 'true';
    t.setAttribute('aria-expanded', String(!open));
    t.closest('table').querySelectorAll('[data-in="' + t.dataset.cat + '"]')
      .forEach(r => r.hidden = open);
    return;
  }}
  const ca = e.target.closest('.collapse-all');
  if (ca) {{
    const tb = ca.closest('.cpanel').querySelector('table');
    const anyOpen = [...tb.querySelectorAll('.cattoggle')]
      .some(b => b.getAttribute('aria-expanded') === 'true');
    tb.querySelectorAll('.cattoggle').forEach(b => {{
      b.setAttribute('aria-expanded', String(!anyOpen));
      tb.querySelectorAll('[data-in="' + b.dataset.cat + '"]')
        .forEach(r => r.hidden = anyOpen);
    }});
    ca.textContent = anyOpen ? 'expand all' : 'collapse all';
  }}
}});

/* matrices page: component switcher */
document.querySelectorAll('.ctab').forEach(t => t.addEventListener('click', () => {{
  const c = t.dataset.comp;
  document.querySelectorAll('.ctab').forEach(x => x.classList.toggle('on', x === t));
  document.querySelectorAll('.cpanel').forEach(p => p.hidden = (p.dataset.comp !== c));
}}));
</script>
"""


if __name__ == "__main__":
    sys.exit(build())
