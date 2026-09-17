import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clienteSchema } from "@/lib/validations";
import { getClienteDetalle } from "@/lib/clientes";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const cliente = await getClienteDetalle(session.user.clinicaId, id);

  if (!cliente) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(cliente);
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

  const existente = await prisma.cliente.findFirst({
    where: { id, clinicaId: session.user.clinicaId, deletedAt: null },
  });
  if (!existente) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = clienteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const cliente = await prisma.cliente.update({
    where: { id },
    data: {
      nombre: parsed.data.nombre,
      apellido: parsed.data.apellido,
      telefono: parsed.data.telefono,
      whatsapp: parsed.data.whatsapp || null,
      email: parsed.data.email || null,
      cedula: parsed.data.cedula || null,
      direccion: parsed.data.direccion || null,
      notas: parsed.data.notas || null,
    },
  });

  return NextResponse.json(cliente);
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

  const existente = await prisma.cliente.findFirst({
    where: { id, clinicaId: session.user.clinicaId, deletedAt: null },
  });
  if (!existente) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.cliente.update({
    where: { id },
    data: { deletedAt: new Date(), activo: false },
  });

  return NextResponse.json({ ok: true });
}
