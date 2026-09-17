import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { Prisma } from "@/app/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { registerClinicaSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerClinicaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const {
    clinicaNombre,
    clinicaEmail,
    clinicaTelefono,
    adminNombre,
    adminEmail,
    adminPassword,
  } = parsed.data;

  const clinicaExistente = await prisma.clinica.findUnique({
    where: { email: clinicaEmail },
  });
  if (clinicaExistente) {
    return NextResponse.json(
      { error: "Ya existe una clínica registrada con ese email" },
      { status: 409 }
    );
  }

  // El login busca por email sin filtrar por clínica (el usuario no elige
  // clínica al iniciar sesión), así que aunque el schema solo garantiza
  // unicidad de email por clinicaId, aquí se exige unicidad global para
  // que el login nunca sea ambiguo entre dos clínicas distintas.
  const usuarioExistente = await prisma.usuario.findFirst({
    where: { email: adminEmail },
  });
  if (usuarioExistente) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese email" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const clinica = await tx.clinica.create({
      data: {
        nombre: clinicaNombre,
        email: clinicaEmail,
        telefono: clinicaTelefono || null,
      },
    });

    await tx.usuario.create({
      data: {
        clinicaId: clinica.id,
        nombre: adminNombre,
        email: adminEmail,
        password: passwordHash,
        rol: "ADMIN",
      },
    });
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
