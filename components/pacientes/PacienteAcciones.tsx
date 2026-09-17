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
import { PacienteForm } from "@/components/pacientes/PacienteForm";
import type { PacienteInput } from "@/lib/validations";

export function PacienteAcciones({
  pacienteId,
  nombre,
  defaultValues,
  clienteInicial,
}: {
  pacienteId: string;
  nombre: string;
  defaultValues: PacienteInput;
  clienteInicial: { id: string; label: string };
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  async function handleEditar(values: PacienteInput) {
    const res = await fetch(`/api/pacientes/${pacienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("No se pudo actualizar", { description: data.error });
      return;
    }

    toast.success("Mascota actualizada");
    setEditando(false);
    router.refresh();
  }

  async function handleEliminar() {
    setEliminando(true);
    const res = await fetch(`/api/pacientes/${pacienteId}`, { method: "DELETE" });
    setEliminando(false);

    if (!res.ok) {
      toast.error("No se pudo eliminar");
      return;
    }

    toast.success("Mascota eliminada");
    router.push("/pacientes");
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setEditando(true)}>
          <Pencil className="size-4" />
          Editar
        </Button>
        <Button variant="destructive" onClick={() => setConfirmandoEliminar(true)}>
          <Trash2 className="size-4" />
          Eliminar
        </Button>
      </div>

      <Dialog open={editando} onOpenChange={setEditando}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar mascota</DialogTitle>
          </DialogHeader>
          <PacienteForm
            defaultValues={defaultValues}
            clienteInicial={clienteInicial}
            onSubmit={handleEditar}
            submitLabel="Guardar cambios"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={confirmandoEliminar} onOpenChange={setConfirmandoEliminar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar a {nombre}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            La mascota se ocultará del sistema pero su historial se conserva.
            Esta acción no borra datos físicamente.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmandoEliminar(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" disabled={eliminando} onClick={handleEliminar}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
