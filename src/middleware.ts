import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const protectedPaths = ["/dashboard"];

  // Paths that should redirect to dashboard if authenticated
  const publicAuthPaths = ["/auth/signin", "/auth/signup"];

  // Check if this is a protected path
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );

  // Check if this is a public auth path
  const isPublicAuthPath = publicAuthPaths.some((path) =>
    pathname.startsWith(path),
  );

  // Get the auth cookie
  const authCookie = request.cookies.get("better-auth.session_token");

  // If trying to access protected path without session
  if (isProtectedPath && !authCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // If accessing auth pages while authenticated, redirect to dashboard
  if (isPublicAuthPath && authCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
