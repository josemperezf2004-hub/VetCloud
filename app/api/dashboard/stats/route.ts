import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getEstadisticasHoy } from "@/lib/dashboard";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const stats = await getEstadisticasHoy(session.user.clinicaId);

  return NextResponse.json(stats);
}
