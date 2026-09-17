// Sin "use client" a propósito: estas constantes las consume tanto
// FacturaTable.tsx (cliente, por el onClick de la fila) como Server
// Components (ej. app/(dashboard)/facturacion/[id]/page.tsx). Si vivieran en
// un archivo marcado "use client", un Server Component que las importe
// recibiría una referencia de cliente en vez del objeto real — el lookup por
// clave devolvería `undefined` en vez del label. Mismo patrón que
// components/agenda/CitaCard.tsx (sin "use client") para ESTADO_STYLES.
export const ESTADO_FACTURA_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagada",
  CANCELADA: "Cancelada",
  ANULADA: "Anulada",
};

export const ESTADO_FACTURA_STYLES: Record<string, string> = {
  PENDIENTE: "bg-[#D97706]/10 text-[#D97706]",
  PAGADA: "bg-[#16A34A]/10 text-[#16A34A]",
  CANCELADA: "bg-gray-200 text-gray-600",
  ANULADA: "bg-[#DC2626]/10 text-[#DC2626]",
};

export const METODO_PAGO_LABELS: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TARJETA: "Tarjeta",
  TRANSFERENCIA: "Transferencia",
  QR: "QR",
  OTRO: "Otro",
};
