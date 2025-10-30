/**
 * API para Huésped Airbnb individual
 * GET /api/airbnb/huespedes/[id] - Obtiene un huésped
 * PUT /api/airbnb/huespedes/[id] - Actualiza un huésped
 * DELETE /api/airbnb/huespedes/[id] - Elimina un huésped
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const huesped = await prisma.huespedAirbnb.findUnique({
      where: { id },
      include: {
        reservas: {
          include: {
            espacio: true,
          },
          orderBy: {
            checkIn: 'desc',
          },
        },
      },
    })

    if (!huesped) {
      return NextResponse.json(
        { error: 'Huésped no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(huesped)
  } catch (error) {
    console.error('Error al obtener huésped:', error)
    return NextResponse.json(
      { error: 'Error al obtener huésped' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const huesped = await prisma.huespedAirbnb.update({
      where: { id },
      data: {
        nombre: body.nombre,
        email: body.email || null,
        telefono: body.telefono || null,
        whatsapp: body.whatsapp || null,
        pais: body.pais || null,
        calificacionPromedio: body.calificacionPromedio,
        notas: body.notas || null,
      },
    })

    return NextResponse.json(huesped)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Huésped no encontrado' },
        { status: 404 }
      )
    }
    console.error('Error al actualizar huésped:', error)
    return NextResponse.json(
      { error: 'Error al actualizar huésped' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params

    await prisma.huespedAirbnb.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Huésped eliminado exitosamente' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Huésped no encontrado' },
        { status: 404 }
      )
    }
    console.error('Error al eliminar huésped:', error)
    return NextResponse.json(
      { error: 'Error al eliminar huésped' },
      { status: 500 }
    )
  }
}
