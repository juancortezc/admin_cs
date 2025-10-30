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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-semibold text-zinc-900">
            {item ? 'Editar Item' : 'Nuevo Item'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
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
              <label className="block text-sm font-medium text-zinc-900 mb-2">Unidad de Medida</label>
              <input
                type="text"
                value={formData.unidadMedida}
                onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                placeholder="Ej: unidad, caja, litro"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">Stock Mínimo</label>
              <input
                type="number"
                min="0"
                value={formData.stockMinimo}
                onChange={(e) => setFormData({ ...formData, stockMinimo: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">Costo Unitario</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.costoUnitario}
                onChange={(e) => setFormData({ ...formData, costoUnitario: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">Proveedor</label>
            <input
              type="text"
              value={formData.proveedor}
              onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              placeholder="Nombre del proveedor"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-zinc-300 text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0051D5] disabled:opacity-50"
            >
              {loading ? 'Guardando...' : item ? 'Actualizar' : 'Crear Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
