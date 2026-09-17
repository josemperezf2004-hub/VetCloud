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
import { CitaForm } from "@/components/agenda/CitaForm";
import type { CitaInput } from "@/lib/validations";

export function NuevaCitaModal({
  veterinarios,
  trigger = false,
  open: openProp,
  onOpenChange,
  fechaHoraInicial,
}: {
  veterinarios: { id: string; nombre: string }[];
  trigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  fechaHoraInicial?: string;
}) {
  const router = useRouter();
  const [openInterno, setOpenInterno] = useState(false);

  const open = openProp ?? openInterno;
  const setOpen = onOpenChange ?? setOpenInterno;

  async function handleSubmit(values: CitaInput) {
    const res = await fetch("/api/citas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("No se pudo crear la cita", { description: data.error });
      return;
    }

    toast.success("Cita agendada");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          <Button className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white">
            <Plus className="size-4" />
            Nueva cita
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva cita</DialogTitle>
        </DialogHeader>
        {open && (
          <CitaForm
            veterinarios={veterinarios}
            defaultValues={fechaHoraInicial ? { fechaHora: fechaHoraInicial } : undefined}
            onSubmit={handleSubmit}
            submitLabel="Agendar cita"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
