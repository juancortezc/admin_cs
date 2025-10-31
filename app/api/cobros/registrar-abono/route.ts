/**
 * API para Registrar Abono (Pago Parcial Adicional)
 * POST: Registra un nuevo abono vinculado a un cobro parcial existente
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar que el cobro principal existe y es PARCIAL
    const cobroPrincipal = await prisma.cobro.findUnique({
      where: { id: body.cobroRelacionadoId },
      include: {
        pagosParciales: true,
      },
    })

    if (!cobroPrincipal) {
      return NextResponse.json({ error: 'Cobro no encontrado' }, { status: 404 })
    }

    if (cobroPrincipal.estado !== 'PARCIAL') {
      return NextResponse.json({ error: 'El cobro no tiene estado PARCIAL' }, { status: 400 })
    }

    // Calcular total abonado hasta ahora
    const totalAbonado =
      cobroPrincipal.montoPagado + cobroPrincipal.pagosParciales.reduce((sum, p) => sum + p.montoPagado, 0)

    // Validar que el nuevo abono no exceda el monto pactado
    const nuevoTotal = totalAbonado + parseFloat(body.montoPagado)
    if (nuevoTotal > cobroPrincipal.montoPactado) {
      return NextResponse.json(
        {
          error: `El abono excede el saldo pendiente. Saldo: $${(cobroPrincipal.montoPactado - totalAbonado).toFixed(2)}`,
        },
        { status: 400 }
      )
    }

    // Generar código interno para el abono
    const ultimoCobro = await prisma.cobro.findFirst({
      orderBy: { codigoInterno: 'desc' },
    })

    let nuevoCodigo = 'P-0001'
    if (ultimoCobro) {
      const numero = parseInt(ultimoCobro.codigoInterno.split('-')[1])
      nuevoCodigo = `P-${String(numero + 1).padStart(4, '0')}`
    }

    // Crear el nuevo abono
    const abono = await prisma.cobro.create({
      data: {
        codigoInterno: nuevoCodigo,
        espacioId: cobroPrincipal.espacioId,
        concepto: cobroPrincipal.concepto,
        conceptoPersonalizado: cobroPrincipal.conceptoPersonalizado,
        periodo: cobroPrincipal.periodo,
        montoPagado: parseFloat(body.montoPagado),
        montoPactado: cobroPrincipal.montoPactado,
        diferencia: parseFloat(body.montoPagado) - cobroPrincipal.montoPactado,
        fechaPago: new Date(body.fechaPago),
        fechaVencimiento: cobroPrincipal.fechaVencimiento,
        diasDiferencia: null,
        metodoPago: body.metodoPago,
        numeroComprobante: body.numeroComprobante || null,
        estado: 'PARCIAL',
        esParcial: true,
        cobroRelacionadoId: body.cobroRelacionadoId,
        observaciones: body.observaciones || null,
      },
    })

    // Verificar si el cobro principal ahora está completamente pagado
    const nuevoTotalAbonado = nuevoTotal
    if (nuevoTotalAbonado >= cobroPrincipal.montoPactado) {
      // Actualizar el cobro principal a PAGADO
      await prisma.cobro.update({
        where: { id: cobroPrincipal.id },
        data: { estado: 'PAGADO' },
      })
    }

    return NextResponse.json(abono, { status: 201 })
  } catch (error) {
    console.error('Error al registrar abono:', error)
    return NextResponse.json({ error: 'Error al registrar abono' }, { status: 500 })
  }
}
