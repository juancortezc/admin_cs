/**
 * API de Eventos del Calendario
 * Obtiene todos los eventos próximos (arriendos, servicios, empleados, otros pagos)
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mes = searchParams.get('mes') // Formato: 2024-10
    const tipo = searchParams.get('tipo') // arriendos, servicios, empleados, otros

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    const [year, month] = mes
      ? mes.split('-').map(Number)
      : [currentYear, currentMonth]

    const eventos: any[] = []

    // Calcular arriendos pendientes (espacios con arrendatario y día de pago)
    if (!tipo || tipo === 'arriendos') {
      const espacios = await prisma.espacio.findMany({
        where: {
          arrendatarioId: { not: null },
          diaPago: { not: null },
        },
        include: {
          arrendatario: true,
          pagosArriendo: {
            where: {
              fechaPago: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
              },
            },
          },
        },
      })

      espacios.forEach((espacio) => {
        // Solo agregar si no hay pago registrado para este mes
        if (espacio.pagosArriendo.length === 0 && espacio.diaPago) {
          const fechaEvento = new Date(year, month - 1, espacio.diaPago)
          const hoy = new Date()
          hoy.setHours(0, 0, 0, 0)
          const vencido = fechaEvento < hoy

          eventos.push({
            id: `arriendo-${espacio.id}`,
            tipo: 'arriendo',
            titulo: `Arriendo ${espacio.identificador}`,
            descripcion: espacio.arrendatario?.nombre || '',
            monto: espacio.monto,
            fecha: fechaEvento.toISOString(),
            dia: espacio.diaPago,
            vencido,
            espacioId: espacio.id,
          })
        }
      })
    }

    // Servicios básicos
    if (!tipo || tipo === 'servicios') {
      const servicios = await prisma.servicioBasico.findMany({
        where: { activo: true },
        include: {
          pagos: {
            where: {
              fechaPago: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
              },
            },
          },
        },
      })

      servicios.forEach((servicio) => {
        // Solo agregar si no hay pago registrado para este mes
        if (servicio.pagos.length === 0) {
          const fechaEvento = new Date(year, month - 1, servicio.diaPago)
          const hoy = new Date()
          hoy.setHours(0, 0, 0, 0)
          const vencido = fechaEvento < hoy

          eventos.push({
            id: `servicio-${servicio.id}`,
            tipo: 'servicio',
            titulo: servicio.nombre,
            descripcion: servicio.proveedor || '',
            monto: servicio.tipoMonto === 'FIJO' ? servicio.montoFijo : null,
            fecha: fechaEvento.toISOString(),
            dia: servicio.diaPago,
            vencido,
            servicioId: servicio.id,
          })
        }
      })
    }

    // Empleados
    if (!tipo || tipo === 'empleados') {
      const empleados = await prisma.empleado.findMany({
        where: { activo: true },
        include: {
          pagos: {
            where: {
              periodo: `${year}-${month.toString().padStart(2, '0')}`,
            },
          },
        },
      })

      empleados.forEach((empleado) => {
        // Solo agregar si no hay pago registrado para este período
        if (empleado.pagos.length === 0) {
          const fechaEvento = new Date(year, month - 1, empleado.diaPago)
          const hoy = new Date()
          hoy.setHours(0, 0, 0, 0)
          const vencido = fechaEvento < hoy

          eventos.push({
            id: `empleado-${empleado.id}`,
            tipo: 'empleado',
            titulo: `Sueldo ${empleado.nombre}`,
            descripcion: empleado.cargo,
            monto: empleado.salario,
            fecha: fechaEvento.toISOString(),
            dia: empleado.diaPago,
            vencido,
            empleadoId: empleado.id,
          })
        }
      })
    }

    // Otros pagos
    if (!tipo || tipo === 'otros') {
      const otrosPagos = await prisma.otroPago.findMany({
        where: {
          fechaPago: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
        },
      })

      otrosPagos.forEach((pago) => {
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const vencido = new Date(pago.fechaPago) < hoy

        eventos.push({
          id: `otro-${pago.id}`,
          tipo: 'otro',
          titulo: pago.descripcion,
          descripcion: pago.categoria,
          monto: pago.monto,
          fecha: pago.fechaPago.toISOString(),
          dia: new Date(pago.fechaPago).getDate(),
          vencido,
          pagoId: pago.id,
        })
      })
    }

    // Ordenar por fecha
    eventos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

    return NextResponse.json(eventos)
  } catch (error) {
    console.error('Error al obtener eventos:', error)
    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 })
  }
}
