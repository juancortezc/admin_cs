/**
 * Tab de Reservas Airbnb
 * Gestión completa de reservas con filtros y estadísticas
 */

'use client'

import { useEffect, useState } from 'react'

type Reserva = {
  id: string
  codigoReserva: string
  checkIn: string
  checkOut: string
  noches: number
  numHuespedes: number
  canalReserva: string
  codigoConfirmacion: string | null
  precioTotal: number
  estadoReserva: string
  estadoPago: string
  montoPagado: number
  balancePendiente: number
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
      PENDIENTE: 'bg-zinc-100 text-zinc-700 border-zinc-200',
      CONFIRMADA: 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20',
      EN_CURSO: 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20',
      COMPLETADA: 'bg-zinc-100 text-zinc-600 border-zinc-200',
      CANCELADA: 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20',
    }
    return colores[estado] || 'bg-zinc-100 text-zinc-700'
  }

  const getEstadoPagoColor = (estado: string) => {
    const colores: any = {
      PENDIENTE: 'text-[#FF3B30]',
      PARCIAL: 'text-[#FF9500]',
      PAGADO: 'text-[#34C759]',
      REEMBOLSADO: 'text-zinc-500',
    }
    return colores[estado] || 'text-zinc-700'
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
        <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header con filtros */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Reservas</h2>
            <p className="text-sm text-zinc-600 mt-1">{reservas.length} reservas</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="text-xs text-zinc-600 mb-1 block">Estado de reserva</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
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
            <label className="text-xs text-zinc-600 mb-1 block">Estado de pago</label>
            <select
              value={filtroEstadoPago}
              onChange={(e) => setFiltroEstadoPago(e.target.value)}
              className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
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

      {/* Lista de reservas */}
      <div className="space-y-3">
        {reservas.map((reserva) => (
          <div
            key={reserva.id}
            className="bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-zinc-900">{reserva.codigoReserva}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-md border ${getEstadoColor(
                      reserva.estadoReserva
                    )}`}
                  >
                    {reserva.estadoReserva.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm text-zinc-600">
                  <div className="font-medium text-zinc-900">{reserva.espacio.nombre}</div>
                  <div>{reserva.huesped.nombre}</div>
                  {reserva.codigoConfirmacion && (
                    <div className="text-xs text-zinc-500 mt-1">
                      Código: {reserva.codigoConfirmacion}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-semibold text-zinc-900">
                  ${reserva.precioTotal.toFixed(2)}
                </div>
                <div className={`text-sm font-medium ${getEstadoPagoColor(reserva.estadoPago)}`}>
                  {reserva.estadoPago}
                </div>
                {reserva.balancePendiente > 0 && (
                  <div className="text-xs text-[#FF3B30] mt-1">
                    Pendiente: ${reserva.balancePendiente.toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 border-t border-zinc-100 pt-3">
              <div>
                <div className="text-xs text-zinc-500">Check-in</div>
                <div className="text-sm font-medium text-zinc-900">
                  {formatearFecha(reserva.checkIn)}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Check-out</div>
                <div className="text-sm font-medium text-zinc-900">
                  {formatearFecha(reserva.checkOut)}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Noches</div>
                <div className="text-sm font-medium text-zinc-900">{reserva.noches}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Huéspedes</div>
                <div className="text-sm font-medium text-zinc-900">{reserva.numHuespedes}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-zinc-100 text-zinc-700 rounded">
                  {reserva.canalReserva}
                </span>
                {reserva._count && reserva._count.abonos > 0 && (
                  <span className="px-2 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded">
                    {reserva._count.abonos} abono(s)
                  </span>
                )}
              </div>

              <div className="text-sm text-zinc-500">
                Pagado: ${reserva.montoPagado.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje vacío */}
      {reservas.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-zinc-200">
          <svg className="w-12 h-12 text-zinc-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-zinc-500">No se encontraron reservas con los filtros aplicados</p>
        </div>
      )}
    </div>
  )
}
