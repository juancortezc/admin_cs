/**
 * API de Resumen Mensual
 * GET /api/resumen-mensual - Obtiene ingresos y egresos del mes
 * GET /api/resumen-mensual?mes=12&anio=2025 - Filtrar por mes/año
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mes = searchParams.get('mes')
    const anio = searchParams.get('anio')

    // Usar mes y año actual si no se proporciona
    const now = new Date()
    const mesActual = mes ? parseInt(mes) : now.getMonth() + 1
    const anioActual = anio ? parseInt(anio) : now.getFullYear()

    // Calcular rango de fechas del mes
    const fechaInicio = new Date(anioActual, mesActual - 1, 1)
    const fechaFin = new Date(anioActual, mesActual, 0, 23, 59, 59)

    // === INGRESOS ===

    // 1. Cobros del modelo Cobro (sistema nuevo)
    const cobros = await prisma.cobro.findMany({
      where: {
        fechaPago: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estado: { in: ['PAGADO', 'PARCIAL'] },
      },
      include: {
        espacio: {
          include: {
            arrendatario: true,
          },
        },
        espacioAirbnb: true,
      },
    })

    // 2. Cobros legacy (CobroArriendo)
    const cobrosLegacy = await prisma.cobroArriendo.findMany({
      where: {
        fechaCobro: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      include: {
        espacio: {
          include: {
            arrendatario: true,
          },
        },
      },
    })

    // 3. Abonos Airbnb
    const abonosAirbnb = await prisma.abonoReserva.findMany({
      where: {
        fechaPago: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      include: {
        reserva: {
          include: {
            espacio: true,
            huesped: true,
          },
        },
      },
    })

    // === EGRESOS ===

    // 1. Otros pagos
    const otrosPagos = await prisma.otroPago.findMany({
      where: {
        fechaPago: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estado: 'PAGADO',
      },
    })

    // 2. Pagos de servicios
    const pagosServicios = await prisma.pagoServicio.findMany({
      where: {
        fechaPago: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      include: {
        servicioBasico: true,
      },
    })

    // 3. Pagos de salarios
    const pagosSalarios = await prisma.pagoSalario.findMany({
      where: {
        fechaPago: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      include: {
        empleado: true,
      },
    })

    // Calcular totales
    const totalCobros = cobros.reduce((sum, c) => sum + c.montoPagado, 0)
    const totalCobrosLegacy = cobrosLegacy.reduce((sum, c) => sum + c.monto, 0)
    const totalAbonosAirbnb = abonosAirbnb.reduce((sum, a) => sum + a.monto, 0)
    const totalIngresos = totalCobros + totalCobrosLegacy + totalAbonosAirbnb

    const totalOtrosPagos = otrosPagos.reduce((sum, p) => sum + p.monto, 0)
    const totalServicios = pagosServicios.reduce((sum, p) => sum + p.monto, 0)
    const totalSalarios = pagosSalarios.reduce((sum, p) => sum + p.total, 0)
    const totalEgresos = totalOtrosPagos + totalServicios + totalSalarios

    // Desglose de ingresos
    const ingresosPorConcepto = {
      renta: cobros.filter(c => c.concepto === 'RENTA').reduce((sum, c) => sum + c.montoPagado, 0) + totalCobrosLegacy,
      airbnb: cobros.filter(c => c.concepto === 'AIRBNB').reduce((sum, c) => sum + c.montoPagado, 0) + totalAbonosAirbnb,
      otros: cobros.filter(c => c.concepto === 'OTRO').reduce((sum, c) => sum + c.montoPagado, 0),
    }

    // Desglose de egresos
    const egresosPorCategoria = {
      servicios: totalServicios,
      salarios: totalSalarios,
      mantenimiento: otrosPagos.filter(p => p.categoria === 'MANTENIMIENTO').reduce((sum, p) => sum + p.monto, 0),
      otros: otrosPagos.filter(p => p.categoria !== 'MANTENIMIENTO').reduce((sum, p) => sum + p.monto, 0),
    }

    // Obtener años con datos
    const aniosConDatos = await prisma.$queryRaw<{ anio: number }[]>`
      SELECT DISTINCT EXTRACT(YEAR FROM "fechaPago")::int as anio FROM "Cobro"
      UNION
      SELECT DISTINCT EXTRACT(YEAR FROM "fechaCobro")::int as anio FROM "CobroArriendo"
      UNION
      SELECT DISTINCT EXTRACT(YEAR FROM "fechaPago")::int as anio FROM "OtroPago"
      UNION
      SELECT DISTINCT EXTRACT(YEAR FROM "fechaPago")::int as anio FROM "PagoServicio"
      UNION
      SELECT DISTINCT EXTRACT(YEAR FROM "fechaPago")::int as anio FROM "PagoSalario"
      UNION
      SELECT DISTINCT EXTRACT(YEAR FROM "fechaPago")::int as anio FROM "AbonoReserva"
      ORDER BY anio DESC
    `

    const aniosDisponibles = aniosConDatos
      .map(a => a.anio)
      .filter(a => a !== null)

    // Si no hay años, incluir el actual
    if (aniosDisponibles.length === 0) {
      aniosDisponibles.push(now.getFullYear())
    }

    return NextResponse.json({
      mes: mesActual,
      anio: anioActual,
      ingresos: {
        total: totalIngresos,
        desglose: ingresosPorConcepto,
        detalle: {
          cobros: cobros.length + cobrosLegacy.length,
          abonosAirbnb: abonosAirbnb.length,
        },
      },
      egresos: {
        total: totalEgresos,
        desglose: egresosPorCategoria,
        detalle: {
          otrosPagos: otrosPagos.length,
          servicios: pagosServicios.length,
          salarios: pagosSalarios.length,
        },
      },
      balance: totalIngresos - totalEgresos,
      aniosDisponibles,
    })
  } catch (error) {
    console.error('Error al obtener resumen mensual:', error)
    return NextResponse.json(
      { error: 'Error al obtener resumen mensual' },
      { status: 500 }
    )
  }
}
