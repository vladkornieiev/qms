import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

// Routes that require authentication
const PROTECTED_ROUTES = ["/profile", "/settings", "/admin", "/users"];

// Routes that should redirect to home if already authenticated
const AUTH_ROUTES = ["/login", "/register", "/auth"];

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // Check if user is authenticated
  const isAuthenticated = accessToken && !isTokenExpired(accessToken);

  // Handle protected routes
  if (
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) &&
    !isAuthenticated
  ) {
    // Redirect to login with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle auth routes (redirect authenticated users)
  if (
    AUTH_ROUTES.some((route) => pathname.startsWith(route)) &&
    isAuthenticated
  ) {
    // Check if there's a return URL
    const returnUrl = request.nextUrl.searchParams.get("returnUrl");
    if (returnUrl && !AUTH_ROUTES.includes(returnUrl)) {
      return NextResponse.redirect(new URL(returnUrl, request.url));
    }
    // Default redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Handle OAuth callback (magic link exchange)
  if (pathname === "/auth/callback") {
    const token = request.nextUrl.searchParams.get("token");
    if (token) {
      // Let the page handle the token exchange
      return NextResponse.next();
    } else {
      // No token, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
