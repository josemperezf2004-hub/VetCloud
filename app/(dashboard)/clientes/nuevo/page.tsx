"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { ClienteForm } from "@/components/clientes/ClienteForm";
import type { ClienteInput } from "@/lib/validations";

export default function NuevoClientePage() {
  const router = useRouter();

  async function handleSubmit(values: ClienteInput) {
    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("No se pudo crear el propietario", {
        description: data.error ?? "Intenta de nuevo.",
      });
      return;
    }

    const cliente = await res.json();
    toast.success("Propietario creado");
    router.push(`/clientes/${cliente.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/clientes"
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">
          Nuevo propietario
        </h1>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <ClienteForm onSubmit={handleSubmit} submitLabel="Crear propietario" />
      </div>
    </div>
  );
}
