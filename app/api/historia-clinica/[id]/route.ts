import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { consultaEditSchema } from "@/lib/validations";
import { getConsultaDetalle } from "@/lib/historia-clinica";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const historia = await getConsultaDetalle(session.user.clinicaId, id);
  if (!historia) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json(historia);
}

// Solo permite corregir el texto clínico (SOAP + signos vitales). No toca
// prescripciones ni inventario: ya se descontó stock al crear la consulta,
// y reabrir eso aquí requeriría revertir/recalcular movimientos — fuera de
// alcance del MVP (ver lib/validations.ts::consultaEditSchema).
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

  const existente = await prisma.historiaClinica.findFirst({
    where: { id, clinicaId },
  });
  if (!existente) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = consultaEditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const historia = await prisma.historiaClinica.update({
    where: { id },
    data: {
      peso: parsed.data.peso ? Number(parsed.data.peso) : null,
      temperatura: parsed.data.temperatura ? Number(parsed.data.temperatura) : null,
      frecuenciaCardiaca: parsed.data.frecuenciaCardiaca
        ? Number(parsed.data.frecuenciaCardiaca)
        : null,
      frecuenciaRespiratoria: parsed.data.frecuenciaRespiratoria
        ? Number(parsed.data.frecuenciaRespiratoria)
        : null,
      motivoConsulta: parsed.data.motivoConsulta,
      anamnesis: parsed.data.anamnesis || null,
      examenFisico: parsed.data.examenFisico || null,
      diagnostico: parsed.data.diagnostico,
      plan: parsed.data.plan || null,
      notas: parsed.data.notas || null,
    },
  });

  return NextResponse.json(historia);
}
