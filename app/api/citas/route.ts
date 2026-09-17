import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { citaSchema } from "@/lib/validations";
import { listarCitasPorRango, haySolapamiento } from "@/lib/citas";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const desdeParam = searchParams.get("desde");
  const hastaParam = searchParams.get("hasta");

  const desde = desdeParam ? new Date(desdeParam) : new Date();
  const hasta = hastaParam ? new Date(hastaParam) : new Date();
  if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
    return NextResponse.json({ error: "Rango de fechas inválido" }, { status: 400 });
  }

  const citas = await listarCitasPorRango(session.user.clinicaId, { desde, hasta });
  return NextResponse.json({ citas });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = citaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const clinicaId = session.user.clinicaId;

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
  });
  if (solapa) {
    return NextResponse.json(
      { error: "El veterinario ya tiene otra cita en ese horario" },
      { status: 409 }
    );
  }

  const cita = await prisma.cita.create({
    data: {
      clinicaId,
      pacienteId: paciente.id,
      veterinarioId: veterinario.id,
      fechaHora,
      duracionMin: parsed.data.duracionMin,
      tipo: parsed.data.tipo,
      motivo: parsed.data.motivo || null,
      notas: parsed.data.notas || null,
    },
  });

  return NextResponse.json(cita, { status: 201 });
}
