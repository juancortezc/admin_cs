/**
 * API de Cobros de Arriendos (ingresos)
 * POST - Registrar cobro de arriendo
 * GET - Listar cobros de arriendos
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const espacioId = searchParams.get('espacioId')
    const mes = searchParams.get('mes') // Formato: 2024-10

    const where: any = {}

    if (espacioId) {
      where.espacioId = espacioId
    }

    if (mes) {
      const [year, month] = mes.split('-')
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

      where.fechaCobro = {
        gte: startDate,
        lte: endDate,
      }
    }

    const cobros = await prisma.cobroArriendo.findMany({
      where,
      include: {
        espacio: {
          include: {
            arrendatario: true,
          },
        },
      },
      orderBy: { fechaCobro: 'desc' },
    })

    return NextResponse.json(cobros)
  } catch (error) {
    console.error('Error al obtener cobros:', error)
    return NextResponse.json({ error: 'Error al obtener cobros' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { espacioId, monto, fechaCobro, diasRetraso, observaciones } = body

    if (!espacioId || !monto || !fechaCobro) {
      return NextResponse.json(
        { error: 'Espacio, monto y fecha de cobro son requeridos' },
        { status: 400 }
      )
    }

    // Crear cobro de arriendo
    const cobro = await prisma.cobroArriendo.create({
      data: {
        espacioId,
        monto: parseFloat(monto),
        fechaCobro: new Date(fechaCobro),
        diasRetraso: parseInt(diasRetraso) || 0,
        observaciones,
      },
      include: {
        espacio: {
          include: {
            arrendatario: true,
          },
        },
      },
    })

    return NextResponse.json(cobro, { status: 201 })
  } catch (error) {
    console.error('Error al registrar cobro:', error)
    return NextResponse.json({ error: 'Error al registrar cobro' }, { status: 500 })
  }
}
