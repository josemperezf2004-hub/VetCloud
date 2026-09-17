import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";

import { cn } from "@/lib/utils";

function formatCambio(actual: number, anterior: number) {
  if (anterior === 0) {
    return actual === 0 ? null : { pct: 100, positivo: true };
  }
  const pct = Math.round(((actual - anterior) / anterior) * 100);
  if (pct === 0) return null;
  return { pct: Math.abs(pct), positivo: pct > 0 };
}

export function StatsCard({
  titulo,
  valor,
  icon: Icon,
  comparativo,
  comparativoLabel = "vs. ayer",
}: {
  titulo: string;
  valor: string;
  icon: LucideIcon;
  comparativo?: { actual: number; anterior: number };
  comparativoLabel?: string;
}) {
  const cambio = comparativo
    ? formatCambio(comparativo.actual, comparativo.anterior)
    : null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-sm text-gray-500">{titulo}</span>
        <Icon className="size-4.5 text-[#0F6E56]" strokeWidth={1.75} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold text-gray-900">
          {valor}
        </span>
        {cambio && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              cambio.positivo ? "text-[#16A34A]" : "text-[#DC2626]"
            )}
          >
            {cambio.positivo ? (
              <ArrowUp className="size-3" />
            ) : (
              <ArrowDown className="size-3" />
            )}
            {cambio.pct}%
          </span>
        )}
      </div>
      {comparativo && (
        <p className="mt-0.5 text-xs text-gray-400">{comparativoLabel}</p>
      )}
    </div>
  );
}
