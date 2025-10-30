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
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900">Kits para Airbnb</h2>
        <p className="text-sm text-zinc-600 mt-1">
          Gestión de kits predefinidos para entregas a huéspedes
        </p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Los kits se gestionan desde el módulo de Airbnb</p>
            <p className="text-blue-700">
              Ve a <span className="font-medium">Airbnb → Reservas</span> para crear y asignar kits a las reservas.
              Los kits se vinculan automáticamente con el inventario y crean movimientos de salida al ser entregados.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de kits existentes */}
      {kits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kits.map((kit) => (
            <div
              key={kit.id}
              className="bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-zinc-900">{kit.nombre}</h3>
                  <p className="text-xs text-[#007AFF] mt-1">{kit.codigo}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                  kit.activo
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                }`}>
                  {kit.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {kit.descripcion && (
                <p className="text-sm text-zinc-600 mb-3">{kit.descripcion}</p>
              )}

              <div className="flex gap-4 text-sm border-t border-zinc-100 pt-3">
                <div>
                  <p className="text-xs text-zinc-500">Items</p>
                  <p className="font-medium text-zinc-900">{kit._count?.items || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Entregas</p>
                  <p className="font-medium text-zinc-900">{kit._count?.entregas || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
          <svg className="w-16 h-16 text-zinc-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">No hay kits creados</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-4">
            Los kits te permiten agrupar items del inventario para entregarlos a los huéspedes de Airbnb.
          </p>
          <p className="text-sm text-blue-600">
            Crea kits desde el módulo de Airbnb
          </p>
        </div>
      )}

      {/* Instrucciones */}
      <div className="mt-8 bg-zinc-50 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">¿Cómo funcionan los kits?</h3>
        <div className="space-y-2 text-sm text-zinc-600">
          <div className="flex gap-2">
            <span className="text-[#007AFF]">1.</span>
            <p>Los kits se crean en el módulo de Airbnb con los items necesarios</p>
          </div>
          <div className="flex gap-2">
            <span className="text-[#007AFF]">2.</span>
            <p>Al asignar un kit a una reserva, se crea automáticamente una entrega</p>
          </div>
          <div className="flex gap-2">
            <span className="text-[#007AFF]">3.</span>
            <p>La entrega genera movimientos de salida en el inventario por cada item del kit</p>
          </div>
          <div className="flex gap-2">
            <span className="text-[#007AFF]">4.</span>
            <p>El stock se actualiza automáticamente al momento de la entrega</p>
          </div>
          <div className="flex gap-2">
            <span className="text-[#007AFF]">5.</span>
            <p>Puedes ver los movimientos generados en el tab "Kardex" seleccionando el item</p>
          </div>
        </div>
      </div>
    </div>
  )
}
