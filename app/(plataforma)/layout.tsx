import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { PawPrint } from "lucide-react";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { CerrarSesionButton } from "@/components/suscripcion/CerrarSesionButton";

export default async function PlataformaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.esSuperAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
        <Link href="/plataforma/clinicas" className="flex items-center gap-2 text-[#0F6E56]">
          <PawPrint className="size-6" strokeWidth={1.75} />
          <span className="text-lg font-semibold tracking-tight">
            VetCloud — Plataforma
          </span>
        </Link>
        <CerrarSesionButton />
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
