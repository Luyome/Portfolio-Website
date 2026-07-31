export type ContentBlock =
  | { type: "heading"; text: string; slug: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt: string };

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const IMAGE_RE = /^!\[(.*?)\]\((.*?)\)$/;
const HEADING_RE = /^#+\s*(.+)$/;

export function parseContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let paragraphBuf: string[] = [];
  const slugCounts = new Map<string, number>();

  function flushParagraph() {
    if (paragraphBuf.length) {
      blocks.push({ type: "paragraph", text: paragraphBuf.join(" ").trim() });
      paragraphBuf = [];
    }
  }

  function uniqueSlug(base: string): string {
    const seen = slugCounts.get(base) ?? 0;
    slugCounts.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen + 1}`;
  }

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      continue;
    }
    const headingMatch = line.match(HEADING_RE);
    if (headingMatch) {
      flushParagraph();
      const text = headingMatch[1].trim();
      blocks.push({ type: "heading", text, slug: uniqueSlug(slugify(text)) });
      continue;
    }
    const imgMatch = line.match(IMAGE_RE);
    if (imgMatch) {
      flushParagraph();
      blocks.push({ type: "image", alt: imgMatch[1], src: imgMatch[2] });
      continue;
    }
    paragraphBuf.push(line);
  }
  flushParagraph();
  return blocks;
}

export function extractHeadings(content: string): { text: string; slug: string }[] {
  return parseContent(content).filter((b): b is { type: "heading"; text: string; slug: string } => b.type === "heading");
}
