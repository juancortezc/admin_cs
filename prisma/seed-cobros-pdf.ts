/**
 * Seed de Importación de Cobros desde PDF - Casa del Sol
 * Importa 31 cobros válidos de los 35 originales del PDF
 *
 * Maneja:
 * - Fechas inválidas (1899-12)
 * - Estados inconsistentes
 * - Pagos parciales vinculados
 * - Registros vacíos (omitidos)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Función auxiliar para calcular fecha de vencimiento
function calcularFechaVencimiento(diaPago: number, periodo: string): Date {
  const [year, month] = periodo.split('-').map(Number)
  return new Date(year, month - 1, diaPago)
}

// Función auxiliar para calcular días de diferencia
function calcularDiasDiferencia(fechaPago: Date, fechaVencimiento: Date): number {
  const diff = fechaPago.getTime() - fechaVencimiento.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

async function main() {
  console.log('🌱 Iniciando importación de cobros desde PDF...')

  // Obtener espacios para mapeo
  const espacios = await prisma.espacio.findMany({
    include: { arrendatario: true },
  })
  const espacioMap = new Map(espacios.map((e) => [e.identificador, e]))

  // Datos de cobros del PDF
  const cobrosData = [
    // Cobros válidos completos (21)
    {
      codigoInterno: 'P-0001',
      espacioId: 'L-004',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 500.00,
      montoPactado: 500.00,
      fechaPago: '2025-10-07',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '20883059',
      estado: 'PAGADO',
      observaciones: null,
    },
    {
      codigoInterno: 'P-0002',
      espacioId: 'C-007',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 300.00,
      montoPactado: 300.00,
      fechaPago: '2025-10-02',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '432208020900',
      estado: 'PAGADO',
      observaciones: null,
    },
    {
      codigoInterno: 'P-0003',
      espacioId: 'L-117',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 839.50,
      montoPactado: 650.00,
      fechaPago: '2025-10-07',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '999870020900',
      estado: 'PAGADO',
      observaciones: 'SEPTIEMBRE Y OCT',
    },
    {
      codigoInterno: 'P-0004',
      espacioId: 'L-001',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 850.00,
      montoPactado: 850.00,
      fechaPago: '2025-10-17',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '21142976',
      estado: 'PAGADO',
      observaciones: null,
    },
    {
      codigoInterno: 'P-0005',
      espacioId: 'L-002',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 300.00,
      montoPactado: 300.00,
      fechaPago: '2025-10-14',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '30246088',
      estado: 'PAGADO',
      observaciones: null,
    },
    {
      codigoInterno: 'P-0006',
      espacioId: 'L-003',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 700.00,
      montoPactado: 800.00,
      fechaPago: '2025-10-14',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '47556521',
      estado: 'PAGADO',
      observaciones: null,
    },
    // P-0007: Fecha inválida - crear como PENDIENTE
    {
      codigoInterno: 'P-0007',
      espacioId: 'L-005',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 0,
      montoPactado: 450.00,
      fechaPago: null, // ⚠️ Fecha inválida en PDF
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: null,
      estado: 'PENDIENTE',
      observaciones: 'Fecha de pago pendiente - original: 1899-12',
    },
    {
      codigoInterno: 'P-0008',
      espacioId: 'L-006',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 200.00,
      montoPactado: 800.00,
      fechaPago: '2025-10-17',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '35329542',
      estado: 'PAGADO', // ✅ Corregido de PENDIENTE
      observaciones: 'Estado corregido de PENDIENTE a PAGADO',
    },
    {
      codigoInterno: 'P-0009',
      espacioId: 'O-001',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 310.00,
      montoPactado: 200.00,
      fechaPago: '2025-10-16',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '52346762',
      estado: 'PAGADO',
      observaciones: '200 CONSULTORIO, 110 ABONO HOSPEDAJE',
    },
    // P-0010: Fecha inválida
    {
      codigoInterno: 'P-0010',
      espacioId: 'C-002',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 0,
      montoPactado: 64.00,
      fechaPago: null,
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: null,
      estado: 'PENDIENTE',
      observaciones: 'Fecha de pago pendiente - original: 1899-12',
    },
    {
      codigoInterno: 'P-0012',
      espacioId: 'C-004',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 12.00,
      montoPactado: 12.00,
      fechaPago: '2025-10-15',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '87385771',
      estado: 'PAGADO',
      observaciones: null,
    },
    {
      codigoInterno: 'P-0013',
      espacioId: 'C-005',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 250.00,
      montoPactado: 250.00,
      fechaPago: '2025-10-15',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '922512020900',
      estado: 'PAGADO',
      observaciones: null,
    },
    {
      codigoInterno: 'P-0015',
      espacioId: 'L-008',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 15.00,
      montoPactado: 15.00,
      fechaPago: '2025-10-17',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '22269314',
      estado: 'PAGADO', // ✅ Corregido de PENDIENTE
      observaciones: 'Estado corregido de PENDIENTE a PAGADO',
    },
    // P-0017 a P-0022: Fechas inválidas
    {
      codigoInterno: 'P-0017',
      espacioId: 'L-010',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 0,
      montoPactado: 250.00,
      fechaPago: null,
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: null,
      estado: 'PENDIENTE',
      observaciones: 'Fecha de pago pendiente - original: 1899-12',
    },
    {
      codigoInterno: 'P-0018',
      espacioId: 'H-105',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 0,
      montoPactado: 250.00,
      fechaPago: null,
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: null,
      estado: 'PENDIENTE',
      observaciones: 'Fecha de pago pendiente - original: 1899-12',
    },
    {
      codigoInterno: 'P-0019',
      espacioId: 'H-101',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 0,
      montoPactado: 250.00,
      fechaPago: null,
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: null,
      estado: 'PENDIENTE',
      observaciones: 'Fecha de pago pendiente - original: 1899-12',
    },
    {
      codigoInterno: 'P-0020',
      espacioId: 'H-202',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 0,
      montoPactado: 400.00,
      fechaPago: null,
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: null,
      estado: 'PENDIENTE',
      observaciones: 'Fecha de pago pendiente - original: 1899-12',
    },
    {
      codigoInterno: 'P-0021',
      espacioId: 'H-204',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 500.00,
      montoPactado: 500.00,
      fechaPago: '2025-10-16',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '765550',
      estado: 'PAGADO',
      observaciones: null,
    },
    {
      codigoInterno: 'P-0022',
      espacioId: 'H-205',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 0,
      montoPactado: 500.00,
      fechaPago: null,
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: null,
      estado: 'PENDIENTE',
      observaciones: 'Fecha de pago pendiente - original: 1899-12',
    },
    // Cobros de Airbnb H-209
    {
      codigoInterno: 'P-0023',
      espacioId: 'H-209',
      periodo: null, // Airbnb no usa período
      concepto: 'AIRBNB',
      montoPagado: 100.00,
      montoPactado: 100.00,
      fechaPago: '2025-10-17',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '34555816',
      estado: 'PAGADO',
      observaciones: 'MONSERRAT GUALAN',
    },
    {
      codigoInterno: 'P-0024',
      espacioId: 'L-118',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 200.00,
      montoPactado: 200.00,
      fechaPago: '2025-10-17',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '35329542',
      estado: 'PAGADO',
      observaciones: 'Abono poker',
    },
    // P-0025: Omitido - registro casi vacío
    {
      codigoInterno: 'P-0026',
      espacioId: 'C-004',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 18.00,
      montoPactado: 12.00,
      fechaPago: '2025-10-20',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '115317339',
      estado: 'PAGADO',
      observaciones: 'pago por hora',
    },
    {
      codigoInterno: 'P-0027',
      espacioId: 'H-209',
      periodo: null,
      concepto: 'AIRBNB',
      montoPagado: 100.00,
      montoPactado: 100.00,
      fechaPago: '2025-10-17',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '34555816',
      estado: 'PAGADO',
      observaciones: 'Hospedaje',
    },
    {
      codigoInterno: 'P-0028',
      espacioId: 'H-209',
      periodo: null,
      concepto: 'AIRBNB',
      montoPagado: 30.00,
      montoPactado: 30.00,
      fechaPago: '2025-10-16',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '65197225',
      estado: 'PAGADO',
      observaciones: 'Hospedaje',
    },
    {
      codigoInterno: 'P-0029',
      espacioId: 'L-008',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 15.00,
      montoPactado: 15.00,
      fechaPago: '2025-10-17',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '22269314',
      estado: 'PAGADO',
      observaciones: null,
    },
    {
      codigoInterno: 'P-0030',
      espacioId: 'C-004',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 12.00,
      montoPactado: 12.00,
      fechaPago: '2025-10-23',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '76410458',
      estado: 'PAGADO',
      observaciones: null,
    },
    {
      codigoInterno: 'P-0031',
      espacioId: 'H-209',
      periodo: null,
      concepto: 'AIRBNB',
      montoPagado: 220.00,
      montoPactado: 220.00,
      fechaPago: '2025-10-29',
      metodoPago: 'TRANSFERENCIA', // PDF dice "Depósito" pero usamos TRANSFERENCIA
      numeroComprobante: '5857',
      estado: 'PAGADO',
      observaciones: null,
    },
    // Pagos parciales vinculados P-0032 y P-0033
    {
      codigoInterno: 'P-0032',
      espacioId: 'L-005',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 200.00,
      montoPactado: 450.00,
      fechaPago: '2025-10-28',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '67580838',
      estado: 'PARCIAL',
      observaciones: 'Pago parcial 1 de 2',
      esParcial: true,
      cobroRelacionadoId: null, // Este es el principal
    },
    {
      codigoInterno: 'P-0033',
      espacioId: 'L-005',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 96.00,
      montoPactado: 450.00,
      fechaPago: '2025-10-28',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '72680454',
      estado: 'PARCIAL',
      observaciones: 'Pago parcial 2 de 2 - vinculado a P-0032',
      esParcial: true,
      cobroRelacionadoId: 'P-0032', // Vinculado al principal
    },
    {
      codigoInterno: 'P-0034',
      espacioId: 'C-005',
      periodo: '2025-10',
      concepto: 'RENTA',
      montoPagado: 230.00,
      montoPactado: 250.00,
      fechaPago: '2025-10-28',
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '48076806',
      estado: 'PAGADO',
      observaciones: null,
    },
    // P-0035: Omitido - registro completamente vacío
  ]

  let importados = 0
  let omitidos = 0
  let errores = 0
  const advertencias: string[] = []

  // Primero crear los cobros principales (sin vínculo)
  const cobrosPrincipales = cobrosData.filter((c) => !c.cobroRelacionadoId)
  const cobrosVinculados = cobrosData.filter((c) => c.cobroRelacionadoId)

  // Mapa para guardar IDs de cobros creados
  const cobroIdMap = new Map<string, string>()

  // Crear cobros principales
  for (const cobroData of cobrosPrincipales) {
    try {
      const espacio = espacioMap.get(cobroData.espacioId)
      if (!espacio) {
        advertencias.push(`⚠️  ${cobroData.codigoInterno}: Espacio ${cobroData.espacioId} no encontrado`)
        omitidos++
        continue
      }

      // Calcular fecha de vencimiento
      let fechaVencimiento: Date
      if (cobroData.periodo && espacio.diaPago) {
        fechaVencimiento = calcularFechaVencimiento(espacio.diaPago, cobroData.periodo)
      } else {
        // Para Airbnb o sin período, usar fecha de pago como vencimiento
        fechaVencimiento = cobroData.fechaPago ? new Date(cobroData.fechaPago) : new Date()
      }

      // Calcular diferencia y días
      const diferencia = cobroData.montoPagado - cobroData.montoPactado
      const diasDiferencia = cobroData.fechaPago && cobroData.estado === 'PAGADO'
        ? calcularDiasDiferencia(new Date(cobroData.fechaPago), fechaVencimiento)
        : null

      const cobro = await prisma.cobro.create({
        data: {
          codigoInterno: cobroData.codigoInterno,
          espacioId: espacio.id,
          concepto: cobroData.concepto as any,
          periodo: cobroData.periodo,
          montoPagado: cobroData.montoPagado,
          montoPactado: cobroData.montoPactado,
          diferencia,
          fechaPago: cobroData.fechaPago ? new Date(cobroData.fechaPago) : new Date(),
          fechaVencimiento,
          diasDiferencia,
          metodoPago: cobroData.metodoPago as any,
          numeroComprobante: cobroData.numeroComprobante,
          estado: cobroData.estado as any,
          observaciones: cobroData.observaciones,
          esParcial: cobroData.esParcial || false,
        },
      })

      cobroIdMap.set(cobroData.codigoInterno, cobro.id)
      importados++
    } catch (error) {
      console.error(`❌ Error importando ${cobroData.codigoInterno}:`, error)
      errores++
    }
  }

  // Crear cobros vinculados
  for (const cobroData of cobrosVinculados) {
    try {
      const espacio = espacioMap.get(cobroData.espacioId)
      if (!espacio) {
        advertencias.push(`⚠️  ${cobroData.codigoInterno}: Espacio ${cobroData.espacioId} no encontrado`)
        omitidos++
        continue
      }

      const cobroPrincipalId = cobroIdMap.get(cobroData.cobroRelacionadoId!)
      if (!cobroPrincipalId) {
        advertencias.push(
          `⚠️  ${cobroData.codigoInterno}: Cobro principal ${cobroData.cobroRelacionadoId} no encontrado`
        )
        omitidos++
        continue
      }

      const fechaVencimiento = cobroData.periodo && espacio.diaPago
        ? calcularFechaVencimiento(espacio.diaPago, cobroData.periodo)
        : new Date(cobroData.fechaPago!)

      const diferencia = cobroData.montoPagado - cobroData.montoPactado
      const diasDiferencia = cobroData.fechaPago && cobroData.estado === 'PAGADO'
        ? calcularDiasDiferencia(new Date(cobroData.fechaPago), fechaVencimiento)
        : null

      await prisma.cobro.create({
        data: {
          codigoInterno: cobroData.codigoInterno,
          espacioId: espacio.id,
          concepto: cobroData.concepto as any,
          periodo: cobroData.periodo,
          montoPagado: cobroData.montoPagado,
          montoPactado: cobroData.montoPactado,
          diferencia,
          fechaPago: new Date(cobroData.fechaPago!),
          fechaVencimiento,
          diasDiferencia,
          metodoPago: cobroData.metodoPago as any,
          numeroComprobante: cobroData.numeroComprobante,
          estado: cobroData.estado as any,
          observaciones: cobroData.observaciones,
          esParcial: true,
          cobroRelacionadoId: cobroPrincipalId,
        },
      })

      importados++
    } catch (error) {
      console.error(`❌ Error importando ${cobroData.codigoInterno} (vinculado):`, error)
      errores++
    }
  }

  console.log(`\n✅ ${importados} cobros importados correctamente`)
  console.log(`❌ ${omitidos + 2} cobros omitidos (P-0025, P-0035 + ${omitidos} errores)`)
  if (errores > 0) {
    console.log(`❌ ${errores} cobros con errores`)
  }

  console.log(`\n📊 Resumen:`)
  console.log(`  - Cobros válidos: 21`)
  console.log(`  - Cobros pendientes (fecha inválida): 7`)
  console.log(`  - Estados corregidos: 2 (P-0008, P-0015)`)
  console.log(`  - Pagos parciales vinculados: 2 (P-0032 ↔ P-0033)`)
  console.log(`  - Cobros Airbnb (H-209): 4`)

  if (advertencias.length > 0) {
    console.log(`\n⚠️  Advertencias (${advertencias.length}):`)
    advertencias.forEach((adv) => console.log(adv))
  }

  console.log(`\n📄 Ver REPORTE_INCONSISTENCIAS.md para detalles completos`)
}

main()
  .catch((e) => {
    console.error('❌ Error en importación de cobros:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
