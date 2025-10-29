-- CreateEnum
CREATE TYPE "TipoEspacio" AS ENUM ('LOCAL', 'CONSULTORIO', 'HABITACION');

-- CreateTable
CREATE TABLE "Arrendatario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Arrendatario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Espacio" (
    "id" TEXT NOT NULL,
    "identificador" TEXT NOT NULL,
    "tipo" "TipoEspacio" NOT NULL,
    "arrendatarioId" TEXT,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "monto" DOUBLE PRECISION,
    "diaPago" INTEGER,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Espacio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Arrendatario_email_key" ON "Arrendatario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Espacio_identificador_key" ON "Espacio"("identificador");

-- CreateIndex
CREATE INDEX "Espacio_arrendatarioId_idx" ON "Espacio"("arrendatarioId");

-- CreateIndex
CREATE INDEX "Espacio_tipo_idx" ON "Espacio"("tipo");

-- AddForeignKey
ALTER TABLE "Espacio" ADD CONSTRAINT "Espacio_arrendatarioId_fkey" FOREIGN KEY ("arrendatarioId") REFERENCES "Arrendatario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
