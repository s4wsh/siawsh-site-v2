import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  coverUrl: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  client: z.string().optional(),
  tags: z.array(z.string()).optional(),
  role: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  problem: z.string().optional(),
  approach: z.string().optional(),
  solution: z.string().optional(),
  results: z
    .object({
      summary: z.string().optional(),
      metrics: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    })
    .optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  status: z.enum(["draft", "published"]),
  lang: z.enum(["en", "tr", "fa"]).default("en"),
  publishedAt: z.string().optional(),
  updatedAt: z.string().optional(),
  // keep optional timeline for existing UI
  timeline: z.object({ start: z.string().optional(), end: z.string().optional() }).optional(),
  // body/excerpt for case study long text
  excerpt: z.string().optional(),
  body: z.string().optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const BlogPostSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  coverUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  excerpt: z.string().optional(),
  body: z.string().optional(),
  lang: z.enum(["en", "tr", "fa"]).default("en"),
  status: z.enum(["draft", "published"]),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  publishedAt: z.string().optional(),
  updatedAt: z.string().optional(),
  gallery: z.array(z.string()).optional(),
});
export type BlogPost = z.infer<typeof BlogPostSchema>;

export type MediaItem = {
  id: string;
  path: string;
  url: string;
  type: "image" | "video" | "pdf" | "other";
  width?: number;
  height?: number;
  bytes?: number;
  createdAt: string;
  createdBy?: string;
};
