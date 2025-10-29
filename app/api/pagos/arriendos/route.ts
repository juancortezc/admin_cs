/**
 * API de Pagos de Arriendos
 * POST - Registrar pago de arriendo
 * GET - Listar pagos de arriendos
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

      where.fechaPago = {
        gte: startDate,
        lte: endDate,
      }
    }

    const pagos = await prisma.pagoArriendo.findMany({
      where,
      include: {
        espacio: {
          include: {
            arrendatario: true,
          },
        },
      },
      orderBy: { fechaPago: 'desc' },
    })

    return NextResponse.json(pagos)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { espacioId, monto, fechaPago, diasRetraso, observaciones } = body

    if (!espacioId || !monto || !fechaPago) {
      return NextResponse.json(
        { error: 'Espacio, monto y fecha de pago son requeridos' },
        { status: 400 }
      )
    }

    // Crear pago de arriendo
    const pago = await prisma.pagoArriendo.create({
      data: {
        espacioId,
        monto: parseFloat(monto),
        fechaPago: new Date(fechaPago),
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

    return NextResponse.json(pago, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al registrar pago' }, { status: 500 })
  }
}
