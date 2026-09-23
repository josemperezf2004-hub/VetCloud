"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PawPrint, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { recuperarPasswordSchema, type RecuperarPasswordInput } from "@/lib/validations";
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

export default function RecuperarPage() {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const form = useForm<RecuperarPasswordInput>({
    resolver: zodResolver(recuperarPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: RecuperarPasswordInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        toast.error("No se pudo procesar la solicitud");
        return;
      }
      setEnviado(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden md:flex md:w-2/5 flex-col justify-center items-center gap-4 bg-[#0F6E56] text-white p-12">
        <div className="flex items-center gap-3">
          <PawPrint className="size-10" strokeWidth={1.75} />
          <span className="text-3xl font-semibold tracking-tight">VetCloud</span>
        </div>
        <p className="max-w-xs text-center text-white/80">
          Gestiona tu clínica veterinaria desde cualquier lugar
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm space-y-8">
          {enviado ? (
            <div className="space-y-4 text-center md:text-left">
              <h1 className="text-2xl font-semibold text-gray-900">Revisa tu email</h1>
              <p className="text-sm text-gray-500">
                Si existe una cuenta con ese email, te enviamos un enlace para
                restablecer tu contraseña. Vence en 1 hora.
              </p>
              <Link
                href="/login"
                className="inline-block text-sm font-medium text-[#0F6E56] hover:underline"
              >
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-1 text-center md:text-left">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Recupera tu contraseña
                </h1>
                <p className="text-sm text-gray-500">
                  Ingresa tu email y te enviamos un enlace para crear una nueva
                  contraseña.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="tu@clinica.com"
                            autoComplete="email"
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
                    className="w-full bg-[#0F6E56] hover:bg-[#1D9E75] text-white"
                  >
                    {loading && <Loader2 className="size-4 animate-spin" />}
                    Enviar enlace
                  </Button>
                </form>
              </Form>

              <p className="text-center text-sm text-gray-500">
                <Link href="/login" className="font-medium text-[#0F6E56] hover:underline">
                  Volver a iniciar sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
