import Link from "next/link";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";

const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];

export function MiniCalendarioMensual({ mesReferencia }: { mesReferencia: Date }) {
  const inicioMes = startOfMonth(mesReferencia);
  const finMes = endOfMonth(mesReferencia);
  const inicioGrid = startOfWeek(inicioMes, { weekStartsOn: 1 });
  const finGrid = endOfWeek(finMes, { weekStartsOn: 1 });
  const dias = eachDayOfInterval({ start: inicioGrid, end: finGrid });

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="mb-3 text-center text-sm font-semibold text-gray-900 capitalize">
        {format(mesReferencia, "MMMM yyyy", { locale: es })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-gray-400">
        {DIAS_SEMANA.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dias.map((dia) => (
          <Link
            key={dia.toISOString()}
            href={`?semana=${format(startOfWeek(dia, { weekStartsOn: 1 }), "yyyy-MM-dd")}`}
            className={cn(
              "flex h-7 items-center justify-center rounded-md text-xs transition-colors hover:bg-gray-100",
              !isSameMonth(dia, mesReferencia) && "text-gray-300",
              isSameMonth(dia, mesReferencia) && "text-gray-700",
              isToday(dia) && "bg-[#0F6E56] font-semibold text-white hover:bg-[#1D9E75]"
            )}
          >
            {format(dia, "d")}
          </Link>
        ))}
      </div>
    </div>
  );
}
