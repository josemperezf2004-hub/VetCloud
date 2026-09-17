import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pacienteSchema } from "@/lib/validations";
import { listarPacientes } from "@/lib/pacientes";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const especie = searchParams.get("especie") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;
  const page = Number(searchParams.get("page") ?? 1) || 1;

  const data = await listarPacientes(session.user.clinicaId, {
    q,
    especie,
    sort,
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

  const paciente = await prisma.paciente.create({
    data: {
      clinicaId: session.user.clinicaId,
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

  return NextResponse.json(paciente, { status: 201 });
}
