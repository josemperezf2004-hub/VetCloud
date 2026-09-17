import Link from "next/link";
import { XCircle, AlertTriangle } from "lucide-react";

import type { getProductosStockBajo } from "@/lib/dashboard";

export function StockAlerts({
  productos,
}: {
  productos: Awaited<ReturnType<typeof getProductosStockBajo>>;
}) {
  const visibles = productos.slice(0, 6);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Stock crítico</h2>
        <Link
          href="/inventario"
          className="text-xs font-medium text-[#0F6E56] hover:underline"
        >
          Ver inventario
        </Link>
      </div>

      {visibles.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          Todo el inventario está en niveles saludables.
        </p>
      ) : (
        <ul className="space-y-3">
          {visibles.map((producto) => {
            const sinStock = producto.stockActual <= 0;
            return (
              <li
                key={producto.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {sinStock ? (
                    <XCircle className="size-4 shrink-0 text-[#DC2626]" />
                  ) : (
                    <AlertTriangle className="size-4 shrink-0 text-[#D97706]" />
                  )}
                  <span className="truncate font-medium text-gray-900">
                    {producto.nombre}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-xs text-gray-500">
                  {producto.stockActual} / {producto.stockMinimo}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {productos.length > visibles.length && (
        <p className="mt-3 text-center text-xs text-gray-400">
          +{productos.length - visibles.length} productos más con stock bajo
        </p>
      )}
    </div>
  );
}
