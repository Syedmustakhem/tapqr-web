import { NextRequest, NextResponse } from "next/server";

const VISITOR_COOKIE = "tapqr_visitor_key";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const existingVisitorKey =
    request.cookies.get(VISITOR_COOKIE)?.value;

  if (!existingVisitorKey) {
    const visitorKey = crypto.randomUUID();

    response.cookies.set({
      name: VISITOR_COOKIE,
      value: visitorKey,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: ["/r/:path*"],
};