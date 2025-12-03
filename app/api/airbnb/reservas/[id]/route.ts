/**
 * API para Reserva Airbnb individual
 * GET /api/airbnb/reservas/[id] - Obtiene una reserva con todos sus detalles
 * PUT /api/airbnb/reservas/[id] - Actualiza una reserva
 * DELETE /api/airbnb/reservas/[id] - Elimina una reserva
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const reserva = await prisma.reservaAirbnb.findUnique({
      where: { id },
      include: {
        espacio: true,
        huesped: {
          include: {
            reservas: {
              where: {
                id: { not: id },
              },
              orderBy: {
                checkIn: 'desc',
              },
              take: 5,
            },
          },
        },
        abonos: {
          orderBy: {
            fechaPago: 'desc',
          },
        },
        mantenimientos: {
          orderBy: {
            fechaProgramada: 'desc',
          },
        },
      },
    })

    if (!reserva) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(reserva)
  } catch (error) {
    console.error('Error al obtener reserva:', error)
    return NextResponse.json(
      { error: 'Error al obtener reserva' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    // Recalcular noches si cambiaron las fechas
    let noches = body.noches
    if (body.checkIn && body.checkOut) {
      const checkIn = new Date(body.checkIn)
      const checkOut = new Date(body.checkOut)
      noches = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    }

    // Recalcular balance pendiente
    const montoPagado = body.montoPagado !== undefined ? body.montoPagado : undefined
    const precioTotal = body.precioTotal !== undefined ? body.precioTotal : undefined

    let balancePendiente
    let estadoPago

    if (montoPagado !== undefined && precioTotal !== undefined) {
      balancePendiente = precioTotal - montoPagado
      estadoPago = montoPagado >= precioTotal ? 'PAGADO' : (montoPagado > 0 ? 'PARCIAL' : 'PENDIENTE')
    }

    const reserva = await prisma.reservaAirbnb.update({
      where: { id },
      data: {
        ...(body.espacioId && { espacioId: body.espacioId }),
        ...(body.huespedId && { huespedId: body.huespedId }),
        ...(body.checkIn && { checkIn: new Date(body.checkIn) }),
        ...(body.checkOut && { checkOut: new Date(body.checkOut) }),
        ...(noches && { noches }),
        ...(body.numHuespedes !== undefined && { numHuespedes: body.numHuespedes }),
        ...(body.canalReserva && { canalReserva: body.canalReserva }),
        ...(body.codigoConfirmacion !== undefined && { codigoConfirmacion: body.codigoConfirmacion }),
        ...(precioTotal !== undefined && { precioTotal }),
        ...(body.precioPorNoche !== undefined && { precioPorNoche: body.precioPorNoche }),
        ...(body.precioLimpieza !== undefined && { precioLimpieza: body.precioLimpieza }),
        ...(body.depositoSeguridad !== undefined && { depositoSeguridad: body.depositoSeguridad }),
        ...(body.comisionPlataforma !== undefined && { comisionPlataforma: body.comisionPlataforma }),
        ...(body.estadoReserva && { estadoReserva: body.estadoReserva }),
        ...(estadoPago && { estadoPago }),
        ...(montoPagado !== undefined && { montoPagado }),
        ...(balancePendiente !== undefined && { balancePendiente }),
        ...(body.checkInRealizado !== undefined && { checkInRealizado: body.checkInRealizado }),
        ...(body.fechaCheckInReal !== undefined && { fechaCheckInReal: body.fechaCheckInReal ? new Date(body.fechaCheckInReal) : null }),
        ...(body.checkOutRealizado !== undefined && { checkOutRealizado: body.checkOutRealizado }),
        ...(body.fechaCheckOutReal !== undefined && { fechaCheckOutReal: body.fechaCheckOutReal ? new Date(body.fechaCheckOutReal) : null }),
        ...(body.calificacionHuesped !== undefined && { calificacionHuesped: body.calificacionHuesped }),
        ...(body.notasReserva !== undefined && { notasReserva: body.notasReserva }),
        ...(body.notasFinales !== undefined && { notasFinales: body.notasFinales }),
        ...(body.observaciones !== undefined && { observaciones: body.observaciones }),
      },
      include: {
        espacio: true,
        huesped: true,
        abonos: true,
      },
    })

    return NextResponse.json(reserva)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }
    console.error('Error al actualizar reserva:', error)
    return NextResponse.json(
      { error: 'Error al actualizar reserva' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params

    // Verificar si la reserva existe
    const reserva = await prisma.reservaAirbnb.findUnique({
      where: { id },
      select: { codigoReserva: true },
    })

    if (!reserva) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si tiene abonos registrados
    const abonosCount = await prisma.abonoReserva.count({
      where: { reservaId: id },
    })

    if (abonosCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. La reserva tiene ${abonosCount} abono(s) registrado(s). Elimine los abonos primero.` },
        { status: 400 }
      )
    }

    await prisma.reservaAirbnb.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Reserva eliminada exitosamente' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }
    if (error.code === 'P2003' || error.code === 'P2014') {
      return NextResponse.json(
        { error: 'No se puede eliminar. La reserva tiene registros asociados.' },
        { status: 400 }
      )
    }
    console.error('Error al eliminar reserva:', error)
    return NextResponse.json(
      { error: 'Error al eliminar reserva' },
      { status: 500 }
    )
  }
}
