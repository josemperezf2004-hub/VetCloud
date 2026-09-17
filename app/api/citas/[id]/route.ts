import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { citaEditSchema, citaEstadoSchema } from "@/lib/validations";
import { haySolapamiento } from "@/lib/citas";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const cita = await prisma.cita.findFirst({
    where: { id, clinicaId: session.user.clinicaId },
    include: {
      paciente: { select: { nombre: true, especie: true, cliente: { select: { nombre: true, apellido: true } } } },
      veterinario: { select: { id: true, nombre: true } },
    },
  });

  if (!cita) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json(cita);
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

  const existente = await prisma.cita.findFirst({ where: { id, clinicaId } });
  if (!existente) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = await request.json();
  const esSoloEstado =
    typeof body === "object" && body !== null && Object.keys(body).length === 1 && "estado" in body;

  if (esSoloEstado) {
    const parsed = citaEstadoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const cita = await prisma.cita.update({
      where: { id },
      data: { estado: parsed.data.estado },
    });
    return NextResponse.json(cita);
  }

  const parsed = citaEditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const [paciente, veterinario] = await Promise.all([
    prisma.paciente.findFirst({
      where: { id: parsed.data.pacienteId, clinicaId, deletedAt: null },
    }),
    prisma.usuario.findFirst({
      where: { id: parsed.data.veterinarioId, clinicaId, deletedAt: null, activo: true },
    }),
  ]);
  if (!paciente) {
    return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 });
  }
  if (!veterinario) {
    return NextResponse.json({ error: "Veterinario no encontrado" }, { status: 404 });
  }

  const fechaHora = new Date(parsed.data.fechaHora);

  const solapa = await haySolapamiento(clinicaId, {
    veterinarioId: parsed.data.veterinarioId,
    fechaHora,
    duracionMin: parsed.data.duracionMin,
    excluirCitaId: id,
  });
  if (solapa) {
    return NextResponse.json(
      { error: "El veterinario ya tiene otra cita en ese horario" },
      { status: 409 }
    );
  }

  const cita = await prisma.cita.update({
    where: { id },
    data: {
      pacienteId: paciente.id,
      veterinarioId: veterinario.id,
      fechaHora,
      duracionMin: parsed.data.duracionMin,
      tipo: parsed.data.tipo,
      motivo: parsed.data.motivo || null,
      notas: parsed.data.notas || null,
      ...(parsed.data.estado && { estado: parsed.data.estado }),
    },
  });

  return NextResponse.json(cita);
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

  const existente = await prisma.cita.findFirst({
    where: { id, clinicaId: session.user.clinicaId },
  });
  if (!existente) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  await prisma.cita.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
