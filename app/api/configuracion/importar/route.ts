import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  ENTIDADES_IMPORTABLES,
  importarClientes,
  importarPacientes,
  importarProductos,
  type EntidadImportable,
} from "@/lib/importacion";
import { tienePermisoClinica } from "@/lib/permisos-server";

const MAX_BYTES = 4 * 1024 * 1024; // margen bajo el límite de payload de 4.5MB de Vercel

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!(await tienePermisoClinica(session.user.clinicaId, session.user.rol, "importar"))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const entidad = formData.get("entidad");
  const archivo = formData.get("archivo");

  if (!ENTIDADES_IMPORTABLES.includes(entidad as EntidadImportable)) {
    return NextResponse.json({ error: "Entidad inválida" }, { status: 400 });
  }
  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: "Selecciona un archivo" }, { status: 400 });
  }
  if (!archivo.name.toLowerCase().endsWith(".xlsx")) {
    return NextResponse.json({ error: "Sube un archivo .xlsx" }, { status: 400 });
  }
  if (archivo.size > MAX_BYTES) {
    return NextResponse.json({ error: "Archivo demasiado grande (máx. 4MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await archivo.arrayBuffer());

  let resultado;
  try {
    resultado =
      entidad === "clientes"
        ? await importarClientes(session.user.clinicaId, buffer)
        : entidad === "pacientes"
          ? await importarPacientes(session.user.clinicaId, buffer)
          : await importarProductos(session.user.clinicaId, buffer);
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer el archivo. Descarga la plantilla e inténtalo de nuevo." },
      { status: 400 }
    );
  }

  if (!resultado.ok) {
    return NextResponse.json({ error: "El archivo tiene errores", filas: resultado.errores }, { status: 400 });
  }
  return NextResponse.json({ creados: resultado.creados }, { status: 201 });
}
