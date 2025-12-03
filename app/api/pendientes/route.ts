/**
 * API de Pendientes/Recordatorios
 * GET /api/pendientes - Obtiene cobros y pagos pendientes
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()

    // === COBROS PENDIENTES (Cuentas por cobrar) ===

    // 1. Cobros pendientes del modelo Cobro
    const cobrosPendientes = await prisma.cobro.findMany({
      where: {
        estado: { in: ['PENDIENTE', 'PARCIAL'] },
      },
      include: {
        espacio: {
          include: {
            arrendatario: true,
          },
        },
        espacioAirbnb: true,
      },
      orderBy: {
        fechaVencimiento: 'asc',
      },
    })

    // 2. Espacios activos sin cobro del mes actual
    const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const espaciosActivos = await prisma.espacio.findMany({
      where: {
        activo: true,
        arrendatarioId: { not: null },
      },
      include: {
        arrendatario: true,
        cobros: {
          where: {
            periodo: mesActual,
          },
        },
      },
    })

    // Espacios sin cobro este mes
    const espaciosSinCobro = espaciosActivos
      .filter(e => e.cobros.length === 0)
      .map(e => ({
        id: `gen-${e.id}`,
        tipo: 'cobro_pendiente',
        tipoLabel: 'Renta Pendiente',
        espacioId: e.id,
        espacio: e.identificador,
        arrendatario: e.arrendatario?.nombre || 'Sin arrendatario',
        monto: e.monto || 0,
        fechaVencimiento: new Date(now.getFullYear(), now.getMonth(), e.diaPago || 1),
        diasVencido: Math.floor((now.getTime() - new Date(now.getFullYear(), now.getMonth(), e.diaPago || 1).getTime()) / (1000 * 60 * 60 * 24)),
        periodo: mesActual,
        concepto: 'RENTA',
        isGenerated: true,
      }))

    // 3. Reservas Airbnb pendientes de pago
    const reservasPendientes = await prisma.reservaAirbnb.findMany({
      where: {
        estadoPago: { in: ['PENDIENTE', 'PARCIAL'] },
        estadoReserva: { in: ['CONFIRMADA', 'EN_CURSO'] },
      },
      include: {
        espacio: true,
        huesped: true,
      },
      orderBy: {
        checkIn: 'asc',
      },
    })

    // === PAGOS PENDIENTES (Cuentas por pagar) ===

    // 1. Otros pagos pendientes
    const pagosPendientes = await prisma.otroPago.findMany({
      where: {
        estado: { in: ['PENDIENTE', 'VENCIDO'] },
      },
      orderBy: {
        fechaVencimiento: 'asc',
      },
    })

    // 2. Pagos recurrentes que deben generarse este mes
    const pagosRecurrentes = await prisma.pagoRecurrente.findMany({
      where: {
        activo: true,
      },
      include: {
        pagosGenerados: {
          where: {
            periodo: mesActual,
          },
        },
      },
    })

    // Pagos recurrentes sin pago este mes
    const recurrentesPendientes = pagosRecurrentes
      .filter(pr => pr.pagosGenerados.length === 0)
      .map(pr => ({
        id: `rec-${pr.id}`,
        tipo: 'pago_recurrente',
        tipoLabel: 'Pago Recurrente',
        pagoRecurrenteId: pr.id,
        nombre: pr.nombre,
        proveedor: pr.proveedor,
        monto: pr.montoFijo || 0,
        esMontoVariable: pr.esMontoVariable,
        fechaVencimiento: new Date(now.getFullYear(), now.getMonth(), pr.diaPago || 1),
        diasVencido: Math.floor((now.getTime() - new Date(now.getFullYear(), now.getMonth(), pr.diaPago || 1).getTime()) / (1000 * 60 * 60 * 24)),
        categoria: pr.categoria,
        periodo: mesActual,
        isGenerated: true,
      }))

    // Formatear cobros pendientes
    const cobrosPendientesFormateados = cobrosPendientes.map(c => ({
      id: c.id,
      tipo: 'cobro',
      tipoLabel: c.concepto === 'AIRBNB' ? 'Airbnb' : 'Renta',
      codigoInterno: c.codigoInterno,
      espacioId: c.espacioId,
      espacio: c.espacio?.identificador || c.espacioAirbnb?.nombre || '',
      arrendatario: c.espacio?.arrendatario?.nombre || '',
      monto: c.montoPactado,
      montoPagado: c.montoPagado,
      pendiente: c.montoPactado - c.montoPagado,
      fechaVencimiento: c.fechaVencimiento,
      diasVencido: Math.floor((now.getTime() - c.fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24)),
      periodo: c.periodo,
      concepto: c.concepto,
      estado: c.estado,
      isGenerated: false,
    }))

    // Formatear reservas pendientes
    const reservasPendientesFormateadas = reservasPendientes.map(r => ({
      id: r.id,
      tipo: 'reserva_airbnb',
      tipoLabel: 'Reserva Airbnb',
      codigoReserva: r.codigoReserva,
      espacio: r.espacio.nombre,
      huesped: r.huesped.nombre,
      monto: r.precioTotal,
      montoPagado: r.montoPagado,
      pendiente: r.balancePendiente,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      estadoPago: r.estadoPago,
      isGenerated: false,
    }))

    // Formatear pagos pendientes
    const pagosPendientesFormateados = pagosPendientes.map(p => ({
      id: p.id,
      tipo: 'pago',
      tipoLabel: p.categoria || 'Pago',
      codigoInterno: p.codigoInterno,
      proveedor: p.proveedor,
      descripcion: p.descripcion,
      monto: p.monto,
      fechaVencimiento: p.fechaVencimiento,
      diasVencido: p.fechaVencimiento ? Math.floor((now.getTime() - p.fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24)) : 0,
      categoria: p.categoria,
      estado: p.estado,
      isGenerated: false,
    }))

    // Combinar todos los pendientes de cobro
    const todosCobrosPendientes = [
      ...cobrosPendientesFormateados,
      ...espaciosSinCobro,
      ...reservasPendientesFormateadas,
    ].sort((a, b) => {
      const fechaA = 'fechaVencimiento' in a ? new Date(a.fechaVencimiento).getTime() :
                     'checkIn' in a ? new Date(a.checkIn).getTime() : 0
      const fechaB = 'fechaVencimiento' in b ? new Date(b.fechaVencimiento).getTime() :
                     'checkIn' in b ? new Date(b.checkIn).getTime() : 0
      return fechaA - fechaB
    })

    // Combinar todos los pendientes de pago
    const todosPagosPendientes = [
      ...pagosPendientesFormateados,
      ...recurrentesPendientes,
    ].sort((a, b) => {
      const fechaA = a.fechaVencimiento ? new Date(a.fechaVencimiento).getTime() : 0
      const fechaB = b.fechaVencimiento ? new Date(b.fechaVencimiento).getTime() : 0
      return fechaA - fechaB
    })

    return NextResponse.json({
      cobrosPendientes: todosCobrosPendientes,
      pagosPendientes: todosPagosPendientes,
      resumen: {
        totalCobrosPendientes: todosCobrosPendientes.reduce((sum, c) => sum + ('pendiente' in c ? c.pendiente : c.monto), 0),
        totalPagosPendientes: todosPagosPendientes.reduce((sum, p) => sum + p.monto, 0),
        cantidadCobros: todosCobrosPendientes.length,
        cantidadPagos: todosPagosPendientes.length,
      },
    })
  } catch (error) {
    console.error('Error al obtener pendientes:', error)
    return NextResponse.json(
      { error: 'Error al obtener pendientes' },
      { status: 500 }
    )
  }
}
