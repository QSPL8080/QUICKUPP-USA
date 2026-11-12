import Link from "next/link";
import type { ReactNode } from "react";
import Lines from "@/components/HeadingLines";

/*
 * Renders blog paragraph strings (from the blog document or the CRM editor):
 *   "- text"       bullet item, consecutive items form one list
 *   "1. text"      numbered item, consecutive items form one numbered list
 *   "**text**"     bold lead-in line
 *   "[text](url)"  hyperlink; "**bold**" inside a sentence
 *   "![caption](url)"  image on its own line; images next to each other form a gallery
 */

const INLINE = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

export function inline(text: string, keyBase = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${n++}`;
    if (m[1] !== undefined) {
      const href = m[2];
      out.push(
        href.startsWith("/") ? (
          <Link key={key} href={href}>
            {m[1]}
          </Link>
        ) : (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer">
            {m[1]}
          </a>
        )
      );
    } else {
      out.push(<strong key={key}>{m[3]}</strong>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** The plain words of a markup string (for meta tags and search) */
export function plain(text: string) {
  return text.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");
}

type Img = { src: string; caption: string };
type Block = { kind: "img"; images: Img[] } | { kind: "p"; text: string } | { kind: "lead"; text: string } | { kind: "ul"; items: string[] } | { kind: "ol"; items: string[]; start: number };

function toBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  // a list or image line typed right under another line still starts its own block
  const flat = lines.flatMap((l) => l.split(/\n(?=\s*(?:[-•]\s|\d+[.)]\s|!\[))/));
  for (const raw of flat) {
    const line = raw.trim();
    if (!line) continue;
    const img = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    const bullet = line.match(/^[-•]\s+(.*)$/);
    const num = line.match(/^(\d+)[.)]\s+(.*)$/);
    const prev = blocks[blocks.length - 1];
    if (img) {
      const one = { src: img[2], caption: img[1].trim() };
      if (prev && prev.kind === "img") prev.images.push(one);
      else blocks.push({ kind: "img", images: [one] });
    } else if (bullet) {
      if (prev && prev.kind === "ul") prev.items.push(bullet[1]);
      else blocks.push({ kind: "ul", items: [bullet[1]] });
    } else if (num) {
      if (prev && prev.kind === "ol") prev.items.push(num[2]);
      else blocks.push({ kind: "ol", items: [num[2]], start: Number(num[1]) });
    } else if (/^\*\*[^*]+\*\*$/.test(line)) {
      blocks.push({ kind: "lead", text: line.slice(2, -2) });
    } else {
      blocks.push({ kind: "p", text: line });
    }
  }
  return blocks;
}

export default function BlogRichText({ lines, firstClass }: { lines: string[]; firstClass?: string }) {
  const blocks = toBlocks(lines);
  return (
    <>
      {blocks.map((b, i) => {
        if (b.kind === "img")
          return (
            <div key={i} className={`bld-gallery bld-gallery-${Math.min(b.images.length, 3)}`}>
              {b.images.map((im, j) => (
                <figure key={j} className="bld-figure">
                  <img src={im.src} alt={im.caption} loading="lazy" />
                  {im.caption && <figcaption>{im.caption}</figcaption>}
                </figure>
              ))}
            </div>
          );
        if (b.kind === "ul")
          return (
            <ul key={i} className="bld-ul">
              {b.items.map((it, j) => (
                <li key={j}>{inline(it, `${i}-${j}`)}</li>
              ))}
            </ul>
          );
        if (b.kind === "ol")
          return (
            <ol key={i} className="bld-ol" start={b.start}>
              {b.items.map((it, j) => (
                <li key={j}>{inline(it, `${i}-${j}`)}</li>
              ))}
            </ol>
          );
        if (b.kind === "lead" && !/[:：]$/.test(b.text.trim()))
          return (
            <h3 key={i} className="bld-h3"><Lines>
              {inline(b.text, `${i}`)}
            </Lines></h3>
          );
        if (b.kind === "lead")
          return (
            <p key={i} className="bld-lead">
              {inline(b.text, `${i}`)}
            </p>
          );
        return (
          <p key={i} className={i === 0 && firstClass ? `bld-p ${firstClass}` : "bld-p"}>
            {inline(b.text, `${i}`)}
          </p>
        );
      })}
    </>
  );
}
