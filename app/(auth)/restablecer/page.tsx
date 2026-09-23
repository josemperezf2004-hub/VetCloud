"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PawPrint, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { restablecerPasswordSchema, type RestablecerPasswordInput } from "@/lib/validations";
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

function RestablecerFormulario() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);

  const form = useForm<RestablecerPasswordInput>({
    resolver: zodResolver(restablecerPasswordSchema),
    defaultValues: { token, password: "" },
  });

  async function onSubmit(values: RestablecerPasswordInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/restablecer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo restablecer la contraseña");
        return;
      }
      toast.success("Contraseña actualizada, ya podés iniciar sesión");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center md:text-left">
        <h1 className="text-2xl font-semibold text-gray-900">Enlace inválido</h1>
        <p className="text-sm text-gray-500">
          Este enlace no incluye un token válido. Solicita uno nuevo.
        </p>
        <Link
          href="/recuperar"
          className="inline-block text-sm font-medium text-[#0F6E56] hover:underline"
        >
          Solicitar enlace de nuevo
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1 text-center md:text-left">
        <h1 className="text-2xl font-semibold text-gray-900">Crea una nueva contraseña</h1>
        <p className="text-sm text-gray-500">
          Elegí una contraseña nueva para tu cuenta de VetCloud.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nueva contraseña</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
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
            Guardar contraseña
          </Button>
        </form>
      </Form>
    </>
  );
}

export default function RestablecerPage() {
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
          <Suspense fallback={null}>
            <RestablecerFormulario />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
