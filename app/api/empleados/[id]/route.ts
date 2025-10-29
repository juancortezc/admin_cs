/**
 * API de Empleados - Operaciones individuales
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const empleado = await prisma.empleado.findUnique({
      where: { id },
      include: { pagos: { orderBy: { fechaPago: 'desc' } } },
    })

    if (!empleado) {
      return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 })
    }

    return NextResponse.json(empleado)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener empleado' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nombre, celular, email, cargo, salario, diaPago, fechaContratacion, activo } = body

    const empleado = await prisma.empleado.update({
      where: { id },
      data: {
        nombre,
        celular,
        email,
        cargo,
        salario: parseFloat(salario),
        diaPago: parseInt(diaPago),
        fechaContratacion: new Date(fechaContratacion),
        activo,
      },
    })

    return NextResponse.json(empleado)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error al actualizar empleado' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params
    await prisma.empleado.update({
      where: { id },
      data: { activo: false },
    })

    return NextResponse.json({ message: 'Empleado desactivado' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al desactivar empleado' }, { status: 500 })
  }
}
