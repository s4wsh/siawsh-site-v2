import Image from "next/image";

type Props = {
  src: string;
  alt?: string;
  ratio?: "1/1" | "4/3" | "16/9" | "3/2";
  className?: string;
  priority?: boolean;
  sizes?: string;
  glow?: boolean;
};

/** Crops responsively inside rounded container; avoids layout shift */
export default function MediaImage({
  src,
  alt = "",
  ratio = "16/9",
  className = "",
  priority,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  glow = false,
}: Props) {
  const ratioClass =
    ratio === "1/1" ? "aspect-[1/1]" :
    ratio === "4/3" ? "aspect-[4/3]" :
    ratio === "3/2" ? "aspect-[3/2]" :
    "aspect-[16/9]";

  return (
    <div className={`relative overflow-hidden rounded-2xl ${ratioClass} ${glow ? "neon-glow" : ""} ${className}`}>
      {/* fill + object-cover keeps mask correct */}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={sizes}
        priority={priority}
      />
    </div>
  );
}
