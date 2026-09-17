import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { facturaPagoSchema, facturaCancelacionSchema } from "@/lib/validations";
import { getFacturaDetalle } from "@/lib/facturas";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const factura = await getFacturaDetalle(session.user.clinicaId, id);
  if (!factura) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json(factura);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const clinicaId = session.user.clinicaId;

  const existente = await prisma.factura.findFirst({ where: { id, clinicaId } });
  if (!existente) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = await request.json();

  // Dos transiciones válidas y nada más: registrar el pago (exige método de
  // pago) o anular/cancelar. Se distingue por la forma del body, igual que
  // el PUT de citas para el cambio de estado.
  if (typeof body === "object" && body !== null && "metodoPago" in body) {
    if (existente.estado === "PAGADA") {
      return NextResponse.json({ error: "La factura ya está pagada" }, { status: 400 });
    }

    const parsed = facturaPagoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const factura = await prisma.factura.update({
      where: { id },
      data: { estado: "PAGADA", metodoPago: parsed.data.metodoPago, pagadaEn: new Date() },
    });
    return NextResponse.json(factura);
  }

  const parsed = facturaCancelacionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const factura = await prisma.factura.update({
    where: { id },
    data: { estado: parsed.data.estado },
  });

  return NextResponse.json(factura);
}
