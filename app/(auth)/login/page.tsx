"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PawPrint, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { loginSchema, type LoginInput } from "@/lib/validations";
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

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setLoading(true);
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error("Credenciales incorrectas", {
        description: "Revisa tu email y contraseña e intenta de nuevo.",
      });
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden md:flex md:w-2/5 flex-col justify-center items-center gap-4 bg-[#0F6E56] text-white p-12">
        <div className="flex items-center gap-3">
          <PawPrint className="size-10" strokeWidth={1.75} />
          <span className="text-3xl font-semibold tracking-tight">
            VetCloud
          </span>
        </div>
        <p className="max-w-xs text-center text-white/80">
          Gestiona tu clínica veterinaria desde cualquier lugar
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-2xl font-semibold text-gray-900">
              Inicia sesión
            </h1>
            <p className="text-sm text-gray-500">
              Ingresa tus credenciales para acceder a tu clínica
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Contraseña</FormLabel>
                      <Link
                        href="/recuperar"
                        className="text-xs font-medium text-[#0F6E56] hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
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
                Iniciar sesión
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-gray-500">
            ¿Aún no tienes una clínica registrada?{" "}
            <Link
              href="/register"
              className="font-medium text-[#0F6E56] hover:underline"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
