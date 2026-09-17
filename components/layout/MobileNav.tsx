"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, PawPrint, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { NAV_ITEMS, ROL_LABELS } from "@/components/layout/nav-items";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

// El Sidebar (Fase 1) es "hidden md:flex" — por debajo de 768px no había
// ninguna forma de navegar entre secciones. Se reutiliza Dialog en vez de
// instalar un componente Sheet nuevo (no estaba en el set de shadcn ya
// instalado) — el contenido se estiliza para ocupar el lateral izquierdo
// como un drawer, mismo look que el Sidebar de escritorio.
export function MobileNav({
  usuarioNombre,
  usuarioRol,
}: {
  usuarioNombre: string;
  usuarioRol: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menú de navegación"
        className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 md:hidden"
      >
        <Menu className="size-5" />
      </button>

      <DialogContent
        showCloseButton={false}
        className="left-0 top-0 h-screen w-[260px] max-w-[80vw] translate-x-0 translate-y-0 rounded-none border-0 bg-[#0F6E56] p-0 text-white sm:max-w-[80vw]"
      >
        <DialogTitle className="sr-only">Menú de navegación</DialogTitle>

        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 px-5 py-5">
            <PawPrint className="size-7" strokeWidth={1.75} />
            <span className="text-lg font-semibold tracking-tight">VetCloud</span>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-2">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border-l-[3px] border-transparent px-3 py-2 text-sm text-white/80 transition-all duration-200 hover:bg-white/10",
                    active && "border-white bg-white/15 text-white"
                  )}
                >
                  <Icon className="size-4.5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4">
            <Avatar className="size-9">
              <AvatarFallback className="bg-white/15 text-white">
                {iniciales(usuarioNombre)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{usuarioNombre}</p>
              <p className="truncate text-xs text-white/70">
                {ROL_LABELS[usuarioRol] ?? usuarioRol}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="Cerrar sesión"
              className="rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
