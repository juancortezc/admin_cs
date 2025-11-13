/**
 * API de Otros Pagos (Gastos) - Casa del Sol
 * GET: Lista con filtros
 * POST: Crear nuevo pago
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Lista de pagos con filtros y estadísticas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Filtros
    const busqueda = searchParams.get('busqueda') || ''
    const categoria = searchParams.get('categoria')
    const metodoPago = searchParams.get('metodoPago')
    const estado = searchParams.get('estado')
    const periodo = searchParams.get('periodo')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    // Construir where clause
    const where: any = {}

    if (busqueda) {
      where.OR = [
        { proveedor: { contains: busqueda, mode: 'insensitive' } },
        { descripcion: { contains: busqueda, mode: 'insensitive' } },
        { codigoInterno: { contains: busqueda, mode: 'insensitive' } },
      ]
    }

    if (categoria && categoria !== 'todos') {
      where.categoria = categoria
    }

    if (metodoPago && metodoPago !== 'todos') {
      where.metodoPago = metodoPago
    }

    if (estado && estado !== 'todos') {
      where.estado = estado
    }

    if (periodo) {
      where.periodo = periodo
    }

    if (fechaInicio || fechaFin) {
      where.fechaPago = {}
      if (fechaInicio) where.fechaPago.gte = new Date(fechaInicio)
      if (fechaFin) where.fechaPago.lte = new Date(fechaFin)
    }

    // Obtener pagos
    const pagos = await prisma.otroPago.findMany({
      where,
      include: {
        pagoRecurrente: {
          select: {
            codigoInterno: true,
            nombre: true,
          },
        },
      },
      orderBy: { fechaPago: 'desc' },
    })

    // Calcular estadísticas
    const totalPagado = pagos
      .filter((p) => p.estado === 'PAGADO')
      .reduce((sum, p) => sum + p.monto, 0)

    const totalPendiente = pagos
      .filter((p) => p.estado === 'PENDIENTE')
      .reduce((sum, p) => sum + p.monto, 0)

    const totalPorCategoria = pagos.reduce((acc: any, p) => {
      acc[p.categoria] = (acc[p.categoria] || 0) + (p.estado === 'PAGADO' ? p.monto : 0)
      return acc
    }, {})

    const totalPorMetodo = pagos.reduce((acc: any, p) => {
      if (p.estado === 'PAGADO') {
        acc[p.metodoPago] = (acc[p.metodoPago] || 0) + p.monto
      }
      return acc
    }, {})

    const estadisticas = {
      totalPagos: pagos.length,
      totalPagado,
      totalPendiente,
      totalPorCategoria,
      totalPorMetodo,
    }

    return NextResponse.json({ pagos, estadisticas })
  } catch (error) {
    console.error('Error al obtener pagos:', error)
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 })
  }
}

// POST - Crear nuevo pago
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar campos requeridos
    if (!body.proveedor || !body.fechaPago || !body.categoria || !body.monto || !body.metodoPago) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: proveedor, fechaPago, categoria, monto, metodoPago' },
        { status: 400 }
      )
    }

    // Generar código interno
    const ultimoPago = await prisma.otroPago.findFirst({
      orderBy: { codigoInterno: 'desc' },
    })

    let nuevoCodigo = 'G-0001'
    if (ultimoPago) {
      const prefijo = ultimoPago.codigoInterno.split('-')[0]
      const numero = parseInt(ultimoPago.codigoInterno.split('-')[1])
      nuevoCodigo = `${prefijo}-${String(numero + 1).padStart(4, '0')}`
    }

    // Asegurar que descripcion siempre tenga un valor válido
    const descripcion = body.descripcion || body.proveedor || 'Pago registrado'

    const pago = await prisma.otroPago.create({
      data: {
        codigoInterno: nuevoCodigo,
        proveedor: body.proveedor,
        ruc: body.ruc || null,
        cuentaDestino: body.cuentaDestino || null,
        fechaPago: new Date(body.fechaPago),
        fechaVencimiento: body.fechaVencimiento ? new Date(body.fechaVencimiento) : null,
        periodo: body.periodo,
        categoria: body.categoria,
        monto: parseFloat(body.monto),
        descripcion: descripcion,
        numeroFactura: body.numeroFactura || null,
        numeroDocumento: body.numeroDocumento || null,
        metodoPago: body.metodoPago,
        estado: body.estado || 'PENDIENTE',
        observaciones: body.observaciones || null,
        pagoRecurrenteId: body.pagoRecurrenteId || null,
      },
    })

    return NextResponse.json(pago, { status: 201 })
  } catch (error) {
    console.error('Error al crear pago:', error)
    // Log detallado para debugging en Vercel
    console.error('Body recibido:', JSON.stringify(error))
    return NextResponse.json({
      error: 'Error al crear pago',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
