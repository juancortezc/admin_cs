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

  const getCategoriaGradient = (categoria: string) => {
    const gradientes: Record<string, string> = {
      LIMPIEZA: 'from-blue-600 to-cyan-600',
      AMENIDADES: 'from-purple-600 to-pink-600',
      COCINA: 'from-orange-600 to-amber-600',
      BANO: 'from-cyan-600 to-teal-600',
      ELECTRODOMESTICOS: 'from-red-600 to-rose-600',
      MUEBLES: 'from-amber-600 to-yellow-600',
      MANTENIMIENTO: 'from-yellow-600 to-orange-600',
      OFICINA: 'from-gray-600 to-gray-700',
      DECORACION: 'from-pink-600 to-rose-600',
    }
    return gradientes[categoria] || 'from-gray-600 to-gray-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-2xl shadow-md">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando items...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Alertas de stock bajo */}
      {alertas.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-red-800 mb-2">
                {alertas.length} producto(s) con stock bajo
              </h3>
              <p className="text-sm text-red-600 mb-3">Revisa y repone el inventario urgentemente</p>
              <div className="flex flex-wrap gap-2">
                {alertas.map((alerta) => (
                  <span
                    key={alerta.id}
                    className="text-xs bg-white px-3 py-1.5 rounded-lg text-gray-700 border border-red-300 font-medium"
                  >
                    <span className="font-bold">{alerta.nombre}</span>: {alerta.stockActual} (mín: {alerta.stockMinimo})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas con gradientes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/80">Total Items</p>
                <p className="text-3xl font-bold text-white">{estadisticas.totalItems}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/80">Stock Bajo</p>
                <p className="text-3xl font-bold text-white">{estadisticas.itemsConStockBajo}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/80">Valor Total</p>
                <p className="text-3xl font-bold text-white">
                  ${estadisticas.valorTotalInventario.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header con búsqueda y botón */}
      <div className="mb-6 bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1 w-full md:max-w-md">
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => {
              setItemSeleccionado(null)
              setMostrarModal(true)
            }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Item
          </button>
        </div>
      </div>

      {/* Cards de items */}
      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-lg text-gray-500">No hay items registrados</p>
          <button
            onClick={() => {
              setItemSeleccionado(null)
              setMostrarModal(true)
            }}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
          >
            Crear primer item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const stockBajo = item.stockActual <= item.stockMinimo
            const valorTotal = item.stockActual * item.costoUnitario
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Header con gradiente según categoría */}
                <div className={`bg-gradient-to-r ${getCategoriaGradient(item.categoria)} p-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">{item.nombre}</h3>
                      <p className="text-white/80 text-sm mt-1">{item.codigo}</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-bold rounded-lg bg-white/20 backdrop-blur-sm text-white">
                      {item.categoria.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  {/* Stock con alerta si está bajo */}
                  <div className={`mb-4 p-3 rounded-xl ${
                    stockBajo
                      ? 'bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className={`w-5 h-5 ${stockBajo ? 'text-red-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className={`text-sm font-bold ${stockBajo ? 'text-red-800' : 'text-gray-900'}`}>Stock Actual</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className={`text-3xl font-bold ${stockBajo ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.stockActual}
                      </span>
                      <span className="text-sm text-gray-600">
                        {item.unidadMedida} · mín: {item.stockMinimo}
                      </span>
                    </div>
                    {stockBajo && (
                      <p className="text-xs text-red-600 font-medium mt-2">⚠️ Stock por debajo del mínimo</p>
                    )}
                  </div>

                  {/* Información adicional */}
                  <div className="space-y-2 mb-4">
                    {item.proveedor && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-gray-600">{item.proveedor}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">Costo: ${item.costoUnitario.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-gray-900 font-bold">Valor Total: ${valorTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setItemSeleccionado(item)
                        setMostrarModal(true)
                      }}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold text-sm shadow-md flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`¿Eliminar el item "${item.nombre}"?`)) {
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
                      className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold text-sm shadow-md flex items-center justify-center gap-2"
                      title="Eliminar item"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
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
