/**
 * API de Espacios - Lista todos los espacios
 * GET /api/espacios
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const espacios = await prisma.espacio.findMany({
      include: {
        arrendatario: true, // Incluir datos del arrendatario si existe
      },
      orderBy: {
        identificador: 'asc', // Ordenar por identificador
      },
    })

    return NextResponse.json(espacios)
  } catch (error) {
    console.error('Error al obtener espacios:', error)
    return NextResponse.json(
      { error: 'Error al obtener espacios' },
      { status: 500 }
    )
  }
}
