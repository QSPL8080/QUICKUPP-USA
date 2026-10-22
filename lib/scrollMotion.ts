/*
 * Shared scroll-in motion engine used by AboutMotion and IndustryMotion.
 * It finds the page's sections, picks targets (headings, text, images,
 * side-by-side rows and repeated card groups) and plays a CSS animation
 * when each target scrolls into view. Motion only: once an animation
 * finishes, every added class is removed, so the element returns to its
 * normal styles. Elements holding a sticky column are never transformed.
 */

export interface MotionPreset {
  /** CSS class prefix, e.g. "am" -> .am-pending, .am-in, .am-<anim> */
  prefix: string;
  heroTitle: string;
  hero: string;
  heading: string;
  text: string;
  media: string;
  splitFirst: string;
  splitMiddle: string;
  splitLast: string;
  /** Card-group effects, rotated per group. "wave" alternates wave-l / wave-r. */
  items: string[];
  /** Delay between cards in a group (seconds) */
  stagger: number;
  /** Delay between steps of the hero timeline (seconds) */
  heroStep: number;
}

const MAX_TARGETS_PER_SECTION = 40;

function signature(el: Element) {
  return `${el.tagName}.${(el.getAttribute("class") || "").trim().split(/\s+/)[0] || ""}`;
}

/** An element whose children are 3+ repeated items (cards, list rows, chips…) */
function isGroup(el: Element) {
  const kids = Array.from(el.children);
  if (kids.length < 3) return false;
  const counts = new Map<string, number>();
  kids.forEach((k) => counts.set(signature(k), (counts.get(signature(k)) || 0) + 1));
  return Math.max(...counts.values()) / kids.length >= 0.7;
}

/** Two or three children laid out side by side */
function isSplitRow(el: HTMLElement) {
  const kids = Array.from(el.children) as HTMLElement[];
  if (kids.length < 2 || kids.length > 3) return false;
  const parentW = el.getBoundingClientRect().width;
  const rects = kids.map((k) => k.getBoundingClientRect());
  const sameRow = rects.every((r) => Math.abs(r.top - rects[0].top) < 40);
  const narrow = rects.every((r) => r.width < parentW * 0.75 && r.width > 40);
  return sameRow && narrow;
}

const isMedia = (el: Element) =>
  el.matches("img, picture, video") ||
  /(^|[\s_-])(img|image|photo|visual|media|thumb)([\s_-]|$)/i.test(el.getAttribute("class") || "");

const isTextBlock = (el: Element) => el.matches("p, a, button, ul, ol, blockquote, h3, h4, h5, h6, span, label, form");

type Target = { el: HTMLElement; anim: string; delay: number };

export function setupScrollMotion(root: HTMLElement, preset: MotionPreset, seed = 0): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const P = preset.prefix;

  const sections = Array.from(root.querySelectorAll("section")).filter(
    (s) => !s.closest("header, footer") && !s.parentElement?.closest("section")
  );

  const blocked = new Set<Element>();
  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (getComputedStyle(el).position === "sticky") {
      let p: Element | null = el;
      while (p && p !== root) {
        blocked.add(p);
        p = p.parentElement;
      }
    }
  });

  const itemAnim = (groupIndex: number, i: number) => {
    const a = preset.items[groupIndex % preset.items.length];
    return a === "wave" ? (i % 2 === 0 ? "wave-l" : "wave-r") : a;
  };

  const targets: Target[] = [];
  let groupCounter = seed;

  sections.forEach((section, sIdx) => {
    const isHero = sIdx === 0;
    const list: Target[] = [];

    const add = (el: HTMLElement, anim: string, delay = 0) => {
      if (list.length >= MAX_TARGETS_PER_SECTION || blocked.has(el)) return;
      list.push({ el, anim, delay });
    };

    const walk = (el: HTMLElement, depth: number) => {
      if (depth > 7 || list.length >= MAX_TARGETS_PER_SECTION) return;
      for (const child of Array.from(el.children) as HTMLElement[]) {
        const cs = getComputedStyle(child);
        if (cs.position === "absolute" || cs.position === "fixed" || cs.display === "none") continue;
        const rect = child.getBoundingClientRect();
        if (rect.height < 4 || rect.width < 4) continue;
        if (cs.position === "sticky") {
          walk(child, depth + 1);
          continue;
        }
        // Self-animating elements (marquees, loops) are never touched
        if (cs.animationName && cs.animationName !== "none") continue;
        // Clipped or scrolling strips (marquees, carousels): reveal the strip
        // as one block so off-screen items are never left hidden
        if (/(hidden|auto|scroll|clip)/.test(cs.overflowX) && child.scrollWidth > child.clientWidth + 20) {
          add(child, preset.text);
          continue;
        }
        if (child.matches("h1")) {
          add(child, isHero ? preset.heroTitle : preset.heading);
          continue;
        }
        if (child.matches("h2")) {
          add(child, preset.heading);
          continue;
        }
        if (isGroup(child)) {
          const g = groupCounter++;
          const kids = (Array.from(child.children) as HTMLElement[]).filter((k) => k.getBoundingClientRect().height > 4);
          kids.slice(0, 16).forEach((k, i) => {
            if (blocked.has(k)) walk(k, depth + 1);
            else add(k, isHero ? preset.hero : itemAnim(g, i), Math.min(i, 10) * preset.stagger);
          });
          continue;
        }
        if (isMedia(child) && rect.height < 1100) {
          add(child, preset.media);
          continue;
        }
        if (!blocked.has(child) && depth <= 4 && isSplitRow(child)) {
          const kids = Array.from(child.children) as HTMLElement[];
          kids.forEach((k, i) => {
            if (blocked.has(k)) walk(k, depth + 1);
            else {
              const a = i === 0 ? preset.splitFirst : i === kids.length - 1 ? preset.splitLast : preset.splitMiddle;
              add(k, a, i * preset.stagger);
            }
          });
          continue;
        }
        if (isTextBlock(child) || child.children.length === 0) {
          add(child, preset.text);
          continue;
        }
        walk(child, depth + 1);
      }
    };

    walk(section, 0);
    if (isHero) list.forEach((t, i) => (t.delay = 0.1 + i * preset.heroStep));
    targets.push(...list);
  });

  targets.forEach((t) => {
    t.el.classList.add(`${P}-pending`);
    t.el.dataset.smAnim = t.anim;
    t.el.style.setProperty(`--${P}-delay`, `${t.delay}s`);
  });

  const play = (el: HTMLElement) => {
    const anim = el.dataset.smAnim;
    if (!anim || el.classList.contains(`${P}-in`)) return;
    el.classList.add(`${P}-in`, `${P}-${anim}`);
    const done = (e: AnimationEvent) => {
      if (e.target !== el) return;
      el.classList.remove(`${P}-pending`, `${P}-in`, `${P}-${anim}`);
      el.style.removeProperty(`--${P}-delay`);
      delete el.dataset.smAnim;
      el.removeEventListener("animationend", done);
    };
    el.addEventListener("animationend", done);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          play(entry.target as HTMLElement);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  targets.forEach((t) => io.observe(t.el));

  // Safety net: never leave anything hidden that is on screen
  const safety = window.setTimeout(() => {
    targets.forEach((t) => {
      if (!t.el.classList.contains(`${P}-pending`)) return;
      const r = t.el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) play(t.el);
    });
  }, 2500);

  return () => {
    io.disconnect();
    window.clearTimeout(safety);
    targets.forEach((t) => {
      t.el.classList.remove(`${P}-pending`, `${P}-in`, `${P}-${t.anim}`);
      t.el.style.removeProperty(`--${P}-delay`);
      delete t.el.dataset.smAnim;
    });
  };
}
