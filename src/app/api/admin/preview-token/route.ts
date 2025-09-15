import { NextResponse } from "next/server";
import { mintPreviewToken } from "@/lib/preview";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const type = body?.type as string;
  const id = body?.id as string;
  if (!type || !id) return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
  const t = type === 'project' ? 'project' : type === 'post' || type === 'blog' ? 'post' : null;
  if (!t) return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  const token = mintPreviewToken(t, id);
  return NextResponse.json({ token });
}

