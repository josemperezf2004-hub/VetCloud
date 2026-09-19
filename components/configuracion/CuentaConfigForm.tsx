"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cuentaConfigSchema, type CuentaConfigInput } from "@/lib/validations";
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

export function CuentaConfigForm({
  defaultValues,
  email,
  rol,
}: {
  defaultValues: CuentaConfigInput;
  email: string;
  rol: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<CuentaConfigInput>({
    resolver: zodResolver(cuentaConfigSchema),
    defaultValues: { ...defaultValues, nuevaPassword: "" },
  });

  async function handleSubmit(values: CuentaConfigInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/configuracion/cuenta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error("No se pudo actualizar tu cuenta", {
          description: data.error,
        });
        return;
      }

      toast.success("Cuenta actualizada");
      form.resetField("nuevaPassword");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FormLabel>Email</FormLabel>
            <Input value={email} disabled className="mt-2 bg-gray-50" />
          </div>
          <div>
            <FormLabel>Rol</FormLabel>
            <Input value={rol} disabled className="mt-2 bg-gray-50" />
          </div>
        </div>

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tu nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Dra. Ana Torres" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nuevaPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Dejar en blanco para no cambiarla"
                  {...field}
                />
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
