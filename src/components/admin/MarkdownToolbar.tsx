"use client";
import * as React from "react";
import Button from "@/components/ui/button";

type PickImage = () => Promise<{ src: string; alt: string } | null>;

type Props = {
  value: string;
  onChange: (next: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onPickImage?: PickImage;
  mode?: "body" | "preview";
  onModeChange?: (m: "body" | "preview") => void;
};

export default function MarkdownToolbar({ value, onChange, textareaRef, onPickImage, mode = "body", onModeChange }: Props) {
  const [curMode, setCurMode] = React.useState<"body" | "preview">(mode);
  React.useEffect(() => setCurMode(mode), [mode]);
  React.useEffect(() => { onModeChange?.(curMode); }, [curMode]);

  // keyboard shortcuts
  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (!meta) return;
      if (e.key.toLowerCase() === "b") { e.preventDefault(); toggleInline("**"); }
      if (e.key.toLowerCase() === "i") { e.preventDefault(); toggleInline("*"); }
      if (e.key.toLowerCase() === "k") { e.preventDefault(); insertLink(); }
      if (e.shiftKey && e.key === "@") { /* Cmd/Ctrl+Shift+2 on some layouts maps to @; skip */ }
      if (e.shiftKey && e.key === "\"") { /* varies by layout */ }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [textareaRef.current, value]);

  function replaceRange(text: string, start: number, end: number, insert: string) {
    return text.slice(0, start) + insert + text.slice(end);
  }

  function withSelection(fn: (text: string, start: number, end: number) => { next: string; selStart?: number; selEnd?: number }) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const res = fn(value, start, end);
    onChange(res.next);
    requestAnimationFrame(() => {
      if (typeof res.selStart === "number") {
        el.selectionStart = res.selStart!;
      }
      if (typeof res.selEnd === "number") {
        el.selectionEnd = res.selEnd!;
      }
      el.focus();
    });
  }

  function toggleInline(wrapper: "**" | "*" | "`") {
    withSelection((text, s, e) => {
      const selected = text.slice(s, e);
      const w = wrapper;
      const already = selected.startsWith(w) && selected.endsWith(w);
      const inner = already ? selected.slice(w.length, selected.length - w.length) : selected;
      const insert = already ? inner : `${w}${selected || "text"}${w}`;
      const next = replaceRange(text, s, e, insert);
      const offset = already ? -w.length : w.length;
      return { next, selStart: s, selEnd: e + (selected ? offset * 2 : insert.length) };
    });
  }

  function transformLine(prefix: string | ((line: string, idx: number) => string)) {
    withSelection((text, s, e) => {
      const before = text.slice(0, s);
      const after = text.slice(e);
      const sel = text.slice(s, e);
      const lines = sel || text.split("\n").slice(text.slice(0, s).split("\n").length - 1, text.slice(0, e).split("\n").length).join("\n");
      const block = (sel || lines).split("\n");
      const toggled = block.map((line, i) => {
        const p = typeof prefix === "function" ? prefix(line, i) : prefix;
        if (line.startsWith(p)) return line.replace(new RegExp(`^${escapeRegExp(p)}`), "");
        return `${p}${line}`.trimEnd();
      }).join("\n");
      const next = replaceRange(text, s, e, toggled);
      return { next, selStart: s, selEnd: s + toggled.length };
    });
  }

  function escapeRegExp(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function heading(level: 2 | 3) {
    const p = level === 2 ? "## " : "### ";
    transformLine(p);
  }
  function bullets() { transformLine("- "); }
  function numbers() {
    withSelection((text, s, e) => {
      const sel = text.slice(s, e);
      const lines = (sel || text).slice(0, sel ? undefined : undefined).split("\n");
      let n = 1;
      const toggled = lines.map((line) => {
        const m = line.match(/^\d+\.\s/);
        if (m) return line.replace(/^\d+\.\s/, "");
        return `${n++}. ${line}`;
      }).join("\n");
      const next = replaceRange(text, s, e, toggled);
      return { next, selStart: s, selEnd: s + toggled.length };
    });
  }
  function quote() { transformLine("> "); }
  function code() { toggleInline("`"); }

  async function insertImage(withCaption = false) {
    let picked: { src: string; alt: string } | null = null;
    if (onPickImage) {
      try { picked = await onPickImage(); } catch {}
    }
    if (!picked) {
      const url = window.prompt("Image URL") || "";
      const alt = window.prompt("Alt text") || "";
      picked = url ? { src: url, alt } : null;
    }
    if (!picked) return;
    const md = `![${picked.alt}](${picked.src})` + (withCaption ? `\n<figcaption>Caption</figcaption>\n` : "");
    withSelection((text, s, e) => {
      const next = replaceRange(text, s, e, md);
      return { next, selStart: s + md.length, selEnd: s + md.length };
    });
  }

  function insertLink() {
    withSelection((text, s, e) => {
      const selected = text.slice(s, e) || "link";
      const url = "https://";
      const insert = `[${selected}](${url})`;
      const next = replaceRange(text, s, e, insert);
      return { next, selStart: s + 1, selEnd: s + 1 + selected.length };
    });
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-wrap gap-1">
        <Button type="button" size="sm" variant="outline" onClick={() => heading(2)}>H2</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => heading(3)}>H3</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => toggleInline("**")}><b>B</b></Button>
        <Button type="button" size="sm" variant="outline" onClick={() => toggleInline("*")}><i>I</i></Button>
        <Button type="button" size="sm" variant="outline" onClick={insertLink}>Link</Button>
        <Button type="button" size="sm" variant="outline" onClick={bullets}>•</Button>
        <Button type="button" size="sm" variant="outline" onClick={numbers}>1.</Button>
        <Button type="button" size="sm" variant="outline" onClick={quote}>&gt;</Button>
        <Button type="button" size="sm" variant="outline" onClick={code}>Code</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => insertImage(false)}>Image</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => insertImage(true)}>Img+Caption</Button>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" className={`segbtn ${curMode === 'body' ? 'segbtn-active' : ''}`} onClick={() => setCurMode('body')}>Body</button>
        <button type="button" className={`segbtn ${curMode === 'preview' ? 'segbtn-active' : ''}`} onClick={() => setCurMode('preview')}>Preview</button>
      </div>
    </div>
  );
}
