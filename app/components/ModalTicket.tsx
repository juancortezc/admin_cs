/**
 * Modal de Ticket - Estilo Apple/Clean
 * Crear y editar tickets de mantenimiento
 */

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
  fechaInicio: string | null
  fechaEstimada: string | null
  costoEstimado: number
  espacioId: string | null
  proveedorId: string | null
  asignadoA: string | null
  observaciones: string | null
}

type Espacio = {
  id: string
  identificador: string
}

type Proveedor = {
  id: string
  nombre: string
}

type ModalTicketProps = {
  ticket: Ticket | null
  onClose: () => void
  onGuardar: () => void
}

export default function ModalTicket({ ticket, onClose, onGuardar }: ModalTicketProps) {
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'MEDIA',
    categoria: 'GENERAL',
    estado: 'PENDIENTE',
    fechaInicio: '',
    fechaEstimada: '',
    costoEstimado: 0,
    espacioId: '',
    proveedorId: '',
    asignadoA: '',
    observaciones: '',
  })

  useEffect(() => {
    cargarEspacios()
    cargarProveedores()

    if (ticket) {
      setFormData({
        titulo: ticket.titulo,
        descripcion: ticket.descripcion,
        prioridad: ticket.prioridad,
        categoria: ticket.categoria,
        estado: ticket.estado,
        fechaInicio: ticket.fechaInicio ? ticket.fechaInicio.split('T')[0] : '',
        fechaEstimada: ticket.fechaEstimada ? ticket.fechaEstimada.split('T')[0] : '',
        costoEstimado: ticket.costoEstimado,
        espacioId: ticket.espacioId || '',
        proveedorId: ticket.proveedorId || '',
        asignadoA: ticket.asignadoA || '',
        observaciones: ticket.observaciones || '',
      })
    }
  }, [ticket])

  const cargarEspacios = async () => {
    try {
      const res = await fetch('/api/espacios')
      const data = await res.json()
      setEspacios(data)
    } catch (error) {
      console.error('Error al cargar espacios:', error)
    }
  }

  const cargarProveedores = async () => {
    try {
      const res = await fetch('/api/servicios')
      const data = await res.json()
      setProveedores(data)
    } catch (error) {
      console.error('Error al cargar proveedores:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = ticket
        ? `/api/mantenimiento/tickets/${ticket.id}`
        : '/api/mantenimiento/tickets'

      const method = ticket ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        costoEstimado: Number(formData.costoEstimado),
        espacioId: formData.espacioId || null,
        proveedorId: formData.proveedorId || null,
        asignadoA: formData.asignadoA || null,
        observaciones: formData.observaciones || null,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        onGuardar()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al guardar ticket:', error)
      alert('Error al guardar el ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl pointer-events-auto animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                {ticket ? 'Editar Ticket' : 'Nuevo Ticket'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                disabled={loading}
              >
                <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Ej: Reparar fuga en baño"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                placeholder="Describe el problema o trabajo..."
              />
            </div>

            {/* Prioridad, Estado, Categoría */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Prioridad</label>
                <select
                  value={formData.prioridad}
                  onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="EN_ESPERA">En Espera</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="GENERAL">General</option>
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
                  <option value="OTROS">Otros</option>
                </select>
              </div>
            </div>

            {/* Espacio y Asignado */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Espacio</label>
                <select
                  value={formData.espacioId}
                  onChange={(e) => setFormData({ ...formData, espacioId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Sin espacio</option>
                  {espacios.map((espacio) => (
                    <option key={espacio.id} value={espacio.id}>
                      {espacio.identificador}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Asignado a</label>
                <input
                  type="text"
                  value={formData.asignadoA}
                  onChange={(e) => setFormData({ ...formData, asignadoA: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Nombre del técnico"
                />
              </div>
            </div>

            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">Proveedor de Servicio</label>
              <select
                value={formData.proveedorId}
                onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">Sin proveedor</option>
                {proveedores.map((proveedor) => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Fechas y Costo */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Fecha Inicio</label>
                <input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Fecha Estimada</label>
                <input
                  type="date"
                  value={formData.fechaEstimada}
                  onChange={(e) => setFormData({ ...formData, fechaEstimada: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Costo Estimado</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-500 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costoEstimado}
                    onChange={(e) => setFormData({ ...formData, costoEstimado: Number(e.target.value) })}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">Observaciones</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                placeholder="Notas adicionales..."
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2 border-t border-zinc-200 sticky bottom-0 bg-white pb-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-300 text-zinc-900 font-medium text-sm hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Guardando...
                  </>
                ) : (
                  ticket ? 'Actualizar' : 'Crear Ticket'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
