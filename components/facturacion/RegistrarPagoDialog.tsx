"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { METODOS_PAGO } from "@/lib/validations";
import { METODO_PAGO_LABELS } from "@/components/facturacion/estados";

const formatoMoneda = new Intl.NumberFormat("es", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function RegistrarPagoDialog({
  facturaId,
  total,
}: {
  facturaId: string;
  total: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [metodoPago, setMetodoPago] = useState<string>("EFECTIVO");
  const [loading, setLoading] = useState(false);

  async function handleConfirmar() {
    setLoading(true);
    try {
      const res = await fetch(`/api/facturas/${facturaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodoPago }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error("No se pudo registrar el pago", { description: data.error });
        return;
      }

      toast.success("Pago registrado");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white print:hidden">
          <CreditCard className="size-4" />
          Registrar pago
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500">Monto a pagar</p>
            <p className="font-mono text-2xl font-semibold text-gray-900">
              ${formatoMoneda.format(total)}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Método de pago</label>
            <Select value={metodoPago} onValueChange={setMetodoPago}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METODOS_PAGO.map((m) => (
                  <SelectItem key={m} value={m}>
                    {METODO_PAGO_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={loading}
            className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white"
            onClick={handleConfirmar}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Confirmar pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
