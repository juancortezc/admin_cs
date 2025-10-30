'use client'

import { useState, useEffect } from 'react'

type Espacio = {
  id: string
  nombre: string
  precioBaseNoche: number
}

type Huesped = {
  id: string
  nombre: string
  email: string
}

type ModalNuevaReservaProps = {
  onClose: () => void
  onGuardar: () => void
}

export default function ModalNuevaReserva({ onClose, onGuardar }: ModalNuevaReservaProps) {
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [huespedes, setHuespedes] = useState<Huesped[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    espacioId: '',
    huespedId: '',
    checkIn: '',
    checkOut: '',
    numHuespedes: 1,
    canalReserva: 'AIRBNB',
    codigoConfirmacion: '',
    precioPorNoche: 0,
    precioTotal: 0,
    notas: '',
  })

  useEffect(() => {
    cargarEspacios()
    cargarHuespedes()
  }, [])

  useEffect(() => {
    // Calcular noches y precio total cuando cambian las fechas o el espacio
    if (formData.checkIn && formData.checkOut && formData.espacioId) {
      const checkIn = new Date(formData.checkIn)
      const checkOut = new Date(formData.checkOut)
      const noches = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

      if (noches > 0) {
        const espacio = espacios.find(e => e.id === formData.espacioId)
        const precioPorNoche = formData.precioPorNoche || espacio?.precioBaseNoche || 0
        const precioTotal = noches * precioPorNoche

        setFormData(prev => ({
          ...prev,
          precioPorNoche,
          precioTotal,
        }))
      }
    }
  }, [formData.checkIn, formData.checkOut, formData.espacioId, espacios])

  const cargarEspacios = async () => {
    try {
      const res = await fetch('/api/airbnb/espacios')
      const data = await res.json()
      setEspacios(data || [])
    } catch (error) {
      console.error('Error al cargar espacios:', error)
    }
  }

  const cargarHuespedes = async () => {
    try {
      const res = await fetch('/api/airbnb/huespedes')
      const data = await res.json()
      setHuespedes(data || [])
    } catch (error) {
      console.error('Error al cargar huéspedes:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const checkIn = new Date(formData.checkIn)
      const checkOut = new Date(formData.checkOut)
      const noches = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

      const payload = {
        espacioId: formData.espacioId,
        huespedId: formData.huespedId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        noches,
        numHuespedes: formData.numHuespedes,
        canalReserva: formData.canalReserva,
        codigoConfirmacion: formData.codigoConfirmacion || null,
        precioPorNoche: formData.precioPorNoche,
        precioTotal: formData.precioTotal,
        notasReserva: formData.notas || null,
      }

      const res = await fetch('/api/airbnb/reservas', {
        method: 'POST',
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
      console.error('Error al crear reserva:', error)
      alert('Error al crear la reserva')
    } finally {
      setLoading(false)
    }
  }

  const calcularNoches = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn)
      const checkOut = new Date(formData.checkOut)
      const noches = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      return noches > 0 ? noches : 0
    }
    return 0
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-semibold text-zinc-900">Nueva Reserva</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Espacio y Huésped */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Espacio <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.espacioId}
                onChange={(e) => setFormData({ ...formData, espacioId: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              >
                <option value="">Selecciona un espacio</option>
                {espacios.map((espacio) => (
                  <option key={espacio.id} value={espacio.id}>
                    {espacio.nombre} (${espacio.precioBaseNoche}/noche)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Huésped <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.huespedId}
                onChange={(e) => setFormData({ ...formData, huespedId: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              >
                <option value="">Selecciona un huésped</option>
                {huespedes.map((huesped) => (
                  <option key={huesped.id} value={huesped.id}>
                    {huesped.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Check-in <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Check-out <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Noches calculadas */}
          {calcularNoches() > 0 && (
            <div className="bg-zinc-50 rounded-lg p-3">
              <p className="text-sm text-zinc-600">
                <span className="font-medium text-zinc-900">{calcularNoches()}</span> noche(s)
              </p>
            </div>
          )}

          {/* Número de huéspedes y Canal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Número de Huéspedes
              </label>
              <input
                type="number"
                min="1"
                value={formData.numHuespedes}
                onChange={(e) => setFormData({ ...formData, numHuespedes: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Canal de Reserva
              </label>
              <select
                value={formData.canalReserva}
                onChange={(e) => setFormData({ ...formData, canalReserva: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              >
                <option value="AIRBNB">Airbnb</option>
                <option value="BOOKING">Booking</option>
                <option value="DIRECTO">Directo</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
          </div>

          {/* Código de confirmación */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Código de Confirmación
            </label>
            <input
              type="text"
              value={formData.codigoConfirmacion}
              onChange={(e) => setFormData({ ...formData, codigoConfirmacion: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              placeholder="Ej: HM123456789"
            />
          </div>

          {/* Precios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Precio por Noche
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precioPorNoche}
                onChange={(e) => {
                  const precioPorNoche = Number(e.target.value)
                  const noches = calcularNoches()
                  setFormData({
                    ...formData,
                    precioPorNoche,
                    precioTotal: noches * precioPorNoche
                  })
                }}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Precio Total
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precioTotal}
                onChange={(e) => setFormData({ ...formData, precioTotal: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-zinc-50"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Notas de la Reserva
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent resize-none"
              placeholder="Solicitudes especiales, alergias, etc..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-zinc-300 text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0051D5] transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
