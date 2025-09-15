import { NextResponse } from "next/server";
import { loadProjects } from "@/lib/content/projects";
import { loadBlog } from "@/lib/content/blog";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const items: { loc: string; lastmod?: string }[] = [
    { loc: `${base}/` },
    { loc: `${base}/projects` },
    { loc: `${base}/blog` },
  ];
  loadProjects().forEach((p) => items.push({ loc: `${base}/projects/${p.slug}`, lastmod: p.date }));
  (await loadBlog()).forEach((b) => items.push({ loc: `${base}/blog/${b.slug}`, lastmod: b.date }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    items.map((i) => `<url><loc>${i.loc}</loc>${i.lastmod ? `<lastmod>${i.lastmod}</lastmod>` : ""}</url>`).join("") +
    `</urlset>`;

  return new NextResponse(xml, { headers: { "content-type": "application/xml" } });
}

