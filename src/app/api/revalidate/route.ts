import { NextRequest, NextResponse } from "next/server";
type RevalidateBody = { paths: string[] };

export async function POST(req: NextRequest) {
  const body = (await req.json()) as RevalidateBody;
  if (!body?.paths || !Array.isArray(body.paths) || body.paths.length === 0) {
    return NextResponse.json({ ok: false, error: "paths must be non-empty array" }, { status: 400 });
  }
  const { revalidatePath } = await import("next/cache");
  for (const p of body.paths) if (typeof p === "string" && p.startsWith("/")) revalidatePath(p);
  return NextResponse.json({ ok: true, revalidated: body.paths });
}
