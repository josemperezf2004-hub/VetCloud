import Link from "next/link";
import { getServerSession } from "next-auth";
import { Plus, ChevronLeft, ChevronRight, Heart } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { listarPacientes } from "@/lib/pacientes";
import { Button } from "@/components/ui/button";
import { FiltrosPacientes } from "@/components/pacientes/FiltrosPacientes";
import { PacienteCard } from "@/components/pacientes/PacienteCard";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; especie?: string; sort?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { q, especie, sort, page } = await searchParams;

  const data = await listarPacientes(session!.user.clinicaId, {
    q,
    especie,
    sort,
    page: page ? Number(page) : 1,
  });

  const totalPaginas = Math.max(1, Math.ceil(data.total / data.pageSize));

  function hrefConPagina(pagina: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (especie) params.set("especie", especie);
    if (sort) params.set("sort", sort);
    params.set("page", String(pagina));
    return `?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Pacientes</h1>
        <Button asChild className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white">
          <Link href="/pacientes/nuevo">
            <Plus className="size-4" />
            Nueva mascota
          </Link>
        </Button>
      </div>

      <FiltrosPacientes q={q ?? ""} especie={especie ?? ""} sort={sort ?? "reciente"} />

      {data.pacientes.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <EmptyState
            icon={Heart}
            title={
              q || especie ? "No se encontraron mascotas" : "Todavía no hay mascotas"
            }
            description={
              q || especie
                ? "Prueba con otro nombre, chip o especie."
                : "Registra la primera mascota para llevar su historia clínica y vacunas."
            }
            action={
              q || especie ? undefined : { label: "Nueva mascota", href: "/pacientes/nuevo" }
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.pacientes.map((paciente) => (
            <PacienteCard key={paciente.id} paciente={paciente} />
          ))}
        </div>
      )}

      {data.total > data.pageSize && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            Página {data.page} de {totalPaginas} · {data.total} pacientes
          </p>
          <div className="flex gap-2">
            {data.page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={hrefConPagina(data.page - 1)}>
                  <ChevronLeft className="size-4" />
                  Anterior
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
            )}
            {data.page < totalPaginas ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={hrefConPagina(data.page + 1)}>
                  Siguiente
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Siguiente
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
