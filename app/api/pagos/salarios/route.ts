/**
 * API de Pagos de Salarios
 * POST - Registrar pago de salario
 * GET - Listar pagos de salarios
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const empleadoId = searchParams.get('empleadoId')
    const periodo = searchParams.get('periodo') // Formato: 2024-10

    const where: any = {}

    if (empleadoId) {
      where.empleadoId = empleadoId
    }

    if (periodo) {
      where.periodo = periodo
    }

    const pagos = await prisma.pagoSalario.findMany({
      where,
      include: {
        empleado: true,
      },
      orderBy: { fechaPago: 'desc' },
    })

    return NextResponse.json(pagos)
  } catch (error) {
    console.error('Error al obtener pagos:', error)
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { empleadoId, periodo, monto, bonos, descuentos, total, fechaPago, formaPago, referencia, observaciones } = body

    if (!empleadoId || !periodo || !monto || !fechaPago) {
      return NextResponse.json(
        { error: 'Empleado, período, monto y fecha de pago son requeridos' },
        { status: 400 }
      )
    }

    // Crear pago de salario
    const pago = await prisma.pagoSalario.create({
      data: {
        empleadoId,
        periodo,
        monto: parseFloat(monto),
        bonos: bonos ? parseFloat(bonos) : 0,
        descuentos: descuentos ? parseFloat(descuentos) : 0,
        total: total ? parseFloat(total) : parseFloat(monto),
        fechaPago: new Date(fechaPago),
        formaPago: formaPago || undefined,
        referencia: referencia || undefined,
        observaciones,
      },
      include: {
        empleado: true,
      },
    })

    return NextResponse.json(pago, { status: 201 })
  } catch (error) {
    console.error('Error al registrar pago:', error)
    return NextResponse.json({ error: 'Error al registrar pago' }, { status: 500 })
  }
}
