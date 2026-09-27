"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { mantenimientoSchema, type MantenimientoInput } from "@/lib/validations";
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

export function MantenimientoForm({
  defaultValues,
  onSubmit,
  submitLabel = "Guardar",
}: {
  defaultValues?: Partial<MantenimientoInput>;
  onSubmit: (values: MantenimientoInput) => Promise<void>;
  submitLabel?: string;
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm<MantenimientoInput>({
    resolver: zodResolver(mantenimientoSchema),
    defaultValues: {
      tipo: "",
      proveedor: "",
      realizadoEn: "",
      proximoEn: "",
      costo: undefined,
      notas: "",
      ...defaultValues,
    },
  });

  async function handleSubmit(values: MantenimientoInput) {
    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo *</FormLabel>
              <FormControl>
                <Input placeholder="Calibración" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="proveedor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proveedor / técnico</FormLabel>
              <FormControl>
                <Input placeholder="Opcional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="realizadoEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha realizada *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="proximoEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Próximo mantenimiento</FormLabel>
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
              <FormLabel>Costo</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Opcional"
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
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0F6E56] hover:bg-[#1D9E75] text-white"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
