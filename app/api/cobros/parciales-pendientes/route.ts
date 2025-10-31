/**
 * API de Cobros con Pagos Parciales Pendientes
 * GET: Lista de cobros con estado PARCIAL para seguimiento
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Obtener todos los cobros con estado PARCIAL
    const cobrosParciales = await prisma.cobro.findMany({
      where: {
        estado: 'PARCIAL',
        esParcial: false, // Solo cobros principales, no los abonos
      },
      include: {
        espacio: {
          include: {
            arrendatario: true,
          },
        },
        pagosParciales: {
          orderBy: {
            fechaPago: 'asc',
          },
        },
      },
      orderBy: {
        fechaVencimiento: 'asc',
      },
    })

    // Calcular totales para cada cobro
    const cuentasPendientes = cobrosParciales.map((cobro) => {
      const totalAbonado = cobro.montoPagado + cobro.pagosParciales.reduce((sum, p) => sum + p.montoPagado, 0)
      const saldoPendiente = cobro.montoPactado - totalAbonado
      const porcentajePagado = (totalAbonado / cobro.montoPactado) * 100

      return {
        id: cobro.id,
        codigoInterno: cobro.codigoInterno,
        espacioIdentificador: cobro.espacio.identificador,
        arrendatarioNombre: cobro.espacio.arrendatario?.nombre || 'Sin arrendatario',
        concepto: cobro.concepto,
        periodo: cobro.periodo,
        montoPactado: cobro.montoPactado,
        totalAbonado,
        saldoPendiente,
        porcentajePagado,
        fechaVencimiento: cobro.fechaVencimiento,
        cantidadAbonos: 1 + cobro.pagosParciales.length, // Incluye el pago inicial
        abonos: [
          {
            id: cobro.id,
            codigoInterno: cobro.codigoInterno,
            montoPagado: cobro.montoPagado,
            fechaPago: cobro.fechaPago,
            metodoPago: cobro.metodoPago,
            observaciones: cobro.observaciones,
          },
          ...cobro.pagosParciales.map((p) => ({
            id: p.id,
            codigoInterno: p.codigoInterno,
            montoPagado: p.montoPagado,
            fechaPago: p.fechaPago,
            metodoPago: p.metodoPago,
            observaciones: p.observaciones,
          })),
        ],
      }
    })

    // Calcular estadísticas generales
    const estadisticas = {
      totalCuentas: cuentasPendientes.length,
      totalPorCobrar: cuentasPendientes.reduce((sum, c) => sum + c.montoPactado, 0),
      totalAbonado: cuentasPendientes.reduce((sum, c) => sum + c.totalAbonado, 0),
      totalPendiente: cuentasPendientes.reduce((sum, c) => sum + c.saldoPendiente, 0),
    }

    return NextResponse.json({
      cuentas: cuentasPendientes,
      estadisticas,
    })
  } catch (error) {
    console.error('Error al obtener cuentas pendientes:', error)
    return NextResponse.json({ error: 'Error al obtener cuentas pendientes' }, { status: 500 })
  }
}
