"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CitaForm } from "@/components/agenda/CitaForm";
import {
  TIPO_LABELS,
  ESTADO_LABELS,
  type CitaAgendaItem,
} from "@/components/agenda/CitaCard";
import { ESTADOS_CITA, type CitaInput } from "@/lib/validations";

export function CitaDetalleDialog({
  cita,
  veterinarios,
  open,
  onOpenChange,
}: {
  cita: CitaAgendaItem | null;
  veterinarios: { id: string; nombre: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  if (!cita) return null;

  async function handleCambiarEstado(estado: string) {
    setCambiandoEstado(true);
    const res = await fetch(`/api/citas/${cita!.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setCambiandoEstado(false);

    if (!res.ok) {
      toast.error("No se pudo actualizar el estado");
      return;
    }

    toast.success("Estado actualizado");
    onOpenChange(false);
    router.refresh();
  }

  async function handleEditar(values: CitaInput) {
    const res = await fetch(`/api/citas/${cita!.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("No se pudo actualizar la cita", { description: data.error });
      return;
    }

    toast.success("Cita actualizada");
    setEditando(false);
    onOpenChange(false);
    router.refresh();
  }

  async function handleEliminar() {
    setEliminando(true);
    const res = await fetch(`/api/citas/${cita!.id}`, { method: "DELETE" });
    setEliminando(false);

    if (!res.ok) {
      toast.error("No se pudo eliminar la cita");
      return;
    }

    toast.success("Cita eliminada");
    setConfirmandoEliminar(false);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <>
      <Dialog
        open={open && !confirmandoEliminar}
        onOpenChange={(v) => {
          onOpenChange(v);
          if (!v) setEditando(false);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editando
                ? "Editar cita"
                : `${cita.paciente.nombre} · ${TIPO_LABELS[cita.tipo]}`}
            </DialogTitle>
          </DialogHeader>

          {editando ? (
            <CitaForm
              veterinarios={veterinarios}
              clienteInicial={{
                id: "",
                label: `${cita.paciente.cliente.nombre} ${cita.paciente.cliente.apellido}`,
              }}
              pacienteInicial={{
                id: cita.pacienteId,
                nombre: cita.paciente.nombre,
                especie: cita.paciente.especie,
              }}
              defaultValues={{
                pacienteId: cita.pacienteId,
                veterinarioId: cita.veterinarioId,
                fechaHora: new Date(cita.fechaHora).toISOString(),
                duracionMin: cita.duracionMin,
                tipo: cita.tipo,
                motivo: cita.motivo ?? "",
                notas: cita.notas ?? "",
              }}
              onSubmit={handleEditar}
              submitLabel="Guardar cambios"
            />
          ) : (
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-gray-500">Propietario</dt>
                <dd className="text-gray-900">
                  {cita.paciente.cliente.nombre} {cita.paciente.cliente.apellido}
                </dd>
                <dt className="text-gray-500">Veterinario</dt>
                <dd className="text-gray-900">{cita.veterinario.nombre}</dd>
                <dt className="text-gray-500">Fecha y hora</dt>
                <dd className="text-gray-900">
                  {format(cita.fechaHora, "dd/MM/yyyy HH:mm")}
                </dd>
                <dt className="text-gray-500">Duración</dt>
                <dd className="text-gray-900">{cita.duracionMin} minutos</dd>
                {cita.motivo && (
                  <>
                    <dt className="text-gray-500">Motivo</dt>
                    <dd className="text-gray-900">{cita.motivo}</dd>
                  </>
                )}
              </dl>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <Select
                  value={cita.estado}
                  onValueChange={handleCambiarEstado}
                  disabled={cambiandoEstado}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_CITA.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {ESTADO_LABELS[estado]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <Button
                  variant="outline"
                  className="text-[#DC2626] hover:text-[#DC2626]"
                  onClick={() => setConfirmandoEliminar(true)}
                >
                  <Trash2 className="size-4" />
                  Eliminar
                </Button>
                <Button
                  className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white"
                  onClick={() => setEditando(true)}
                >
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmandoEliminar} onOpenChange={setConfirmandoEliminar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar esta cita?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Se elimina el registro del calendario. Esta acción no se puede
            deshacer.
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
