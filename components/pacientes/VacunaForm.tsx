"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { vacunaSchema, type VacunaInput } from "@/lib/validations";
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

export function VacunaForm({
  defaultValues,
  onSubmit,
  submitLabel = "Guardar",
}: {
  defaultValues?: Partial<VacunaInput>;
  onSubmit: (values: VacunaInput) => Promise<void>;
  submitLabel?: string;
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm<VacunaInput>({
    resolver: zodResolver(vacunaSchema),
    defaultValues: {
      nombre: "",
      lote: "",
      fabricante: "",
      aplicadaEn: "",
      proximaDosis: "",
      notas: "",
      ...defaultValues,
    },
  });

  async function handleSubmit(values: VacunaInput) {
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
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vacuna *</FormLabel>
              <FormControl>
                <Input placeholder="Antirrábica" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="lote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lote</FormLabel>
                <FormControl>
                  <Input placeholder="L-2026-04" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fabricante"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fabricante</FormLabel>
                <FormControl>
                  <Input placeholder="MSD Animal Health" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="aplicadaEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de aplicación *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="proximaDosis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Próxima dosis</FormLabel>
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
