import { Package } from "lucide-react";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductoRow } from "@/components/inventario/ProductoRow";
import { EmptyState } from "@/components/shared/EmptyState";
import type { listarProductos } from "@/lib/inventario";

export type ProductoItem = Awaited<ReturnType<typeof listarProductos>>["productos"][number];

export const CATEGORIA_LABELS: Record<string, string> = {
  MEDICAMENTO: "Medicamento",
  VACUNA: "Vacuna",
  ALIMENTO: "Alimento",
  ACCESORIO: "Accesorio",
  INSUMO: "Insumo",
  SERVICIO: "Servicio",
  OTRO: "Otro",
};

export function ProductoTable({
  productos,
  filtrado,
}: {
  productos: ProductoItem[];
  filtrado: boolean;
}) {
  if (productos.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={filtrado ? "No se encontraron productos" : "Todavía no hay productos"}
        description={
          filtrado
            ? "Prueba con otro nombre, SKU o categoría."
            : "Registra el primer producto para llevar el control de stock e inventario."
        }
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Stock actual</TableHead>
          <TableHead>Stock mínimo</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productos.map((producto) => (
          <ProductoRow key={producto.id} producto={producto} />
        ))}
      </TableBody>
    </Table>
  );
}
