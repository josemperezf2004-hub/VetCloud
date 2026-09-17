"use client";

import { useFieldArray, useWatch, type Control, type UseFormSetValue } from "react-hook-form";
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
import type { FacturaInput } from "@/lib/validations";

const formatoMoneda = new Intl.NumberFormat("es", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function FacturaItemsForm({
  control,
  setValue,
}: {
  control: Control<FacturaInput>;
  setValue: UseFormSetValue<FacturaInput>;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Items *</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ productoId: "", descripcion: "", cantidad: 1, precioUnit: 0 })}
        >
          <Plus className="size-4" />
          Agregar item
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-200 py-4 text-center text-sm text-gray-400">
          Agrega al menos un producto o servicio a cobrar.
        </p>
      )}

      {fields.map((field, index) => {
        const item = items?.[index];
        const subtotal = (item?.cantidad ?? 0) * (item?.precioUnit ?? 0);

        return (
          <div key={field.id} className="space-y-3 rounded-lg border border-gray-100 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="mb-1.5 text-xs text-gray-500">
                  Producto del inventario (opcional — para un servicio como
                  &quot;Consulta veterinaria&quot; déjalo vacío y completa la descripción abajo)
                </p>
                <ProductoSelect
                  value={item?.productoId ?? ""}
                  onChange={(id, nombre, precioVenta) => {
                    setValue(`items.${index}.productoId` as `items.${number}.productoId`, id);
                    setValue(
                      `items.${index}.descripcion` as `items.${number}.descripcion`,
                      nombre
                    );
                    setValue(
                      `items.${index}.precioUnit` as `items.${number}.precioUnit`,
                      precioVenta
                    );
                  }}
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

            <FormField
              control={control}
              name={`items.${index}.descripcion` as `items.${number}.descripcion`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <Input placeholder="Consulta veterinaria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
              <FormField
                control={control}
                name={`items.${index}.cantidad` as `items.${number}.cantidad`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
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
                name={`items.${index}.precioUnit` as `items.${number}.precioUnit`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio unitario *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value as number}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <p className="text-xs text-gray-500">Subtotal</p>
                <p className="font-mono text-sm font-medium text-gray-900">
                  ${formatoMoneda.format(subtotal)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
