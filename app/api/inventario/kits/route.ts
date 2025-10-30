/**
 * API para Kits de Airbnb
 * GET /api/inventario/kits - Lista todos los kits
 * POST /api/inventario/kits - Crea un nuevo kit con sus items
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const kits = await prisma.kitAirbnb.findMany({
      include: {
        items: {
          include: {
            item: true,
          },
        },
        _count: {
          select: {
            entregas: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    })

    return NextResponse.json({ kits })
  } catch (error) {
    console.error('Error al obtener kits:', error)
    return NextResponse.json(
      { error: 'Error al obtener kits' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Auto-generar código
    const ultimoKit = await prisma.kitAirbnb.findFirst({
      orderBy: { codigo: 'desc' },
    })

    let nuevoCodigo = 'KIT-0001'
    if (ultimoKit) {
      const numero = parseInt(ultimoKit.codigo.split('-')[1])
      nuevoCodigo = `KIT-${String(numero + 1).padStart(4, '0')}`
    }

    const kit = await prisma.kitAirbnb.create({
      data: {
        codigo: nuevoCodigo,
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        activo: body.activo !== false,
        items: {
          create: body.items.map((item: any) => ({
            itemId: item.itemId,
            cantidad: item.cantidad,
          })),
        },
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    })

    return NextResponse.json(kit, { status: 201 })
  } catch (error) {
    console.error('Error al crear kit:', error)
    return NextResponse.json(
      { error: 'Error al crear kit' },
      { status: 500 }
    )
  }
}
