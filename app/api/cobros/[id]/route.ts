/**
 * API de Cobro Individual
 * GET - Obtener un cobro específico
 * PUT - Editar cobro
 * DELETE - Eliminar cobro
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const cobro = await prisma.cobro.findUnique({
      where: { id },
      include: {
        espacio: {
          include: {
            arrendatario: true,
          },
        },
        cobroRelacionado: true,
        pagosParciales: true,
      },
    })

    if (!cobro) {
      return NextResponse.json({ error: 'Cobro no encontrado' }, { status: 404 })
    }

    return NextResponse.json(cobro)
  } catch (error) {
    console.error('Error al obtener cobro:', error)
    return NextResponse.json({ error: 'Error al obtener cobro' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Verificar que el cobro existe
    const cobroExistente = await prisma.cobro.findUnique({
      where: { id },
    })

    if (!cobroExistente) {
      return NextResponse.json({ error: 'Cobro no encontrado' }, { status: 404 })
    }

    // Campos que se pueden actualizar
    const {
      concepto,
      conceptoPersonalizado,
      periodo,
      montoPagado,
      montoPactado,
      fechaPago,
      fechaVencimiento,
      metodoPago,
      numeroComprobante,
      estado,
      observaciones,
      esParcial,
      cobroRelacionadoId,
    } = body

    // Recalcular campos automáticos si se modifican los montos o fechas
    let diferencia = cobroExistente.diferencia
    let diasDiferencia = cobroExistente.diasDiferencia

    if (montoPagado !== undefined && montoPactado !== undefined) {
      diferencia = parseFloat(montoPagado) - parseFloat(montoPactado)
    }

    if (fechaPago !== undefined && fechaVencimiento !== undefined && estado === 'PAGADO') {
      const fechaPagoDate = new Date(fechaPago)
      const fechaVencimientoDate = new Date(fechaVencimiento)
      diasDiferencia = Math.floor(
        (fechaPagoDate.getTime() - fechaVencimientoDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    }

    // Actualizar cobro
    const cobro = await prisma.cobro.update({
      where: { id },
      data: {
        ...(concepto && { concepto }),
        ...(conceptoPersonalizado !== undefined && { conceptoPersonalizado }),
        ...(periodo !== undefined && { periodo }),
        ...(montoPagado !== undefined && { montoPagado: parseFloat(montoPagado) }),
        ...(montoPactado !== undefined && { montoPactado: parseFloat(montoPactado) }),
        ...(diferencia !== undefined && { diferencia }),
        ...(fechaPago && { fechaPago: new Date(fechaPago) }),
        ...(fechaVencimiento && { fechaVencimiento: new Date(fechaVencimiento) }),
        ...(diasDiferencia !== undefined && { diasDiferencia }),
        ...(metodoPago && { metodoPago }),
        ...(numeroComprobante !== undefined && { numeroComprobante }),
        ...(estado && { estado }),
        ...(observaciones !== undefined && { observaciones }),
        ...(esParcial !== undefined && { esParcial }),
        ...(cobroRelacionadoId !== undefined && { cobroRelacionadoId }),
      },
      include: {
        espacio: {
          include: {
            arrendatario: true,
          },
        },
      },
    })

    return NextResponse.json(cobro)
  } catch (error) {
    console.error('Error al actualizar cobro:', error)
    return NextResponse.json({ error: 'Error al actualizar cobro' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Verificar que el cobro existe
    const cobro = await prisma.cobro.findUnique({
      where: { id },
      include: {
        pagosParciales: true,
      },
    })

    if (!cobro) {
      return NextResponse.json({ error: 'Cobro no encontrado' }, { status: 404 })
    }

    // Si tiene pagos parciales vinculados, advertir
    if (cobro.pagosParciales.length > 0) {
      return NextResponse.json(
        {
          error: 'Este cobro tiene pagos parciales vinculados. Elimínelos primero.',
        },
        { status: 400 }
      )
    }

    // Eliminar cobro
    await prisma.cobro.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Cobro eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar cobro:', error)
    return NextResponse.json({ error: 'Error al eliminar cobro' }, { status: 500 })
  }
}
