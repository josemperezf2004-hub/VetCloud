import Link from "next/link";
import { getServerSession } from "next-auth";
import { DollarSign, Clock, CheckCircle2, Plus, ChevronLeft, ChevronRight } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listarFacturas, getEstadisticasFacturacion } from "@/lib/facturas";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FiltrosFacturas } from "@/components/facturacion/FiltrosFacturas";
import { FacturaTable } from "@/components/facturacion/FacturaTable";
import { Button } from "@/components/ui/button";

const formatoMoneda = new Intl.NumberFormat("es", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default async function FacturacionPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; fecha?: string; clienteId?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { estado, fecha, clienteId, page } = await searchParams;
  const estadoActivo = estado ?? "TODOS";

  const [data, stats, clienteFiltro] = await Promise.all([
    listarFacturas(session!.user.clinicaId, {
      estado: estadoActivo,
      clienteId,
      fecha,
      page: page ? Number(page) : 1,
    }),
    getEstadisticasFacturacion(session!.user.clinicaId),
    clienteId
      ? prisma.cliente.findFirst({
          where: { id: clienteId, clinicaId: session!.user.clinicaId },
          select: { nombre: true, apellido: true },
        })
      : null,
  ]);

  const totalPaginas = Math.max(1, Math.ceil(data.total / data.pageSize));

  function hrefConPagina(pagina: number) {
    const params = new URLSearchParams();
    if (estadoActivo !== "TODOS") params.set("estado", estadoActivo);
    if (fecha) params.set("fecha", fecha);
    if (clienteId) params.set("clienteId", clienteId);
    params.set("page", String(pagina));
    return `?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Facturación</h1>
        <Button asChild className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white">
          <Link href="/facturacion/nueva">
            <Plus className="size-4" />
            Nueva factura
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          titulo="Ventas hoy"
          valor={`$${formatoMoneda.format(stats.ventasHoy)}`}
          icon={DollarSign}
        />
        <StatsCard
          titulo="Pendientes de cobro"
          valor={`$${formatoMoneda.format(stats.pendientesTotal)} (${stats.pendientesCount})`}
          icon={Clock}
        />
        <StatsCard
          titulo="Pagadas este mes"
          valor={`$${formatoMoneda.format(stats.pagadasMes)}`}
          icon={CheckCircle2}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4">
          <FiltrosFacturas
            estado={estadoActivo}
            fecha={fecha}
            clienteId={clienteId}
            clienteLabel={
              clienteFiltro ? `${clienteFiltro.nombre} ${clienteFiltro.apellido}` : undefined
            }
          />
        </div>

        <FacturaTable
          facturas={data.facturas}
          filtrado={estadoActivo !== "TODOS" || Boolean(fecha) || Boolean(clienteId)}
        />

        {data.total > data.pageSize && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500">
              Página {data.page} de {totalPaginas} · {data.total} facturas
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
