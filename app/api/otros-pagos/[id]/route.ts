/**
 * API de Otros Pagos - Operaciones individuales
 * GET, PUT, DELETE
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const pago = await prisma.otroPago.findUnique({
      where: { id },
      include: {
        pagoRecurrente: true,
      },
    })

    if (!pago) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    return NextResponse.json(pago)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener pago' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    // Construir objeto de actualización solo con campos proporcionados
    const updateData: any = {}

    if (body.proveedor !== undefined) updateData.proveedor = body.proveedor
    if (body.ruc !== undefined) updateData.ruc = body.ruc || null
    if (body.cuentaDestino !== undefined) updateData.cuentaDestino = body.cuentaDestino || null
    if (body.fechaPago !== undefined) updateData.fechaPago = new Date(body.fechaPago)
    if (body.fechaVencimiento !== undefined) updateData.fechaVencimiento = body.fechaVencimiento ? new Date(body.fechaVencimiento) : null
    if (body.periodo !== undefined) updateData.periodo = body.periodo
    if (body.categoria !== undefined) updateData.categoria = body.categoria
    if (body.monto !== undefined) updateData.monto = parseFloat(body.monto)
    if (body.descripcion !== undefined) updateData.descripcion = body.descripcion
    if (body.numeroFactura !== undefined) updateData.numeroFactura = body.numeroFactura || null
    if (body.numeroDocumento !== undefined) updateData.numeroDocumento = body.numeroDocumento || null
    if (body.metodoPago !== undefined) updateData.metodoPago = body.metodoPago
    if (body.estado !== undefined) updateData.estado = body.estado
    if (body.observaciones !== undefined) updateData.observaciones = body.observaciones || null

    const pago = await prisma.otroPago.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(pago)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }
    console.error('Error al actualizar pago:', error)
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
