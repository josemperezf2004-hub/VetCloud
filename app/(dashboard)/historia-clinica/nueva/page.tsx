import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { AlertTriangle, ArrowLeft, HeartPulse } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NuevaConsultaForm } from "@/components/historia-clinica/NuevaConsultaForm";

export default async function NuevaConsultaPage({
  searchParams,
}: {
  searchParams: Promise<{ pacienteId?: string; citaId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { pacienteId, citaId } = await searchParams;

  if (!pacienteId) {
    notFound();
  }

  const paciente = await prisma.paciente.findFirst({
    where: { id: pacienteId, clinicaId: session!.user.clinicaId, deletedAt: null },
    select: {
      id: true,
      nombre: true,
      especie: true,
      peso: true,
      alergias: true,
      condiciones: true,
      cliente: { select: { id: true, nombre: true, apellido: true } },
    },
  });

  if (!paciente) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/pacientes/${paciente.id}`}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Nueva consulta</h1>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-gray-900">{paciente.nombre}</p>
            <p className="text-sm text-gray-500">
              Propietario:{" "}
              <Link
                href={`/clientes/${paciente.cliente.id}`}
                className="font-medium text-[#0F6E56] hover:underline"
              >
                {paciente.cliente.nombre} {paciente.cliente.apellido}
              </Link>
              {paciente.peso ? ` · Peso registrado: ${paciente.peso} kg` : ""}
            </p>
          </div>

          {(paciente.alergias || paciente.condiciones) && (
            <div className="flex flex-wrap gap-2">
              {paciente.alergias && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] px-3 py-1 text-xs font-medium text-[#DC2626]">
                  <AlertTriangle className="size-3.5" />
                  Alergias: {paciente.alergias}
                </span>
              )}
              {paciente.condiciones && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3CC] px-3 py-1 text-xs font-medium text-[#D97706]">
                  <HeartPulse className="size-3.5" />
                  Condición crónica: {paciente.condiciones}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <NuevaConsultaForm
        pacienteId={paciente.id}
        citaId={citaId}
        pesoAnterior={paciente.peso}
      />
    </div>
  );
}
