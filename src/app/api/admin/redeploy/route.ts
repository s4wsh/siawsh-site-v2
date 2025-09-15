import { NextResponse } from "next/server";
import app from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";

const adminAuth = getAuth(app);

async function currentUserEmail(): Promise<string | null> {
  try {
    const jar = await cookies();
    const session = jar.get("session")?.value;
    if (!session) return null;
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded?.email || null;
  } catch {
    return null;
  }
}

export async function POST() {
  const hook = process.env.NETLIFY_BUILD_HOOK_URL;
  if (!hook) return NextResponse.json({ ok: false, error: "NETLIFY_BUILD_HOOK_URL missing" }, { status: 400 });

  const email = await currentUserEmail();
  const allow = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!email || !allow.includes(email.toLowerCase())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resp = await fetch(hook, { method: "POST" });
    const ok = resp.ok;
    return NextResponse.json({ ok });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}

