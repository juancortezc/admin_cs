/**
 * API para obtener todos los pagos/cobros del sistema
 * GET /api/pagos - Obtiene todos los pagos unificados
 */

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') // 'arriendo', 'servicio', 'salario', 'otro', 'todos'
    const formaPago = searchParams.get('formaPago') // 'TRANSFERENCIA', 'EFECTIVO', 'CHEQUE'
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    // Obtener cobros de arriendos
    const cobrosArriendos = await prisma.cobroArriendo.findMany({
      where: {
        ...(formaPago && { formaPago: formaPago as any }),
        ...(fechaInicio && fechaFin && {
          fechaCobro: {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin),
          },
        }),
      },
      include: {
        espacio: {
          include: {
            arrendatario: true,
          },
        },
      },
      orderBy: {
        fechaCobro: 'desc',
      },
    })

    // Obtener pagos de servicios
    const pagosServicios = await prisma.pagoServicio.findMany({
      where: {
        ...(formaPago && { formaPago: formaPago as any }),
        ...(fechaInicio && fechaFin && {
          fechaPago: {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin),
          },
        }),
      },
      include: {
        servicioBasico: true,
      },
      orderBy: {
        fechaPago: 'desc',
      },
    })

    // Obtener pagos de salarios
    const pagosSalarios = await prisma.pagoSalario.findMany({
      where: {
        ...(formaPago && { formaPago: formaPago as any }),
        ...(fechaInicio && fechaFin && {
          fechaPago: {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin),
          },
        }),
      },
      include: {
        empleado: true,
      },
      orderBy: {
        fechaPago: 'desc',
      },
    })

    // Obtener otros pagos
    const otrosPagos = await prisma.otroPago.findMany({
      where: {
        ...(formaPago && { formaPago: formaPago as any }),
        ...(fechaInicio && fechaFin && {
          fechaPago: {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin),
          },
        }),
      },
      orderBy: {
        fechaPago: 'desc',
      },
    })

    // Normalizar todos los pagos a un formato unificado
    const pagosUnificados = []

    // Arriendos (ingresos)
    if (!tipo || tipo === 'todos' || tipo === 'arriendo') {
      cobrosArriendos.forEach((cobro) => {
        pagosUnificados.push({
          id: cobro.id,
          tipo: 'arriendo',
          tipoLabel: 'Arriendo',
          esIngreso: true,
          titulo: `Arriendo ${cobro.espacio.identificador}`,
          descripcion: cobro.espacio.arrendatario?.nombre || '',
          monto: cobro.monto,
          fecha: cobro.fechaCobro,
          formaPago: cobro.formaPago,
          referencia: cobro.referencia,
          observaciones: cobro.observaciones,
          diasRetraso: cobro.diasRetraso,
          createdAt: cobro.createdAt,
        })
      })
    }

    // Servicios (egresos)
    if (!tipo || tipo === 'todos' || tipo === 'servicio') {
      pagosServicios.forEach((pago) => {
        pagosUnificados.push({
          id: pago.id,
          tipo: 'servicio',
          tipoLabel: 'Servicio',
          esIngreso: false,
          titulo: pago.servicioBasico.nombre,
          descripcion: pago.servicioBasico.proveedor || '',
          monto: pago.monto,
          fecha: pago.fechaPago,
          formaPago: pago.formaPago,
          referencia: pago.referencia,
          observaciones: pago.observaciones,
          createdAt: pago.createdAt,
        })
      })
    }

    // Salarios (egresos)
    if (!tipo || tipo === 'todos' || tipo === 'salario') {
      pagosSalarios.forEach((pago) => {
        pagosUnificados.push({
          id: pago.id,
          tipo: 'salario',
          tipoLabel: 'Salario',
          esIngreso: false,
          titulo: `Sueldo ${pago.empleado.nombre}`,
          descripcion: pago.empleado.cargo,
          monto: pago.total,
          fecha: pago.fechaPago,
          formaPago: pago.formaPago,
          referencia: pago.referencia,
          observaciones: pago.observaciones,
          periodo: pago.periodo,
          createdAt: pago.createdAt,
        })
      })
    }

    // Otros pagos (egresos)
    if (!tipo || tipo === 'todos' || tipo === 'otro') {
      otrosPagos.forEach((pago) => {
        pagosUnificados.push({
          id: pago.id,
          tipo: 'otro',
          tipoLabel: 'Otro',
          esIngreso: false,
          titulo: pago.descripcion,
          descripcion: pago.categoria || '',
          monto: pago.monto,
          fecha: pago.fechaPago,
          formaPago: pago.formaPago,
          referencia: pago.referencia,
          observaciones: pago.observaciones,
          createdAt: pago.createdAt,
        })
      })
    }

    // Ordenar por fecha descendente
    pagosUnificados.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )

    // Calcular estadísticas
    const totalIngresos = pagosUnificados
      .filter((p) => p.esIngreso)
      .reduce((sum, p) => sum + p.monto, 0)

    const totalEgresos = pagosUnificados
      .filter((p) => !p.esIngreso)
      .reduce((sum, p) => sum + p.monto, 0)

    const balance = totalIngresos - totalEgresos

    return NextResponse.json({
      pagos: pagosUnificados,
      estadisticas: {
        total: pagosUnificados.length,
        ingresos: totalIngresos,
        egresos: totalEgresos,
        balance,
      },
    })
  } catch (error) {
    console.error('Error al obtener pagos:', error)
    return NextResponse.json(
      { error: 'Error al obtener pagos' },
      { status: 500 }
    )
  }
}
