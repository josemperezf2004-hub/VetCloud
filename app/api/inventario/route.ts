import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { productoSchema } from "@/lib/validations";
import { listarProductos, crearProducto } from "@/lib/inventario";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const categoria = searchParams.get("categoria") ?? undefined;
  const page = Number(searchParams.get("page") ?? 1) || 1;

  const data = await listarProductos(session.user.clinicaId, { q, categoria, page });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = productoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const producto = await crearProducto(session.user.clinicaId, parsed.data);

  return NextResponse.json(producto, { status: 201 });
}
