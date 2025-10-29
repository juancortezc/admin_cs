/**
 * Página de gestión de arrendatarios
 * Crear, editar, eliminar y ver arrendatarios
 */

'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/app/components/Navbar'

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="Arrendatarios" />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header con buscador y botón nuevo */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Arrendatarios</h1>
              <p className="text-sm text-gray-600 mt-1">
                {arrendatariosFiltrados.length} de {arrendatarios.length} registrados
              </p>
            </div>
            <button
              onClick={abrirModalNuevo}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Nuevo
            </button>
          </div>

          {/* Buscador */}
          <input
            type="text"
            placeholder="Buscar por nombre, email o celular..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
          />
        </div>

        {/* Lista de arrendatarios */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {arrendatariosFiltrados.map((arr) => (
            <div
              key={arr.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {arr.nombre}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => abrirModalEditar(arr)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(arr.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="text-gray-900">{arr.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Celular:</span>
                  <p className="text-gray-900">{arr.celular}</p>
                </div>
                {arr.espacios.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-gray-600 text-xs">Espacios:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {arr.espacios.map((esp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {esp.identificador}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {arrendatariosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {busqueda ? 'No se encontraron arrendatarios' : 'No hay arrendatarios registrados'}
            </p>
            {!busqueda && (
              <button
                onClick={abrirModalNuevo}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear el primero
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modal para crear/editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editando ? 'Editar Arrendatario' : 'Nuevo Arrendatario'}
            </h2>

            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Celular *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.celular}
                  onChange={(e) =>
                    setFormData({ ...formData, celular: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
