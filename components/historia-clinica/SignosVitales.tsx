"use client";

import type { Control } from "react-hook-form";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { ConsultaInput } from "@/lib/validations";

export function SignosVitales({
  control,
  pesoAnterior,
}: {
  control: Control<ConsultaInput>;
  pesoAnterior?: number | null;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">Signos vitales</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FormField
          control={control}
          name="peso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peso (kg)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" min="0" placeholder="4.5" {...field} />
              </FormControl>
              <FormMessage />
              {pesoAnterior != null && field.value && (
                <ComparativoPeso anterior={pesoAnterior} actual={Number(field.value)} />
              )}
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="temperatura"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Temperatura (°C)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="38.5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="frecuenciaCardiaca"
          render={({ field }) => (
            <FormItem>
              <FormLabel>FC (lpm)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="90" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="frecuenciaRespiratoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>FR (rpm)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="20" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function ComparativoPeso({ anterior, actual }: { anterior: number; actual: number }) {
  if (isNaN(actual)) return null;
  const diferencia = actual - anterior;
  const Icono = diferencia > 0 ? ArrowUp : diferencia < 0 ? ArrowDown : Minus;
  const color =
    diferencia > 0
      ? "text-[#D97706]"
      : diferencia < 0
        ? "text-[#DC2626]"
        : "text-gray-500";

  return (
    <p className={`mt-1 flex items-center gap-1 text-xs ${color}`}>
      <Icono className="size-3" />
      {diferencia === 0
        ? "Sin cambio"
        : `${diferencia > 0 ? "+" : ""}${diferencia.toFixed(1)} kg`}{" "}
      vs. último peso ({anterior} kg)
    </p>
  );
}
