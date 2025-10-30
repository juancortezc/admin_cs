/**
 * API de Cobros - Sistema completo de gestión de cobros
 * GET - Listar cobros con filtros avanzados
 * POST - Crear nuevo cobro
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Filtros disponibles
    const espacioId = searchParams.get('espacioId')
    const arrendatario = searchParams.get('arrendatario')
    const periodo = searchParams.get('periodo') // YYYY-MM
    const concepto = searchParams.get('concepto') // RENTA, AIRBNB, OTRO
    const metodoPago = searchParams.get('metodoPago')
    const estado = searchParams.get('estado') // PAGADO, PENDIENTE, PARCIAL
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    const busqueda = searchParams.get('busqueda') // Búsqueda general

    // Construir where clause
    const where: any = {}

    if (espacioId) {
      where.espacioId = espacioId
    }

    if (periodo) {
      where.periodo = periodo
    }

    if (concepto) {
      where.concepto = concepto
    }

    if (metodoPago) {
      where.metodoPago = metodoPago
    }

    if (estado) {
      where.estado = estado
    }

    if (fechaInicio && fechaFin) {
      where.fechaPago = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      }
    }

    // Filtro de búsqueda general (por código, arrendatario, comprobante, observaciones)
    if (busqueda) {
      where.OR = [
        { codigoInterno: { contains: busqueda, mode: 'insensitive' } },
        { numeroComprobante: { contains: busqueda, mode: 'insensitive' } },
        { observaciones: { contains: busqueda, mode: 'insensitive' } },
        {
          espacio: {
            arrendatario: {
              nombre: { contains: busqueda, mode: 'insensitive' },
            },
          },
        },
      ]
    }

    // Filtro de arrendatario por nombre
    if (arrendatario) {
      where.espacio = {
        arrendatario: {
          nombre: { contains: arrendatario, mode: 'insensitive' },
        },
      }
    }

    // Obtener cobros con relaciones
    const cobros = await prisma.cobro.findMany({
      where,
      include: {
        espacio: {
          include: {
            arrendatario: true,
          },
        },
        cobroRelacionado: true, // Para pagos parciales
        pagosParciales: true, // Para ver los abonos de un cobro
      },
      orderBy: {
        fechaPago: 'desc',
      },
    })

    // Calcular estadísticas
    const estadisticas = {
      totalCobros: cobros.length,
      totalCobrado: cobros.reduce((sum, c) => sum + c.montoPagado, 0),
      totalPorEstado: {
        PAGADO: cobros.filter((c) => c.estado === 'PAGADO').reduce((sum, c) => sum + c.montoPagado, 0),
        PENDIENTE: cobros.filter((c) => c.estado === 'PENDIENTE').reduce((sum, c) => sum + c.montoPagado, 0),
        PARCIAL: cobros.filter((c) => c.estado === 'PARCIAL').reduce((sum, c) => sum + c.montoPagado, 0),
      },
      totalPorMetodo: {
        TRANSFERENCIA: cobros
          .filter((c) => c.metodoPago === 'TRANSFERENCIA')
          .reduce((sum, c) => sum + c.montoPagado, 0),
        EFECTIVO: cobros.filter((c) => c.metodoPago === 'EFECTIVO').reduce((sum, c) => sum + c.montoPagado, 0),
        CHEQUE: cobros.filter((c) => c.metodoPago === 'CHEQUE').reduce((sum, c) => sum + c.montoPagado, 0),
      },
      totalPorConcepto: {
        RENTA: cobros.filter((c) => c.concepto === 'RENTA').reduce((sum, c) => sum + c.montoPagado, 0),
        AIRBNB: cobros.filter((c) => c.concepto === 'AIRBNB').reduce((sum, c) => sum + c.montoPagado, 0),
        OTRO: cobros.filter((c) => c.concepto === 'OTRO').reduce((sum, c) => sum + c.montoPagado, 0),
      },
    }

    return NextResponse.json({
      cobros,
      estadisticas,
    })
  } catch (error) {
    console.error('Error al obtener cobros:', error)
    return NextResponse.json({ error: 'Error al obtener cobros' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      espacioId,
      concepto,
      conceptoPersonalizado,
      periodo,
      montoPagado,
      montoPactado,
      fechaPago,
      fechaVencimiento,
      metodoPago,
      numeroComprobante,
      estado,
      observaciones,
      esParcial,
      cobroRelacionadoId,
    } = body

    // Validaciones
    if (!espacioId || !montoPagado || !montoPactado || !fechaPago || !fechaVencimiento || !metodoPago) {
      return NextResponse.json(
        {
          error: 'Campos requeridos: espacioId, montoPagado, montoPactado, fechaPago, fechaVencimiento, metodoPago',
        },
        { status: 400 }
      )
    }

    // Validar que el espacio existe
    const espacio = await prisma.espacio.findUnique({
      where: { id: espacioId },
    })

    if (!espacio) {
      return NextResponse.json({ error: 'Espacio no encontrado' }, { status: 404 })
    }

    // Calcular diferencia
    const diferencia = parseFloat(montoPagado) - parseFloat(montoPactado)

    // Calcular días de diferencia (solo si estado es PAGADO)
    let diasDiferencia = null
    if (estado === 'PAGADO') {
      const fechaPagoDate = new Date(fechaPago)
      const fechaVencimientoDate = new Date(fechaVencimiento)
      diasDiferencia = Math.floor(
        (fechaPagoDate.getTime() - fechaVencimientoDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    }

    // Generar código interno (P-0001, P-0002, etc.)
    const ultimoCobro = await prisma.cobro.findFirst({
      orderBy: { codigoInterno: 'desc' },
    })

    let nuevoCodigo = 'P-0001'
    if (ultimoCobro) {
      const ultimoNumero = parseInt(ultimoCobro.codigoInterno.split('-')[1])
      nuevoCodigo = `P-${String(ultimoNumero + 1).padStart(4, '0')}`
    }

    // Determinar estado automático si no se proporciona
    let estadoFinal = estado
    if (!estadoFinal) {
      if (diferencia === 0) {
        estadoFinal = 'PAGADO'
      } else if (diferencia < 0) {
        estadoFinal = 'PARCIAL'
      } else {
        estadoFinal = 'PAGADO' // Sobrepago se considera pagado
      }
    }

    // Crear cobro
    const cobro = await prisma.cobro.create({
      data: {
        codigoInterno: nuevoCodigo,
        espacioId,
        concepto: concepto || 'RENTA',
        conceptoPersonalizado,
        periodo,
        montoPagado: parseFloat(montoPagado),
        montoPactado: parseFloat(montoPactado),
        diferencia,
        fechaPago: new Date(fechaPago),
        fechaVencimiento: new Date(fechaVencimiento),
        diasDiferencia,
        metodoPago,
        numeroComprobante,
        estado: estadoFinal,
        observaciones,
        esParcial: esParcial || false,
        cobroRelacionadoId,
      },
      include: {
        espacio: {
          include: {
            arrendatario: true,
          },
        },
      },
    })

    return NextResponse.json(cobro, { status: 201 })
  } catch (error) {
    console.error('Error al crear cobro:', error)
    return NextResponse.json({ error: 'Error al crear cobro' }, { status: 500 })
  }
}
