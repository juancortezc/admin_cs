'use client'

import { useState, useEffect } from 'react'
import MainNavbar from '@/app/components/MainNavbar'

type Resumen = {
  cobros: {
    total: number
    pendientes: number
    cobrados: number
    montoPendiente: number
    montoCobrado: number
  }
  pagos: {
    total: number
    pendientes: number
    pagados: number
    montoPendiente: number
    montoPagado: number
  }
  espacios: {
    total: number
    ocupados: number
    disponibles: number
    tasaOcupacion: number
  }
  airbnb: {
    reservasActivas: number
    ingresosMes: number
  }
}

export default function ReportesPage() {
  const [loading, setLoading] = useState(true)
  const [resumen, setResumen] = useState<Resumen | null>(null)
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    cargarResumen()
  }, [mesSeleccionado])

  const cargarResumen = async () => {
    setLoading(true)
    try {
      // Por ahora, datos placeholder hasta tener API
      const res = await fetch(`/api/reportes/resumen?mes=${mesSeleccionado}`)
      if (res.ok) {
        const data = await res.json()
        setResumen(data)
      } else {
        // Placeholder data
        setResumen({
          cobros: { total: 0, pendientes: 0, cobrados: 0, montoPendiente: 0, montoCobrado: 0 },
          pagos: { total: 0, pendientes: 0, pagados: 0, montoPendiente: 0, montoPagado: 0 },
          espacios: { total: 0, ocupados: 0, disponibles: 0, tasaOcupacion: 0 },
          airbnb: { reservasActivas: 0, ingresosMes: 0 }
        })
      }
    } catch {
      setResumen({
        cobros: { total: 0, pendientes: 0, cobrados: 0, montoPendiente: 0, montoCobrado: 0 },
        pagos: { total: 0, pendientes: 0, pagados: 0, montoPendiente: 0, montoPagado: 0 },
        espacios: { total: 0, ocupados: 0, disponibles: 0, tasaOcupacion: 0 },
        airbnb: { reservasActivas: 0, ingresosMes: 0 }
      })
    } finally {
      setLoading(false)
    }
  }

  const getMesNombre = (mes: string) => {
    const [year, month] = mes.split('-')
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${meses[parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar activeSection="reportes" />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reportes</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Resumen financiero y métricas de operación
              </p>
            </div>
          </div>
        </div>

        {/* Selector de Mes */}
        <div className="mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 inline-flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Período:</label>
            <input
              type="month"
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span className="text-lg font-semibold text-gray-900">
              {getMesNombre(mesSeleccionado)}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="text-gray-500 mt-4">Cargando reportes...</p>
          </div>
        ) : (
          <>
            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Ingresos (Cobros) */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cobrado</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${resumen?.cobros.montoCobrado.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {resumen?.cobros.cobrados || 0} de {resumen?.cobros.total || 0} cobros
                </div>
              </div>

              {/* Pendiente por Cobrar */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Por Cobrar</p>
                    <p className="text-2xl font-bold text-amber-600">
                      ${resumen?.cobros.montoPendiente.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {resumen?.cobros.pendientes || 0} cobros pendientes
                </div>
              </div>

              {/* Egresos (Pagos) */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pagado</p>
                    <p className="text-2xl font-bold text-red-600">
                      ${resumen?.pagos.montoPagado.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {resumen?.pagos.pagados || 0} de {resumen?.pagos.total || 0} pagos
                </div>
              </div>

              {/* Balance */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Balance</p>
                    <p className={`text-2xl font-bold ${
                      ((resumen?.cobros.montoCobrado || 0) - (resumen?.pagos.montoPagado || 0)) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      ${((resumen?.cobros.montoCobrado || 0) - (resumen?.pagos.montoPagado || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Ingresos - Egresos
                </div>
              </div>
            </div>

            {/* Secciones de detalle */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ocupación de Espacios */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Ocupación de Espacios
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total de espacios</span>
                    <span className="font-bold text-gray-900">{resumen?.espacios.total || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ocupados</span>
                    <span className="font-bold text-green-600">{resumen?.espacios.ocupados || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Disponibles</span>
                    <span className="font-bold text-amber-600">{resumen?.espacios.disponibles || 0}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Tasa de Ocupación</span>
                      <span className="font-bold text-indigo-600">{resumen?.espacios.tasaOcupacion.toFixed(0) || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${resumen?.espacios.tasaOcupacion || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Airbnb */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Airbnb
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Reservas activas</span>
                    <span className="font-bold text-gray-900">{resumen?.airbnb.reservasActivas || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ingresos del mes</span>
                    <span className="font-bold text-green-600">${resumen?.airbnb.ingresosMes.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje de próximamente */}
            <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
              <svg className="w-12 h-12 text-indigo-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-lg font-bold text-indigo-900 mb-2">Más reportes próximamente</h3>
              <p className="text-sm text-indigo-700">
                Estamos trabajando en reportes detallados con gráficos, exportación a Excel/PDF y análisis de tendencias.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
