/**
 * API de Otros Pagos - CRUD completo
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const pagos = await prisma.otroPago.findMany({
      orderBy: { fechaPago: 'desc' },
    })

    return NextResponse.json(pagos)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { descripcion, categoria, beneficiario, monto, fechaPago, recurrente, observaciones } = body

    if (!descripcion || !categoria || !monto || !fechaPago) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const pago = await prisma.otroPago.create({
      data: {
        descripcion,
        categoria,
        beneficiario,
        monto: parseFloat(monto),
        fechaPago: new Date(fechaPago),
        recurrente: recurrente || false,
        observaciones,
      },
    })

    return NextResponse.json(pago, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear pago' }, { status: 500 })
  }
}
