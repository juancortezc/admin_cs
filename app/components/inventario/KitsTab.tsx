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
      <div className="flex items-center justify-center h-96 bg-white rounded-2xl shadow-md">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando kits...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Kits para Airbnb</h2>
        <p className="text-sm text-gray-600 mt-1">
          Gestión de kits predefinidos para entregas a huéspedes
        </p>
      </div>

      {/* Info destacada */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex gap-3">
          <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm">
            <p className="font-bold text-blue-900 mb-2">Los kits se gestionan desde el módulo de Airbnb</p>
            <p className="text-blue-700 leading-relaxed">
              Ve a <span className="font-bold bg-blue-200 px-2 py-0.5 rounded">Airbnb → Reservas</span> para crear y asignar kits a las reservas.
              Los kits se vinculan automáticamente con el inventario y crean movimientos de salida al ser entregados.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de kits existentes */}
      {kits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kits.map((kit) => (
            <div
              key={kit.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden"
            >
              {/* Header */}
              <div className="bg-purple-600 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">{kit.nombre}</h3>
                    <p className="text-white/80 text-sm mt-1">{kit.codigo}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                    kit.activo
                      ? 'bg-green-500/20 text-white border-2 border-green-300/30'
                      : 'bg-gray-500/20 text-white border-2 border-gray-300/30'
                  }`}>
                    {kit.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-5">
                {kit.descripcion && (
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{kit.descripcion}</p>
                )}

                {/* Estadísticas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="text-xs font-medium text-indigo-600">Items</span>
                    </div>
                    <p className="text-2xl font-bold text-indigo-900">{kit._count?.items || 0}</p>
                  </div>

                  <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span className="text-xs font-medium text-green-600">Entregas</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{kit._count?.entregas || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="bg-purple-100 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No hay kits creados</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto mb-4 leading-relaxed">
            Los kits te permiten agrupar items del inventario para entregarlos a los huéspedes de Airbnb.
          </p>
          <p className="text-sm font-semibold text-blue-600">
            Crea kits desde el módulo de Airbnb
          </p>
        </div>
      )}

      {/* Instrucciones mejoradas */}
      <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ¿Cómo funcionan los kits?
        </h3>
        <div className="space-y-3">
          {[
            { num: 1, text: 'Los kits se crean en el módulo de Airbnb con los items necesarios', icon: '🎁' },
            { num: 2, text: 'Al asignar un kit a una reserva, se crea automáticamente una entrega', icon: '📋' },
            { num: 3, text: 'La entrega genera movimientos de salida en el inventario por cada item del kit', icon: '📤' },
            { num: 4, text: 'El stock se actualiza automáticamente al momento de la entrega', icon: '✅' },
            { num: 5, text: 'Puedes ver los movimientos generados en el tab "Kardex" seleccionando el item', icon: '📊' },
          ].map((item) => (
            <div key={item.num} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl hover:shadow-md transition-all">
              <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                {item.num}
              </div>
              <div className="flex items-start gap-2 flex-1">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-sm text-gray-700 leading-relaxed pt-1">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
