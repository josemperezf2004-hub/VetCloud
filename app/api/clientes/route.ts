import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clienteSchema } from "@/lib/validations";
import { listarClientes } from "@/lib/clientes";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const page = Number(searchParams.get("page") ?? 1) || 1;

  const data = await listarClientes(session.user.clinicaId, { q, page });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = clienteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const cliente = await prisma.cliente.create({
    data: {
      clinicaId: session.user.clinicaId,
      nombre: parsed.data.nombre,
      apellido: parsed.data.apellido,
      telefono: parsed.data.telefono,
      whatsapp: parsed.data.whatsapp || null,
      email: parsed.data.email || null,
      cedula: parsed.data.cedula || null,
      direccion: parsed.data.direccion || null,
      notas: parsed.data.notas || null,
    },
  });

  return NextResponse.json(cliente, { status: 201 });
}
