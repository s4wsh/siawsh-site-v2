import { adminDb } from "@/lib/firebase-admin";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const projSnap = await adminDb.collection("projects").get();
  const blogSnap = await adminDb.collection("blogPosts").get();

  const proj = projSnap.docs
    .map((d) => d.data() as any)
    .filter((p) => p.status === "published")
    .map((p) => ({
      url: `${base}/projects/${p.slug}`,
      lastModified: p.updatedAt || p.publishedAt || new Date().toISOString(),
    }));

  const blog = blogSnap.docs
    .map((d) => d.data() as any)
    .filter((b) => b.status === "published")
    .map((b) => ({
      url: `${base}/blog/${b.slug}`,
      lastModified: b.updatedAt || b.publishedAt || new Date().toISOString(),
    }));

  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/projects`, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
    ...proj,
    ...blog,
  ];
}
