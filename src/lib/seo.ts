export const GRID_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" as const;

export function canonical(pathname: string, base?: string): string {
  const origin = base || process.env.NEXT_PUBLIC_SITE_URL || "";
  if (!origin) return pathname;
  return new URL(pathname, origin).toString();
}

export function projectJsonLd(p: {
  title: string;
  date?: string;
  cover?: { src: string };
  tags?: string[];
  summary?: string;
  client?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    headline: p.title,
    datePublished: p.date,
    image: p.cover?.src ? [p.cover.src] : undefined,
    keywords: (p.tags || []).join(", "),
    about: p.summary,
    author: p.client ? [{ "@type": "Organization", name: p.client }] : undefined,
  } as const;
}

export function blogJsonLd(p: {
  title: string;
  date?: string;
  cover?: { src: string };
  tags?: string[];
  excerpt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    datePublished: p.date,
    image: p.cover?.src ? [p.cover.src] : undefined,
    keywords: (p.tags || []).join(", "),
    description: p.excerpt,
  } as const;
}

