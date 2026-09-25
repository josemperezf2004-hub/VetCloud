import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Plus, Mail, MapPin, IdCard, MessageCircle } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getClienteDetalle } from "@/lib/clientes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClienteAcciones } from "@/components/clientes/ClienteAcciones";

const ESTADO_FACTURA_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagada",
  CANCELADA: "Cancelada",
  ANULADA: "Anulada",
};

function iniciales(nombre: string, apellido: string) {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const cliente = await getClienteDetalle(session!.user.clinicaId, id);

  if (!cliente) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/clientes"
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">
          {cliente.nombre} {cliente.apellido}
        </h1>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback className="bg-[#E1F5EE] text-lg text-[#0F6E56]">
                {iniciales(cliente.nombre, cliente.apellido)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {cliente.nombre} {cliente.apellido}
              </p>
              <p className="text-sm text-gray-500">{cliente.telefono}</p>
            </div>
          </div>
          <ClienteAcciones
            clienteId={cliente.id}
            nombre={cliente.nombre}
            defaultValues={{
              nombre: cliente.nombre,
              apellido: cliente.apellido,
              telefono: cliente.telefono,
              whatsapp: cliente.whatsapp ?? "",
              email: cliente.email ?? "",
              cedula: cliente.cedula ?? "",
              direccion: cliente.direccion ?? "",
              notas: cliente.notas ?? "",
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Datos de contacto
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2 text-gray-600">
              <MessageCircle className="size-4 shrink-0 text-gray-400" />
              {cliente.whatsapp || cliente.telefono}
            </li>
            <li className="flex items-center gap-2 text-gray-600">
              <Mail className="size-4 shrink-0 text-gray-400" />
              {cliente.email || "—"}
            </li>
            <li className="flex items-center gap-2 text-gray-600">
              <IdCard className="size-4 shrink-0 text-gray-400" />
              {cliente.cedula || "—"}
            </li>
            <li className="flex items-center gap-2 text-gray-600">
              <MapPin className="size-4 shrink-0 text-gray-400" />
              {cliente.direccion || "—"}
            </li>
          </ul>
          {cliente.notas && (
            <p className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
              {cliente.notas}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Mascotas</h2>
            <Button
              asChild
              size="sm"
              className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white"
            >
              <Link href={`/pacientes/nuevo?clienteId=${cliente.id}`}>
                <Plus className="size-4" />
                Agregar mascota
              </Link>
            </Button>
          </div>

          {cliente.pacientes.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Este propietario aún no tiene mascotas registradas.
            </p>
          ) : (
            <ul className="space-y-2">
              {cliente.pacientes.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-900">{p.nombre}</span>
                  <span className="text-xs text-gray-500">
                    {p.especie.toLowerCase()}
                    {p.raza ? ` · ${p.raza}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Historial de visitas
        </h2>
        {cliente.facturas.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            Este propietario todavía no tiene recibos registrados.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recibo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cliente.facturas.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.numero}</TableCell>
                  <TableCell>
                    {format(new Date(f.emitidaEn), "d MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell className="font-mono">
                    ${f.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {ESTADO_FACTURA_LABEL[f.estado] ?? f.estado}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
