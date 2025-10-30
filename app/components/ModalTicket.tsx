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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#D2D2D7] px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-semibold text-[#1D1D1F]">
            {ticket ? 'Editar Ticket' : 'Nuevo Ticket de Mantenimiento'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              placeholder="Ej: Reparar fuga en baño"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent resize-none"
              placeholder="Describe el problema o trabajo a realizar..."
            />
          </div>

          {/* Grid de 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Prioridad</label>
              <select
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
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

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="EN_ESPERA">En Espera</option>
                <option value="COMPLETADO">Completado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            {/* Espacio */}
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Espacio</label>
              <select
                value={formData.espacioId}
                onChange={(e) => setFormData({ ...formData, espacioId: e.target.value })}
                className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              >
                <option value="">Sin espacio asignado</option>
                {espacios.map((espacio) => (
                  <option key={espacio.id} value={espacio.id}>
                    {espacio.identificador}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha de Inicio */}
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Fecha de Inicio</label>
              <input
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              />
            </div>

            {/* Fecha Estimada */}
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Fecha Estimada de Finalización</label>
              <input
                type="date"
                value={formData.fechaEstimada}
                onChange={(e) => setFormData({ ...formData, fechaEstimada: e.target.value })}
                className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              />
            </div>

            {/* Costo Estimado */}
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Costo Estimado</label>
              <input
                type="number"
                step="0.01"
                value={formData.costoEstimado}
                onChange={(e) => setFormData({ ...formData, costoEstimado: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Proveedor de Servicio</label>
              <select
                value={formData.proveedorId}
                onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}
                className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
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

          {/* Asignado a */}
          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Asignado a</label>
            <input
              type="text"
              value={formData.asignadoA}
              onChange={(e) => setFormData({ ...formData, asignadoA: e.target.value })}
              className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              placeholder="Nombre del técnico o persona asignada"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent resize-none"
              placeholder="Notas adicionales..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#D2D2D7]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-[#D2D2D7] text-[#1D1D1F] text-sm font-medium rounded-full hover:bg-[#F5F5F7] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#0071E3] text-white text-sm font-medium rounded-full hover:bg-[#0077ED] transition-all disabled:opacity-50"
            >
              {loading ? 'Guardando...' : ticket ? 'Actualizar' : 'Crear Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
