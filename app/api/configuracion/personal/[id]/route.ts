import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { actualizarPersonalSchema } from "@/lib/validations";
import { contarActivos, MAX_USUARIOS_ACTIVOS } from "@/lib/personal";
import { enviarEmailInvitacion } from "@/lib/email";
import { ROL_LABELS } from "@/components/layout/nav-items";

const TOKEN_TTL_MS = 72 * 60 * 60 * 1000; // 72 horas

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  const body = await request.json();
  const parsed = actualizarPersonalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const target = await prisma.usuario.findFirst({
    where: { id, clinicaId: session.user.clinicaId, deletedAt: null },
  });
  if (!target) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  if (target.id === session.user.id) {
    return NextResponse.json(
      { error: "Tu propia cuenta se administra desde 'Mi cuenta'" },
      { status: 400 }
    );
  }
  if (target.rol === "ADMIN") {
    return NextResponse.json(
      { error: "No se puede modificar a otro administrador desde aquí" },
      { status: 400 }
    );
  }

  const { activo, rol, reenviarInvitacion } = parsed.data;

  if (activo === true && !target.activo) {
    const activos = await contarActivos(session.user.clinicaId);
    if (activos >= MAX_USUARIOS_ACTIVOS) {
      return NextResponse.json(
        { error: `Ya alcanzaste el máximo de ${MAX_USUARIOS_ACTIVOS} usuarios activos` },
        { status: 400 }
      );
    }
  }

  if (activo !== undefined || rol !== undefined) {
    await prisma.usuario.update({
      where: { id: target.id },
      data: {
        ...(activo !== undefined && { activo }),
        ...(rol !== undefined && { rol }),
      },
    });
  }

  if (reenviarInvitacion) {
    const pendiente = await prisma.passwordResetToken.findFirst({
      where: { usuarioId: target.id, usadoEn: null, expiresAt: { gt: new Date() } },
    });
    if (!pendiente) {
      return NextResponse.json(
        { error: "Este usuario ya activó su cuenta, no hay invitación pendiente" },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({
        where: { usuarioId: target.id, usadoEn: null },
      }),
      prisma.passwordResetToken.create({
        data: {
          usuarioId: target.id,
          tokenHash,
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      }),
    ]);

    const clinica = await prisma.clinica.findUniqueOrThrow({
      where: { id: session.user.clinicaId },
      select: { nombre: true },
    });
    const link = `${process.env.NEXTAUTH_URL}/restablecer?token=${token}`;
    try {
      await enviarEmailInvitacion(target.email, link, {
        clinicaNombre: clinica.nombre,
        rol: ROL_LABELS[rol ?? target.rol] ?? target.rol,
      });
    } catch (err) {
      console.error("[personal] fallo al reenviar email de invitación:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
