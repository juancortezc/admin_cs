-- CreateEnum
CREATE TYPE "ConceptoCobro" AS ENUM ('RENTA', 'AIRBNB', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoCobro" AS ENUM ('PAGADO', 'PENDIENTE', 'PARCIAL');

-- AlterTable
ALTER TABLE "CobroArriendo" RENAME CONSTRAINT "PagoArriendo_pkey" TO "CobroArriendo_pkey";

-- AlterTable
ALTER TABLE "Espacio" ADD COLUMN     "conceptoCobro" "ConceptoCobro" NOT NULL DEFAULT 'RENTA',
ADD COLUMN     "montoPactado" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PagoSalario" RENAME CONSTRAINT "PagoEmpleado_pkey" TO "PagoSalario_pkey";

-- CreateTable
CREATE TABLE "Cobro" (
    "id" TEXT NOT NULL,
    "codigoInterno" TEXT NOT NULL,
    "espacioId" TEXT NOT NULL,
    "concepto" "ConceptoCobro" NOT NULL DEFAULT 'RENTA',
    "conceptoPersonalizado" TEXT,
    "periodo" TEXT,
    "montoPagado" DOUBLE PRECISION NOT NULL,
    "montoPactado" DOUBLE PRECISION NOT NULL,
    "diferencia" DOUBLE PRECISION NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "diasDiferencia" INTEGER,
    "metodoPago" "FormaPago" NOT NULL,
    "numeroComprobante" TEXT,
    "estado" "EstadoCobro" NOT NULL DEFAULT 'PENDIENTE',
    "esParcial" BOOLEAN NOT NULL DEFAULT false,
    "cobroRelacionadoId" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cobro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cobro_codigoInterno_key" ON "Cobro"("codigoInterno");

-- CreateIndex
CREATE INDEX "Cobro_espacioId_idx" ON "Cobro"("espacioId");

-- CreateIndex
CREATE INDEX "Cobro_concepto_idx" ON "Cobro"("concepto");

-- CreateIndex
CREATE INDEX "Cobro_estado_idx" ON "Cobro"("estado");

-- CreateIndex
CREATE INDEX "Cobro_fechaPago_idx" ON "Cobro"("fechaPago");

-- CreateIndex
CREATE INDEX "Cobro_periodo_idx" ON "Cobro"("periodo");

-- CreateIndex
CREATE INDEX "Cobro_cobroRelacionadoId_idx" ON "Cobro"("cobroRelacionadoId");

-- RenameForeignKey
ALTER TABLE "CobroArriendo" RENAME CONSTRAINT "PagoArriendo_espacioId_fkey" TO "CobroArriendo_espacioId_fkey";

-- RenameForeignKey
ALTER TABLE "PagoSalario" RENAME CONSTRAINT "PagoEmpleado_empleadoId_fkey" TO "PagoSalario_empleadoId_fkey";

-- AddForeignKey
ALTER TABLE "Cobro" ADD CONSTRAINT "Cobro_espacioId_fkey" FOREIGN KEY ("espacioId") REFERENCES "Espacio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobro" ADD CONSTRAINT "Cobro_cobroRelacionadoId_fkey" FOREIGN KEY ("cobroRelacionadoId") REFERENCES "Cobro"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
