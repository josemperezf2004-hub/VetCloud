import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { ENTIDADES_IMPORTABLES, generarPlantilla, type EntidadImportable } from "@/lib/importacion";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const entidad = new URL(request.url).searchParams.get("entidad");
  if (!ENTIDADES_IMPORTABLES.includes(entidad as EntidadImportable)) {
    return NextResponse.json({ error: "Entidad inválida" }, { status: 400 });
  }

  const buffer = await generarPlantilla(entidad as EntidadImportable);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="plantilla-${entidad}.xlsx"`,
    },
  });
}
