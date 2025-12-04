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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                {item ? 'Editar Item' : 'Nuevo Item'}
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
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Ej: Jabón líquido para manos"
              />
            </div>

            {/* Categoría y Unidad */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Unidad</label>
                <input
                  type="text"
                  value={formData.unidadMedida}
                  onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Ej: unidad, caja"
                />
              </div>
            </div>

            {/* Stock Mínimo y Costo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Stock Mínimo</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stockMinimo}
                  onChange={(e) => setFormData({ ...formData, stockMinimo: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Costo Unitario</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-500 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costoUnitario}
                    onChange={(e) => setFormData({ ...formData, costoUnitario: Number(e.target.value) })}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">Proveedor</label>
              <input
                type="text"
                value={formData.proveedor}
                onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Nombre del proveedor (opcional)"
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
                  item ? 'Actualizar' : 'Crear Item'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
