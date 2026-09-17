import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vacunaSchema } from "@/lib/validations";

async function buscarVacunaDeLaClinica(id: string, clinicaId: string) {
  const vacuna = await prisma.vacuna.findFirst({
    where: { id, deletedAt: null, paciente: { clinicaId } },
  });
  return vacuna;
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

  const existente = await buscarVacunaDeLaClinica(id, session.user.clinicaId);
  if (!existente) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = vacunaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const vacuna = await prisma.vacuna.update({
    where: { id },
    data: {
      nombre: parsed.data.nombre,
      lote: parsed.data.lote || null,
      fabricante: parsed.data.fabricante || null,
      aplicadaEn: new Date(parsed.data.aplicadaEn),
      proximaDosis: parsed.data.proximaDosis ? new Date(parsed.data.proximaDosis) : null,
      notas: parsed.data.notas || null,
    },
  });

  return NextResponse.json(vacuna);
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

  const existente = await buscarVacunaDeLaClinica(id, session.user.clinicaId);
  if (!existente) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.vacuna.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
