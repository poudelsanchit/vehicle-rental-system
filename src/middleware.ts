import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if token is valid (has userId or email)
  const isValidToken = token && (token.userId || token.email);

  // Redirect unauthenticated users away from protected routes
  if (
    !isValidToken &&
    (pathname.startsWith("/owner") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/user") ||
      pathname.startsWith("/verification"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect authenticated users away from auth pages or home
  if (
    isValidToken &&
    (pathname === "/" || pathname.startsWith("/auth")) &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/owner") &&
    !pathname.startsWith("/user") &&
    !pathname.startsWith("/verification")
  ) {
    const redirectUrl = token.isVerified
      ? token.role === "ADMIN"
        ? "/admin"
        : token.role === "OWNER"  // Fixed: was checking ADMIN twice
        ? "/owner"
        : "/user"
      : "/verification";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Prevent verified users from accessing verification page
  if (token?.isVerified && pathname.startsWith("/verification")) {
    const redirectUrl =
      token.role === "ADMIN"
        ? "/admin"
        : token.role === "OWNER"  // Fixed: was checking ADMIN twice
        ? "/owner"
        : "/user";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Prevent unverified users from accessing protected routes
  if (
    isValidToken &&
    !token.isVerified &&
    (pathname.startsWith("/owner") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/user"))
  ) {
    return NextResponse.redirect(new URL("/verification", request.url));
  }

  // Role-based access control for verified users
  if (isValidToken && token?.isVerified) {
    if (
      token.role === "ADMIN" &&
      (pathname.startsWith("/owner") || pathname.startsWith("/user"))
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (
      token.role === "OWNER" &&
      (pathname.startsWith("/admin") || pathname.startsWith("/user"))
    ) {
      return NextResponse.redirect(new URL("/owner", request.url));
    }

    if (
      token.role === "USER" &&
      (pathname.startsWith("/admin") || pathname.startsWith("/owner"))
    ) {
      return NextResponse.redirect(new URL("/user", request.url));
    }
  }

  return NextResponse.next();
}