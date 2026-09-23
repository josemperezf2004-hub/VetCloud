import Link from "next/link";

import { cn } from "@/lib/utils";

// El plan original pedía exactamente 5 pestañas (no las 7 categorías del
// enum original) — ALIMENTO, ACCESORIO y OTRO siguen existiendo como
// categoría de producto y son seleccionables en el formulario, sólo no
// tienen pestaña propia; quedan visibles dentro de "Todos". EQUIPO se agregó
// después (pedido explícito del usuario, 2026-09-23) y sí tiene pestaña
// propia porque es un tipo de inventario con dinámica distinta (no se
// consume/vende como medicamentos o insumos).
const TABS = [
  { value: "TODOS", label: "Todos" },
  { value: "MEDICAMENTO", label: "Medicamentos" },
  { value: "VACUNA", label: "Vacunas" },
  { value: "INSUMO", label: "Insumos" },
  { value: "EQUIPO", label: "Equipos" },
  { value: "SERVICIO", label: "Servicios" },
] as const;

export function CategoriaTabs({ activa, q }: { activa: string; q?: string }) {
  function href(categoria: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoria !== "TODOS") params.set("categoria", categoria);
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  }

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-gray-100">
      {TABS.map((tab) => (
        <Link
          key={tab.value}
          href={href(tab.value)}
          className={cn(
            "shrink-0 border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
            activa === tab.value
              ? "border-[#0F6E56] text-[#0F6E56]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
