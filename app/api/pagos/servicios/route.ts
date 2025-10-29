/**
 * API de Pagos de Servicios Básicos
 * POST - Registrar pago de servicio
 * GET - Listar pagos de servicios
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const servicioBasicoId = searchParams.get('servicioBasicoId')
    const mes = searchParams.get('mes') // Formato: 2024-10

    const where: any = {}

    if (servicioBasicoId) {
      where.servicioBasicoId = servicioBasicoId
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

    const pagos = await prisma.pagoServicio.findMany({
      where,
      include: {
        servicioBasico: true,
      },
      orderBy: { fechaPago: 'desc' },
    })

    return NextResponse.json(pagos)
  } catch (error) {
    console.error('Error al obtener pagos:', error)
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { servicioBasicoId, monto, fechaPago, formaPago, referencia, observaciones } = body

    if (!servicioBasicoId || !monto || !fechaPago) {
      return NextResponse.json(
        { error: 'Servicio, monto y fecha de pago son requeridos' },
        { status: 400 }
      )
    }

    // Crear pago de servicio
    const pago = await prisma.pagoServicio.create({
      data: {
        servicioBasicoId,
        monto: parseFloat(monto),
        fechaPago: new Date(fechaPago),
        formaPago: formaPago || undefined,
        referencia: referencia || undefined,
        observaciones,
      },
      include: {
        servicioBasico: true,
      },
    })

    return NextResponse.json(pago, { status: 201 })
  } catch (error) {
    console.error('Error al registrar pago:', error)
    return NextResponse.json({ error: 'Error al registrar pago' }, { status: 500 })
  }
}
