import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Heart,
  Calendar,
  FileText,
  Package,
  Receipt,
  Settings,
  CreditCard,
} from "lucide-react";

// Sin "use client": lo consumen Sidebar.tsx y MobileNav.tsx (ambos clientes,
// por su propia interactividad), pero mantenerlo en un módulo aparte y sin la
// directiva evita el problema documentado en la Fase 8 (una constante
// definida en un archivo "use client" se vuelve una referencia de cliente
// inservible si algún día un Server Component la importa directamente).
export type NavItem = { href: string; label: string; icon: LucideIcon };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/pacientes", label: "Pacientes", icon: Heart },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/historia-clinica", label: "Historia Clínica", icon: FileText },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/facturacion", label: "Facturación", icon: Receipt },
  { href: "/suscripcion", label: "Suscripción", icon: CreditCard },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export const ROL_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  VETERINARIO: "Veterinario",
  RECEPCIONISTA: "Recepcionista",
  INVENTARIO: "Inventario",
  CONTADOR: "Contador",
};
