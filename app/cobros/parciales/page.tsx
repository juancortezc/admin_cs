/**
 * Página de Pagos Parciales - Casa del Sol
 * Análisis detallado de pagos parciales vinculados
 */

'use client'

import { useEffect, useState } from 'react'
import MainNavbar from '@/app/components/MainNavbar'
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
      <MainNavbar activeSection="cobros" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Pagos Parciales</h1>

          {/* Tabs de navegación */}
          <div className="flex items-center gap-2">
            <Link
              href="/cobros"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Todos
            </Link>
            <Link
              href="/cobros/espacios"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Por Espacio
            </Link>
            <button
              className="px-4 py-2 text-sm font-medium bg-indigo-100 text-indigo-700 rounded-lg"
            >
              Parciales
            </button>
          </div>
        </div>

        {/* Content */}
        {cargando ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pagosParciales.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900">No hay pagos parciales pendientes</h3>
            <p className="mt-1 text-sm text-gray-500">Todos los cobros están pagados o pendientes.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Pagos Parciales</p>
                    <p className="text-xl font-bold text-gray-900">{pagosParciales.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Total Pagado</p>
                    <p className="text-xl font-bold text-emerald-600">
                      ${pagosParciales.reduce((sum, p) => sum + p.totalPagado, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Saldo Pendiente</p>
                    <p className="text-xl font-bold text-amber-600">
                      ${pagosParciales.reduce((sum, p) => sum + p.saldoPendiente, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Pagos Parciales */}
            <div className="space-y-4">
              {pagosParciales.map((pago) => {
                const porcentaje = (pago.totalPagado / pago.montoPactado) * 100

                return (
                  <div
                    key={`${pago.espacioId}-${pago.periodo}`}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-4 py-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/espacios/${pago.espacioId}`}
                            className="text-base font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                          >
                            {pago.espacioIdentificador}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {pago.arrendatarioNombre} • {pago.periodo}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{porcentaje.toFixed(0)}%</p>
                          <p className="text-xs text-gray-500">completado</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>${pago.totalPagado.toLocaleString()} pagado</span>
                          <span className="text-amber-600 font-medium">Falta: ${pago.saldoPendiente.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Lista de pagos */}
                    <div className="divide-y divide-gray-50">
                      {pago.pagos.map((p) => (
                        <Link
                          key={p.id}
                          href={`/cobros/${p.id}`}
                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{p.codigoInterno}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(p.fechaPago).toLocaleDateString('es-EC')} • {p.metodoPago}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            ${p.montoPagado.toLocaleString()}
                          </p>
                        </Link>
                      ))}
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
