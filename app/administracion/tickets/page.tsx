'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import TabsPill from '@/app/components/TabsPill'
import { WrenchIcon, CoinsIcon, BoxIcon } from '@/app/components/icons'
import ModalTicket from '@/app/components/ModalTicket'
import ModalDetalleTicket from '@/app/components/ModalDetalleTicket'

type Ticket = {
  id: string
  numeroTicket: string
  titulo: string
  descripcion: string
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE'
  categoria: string
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'EN_ESPERA' | 'COMPLETADO' | 'CANCELADO'
  fechaCreacion: string
  fechaInicio: string | null
  fechaEstimada: string | null
  fechaCompletado: string | null
  costoEstimado: number
  costoReal: number
  asignadoA: string | null
  espacioId: string | null
  proveedorId: string | null
  observaciones: string | null
  espacio?: { identificador: string }
  proveedor?: { nombre: string }
  _count: { novedades: number }
}

type Estadisticas = {
  total: number
  pendientes: number
  enProceso: number
  completados: number
  costoTotal: number
  urgentes: number
}

export default function MantenimientoPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    completados: 0,
    costoTotal: 0,
    urgentes: 0,
  })
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(null)

  useEffect(() => {
    cargarTickets()
  }, [busqueda, filtroEstado, filtroPrioridad, filtroCategoria])

  const cargarTickets = async () => {
    try {
      const params = new URLSearchParams()
      if (busqueda) params.append('busqueda', busqueda)
      if (filtroEstado) params.append('estado', filtroEstado)
      if (filtroPrioridad) params.append('prioridad', filtroPrioridad)
      if (filtroCategoria) params.append('categoria', filtroCategoria)

      const res = await fetch(`/api/mantenimiento/tickets?${params}`)
      const data = await res.json()
      setTickets(data.tickets)
      setEstadisticas(data.estadisticas)
    } catch (error) {
      console.error('Error al cargar tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPrioridadGradient = (prioridad: string) => {
    switch (prioridad) {
      case 'URGENTE': return 'from-red-600 to-rose-600'
      case 'ALTA': return 'from-orange-600 to-amber-600'
      case 'MEDIA': return 'from-yellow-600 to-amber-600'
      case 'BAJA': return 'from-green-600 to-emerald-600'
      default: return 'from-gray-600 to-gray-700'
    }
  }

  const getEstadoGradient = (estado: string) => {
    switch (estado) {
      case 'COMPLETADO': return 'from-green-600 to-emerald-600'
      case 'EN_PROCESO': return 'from-blue-600 to-indigo-600'
      case 'EN_ESPERA': return 'from-yellow-600 to-amber-600'
      case 'PENDIENTE': return 'from-gray-600 to-gray-700'
      case 'CANCELADO': return 'from-red-600 to-rose-600'
      default: return 'from-gray-600 to-gray-700'
    }
  }

  const formatEstado = (estado: string) => {
    return estado.replace(/_/g, ' ')
  }

  const ticketsFiltrados = tickets

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Navbar activeTab="Tickets" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header con Material Design 3 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <WrenchIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tickets de Mantenimiento</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Gestiona y da seguimiento a todas las solicitudes
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Administración */}
        <div className="mb-6">
          <TabsPill
            tabs={[
              { id: 'pagos', nombre: 'Pagos', icon: <CoinsIcon /> },
              { id: 'tickets', nombre: 'Tickets', icon: <WrenchIcon /> },
              { id: 'inventario', nombre: 'Inventario', icon: <BoxIcon /> },
            ]}
            activeTab="tickets"
            onTabChange={(tabId) => {
              if (tabId === 'pagos') router.push('/administracion/pagos')
              else if (tabId === 'inventario') router.push('/administracion/inventario')
            }}
          />
        </div>

        {/* Estadísticas Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4">
              <p className="text-sm font-medium text-white/80">Total</p>
              <p className="text-3xl font-bold text-white mt-1">{estadisticas.total}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4">
              <p className="text-sm font-medium text-white/80">Pendientes</p>
              <p className="text-3xl font-bold text-white mt-1">{estadisticas.pendientes}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
              <p className="text-sm font-medium text-white/80">En Proceso</p>
              <p className="text-3xl font-bold text-white mt-1">{estadisticas.enProceso}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
              <p className="text-sm font-medium text-white/80">Completados</p>
              <p className="text-3xl font-bold text-white mt-1">{estadisticas.completados}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <div></div>
          <button
            onClick={() => {
              setTicketSeleccionado(null)
              setMostrarModal(true)
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Ticket
          </button>
        </div>


        {/* Alerta de tickets urgentes */}
        {estadisticas.urgentes > 0 && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4 shadow-md">
            <div className="flex items-start gap-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-red-800">
                  {estadisticas.urgentes} ticket(s) urgente(s) requieren atención inmediata
                </h3>
                <p className="text-sm text-red-600 mt-1">Revisa los tickets marcados como urgentes y asígnalos prioritariamente</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros y búsqueda en una sola fila */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Buscar */}
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Número, título o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
              />
            </div>

            {/* Estado */}
            <div className="min-w-[180px]">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
              >
                <option value="">Todos</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="EN_ESPERA">En Espera</option>
                <option value="COMPLETADO">Completado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            {/* Prioridad */}
            <div className="min-w-[180px]">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Prioridad</label>
              <select
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
              >
                <option value="">Todas</option>
                <option value="URGENTE">Urgente</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>

            {/* Categoría */}
            <div className="min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Categoría</label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
              >
                <option value="">Todas</option>
                <option value="ELECTRICIDAD">Electricidad</option>
                <option value="PLOMERIA">Plomería</option>
                <option value="PINTURA">Pintura</option>
                <option value="CARPINTERIA">Carpintería</option>
                <option value="CERRAJERIA">Cerrajería</option>
                <option value="LIMPIEZA">Limpieza</option>
                <option value="ELECTRODOMESTICOS">Electrodomésticos</option>
                <option value="CLIMATIZACION">Climatización</option>
                <option value="TECNOLOGIA">Tecnología</option>
                <option value="MOBILIARIO">Mobiliario</option>
                <option value="GENERAL">General</option>
                <option value="OTROS">Otros</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cards de tickets */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-4 text-lg">Cargando tickets...</p>
          </div>
        ) : ticketsFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No hay tickets registrados</p>
            <button
              onClick={() => {
                setTicketSeleccionado(null)
                setMostrarModal(true)
              }}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
            >
              Crear primer ticket
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {ticketsFiltrados.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Header del card con gradiente según estado */}
                <div className={`bg-gradient-to-r ${getEstadoGradient(ticket.estado)} p-6`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-white">{ticket.numeroTicket}</h3>
                        <span className={`px-3 py-1 text-xs font-bold rounded-lg bg-gradient-to-r ${getPrioridadGradient(ticket.prioridad)} text-white shadow-md`}>
                          {ticket.prioridad}
                        </span>
                      </div>
                      <p className="text-xl font-semibold text-white mb-1">{ticket.titulo}</p>
                      <p className="text-white/80 text-sm">{ticket.descripcion}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                      <span className="text-white font-bold text-lg">{formatEstado(ticket.estado)}</span>
                    </div>
                  </div>
                </div>

                {/* Contenido del card */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* Categoría */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-600">Categoría</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{ticket.categoria.replace(/_/g, ' ')}</p>
                    </div>

                    {/* Espacio */}
                    {ticket.espacio && (
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-xs font-medium text-indigo-600">Espacio</span>
                        </div>
                        <p className="text-sm font-semibold text-indigo-900">{ticket.espacio.identificador}</p>
                      </div>
                    )}

                    {/* Asignado a */}
                    {ticket.asignadoA && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-xs font-medium text-purple-600">Asignado</span>
                        </div>
                        <p className="text-sm font-semibold text-purple-900">{ticket.asignadoA}</p>
                      </div>
                    )}

                    {/* Costos */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-medium text-green-600">Costo</span>
                      </div>
                      <p className="text-sm font-bold text-green-900">${ticket.costoReal.toLocaleString()}</p>
                      {ticket.costoEstimado > 0 && (
                        <p className="text-xs text-green-700">Est: ${ticket.costoEstimado.toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {/* Fechas y acciones */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(ticket.fechaCreacion).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span>{ticket._count.novedades} novedades</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setTicketSeleccionado(ticket)
                        setMostrarDetalle(true)
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold text-sm shadow-md flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {mostrarModal && (
        <ModalTicket
          ticket={ticketSeleccionado}
          onClose={() => {
            setMostrarModal(false)
            setTicketSeleccionado(null)
          }}
          onGuardar={() => {
            setMostrarModal(false)
            setTicketSeleccionado(null)
            cargarTickets()
          }}
        />
      )}

      {mostrarDetalle && ticketSeleccionado && (
        <ModalDetalleTicket
          ticket={ticketSeleccionado}
          onClose={() => {
            setMostrarDetalle(false)
            setTicketSeleccionado(null)
          }}
          onActualizar={() => {
            cargarTickets()
          }}
        />
      )}
    </div>
  )
}
