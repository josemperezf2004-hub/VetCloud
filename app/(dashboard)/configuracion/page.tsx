import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROL_LABELS } from "@/components/layout/nav-items";
import { ClinicaConfigForm } from "@/components/configuracion/ClinicaConfigForm";
import { CuentaConfigForm } from "@/components/configuracion/CuentaConfigForm";

export default async function ConfiguracionPage() {
  const session = await getServerSession(authOptions);
  const clinicaId = session!.user.clinicaId;
  const usuarioId = session!.user.id;

  const [clinica, usuario] = await Promise.all([
    prisma.clinica.findUniqueOrThrow({ where: { id: clinicaId } }),
    prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500">
          Datos de la clínica y de tu cuenta.
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-sm font-semibold text-gray-900">
          Datos de la clínica
        </h2>
        <ClinicaConfigForm
          email={clinica.email}
          defaultValues={{
            nombre: clinica.nombre,
            telefono: clinica.telefono ?? "",
            direccion: clinica.direccion ?? "",
          }}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-sm font-semibold text-gray-900">Mi cuenta</h2>
        <CuentaConfigForm
          email={usuario.email}
          rol={ROL_LABELS[usuario.rol] ?? usuario.rol}
          defaultValues={{ nombre: usuario.nombre }}
        />
      </div>
    </div>
  );
}
