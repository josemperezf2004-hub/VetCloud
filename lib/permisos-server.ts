import { prisma } from "@/lib/prisma";
import { tienePermiso, type ModuloRestringible } from "@/lib/permisos";

// Se lee en vivo (sin cachear en el JWT), mismo criterio que ya usa el gate
// de suscripción en app/(dashboard)/layout.tsx: así un cambio de permisos
// hecho por el Admin aplica sin pedirle relogin a nadie.
export async function tienePermisoClinica(
  clinicaId: string,
  rol: string,
  modulo: ModuloRestringible
): Promise<boolean> {
  if (rol === "ADMIN") return true;
  const clinica = await prisma.clinica.findUnique({
    where: { id: clinicaId },
    select: { permisosPersonal: true },
  });
  return tienePermiso(clinica?.permisosPersonal, rol, modulo);
}
