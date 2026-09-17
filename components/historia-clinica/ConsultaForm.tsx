"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { consultaSchema, type ConsultaInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SignosVitales } from "@/components/historia-clinica/SignosVitales";
import { PrescripcionForm } from "@/components/historia-clinica/PrescripcionForm";

export function ConsultaForm({
  pacienteId,
  citaId,
  pesoAnterior,
  onSubmit,
  submitLabel = "Guardar consulta",
}: {
  pacienteId: string;
  citaId?: string;
  pesoAnterior?: number | null;
  onSubmit: (values: ConsultaInput) => Promise<void>;
  submitLabel?: string;
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ConsultaInput>({
    resolver: zodResolver(consultaSchema),
    defaultValues: {
      pacienteId,
      citaId: citaId ?? "",
      peso: "",
      temperatura: "",
      frecuenciaCardiaca: "",
      frecuenciaRespiratoria: "",
      motivoConsulta: "",
      anamnesis: "",
      examenFisico: "",
      diagnostico: "",
      plan: "",
      prescripciones: [],
      notas: "",
    },
  });

  async function handleSubmit(values: ConsultaInput) {
    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <section className="space-y-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#0F6E56]">S — Subjetivo</p>
          <FormField
            control={form.control}
            name="motivoConsulta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo de consulta *</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="Vómito desde ayer..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="anamnesis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anamnesis</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    placeholder="Historia relevante contada por el propietario..."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#0F6E56]">O — Objetivo</p>
          <SignosVitales control={form.control} pesoAnterior={pesoAnterior} />
          <FormField
            control={form.control}
            name="examenFisico"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Examen físico</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="Hallazgos al examen..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#0F6E56]">A — Evaluación</p>
          <FormField
            control={form.control}
            name="diagnostico"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diagnóstico *</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="Gastroenteritis aguda" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#0F6E56]">P — Plan</p>
          <FormField
            control={form.control}
            name="plan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan terapéutico</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="Dieta blanda, control en 5 días..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <PrescripcionForm control={form.control} setValue={form.setValue} />
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <FormField
            control={form.control}
            name="notas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas adicionales</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="Notas internas" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </section>

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
