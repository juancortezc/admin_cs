/**
 * API para Items de Inventario
 * GET /api/inventario/items - Lista todos los items con alertas de stock mínimo
 * POST /api/inventario/items - Crea un nuevo item
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const busqueda = searchParams.get('busqueda') || ''
    const categoria = searchParams.get('categoria')
    const soloStockBajo = searchParams.get('soloStockBajo') === 'true'
    const activo = searchParams.get('activo')

    const where: any = {}

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { codigo: { contains: busqueda, mode: 'insensitive' } },
        { proveedor: { contains: busqueda, mode: 'insensitive' } },
      ]
    }

    if (categoria) where.categoria = categoria
    if (activo !== null && activo !== undefined) where.activo = activo === 'true'

    // Filtro especial para stock bajo
    if (soloStockBajo) {
      where.AND = [
        ...(where.AND || []),
        { stockActual: { lte: prisma.itemInventario.fields.stockMinimo } }
      ]
    }

    const items = await prisma.itemInventario.findMany({
      where,
      include: {
        _count: {
          select: {
            movimientos: true,
            itemsKit: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    })

    // Calcular alertas y estadísticas
    const itemsConAlerta = items.filter(i => i.stockActual <= i.stockMinimo)
    const valorTotalInventario = items.reduce((sum, i) => sum + (i.stockActual * i.costoUnitario), 0)

    const porCategoria = items.reduce((acc: any, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      items,
      estadisticas: {
        totalItems: items.length,
        itemsConStockBajo: itemsConAlerta.length,
        valorTotalInventario,
        porCategoria,
      },
      alertas: itemsConAlerta.map(item => ({
        id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
        stockActual: item.stockActual,
        stockMinimo: item.stockMinimo,
        diferencia: item.stockMinimo - item.stockActual,
      })),
    })
  } catch (error) {
    console.error('Error al obtener items:', error)
    return NextResponse.json(
      { error: 'Error al obtener items' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Auto-generar código
    const ultimoItem = await prisma.itemInventario.findFirst({
      orderBy: { codigo: 'desc' },
    })

    let nuevoCodigo = 'INV-0001'
    if (ultimoItem) {
      const numero = parseInt(ultimoItem.codigo.split('-')[1])
      nuevoCodigo = `INV-${String(numero + 1).padStart(4, '0')}`
    }

    const item = await prisma.itemInventario.create({
      data: {
        codigo: nuevoCodigo,
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        categoria: body.categoria,
        unidadMedida: body.unidadMedida,
        stockActual: body.stockActual || 0,
        stockMinimo: body.stockMinimo || 0,
        proveedor: body.proveedor || null,
        costoUnitario: body.costoUnitario || 0,
        activo: body.activo !== false,
        observaciones: body.observaciones || null,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error al crear item:', error)
    return NextResponse.json(
      { error: 'Error al crear item' },
      { status: 500 }
    )
  }
}
