import { prisma } from "@/lib/prisma";

export async function listarClinicasPlataforma() {
  return prisma.clinica.findMany({
    orderBy: { creadoEn: "desc" },
    select: {
      id: true,
      nombre: true,
      email: true,
      activa: true,
      suscripcionVenceEn: true,
      creadoEn: true,
      _count: { select: { usuarios: true } },
    },
  });
}
