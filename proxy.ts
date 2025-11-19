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

    // Inbound
    "/inbound",
    "/inbound/:path*",

    // QC
    "/qc",
    "/qc/:path*",

    // Picking
    "/picking",
    "/picking/:path*",

    // Settings (ALL pages)
    "/settings",
    "/settings/:path*",
    "/settings/master-data",
    "/settings/master-data/:path*",
    "/settings/permissions",
    "/settings/permissions/:path*",
    "/settings/printers",
    "/settings/printers/:path*",
    "/settings/racks",
    "/settings/racks/:path*",
    "/settings/reports",
    "/settings/reports/:path*",
    "/settings/users",
    "/settings/users/:path*",
    "/settings/warehouses",
    "/settings/warehouses/:path*",
  ],
};







