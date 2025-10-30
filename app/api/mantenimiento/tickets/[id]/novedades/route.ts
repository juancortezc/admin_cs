import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = Promise<{ id: string }>

// GET - Obtener todas las novedades de un ticket
export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params

    const novedades = await prisma.novedadTicket.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(novedades)
  } catch (error) {
    console.error('Error al obtener novedades:', error)
    return NextResponse.json(
      { error: 'Error al obtener novedades del ticket' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva novedad
export async function POST(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Crear la novedad
    const novedad = await prisma.novedadTicket.create({
      data: {
        ticketId: id,
        descripcion: body.descripcion,
        tipo: body.tipo || 'ACTUALIZACION',
        costoAsociado: body.costoAsociado || 0,
        registradoPor: body.registradoPor || null,
      }
    })

    // Si la novedad tiene un costo, actualizar el costo real del ticket
    if (body.costoAsociado && body.costoAsociado > 0) {
      const ticket = await prisma.ticketMantenimiento.findUnique({
        where: { id }
      })

      if (ticket) {
        await prisma.ticketMantenimiento.update({
          where: { id },
          data: {
            costoReal: (ticket.costoReal || 0) + body.costoAsociado
          }
        })
      }
    }

    return NextResponse.json(novedad, { status: 201 })
  } catch (error) {
    console.error('Error al crear novedad:', error)
    return NextResponse.json(
      { error: 'Error al crear novedad del ticket' },
      { status: 500 }
    )
  }
}
