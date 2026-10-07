import { prisma } from "@/lib/prisma";
import { inicioHoy, finHoy } from "@/lib/dashboard";
import type { FacturaInput } from "@/lib/validations";

const PAGE_SIZE = 20;

const FACTURA_LIST_SELECT = {
  id: true,
  numero: true,
  estado: true,
  metodoPago: true,
  total: true,
  emitidaEn: true,
  cliente: { select: { id: true, nombre: true, apellido: true } },
} as const;

export async function listarFacturas(
  clinicaId: string,
  {
    estado,
    clienteId,
    fecha,
    page,
  }: { estado?: string; clienteId?: string; fecha?: string; page?: number }
) {
  const paginaActual = Math.max(1, page ?? 1);

  let rangoFecha: { gte: Date; lte: Date } | undefined;
  if (fecha) {
    const inicio = new Date(`${fecha}T00:00:00`);
    const fin = new Date(`${fecha}T23:59:59.999`);
    rangoFecha = { gte: inicio, lte: fin };
  }

  const where = {
    clinicaId,
    ...(estado &&
      estado !== "TODOS" && {
        estado: estado as "PENDIENTE" | "PAGADA" | "CANCELADA" | "ANULADA",
      }),
    ...(clienteId && { clienteId }),
    ...(rangoFecha && { emitidaEn: rangoFecha }),
  };

  const [facturas, total] = await Promise.all([
    prisma.factura.findMany({
      where,
      orderBy: { emitidaEn: "desc" },
      skip: (paginaActual - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: FACTURA_LIST_SELECT,
    }),
    prisma.factura.count({ where }),
  ]);

  return { facturas, total, page: paginaActual, pageSize: PAGE_SIZE };
}

export async function getFacturaDetalle(clinicaId: string, id: string) {
  return prisma.factura.findFirst({
    where: { id, clinicaId },
    include: {
      clinica: true,
      cliente: true,
      items: true,
    },
  });
}

export async function getEstadisticasFacturacion(clinicaId: string) {
  const inicio = inicioHoy();
  const fin = finHoy();
  const inicioMes = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
  const finMes = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0, 23, 59, 59, 999);

  const [ventasHoy, pendientes, pagadasMes] = await Promise.all([
    prisma.factura.aggregate({
      where: {
        clinicaId,
        emitidaEn: { gte: inicio, lte: fin },
        estado: { notIn: ["CANCELADA", "ANULADA"] },
      },
      _sum: { total: true },
    }),
    prisma.factura.aggregate({
      where: { clinicaId, estado: "PENDIENTE" },
      _sum: { total: true },
      _count: true,
    }),
    prisma.factura.aggregate({
      where: { clinicaId, estado: "PAGADA", pagadaEn: { gte: inicioMes, lte: finMes } },
      _sum: { total: true },
    }),
  ]);

  return {
    ventasHoy: ventasHoy._sum.total ?? 0,
    pendientesTotal: pendientes._sum.total ?? 0,
    pendientesCount: pendientes._count,
    pagadasMes: pagadasMes._sum.total ?? 0,
  };
}

// Arma el borrador de items a partir de las prescripciones de una consulta ya
// guardada (Fase 6). Un item "aplicado en clínica" ya descontó inventario en
// ese momento, así que aquí solo se lee, nunca se vuelve a tocar stock. Un
// item "para comprar" todavía no descontó nada — se marca `pendienteDescuento`
// para que crearFactura lo descuente recién si el usuario de verdad lo factura
// (y lo deja descontar en 0 si el empleado quita la línea porque el cliente no
// lo compró). El precio se toma del precio de venta *actual* del producto (no
// se guardó un precio histórico en la prescripción), por eso el resultado es
// un borrador editable, no una factura ya creada: el usuario confirma/ajusta
// antes de guardar.
export async function getBorradorDesdeConsulta(clinicaId: string, historiaId: string) {
  const historia = await prisma.historiaClinica.findFirst({
    where: { id: historiaId, clinicaId },
    include: {
      paciente: {
        select: {
          nombre: true,
          cliente: { select: { id: true, nombre: true, apellido: true } },
        },
      },
    },
  });
  if (!historia) return null;

  const prescripciones =
    (historia.prescripciones as
      | {
          productoId: string;
          productoNombre: string;
          cantidad: number;
          aplicadoEnClinica?: boolean;
        }[]
      | null) ?? [];

  const productos = await prisma.producto.findMany({
    where: { id: { in: prescripciones.map((p) => p.productoId) } },
    select: { id: true, precioVenta: true },
  });
  const precioPorId = new Map(productos.map((p) => [p.id, p.precioVenta]));

  return {
    clienteId: historia.paciente.cliente.id,
    clienteLabel: `${historia.paciente.cliente.nombre} ${historia.paciente.cliente.apellido}`,
    items: prescripciones.map((p) => ({
      productoId: p.productoId,
      descripcion: `${p.productoNombre} (${historia.paciente.nombre})`,
      cantidad: p.cantidad,
      precioUnit: precioPorId.get(p.productoId) ?? 0,
      // Registros viejos (antes de este cambio) no tienen el campo — se
      // asumen "aplicado en clínica" porque ya se descontaron en su momento.
      pendienteDescuento: !(p.aplicadoEnClinica ?? true),
    })),
  };
}

export async function crearFactura(clinicaId: string, data: FacturaInput) {
  return prisma.$transaction(async (tx) => {
    // No hay tabla de contador dedicada — se numera contando todas las
    // facturas ya emitidas por la clínica (incluidas canceladas/anuladas,
    // para no reciclar números). Con un solo dev y bajo volumen esto alcanza;
    // si hubiera creación concurrente real el número podría colisionar, se
    // documenta el riesgo en vez de construir un contador atómico dedicado.
    const totalExistentes = await tx.factura.count({ where: { clinicaId } });
    const numero = `F-${new Date().getFullYear()}-${String(totalExistentes + 1).padStart(6, "0")}`;

    // Los items con productoId no confían en el precio que manda el cliente:
    // se valida que el producto sea de esta clínica y se recalcula precioUnit
    // desde Producto.precioVenta, igual que hace el borrador de facturación
    // (generarBorradorDesdeHistoria) al armar la factura. Los items sin
    // productoId (servicios libres) no tienen un precio de referencia en el
    // servidor, así que ahí sí se usa el precioUnit que manda el formulario.
    const productoIds = [...new Set(data.items.map((i) => i.productoId).filter((id): id is string => !!id))];
    const productos = productoIds.length
      ? await tx.producto.findMany({
          where: { id: { in: productoIds }, clinicaId },
          select: { id: true, precioVenta: true },
        })
      : [];
    const precioPorId = new Map(productos.map((p) => [p.id, p.precioVenta]));
    for (const id of productoIds) {
      if (!precioPorId.has(id)) {
        throw new Error("Uno de los productos del recibo no existe en esta clínica");
      }
    }

    const items = data.items.map((item) => ({
      productoId: item.productoId || null,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precioUnit: item.productoId ? precioPorId.get(item.productoId)! : item.precioUnit,
      pendienteDescuento: !!item.pendienteDescuento,
    }));

    const subtotal = items.reduce((acc, item) => acc + item.cantidad * item.precioUnit, 0);
    const total = Math.max(0, subtotal - data.descuento);

    const factura = await tx.factura.create({
      data: {
        clinicaId,
        clienteId: data.clienteId,
        numero,
        subtotal,
        descuento: data.descuento,
        total,
        notas: data.notas || null,
        items: {
          create: items.map((item) => ({
            productoId: item.productoId,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precioUnit: item.precioUnit,
            subtotal: item.cantidad * item.precioUnit,
          })),
        },
      },
      include: { items: true, cliente: { select: { nombre: true, apellido: true } } },
    });

    // Descuenta stock recién ahora para los items que venían "para comprar"
    // de una consulta (ver getBorradorDesdeConsulta) y todavía no habían
    // tocado inventario — si el cliente no los compró, el empleado ya los
    // sacó del borrador antes de llegar aquí, así que nunca entran a este
    // loop. Mismo criterio de "todo o nada" que crearConsulta: si falta stock,
    // se revierte también la factura recién creada.
    for (const item of items) {
      if (!item.pendienteDescuento || !item.productoId) continue;

      const producto = await tx.producto.findFirst({
        where: { id: item.productoId, clinicaId, deletedAt: null },
      });
      if (!producto) {
        throw new Error("Uno de los productos del recibo no existe en esta clínica");
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
          motivo: "Venta en factura",
          referenciaId: factura.id,
          referenciaType: "Factura",
        },
      });
    }

    return factura;
  });
}
