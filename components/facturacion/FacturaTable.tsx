"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Receipt } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { listarFacturas } from "@/lib/facturas";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  ESTADO_FACTURA_LABELS,
  ESTADO_FACTURA_STYLES,
  METODO_PAGO_LABELS,
} from "@/components/facturacion/estados";

export type FacturaItem = Awaited<ReturnType<typeof listarFacturas>>["facturas"][number];

const formatoMoneda = new Intl.NumberFormat("es", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function FacturaTable({
  facturas,
  filtrado,
}: {
  facturas: FacturaItem[];
  filtrado: boolean;
}) {
  if (facturas.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title={filtrado ? "No se encontraron recibos" : "Todavía no hay recibos"}
        description={
          filtrado
            ? "Prueba con otro estado, fecha o cliente."
            : "Genera el primer recibo desde una consulta o crea uno nuevo manualmente."
        }
        action={filtrado ? undefined : { label: "Nuevo recibo", href: "/facturacion/nueva" }}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Método de pago</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {facturas.map((factura) => (
          <FacturaRow key={factura.id} factura={factura} />
        ))}
      </TableBody>
    </Table>
  );
}

function FacturaRow({ factura }: { factura: FacturaItem }) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => router.push(`/facturacion/${factura.id}`)}
    >
      <TableCell className="font-mono text-xs text-gray-500">{factura.numero}</TableCell>
      <TableCell className="text-gray-600">
        {format(factura.emitidaEn, "d MMM yyyy", { locale: es })}
      </TableCell>
      <TableCell className="font-medium text-gray-900">
        {factura.cliente.nombre} {factura.cliente.apellido}
      </TableCell>
      <TableCell className="font-mono text-gray-900">
        ${formatoMoneda.format(factura.total)}
      </TableCell>
      <TableCell>
        <Badge className={cn(ESTADO_FACTURA_STYLES[factura.estado])}>
          {ESTADO_FACTURA_LABELS[factura.estado] ?? factura.estado}
        </Badge>
      </TableCell>
      <TableCell className="text-gray-600">
        {factura.metodoPago ? METODO_PAGO_LABELS[factura.metodoPago] : "—"}
      </TableCell>
    </TableRow>
  );
}
