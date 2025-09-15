import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import sizeOf from "image-size";

const roots = [
  path.join(process.cwd(), "public", "images"),
  path.join(process.cwd(), "public", "uploads"),
];

const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);

function walk(dir: string, acc: string[] = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, acc);
    else if (exts.has(path.extname(full).toLowerCase())) acc.push(full);
  }
  return acc;
}

export async function GET() {
  const items: Array<{ src: string; width?: number; height?: number } > = [];
  for (const r of roots) {
    const files = walk(r);
    for (const f of files) {
      const rel = f.split(path.join(process.cwd(), "public"))[1];
      try {
        const dim = sizeOf(f);
        items.push({ src: rel, width: dim.width, height: dim.height });
      } catch {
        items.push({ src: rel });
      }
    }
  }
  // sort newest folder roughly by path
  items.sort((a, b) => a.src < b.src ? 1 : -1);
  return NextResponse.json({ items });
}

