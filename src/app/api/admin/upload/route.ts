import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import sizeOf from "image-size";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const slug = (form.get("slug") as string) || "asset";
    if (!(file instanceof Blob)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Max 10MB" }, { status: 400 });
    const type = file.type || "";
    if (!/^image\/(png|jpeg|webp|avif|gif|svg\+xml)$/.test(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    const now = new Date();
    const folder = now.toISOString().slice(0, 7); // yyyy-mm
    const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(uploadsDir, { recursive: true });

    const arrayBuf = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    const origName = (form.get("filename") as string) || `upload`;
    const safeName = origName.replace(/\s+/g, "-");
    const ext = safeName.includes(".") ? safeName.split(".").pop() : "bin";
    const name = `${slug}-${Date.now()}.${ext}`;
    const dest = path.join(uploadsDir, name);
    await fs.writeFile(dest, buf);

    let width: number | undefined;
    let height: number | undefined;
    try {
      const d = sizeOf(dest);
      width = d.width;
      height = d.height;
    } catch {}

    const src = `/uploads/${folder}/${name}`;
    return NextResponse.json({ src, width, height });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

