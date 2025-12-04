/**
 * API de Reportes - Resumen Mensual
 * GET /api/reportes/resumen?mes=2024-12
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mes = searchParams.get('mes') // Formato: 2024-12

    if (!mes) {
      return NextResponse.json({ error: 'Parámetro mes requerido' }, { status: 400 })
    }

    const [year, month] = mes.split('-').map(Number)
    const inicioMes = new Date(year, month - 1, 1)
    const finMes = new Date(year, month, 0, 23, 59, 59)

    // ========================================
    // 1. REPORTE AIRBNB
    // ========================================

    // Obtener espacios Airbnb activos
    const espaciosAirbnb = await prisma.espacioAirbnb.findMany({
      where: { activo: true },
      select: { id: true, nombre: true }
    })
    const totalEspaciosAirbnb = espaciosAirbnb.length
    const diasEnMes = finMes.getDate()
    const nochesDisponiblesTotales = totalEspaciosAirbnb * diasEnMes

    // Reservas del mes (que tengan noches en el mes seleccionado)
    const reservasMes = await prisma.reservaAirbnb.findMany({
      where: {
        OR: [
          // Check-in en el mes
          { checkIn: { gte: inicioMes, lte: finMes } },
          // Check-out en el mes
          { checkOut: { gte: inicioMes, lte: finMes } },
          // Reserva que abarca todo el mes
          { AND: [{ checkIn: { lte: inicioMes } }, { checkOut: { gte: finMes } }] }
        ],
        estadoReserva: { in: ['CONFIRMADA', 'EN_CURSO', 'COMPLETADA'] }
      },
      include: {
        espacio: { select: { nombre: true } },
        huesped: { select: { nombre: true, pais: true } }
      },
      orderBy: { checkIn: 'asc' }
    })

    // Calcular noches ocupadas en el mes específico
    let nochesOcupadasMes = 0
    let totalHuespedes = 0
    let ingresosMes = 0

    const reservasDetalle = reservasMes.map(r => {
      // Calcular noches dentro del mes
      const checkInEfectivo = r.checkIn < inicioMes ? inicioMes : r.checkIn
      const checkOutEfectivo = r.checkOut > finMes ? finMes : r.checkOut
      const nochesEnMes = Math.max(0, Math.ceil((checkOutEfectivo.getTime() - checkInEfectivo.getTime()) / (1000 * 60 * 60 * 24)))

      nochesOcupadasMes += nochesEnMes
      totalHuespedes += r.numHuespedes

      // Ingresos proporcionales al mes
      const proporcion = r.noches > 0 ? nochesEnMes / r.noches : 0
      const ingresoProporcional = r.precioTotal * proporcion
      ingresosMes += ingresoProporcional

      return {
        id: r.id,
        codigoReserva: r.codigoReserva,
        espacio: r.espacio.nombre,
        huesped: r.huesped.nombre,
        pais: r.huesped.pais,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        noches: r.noches,
        nochesEnMes,
        numHuespedes: r.numHuespedes,
        precioTotal: r.precioTotal,
        ingresoProporcional,
        estadoReserva: r.estadoReserva,
        estadoPago: r.estadoPago
      }
    })

    const porcentajeOcupacion = nochesDisponiblesTotales > 0
      ? (nochesOcupadasMes / nochesDisponiblesTotales) * 100
      : 0

    // ========================================
    // 2. REPORTE DE PAGOS REALIZADOS
    // ========================================

    // Pagos de servicios/otros
    const otrosPagos = await prisma.otroPago.findMany({
      where: {
        fechaPago: { gte: inicioMes, lte: finMes },
        estado: 'PAGADO'
      },
      orderBy: { fechaPago: 'desc' }
    })

    // Pagos de salarios
    const pagosSalarios = await prisma.pagoSalario.findMany({
      where: {
        fechaPago: { gte: inicioMes, lte: finMes }
      },
      include: {
        empleado: { select: { nombre: true, cargo: true } }
      },
      orderBy: { fechaPago: 'desc' }
    })

    const totalPagosServicios = otrosPagos.reduce((sum, p) => sum + p.monto, 0)
    const totalPagosSalarios = pagosSalarios.reduce((sum, p) => sum + p.total, 0)
    const totalPagos = totalPagosServicios + totalPagosSalarios

    const pagosDetalle = [
      ...otrosPagos.map(p => ({
        id: p.id,
        tipo: 'servicio' as const,
        concepto: p.proveedor,
        categoria: p.categoria,
        monto: p.monto,
        fechaPago: p.fechaPago,
        metodoPago: p.metodoPago,
        descripcion: p.descripcion
      })),
      ...pagosSalarios.map(p => ({
        id: p.id,
        tipo: 'salario' as const,
        concepto: `Salario - ${p.empleado.nombre}`,
        categoria: 'NOMINA',
        monto: p.total,
        fechaPago: p.fechaPago,
        metodoPago: p.formaPago,
        descripcion: `${p.empleado.cargo} - ${p.periodo}`
      }))
    ].sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime())

    // ========================================
    // 3. REPORTE DE COBROS DEL MES
    // ========================================

    const cobros = await prisma.cobro.findMany({
      where: {
        OR: [
          { periodo: mes },
          { fechaVencimiento: { gte: inicioMes, lte: finMes } }
        ]
      },
      include: {
        espacio: {
          select: {
            identificador: true,
            arrendatario: { select: { nombre: true } }
          }
        }
      },
      orderBy: { fechaVencimiento: 'asc' }
    })

    const cobrosPendientes = cobros.filter(c => c.estado === 'PENDIENTE' || c.estado === 'PARCIAL')
    const cobrosPagados = cobros.filter(c => c.estado === 'PAGADO')

    const montoPendiente = cobrosPendientes.reduce((sum, c) => {
      const pendiente = c.montoPactado - (c.montoPagado || 0)
      return sum + pendiente
    }, 0)

    const montoCobrado = cobrosPagados.reduce((sum, c) => sum + (c.montoPagado || 0), 0)

    // También sumar lo cobrado de los parciales
    const montoCobradoParciales = cobrosPendientes
      .filter(c => c.estado === 'PARCIAL')
      .reduce((sum, c) => sum + (c.montoPagado || 0), 0)

    const cobrosDetalle = cobrosPendientes.map(c => ({
      id: c.id,
      espacio: c.espacio?.identificador || 'N/A',
      arrendatario: c.espacio?.arrendatario?.nombre || 'N/A',
      concepto: c.concepto,
      periodo: c.periodo,
      montoPactado: c.montoPactado,
      montoPagado: c.montoPagado || 0,
      pendiente: c.montoPactado - (c.montoPagado || 0),
      fechaVencimiento: c.fechaVencimiento,
      estado: c.estado,
      diasVencido: c.fechaVencimiento
        ? Math.max(0, Math.floor((new Date().getTime() - new Date(c.fechaVencimiento).getTime()) / (1000 * 60 * 60 * 24)))
        : 0
    }))

    // ========================================
    // 4. RESUMEN ESPACIOS ARRENDAMIENTO
    // ========================================

    const espacios = await prisma.espacio.findMany({
      where: { activo: true },
      include: { arrendatario: { select: { nombre: true } } }
    })

    const espaciosOcupados = espacios.filter(e => e.arrendatarioId !== null)
    const espaciosDisponibles = espacios.filter(e => e.arrendatarioId === null)

    // ========================================
    // RESPUESTA CONSOLIDADA
    // ========================================

    return NextResponse.json({
      mes,

      // Datos generales (para KPIs existentes)
      cobros: {
        total: cobros.length,
        pendientes: cobrosPendientes.length,
        cobrados: cobrosPagados.length,
        montoPendiente,
        montoCobrado: montoCobrado + montoCobradoParciales
      },
      pagos: {
        total: otrosPagos.length + pagosSalarios.length,
        pendientes: 0,
        pagados: otrosPagos.length + pagosSalarios.length,
        montoPendiente: 0,
        montoPagado: totalPagos
      },
      espacios: {
        total: espacios.length,
        ocupados: espaciosOcupados.length,
        disponibles: espaciosDisponibles.length,
        tasaOcupacion: espacios.length > 0 ? (espaciosOcupados.length / espacios.length) * 100 : 0
      },
      airbnb: {
        reservasActivas: reservasMes.length,
        ingresosMes: Math.round(ingresosMes * 100) / 100
      },

      // Reportes detallados
      reporteAirbnb: {
        totalEspacios: totalEspaciosAirbnb,
        diasEnMes,
        nochesDisponibles: nochesDisponiblesTotales,
        nochesOcupadas: nochesOcupadasMes,
        porcentajeOcupacion: Math.round(porcentajeOcupacion * 100) / 100,
        totalReservas: reservasMes.length,
        totalHuespedes,
        ingresosMes: Math.round(ingresosMes * 100) / 100,
        reservas: reservasDetalle
      },

      reportePagos: {
        totalPagos,
        totalServicios: totalPagosServicios,
        totalSalarios: totalPagosSalarios,
        cantidadPagos: pagosDetalle.length,
        detalle: pagosDetalle
      },

      reporteCobrosPendientes: {
        totalPendiente: montoPendiente,
        cantidadPendientes: cobrosPendientes.length,
        detalle: cobrosDetalle
      }
    })
  } catch (error) {
    console.error('Error en reporte:', error)
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500 })
  }
}
