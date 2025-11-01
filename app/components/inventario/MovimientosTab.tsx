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

  const getTipoGradient = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return 'from-green-600 to-emerald-600'
      case 'SALIDA': return 'from-red-600 to-rose-600'
      case 'AJUSTE_POSITIVO': return 'from-blue-600 to-indigo-600'
      case 'AJUSTE_NEGATIVO': return 'from-orange-600 to-amber-600'
      default: return 'from-gray-600 to-gray-700'
    }
  }

  const itemSeleccionado = items.find(i => i.id === formData.itemId)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Registrar Movimiento</h2>
        <p className="text-sm text-gray-600 mt-1">
          Registra entradas, salidas y ajustes de inventario
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de movimiento con gradientes */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Tipo de Movimiento <span className="text-red-600">*</span>
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
                  className={`p-4 rounded-xl text-left transition-all ${
                    formData.tipoMovimiento === tipo.value
                      ? `bg-gradient-to-r ${getTipoGradient(tipo.value)} text-white shadow-lg scale-105`
                      : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-3xl mb-2">{tipo.icon}</div>
                  <div className={`text-sm font-bold mb-1 ${
                    formData.tipoMovimiento === tipo.value ? 'text-white' : 'text-gray-900'
                  }`}>
                    {tipo.label}
                  </div>
                  <div className={`text-xs ${
                    formData.tipoMovimiento === tipo.value ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {tipo.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Item */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Item <span className="text-red-600">*</span>
            </label>
            <select
              required
              value={formData.itemId}
              onChange={(e) => handleItemChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
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
              <div className="mt-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-indigo-600 text-xs font-medium mb-1">Stock Actual</p>
                    <p className="font-bold text-gray-900 text-lg">{itemSeleccionado.stockActual} {itemSeleccionado.unidadMedida}</p>
                  </div>
                  <div>
                    <p className="text-indigo-600 text-xs font-medium mb-1">Costo Unitario</p>
                    <p className="font-bold text-gray-900 text-lg">${itemSeleccionado.costoUnitario.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-indigo-600 text-xs font-medium mb-1">Nuevo Stock</p>
                    <p className="font-bold text-indigo-600 text-lg">
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
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Cantidad <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: Number(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Costo Unitario
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costoUnitario}
                onChange={(e) => setFormData({ ...formData, costoUnitario: Number(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Costo total */}
          {formData.cantidad > 0 && formData.costoUnitario > 0 && (
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white/80 font-medium">Costo Total del Movimiento</p>
                  <p className="text-3xl font-bold text-white">
                    ${(formData.cantidad * formData.costoUnitario).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Motivo */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Motivo / Descripción
            </label>
            <textarea
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
              placeholder="Ej: Compra mensual, consumo habitación 201, ajuste por inventario físico..."
            />
          </div>

          {/* Campos adicionales para salidas */}
          {(formData.tipoMovimiento === 'SALIDA') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Persona que Recibe
                </label>
                <input
                  type="text"
                  value={formData.personaRecibe}
                  onChange={(e) => setFormData({ ...formData, personaRecibe: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                  placeholder="Nombre de quien recibe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Espacio Relacionado
                </label>
                <select
                  value={formData.espacioId}
                  onChange={(e) => setFormData({ ...formData, espacioId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
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
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200">
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
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Registrando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
