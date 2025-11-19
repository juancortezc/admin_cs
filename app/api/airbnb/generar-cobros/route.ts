/**
 * API para generar cobros retroactivos
 * POST - Genera cobros para todas las reservas activas que no tengan cobro
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Buscar todas las reservas activas (CONFIRMADA, EN_CURSO) y completadas recientes
    const reservas = await prisma.reservaAirbnb.findMany({
      where: {
        OR: [
          { estadoReserva: 'CONFIRMADA' },
          { estadoReserva: 'EN_CURSO' },
          {
            AND: [
              { estadoReserva: 'COMPLETADA' },
              { checkOut: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, // Últimos 30 días
            ],
          },
        ],
      },
      include: {
        espacio: true,
      },
    })

    console.log(`Encontradas ${reservas.length} reservas para procesar`)

    // Para cada reserva, verificar si ya tiene cobro
    const cobrosCreados = []
    const cobrosExistentes = []
    const errores = []

    for (const reserva of reservas) {
      try {
        // Verificar si ya existe un cobro con este numeroComprobante (código de reserva)
        const cobroExistente = await prisma.cobro.findFirst({
          where: {
            numeroComprobante: reserva.codigoReserva,
            concepto: 'AIRBNB',
          },
        })

        if (cobroExistente) {
          console.log(`Cobro ya existe para reserva ${reserva.codigoReserva}`)
          cobrosExistentes.push({
            codigoReserva: reserva.codigoReserva,
            codigoCobro: cobroExistente.codigoInterno,
          })
          continue
        }

        // Auto-generar código interno del cobro
        const ultimoCobro = await prisma.cobro.findFirst({
          orderBy: { codigoInterno: 'desc' },
        })

        let codigoCobro = 'P-0001'
        if (ultimoCobro) {
          const numero = parseInt(ultimoCobro.codigoInterno.split('-')[1])
          codigoCobro = `P-${String(numero + 1).padStart(4, '0')}`
        }

        const checkIn = new Date(reserva.checkIn)
        const checkOut = new Date(reserva.checkOut)

        // Crear el cobro
        const nuevoCobro = await prisma.cobro.create({
          data: {
            codigoInterno: codigoCobro,
            espacioAirbnbId: reserva.espacioId,
            concepto: 'AIRBNB',
            periodo: `${checkIn.getFullYear()}-${String(checkIn.getMonth() + 1).padStart(2, '0')}`,
            montoPagado: 0,
            montoPactado: reserva.precioTotal,
            diferencia: -reserva.precioTotal,
            fechaPago: checkOut, // Se actualizará cuando se registre el pago
            fechaVencimiento: checkOut,
            diasDiferencia: null,
            metodoPago: 'TRANSFERENCIA', // Valor por defecto
            numeroComprobante: reserva.codigoReserva, // Referencia a la reserva
            estado: 'PENDIENTE',
            observaciones: `Reserva ${reserva.codigoReserva} - ${reserva.espacio.nombre} - Check-in: ${checkIn.toLocaleDateString()} - Check-out: ${checkOut.toLocaleDateString()}`,
          },
        })

        console.log(`Cobro creado: ${codigoCobro} para reserva ${reserva.codigoReserva}`)
        cobrosCreados.push({
          codigoReserva: reserva.codigoReserva,
          codigoCobro: nuevoCobro.codigoInterno,
          monto: reserva.precioTotal,
          espacio: reserva.espacio.nombre,
        })
      } catch (error: any) {
        console.error(`Error procesando reserva ${reserva.codigoReserva}:`, error)
        errores.push({
          codigoReserva: reserva.codigoReserva,
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      mensaje: `Proceso completado`,
      totalReservas: reservas.length,
      cobrosCreados: cobrosCreados.length,
      cobrosExistentes: cobrosExistentes.length,
      errores: errores.length,
      detalles: {
        creados: cobrosCreados,
        existentes: cobrosExistentes,
        errores,
      },
    })
  } catch (error: any) {
    console.error('Error al generar cobros:', error)
    return NextResponse.json(
      { error: 'Error al generar cobros', detalle: error.message },
      { status: 500 }
    )
  }
}
