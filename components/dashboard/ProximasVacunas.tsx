import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Syringe } from "lucide-react";

import type { getProximasVacunasDetalle } from "@/lib/dashboard";

export function ProximasVacunas({
  vacunas,
}: {
  vacunas: Awaited<ReturnType<typeof getProximasVacunasDetalle>>;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Vacunas próximas a vencer (15 días)
        </h2>
      </div>

      {vacunas.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          No hay vacunas próximas a vencer.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vacunas.map((vacuna) => (
            <li
              key={vacuna.id}
              className="flex items-center gap-3 rounded-lg bg-[#FFF3CC]/50 px-3 py-2 text-sm"
            >
              <Syringe className="size-4 shrink-0 text-[#D97706]" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">
                  {vacuna.paciente.nombre} — {vacuna.nombre}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {vacuna.paciente.cliente.nombre}{" "}
                  {vacuna.paciente.cliente.apellido} ·{" "}
                  {vacuna.proximaDosis &&
                    format(vacuna.proximaDosis, "d 'de' MMMM", { locale: es })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 text-right">
        <Link
          href="/pacientes"
          className="text-xs font-medium text-[#0F6E56] hover:underline"
        >
          Ver pacientes
        </Link>
      </div>
    </div>
  );
}
