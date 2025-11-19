import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(request: NextRequest, _: NextFetchEvent) {
  const token = request.cookies.get("token")?.value;
  const url = request.nextUrl;

  // If not logged in → redirect to login
  if (!token && url.pathname !== "/login") {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If logged in and trying to access '/' → go to dashboard
  if (token && url.pathname === "/") {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/inbound",
    "/inbound/:path*",
    "/qc",
    "/qc/:path*",
    "/picking",
    "/picking/:path*",

    // FULL SETTINGS SUPPORT
    "/settings",
    "/settings/*",
    "/settings/:path*",
  ],
};





