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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header con gradiente */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-2xl shadow-lg z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white">
                {ticket ? 'Editar Ticket' : 'Nuevo Ticket de Mantenimiento'}
              </h2>
              <p className="text-white/80 mt-1">
                {ticket ? 'Actualiza la información del ticket' : 'Completa la información para crear el ticket'}
              </p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Información Básica
            </h3>

            {/* Título */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Título <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Ej: Reparar fuga en baño"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Descripción <span className="text-red-600">*</span>
              </label>
              <textarea
                required
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                placeholder="Describe el problema o trabajo a realizar en detalle..."
              />
            </div>
          </div>

          {/* Clasificación */}
          <div className="space-y-4 pt-6 border-t-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Clasificación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Prioridad */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Prioridad</label>
                <select
                  value={formData.prioridad}
                  onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="EN_ESPERA">En Espera</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
          </div>

          {/* Ubicación y Asignación */}
          <div className="space-y-4 pt-6 border-t-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ubicación y Asignación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Espacio */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Espacio</label>
                <select
                  value={formData.espacioId}
                  onChange={(e) => setFormData({ ...formData, espacioId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Sin espacio asignado</option>
                  {espacios.map((espacio) => (
                    <option key={espacio.id} value={espacio.id}>
                      {espacio.identificador}
                    </option>
                  ))}
                </select>
              </div>

              {/* Asignado a */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Asignado a</label>
                <input
                  type="text"
                  value={formData.asignadoA}
                  onChange={(e) => setFormData({ ...formData, asignadoA: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Nombre del técnico o persona"
                />
              </div>

              {/* Proveedor */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Proveedor de Servicio</label>
                <select
                  value={formData.proveedorId}
                  onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Sin proveedor</option>
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Fechas y Costos */}
          <div className="space-y-4 pt-6 border-t-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Fechas y Costos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fecha de Inicio */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Fecha de Inicio</label>
                <input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Fecha Estimada */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Fecha Estimada</label>
                <input
                  type="date"
                  value={formData.fechaEstimada}
                  onChange={(e) => setFormData({ ...formData, fechaEstimada: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Costo Estimado */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Costo Estimado</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costoEstimado}
                  onChange={(e) => setFormData({ ...formData, costoEstimado: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="pt-6 border-t-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Observaciones
            </h3>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
              placeholder="Notas adicionales, comentarios especiales, requerimientos..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {ticket ? 'Actualizar Ticket' : 'Crear Ticket'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
