/**
 * API de Exportación a Excel
 * GET - Exportar cobros a archivo Excel con filtros aplicados
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Aplicar los mismos filtros que en la API principal
    const espacioId = searchParams.get('espacioId')
    const arrendatario = searchParams.get('arrendatario')
    const periodo = searchParams.get('periodo')
    const concepto = searchParams.get('concepto')
    const metodoPago = searchParams.get('metodoPago')
    const estado = searchParams.get('estado')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    const busqueda = searchParams.get('busqueda')

    const where: any = {}

    if (espacioId) where.espacioId = espacioId
    if (periodo) where.periodo = periodo
    if (concepto) where.concepto = concepto
    if (metodoPago) where.metodoPago = metodoPago
    if (estado) where.estado = estado

    if (fechaInicio && fechaFin) {
      where.fechaPago = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      }
    }

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

    if (arrendatario) {
      where.espacio = {
        arrendatario: {
          nombre: { contains: arrendatario, mode: 'insensitive' },
        },
      }
    }

    // Obtener cobros
    const cobros = await prisma.cobro.findMany({
      where,
      include: {
        espacio: {
          include: {
            arrendatario: true,
          },
        },
      },
      orderBy: {
        fechaPago: 'desc',
      },
    })

    // Preparar datos para Excel (mismo formato que el PDF)
    const datosExcel = cobros.map((cobro) => ({
      'ID Pago': cobro.codigoInterno,
      'ID Espacio': cobro.espacio.identificador,
      'Arrendatario/Cliente': cobro.espacio.arrendatario?.nombre || 'Sin arrendatario',
      'Fecha Pago': new Date(cobro.fechaPago).toLocaleDateString('es-ES'),
      Periodo: cobro.periodo || '',
      Concepto: cobro.concepto === 'OTRO' ? cobro.conceptoPersonalizado || 'OTRO' : cobro.concepto,
      'Método de Pago': cobro.metodoPago,
      '# Comprobante': cobro.numeroComprobante || '',
      Monto: cobro.montoPagado,
      'Pago Pactado': cobro.montoPactado,
      Diferencia: cobro.diferencia,
      Observaciones: cobro.observaciones || '',
      Estado: cobro.estado,
      'Fecha Vencimiento': new Date(cobro.fechaVencimiento).toLocaleDateString('es-ES'),
      'Días Diferencia': cobro.diasDiferencia || '',
    }))

    // Crear workbook y worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(datosExcel)

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 10 }, // ID Pago
      { wch: 12 }, // ID Espacio
      { wch: 25 }, // Arrendatario
      { wch: 12 }, // Fecha Pago
      { wch: 10 }, // Periodo
      { wch: 15 }, // Concepto
      { wch: 15 }, // Método de Pago
      { wch: 15 }, // # Comprobante
      { wch: 12 }, // Monto
      { wch: 12 }, // Pago Pactado
      { wch: 12 }, // Diferencia
      { wch: 30 }, // Observaciones
      { wch: 10 }, // Estado
      { wch: 15 }, // Fecha Vencimiento
      { wch: 12 }, // Días Diferencia
    ]
    worksheet['!cols'] = columnWidths

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cobros')

    // Generar buffer del archivo Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Crear respuesta con el archivo
    const filename = `cobros_${new Date().toISOString().split('T')[0]}.xlsx`

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error al exportar a Excel:', error)
    return NextResponse.json({ error: 'Error al exportar a Excel' }, { status: 500 })
  }
}
