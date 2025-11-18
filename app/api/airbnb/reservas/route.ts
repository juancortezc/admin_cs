/**
 * API para Reservas Airbnb
 * GET /api/airbnb/reservas - Lista todas las reservas con filtros
 * POST /api/airbnb/reservas - Crea una nueva reserva
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const busqueda = searchParams.get('busqueda') || ''
    const espacioId = searchParams.get('espacioId')
    const huespedId = searchParams.get('huespedId')
    const estadoReserva = searchParams.get('estadoReserva')
    const estadoPago = searchParams.get('estadoPago')
    const canalReserva = searchParams.get('canalReserva')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    const where: any = {}

    if (busqueda) {
      where.OR = [
        { codigoReserva: { contains: busqueda, mode: 'insensitive' } },
        { codigoConfirmacion: { contains: busqueda, mode: 'insensitive' } },
        { huesped: { nombre: { contains: busqueda, mode: 'insensitive' } } },
        { espacio: { nombre: { contains: busqueda, mode: 'insensitive' } } },
      ]
    }

    if (espacioId) where.espacioId = espacioId
    if (huespedId) where.huespedId = huespedId
    if (estadoReserva) where.estadoReserva = estadoReserva
    if (estadoPago) where.estadoPago = estadoPago
    if (canalReserva) where.canalReserva = canalReserva

    if (fechaInicio && fechaFin) {
      where.AND = [
        {
          checkIn: {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin),
          },
        },
      ]
    }

    const reservas = await prisma.reservaAirbnb.findMany({
      where,
      include: {
        espacio: true,
        huesped: true,
        abonos: {
          orderBy: {
            fechaPago: 'desc',
          },
        },
        _count: {
          select: {
            abonos: true,
            mantenimientos: true,
          },
        },
      },
      orderBy: {
        checkIn: 'desc',
      },
    })

    // Calcular estadísticas
    const totalReservas = reservas.length
    const totalIngresos = reservas.reduce((sum, r) => sum + r.montoPagado, 0)
    const totalPendiente = reservas.reduce((sum, r) => sum + r.balancePendiente, 0)
    const totalEsperado = reservas.reduce((sum, r) => sum + r.precioTotal, 0)

    const porEstado = reservas.reduce((acc: any, r) => {
      acc[r.estadoReserva] = (acc[r.estadoReserva] || 0) + 1
      return acc
    }, {})

    const porEstadoPago = reservas.reduce((acc: any, r) => {
      acc[r.estadoPago] = (acc[r.estadoPago] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      reservas,
      estadisticas: {
        totalReservas,
        totalIngresos,
        totalPendiente,
        totalEsperado,
        porEstado,
        porEstadoPago,
      },
    })
  } catch (error) {
    console.error('Error al obtener reservas:', error)
    return NextResponse.json(
      { error: 'Error al obtener reservas' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Auto-generar código de reserva
    const ultimaReserva = await prisma.reservaAirbnb.findFirst({
      orderBy: { codigoReserva: 'desc' },
    })

    let nuevoCodigo = 'AB-0001'
    if (ultimaReserva) {
      const numero = parseInt(ultimaReserva.codigoReserva.split('-')[1])
      nuevoCodigo = `AB-${String(numero + 1).padStart(4, '0')}`
    }

    // Calcular número de noches
    const checkIn = new Date(body.checkIn)
    const checkOut = new Date(body.checkOut)
    const noches = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    // Calcular balance pendiente
    const montoPagado = body.montoPagado || 0
    const balancePendiente = body.precioTotal - montoPagado

    // Usar transacción para crear reserva y cobro juntos
    const result = await prisma.$transaction(async (tx) => {
      const reserva = await tx.reservaAirbnb.create({
        data: {
          codigoReserva: nuevoCodigo,
          espacioId: body.espacioId,
          huespedId: body.huespedId,
          checkIn: new Date(body.checkIn),
          checkOut: new Date(body.checkOut),
          noches,
          numHuespedes: body.numHuespedes || 1,
          canalReserva: body.canalReserva || 'AIRBNB',
          codigoConfirmacion: body.codigoConfirmacion || null,
          precioTotal: body.precioTotal,
          precioPorNoche: body.precioPorNoche,
          precioLimpieza: body.precioLimpieza || 0,
          depositoSeguridad: body.depositoSeguridad || 0,
          comisionPlataforma: body.comisionPlataforma || 0,
          estadoReserva: body.estadoReserva || 'CONFIRMADA',
          estadoPago: montoPagado >= body.precioTotal ? 'PAGADO' : (montoPagado > 0 ? 'PARCIAL' : 'PENDIENTE'),
          montoPagado,
          balancePendiente,
          observaciones: body.observaciones || null,
        },
        include: {
          espacio: true,
          huesped: true,
        },
      })

      // Crear cuenta por cobrar automáticamente
      // Auto-generar código interno del cobro
      const ultimoCobro = await tx.cobro.findFirst({
        orderBy: { codigoInterno: 'desc' },
      })

      let codigoCobro = 'P-0001'
      if (ultimoCobro) {
        const numero = parseInt(ultimoCobro.codigoInterno.split('-')[1])
        codigoCobro = `P-${String(numero + 1).padStart(4, '0')}`
      }

      // Crear el cobro pendiente con fecha de vencimiento = fecha de checkout
      await tx.cobro.create({
        data: {
          codigoInterno: codigoCobro,
          espacioAirbnbId: body.espacioId,
          concepto: 'AIRBNB',
          periodo: `${checkIn.getFullYear()}-${String(checkIn.getMonth() + 1).padStart(2, '0')}`,
          montoPagado: 0,
          montoPactado: body.precioTotal,
          diferencia: -body.precioTotal,
          fechaPago: checkOut, // Se usará cuando se registre el pago
          fechaVencimiento: checkOut,
          diasDiferencia: null,
          metodoPago: 'TRANSFERENCIA', // Valor por defecto, se actualizará al registrar el pago
          numeroComprobante: nuevoCodigo, // Referencia a la reserva
          estado: 'PENDIENTE',
          observaciones: `Reserva ${nuevoCodigo} - Check-in: ${checkIn.toLocaleDateString()} - Check-out: ${checkOut.toLocaleDateString()}`,
        },
      })

      return reserva
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error al crear reserva:', error)
    return NextResponse.json(
      { error: 'Error al crear reserva' },
      { status: 500 }
    )
  }
}
