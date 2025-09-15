import { NextResponse } from "next/server";
import { loadBlog } from "@/lib/content/blog";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const items = await loadBlog();
  const feedItems = items
    .map((i) => `
      <item>
        <title><![CDATA[${i.title}]]></title>
        <link>${base}/blog/${i.slug}</link>
        <guid>${base}/blog/${i.slug}</guid>
        <pubDate>${new Date(i.date).toUTCString()}</pubDate>
        ${i.excerpt ? `<description><![CDATA[${i.excerpt}]]></description>` : ""}
      </item>
    `)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>Siawsh — Blog</title>
      <link>${base}/blog</link>
      <description>Insights & updates by Siawsh</description>
      ${feedItems}
    </channel>
  </rss>`;
  return new NextResponse(xml, { headers: { "content-type": "application/rss+xml" } });
}

