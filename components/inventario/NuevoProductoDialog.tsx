"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductoForm } from "@/components/inventario/ProductoForm";
import type { ProductoInput } from "@/lib/validations";

export function NuevoProductoDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSubmit(values: ProductoInput) {
    const res = await fetch("/api/inventario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("No se pudo crear el producto", {
        description: data.error ?? "Intenta de nuevo.",
      });
      return;
    }

    toast.success("Producto creado");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white">
          <Plus className="size-4" />
          Nuevo producto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo producto</DialogTitle>
        </DialogHeader>
        <ProductoForm onSubmit={handleSubmit} submitLabel="Crear producto" mostrarStockInicial />
      </DialogContent>
    </Dialog>
  );
}
