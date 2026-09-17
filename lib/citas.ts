import { prisma } from "@/lib/prisma";

const CITA_SELECT = {
  id: true,
  fechaHora: true,
  duracionMin: true,
  tipo: true,
  estado: true,
  motivo: true,
  notas: true,
  pacienteId: true,
  veterinarioId: true,
  paciente: {
    select: {
      nombre: true,
      especie: true,
      cliente: { select: { nombre: true, apellido: true } },
    },
  },
  veterinario: { select: { id: true, nombre: true } },
} as const;

export async function listarCitasPorRango(
  clinicaId: string,
  { desde, hasta }: { desde: Date; hasta: Date }
) {
  return prisma.cita.findMany({
    where: { clinicaId, fechaHora: { gte: desde, lte: hasta } },
    orderBy: { fechaHora: "asc" },
    select: CITA_SELECT,
  });
}

// No hay pantalla de gestión de personal todavía (ninguna fase la contempla) —
// el registro inicial solo crea un Usuario con rol ADMIN. Restringir esta lista
// a rol VETERINARIO dejaría el selector vacío en toda clínica nueva y volvería
// la Fase 5 imposible de usar. Se listan todos los usuarios activos de la
// clínica; se retoma cuando exista un módulo de gestión de personal.
export async function listarVeterinarios(clinicaId: string) {
  return prisma.usuario.findMany({
    where: { clinicaId, deletedAt: null, activo: true },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, rol: true },
  });
}

const VENTANA_SOLAPAMIENTO_MS = 24 * 60 * 60 * 1000;

export async function haySolapamiento(
  clinicaId: string,
  {
    veterinarioId,
    fechaHora,
    duracionMin,
    excluirCitaId,
  }: {
    veterinarioId: string;
    fechaHora: Date;
    duracionMin: number;
    excluirCitaId?: string;
  }
) {
  const inicio = fechaHora.getTime();
  const fin = inicio + duracionMin * 60_000;

  const candidatas = await prisma.cita.findMany({
    where: {
      clinicaId,
      veterinarioId,
      estado: { notIn: ["CANCELADA", "NO_ASISTIO"] },
      fechaHora: {
        gte: new Date(inicio - VENTANA_SOLAPAMIENTO_MS),
        lte: new Date(inicio + VENTANA_SOLAPAMIENTO_MS),
      },
      ...(excluirCitaId && { id: { not: excluirCitaId } }),
    },
    select: { fechaHora: true, duracionMin: true },
  });

  return candidatas.some((c) => {
    const cInicio = c.fechaHora.getTime();
    const cFin = cInicio + c.duracionMin * 60_000;
    return inicio < cFin && cInicio < fin;
  });
}
