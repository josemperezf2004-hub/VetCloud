import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Receipt } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getConsultaDetalle } from "@/lib/historia-clinica";
import { BotonImprimir } from "@/components/historia-clinica/BotonImprimir";
import { Button } from "@/components/ui/button";
import type { PrescripcionItemInput } from "@/lib/validations";

function Campo({ label, valor }: { label: string; valor?: string | null }) {
  if (!valor) return null;
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="whitespace-pre-wrap text-sm text-gray-900">{valor}</p>
    </div>
  );
}

export default async function ConsultaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const historia = await getConsultaDetalle(session!.user.clinicaId, id);
  if (!historia) {
    notFound();
  }

  const prescripciones = (historia.prescripciones as PrescripcionItemInput[] | null) ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href={`/pacientes/${historia.paciente.id}`}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Consulta · {format(historia.creadoEn, "d MMM yyyy", { locale: es })}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/facturacion/nueva?historiaId=${historia.id}`}>
              <Receipt className="size-4" />
              Generar factura
            </Link>
          </Button>
          <BotonImprimir />
        </div>
      </div>

      <div className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">{historia.paciente.nombre}</p>
            <p className="text-sm text-gray-500">
              Propietario: {historia.paciente.cliente.nombre}{" "}
              {historia.paciente.cliente.apellido}
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>{format(historia.creadoEn, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}</p>
            <p>Dr(a). {historia.veterinario.nombre}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Campo label="Peso" valor={historia.peso ? `${historia.peso} kg` : null} />
          <Campo
            label="Temperatura"
            valor={historia.temperatura ? `${historia.temperatura} °C` : null}
          />
          <Campo
            label="Frec. cardíaca"
            valor={historia.frecuenciaCardiaca ? `${historia.frecuenciaCardiaca} lpm` : null}
          />
          <Campo
            label="Frec. respiratoria"
            valor={
              historia.frecuenciaRespiratoria
                ? `${historia.frecuenciaRespiratoria} rpm`
                : null
            }
          />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-[#0F6E56]">S — Subjetivo</p>
            <Campo label="Motivo de consulta" valor={historia.motivoConsulta} />
            <Campo label="Anamnesis" valor={historia.anamnesis} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#0F6E56]">O — Objetivo</p>
            <Campo label="Examen físico" valor={historia.examenFisico} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#0F6E56]">A — Evaluación</p>
            <Campo label="Diagnóstico" valor={historia.diagnostico} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#0F6E56]">P — Plan</p>
            <Campo label="Plan terapéutico" valor={historia.plan} />

            {prescripciones.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500">Prescripciones</p>
                <ul className="mt-1 space-y-2">
                  {prescripciones.map((p, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-gray-100 p-3 text-sm text-gray-900"
                    >
                      <p className="font-medium">
                        {p.productoNombre} · {p.cantidad} unidades
                      </p>
                      <p className="text-xs text-gray-500">
                        {[p.dosis, p.frecuencia, p.diasTratamiento]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {p.notas && <p className="text-xs text-gray-500">{p.notas}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Campo label="Notas adicionales" valor={historia.notas} />
        </div>
      </div>
    </div>
  );
}
