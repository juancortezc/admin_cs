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
      OFICINA: 'bg-zinc-50 text-zinc-700 border-zinc-200',
      DECORACION: 'bg-pink-50 text-pink-700 border-pink-200',
    }
    return colores[categoria] || 'bg-zinc-50 text-zinc-700 border-zinc-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-zinc-200">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-500 text-sm mt-3">Cargando items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alertas de stock bajo */}
      {alertas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                {alertas.length} producto(s) con stock bajo
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {alertas.map((alerta) => (
                  <span
                    key={alerta.id}
                    className="text-xs bg-white px-2 py-1 rounded-md text-zinc-700 border border-red-200"
                  >
                    {alerta.nombre}: {alerta.stockActual} (mín: {alerta.stockMinimo})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total Items</p>
              <p className="text-2xl font-semibold text-zinc-900">{estadisticas.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Stock Bajo</p>
              <p className="text-2xl font-semibold text-zinc-900">{estadisticas.itemsConStockBajo}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Valor Total</p>
              <p className="text-2xl font-semibold text-zinc-900">
                ${estadisticas.valorTotalInventario.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header con búsqueda y botón */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => {
            setItemSeleccionado(null)
            setMostrarModal(true)
          }}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Item
        </button>
      </div>

      {/* Tabla de items */}
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
          <svg className="w-12 h-12 text-zinc-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-sm text-zinc-500 mb-4">No hay items registrados</p>
          <button
            onClick={() => {
              setItemSeleccionado(null)
              setMostrarModal(true)
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Crear primer item
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Mínimo</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Costo</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Valor</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {items.map((item) => {
                  const stockBajo = item.stockActual <= item.stockMinimo
                  const valorTotal = item.stockActual * item.costoUnitario
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-indigo-600 font-medium">{item.codigo}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-zinc-900">{item.nombre}</p>
                          {item.proveedor && (
                            <p className="text-xs text-zinc-500">{item.proveedor}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getCategoriaColor(item.categoria)}`}>
                          {item.categoria.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${stockBajo ? 'text-red-600' : 'text-zinc-900'}`}>
                        {item.stockActual} {item.unidadMedida}
                        {stockBajo && <span className="ml-1 text-red-500">!</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600">
                        {item.stockMinimo}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600">
                        ${item.costoUnitario.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-900">
                        ${valorTotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setItemSeleccionado(item)
                              setMostrarModal(true)
                            }}
                            className="p-1.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`¿Eliminar "${item.nombre}"?`)) {
                                try {
                                  const res = await fetch(`/api/inventario/items/${item.id}`, {
                                    method: 'DELETE',
                                  })
                                  if (res.ok) {
                                    cargarItems()
                                  } else {
                                    const error = await res.json()
                                    alert(error.error || 'Error al eliminar')
                                  }
                                } catch (error) {
                                  console.error('Error:', error)
                                  alert('Error al eliminar el item')
                                }
                              }
                            }}
                            className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
