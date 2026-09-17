"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function iniciales(nombre: string, apellido: string) {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

export function ClienteRow({
  cliente,
}: {
  cliente: {
    id: string;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string | null;
    mascotas: number;
    ultimaVisita: Date | null;
  };
}) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => router.push(`/clientes/${cliente.id}`)}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback className="bg-[#E1F5EE] text-[#0F6E56]">
              {iniciales(cliente.nombre, cliente.apellido)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-gray-900">
            {cliente.nombre} {cliente.apellido}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-gray-600">{cliente.telefono}</TableCell>
      <TableCell className="text-gray-600">{cliente.email ?? "—"}</TableCell>
      <TableCell className="text-gray-600">{cliente.mascotas}</TableCell>
      <TableCell className="text-gray-600">
        {cliente.ultimaVisita
          ? format(new Date(cliente.ultimaVisita), "d MMM yyyy", { locale: es })
          : "—"}
      </TableCell>
    </TableRow>
  );
}
