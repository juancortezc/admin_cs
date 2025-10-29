/**
 * API de Arrendatarios - CRUD completo
 * GET /api/arrendatarios - Lista todos
 * POST /api/arrendatarios - Crea nuevo
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Listar todos los arrendatarios
export async function GET() {
  try {
    const arrendatarios = await prisma.arrendatario.findMany({
      include: {
        espacios: true, // Incluir espacios asociados
      },
      orderBy: {
        nombre: 'asc',
      },
    })

    return NextResponse.json(arrendatarios)
  } catch (error) {
    console.error('Error al obtener arrendatarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener arrendatarios' },
      { status: 500 }
    )
  }
}

// Crear nuevo arrendatario
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, email, celular } = body

    // Validación básica
    if (!nombre || !email || !celular) {
      return NextResponse.json(
        { error: 'Nombre, email y celular son requeridos' },
        { status: 400 }
      )
    }

    // Crear arrendatario
    const arrendatario = await prisma.arrendatario.create({
      data: {
        nombre,
        email,
        celular,
      },
    })

    return NextResponse.json(arrendatario, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear arrendatario:', error)

    // Error de email duplicado
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al crear arrendatario' },
      { status: 500 }
    )
  }
}
