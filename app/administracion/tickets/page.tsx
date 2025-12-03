'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainNavbar from '@/app/components/MainNavbar'
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

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'URGENTE': return 'bg-red-100 text-red-700'
      case 'ALTA': return 'bg-orange-100 text-orange-700'
      case 'MEDIA': return 'bg-yellow-100 text-yellow-700'
      case 'BAJA': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADO': return 'bg-green-100 text-green-700 border-green-200'
      case 'EN_PROCESO': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'EN_ESPERA': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'PENDIENTE': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'CANCELADO': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatEstado = (estado: string) => {
    return estado.replace(/_/g, ' ')
  }

  const ticketsFiltrados = tickets

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar activeSection="pagos" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-lg font-semibold text-gray-900">Tickets de Mantenimiento</h1>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{estadisticas.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Pendientes</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{estadisticas.pendientes}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">En Proceso</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{estadisticas.enProceso}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Completados</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{estadisticas.completados}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => {
              setTicketSeleccionado(null)
              setMostrarModal(true)
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Ticket
          </button>
        </div>


        {/* Alerta de tickets urgentes */}
        {estadisticas.urgentes > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-800">
                  {estadisticas.urgentes} ticket(s) urgente(s) requieren atención
                </h3>
                <p className="text-sm text-red-600 mt-0.5">Revisa los tickets marcados como urgentes</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
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
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="text-gray-500 mt-4">Cargando tickets...</p>
          </div>
        ) : ticketsFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500">No hay tickets registrados</p>
            <button
              onClick={() => {
                setTicketSeleccionado(null)
                setMostrarModal(true)
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Crear primer ticket
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ticketsFiltrados.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header del card */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{ticket.numeroTicket}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPrioridadColor(ticket.prioridad)}`}>
                          {ticket.prioridad}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getEstadoColor(ticket.estado)}`}>
                          {formatEstado(ticket.estado)}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">{ticket.titulo}</p>
                      <p className="text-sm text-gray-600 mt-1">{ticket.descripcion}</p>
                    </div>
                  </div>
                </div>

                {/* Contenido del card */}
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {/* Categoría */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-500">Categoría</span>
                      <p className="text-sm font-medium text-gray-900">{ticket.categoria.replace(/_/g, ' ')}</p>
                    </div>

                    {/* Espacio */}
                    {ticket.espacio && (
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <span className="text-xs text-indigo-600">Espacio</span>
                        <p className="text-sm font-medium text-gray-900">{ticket.espacio.identificador}</p>
                      </div>
                    )}

                    {/* Asignado a */}
                    {ticket.asignadoA && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <span className="text-xs text-purple-600">Asignado</span>
                        <p className="text-sm font-medium text-gray-900">{ticket.asignadoA}</p>
                      </div>
                    )}

                    {/* Costos */}
                    <div className="bg-green-50 p-3 rounded-lg">
                      <span className="text-xs text-green-600">Costo</span>
                      <p className="text-sm font-bold text-gray-900">${ticket.costoReal.toLocaleString()}</p>
                      {ticket.costoEstimado > 0 && (
                        <p className="text-xs text-gray-500">Est: ${ticket.costoEstimado.toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {/* Fechas y acciones */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(ticket.fechaCreacion).toLocaleDateString()}</span>
                      <span>{ticket._count.novedades} novedades</span>
                    </div>
                    <button
                      onClick={() => {
                        setTicketSeleccionado(ticket)
                        setMostrarDetalle(true)
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
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
