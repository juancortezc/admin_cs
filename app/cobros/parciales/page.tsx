/**
 * Página de Pagos Parciales - Casa del Sol
 * Análisis detallado de pagos parciales vinculados
 */

'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/app/components/Navbar'
import Link from 'next/link'

type PagoParcial = {
  espacioId: string
  espacioIdentificador: string
  arrendatarioNombre: string
  periodo: string
  montoPactado: number
  totalPagado: number
  saldoPendiente: number
  cantidadPagos: number
  pagos: {
    id: string
    codigoInterno: string
    montoPagado: number
    fechaPago: string
    metodoPago: string
    observaciones: string | null
  }[]
}

export default function ParcialesPage() {
  const [pagosParciales, setPagosParciales] = useState<PagoParcial[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarPagosParciales()
  }, [])

  const cargarPagosParciales = async () => {
    try {
      setCargando(true)
      const response = await fetch('/api/cobros/parciales')
      const data = await response.json()
      setPagosParciales(data)
    } catch (error) {
      console.error('Error al cargar pagos parciales:', error)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="Estado de cuenta" />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/cobros" className="hover:text-gray-700">
              Cobros
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Pagos Parciales</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Pagos Parciales</h1>
              <p className="mt-2 text-sm text-gray-600">
                Análisis de cobros con pagos parciales pendientes de completar
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <Link
              href="/cobros"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Todos los Cobros
            </Link>
            <Link
              href="/cobros/parciales"
              className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Pagos Parciales
            </Link>
            <Link
              href="/cobros/espacios"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Por Espacio
            </Link>
          </nav>
        </div>

        {/* Content */}
        {cargando ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Cargando pagos parciales...</p>
          </div>
        ) : pagosParciales.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay pagos parciales pendientes
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Todos los cobros están completamente pagados o pendientes.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500">Total con Pagos Parciales</div>
                <div className="mt-2 text-3xl font-semibold text-gray-900">
                  {pagosParciales.length}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500">Monto Total Pagado</div>
                <div className="mt-2 text-3xl font-semibold text-green-600">
                  ${pagosParciales.reduce((sum, p) => sum + p.totalPagado, 0).toFixed(2)}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500">Saldo Pendiente Total</div>
                <div className="mt-2 text-3xl font-semibold text-red-600">
                  ${pagosParciales.reduce((sum, p) => sum + p.saldoPendiente, 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Partial Payments List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">
                  Detalle de Pagos Parciales
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {pagosParciales.map((pago) => (
                  <div key={`${pago.espacioId}-${pago.periodo}`} className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/espacios/${pago.espacioId}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {pago.espacioIdentificador}
                          </Link>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Parcial
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {pago.arrendatarioNombre} • Período: {pago.periodo}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-500">Progreso de Pago</div>
                        <div className="text-2xl font-semibold text-gray-900">
                          {((pago.totalPagado / pago.montoPactado) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(pago.totalPagado / pago.montoPactado) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>Pagado: ${pago.totalPagado.toFixed(2)}</span>
                        <span>Falta: ${pago.saldoPendiente.toFixed(2)}</span>
                        <span>Total: ${pago.montoPactado.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Individual Payments */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Pagos Registrados ({pago.cantidadPagos})
                      </h4>
                      <div className="space-y-2">
                        {pago.pagos.map((p) => (
                          <Link
                            key={p.id}
                            href={`/cobros/${p.id}`}
                            className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-sm font-medium text-blue-600">
                                {p.codigoInterno}
                              </div>
                              <div className="text-sm text-gray-600">
                                {new Date(p.fechaPago).toLocaleDateString('es-EC')}
                              </div>
                              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {p.metodoPago}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {p.observaciones && (
                                <div className="text-xs text-gray-500 max-w-xs truncate">
                                  {p.observaciones}
                                </div>
                              )}
                              <div className="text-sm font-semibold text-gray-900">
                                ${p.montoPagado.toFixed(2)}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
