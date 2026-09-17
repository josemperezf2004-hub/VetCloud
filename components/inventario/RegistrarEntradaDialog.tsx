"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { PackagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  movimientoSchema,
  TIPOS_MOVIMIENTO_MANUAL,
  type MovimientoInput,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProductoSelect } from "@/components/inventario/ProductoSelect";

const TIPO_LABELS: Record<string, string> = {
  ENTRADA: "Entrada",
  SALIDA: "Salida",
};

const DEFAULT_VALUES: MovimientoInput = {
  productoId: "",
  tipo: "ENTRADA",
  cantidad: 1,
  lote: "",
  vencimiento: "",
  costo: undefined,
  motivo: "",
};

export function RegistrarEntradaDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<MovimientoInput>({
    resolver: zodResolver(movimientoSchema),
    defaultValues: DEFAULT_VALUES,
  });

  async function handleSubmit(values: MovimientoInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/inventario/movimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error("No se pudo registrar el movimiento", { description: data.error });
        return;
      }

      toast.success("Movimiento registrado");
      form.reset(DEFAULT_VALUES);
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) form.reset(DEFAULT_VALUES);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <PackagePlus className="size-4" />
          Registrar entrada
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar movimiento de stock</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="productoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Producto *</FormLabel>
                  <FormControl>
                    <ProductoSelect value={field.value} onChange={(id) => field.onChange(id)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS_MOVIMIENTO_MANUAL.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {TIPO_LABELS[tipo]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cantidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value as number}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="lote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lote</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vencimiento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="costo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo unitario</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Opcional — actualiza el costo del producto"
                      value={(field.value as number | undefined) ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Compra a proveedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Registrar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
