"use client";

import { useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESPECIES } from "@/lib/validations";

const ESPECIE_LABEL: Record<string, string> = {
  PERRO: "Perro",
  GATO: "Gato",
  AVE: "Ave",
  CONEJO: "Conejo",
  REPTIL: "Reptil",
  PEZ: "Pez",
  ROEDOR: "Roedor",
  OTRO: "Otro",
};

export function FiltrosPacientes({
  q,
  especie,
  sort,
}: {
  q: string;
  especie: string;
  sort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function actualizarUrl(next: { q?: string; especie?: string; sort?: string }) {
    const params = new URLSearchParams();
    const valores = { q, especie, sort, ...next };
    if (valores.q) params.set("q", valores.q);
    if (valores.especie) params.set("especie", valores.especie);
    if (valores.sort && valores.sort !== "reciente") params.set("sort", valores.sort);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => actualizarUrl({ q: value }), 300);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar por mascota o propietario..."
          defaultValue={q}
          onChange={handleQueryChange}
          className="w-64 pl-8"
        />
      </div>

      <Select
        value={especie || "TODAS"}
        onValueChange={(v) => actualizarUrl({ especie: v === "TODAS" ? "" : v })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Especie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODAS">Todas las especies</SelectItem>
          {ESPECIES.map((e) => (
            <SelectItem key={e} value={e}>
              {ESPECIE_LABEL[e]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort || "reciente"} onValueChange={(v) => actualizarUrl({ sort: v })}>
        <SelectTrigger>
          <SelectValue placeholder="Ordenar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="reciente">Más recientes</SelectItem>
          <SelectItem value="nombre">Nombre (A-Z)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
