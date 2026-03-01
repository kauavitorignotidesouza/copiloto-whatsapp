import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
                     req.nextUrl.pathname.startsWith("/register") ||
                     req.nextUrl.pathname.startsWith("/forgot-password");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  const isWebhook = req.nextUrl.pathname.startsWith("/api/webhooks");

  // Allow webhooks without auth
  if (isWebhook) return NextResponse.next();

  // Redirect logged-in users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect non-logged-in users to login (except auth pages and API)
  if (!isAuthPage && !isLoggedIn && !isApiRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg).*)"],
};
