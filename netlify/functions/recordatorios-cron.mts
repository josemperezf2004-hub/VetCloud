// Equivalente al cron de Vercel (vercel.json + app/api/cron/recordatorios) pero
// para Netlify Scheduled Functions. No duplica la lógica de negocio — solo le
// pega al mismo endpoint que ya existe, con el mismo CRON_SECRET.
//
// Cron activo (2026-09-27): Netlify pasó a ser la plataforma real, así que
// este es el único cron que corre. El de vercel.json se vació en el mismo
// commit — nunca deben estar los dos activos a la vez, o se duplican los
// recordatorios a clientes reales.
import type { Config } from "@netlify/functions";

export default async () => {
  const base = process.env.URL; // Netlify inyecta la URL del propio deploy
  const res = await fetch(`${base}/api/cron/recordatorios`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  console.log("[netlify-cron] recordatorios:", res.status, await res.text());
};

export const config: Config = { schedule: "0 13 * * *" };
