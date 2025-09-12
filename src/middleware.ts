import { NextResponse, type NextRequest } from "next/server"

export function middleware(_req: NextRequest) {
  // Placeholder: allow all requests (we'll add real checks later)
  return NextResponse.next()
}

export const config = { matcher: ["/admin/:path*"] }
