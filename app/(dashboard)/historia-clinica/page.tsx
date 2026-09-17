import Link from "next/link";
import { getServerSession } from "next-auth";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { listarHistoriasClinica } from "@/lib/historia-clinica";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BuscadorHistorias } from "@/components/historia-clinica/BuscadorHistorias";
import { HistoriaRow } from "@/components/historia-clinica/HistoriaRow";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function HistoriaClinicaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { q, page } = await searchParams;

  const data = await listarHistoriasClinica(session!.user.clinicaId, {
    q,
    page: page ? Number(page) : 1,
  });

  const totalPaginas = Math.max(1, Math.ceil(data.total / data.pageSize));

  function hrefConPagina(pagina: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(pagina));
    return `?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Historia Clínica</h1>
        <BuscadorHistorias defaultValue={q ?? ""} />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        {data.historias.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={q ? "No se encontraron consultas" : "Todavía no hay consultas registradas"}
            description={
              q
                ? "Prueba con otro nombre de mascota o propietario."
                : "Las consultas se registran desde el perfil de cada mascota."
            }
            action={q ? undefined : { label: "Ver pacientes", href: "/pacientes" }}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Mascota</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Veterinario</TableHead>
                <TableHead>Diagnóstico</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.historias.map((historia) => (
                <HistoriaRow key={historia.id} historia={historia} />
              ))}
            </TableBody>
          </Table>
        )}

        {data.total > data.pageSize && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500">
              Página {data.page} de {totalPaginas} · {data.total} consultas
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
    </div>
  );
}
