-- AlterEnum
BEGIN;
CREATE TYPE "Rol_new" AS ENUM ('ADMIN', 'VETERINARIO', 'RECEPCIONISTA');
ALTER TABLE "usuarios" ALTER COLUMN "rol" DROP DEFAULT;
ALTER TABLE "usuarios" ALTER COLUMN "rol" TYPE "Rol_new" USING ("rol"::text::"Rol_new");
ALTER TYPE "Rol" RENAME TO "Rol_old";
ALTER TYPE "Rol_new" RENAME TO "Rol";
DROP TYPE "Rol_old";
ALTER TABLE "usuarios" ALTER COLUMN "rol" SET DEFAULT 'RECEPCIONISTA';
COMMIT;

-- AlterTable
ALTER TABLE "clinicas" ADD COLUMN     "permisosPersonal" JSONB;
