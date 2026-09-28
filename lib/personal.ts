import { prisma } from "@/lib/prisma";

export const MAX_USUARIOS_ACTIVOS = 8;

export async function listarPersonal(clinicaId: string) {
  const usuarios = await prisma.usuario.findMany({
    where: { clinicaId, deletedAt: null, esSuperAdmin: false },
    orderBy: { creadoEn: "asc" },
    include: {
      passwordResets: {
        where: { usadoEn: null, expiresAt: { gt: new Date() } },
        orderBy: { creadoEn: "desc" },
        take: 1,
      },
    },
  });

  return usuarios.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    rol: u.rol,
    activo: u.activo,
    pendiente: u.passwordResets.length > 0,
    creadoEn: u.creadoEn,
  }));
}

export async function contarActivos(clinicaId: string): Promise<number> {
  return prisma.usuario.count({
    where: { clinicaId, deletedAt: null, activo: true },
  });
}
