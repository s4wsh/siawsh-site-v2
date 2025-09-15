import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Siawsh Studio";
    const subtitle = searchParams.get("subtitle") || "Blueprint to Broadcast";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            background: "#111111",
            color: "#ffffff",
            padding: 80,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              fontFamily: 'var(--font-eurostile), Antonio, system-ui, sans-serif',
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 18,
              height: 6,
              width: 420,
              background: "#00ffff",
            }}
          />
          <div
            style={{
              marginTop: 24,
              fontSize: 36,
              fontWeight: 500,
              fontFamily: 'var(--font-roboto), Roboto, system-ui, sans-serif',
              color: "#eaeaea",
            }}
          >
            {subtitle}
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch {
    const url = new URL("/og/default-og.png", request.url);
    return NextResponse.redirect(url);
  }
}

