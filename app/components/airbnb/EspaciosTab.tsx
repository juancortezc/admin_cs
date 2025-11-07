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
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header con botón agregar - Material Design 3 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Espacios Airbnb</h2>
          <p className="text-sm text-gray-600 mt-1">{espacios.length} propiedades registradas</p>
        </div>
        <button
          onClick={() => {
            setEspacioEditando(null)
            setModalAbierto(true)
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Espacio
        </button>
      </div>

      {/* Lista de espacios - Material Design 3 Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {espacios.map((espacio) => (
          <div
            key={espacio.id}
            className="card-elevated bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{espacio.nombre}</h3>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  espacio.activo
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                {espacio.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {espacio.descripcion && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{espacio.descripcion}</p>
            )}

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
                <div className="text-indigo-600 text-xs font-medium mb-1">Huéspedes</div>
                <div className="text-xl font-bold text-gray-900">{espacio.capacidadHuespedes}</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <div className="text-purple-600 text-xs font-medium mb-1">Camas</div>
                <div className="text-xl font-bold text-gray-900">{espacio.numCamas}</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <div className="text-blue-600 text-xs font-medium mb-1">Baños</div>
                <div className="text-xl font-bold text-gray-900">{espacio.numBanos}</div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 font-medium">Precio/noche</span>
                <span className="text-lg font-bold text-indigo-600">${espacio.precioBaseNoche}</span>
              </div>
              {espacio.precioLimpieza > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Limpieza</span>
                  <span className="text-base font-semibold text-gray-900">${espacio.precioLimpieza}</span>
                </div>
              )}
            </div>

            {espacio._count && (
              <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {espacio._count.reservas} reserva(s) registrada(s)
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEspacioEditando(espacio)
                  setModalAbierto(true)
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
              <button
                onClick={async () => {
                  if (confirm(`¿Eliminar el espacio "${espacio.nombre}"?`)) {
                    try {
                      const res = await fetch(`/api/airbnb/espacios/${espacio.id}`, {
                        method: 'DELETE',
                      })
                      if (res.ok) {
                        cargarEspacios()
                      } else {
                        const error = await res.json()
                        alert(error.error || 'Error al eliminar')
                      }
                    } catch (error) {
                      console.error('Error:', error)
                      alert('Error al eliminar el espacio')
                    }
                  }
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                title="Eliminar espacio"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje vacío - Material Design 3 */}
      {espacios.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No hay espacios registrados</h3>
          <p className="text-sm text-gray-600 mb-6">Comienza agregando tu primer espacio de alquiler</p>
          <button
            onClick={() => setModalAbierto(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-200"
          >
            Agregar primer espacio
          </button>
        </div>
      )}

      {/* Modal de formulario - Material Design 3 */}
      {modalAbierto && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => {
              setModalAbierto(false)
              setEspacioEditando(null)
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto animate-in zoom-in-95 duration-200">
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5 rounded-t-3xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {espacioEditando ? 'Editar Espacio' : 'Nuevo Espacio'}
                    </h3>
                    <p className="text-indigo-100 text-sm mt-1">
                      {espacioEditando ? 'Actualiza la información del espacio' : 'Completa los datos del nuevo espacio'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setModalAbierto(false)
                      setEspacioEditando(null)
                    }}
                    className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nombre del espacio *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    defaultValue={espacioEditando?.nombre || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                    placeholder="Ej: Apartamento Centro"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    rows={3}
                    defaultValue={espacioEditando?.descripcion || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 resize-none"
                    placeholder="Descripción breve del espacio..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Capacidad de huéspedes *
                  </label>
                  <input
                    type="number"
                    name="capacidadHuespedes"
                    required
                    min="1"
                    defaultValue={espacioEditando?.capacidadHuespedes || 2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Número de camas *
                  </label>
                  <input
                    type="number"
                    name="numCamas"
                    required
                    min="1"
                    defaultValue={espacioEditando?.numCamas || 1}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Número de baños *
                  </label>
                  <input
                    type="number"
                    name="numBanos"
                    required
                    min="1"
                    defaultValue={espacioEditando?.numBanos || 1}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Precio base/noche *
                  </label>
                  <input
                    type="number"
                    name="precioBaseNoche"
                    required
                    min="0"
                    step="0.01"
                    defaultValue={espacioEditando?.precioBaseNoche || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Precio de limpieza
                  </label>
                  <input
                    type="number"
                    name="precioLimpieza"
                    min="0"
                    step="0.01"
                    defaultValue={espacioEditando?.precioLimpieza || 0}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                    placeholder="0.00"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Estado
                  </label>
                  <select
                    name="activo"
                    defaultValue={espacioEditando?.activo !== false ? 'true' : 'false'}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalAbierto(false)
                    setEspacioEditando(null)
                  }}
                  className="flex-1 px-5 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold shadow-lg shadow-indigo-200"
                >
                  {espacioEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
        </>
      )}
    </div>
  )
}
