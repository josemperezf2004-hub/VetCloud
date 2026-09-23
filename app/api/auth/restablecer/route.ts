import crypto from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { restablecerPasswordSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = restablecerPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(parsed.data.token)
    .digest("hex");

  const registro = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (
    !registro ||
    registro.usadoEn ||
    registro.expiresAt < new Date()
  ) {
    return NextResponse.json(
      { error: "El enlace de recuperación es inválido o ya venció" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: registro.usuarioId },
      data: { password: passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: registro.id },
      data: { usadoEn: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
