'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/app/components/Navbar'
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
      case 'URGENTE': return 'text-red-600 bg-red-50'
      case 'ALTA': return 'text-orange-600 bg-orange-50'
      case 'MEDIA': return 'text-yellow-600 bg-yellow-50'
      case 'BAJA': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADO': return 'text-green-600 bg-green-50'
      case 'EN_PROCESO': return 'text-blue-600 bg-blue-50'
      case 'EN_ESPERA': return 'text-yellow-600 bg-yellow-50'
      case 'PENDIENTE': return 'text-gray-600 bg-gray-50'
      case 'CANCELADO': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatEstado = (estado: string) => {
    return estado.replace(/_/g, ' ')
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Navbar activeTab="Tickets" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#1D1D1F]">Tickets de Mantenimiento</h1>
            <p className="text-sm text-[#86868B] mt-1">Gestiona y da seguimiento a todas las solicitudes de mantenimiento</p>
          </div>
          <button
            onClick={() => {
              setTicketSeleccionado(null)
              setMostrarModal(true)
            }}
            className="px-6 py-2.5 bg-[#0071E3] text-white text-sm font-medium rounded-full hover:bg-[#0077ED] transition-all"
          >
            + Nuevo Ticket
          </button>
        </div>

        {/* Alertas de tickets urgentes */}
        {estadisticas.urgentes > 0 && (
          <div className="mb-6 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#FF3B30] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-[#FF3B30]">
                  {estadisticas.urgentes} ticket(s) urgente(s) requieren atención inmediata
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-[#86868B]">Total</p>
            <p className="text-2xl font-semibold text-[#1D1D1F] mt-1">{estadisticas.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-[#86868B]">Pendientes</p>
            <p className="text-2xl font-semibold text-[#1D1D1F] mt-1">{estadisticas.pendientes}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-[#86868B]">En Proceso</p>
            <p className="text-2xl font-semibold text-[#1D1D1F] mt-1">{estadisticas.enProceso}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-[#86868B]">Completados</p>
            <p className="text-2xl font-semibold text-[#1D1D1F] mt-1">{estadisticas.completados}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-[#86868B]">Urgentes</p>
            <p className="text-2xl font-semibold text-[#FF3B30] mt-1">{estadisticas.urgentes}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-[#86868B]">Costo Total</p>
            <p className="text-2xl font-semibold text-[#1D1D1F] mt-1">
              ${estadisticas.costoTotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Número, título o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent text-sm"
              >
                <option value="">Todos</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="EN_ESPERA">En Espera</option>
                <option value="COMPLETADO">Completado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Prioridad</label>
              <select
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
                className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent text-sm"
              >
                <option value="">Todas</option>
                <option value="URGENTE">Urgente</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Categoría</label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent text-sm"
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

        {/* Tabla de tickets */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071E3] mx-auto"></div>
              <p className="text-sm text-[#86868B] mt-4">Cargando tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[#86868B]">No hay tickets registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F5F7] border-b border-[#D2D2D7]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">Ticket</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">Prioridad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">Espacio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">Asignado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">Costo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">Novedades</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#86868B] uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D2D2D7]">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-[#F5F5F7] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-[#0071E3]">{ticket.numeroTicket}</p>
                        <p className="text-xs text-[#86868B]">
                          {new Date(ticket.fechaCreacion).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[#1D1D1F] max-w-xs truncate">{ticket.titulo}</p>
                        <p className="text-xs text-[#86868B] max-w-xs truncate">{ticket.descripcion}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${getPrioridadColor(ticket.prioridad)}`}>
                          {ticket.prioridad}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${getEstadoColor(ticket.estado)}`}>
                          {formatEstado(ticket.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1D1D1F]">
                        {ticket.categoria.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1D1D1F]">
                        {ticket.espacio?.identificador || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1D1D1F]">
                        {ticket.asignadoA || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-[#1D1D1F]">
                          ${ticket.costoReal?.toLocaleString() || '0'}
                        </p>
                        {ticket.costoEstimado > 0 && (
                          <p className="text-xs text-[#86868B]">
                            Est: ${ticket.costoEstimado.toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1D1D1F]">
                        {ticket._count.novedades}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setTicketSeleccionado(ticket)
                            setMostrarDetalle(true)
                          }}
                          className="text-[#0071E3] hover:text-[#0077ED] font-medium mr-3"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
