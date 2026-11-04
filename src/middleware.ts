import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, GATE_COOKIE, adminToken, gateToken } from "@/lib/gate";

// Todo el sitio pide la clave de acceso salvo la propia página de acceso.
// El panel (/admin) pide además su propia clave, ADMIN_PASSWORD.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");

  const password = process.env.SITE_PASSWORD;
  if (password && req.cookies.get(GATE_COOKIE)?.value !== (await gateToken(password))) {
    if (isApi) return NextResponse.json({ error: "Acceso restringido." }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/acceso";
    url.search = "";
    const next = pathname + req.nextUrl.search;
    if (next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/");
  if (isAdminArea && pathname !== "/admin/login") {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const ok = adminPassword && req.cookies.get(ADMIN_COOKIE)?.value === (await adminToken(adminPassword));
    if (!ok) {
      if (isApi) return NextResponse.json({ error: "Entrá al panel de nuevo." }, { status: 401 });
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  // Los archivos de imagen (logos de public/ y fotos subidas al panel en /media) pasan sin clave.
  matcher: ["/((?!acceso|_next/|favicon.ico|robots.txt|.*\\.(?:png|svg|jpg|webp)$).*)"],
};
