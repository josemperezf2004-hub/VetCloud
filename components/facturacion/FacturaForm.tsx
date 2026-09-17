"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { facturaSchema, type FacturaInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PropietarioSelect } from "@/components/pacientes/PropietarioSelect";
import { FacturaItemsForm } from "@/components/facturacion/FacturaItemsForm";

const formatoMoneda = new Intl.NumberFormat("es", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function FacturaForm({
  defaultValues,
  clienteLabelInicial,
}: {
  defaultValues?: Partial<FacturaInput>;
  clienteLabelInicial?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FacturaInput>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      clienteId: "",
      items: [],
      descuento: 0,
      notas: "",
      ...defaultValues,
    },
  });

  const items = useWatch({ control: form.control, name: "items" });
  const descuento = useWatch({ control: form.control, name: "descuento" });
  const subtotal = (items ?? []).reduce(
    (acc, item) => acc + (item.cantidad || 0) * (item.precioUnit || 0),
    0
  );
  const total = Math.max(0, subtotal - (descuento || 0));

  async function handleSubmit(values: FacturaInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/facturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error("No se pudo crear la factura", {
          description: data.error ?? "Intenta de nuevo.",
        });
        return;
      }

      const factura = await res.json();
      toast.success("Factura creada");
      router.push(`/facturacion/${factura.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="clienteId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Propietario *</FormLabel>
              <FormControl>
                <PropietarioSelect
                  value={field.value}
                  onChange={(id) => field.onChange(id)}
                  initialLabel={clienteLabelInicial}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FacturaItemsForm control={form.control} setValue={form.setValue} />
        {form.formState.errors.items?.message && (
          <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="descuento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descuento</FormLabel>
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
          <div className="flex flex-col justify-end gap-1 rounded-lg bg-gray-50 p-3 text-right">
            <p className="text-xs text-gray-500">
              Subtotal: <span className="font-mono">${formatoMoneda.format(subtotal)}</span>
            </p>
            <p className="text-lg font-semibold text-gray-900">
              Total: <span className="font-mono">${formatoMoneda.format(total)}</span>
            </p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas internas sobre esta factura" rows={2} {...field} />
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
          Crear factura
        </Button>
      </form>
    </Form>
  );
}
