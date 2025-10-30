/**
 * Página principal de Cobros - Casa del Sol
 * Sistema completo de gestión de cobros con KPIs, filtros, búsqueda y exportación
 */

'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/app/components/Navbar'
import ModalRegistroCobro from '@/app/components/ModalRegistroCobro'
import { useRouter } from 'next/navigation'

type Cobro = {
  id: string
  codigoInterno: string
  espacioId: string
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
  }
}

type Estadisticas = {
  totalCobros: number
  totalCobrado: number
  totalPorEstado: {
    PAGADO: number
    PENDIENTE: number
    PARCIAL: number
  }
  totalPorMetodo: {
    TRANSFERENCIA: number
    EFECTIVO: number
    CHEQUE: number
  }
  totalPorConcepto: {
    RENTA: number
    AIRBNB: number
    OTRO: number
  }
}

export default function CobrosPage() {
  const router = useRouter()
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroConcepto, setFiltroConcepto] = useState('todos')
  const [filtroMetodo, setFiltroMetodo] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  // Cargar cobros
  const cargarCobros = () => {
    setLoading(true)

    // Construir query params
    const params = new URLSearchParams()
    if (busqueda) params.append('busqueda', busqueda)
    if (filtroConcepto !== 'todos') params.append('concepto', filtroConcepto)
    if (filtroMetodo !== 'todos') params.append('metodoPago', filtroMetodo)
    if (filtroEstado !== 'todos') params.append('estado', filtroEstado)
    if (fechaInicio) params.append('fechaInicio', fechaInicio)
    if (fechaFin) params.append('fechaFin', fechaFin)

    fetch(`/api/cobros?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setCobros(data.cobros)
        setEstadisticas(data.estadisticas)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error:', error)
        setLoading(false)
      })
  }

  useEffect(() => {
    cargarCobros()
  }, [])

  const handleFiltrar = () => {
    cargarCobros()
  }

  const handleLimpiarFiltros = () => {
    setBusqueda('')
    setFiltroConcepto('todos')
    setFiltroMetodo('todos')
    setFiltroEstado('todos')
    setFechaInicio('')
    setFechaFin('')
    setTimeout(() => cargarCobros(), 100)
  }

  const handleExportarExcel = () => {
    // Construir query params para exportar
    const params = new URLSearchParams()
    if (busqueda) params.append('busqueda', busqueda)
    if (filtroConcepto !== 'todos') params.append('concepto', filtroConcepto)
    if (filtroMetodo !== 'todos') params.append('metodoPago', filtroMetodo)
    if (filtroEstado !== 'todos') params.append('estado', filtroEstado)
    if (fechaInicio) params.append('fechaInicio', fechaInicio)
    if (fechaFin) params.append('fechaFin', fechaFin)

    // Descargar archivo
    window.open(`/api/cobros/exportar?${params.toString()}`, '_blank')
  }

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'PAGADO':
        return 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20'
      case 'PENDIENTE':
        return 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/20'
      case 'PARCIAL':
        return 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20'
      default:
        return 'bg-zinc-100 text-zinc-700'
    }
  }

  const getColorConcepto = (concepto: string) => {
    switch (concepto) {
      case 'RENTA':
        return 'text-[#007AFF]'
      case 'AIRBNB':
        return 'text-[#AF52DE]'
      case 'OTRO':
        return 'text-zinc-600'
      default:
        return 'text-zinc-900'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar activeTab="Cobros" />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-zinc-600">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar activeTab="Cobros" />

      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Cobros</h1>
          <p className="text-sm text-zinc-600 mt-0.5">{cobros.length} registro(s)</p>
        </div>

        {/* KPIs */}
        {estadisticas && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {/* Total Cobrado */}
            <div className="bg-white rounded-xl border border-zinc-200 p-3">
              <p className="text-xs text-zinc-600 mb-1">Total Cobrado</p>
              <p className="text-lg font-semibold text-zinc-900">
                ${estadisticas.totalCobrado.toLocaleString()}
              </p>
            </div>

            {/* Por Transferencia */}
            <div className="bg-white rounded-xl border border-zinc-200 p-3">
              <p className="text-xs text-zinc-600 mb-1">Transferencia</p>
              <p className="text-lg font-semibold text-[#007AFF]">
                ${estadisticas.totalPorMetodo.TRANSFERENCIA.toLocaleString()}
              </p>
            </div>

            {/* Por Efectivo */}
            <div className="bg-white rounded-xl border border-zinc-200 p-3">
              <p className="text-xs text-zinc-600 mb-1">Efectivo</p>
              <p className="text-lg font-semibold text-[#34C759]">
                ${estadisticas.totalPorMetodo.EFECTIVO.toLocaleString()}
              </p>
            </div>

            {/* Por Cheque */}
            <div className="bg-white rounded-xl border border-zinc-200 p-3">
              <p className="text-xs text-zinc-600 mb-1">Cheque</p>
              <p className="text-lg font-semibold text-[#AF52DE]">
                ${estadisticas.totalPorMetodo.CHEQUE.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Sub-tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => router.push('/cobros')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#007AFF] text-white shadow-sm"
          >
            Todos
          </button>
          <button
            onClick={() => router.push('/cobros/parciales')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
          >
            Pagos Parciales
          </button>
          <button
            onClick={() => router.push('/cobros/espacios')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
          >
            Por Espacio
          </button>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-4">
          {/* Búsqueda */}
          <div className="mb-3">
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
                placeholder="Buscar por código, arrendatario, comprobante..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFiltrar()}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Concepto */}
            <select
              value={filtroConcepto}
              onChange={(e) => setFiltroConcepto(e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            >
              <option value="todos">Todos los conceptos</option>
              <option value="RENTA">Renta</option>
              <option value="AIRBNB">Airbnb</option>
              <option value="OTRO">Otro</option>
            </select>

            {/* Método de Pago */}
            <select
              value={filtroMetodo}
              onChange={(e) => setFiltroMetodo(e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            >
              <option value="todos">Todos los métodos</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="CHEQUE">Cheque</option>
            </select>

            {/* Estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            >
              <option value="todos">Todos los estados</option>
              <option value="PAGADO">Pagado</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PARCIAL">Parcial</option>
            </select>

            {/* Fecha Inicio */}
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            />

            {/* Fecha Fin */}
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            />
          </div>

          {/* Botones de acción */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleFiltrar}
              className="px-4 py-2 rounded-lg bg-[#007AFF] text-white text-sm font-medium hover:bg-[#0051D5] transition-colors"
            >
              Filtrar
            </button>
            <button
              onClick={handleLimpiarFiltros}
              className="px-4 py-2 rounded-lg bg-white text-zinc-700 text-sm font-medium border border-zinc-300 hover:bg-zinc-50 transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={() => setModalAbierto(true)}
              className="px-4 py-2 rounded-lg bg-[#AF52DE] text-white text-sm font-medium hover:bg-[#8E44AD] transition-colors ml-auto"
            >
              + Registrar Nuevo
            </button>
            <button
              onClick={handleExportarExcel}
              className="px-4 py-2 rounded-lg bg-[#34C759] text-white text-sm font-medium hover:bg-[#248A3D] transition-colors"
            >
              Descargar Excel
            </button>
          </div>
        </div>

        {/* Listado de Cobros */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {cobros.map((cobro) => (
            <div
              key={cobro.id}
              className="bg-white rounded-xl border border-zinc-200 p-3 hover:shadow-md transition-all cursor-pointer"
              onClick={() => router.push(`/cobros/${cobro.id}`)}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-zinc-500">{cobro.codigoInterno}</span>
                    <span className="text-xs text-zinc-400">·</span>
                    <span className="text-xs font-medium text-zinc-700">{cobro.espacio.identificador}</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {cobro.espacio.arrendatario?.nombre || 'Sin arrendatario'}
                  </p>
                </div>
                <span
                  className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-md border flex-shrink-0 ${getColorEstado(
                    cobro.estado
                  )}`}
                >
                  {cobro.estado}
                </span>
              </div>

              {/* Concepto y Período */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold ${getColorConcepto(cobro.concepto)}`}>
                  {cobro.concepto === 'OTRO' && cobro.conceptoPersonalizado
                    ? cobro.conceptoPersonalizado
                    : cobro.concepto}
                </span>
                {cobro.periodo && (
                  <>
                    <span className="text-xs text-zinc-400">·</span>
                    <span className="text-xs text-zinc-600">{cobro.periodo}</span>
                  </>
                )}
              </div>

              {/* Montos */}
              <div className="space-y-1 mb-2 pb-2 border-b border-zinc-100">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-600">Pagado:</span>
                  <span className="font-semibold text-zinc-900">${cobro.montoPagado.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-600">Pactado:</span>
                  <span className="font-medium text-zinc-700">${cobro.montoPactado.toLocaleString()}</span>
                </div>
                {cobro.diferencia !== 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600">Diferencia:</span>
                    <span
                      className={`font-semibold ${
                        cobro.diferencia > 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'
                      }`}
                    >
                      {cobro.diferencia > 0 ? '+' : ''}${cobro.diferencia.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-600">{cobro.metodoPago}</span>
                  {cobro.numeroComprobante && (
                    <span className="text-zinc-500 truncate"># {cobro.numeroComprobante}</span>
                  )}
                </div>
                <span className="text-zinc-600">
                  {new Date(cobro.fechaPago).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Sin resultados */}
        {cobros.length === 0 && (
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
            <p className="text-sm text-zinc-500">No se encontraron cobros</p>
          </div>
        )}
      </main>

      {/* Modal de Registro */}
      <ModalRegistroCobro
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSuccess={() => {
          setModalAbierto(false)
          cargarCobros()
        }}
      />
    </div>
  )
}
