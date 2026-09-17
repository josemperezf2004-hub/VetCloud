"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { productoSchema, CATEGORIAS_PRODUCTO, type ProductoInput } from "@/lib/validations";
import { CATEGORIA_LABELS } from "@/components/inventario/ProductoTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export function ProductoForm({
  defaultValues,
  onSubmit,
  submitLabel = "Guardar",
  mostrarStockInicial = false,
}: {
  defaultValues?: Partial<ProductoInput>;
  onSubmit: (values: ProductoInput) => Promise<void>;
  submitLabel?: string;
  mostrarStockInicial?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductoInput>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: "",
      sku: "",
      categoria: "MEDICAMENTO",
      descripcion: "",
      unidad: "unidad",
      precioVenta: 0,
      precioCosto: undefined,
      stockInicial: 0,
      stockMinimo: 5,
      ...defaultValues,
    },
  });

  async function handleSubmit(values: ProductoInput) {
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Amoxicilina 500mg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="Opcional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIAS_PRODUCTO.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {CATEGORIA_LABELS[categoria]}
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
            name="unidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad *</FormLabel>
                <FormControl>
                  <Input placeholder="unidad, caja, ml..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas internas sobre el producto" rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="precioVenta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de venta *</FormLabel>
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
            control={form.control}
            name="precioCosto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de costo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={(field.value as number | undefined) ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {mostrarStockInicial && (
            <FormField
              control={form.control}
              name="stockInicial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock inicial</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={(field.value as number | undefined) ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="stockMinimo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock mínimo *</FormLabel>
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
        </div>

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
