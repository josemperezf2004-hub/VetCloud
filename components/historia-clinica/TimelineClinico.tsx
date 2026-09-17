"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronDown, ChevronUp, Stethoscope } from "lucide-react";

import type { PrescripcionItemInput } from "@/lib/validations";

type HistoriaItem = {
  id: string;
  creadoEn: Date;
  motivoConsulta: string;
  diagnostico: string;
  examenFisico: string | null;
  plan: string | null;
  peso: number | null;
  temperatura: number | null;
  prescripciones: unknown;
  veterinario: { nombre: string };
};

// HistoriaClinica no tiene un campo "tipo" en el schema (a diferencia de Cita) —
// el plan original pedía un ícono distinto por tipo de consulta, pero no hay
// dato real que distinguirlas. Se usa un ícono único para todas las entradas.
export function TimelineClinico({ historias }: { historias: HistoriaItem[] }) {
  const [expandido, setExpandido] = useState<string | null>(null);

  if (historias.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-gray-400">
        Aún no hay historia clínica registrada. Se crea desde el botón
        &quot;Nueva consulta&quot; arriba.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {historias.map((h) => {
        const abierto = expandido === h.id;
        const prescripciones = (h.prescripciones as PrescripcionItemInput[] | null) ?? [];

        return (
          <li key={h.id} className="rounded-lg border border-gray-100">
            <button
              type="button"
              onClick={() => setExpandido(abierto ? null : h.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[#0F6E56]">
                  <Stethoscope className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">
                    {format(h.creadoEn, "d MMM yyyy", { locale: es })} · Dr(a).{" "}
                    {h.veterinario.nombre}
                  </p>
                  <p className="text-sm font-medium text-gray-900">{h.diagnostico}</p>
                </div>
              </div>
              {abierto ? (
                <ChevronUp className="size-4 shrink-0 text-gray-400" />
              ) : (
                <ChevronDown className="size-4 shrink-0 text-gray-400" />
              )}
            </button>

            {abierto && (
              <div className="space-y-3 border-t border-gray-100 px-4 py-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-gray-500">Motivo de consulta</p>
                  <p className="text-gray-900">{h.motivoConsulta}</p>
                </div>
                {h.examenFisico && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Examen físico</p>
                    <p className="text-gray-900">{h.examenFisico}</p>
                  </div>
                )}
                {h.plan && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Plan</p>
                    <p className="text-gray-900">{h.plan}</p>
                  </div>
                )}
                {(h.peso || h.temperatura) && (
                  <p className="text-xs text-gray-500">
                    {h.peso ? `Peso: ${h.peso} kg` : ""}
                    {h.peso && h.temperatura ? " · " : ""}
                    {h.temperatura ? `Temp: ${h.temperatura} °C` : ""}
                  </p>
                )}
                {prescripciones.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Prescripciones: {prescripciones.map((p) => p.productoNombre).join(", ")}
                  </p>
                )}
                <Link
                  href={`/historia-clinica/${h.id}`}
                  className="inline-block text-xs font-medium text-[#0F6E56] hover:underline"
                >
                  Ver consulta completa / imprimir
                </Link>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
