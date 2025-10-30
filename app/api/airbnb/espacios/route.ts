/**
 * API para Espacios Airbnb
 * GET /api/airbnb/espacios - Lista todos los espacios
 * POST /api/airbnb/espacios - Crea un nuevo espacio
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const espacios = await prisma.espacioAirbnb.findMany({
      include: {
        _count: {
          select: {
            reservas: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    })

    return NextResponse.json(espacios)
  } catch (error) {
    console.error('Error al obtener espacios Airbnb:', error)
    return NextResponse.json(
      { error: 'Error al obtener espacios' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const espacio = await prisma.espacioAirbnb.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        capacidadHuespedes: body.capacidadHuespedes || 2,
        numCamas: body.numCamas || 1,
        numBanos: body.numBanos || 1,
        amenidades: body.amenidades || null,
        precioBaseNoche: body.precioBaseNoche,
        precioLimpieza: body.precioLimpieza || 0,
        activo: body.activo !== undefined ? body.activo : true,
      },
    })

    return NextResponse.json(espacio, { status: 201 })
  } catch (error) {
    console.error('Error al crear espacio Airbnb:', error)
    return NextResponse.json(
      { error: 'Error al crear espacio' },
      { status: 500 }
    )
  }
}
