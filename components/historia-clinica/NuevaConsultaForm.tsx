"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ConsultaForm } from "@/components/historia-clinica/ConsultaForm";
import type { ConsultaInput } from "@/lib/validations";

export function NuevaConsultaForm({
  pacienteId,
  citaId,
  pesoAnterior,
}: {
  pacienteId: string;
  citaId?: string;
  pesoAnterior?: number | null;
}) {
  const router = useRouter();

  async function handleSubmit(values: ConsultaInput) {
    const res = await fetch("/api/historia-clinica", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("No se pudo guardar la consulta", {
        description: data.error ?? "Intenta de nuevo.",
      });
      return;
    }

    const historia = await res.json();
    toast.success("Consulta guardada");
    router.push(`/historia-clinica/${historia.id}`);
  }

  return (
    <ConsultaForm
      pacienteId={pacienteId}
      citaId={citaId}
      pesoAnterior={pesoAnterior}
      onSubmit={handleSubmit}
      submitLabel="Guardar consulta"
    />
  );
}
