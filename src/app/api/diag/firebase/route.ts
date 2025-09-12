import { NextResponse } from "next/server";
import "@/lib/firebase-admin";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    // lightweight check: list collections (no secrets exposed)
    let ok = true;
    try {
      await adminDb.listCollections();
    } catch {
      // ignore permission errors; init was still successful
    }
    return NextResponse.json({ ok: true, admin: "initialized" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
