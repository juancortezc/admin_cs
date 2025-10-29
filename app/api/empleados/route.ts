/**
 * API de Empleados - CRUD completo
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const empleados = await prisma.empleado.findMany({
      include: {
        pagos: {
          orderBy: { fechaPago: 'desc' },
          take: 3,
        },
      },
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json(empleados)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al obtener empleados' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, celular, email, cargo, salario, diaPago, fechaContratacion } = body

    if (!nombre || !celular || !cargo || !salario || !diaPago || !fechaContratacion) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const empleado = await prisma.empleado.create({
      data: {
        nombre,
        celular,
        email,
        cargo,
        salario: parseFloat(salario),
        diaPago: parseInt(diaPago),
        fechaContratacion: new Date(fechaContratacion),
      },
    })

    return NextResponse.json(empleado, { status: 201 })
  } catch (error: any) {
    console.error('Error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al crear empleado' }, { status: 500 })
  }
}
