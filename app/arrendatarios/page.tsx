'use client'

/**
 * Página de gestión de arrendatarios - Material Design 3
 * Crear, editar, eliminar y ver arrendatarios
 */

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Importar MainNavbar sin SSR para evitar errores de prerendering
const MainNavbar = dynamic(() => import('@/app/components/MainNavbar'), {
  ssr: false,
  loading: () => <div className="h-16 bg-white border-b border-gray-200" />
})

type Arrendatario = {
  id: string
  nombre: string
  email: string
  celular: string
  espacios: {
    identificador: string
  }[]
}

export default function ArrendatariosPage() {
  const [arrendatarios, setArrendatarios] = useState<Arrendatario[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Arrendatario | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [activeTab, setActiveTab] = useState<'activos' | 'inactivos'>('activos')

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    celular: '',
  })

  // Cargar arrendatarios
  const cargarArrendatarios = () => {
    setLoading(true)
    fetch('/api/arrendatarios')
      .then((r) => r.json())
      .then((data) => {
        setArrendatarios(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error:', error)
        setLoading(false)
      })
  }

  useEffect(() => {
    cargarArrendatarios()
  }, [])

  // Abrir modal para crear
  const abrirModalNuevo = () => {
    setEditando(null)
    setFormData({ nombre: '', email: '', celular: '' })
    setModalAbierto(true)
  }

  // Abrir modal para editar
  const abrirModalEditar = (arr: Arrendatario) => {
    setEditando(arr)
    setFormData({
      nombre: arr.nombre,
      email: arr.email,
      celular: arr.celular,
    })
    setModalAbierto(true)
  }

  // Guardar (crear o actualizar)
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    try {
      const url = editando
        ? `/api/arrendatarios/${editando.id}`
        : '/api/arrendatarios'
      const method = editando ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        cargarArrendatarios()
        setModalAbierto(false)
      } else {
        const error = await res.json()
        alert(error.error || 'Error al guardar')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  // Eliminar arrendatario
  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este arrendatario?')) return

    try {
      const res = await fetch(`/api/arrendatarios/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        cargarArrendatarios()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar')
    }
  }

  // Filtrar arrendatarios por búsqueda y tab
  const arrendatariosFiltrados = arrendatarios.filter((arr) => {
    // Filtrar por activos/inactivos (los que tienen espacios vs los que no)
    if (activeTab === 'activos' && arr.espacios.length === 0) return false
    if (activeTab === 'inactivos' && arr.espacios.length > 0) return false

    if (!busqueda) return true
    const search = busqueda.toLowerCase()
    return (
      arr.nombre.toLowerCase().includes(search) ||
      arr.email.toLowerCase().includes(search) ||
      arr.celular.toLowerCase().includes(search)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar activeSection="arrendatarios" />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar activeSection="arrendatarios" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Arrendatarios</h1>

          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('activos')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'activos'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Activos
              </button>
              <button
                onClick={() => setActiveTab('inactivos')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'inactivos'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Inactivos
              </button>
            </div>

            <button
              onClick={abrirModalNuevo}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total</p>
                <p className="text-xl font-bold text-gray-900">{arrendatarios.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Activos</p>
                <p className="text-xl font-bold text-emerald-600">
                  {arrendatarios.filter(a => a.espacios.length > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Inactivos</p>
                <p className="text-xl font-bold text-gray-600">
                  {arrendatarios.filter(a => a.espacios.length === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Buscar arrendatario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-2 pl-10 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Lista de arrendatarios */}
        {arrendatariosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-base font-semibold text-gray-900">
              {busqueda ? 'No se encontraron arrendatarios' : 'No hay arrendatarios'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {busqueda ? 'Intenta con otros términos' : 'Comienza creando uno nuevo'}
            </p>
            {!busqueda && (
              <button
                onClick={abrirModalNuevo}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Crear Arrendatario
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {arrendatariosFiltrados.map((arr) => (
                <div
                  key={arr.id}
                  className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-12 rounded-full ${
                      arr.espacios.length > 0 ? 'bg-emerald-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <p className="font-semibold text-gray-900">{arr.nombre}</p>
                      <p className="text-sm text-gray-500">{arr.email} • {arr.celular}</p>
                      {arr.espacios.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {arr.espacios.map((esp, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 font-medium rounded"
                            >
                              {esp.identificador}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => abrirModalEditar(arr)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEliminar(arr.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-500">
                {arrendatariosFiltrados.length} arrendatario(s)
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Modal para crear/editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editando ? 'Editar Arrendatario' : 'Nuevo Arrendatario'}
                </h2>
                <button
                  onClick={() => setModalAbierto(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleGuardar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Celular *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.celular}
                  onChange={(e) =>
                    setFormData({ ...formData, celular: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0999999999"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  disabled={guardando}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {guardando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
