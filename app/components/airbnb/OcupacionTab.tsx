/**
 * Tab de Ocupación de Airbnb - Vista de estado de espacios
 * Muestra todos los espacios con su estado de ocupación actual
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type EstadoEspacio = 'DISPONIBLE' | 'OCUPADO' | 'PROXIMA_RESERVA'

type EspacioConOcupacion = {
  id: string
  nombre: string
  capacidad: number
  reservaActual?: {
    id: string
    codigoReserva: string
    huesped: {
      nombre: string
    }
    checkIn: string
    checkOut: string
    precioTotal: number
    estadoReserva: string
  }
  proximaReserva?: {
    id: string
    codigoReserva: string
    checkIn: string
    checkOut: string
  }
  cobroPendiente?: {
    id: string
    codigoInterno: string
    montoPactado: number
    montoPagado: number
    estado: string
  }
}

export default function OcupacionTab() {
  const [espacios, setEspacios] = useState<EspacioConOcupacion[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'TODOS' | EstadoEspacio>('TODOS')

  useEffect(() => {
    cargarOcupacion()
  }, [])

  const cargarOcupacion = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/airbnb/ocupacion')
      const data = await res.json()
      setEspacios(data.espacios || [])
    } catch (error) {
      console.error('Error al cargar ocupación:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoEspacio = (espacio: EspacioConOcupacion): EstadoEspacio => {
    if (espacio.reservaActual) {
      const checkOut = new Date(espacio.reservaActual.checkOut)
      const hoy = new Date()

      if (checkOut < hoy) {
        // Reserva expiró pero no se ha actualizado
        return 'DISPONIBLE'
      }

      return 'OCUPADO'
    }

    if (espacio.proximaReserva) {
      return 'PROXIMA_RESERVA'
    }

    return 'DISPONIBLE'
  }

  const espaciosFiltrados = espacios.filter((espacio) => {
    if (filtro === 'TODOS') return true
    return getEstadoEspacio(espacio) === filtro
  })

  const getEstadoColor = (estado: EstadoEspacio) => {
    switch (estado) {
      case 'OCUPADO':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'DISPONIBLE':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'PROXIMA_RESERVA':
        return 'bg-amber-100 text-amber-700 border-amber-200'
    }
  }

  const getEstadoLabel = (estado: EstadoEspacio) => {
    switch (estado) {
      case 'OCUPADO':
        return 'Ocupado'
      case 'DISPONIBLE':
        return 'Disponible'
      case 'PROXIMA_RESERVA':
        return 'Próxima reserva'
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Filtros */}
      <div className="mb-6">
        <div className="card-elevated bg-white rounded-2xl p-2 inline-flex gap-1">
          <button
            onClick={() => setFiltro('TODOS')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              filtro === 'TODOS'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Todos ({espacios.length})
          </button>
          <button
            onClick={() => setFiltro('OCUPADO')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              filtro === 'OCUPADO'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Ocupados ({espacios.filter((e) => getEstadoEspacio(e) === 'OCUPADO').length})
          </button>
          <button
            onClick={() => setFiltro('DISPONIBLE')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              filtro === 'DISPONIBLE'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Disponibles ({espacios.filter((e) => getEstadoEspacio(e) === 'DISPONIBLE').length})
          </button>
          <button
            onClick={() => setFiltro('PROXIMA_RESERVA')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              filtro === 'PROXIMA_RESERVA'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Próximas ({espacios.filter((e) => getEstadoEspacio(e) === 'PROXIMA_RESERVA').length})
          </button>
        </div>
      </div>

      {/* Grid de espacios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {espaciosFiltrados.map((espacio) => {
          const estado = getEstadoEspacio(espacio)

          return (
            <div key={espacio.id} className="card-elevated bg-white rounded-2xl overflow-hidden">
              {/* Header con estado */}
              <div className={`p-4 border-b-2 ${getEstadoColor(estado)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{espacio.nombre}</h3>
                    <p className="text-sm opacity-80">Capacidad: {espacio.capacidad} personas</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getEstadoColor(estado)}`}>
                    {getEstadoLabel(estado)}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4">
                {estado === 'OCUPADO' && espacio.reservaActual && (
                  <div className="space-y-3">
                    {/* Huésped */}
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">HUÉSPED</p>
                      <p className="text-gray-900 font-semibold">{espacio.reservaActual.huesped.nombre}</p>
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">CHECK-IN</p>
                        <p className="text-sm text-gray-900 font-medium">
                          {formatFecha(espacio.reservaActual.checkIn)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">CHECK-OUT</p>
                        <p className="text-sm text-gray-900 font-medium">
                          {formatFecha(espacio.reservaActual.checkOut)}
                        </p>
                      </div>
                    </div>

                    {/* Cobro */}
                    {espacio.cobroPendiente && (
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs text-gray-500 font-medium">CUENTA POR COBRAR</p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              espacio.cobroPendiente.estado === 'PAGADO'
                                ? 'bg-green-100 text-green-700'
                                : espacio.cobroPendiente.estado === 'PARCIAL'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {espacio.cobroPendiente.estado}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          ${espacio.cobroPendiente.montoPactado.toLocaleString()}
                        </p>
                        {espacio.cobroPendiente.montoPagado > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Abonado: ${espacio.cobroPendiente.montoPagado.toLocaleString()}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{espacio.cobroPendiente.codigoInterno}</p>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-2 mt-4">
                      <Link
                        href={`/airbnb/reservas/${espacio.reservaActual.id}`}
                        className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-semibold text-sm hover:bg-indigo-100 transition-colors text-center"
                      >
                        Ver reserva
                      </Link>
                      {espacio.cobroPendiente && espacio.cobroPendiente.estado !== 'PAGADO' && (
                        <Link
                          href={`/cobros/${espacio.cobroPendiente.id}`}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all text-center"
                        >
                          Registrar pago
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {estado === 'DISPONIBLE' && (
                  <div className="text-center py-8">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-500 font-medium">Espacio disponible</p>
                    <p className="text-sm text-gray-400 mt-1">Sin reservas activas</p>
                  </div>
                )}

                {estado === 'PROXIMA_RESERVA' && espacio.proximaReserva && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">PRÓXIMA RESERVA</p>
                      <p className="text-gray-900 font-semibold">{espacio.proximaReserva.codigoReserva}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">CHECK-IN</p>
                        <p className="text-sm text-gray-900 font-medium">
                          {formatFecha(espacio.proximaReserva.checkIn)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">CHECK-OUT</p>
                        <p className="text-sm text-gray-900 font-medium">
                          {formatFecha(espacio.proximaReserva.checkOut)}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/airbnb/reservas/${espacio.proximaReserva.id}`}
                      className="block w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-semibold text-sm hover:bg-indigo-100 transition-colors text-center mt-4"
                    >
                      Ver detalles
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {espaciosFiltrados.length === 0 && (
        <div className="text-center py-20">
          <svg
            className="w-24 h-24 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-gray-500 font-semibold text-lg">No hay espacios con este estado</p>
          <p className="text-gray-400 text-sm mt-1">Prueba con otro filtro</p>
        </div>
      )}
    </div>
  )
}
