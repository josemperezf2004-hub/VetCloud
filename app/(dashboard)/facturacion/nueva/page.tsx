import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowLeft } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getBorradorDesdeConsulta } from "@/lib/facturas";
import { FacturaForm } from "@/components/facturacion/FacturaForm";
import type { FacturaInput } from "@/lib/validations";

export default async function NuevaFacturaPage({
  searchParams,
}: {
  searchParams: Promise<{ historiaId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { historiaId } = await searchParams;

  let defaultValues: Partial<FacturaInput> | undefined;
  let clienteLabelInicial: string | undefined;

  if (historiaId) {
    const borrador = await getBorradorDesdeConsulta(session!.user.clinicaId, historiaId);
    if (borrador) {
      defaultValues = { clienteId: borrador.clienteId, items: borrador.items };
      clienteLabelInicial = borrador.clienteLabel;
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/facturacion"
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Nuevo recibo</h1>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <FacturaForm defaultValues={defaultValues} clienteLabelInicial={clienteLabelInicial} />
      </div>
    </div>
  );
}
