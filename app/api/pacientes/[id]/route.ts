import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pacienteSchema } from "@/lib/validations";
import { getPacienteDetalle } from "@/lib/pacientes";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const paciente = await getPacienteDetalle(session.user.clinicaId, id);

  if (!paciente) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(paciente);
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

  const existente = await prisma.paciente.findFirst({
    where: { id, clinicaId: session.user.clinicaId, deletedAt: null },
  });
  if (!existente) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = pacienteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const cliente = await prisma.cliente.findFirst({
    where: {
      id: parsed.data.clienteId,
      clinicaId: session.user.clinicaId,
      deletedAt: null,
    },
  });
  if (!cliente) {
    return NextResponse.json(
      { error: "Propietario no encontrado" },
      { status: 404 }
    );
  }

  const paciente = await prisma.paciente.update({
    where: { id },
    data: {
      clienteId: cliente.id,
      nombre: parsed.data.nombre,
      especie: parsed.data.especie,
      sexo: parsed.data.sexo,
      raza: parsed.data.raza || null,
      color: parsed.data.color || null,
      fechaNacimiento: parsed.data.fechaNacimiento
        ? new Date(parsed.data.fechaNacimiento)
        : null,
      peso: parsed.data.peso ? Number(parsed.data.peso) : null,
      chipId: parsed.data.chipId || null,
      fotoUrl: parsed.data.fotoUrl || null,
      alergias: parsed.data.alergias || null,
      condiciones: parsed.data.condiciones || null,
      esterilizado: parsed.data.esterilizado,
      notas: parsed.data.notas || null,
    },
  });

  return NextResponse.json(paciente);
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

  const existente = await prisma.paciente.findFirst({
    where: { id, clinicaId: session.user.clinicaId, deletedAt: null },
  });
  if (!existente) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.paciente.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
