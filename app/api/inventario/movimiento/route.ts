import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { movimientoSchema } from "@/lib/validations";
import { registrarMovimiento } from "@/lib/inventario";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = movimientoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  try {
    const movimiento = await registrarMovimiento(session.user.clinicaId, parsed.data);
    return NextResponse.json(movimiento, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "No se pudo registrar el movimiento",
      },
      { status: 400 }
    );
  }
}
