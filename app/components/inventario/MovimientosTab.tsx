'use client'

import { useState, useEffect } from 'react'

type Item = {
  id: string
  codigo: string
  nombre: string
  stockActual: number
  unidadMedida: string
  costoUnitario: number
}

type Espacio = {
  id: string
  identificador: string
}

export default function MovimientosTab() {
  const [items, setItems] = useState<Item[]>([])
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    itemId: '',
    tipoMovimiento: 'ENTRADA',
    cantidad: 0,
    costoUnitario: 0,
    motivo: '',
    personaRecibe: '',
    espacioId: '',
  })

  useEffect(() => {
    cargarItems()
    cargarEspacios()
  }, [])

  const cargarItems = async () => {
    try {
      const res = await fetch('/api/inventario/items')
      const data = await res.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Error al cargar items:', error)
    }
  }

  const cargarEspacios = async () => {
    try {
      const res = await fetch('/api/espacios')
      const data = await res.json()
      setEspacios(data || [])
    } catch (error) {
      console.error('Error al cargar espacios:', error)
    }
  }

  const handleItemChange = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    setFormData({
      ...formData,
      itemId,
      costoUnitario: item?.costoUnitario || 0
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        itemId: formData.itemId,
        tipoMovimiento: formData.tipoMovimiento,
        cantidad: formData.cantidad,
        costoUnitario: formData.costoUnitario,
        motivo: formData.motivo || null,
        personaRecibe: formData.personaRecibe || null,
        espacioId: formData.espacioId || null,
      }

      const res = await fetch('/api/inventario/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        alert('Movimiento registrado exitosamente')
        // Reset form
        setFormData({
          itemId: '',
          tipoMovimiento: 'ENTRADA',
          cantidad: 0,
          costoUnitario: 0,
          motivo: '',
          personaRecibe: '',
          espacioId: '',
        })
        cargarItems() // Reload items to update stock
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al registrar movimiento')
    } finally {
      setLoading(false)
    }
  }

  const itemSeleccionado = items.find(i => i.id === formData.itemId)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900">Registrar Movimiento</h2>
        <p className="text-sm text-zinc-600 mt-1">
          Registra entradas, salidas y ajustes de inventario
        </p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de movimiento */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Tipo de Movimiento <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'ENTRADA', label: 'Entrada', icon: '📥', desc: 'Compra o devolución' },
                { value: 'SALIDA', label: 'Salida', icon: '📤', desc: 'Consumo o entrega' },
                { value: 'AJUSTE_POSITIVO', label: 'Ajuste +', icon: '➕', desc: 'Corrección positiva' },
                { value: 'AJUSTE_NEGATIVO', label: 'Ajuste -', icon: '➖', desc: 'Corrección negativa' },
              ].map((tipo) => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, tipoMovimiento: tipo.value })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.tipoMovimiento === tipo.value
                      ? 'border-[#007AFF] bg-[#007AFF]/5'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{tipo.icon}</div>
                  <div className="text-sm font-medium text-zinc-900">{tipo.label}</div>
                  <div className="text-xs text-zinc-500">{tipo.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Item */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Item <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.itemId}
              onChange={(e) => handleItemChange(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
            >
              <option value="">Selecciona un item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.codigo} - {item.nombre} (Stock: {item.stockActual} {item.unidadMedida})
                </option>
              ))}
            </select>

            {/* Info del item seleccionado */}
            {itemSeleccionado && (
              <div className="mt-3 p-3 bg-zinc-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500 text-xs">Stock Actual</p>
                    <p className="font-medium text-zinc-900">{itemSeleccionado.stockActual} {itemSeleccionado.unidadMedida}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Costo Unitario</p>
                    <p className="font-medium text-zinc-900">${itemSeleccionado.costoUnitario.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Nuevo Stock</p>
                    <p className="font-medium text-[#007AFF]">
                      {formData.tipoMovimiento === 'ENTRADA' || formData.tipoMovimiento === 'AJUSTE_POSITIVO'
                        ? itemSeleccionado.stockActual + formData.cantidad
                        : itemSeleccionado.stockActual - formData.cantidad
                      } {itemSeleccionado.unidadMedida}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cantidad y Costo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Cantidad <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Costo Unitario
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costoUnitario}
                onChange={(e) => setFormData({ ...formData, costoUnitario: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Costo total */}
          {formData.cantidad > 0 && formData.costoUnitario > 0 && (
            <div className="bg-zinc-50 rounded-lg p-4">
              <p className="text-sm text-zinc-600">Costo Total del Movimiento</p>
              <p className="text-2xl font-semibold text-zinc-900">
                ${(formData.cantidad * formData.costoUnitario).toFixed(2)}
              </p>
            </div>
          )}

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Motivo / Descripción
            </label>
            <textarea
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent resize-none"
              placeholder="Ej: Compra mensual, consumo habitación 201, ajuste por inventario físico..."
            />
          </div>

          {/* Campos adicionales para salidas */}
          {(formData.tipoMovimiento === 'SALIDA') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">
                  Persona que Recibe
                </label>
                <input
                  type="text"
                  value={formData.personaRecibe}
                  onChange={(e) => setFormData({ ...formData, personaRecibe: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                  placeholder="Nombre de quien recibe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">
                  Espacio Relacionado
                </label>
                <select
                  value={formData.espacioId}
                  onChange={(e) => setFormData({ ...formData, espacioId: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                >
                  <option value="">Sin espacio</option>
                  {espacios.map((espacio) => (
                    <option key={espacio.id} value={espacio.id}>
                      {espacio.identificador}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  itemId: '',
                  tipoMovimiento: 'ENTRADA',
                  cantidad: 0,
                  costoUnitario: 0,
                  motivo: '',
                  personaRecibe: '',
                  espacioId: '',
                })
              }}
              className="px-6 py-2.5 border border-zinc-300 text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-50"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0051D5] disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
