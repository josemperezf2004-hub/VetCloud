import Link from "next/link";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { getCitasHoy } from "@/lib/dashboard";

const ESTADO_STYLES: Record<string, string> = {
  AGENDADA: "bg-[#185FA5]/10 text-[#185FA5]",
  CONFIRMADA: "bg-[#1D9E75]/10 text-[#1D9E75]",
  EN_ESPERA: "bg-[#D97706]/10 text-[#D97706]",
  EN_CONSULTA: "bg-[#534AB7]/10 text-[#534AB7]",
  COMPLETADA: "bg-[#16A34A]/10 text-[#16A34A]",
  CANCELADA: "bg-[#DC2626]/10 text-[#DC2626]",
  NO_ASISTIO: "bg-gray-200 text-gray-600",
};

const ESTADO_LABELS: Record<string, string> = {
  AGENDADA: "Agendada",
  CONFIRMADA: "Confirmada",
  EN_ESPERA: "En espera",
  EN_CONSULTA: "En consulta",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No asistió",
};

export function CitasHoy({
  citas,
}: {
  citas: Awaited<ReturnType<typeof getCitasHoy>>;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Citas de hoy</h2>
        <Link
          href="/agenda"
          className="text-xs font-medium text-[#0F6E56] hover:underline"
        >
          Ver todas
        </Link>
      </div>

      {citas.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          No hay citas agendadas para hoy.
        </p>
      ) : (
        <ul className="space-y-3">
          {citas.map((cita) => (
            <li
              key={cita.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="w-14 shrink-0 font-mono text-gray-500">
                {format(cita.fechaHora, "HH:mm")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">
                  {cita.paciente.nombre}{" "}
                  <span className="font-normal text-gray-400">
                    ({cita.paciente.especie.toLowerCase()})
                  </span>
                </p>
                <p className="truncate text-xs text-gray-500">
                  {cita.paciente.cliente.nombre}{" "}
                  {cita.paciente.cliente.apellido} · Dr(a).{" "}
                  {cita.veterinario.nombre}
                </p>
              </div>
              <Badge
                className={cn("shrink-0", ESTADO_STYLES[cita.estado])}
              >
                {ESTADO_LABELS[cita.estado] ?? cita.estado}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
