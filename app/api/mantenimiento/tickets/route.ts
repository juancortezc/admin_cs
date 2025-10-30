import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los tickets con filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const busqueda = searchParams.get('busqueda') || ''
    const estado = searchParams.get('estado')
    const prioridad = searchParams.get('prioridad')
    const categoria = searchParams.get('categoria')
    const espacioId = searchParams.get('espacioId')

    const where: any = {}

    // Búsqueda por texto
    if (busqueda) {
      where.OR = [
        { numeroTicket: { contains: busqueda, mode: 'insensitive' } },
        { titulo: { contains: busqueda, mode: 'insensitive' } },
        { descripcion: { contains: busqueda, mode: 'insensitive' } },
      ]
    }

    // Filtros
    if (estado) where.estado = estado
    if (prioridad) where.prioridad = prioridad
    if (categoria) where.categoria = categoria
    if (espacioId) where.espacioId = espacioId

    const tickets = await prisma.ticketMantenimiento.findMany({
      where,
      include: {
        espacio: true,
        proveedor: true,
        _count: {
          select: { novedades: true }
        }
      },
      orderBy: [
        { estado: 'asc' }, // Pendientes primero
        { prioridad: 'desc' }, // Urgentes primero
        { fechaCreacion: 'desc' }
      ]
    })

    // Estadísticas
    const estadisticas = {
      total: tickets.length,
      pendientes: tickets.filter(t => t.estado === 'PENDIENTE').length,
      enProceso: tickets.filter(t => t.estado === 'EN_PROCESO').length,
      completados: tickets.filter(t => t.estado === 'COMPLETADO').length,
      costoTotal: tickets.reduce((sum, t) => sum + (t.costoReal || 0), 0),
      urgentes: tickets.filter(t => t.prioridad === 'URGENTE' && t.estado !== 'COMPLETADO').length,
    }

    return NextResponse.json({ tickets, estadisticas })
  } catch (error) {
    console.error('Error al obtener tickets:', error)
    return NextResponse.json(
      { error: 'Error al obtener tickets de mantenimiento' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo ticket
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Generar número de ticket automático
    const ultimoTicket = await prisma.ticketMantenimiento.findFirst({
      orderBy: { numeroTicket: 'desc' }
    })

    let nuevoNumero = 'TKT-0001'
    if (ultimoTicket) {
      const ultimoNum = parseInt(ultimoTicket.numeroTicket.split('-')[1])
      nuevoNumero = `TKT-${String(ultimoNum + 1).padStart(4, '0')}`
    }

    const ticket = await prisma.ticketMantenimiento.create({
      data: {
        numeroTicket: nuevoNumero,
        titulo: body.titulo,
        descripcion: body.descripcion,
        prioridad: body.prioridad || 'MEDIA',
        categoria: body.categoria || 'GENERAL',
        estado: body.estado || 'PENDIENTE',
        espacioId: body.espacioId || null,
        proveedorId: body.proveedorId || null,
        asignadoA: body.asignadoA || null,
        fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : null,
        fechaEstimada: body.fechaEstimada ? new Date(body.fechaEstimada) : null,
        costoEstimado: body.costoEstimado || 0,
        observaciones: body.observaciones || null,
      },
      include: {
        espacio: true,
        proveedor: true,
      }
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('Error al crear ticket:', error)
    return NextResponse.json(
      { error: 'Error al crear ticket de mantenimiento' },
      { status: 500 }
    )
  }
}
