import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permisosPersonalSchema } from "@/lib/validations";
import { PERMISOS_DEFAULT } from "@/lib/permisos";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const clinica = await prisma.clinica.findUniqueOrThrow({
    where: { id: session.user.clinicaId },
    select: { permisosPersonal: true },
  });

  const permisos = (clinica.permisosPersonal as typeof PERMISOS_DEFAULT | null) ?? PERMISOS_DEFAULT;

  return NextResponse.json(permisos);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = permisosPersonalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  await prisma.clinica.update({
    where: { id: session.user.clinicaId },
    data: { permisosPersonal: parsed.data },
  });

  return NextResponse.json({ ok: true });
}
