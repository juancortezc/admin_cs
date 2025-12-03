/**
 * Modal para crear nuevo huésped de Airbnb
 */

'use client'

import { useState } from 'react'

type ModalNuevoHuespedProps = {
  onClose: () => void
  onGuardar: () => void
}

export default function ModalNuevoHuesped({ onClose, onGuardar }: ModalNuevoHuespedProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    whatsapp: '',
    pais: '',
    notas: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        nombre: formData.nombre,
        email: formData.email || null,
        telefono: formData.telefono || null,
        whatsapp: formData.whatsapp || null,
        pais: formData.pais || null,
        notas: formData.notas || null,
      }

      const res = await fetch('/api/airbnb/huespedes', {
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
      console.error('Error al crear huésped:', error)
      alert('Error al crear el huésped')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-semibold text-zinc-900">Nuevo Huésped</h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Juan Pérez"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="juan@ejemplo.com"
            />
          </div>

          {/* Teléfono y WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+52 123 456 7890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                WhatsApp
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+52 123 456 7890"
              />
            </div>
          </div>

          {/* País */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              País
            </label>
            <input
              type="text"
              value={formData.pais}
              onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="México"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Información adicional sobre el huésped..."
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
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Huésped'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
