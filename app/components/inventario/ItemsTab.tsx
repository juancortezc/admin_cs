'use client'

import { useEffect, useState } from 'react'
import ModalItem from './ModalItem'

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
  activo: boolean
}

type Alerta = {
  id: string
  codigo: string
  nombre: string
  stockActual: number
  stockMinimo: number
  diferencia: number
}

type Estadisticas = {
  totalItems: number
  itemsConStockBajo: number
  valorTotalInventario: number
}

export default function ItemsTab() {
  const [items, setItems] = useState<Item[]>([])
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalItems: 0,
    itemsConStockBajo: 0,
    valorTotalInventario: 0,
  })
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [itemSeleccionado, setItemSeleccionado] = useState<Item | null>(null)

  useEffect(() => {
    cargarItems()
  }, [busqueda])

  const cargarItems = () => {
    setLoading(true)
    const params = busqueda ? `?busqueda=${busqueda}` : ''
    fetch(`/api/inventario/items${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || [])
        setAlertas(data.alertas || [])
        setEstadisticas(data.estadisticas || {})
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error:', error)
        setLoading(false)
      })
  }

  const getCategoriaColor = (categoria: string) => {
    const colores: Record<string, string> = {
      LIMPIEZA: 'bg-blue-50 text-blue-700 border-blue-200',
      AMENIDADES: 'bg-purple-50 text-purple-700 border-purple-200',
      COCINA: 'bg-orange-50 text-orange-700 border-orange-200',
      BANO: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      ELECTRODOMESTICOS: 'bg-red-50 text-red-700 border-red-200',
      MUEBLES: 'bg-amber-50 text-amber-700 border-amber-200',
      MANTENIMIENTO: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      OFICINA: 'bg-gray-50 text-gray-700 border-gray-200',
    }
    return colores[categoria] || 'bg-zinc-50 text-zinc-700 border-zinc-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Alertas de stock bajo */}
      {alertas.length > 0 && (
        <div className="mb-6 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#FF3B30] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[#FF3B30] mb-2">
                {alertas.length} producto(s) con stock bajo
              </h3>
              <div className="flex flex-wrap gap-2">
                {alertas.map((alerta) => (
                  <span
                    key={alerta.id}
                    className="text-xs bg-white px-3 py-1.5 rounded-lg text-zinc-700 border border-zinc-200"
                  >
                    <span className="font-medium">{alerta.nombre}</span>: {alerta.stockActual} (mín: {alerta.stockMinimo})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500">Total Items</p>
          <p className="text-2xl font-semibold text-zinc-900 mt-1">{estadisticas.totalItems}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500">Stock Bajo</p>
          <p className="text-2xl font-semibold text-[#FF3B30] mt-1">{estadisticas.itemsConStockBajo}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500">Valor Total</p>
          <p className="text-2xl font-semibold text-zinc-900 mt-1">
            ${estadisticas.valorTotalInventario.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Header con búsqueda y botón */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              setItemSeleccionado(null)
              setMostrarModal(true)
            }}
            className="px-4 py-2 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0051D5] transition-colors"
          >
            + Nuevo Item
          </button>
        </div>
      </div>

      {/* Tabla de items */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-zinc-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm text-zinc-500">No hay items registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Unidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Costo Unit.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Valor Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {items.map((item) => {
                  const stockBajo = item.stockActual <= item.stockMinimo
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-[#007AFF]">{item.codigo}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-zinc-900">{item.nombre}</p>
                        {item.proveedor && (
                          <p className="text-xs text-zinc-500">{item.proveedor}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getCategoriaColor(item.categoria)}`}>
                          {item.categoria.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className={`text-sm font-semibold ${stockBajo ? 'text-[#FF3B30]' : 'text-zinc-900'}`}>
                          {item.stockActual}
                        </p>
                        <p className="text-xs text-zinc-500">mín: {item.stockMinimo}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700">
                        {item.unidadMedida}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                        ${item.costoUnitario.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                        ${(item.stockActual * item.costoUnitario).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setItemSeleccionado(item)
                            setMostrarModal(true)
                          }}
                          className="text-[#007AFF] hover:text-[#0051D5] font-medium"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {mostrarModal && (
        <ModalItem
          item={itemSeleccionado}
          onClose={() => {
            setMostrarModal(false)
            setItemSeleccionado(null)
          }}
          onGuardar={() => {
            setMostrarModal(false)
            setItemSeleccionado(null)
            cargarItems()
          }}
        />
      )}
    </div>
  )
}
