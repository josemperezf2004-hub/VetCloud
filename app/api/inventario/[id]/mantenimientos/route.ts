import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mantenimientoSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const producto = await prisma.producto.findFirst({
    where: { id, clinicaId: session.user.clinicaId, deletedAt: null },
  });
  if (!producto) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  if (producto.categoria !== "EQUIPO") {
    return NextResponse.json(
      { error: "Solo aplica a productos categoría Equipo" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = mantenimientoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  // Los inputs son "YYYY-MM-DD" (fecha sin hora); `new Date(string)` los
  // interpreta como medianoche UTC, que no es medianoche en Ecuador (UTC-5)
  // — se ancla explícitamente a medianoche Ecuador para que coincida con las
  // ventanas "hoy" / "próximos 15 días" de lib/dashboard.ts.
  const mantenimiento = await prisma.mantenimientoEquipo.create({
    data: {
      productoId: producto.id,
      tipo: parsed.data.tipo,
      proveedor: parsed.data.proveedor || null,
      realizadoEn: new Date(`${parsed.data.realizadoEn}T00:00:00-05:00`),
      proximoEn: parsed.data.proximoEn
        ? new Date(`${parsed.data.proximoEn}T00:00:00-05:00`)
        : null,
      costo: parsed.data.costo ?? null,
      notas: parsed.data.notas || null,
    },
  });

  return NextResponse.json(mantenimiento, { status: 201 });
}
