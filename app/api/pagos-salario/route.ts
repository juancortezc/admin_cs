/**
 * API de Pagos de Salario
 * GET /api/pagos-salario - Lista pagos de salario
 * POST /api/pagos-salario - Registra un pago de salario
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const empleadoId = searchParams.get('empleadoId')

    const pagos = await prisma.pagoSalario.findMany({
      where: empleadoId ? { empleadoId } : undefined,
      include: {
        empleado: {
          select: { id: true, nombre: true, cargo: true },
        },
      },
      orderBy: { fechaPago: 'desc' },
    })

    return NextResponse.json(pagos)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      empleadoId,
      periodo,
      monto,
      bonos = 0,
      descuentos = 0,
      total,
      fechaPago,
      formaPago,
      referencia,
      observaciones,
    } = body

    if (!empleadoId || !periodo || !monto || !fechaPago) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Verificar que el empleado existe
    const empleado = await prisma.empleado.findUnique({ where: { id: empleadoId } })
    if (!empleado) {
      return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 })
    }

    // Verificar que no exista ya un pago para ese período
    const pagoExistente = await prisma.pagoSalario.findUnique({
      where: { empleadoId_periodo: { empleadoId, periodo } },
    })
    if (pagoExistente) {
      return NextResponse.json(
        { error: `Ya existe un pago registrado para ${periodo}` },
        { status: 400 }
      )
    }

    const pago = await prisma.pagoSalario.create({
      data: {
        empleadoId,
        periodo,
        monto: parseFloat(monto.toString()),
        bonos: parseFloat(bonos.toString()),
        descuentos: parseFloat(descuentos.toString()),
        total: total ? parseFloat(total.toString()) : parseFloat(monto.toString()) + parseFloat(bonos.toString()) - parseFloat(descuentos.toString()),
        fechaPago: new Date(fechaPago),
        formaPago: formaPago || null,
        referencia: referencia || null,
        observaciones: observaciones || null,
      },
      include: {
        empleado: {
          select: { id: true, nombre: true, cargo: true },
        },
      },
    })

    return NextResponse.json(pago, { status: 201 })
  } catch (error: unknown) {
    console.error('Error:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un pago para ese empleado en ese período' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Error al registrar pago' }, { status: 500 })
  }
}
