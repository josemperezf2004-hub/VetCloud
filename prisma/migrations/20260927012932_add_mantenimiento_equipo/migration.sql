-- CreateTable
CREATE TABLE "mantenimientos_equipo" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "proveedor" TEXT,
    "realizadoEn" TIMESTAMP(3) NOT NULL,
    "proximoEn" TIMESTAMP(3),
    "costo" DOUBLE PRECISION,
    "notas" TEXT,
    "deletedAt" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mantenimientos_equipo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mantenimientos_equipo_productoId_idx" ON "mantenimientos_equipo"("productoId");

-- CreateIndex
CREATE INDEX "mantenimientos_equipo_proximoEn_idx" ON "mantenimientos_equipo"("proximoEn");

-- AddForeignKey
ALTER TABLE "mantenimientos_equipo" ADD CONSTRAINT "mantenimientos_equipo_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
