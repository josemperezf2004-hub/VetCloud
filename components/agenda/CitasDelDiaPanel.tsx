import { format } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ESTADO_LABELS, ESTADO_STYLES } from "@/components/agenda/CitaCard";
import type { getCitasHoy } from "@/lib/dashboard";

export function CitasDelDiaPanel({
  citas,
}: {
  citas: Awaited<ReturnType<typeof getCitasHoy>>;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-gray-900 capitalize">
        Hoy · {format(new Date(), "d MMM", { locale: es })}
      </h2>

      {citas.length === 0 ? (
        <p className="py-4 text-center text-xs text-gray-400">
          Sin citas para hoy.
        </p>
      ) : (
        <ul className="space-y-3">
          {citas.map((cita) => (
            <li key={cita.id} className="text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-gray-500">
                  {format(cita.fechaHora, "HH:mm")}
                </span>
                <Badge className={cn("shrink-0 text-[10px]", ESTADO_STYLES[cita.estado])}>
                  {ESTADO_LABELS[cita.estado] ?? cita.estado}
                </Badge>
              </div>
              <p className="truncate font-medium text-gray-900">
                {cita.paciente.nombre}
              </p>
              <p className="truncate text-xs text-gray-500">
                {cita.paciente.cliente.nombre} {cita.paciente.cliente.apellido} · Dr(a).{" "}
                {cita.veterinario.nombre}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
