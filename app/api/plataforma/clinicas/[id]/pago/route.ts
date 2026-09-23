import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { addMonths } from "date-fns";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.esSuperAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const clinica = await prisma.clinica.findUnique({
    where: { id },
    select: { suscripcionVenceEn: true },
  });
  if (!clinica) {
    return NextResponse.json({ error: "Clínica no encontrada" }, { status: 404 });
  }

  const ahora = new Date();
  // Si renueva antes de que venza, extiende desde la fecha de vencimiento
  // actual (no pierde los días que ya tenía pagados).
  const base =
    clinica.suscripcionVenceEn && clinica.suscripcionVenceEn > ahora
      ? clinica.suscripcionVenceEn
      : ahora;

  const actualizada = await prisma.clinica.update({
    where: { id },
    data: {
      activa: true,
      suscripcionVenceEn: addMonths(base, 1),
    },
  });

  return NextResponse.json({
    activa: actualizada.activa,
    suscripcionVenceEn: actualizada.suscripcionVenceEn,
  });
}
