import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import type { Prisma } from "@/app/generated/prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invitarUsuarioSchema } from "@/lib/validations";
import { listarPersonal, contarActivos, MAX_USUARIOS_ACTIVOS } from "@/lib/personal";
import { enviarEmailInvitacion } from "@/lib/email";
import { ROL_LABELS } from "@/components/layout/nav-items";

const TOKEN_TTL_MS = 72 * 60 * 60 * 1000; // 72 horas

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const [personal, activos] = await Promise.all([
    listarPersonal(session.user.clinicaId),
    contarActivos(session.user.clinicaId),
  ]);

  return NextResponse.json({ personal, activos, maxActivos: MAX_USUARIOS_ACTIVOS });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = invitarUsuarioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const activos = await contarActivos(session.user.clinicaId);
  if (activos >= MAX_USUARIOS_ACTIVOS) {
    return NextResponse.json(
      { error: `Ya alcanzaste el máximo de ${MAX_USUARIOS_ACTIVOS} usuarios activos` },
      { status: 400 }
    );
  }

  // Mismo criterio que en el registro de clínicas: el login busca por email
  // sin filtrar por clínica, así que la unicidad tiene que ser global.
  const usuarioExistente = await prisma.usuario.findFirst({
    where: { email: parsed.data.email },
  });
  if (usuarioExistente) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese email" },
      { status: 409 }
    );
  }

  const { nombre, email, rol } = parsed.data;
  const clinicaId = session.user.clinicaId;

  // Nadie elige esta contraseña — el empleado la reemplaza por la suya al
  // aceptar la invitación, vía el mismo flujo de "recuperar contraseña".
  const passwordPlaceholder = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const usuario = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const nuevo = await tx.usuario.create({
      data: { clinicaId, nombre, email, password: passwordPlaceholder, rol },
    });

    await tx.passwordResetToken.create({
      data: {
        usuarioId: nuevo.id,
        tokenHash,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    });

    return nuevo;
  });

  const clinica = await prisma.clinica.findUniqueOrThrow({
    where: { id: clinicaId },
    select: { nombre: true },
  });
  const link = `${process.env.NEXTAUTH_URL}/restablecer?token=${token}`;
  try {
    await enviarEmailInvitacion(usuario.email, link, {
      clinicaNombre: clinica.nombre,
      rol: ROL_LABELS[rol] ?? rol,
    });
  } catch (err) {
    console.error("[personal] fallo al enviar email de invitación:", err);
  }

  return NextResponse.json({ ok: true, id: usuario.id }, { status: 201 });
}
