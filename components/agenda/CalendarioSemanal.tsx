"use client";

import { useState } from "react";
import { addDays, format, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { CitaCard, type CitaAgendaItem } from "@/components/agenda/CitaCard";
import { NuevaCitaModal } from "@/components/agenda/NuevaCitaModal";
import { CitaDetalleDialog } from "@/components/agenda/CitaDetalleDialog";

const HORA_INICIO = 8;
const HORA_FIN = 20;
const SLOTS_POR_HORA = 2;
const TOTAL_SLOTS = (HORA_FIN - HORA_INICIO) * SLOTS_POR_HORA;
const ALTO_SLOT = 32;
const ALTO_TOTAL = TOTAL_SLOTS * ALTO_SLOT;

export function CalendarioSemanal({
  citas,
  veterinarios,
  semanaInicio,
}: {
  citas: CitaAgendaItem[];
  veterinarios: { id: string; nombre: string }[];
  semanaInicio: Date;
}) {
  const [slotSeleccionado, setSlotSeleccionado] = useState<string | undefined>();
  const [nuevaCitaOpen, setNuevaCitaOpen] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<CitaAgendaItem | null>(null);
  const [detalleOpen, setDetalleOpen] = useState(false);

  const dias = Array.from({ length: 7 }, (_, i) => addDays(semanaInicio, i));
  const horas = Array.from({ length: HORA_FIN - HORA_INICIO + 1 }, (_, i) => HORA_INICIO + i);

  function abrirSlot(dia: Date, slotIdx: number) {
    const fecha = new Date(dia);
    fecha.setHours(HORA_INICIO, 0, 0, 0);
    fecha.setMinutes(fecha.getMinutes() + (slotIdx * 60) / SLOTS_POR_HORA);
    setSlotSeleccionado(fecha.toISOString());
    setNuevaCitaOpen(true);
  }

  function abrirDetalle(cita: CitaAgendaItem) {
    setCitaSeleccionada(cita);
    setDetalleOpen(true);
  }

  function posicion(cita: CitaAgendaItem) {
    const fecha = new Date(cita.fechaHora);
    const minutos = fecha.getHours() * 60 + fecha.getMinutes() - HORA_INICIO * 60;
    const top = Math.max(0, Math.min(ALTO_TOTAL - ALTO_SLOT, (minutos / 30) * ALTO_SLOT));
    const height = Math.max(ALTO_SLOT - 2, (cita.duracionMin / 30) * ALTO_SLOT - 2);
    return { top, height };
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* min-w-[640px] + overflow-x-auto en el padre: por debajo de ese ancho
          las 7 columnas se aplastan a ilegibles y con tap targets menores al
          mínimo recomendado (~44px) — se prefiere scroll horizontal explícito
          a comprimir el calendario hasta ser inusable en mobile. */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-gray-100">
            <div />
            {dias.map((dia) => (
              <div
                key={dia.toISOString()}
                className="border-l border-gray-100 py-2 text-center"
              >
                <p className="text-xs text-gray-500 capitalize">
                  {format(dia, "EEE", { locale: es })}
                </p>
                <p
                  className={cn(
                    "text-sm font-semibold text-gray-900",
                    isToday(dia) && "text-[#0F6E56]"
                  )}
                >
                  {format(dia, "d")}
                </p>
              </div>
            ))}
          </div>

          <div className="max-h-[65vh] overflow-y-auto">
            <div className="grid grid-cols-[56px_repeat(7,1fr)]">
              <div className="relative" style={{ height: ALTO_TOTAL }}>
                {horas.map((h, i) => (
                  <span
                    key={h}
                    className="absolute right-2 -translate-y-1/2 text-[11px] text-gray-400"
                    style={{ top: i * SLOTS_POR_HORA * ALTO_SLOT }}
                  >
                    {String(h).padStart(2, "0")}:00
                  </span>
                ))}
              </div>

              {dias.map((dia) => {
                const citasDelDia = citas.filter((c) => isSameDay(new Date(c.fechaHora), dia));
                return (
                  <div
                    key={dia.toISOString()}
                    className="relative border-l border-gray-100"
                    style={{ height: ALTO_TOTAL }}
                  >
                    {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => (
                      <button
                        key={slotIdx}
                        type="button"
                        onClick={() => abrirSlot(dia, slotIdx)}
                        className="absolute inset-x-0 border-b border-gray-50 hover:bg-gray-50"
                        style={{ top: slotIdx * ALTO_SLOT, height: ALTO_SLOT }}
                        aria-label="Nueva cita en este horario"
                      />
                    ))}

                    {citasDelDia.map((cita) => {
                      const { top, height } = posicion(cita);
                      return (
                        <CitaCard
                          key={cita.id}
                          cita={cita}
                          style={{ top, height, left: 2, right: 2 }}
                          onClick={() => abrirDetalle(cita)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <NuevaCitaModal
        veterinarios={veterinarios}
        open={nuevaCitaOpen}
        onOpenChange={setNuevaCitaOpen}
        fechaHoraInicial={slotSeleccionado}
      />
      <CitaDetalleDialog
        cita={citaSeleccionada}
        veterinarios={veterinarios}
        open={detalleOpen}
        onOpenChange={setDetalleOpen}
      />
    </div>
  );
}
