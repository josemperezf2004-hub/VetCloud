import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cuentaConfigSchema } from "@/lib/validations";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = cuentaConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const usuario = await prisma.usuario.update({
    where: { id: session.user.id },
    data: {
      nombre: parsed.data.nombre,
      ...(parsed.data.nuevaPassword
        ? { password: await bcrypt.hash(parsed.data.nuevaPassword, 10) }
        : {}),
    },
  });

  return NextResponse.json({ id: usuario.id, nombre: usuario.nombre });
}
