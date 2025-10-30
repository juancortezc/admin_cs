/**
 * Tab de Espacios Airbnb
 * Gestión de propiedades disponibles para alquiler
 */

'use client'

import { useEffect, useState } from 'react'

type EspacioAirbnb = {
  id: string
  nombre: string
  descripcion: string | null
  capacidadHuespedes: number
  numCamas: number
  numBanos: number
  precioBaseNoche: number
  precioLimpieza: number
  activo: boolean
  _count?: {
    reservas: number
  }
}

export default function EspaciosTab() {
  const [espacios, setEspacios] = useState<EspacioAirbnb[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [espacioEditando, setEspacioEditando] = useState<EspacioAirbnb | null>(null)

  useEffect(() => {
    cargarEspacios()
  }, [])

  const cargarEspacios = () => {
    setLoading(true)
    fetch('/api/airbnb/espacios')
      .then((r) => r.json())
      .then((data) => {
        setEspacios(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error:', error)
        setLoading(false)
      })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const body = {
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
      capacidadHuespedes: parseInt(formData.get('capacidadHuespedes') as string),
      numCamas: parseInt(formData.get('numCamas') as string),
      numBanos: parseInt(formData.get('numBanos') as string),
      precioBaseNoche: parseFloat(formData.get('precioBaseNoche') as string),
      precioLimpieza: parseFloat(formData.get('precioLimpieza') as string) || 0,
      activo: formData.get('activo') === 'true',
    }

    const url = espacioEditando
      ? `/api/airbnb/espacios/${espacioEditando.id}`
      : '/api/airbnb/espacios'

    const response = await fetch(url, {
      method: espacioEditando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      cargarEspacios()
      setModalAbierto(false)
      setEspacioEditando(null)
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
      {/* Header con botón agregar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Espacios Airbnb</h2>
          <p className="text-sm text-zinc-600 mt-1">{espacios.length} propiedades registradas</p>
        </div>
        <button
          onClick={() => {
            setEspacioEditando(null)
            setModalAbierto(true)
          }}
          className="px-4 py-2 bg-[#007AFF] text-white rounded-lg text-sm font-medium hover:bg-[#0056b3] transition-colors"
        >
          + Agregar Espacio
        </button>
      </div>

      {/* Lista de espacios */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {espacios.map((espacio) => (
          <div
            key={espacio.id}
            className="bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-zinc-900">{espacio.nombre}</h3>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                  espacio.activo
                    ? 'bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20'
                    : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                }`}
              >
                {espacio.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {espacio.descripcion && (
              <p className="text-sm text-zinc-600 mb-3 line-clamp-2">{espacio.descripcion}</p>
            )}

            <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
              <div className="text-center">
                <div className="text-zinc-500 text-xs">Huéspedes</div>
                <div className="font-semibold text-zinc-900">{espacio.capacidadHuespedes}</div>
              </div>
              <div className="text-center">
                <div className="text-zinc-500 text-xs">Camas</div>
                <div className="font-semibold text-zinc-900">{espacio.numCamas}</div>
              </div>
              <div className="text-center">
                <div className="text-zinc-500 text-xs">Baños</div>
                <div className="font-semibold text-zinc-900">{espacio.numBanos}</div>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-3 mb-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-600">Precio/noche</span>
                <span className="font-semibold text-zinc-900">${espacio.precioBaseNoche}</span>
              </div>
              {espacio.precioLimpieza > 0 && (
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-zinc-600">Limpieza</span>
                  <span className="font-semibold text-zinc-900">${espacio.precioLimpieza}</span>
                </div>
              )}
            </div>

            {espacio._count && (
              <div className="text-xs text-zinc-500 mb-3">
                {espacio._count.reservas} reserva(s) registrada(s)
              </div>
            )}

            <button
              onClick={() => {
                setEspacioEditando(espacio)
                setModalAbierto(true)
              }}
              className="w-full px-3 py-2 text-sm text-[#007AFF] hover:bg-[#007AFF]/5 rounded-lg transition-colors font-medium"
            >
              Editar
            </button>
          </div>
        ))}
      </div>

      {/* Mensaje vacío */}
      {espacios.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-zinc-200">
          <svg className="w-12 h-12 text-zinc-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-sm text-zinc-500 mb-4">No hay espacios registrados</p>
          <button
            onClick={() => setModalAbierto(true)}
            className="px-4 py-2 bg-[#007AFF] text-white rounded-lg text-sm font-medium hover:bg-[#0056b3] transition-colors"
          >
            Agregar primer espacio
          </button>
        </div>
      )}

      {/* Modal de formulario */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-zinc-900">
                  {espacioEditando ? 'Editar Espacio' : 'Nuevo Espacio'}
                </h3>
                <button
                  onClick={() => {
                    setModalAbierto(false)
                    setEspacioEditando(null)
                  }}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Nombre del espacio *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    defaultValue={espacioEditando?.nombre || ''}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                    placeholder="Ej: Apartamento Centro"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    rows={3}
                    defaultValue={espacioEditando?.descripcion || ''}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                    placeholder="Descripción breve del espacio..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Capacidad de huéspedes *
                  </label>
                  <input
                    type="number"
                    name="capacidadHuespedes"
                    required
                    min="1"
                    defaultValue={espacioEditando?.capacidadHuespedes || 2}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Número de camas *
                  </label>
                  <input
                    type="number"
                    name="numCamas"
                    required
                    min="1"
                    defaultValue={espacioEditando?.numCamas || 1}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Número de baños *
                  </label>
                  <input
                    type="number"
                    name="numBanos"
                    required
                    min="1"
                    defaultValue={espacioEditando?.numBanos || 1}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Precio base/noche *
                  </label>
                  <input
                    type="number"
                    name="precioBaseNoche"
                    required
                    min="0"
                    step="0.01"
                    defaultValue={espacioEditando?.precioBaseNoche || ''}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Precio de limpieza
                  </label>
                  <input
                    type="number"
                    name="precioLimpieza"
                    min="0"
                    step="0.01"
                    defaultValue={espacioEditando?.precioLimpieza || 0}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Estado
                  </label>
                  <select
                    name="activo"
                    defaultValue={espacioEditando?.activo !== false ? 'true' : 'false'}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setModalAbierto(false)
                    setEspacioEditando(null)
                  }}
                  className="flex-1 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0056b3] transition-colors font-medium"
                >
                  {espacioEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
