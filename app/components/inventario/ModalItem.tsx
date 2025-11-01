'use client'

import { useState, useEffect } from 'react'

type Item = {
  id: string
  codigo: string
  nombre: string
  categoria: string
  unidadMedida: string
  stockActual: number
  stockMinimo: number
  proveedor: string | null
  costoUnitario: number
}

type ModalItemProps = {
  item: Item | null
  onClose: () => void
  onGuardar: () => void
}

export default function ModalItem({ item, onClose, onGuardar }: ModalItemProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'LIMPIEZA',
    unidadMedida: 'unidad',
    stockMinimo: 0,
    proveedor: '',
    costoUnitario: 0,
  })

  useEffect(() => {
    if (item) {
      setFormData({
        nombre: item.nombre,
        categoria: item.categoria,
        unidadMedida: item.unidadMedida,
        stockMinimo: item.stockMinimo,
        proveedor: item.proveedor || '',
        costoUnitario: item.costoUnitario,
      })
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = item ? `/api/inventario/items/${item.id}` : '/api/inventario/items'
      const method = item ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          proveedor: formData.proveedor || null,
        }),
      })

      if (res.ok) {
        onGuardar()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar el item')
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
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header con gradiente */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-2xl shadow-lg z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white">
                {item ? 'Editar Item' : 'Nuevo Item de Inventario'}
              </h2>
              <p className="text-white/80 mt-1">
                {item ? 'Actualiza la información del item' : 'Completa la información para crear el item'}
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

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Nombre del Item <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Ej: Jabón líquido para manos"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="LIMPIEZA">Limpieza</option>
                  <option value="AMENIDADES">Amenidades</option>
                  <option value="COCINA">Cocina</option>
                  <option value="BANO">Baño</option>
                  <option value="ELECTRODOMESTICOS">Electrodomésticos</option>
                  <option value="MUEBLES">Muebles</option>
                  <option value="DECORACION">Decoración</option>
                  <option value="MANTENIMIENTO">Mantenimiento</option>
                  <option value="OFICINA">Oficina</option>
                  <option value="OTROS">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Unidad de Medida</label>
                <input
                  type="text"
                  value={formData.unidadMedida}
                  onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Ej: unidad, caja, litro"
                />
              </div>
            </div>
          </div>

          {/* Stock y Costos */}
          <div className="space-y-4 pt-6 border-t-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Stock y Costos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Stock Mínimo</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stockMinimo}
                  onChange={(e) => setFormData({ ...formData, stockMinimo: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Cantidad mínima antes de alertar</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Costo Unitario</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costoUnitario}
                  onChange={(e) => setFormData({ ...formData, costoUnitario: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Precio de compra por unidad</p>
              </div>
            </div>
          </div>

          {/* Proveedor */}
          <div className="pt-6 border-t-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Proveedor
            </h3>
            <input
              type="text"
              value={formData.proveedor}
              onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Nombre del proveedor (opcional)"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg flex items-center gap-2"
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
                  {item ? 'Actualizar Item' : 'Crear Item'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
