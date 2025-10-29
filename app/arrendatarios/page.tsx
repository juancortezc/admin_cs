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
      <Navbar activeTab="Arrendatarios" />

      <main className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
        {/* Header con buscador y botón nuevo */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
            <div>
              <h1 className="text-xl font-bold text-zinc-900">Arrendatarios</h1>
              <p className="text-xs text-zinc-600 mt-0.5">
                {arrendatariosFiltrados.length} de {arrendatarios.length} registrados
              </p>
            </div>
            <button
              onClick={abrirModalNuevo}
              className="px-3 py-1.5 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0051D5] transition-colors shadow-sm"
            >
              + Nuevo
            </button>
          </div>

          {/* Buscador */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, email o celular..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Lista de arrendatarios */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {arrendatariosFiltrados.map((arr) => (
            <div
              key={arr.id}
              className="bg-white rounded-xl border border-zinc-200 p-3"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-semibold text-zinc-900 flex-1">
                  {arr.nombre}
                </h3>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => abrirModalEditar(arr)}
                    className="text-[#007AFF] hover:text-[#0051D5] text-xs font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(arr.id)}
                    className="text-[#FF3B30] hover:text-[#D70015] text-xs font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <div>
                  <span className="text-zinc-500 text-xs">Email:</span>
                  <p className="text-zinc-900 text-xs mt-0.5">{arr.email}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Celular:</span>
                  <p className="text-zinc-900 text-xs mt-0.5">{arr.celular}</p>
                </div>
                {arr.espacios.length > 0 && (
                  <div className="pt-1.5 border-t border-zinc-100">
                    <span className="text-zinc-500 text-xs">Espacios:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {arr.espacios.map((esp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs bg-[#007AFF]/10 text-[#007AFF] font-medium rounded-md"
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
            <p className="text-zinc-500 text-sm">
              {busqueda ? 'No se encontraron arrendatarios' : 'No hay arrendatarios registrados'}
            </p>
            {!busqueda && (
              <button
                onClick={abrirModalNuevo}
                className="mt-3 px-3 py-1.5 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0051D5] transition-colors"
              >
                Crear el primero
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modal para crear/editar - Apple style */}
      {modalAbierto && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setModalAbierto(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {editando ? 'Editar Arrendatario' : 'Nuevo Arrendatario'}
                  </h2>
                  <button
                    onClick={() => setModalAbierto(false)}
                    className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleGuardar} className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                    Celular *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.celular}
                    onChange={(e) =>
                      setFormData({ ...formData, celular: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    disabled={guardando}
                    className="flex-1 px-4 py-2.5 border border-zinc-300 text-zinc-900 font-medium text-sm rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
                    className="flex-1 px-4 py-2.5 bg-[#007AFF] text-white font-medium text-sm rounded-lg hover:bg-[#0051D5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {guardando ? 'Guardando...' : 'Guardar'}
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
