"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Check } from "lucide-react";

import { Input } from "@/components/ui/input";

type ProductoOpcion = {
  id: string;
  nombre: string;
  unidad: string;
  stockActual: number;
  precioVenta: number;
};

export function ProductoSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string, nombre: string, precioVenta: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [resultados, setResultados] = useState<ProductoOpcion[]>([]);
  const [abierto, setAbierto] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleQueryChange(v: string) {
    setQuery(v);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!v.trim()) {
        setResultados([]);
        return;
      }
      fetch(`/api/productos/buscar?q=${encodeURIComponent(v)}`)
        .then((r) => r.json())
        .then((data) => setResultados(data.productos ?? []));
    }, 300);
  }

  function seleccionar(p: ProductoOpcion) {
    setSelectedLabel(`${p.nombre} (stock: ${p.stockActual} ${p.unidad})`);
    onChange(p.id, p.nombre, p.precioVenta);
    setAbierto(false);
    setQuery("");
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder={selectedLabel || "Buscar producto..."}
          value={query}
          onChange={(e) => {
            handleQueryChange(e.target.value);
            setAbierto(true);
          }}
          onFocus={() => setAbierto(true)}
          className="pl-8"
        />
      </div>

      {selectedLabel && (
        <p className="mt-1 text-xs text-gray-500">
          Seleccionado: <span className="font-medium text-gray-700">{selectedLabel}</span>
        </p>
      )}

      {abierto && resultados.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-md">
          {resultados.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => seleccionar(p)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              <span>
                {p.nombre}{" "}
                <span className="text-xs text-gray-400">
                  (stock: {p.stockActual} {p.unidad})
                </span>
              </span>
              {value === p.id && <Check className="size-4 text-[#0F6E56]" />}
            </button>
          ))}
        </div>
      )}

      {abierto && query.trim() && resultados.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-100 bg-white p-3 text-sm text-gray-400 shadow-md">
          No se encontraron productos.
        </div>
      )}
    </div>
  );
}
