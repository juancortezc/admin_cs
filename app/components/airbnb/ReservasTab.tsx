/**
 * Tab de Reservas Airbnb
 * Gestión completa de reservas con filtros y estadísticas
 */

'use client'

import { useEffect, useState } from 'react'
import ModalNuevaReserva from './ModalNuevaReserva'
import ModalEditarReserva from './ModalEditarReserva'

type Reserva = {
  id: string
  codigoReserva: string
  espacioId: string
  huespedId: string
  checkIn: string
  checkOut: string
  noches: number
  numHuespedes: number
  canalReserva: string
  codigoConfirmacion: string | null
  precioTotal: number
  precioPorNoche: number
  precioLimpieza: number
  estadoReserva: string
  estadoPago: string
  montoPagado: number
  balancePendiente: number
  notasReserva: string | null
  observaciones: string | null
  espacio: {
    nombre: string
  }
  huesped: {
    nombre: string
  }
  _count?: {
    abonos: number
  }
}

export default function ReservasTab() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroEstadoPago, setFiltroEstadoPago] = useState('todos')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [reservaEditando, setReservaEditando] = useState<Reserva | null>(null)

  useEffect(() => {
    cargarReservas()
  }, [filtroEstado, filtroEstadoPago])

  const cargarReservas = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filtroEstado !== 'todos') params.append('estadoReserva', filtroEstado)
    if (filtroEstadoPago !== 'todos') params.append('estadoPago', filtroEstadoPago)

    fetch(`/api/airbnb/reservas?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setReservas(data.reservas || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error:', error)
        setLoading(false)
      })
  }

  const getEstadoColor = (estado: string) => {
    const colores: any = {
      PENDIENTE: 'bg-gray-100 text-gray-700 border-gray-300',
      CONFIRMADA: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-300',
      EN_CURSO: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300',
      COMPLETADA: 'bg-gray-100 text-gray-600 border-gray-200',
      CANCELADA: 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-300',
    }
    return colores[estado] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getEstadoPagoColor = (estado: string) => {
    const colores: any = {
      PENDIENTE: 'text-red-600 font-bold',
      PARCIAL: 'text-orange-600 font-bold',
      PAGADO: 'text-green-600 font-bold',
      REEMBOLSADO: 'text-gray-500 font-semibold',
    }
    return colores[estado] || 'text-gray-700'
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header con filtros - Material Design 3 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reservas</h2>
            <p className="text-sm text-gray-600 mt-1">{reservas.length} reservas</p>
          </div>
          <button
            onClick={() => setMostrarModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Reserva
          </button>
        </div>

        {/* Filtros - Material Design 3 */}
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Estado de reserva</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 font-medium"
            >
              <option value="todos">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="EN_CURSO">En curso</option>
              <option value="COMPLETADA">Completada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Estado de pago</label>
            <select
              value={filtroEstadoPago}
              onChange={(e) => setFiltroEstadoPago(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 font-medium"
            >
              <option value="todos">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PARCIAL">Parcial</option>
              <option value="PAGADO">Pagado</option>
              <option value="REEMBOLSADO">Reembolsado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de reservas - Material Design 3 Cards */}
      <div className="space-y-4">
        {reservas.map((reserva) => (
          <div
            key={reserva.id}
            className="card-elevated bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{reserva.codigoReserva}</h3>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${getEstadoColor(
                      reserva.estadoReserva
                    )}`}
                  >
                    {reserva.estadoReserva.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {reserva.espacio.nombre}
                  </div>
                  <div className="text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {reserva.huesped.nombre}
                  </div>
                  {reserva.codigoConfirmacion && (
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      Código: {reserva.codigoConfirmacion}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  ${reserva.precioTotal.toFixed(2)}
                </div>
                <div className={`text-sm ${getEstadoPagoColor(reserva.estadoPago)}`}>
                  {reserva.estadoPago}
                </div>
                {reserva.balancePendiente > 0 && (
                  <div className="text-xs text-red-600 font-bold mt-2 px-2 py-1 bg-red-50 rounded-lg">
                    Pendiente: ${reserva.balancePendiente.toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 border-t-2 border-gray-100 pt-4 mb-4">
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="text-xs text-green-700 font-semibold mb-1">Check-in</div>
                <div className="text-sm font-bold text-gray-900">
                  {formatearFecha(reserva.checkIn)}
                </div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <div className="text-xs text-blue-700 font-semibold mb-1">Check-out</div>
                <div className="text-sm font-bold text-gray-900">
                  {formatearFecha(reserva.checkOut)}
                </div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <div className="text-xs text-purple-700 font-semibold mb-1">Noches</div>
                <div className="text-xl font-bold text-gray-900">{reserva.noches}</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
                <div className="text-xs text-indigo-700 font-semibold mb-1">Huéspedes</div>
                <div className="text-xl font-bold text-gray-900">{reserva.numHuespedes}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
              <div className="flex gap-2 text-xs">
                <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg font-semibold">
                  {reserva.canalReserva}
                </span>
                {reserva._count && reserva._count.abonos > 0 && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 rounded-lg font-semibold">
                    {reserva._count.abonos} abono(s)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-gray-700 px-3 py-1.5 bg-green-50 rounded-lg">
                  Pagado: ${reserva.montoPagado.toFixed(2)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReservaEditando(reserva)}
                    className="p-2.5 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all"
                    title="Editar reserva"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`¿Eliminar la reserva ${reserva.codigoReserva}?`)) {
                        try {
                          const res = await fetch(`/api/airbnb/reservas/${reserva.id}`, {
                            method: 'DELETE',
                          })
                          if (res.ok) {
                            cargarReservas()
                          } else {
                            const error = await res.json()
                            alert(error.error || 'Error al eliminar')
                          }
                        } catch (error) {
                          console.error('Error:', error)
                          alert('Error al eliminar la reserva')
                        }
                      }
                    }}
                    className="p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-all"
                    title="Eliminar reserva"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje vacío - Material Design 3 */}
      {reservas.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No se encontraron reservas</h3>
          <p className="text-sm text-gray-600">
            {filtroEstado !== 'todos' || filtroEstadoPago !== 'todos'
              ? 'Intenta ajustar los filtros'
              : 'Comienza agregando tu primera reserva'}
          </p>
        </div>
      )}

      {/* Modal Nueva Reserva */}
      {mostrarModal && (
        <ModalNuevaReserva
          onClose={() => setMostrarModal(false)}
          onGuardar={() => {
            setMostrarModal(false)
            cargarReservas()
          }}
        />
      )}

      {/* Modal Editar Reserva */}
      {reservaEditando && (
        <ModalEditarReserva
          reserva={reservaEditando}
          onClose={() => setReservaEditando(null)}
          onGuardar={() => {
            setReservaEditando(null)
            cargarReservas()
          }}
        />
      )}
    </div>
  )
}
