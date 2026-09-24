import crypto from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { recuperarPasswordSchema } from "@/lib/validations";
import { enviarEmailRecuperacion } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = recuperarPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const usuario = await prisma.usuario.findFirst({
    where: { email: parsed.data.email, deletedAt: null, activo: true },
  });

  // Respuesta genérica exista o no el usuario — no filtrar qué emails están
  // registrados en el sistema.
  if (usuario) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await prisma.$transaction([
      // Limpia solicitudes anteriores no usadas para que no queden tokens
      // viejos válidos acumulándose por cada pedido repetido.
      prisma.passwordResetToken.deleteMany({
        where: { usuarioId: usuario.id, usadoEn: null },
      }),
      prisma.passwordResetToken.create({
        data: {
          usuarioId: usuario.id,
          tokenHash,
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      }),
    ]);

    const link = `${process.env.NEXTAUTH_URL}/restablecer?token=${token}`;
    try {
      await enviarEmailRecuperacion(usuario.email, link);
    } catch (err) {
      // No dejar que una falla de envío (SMTP caído, red, etc.) devuelva un
      // status distinto al caso "email no registrado" — eso rompería el
      // anti-enumeración de este endpoint.
      console.error("[recuperar] fallo al enviar email de recuperación:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
