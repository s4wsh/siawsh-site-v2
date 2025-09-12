import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const paths = Array.isArray(body?.paths) ? (body.paths as string[]) : []
    if (!paths.length) {
      return NextResponse.json({ ok: false, error: "Missing 'paths' array" }, { status: 400 })
    }
    for (const p of paths) {
      if (typeof p === "string" && p.startsWith("/")) {
        revalidatePath(p)
      }
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 })
  }
}
