/*
  Renombrar tablas y columnas para reflejar correctamente terminología:
  - PagoArriendo → CobroArriendo (son ingresos, no pagos)
  - PagoEmpleado → PagoSalario (más claro)
  - fechaPago → fechaCobro en CobroArriendo
*/

-- Renombrar tabla PagoArriendo a CobroArriendo
ALTER TABLE "public"."PagoArriendo" RENAME TO "CobroArriendo";

-- Renombrar columna fechaPago a fechaCobro en CobroArriendo
ALTER TABLE "public"."CobroArriendo" RENAME COLUMN "fechaPago" TO "fechaCobro";

-- Actualizar índices de CobroArriendo (Prisma los crea con nuevo nombre automáticamente)
DROP INDEX IF EXISTS "public"."PagoArriendo_espacioId_idx";
DROP INDEX IF EXISTS "public"."PagoArriendo_fechaPago_idx";

CREATE INDEX "CobroArriendo_espacioId_idx" ON "public"."CobroArriendo"("espacioId");
CREATE INDEX "CobroArriendo_fechaCobro_idx" ON "public"."CobroArriendo"("fechaCobro");

-- Renombrar tabla PagoEmpleado a PagoSalario
ALTER TABLE "public"."PagoEmpleado" RENAME TO "PagoSalario";

-- Actualizar índices de PagoSalario
DROP INDEX IF EXISTS "public"."PagoEmpleado_empleadoId_idx";
DROP INDEX IF EXISTS "public"."PagoEmpleado_fechaPago_idx";
DROP INDEX IF EXISTS "public"."PagoEmpleado_empleadoId_periodo_key";

CREATE INDEX "PagoSalario_empleadoId_idx" ON "public"."PagoSalario"("empleadoId");
CREATE INDEX "PagoSalario_fechaPago_idx" ON "public"."PagoSalario"("fechaPago");
CREATE UNIQUE INDEX "PagoSalario_empleadoId_periodo_key" ON "public"."PagoSalario"("empleadoId", "periodo");
