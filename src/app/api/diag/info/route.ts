import { NextResponse } from "next/server";

function pickCommit() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_REF || process.env.NETLIFY_COMMIT_REF || "dev";
  const time = process.env.VERCEL_GIT_COMMIT_TIMESTAMP || process.env.DEPLOYMENT_TIMESTAMP || undefined;
  const source = process.env.VERCEL_GIT_COMMIT_SHA ? "vercel" : (process.env.NETLIFY ? "netlify" : "env");
  return { sha, shortSha: sha.slice(0, 7), time, source };
}

export async function GET() {
  const commit = pickCommit();
  const now = new Date().toISOString();
  return NextResponse.json({ ok: true, now, ...commit });
}

