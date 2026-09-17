"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

import { citaSchema, type CitaInput, TIPOS_CITA } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PropietarioSelect } from "@/components/pacientes/PropietarioSelect";
import { TIPO_LABELS } from "@/components/agenda/CitaCard";

const DURACIONES = [15, 30, 45, 60, 90, 120];

type PacienteOpcion = { id: string; nombre: string; especie: string };

export function CitaForm({
  veterinarios,
  clienteInicial,
  pacienteInicial,
  defaultValues,
  onSubmit,
  submitLabel = "Guardar",
}: {
  veterinarios: { id: string; nombre: string }[];
  clienteInicial?: { id: string; label: string };
  pacienteInicial?: PacienteOpcion;
  defaultValues?: Partial<CitaInput>;
  onSubmit: (values: CitaInput) => Promise<void>;
  submitLabel?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [pacientes, setPacientes] = useState<PacienteOpcion[]>(
    pacienteInicial ? [pacienteInicial] : []
  );
  const [buscandoPacientes, setBuscandoPacientes] = useState(false);

  const fechaInicial = defaultValues?.fechaHora
    ? format(new Date(defaultValues.fechaHora), "yyyy-MM-dd")
    : "";
  const horaInicial = defaultValues?.fechaHora
    ? format(new Date(defaultValues.fechaHora), "HH:mm")
    : "";
  const [fecha, setFecha] = useState(fechaInicial);
  const [hora, setHora] = useState(horaInicial);

  const form = useForm<CitaInput>({
    resolver: zodResolver(citaSchema),
    defaultValues: {
      pacienteId: "",
      veterinarioId: "",
      fechaHora: "",
      duracionMin: 30,
      tipo: "CONSULTA",
      motivo: "",
      notas: "",
      ...defaultValues,
    },
  });

  async function handlePropietarioChange(clienteId: string) {
    form.setValue("pacienteId", "", { shouldValidate: false });
    setBuscandoPacientes(true);
    try {
      const res = await fetch(`/api/clientes/${clienteId}`);
      const data = await res.json().catch(() => ({}));
      setPacientes(res.ok ? (data.pacientes ?? []) : []);
    } finally {
      setBuscandoPacientes(false);
    }
  }

  async function handleSubmit(values: CitaInput) {
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
        <FormItem>
          <FormLabel>Propietario *</FormLabel>
          <FormControl>
            <PropietarioSelect
              value={clienteInicial?.id ?? ""}
              initialLabel={clienteInicial?.label}
              onChange={(id) => handlePropietarioChange(id)}
            />
          </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name="pacienteId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mascota *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        buscandoPacientes
                          ? "Buscando mascotas..."
                          : pacientes.length === 0
                            ? "Busca primero un propietario"
                            : "Selecciona una mascota"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {pacientes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre} ({p.especie.toLowerCase()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de cita *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIPOS_CITA.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {TIPO_LABELS[tipo]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="veterinarioId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Veterinario *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un veterinario" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {veterinarios.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="fechaHora"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha y hora *</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <FormControl>
                  <Input
                    type="date"
                    value={fecha}
                    onChange={(e) => {
                      setFecha(e.target.value);
                      if (e.target.value && hora) {
                        field.onChange(
                          new Date(`${e.target.value}T${hora}`).toISOString()
                        );
                      }
                    }}
                  />
                </FormControl>
                <FormControl>
                  <Input
                    type="time"
                    value={hora}
                    onChange={(e) => {
                      setHora(e.target.value);
                      if (fecha && e.target.value) {
                        field.onChange(
                          new Date(`${fecha}T${e.target.value}`).toISOString()
                        );
                      }
                    }}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duracionMin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duración *</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(Number(v))}
                value={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DURACIONES.map((min) => (
                    <SelectItem key={min} value={String(min)}>
                      {min} minutos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="motivo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo</FormLabel>
              <FormControl>
                <Input placeholder="Control anual, vómito, cojera..." {...field} />
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
