/**
 * Página de gestión de arrendatarios - Material Design 3
 * Crear, editar, eliminar y ver arrendatarios
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import TabsPill from '@/app/components/TabsPill'
import { UsersIcon, HomeIcon, ClipboardListIcon } from '@/app/components/icons'

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
  const router = useRouter()
  const [arrendatarios, setArrendatarios] = useState<Arrendatario[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Arrendatario | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [busqueda, setBusqueda] = useState('')

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

  // Filtrar arrendatarios por búsqueda
  const arrendatariosFiltrados = arrendatarios.filter((arr) => {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <Navbar activeTab="Espacios" />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 font-medium">Cargando arrendatarios...</p>
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
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Arrendatarios</h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  Gestión y registro de arrendatarios
                </p>
              </div>
            </div>
            <button
              onClick={abrirModalNuevo}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Arrendatario
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <TabsPill
            tabs={[
              { id: 'arrendatarios', nombre: 'Arrendatarios', icon: <UsersIcon /> },
              { id: 'espacios', nombre: 'Espacios', icon: <HomeIcon /> },
              { id: 'cobros', nombre: 'Cobros', icon: <ClipboardListIcon /> },
            ]}
            activeTab="arrendatarios"
            onTabChange={(tabId) => {
              if (tabId === 'espacios') router.push('/espacios')
              else if (tabId === 'cobros') router.push('/cobros')
            }}
          />
        </div>

        {/* Search and Stats */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Lista de Arrendatarios</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {arrendatariosFiltrados.length} de {arrendatarios.length} registrados
                  </p>
                </div>
              </div>
            </div>

            {/* Buscador */}
            <div className="p-6 border-t border-gray-200">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o celular..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de arrendatarios */}
        {arrendatariosFiltrados.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {arrendatariosFiltrados.map((arr) => (
              <div
                key={arr.id}
                className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                  <h3 className="text-lg font-bold text-white truncate">
                    {arr.nombre}
                  </h3>
                </div>

                <div className="p-4 space-y-3">
                  {/* Email */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-600">Email</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium truncate">{arr.email}</p>
                  </div>

                  {/* Celular */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-600">Celular</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{arr.celular}</p>
                  </div>

                  {/* Espacios */}
                  {arr.espacios.length > 0 && (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-xs font-medium text-indigo-600">Espacios ({arr.espacios.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {arr.espacios.map((esp, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-white text-indigo-700 font-semibold rounded-lg border border-indigo-200"
                          >
                            {esp.identificador}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => abrirModalEditar(arr)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(arr.id)}
                      className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {busqueda ? 'No se encontraron arrendatarios' : 'No hay arrendatarios registrados'}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {busqueda ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primer arrendatario'}
            </p>
            {!busqueda && (
              <button
                onClick={abrirModalNuevo}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold shadow-md"
              >
                Crear Primer Arrendatario
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modal para crear/editar con Material Design */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editando ? 'Editar Arrendatario' : 'Nuevo Arrendatario'}
                </h2>
                <button
                  onClick={() => setModalAbierto(false)}
                  className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleGuardar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Celular *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.celular}
                  onChange={(e) =>
                    setFormData({ ...formData, celular: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="0999999999"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
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
                      Guardar
                    </>
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
