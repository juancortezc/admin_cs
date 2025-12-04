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
        setFormData({
          itemId: '',
          tipoMovimiento: 'ENTRADA',
          cantidad: 0,
          costoUnitario: 0,
          motivo: '',
          personaRecibe: '',
          espacioId: '',
        })
        cargarItems()
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

  const getTipoStyle = (tipo: string, isSelected: boolean) => {
    if (!isSelected) return 'bg-white border-zinc-200 hover:border-zinc-300'

    switch (tipo) {
      case 'ENTRADA': return 'bg-green-50 border-green-500 text-green-700'
      case 'SALIDA': return 'bg-red-50 border-red-500 text-red-700'
      case 'AJUSTE_POSITIVO': return 'bg-blue-50 border-blue-500 text-blue-700'
      case 'AJUSTE_NEGATIVO': return 'bg-orange-50 border-orange-500 text-orange-700'
      default: return 'bg-zinc-50 border-zinc-500'
    }
  }

  const itemSeleccionado = items.find(i => i.id === formData.itemId)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Registrar Movimiento</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Registra entradas, salidas y ajustes de inventario
        </p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de movimiento */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-3">
              Tipo de Movimiento <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'ENTRADA', label: 'Entrada', desc: 'Compra o devolución' },
                { value: 'SALIDA', label: 'Salida', desc: 'Consumo o entrega' },
                { value: 'AJUSTE_POSITIVO', label: 'Ajuste +', desc: 'Corrección positiva' },
                { value: 'AJUSTE_NEGATIVO', label: 'Ajuste -', desc: 'Corrección negativa' },
              ].map((tipo) => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, tipoMovimiento: tipo.value })}
                  className={`p-4 rounded-xl text-left transition-all border-2 ${getTipoStyle(tipo.value, formData.tipoMovimiento === tipo.value)}`}
                >
                  <div className="text-sm font-medium mb-1">{tipo.label}</div>
                  <div className="text-xs text-zinc-500">{tipo.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Item */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1.5">
              Item <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.itemId}
              onChange={(e) => handleItemChange(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              <div className="mt-3 bg-zinc-50 rounded-lg p-4 border border-zinc-200">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500 text-xs mb-1">Stock Actual</p>
                    <p className="font-semibold text-zinc-900">{itemSeleccionado.stockActual} {itemSeleccionado.unidadMedida}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs mb-1">Costo Unitario</p>
                    <p className="font-semibold text-zinc-900">${itemSeleccionado.costoUnitario.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs mb-1">Nuevo Stock</p>
                    <p className="font-semibold text-indigo-600">
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
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Cantidad <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Costo Unitario
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costoUnitario}
                onChange={(e) => setFormData({ ...formData, costoUnitario: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Costo total */}
          {formData.cantidad > 0 && formData.costoUnitario > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">Costo Total del Movimiento</p>
                  <p className="text-2xl font-semibold text-green-700">
                    ${(formData.cantidad * formData.costoUnitario).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1.5">
              Motivo / Descripción
            </label>
            <textarea
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Ej: Compra mensual, consumo habitación 201..."
            />
          </div>

          {/* Campos adicionales para salidas */}
          {formData.tipoMovimiento === 'SALIDA' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Persona que Recibe
                </label>
                <input
                  type="text"
                  value={formData.personaRecibe}
                  onChange={(e) => setFormData({ ...formData, personaRecibe: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  placeholder="Nombre de quien recibe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Espacio Relacionado
                </label>
                <select
                  value={formData.espacioId}
                  onChange={(e) => setFormData({ ...formData, espacioId: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
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
              className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Registrando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Registrar Movimiento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
