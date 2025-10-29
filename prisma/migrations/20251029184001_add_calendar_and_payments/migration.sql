-- CreateEnum
CREATE TYPE "TipoMontoServicio" AS ENUM ('FIJO', 'VARIABLE');

-- CreateTable
CREATE TABLE "PagoArriendo" (
    "id" TEXT NOT NULL,
    "espacioId" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diasRetraso" INTEGER NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PagoArriendo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicioBasico" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "proveedor" TEXT,
    "tipoMonto" "TipoMontoServicio" NOT NULL DEFAULT 'VARIABLE',
    "montoFijo" DOUBLE PRECISION,
    "diaPago" INTEGER NOT NULL,
    "numeroCuenta" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicioBasico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagoServicio" (
    "id" TEXT NOT NULL,
    "servicioBasicoId" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comprobante" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PagoServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empleado" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "email" TEXT,
    "cargo" TEXT NOT NULL,
    "salario" DOUBLE PRECISION NOT NULL,
    "diaPago" INTEGER NOT NULL,
    "fechaContratacion" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagoEmpleado" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "bonos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "descuentos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PagoEmpleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtroPago" (
    "id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "beneficiario" TEXT,
    "monto" DOUBLE PRECISION NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL,
    "recurrente" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtroPago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PagoArriendo_espacioId_idx" ON "PagoArriendo"("espacioId");

-- CreateIndex
CREATE INDEX "PagoArriendo_fechaPago_idx" ON "PagoArriendo"("fechaPago");

-- CreateIndex
CREATE INDEX "ServicioBasico_activo_idx" ON "ServicioBasico"("activo");

-- CreateIndex
CREATE INDEX "PagoServicio_servicioBasicoId_idx" ON "PagoServicio"("servicioBasicoId");

-- CreateIndex
CREATE INDEX "PagoServicio_fechaPago_idx" ON "PagoServicio"("fechaPago");

-- CreateIndex
CREATE UNIQUE INDEX "Empleado_email_key" ON "Empleado"("email");

-- CreateIndex
CREATE INDEX "Empleado_activo_idx" ON "Empleado"("activo");

-- CreateIndex
CREATE INDEX "PagoEmpleado_empleadoId_idx" ON "PagoEmpleado"("empleadoId");

-- CreateIndex
CREATE INDEX "PagoEmpleado_fechaPago_idx" ON "PagoEmpleado"("fechaPago");

-- CreateIndex
CREATE UNIQUE INDEX "PagoEmpleado_empleadoId_periodo_key" ON "PagoEmpleado"("empleadoId", "periodo");

-- CreateIndex
CREATE INDEX "OtroPago_categoria_idx" ON "OtroPago"("categoria");

-- CreateIndex
CREATE INDEX "OtroPago_fechaPago_idx" ON "OtroPago"("fechaPago");

-- AddForeignKey
ALTER TABLE "PagoArriendo" ADD CONSTRAINT "PagoArriendo_espacioId_fkey" FOREIGN KEY ("espacioId") REFERENCES "Espacio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoServicio" ADD CONSTRAINT "PagoServicio_servicioBasicoId_fkey" FOREIGN KEY ("servicioBasicoId") REFERENCES "ServicioBasico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoEmpleado" ADD CONSTRAINT "PagoEmpleado_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
