import { prisma } from "@/lib/prisma";
import { ESPECIES } from "@/lib/validations";
import type { Especie } from "@/app/generated/prisma/enums";

const PAGE_SIZE = 24;

function especieValida(especie?: string): Especie | undefined {
  return ESPECIES.includes(especie as Especie) ? (especie as Especie) : undefined;
}

export async function listarPacientes(
  clinicaId: string,
  {
    q,
    especie,
    sort,
    page,
  }: { q?: string; especie?: string; sort?: string; page?: number }
) {
  const paginaActual = Math.max(1, page ?? 1);

  const especieFiltro = especieValida(especie);

  const where = {
    clinicaId,
    deletedAt: null,
    ...(especieFiltro && { especie: especieFiltro }),
    ...(q && {
      OR: [
        { nombre: { contains: q, mode: "insensitive" as const } },
        { cliente: { nombre: { contains: q, mode: "insensitive" as const } } },
        { cliente: { apellido: { contains: q, mode: "insensitive" as const } } },
      ],
    }),
  };

  const orderBy =
    sort === "nombre" ? { nombre: "asc" as const } : { creadoEn: "desc" as const };

  const [pacientes, total] = await Promise.all([
    prisma.paciente.findMany({
      where,
      orderBy,
      skip: (paginaActual - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        nombre: true,
        especie: true,
        raza: true,
        fotoUrl: true,
        cliente: { select: { nombre: true, apellido: true } },
        citas: {
          orderBy: { fechaHora: "desc" },
          take: 1,
          select: { fechaHora: true },
        },
      },
    }),
    prisma.paciente.count({ where }),
  ]);

  return {
    pacientes: pacientes.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      especie: p.especie,
      raza: p.raza,
      fotoUrl: p.fotoUrl,
      cliente: p.cliente,
      ultimaVisita: p.citas[0]?.fechaHora ?? null,
    })),
    total,
    page: paginaActual,
    pageSize: PAGE_SIZE,
  };
}

export async function getPacienteDetalle(clinicaId: string, id: string) {
  return prisma.paciente.findFirst({
    where: { id, clinicaId, deletedAt: null },
    include: {
      cliente: true,
      vacunas: { where: { deletedAt: null }, orderBy: { aplicadaEn: "desc" } },
      citas: {
        orderBy: { fechaHora: "desc" },
        take: 20,
        include: { veterinario: { select: { nombre: true } } },
      },
      historias: {
        orderBy: { creadoEn: "desc" },
        take: 20,
        include: { veterinario: { select: { nombre: true } } },
      },
    },
  });
}
