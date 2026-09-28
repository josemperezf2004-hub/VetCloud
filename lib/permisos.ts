// Módulo puro, sin dependencias de servidor (Prisma incluido) a propósito:
// lo importa components/layout/nav-items.ts, que a su vez consumen
// Sidebar.tsx/MobileNav.tsx ("use client") — cualquier import de @/lib/prisma
// aquí metería el cliente de Prisma (y el driver `pg`) en el bundle del
// navegador. La parte que sí toca la base vive en lib/permisos-server.ts.

export const MODULOS_RESTRINGIBLES = [
  "historia_clinica",
  "inventario",
  "facturacion",
  "importar",
] as const;

export type ModuloRestringible = (typeof MODULOS_RESTRINGIBLES)[number];

export const MODULO_LABELS: Record<ModuloRestringible, string> = {
  historia_clinica: "Historia Clínica",
  inventario: "Inventario",
  facturacion: "Caja",
  importar: "Importar datos",
};

export type PermisosPersonal = {
  VETERINARIO: ModuloRestringible[];
  RECEPCIONISTA: ModuloRestringible[];
};

export const PERMISOS_DEFAULT: PermisosPersonal = {
  VETERINARIO: ["historia_clinica"],
  RECEPCIONISTA: ["inventario", "facturacion", "importar"],
};

function normalizarPermisos(permisos: unknown): PermisosPersonal {
  if (!permisos || typeof permisos !== "object") return PERMISOS_DEFAULT;
  const obj = permisos as Partial<Record<keyof PermisosPersonal, unknown>>;
  const limpiar = (valor: unknown): ModuloRestringible[] =>
    Array.isArray(valor)
      ? valor.filter((m): m is ModuloRestringible =>
          MODULOS_RESTRINGIBLES.includes(m as ModuloRestringible)
        )
      : [];
  return {
    VETERINARIO: limpiar(obj.VETERINARIO),
    RECEPCIONISTA: limpiar(obj.RECEPCIONISTA),
  };
}

export function tienePermiso(
  permisos: unknown,
  rol: string,
  modulo: ModuloRestringible
): boolean {
  if (rol === "ADMIN") return true;
  if (rol !== "VETERINARIO" && rol !== "RECEPCIONISTA") return false;
  return normalizarPermisos(permisos)[rol].includes(modulo);
}
