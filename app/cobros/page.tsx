/**
 * Página Cobros - Casa del Sol
 * Vista con tabs: Todos, Pendientes, Historial
 * Material Design 3 con nuevo PageLayout
 */

'use client'

import { useEffect, useState } from 'react'
import PageLayout from '@/app/components/PageLayout'
import { ClipboardListIcon } from '@/app/components/icons'
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

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'PAGADO':
      case 'COBRADO':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
      case 'PENDIENTE':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20'
      case 'PARCIAL':
        return 'bg-orange-500/10 text-orange-700 border-orange-500/20'
      default:
        return 'bg-gray-100 text-gray-700'
    }
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

  // Subtabs config
  const subtabs = [
    { id: 'todos', nombre: 'Todos' },
    { id: 'pendientes', nombre: 'Pendientes' },
    { id: 'historial', nombre: 'Historial' },
  ]

  // Resumen stats
  const stats = {
    total: cobros.length,
    pendientes: cobros.filter(c => c.estado === 'PENDIENTE' || c.estado === 'PARCIAL').length,
    pagados: cobros.filter(c => c.estado === 'PAGADO' || c.estado === 'COBRADO').length,
    montoPendiente: cobros
      .filter(c => c.estado === 'PENDIENTE' || c.estado === 'PARCIAL')
      .reduce((sum, c) => sum + (c.montoPactado - c.montoPagado), 0),
  }

  if (loading) {
    return (
      <PageLayout
        title="Cobros"
        subtitle="Gestión de cobros y cuentas por cobrar"
        icon={<ClipboardListIcon className="w-6 h-6 text-white" />}
        activeSection="cobros"
      >
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 font-medium">Cargando...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Cobros"
      subtitle="Gestión de cobros y cuentas por cobrar"
      icon={<ClipboardListIcon className="w-6 h-6 text-white" />}
      activeSection="cobros"
      subtabs={subtabs}
      activeSubtab={activeView}
      onSubtabChange={(tabId) => setActiveView(tabId as 'todos' | 'pendientes' | 'historial')}
      actions={
        <button
          onClick={() => setShowModalNuevo(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Cobro
        </button>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Cobros</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Pendientes</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pendientes}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Pagados</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.pagados}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Por Cobrar</p>
          <p className="text-2xl font-bold text-red-600 mt-1">${stats.montoPendiente.toLocaleString()}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Selector de Mes */}
          <input
            type="month"
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
          />

          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar por código, espacio, arrendatario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFiltrar()}
              className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white"
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

          {/* Botón Filtrar */}
          <button
            onClick={handleFiltrar}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-sm font-medium"
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Tabla de Cobros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold">Código</th>
                <th className="px-4 py-4 text-left text-sm font-semibold">Fecha</th>
                <th className="px-4 py-4 text-left text-sm font-semibold">Espacio</th>
                <th className="px-4 py-4 text-left text-sm font-semibold">Arrendatario</th>
                <th className="px-4 py-4 text-left text-sm font-semibold">Concepto</th>
                <th className="px-4 py-4 text-right text-sm font-semibold">Pactado</th>
                <th className="px-4 py-4 text-right text-sm font-semibold">Pagado</th>
                <th className="px-4 py-4 text-center text-sm font-semibold">Estado</th>
                <th className="px-4 py-4 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cobrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    No se encontraron cobros con estos filtros
                  </td>
                </tr>
              ) : (
                cobrosFiltrados.map((cobro) => (
                  <tr
                    key={cobro.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/cobros/${cobro.id}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-indigo-600">
                      {cobro.codigoInterno}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(cobro.fechaPago).toLocaleDateString('es-EC')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {cobro.espacio?.identificador || cobro.espacioAirbnb?.nombre || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {cobro.espacio?.arrendatario?.nombre || (cobro.espacioAirbnb ? 'Airbnb' : '-')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{cobro.concepto}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      ${cobro.montoPactado.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-emerald-600">
                      ${cobro.montoPagado.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getColorEstado(cobro.estado)}`}>
                        {cobro.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = `/cobros/${cobro.id}`
                        }}
                        className="p-2 rounded-lg hover:bg-indigo-50 transition-all"
                        title="Ver detalles"
                      >
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-semibold text-gray-900">{cobrosFiltrados.length}</span> de {cobros.length} cobros
          </p>
        </div>
      </div>

      {/* Modal Nuevo Cobro */}
      <ModalRegistroCobro
        isOpen={showModalNuevo}
        onClose={() => setShowModalNuevo(false)}
        onSuccess={() => {
          setShowModalNuevo(false)
          cargarCobros()
        }}
      />
    </PageLayout>
  )
}
