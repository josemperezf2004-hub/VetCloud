"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Check } from "lucide-react";

import { Input } from "@/components/ui/input";

type ClienteOpcion = { id: string; nombre: string; apellido: string };

export function PropietarioSelect({
  value,
  onChange,
  initialLabel,
}: {
  value: string;
  onChange: (id: string, label: string) => void;
  initialLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState(initialLabel ?? "");
  const [resultados, setResultados] = useState<ClienteOpcion[]>([]);
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
      fetch(`/api/clientes?q=${encodeURIComponent(v)}`)
        .then((r) => r.json())
        .then((data) => setResultados(data.clientes ?? []));
    }, 300);
  }

  function seleccionar(c: ClienteOpcion) {
    const label = `${c.nombre} ${c.apellido}`;
    setSelectedLabel(label);
    onChange(c.id, label);
    setAbierto(false);
    setQuery("");
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder={selectedLabel || "Buscar propietario por nombre..."}
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
          {resultados.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => seleccionar(c)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              <span>
                {c.nombre} {c.apellido}
              </span>
              {value === c.id && <Check className="size-4 text-[#0F6E56]" />}
            </button>
          ))}
        </div>
      )}

      {abierto && query.trim() && resultados.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-100 bg-white p-3 text-sm text-gray-400 shadow-md">
          No se encontraron propietarios.
        </div>
      )}
    </div>
  );
}
