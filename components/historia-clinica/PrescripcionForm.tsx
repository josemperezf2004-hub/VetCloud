"use client";

import { useFieldArray, type Control, type UseFormSetValue } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProductoSelect } from "@/components/inventario/ProductoSelect";
import type { ConsultaInput } from "@/lib/validations";

export function PrescripcionForm({
  control,
  setValue,
}: {
  control: Control<ConsultaInput>;
  setValue: UseFormSetValue<ConsultaInput>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "prescripciones",
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Prescripciones</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              productoId: "",
              productoNombre: "",
              cantidad: 1,
              dosis: "",
              frecuencia: "",
              diasTratamiento: "",
              notas: "",
            })
          }
        >
          <Plus className="size-4" />
          Agregar medicamento
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-200 py-4 text-center text-sm text-gray-400">
          Sin prescripciones. Esta consulta no descontará inventario.
        </p>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="space-y-3 rounded-lg border border-gray-100 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <FormField
                control={control}
                name={`prescripciones.${index}.productoId` as `prescripciones.${number}.productoId`}
                render={({ field: productoIdField }) => (
                  <FormItem>
                    <FormLabel>Producto *</FormLabel>
                    <FormControl>
                      <ProductoSelect
                        value={productoIdField.value}
                        onChange={(id, nombre) => {
                          productoIdField.onChange(id);
                          setValue(
                            `prescripciones.${index}.productoNombre` as `prescripciones.${number}.productoNombre`,
                            nombre
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mt-6 text-[#DC2626] hover:text-[#DC2626]"
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <FormField
              control={control}
              name={`prescripciones.${index}.cantidad` as `prescripciones.${number}.cantidad`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      value={field.value as number}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`prescripciones.${index}.dosis` as `prescripciones.${number}.dosis`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosis</FormLabel>
                  <FormControl>
                    <Input placeholder="1 tableta" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`prescripciones.${index}.frecuencia` as `prescripciones.${number}.frecuencia`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frecuencia</FormLabel>
                  <FormControl>
                    <Input placeholder="Cada 8 horas" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`prescripciones.${index}.diasTratamiento` as `prescripciones.${number}.diasTratamiento`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Días de tratamiento</FormLabel>
                  <FormControl>
                    <Input placeholder="5 días" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name={`prescripciones.${index}.notas` as `prescripciones.${number}.notas`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas</FormLabel>
                <FormControl>
                  <Input placeholder="Administrar con comida..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );
}
