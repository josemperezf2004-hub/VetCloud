import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vacunaSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const paciente = await prisma.paciente.findFirst({
    where: { id, clinicaId: session.user.clinicaId, deletedAt: null },
  });
  if (!paciente) {
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

  const vacuna = await prisma.vacuna.create({
    data: {
      pacienteId: paciente.id,
      nombre: parsed.data.nombre,
      lote: parsed.data.lote || null,
      fabricante: parsed.data.fabricante || null,
      aplicadaEn: new Date(parsed.data.aplicadaEn),
      proximaDosis: parsed.data.proximaDosis
        ? new Date(parsed.data.proximaDosis)
        : null,
      notas: parsed.data.notas || null,
    },
  });

  return NextResponse.json(vacuna, { status: 201 });
}
