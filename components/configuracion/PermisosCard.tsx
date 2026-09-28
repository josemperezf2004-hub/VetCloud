"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { MODULOS_RESTRINGIBLES, MODULO_LABELS, type PermisosPersonal } from "@/lib/permisos";
import { ROLES_STAFF } from "@/lib/validations";
import { ROL_LABELS } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";

export function PermisosCard() {
  const [permisos, setPermisos] = useState<PermisosPersonal | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    fetch("/api/configuracion/permisos")
      .then((res) => res.json())
      .then(setPermisos)
      .finally(() => setLoading(false));
  }, []);

  function toggle(rol: (typeof ROLES_STAFF)[number], modulo: (typeof MODULOS_RESTRINGIBLES)[number]) {
    setPermisos((actual) => {
      if (!actual) return actual;
      const modulos = actual[rol].includes(modulo)
        ? actual[rol].filter((m) => m !== modulo)
        : [...actual[rol], modulo];
      return { ...actual, [rol]: modulos };
    });
  }

  async function guardar() {
    if (!permisos) return;
    setGuardando(true);
    try {
      const res = await fetch("/api/configuracion/permisos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permisos),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error("No se pudieron guardar los permisos", { description: data.error });
        return;
      }

      toast.success("Permisos actualizados");
    } finally {
      setGuardando(false);
    }
  }

  if (loading || !permisos) {
    return <Loader2 className="size-4 animate-spin text-gray-400" />;
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-gray-500">
        Elegí qué módulos puede usar cada rol. Los cambios aplican al instante, sin que la persona tenga que
        volver a iniciar sesión.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {ROLES_STAFF.map((rol) => (
          <div key={rol} className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">{ROL_LABELS[rol] ?? rol}</h3>
            <div className="space-y-2">
              {MODULOS_RESTRINGIBLES.map((modulo) => (
                <label key={modulo} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={permisos[rol].includes(modulo)}
                    onChange={() => toggle(rol, modulo)}
                    className="size-4 rounded border-gray-300 text-[#0F6E56] focus:ring-[#0F6E56]"
                  />
                  {MODULO_LABELS[modulo]}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        onClick={guardar}
        disabled={guardando}
        className="bg-[#0F6E56] hover:bg-[#1D9E75] text-white"
      >
        {guardando && <Loader2 className="size-4 animate-spin" />}
        Guardar permisos
      </Button>
    </div>
  );
}
