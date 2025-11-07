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
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header con búsqueda - Material Design 3 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Huéspedes</h2>
            <p className="text-sm text-gray-600 mt-1">{huespedes.length} huéspedes registrados</p>
          </div>
          <button
            onClick={() => setShowModalNuevo(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-200"
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
            className="w-full px-5 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder:text-gray-400"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-4 top-3.5"
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

      {/* Lista de huéspedes - Material Design 3 */}
      <div className="card-elevated bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b-2 border-indigo-100">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  País
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Calificación
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Reservas
                </th>
                <th className="px-5 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {huespedes.map((huesped) => (
                <tr key={huesped.id} className="hover:bg-indigo-50/50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{huesped.nombre}</div>
                    {huesped.notas && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {huesped.notas}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm space-y-1">
                      {huesped.email && (
                        <div className="text-gray-600 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {huesped.email}
                        </div>
                      )}
                      {huesped.telefono && (
                        <div className="text-gray-600 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {huesped.telefono}
                        </div>
                      )}
                      {huesped.whatsapp && (
                        <div className="text-[#25D366] text-xs font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          {huesped.whatsapp}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-gray-700 px-2.5 py-1 bg-gray-100 rounded-lg">
                      {huesped.pais || '-'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {renderEstrellas(huesped.calificacionPromedio)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-3 py-1 text-sm font-bold text-indigo-700 bg-indigo-100 rounded-full">
                      {huesped._count?.reservas || 0}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          // TODO: Implement edit functionality
                          alert('Funcionalidad de edición en desarrollo')
                        }}
                        className="p-2.5 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all"
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
                        className="p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-all"
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

      {/* Mensaje vacío - Material Design 3 */}
      {huespedes.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {busqueda ? 'No se encontraron huéspedes' : 'No hay huéspedes registrados'}
          </h3>
          <p className="text-sm text-gray-600">
            {busqueda ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer huésped'}
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
