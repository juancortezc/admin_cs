/**
 * API de Arrendatarios - Operaciones individuales
 * GET /api/arrendatarios/[id] - Obtener uno
 * PUT /api/arrendatarios/[id] - Actualizar
 * DELETE /api/arrendatarios/[id] - Eliminar
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = {
  params: Promise<{ id: string }>
}

// Obtener un arrendatario
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const arrendatario = await prisma.arrendatario.findUnique({
      where: { id },
      include: {
        espacios: true,
      },
    })

    if (!arrendatario) {
      return NextResponse.json(
        { error: 'Arrendatario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(arrendatario)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener arrendatario' },
      { status: 500 }
    )
  }
}

// Actualizar arrendatario
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nombre, email, celular } = body

    const arrendatario = await prisma.arrendatario.update({
      where: { id },
      data: {
        nombre,
        email,
        celular,
      },
    })

    return NextResponse.json(arrendatario)
  } catch (error: any) {
    console.error('Error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Arrendatario no encontrado' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al actualizar arrendatario' },
      { status: 500 }
    )
  }
}

// Eliminar arrendatario
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params

    // Desvincular espacios antes de eliminar
    await prisma.espacio.updateMany({
      where: { arrendatarioId: id },
      data: { arrendatarioId: null },
    })

    await prisma.arrendatario.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Arrendatario eliminado' })
  } catch (error: any) {
    console.error('Error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Arrendatario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error al eliminar arrendatario' },
      { status: 500 }
    )
  }
}
