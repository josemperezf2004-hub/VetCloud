import Link from "next/link";
import { getServerSession } from "next-auth";
import { Plus, ChevronLeft, ChevronRight, Users } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { listarClientes } from "@/lib/clientes";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BuscadorClientes } from "@/components/clientes/BuscadorClientes";
import { ClienteRow } from "@/components/clientes/ClienteRow";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { q, page } = await searchParams;

  const data = await listarClientes(session!.user.clinicaId, {
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
        <h1 className="text-2xl font-semibold text-gray-900">Propietarios</h1>
        <div className="flex flex-wrap items-center gap-3">
          <BuscadorClientes defaultValue={q ?? ""} />
          <Button asChild className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white">
            <Link href="/clientes/nuevo">
              <Plus className="size-4" />
              Nuevo propietario
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        {data.clientes.length === 0 ? (
          <EmptyState
            icon={Users}
            title={q ? "No se encontraron propietarios" : "Todavía no hay propietarios"}
            description={
              q
                ? "Prueba con otro nombre, teléfono o email."
                : "Registra al primer propietario para empezar a agendar citas y crear historias clínicas."
            }
            action={q ? undefined : { label: "Nuevo propietario", href: "/clientes/nuevo" }}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propietario</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mascotas</TableHead>
                <TableHead>Última visita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.clientes.map((cliente) => (
                <ClienteRow key={cliente.id} cliente={cliente} />
              ))}
            </TableBody>
          </Table>
        )}

        {data.total > data.pageSize && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500">
              Página {data.page} de {totalPaginas} · {data.total} propietarios
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
