import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PawPrint, CircleAlert, Landmark } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CerrarSesionButton } from "@/components/suscripcion/CerrarSesionButton";

const PRECIO_MENSUAL = "$11.50 USD";
const CUENTA_BANCO = "Banco Pichincha";
const CUENTA_NUMERO = "2209703045";

export default async function SuscripcionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const clinica = await prisma.clinica.findUnique({
    where: { id: session.user.clinicaId },
    select: { nombre: true, activa: true, suscripcionVenceEn: true },
  });
  if (!clinica) {
    redirect("/login");
  }

  const nuncaPago = !clinica.suscripcionVenceEn;
  const vencida =
    !nuncaPago && clinica.suscripcionVenceEn! < new Date();

  // Si ya está todo al día, no tiene sentido quedarse en esta pantalla.
  const alDia = clinica.activa && !nuncaPago && !vencida;
  if (alDia) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-50 px-4 py-12">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#0F6E56]">
            <PawPrint className="size-7" strokeWidth={1.75} />
            <span className="text-xl font-semibold tracking-tight">VetCloud</span>
          </div>
          <CerrarSesionButton />
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3 rounded-lg bg-[#FFF3CC] p-4 text-[#D97706]">
            <CircleAlert className="size-5 shrink-0" />
            <div className="text-sm">
              {nuncaPago ? (
                <p>
                  <strong>{clinica.nombre}</strong> todavía no tiene la
                  suscripción activada. Activala con el primer pago para
                  acceder al sistema.
                </p>
              ) : (
                <p>
                  La suscripción de <strong>{clinica.nombre}</strong> venció el{" "}
                  {format(clinica.suscripcionVenceEn!, "d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                  . Renovala para recuperar el acceso.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h1 className="text-lg font-semibold text-gray-900">
              Mensualidad: {PRECIO_MENSUAL}
            </h1>

            <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <Landmark className="size-5 shrink-0 text-[#0F6E56]" />
              <div className="text-sm text-gray-700">
                <p className="font-medium text-gray-900">
                  Transferencia a {CUENTA_BANCO}
                </p>
                <p>Cuenta: {CUENTA_NUMERO}</p>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Una vez hecha la transferencia, enviá el comprobante al equipo
              de VetCloud para que activemos (o renovemos) tu cuenta. La
              activación es manual — puede tardar hasta un día hábil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
