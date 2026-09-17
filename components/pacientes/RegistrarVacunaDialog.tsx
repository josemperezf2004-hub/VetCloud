"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VacunaForm } from "@/components/pacientes/VacunaForm";
import type { VacunaInput } from "@/lib/validations";

export function RegistrarVacunaDialog({ pacienteId }: { pacienteId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSubmit(values: VacunaInput) {
    const res = await fetch(`/api/pacientes/${pacienteId}/vacunas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("No se pudo registrar la vacuna", { description: data.error });
      return;
    }

    toast.success("Vacuna registrada");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white">
          <Plus className="size-4" />
          Registrar vacuna
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar vacuna</DialogTitle>
        </DialogHeader>
        <VacunaForm onSubmit={handleSubmit} submitLabel="Registrar vacuna" />
      </DialogContent>
    </Dialog>
  );
}
