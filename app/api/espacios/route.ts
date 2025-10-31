/**
 * API de Espacios - Lista todos los espacios
 * GET /api/espacios
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const espacios = await prisma.espacio.findMany({
      include: {
        arrendatario: true, // Incluir datos del arrendatario si existe
      },
      orderBy: {
        identificador: 'asc', // Ordenar por identificador
      },
    })

    return NextResponse.json(espacios)
  } catch (error) {
    console.error('Error al obtener espacios:', error)
    return NextResponse.json(
      { error: 'Error al obtener espacios' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar campos requeridos
    if (!body.identificador || !body.tipo) {
      return NextResponse.json(
        { error: 'Identificador y tipo son requeridos' },
        { status: 400 }
      )
    }

    // Crear espacio
    const espacio = await prisma.espacio.create({
      data: {
        identificador: body.identificador,
        tipo: body.tipo,
        observaciones: body.observaciones || null,
        conceptoCobro: body.conceptoCobro || 'RENTA',
      },
      include: {
        arrendatario: true,
      },
    })

    return NextResponse.json(espacio, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear espacio:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un espacio con ese identificador' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error al crear espacio' },
      { status: 500 }
    )
  }
}
