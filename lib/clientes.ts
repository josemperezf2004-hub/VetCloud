import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function listarClientes(
  clinicaId: string,
  { q, page }: { q?: string; page?: number }
) {
  const paginaActual = Math.max(1, page ?? 1);

  const where = {
    clinicaId,
    deletedAt: null,
    ...(q && {
      OR: [
        { nombre: { contains: q, mode: "insensitive" as const } },
        { apellido: { contains: q, mode: "insensitive" as const } },
        { telefono: { contains: q } },
        { email: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      orderBy: { creadoEn: "desc" },
      skip: (paginaActual - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        email: true,
        _count: { select: { pacientes: { where: { deletedAt: null } } } },
        facturas: {
          orderBy: { emitidaEn: "desc" },
          take: 1,
          select: { emitidaEn: true },
        },
      },
    }),
    prisma.cliente.count({ where }),
  ]);

  return {
    clientes: clientes.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      apellido: c.apellido,
      telefono: c.telefono,
      email: c.email,
      mascotas: c._count.pacientes,
      ultimaVisita: c.facturas[0]?.emitidaEn ?? null,
    })),
    total,
    page: paginaActual,
    pageSize: PAGE_SIZE,
  };
}

export async function getClienteDetalle(clinicaId: string, id: string) {
  return prisma.cliente.findFirst({
    where: { id, clinicaId, deletedAt: null },
    include: {
      pacientes: {
        where: { deletedAt: null },
        orderBy: { creadoEn: "desc" },
      },
      facturas: {
        orderBy: { emitidaEn: "desc" },
        take: 20,
      },
    },
  });
}
