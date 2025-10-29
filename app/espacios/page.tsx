/**
 * Página de Espacios - Lista de espacios con búsqueda y filtros
 */

'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/app/components/Navbar'

// Tipo de datos de Espacio
type Espacio = {
  id: string
  identificador: string
  tipo: string
  observaciones: string | null
  arrendatario: {
    nombre: string
    email: string
    celular: string
  } | null
  monto: number | null
  fechaInicio: string | null
  fechaFin: string | null
}

export default function EspaciosPage() {
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<string>('TODOS')
  const [busqueda, setBusqueda] = useState<string>('')

  // Cargar espacios desde la API
  useEffect(() => {
    fetch('/api/espacios')
      .then((res) => res.json())
      .then((data) => {
        setEspacios(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error:', error)
        setLoading(false)
      })
  }, [])

  // Filtrar espacios por tipo y búsqueda
  const espaciosFiltrados = espacios
    .filter(e => filtro === 'TODOS' || e.tipo === filtro)
    .filter(e => {
      if (!busqueda) return true
      const search = busqueda.toLowerCase()
      return (
        e.identificador.toLowerCase().includes(search) ||
        e.observaciones?.toLowerCase().includes(search) ||
        e.arrendatario?.nombre.toLowerCase().includes(search)
      )
    })

  // Colores por tipo
  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'LOCAL': return 'bg-blue-100 text-blue-800'
      case 'CONSULTORIO': return 'bg-green-100 text-green-800'
      case 'HABITACION': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="Espacios" />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Buscador */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por código, arrendatario o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
          />
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['TODOS', 'LOCAL', 'CONSULTORIO', 'HABITACION'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltro(tipo)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === tipo
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tipo === 'TODOS' ? 'Todos' : tipo.charAt(0) + tipo.slice(1).toLowerCase()}
              <span className="ml-2 text-sm opacity-75">
                ({tipo === 'TODOS' ? espacios.length : espacios.filter(e => e.tipo === tipo).length})
              </span>
            </button>
          ))}
        </div>

        {/* Lista de espacios */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {espaciosFiltrados.map((espacio) => (
            <a
              key={espacio.id}
              href={`/espacios/${espacio.id}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {espacio.identificador}
                  </h3>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getColorTipo(espacio.tipo)}`}>
                    {espacio.tipo}
                  </span>
                </div>
                {espacio.arrendatario && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                    Ocupado
                  </span>
                )}
              </div>

              {/* Información */}
              <div className="space-y-2 text-sm">
                {espacio.observaciones && (
                  <p className="text-gray-600 font-medium">
                    {espacio.observaciones}
                  </p>
                )}

                {espacio.arrendatario && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-gray-900 font-medium">
                      {espacio.arrendatario.nombre}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {espacio.arrendatario.celular}
                    </p>
                  </div>
                )}

                {espacio.monto && (
                  <p className="text-gray-900 font-semibold">
                    ${espacio.monto.toLocaleString()}
                  </p>
                )}

                {!espacio.arrendatario && (
                  <p className="text-gray-400 italic text-xs">
                    Disponible
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>

        {/* Sin resultados */}
        {espaciosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay espacios de este tipo</p>
          </div>
        )}
      </main>
    </div>
  )
}
