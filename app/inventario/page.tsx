/**
 * Página principal de Inventario - Casa del Sol
 * Sistema completo de gestión de inventario con Kardex y alertas
 */

'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/app/components/Navbar'

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

export default function InventarioPage() {
  const [items, setItems] = useState<Item[]>([])
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarModalMovimiento, setMostrarModalMovimiento] = useState(false)
  const [busqueda, setBusqueda] = useState('')

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
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error:', error)
        setLoading(false)
      })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar activeTab="Inventario" />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar activeTab="Inventario" />

      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Inventario</h1>
          <p className="text-sm text-zinc-600 mt-1">
            Gestión de stock y control de movimientos
          </p>
        </div>

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

        {/* Búsqueda y acciones */}
        <div className="mb-6 flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, código o proveedor..."
              className="w-full px-4 py-2 pl-10 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
            />
            <svg
              className="w-5 h-5 text-zinc-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={() => setMostrarModalMovimiento(true)}
            className="px-4 py-2 bg-[#007AFF] text-white rounded-lg text-sm font-medium hover:bg-[#0056b3] transition-colors whitespace-nowrap"
          >
            + Registrar Movimiento
          </button>
        </div>

        {/* Tabla de items */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase">Costo Unit.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase">Valor Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {items.map((item) => {
                  const stockBajo = item.stockActual <= item.stockMinimo
                  const valorTotal = item.stockActual * item.costoUnitario

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-zinc-900">{item.codigo}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-zinc-900">{item.nombre}</div>
                        {item.proveedor && (
                          <div className="text-xs text-zinc-500">{item.proveedor}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 bg-zinc-100 text-zinc-700 rounded">
                          {item.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`text-sm font-semibold ${stockBajo ? 'text-[#FF3B30]' : 'text-zinc-900'}`}>
                          {item.stockActual} {item.unidadMedida}
                        </div>
                        <div className="text-xs text-zinc-500">Mín: {item.stockMinimo}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-zinc-900">${item.costoUnitario.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-zinc-900">${valorTotal.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            item.activo
                              ? 'bg-[#34C759]/10 text-[#34C759]'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {item.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mensaje vacío */}
        {items.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-zinc-200">
            <svg className="w-12 h-12 text-zinc-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm text-zinc-500">
              {busqueda ? 'No se encontraron items' : 'No hay items registrados en el inventario'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
