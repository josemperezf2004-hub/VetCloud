import { prisma } from "@/lib/prisma";
import type { ConsultaInput } from "@/lib/validations";

const HISTORIA_INCLUDE = {
  paciente: {
    select: {
      id: true,
      nombre: true,
      especie: true,
      cliente: { select: { id: true, nombre: true, apellido: true } },
    },
  },
  veterinario: { select: { id: true, nombre: true } },
} as const;

export async function listarHistoriasPaciente(clinicaId: string, pacienteId: string) {
  return prisma.historiaClinica.findMany({
    where: { clinicaId, pacienteId },
    orderBy: { creadoEn: "desc" },
    include: HISTORIA_INCLUDE,
  });
}

const PAGE_SIZE = 20;

// El sidebar (Fase 1) siempre tuvo un link a "/historia-clinica", pero la
// Fase 6 solo construyó el detalle de una consulta y el formulario de una
// nueva — nunca un índice, porque el flujo real es entrar desde el perfil
// del paciente. El link quedó apuntando a una ruta inexistente (404). Este
// listado clínica-wide lo resuelve y además es útil por sí mismo (ver la
// actividad clínica reciente sin pasar por cada paciente).
export async function listarHistoriasClinica(
  clinicaId: string,
  { q, page }: { q?: string; page?: number }
) {
  const paginaActual = Math.max(1, page ?? 1);

  const where = {
    clinicaId,
    ...(q && {
      paciente: {
        OR: [
          { nombre: { contains: q, mode: "insensitive" as const } },
          { cliente: { nombre: { contains: q, mode: "insensitive" as const } } },
          { cliente: { apellido: { contains: q, mode: "insensitive" as const } } },
        ],
      },
    }),
  };

  const [historias, total] = await Promise.all([
    prisma.historiaClinica.findMany({
      where,
      orderBy: { creadoEn: "desc" },
      skip: (paginaActual - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: HISTORIA_INCLUDE,
    }),
    prisma.historiaClinica.count({ where }),
  ]);

  return { historias, total, page: paginaActual, pageSize: PAGE_SIZE };
}

export async function getConsultaDetalle(clinicaId: string, id: string) {
  return prisma.historiaClinica.findFirst({
    where: { id, clinicaId },
    include: HISTORIA_INCLUDE,
  });
}

// Se ejecuta en una sola transacción porque la consulta, el descuento de
// stock y los movimientos de inventario tienen que ser atómicos: si falta
// stock de un producto, no debe quedar creada la historia clínica a medias.
export async function crearConsulta(
  clinicaId: string,
  veterinarioId: string,
  data: ConsultaInput
) {
  return prisma.$transaction(async (tx) => {
    const historia = await tx.historiaClinica.create({
      data: {
        clinicaId,
        pacienteId: data.pacienteId,
        veterinarioId,
        citaId: data.citaId || null,
        peso: data.peso ? Number(data.peso) : null,
        temperatura: data.temperatura ? Number(data.temperatura) : null,
        frecuenciaCardiaca: data.frecuenciaCardiaca
          ? Number(data.frecuenciaCardiaca)
          : null,
        frecuenciaRespiratoria: data.frecuenciaRespiratoria
          ? Number(data.frecuenciaRespiratoria)
          : null,
        motivoConsulta: data.motivoConsulta,
        anamnesis: data.anamnesis || null,
        examenFisico: data.examenFisico || null,
        diagnostico: data.diagnostico,
        plan: data.plan || null,
        prescripciones: data.prescripciones.length ? data.prescripciones : undefined,
        notas: data.notas || null,
      },
    });

    for (const item of data.prescripciones) {
      const producto = await tx.producto.findFirst({
        where: { id: item.productoId, clinicaId, deletedAt: null },
      });
      if (!producto) {
        throw new Error(`Producto no encontrado: ${item.productoNombre}`);
      }

      const stockDespues = producto.stockActual - item.cantidad;
      if (stockDespues < 0) {
        throw new Error(
          `Stock insuficiente de "${producto.nombre}" (disponible: ${producto.stockActual} ${producto.unidad})`
        );
      }

      await tx.producto.update({
        where: { id: producto.id },
        data: { stockActual: stockDespues },
      });

      await tx.movimientoInventario.create({
        data: {
          productoId: producto.id,
          tipo: "SALIDA",
          cantidad: item.cantidad,
          stockAntes: producto.stockActual,
          stockDespues,
          motivo: "Prescripción en consulta",
          referenciaId: historia.id,
          referenciaType: "HistoriaClinica",
        },
      });
    }

    // El peso registrado en la consulta pasa a ser el peso "actual" de la
    // mascota (se muestra en el header del perfil) — igual que en una ficha
    // física, el último pesaje de consultorio es el vigente.
    if (data.peso) {
      await tx.paciente.update({
        where: { id: data.pacienteId },
        data: { peso: Number(data.peso) },
      });
    }

    // Si la consulta viene de una cita agendada, esa cita se marca como
    // completada — cierra el ciclo Agenda -> Historia Clínica sin requerir
    // un paso manual aparte.
    if (data.citaId) {
      await tx.cita.update({
        where: { id: data.citaId },
        data: { estado: "COMPLETADA" },
      });
    }

    return historia;
  });
}
