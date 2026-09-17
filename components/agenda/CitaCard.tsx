import { format } from "date-fns";

import type { listarCitasPorRango } from "@/lib/citas";

export type CitaAgendaItem = Awaited<ReturnType<typeof listarCitasPorRango>>[number];

export const TIPO_COLORS: Record<string, string> = {
  CONSULTA: "#185FA5",
  VACUNA: "#0F6E56",
  CIRUGIA: "#534AB7",
  URGENCIA: "#DC2626",
  CONTROL: "#1D9E75",
  DESPARASITACION: "#D97706",
  GROOMING: "#F4A100",
  OTRO: "#6B7280",
};

export const TIPO_LABELS: Record<string, string> = {
  CONSULTA: "Consulta",
  VACUNA: "Vacuna",
  CIRUGIA: "Cirugía",
  CONTROL: "Control",
  URGENCIA: "Urgencia",
  DESPARASITACION: "Desparasitación",
  GROOMING: "Grooming",
  OTRO: "Otro",
};

export const ESTADO_LABELS: Record<string, string> = {
  AGENDADA: "Agendada",
  CONFIRMADA: "Confirmada",
  EN_ESPERA: "En espera",
  EN_CONSULTA: "En consulta",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No asistió",
};

export const ESTADO_STYLES: Record<string, string> = {
  AGENDADA: "bg-[#185FA5]/10 text-[#185FA5]",
  CONFIRMADA: "bg-[#1D9E75]/10 text-[#1D9E75]",
  EN_ESPERA: "bg-[#D97706]/10 text-[#D97706]",
  EN_CONSULTA: "bg-[#534AB7]/10 text-[#534AB7]",
  COMPLETADA: "bg-[#16A34A]/10 text-[#16A34A]",
  CANCELADA: "bg-[#DC2626]/10 text-[#DC2626]",
  NO_ASISTIO: "bg-gray-200 text-gray-600",
};

export function CitaCard({
  cita,
  style,
  compact = false,
  onClick,
}: {
  cita: CitaAgendaItem;
  style?: React.CSSProperties;
  compact?: boolean;
  onClick?: () => void;
}) {
  const color = TIPO_COLORS[cita.tipo] ?? TIPO_COLORS.OTRO;
  const cancelada = cita.estado === "CANCELADA" || cita.estado === "NO_ASISTIO";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      style={{
        ...style,
        backgroundColor: `${color}1A`,
        borderLeft: `3px solid ${color}`,
      }}
      className={`absolute overflow-hidden rounded-md px-1.5 py-1 text-left text-xs leading-tight transition-opacity hover:opacity-80 ${
        cancelada ? "opacity-50" : ""
      }`}
    >
      <p className="truncate font-medium" style={{ color }}>
        {format(cita.fechaHora, "HH:mm")} · {cita.paciente.nombre}
      </p>
      {!compact && (
        <p className="truncate text-gray-500">
          {cita.paciente.cliente.nombre} {cita.paciente.cliente.apellido}
        </p>
      )}
    </button>
  );
}
