/**
 * Página de Administración de Pagos
 * Vista unificada de todos los pagos y cobros del sistema
 */

'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/app/components/Navbar'

type Pago = {
  id: string
  tipo: 'arriendo' | 'servicio' | 'salario' | 'otro'
  tipoLabel: string
  esIngreso: boolean
  titulo: string
  descripcion: string
  monto: number
  fecha: string
  formaPago: 'TRANSFERENCIA' | 'EFECTIVO' | 'CHEQUE' | null
  referencia: string | null
  observaciones: string | null
  diasRetraso?: number
  periodo?: string
  createdAt: string
}

type Estadisticas = {
  total: number
  ingresos: number
  egresos: number
  balance: number
}

type Abono = {
  id: string
  codigoInterno: string
  montoPagado: number
  fechaPago: string
  metodoPago: string | null
  observaciones: string | null
}

type CuentaParcial = {
  id: string
  codigoInterno: string
  espacioIdentificador: string
  arrendatarioNombre: string
  concepto: string
  periodo: string
  montoPactado: number
  totalAbonado: number
  saldoPendiente: number
  porcentajePagado: number
  fechaVencimiento: string
  cantidadAbonos: number
  abonos: Abono[]
}

type EstadisticasParciales = {
  totalCuentas: number
  totalPorCobrar: number
  totalAbonado: number
  totalPendiente: number
}

type PagoRecurrente = {
  id: string
  codigoInterno: string
  nombre: string
  proveedor: string
  ruc: string | null
  cuentaDestino: string | null
  categoria: string
  descripcion: string
  montoFijo: number | null
  esMontoVariable: boolean
  metodoPago: string
  frecuencia: string
  diaPago: number | null
  fechaInicio: string
  fechaFin: string | null
  activo: boolean
  observaciones: string | null
  createdAt: string
  _count?: {
    pagosGenerados: number
  }
}

export default function PagosPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'all' | 'partial' | 'recurring'>('all')

  const [pagos, setPagos] = useState<Pago[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total: 0,
    ingresos: 0,
    egresos: 0,
    balance: 0,
  })
  const [loading, setLoading] = useState(true)

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroFormaPago, setFiltroFormaPago] = useState<string>('todas')
  const [busqueda, setBusqueda] = useState<string>('')

  // Partial payments state
  const [cuentasParciales, setCuentasParciales] = useState<CuentaParcial[]>([])
  const [estadisticasParciales, setEstadisticasParciales] = useState<EstadisticasParciales>({
    totalCuentas: 0,
    totalPorCobrar: 0,
    totalAbonado: 0,
    totalPendiente: 0,
  })
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaParcial | null>(null)
  const [showAbonoModal, setShowAbonoModal] = useState(false)
  const [showCreateParcialModal, setShowCreateParcialModal] = useState(false)

  // Recurring payments state
  const [pagosRecurrentes, setPagosRecurrentes] = useState<PagoRecurrente[]>([])
  const [filtroEstado, setFiltroEstado] = useState<string>('true') // 'true', 'false', 'todos'
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [selectedRecurring, setSelectedRecurring] = useState<PagoRecurrente | null>(null)

  // Espacios for dropdowns
  const [espacios, setEspacios] = useState<{ id: string; identificador: string }[]>([])

  // Load espacios
  useEffect(() => {
    fetch('/api/espacios')
      .then((res) => res.json())
      .then((data) => setEspacios(data))
      .catch((error) => console.error('Error al cargar espacios:', error))
  }, [])

  // Cargar pagos
  const cargarPagos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroTipo !== 'todos') params.append('tipo', filtroTipo)
      if (filtroFormaPago !== 'todas') params.append('formaPago', filtroFormaPago)

      const res = await fetch(`/api/pagos?${params.toString()}`)
      const data = await res.json()

      setPagos(data.pagos || [])
      setEstadisticas(data.estadisticas || { total: 0, ingresos: 0, egresos: 0, balance: 0 })
    } catch (error) {
      console.error('Error al cargar pagos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPagos()
  }, [filtroTipo, filtroFormaPago])

  // Cargar pagos parciales
  const cargarPagosParciales = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cobros/parciales-pendientes')
      const data = await res.json()

      setCuentasParciales(data.cuentas || [])
      setEstadisticasParciales(data.estadisticas || {
        totalCuentas: 0,
        totalPorCobrar: 0,
        totalAbonado: 0,
        totalPendiente: 0,
      })
    } catch (error) {
      console.error('Error al cargar pagos parciales:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar pagos recurrentes
  const cargarPagosRecurrentes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroEstado !== 'todos') params.append('activo', filtroEstado)
      if (filtroCategoria !== 'todos') params.append('categoria', filtroCategoria)

      const res = await fetch(`/api/pagos-recurrentes?${params.toString()}`)
      const data = await res.json()

      setPagosRecurrentes(data || [])
    } catch (error) {
      console.error('Error al cargar pagos recurrentes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'partial') {
      cargarPagosParciales()
    } else if (activeTab === 'all') {
      cargarPagos()
    } else if (activeTab === 'recurring') {
      cargarPagosRecurrentes()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'recurring') {
      cargarPagosRecurrentes()
    }
  }, [filtroEstado, filtroCategoria])

  // Filtrar por búsqueda
  const pagosFiltrados = pagos.filter((pago) => {
    if (!busqueda) return true
    const search = busqueda.toLowerCase()
    return (
      pago.titulo.toLowerCase().includes(search) ||
      pago.descripcion.toLowerCase().includes(search) ||
      pago.observaciones?.toLowerCase().includes(search)
    )
  })

  // Colores por tipo
  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'arriendo':
        return 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20'
      case 'servicio':
        return 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20'
      case 'salario':
        return 'bg-[#AF52DE]/10 text-[#AF52DE] border-[#AF52DE]/20'
      case 'otro':
        return 'bg-zinc-100 text-zinc-700 border-zinc-200'
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200'
    }
  }

  // Color por forma de pago
  const getIconoFormaPago = (formaPago: string | null) => {
    if (!formaPago) return null

    switch (formaPago) {
      case 'TRANSFERENCIA':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )
      case 'EFECTIVO':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      case 'CHEQUE':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      default:
        return null
    }
  }

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#007AFF]/30 border-t-[#007AFF] mx-auto"></div>
          <p className="mt-3 text-sm text-zinc-600">Cargando pagos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Navbar activeTab="Estado de cuenta" />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header con título - Material Design */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Administración - Estado de Cuenta</h1>
          <p className="text-sm text-gray-600 mt-1">
            {activeTab === 'all' && `${pagosFiltrados.length} registros encontrados`}
            {activeTab === 'partial' && 'Pagos con abonos pendientes'}
            {activeTab === 'recurring' && 'Gestión de pagos recurrentes'}
          </p>
        </div>

        {/* Tab Navigation - Material Design con pills */}
        <div className="mb-6">
          <div className="inline-flex bg-white/60 backdrop-blur-sm rounded-xl p-1 gap-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-white/80'
              }`}
            >
              Estado de cuenta
            </button>
            <button
              onClick={() => setActiveTab('partial')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'partial'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-white/80'
              }`}
            >
              Pagos eventuales
            </button>
            <button
              onClick={() => setActiveTab('recurring')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'recurring'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-white/80'
              }`}
            >
              Pagos recurrentes
            </button>
          </div>
        </div>

        {/* Tab Content: Todos los Pagos */}
        {activeTab === 'all' && (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-zinc-200 p-3">
            <p className="text-xs text-zinc-600 mb-1">Total Registros</p>
            <p className="text-lg font-bold text-zinc-900">{estadisticas.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-3">
            <p className="text-xs text-[#34C759] mb-1">Ingresos</p>
            <p className="text-lg font-bold text-[#34C759]">
              ${estadisticas.ingresos.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-3">
            <p className="text-xs text-[#FF3B30] mb-1">Egresos</p>
            <p className="text-lg font-bold text-[#FF3B30]">
              ${estadisticas.egresos.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-3">
            <p className="text-xs text-zinc-600 mb-1">Balance</p>
            <p
              className={`text-lg font-bold ${
                estadisticas.balance >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'
              }`}
            >
              ${estadisticas.balance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Buscador */}
        <div className="mb-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar por título, descripción u observaciones..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-4 space-y-3">
          {/* Filtro por tipo */}
          <div>
            <p className="text-xs text-zinc-600 mb-2 font-medium">Tipo de Transacción</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'todos', label: 'Todos' },
                { value: 'arriendo', label: 'Arriendos' },
                { value: 'servicio', label: 'Servicios' },
                { value: 'salario', label: 'Salarios' },
                { value: 'otro', label: 'Otros' },
              ].map((tipo) => (
                <button
                  key={tipo.value}
                  onClick={() => setFiltroTipo(tipo.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filtroTipo === tipo.value
                      ? 'bg-[#007AFF] text-white shadow-sm'
                      : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200'
                  }`}
                >
                  {tipo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por forma de pago */}
          <div>
            <p className="text-xs text-zinc-600 mb-2 font-medium">Forma de Pago</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'todas', label: 'Todas' },
                { value: 'TRANSFERENCIA', label: 'Transferencia' },
                { value: 'EFECTIVO', label: 'Efectivo' },
                { value: 'CHEQUE', label: 'Cheque' },
              ].map((forma) => (
                <button
                  key={forma.value}
                  onClick={() => setFiltroFormaPago(forma.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filtroFormaPago === forma.value
                      ? 'bg-[#007AFF] text-white shadow-sm'
                      : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200'
                  }`}
                >
                  {forma.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de pagos */}
        {pagosFiltrados.length > 0 ? (
          <div className="space-y-2">
            {pagosFiltrados.map((pago) => (
              <div
                key={pago.id}
                className="bg-white rounded-xl border border-zinc-200 p-3 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-zinc-900 text-sm truncate">
                        {pago.titulo}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-md border flex-shrink-0 ${getColorTipo(
                          pago.tipo
                        )}`}
                      >
                        {pago.tipoLabel}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 truncate">{pago.descripcion}</p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatearFecha(pago.fecha)}
                      </span>

                      {pago.formaPago && (
                        <span className="flex items-center gap-1">
                          {getIconoFormaPago(pago.formaPago)}
                          {pago.formaPago === 'TRANSFERENCIA' ? 'Transferencia' :
                           pago.formaPago === 'EFECTIVO' ? 'Efectivo' : 'Cheque'}
                        </span>
                      )}

                      {pago.referencia && (
                        <span className="text-zinc-400">Ref: {pago.referencia}</span>
                      )}

                      {pago.diasRetraso !== undefined && pago.diasRetraso > 0 && (
                        <span className="text-[#FF9500] font-medium">
                          {pago.diasRetraso} día{pago.diasRetraso !== 1 ? 's' : ''} de retraso
                        </span>
                      )}
                    </div>

                    {pago.observaciones && (
                      <p className="text-xs text-zinc-500 mt-1.5 italic">
                        {pago.observaciones}
                      </p>
                    )}
                  </div>

                  {/* Monto */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-base font-bold ${
                        pago.esIngreso ? 'text-[#34C759]' : 'text-[#FF3B30]'
                      }`}
                    >
                      {pago.esIngreso ? '+' : '-'}${pago.monto.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {pago.esIngreso ? 'Ingreso' : 'Egreso'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-zinc-200">
            <svg
              className="w-12 h-12 text-zinc-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
              />
            </svg>
            <p className="text-sm text-zinc-500">
              {busqueda
                ? 'No se encontraron pagos con ese criterio'
                : 'No hay pagos registrados'}
            </p>
          </div>
        )}
          </>
        )}

        {/* Tab Content: Pagos Parciales */}
        {activeTab === 'partial' && (
          <>
            {/* Header con botón crear */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-zinc-600">
                {cuentasParciales.length} cuenta{cuentasParciales.length !== 1 ? 's' : ''} con pago parcial
              </p>
              <button
                onClick={() => setShowCreateParcialModal(true)}
                className="px-4 py-2 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0051D5] transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Pago Parcial
              </button>
            </div>

            {/* Estadísticas Parciales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white rounded-xl border border-zinc-200 p-3">
                <p className="text-xs text-zinc-600 mb-1">Total Cuentas</p>
                <p className="text-lg font-bold text-zinc-900">{estadisticasParciales.totalCuentas}</p>
              </div>
              <div className="bg-white rounded-xl border border-zinc-200 p-3">
                <p className="text-xs text-zinc-600 mb-1">Por Cobrar</p>
                <p className="text-lg font-bold text-zinc-900">
                  ${estadisticasParciales.totalPorCobrar.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-zinc-200 p-3">
                <p className="text-xs text-[#34C759] mb-1">Abonado</p>
                <p className="text-lg font-bold text-[#34C759]">
                  ${estadisticasParciales.totalAbonado.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-zinc-200 p-3">
                <p className="text-xs text-[#FF9500] mb-1">Pendiente</p>
                <p className="text-lg font-bold text-[#FF9500]">
                  ${estadisticasParciales.totalPendiente.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Lista de Cuentas Parciales */}
            {cuentasParciales.length > 0 ? (
              <div className="space-y-3">
                {cuentasParciales.map((cuenta) => (
                  <div
                    key={cuenta.id}
                    className="bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-sm transition-all"
                  >
                    {/* Header de cuenta */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-zinc-900 text-sm">
                            {cuenta.espacioIdentificador} - {cuenta.arrendatarioNombre}
                          </h3>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20">
                            {cuenta.concepto}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600">
                          Período: {cuenta.periodo} • {cuenta.cantidadAbonos} abono{cuenta.cantidadAbonos !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-zinc-900">
                          ${cuenta.montoPactado.toLocaleString()}
                        </p>
                        <p className="text-xs text-zinc-500">Total</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-600">Progreso de pago</span>
                        <span className="font-medium text-[#34C759]">
                          {cuenta.porcentajePagado.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-2">
                        <div
                          className="bg-[#34C759] h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(cuenta.porcentajePagado, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-[#34C759]">
                          Abonado: ${cuenta.totalAbonado.toLocaleString()}
                        </span>
                        <span className="text-[#FF9500]">
                          Pendiente: ${cuenta.saldoPendiente.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Historial de abonos */}
                    <div className="mb-3">
                      <p className="text-xs font-medium text-zinc-600 mb-2">Historial de Abonos:</p>
                      <div className="space-y-1.5">
                        {cuenta.abonos.map((abono) => (
                          <div
                            key={abono.id}
                            className="flex items-center justify-between text-xs bg-zinc-50 rounded-lg p-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500">{abono.codigoInterno}</span>
                              <span className="text-zinc-700">
                                {new Date(abono.fechaPago).toLocaleDateString('es-CL')}
                              </span>
                              {abono.metodoPago && (
                                <span className="text-zinc-500">• {abono.metodoPago}</span>
                              )}
                            </div>
                            <span className="font-medium text-[#34C759]">
                              +${abono.montoPagado.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botón registrar abono */}
                    <button
                      onClick={() => {
                        setSelectedCuenta(cuenta)
                        setShowAbonoModal(true)
                      }}
                      className="w-full py-2 px-4 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0051D5] transition-colors"
                    >
                      Registrar Nuevo Abono
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-zinc-200">
                <svg
                  className="w-12 h-12 text-zinc-300 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm text-zinc-500">No hay cobros con pagos parciales pendientes</p>
              </div>
            )}
          </>
        )}

        {/* Tab Content: Pagos Recurrentes */}
        {activeTab === 'recurring' && (
          <>
            {/* Header con botón crear */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-zinc-600">
                {pagosRecurrentes.length} pago{pagosRecurrentes.length !== 1 ? 's' : ''} recurrente{pagosRecurrentes.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={() => {
                  setSelectedRecurring(null)
                  setShowRecurringModal(true)
                }}
                className="px-4 py-2 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0051D5] transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Pago Recurrente
              </button>
            </div>

            {/* Filtros */}
            <div className="mb-4 space-y-3">
              <div>
                <p className="text-xs text-zinc-600 mb-2 font-medium">Estado</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'true', label: 'Activos' },
                    { value: 'false', label: 'Inactivos' },
                    { value: 'todos', label: 'Todos' },
                  ].map((estado) => (
                    <button
                      key={estado.value}
                      onClick={() => setFiltroEstado(estado.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filtroEstado === estado.value
                          ? 'bg-[#007AFF] text-white shadow-sm'
                          : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200'
                      }`}
                    >
                      {estado.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-600 mb-2 font-medium">Categoría</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'todos', label: 'Todas' },
                    { value: 'SERVICIOS_BASICOS', label: 'Servicios Básicos' },
                    { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
                    { value: 'SEGUROS', label: 'Seguros' },
                    { value: 'IMPUESTOS', label: 'Impuestos' },
                    { value: 'NOMINA', label: 'Nómina' },
                    { value: 'OTROS', label: 'Otros' },
                  ].map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setFiltroCategoria(cat.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filtroCategoria === cat.value
                          ? 'bg-[#007AFF] text-white shadow-sm'
                          : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lista de pagos recurrentes */}
            {pagosRecurrentes.length > 0 ? (
              <div className="space-y-3">
                {pagosRecurrentes.map((pago) => (
                  <div
                    key={pago.id}
                    className="bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-zinc-900 text-sm">{pago.nombre}</h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                              pago.activo
                                ? 'bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20'
                                : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                            }`}
                          >
                            {pago.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20">
                            {pago.categoria.replace('_', ' ')}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-600 mb-2">
                          {pago.proveedor} • {pago.descripcion}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {pago.frecuencia}
                            {pago.diaPago && ` - Día ${pago.diaPago}`}
                          </span>

                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Desde: {new Date(pago.fechaInicio).toLocaleDateString('es-CL')}
                          </span>

                          {pago.fechaFin && (
                            <span className="text-[#FF9500]">
                              Hasta: {new Date(pago.fechaFin).toLocaleDateString('es-CL')}
                            </span>
                          )}

                          <span>{pago.metodoPago}</span>

                          {pago._count && pago._count.pagosGenerados > 0 && (
                            <span className="text-[#007AFF]">
                              {pago._count.pagosGenerados} pago{pago._count.pagosGenerados !== 1 ? 's' : ''} generado{pago._count.pagosGenerados !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {pago.observaciones && (
                          <p className="text-xs text-zinc-500 mt-2 italic">{pago.observaciones}</p>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        {pago.esMontoVariable ? (
                          <p className="text-sm font-bold text-[#FF9500]">Variable</p>
                        ) : (
                          <p className="text-sm font-bold text-zinc-900">
                            ${pago.montoFijo?.toLocaleString()}
                          </p>
                        )}
                        <p className="text-xs text-zinc-500 mt-0.5">{pago.codigoInterno}</p>

                        <button
                          onClick={() => {
                            setSelectedRecurring(pago)
                            setShowRecurringModal(true)
                          }}
                          className="mt-2 text-xs text-[#007AFF] hover:text-[#0051D5] font-medium"
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-zinc-200">
                <svg
                  className="w-12 h-12 text-zinc-300 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-zinc-500">No hay pagos recurrentes configurados</p>
              </div>
            )}
          </>
        )}

        {/* Modal: Registrar Abono */}
        {showAbonoModal && selectedCuenta && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">Registrar Abono</h2>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {selectedCuenta.espacioIdentificador} - {selectedCuenta.arrendatarioNombre}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAbonoModal(false)
                      setSelectedCuenta(null)
                    }}
                    className="text-zinc-400 hover:text-zinc-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Info de cuenta */}
                <div className="bg-zinc-50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-600">Monto Pactado:</span>
                    <span className="font-bold text-zinc-900">${selectedCuenta.montoPactado.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-600">Total Abonado:</span>
                    <span className="font-bold text-[#34C759]">${selectedCuenta.totalAbonado.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">Saldo Pendiente:</span>
                    <span className="font-bold text-[#FF9500]">${selectedCuenta.saldoPendiente.toLocaleString()}</span>
                  </div>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)

                    try {
                      const res = await fetch('/api/cobros/registrar-abono', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          cobroRelacionadoId: selectedCuenta.id,
                          montoPagado: formData.get('montoPagado'),
                          fechaPago: formData.get('fechaPago'),
                          metodoPago: formData.get('metodoPago'),
                          numeroComprobante: formData.get('numeroComprobante') || null,
                          observaciones: formData.get('observaciones') || null,
                        }),
                      })

                      if (!res.ok) {
                        const error = await res.json()
                        alert(error.error || 'Error al registrar abono')
                        return
                      }

                      setShowAbonoModal(false)
                      setSelectedCuenta(null)
                      cargarPagosParciales()
                    } catch (error) {
                      console.error('Error:', error)
                      alert('Error al registrar abono')
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Monto del Abono *
                    </label>
                    <input
                      type="number"
                      name="montoPagado"
                      required
                      min="1"
                      max={selectedCuenta.saldoPendiente}
                      step="0.01"
                      placeholder="Ej: 50000"
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Máximo: ${selectedCuenta.saldoPendiente.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Fecha de Pago *
                    </label>
                    <input
                      type="date"
                      name="fechaPago"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Método de Pago *
                    </label>
                    <select
                      name="metodoPago"
                      required
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                    >
                      <option value="">Seleccione...</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Número de Comprobante
                    </label>
                    <input
                      type="text"
                      name="numeroComprobante"
                      placeholder="Ej: 123456"
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Observaciones
                    </label>
                    <textarea
                      name="observaciones"
                      rows={3}
                      placeholder="Notas adicionales..."
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAbonoModal(false)
                        setSelectedCuenta(null)
                      }}
                      className="flex-1 py-2.5 px-4 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0051D5] transition-colors"
                    >
                      Registrar Abono
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Crear/Editar Pago Recurrente */}
        {showRecurringModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-zinc-900">
                    {selectedRecurring ? 'Editar Pago Recurrente' : 'Nuevo Pago Recurrente'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowRecurringModal(false)
                      setSelectedRecurring(null)
                    }}
                    className="text-zinc-400 hover:text-zinc-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const esMontoVariable = formData.get('esMontoVariable') === 'true'

                    try {
                      const body = {
                        nombre: formData.get('nombre'),
                        proveedor: formData.get('proveedor'),
                        ruc: formData.get('ruc') || null,
                        cuentaDestino: formData.get('cuentaDestino') || null,
                        categoria: formData.get('categoria'),
                        descripcion: formData.get('descripcion'),
                        esMontoVariable,
                        montoFijo: esMontoVariable ? null : formData.get('montoFijo'),
                        metodoPago: formData.get('metodoPago'),
                        frecuencia: formData.get('frecuencia'),
                        diaPago: formData.get('diaPago') || null,
                        fechaInicio: formData.get('fechaInicio'),
                        fechaFin: formData.get('fechaFin') || null,
                        activo: formData.get('activo') === 'true',
                        observaciones: formData.get('observaciones') || null,
                      }

                      const url = selectedRecurring
                        ? `/api/pagos-recurrentes/${selectedRecurring.id}`
                        : '/api/pagos-recurrentes'

                      const method = selectedRecurring ? 'PUT' : 'POST'

                      const res = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                      })

                      if (!res.ok) {
                        const error = await res.json()
                        alert(error.error || 'Error al guardar pago recurrente')
                        return
                      }

                      setShowRecurringModal(false)
                      setSelectedRecurring(null)
                      cargarPagosRecurrentes()
                    } catch (error) {
                      console.error('Error:', error)
                      alert('Error al guardar pago recurrente')
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Nombre del Pago *
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        required
                        defaultValue={selectedRecurring?.nombre}
                        placeholder="Ej: Agua potable mensual"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Proveedor *
                      </label>
                      <input
                        type="text"
                        name="proveedor"
                        required
                        defaultValue={selectedRecurring?.proveedor}
                        placeholder="Nombre del proveedor"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">RUC</label>
                      <input
                        type="text"
                        name="ruc"
                        defaultValue={selectedRecurring?.ruc || ''}
                        placeholder="RUC del proveedor"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Cuenta Destino
                      </label>
                      <input
                        type="text"
                        name="cuentaDestino"
                        defaultValue={selectedRecurring?.cuentaDestino || ''}
                        placeholder="Número de cuenta para transferencia"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Categoría *
                      </label>
                      <select
                        name="categoria"
                        required
                        defaultValue={selectedRecurring?.categoria}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      >
                        <option value="">Seleccione...</option>
                        <option value="SERVICIOS_BASICOS">Servicios Básicos</option>
                        <option value="MANTENIMIENTO">Mantenimiento</option>
                        <option value="SEGUROS">Seguros</option>
                        <option value="IMPUESTOS">Impuestos</option>
                        <option value="NOMINA">Nómina</option>
                        <option value="OTROS">Otros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Tipo de Monto *
                      </label>
                      <select
                        name="esMontoVariable"
                        required
                        defaultValue={selectedRecurring?.esMontoVariable ? 'true' : 'false'}
                        onChange={(e) => {
                          const montoInput = document.getElementById('montoFijo') as HTMLInputElement
                          if (montoInput) {
                            montoInput.disabled = e.target.value === 'true'
                            if (e.target.value === 'true') {
                              montoInput.value = ''
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      >
                        <option value="false">Monto Fijo</option>
                        <option value="true">Monto Variable</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Monto Fijo
                      </label>
                      <input
                        type="number"
                        id="montoFijo"
                        name="montoFijo"
                        min="0"
                        step="0.01"
                        defaultValue={selectedRecurring?.montoFijo || ''}
                        disabled={selectedRecurring?.esMontoVariable}
                        placeholder="Ej: 150000"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent disabled:bg-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Frecuencia *
                      </label>
                      <select
                        name="frecuencia"
                        required
                        defaultValue={selectedRecurring?.frecuencia}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      >
                        <option value="">Seleccione...</option>
                        <option value="MENSUAL">Mensual</option>
                        <option value="BIMENSUAL">Bimensual</option>
                        <option value="TRIMESTRAL">Trimestral</option>
                        <option value="SEMESTRAL">Semestral</option>
                        <option value="ANUAL">Anual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Día de Pago
                      </label>
                      <input
                        type="number"
                        name="diaPago"
                        min="1"
                        max="31"
                        defaultValue={selectedRecurring?.diaPago || ''}
                        placeholder="Día del mes (1-31)"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Método de Pago *
                      </label>
                      <select
                        name="metodoPago"
                        required
                        defaultValue={selectedRecurring?.metodoPago}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      >
                        <option value="">Seleccione...</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="CHEQUE">Cheque</option>
                        <option value="DEBITO_AUTOMATICO">Débito Automático</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Estado *
                      </label>
                      <select
                        name="activo"
                        required
                        defaultValue={selectedRecurring?.activo ? 'true' : 'false'}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Fecha Inicio *
                      </label>
                      <input
                        type="date"
                        name="fechaInicio"
                        required
                        defaultValue={
                          selectedRecurring
                            ? new Date(selectedRecurring.fechaInicio).toISOString().split('T')[0]
                            : new Date().toISOString().split('T')[0]
                        }
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Fecha Fin (opcional)
                      </label>
                      <input
                        type="date"
                        name="fechaFin"
                        defaultValue={
                          selectedRecurring?.fechaFin
                            ? new Date(selectedRecurring.fechaFin).toISOString().split('T')[0]
                            : ''
                        }
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Descripción *
                      </label>
                      <input
                        type="text"
                        name="descripcion"
                        required
                        defaultValue={selectedRecurring?.descripcion}
                        placeholder="Descripción breve del pago"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Observaciones
                      </label>
                      <textarea
                        name="observaciones"
                        rows={3}
                        defaultValue={selectedRecurring?.observaciones || ''}
                        placeholder="Notas adicionales..."
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRecurringModal(false)
                        setSelectedRecurring(null)
                      }}
                      className="flex-1 py-2.5 px-4 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0051D5] transition-colors"
                    >
                      {selectedRecurring ? 'Actualizar' : 'Crear'} Pago Recurrente
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Crear Pago Parcial */}
        {showCreateParcialModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-zinc-900">Crear Pago Parcial</h2>
                  <button
                    onClick={() => setShowCreateParcialModal(false)}
                    className="text-zinc-400 hover:text-zinc-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)

                    try {
                      const body = {
                        espacioId: formData.get('espacioId'),
                        concepto: formData.get('concepto'),
                        conceptoPersonalizado: formData.get('conceptoPersonalizado') || null,
                        periodo: formData.get('periodo'),
                        montoPagado: formData.get('montoPagado'),
                        montoPactado: formData.get('montoPactado'),
                        fechaPago: formData.get('fechaPago'),
                        fechaVencimiento: formData.get('fechaVencimiento'),
                        metodoPago: formData.get('metodoPago'),
                        numeroComprobante: formData.get('numeroComprobante') || null,
                        estado: 'PARCIAL',
                        observaciones: formData.get('observaciones') || null,
                      }

                      const res = await fetch('/api/cobros', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                      })

                      if (!res.ok) {
                        const error = await res.json()
                        alert(error.error || 'Error al crear pago parcial')
                        return
                      }

                      setShowCreateParcialModal(false)
                      cargarPagosParciales()
                    } catch (error) {
                      console.error('Error:', error)
                      alert('Error al crear pago parcial')
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Espacio *
                      </label>
                      <select
                        name="espacioId"
                        required
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      >
                        <option value="">Seleccione...</option>
                        {espacios.map((espacio) => (
                          <option key={espacio.id} value={espacio.id}>
                            {espacio.identificador}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Concepto *
                      </label>
                      <select
                        name="concepto"
                        required
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      >
                        <option value="">Seleccione...</option>
                        <option value="RENTA">Renta</option>
                        <option value="AIRBNB">Airbnb</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Concepto Personalizado
                      </label>
                      <input
                        type="text"
                        name="conceptoPersonalizado"
                        placeholder="Solo si concepto es 'Otro'"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Período *
                      </label>
                      <input
                        type="month"
                        name="periodo"
                        required
                        defaultValue={new Date().toISOString().slice(0, 7)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Monto Pactado *
                      </label>
                      <input
                        type="number"
                        name="montoPactado"
                        required
                        min="0"
                        step="0.01"
                        placeholder="Ej: 500000"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Monto Pagado (Primer Abono) *
                      </label>
                      <input
                        type="number"
                        name="montoPagado"
                        required
                        min="0"
                        step="0.01"
                        placeholder="Ej: 200000"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Fecha de Pago *
                      </label>
                      <input
                        type="date"
                        name="fechaPago"
                        required
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Fecha de Vencimiento *
                      </label>
                      <input
                        type="date"
                        name="fechaVencimiento"
                        required
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Método de Pago *
                      </label>
                      <select
                        name="metodoPago"
                        required
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      >
                        <option value="">Seleccione...</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="CHEQUE">Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Número de Comprobante
                      </label>
                      <input
                        type="text"
                        name="numeroComprobante"
                        placeholder="Ej: 123456"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Observaciones
                      </label>
                      <textarea
                        name="observaciones"
                        rows={3}
                        placeholder="Notas adicionales..."
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateParcialModal(false)}
                      className="flex-1 py-2.5 px-4 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0051D5] transition-colors"
                    >
                      Crear Pago Parcial
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
