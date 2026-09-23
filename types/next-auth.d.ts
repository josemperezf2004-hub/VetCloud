import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    rol: string;
    clinicaId: string;
    clinicaNombre: string;
    esSuperAdmin: boolean;
  }

  interface Session {
    user: {
      id: string;
      rol: string;
      clinicaId: string;
      clinicaNombre: string;
      esSuperAdmin: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    rol: string;
    clinicaId: string;
    clinicaNombre: string;
    esSuperAdmin: boolean;
  }
}
