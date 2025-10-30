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

    const pago = await prisma.otroPago.update({
      where: { id },
      data: {
        proveedor: body.proveedor,
        ruc: body.ruc || null,
        cuentaDestino: body.cuentaDestino || null,
        fechaPago: new Date(body.fechaPago),
        fechaVencimiento: body.fechaVencimiento ? new Date(body.fechaVencimiento) : null,
        periodo: body.periodo,
        categoria: body.categoria,
        monto: parseFloat(body.monto),
        descripcion: body.descripcion,
        numeroFactura: body.numeroFactura || null,
        numeroDocumento: body.numeroDocumento || null,
        metodoPago: body.metodoPago,
        estado: body.estado,
        observaciones: body.observaciones || null,
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
