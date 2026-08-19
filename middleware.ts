import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const staticToken = process.env.NEXT_PUBLIC_STATIC_TOKEN;
  const isLoginPage = request.nextUrl.pathname === "/login";

  // Jika belum login dan mencoba akses halaman terproteksi -> redirect ke /login
  if (!token || token !== staticToken) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Jika sudah login dan mencoba akses /login -> redirect ke /
  if (token === staticToken && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Tentukan route mana saja yang diproteksi oleh middleware ini
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
