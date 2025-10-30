/**
 * API para Movimientos de Inventario (Kardex)
 * POST /api/inventario/movimientos - Registra un nuevo movimiento (entrada o salida)
 * GET /api/inventario/movimientos - Lista movimientos con filtros
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Auto-generar número de movimiento
    const ultimoMovimiento = await prisma.movimientoInventario.findFirst({
      orderBy: { numeroMovimiento: 'desc' },
    })

    let nuevoNumero = 'MOV-0001'
    if (ultimoMovimiento) {
      const numero = parseInt(ultimoMovimiento.numeroMovimiento.split('-')[1])
      nuevoNumero = `MOV-${String(numero + 1).padStart(4, '0')}`
    }

    // Obtener el item actual
    const item = await prisma.itemInventario.findUnique({
      where: { id: body.itemId },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item no encontrado' },
        { status: 404 }
      )
    }

    // Calcular nuevo stock según tipo de movimiento
    let nuevoStock = item.stockActual
    let cantidad = body.cantidad

    switch (body.tipoMovimiento) {
      case 'ENTRADA':
      case 'AJUSTE_POSITIVO':
        nuevoStock += cantidad
        break
      case 'SALIDA':
      case 'AJUSTE_NEGATIVO':
        nuevoStock -= cantidad
        // Verificar que no quede negativo
        if (nuevoStock < 0) {
          return NextResponse.json(
            { error: 'Stock insuficiente para realizar la salida' },
            { status: 400 }
          )
        }
        break
    }

    // Calcular costos
    const costoUnitario = body.costoUnitario || item.costoUnitario
    const costoTotal = cantidad * costoUnitario
    const saldoValor = nuevoStock * costoUnitario

    // Crear el movimiento y actualizar el stock en una transacción
    const [movimiento, itemActualizado] = await prisma.$transaction([
      prisma.movimientoInventario.create({
        data: {
          numeroMovimiento: nuevoNumero,
          itemId: body.itemId,
          tipoMovimiento: body.tipoMovimiento,
          motivo: body.motivo || null,
          cantidad,
          costoUnitario,
          costoTotal,
          saldoCantidad: nuevoStock,
          saldoValor,
          personaRecibe: body.personaRecibe || null,
          espacioId: body.espacioId || null,
          numeroFactura: body.numeroFactura || null,
          numeroDocumento: body.numeroDocumento || null,
          fecha: body.fecha ? new Date(body.fecha) : new Date(),
          observaciones: body.observaciones || null,
        },
        include: {
          item: true,
          espacio: {
            select: {
              identificador: true,
            },
          },
        },
      }),
      prisma.itemInventario.update({
        where: { id: body.itemId },
        data: {
          stockActual: nuevoStock,
          // Actualizar costo unitario solo en entradas
          ...(body.tipoMovimiento === 'ENTRADA' && body.costoUnitario
            ? { costoUnitario: body.costoUnitario }
            : {}),
        },
      }),
    ])

    return NextResponse.json(
      {
        movimiento,
        stockAnterior: item.stockActual,
        stockNuevo: nuevoStock,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al crear movimiento:', error)
    return NextResponse.json(
      { error: 'Error al crear movimiento' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const itemId = searchParams.get('itemId')
    const tipoMovimiento = searchParams.get('tipoMovimiento')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    const where: any = {}

    if (itemId) where.itemId = itemId
    if (tipoMovimiento) where.tipoMovimiento = tipoMovimiento

    if (fechaInicio && fechaFin) {
      where.fecha = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      }
    }

    const movimientos = await prisma.movimientoInventario.findMany({
      where,
      include: {
        item: {
          select: {
            codigo: true,
            nombre: true,
            unidadMedida: true,
          },
        },
        espacio: {
          select: {
            identificador: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
      take: 100,
    })

    return NextResponse.json({ movimientos })
  } catch (error) {
    console.error('Error al obtener movimientos:', error)
    return NextResponse.json(
      { error: 'Error al obtener movimientos' },
      { status: 500 }
    )
  }
}
