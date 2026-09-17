"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PacienteForm } from "@/components/pacientes/PacienteForm";
import type { PacienteInput } from "@/lib/validations";

export function NuevoPacienteForm({
  clienteInicial,
}: {
  clienteInicial?: { id: string; label: string };
}) {
  const router = useRouter();

  async function handleSubmit(values: PacienteInput) {
    const res = await fetch("/api/pacientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("No se pudo crear la mascota", {
        description: data.error ?? "Intenta de nuevo.",
      });
      return;
    }

    const paciente = await res.json();
    toast.success("Mascota registrada");
    router.push(`/pacientes/${paciente.id}`);
  }

  return (
    <PacienteForm
      clienteInicial={clienteInicial}
      onSubmit={handleSubmit}
      submitLabel="Registrar mascota"
    />
  );
}
