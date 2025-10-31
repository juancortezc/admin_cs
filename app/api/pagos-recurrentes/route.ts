/**
 * API de Pagos Recurrentes - Casa del Sol
 * GET: Lista de pagos recurrentes activos e inactivos
 * POST: Crear nuevo pago recurrente
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Lista de pagos recurrentes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const activo = searchParams.get('activo')
    const categoria = searchParams.get('categoria')

    const where: any = {}

    if (activo !== null && activo !== 'todos') {
      where.activo = activo === 'true'
    }

    if (categoria && categoria !== 'todos') {
      where.categoria = categoria
    }

    const pagosRecurrentes = await prisma.pagoRecurrente.findMany({
      where,
      include: {
        _count: {
          select: { pagosGenerados: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(pagosRecurrentes)
  } catch (error) {
    console.error('Error al obtener pagos recurrentes:', error)
    return NextResponse.json({ error: 'Error al obtener pagos recurrentes' }, { status: 500 })
  }
}

// POST - Crear nuevo pago recurrente
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Generar código interno
    const ultimoPago = await prisma.pagoRecurrente.findFirst({
      orderBy: { codigoInterno: 'desc' },
    })

    let nuevoCodigo = 'PR-0001'
    if (ultimoPago) {
      const numero = parseInt(ultimoPago.codigoInterno.split('-')[1])
      nuevoCodigo = `PR-${String(numero + 1).padStart(4, '0')}`
    }

    const pagoRecurrente = await prisma.pagoRecurrente.create({
      data: {
        codigoInterno: nuevoCodigo,
        nombre: body.nombre,
        proveedor: body.proveedor,
        ruc: body.ruc || null,
        cuentaDestino: body.cuentaDestino || null,
        categoria: body.categoria,
        descripcion: body.descripcion,
        montoFijo: body.esMontoVariable ? null : parseFloat(body.montoFijo),
        esMontoVariable: body.esMontoVariable,
        metodoPago: body.metodoPago,
        frecuencia: body.frecuencia,
        diaPago: body.diaPago ? parseInt(body.diaPago) : null,
        fechaInicio: new Date(body.fechaInicio),
        fechaFin: body.fechaFin ? new Date(body.fechaFin) : null,
        activo: body.activo !== undefined ? body.activo : true,
        observaciones: body.observaciones || null,
      },
    })

    return NextResponse.json(pagoRecurrente, { status: 201 })
  } catch (error) {
    console.error('Error al crear pago recurrente:', error)
    return NextResponse.json({ error: 'Error al crear pago recurrente' }, { status: 500 })
  }
}
