"""Builds data/case-study-docs.ts from the case study .docx files (exact text, original order)."""
import sys, os, re, json
import docx
from docx.table import Table
from docx.text.paragraph import Paragraph

SRC, REPO = sys.argv[1], sys.argv[2]
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
clean = lambda s: re.sub(r'[ \t ]+', ' ', s).strip()

def is_kicker(p):
    runs = [r for r in p.runs if r.text.strip()]
    t = clean(p.text)
    return runs and all(r.bold for r in runs) and t == t.upper() and re.search('[A-Z]', t)

def cell_lines(c):
    return [clean(p.text) for p in c.paragraphs if clean(p.text)]

out = {}
warnings = []
for fn in sorted(os.listdir(SRC)):
    if not fn.endswith('-Case-Study.docx'):
        continue
    slug = fn[: -len('-Case-Study.docx')].lower()
    d = docx.Document(os.path.join(SRC, fn))
    blocks, head = [], []
    info = None
    img_n = 0
    imgdir = os.path.join(REPO, 'public/images/case-studies', slug)
    os.makedirs(imgdir, exist_ok=True)
    for ch in d.element.body.iterchildren():
        tag = ch.tag.split('}')[1]
        if tag == 'p':
            p = Paragraph(ch, d)
            blips = ch.findall('.//' + A + 'blip')
            if blips:
                for b in blips:
                    rid = b.get(R + 'embed')
                    part = d.part.related_parts[rid]
                    ext = os.path.splitext(part.partname)[1] or '.png'
                    img_n += 1
                    name = f'diagram-{img_n}{ext}'
                    open(os.path.join(imgdir, name), 'wb').write(part.blob)
                    blocks.append({'type': 'img', 'src': f'/images/case-studies/{slug}/{name}'})
                continue
            t = clean(p.text)
            if not t:
                continue
            if len(head) < 3 and not blocks and info is None:
                head.append(t)
                continue
            style = p.style.name if p.style is not None else "Normal"
            numbered = ch.find('.//' + W + 'numPr') is not None or style.startswith('List')
            runs = [r for r in p.runs if r.text]
            if style.startswith('Heading'):
                blocks.append({'type': 'h2', 'text': t})
            elif numbered:
                lead = ''.join(r.text for r in runs if r.bold)
                rest = ''.join(r.text for r in runs if not r.bold)
                lead = clean(lead) if runs and runs[0].bold else ''
                blocks.append({'type': 'li', 'lead': lead, 'text': clean(rest) if lead else t})
            elif is_kicker(p):
                blocks.append({'type': 'kicker', 'text': t})
            elif runs and all(r.italic for r in runs if r.text.strip()):
                blocks.append({'type': 'caption', 'text': t})
            else:
                if runs and all(r.bold for r in runs if r.text.strip()):
                    warnings.append(f'{slug}: bold paragraph kept as text: {t[:60]}')
                blocks.append({'type': 'p', 'text': t})
        elif tag == 'tbl':
            tb = Table(ch, d)
            rows = [[cell_lines(c) for c in r.cells] for r in tb.rows]
            ncols = len(tb.columns)
            if info is None and len(rows) == 2 and not blocks:
                info = {'labels': [' '.join(c) for c in rows[0]], 'values': [' '.join(c) for c in rows[1]]}
            elif ncols == 1 and len(rows) == 1:
                lines = rows[0][0]
                if not lines:
                    continue  # empty spacer table in the document
                blocks.append({'type': 'cta', 'kicker': lines[0], 'title': lines[1] if len(lines) > 1 else '', 'text': ' '.join(lines[2:])})
            elif all(len(c) >= 2 for r in rows for c in r if c) and not any(len(c) == 1 for r in rows for c in r):
                items = [{'val': c[0], 'lbl': ' '.join(c[1:])} for r in rows for c in r if c]
                blocks.append({'type': 'stats', 'cols': ncols, 'items': items})
            else:
                flat = [[' '.join(c) for c in r] for r in rows]
                last = tb.rows[-1].cells[0].paragraphs
                total = bool(last and last[0].runs and all(r.bold for r in last[0].runs if r.text.strip()) and flat[-1][0].lower().startswith('total'))
                blocks.append({'type': 'table', 'headers': flat[0], 'rows': flat[1:], 'total': total})
    # merge consecutive list items
    merged = []
    for b in blocks:
        if b['type'] == 'li':
            if merged and merged[-1]['type'] == 'list':
                merged[-1]['items'].append({'lead': b['lead'], 'text': b['text']})
            else:
                merged.append({'type': 'list', 'items': [{'lead': b['lead'], 'text': b['text']}]})
        else:
            merged.append(b)
    if len(head) < 3 or info is None:
        warnings.append(f'{slug}: head={len(head)} info={info is not None}')
    out[slug] = {'kicker': head[0], 'title': head[1], 'intro': head[2], 'info': info, 'blocks': merged}

ts = '''/*
 * Case studies exactly as written in the case study documents (one .docx per
 * client, in the project root). Generated by scripts/case-study-docs.py: text and
 * order come straight from the documents, so edit the documents and run it
 * again rather than editing this file by hand.
 */

export type CsStat = { val: string; lbl: string };
export type CsBlock =
  | { type: "kicker"; text: string }
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "caption"; text: string }
  | { type: "list"; items: { lead: string; text: string }[] }
  | { type: "img"; src: string }
  | { type: "stats"; cols: number; items: CsStat[] }
  | { type: "table"; headers: string[]; rows: string[][]; total: boolean }
  | { type: "cta"; kicker: string; title: string; text: string };

export type CsDoc = {
  kicker: string;
  title: string;
  intro: string;
  info: { labels: string[]; values: string[] };
  blocks: CsBlock[];
};

export const CASE_STUDY_DOCS: Record<string, CsDoc> = ''' + json.dumps(out, ensure_ascii=False, indent=2) + ';\n'
open(os.path.join(REPO, 'data/case-study-docs.ts'), 'w').write(ts)
print(len(out), 'docs')
for w in warnings:
    print('WARN', w)
