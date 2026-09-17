"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Dog, Cat, Bird, Rabbit, Fish, Squirrel, Turtle, PawPrint } from "lucide-react";

import { pacienteSchema, type PacienteInput, ESPECIES, SEXOS } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

const ESPECIE_ICONO: Record<string, typeof Dog> = {
  PERRO: Dog,
  GATO: Cat,
  AVE: Bird,
  CONEJO: Rabbit,
  REPTIL: Turtle,
  PEZ: Fish,
  ROEDOR: Squirrel,
  OTRO: PawPrint,
};

const ESPECIE_LABEL: Record<string, string> = {
  PERRO: "Perro",
  GATO: "Gato",
  AVE: "Ave",
  CONEJO: "Conejo",
  REPTIL: "Reptil",
  PEZ: "Pez",
  ROEDOR: "Roedor",
  OTRO: "Otro",
};

const SEXO_LABEL: Record<string, string> = {
  MACHO: "Macho",
  HEMBRA: "Hembra",
  DESCONOCIDO: "Desconocido",
};

export function PacienteForm({
  defaultValues,
  clienteInicial,
  onSubmit,
  submitLabel = "Guardar",
}: {
  defaultValues?: Partial<PacienteInput>;
  clienteInicial?: { id: string; label: string };
  onSubmit: (values: PacienteInput) => Promise<void>;
  submitLabel?: string;
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm<PacienteInput>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      clienteId: clienteInicial?.id ?? "",
      nombre: "",
      especie: "PERRO",
      raza: "",
      color: "",
      sexo: "DESCONOCIDO",
      fechaNacimiento: "",
      peso: "",
      chipId: "",
      fotoUrl: "",
      alergias: "",
      condiciones: "",
      esterilizado: false,
      notas: "",
      ...defaultValues,
    },
  });

  async function handleSubmit(values: PacienteInput) {
    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="clienteId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Propietario *</FormLabel>
              <FormControl>
                <PropietarioSelect
                  value={field.value}
                  initialLabel={clienteInicial?.label}
                  onChange={(id) => field.onChange(id)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Firulais" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="especie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especie *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ESPECIES.map((especie) => {
                      const Icono = ESPECIE_ICONO[especie];
                      return (
                        <SelectItem key={especie} value={especie}>
                          <Icono className="size-4 text-gray-500" />
                          {ESPECIE_LABEL[especie]}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sexo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SEXOS.map((sexo) => (
                      <SelectItem key={sexo} value={sexo}>
                        {SEXO_LABEL[sexo]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="raza"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raza</FormLabel>
                <FormControl>
                  <Input placeholder="Labrador" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="Dorado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="fechaNacimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de nacimiento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="peso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" placeholder="4.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="chipId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chip ID</FormLabel>
                <FormControl>
                  <Input placeholder="985121..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="fotoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de foto</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="alergias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alergias conocidas</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="Penicilina, polen..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="condiciones"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condiciones crónicas</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="Diabetes, artritis..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="esterilizado"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="esterilizado"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-[#0F6E56] focus:ring-[#1D9E75]"
                />
                <Label htmlFor="esterilizado" className="cursor-pointer font-normal">
                  ¿Esterilizado?
                </Label>
              </div>
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
                <Textarea rows={3} placeholder="Notas internas" {...field} />
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
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
