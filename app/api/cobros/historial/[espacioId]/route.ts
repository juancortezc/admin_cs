/**
 * API de Historial de Cobros por Espacio
 * GET - Obtener todos los cobros de un espacio específico
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ espacioId: string }> }) {
  try {
    const { espacioId } = await params

    // Verificar que el espacio existe
    const espacio = await prisma.espacio.findUnique({
      where: { id: espacioId },
      include: {
        arrendatario: true,
      },
    })

    if (!espacio) {
      return NextResponse.json({ error: 'Espacio no encontrado' }, { status: 404 })
    }

    // Obtener todos los cobros del espacio
    const cobros = await prisma.cobro.findMany({
      where: {
        espacioId,
      },
      include: {
        cobroRelacionado: true,
        pagosParciales: true,
      },
      orderBy: {
        fechaPago: 'desc',
      },
    })

    // Calcular estadísticas del espacio
    const estadisticas = {
      totalCobros: cobros.length,
      totalCobrado: cobros.reduce((sum, c) => sum + c.montoPagado, 0),
      totalPactado: cobros.reduce((sum, c) => sum + c.montoPactado, 0),
      diferenciaTotal: cobros.reduce((sum, c) => sum + c.diferencia, 0),
      pagados: cobros.filter((c) => c.estado === 'PAGADO').length,
      pendientes: cobros.filter((c) => c.estado === 'PENDIENTE').length,
      parciales: cobros.filter((c) => c.estado === 'PARCIAL').length,
    }

    return NextResponse.json({
      espacio,
      cobros,
      estadisticas,
    })
  } catch (error) {
    console.error('Error al obtener historial:', error)
    return NextResponse.json({ error: 'Error al obtener historial' }, { status: 500 })
  }
}
