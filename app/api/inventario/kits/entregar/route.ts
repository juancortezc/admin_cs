/**
 * API para Entregar Kit a Reserva
 * POST /api/inventario/kits/entregar - Entrega un kit y crea los movimientos de inventario
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { kitId, reservaId, entregadoPor } = body

    // Obtener el kit con sus items
    const kit = await prisma.kitAirbnb.findUnique({
      where: { id: kitId },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    })

    if (!kit) {
      return NextResponse.json({ error: 'Kit no encontrado' }, { status: 404 })
    }

    // Verificar stock disponible
    for (const itemKit of kit.items) {
      if (itemKit.item.stockActual < itemKit.cantidad) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${itemKit.item.nombre}` },
          { status: 400 }
        )
      }
    }

    // Auto-generar número de entrega
    const ultimaEntrega = await prisma.entregaKit.findFirst({
      orderBy: { numeroEntrega: 'desc' },
    })

    let nuevoNumero = 'ENT-0001'
    if (ultimaEntrega) {
      const numero = parseInt(ultimaEntrega.numeroEntrega.split('-')[1])
      nuevoNumero = `ENT-${String(numero + 1).padStart(4, '0')}`
    }

    // Calcular costo total del kit
    const costoTotal = kit.items.reduce(
      (sum, itemKit) => sum + itemKit.cantidad * itemKit.item.costoUnitario,
      0
    )

    // Crear entrega y movimientos en transacción
    const entrega = await prisma.$transaction(async (tx) => {
      // Crear la entrega
      const nuevaEntrega = await tx.entregaKit.create({
        data: {
          numeroEntrega: nuevoNumero,
          kitId,
          reservaId,
          entregadoPor: entregadoPor || null,
          costoTotal,
        },
      })

      // Crear movimientos y actualizar stock para cada item
      for (const itemKit of kit.items) {
        const nuevoStock = itemKit.item.stockActual - itemKit.cantidad

        // Generar número de movimiento
        const ultimoMov = await tx.movimientoInventario.findFirst({
          orderBy: { numeroMovimiento: 'desc' },
        })

        let numeroMov = 'MOV-0001'
        if (ultimoMov) {
          const numero = parseInt(ultimoMov.numeroMovimiento.split('-')[1])
          numeroMov = `MOV-${String(numero + 1).padStart(4, '0')}`
        }

        // Crear movimiento de salida
        await tx.movimientoInventario.create({
          data: {
            numeroMovimiento: numeroMov,
            itemId: itemKit.item.id,
            tipoMovimiento: 'SALIDA',
            motivo: `Entrega de kit ${kit.nombre} - Reserva`,
            cantidad: itemKit.cantidad,
            costoUnitario: itemKit.item.costoUnitario,
            costoTotal: itemKit.cantidad * itemKit.item.costoUnitario,
            saldoCantidad: nuevoStock,
            saldoValor: nuevoStock * itemKit.item.costoUnitario,
            entregaKitId: nuevaEntrega.id,
          },
        })

        // Actualizar stock
        await tx.itemInventario.update({
          where: { id: itemKit.item.id },
          data: { stockActual: nuevoStock },
        })
      }

      return nuevaEntrega
    })

    return NextResponse.json(entrega, { status: 201 })
  } catch (error) {
    console.error('Error al entregar kit:', error)
    return NextResponse.json(
      { error: 'Error al entregar kit' },
      { status: 500 }
    )
  }
}
