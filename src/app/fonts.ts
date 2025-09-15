import localFont from "next/font/local";
import { Roboto, Antonio } from "next/font/google";

// TODO: Replace Antonio fallback with local Eurostile once licensed files are added under public/fonts/eurostile/
// export const eurostile = localFont({
//   src: [
//     { path: "/fonts/eurostile/Eurostile-Bold.woff2", weight: "700", style: "normal" },
//   ],
//   variable: "--font-eurostile",
//   display: "swap",
// });

// Temporary fallback using a squarish grotesk-like font to emulate Eurostile vibe
export const eurostile = Antonio({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-eurostile",
  display: "swap",
});

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

