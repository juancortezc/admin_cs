'use client'

import { useState, useEffect } from 'react'
import MainNavbar from '@/app/components/MainNavbar'

type ReservaDetalle = {
  id: string
  codigoReserva: string
  espacio: string
  huesped: string
  pais: string | null
  checkIn: string
  checkOut: string
  noches: number
  nochesEnMes: number
  numHuespedes: number
  precioTotal: number
  ingresoProporcional: number
  estadoReserva: string
  estadoPago: string
}

type PagoDetalle = {
  id: string
  tipo: 'servicio' | 'salario'
  concepto: string
  categoria: string
  monto: number
  fechaPago: string
  metodoPago: string | null
  descripcion: string | null
}

type CobroDetalle = {
  id: string
  espacio: string
  arrendatario: string
  concepto: string
  periodo: string
  montoPactado: number
  montoPagado: number
  pendiente: number
  fechaVencimiento: string
  estado: string
  diasVencido: number
}

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
  reporteAirbnb: {
    totalEspacios: number
    diasEnMes: number
    nochesDisponibles: number
    nochesOcupadas: number
    porcentajeOcupacion: number
    totalReservas: number
    totalHuespedes: number
    ingresosMes: number
    reservas: ReservaDetalle[]
  }
  reportePagos: {
    totalPagos: number
    totalServicios: number
    totalSalarios: number
    cantidadPagos: number
    detalle: PagoDetalle[]
  }
  reporteCobrosPendientes: {
    totalPendiente: number
    cantidadPendientes: number
    detalle: CobroDetalle[]
  }
}

export default function ReportesPage() {
  const [loading, setLoading] = useState(true)
  const [resumen, setResumen] = useState<Resumen | null>(null)
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  })
  const [tabActivo, setTabActivo] = useState<'airbnb' | 'pagos' | 'cobros'>('airbnb')

  useEffect(() => {
    cargarResumen()
  }, [mesSeleccionado])

  const cargarResumen = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/resumen?mes=${mesSeleccionado}`)
      if (res.ok) {
        const data = await res.json()
        setResumen(data)
      }
    } catch (error) {
      console.error('Error:', error)
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

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar activeSection="reportes" />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-500 mt-1">Resumen financiero y métricas de operación</p>
        </div>

        {/* Selector de Mes */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-3 inline-flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Período:</label>
            <input
              type="month"
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {getMesNombre(mesSeleccionado)}
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="text-gray-500 mt-4">Cargando reportes...</p>
          </div>
        ) : resumen ? (
          <>
            {/* KPIs Principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cobrado</p>
                    <p className="text-lg font-bold text-emerald-600">{formatMoney(resumen.cobros.montoCobrado)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Por Cobrar</p>
                    <p className="text-lg font-bold text-amber-600">{formatMoney(resumen.cobros.montoPendiente)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pagado</p>
                    <p className="text-lg font-bold text-red-600">{formatMoney(resumen.pagos.montoPagado)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className={`text-lg font-bold ${
                      (resumen.cobros.montoCobrado - resumen.pagos.montoPagado) >= 0
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}>
                      {formatMoney(resumen.cobros.montoCobrado - resumen.pagos.montoPagado)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs de Reportes */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Tab Headers */}
              <div className="border-b border-gray-200 flex">
                <button
                  onClick={() => setTabActivo('airbnb')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    tabActivo === 'airbnb'
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Airbnb
                  </div>
                </button>
                <button
                  onClick={() => setTabActivo('pagos')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    tabActivo === 'pagos'
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Pagos Realizados
                  </div>
                </button>
                <button
                  onClick={() => setTabActivo('cobros')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    tabActivo === 'cobros'
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Cobros Pendientes
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Reporte Airbnb */}
                {tabActivo === 'airbnb' && resumen.reporteAirbnb && (
                  <div className="space-y-6">
                    {/* KPIs Airbnb */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-pink-50 rounded-xl p-4">
                        <p className="text-xs text-pink-600 font-medium">Huéspedes</p>
                        <p className="text-2xl font-bold text-pink-700">{resumen.reporteAirbnb.totalHuespedes}</p>
                        <p className="text-xs text-pink-500">{resumen.reporteAirbnb.totalReservas} reservas</p>
                      </div>
                      <div className="bg-indigo-50 rounded-xl p-4">
                        <p className="text-xs text-indigo-600 font-medium">Ocupación</p>
                        <p className="text-2xl font-bold text-indigo-700">{resumen.reporteAirbnb.porcentajeOcupacion}%</p>
                        <p className="text-xs text-indigo-500">{resumen.reporteAirbnb.nochesOcupadas} de {resumen.reporteAirbnb.nochesDisponibles} noches</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-4">
                        <p className="text-xs text-emerald-600 font-medium">Ingresos</p>
                        <p className="text-2xl font-bold text-emerald-700">{formatMoney(resumen.reporteAirbnb.ingresosMes)}</p>
                        <p className="text-xs text-emerald-500">del mes</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-600 font-medium">Espacios</p>
                        <p className="text-2xl font-bold text-gray-700">{resumen.reporteAirbnb.totalEspacios}</p>
                        <p className="text-xs text-gray-500">{resumen.reporteAirbnb.diasEnMes} días en el mes</p>
                      </div>
                    </div>

                    {/* Barra de ocupación */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Tasa de Ocupación</span>
                        <span className="text-sm font-bold text-indigo-600">{resumen.reporteAirbnb.porcentajeOcupacion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, resumen.reporteAirbnb.porcentajeOcupacion)}%` }}
                        />
                      </div>
                    </div>

                    {/* Lista de reservas */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Detalle de Reservas</h3>
                      {resumen.reporteAirbnb.reservas.length > 0 ? (
                        <div className="space-y-2">
                          {resumen.reporteAirbnb.reservas.map(r => (
                            <div key={r.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 font-bold text-sm">
                                  {r.numHuespedes}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{r.huesped}</p>
                                  <p className="text-xs text-gray-500">{r.espacio} · {r.pais || 'Sin país'}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{formatDate(r.checkIn)} - {formatDate(r.checkOut)}</p>
                                <p className="text-xs text-gray-500">{r.nochesEnMes} noches · {formatMoney(r.ingresoProporcional)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No hay reservas en este mes
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reporte Pagos */}
                {tabActivo === 'pagos' && resumen.reportePagos && (
                  <div className="space-y-6">
                    {/* KPIs Pagos */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-xs text-red-600 font-medium">Total Pagado</p>
                        <p className="text-2xl font-bold text-red-700">{formatMoney(resumen.reportePagos.totalPagos)}</p>
                        <p className="text-xs text-red-500">{resumen.reportePagos.cantidadPagos} pagos</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-xs text-blue-600 font-medium">Servicios</p>
                        <p className="text-2xl font-bold text-blue-700">{formatMoney(resumen.reportePagos.totalServicios)}</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4">
                        <p className="text-xs text-purple-600 font-medium">Salarios</p>
                        <p className="text-2xl font-bold text-purple-700">{formatMoney(resumen.reportePagos.totalSalarios)}</p>
                      </div>
                    </div>

                    {/* Lista de pagos */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Detalle de Pagos</h3>
                      {resumen.reportePagos.detalle.length > 0 ? (
                        <div className="space-y-2">
                          {resumen.reportePagos.detalle.map(p => (
                            <div key={p.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  p.tipo === 'salario' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                  {p.tipo === 'salario' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{p.concepto}</p>
                                  <p className="text-xs text-gray-500">{p.descripcion || p.categoria}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-red-600">{formatMoney(p.monto)}</p>
                                <p className="text-xs text-gray-500">{formatDate(p.fechaPago)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No hay pagos registrados en este mes
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reporte Cobros Pendientes */}
                {tabActivo === 'cobros' && resumen.reporteCobrosPendientes && (
                  <div className="space-y-6">
                    {/* KPI Cobros */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-amber-50 rounded-xl p-4">
                        <p className="text-xs text-amber-600 font-medium">Total Pendiente</p>
                        <p className="text-2xl font-bold text-amber-700">{formatMoney(resumen.reporteCobrosPendientes.totalPendiente)}</p>
                        <p className="text-xs text-amber-500">{resumen.reporteCobrosPendientes.cantidadPendientes} cobros</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-600 font-medium">Cobros del Período</p>
                        <p className="text-2xl font-bold text-gray-700">{resumen.cobros.total}</p>
                        <p className="text-xs text-gray-500">{resumen.cobros.cobrados} cobrados</p>
                      </div>
                    </div>

                    {/* Lista de cobros pendientes */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Cobros Pendientes</h3>
                      {resumen.reporteCobrosPendientes.detalle.length > 0 ? (
                        <div className="space-y-2">
                          {resumen.reporteCobrosPendientes.detalle.map(c => (
                            <div key={c.id} className={`rounded-lg p-4 flex items-center justify-between ${
                              c.diasVencido > 0 ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                            }`}>
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                                  c.diasVencido > 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                  {c.espacio.substring(0, 2)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{c.arrendatario}</p>
                                  <p className="text-xs text-gray-500">{c.espacio} · {c.concepto}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-amber-600">{formatMoney(c.pendiente)}</p>
                                <p className="text-xs text-gray-500">
                                  Vence: {formatDate(c.fechaVencimiento)}
                                  {c.diasVencido > 0 && (
                                    <span className="text-red-600 font-medium"> ({c.diasVencido}d vencido)</span>
                                  )}
                                </p>
                                {c.montoPagado > 0 && (
                                  <p className="text-xs text-emerald-600">Abonado: {formatMoney(c.montoPagado)}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-emerald-600">
                          <svg className="w-12 h-12 mx-auto mb-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          No hay cobros pendientes en este mes
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No se pudieron cargar los reportes</p>
          </div>
        )}
      </main>
    </div>
  )
}
