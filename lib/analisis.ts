import { prisma } from "@/lib/prisma";
import { inicioHoy } from "@/lib/dashboard";

function inicioMes(fecha = new Date()) {
  const d = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function finMes(fecha = new Date()) {
  const d = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function mesAnteriorA(fecha: Date) {
  return new Date(fecha.getFullYear(), fecha.getMonth() - 1, 1);
}

export async function getResumenMensual(clinicaId: string) {
  const ahora = new Date();
  const inicio = inicioMes(ahora);
  const fin = finMes(ahora);
  const inicioAnt = inicioMes(mesAnteriorA(ahora));
  const finAnt = finMes(mesAnteriorA(ahora));

  const [ingresos, ingresosAnt, consultas, clientesNuevos, pacientesAtendidos] =
    await Promise.all([
      prisma.factura.aggregate({
        where: {
          clinicaId,
          emitidaEn: { gte: inicio, lte: fin },
          estado: { notIn: ["CANCELADA", "ANULADA"] },
        },
        _sum: { total: true },
      }),
      prisma.factura.aggregate({
        where: {
          clinicaId,
          emitidaEn: { gte: inicioAnt, lte: finAnt },
          estado: { notIn: ["CANCELADA", "ANULADA"] },
        },
        _sum: { total: true },
      }),
      prisma.cita.count({
        where: { clinicaId, estado: "COMPLETADA", fechaHora: { gte: inicio, lte: fin } },
      }),
      prisma.cliente.count({
        where: { clinicaId, deletedAt: null, creadoEn: { gte: inicio, lte: fin } },
      }),
      prisma.cita.findMany({
        where: { clinicaId, estado: "COMPLETADA", fechaHora: { gte: inicio, lte: fin } },
        distinct: ["pacienteId"],
        select: { pacienteId: true },
      }),
    ]);

  return {
    mes: ahora,
    ingresosMes: ingresos._sum.total ?? 0,
    ingresosMesAnterior: ingresosAnt._sum.total ?? 0,
    consultasMes: consultas,
    clientesNuevosMes: clientesNuevos,
    mascotasAtendidasMes: pacientesAtendidos.length,
  };
}

export async function getServiciosMasUtilizados(clinicaId: string, limite = 5) {
  const inicio = inicioMes();
  const fin = finMes();

  const items = await prisma.itemFactura.groupBy({
    by: ["descripcion"],
    where: {
      factura: {
        clinicaId,
        emitidaEn: { gte: inicio, lte: fin },
        estado: { notIn: ["CANCELADA", "ANULADA"] },
      },
      producto: { categoria: "SERVICIO" },
    },
    _sum: { cantidad: true },
    orderBy: { _sum: { cantidad: "desc" } },
    take: limite,
  });

  return items.map((i) => ({ nombre: i.descripcion, cantidad: i._sum.cantidad ?? 0 }));
}

export async function getProductosMasVendidos(clinicaId: string, limite = 5) {
  const inicio = inicioMes();
  const fin = finMes();

  const items = await prisma.itemFactura.groupBy({
    by: ["descripcion"],
    where: {
      factura: {
        clinicaId,
        emitidaEn: { gte: inicio, lte: fin },
        estado: { notIn: ["CANCELADA", "ANULADA"] },
      },
      productoId: { not: null },
      producto: { categoria: { not: "SERVICIO" } },
    },
    _sum: { cantidad: true },
    orderBy: { _sum: { cantidad: "desc" } },
    take: limite,
  });

  return items.map((i) => ({ nombre: i.descripcion, cantidad: i._sum.cantidad ?? 0 }));
}

export async function getEvolucionIngresosDelMes(clinicaId: string) {
  const inicio = inicioMes();
  const fin = finMes();

  const facturas = await prisma.factura.findMany({
    where: {
      clinicaId,
      emitidaEn: { gte: inicio, lte: fin },
      estado: { notIn: ["CANCELADA", "ANULADA"] },
    },
    select: { emitidaEn: true, total: true },
  });

  const hoy = new Date();
  const esMesActual =
    hoy.getFullYear() === inicio.getFullYear() && hoy.getMonth() === inicio.getMonth();
  const ultimoDia = esMesActual ? hoy.getDate() : fin.getDate();

  const dias = Array.from({ length: ultimoDia }, (_, i) => ({ dia: i + 1, monto: 0 }));
  for (const f of facturas) {
    const entry = dias[f.emitidaEn.getDate() - 1];
    if (entry) entry.monto += f.total;
  }
  return dias;
}

export async function getDiasMasActivos(clinicaId: string, limite = 3) {
  const inicio = inicioMes();
  const fin = finMes();

  const citas = await prisma.cita.findMany({
    where: { clinicaId, fechaHora: { gte: inicio, lte: fin } },
    select: { fechaHora: true },
  });

  const conteoPorDia = new Map<number, number>();
  for (const c of citas) {
    const dia = c.fechaHora.getDate();
    conteoPorDia.set(dia, (conteoPorDia.get(dia) ?? 0) + 1);
  }

  return [...conteoPorDia.entries()]
    .map(([dia, citas]) => ({ dia, citas }))
    .sort((a, b) => b.citas - a.citas)
    .slice(0, limite);
}

export async function getControlesProximos(clinicaId: string, limite = 5) {
  const inicio = inicioHoy();
  const en15Dias = new Date(inicio);
  en15Dias.setDate(en15Dias.getDate() + 15);

  return prisma.cita.findMany({
    where: {
      clinicaId,
      tipo: "CONTROL",
      estado: { notIn: ["CANCELADA", "NO_ASISTIO"] },
      fechaHora: { gte: inicio, lte: en15Dias },
    },
    orderBy: { fechaHora: "asc" },
    take: limite,
    select: {
      id: true,
      fechaHora: true,
      paciente: {
        select: {
          nombre: true,
          cliente: { select: { nombre: true, apellido: true } },
        },
      },
    },
  });
}
