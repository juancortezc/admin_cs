/**
 * API para Abonos de una Reserva
 * POST /api/airbnb/reservas/[id]/abonos - Registra un nuevo abono
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const { id: reservaId } = await params
    const body = await request.json()

    // Verificar que la reserva existe
    const reserva = await prisma.reservaAirbnb.findUnique({
      where: { id: reservaId },
    })

    if (!reserva) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Crear el abono
    const abono = await prisma.abonoReserva.create({
      data: {
        reservaId,
        monto: body.monto,
        fechaPago: new Date(body.fechaPago),
        metodoPago: body.metodoPago || 'TRANSFERENCIA',
        referencia: body.referencia || null,
        observaciones: body.observaciones || null,
      },
    })

    // Actualizar montos de la reserva
    const nuevoMontoPagado = reserva.montoPagado + body.monto
    const nuevoBalance = reserva.precioTotal - nuevoMontoPagado
    const nuevoEstadoPago =
      nuevoMontoPagado >= reserva.precioTotal
        ? 'PAGADO'
        : nuevoMontoPagado > 0
        ? 'PARCIAL'
        : 'PENDIENTE'

    await prisma.reservaAirbnb.update({
      where: { id: reservaId },
      data: {
        montoPagado: nuevoMontoPagado,
        balancePendiente: nuevoBalance,
        estadoPago: nuevoEstadoPago,
      },
    })

    return NextResponse.json(abono, { status: 201 })
  } catch (error) {
    console.error('Error al registrar abono:', error)
    return NextResponse.json(
      { error: 'Error al registrar abono' },
      { status: 500 }
    )
  }
}
