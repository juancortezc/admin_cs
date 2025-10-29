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

export default function PagosPage() {
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
    <div className="min-h-screen bg-zinc-50">
      <Navbar activeTab="Pagos" />

      <main className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
        {/* Header con título */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-zinc-900">Administración de Pagos</h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            {pagosFiltrados.length} registros encontrados
          </p>
        </div>

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
      </main>
    </div>
  )
}
