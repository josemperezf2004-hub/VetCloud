import { NextResponse } from "next/server";

import { enviarRecordatoriosPendientes } from "@/lib/recordatorios";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const resultado = await enviarRecordatoriosPendientes();
  return NextResponse.json(resultado);
}
