"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MantenimientoForm } from "@/components/inventario/MantenimientoForm";
import type { MantenimientoInput } from "@/lib/validations";

export function RegistrarMantenimientoDialog({
  productoId,
  open,
  onOpenChange,
}: {
  productoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  async function handleSubmit(values: MantenimientoInput) {
    const res = await fetch(`/api/inventario/${productoId}/mantenimientos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("No se pudo registrar el mantenimiento", { description: data.error });
      return;
    }

    toast.success("Mantenimiento registrado");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="size-4" />
            Registrar mantenimiento
          </DialogTitle>
        </DialogHeader>
        <MantenimientoForm onSubmit={handleSubmit} submitLabel="Registrar mantenimiento" />
      </DialogContent>
    </Dialog>
  );
}
