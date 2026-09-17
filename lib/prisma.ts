import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Sin esto, un DATABASE_URL faltante (ej. no cargado en Vercel) falla con un
// error críptico del driver `pg` en vez de decir qué variable falta.
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida — revisa las variables de entorno.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
