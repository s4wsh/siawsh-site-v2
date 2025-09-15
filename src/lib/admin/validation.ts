import { z } from "zod";

export const AdminProjectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  coverUrl: z.string().url().optional(),
  client: z.string().optional(),
  excerpt: z.string().optional(),
});

export const AdminBlogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  coverUrl: z.string().url().optional(),
  excerpt: z.string().optional(),
});

