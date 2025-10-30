'use client'

import { useState, useEffect } from 'react'

type Item = {
  id: string
  codigo: string
  nombre: string
  unidadMedida: string
  stockActual: number
}

type Movimiento = {
  id: string
  numeroMovimiento: string
  tipoMovimiento: string
  cantidad: number
  costoUnitario: number
  costoTotal: number
  saldoCantidad: number
  saldoValor: number
  motivo: string | null
  personaRecibe: string | null
  espacio: { identificador: string } | null
  fecha: string
}

export default function KardexTab() {
  const [items, setItems] = useState<Item[]>([])
  const [itemSeleccionado, setItemSeleccionado] = useState<string>('')
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarItems()
  }, [])

  useEffect(() => {
    if (itemSeleccionado) {
      cargarMovimientos()
    }
  }, [itemSeleccionado])

  const cargarItems = async () => {
    try {
      const res = await fetch('/api/inventario/items')
      const data = await res.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Error al cargar items:', error)
    }
  }

  const cargarMovimientos = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/inventario/movimientos?itemId=${itemSeleccionado}`)
      const data = await res.json()
      setMovimientos(data.movimientos || [])
    } catch (error) {
      console.error('Error al cargar movimientos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTipoColor = (tipo: string) => {
    const colores: Record<string, string> = {
      ENTRADA: 'bg-green-50 text-green-700 border-green-200',
      SALIDA: 'bg-red-50 text-red-700 border-red-200',
      AJUSTE_POSITIVO: 'bg-blue-50 text-blue-700 border-blue-200',
      AJUSTE_NEGATIVO: 'bg-orange-50 text-orange-700 border-orange-200',
    }
    return colores[tipo] || 'bg-zinc-50 text-zinc-700 border-zinc-200'
  }

  const item = items.find(i => i.id === itemSeleccionado)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900">Kardex por Item</h2>
        <p className="text-sm text-zinc-600 mt-1">
          Visualiza el historial completo de movimientos de un item específico
        </p>
      </div>

      {/* Selector de item */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-900 mb-2">
          Selecciona un Item
        </label>
        <select
          value={itemSeleccionado}
          onChange={(e) => setItemSeleccionado(e.target.value)}
          className="w-full max-w-2xl px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
        >
          <option value="">Selecciona un item para ver su kardex</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.codigo} - {item.nombre} (Stock: {item.stockActual} {item.unidadMedida})
            </option>
          ))}
        </select>
      </div>

      {/* Info del item seleccionado */}
      {item && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Código</p>
              <p className="text-lg font-semibold text-zinc-900">{item.codigo}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Nombre</p>
              <p className="text-lg font-semibold text-zinc-900">{item.nombre}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Stock Actual</p>
              <p className="text-lg font-semibold text-[#007AFF]">
                {item.stockActual} {item.unidadMedida}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Total de Movimientos</p>
              <p className="text-lg font-semibold text-zinc-900">{movimientos.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de movimientos */}
      {itemSeleccionado && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : movimientos.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-zinc-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm text-zinc-500">No hay movimientos registrados para este item</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">N° Movimiento</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Motivo</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Cantidad</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Costo Unit.</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Costo Total</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Saldo Cant.</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Saldo Valor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {movimientos.map((mov) => (
                    <tr key={mov.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-700">
                        {new Date(mov.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[#007AFF] font-medium">{mov.numeroMovimiento}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getTipoColor(mov.tipoMovimiento)}`}>
                          {mov.tipoMovimiento.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-zinc-700">
                        {mov.motivo || '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-900">
                        {mov.tipoMovimiento === 'ENTRADA' || mov.tipoMovimiento === 'AJUSTE_POSITIVO' ? '+' : '-'}
                        {mov.cantidad}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-700">
                        ${mov.costoUnitario.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-900">
                        ${mov.costoTotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#007AFF]">
                        {mov.saldoCantidad}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-zinc-900">
                        ${mov.saldoValor.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 text-xs">
                        {mov.personaRecibe && (
                          <div>Recibe: {mov.personaRecibe}</div>
                        )}
                        {mov.espacio && (
                          <div>Espacio: {mov.espacio.identificador}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Mensaje inicial */}
      {!itemSeleccionado && (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
          <svg className="w-16 h-16 text-zinc-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">Kardex por Item</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            Selecciona un item del menú desplegable para ver su historial completo de movimientos,
            incluyendo entradas, salidas, ajustes y saldos actualizados.
          </p>
        </div>
      )}
    </div>
  )
}
