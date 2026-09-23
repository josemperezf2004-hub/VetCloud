"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function ClinicaAcciones({
  clinicaId,
  activa,
}: {
  clinicaId: string;
  activa: boolean;
}) {
  const router = useRouter();
  const [confirmandoDesactivar, setConfirmandoDesactivar] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function confirmarPago() {
    setEnviando(true);
    const res = await fetch(`/api/plataforma/clinicas/${clinicaId}/pago`, {
      method: "POST",
    });
    setEnviando(false);

    if (!res.ok) {
      toast.error("No se pudo confirmar el pago");
      return;
    }
    toast.success("Pago confirmado, suscripción extendida un mes");
    router.refresh();
  }

  async function desactivar() {
    setEnviando(true);
    const res = await fetch(`/api/plataforma/clinicas/${clinicaId}/desactivar`, {
      method: "POST",
    });
    setEnviando(false);

    if (!res.ok) {
      toast.error("No se pudo desactivar la clínica");
      return;
    }
    toast.success("Clínica desactivada");
    setConfirmandoDesactivar(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button size="sm" disabled={enviando} onClick={confirmarPago}>
          Confirmar pago
        </Button>
        {activa && (
          <Button
            size="sm"
            variant="outline"
            disabled={enviando}
            onClick={() => setConfirmandoDesactivar(true)}
          >
            Desactivar
          </Button>
        )}
      </div>

      <Dialog open={confirmandoDesactivar} onOpenChange={setConfirmandoDesactivar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Desactivar esta clínica?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Sus usuarios van a quedar sin acceso al sistema hasta que confirmes
            un nuevo pago, sin importar la fecha de vencimiento.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmandoDesactivar(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" disabled={enviando} onClick={desactivar}>
              Desactivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
