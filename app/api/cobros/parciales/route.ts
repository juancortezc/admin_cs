/**
 * API de Pagos Parciales
 * GET - Listar cobros parciales agrupados por espacio y período
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const espacioId = searchParams.get('espacioId')
    const periodo = searchParams.get('periodo')

    // Filtro base: solo cobros con esParcial = true o estado = PARCIAL
    const where: any = {
      OR: [{ esParcial: true }, { estado: 'PARCIAL' }],
    }

    if (espacioId) {
      where.espacioId = espacioId
    }

    if (periodo) {
      where.periodo = periodo
    }

    // Obtener todos los cobros parciales
    const cobrosParciales = await prisma.cobro.findMany({
      where,
      include: {
        espacio: {
          include: {
            arrendatario: true,
          },
        },
        cobroRelacionado: true, // Cobro principal al que pertenece
        pagosParciales: true, // Otros pagos parciales relacionados
      },
      orderBy: {
        fechaPago: 'desc',
      },
    })

    // Agrupar por espacio + período
    const grupos: any = {}

    cobrosParciales.forEach((cobro) => {
      const key = `${cobro.espacioId}-${cobro.periodo || 'sin-periodo'}`

      if (!grupos[key]) {
        grupos[key] = {
          espacioId: cobro.espacioId,
          espacioIdentificador: cobro.espacio.identificador,
          arrendatarioNombre: cobro.espacio.arrendatario?.nombre || 'Sin arrendatario',
          periodo: cobro.periodo || 'Sin período',
          montoPactado: cobro.montoPactado,
          totalPagado: 0,
          saldoPendiente: 0,
          cantidadPagos: 0,
          pagos: [],
        }
      }

      grupos[key].totalPagado += cobro.montoPagado
      grupos[key].cantidadPagos += 1
      grupos[key].pagos.push({
        id: cobro.id,
        codigoInterno: cobro.codigoInterno,
        montoPagado: cobro.montoPagado,
        fechaPago: cobro.fechaPago,
        metodoPago: cobro.metodoPago,
        observaciones: cobro.observaciones,
      })
    })

    // Calcular saldos pendientes
    Object.keys(grupos).forEach((key) => {
      const grupo = grupos[key]
      grupo.saldoPendiente = grupo.montoPactado - grupo.totalPagado
    })

    // Convertir a array y retornar directamente
    const gruposArray = Object.values(grupos)

    return NextResponse.json(gruposArray)
  } catch (error) {
    console.error('Error al obtener pagos parciales:', error)
    return NextResponse.json({ error: 'Error al obtener pagos parciales' }, { status: 500 })
  }
}
