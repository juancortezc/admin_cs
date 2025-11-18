/**
 * API de Cobros para Calendario
 * Obtiene todos los cobros (charges to tenants) para un mes específico
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mes = searchParams.get('mes') // Formato: YYYY-MM

    if (!mes) {
      return NextResponse.json(
        { error: 'Parámetro "mes" requerido (formato: YYYY-MM)' },
        { status: 400 }
      )
    }

    const [year, month] = mes.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0, 23, 59, 59, 999)

    const bills: any[] = []

    // 1. Get all cobros with fechaVencimiento in the month
    const cobros = await prisma.cobro.findMany({
      where: {
        fechaVencimiento: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      include: {
        espacio: {
          include: {
            arrendatario: true,
          },
        },
        espacioAirbnb: true,
      },
      orderBy: {
        fechaVencimiento: 'asc',
      },
    })

    // Transform existing cobros to calendar bill format
    bills.push(...cobros.map((cobro) => {
      // Determine if this is a regular space or Airbnb space
      const isAirbnb = cobro.concepto === 'AIRBNB' && cobro.espacioAirbnb
      const espacioIdentificador = isAirbnb
        ? cobro.espacioAirbnb?.nombre || 'Airbnb'
        : cobro.espacio?.identificador || 'N/A'
      const arrendatarioNombre = isAirbnb
        ? 'Airbnb'
        : cobro.espacio?.arrendatario?.nombre || 'Sin arrendatario'

      return {
        id: cobro.id,
        codigoInterno: cobro.codigoInterno,
        espacioId: cobro.espacioId || cobro.espacioAirbnbId, // UUID for API calls
        espacioIdentificador, // Display identifier like "CS1" or Airbnb space name
        espacioNombre: espacioIdentificador,
        arrendatarioNombre,
        titulo: `${cobro.concepto}${
          cobro.conceptoPersonalizado ? ` - ${cobro.conceptoPersonalizado}` : ''
        }`,
        concepto: cobro.concepto,
        conceptoPersonalizado: cobro.conceptoPersonalizado,
        periodo: cobro.periodo,
        monto: cobro.montoPactado,
        montoPagado: cobro.montoPagado,
        montoPactado: cobro.montoPactado,
        diferencia: cobro.diferencia,
        estado: cobro.estado,
        fechaVencimiento: cobro.fechaVencimiento,
        fechaPago: cobro.fechaPago,
        fecha: cobro.fechaVencimiento, // For calendar display
        tipo: 'cobro' as const,
        formaPago: cobro.metodoPago,
        referencia: cobro.numeroComprobante,
        observaciones: cobro.observaciones,
        // Partial payment fields
        esPagoParcial: cobro.esParcial,
      }
    }))

    // 2. Generate recurring monthly cobros for active spaces with arrendatarios
    const espaciosActivos = await prisma.espacio.findMany({
      where: {
        activo: true,
        arrendatarioId: { not: null },
        diaPago: { not: null },
      },
      include: {
        arrendatario: true,
      },
    })

    // For each active space, check if there's a cobro for this month, if not, generate a pending one
    for (const espacio of espaciosActivos) {
      const periodoStr = mes // YYYY-MM format

      // Check if a cobro already exists for this space in this period
      const cobroExistente = cobros.find(
        (c) => c.espacioId === espacio.id && c.periodo === periodoStr
      )

      if (!cobroExistente && espacio.diaPago) {
        // Generate a pending cobro for this month
        const fechaVencimiento = new Date(year, month - 1, espacio.diaPago)

        // Only add if fechaVencimiento is in the current month range
        if (fechaVencimiento >= firstDay && fechaVencimiento <= lastDay) {
          bills.push({
            id: `generated-${espacio.id}-${periodoStr}`,
            codigoInterno: `PEND-${espacio.identificador}-${periodoStr}`,
            espacioId: espacio.id, // UUID for API calls
            espacioIdentificador: espacio.identificador, // Display identifier like "CS1"
            espacioNombre: espacio.identificador,
            arrendatarioNombre: espacio.arrendatario?.nombre || 'Sin arrendatario',
            titulo: `${espacio.conceptoCobro || 'RENTA'}`,
            concepto: espacio.conceptoCobro || 'RENTA',
            conceptoPersonalizado: null,
            periodo: periodoStr,
            monto: espacio.monto || 0,
            montoPagado: 0,
            montoPactado: espacio.monto || 0,
            diferencia: 0,
            estado: 'PENDIENTE',
            fechaVencimiento,
            fechaPago: null,
            fecha: fechaVencimiento,
            tipo: 'cobro' as const,
            formaPago: null,
            referencia: null,
            observaciones: null,
            esPagoParcial: false,
            isGenerated: true, // Flag to indicate this is auto-generated
          })
        }
      }
    }

    // Sort by fecha
    bills.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

    return NextResponse.json(bills)
  } catch (error) {
    console.error('Error al obtener cobros:', error)
    return NextResponse.json(
      { error: 'Error al obtener cobros del calendario' },
      { status: 500 }
    )
  }
}
