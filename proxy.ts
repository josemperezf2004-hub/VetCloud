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
  // Todo excepto login, register, recuperar/restablecer (flujo de "olvidé mi
  // contraseña" — bug real encontrado 2026-09-30: sin estas dos exclusiones,
  // proxy redirigía a /login a cualquier usuario deslogueado que intentara
  // usarlo, haciendo el flujo completo inalcanzable para su caso de uso real),
  // robots.txt/sitemap.xml (mismo bug real, encontrado el mismo día: sin esto
  // Google recibe un redirect a /login en vez del archivo, y nunca indexa
  // nada), TODA /api (cada route ya valida su propia sesión y responde 401
  // JSON — dejar que proxy también la intercepte redirige a /login con HTML,
  // lo que rompe cualquier fetch().then(r => r.json()) del lado del cliente
  // si la sesión expira) y assets estáticos requiere sesión. `.+` (no `.*`)
  // además deja pública la raíz "/" — landing pública, el dashboard real vive
  // en /dashboard.
  matcher: ["/((?!login|register|recuperar|restablecer|robots.txt|sitemap.xml|api|_next/static|_next/image|favicon.ico).+)"],
};
