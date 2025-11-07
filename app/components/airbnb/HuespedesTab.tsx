/**
 * Tab de Huéspedes Airbnb
 * Gestión de contactos y calificaciones
 */

'use client'

import { useEffect, useState } from 'react'
import ModalNuevoHuesped from './ModalNuevoHuesped'

type HuespedAirbnb = {
  id: string
  nombre: string
  email: string | null
  telefono: string | null
  whatsapp: string | null
  pais: string | null
  calificacionPromedio: number | null
  notas: string | null
  _count?: {
    reservas: number
  }
}

export default function HuespedesTab() {
  const [huespedes, setHuespedes] = useState<HuespedAirbnb[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [showModalNuevo, setShowModalNuevo] = useState(false)

  useEffect(() => {
    cargarHuespedes()
  }, [busqueda])

  const cargarHuespedes = () => {
    setLoading(true)
    const params = busqueda ? `?busqueda=${busqueda}` : ''
    fetch(`/api/airbnb/huespedes${params}`)
      .then((r) => r.json())
      .then((data) => {
        setHuespedes(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error:', error)
        setLoading(false)
      })
  }

  const renderEstrellas = (calificacion: number | null) => {
    if (!calificacion) return <span className="text-zinc-400 text-sm">Sin calificación</span>

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i <= calificacion ? 'text-[#FFD700]' : 'text-zinc-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
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
      {/* Header con búsqueda */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Huéspedes</h2>
            <p className="text-sm text-zinc-600 mt-1">{huespedes.length} huéspedes registrados</p>
          </div>
          <button
            onClick={() => setShowModalNuevo(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0051D5] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Huésped
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, email, teléfono o país..."
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
      </div>

      {/* Lista de huéspedes */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider">
                  País
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider">
                  Calificación
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider">
                  Reservas
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {huespedes.map((huesped) => (
                <tr key={huesped.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900">{huesped.nombre}</div>
                    {huesped.notas && (
                      <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                        {huesped.notas}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {huesped.email && (
                        <div className="text-zinc-600">{huesped.email}</div>
                      )}
                      {huesped.telefono && (
                        <div className="text-zinc-600">{huesped.telefono}</div>
                      )}
                      {huesped.whatsapp && (
                        <div className="text-[#25D366] text-xs">
                          📱 {huesped.whatsapp}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-zinc-600">
                      {huesped.pais || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {renderEstrellas(huesped.calificacionPromedio)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-zinc-900">
                      {huesped._count?.reservas || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          // TODO: Implement edit functionality
                          alert('Funcionalidad de edición en desarrollo')
                        }}
                        className="p-2 text-[#007AFF] hover:bg-[#007AFF]/10 rounded-lg transition-colors"
                        title="Editar huésped"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`¿Eliminar al huésped "${huesped.nombre}"?`)) {
                            try {
                              const res = await fetch(`/api/airbnb/huespedes/${huesped.id}`, {
                                method: 'DELETE',
                              })
                              if (res.ok) {
                                cargarHuespedes()
                              } else {
                                const error = await res.json()
                                alert(error.error || 'Error al eliminar')
                              }
                            } catch (error) {
                              console.error('Error:', error)
                              alert('Error al eliminar el huésped')
                            }
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar huésped"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mensaje vacío */}
      {huespedes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-zinc-200">
          <svg className="w-12 h-12 text-zinc-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm text-zinc-500">
            {busqueda ? 'No se encontraron huéspedes' : 'No hay huéspedes registrados'}
          </p>
        </div>
      )}

      {/* Modal Nuevo Huésped */}
      {showModalNuevo && (
        <ModalNuevoHuesped
          onClose={() => setShowModalNuevo(false)}
          onGuardar={() => {
            setShowModalNuevo(false)
            cargarHuespedes()
          }}
        />
      )}
    </div>
  )
}
