import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productoEditSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const existente = await prisma.producto.findFirst({
    where: { id, clinicaId: session.user.clinicaId, deletedAt: null },
  });
  if (!existente) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = productoEditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const producto = await prisma.producto.update({
    where: { id },
    data: {
      nombre: parsed.data.nombre,
      sku: parsed.data.sku || null,
      categoria: parsed.data.categoria,
      descripcion: parsed.data.descripcion || null,
      unidad: parsed.data.unidad,
      precioVenta: parsed.data.precioVenta,
      precioCosto: parsed.data.precioCosto ?? null,
      stockMinimo: parsed.data.stockMinimo,
    },
  });

  return NextResponse.json(producto);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const existente = await prisma.producto.findFirst({
    where: { id, clinicaId: session.user.clinicaId, deletedAt: null },
  });
  if (!existente) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.producto.update({
    where: { id },
    data: { deletedAt: new Date(), activo: false },
  });

  return NextResponse.json({ ok: true });
}
