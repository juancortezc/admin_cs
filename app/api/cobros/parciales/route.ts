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
          espacio: cobro.espacio,
          periodo: cobro.periodo,
          montoPactado: cobro.montoPactado,
          totalPagado: 0,
          totalPendiente: 0,
          porcentajePagado: 0,
          cobros: [],
        }
      }

      grupos[key].cobros.push(cobro)
      grupos[key].totalPagado += cobro.montoPagado
    })

    // Calcular totales y porcentajes
    Object.keys(grupos).forEach((key) => {
      const grupo = grupos[key]
      grupo.totalPendiente = grupo.montoPactado - grupo.totalPagado
      grupo.porcentajePagado = (grupo.totalPagado / grupo.montoPactado) * 100
    })

    // Convertir a array
    const gruposArray = Object.values(grupos)

    return NextResponse.json({
      grupos: gruposArray,
      total: gruposArray.length,
    })
  } catch (error) {
    console.error('Error al obtener pagos parciales:', error)
    return NextResponse.json({ error: 'Error al obtener pagos parciales' }, { status: 500 })
  }
}
