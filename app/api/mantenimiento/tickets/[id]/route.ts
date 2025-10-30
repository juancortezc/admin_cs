import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = Promise<{ id: string }>

// GET - Obtener un ticket específico con todas sus novedades
export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params

    const ticket = await prisma.ticketMantenimiento.findUnique({
      where: { id },
      include: {
        espacio: true,
        proveedor: true,
        novedades: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error al obtener ticket:', error)
    return NextResponse.json(
      { error: 'Error al obtener ticket' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar ticket
export async function PUT(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Preparar datos para actualizar
    const updateData: any = {
      titulo: body.titulo,
      descripcion: body.descripcion,
      prioridad: body.prioridad,
      categoria: body.categoria,
      estado: body.estado,
      espacioId: body.espacioId || null,
      proveedorId: body.proveedorId || null,
      asignadoA: body.asignadoA || null,
      costoEstimado: body.costoEstimado,
      costoReal: body.costoReal,
      observaciones: body.observaciones || null,
    }

    // Manejar fechas
    if (body.fechaInicio) {
      updateData.fechaInicio = new Date(body.fechaInicio)
    }
    if (body.fechaEstimada) {
      updateData.fechaEstimada = new Date(body.fechaEstimada)
    }

    // Si se completa el ticket, registrar fecha
    if (body.estado === 'COMPLETADO' && !body.fechaCompletado) {
      updateData.fechaCompletado = new Date()
    }

    const ticket = await prisma.ticketMantenimiento.update({
      where: { id },
      data: updateData,
      include: {
        espacio: true,
        proveedor: true,
        novedades: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error al actualizar ticket:', error)
    return NextResponse.json(
      { error: 'Error al actualizar ticket' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar ticket
export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params

    await prisma.ticketMantenimiento.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Ticket eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar ticket:', error)
    return NextResponse.json(
      { error: 'Error al eliminar ticket' },
      { status: 500 }
    )
  }
}
