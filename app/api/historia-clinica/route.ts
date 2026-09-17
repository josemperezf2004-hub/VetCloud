import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { consultaSchema } from "@/lib/validations";
import { crearConsulta, listarHistoriasPaciente } from "@/lib/historia-clinica";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pacienteId = searchParams.get("pacienteId");
  if (!pacienteId) {
    return NextResponse.json({ error: "pacienteId requerido" }, { status: 400 });
  }

  const historias = await listarHistoriasPaciente(session.user.clinicaId, pacienteId);
  return NextResponse.json({ historias });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = consultaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const clinicaId = session.user.clinicaId;

  const paciente = await prisma.paciente.findFirst({
    where: { id: parsed.data.pacienteId, clinicaId, deletedAt: null },
  });
  if (!paciente) {
    return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 });
  }

  if (parsed.data.citaId) {
    const cita = await prisma.cita.findFirst({
      where: { id: parsed.data.citaId, clinicaId, pacienteId: paciente.id },
    });
    if (!cita) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }
  }

  try {
    const historia = await crearConsulta(clinicaId, session.user.id, parsed.data);
    return NextResponse.json(historia, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo crear la consulta";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
