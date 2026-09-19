"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { clinicaConfigSchema, type ClinicaConfigInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function ClinicaConfigForm({
  defaultValues,
  email,
}: {
  defaultValues: ClinicaConfigInput;
  email: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ClinicaConfigInput>({
    resolver: zodResolver(clinicaConfigSchema),
    defaultValues,
  });

  async function handleSubmit(values: ClinicaConfigInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/configuracion/clinica", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error("No se pudo actualizar la clínica", {
          description: data.error,
        });
        return;
      }

      toast.success("Datos de la clínica actualizados");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div>
          <FormLabel>Email de la clínica</FormLabel>
          <Input value={email} disabled className="mt-2 bg-gray-50" />
          <p className="mt-1 text-xs text-gray-500">
            El email no se puede cambiar desde aquí.
          </p>
        </div>

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la clínica *</FormLabel>
              <FormControl>
                <Input placeholder="Clínica Veterinaria San Martín" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="+593 99 999 9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Av. Siempre Viva 123" {...field} />
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
          Guardar cambios
        </Button>
      </form>
    </Form>
  );
}
