import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

export type ProjectEntry = {
  slug: string;
  title: string;
  date: string; // ISO
  year: number;
  client?: string;
  role: string[];
  tools: string[];
  category: ("Packaging"|"Motion"|"Branding"|"Interior"|"Architecture")[];
  summary: string;
  problem?: string;
  solution?: string;
  results?: { metric: string; value: string; note?: string }[];
  cover: { src: string; alt: string; width?: number; height?: number };
  gallery: { src: string; alt: string }[];
  tags?: string[];
};

const ROOT = path.join(process.cwd(), "src", "content", "projects");

let cache: ProjectEntry[] | null = null;

const ProjectSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  date: z.string().min(4),
  year: z.number(),
  client: z.string().optional(),
  role: z.array(z.string()),
  tools: z.array(z.string()),
  category: z.array(z.enum(["Packaging","Motion","Branding","Interior","Architecture"])),
  summary: z.string().min(1),
  problem: z.string().optional(),
  solution: z.string().optional(),
  results: z.array(z.object({ metric: z.string(), value: z.string(), note: z.string().optional() })).optional(),
  cover: z.object({ src: z.string().min(1), alt: z.string().min(1), width: z.number().optional(), height: z.number().optional() }),
  gallery: z.array(z.object({ src: z.string().min(1), alt: z.string().min(1) })),
  tags: z.array(z.string()).optional(),
});

export function loadProjects(): ProjectEntry[] {
  if (cache) return cache;
  if (!fs.existsSync(ROOT)) return (cache = []);
  const files = fs.readdirSync(ROOT).filter((f) => f.endsWith(".json"));
  const items: ProjectEntry[] = files.map((f) => {
    const raw = fs.readFileSync(path.join(ROOT, f), "utf8");
    const parsed = ProjectSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      const details = JSON.stringify(parsed.error.issues, null, 2);
      throw new Error(`Invalid project seed ${f}:\n${details}`);
    }
    return parsed.data as ProjectEntry;
  });
  items.sort((a, b) => (a.date < b.date ? 1 : -1));
  cache = items;
  return items;
}

export function getProjectBySlug(slug: string): ProjectEntry | undefined {
  return loadProjects().find((p) => p.slug === slug);
}

export function filterProjects(opts: { category?: string; year?: number | string } = {}): ProjectEntry[] {
  const items = loadProjects();
  return items.filter((p) => {
    if (opts.category && !p.category.includes(opts.category as ProjectEntry["category"][number])) return false;
    if (opts.year && Number(opts.year) !== p.year) return false;
    return true;
  });
}

export function allCategories(): string[] {
  const set = new Set<string>();
  loadProjects().forEach((p) => p.category.forEach((c) => set.add(c)));
  return Array.from(set).sort();
}

export function allYears(): number[] {
  const set = new Set<number>();
  loadProjects().forEach((p) => set.add(p.year));
  return Array.from(set).sort((a, b) => b - a);
}
