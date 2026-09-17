import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
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

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <div className="print:hidden">
        <Sidebar
          usuarioNombre={session.user.name ?? session.user.email ?? ""}
          usuarioRol={session.user.rol}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="print:hidden">
          <Header
            usuarioNombre={session.user.name ?? session.user.email ?? ""}
            usuarioRol={session.user.rol}
          />
        </div>
        <main className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
