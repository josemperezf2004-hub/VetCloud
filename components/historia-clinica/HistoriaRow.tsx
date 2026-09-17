"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { TableRow, TableCell } from "@/components/ui/table";
import type { listarHistoriasClinica } from "@/lib/historia-clinica";

export type HistoriaItem = Awaited<ReturnType<typeof listarHistoriasClinica>>["historias"][number];

export function HistoriaRow({ historia }: { historia: HistoriaItem }) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => router.push(`/historia-clinica/${historia.id}`)}
    >
      <TableCell className="text-gray-600">
        {format(historia.creadoEn, "d MMM yyyy", { locale: es })}
      </TableCell>
      <TableCell className="font-medium text-gray-900">{historia.paciente.nombre}</TableCell>
      <TableCell className="text-gray-600">
        {historia.paciente.cliente.nombre} {historia.paciente.cliente.apellido}
      </TableCell>
      <TableCell className="text-gray-600">{historia.veterinario.nombre}</TableCell>
      <TableCell className="max-w-xs truncate text-gray-600">{historia.diagnostico}</TableCell>
    </TableRow>
  );
}
