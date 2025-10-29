/**
 * API de Otros Pagos - Operaciones individuales
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const { descripcion, categoria, beneficiario, monto, fechaPago, recurrente, observaciones } = body

    const pago = await prisma.otroPago.update({
      where: { id },
      data: {
        descripcion,
        categoria,
        beneficiario,
        monto: parseFloat(monto),
        fechaPago: new Date(fechaPago),
        recurrente,
        observaciones,
      },
    })

    return NextResponse.json(pago)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error al actualizar pago' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params
    await prisma.otroPago.delete({ where: { id } })
    return NextResponse.json({ message: 'Pago eliminado' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar pago' }, { status: 500 })
  }
}
