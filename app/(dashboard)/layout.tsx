import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Se consulta en vivo en cada visita (en vez de confiar en el JWT) para que
  // activar el pago desde /plataforma se refleje sin pedirle al usuario que
  // cierre y abra sesión de nuevo.
  const clinica = await prisma.clinica.findUnique({
    where: { id: session.user.clinicaId },
    select: { activa: true, suscripcionVenceEn: true },
  });
  const suscripcionBloqueada =
    !clinica?.activa ||
    !clinica.suscripcionVenceEn ||
    clinica.suscripcionVenceEn < new Date();
  if (suscripcionBloqueada) {
    redirect("/suscripcion");
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar
        usuarioNombre={session.user.name ?? session.user.email ?? ""}
        usuarioRol={session.user.rol}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          usuarioNombre={session.user.name ?? session.user.email ?? ""}
          usuarioRol={session.user.rol}
        />
        <main className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
