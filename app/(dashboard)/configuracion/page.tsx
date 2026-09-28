import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tienePermiso } from "@/lib/permisos";
import { ROL_LABELS } from "@/components/layout/nav-items";
import { ClinicaConfigForm } from "@/components/configuracion/ClinicaConfigForm";
import { CuentaConfigForm } from "@/components/configuracion/CuentaConfigForm";
import { ImportarDatosCard } from "@/components/configuracion/ImportarDatosCard";
import { PersonalCard } from "@/components/configuracion/PersonalCard";
import { PermisosCard } from "@/components/configuracion/PermisosCard";

export default async function ConfiguracionPage() {
  const session = await getServerSession(authOptions);
  const clinicaId = session!.user.clinicaId;
  const usuarioId = session!.user.id;
  const rol = session!.user.rol;
  const esAdmin = rol === "ADMIN";

  const [clinica, usuario] = await Promise.all([
    prisma.clinica.findUniqueOrThrow({ where: { id: clinicaId } }),
    prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } }),
  ]);

  const puedeImportar = tienePermiso(clinica.permisosPersonal, rol, "importar");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500">
          Datos de la clínica y de tu cuenta.
        </p>
      </div>

      {esAdmin && (
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
      )}

      {esAdmin && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold text-gray-900">Personal</h2>
          <PersonalCard />
        </div>
      )}

      {esAdmin && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold text-gray-900">Permisos por rol</h2>
          <PermisosCard />
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-sm font-semibold text-gray-900">Mi cuenta</h2>
        <CuentaConfigForm
          email={usuario.email}
          rol={ROL_LABELS[usuario.rol] ?? usuario.rol}
          defaultValues={{ nombre: usuario.nombre }}
        />
      </div>

      {puedeImportar && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold text-gray-900">Importar datos</h2>
          <ImportarDatosCard />
        </div>
      )}
    </div>
  );
}
