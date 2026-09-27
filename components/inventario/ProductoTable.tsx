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
  EQUIPO: "Equipo",
  INSUMO: "Insumo",
  SERVICIO: "Servicio",
  OTRO: "Otro",
};

export function ProductoTable({
  productos,
  filtrado,
  categoriaActiva,
}: {
  productos: ProductoItem[];
  filtrado: boolean;
  categoriaActiva?: string;
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

  // En las pestañas Equipos/Servicios el mínimo de stock no aplica (esas
  // categorías no se consumen/reponen), así que la columna directamente no
  // se muestra ahí — en "Todos" y el resto de pestañas sigue siendo relevante.
  const mostrarStockMinimo = categoriaActiva !== "EQUIPO" && categoriaActiva !== "SERVICIO";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Stock actual</TableHead>
          {mostrarStockMinimo && <TableHead>Stock mínimo</TableHead>}
          <TableHead>Precio</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productos.map((producto) => (
          <ProductoRow key={producto.id} producto={producto} mostrarStockMinimo={mostrarStockMinimo} />
        ))}
      </TableBody>
    </Table>
  );
}
