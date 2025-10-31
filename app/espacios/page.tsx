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
  activo: boolean
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
  const [filtroEstado, setFiltroEstado] = useState<string>('activos') // 'activos', 'inactivos', 'todos'
  const [busqueda, setBusqueda] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Cargar espacios desde la API
  const cargarEspacios = () => {
    setLoading(true)
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
  }

  useEffect(() => {
    cargarEspacios()
  }, [])

  // Desactivar espacio
  const desactivarEspacio = async (espacioId: string, activo: boolean) => {
    if (!confirm(activo ? '¿Desactivar este espacio?' : '¿Reactivar este espacio?')) {
      return
    }

    try {
      const res = await fetch(`/api/espacios/${espacioId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !activo }),
      })

      if (!res.ok) {
        throw new Error('Error al actualizar espacio')
      }

      cargarEspacios()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar espacio')
    }
  }

  // Filtrar espacios por tipo, estado y búsqueda
  const espaciosFiltrados = espacios
    .filter(e => filtroEstado === 'todos' || (filtroEstado === 'activos' ? e.activo : !e.activo))
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
        {/* Header con botón crear */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-zinc-900">Espacios</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0051D5] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Espacio
          </button>
        </div>

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

        {/* Filtros de estado */}
        <div className="mb-3 flex flex-wrap gap-2">
          {[
            { value: 'activos', label: 'Activos' },
            { value: 'inactivos', label: 'Inactivos' },
            { value: 'todos', label: 'Todos' },
          ].map((estado) => (
            <button
              key={estado.value}
              onClick={() => setFiltroEstado(estado.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filtroEstado === estado.value
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200'
              }`}
            >
              {estado.label}
            </button>
          ))}
        </div>

        {/* Filtros de tipo */}
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
                ({tipo === 'TODOS' ? espaciosFiltrados.length : espaciosFiltrados.filter(e => e.tipo === tipo).length})
              </span>
            </button>
          ))}
        </div>

        {/* Lista de espacios */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {espaciosFiltrados.map((espacio) => (
            <div
              key={espacio.id}
              className={`bg-white rounded-xl border border-zinc-200 p-3 transition-all ${
                !espacio.activo ? 'opacity-60' : ''
              }`}
            >
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between mb-2">
                <a href={`/espacios/${espacio.id}`} className="flex-1">
                  <h3 className="text-base font-semibold text-zinc-900 hover:text-[#007AFF]">
                    {espacio.identificador}
                  </h3>
                  <div className="flex gap-1.5 mt-1">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-md ${getColorTipo(espacio.tipo)}`}>
                      {espacio.tipo}
                    </span>
                    {!espacio.activo && (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-md bg-zinc-100 text-zinc-500">
                        Inactivo
                      </span>
                    )}
                  </div>
                </a>
                {espacio.arrendatario && espacio.activo && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-[#34C759] bg-[#34C759]/10 rounded-md">
                    Ocupado
                  </span>
                )}
              </div>

              {/* Información */}
              <div className="space-y-1.5 text-sm mb-3">
                {espacio.observaciones && (
                  <p className="text-zinc-600 text-xs font-medium">
                    {espacio.observaciones}
                  </p>
                )}

                {espacio.arrendatario && espacio.activo && (
                  <div className="pt-2 border-t border-zinc-100">
                    <p className="text-zinc-900 font-medium text-sm">
                      {espacio.arrendatario.nombre}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {espacio.arrendatario.celular}
                    </p>
                  </div>
                )}

                {espacio.monto && espacio.activo && (
                  <p className="text-zinc-900 font-semibold text-sm">
                    ${espacio.monto.toLocaleString()}
                  </p>
                )}

                {!espacio.arrendatario && espacio.activo && (
                  <p className="text-zinc-400 italic text-xs">
                    Disponible
                  </p>
                )}
              </div>

              {/* Botón desactivar/reactivar */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  desactivarEspacio(espacio.id, espacio.activo)
                }}
                className={`w-full py-1.5 px-3 text-xs font-medium rounded-lg transition-colors ${
                  espacio.activo
                    ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    : 'bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20'
                }`}
              >
                {espacio.activo ? 'Desactivar' : 'Reactivar'}
              </button>
            </div>
          ))}
        </div>

        {/* Sin resultados */}
        {espaciosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500 text-sm">No hay espacios con estos filtros</p>
          </div>
        )}
      </main>

      {/* Modal: Crear Espacio */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b border-zinc-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900">Nuevo Espacio</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)

                  try {
                    const res = await fetch('/api/espacios', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        identificador: formData.get('identificador'),
                        tipo: formData.get('tipo'),
                        observaciones: formData.get('observaciones') || null,
                      }),
                    })

                    if (!res.ok) {
                      const error = await res.json()
                      alert(error.error || 'Error al crear espacio')
                      return
                    }

                    setShowCreateModal(false)
                    cargarEspacios()
                  } catch (error) {
                    console.error('Error:', error)
                    alert('Error al crear espacio')
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Identificador *
                  </label>
                  <input
                    type="text"
                    name="identificador"
                    required
                    placeholder="Ej: L-001, C-001, H-001"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    L = Local, C = Consultorio, H = Habitación
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    name="tipo"
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                  >
                    <option value="">Seleccione...</option>
                    <option value="LOCAL">Local</option>
                    <option value="CONSULTORIO">Consultorio</option>
                    <option value="HABITACION">Habitación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    name="observaciones"
                    rows={3}
                    placeholder="Notas adicionales..."
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 px-4 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0051D5] transition-colors"
                  >
                    Crear Espacio
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
