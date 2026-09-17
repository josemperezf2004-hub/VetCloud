import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowLeft } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NuevoPacienteForm } from "@/components/pacientes/NuevoPacienteForm";

export default async function NuevoPacientePage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { clienteId } = await searchParams;

  let clienteInicial: { id: string; label: string } | undefined;

  if (clienteId) {
    const cliente = await prisma.cliente.findFirst({
      where: {
        id: clienteId,
        clinicaId: session!.user.clinicaId,
        deletedAt: null,
      },
      select: { id: true, nombre: true, apellido: true },
    });
    if (cliente) {
      clienteInicial = { id: cliente.id, label: `${cliente.nombre} ${cliente.apellido}` };
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/pacientes"
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Nueva mascota</h1>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <NuevoPacienteForm clienteInicial={clienteInicial} />
      </div>
    </div>
  );
}
