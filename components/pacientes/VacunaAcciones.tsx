"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { VacunaForm } from "@/components/pacientes/VacunaForm";
import type { VacunaInput } from "@/lib/validations";

export function VacunaAcciones({
  vacunaId,
  defaultValues,
}: {
  vacunaId: string;
  defaultValues: VacunaInput;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  async function handleEditar(values: VacunaInput) {
    const res = await fetch(`/api/vacunas/${vacunaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("No se pudo actualizar la vacuna", { description: data.error });
      return;
    }

    toast.success("Vacuna actualizada");
    setEditando(false);
    router.refresh();
  }

  async function handleEliminar() {
    setEliminando(true);
    const res = await fetch(`/api/vacunas/${vacunaId}`, { method: "DELETE" });
    setEliminando(false);

    if (!res.ok) {
      toast.error("No se pudo eliminar la vacuna");
      return;
    }

    toast.success("Vacuna eliminada");
    setConfirmandoEliminar(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Editar vacuna"
          onClick={() => setEditando(true)}
        >
          <Pencil className="size-3.5 text-gray-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Eliminar vacuna"
          onClick={() => setConfirmandoEliminar(true)}
        >
          <Trash2 className="size-3.5 text-[#DC2626]" />
        </Button>
      </div>

      <Dialog open={editando} onOpenChange={setEditando}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar vacuna</DialogTitle>
          </DialogHeader>
          <VacunaForm
            defaultValues={defaultValues}
            onSubmit={handleEditar}
            submitLabel="Guardar cambios"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={confirmandoEliminar} onOpenChange={setConfirmandoEliminar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro de eliminar este registro de vacuna?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            El registro se ocultará del historial de la mascota y del
            Dashboard, pero no se borra físicamente — se conserva para
            trazabilidad clínica.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmandoEliminar(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={eliminando}
              onClick={handleEliminar}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
