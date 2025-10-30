/**
 * API para Item de Inventario individual
 * GET /api/inventario/items/[id] - Obtiene un item con su kardex
 * PUT /api/inventario/items/[id] - Actualiza un item
 * DELETE /api/inventario/items/[id] - Elimina un item
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const item = await prisma.itemInventario.findUnique({
      where: { id },
      include: {
        movimientos: {
          orderBy: {
            fecha: 'desc',
          },
          take: 50, // Últimos 50 movimientos
          include: {
            espacio: {
              select: {
                identificador: true,
              },
            },
          },
        },
        itemsKit: {
          include: {
            kit: true,
          },
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error al obtener item:', error)
    return NextResponse.json(
      { error: 'Error al obtener item' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const item = await prisma.itemInventario.update({
      where: { id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        categoria: body.categoria,
        unidadMedida: body.unidadMedida,
        stockMinimo: body.stockMinimo,
        proveedor: body.proveedor || null,
        costoUnitario: body.costoUnitario,
        activo: body.activo,
        observaciones: body.observaciones || null,
      },
    })

    return NextResponse.json(item)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Item no encontrado' },
        { status: 404 }
      )
    }
    console.error('Error al actualizar item:', error)
    return NextResponse.json(
      { error: 'Error al actualizar item' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params

    await prisma.itemInventario.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Item eliminado exitosamente' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Item no encontrado' },
        { status: 404 }
      )
    }
    console.error('Error al eliminar item:', error)
    return NextResponse.json(
      { error: 'Error al eliminar item' },
      { status: 500 }
    )
  }
}
