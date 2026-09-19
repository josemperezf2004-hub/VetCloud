import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clinicaConfigSchema } from "@/lib/validations";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = clinicaConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const clinica = await prisma.clinica.update({
    where: { id: session.user.clinicaId },
    data: {
      nombre: parsed.data.nombre,
      telefono: parsed.data.telefono || null,
      direccion: parsed.data.direccion || null,
    },
  });

  return NextResponse.json(clinica);
}
