import { auth } from "@/auth";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "../i18n/routing";
import { NextResponse, type NextRequest } from "next/server";

const intl = createIntlMiddleware(routing);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protect all /admin/* routes except the login page itself
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!req.auth) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Login page and API routes bypass i18n
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Apply next-intl locale routing to all public pages
  return intl(req as unknown as NextRequest);
});

export const config = {
  // Exclude static files, images, and favicon from middleware
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)" ],
};
