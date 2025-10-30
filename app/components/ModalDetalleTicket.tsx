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

  const getTipoNovedadColor = (tipo: string) => {
    switch (tipo) {
      case 'SOLUCION': return 'text-green-600 bg-green-50'
      case 'PROBLEMA': return 'text-red-600 bg-red-50'
      case 'COSTO_ADICIONAL': return 'text-orange-600 bg-orange-50'
      case 'CAMBIO_ESTADO': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#D2D2D7] px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-xl font-semibold text-[#1D1D1F]">{ticket.titulo}</h2>
            <p className="text-sm text-[#86868B] mt-1">{ticket.numeroTicket}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Badges de estado y prioridad */}
          <div className="flex gap-2 mb-6">
            <span className={`px-3 py-1 text-xs font-medium rounded-md ${getEstadoColor(ticket.estado)}`}>
              {ticket.estado.replace(/_/g, ' ')}
            </span>
            <span className={`px-3 py-1 text-xs font-medium rounded-md ${getPrioridadColor(ticket.prioridad)}`}>
              {ticket.prioridad}
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-md text-gray-600 bg-gray-50">
              {ticket.categoria.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Grid de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#86868B] mb-1">Descripción</label>
              <p className="text-sm text-[#1D1D1F]">{ticket.descripcion}</p>
            </div>

            {/* Espacio */}
            {ticket.espacio && (
              <div>
                <label className="block text-xs font-medium text-[#86868B] mb-1">Espacio</label>
                <p className="text-sm text-[#1D1D1F]">{ticket.espacio.identificador}</p>
              </div>
            )}

            {/* Asignado a */}
            {ticket.asignadoA && (
              <div>
                <label className="block text-xs font-medium text-[#86868B] mb-1">Asignado a</label>
                <p className="text-sm text-[#1D1D1F]">{ticket.asignadoA}</p>
              </div>
            )}

            {/* Proveedor */}
            {ticket.proveedor && (
              <div>
                <label className="block text-xs font-medium text-[#86868B] mb-1">Proveedor</label>
                <p className="text-sm text-[#1D1D1F]">{ticket.proveedor.nombre}</p>
              </div>
            )}

            {/* Fecha de creación */}
            <div>
              <label className="block text-xs font-medium text-[#86868B] mb-1">Fecha de Creación</label>
              <p className="text-sm text-[#1D1D1F]">
                {new Date(ticket.fechaCreacion).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Fecha de inicio */}
            {ticket.fechaInicio && (
              <div>
                <label className="block text-xs font-medium text-[#86868B] mb-1">Fecha de Inicio</label>
                <p className="text-sm text-[#1D1D1F]">
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
              <div>
                <label className="block text-xs font-medium text-[#86868B] mb-1">Fecha Estimada</label>
                <p className="text-sm text-[#1D1D1F]">
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
              <div>
                <label className="block text-xs font-medium text-[#86868B] mb-1">Fecha de Finalización</label>
                <p className="text-sm text-[#1D1D1F]">
                  {new Date(ticket.fechaCompletado).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {/* Costos */}
            <div>
              <label className="block text-xs font-medium text-[#86868B] mb-1">Costo Estimado</label>
              <p className="text-sm text-[#1D1D1F]">${ticket.costoEstimado.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#86868B] mb-1">Costo Real</label>
              <p className="text-sm font-semibold text-[#1D1D1F]">${ticket.costoReal.toLocaleString()}</p>
            </div>

            {/* Observaciones */}
            {ticket.observaciones && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#86868B] mb-1">Observaciones</label>
                <p className="text-sm text-[#1D1D1F]">{ticket.observaciones}</p>
              </div>
            )}
          </div>

          {/* Sección de novedades */}
          <div className="border-t border-[#D2D2D7] pt-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1D1D1F]">
                Novedades ({novedades.length})
              </h3>
              <button
                onClick={() => setMostrarFormNovedad(!mostrarFormNovedad)}
                className="px-4 py-2 bg-[#0071E3] text-white text-sm font-medium rounded-full hover:bg-[#0077ED] transition-all"
              >
                + Agregar Novedad
              </button>
            </div>

            {/* Formulario para agregar novedad */}
            {mostrarFormNovedad && (
              <form onSubmit={handleSubmitNovedad} className="bg-[#F5F5F7] rounded-xl p-4 mb-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Tipo</label>
                      <select
                        value={formNovedad.tipo}
                        onChange={(e) => setFormNovedad({ ...formNovedad, tipo: e.target.value })}
                        className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
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
                      <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Costo Asociado</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formNovedad.costoAsociado}
                        onChange={(e) => setFormNovedad({ ...formNovedad, costoAsociado: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Descripción</label>
                    <textarea
                      required
                      value={formNovedad.descripcion}
                      onChange={(e) => setFormNovedad({ ...formNovedad, descripcion: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white resize-none"
                      placeholder="Describe la novedad..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Registrado por</label>
                    <input
                      type="text"
                      value={formNovedad.registradoPor}
                      onChange={(e) => setFormNovedad({ ...formNovedad, registradoPor: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setMostrarFormNovedad(false)}
                      className="px-4 py-2 border border-[#D2D2D7] text-[#1D1D1F] text-sm font-medium rounded-full hover:bg-white transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-[#0071E3] text-white text-sm font-medium rounded-full hover:bg-[#0077ED] transition-all disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Guardar Novedad'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Lista de novedades */}
            <div className="space-y-3">
              {loadingNovedades ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0071E3] mx-auto"></div>
                </div>
              ) : novedades.length === 0 ? (
                <p className="text-sm text-[#86868B] text-center py-8">No hay novedades registradas</p>
              ) : (
                novedades.map((novedad) => (
                  <div key={novedad.id} className="bg-[#F5F5F7] rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-md ${getTipoNovedadColor(novedad.tipo)}`}>
                        {novedad.tipo.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-[#86868B]">
                        {new Date(novedad.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-[#1D1D1F] mb-2">{novedad.descripcion}</p>
                    <div className="flex justify-between items-center text-xs">
                      {novedad.registradoPor && (
                        <span className="text-[#86868B]">Por: {novedad.registradoPor}</span>
                      )}
                      {novedad.costoAsociado > 0 && (
                        <span className="font-medium text-[#FF3B30]">
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
        <div className="sticky bottom-0 bg-white border-t border-[#D2D2D7] px-6 py-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 bg-[#0071E3] text-white text-sm font-medium rounded-full hover:bg-[#0077ED] transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
