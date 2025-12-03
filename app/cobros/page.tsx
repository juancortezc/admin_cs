/**
 * Página Cobros - Administración de Espacios
 * Diseño limpio Material Design 3
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MainNavbar from '@/app/components/MainNavbar'
import ModalRegistroCobro from '@/app/components/ModalRegistroCobro'

type Cobro = {
  id: string
  codigoInterno: string
  espacioId: string | null
  espacioAirbnbId: string | null
  concepto: string
  conceptoPersonalizado: string | null
  periodo: string | null
  montoPagado: number
  montoPactado: number
  diferencia: number
  fechaPago: string
  fechaVencimiento: string
  diasDiferencia: number | null
  metodoPago: string
  numeroComprobante: string | null
  estado: string
  observaciones: string | null
  esParcial: boolean
  espacio: {
    identificador: string
    arrendatario: {
      nombre: string
    } | null
  } | null
  espacioAirbnb: {
    nombre: string
  } | null
}

export default function CobrosPage() {
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'todos' | 'pendientes' | 'historial'>('todos')
  const [showModalNuevo, setShowModalNuevo] = useState(false)

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [mesSeleccionado, setMesSeleccionado] = useState('')

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  // Inicializar con el mes actual
  useEffect(() => {
    const now = new Date()
    const mesActual = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
    setMesSeleccionado(mesActual)
  }, [])

  // Cargar cobros
  const cargarCobros = () => {
    if (!mesSeleccionado) return

    setLoading(true)

    const params = new URLSearchParams()
    if (busqueda) params.append('busqueda', busqueda)

    // Filtrar por mes
    const [year, month] = mesSeleccionado.split('-')
    const fechaInicio = `${year}-${month}-01`
    const ultimoDia = new Date(parseInt(year), parseInt(month), 0).getDate()
    const fechaFin = `${year}-${month}-${ultimoDia}`

    params.append('fechaInicio', fechaInicio)
    params.append('fechaFin', fechaFin)

    fetch(`/api/cobros?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const cobrosOrdenados = data.cobros.sort((a: Cobro, b: Cobro) => {
          return new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime()
        })
        setCobros(cobrosOrdenados)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error:', error)
        setLoading(false)
      })
  }

  useEffect(() => {
    if (mesSeleccionado) {
      cargarCobros()
    }
  }, [mesSeleccionado])

  const handleFiltrar = () => {
    cargarCobros()
  }

  // Filtrar cobros por vista activa
  const cobrosFiltrados = cobros.filter((cobro) => {
    if (activeView === 'pendientes') {
      return cobro.estado === 'PENDIENTE' || cobro.estado === 'PARCIAL'
    }
    if (activeView === 'historial') {
      return cobro.estado === 'PAGADO' || cobro.estado === 'COBRADO'
    }
    return true
  })

  // Resumen stats
  const stats = {
    total: cobros.length,
    pendientes: cobros.filter(c => c.estado === 'PENDIENTE' || c.estado === 'PARCIAL').length,
    pagados: cobros.filter(c => c.estado === 'PAGADO' || c.estado === 'COBRADO').length,
    montoPendiente: cobros
      .filter(c => c.estado === 'PENDIENTE' || c.estado === 'PARCIAL')
      .reduce((sum, c) => sum + (c.montoPactado - c.montoPagado), 0),
    montoCobrado: cobros
      .filter(c => c.estado === 'PAGADO' || c.estado === 'COBRADO')
      .reduce((sum, c) => sum + c.montoPagado, 0),
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const getMesNombre = () => {
    if (!mesSeleccionado) return ''
    const [year, month] = mesSeleccionado.split('-')
    return `${meses[parseInt(month) - 1]} ${year}`
  }

  if (loading && cobros.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar activeSection="cobros" />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar activeSection="cobros" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header con título y filtros */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">Cobros</h1>
            <input
              type="month"
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowModalNuevo(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Cobro
          </button>
        </div>

        {/* Cards de resumen */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Cobrado */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Cobrado</p>
                <p className="text-xl font-bold text-emerald-600">{formatMoney(stats.montoCobrado)}</p>
              </div>
            </div>
          </div>

          {/* Por Cobrar */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Por Cobrar</p>
                <p className="text-xl font-bold text-amber-600">{formatMoney(stats.montoPendiente)}</p>
              </div>
            </div>
          </div>

          {/* Pagados */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Pagados</p>
                <p className="text-xl font-bold text-gray-900">{stats.pagados}</p>
              </div>
            </div>
          </div>

          {/* Pendientes */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Pendientes</p>
                <p className="text-xl font-bold text-gray-900">{stats.pendientes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de filtro */}
        <div className="flex items-center gap-2">
          {[
            { id: 'todos', label: 'Todos', count: stats.total },
            { id: 'pendientes', label: 'Pendientes', count: stats.pendientes },
            { id: 'historial', label: 'Pagados', count: stats.pagados },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as typeof activeView)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-70">({tab.count})</span>
            </button>
          ))}

          {/* Búsqueda */}
          <div className="relative ml-auto">
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFiltrar()}
              className="w-64 px-4 py-2 pl-10 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Lista de cobros */}
        {cobrosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">No hay cobros para mostrar en {getMesNombre()}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cobrosFiltrados.map((cobro) => (
              <Link
                key={cobro.id}
                href={`/cobros/${cobro.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all"
              >
                {/* Header con estado e identificador */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-8 rounded-full ${
                      cobro.estado === 'PAGADO' || cobro.estado === 'COBRADO'
                        ? 'bg-emerald-500'
                        : cobro.estado === 'PARCIAL'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`} />
                    <div>
                      <span className="font-semibold text-gray-900">
                        {cobro.espacio?.identificador || cobro.espacioAirbnb?.nombre || '-'}
                      </span>
                      <p className="text-xs text-gray-400">{cobro.codigoInterno}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    cobro.estado === 'PAGADO' || cobro.estado === 'COBRADO'
                      ? 'bg-emerald-100 text-emerald-700'
                      : cobro.estado === 'PARCIAL'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {cobro.estado}
                  </span>
                </div>

                {/* Info del arrendatario */}
                <p className="text-sm text-gray-600 mb-2">
                  {cobro.espacio?.arrendatario?.nombre || (cobro.espacioAirbnb ? 'Airbnb' : '-')}
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  {cobro.concepto} • {new Date(cobro.fechaPago).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })}
                </p>

                {/* Montos */}
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-lg font-bold text-gray-900">
                    {formatMoney(cobro.montoPactado)}
                  </p>
                  {cobro.estado === 'PARCIAL' && (
                    <p className="text-sm text-emerald-600">
                      Pagado: {formatMoney(cobro.montoPagado)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer info */}
        {cobrosFiltrados.length > 0 && (
          <p className="text-sm text-gray-500 text-center">
            Mostrando {cobrosFiltrados.length} de {cobros.length} cobros en {getMesNombre()}
          </p>
        )}
      </main>

      {/* Modal Nuevo Cobro */}
      <ModalRegistroCobro
        isOpen={showModalNuevo}
        onClose={() => setShowModalNuevo(false)}
        onSuccess={() => {
          setShowModalNuevo(false)
          cargarCobros()
        }}
      />
    </div>
  )
}
