export type Sel = { start: number; end: number };
export type TransformResult = { nextText: string; nextSelection?: Sel };

function replaceRange(text: string, start: number, end: number, insert: string): string {
  return text.slice(0, start) + insert + text.slice(end);
}

export function toggleWrap(text: string, sel: Sel, wrapper: string): TransformResult {
  const { start, end } = sel;
  const selected = text.slice(start, end);
  const already = selected.startsWith(wrapper) && selected.endsWith(wrapper);
  const inner = already ? selected.slice(wrapper.length, selected.length - wrapper.length) : selected;
  const insert = already ? inner : `${wrapper}${inner || "text"}${wrapper}`;
  const nextText = replaceRange(text, start, end, insert);
  const delta = already ? -wrapper.length * 2 : wrapper.length * 2;
  return { nextText, nextSelection: { start, end: end + (selected ? delta : insert.length) } };
}

export const toggleBold = (t: string, s: Sel) => toggleWrap(t, s, "**");
export const toggleItalic = (t: string, s: Sel) => toggleWrap(t, s, "*");
export const toggleCodeInline = (t: string, s: Sel) => toggleWrap(t, s, "`");

export function wrapLink(text: string, sel: Sel): TransformResult {
  const { start, end } = sel;
  const selected = text.slice(start, end) || "link";
  const url = "https://";
  const insert = `[${selected}](${url})`;
  const nextText = replaceRange(text, start, end, insert);
  return { nextText, nextSelection: { start: start + 1, end: start + 1 + selected.length } };
}

function linesInSelection(text: string, sel: Sel): { begin: number; end: number; lines: string[] } {
  const before = text.slice(0, sel.start);
  const startLine = before.lastIndexOf("\n") + 1;
  const after = text.slice(sel.end);
  const endLineOffset = after.indexOf("\n");
  const endIdx = sel.end + (endLineOffset === -1 ? after.length : endLineOffset);
  const block = text.slice(startLine, endIdx);
  return { begin: startLine, end: endIdx, lines: block.split("\n") };
}

export function toggleHeading(text: string, sel: Sel, level: 2 | 3): TransformResult {
  const pfx = level === 2 ? "## " : "### ";
  const { begin, end, lines } = linesInSelection(text, sel);
  const mapped = lines.map((ln) => (ln.startsWith(pfx) ? ln.replace(pfx, "") : `${pfx}${ln}`));
  const insert = mapped.join("\n");
  const nextText = replaceRange(text, begin, end, insert);
  return { nextText, nextSelection: { start: begin, end: begin + insert.length } };
}

export function toggleQuote(text: string, sel: Sel): TransformResult {
  const { begin, end, lines } = linesInSelection(text, sel);
  const p = "> ";
  const mapped = lines.map((ln) => (ln.startsWith(p) ? ln.replace(p, "") : `${p}${ln}`));
  const insert = mapped.join("\n");
  const nextText = replaceRange(text, begin, end, insert);
  return { nextText, nextSelection: { start: begin, end: begin + insert.length } };
}

export function toggleListBulleted(text: string, sel: Sel): TransformResult {
  const { begin, end, lines } = linesInSelection(text, sel);
  const p = "- ";
  const mapped = lines.map((ln) => (ln.startsWith(p) ? ln.replace(p, "") : `${p}${ln}`));
  const insert = mapped.join("\n");
  const nextText = replaceRange(text, begin, end, insert);
  return { nextText, nextSelection: { start: begin, end: begin + insert.length } };
}

export function toggleListNumbered(text: string, sel: Sel): TransformResult {
  const { begin, end, lines } = linesInSelection(text, sel);
  let n = 1;
  const mapped = lines.map((ln) => (ln.match(/^\d+\.\s/) ? ln.replace(/^\d+\.\s/, "") : `${n++}. ${ln}`));
  const insert = mapped.join("\n");
  const nextText = replaceRange(text, begin, end, insert);
  return { nextText, nextSelection: { start: begin, end: begin + insert.length } };
}

export function insertFence(text: string, sel: Sel): TransformResult {
  const fence = "```\ncode\n```";
  const nextText = replaceRange(text, sel.start, sel.end, fence);
  const pos = sel.start + 4;
  return { nextText, nextSelection: { start: pos, end: pos + 4 } };
}

export function insertImage(text: string, sel: Sel, src: string, alt?: string): TransformResult {
  const md = `![${alt || "Alt"}](${src})`;
  const nextText = replaceRange(text, sel.start, sel.end, md);
  const pos = sel.start + md.length;
  return { nextText, nextSelection: { start: pos, end: pos } };
}

export function insertFigureCaption(text: string, sel: Sel, src: string, alt?: string): TransformResult {
  const md = `![${alt || "Alt"}](${src})\n<figcaption>Caption</figcaption>\n`;
  const nextText = replaceRange(text, sel.start, sel.end, md);
  const pos = sel.start + md.length;
  return { nextText, nextSelection: { start: pos, end: pos } };
}

export function insertOutlineBlog(text: string, sel: Sel): TransformResult {
  const outline = `## Introduction\n\n## Section 1\n\n## Section 2\n\n## Takeaways\n\n`;
  const nextText = replaceRange(text, sel.start, sel.end, outline);
  return { nextText, nextSelection: { start: sel.start, end: sel.start + outline.length } };
}

export function insertOutlineCase(text: string, sel: Sel): TransformResult {
  const outline = `## Brief\n\n## Constraints\n\n## Process\n\n## Outcomes\n\n`;
  const nextText = replaceRange(text, sel.start, sel.end, outline);
  return { nextText, nextSelection: { start: sel.start, end: sel.start + outline.length } };
}

export function countWords(text: string): number {
  return (text.trim().match(/\S+/g) || []).length;
}

export function readingTimeMinutes(text: string, wpm = 200): number {
  const words = countWords(text);
  return Math.max(1, Math.ceil(words / wpm));
}

