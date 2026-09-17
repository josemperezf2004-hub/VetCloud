"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Bell } from "lucide-react";

import { MobileNav } from "@/components/layout/MobileNav";

const SECTION_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/clientes": "Clientes",
  "/pacientes": "Pacientes",
  "/agenda": "Agenda",
  "/historia-clinica": "Historia Clínica",
  "/inventario": "Inventario",
  "/facturacion": "Facturación",
  "/configuracion": "Configuración",
};

function seccionActual(pathname: string) {
  if (SECTION_LABELS[pathname]) return SECTION_LABELS[pathname];
  const raiz = "/" + pathname.split("/")[1];
  return SECTION_LABELS[raiz] ?? "VetCloud";
}

export function Header({
  usuarioNombre,
  usuarioRol,
}: {
  usuarioNombre: string;
  usuarioRol: string;
}) {
  const pathname = usePathname();
  const [ahora, setAhora] = useState<Date | null>(null);

  useEffect(() => {
    // setTimeout(0) en vez de llamar setAhora directo: evita el lint
    // react-hooks/set-state-in-effect (setState síncrono dentro del cuerpo
    // del efecto) difiriendo la primera actualización a una macrotarea.
    const inicial = setTimeout(() => setAhora(new Date()), 0);
    const id = setInterval(() => setAhora(new Date()), 60_000);
    return () => {
      clearTimeout(inicial);
      clearInterval(id);
    };
  }, []);

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-1">
        <MobileNav usuarioNombre={usuarioNombre} usuarioRol={usuarioRol} />
        <nav aria-label="breadcrumb" className="text-sm text-gray-500">
          <span className="hidden sm:inline">VetCloud</span>
          <span className="mx-2 hidden sm:inline">/</span>
          <span className="font-medium text-gray-900">
            {seccionActual(pathname ?? "/")}
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {ahora && (
          <span className="hidden text-sm text-gray-500 sm:inline capitalize">
            {format(ahora, "EEEE d 'de' MMMM, HH:mm", { locale: es })}
          </span>
        )}

        <button
          aria-label="Notificaciones"
          className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <Bell className="size-5" />
        </button>
      </div>
    </header>
  );
}
