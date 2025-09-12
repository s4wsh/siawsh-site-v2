import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const type = body?.type as "projects" | "project"
    const slug = body?.slug as string | undefined
    if (!type) {
      return NextResponse.json({ ok: false, error: "Missing type" }, { status: 400 })
    }
    if (type === "projects") {
      revalidatePath("/projects")
    } else if (type === "project") {
      if (!slug) return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 })
      revalidatePath(`/projects/${slug}`)
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 })
  }
}

