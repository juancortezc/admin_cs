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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar activeTab="Estado de cuenta" />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs con Material Design */}
        <div className="mb-6">
          <div className="inline-flex bg-white/60 backdrop-blur-sm rounded-xl p-1 gap-1 shadow-sm border border-gray-200">
            <Link
              href="/cobros"
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all"
            >
              Todos los Cobros
            </Link>
            <Link
              href="/cobros/parciales"
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md transition-all"
            >
              Pagos Parciales
            </Link>
            <Link
              href="/cobros/espacios"
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all"
            >
              Por Espacio
            </Link>
          </div>
        </div>

        {/* Content */}
        {cargando ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="mt-4 text-sm font-medium text-gray-600">Cargando pagos parciales...</p>
          </div>
        ) : pagosParciales.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
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
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No hay pagos parciales pendientes
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Todos los cobros están completamente pagados o pendientes.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards con Material Design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total con Pagos Parciales */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                  <p className="text-sm font-medium text-white/80">Total con Pagos Parciales</p>
                  <p className="text-3xl font-bold text-white mt-1">{pagosParciales.length}</p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500">Cobros en proceso de pago</p>
                </div>
              </div>

              {/* Monto Total Pagado */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
                  <p className="text-sm font-medium text-white/80">Monto Total Pagado</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    ${pagosParciales.reduce((sum, p) => sum + p.totalPagado, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500">Acumulado de pagos parciales</p>
                </div>
              </div>

              {/* Saldo Pendiente Total */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4">
                  <p className="text-sm font-medium text-white/80">Saldo Pendiente Total</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    ${pagosParciales.reduce((sum, p) => sum + p.saldoPendiente, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500">Por completar en estos cobros</p>
                </div>
              </div>
            </div>

            {/* Partial Payments List con Material Design */}
            <div className="space-y-4">
              {pagosParciales.map((pago) => {
                const porcentaje = (pago.totalPagado / pago.montoPactado) * 100

                return (
                  <div
                    key={`${pago.espacioId}-${pago.periodo}`}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                  >
                    {/* Header con gradiente */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            href={`/espacios/${pago.espacioId}`}
                            className="text-xl font-bold text-white hover:text-white/90 transition-colors"
                          >
                            {pago.espacioIdentificador}
                          </Link>
                          <p className="text-sm text-white/80 mt-1">
                            {pago.arrendatarioNombre} • {pago.periodo}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                            <span className="text-3xl font-bold text-white">{porcentaje.toFixed(0)}%</span>
                          </div>
                          <p className="text-xs text-white/70 mt-1">Completado</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Progress Bar Mejorada */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm font-medium mb-2">
                          <span className="text-gray-600">Progreso del Pago</span>
                          <span className="text-gray-900">${pago.totalPagado.toLocaleString()} / ${pago.montoPactado.toLocaleString()}</span>
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${porcentaje}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Pagado: ${pago.totalPagado.toLocaleString()}</span>
                          <span className="text-orange-600 font-medium">Falta: ${pago.saldoPendiente.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Individual Payments */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-900">
                            Pagos Registrados
                          </h4>
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-semibold">
                            {pago.cantidadPagos} {pago.cantidadPagos === 1 ? 'pago' : 'pagos'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {pago.pagos.map((p) => (
                            <Link
                              key={p.id}
                              href={`/cobros/${p.id}`}
                              className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl flex items-center justify-center group-hover:from-indigo-100 group-hover:to-blue-100 transition-colors">
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                                    {p.codigoInterno}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500">
                                      {new Date(p.fechaPago).toLocaleDateString('es-EC', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                      {p.metodoPago}
                                    </span>
                                  </div>
                                  {p.observaciones && (
                                    <div className="text-xs text-gray-400 mt-1 max-w-md truncate">
                                      {p.observaciones}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-900">
                                    ${p.montoPagado.toLocaleString()}
                                  </div>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
