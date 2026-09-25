import { getServerSession } from "next-auth";
import {
  CalendarCheck,
  DollarSign,
  HeartPulse,
  PackageX,
  Syringe,
  UserPlus,
  Stethoscope,
  PawPrint,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import {
  getEstadisticasHoy,
  getCitasHoy,
  getProductosStockBajo,
  getProximasVacunasDetalle,
} from "@/lib/dashboard";
import {
  getResumenMensual,
  getServiciosMasUtilizados,
  getProductosMasVendidos,
  getEvolucionIngresosDelMes,
  getDiasMasActivos,
  getControlesProximos,
} from "@/lib/analisis";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CitasHoy } from "@/components/dashboard/CitasHoy";
import { StockAlerts } from "@/components/dashboard/StockAlerts";
import { ProximasVacunas } from "@/components/dashboard/ProximasVacunas";
import { EvolucionIngresos } from "@/components/dashboard/EvolucionIngresos";
import { RankingLista } from "@/components/dashboard/RankingLista";
import { ControlesProximos } from "@/components/dashboard/ControlesProximos";

const formatoMoneda = new Intl.NumberFormat("es", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const clinicaId = session!.user.clinicaId;
  const nombre = session?.user?.name?.split(" ")[0] ?? "";

  const [
    stats,
    citas,
    stockBajo,
    vacunas,
    resumenMes,
    servicios,
    productos,
    evolucion,
    diasActivos,
    controles,
  ] = await Promise.all([
    getEstadisticasHoy(clinicaId),
    getCitasHoy(clinicaId),
    getProductosStockBajo(clinicaId),
    getProximasVacunasDetalle(clinicaId),
    getResumenMensual(clinicaId),
    getServiciosMasUtilizados(clinicaId),
    getProductosMasVendidos(clinicaId),
    getEvolucionIngresosDelMes(clinicaId),
    getDiasMasActivos(clinicaId),
    getControlesProximos(clinicaId),
  ]);

  const hoy = new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const nombreMes = new Intl.DateTimeFormat("es", {
    month: "long",
    year: "numeric",
  }).format(resumenMes.mes);

  const diasActivosParaLista = diasActivos.map((d) => ({
    nombre: `Día ${d.dia}`,
    cantidad: d.citas,
  }));

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          Buenos días{nombre ? `, ${nombre}` : ""}
        </h1>
        <p className="text-sm capitalize text-gray-500">{hoy}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          titulo="Ingresos hoy"
          valor={`$${formatoMoneda.format(stats.ventasHoy)}`}
          icon={DollarSign}
        />
        <StatsCard
          titulo="Citas hoy"
          valor={`${stats.citasCompletadas}/${stats.citasHoy}`}
          icon={CalendarCheck}
        />
        <StatsCard
          titulo="Pacientes atendidos"
          valor={String(stats.pacientesAtendidos)}
          icon={HeartPulse}
        />
        <StatsCard
          titulo="Clientes nuevos"
          valor={String(stats.clientesNuevosHoy)}
          icon={UserPlus}
        />
        <StatsCard
          titulo="Stock bajo"
          valor={String(stats.productosStockBajo)}
          icon={PackageX}
        />
        <StatsCard
          titulo="Próximas vacunas"
          valor={String(stats.proximasVacunas)}
          icon={Syringe}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CitasHoy citas={citas} />
        </div>
        <div className="lg:col-span-2">
          <StockAlerts productos={stockBajo} />
        </div>
      </div>

      <ProximasVacunas vacunas={vacunas} />

      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            Análisis mensual — {nombreMes}
          </h2>
          <p className="text-sm text-gray-500">
            Cómo va el negocio este mes, con comparación contra el mes anterior.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            titulo="Ingresos del mes"
            valor={`$${formatoMoneda.format(resumenMes.ingresosMes)}`}
            icon={DollarSign}
            comparativo={{
              actual: resumenMes.ingresosMes,
              anterior: resumenMes.ingresosMesAnterior,
            }}
            comparativoLabel="vs. mes anterior"
          />
          <StatsCard
            titulo="Consultas del mes"
            valor={String(resumenMes.consultasMes)}
            icon={Stethoscope}
          />
          <StatsCard
            titulo="Clientes nuevos del mes"
            valor={String(resumenMes.clientesNuevosMes)}
            icon={UserPlus}
          />
          <StatsCard
            titulo="Mascotas atendidas"
            valor={String(resumenMes.mascotasAtendidasMes)}
            icon={PawPrint}
          />
        </div>

        <EvolucionIngresos dias={evolucion} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RankingLista
            titulo="Servicios más utilizados"
            items={servicios}
            emptyMessage="Aún no hay servicios cobrados este mes."
          />
          <RankingLista
            titulo="Productos más vendidos"
            items={productos}
            emptyMessage="Aún no hay productos cobrados este mes."
            sufijo=" u."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RankingLista
            titulo="Días con mayor actividad"
            items={diasActivosParaLista}
            emptyMessage="Aún no hay citas registradas este mes."
            sufijo=" citas"
          />
          <ControlesProximos controles={controles} />
        </div>

        <p className="text-xs text-gray-400">
          Productos próximos a vencer todavía no se muestran aquí: requiere
          rastrear el vencimiento por lote (FEFO), que es una mejora pendiente
          del módulo de Inventario (Fase 7).
        </p>
      </div>
    </div>
  );
}
