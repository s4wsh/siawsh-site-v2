import { loadProjects } from "@/lib/content/projects";
import { loadBlog } from "@/lib/content/blog";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const proj = loadProjects().map((p) => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: p.date,
  }));

  const blog = (await loadBlog()).map((b) => ({
    url: `${base}/blog/${b.slug}`,
    lastModified: b.date,
  }));

  return [
    { url: `${base}/`, lastModified: new Date().toISOString() },
    { url: `${base}/projects`, lastModified: new Date().toISOString() },
    { url: `${base}/blog`, lastModified: new Date().toISOString() },
    ...proj,
    ...blog,
  ];
}
