import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getFacturaDetalle } from "@/lib/facturas";
import { BotonImprimir } from "@/components/historia-clinica/BotonImprimir";
import { RegistrarPagoDialog } from "@/components/facturacion/RegistrarPagoDialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ESTADO_FACTURA_LABELS,
  ESTADO_FACTURA_STYLES,
  METODO_PAGO_LABELS,
} from "@/components/facturacion/estados";

const formatoMoneda = new Intl.NumberFormat("es", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default async function FacturaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const factura = await getFacturaDetalle(session!.user.clinicaId, id);
  if (!factura) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/facturacion"
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Recibo {factura.numero}</h1>
        </div>
        <div className="flex gap-2">
          {factura.estado === "PENDIENTE" && (
            <RegistrarPagoDialog facturaId={factura.id} total={factura.total} />
          )}
          <BotonImprimir />
        </div>
      </div>

      <div className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">{factura.clinica.nombre}</p>
            {factura.clinica.direccion && (
              <p className="text-sm text-gray-500">{factura.clinica.direccion}</p>
            )}
            {factura.clinica.telefono && (
              <p className="text-sm text-gray-500">{factura.clinica.telefono}</p>
            )}
            <p className="text-sm text-gray-500">{factura.clinica.email}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm text-gray-500">{factura.numero}</p>
            <p className="text-sm text-gray-500">
              {format(factura.emitidaEn, "d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
            <Badge className={cn("mt-1", ESTADO_FACTURA_STYLES[factura.estado])}>
              {ESTADO_FACTURA_LABELS[factura.estado] ?? factura.estado}
            </Badge>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500">Cliente</p>
          <p className="text-sm text-gray-900">
            {factura.cliente.nombre} {factura.cliente.apellido}
          </p>
          {factura.cliente.telefono && (
            <p className="text-xs text-gray-500">{factura.cliente.telefono}</p>
          )}
          {factura.cliente.email && (
            <p className="text-xs text-gray-500">{factura.cliente.email}</p>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio unit.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {factura.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-gray-900">{item.descripcion}</TableCell>
                <TableCell className="text-right font-mono text-gray-600">
                  {item.cantidad}
                </TableCell>
                <TableCell className="text-right font-mono text-gray-600">
                  ${formatoMoneda.format(item.precioUnit)}
                </TableCell>
                <TableCell className="text-right font-mono text-gray-900">
                  ${formatoMoneda.format(item.subtotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-mono">${formatoMoneda.format(factura.subtotal)}</span>
          </div>
          {factura.descuento > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Descuento</span>
              <span className="font-mono">-${formatoMoneda.format(factura.descuento)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-100 pt-1 text-base font-semibold text-gray-900">
            <span>Total</span>
            <span className="font-mono">${formatoMoneda.format(factura.total)}</span>
          </div>
        </div>

        {factura.metodoPago && (
          <p className="text-xs text-gray-500">
            Pagada el{" "}
            {factura.pagadaEn ? format(factura.pagadaEn, "d MMM yyyy", { locale: es }) : "—"} vía{" "}
            {METODO_PAGO_LABELS[factura.metodoPago]}
          </p>
        )}

        {factura.notas && (
          <div>
            <p className="text-xs font-medium text-gray-500">Notas</p>
            <p className="whitespace-pre-wrap text-sm text-gray-900">{factura.notas}</p>
          </div>
        )}
      </div>
    </div>
  );
}
