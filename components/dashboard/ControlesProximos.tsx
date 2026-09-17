import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ClipboardCheck } from "lucide-react";

import type { getControlesProximos } from "@/lib/analisis";

export function ControlesProximos({
  controles,
}: {
  controles: Awaited<ReturnType<typeof getControlesProximos>>;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">
        Controles próximos (15 días)
      </h2>

      {controles.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          No hay controles agendados. Esta lista se llena cuando la Agenda
          (Fase 5) permita crear citas tipo &quot;Control&quot;.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {controles.map((c) => (
            <li key={c.id} className="flex items-center gap-3 text-sm">
              <ClipboardCheck className="size-4 shrink-0 text-[#185FA5]" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">
                  {c.paciente.nombre}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {c.paciente.cliente.nombre} {c.paciente.cliente.apellido} ·{" "}
                  {format(c.fechaHora, "d 'de' MMMM, HH:mm", { locale: es })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
