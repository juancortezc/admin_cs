/**
 * API de Pagos para Calendario
 * Obtiene todos los pagos (bills to pay) para un mes específico
 * Incluye OtroPago directo + instancias calculadas de PagoRecurrente
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Calculate next scheduled date for recurring payment
function calculateNextScheduledDate(
  pagoRecurrente: any,
  targetYear: number,
  targetMonth: number
): Date | null {
  const { frecuencia, diaPago, fechaInicio, fechaFin } = pagoRecurrente

  if (!fechaInicio) return null

  const startDate = new Date(fechaInicio)
  const endDate = fechaFin ? new Date(fechaFin) : null

  // Calculate scheduled date for target month
  let scheduledDate: Date

  switch (frecuencia) {
    case 'MENSUAL':
      if (!diaPago) return null
      scheduledDate = new Date(targetYear, targetMonth - 1, diaPago)
      break

    case 'QUINCENAL':
      // For quincenal, we'll generate two payments per month (1st and 15th)
      // This is simplified - you may want to customize
      return null // Skip for now, handle separately if needed

    case 'SEMANAL':
      // For weekly, calculate based on start date
      return null // Skip for now, too complex for monthly view

    case 'ANUAL':
      // Only if target month matches start month
      if (targetMonth !== startDate.getMonth() + 1) return null
      scheduledDate = new Date(targetYear, targetMonth - 1, startDate.getDate())
      break

    default:
      return null
  }

  // Check if scheduled date is within active period
  if (scheduledDate < startDate) return null
  if (endDate && scheduledDate > endDate) return null

  return scheduledDate
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mes = searchParams.get('mes') // Formato: YYYY-MM

    if (!mes) {
      return NextResponse.json(
        { error: 'Parámetro "mes" requerido (formato: YYYY-MM)' },
        { status: 400 }
      )
    }

    const [year, month] = mes.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0, 23, 59, 59, 999)

    const bills: any[] = []

    // 1. Get direct OtroPago instances (PENDIENTE or VENCIDO)
    const otrosPagos = await prisma.otroPago.findMany({
      where: {
        estado: { in: ['PENDIENTE', 'VENCIDO'] },
        OR: [
          {
            fechaPago: {
              gte: firstDay,
              lte: lastDay,
            },
          },
          {
            fechaVencimiento: {
              gte: firstDay,
              lte: lastDay,
            },
          },
        ],
      },
      include: {
        pagoRecurrente: {
          select: {
            nombre: true,
            codigoInterno: true,
          },
        },
      },
      orderBy: {
        fechaPago: 'asc',
      },
    })

    // Transform direct pagos to bill format
    otrosPagos.forEach((pago) => {
      const fechaRef = pago.fechaVencimiento || pago.fechaPago

      bills.push({
        id: pago.id,
        codigoInterno: pago.pagoRecurrente?.codigoInterno || `PAGO-${pago.id.substring(0, 8)}`,
        titulo: pago.proveedor,
        proveedor: pago.proveedor,
        categoria: pago.categoria,
        descripcion: pago.descripcion,
        monto: pago.monto,
        estado: pago.estado,
        metodoPago: pago.metodoPago,
        fechaPago: pago.fechaPago,
        fechaVencimiento: pago.fechaVencimiento,
        fecha: fechaRef, // For calendar display
        tipo: 'pago' as const,
        esRecurrente: !!pago.pagoRecurrenteId,
        pagoRecurrenteNombre: pago.pagoRecurrente?.nombre,
        observaciones: pago.observaciones,
      })
    })

    // 2. Get active recurring payments and calculate scheduled instances
    const pagosRecurrentes = await prisma.pagoRecurrente.findMany({
      where: {
        activo: true,
        fechaInicio: {
          lte: lastDay, // Started before or during this month
        },
        OR: [
          { fechaFin: null }, // No end date
          { fechaFin: { gte: firstDay } }, // End date after or during this month
        ],
      },
      include: {
        pagosGenerados: {
          where: {
            fechaPago: {
              gte: firstDay,
              lte: lastDay,
            },
          },
        },
      },
    })

    // For each recurring payment, calculate scheduled date and check if already paid
    pagosRecurrentes.forEach((pagoRecurrente) => {
      const scheduledDate = calculateNextScheduledDate(pagoRecurrente, year, month)

      if (!scheduledDate) return

      // Check if payment already exists for this period
      const alreadyPaid = pagoRecurrente.pagosGenerados.length > 0

      if (!alreadyPaid) {
        // Add as pending scheduled payment
        bills.push({
          id: `recurring-${pagoRecurrente.id}-${mes}`,
          codigoInterno: pagoRecurrente.codigoInterno,
          titulo: pagoRecurrente.nombre,
          proveedor: pagoRecurrente.proveedor,
          categoria: pagoRecurrente.categoria,
          descripcion: pagoRecurrente.descripcion,
          monto: pagoRecurrente.montoFijo || 0,
          estado: 'PENDIENTE',
          metodoPago: pagoRecurrente.metodoPago,
          fecha: scheduledDate,
          fechaVencimiento: scheduledDate,
          tipo: 'pago' as const,
          esRecurrente: true,
          pagoRecurrenteId: pagoRecurrente.id,
          pagoRecurrenteNombre: pagoRecurrente.nombre,
          frecuencia: pagoRecurrente.frecuencia,
          isCalculated: true, // Flag to indicate this is a calculated instance, not actual DB record
        })
      }
    })

    // Sort by date
    bills.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

    return NextResponse.json(bills)
  } catch (error) {
    console.error('Error al obtener pagos:', error)
    return NextResponse.json(
      { error: 'Error al obtener pagos del calendario' },
      { status: 500 }
    )
  }
}
