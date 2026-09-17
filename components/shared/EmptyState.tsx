import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

// El plan original pide una "ilustración SVG" — se usa un ícono de Lucide en
// vez de un asset ilustrado a medida porque el proyecto no tiene ilustraciones
// propias y agregar un set nuevo solo para esto es más peso del que un MVP
// gratuito necesita; el círculo de color + ícono ya comunica el estado vacío
// con el mismo lenguaje visual que StatsCard/ResumenCard.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-[#E1F5EE] text-[#0F6E56]">
        <Icon className="size-7" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {action && (
        <Button asChild className="mt-2 bg-[#0F6E56] hover:bg-[#1D9E75] text-white">
          <Link href={action.href}>
            <Plus className="size-4" />
            {action.label}
          </Link>
        </Button>
      )}
    </div>
  );
}
