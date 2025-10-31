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

    // Get all cobros with fechaVencimiento in the month
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
      },
      orderBy: {
        fechaVencimiento: 'asc',
      },
    })

    // Transform to calendar bill format
    const bills = cobros.map((cobro) => ({
      id: cobro.id,
      codigoInterno: cobro.codigoInterno,
      espacioId: cobro.espacio.identificador,
      espacioNombre: cobro.espacio.identificador,
      arrendatarioNombre: cobro.espacio.arrendatario?.nombre || 'Sin arrendatario',
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
    }))

    return NextResponse.json(bills)
  } catch (error) {
    console.error('Error al obtener cobros:', error)
    return NextResponse.json(
      { error: 'Error al obtener cobros del calendario' },
      { status: 500 }
    )
  }
}
