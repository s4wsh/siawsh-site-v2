import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { adminAuth } from "@/lib/firebase-admin"

const EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000 // 5 days

export async function POST(req: Request) {
  if (!adminAuth) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 })
  }
  const { idToken } = (await req.json().catch(() => ({}))) as { idToken?: string }
  if (!idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 })
  }
  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: EXPIRES_IN_MS,
    })
    const store = await cookies()
    const secure = process.env.NODE_ENV === "production"
    store.set("session", sessionCookie, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: EXPIRES_IN_MS / 1000,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}

export async function DELETE() {
  const store = await cookies()
  store.set("session", "", { path: "/", maxAge: 0 })
  return NextResponse.json({ ok: true })
}

