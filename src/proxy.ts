import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PATHS = ["/dashboard", "/calculators", "/library", "/simulator", "/compare", "/learn", "/settings"];
const ADMIN_PATHS = ["/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameWithoutLocale = pathname.replace(/^\/(es|en)/, "") || "/";

  const isProtected = PROTECTED_PATHS.some((p) => pathnameWithoutLocale.startsWith(p));
  const isAdmin     = ADMIN_PATHS.some((p) => pathnameWithoutLocale.startsWith(p));

  if (isProtected || isAdmin) {
    const { supabaseResponse, user } = await updateSession(request);

    if (!user) {
      const locale = pathname.startsWith("/en") ? "en" : "es";
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
