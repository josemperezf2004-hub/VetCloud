import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  // Todo excepto login, register, TODA /api (cada route ya valida su propia
  // sesión y responde 401 JSON — dejar que proxy también la intercepte
  // redirige a /login con HTML, lo que rompe cualquier fetch().then(r =>
  // r.json()) del lado del cliente si la sesión expira) y assets estáticos
  // requiere sesión.
  matcher: ["/((?!login|register|api|_next/static|_next/image|favicon.ico).*)"],
};
