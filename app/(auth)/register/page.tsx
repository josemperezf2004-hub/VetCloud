"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PawPrint, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { registerClinicaSchema, type RegisterClinicaInput } from "@/lib/validations";
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
import { cn } from "@/lib/utils";

const STEP_1_FIELDS = ["clinicaNombre", "clinicaEmail", "clinicaTelefono"] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterClinicaInput>({
    resolver: zodResolver(registerClinicaSchema),
    defaultValues: {
      clinicaNombre: "",
      clinicaEmail: "",
      clinicaTelefono: "",
      adminNombre: "",
      adminEmail: "",
      adminPassword: "",
    },
  });

  async function handleNext() {
    const valid = await form.trigger(STEP_1_FIELDS);
    if (valid) setStep(2);
  }

  async function onSubmit(values: RegisterClinicaInput) {
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("No se pudo crear la clínica", {
        description: data.error ?? "Intenta de nuevo.",
      });
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: values.adminEmail,
      password: values.adminPassword,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.success("Clínica creada. Inicia sesión para continuar.");
      router.push("/login");
      return;
    }

    toast.success("¡Bienvenido a VetCloud!");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 text-[#0F6E56]">
            <PawPrint className="size-8" strokeWidth={1.75} />
            <span className="text-2xl font-semibold tracking-tight">
              VetCloud
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Registra tu clínica veterinaria
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2].map((n) => (
            <div
              key={n}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                n <= step ? "bg-[#0F6E56]" : "bg-gray-200"
              )}
            />
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <>
                <p className="text-sm font-medium text-gray-700">
                  Paso 1 de 2 — Datos de la clínica
                </p>

                <FormField
                  control={form.control}
                  name="clinicaNombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la clínica</FormLabel>
                      <FormControl>
                        <Input placeholder="Clínica Veterinaria San José" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clinicaEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de la clínica</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contacto@clinica.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clinicaTelefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+593 99 999 9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-[#0F6E56] hover:bg-[#1D9E75] text-white"
                >
                  Continuar
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-sm font-medium text-gray-700">
                  Paso 2 de 2 — Crea tu cuenta de administrador
                </p>

                <FormField
                  control={form.control}
                  name="adminNombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tu nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Dra. María Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tu email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="maria@clinica.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#0F6E56] hover:bg-[#1D9E75] text-white"
                  >
                    {loading && <Loader2 className="size-4 animate-spin" />}
                    Crear clínica
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-[#0F6E56] hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
