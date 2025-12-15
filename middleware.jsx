import { NextResponse } from "next/server";

export function middleware(request) {
  // 1. Ambil token dari Cookies user
  const token = request.cookies.get("token");
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // 2. PROTEKSI DASHBOARD
  // Jika user mencoba masuk ke url yang berawalan "/dashboard"
  if (pathname.startsWith("/dashboard")) {
    // Jika TIDAK ADA token, tendang balik ke halaman Login ("/")
    if (!token) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // 3. REDIRECT JIKA SUDAH LOGIN
  // Jika user ada di halaman Login ("/") tapi SUDAH punya token
  if (pathname === "/") {
    if (token) {
      // Langsung lempar ke dashboard (biar gak login 2x)
      url.pathname = "/dashboard/products";
      return NextResponse.redirect(url);
    }
  }

  // Jika aman, lanjutkan request
  return NextResponse.next();
}

// Konfigurasi: Middleware hanya akan aktif di path yang didaftarkan di sini
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
