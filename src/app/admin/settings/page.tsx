import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase-admin";
import { RevalidateControls, RedeployButton } from "@/components/admin/RevalidateControls";

async function revalidateAllAction(_: any, __: FormData) {
  "use server";
  // Collect slugs
  const projSnap = await adminDb.collection("projects").select().get();
  const blogSnap = await adminDb.collection("blog").select().get();
  const projectSlugs = projSnap.docs.map((d) => d.id);
  const blogSlugs = blogSnap.docs.map((d) => d.id);
  // Revalidate lists
  revalidatePath("/projects");
  revalidatePath("/blog");
  // Revalidate details
  for (const slug of projectSlugs) revalidatePath(`/projects/${slug}`);
  for (const slug of blogSlugs) revalidatePath(`/blog/${slug}`);
  // Also notify API revalidate endpoint (best-effort)
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL;
    const url = base ? `${base}/api/revalidate` : "/api/revalidate";
    const paths = ["/projects", ...projectSlugs.map((s) => `/projects/${s}`), 
                   "/blog", ...blogSlugs.map((s) => `/blog/${s}`)];
    await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ paths }) });
  } catch {}
  return { ok: true, projects: projectSlugs.length, blog: blogSlugs.length };
}

export const revalidate = 0;

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <section>
        <h2 className="text-lg font-semibold">Publish & Revalidate</h2>
        <p className="mt-1 text-sm text-muted-foreground">Revalidate all lists and detail pages.</p>
        <div className="mt-3">
          <RevalidateControls action={revalidateAllAction as any} />
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Redeploy (Netlify)</h2>
        <RedeployButton />
      </section>
    </div>
  );
}
