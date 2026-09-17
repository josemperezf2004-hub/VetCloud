"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dog, Cat, Bird, Rabbit, Fish, Squirrel, Turtle, PawPrint } from "lucide-react";

const ESPECIE_ICONO: Record<string, typeof Dog> = {
  PERRO: Dog,
  GATO: Cat,
  AVE: Bird,
  CONEJO: Rabbit,
  REPTIL: Turtle,
  PEZ: Fish,
  ROEDOR: Squirrel,
  OTRO: PawPrint,
};

export function PacienteCard({
  paciente,
}: {
  paciente: {
    id: string;
    nombre: string;
    especie: string;
    raza: string | null;
    fotoUrl: string | null;
    cliente: { nombre: string; apellido: string };
    ultimaVisita: Date | null;
  };
}) {
  const router = useRouter();
  const Icono = ESPECIE_ICONO[paciente.especie] ?? PawPrint;

  return (
    <button
      type="button"
      onClick={() => router.push(`/pacientes/${paciente.id}`)}
      className="flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md"
    >
      {paciente.fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={paciente.fotoUrl}
          alt={paciente.nombre}
          className="size-20 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-20 items-center justify-center rounded-full bg-[#E1F5EE]">
          <Icono className="size-9 text-[#0F6E56]" strokeWidth={1.5} />
        </div>
      )}

      <div className="space-y-0.5">
        <p className="font-medium text-gray-900">{paciente.nombre}</p>
        <p className="text-xs text-gray-500">
          {paciente.especie.charAt(0) + paciente.especie.slice(1).toLowerCase()}
          {paciente.raza ? ` · ${paciente.raza}` : ""}
        </p>
      </div>

      <div className="w-full border-t border-gray-100 pt-2 text-xs text-gray-500">
        <p className="truncate">
          {paciente.cliente.nombre} {paciente.cliente.apellido}
        </p>
        <p className="text-gray-400">
          {paciente.ultimaVisita
            ? `Última visita: ${format(new Date(paciente.ultimaVisita), "d MMM yyyy", { locale: es })}`
            : "Sin visitas registradas"}
        </p>
      </div>
    </button>
  );
}
