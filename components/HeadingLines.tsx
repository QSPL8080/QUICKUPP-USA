/*
 * Headings: every sentence starts on its own line.
 *
 *   "Attract More Students. Generate Better Enquiries. Grow Your Institution."
 *
 * shows as three lines on every screen size. Wrap a heading's content in
 * <Lines> (or pass it through sentenceLines) and a line break goes after each
 * full stop that is followed by more of the heading, including across the
 * gradient spans a title is split into. A full stop at the very end adds
 * nothing, and abbreviations ("vs.", "e.g.", "U.S."), initials and numbered
 * steps ("1. Discover") never break.
 */
import { Children, Fragment, cloneElement, createElement, isValidElement, type ReactNode } from "react";

const ABBREVIATIONS = new Set([
  "vs", "etc", "inc", "ltd", "llc", "co", "corp", "st", "dr", "mr", "mrs", "ms", "jr", "sr", "no", "approx", "est", "fig", "dept",
]);

/** `before` is the text up to and including a full stop: does that full stop end a sentence? */
function endsSentence(before: string): boolean {
  if (!before.endsWith(".") || before.endsWith("..")) return false;
  const word = before.slice(0, -1).match(/[\p{L}\p{N}.&'’-]*$/u)?.[0] ?? "";
  if (!word) return false;
  if (word.includes(".")) return false; // e.g. / U.S. / a domain
  if (/^\p{L}$/u.test(word)) return false; // an initial
  if (/^\d+$/.test(word)) return false; // "1. Discover"
  return !ABBREVIATIONS.has(word.toLowerCase());
}

const lineBreak = () => createElement("br", { "data-sentence-break": "" });

/** the plain text of a node, as far as it can be read without rendering it */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode; text?: unknown };
    if (props.children !== undefined && typeof props.children !== "function") return textOf(props.children);
    if (typeof props.text === "string") return props.text;
  }
  return "";
}

/** "A. B. C." -> ["A.", <br/>, "B.", <br/>, "C."] */
function splitText(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const gap = /\.(\s+)(?=\S)/g;
  let from = 0;
  let m: RegExpExecArray | null;
  while ((m = gap.exec(text))) {
    const end = m.index + 1;
    if (!endsSentence(text.slice(0, end))) continue;
    out.push(text.slice(from, end), lineBreak());
    from = end + m[1].length;
  }
  out.push(text.slice(from));
  return out.filter((p) => p !== "");
}

const isBreak = (node: ReactNode) => isValidElement(node) && node.type === "br";

function lineParts(children: ReactNode): ReactNode[] {
  // 1. break inside each piece of text, and inside nested spans
  const parts: ReactNode[] = [];
  for (const child of Children.toArray(children)) {
    if (typeof child === "string") parts.push(...splitText(child));
    else if (isValidElement(child)) {
      const props = child.props as { children?: ReactNode };
      const nested = props.children;
      parts.push(
        nested === undefined || typeof nested === "function" || typeof child.type === "string" && ["svg", "code", "pre", "br"].includes(child.type)
          ? child
          : cloneElement(child, undefined, ...lineParts(nested)),
      );
    } else parts.push(child);
  }

  // 2. break between pieces: a piece that ends a sentence followed by one with more text
  const out: ReactNode[] = [];
  let spaces: ReactNode[] = [];
  let pending = false;
  for (const part of parts) {
    if (isBreak(part)) {
      spaces = [];
      out.push(part);
      pending = false;
      continue;
    }
    const text = textOf(part);
    if (!text.trim()) {
      if (typeof part === "string") spaces.push(part);
      else out.push(part); // an icon or similar
      continue;
    }
    if (pending) {
      out.push(lineBreak());
      out.push(typeof part === "string" ? part.trimStart() : part);
    } else {
      out.push(...spaces, part);
    }
    spaces = [];
    pending = endsSentence(text.trimEnd());
  }
  out.push(...spaces);
  return out;
}

/** a heading's content with a line break after every full stop that ends a sentence */
export function sentenceLines(children: ReactNode): ReactNode {
  return createElement(Fragment, null, ...lineParts(children));
}

export default function Lines({ children }: { children?: ReactNode }) {
  return sentenceLines(children);
}
