/**
 * API para Huéspedes Airbnb
 * GET /api/airbnb/huespedes - Lista todos los huéspedes
 * POST /api/airbnb/huespedes - Crea un nuevo huésped
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const busqueda = searchParams.get('busqueda') || ''

    const where: any = {}
    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { email: { contains: busqueda, mode: 'insensitive' } },
        { telefono: { contains: busqueda, mode: 'insensitive' } },
        { pais: { contains: busqueda, mode: 'insensitive' } },
      ]
    }

    const huespedes = await prisma.huespedAirbnb.findMany({
      where,
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

    return NextResponse.json(huespedes)
  } catch (error) {
    console.error('Error al obtener huéspedes:', error)
    return NextResponse.json(
      { error: 'Error al obtener huéspedes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const huesped = await prisma.huespedAirbnb.create({
      data: {
        nombre: body.nombre,
        email: body.email || null,
        telefono: body.telefono || null,
        whatsapp: body.whatsapp || null,
        pais: body.pais || null,
        calificacionPromedio: body.calificacionPromedio || 0,
        notas: body.notas || null,
      },
    })

    return NextResponse.json(huesped, { status: 201 })
  } catch (error) {
    console.error('Error al crear huésped:', error)
    return NextResponse.json(
      { error: 'Error al crear huésped' },
      { status: 500 }
    )
  }
}
