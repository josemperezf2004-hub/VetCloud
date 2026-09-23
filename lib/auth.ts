import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  // NextAuth v4 + CredentialsProvider no soporta sesiones de base de datos
  // (el adapter no persiste sesión para este provider) — JWT es obligatorio aquí.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const usuario = await prisma.usuario.findFirst({
          where: {
            email: credentials.email,
            deletedAt: null,
            activo: true,
          },
        });

        if (!usuario) return null;

        const passwordValida = await bcrypt.compare(
          credentials.password,
          usuario.password
        );
        if (!passwordValida) return null;

        const clinica = await prisma.clinica.findUnique({
          where: { id: usuario.clinicaId },
        });
        // No se bloquea acá por `clinica.activa`/suscripción vencida a propósito:
        // una clínica recién registrada o con la mensualidad vencida necesita
        // poder loguearse igual para llegar a `/suscripcion` (el gate real vive
        // en app/(dashboard)/layout.tsx). Acá solo se valida que la clínica exista.
        if (!clinica) return null;

        return {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          clinicaId: usuario.clinicaId,
          clinicaNombre: clinica.nombre,
          esSuperAdmin: usuario.esSuperAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = user.rol;
        token.clinicaId = user.clinicaId;
        token.clinicaNombre = user.clinicaNombre;
        token.esSuperAdmin = user.esSuperAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.rol = token.rol as string;
        session.user.clinicaId = token.clinicaId as string;
        session.user.clinicaNombre = token.clinicaNombre as string;
        session.user.esSuperAdmin = token.esSuperAdmin as boolean;
      }
      return session;
    },
  },
};
