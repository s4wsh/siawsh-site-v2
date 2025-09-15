import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const slug = (searchParams.get("slug") || "").trim();
  if (!type || !slug) return NextResponse.json({ error: "Missing type or slug" }, { status: 400 });
  const col = type === "project" ? "projects" : type === "post" || type === "blog" ? "blog" : null;
  if (!col) return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  const doc = await adminDb.collection(col).doc(slug).get();
  return NextResponse.json({ exists: doc.exists });
}

