"use client";

import { useState } from "react";

const formatoMoneda = new Intl.NumberFormat("es", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function EvolucionIngresos({
  dias,
}: {
  dias: { dia: number; monto: number }[];
}) {
  const [activo, setActivo] = useState<number | null>(null);
  const max = Math.max(1, ...dias.map((d) => d.monto));
  const totalMes = dias.reduce((acc, d) => acc + d.monto, 0);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">
        Evolución de ingresos este mes
      </h2>

      {totalMes === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">
          Aún no hay movimientos de caja este mes.
        </p>
      ) : (
        <div className="relative">
          <div className="flex h-40 items-stretch gap-[2px]">
            {dias.map((d, i) => (
              <div
                key={d.dia}
                className="group relative flex h-40 flex-1 flex-col justify-end"
                onMouseEnter={() => setActivo(i)}
                onMouseLeave={() => setActivo(null)}
                onClick={() => setActivo(activo === i ? null : i)}
              >
                {activo === i && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-md">
                    Día {d.dia}: ${formatoMoneda.format(d.monto)}
                  </div>
                )}
                <div
                  className="mx-auto w-full max-w-3 rounded-t-[4px] bg-[#1D9E75]"
                  style={{
                    height: `${Math.max(d.monto > 0 ? 3 : 0, (d.monto / max) * 100)}%`,
                    opacity: activo === null || activo === i ? 1 : 0.35,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between border-t border-gray-100 pt-1 text-[11px] text-gray-400">
            <span>Día 1</span>
            <span>Día {dias.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
