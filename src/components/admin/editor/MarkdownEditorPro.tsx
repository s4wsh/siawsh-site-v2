"use client";
import * as React from "react";
import clsx from "clsx";
import Button from "@/components/ui/button";
import Preview from "./MarkdownPreview";
import {
  toggleBold, toggleItalic, toggleCodeInline, wrapLink,
  toggleHeading, toggleQuote, toggleListBulleted, toggleListNumbered,
  insertFence, insertImage, insertFigureCaption,
  insertOutlineBlog, insertOutlineCase,
  readingTimeMinutes, countWords,
} from "./transforms";

export interface MarkdownEditorProProps {
  value: string;
  onChange: (next: string) => void;
  onPickImage?: () => Promise<{ src: string; alt?: string } | null>;
  variant?: "blog" | "project";
  autosaveState?: "idle" | "saving" | "saved";
  className?: string;
}

export default function MarkdownEditorPro({ value, onChange, onPickImage, variant = "blog", autosaveState = "idle", className }: MarkdownEditorProProps) {
  const [mode, setMode] = React.useState<"edit" | "split" | "preview">("edit");
  const taRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [split, setSplit] = React.useState<number>(() => {
    if (typeof window === "undefined") return 50;
    const s = Number(localStorage.getItem("md.splitWidth") || 50);
    return Math.max(20, Math.min(80, isNaN(s) ? 50 : s));
  });

  React.useEffect(() => { localStorage.setItem("md.splitWidth", String(split)); }, [split]);

  function sel(): { start: number; end: number } {
    const el = taRef.current!;
    return { start: el.selectionStart || 0, end: el.selectionEnd || 0 };
  }
  function apply(fn: (t: string, s: { start: number; end: number }) => { nextText: string; nextSelection?: { start: number; end: number } }) {
    const s = sel();
    const res = fn(value || "", s);
    onChange(res.nextText);
    requestAnimationFrame(() => {
      if (taRef.current && res.nextSelection) {
        taRef.current.selectionStart = res.nextSelection.start;
        taRef.current.selectionEnd = res.nextSelection.end;
        taRef.current.focus();
      }
    });
  }

  React.useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (!meta) return;
      const key = e.key.toLowerCase();
      if (key === "b") { e.preventDefault(); apply(toggleBold); }
      if (key === "i") { e.preventDefault(); apply(toggleItalic); }
      if (key === "k") { e.preventDefault(); apply(wrapLink); }
      if (e.shiftKey && key === "@") { e.preventDefault(); apply((t,s)=>toggleHeading(t,s,2)); }
      if (e.shiftKey && key === "#") { e.preventDefault(); apply((t,s)=>toggleHeading(t,s,3)); }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [value]);

  async function pickImage(withCaption = false) {
    const picked = (await onPickImage?.()) || null;
    if (!picked) return;
    apply((t, s) => withCaption ? insertFigureCaption(t, s, picked.src, picked.alt) : insertImage(t, s, picked.src, picked.alt));
  }

  const words = countWords(value || "");
  const minutes = readingTimeMinutes(value || "");

  return (
    <div className={clsx("md-editor space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="segwrap" role="tablist" aria-label="Editor mode">
          {(["edit","split","preview"] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode===m} className={clsx("segbtn", mode===m && "segbtn-active")} onClick={()=>setMode(m)} title={m[0].toUpperCase()+m.slice(1)}>
              {m[0].toUpperCase()+m.slice(1)}
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground min-w-28 text-right">{autosaveState === "saving" ? "Saving…" : autosaveState === "saved" ? "All changes saved" : ""}</div>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <Tool label="H2" kb="⌘⇧2" onClick={()=>apply((t,s)=>toggleHeading(t,s,2))} />
        <Tool label="H3" kb="⌘⇧3" onClick={()=>apply((t,s)=>toggleHeading(t,s,3))} />
        <Tool label="Bold" kb="⌘B" onClick={()=>apply(toggleBold)} />
        <Tool label="Italic" kb="⌘I" onClick={()=>apply(toggleItalic)} />
        <Tool label="Link" kb="⌘K" onClick={()=>apply(wrapLink)} />
        <Tool label="Bulleted" onClick={()=>apply(toggleListBulleted)} />
        <Tool label="Numbered" onClick={()=>apply(toggleListNumbered)} />
        <Tool label="Quote" onClick={()=>apply(toggleQuote)} />
        <Tool label="Code" onClick={()=>apply(toggleCodeInline)} />
        <Tool label="Fence" onClick={()=>apply(insertFence)} />
        <Tool label="Image" onClick={()=>pickImage(false)} />
        <Tool label="Img+Caption" onClick={()=>pickImage(true)} />
        <Tool label={variant==='blog'? 'Blog outline':'Case outline'} onClick={()=>apply((t,s)=> variant==='blog'? insertOutlineBlog(t,s): insertOutlineCase(t,s))} />
      </div>

      <div className={clsx("md-split", mode)} style={{ gridTemplateColumns: mode==='split' ? `${split}% 8px ${100-split}%` : undefined }}>
        {(mode === 'edit' || mode === 'split') && (
          <div className="md-pane">
            <textarea ref={taRef} value={value} onChange={(e)=>onChange(e.target.value)} className="md-input" rows={14} />
          </div>
        )}
        {mode === 'split' && (
          <div className="md-divider" role="separator" aria-orientation="vertical"
            onMouseDown={(e)=>startDrag(e, setSplit)} onTouchStart={(e)=>startDrag(e, setSplit)}>
            <div className="glow-divider" />
          </div>
        )}
        {(mode === 'preview' || mode === 'split') && (
          <div className="md-pane md-preview">
            <Preview source={value} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>{words} words · ~{minutes} min</div>
        <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noreferrer" className="hover:underline">Markdown cheatsheet</a>
      </div>
    </div>
  );
}

function Tool({ label, kb, onClick }: { label: string; kb?: string; onClick: () => void }) {
  return (
    <Button type="button" size="sm" variant="outline" onClick={onClick} aria-label={label} title={kb ? `${label} (${kb})` : label}>{label}</Button>
  );
}

function startDrag(e: React.MouseEvent | React.TouchEvent, setSplit: (v: number) => void) {
  const doc = document;
  const startX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
  const ww = window.innerWidth;
  function move(ev: MouseEvent | TouchEvent) {
    const x = 'touches' in ev ? (ev as TouchEvent).touches[0].clientX : (ev as MouseEvent).clientX;
    const pct = Math.max(20, Math.min(80, Math.round((x / ww) * 100)));
    setSplit(pct);
  }
  function up() {
    doc.removeEventListener('mousemove', move as any);
    doc.removeEventListener('mouseup', up);
    doc.removeEventListener('touchmove', move as any);
    doc.removeEventListener('touchend', up);
  }
  doc.addEventListener('mousemove', move as any);
  doc.addEventListener('mouseup', up);
  doc.addEventListener('touchmove', move as any);
  doc.addEventListener('touchend', up);
}

