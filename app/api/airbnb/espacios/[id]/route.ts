/**
 * API para Espacio Airbnb individual
 * GET /api/airbnb/espacios/[id] - Obtiene un espacio
 * PUT /api/airbnb/espacios/[id] - Actualiza un espacio
 * DELETE /api/airbnb/espacios/[id] - Elimina un espacio
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const espacio = await prisma.espacioAirbnb.findUnique({
      where: { id },
      include: {
        reservas: {
          include: {
            huesped: true,
          },
          orderBy: {
            checkIn: 'desc',
          },
        },
        _count: {
          select: {
            reservas: true,
            mantenimientos: true,
          },
        },
      },
    })

    if (!espacio) {
      return NextResponse.json(
        { error: 'Espacio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(espacio)
  } catch (error) {
    console.error('Error al obtener espacio:', error)
    return NextResponse.json(
      { error: 'Error al obtener espacio' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const espacio = await prisma.espacioAirbnb.update({
      where: { id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        capacidadHuespedes: body.capacidadHuespedes,
        numCamas: body.numCamas,
        numBanos: body.numBanos,
        amenidades: body.amenidades || null,
        precioBaseNoche: body.precioBaseNoche,
        precioLimpieza: body.precioLimpieza,
        activo: body.activo,
      },
    })

    return NextResponse.json(espacio)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Espacio no encontrado' },
        { status: 404 }
      )
    }
    console.error('Error al actualizar espacio:', error)
    return NextResponse.json(
      { error: 'Error al actualizar espacio' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params

    // Verificar si el espacio existe
    const espacio = await prisma.espacioAirbnb.findUnique({
      where: { id },
      select: { nombre: true },
    })

    if (!espacio) {
      return NextResponse.json(
        { error: 'Espacio no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si tiene reservas asociadas
    const reservasCount = await prisma.reservaAirbnb.count({
      where: { espacioId: id },
    })

    if (reservasCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. El espacio tiene ${reservasCount} reserva(s) asociada(s). Elimine las reservas primero o desactive el espacio.` },
        { status: 400 }
      )
    }

    // Verificar si tiene cobros asociados
    const cobrosCount = await prisma.cobro.count({
      where: { espacioAirbnbId: id },
    })

    if (cobrosCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. El espacio tiene ${cobrosCount} cobro(s) asociado(s). Elimine los cobros primero.` },
        { status: 400 }
      )
    }

    // Verificar si tiene mantenimientos asociados
    const mantenimientosCount = await prisma.mantenimientoAirbnb.count({
      where: { espacioId: id },
    })

    if (mantenimientosCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. El espacio tiene ${mantenimientosCount} mantenimiento(s) asociado(s). Elimine los mantenimientos primero.` },
        { status: 400 }
      )
    }

    await prisma.espacioAirbnb.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Espacio eliminado exitosamente' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Espacio no encontrado' },
        { status: 404 }
      )
    }
    if (error.code === 'P2003' || error.code === 'P2014') {
      return NextResponse.json(
        { error: 'No se puede eliminar. El espacio tiene registros asociados.' },
        { status: 400 }
      )
    }
    console.error('Error al eliminar espacio:', error)
    return NextResponse.json(
      { error: 'Error al eliminar espacio' },
      { status: 500 }
    )
  }
}
