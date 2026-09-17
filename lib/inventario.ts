import { prisma } from "@/lib/prisma";
import type { ProductoInput, MovimientoInput } from "@/lib/validations";

const PAGE_SIZE = 20;

export async function listarProductos(
  clinicaId: string,
  { q, categoria, page }: { q?: string; categoria?: string; page?: number }
) {
  const paginaActual = Math.max(1, page ?? 1);

  const where = {
    clinicaId,
    deletedAt: null,
    ...(categoria &&
      categoria !== "TODOS" && {
        categoria: categoria as ProductoInput["categoria"],
      }),
    ...(q && {
      OR: [
        { nombre: { contains: q, mode: "insensitive" as const } },
        { sku: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      orderBy: { nombre: "asc" },
      skip: (paginaActual - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.producto.count({ where }),
  ]);

  return {
    productos,
    total,
    page: paginaActual,
    pageSize: PAGE_SIZE,
  };
}

// Usa el mismo criterio que `getProductosStockBajo` en lib/dashboard.ts
// (stockActual <= stockMinimo, lo que incluye a los que están en 0) para que
// el número de esta card coincida con la alerta que ya se muestra en el
// dashboard desde la Fase 2. "Sin stock" es un subconjunto de ese mismo grupo,
// mostrado aparte porque es la urgencia máxima.
export async function getResumenInventario(clinicaId: string) {
  const productos = await prisma.producto.findMany({
    where: { clinicaId, activo: true, deletedAt: null },
    select: { stockActual: true, stockMinimo: true, precioCosto: true, precioVenta: true },
  });

  const sinStock = productos.filter((p) => p.stockActual <= 0).length;
  const stockBajo = productos.filter((p) => p.stockActual <= p.stockMinimo).length;
  // El valor de un producto en stock se calcula a costo cuando se conoce
  // (precioCosto), y a precio de venta como respaldo si nunca se registró un
  // costo — es una aproximación razonable para el MVP, no un dato contable.
  const valorTotal = productos.reduce(
    (acc, p) => acc + p.stockActual * (p.precioCosto ?? p.precioVenta),
    0
  );

  return { total: productos.length, stockBajo, sinStock, valorTotal };
}

// Crea el producto y, si trae stock inicial, un movimiento ENTRADA asociado
// en la misma transacción — así toda unidad de stock que exista siempre tiene
// un movimiento que la explique, sin excepción para la carga inicial.
export async function crearProducto(clinicaId: string, data: ProductoInput) {
  const stockInicial = data.stockInicial ?? 0;

  return prisma.$transaction(async (tx) => {
    const producto = await tx.producto.create({
      data: {
        clinicaId,
        nombre: data.nombre,
        sku: data.sku || null,
        categoria: data.categoria,
        descripcion: data.descripcion || null,
        unidad: data.unidad,
        precioVenta: data.precioVenta,
        precioCosto: data.precioCosto ?? null,
        stockActual: stockInicial,
        stockMinimo: data.stockMinimo,
      },
    });

    if (stockInicial > 0) {
      await tx.movimientoInventario.create({
        data: {
          productoId: producto.id,
          tipo: "ENTRADA",
          cantidad: stockInicial,
          stockAntes: 0,
          stockDespues: stockInicial,
          motivo: "Stock inicial",
        },
      });
    }

    return producto;
  });
}

// Movimiento manual (entrada/salida) desde el módulo de Inventario. Los
// movimientos automáticos por prescripción (SALIDA) ya se generan desde
// lib/historia-clinica.ts::crearConsulta con su propia lógica de transacción.
export async function registrarMovimiento(clinicaId: string, data: MovimientoInput) {
  return prisma.$transaction(async (tx) => {
    const producto = await tx.producto.findFirst({
      where: { id: data.productoId, clinicaId, deletedAt: null },
    });
    if (!producto) {
      throw new Error("Producto no encontrado");
    }

    const delta = data.tipo === "SALIDA" ? -data.cantidad : data.cantidad;
    const stockDespues = producto.stockActual + delta;
    if (stockDespues < 0) {
      throw new Error(
        `Stock insuficiente (disponible: ${producto.stockActual} ${producto.unidad})`
      );
    }

    const movimiento = await tx.movimientoInventario.create({
      data: {
        productoId: producto.id,
        tipo: data.tipo,
        cantidad: data.cantidad,
        stockAntes: producto.stockActual,
        stockDespues,
        motivo: data.motivo || null,
        lote: data.lote || null,
        vencimiento: data.vencimiento ? new Date(data.vencimiento) : null,
      },
    });

    await tx.producto.update({
      where: { id: producto.id },
      data: {
        stockActual: stockDespues,
        // MovimientoInventario no tiene columna propia de costo — si se
        // informa un costo al registrar una entrada, se guarda como el nuevo
        // costo de referencia del producto (costo de la última compra).
        ...(data.tipo === "ENTRADA" && data.costo !== undefined
          ? { precioCosto: data.costo }
          : {}),
      },
    });

    return movimiento;
  });
}
