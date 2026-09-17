import { getServerSession } from "next-auth";
import { Package, AlertTriangle, XCircle, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { listarProductos, getResumenInventario } from "@/lib/inventario";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { BuscadorProductos } from "@/components/inventario/BuscadorProductos";
import { CategoriaTabs } from "@/components/inventario/CategoriaTabs";
import { ProductoTable } from "@/components/inventario/ProductoTable";
import { NuevoProductoDialog } from "@/components/inventario/NuevoProductoDialog";
import { RegistrarEntradaDialog } from "@/components/inventario/RegistrarEntradaDialog";
import { Button } from "@/components/ui/button";

const formatoMoneda = new Intl.NumberFormat("es", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { q, categoria, page } = await searchParams;
  const categoriaActiva = categoria ?? "TODOS";

  const [data, resumen] = await Promise.all([
    listarProductos(session!.user.clinicaId, {
      q,
      categoria: categoriaActiva,
      page: page ? Number(page) : 1,
    }),
    getResumenInventario(session!.user.clinicaId),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(data.total / data.pageSize));

  function hrefConPagina(pagina: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoriaActiva !== "TODOS") params.set("categoria", categoriaActiva);
    params.set("page", String(pagina));
    return `?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Inventario</h1>
        <div className="flex flex-wrap items-center gap-3">
          <BuscadorProductos defaultValue={q ?? ""} />
          <RegistrarEntradaDialog />
          <NuevoProductoDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard titulo="Total productos" valor={String(resumen.total)} icon={Package} />
        <StatsCard titulo="En stock bajo" valor={String(resumen.stockBajo)} icon={AlertTriangle} />
        <StatsCard titulo="Sin stock" valor={String(resumen.sinStock)} icon={XCircle} />
        <StatsCard
          titulo="Valor total inventario"
          valor={`$${formatoMoneda.format(resumen.valorTotal)}`}
          icon={DollarSign}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="px-4 pt-2">
          <CategoriaTabs activa={categoriaActiva} q={q} />
        </div>

        <ProductoTable productos={data.productos} filtrado={Boolean(q) || categoriaActiva !== "TODOS"} />

        {data.total > data.pageSize && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500">
              Página {data.page} de {totalPaginas} · {data.total} productos
            </p>
            <div className="flex gap-2">
              {data.page > 1 ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={hrefConPagina(data.page - 1)}>
                    <ChevronLeft className="size-4" />
                    Anterior
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="size-4" />
                  Anterior
                </Button>
              )}
              {data.page < totalPaginas ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={hrefConPagina(data.page + 1)}>
                    Siguiente
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Siguiente
                  <ChevronRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
