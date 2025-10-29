/**
 * API de Espacios - Operaciones individuales
 * GET /api/espacios/[id] - Obtener uno
 * PUT /api/espacios/[id] - Actualizar
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = {
  params: Promise<{ id: string }>
}

// Obtener un espacio
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const espacio = await prisma.espacio.findUnique({
      where: { id },
      include: {
        arrendatario: true,
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
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener espacio' },
      { status: 500 }
    )
  }
}

// Actualizar espacio (incluye asignar arrendatario)
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      arrendatarioId,
      fechaInicio,
      fechaFin,
      monto,
      diaPago,
      observaciones,
    } = body

    const espacio = await prisma.espacio.update({
      where: { id },
      data: {
        arrendatarioId: arrendatarioId || null,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        monto: monto ? parseFloat(monto) : null,
        diaPago: diaPago ? parseInt(diaPago) : null,
        observaciones,
      },
      include: {
        arrendatario: true,
      },
    })

    return NextResponse.json(espacio)
  } catch (error: any) {
    console.error('Error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Espacio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error al actualizar espacio' },
      { status: 500 }
    )
  }
}
