import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const ADMIN_COOKIE = "zoder_admin_session";
const CUSTOMER_COOKIE = "zoder_customer_session";

async function hasValidCookie(request: NextRequest, cookieName: string) {
  const token = request.cookies.get(cookieName)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    const authed = await hasValidCookie(request, ADMIN_COOKIE);
    if (!authed) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const authed = await hasValidCookie(request, ADMIN_COOKIE);
    if (!authed) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/account")) {
    const authed = await hasValidCookie(request, CUSTOMER_COOKIE);
    if (!authed) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/account")) {
    const authed = await hasValidCookie(request, CUSTOMER_COOKIE);
    if (!authed) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/account/:path*", "/api/account/:path*"],
};
