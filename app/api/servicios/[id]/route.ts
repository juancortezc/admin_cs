/**
 * API de Servicios Básicos - Operaciones individuales
 * GET /api/servicios/[id] - Obtener uno
 * PUT /api/servicios/[id] - Actualizar
 * DELETE /api/servicios/[id] - Eliminar
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = {
  params: Promise<{ id: string }>
}

// Obtener un servicio
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const servicio = await prisma.servicioBasico.findUnique({
      where: { id },
      include: {
        pagos: {
          orderBy: { fechaPago: 'desc' },
        },
      },
    })

    if (!servicio) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(servicio)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener servicio' },
      { status: 500 }
    )
  }
}

// Actualizar servicio
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nombre, proveedor, tipoMonto, montoFijo, diaPago, numeroCuenta, activo } = body

    const servicio = await prisma.servicioBasico.update({
      where: { id },
      data: {
        nombre,
        proveedor,
        tipoMonto,
        montoFijo: tipoMonto === 'FIJO' ? parseFloat(montoFijo) : null,
        diaPago: parseInt(diaPago),
        numeroCuenta,
        activo,
      },
    })

    return NextResponse.json(servicio)
  } catch (error: any) {
    console.error('Error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error al actualizar servicio' },
      { status: 500 }
    )
  }
}

// Eliminar servicio (soft delete - marcar como inactivo)
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params

    await prisma.servicioBasico.update({
      where: { id },
      data: { activo: false },
    })

    return NextResponse.json({ message: 'Servicio desactivado' })
  } catch (error: any) {
    console.error('Error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error al eliminar servicio' },
      { status: 500 }
    )
  }
}
