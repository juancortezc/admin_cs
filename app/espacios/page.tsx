/**
 * Página de Espacios - Material Design 3
 * Lista de espacios con búsqueda, filtros y edición
 */

'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/app/components/Navbar'
import { OfficeBuildingIcon } from '@/app/components/icons'

// Tipo de datos de Espacio
type Espacio = {
  id: string
  identificador: string
  tipo: string
  observaciones: string | null
  activo: boolean
  arrendatario: {
    id: string
    nombre: string
    email: string
    celular: string
  } | null
  monto: number | null
  fechaInicio: string | null
  fechaFin: string | null
}

type Arrendatario = {
  id: string
  nombre: string
  email: string
  celular: string
}

export default function EspaciosPage() {
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [arrendatarios, setArrendatarios] = useState<Arrendatario[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<string>('TODOS')
  const [filtroEstado, setFiltroEstado] = useState<string>('activos')
  const [busqueda, setBusqueda] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [espacioEditar, setEspacioEditar] = useState<Espacio | null>(null)
  const [guardando, setGuardando] = useState(false)

  // Form data para edición
  const [formData, setFormData] = useState({
    arrendatarioId: '',
    monto: '',
    fechaInicio: '',
    fechaFin: '',
  })

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

  // Cargar arrendatarios
  const cargarArrendatarios = () => {
    fetch('/api/arrendatarios')
      .then((res) => res.json())
      .then((data) => {
        setArrendatarios(data)
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  }

  useEffect(() => {
    cargarEspacios()
    cargarArrendatarios()
  }, [])

  // Abrir modal de edición
  const abrirModalEditar = (espacio: Espacio) => {
    setEspacioEditar(espacio)
    setFormData({
      arrendatarioId: espacio.arrendatario?.id || '',
      monto: espacio.monto?.toString() || '',
      fechaInicio: espacio.fechaInicio || '',
      fechaFin: espacio.fechaFin || '',
    })
    setShowEditModal(true)
  }

  // Guardar cambios de espacio
  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!espacioEditar) return

    setGuardando(true)
    try {
      const res = await fetch(`/api/espacios/${espacioEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arrendatarioId: formData.arrendatarioId || null,
          monto: formData.monto ? parseFloat(formData.monto) : null,
          fechaInicio: formData.fechaInicio || null,
          fechaFin: formData.fechaFin || null,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Error al actualizar espacio')
        return
      }

      setShowEditModal(false)
      cargarEspacios()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar espacio')
    } finally {
      setGuardando(false)
    }
  }

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

  // Filtrar espacios
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

  // Colores por tipo - Material Design
  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'LOCAL': return 'from-blue-600 to-indigo-600'
      case 'CONSULTORIO': return 'from-green-600 to-emerald-600'
      case 'HABITACION': return 'from-purple-600 to-pink-600'
      default: return 'from-gray-600 to-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <Navbar activeTab="Espacios" />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 font-medium">Cargando espacios...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Navbar activeTab="Espacios" />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header con Material Design 3 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <OfficeBuildingIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Espacios</h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  Gestión de espacios y asignación de arrendatarios
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Espacio
            </button>
          </div>
        </div>

        {/* Stats and Search */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Lista de Espacios</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {espaciosFiltrados.length} de {espacios.length} espacios
                  </p>
                </div>
              </div>
            </div>

            {/* Filtros en una sola fila */}
            <div className="p-6 border-t border-gray-200 space-y-4">
              {/* Buscador */}
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por código, arrendatario o descripción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Filtros en una fila */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Estado */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Estado:</span>
                  <div className="flex gap-1">
                    {[
                      { value: 'activos', label: 'Activos' },
                      { value: 'inactivos', label: 'Inactivos' },
                      { value: 'todos', label: 'Todos' },
                    ].map((estado) => (
                      <button
                        key={estado.value}
                        onClick={() => setFiltroEstado(estado.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          filtroEstado === estado.value
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {estado.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-px h-6 bg-gray-300"></div>

                {/* Tipo */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Tipo:</span>
                  <div className="flex gap-1">
                    {['TODOS', 'LOCAL', 'CONSULTORIO', 'HABITACION'].map((tipo) => (
                      <button
                        key={tipo}
                        onClick={() => setFiltro(tipo)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          filtro === tipo
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tipo === 'TODOS' ? 'Todos' : tipo.charAt(0) + tipo.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de espacios */}
        {espaciosFiltrados.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {espaciosFiltrados.map((espacio) => (
              <div
                key={espacio.id}
                className={`group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all ${
                  !espacio.activo ? 'opacity-60' : ''
                }`}
              >
                {/* Header con gradiente según tipo */}
                <div className={`bg-gradient-to-r ${getColorTipo(espacio.tipo)} p-4`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {espacio.identificador}
                      </h3>
                      <span className="inline-block px-2 py-0.5 mt-1 text-xs font-semibold bg-white/20 text-white rounded-lg backdrop-blur-sm">
                        {espacio.tipo}
                      </span>
                    </div>
                    {espacio.arrendatario && espacio.activo && (
                      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-white/20 rounded-lg backdrop-blur-sm border border-white/20">
                        Ocupado
                      </span>
                    )}
                    {!espacio.activo && (
                      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-black/20 rounded-lg backdrop-blur-sm">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Observaciones */}
                  {espacio.observaciones && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl">
                      <p className="text-xs text-gray-600 font-medium">
                        {espacio.observaciones}
                      </p>
                    </div>
                  )}

                  {/* Arrendatario */}
                  {espacio.arrendatario && espacio.activo ? (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs font-medium text-indigo-600">Arrendatario</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{espacio.arrendatario.nombre}</p>
                      <p className="text-xs text-gray-600 mt-1">{espacio.arrendatario.celular}</p>
                    </div>
                  ) : espacio.activo && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-semibold text-green-700">Disponible</span>
                      </div>
                    </div>
                  )}

                  {/* Monto */}
                  {espacio.monto && espacio.activo && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-600">Monto</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">${espacio.monto.toLocaleString()}</p>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => abrirModalEditar(espacio)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => desactivarEspacio(espacio.id, espacio.activo)}
                      className={`px-4 py-2.5 rounded-xl transition-all font-semibold text-sm shadow-md ${
                        espacio.activo
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {espacio.activo ? 'Desactivar' : 'Reactivar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No hay espacios con estos filtros</h3>
            <p className="mt-2 text-sm text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </main>

      {/* Modal: Editar Espacio */}
      {showEditModal && espacioEditar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Editar Espacio</h2>
                  <p className="text-white/80 text-sm mt-1">{espacioEditar.identificador}</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleGuardarEdicion} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Arrendatario
                </label>
                <select
                  value={formData.arrendatarioId}
                  onChange={(e) => setFormData({ ...formData, arrendatarioId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Sin arrendatario (Disponible)</option>
                  {arrendatarios.map((arr) => (
                    <option key={arr.id} value={arr.id}>
                      {arr.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Al cambiar el arrendatario, se mantiene el historial del anterior
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Monto mensual
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={guardando}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-sm rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                >
                  {guardando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear Espacio */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Nuevo Espacio</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Identificador *
                  </label>
                  <input
                    type="text"
                    name="identificador"
                    required
                    placeholder="Ej: L-001, C-001, H-001"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    L = Local, C = Consultorio, H = Habitación
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tipo *
                  </label>
                  <select
                    name="tipo"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Seleccione...</option>
                    <option value="LOCAL">Local</option>
                    <option value="CONSULTORIO">Consultorio</option>
                    <option value="HABITACION">Habitación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    name="observaciones"
                    rows={3}
                    placeholder="Notas adicionales..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-sm rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md"
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
