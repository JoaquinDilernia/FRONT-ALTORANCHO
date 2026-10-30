import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, gateToken } from "@/lib/gate";

// Todo el sitio pide la clave de acceso salvo la propia página de acceso.
export async function middleware(req: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();
  if (req.cookies.get(GATE_COOKIE)?.value === (await gateToken(password))) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Acceso restringido." }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/acceso";
  url.search = "";
  const next = req.nextUrl.pathname + req.nextUrl.search;
  if (next !== "/") url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!acceso|_next/|favicon.ico|robots.txt).*)"],
};
