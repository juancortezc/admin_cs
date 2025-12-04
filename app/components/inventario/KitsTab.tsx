'use client'

import { useEffect, useState } from 'react'

type Kit = {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  activo: boolean
  _count?: {
    items: number
    entregas: number
  }
}

export default function KitsTab() {
  const [kits, setKits] = useState<Kit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarKits()
  }, [])

  const cargarKits = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/inventario/kits')
      const data = await res.json()
      setKits(data.kits || [])
    } catch (error) {
      console.error('Error al cargar kits:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-zinc-200">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-500 text-sm mt-3">Cargando kits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Kits para Airbnb</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Gestión de kits predefinidos para entregas a huéspedes
        </p>
      </div>

      {/* Info destacada */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Los kits se gestionan desde el módulo de Airbnb</p>
            <p className="text-blue-700">
              Ve a <span className="font-medium">Airbnb → Reservas</span> para crear y asignar kits a las reservas.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de kits existentes */}
      {kits.length > 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase">Items</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase">Entregas</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {kits.map((kit) => (
                  <tr key={kit.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-indigo-600 font-medium">{kit.codigo}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900">{kit.nombre}</td>
                    <td className="px-4 py-3 text-zinc-600 max-w-xs truncate">
                      {kit.descripcion || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                        {kit._count?.items || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium">
                        {kit._count?.entregas || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-md border ${
                        kit.activo
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                      }`}>
                        {kit.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
          <svg className="w-12 h-12 text-zinc-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-sm font-medium text-zinc-900 mb-1">No hay kits creados</h3>
          <p className="text-sm text-zinc-500">
            Los kits se crean desde el módulo de Airbnb
          </p>
        </div>
      )}

      {/* Instrucciones */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h3 className="text-sm font-medium text-zinc-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ¿Cómo funcionan los kits?
        </h3>
        <div className="space-y-2">
          {[
            'Los kits se crean en el módulo de Airbnb con los items necesarios',
            'Al asignar un kit a una reserva, se crea automáticamente una entrega',
            'La entrega genera movimientos de salida en el inventario',
            'El stock se actualiza automáticamente al momento de la entrega',
            'Puedes ver los movimientos generados en el tab "Kardex"',
          ].map((texto, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="bg-indigo-100 text-indigo-700 w-5 h-5 rounded flex items-center justify-center text-xs font-medium flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-zinc-600">{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
