/**
 * API de Servicios Básicos - CRUD completo
 * GET /api/servicios - Lista todos los servicios
 * POST /api/servicios - Crea nuevo servicio
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Listar todos los servicios básicos
export async function GET() {
  try {
    const servicios = await prisma.servicioBasico.findMany({
      include: {
        pagos: {
          orderBy: { fechaPago: 'desc' },
          take: 5, // Últimos 5 pagos
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    })

    return NextResponse.json(servicios)
  } catch (error) {
    console.error('Error al obtener servicios:', error)
    return NextResponse.json(
      { error: 'Error al obtener servicios' },
      { status: 500 }
    )
  }
}

// Crear nuevo servicio
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, proveedor, tipoMonto, montoFijo, diaPago, numeroCuenta } = body

    // Validación básica
    if (!nombre || !diaPago) {
      return NextResponse.json(
        { error: 'Nombre y día de pago son requeridos' },
        { status: 400 }
      )
    }

    if (diaPago < 1 || diaPago > 31) {
      return NextResponse.json(
        { error: 'Día de pago debe estar entre 1 y 31' },
        { status: 400 }
      )
    }

    // Crear servicio
    const servicio = await prisma.servicioBasico.create({
      data: {
        nombre,
        proveedor,
        tipoMonto: tipoMonto || 'VARIABLE',
        montoFijo: tipoMonto === 'FIJO' ? parseFloat(montoFijo) : null,
        diaPago: parseInt(diaPago),
        numeroCuenta,
      },
    })

    return NextResponse.json(servicio, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear servicio:', error)
    return NextResponse.json(
      { error: 'Error al crear servicio' },
      { status: 500 }
    )
  }
}
