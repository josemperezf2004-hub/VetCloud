import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

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
  const clinica = await prisma.clinica.findUnique({ where: { id } });
  if (!clinica) {
    return NextResponse.json({ error: "Clínica no encontrada" }, { status: 404 });
  }

  await prisma.clinica.update({ where: { id }, data: { activa: false } });

  return NextResponse.json({ ok: true });
}
