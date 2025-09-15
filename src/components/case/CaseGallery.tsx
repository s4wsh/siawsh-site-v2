import AspectImage from "@/components/ui/AspectImage";
import { GRID_SIZES } from "@/lib/seo";

type Props = {
  title: string;
  items: { src: string; alt: string }[];
};

export default function CaseGallery({ title, items }: Props) {
  if (!items?.length) return null;
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold relative glow-underline">Gallery</h2>
      <div className="glow-line my-4" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((img, i) => (
          <AspectImage key={`${img.src}-${i}`} src={img.src} alt={img.alt || `${title} image ${i + 1}`} ratio="3/2" fill sizes={GRID_SIZES} />
        ))}
      </div>
    </section>
  );
}

