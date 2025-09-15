import Link from "next/link";
import AspectImage from "@/components/ui/AspectImage";
import { GRID_SIZES } from "@/lib/seo";

type Props = {
  slug: string;
  title: string;
  excerpt?: string;
  cover?: { src: string; alt: string };
  date?: string;
  readingMinutes?: number;
};

export default function BlogCard({ slug, title, excerpt, cover, date, readingMinutes }: Props) {
  return (
    <Link href={`/blog/${slug}`} className="group block overflow-hidden rounded-2xl border border-muted transition-shadow hover:shadow-md glow-card">
      {cover ? (
        <AspectImage src={cover.src} alt={cover.alt || title} fill sizes={GRID_SIZES} wrapperClassName="rounded-2xl aspect-[16/9]" />
      ) : null}
      <div className="p-4">
        <h3 className="text-lg font-semibold group-hover:underline">{title}</h3>
        <div className="mt-1 text-xs text-muted-foreground">
          {date ? date.slice(0, 10) : null}
          {readingMinutes ? <span> • {readingMinutes} min read</span> : null}
        </div>
        {excerpt ? <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{excerpt}</p> : null}
      </div>
    </Link>
  );
}
