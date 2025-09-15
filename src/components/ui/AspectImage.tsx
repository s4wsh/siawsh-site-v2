import Image, { ImageProps } from "next/image";
import type { CSSProperties } from "react";

type Ratio = "16/9" | "4/3" | "1/1" | "3/2";

type NoWidthHeightStyle = Omit<CSSProperties, "width" | "height">;

type FillVariant = Omit<ImageProps, "width" | "height"> & {
  fill: true;
  ratio?: Ratio;
  radius?: string;
  // Disallow width/height in style when using fill
  style?: NoWidthHeightStyle;
};

type FixedVariant = Omit<ImageProps, "fill"> & {
  fill?: false;
  width: number;
  height: number;
  ratio?: Ratio;
  radius?: string;
};

type Props = FillVariant | FixedVariant;

export default function AspectImage(props: Props) {
  const { ratio = "16/9", radius = "1rem", ...rest } = props as Props;

  const aspect =
    ratio === "1/1" ? "aspect-square" :
    ratio === "4/3" ? "aspect-[4/3]" :
    ratio === "3/2" ? "aspect-[3/2]" :
    "aspect-[16/9]";

  const wrapperStyle = { borderRadius: radius } as const;

  // Fill mode: ensure no width/height styles are applied to Image
  if ("fill" in rest && rest.fill) {
    const { style, className, alt, sizes, ...imgProps } = rest as FillVariant & { className?: string };
    const styleWithoutWH: CSSProperties = { ...(style || {}) };
    delete (styleWithoutWH as unknown as { width?: unknown }).width;
    delete (styleWithoutWH as unknown as { height?: unknown }).height;
    const mergedClassName = [className, "object-cover"].filter(Boolean).join(" ");

    return (
      <div className={`relative ${aspect} overflow-hidden glow-card`} style={wrapperStyle}>
        <Image {...imgProps} alt={alt || ""} fill sizes={sizes || "100vw"} style={styleWithoutWH} className={mergedClassName} />
      </div>
    );
  }

  // If width/height provided, use fixed mode; otherwise default to fill
  if ("width" in rest && "height" in rest) {
    const { alt, className, ...imgProps } = rest as FixedVariant & { className?: string };
    const mergedClassName = [className, "object-cover"].filter(Boolean).join(" ");

    return (
      <div className={`relative ${aspect} overflow-hidden glow-card`} style={wrapperStyle}>
        <Image {...imgProps} alt={alt || ""} className={mergedClassName} />
      </div>
    );
  }

  // Fallback to fill if neither variant is explicitly selected
  const { style, className, alt, sizes, ...imgProps } = rest as Partial<FillVariant> & { className?: string };
  const styleWithoutWH2: CSSProperties = { ...(style || {}) };
  delete (styleWithoutWH2 as unknown as { width?: unknown }).width;
  delete (styleWithoutWH2 as unknown as { height?: unknown }).height;
  const mergedClassName = [className, "object-cover"].filter(Boolean).join(" ");
  const hasSrc = (imgProps as { src?: unknown }).src !== undefined;
  if (!hasSrc) return null;
  return (
    <div className={`relative ${aspect} overflow-hidden glow-card`} style={wrapperStyle}>
      <Image {...(imgProps as Omit<ImageProps, "width" | "height">)} alt={alt || ""} fill sizes={sizes || "100vw"} style={styleWithoutWH2} className={mergedClassName} />
    </div>
  );
}
