import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Endpoint de solo lectura para el combobox de ProductoSelect, reusado por el
// buscador de prescripciones (Fase 6) y el de items de factura (Fase 8).
// No es el CRUD de inventario (eso es la Fase 7) — solo permite buscar
// productos que ya existan, nada de crear/editar/borrar.
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ productos: [] });
  }

  const productos = await prisma.producto.findMany({
    where: {
      clinicaId: session.user.clinicaId,
      deletedAt: null,
      activo: true,
      nombre: { contains: q, mode: "insensitive" },
    },
    orderBy: { nombre: "asc" },
    take: 10,
    select: {
      id: true,
      nombre: true,
      unidad: true,
      stockActual: true,
      categoria: true,
      precioVenta: true,
    },
  });

  return NextResponse.json({ productos });
}
