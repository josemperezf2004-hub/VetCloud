"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";

import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { StockBadge } from "@/components/inventario/StockBadge";
import { CATEGORIA_LABELS, type ProductoItem } from "@/components/inventario/ProductoTable";
import { ProductoForm } from "@/components/inventario/ProductoForm";
import { RegistrarMantenimientoDialog } from "@/components/inventario/RegistrarMantenimientoDialog";
import type { ProductoInput } from "@/lib/validations";

const formatoMoneda = new Intl.NumberFormat("es", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatoFecha = new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" });

// Mismo criterio de "próximo" que el resto del dashboard (ventana de 15 días).
function colorProximoMantenimiento(fecha: Date): string {
  const hoy = new Date();
  const en15Dias = new Date(hoy);
  en15Dias.setDate(en15Dias.getDate() + 15);
  if (fecha < hoy) return "text-[#DC2626]";
  if (fecha <= en15Dias) return "text-[#D97706]";
  return "text-gray-400";
}

export function ProductoRow({
  producto,
  mostrarStockMinimo = true,
}: {
  producto: ProductoItem;
  mostrarStockMinimo?: boolean;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [registrandoMantenimiento, setRegistrandoMantenimiento] = useState(false);

  const proximoMantenimiento = producto.mantenimientos[0]?.proximoEn ?? null;
  // EQUIPO y SERVICIO no se consumen/reponen como el resto del inventario —
  // "stock bajo"/"sin stock" no son alertas reales para ellos.
  const sinAlertaDeStock = producto.categoria === "EQUIPO" || producto.categoria === "SERVICIO";

  async function handleEditar(values: ProductoInput) {
    const res = await fetch(`/api/inventario/${producto.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("No se pudo actualizar el producto", { description: data.error });
      return;
    }

    toast.success("Producto actualizado");
    setEditando(false);
    router.refresh();
  }

  async function handleEliminar() {
    setEliminando(true);
    const res = await fetch(`/api/inventario/${producto.id}`, { method: "DELETE" });
    setEliminando(false);

    if (!res.ok) {
      toast.error("No se pudo eliminar el producto");
      return;
    }

    toast.success("Producto eliminado");
    setConfirmandoEliminar(false);
    router.refresh();
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="font-medium text-gray-900">{producto.nombre}</div>
          {producto.sku && <div className="text-xs text-gray-400">SKU: {producto.sku}</div>}
          {proximoMantenimiento && (
            <div className={`text-xs ${colorProximoMantenimiento(proximoMantenimiento)}`}>
              Próximo mantenimiento: {formatoFecha.format(proximoMantenimiento)}
            </div>
          )}
        </TableCell>
        <TableCell className="text-gray-600">
          {CATEGORIA_LABELS[producto.categoria] ?? producto.categoria}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-gray-900">
              {producto.stockActual} {producto.unidad}
            </span>
            {!sinAlertaDeStock && (
              <StockBadge stockActual={producto.stockActual} stockMinimo={producto.stockMinimo} />
            )}
          </div>
        </TableCell>
        {mostrarStockMinimo && (
          <TableCell className="font-mono text-gray-600">
            {sinAlertaDeStock ? "—" : producto.stockMinimo}
          </TableCell>
        )}
        <TableCell className="font-mono text-gray-600">
          ${formatoMoneda.format(producto.precioVenta)}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
            {producto.categoria === "EQUIPO" && (
              <Button
                variant="ghost"
                size="icon"
                title="Registrar mantenimiento"
                onClick={() => setRegistrandoMantenimiento(true)}
              >
                <Wrench className="size-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setEditando(true)}>
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#DC2626] hover:text-[#DC2626]"
              onClick={() => setConfirmandoEliminar(true)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <Dialog open={editando} onOpenChange={setEditando}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
          </DialogHeader>
          <ProductoForm
            defaultValues={{
              nombre: producto.nombre,
              sku: producto.sku ?? "",
              categoria: producto.categoria as ProductoInput["categoria"],
              descripcion: producto.descripcion ?? "",
              unidad: producto.unidad,
              precioVenta: producto.precioVenta,
              precioCosto: producto.precioCosto ?? undefined,
              stockMinimo: producto.stockMinimo,
            }}
            onSubmit={handleEditar}
            submitLabel="Guardar cambios"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={confirmandoEliminar} onOpenChange={setConfirmandoEliminar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar {producto.nombre}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            El producto se ocultará del inventario y de las prescripciones, pero
            su historial de movimientos se conserva. Esta acción no borra datos
            físicamente.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmandoEliminar(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" disabled={eliminando} onClick={handleEliminar}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {producto.categoria === "EQUIPO" && (
        <RegistrarMantenimientoDialog
          productoId={producto.id}
          open={registrandoMantenimiento}
          onOpenChange={setRegistrandoMantenimiento}
        />
      )}
    </>
  );
}
