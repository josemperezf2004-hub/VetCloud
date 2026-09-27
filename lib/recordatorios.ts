import { prisma } from "@/lib/prisma";
import { enviarEmailRecordatorioCita } from "@/lib/email";

// America/Guayaquil es UTC-5 fijo, sin horario de verano — todas las clínicas
// de este proyecto son de Ecuador y el schema no tiene un campo de timezone
// por Clinica. Si algún día hay clínicas fuera de Ecuador, se agrega recién
// ahí en vez de generalizar ahora sin necesidad real.
const OFFSET_HORAS_ECUADOR = 5;

function rangoManana(): { desde: Date; hasta: Date } {
  const ahoraLocal = new Date(Date.now() - OFFSET_HORAS_ECUADOR * 60 * 60 * 1000);
  const inicioHoyLocal = Date.UTC(
    ahoraLocal.getUTCFullYear(),
    ahoraLocal.getUTCMonth(),
    ahoraLocal.getUTCDate()
  );
  const unDiaMs = 24 * 60 * 60 * 1000;
  const inicioMananaLocal = inicioHoyLocal + unDiaMs;
  const finMananaLocal = inicioMananaLocal + unDiaMs;

  return {
    desde: new Date(inicioMananaLocal + OFFSET_HORAS_ECUADOR * 60 * 60 * 1000),
    hasta: new Date(finMananaLocal + OFFSET_HORAS_ECUADOR * 60 * 60 * 1000),
  };
}

// Consulta cross-tenant a propósito (sin clinicaId en el where) — mismo
// patrón que lib/plataforma.ts, porque esto corre una sola vez para todas
// las clínicas, no dentro de una sesión de un usuario de una clínica.
export async function listarCitasParaRecordar() {
  const { desde, hasta } = rangoManana();

  return prisma.cita.findMany({
    where: {
      fechaHora: { gte: desde, lt: hasta },
      estado: { notIn: ["CANCELADA", "NO_ASISTIO"] },
      recordatorioEnviado: false,
      paciente: { cliente: { email: { not: null } } },
    },
    select: {
      id: true,
      fechaHora: true,
      clinica: { select: { nombre: true } },
      veterinario: { select: { nombre: true } },
      paciente: {
        select: { nombre: true, cliente: { select: { email: true } } },
      },
    },
  });
}

// No usa $transaction a propósito: cada recordatorio es independiente — si
// uno falla (ej. email inválido, error puntual de SMTP) los demás igual
// deben enviarse, al revés del criterio "todo o nada" de la importación
// masiva (lib/importacion.ts).
export async function enviarRecordatoriosPendientes() {
  const citas = await listarCitasParaRecordar();
  let enviados = 0;
  let fallidos = 0;

  for (const cita of citas) {
    try {
      await enviarEmailRecordatorioCita(cita.paciente.cliente!.email!, {
        clinicaNombre: cita.clinica.nombre,
        mascotaNombre: cita.paciente.nombre,
        fechaHora: cita.fechaHora,
        veterinarioNombre: cita.veterinario.nombre,
      });
      await prisma.cita.update({
        where: { id: cita.id },
        data: { recordatorioEnviado: true },
      });
      enviados++;
    } catch (error) {
      console.error(`[recordatorios] Falló el envío para la cita ${cita.id}:`, error);
      fallidos++;
    }
  }

  return { total: citas.length, enviados, fallidos };
}
