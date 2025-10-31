/**
 * API de Pagos Recurrentes individuales - Casa del Sol
 * GET: Obtener un pago recurrente por ID
 * PUT: Actualizar pago recurrente
 * DELETE: Eliminar pago recurrente
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener pago recurrente por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const pagoRecurrente = await prisma.pagoRecurrente.findUnique({
      where: { id },
      include: {
        pagosGenerados: {
          orderBy: { fechaPago: 'desc' },
          take: 10,
        },
        _count: {
          select: { pagosGenerados: true },
        },
      },
    })

    if (!pagoRecurrente) {
      return NextResponse.json({ error: 'Pago recurrente no encontrado' }, { status: 404 })
    }

    return NextResponse.json(pagoRecurrente)
  } catch (error) {
    console.error('Error al obtener pago recurrente:', error)
    return NextResponse.json({ error: 'Error al obtener pago recurrente' }, { status: 500 })
  }
}

// PUT - Actualizar pago recurrente
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const pagoRecurrente = await prisma.pagoRecurrente.update({
      where: { id },
      data: {
        nombre: body.nombre,
        proveedor: body.proveedor,
        ruc: body.ruc || null,
        cuentaDestino: body.cuentaDestino || null,
        categoria: body.categoria,
        descripcion: body.descripcion,
        montoFijo: body.esMontoVariable ? null : parseFloat(body.montoFijo),
        esMontoVariable: body.esMontoVariable,
        metodoPago: body.metodoPago,
        frecuencia: body.frecuencia,
        diaPago: body.diaPago ? parseInt(body.diaPago) : null,
        fechaInicio: new Date(body.fechaInicio),
        fechaFin: body.fechaFin ? new Date(body.fechaFin) : null,
        activo: body.activo,
        observaciones: body.observaciones || null,
      },
    })

    return NextResponse.json(pagoRecurrente)
  } catch (error) {
    console.error('Error al actualizar pago recurrente:', error)
    return NextResponse.json({ error: 'Error al actualizar pago recurrente' }, { status: 500 })
  }
}

// DELETE - Eliminar pago recurrente
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Verificar si tiene pagos generados
    const count = await prisma.otroPago.count({
      where: { pagoRecurrenteId: id },
    })

    if (count > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. Tiene ${count} pago(s) generado(s). Considere desactivarlo en su lugar.` },
        { status: 400 }
      )
    }

    await prisma.pagoRecurrente.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Pago recurrente eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar pago recurrente:', error)
    return NextResponse.json({ error: 'Error al eliminar pago recurrente' }, { status: 500 })
  }
}
