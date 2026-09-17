import Link from "next/link";
import { getServerSession } from "next-auth";
import { addWeeks, format, startOfWeek, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { listarCitasPorRango, listarVeterinarios } from "@/lib/citas";
import { getCitasHoy } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { CalendarioSemanal } from "@/components/agenda/CalendarioSemanal";
import { NuevaCitaModal } from "@/components/agenda/NuevaCitaModal";
import { CitasDelDiaPanel } from "@/components/agenda/CitasDelDiaPanel";
import { MiniCalendarioMensual } from "@/components/agenda/MiniCalendarioMensual";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { semana } = await searchParams;

  const fechaReferencia = semana ? new Date(`${semana}T00:00:00`) : new Date();
  const inicioSemana = startOfWeek(
    isNaN(fechaReferencia.getTime()) ? new Date() : fechaReferencia,
    { weekStartsOn: 1 }
  );
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(finSemana.getDate() + 6);
  finSemana.setHours(23, 59, 59, 999);

  const [citas, veterinarios, citasHoy] = await Promise.all([
    listarCitasPorRango(session!.user.clinicaId, { desde: inicioSemana, hasta: finSemana }),
    listarVeterinarios(session!.user.clinicaId),
    getCitasHoy(session!.user.clinicaId, 50),
  ]);

  const finSemanaLabel = new Date(inicioSemana);
  finSemanaLabel.setDate(finSemanaLabel.getDate() + 6);
  const semanaAnteriorHref = `?semana=${format(subWeeks(inicioSemana, 1), "yyyy-MM-dd")}`;
  const semanaSiguienteHref = `?semana=${format(addWeeks(inicioSemana, 1), "yyyy-MM-dd")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Agenda</h1>
          <p className="text-sm text-gray-500 capitalize">
            {format(inicioSemana, "d 'de' MMMM", { locale: es })} –{" "}
            {format(finSemanaLabel, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={semanaAnteriorHref} aria-label="Semana anterior">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="?">Hoy</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={semanaSiguienteHref} aria-label="Semana siguiente">
              <ChevronRight className="size-4" />
            </Link>
          </Button>
          <NuevaCitaModal veterinarios={veterinarios} trigger />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <MiniCalendarioMensual mesReferencia={inicioSemana} />
          <CitasDelDiaPanel citas={citasHoy} />
        </div>
        <CalendarioSemanal citas={citas} veterinarios={veterinarios} semanaInicio={inicioSemana} />
      </div>
    </div>
  );
}
