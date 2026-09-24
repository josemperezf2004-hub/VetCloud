import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { facturaSchema } from "@/lib/validations";
import { listarFacturas, crearFactura } from "@/lib/facturas";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado") ?? undefined;
  const clienteId = searchParams.get("clienteId") ?? undefined;
  const fecha = searchParams.get("fecha") ?? undefined;
  const page = Number(searchParams.get("page") ?? 1) || 1;

  const data = await listarFacturas(session.user.clinicaId, {
    estado,
    clienteId,
    fecha,
    page,
  });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = facturaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const cliente = await prisma.cliente.findFirst({
    where: { id: parsed.data.clienteId, clinicaId: session.user.clinicaId, deletedAt: null },
  });
  if (!cliente) {
    return NextResponse.json({ error: "Propietario no encontrado" }, { status: 404 });
  }

  try {
    const factura = await crearFactura(session.user.clinicaId, parsed.data);
    return NextResponse.json(factura, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo crear la factura";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
