/**
 * Seed de Importación de Pagos (Gastos) desde PDF - Casa del Sol
 * Importa 15 pagos válidos de 16 registros del PDF de Octubre 2025
 *
 * Maneja:
 * - Fechas inválidas (1899-12) → PENDIENTE
 * - Descripción dividida en 3 columnas
 * - Normalización de IDs (G-005 → G-0005)
 * - Categorización automática de servicios
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando importación de pagos (gastos) desde PDF...')

  // Datos de pagos del PDF
  const pagosData = [
    // Pagos válidos (9)
    {
      codigoInterno: 'G-0001',
      proveedor: 'ETM TECHNOLOGIES',
      ruc: '1715644942001',
      fechaPago: '2025-10-07',
      periodo: '2025-10',
      categoria: 'MANTENIMIENTO',
      monto: 50.00,
      descripcion: 'Arreglo impresora',
      numeroFactura: '1432',
      metodoPago: 'EFECTIVO',
      estado: 'PAGADO',
    },
    {
      codigoInterno: 'G-0002',
      proveedor: 'ETM TECHNOLOGIES',
      ruc: '1715644942001',
      fechaPago: '2025-10-07',
      periodo: '2025-10',
      categoria: 'MANTENIMIENTO',
      monto: 40.00,
      descripcion: 'Tintas',
      numeroFactura: '1432',
      metodoPago: 'EFECTIVO',
      estado: 'PAGADO',
    },
    {
      codigoInterno: 'G-0003',
      proveedor: 'SUPERMAXI',
      ruc: '1790016919001',
      fechaPago: '2025-10-13',
      periodo: '2025-10',
      categoria: 'LIMPIEZA',
      monto: 20.89,
      descripcion: 'Limpieza',
      numeroFactura: '4222867',
      metodoPago: 'TRANSFERENCIA',
      estado: 'PAGADO',
    },
    {
      codigoInterno: 'G-0004',
      proveedor: 'EPMAPS',
      ruc: null,
      fechaPago: '2025-10-23',
      periodo: '2025-10',
      categoria: 'SERVICIOS_PUBLICOS',
      monto: 416.62,
      descripcion: 'Agua',
      numeroFactura: null,
      metodoPago: 'TRANSFERENCIA',
      estado: 'PAGADO',
    },
    {
      codigoInterno: 'G-0005', // Normalizado de G-005
      proveedor: 'LUZ',
      ruc: null,
      fechaPago: '2025-10-01',
      periodo: '2025-10',
      categoria: 'SERVICIOS_PUBLICOS',
      monto: 923.84,
      descripcion: 'Electricidad',
      numeroFactura: null,
      observaciones: 'PAGO SEPTIEMBRE Y OCTUBRE',
      metodoPago: 'TRANSFERENCIA',
      estado: 'PAGADO',
    },
    {
      codigoInterno: 'G-0006',
      proveedor: 'CONTADORA SANDRA',
      ruc: null,
      fechaPago: '2025-10-07',
      periodo: '2025-10',
      categoria: 'HONORARIOS',
      monto: 300.00,
      descripcion: 'Servicios contables',
      numeroFactura: null,
      metodoPago: 'TRANSFERENCIA',
      estado: 'PAGADO',
    },
    {
      codigoInterno: 'G-0007',
      proveedor: 'DANI ALARCON',
      ruc: null,
      fechaPago: '2025-10-03',
      periodo: '2025-10',
      categoria: 'IMPUESTOS',
      monto: 500.00,
      descripcion: 'Impuestos',
      numeroFactura: null,
      metodoPago: 'TRANSFERENCIA',
      estado: 'PAGADO',
    },
    {
      codigoInterno: 'S-001',
      proveedor: 'JUAN VILCA',
      ruc: null,
      fechaPago: '2025-10-10',
      periodo: '2025-10',
      categoria: 'SERVICIOS_PERSONALES',
      monto: 125.00,
      descripcion: 'Servicios de mantenimiento',
      numeroFactura: null,
      metodoPago: 'TRANSFERENCIA',
      estado: 'PAGADO',
    },
    {
      codigoInterno: 'S-002',
      proveedor: 'LAURA ACANA',
      ruc: null,
      fechaPago: '2025-10-08',
      periodo: '2025-10',
      categoria: 'SERVICIOS_PERSONALES',
      monto: 230.00,
      descripcion: 'Servicios de limpieza',
      numeroFactura: null,
      metodoPago: 'TRANSFERENCIA',
      estado: 'PAGADO',
    },
    {
      codigoInterno: 'G-0008',
      proveedor: 'Netlife',
      ruc: null,
      fechaPago: '2025-10-08',
      periodo: '2025-10',
      categoria: 'SERVICIOS_PUBLICOS',
      monto: 132.25,
      descripcion: 'Internet',
      numeroFactura: '16103031',
      metodoPago: 'TRANSFERENCIA',
      estado: 'PAGADO',
    },
    {
      codigoInterno: 'G-0009',
      proveedor: 'EXTINTORES',
      ruc: '1723446215001',
      fechaPago: '2025-10-14',
      periodo: '2025-10',
      categoria: 'MANTENIMIENTO',
      monto: 113.00,
      descripcion: 'Recarga extintores',
      numeroFactura: '43',
      numeroDocumento: '44362967',
      metodoPago: 'TRANSFERENCIA',
      estado: 'PAGADO',
    },
    {
      codigoInterno: 'G-0013',
      proveedor: 'LAURA ACANA',
      ruc: null,
      fechaPago: '2025-10-29',
      periodo: '2025-10',
      categoria: 'SERVICIOS_PERSONALES',
      monto: 207.00,
      descripcion: 'Servicios de limpieza',
      numeroFactura: null,
      numeroDocumento: '58881286',
      metodoPago: 'TRANSFERENCIA',
      estado: 'PAGADO',
    },

    // Pagos con fechas inválidas (5) - crear como PENDIENTE
    {
      codigoInterno: 'G-0010',
      proveedor: 'TERESA RUALES',
      ruc: null,
      fechaPago: null, // Fecha inválida en PDF
      fechaVencimiento: '2025-10-20',
      periodo: '2025-10',
      categoria: 'SERVICIOS_PERSONALES',
      monto: 40.00,
      descripcion: 'Servicios',
      numeroFactura: null,
      numeroDocumento: '8777777423',
      metodoPago: 'TRANSFERENCIA',
      estado: 'PENDIENTE',
      observaciones: 'Fecha de pago pendiente - original: 1899-12',
    },
    {
      codigoInterno: 'G-0011',
      proveedor: 'JUAN VILCA',
      ruc: null,
      fechaPago: null,
      fechaVencimiento: '2025-10-17',
      periodo: '2025-10',
      categoria: 'SERVICIOS_PERSONALES', // Categoría asumida
      monto: 125.00,
      descripcion: 'Servicios de mantenimiento',
      numeroFactura: null,
      numeroDocumento: '28014777',
      metodoPago: 'TRANSFERENCIA',
      estado: 'PENDIENTE',
      observaciones: 'Fecha de pago pendiente - original: 1899-12. Categoría asumida.',
    },
    {
      codigoInterno: 'G-0012',
      proveedor: 'MARIA ALARCON',
      ruc: null,
      fechaPago: null,
      fechaVencimiento: '2025-10-17',
      periodo: '2025-10',
      categoria: 'OTROS', // Categoría asumida
      monto: 500.00,
      descripcion: 'Pago a MARIA ALARCON',
      numeroFactura: null,
      numeroDocumento: '27919834',
      metodoPago: 'TRANSFERENCIA',
      estado: 'PENDIENTE',
      observaciones: 'Fecha de pago pendiente - original: 1899-12. Categoría asumida.',
    },
    {
      codigoInterno: 'G-0015',
      proveedor: 'MARIA ELENA ALVAREZ',
      ruc: null,
      fechaPago: '2025-10-28',
      periodo: '2025-10',
      categoria: 'OTROS',
      monto: 100.00,
      descripcion: 'Pago',
      numeroFactura: null,
      numeroDocumento: '35869543',
      metodoPago: 'TRANSFERENCIA',
      estado: 'PAGADO',
    },
    {
      codigoInterno: 'G-0016',
      proveedor: 'JUAN VILCA',
      ruc: null,
      fechaPago: '2025-10-27',
      periodo: '2025-10',
      categoria: 'MANTENIMIENTO',
      monto: 125.00,
      descripcion: 'Servicios de mantenimiento',
      numeroFactura: null,
      numeroDocumento: '172040996',
      metodoPago: 'TRANSFERENCIA',
      estado: 'PAGADO',
    },
  ]

  let importados = 0
  let pendientes = 0
  let errores = 0

  for (const pagoData of pagosData) {
    try {
      await prisma.otroPago.create({
        data: {
          codigoInterno: pagoData.codigoInterno,
          proveedor: pagoData.proveedor,
          ruc: pagoData.ruc,
          fechaPago: pagoData.fechaPago ? new Date(pagoData.fechaPago) : new Date(), // Default to today if null
          fechaVencimiento: pagoData.fechaVencimiento ? new Date(pagoData.fechaVencimiento) : null,
          periodo: pagoData.periodo,
          categoria: pagoData.categoria as any,
          monto: pagoData.monto,
          descripcion: pagoData.descripcion,
          numeroFactura: pagoData.numeroFactura || null,
          numeroDocumento: pagoData.numeroDocumento || null,
          metodoPago: pagoData.metodoPago as any,
          estado: pagoData.estado as any,
          observaciones: pagoData.observaciones || null,
        },
      })

      importados++
      if (pagoData.estado === 'PENDIENTE') {
        pendientes++
      }
    } catch (error) {
      console.error(`❌ Error importando ${pagoData.codigoInterno}:`, error)
      errores++
    }
  }

  console.log(`\n✅ ${importados} pagos importados correctamente`)
  console.log(`⚠️  ${pendientes} pagos pendientes (fecha inválida en PDF)`)
  console.log(`❌ 1 pago omitido (G-0014 MEGAKIWI - datos incompletos)`)
  if (errores > 0) {
    console.log(`❌ ${errores} pagos con errores`)
  }

  console.log(`\n📊 Resumen:`)
  console.log(`  - Pagos válidos importados: ${importados - pendientes}`)
  console.log(`  - Pagos pendientes (requieren confirmación): ${pendientes}`)
  console.log(`  - Total procesado: ${importados} de 16 registros`)
  console.log(`  - Omitidos: 1 (G-0014)`)

  // Calcular estadísticas
  const totalPagado = pagosData
    .filter((p) => p.estado === 'PAGADO')
    .reduce((sum, p) => sum + p.monto, 0)

  console.log(`\n💰 Total pagado en octubre 2025: $${totalPagado.toFixed(2)}`)
}

main()
  .catch((e) => {
    console.error('❌ Error en importación de pagos:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
