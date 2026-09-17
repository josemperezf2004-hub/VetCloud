"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PropietarioSelect } from "@/components/pacientes/PropietarioSelect";
import { ESTADOS_FACTURA } from "@/lib/validations";
import { ESTADO_FACTURA_LABELS } from "@/components/facturacion/estados";

export function FiltrosFacturas({
  estado,
  fecha,
  clienteId,
  clienteLabel,
}: {
  estado: string;
  fecha?: string;
  clienteId?: string;
  clienteLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function actualizar(cambios: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(cambios)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={estado}
        onValueChange={(v) => actualizar({ estado: v === "TODOS" ? undefined : v })}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODOS">Todos los estados</SelectItem>
          {ESTADOS_FACTURA.map((e) => (
            <SelectItem key={e} value={e}>
              {ESTADO_FACTURA_LABELS[e]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={fecha ?? ""}
        onChange={(e) => actualizar({ fecha: e.target.value || undefined })}
        className="w-40"
      />

      <div className="flex items-center gap-1">
        <div className="w-56">
          <PropietarioSelect
            value={clienteId ?? ""}
            onChange={(id) => actualizar({ clienteId: id })}
            initialLabel={clienteLabel}
          />
        </div>
        {clienteId && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => actualizar({ clienteId: undefined })}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
