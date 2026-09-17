-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('BASICO', 'PROFESIONAL', 'EMPRESARIAL');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'VETERINARIO', 'RECEPCIONISTA', 'INVENTARIO', 'CONTADOR');

-- CreateEnum
CREATE TYPE "Especie" AS ENUM ('PERRO', 'GATO', 'AVE', 'CONEJO', 'REPTIL', 'PEZ', 'ROEDOR', 'OTRO');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MACHO', 'HEMBRA', 'DESCONOCIDO');

-- CreateEnum
CREATE TYPE "TipoCita" AS ENUM ('CONSULTA', 'VACUNA', 'CIRUGIA', 'CONTROL', 'URGENCIA', 'DESPARASITACION', 'GROOMING', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('AGENDADA', 'CONFIRMADA', 'EN_ESPERA', 'EN_CONSULTA', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO');

-- CreateEnum
CREATE TYPE "CategoriaProducto" AS ENUM ('MEDICAMENTO', 'VACUNA', 'ALIMENTO', 'ACCESORIO', 'INSUMO', 'SERVICIO', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE', 'VENCIMIENTO');

-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('PENDIENTE', 'PAGADA', 'CANCELADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'QR', 'OTRO');

-- CreateTable
CREATE TABLE "clinicas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "logoUrl" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'BASICO',
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'RECEPCIONISTA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "avatarUrl" TEXT,
    "deletedAt" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT NOT NULL,
    "whatsapp" TEXT,
    "cedula" TEXT,
    "direccion" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "especie" "Especie" NOT NULL,
    "raza" TEXT,
    "color" TEXT,
    "sexo" "Sexo" NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "peso" DOUBLE PRECISION,
    "chipId" TEXT,
    "fotoUrl" TEXT,
    "alergias" TEXT,
    "condiciones" TEXT,
    "esterilizado" BOOLEAN NOT NULL DEFAULT false,
    "fallecido" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "deletedAt" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citas" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "veterinarioId" TEXT NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL,
    "duracionMin" INTEGER NOT NULL DEFAULT 30,
    "tipo" "TipoCita" NOT NULL DEFAULT 'CONSULTA',
    "estado" "EstadoCita" NOT NULL DEFAULT 'AGENDADA',
    "motivo" TEXT,
    "notas" TEXT,
    "recordatorioEnviado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historias_clinicas" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "veterinarioId" TEXT NOT NULL,
    "citaId" TEXT,
    "peso" DOUBLE PRECISION,
    "temperatura" DOUBLE PRECISION,
    "frecuenciaCardiaca" INTEGER,
    "frecuenciaRespiratoria" INTEGER,
    "motivoConsulta" TEXT NOT NULL,
    "anamnesis" TEXT,
    "examenFisico" TEXT,
    "diagnostico" TEXT NOT NULL,
    "plan" TEXT,
    "prescripciones" JSONB,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historias_clinicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adjuntos" (
    "id" TEXT NOT NULL,
    "historiaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanioKb" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adjuntos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacunas" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "lote" TEXT,
    "fabricante" TEXT,
    "aplicadaEn" TIMESTAMP(3) NOT NULL,
    "proximaDosis" TIMESTAMP(3),
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacunas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sku" TEXT,
    "categoria" "CategoriaProducto" NOT NULL,
    "descripcion" TEXT,
    "unidad" TEXT NOT NULL DEFAULT 'unidad',
    "precioVenta" DOUBLE PRECISION NOT NULL,
    "precioCosto" DOUBLE PRECISION,
    "stockActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stockMinimo" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "stockAntes" DOUBLE PRECISION NOT NULL,
    "stockDespues" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT,
    "lote" TEXT,
    "vencimiento" TIMESTAMP(3),
    "referenciaId" TEXT,
    "referenciaType" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "estado" "EstadoFactura" NOT NULL DEFAULT 'PENDIENTE',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "metodoPago" "MetodoPago",
    "notas" TEXT,
    "emitidaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pagadaEn" TIMESTAMP(3),

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_factura" (
    "id" TEXT NOT NULL,
    "facturaId" TEXT NOT NULL,
    "productoId" TEXT,
    "descripcion" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "precioUnit" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "items_factura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinicas_email_key" ON "clinicas"("email");

-- CreateIndex
CREATE INDEX "usuarios_clinicaId_idx" ON "usuarios"("clinicaId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_clinicaId_email_key" ON "usuarios"("clinicaId", "email");

-- CreateIndex
CREATE INDEX "clientes_clinicaId_creadoEn_idx" ON "clientes"("clinicaId", "creadoEn");

-- CreateIndex
CREATE INDEX "pacientes_clinicaId_creadoEn_idx" ON "pacientes"("clinicaId", "creadoEn");

-- CreateIndex
CREATE INDEX "pacientes_clienteId_idx" ON "pacientes"("clienteId");

-- CreateIndex
CREATE INDEX "citas_clinicaId_fechaHora_idx" ON "citas"("clinicaId", "fechaHora");

-- CreateIndex
CREATE INDEX "citas_pacienteId_idx" ON "citas"("pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "historias_clinicas_citaId_key" ON "historias_clinicas"("citaId");

-- CreateIndex
CREATE INDEX "historias_clinicas_clinicaId_creadoEn_idx" ON "historias_clinicas"("clinicaId", "creadoEn");

-- CreateIndex
CREATE INDEX "historias_clinicas_pacienteId_idx" ON "historias_clinicas"("pacienteId");

-- CreateIndex
CREATE INDEX "vacunas_pacienteId_idx" ON "vacunas"("pacienteId");

-- CreateIndex
CREATE INDEX "vacunas_proximaDosis_idx" ON "vacunas"("proximaDosis");

-- CreateIndex
CREATE INDEX "productos_clinicaId_categoria_idx" ON "productos"("clinicaId", "categoria");

-- CreateIndex
CREATE INDEX "movimientos_inventario_productoId_creadoEn_idx" ON "movimientos_inventario"("productoId", "creadoEn");

-- CreateIndex
CREATE INDEX "movimientos_inventario_vencimiento_idx" ON "movimientos_inventario"("vencimiento");

-- CreateIndex
CREATE INDEX "facturas_clinicaId_emitidaEn_idx" ON "facturas"("clinicaId", "emitidaEn");

-- CreateIndex
CREATE INDEX "facturas_clienteId_idx" ON "facturas"("clienteId");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_veterinarioId_fkey" FOREIGN KEY ("veterinarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_clinicas" ADD CONSTRAINT "historias_clinicas_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_clinicas" ADD CONSTRAINT "historias_clinicas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_clinicas" ADD CONSTRAINT "historias_clinicas_veterinarioId_fkey" FOREIGN KEY ("veterinarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_clinicas" ADD CONSTRAINT "historias_clinicas_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "citas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adjuntos" ADD CONSTRAINT "adjuntos_historiaId_fkey" FOREIGN KEY ("historiaId") REFERENCES "historias_clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacunas" ADD CONSTRAINT "vacunas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_factura" ADD CONSTRAINT "items_factura_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_factura" ADD CONSTRAINT "items_factura_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
