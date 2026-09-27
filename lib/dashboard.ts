import { prisma } from "@/lib/prisma";

// América/Guayaquil es UTC-5 fijo, sin horario de verano — mismo criterio que
// lib/recordatorios.ts. En producción (Netlify Functions) el proceso corre en
// UTC, así que "hoy" calculado con setHours(0,0,0,0) usaba el día calendario
// de UTC, no el de Ecuador — desde las 19:00 hasta la medianoche hora Ecuador,
// UTC ya está en el día siguiente, adelantando 24h todas las ventanas "hoy" /
// "próximos N días" del dashboard (vacunas, mantenimientos, etc.).
const OFFSET_HORAS_ECUADOR = 5;

export function inicioHoy() {
  const local = new Date(Date.now() - OFFSET_HORAS_ECUADOR * 60 * 60 * 1000);
  const inicioUTC = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  return new Date(inicioUTC + OFFSET_HORAS_ECUADOR * 60 * 60 * 1000);
}

export function finHoy() {
  return new Date(inicioHoy().getTime() + 24 * 60 * 60 * 1000 - 1);
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
    // EQUIPO y SERVICIO no se consumen/reponen como el resto del inventario —
    // "stock bajo" no es una alerta real para ellos, se excluyen del todo.
    where: { clinicaId, activo: true, deletedAt: null, categoria: { notIn: ["EQUIPO", "SERVICIO"] } },
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

  const [
    metricasDelDia,
    citasCompletadas,
    stockBajo,
    proximasVacunas,
    clientesNuevos,
    mantenimientosProximos,
  ] = await Promise.all([
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
        paciente: { clinicaId, deletedAt: null },
        proximaDosis: { gte: inicio, lte: en15Dias },
      },
    }),
    prisma.cliente.count({
      where: { clinicaId, deletedAt: null, creadoEn: { gte: inicio, lte: fin } },
    }),
    prisma.mantenimientoEquipo.count({
      where: {
        deletedAt: null,
        producto: { clinicaId, deletedAt: null },
        proximoEn: { gte: inicio, lte: en15Dias },
      },
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
    mantenimientosProximos,
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
      paciente: { clinicaId, deletedAt: null },
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

export async function getProximosMantenimientos(clinicaId: string, limite = 5) {
  const inicio = inicioHoy();
  const en15Dias = new Date(inicio);
  en15Dias.setDate(en15Dias.getDate() + 15);

  return prisma.mantenimientoEquipo.findMany({
    where: {
      deletedAt: null,
      producto: { clinicaId, deletedAt: null },
      proximoEn: { gte: inicio, lte: en15Dias },
    },
    orderBy: { proximoEn: "asc" },
    take: limite,
    select: {
      id: true,
      tipo: true,
      proximoEn: true,
      producto: { select: { nombre: true } },
    },
  });
}
