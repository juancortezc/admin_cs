-- CreateEnum
CREATE TYPE "FormaPago" AS ENUM ('TRANSFERENCIA', 'EFECTIVO', 'CHEQUE');

-- AlterTable CobroArriendo
ALTER TABLE "CobroArriendo" ADD COLUMN "formaPago" "FormaPago";
ALTER TABLE "CobroArriendo" ADD COLUMN "referencia" TEXT;

-- AlterTable PagoServicio
ALTER TABLE "PagoServicio" ADD COLUMN "formaPago" "FormaPago";
ALTER TABLE "PagoServicio" ADD COLUMN "referencia" TEXT;

-- AlterTable PagoSalario
ALTER TABLE "PagoSalario" ADD COLUMN "formaPago" "FormaPago";
ALTER TABLE "PagoSalario" ADD COLUMN "referencia" TEXT;

-- AlterTable OtroPago
ALTER TABLE "OtroPago" ADD COLUMN "formaPago" "FormaPago";
ALTER TABLE "OtroPago" ADD COLUMN "referencia" TEXT;
