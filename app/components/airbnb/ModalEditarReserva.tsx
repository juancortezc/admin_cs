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
}

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
}

type ModalEditarReservaProps = {
  reserva: Reserva
  onClose: () => void
  onGuardar: () => void
}

export default function ModalEditarReserva({ reserva, onClose, onGuardar }: ModalEditarReservaProps) {
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [huespedes, setHuespedes] = useState<Huesped[]>([])
  const [loading, setLoading] = useState(false)

  const formatDateForInput = (dateString: string) => {
    return dateString.split('T')[0]
  }

  const [formData, setFormData] = useState({
    espacioId: reserva.espacioId,
    huespedId: reserva.huespedId,
    checkIn: formatDateForInput(reserva.checkIn),
    checkOut: formatDateForInput(reserva.checkOut),
    numHuespedes: reserva.numHuespedes,
    canalReserva: reserva.canalReserva,
    codigoConfirmacion: reserva.codigoConfirmacion || '',
    precioPorNoche: reserva.precioPorNoche,
    precioLimpieza: reserva.precioLimpieza,
    precioTotal: reserva.precioTotal,
    estadoReserva: reserva.estadoReserva,
    montoPagado: reserva.montoPagado,
    notasReserva: reserva.notasReserva || '',
    observaciones: reserva.observaciones || '',
  })

  useEffect(() => {
    cargarEspacios()
    cargarHuespedes()
  }, [])

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
      console.error('Error al cargar huespedes:', error)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const noches = calcularNoches()

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
        precioLimpieza: formData.precioLimpieza,
        precioTotal: formData.precioTotal,
        estadoReserva: formData.estadoReserva,
        montoPagado: formData.montoPagado,
        notasReserva: formData.notasReserva || null,
        observaciones: formData.observaciones || null,
      }

      const res = await fetch(`/api/airbnb/reservas/${reserva.id}`, {
        method: 'PUT',
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
      console.error('Error al actualizar reserva:', error)
      alert('Error al actualizar la reserva')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-xl font-semibold text-white">Editar Reserva</h2>
            <p className="text-indigo-100 text-sm">{reserva.codigoReserva}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Espacio y Huesped */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Espacio <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.espacioId}
                onChange={(e) => setFormData({ ...formData, espacioId: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
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
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Huesped <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.huespedId}
                onChange={(e) => setFormData({ ...formData, huespedId: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
              >
                <option value="">Selecciona un huesped</option>
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
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Check-in <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Check-out <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
              />
            </div>
          </div>

          {/* Noches calculadas */}
          {calcularNoches() > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Noches calculadas:</span>
              <span className="text-lg font-bold text-indigo-600">{calcularNoches()}</span>
            </div>
          )}

          {/* Huespedes, Canal y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Num. Huespedes
              </label>
              <input
                type="number"
                min="1"
                value={formData.numHuespedes}
                onChange={(e) => setFormData({ ...formData, numHuespedes: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Canal
              </label>
              <select
                value={formData.canalReserva}
                onChange={(e) => setFormData({ ...formData, canalReserva: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
              >
                <option value="AIRBNB">Airbnb</option>
                <option value="BOOKING">Booking</option>
                <option value="DIRECTO">Directo</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Estado Reserva
              </label>
              <select
                value={formData.estadoReserva}
                onChange={(e) => setFormData({ ...formData, estadoReserva: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="EN_CURSO">En Curso</option>
                <option value="COMPLETADA">Completada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
          </div>

          {/* Codigo de confirmacion */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Codigo de Confirmacion
            </label>
            <input
              type="text"
              value={formData.codigoConfirmacion}
              onChange={(e) => setFormData({ ...formData, codigoConfirmacion: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
              placeholder="Ej: HM123456789"
            />
          </div>

          {/* Precios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Precio/Noche
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
                    precioTotal: noches * precioPorNoche + formData.precioLimpieza
                  })
                }}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Limpieza
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precioLimpieza}
                onChange={(e) => {
                  const precioLimpieza = Number(e.target.value)
                  const noches = calcularNoches()
                  setFormData({
                    ...formData,
                    precioLimpieza,
                    precioTotal: noches * formData.precioPorNoche + precioLimpieza
                  })
                }}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Precio Total
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precioTotal}
                onChange={(e) => setFormData({ ...formData, precioTotal: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 bg-indigo-50 font-bold"
              />
            </div>
          </div>

          {/* Monto Pagado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Monto Pagado
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.montoPagado}
                onChange={(e) => setFormData({ ...formData, montoPagado: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Balance Pendiente
              </label>
              <div className="px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 font-bold">
                ${(formData.precioTotal - formData.montoPagado).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Notas de la Reserva
              </label>
              <textarea
                value={formData.notasReserva}
                onChange={(e) => setFormData({ ...formData, notasReserva: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 resize-none"
                placeholder="Solicitudes especiales..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 resize-none"
                placeholder="Observaciones internas..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
