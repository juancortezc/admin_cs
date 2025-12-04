'use client'

import { useState, useEffect } from 'react'
import MainNavbar from '@/app/components/MainNavbar'
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

type EstadoTicket = 'PENDIENTE' | 'EN_PROCESO' | 'EN_ESPERA' | 'COMPLETADO' | 'CANCELADO'

const COLUMNAS: { estado: EstadoTicket; nombre: string; color: string; bgColor: string }[] = [
  { estado: 'PENDIENTE', nombre: 'Pendiente', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  { estado: 'EN_PROCESO', nombre: 'En Proceso', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { estado: 'EN_ESPERA', nombre: 'En Espera', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  { estado: 'COMPLETADO', nombre: 'Completado', color: 'text-green-700', bgColor: 'bg-green-100' },
  { estado: 'CANCELADO', nombre: 'Cancelado', color: 'text-red-700', bgColor: 'bg-red-100' },
]

export default function MantenimientoPage() {
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
  const [filtroPrioridad, setFiltroPrioridad] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(null)
  const [draggingTicket, setDraggingTicket] = useState<Ticket | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<EstadoTicket | null>(null)

  useEffect(() => {
    cargarTickets()
  }, [busqueda, filtroPrioridad, filtroCategoria])

  const cargarTickets = async () => {
    try {
      const params = new URLSearchParams()
      if (busqueda) params.append('busqueda', busqueda)
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
      case 'URGENTE': return 'bg-red-500 text-white'
      case 'ALTA': return 'bg-orange-500 text-white'
      case 'MEDIA': return 'bg-yellow-500 text-white'
      case 'BAJA': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getTicketsByEstado = (estado: EstadoTicket) => {
    return tickets.filter(t => t.estado === estado)
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, ticket: Ticket) => {
    setDraggingTicket(ticket)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', ticket.id)
  }

  const handleDragEnd = () => {
    setDraggingTicket(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, estado: EstadoTicket) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverColumn !== estado) {
      setDragOverColumn(estado)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Solo resetear si salimos completamente de la columna
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, nuevoEstado: EstadoTicket) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (!draggingTicket || draggingTicket.estado === nuevoEstado) {
      setDraggingTicket(null)
      return
    }

    // Optimistic update
    setTickets(prev =>
      prev.map(t => t.id === draggingTicket.id ? { ...t, estado: nuevoEstado } : t)
    )

    try {
      const res = await fetch(`/api/mantenimiento/tickets/${draggingTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (!res.ok) {
        // Revert on error
        setTickets(prev =>
          prev.map(t => t.id === draggingTicket.id ? { ...t, estado: draggingTicket.estado } : t)
        )
        console.error('Error al actualizar estado')
      } else {
        // Recargar estadísticas
        cargarTickets()
      }
    } catch (error) {
      // Revert on error
      setTickets(prev =>
        prev.map(t => t.id === draggingTicket.id ? { ...t, estado: draggingTicket.estado } : t)
      )
      console.error('Error al actualizar estado:', error)
    }

    setDraggingTicket(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar activeSection="mantenimiento" />

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-lg font-semibold text-gray-900">Tickets de Mantenimiento</h1>
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

        {/* Estadísticas compactas */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="text-sm font-bold text-gray-900">{estadisticas.total}</span>
          </div>
          {estadisticas.urgentes > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-bold text-red-700">{estadisticas.urgentes} urgente(s)</span>
            </div>
          )}
        </div>

        {/* Filtros compactos */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-48"
          />
          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Todas las prioridades</option>
            <option value="URGENTE">Urgente</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </select>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
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

        {/* Tablero Kanban */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="text-gray-500 mt-4">Cargando tickets...</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNAS.map((columna) => {
              const ticketsColumna = getTicketsByEstado(columna.estado)
              const isDropTarget = dragOverColumn === columna.estado

              return (
                <div
                  key={columna.estado}
                  className={`flex-shrink-0 w-72 flex flex-col rounded-xl transition-all duration-200 ${
                    isDropTarget
                      ? 'bg-indigo-50 ring-2 ring-indigo-400 ring-offset-2'
                      : 'bg-gray-100'
                  }`}
                  onDragOver={(e) => handleDragOver(e, columna.estado)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, columna.estado)}
                >
                  {/* Header de columna */}
                  <div className={`px-4 py-3 rounded-t-xl ${columna.bgColor}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${columna.color}`}>{columna.nombre}</h3>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${columna.bgColor} ${columna.color}`}>
                        {ticketsColumna.length}
                      </span>
                    </div>
                  </div>

                  {/* Lista de tickets */}
                  <div className="flex-1 p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-320px)] overflow-y-auto">
                    {ticketsColumna.length === 0 ? (
                      <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
                        Sin tickets
                      </div>
                    ) : (
                      ticketsColumna.map((ticket) => (
                        <div
                          key={ticket.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, ticket)}
                          onDragEnd={handleDragEnd}
                          onClick={() => {
                            setTicketSeleccionado(ticket)
                            setMostrarDetalle(true)
                          }}
                          className={`bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                            draggingTicket?.id === ticket.id ? 'opacity-50 scale-95' : ''
                          }`}
                        >
                          {/* Header del ticket */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-xs font-mono text-gray-500">{ticket.numeroTicket}</span>
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${getPrioridadColor(ticket.prioridad)}`}>
                              {ticket.prioridad}
                            </span>
                          </div>

                          {/* Título */}
                          <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                            {ticket.titulo}
                          </h4>

                          {/* Descripción */}
                          {ticket.descripcion && (
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                              {ticket.descripcion}
                            </p>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              {ticket.espacio && (
                                <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                                  {ticket.espacio.identificador}
                                </span>
                              )}
                              {ticket.asignadoA && (
                                <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                                  {ticket.asignadoA}
                                </span>
                              )}
                            </div>
                            {ticket._count.novedades > 0 && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                {ticket._count.novedades}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
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
