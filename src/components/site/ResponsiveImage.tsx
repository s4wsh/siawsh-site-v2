"use client";
import Image, { ImageProps } from "next/image";

type ResponsiveImageProps = Omit<ImageProps, "fill" | "width" | "height"> & {
  width?: number;
  height?: number;
  aspect?: `${number}/${number}` | string;
  className?: string;
  objectFit?: "cover" | "contain";
};

export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  aspect,
  className,
  objectFit = "cover",
  ...rest
}: ResponsiveImageProps) {
  if (aspect) {
    return (
      <div className={`relative w-full ${`aspect-[${aspect}]`} ${className ?? ""}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit }}
          {...rest}
        />
      </div>
    );
  }

  if (!width || !height) {
    throw new Error("ResponsiveImage: width and height required when no aspect is provided");
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{ height: "auto" }}
      {...rest}
    />
  );
}

