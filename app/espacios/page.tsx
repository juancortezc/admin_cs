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

  // Colores por tipo - Apple style
  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'LOCAL': return 'bg-[#007AFF]/10 text-[#007AFF]'
      case 'CONSULTORIO': return 'bg-[#34C759]/10 text-[#34C759]'
      case 'HABITACION': return 'bg-[#AF52DE]/10 text-[#AF52DE]'
      default: return 'bg-zinc-100 text-zinc-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#007AFF]/30 border-t-[#007AFF] mx-auto"></div>
          <p className="mt-3 text-sm text-zinc-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar activeTab="Espacios" />

      <main className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
        {/* Buscador */}
        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por código, arrendatario o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-4 flex flex-wrap gap-2">
          {['TODOS', 'LOCAL', 'CONSULTORIO', 'HABITACION'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltro(tipo)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filtro === tipo
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200'
              }`}
            >
              {tipo === 'TODOS' ? 'Todos' : tipo.charAt(0) + tipo.slice(1).toLowerCase()}
              <span className={`ml-1.5 text-xs ${filtro === tipo ? 'opacity-90' : 'opacity-60'}`}>
                ({tipo === 'TODOS' ? espacios.length : espacios.filter(e => e.tipo === tipo).length})
              </span>
            </button>
          ))}
        </div>

        {/* Lista de espacios */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {espaciosFiltrados.map((espacio) => (
            <a
              key={espacio.id}
              href={`/espacios/${espacio.id}`}
              className="bg-white rounded-xl border border-zinc-200 p-3 hover:shadow-md transition-all cursor-pointer"
            >
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">
                    {espacio.identificador}
                  </h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-md ${getColorTipo(espacio.tipo)}`}>
                    {espacio.tipo}
                  </span>
                </div>
                {espacio.arrendatario && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-[#34C759] bg-[#34C759]/10 rounded-md">
                    Ocupado
                  </span>
                )}
              </div>

              {/* Información */}
              <div className="space-y-1.5 text-sm">
                {espacio.observaciones && (
                  <p className="text-zinc-600 text-xs font-medium">
                    {espacio.observaciones}
                  </p>
                )}

                {espacio.arrendatario && (
                  <div className="pt-2 border-t border-zinc-100">
                    <p className="text-zinc-900 font-medium text-sm">
                      {espacio.arrendatario.nombre}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {espacio.arrendatario.celular}
                    </p>
                  </div>
                )}

                {espacio.monto && (
                  <p className="text-zinc-900 font-semibold text-sm">
                    ${espacio.monto.toLocaleString()}
                  </p>
                )}

                {!espacio.arrendatario && (
                  <p className="text-zinc-400 italic text-xs">
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
            <p className="text-zinc-500 text-sm">No hay espacios de este tipo</p>
          </div>
        )}
      </main>
    </div>
  )
}
