'use client'

import { useState, useEffect } from 'react'

type Ticket = {
  id: string
  numeroTicket: string
  titulo: string
  descripcion: string
  prioridad: string
  categoria: string
  estado: string
  fechaCreacion: string
  fechaInicio: string | null
  fechaEstimada: string | null
  fechaCompletado: string | null
  costoEstimado: number
  costoReal: number
  espacioId: string | null
  proveedorId: string | null
  asignadoA: string | null
  observaciones: string | null
  espacio?: { identificador: string }
  proveedor?: { nombre: string }
}

type Novedad = {
  id: string
  descripcion: string
  tipo: string
  costoAsociado: number
  registradoPor: string | null
  createdAt: string
}

type ModalDetalleTicketProps = {
  ticket: Ticket
  onClose: () => void
  onActualizar: () => void
}

export default function ModalDetalleTicket({ ticket, onClose, onActualizar }: ModalDetalleTicketProps) {
  const [novedades, setNovedades] = useState<Novedad[]>([])
  const [mostrarFormNovedad, setMostrarFormNovedad] = useState(false)
  const [loadingNovedades, setLoadingNovedades] = useState(true)
  const [loading, setLoading] = useState(false)

  const [formNovedad, setFormNovedad] = useState({
    descripcion: '',
    tipo: 'ACTUALIZACION',
    costoAsociado: 0,
    registradoPor: '',
  })

  useEffect(() => {
    cargarNovedades()
  }, [])

  const cargarNovedades = async () => {
    try {
      const res = await fetch(`/api/mantenimiento/tickets/${ticket.id}/novedades`)
      const data = await res.json()
      setNovedades(data)
    } catch (error) {
      console.error('Error al cargar novedades:', error)
    } finally {
      setLoadingNovedades(false)
    }
  }

  const handleSubmitNovedad = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/mantenimiento/tickets/${ticket.id}/novedades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formNovedad,
          costoAsociado: Number(formNovedad.costoAsociado),
        }),
      })

      if (res.ok) {
        setFormNovedad({
          descripcion: '',
          tipo: 'ACTUALIZACION',
          costoAsociado: 0,
          registradoPor: '',
        })
        setMostrarFormNovedad(false)
        cargarNovedades()
        onActualizar()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al registrar novedad:', error)
      alert('Error al registrar la novedad')
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

  const getTipoNovedadGradient = (tipo: string) => {
    switch (tipo) {
      case 'SOLUCION': return 'from-green-600 to-emerald-600'
      case 'PROBLEMA': return 'from-red-600 to-rose-600'
      case 'COSTO_ADICIONAL': return 'from-orange-600 to-amber-600'
      case 'CAMBIO_ESTADO': return 'from-blue-600 to-indigo-600'
      case 'ACTUALIZACION': return 'from-purple-600 to-indigo-600'
      default: return 'from-gray-600 to-gray-700'
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header con gradiente según estado */}
        <div className={`sticky top-0 bg-gradient-to-r ${getEstadoGradient(ticket.estado)} p-6 rounded-t-2xl shadow-lg z-10`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-white">{ticket.numeroTicket}</h2>
                <span className={`px-3 py-1 text-xs font-bold rounded-lg bg-gradient-to-r ${getPrioridadGradient(ticket.prioridad)} text-white shadow-md`}>
                  {ticket.prioridad}
                </span>
                <span className="px-3 py-1 text-xs font-bold rounded-lg bg-white/20 backdrop-blur-sm text-white">
                  {ticket.categoria.replace(/_/g, ' ')}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{ticket.titulo}</h3>
              <p className="text-white/80">{ticket.descripcion}</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 backdrop-blur-sm p-2 rounded-xl hover:bg-white/30 transition-all"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Grid de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Espacio */}
            {ticket.espacio && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-semibold text-indigo-900">Espacio</span>
                </div>
                <p className="text-lg font-bold text-indigo-700">{ticket.espacio.identificador}</p>
              </div>
            )}

            {/* Asignado a */}
            {ticket.asignadoA && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-semibold text-purple-900">Asignado a</span>
                </div>
                <p className="text-lg font-bold text-purple-700">{ticket.asignadoA}</p>
              </div>
            )}

            {/* Proveedor */}
            {ticket.proveedor && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-300">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-900">Proveedor</span>
                </div>
                <p className="text-lg font-bold text-gray-700">{ticket.proveedor.nombre}</p>
              </div>
            )}

            {/* Fecha de creación */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-300">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">Fecha de Creación</span>
              </div>
              <p className="text-lg font-bold text-gray-700">
                {new Date(ticket.fechaCreacion).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Fecha de inicio */}
            {ticket.fechaInicio && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-blue-900">Fecha de Inicio</span>
                </div>
                <p className="text-lg font-bold text-blue-700">
                  {new Date(ticket.fechaInicio).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {/* Fecha estimada */}
            {ticket.fechaEstimada && (
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-yellow-900">Fecha Estimada</span>
                </div>
                <p className="text-lg font-bold text-yellow-700">
                  {new Date(ticket.fechaEstimada).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {/* Fecha de completado */}
            {ticket.fechaCompletado && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-green-900">Fecha de Finalización</span>
                </div>
                <p className="text-lg font-bold text-green-700">
                  {new Date(ticket.fechaCompletado).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {/* Costo Estimado */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold text-indigo-900">Costo Estimado</span>
              </div>
              <p className="text-2xl font-bold text-indigo-700">${ticket.costoEstimado.toLocaleString()}</p>
            </div>

            {/* Costo Real */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-green-900">Costo Real</span>
              </div>
              <p className="text-2xl font-bold text-green-700">${ticket.costoReal.toLocaleString()}</p>
            </div>
          </div>

          {/* Observaciones */}
          {ticket.observaciones && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span className="text-sm font-semibold text-amber-900">Observaciones</span>
              </div>
              <p className="text-sm text-amber-900">{ticket.observaciones}</p>
            </div>
          )}

          {/* Sección de novedades */}
          <div className="border-t-2 border-gray-200 pt-6 mt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Novedades ({novedades.length})
              </h3>
              <button
                onClick={() => setMostrarFormNovedad(!mostrarFormNovedad)}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Novedad
              </button>
            </div>

            {/* Formulario para agregar novedad */}
            {mostrarFormNovedad && (
              <form onSubmit={handleSubmitNovedad} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border-2 border-gray-200 shadow-md">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Nueva Novedad</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Tipo</label>
                      <select
                        value={formNovedad.tipo}
                        onChange={(e) => setFormNovedad({ ...formNovedad, tipo: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all"
                      >
                        <option value="ACTUALIZACION">Actualización</option>
                        <option value="CAMBIO_ESTADO">Cambio de Estado</option>
                        <option value="COSTO_ADICIONAL">Costo Adicional</option>
                        <option value="PROBLEMA">Problema</option>
                        <option value="SOLUCION">Solución</option>
                        <option value="NOTA">Nota</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Costo Asociado</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formNovedad.costoAsociado}
                        onChange={(e) => setFormNovedad({ ...formNovedad, costoAsociado: Number(e.target.value) })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Descripción</label>
                    <textarea
                      required
                      value={formNovedad.descripcion}
                      onChange={(e) => setFormNovedad({ ...formNovedad, descripcion: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white resize-none transition-all"
                      placeholder="Describe la novedad..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Registrado por</label>
                    <input
                      type="text"
                      value={formNovedad.registradoPor}
                      onChange={(e) => setFormNovedad({ ...formNovedad, registradoPor: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setMostrarFormNovedad(false)}
                      className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Guardar Novedad'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Lista de novedades */}
            <div className="space-y-4">
              {loadingNovedades ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Cargando novedades...</p>
                </div>
              ) : novedades.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">No hay novedades registradas</p>
                  <p className="text-sm text-gray-400 mt-1">Agrega la primera novedad para dar seguimiento al ticket</p>
                </div>
              ) : (
                novedades.map((novedad) => (
                  <div key={novedad.id} className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r ${getTipoNovedadGradient(novedad.tipo)} text-white shadow-md`}>
                        {novedad.tipo.replace(/_/g, ' ')}
                      </span>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">
                          {new Date(novedad.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-xs text-gray-500 block">
                          {new Date(novedad.createdAt).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-base text-gray-900 mb-3 leading-relaxed">{novedad.descripcion}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      {novedad.registradoPor && (
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {novedad.registradoPor}
                        </span>
                      )}
                      {novedad.costoAsociado > 0 && (
                        <span className="text-base font-bold text-red-600 flex items-center gap-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          +${novedad.costoAsociado.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-300 px-6 py-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
