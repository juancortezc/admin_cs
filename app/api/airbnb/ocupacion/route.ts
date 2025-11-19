/**
 * API de Ocupación de Airbnb
 * GET - Obtener estado de ocupación de todos los espacios Airbnb
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    // Obtener todos los espacios de Airbnb
    const espacios = await prisma.espacioAirbnb.findMany({
      orderBy: {
        nombre: 'asc',
      },
    })

    // Para cada espacio, buscar su reserva actual y próxima reserva
    const espaciosConOcupacion = await Promise.all(
      espacios.map(async (espacio) => {
        // Buscar reserva actual (EN_CURSO o CONFIRMADA que ya inició)
        const reservaActual = await prisma.reservaAirbnb.findFirst({
          where: {
            espacioId: espacio.id,
            OR: [
              { estadoReserva: 'EN_CURSO' },
              {
                AND: [
                  { estadoReserva: 'CONFIRMADA' },
                  { checkIn: { lte: hoy } },
                  { checkOut: { gte: hoy } },
                ],
              },
            ],
          },
          include: {
            huesped: true,
          },
          orderBy: {
            checkIn: 'desc',
          },
        })

        // Buscar próxima reserva (CONFIRMADA que aún no inicia)
        const proximaReserva = await prisma.reservaAirbnb.findFirst({
          where: {
            espacioId: espacio.id,
            estadoReserva: 'CONFIRMADA',
            checkIn: { gt: hoy },
          },
          orderBy: {
            checkIn: 'asc',
          },
        })

        // Si hay reserva actual, buscar su cobro
        let cobroPendiente = null
        if (reservaActual) {
          cobroPendiente = await prisma.cobro.findFirst({
            where: {
              numeroComprobante: reservaActual.codigoReserva,
              concepto: 'AIRBNB',
            },
          })
        }

        return {
          id: espacio.id,
          nombre: espacio.nombre,
          capacidad: espacio.capacidad,
          ...(reservaActual && {
            reservaActual: {
              id: reservaActual.id,
              codigoReserva: reservaActual.codigoReserva,
              huesped: {
                nombre: reservaActual.huesped.nombre,
              },
              checkIn: reservaActual.checkIn.toISOString(),
              checkOut: reservaActual.checkOut.toISOString(),
              precioTotal: reservaActual.precioTotal,
              estadoReserva: reservaActual.estadoReserva,
            },
          }),
          ...(proximaReserva && {
            proximaReserva: {
              id: proximaReserva.id,
              codigoReserva: proximaReserva.codigoReserva,
              checkIn: proximaReserva.checkIn.toISOString(),
              checkOut: proximaReserva.checkOut.toISOString(),
            },
          }),
          ...(cobroPendiente && {
            cobroPendiente: {
              id: cobroPendiente.id,
              codigoInterno: cobroPendiente.codigoInterno,
              montoPactado: cobroPendiente.montoPactado,
              montoPagado: cobroPendiente.montoPagado,
              estado: cobroPendiente.estado,
            },
          }),
        }
      })
    )

    return NextResponse.json({
      espacios: espaciosConOcupacion,
      total: espacios.length,
      ocupados: espaciosConOcupacion.filter((e) => e.reservaActual).length,
      disponibles: espaciosConOcupacion.filter((e) => !e.reservaActual && !e.proximaReserva).length,
      proximasReservas: espaciosConOcupacion.filter((e) => !e.reservaActual && e.proximaReserva).length,
    })
  } catch (error) {
    console.error('Error al obtener ocupación:', error)
    return NextResponse.json({ error: 'Error al obtener ocupación' }, { status: 500 })
  }
}
