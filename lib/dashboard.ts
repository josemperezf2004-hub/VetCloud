import { prisma } from "@/lib/prisma";

export function inicioHoy() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function finHoy() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

async function contarMetricasDelDia(clinicaId: string, inicio: Date, fin: Date) {
  const [citas, ventas, pacientes] = await Promise.all([
    prisma.cita.count({
      where: { clinicaId, fechaHora: { gte: inicio, lte: fin } },
    }),
    prisma.factura.aggregate({
      where: {
        clinicaId,
        emitidaEn: { gte: inicio, lte: fin },
        estado: { notIn: ["CANCELADA", "ANULADA"] },
      },
      _sum: { total: true },
    }),
    prisma.cita.findMany({
      where: {
        clinicaId,
        fechaHora: { gte: inicio, lte: fin },
        estado: "COMPLETADA",
      },
      distinct: ["pacienteId"],
      select: { pacienteId: true },
    }),
  ]);

  return {
    citas,
    ventas: ventas._sum.total ?? 0,
    pacientesAtendidos: pacientes.length,
  };
}

export async function getProductosStockBajo(clinicaId: string) {
  const productos = await prisma.producto.findMany({
    where: { clinicaId, activo: true, deletedAt: null },
    select: {
      id: true,
      nombre: true,
      stockActual: true,
      stockMinimo: true,
      categoria: true,
    },
  });

  return productos
    .filter((p) => p.stockActual <= p.stockMinimo)
    .sort((a, b) => a.stockActual - b.stockActual);
}

export async function getEstadisticasHoy(clinicaId: string) {
  const inicio = inicioHoy();
  const fin = finHoy();
  const en15Dias = new Date(inicio);
  en15Dias.setDate(en15Dias.getDate() + 15);

  const [metricasDelDia, citasCompletadas, stockBajo, proximasVacunas, clientesNuevos] =
    await Promise.all([
      contarMetricasDelDia(clinicaId, inicio, fin),
      prisma.cita.count({
        where: {
          clinicaId,
          fechaHora: { gte: inicio, lte: fin },
          estado: "COMPLETADA",
        },
      }),
      getProductosStockBajo(clinicaId),
      prisma.vacuna.count({
        where: {
          deletedAt: null,
          paciente: { clinicaId },
          proximaDosis: { gte: inicio, lte: en15Dias },
        },
      }),
      prisma.cliente.count({
        where: { clinicaId, deletedAt: null, creadoEn: { gte: inicio, lte: fin } },
      }),
    ]);

  return {
    citasHoy: metricasDelDia.citas,
    citasCompletadas,
    ventasHoy: metricasDelDia.ventas,
    pacientesAtendidos: metricasDelDia.pacientesAtendidos,
    productosStockBajo: stockBajo.length,
    proximasVacunas,
    clientesNuevosHoy: clientesNuevos,
  };
}

export async function getCitasHoy(clinicaId: string, limite = 5) {
  const inicio = inicioHoy();
  const fin = finHoy();

  return prisma.cita.findMany({
    where: { clinicaId, fechaHora: { gte: inicio, lte: fin } },
    orderBy: { fechaHora: "asc" },
    take: limite,
    select: {
      id: true,
      fechaHora: true,
      estado: true,
      paciente: {
        select: {
          nombre: true,
          especie: true,
          cliente: { select: { nombre: true, apellido: true } },
        },
      },
      veterinario: { select: { nombre: true } },
    },
  });
}

export async function getProximasVacunasDetalle(clinicaId: string, limite = 5) {
  const inicio = inicioHoy();
  const en15Dias = new Date(inicio);
  en15Dias.setDate(en15Dias.getDate() + 15);

  return prisma.vacuna.findMany({
    where: {
      deletedAt: null,
      paciente: { clinicaId },
      proximaDosis: { gte: inicio, lte: en15Dias },
    },
    orderBy: { proximaDosis: "asc" },
    take: limite,
    select: {
      id: true,
      nombre: true,
      proximaDosis: true,
      paciente: {
        select: {
          nombre: true,
          cliente: { select: { nombre: true, apellido: true } },
        },
      },
    },
  });
}
