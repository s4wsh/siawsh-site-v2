import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { z } from "zod";

export type BlogFrontmatter = {
  title: string;
  slug: string;
  date: string; // ISO
  excerpt?: string;
  cover?: { src: string; alt: string };
  tags?: string[];
};

export type BlogEntry = BlogFrontmatter & {
  html: string;
  headings: { depth: number; text: string; id: string }[];
  readingMinutes: number;
};

const ROOT = path.join(process.cwd(), "src", "content", "blog");

function words(text: string): number {
  return (text || "").split(/\s+/).filter(Boolean).length;
}

export async function renderMdxToHtml(source: string) {
  const headings: { depth: number; text: string; id: string }[] = [];

  // A tiny plugin to collect headings and generate ids
  function remarkCollectHeadings() {
    return (tree: any) => {
      const visit = (node: any) => {
        if (node.type === "heading") {
          const text = (node.children || []).map((c: any) => c.value || "").join("");
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");
          headings.push({ depth: node.depth, text, id });
          node.data = node.data || {};
          node.data.hProperties = node.data.hProperties || {};
          node.data.id = id;
          node.data.hProperties.id = id;
        }
        (node.children || []).forEach(visit);
      };
      visit(tree);
    };
  }

  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkCollectHeadings)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeStringify)
    .process(source);

  return { html: String(file), headings };
}

let cache: BlogEntry[] | null = null;

const BlogFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  date: z.string().min(4),
  excerpt: z.string().optional(),
  cover: z
    .object({ src: z.string().min(1), alt: z.string().min(1) })
    .optional(),
  tags: z.array(z.string()).optional(),
});

export async function loadBlog(): Promise<BlogEntry[]> {
  if (cache) return cache;
  if (!fs.existsSync(ROOT)) return (cache = []);
  const files = fs.readdirSync(ROOT).filter((f) => f.endsWith(".mdx"));
  const items: BlogEntry[] = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(ROOT, f), "utf8");
    const { content, data } = matter(raw);
    const parsed = BlogFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      const details = JSON.stringify(parsed.error.issues, null, 2);
      throw new Error(`Invalid blog frontmatter in ${f}:\n${details}`);
    }
    const fm = parsed.data as BlogFrontmatter;
    const { html, headings } = await renderMdxToHtml(content);
    const readingMinutes = Math.max(1, Math.ceil(words(content) / 200));
    items.push({ ...fm, html, headings, readingMinutes });
  }
  items.sort((a, b) => (a.date < b.date ? 1 : -1));
  cache = items;
  return items;
}

export async function getPostBySlug(slug: string): Promise<BlogEntry | undefined> {
  const all = await loadBlog();
  return all.find((p) => p.slug === slug);
}
