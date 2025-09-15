import Image, { ImageProps } from "next/image";
import type { CSSProperties } from "react";

const DEFAULT_BLUR =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 18' preserveAspectRatio='none'>
      <defs>
        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0' stop-color='#0ea5e9' stop-opacity='0.6'/>
          <stop offset='1' stop-color='#6d28d9' stop-opacity='0.6'/>
        </linearGradient>
      </defs>
      <rect width='32' height='18' fill='url(#g)'/>
    </svg>`
  ).toString("base64");

type Ratio = "16/9" | "4/3" | "1/1" | "3/2";

type NoWidthHeightStyle = Omit<CSSProperties, "width" | "height">;

type FillVariant = Omit<ImageProps, "width" | "height"> & {
  fill: true;
  ratio?: Ratio;
  radius?: string;
  // Disallow width/height in style when using fill
  style?: NoWidthHeightStyle;
  wrapperClassName?: string;
};

type FixedVariant = Omit<ImageProps, "fill"> & {
  fill?: false;
  width: number;
  height: number;
  ratio?: Ratio;
  radius?: string;
  wrapperClassName?: string;
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
    const { style, className, alt, sizes, wrapperClassName, blurDataURL, placeholder, ...imgProps } = rest as FillVariant & { className?: string };
    const styleWithoutWH: CSSProperties = { ...(style || {}) };
    delete (styleWithoutWH as unknown as { width?: unknown }).width;
    delete (styleWithoutWH as unknown as { height?: unknown }).height;
    const mergedClassName = [className, "object-cover"].filter(Boolean).join(" ");

    return (
      <div className={`relative ${aspect} overflow-hidden ${wrapperClassName || "glow-card"}`} style={wrapperStyle}>
        <Image
          {...imgProps}
          alt={alt || ""}
          fill
          sizes={sizes || "100vw"}
          style={styleWithoutWH}
          className={mergedClassName}
          placeholder={placeholder || "blur"}
          blurDataURL={blurDataURL || DEFAULT_BLUR}
        />
      </div>
    );
  }

  // If width/height provided, use fixed mode; otherwise default to fill
  if ("width" in rest && "height" in rest) {
    const { alt, className, wrapperClassName, blurDataURL, placeholder, ...imgProps } = rest as FixedVariant & { className?: string };
    const mergedClassName = [className, "object-cover"].filter(Boolean).join(" ");

    return (
      <div className={`relative ${aspect} overflow-hidden ${wrapperClassName || "glow-card"}`} style={wrapperStyle}>
        <Image {...imgProps} alt={alt || ""} className={mergedClassName} placeholder={placeholder || "blur"} blurDataURL={blurDataURL || DEFAULT_BLUR} />
      </div>
    );
  }

  // Fallback to fill if neither variant is explicitly selected
  const { style, className, alt, sizes, wrapperClassName, blurDataURL, placeholder, ...imgProps } = rest as Partial<FillVariant> & { className?: string };
  const styleWithoutWH2: CSSProperties = { ...(style || {}) };
  delete (styleWithoutWH2 as unknown as { width?: unknown }).width;
  delete (styleWithoutWH2 as unknown as { height?: unknown }).height;
  const mergedClassName = [className, "object-cover"].filter(Boolean).join(" ");
  const hasSrc = (imgProps as { src?: unknown }).src !== undefined;
  if (!hasSrc) return null;
  return (
    <div className={`relative ${aspect} overflow-hidden ${wrapperClassName || "glow-card"}`} style={wrapperStyle}>
      <Image
        {...(imgProps as Omit<ImageProps, "width" | "height">)}
        alt={alt || ""}
        fill
        sizes={sizes || "100vw"}
        style={styleWithoutWH2}
        className={mergedClassName}
        placeholder={placeholder || "blur"}
        blurDataURL={blurDataURL || DEFAULT_BLUR}
      />
    </div>
  );
}
