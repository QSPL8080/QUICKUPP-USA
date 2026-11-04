#!/usr/bin/env python3
"""
Build data/seed-blogs.json and data/blogs.ts from "Quickupp US Blog.docx".

Only what the document says is used: the page URL (slug), meta title, meta
description, H1 (title) and the article body with its headings, lists, bold
lead-ins and hyperlinks. Nothing is added.

Paragraph strings use a small markup the blog page renders:
  "- text"        bullet item (consecutive items form one list)
  "**text**"      bold lead-in line ("They can assist with:")
  "[text](url)"   hyperlink inside a sentence
Site links (quickuppsoftech.us) are written as site paths (/services/...).

Usage: python3 scripts/blog-docs.py "<path to Quickupp US Blog.docx>" <repo root>
"""
import json
import re
import sys
from pathlib import Path

import docx
from docx.oxml.ns import qn

W_HYPERLINK = qn("w:hyperlink")
W_R = qn("w:r")
W_T = qn("w:t")
W_BR = qn("w:br")
W_TAB = qn("w:tab")
W_RPR = qn("w:rPr")
W_B = qn("w:b")
R_ID = qn("r:id")
W_NUMPR = qn("w:numPr")
W_PPR = qn("w:pPr")

IMAGES = [f"/images/blog-img-0{i}.jpg" for i in range(1, 7)]


def site_link(url: str) -> str:
    url = url.strip()
    m = re.match(r"^https?://(www\.)?quickuppsoftech\.us(/.*)?$", url, re.I)
    if m:
        path = (m.group(2) or "/").rstrip("/") or "/"
        return path
    return url


def run_bold(r) -> bool:
    rpr = r.find(W_RPR)
    if rpr is None:
        return False
    b = rpr.find(W_B)
    if b is None:
        return False
    val = b.get(qn("w:val"))
    return val not in ("0", "false")


def paragraph_segments(p, rels):
    """Split a paragraph at line breaks. Each segment is a list of (text, bold, href)."""
    segs = [[]]

    def add_run(r, href):
        bold = run_bold(r)
        for child in r:
            if child.tag == W_T:
                segs[-1].append((child.text or "", bold, href))
            elif child.tag == W_TAB:
                segs[-1].append((" ", bold, href))
            elif child.tag == W_BR:
                segs.append([])

    for child in p._p:
        if child.tag == W_R:
            add_run(child, None)
        elif child.tag == W_HYPERLINK:
            rid = child.get(R_ID)
            href = rels[rid].target_ref if rid and rid in rels else None
            for r in child.iter(W_R):
                add_run(r, href)
    return segs


def seg_text(seg):
    return "".join(t for t, _, _ in seg)


def seg_markup(seg, keep_bold=True):
    """Text with [link](url) and **bold** markup, merging neighbouring runs."""
    out = []
    i = 0
    while i < len(seg):
        t, b, h = seg[i]
        if h:
            text = ""
            while i < len(seg) and seg[i][2] == h:
                text += seg[i][0]
                i += 1
            lead = text[: len(text) - len(text.lstrip())]
            trail = text[len(text.rstrip()):]
            out.append(f"{lead}[{text.strip()}]({site_link(h)}){trail}")
            continue
        if b and keep_bold:
            text = ""
            while i < len(seg) and seg[i][1] and not seg[i][2]:
                text += seg[i][0]
                i += 1
            if text.strip():
                lead = text[: len(text) - len(text.lstrip())]
                trail = text[len(text.rstrip()):]
                out.append(f"{lead}**{text.strip()}**{trail}")
            else:
                out.append(text)
            continue
        out.append(t)
        i += 1
    s = "".join(out)
    s = re.sub(r"\*\*\s*\*\*", "", s)
    return re.sub(r"[  ]+", " ", s).strip()


def all_bold(seg):
    chars = [(t, b) for t, b, _ in seg if t.strip()]
    return bool(chars) and all(b for _, b in chars)


def is_heading_style(p):
    name = (p.style.name or "").lower() if p.style is not None else ""
    return name.startswith("heading") or name == "title"


def is_list(p):
    ppr = p._p.find(W_PPR)
    return ppr is not None and ppr.find(W_NUMPR) is not None


META_RE = re.compile(r"(Page\s*U[Rr][Ll]|Meta\s*Title|Meta\s*Description|H1)\s*[-–:]\s*", re.I)


def parse_meta(text, meta):
    """Pull slug / meta title / meta description / H1 out of a metadata line."""
    parts = META_RE.split(text)
    # parts: [before, key, value, key, value, ...]
    for k, v in zip(parts[1::2], parts[2::2]):
        v = re.sub(r"\s+", " ", v.replace("*", "")).strip()
        kl = k.lower().replace(" ", "")
        if kl.startswith("pageur"):
            meta["slug"] = v.split()[0] if v else ""
        elif kl.startswith("metatitle"):
            meta["metaTitle"] = v.replace("\\|", "|")
        elif kl.startswith("metadescription"):
            meta["desc"] = v
        elif kl == "h1":
            meta["title"] = v


def main():
    src, root = Path(sys.argv[1]), Path(sys.argv[2])
    d = docx.Document(str(src))
    rels = d.part.rels

    posts = []
    cur = None
    in_meta = False

    for p in d.paragraphs:
        segs = paragraph_segments(p, rels)
        listy = is_list(p)
        for seg in segs:
            raw = seg_text(seg)
            text = re.sub(r"\s+", " ", raw).strip()
            if not text:
                continue
            if re.match(r"^\**\s*Page\s*U[Rr][Ll]", text, re.I):
                cur = {"meta": {}, "blocks": []}
                posts.append(cur)
                in_meta = True
                parse_meta(text, cur["meta"])
                continue
            if cur is None:
                continue
            if in_meta and META_RE.search(text) and not cur["meta"].get("title"):
                parse_meta(text, cur["meta"])
                continue
            if in_meta and META_RE.match(text.replace("*", "").strip()):
                parse_meta(text, cur["meta"])
                continue
            in_meta = False if cur["meta"].get("title") else in_meta
            if in_meta:
                continue

            plain = text.replace("*", "").strip()
            bold = all_bold(seg)
            numbered_head = re.match(r"^\d+\.\s+\S", plain) and not re.match(r"^\d+\\?\.", raw.strip()[:0] or "x")
            if listy:
                cur["blocks"].append(("li", seg_markup(seg, keep_bold=True)))
            elif (bold or is_heading_style(p)) and len(plain) <= 140 and (re.match(r"^\d+\.\s", plain) or plain.lower().rstrip(":") in ("conclusion", "final thoughts", "summary")):
                cur["blocks"].append(("h", plain))
            elif bold and len(plain) <= 140:
                cur["blocks"].append(("lead", plain))
            else:
                cur["blocks"].append(("p", seg_markup(seg, keep_bold=not bold)))

    out = []
    for idx, post in enumerate(posts):
        m = post["meta"]
        intro, sections = [], []
        target = intro
        for kind, val in post["blocks"]:
            if kind == "h":
                sections.append({"heading": val, "paragraphs": []})
                target = sections[-1]["paragraphs"]
            elif kind == "li":
                target.append("- " + val)
            elif kind == "lead":
                target.append(f"**{val}**")
            else:
                target.append(val)
        # numbered lines inside a section ("2. Sharing...") stay as plain lines
        out.append(
            {
                "slug": m["slug"],
                "category": "",
                "date": "",
                "title": m["title"],
                "desc": m.get("desc", ""),
                "author": "",
                "authorRole": "",
                "readTime": "",
                "img": IMAGES[idx % len(IMAGES)],
                "content": {
                    "metaTitle": m.get("metaTitle", ""),
                    "intro": "\n\n".join(intro),
                    "keyTakeaways": [],
                    "sections": sections,
                    "conclusion": "",
                },
            }
        )

    (root / "data/seed-blogs.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    ts = (root / "data/blogs.ts").read_text(encoding="utf-8")
    head = ts[: ts.index("export const blogPosts")]
    (root / "data/blogs.ts").write_text(
        head + "export const blogPosts: BlogPost[] = " + json.dumps(out, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8"
    )
    for o in out:
        n_links = sum(len(re.findall(r"\]\(", x)) for s in o["content"]["sections"] for x in s["paragraphs"]) + len(re.findall(r"\]\(", o["content"]["intro"]))
        print(f'{o["slug"]}: {len(o["content"]["sections"])} sections, {n_links} links | {o["title"]}')


if __name__ == "__main__":
    main()
