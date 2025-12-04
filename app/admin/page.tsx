/**
 * Admin - Gestión de Usuarios y Permisos
 * CRUD de usuarios con panel de permisos granulares
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import MainNavbar from '../components/MainNavbar'
import Toast from '../components/Toast'

type Permisos = {
  paginas: {
    [key: string]: {
      ver: boolean
      crear: boolean
      editar: boolean
      eliminar: boolean
    }
  }
}

type Usuario = {
  id: string
  nombre: string
  email: string
  rol: 'ADMIN' | 'USUARIO'
  activo: boolean
  permisos: Permisos | null
  ultimoAcceso: string | null
  createdAt: string
}

// Páginas disponibles en el sistema
const PAGINAS_DISPONIBLES = [
  { id: 'inicio', nombre: 'Inicio', descripcion: 'Dashboard principal' },
  { id: 'calendario', nombre: 'Calendario', descripcion: 'Vista de calendario' },
  { id: 'espacios', nombre: 'Espacios', descripcion: 'Gestión de espacios' },
  { id: 'arrendatarios', nombre: 'Arrendatarios', descripcion: 'Gestión de arrendatarios' },
  { id: 'cobros', nombre: 'Cobros', descripcion: 'Gestión de cobros' },
  { id: 'pagos', nombre: 'Pagos', descripcion: 'Registro de pagos' },
  { id: 'airbnb', nombre: 'Airbnb', descripcion: 'Gestión de Airbnb' },
  { id: 'mantenimiento', nombre: 'Mantenimiento', descripcion: 'Tickets de mantenimiento' },
  { id: 'admin', nombre: 'Administración', descripcion: 'Gestión de usuarios' },
  { id: 'empleados', nombre: 'Empleados', descripcion: 'Gestión de empleados' },
]

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState<{ message: string; tipo: 'success' | 'error' } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'USUARIO' as 'ADMIN' | 'USUARIO',
    activo: true,
    permisos: null as Permisos | null,
  })

  const cargarUsuarios = useCallback(async () => {
    try {
      const res = await fetch('/api/usuarios')
      if (res.ok) {
        setUsuarios(await res.json())
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarUsuarios()
  }, [cargarUsuarios])

  const abrirModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditando(usuario)
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        password: '',
        rol: usuario.rol,
        activo: usuario.activo,
        permisos: usuario.permisos,
      })
    } else {
      setEditando(null)
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: 'USUARIO',
        activo: true,
        permisos: getPermisosDefault(),
      })
    }
    setModalOpen(true)
  }

  const getPermisosDefault = (): Permisos => {
    const paginas: Permisos['paginas'] = {}
    PAGINAS_DISPONIBLES.forEach(p => {
      paginas[p.id] = { ver: false, crear: false, editar: false, eliminar: false }
    })
    return { paginas }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    try {
      const body = {
        nombre: formData.nombre,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
        rol: formData.rol,
        activo: formData.activo,
        permisos: formData.rol === 'USUARIO' ? formData.permisos : null,
      }

      const url = editando ? `/api/usuarios/${editando.id}` : '/api/usuarios'
      const method = editando ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setToast({ message: editando ? 'Usuario actualizado' : 'Usuario creado', tipo: 'success' })
        setModalOpen(false)
        cargarUsuarios()
      } else {
        const error = await res.json()
        setToast({ message: error.error || 'Error al guardar', tipo: 'error' })
      }
    } catch (error) {
      console.error('Error:', error)
      setToast({ message: 'Error al guardar', tipo: 'error' })
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return

    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setToast({ message: 'Usuario eliminado', tipo: 'success' })
        cargarUsuarios()
      } else {
        setToast({ message: 'Error al eliminar', tipo: 'error' })
      }
    } catch (error) {
      console.error('Error:', error)
      setToast({ message: 'Error al eliminar', tipo: 'error' })
    }
  }

  const togglePermiso = (pagina: string, permiso: 'ver' | 'crear' | 'editar' | 'eliminar') => {
    setFormData(prev => {
      const permisos = prev.permisos || getPermisosDefault()
      const paginaPermisos = permisos.paginas[pagina] || { ver: false, crear: false, editar: false, eliminar: false }

      // Si activa ver, mantener. Si desactiva ver, desactivar todo
      if (permiso === 'ver' && paginaPermisos.ver) {
        return {
          ...prev,
          permisos: {
            ...permisos,
            paginas: {
              ...permisos.paginas,
              [pagina]: { ver: false, crear: false, editar: false, eliminar: false }
            }
          }
        }
      }

      // Si activa cualquier otro permiso, activar ver también
      const nuevoValor = !paginaPermisos[permiso]
      return {
        ...prev,
        permisos: {
          ...permisos,
          paginas: {
            ...permisos.paginas,
            [pagina]: {
              ...paginaPermisos,
              [permiso]: nuevoValor,
              ver: nuevoValor ? true : paginaPermisos.ver
            }
          }
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar activeSection="admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-sm text-gray-500 mt-1">Gestión de usuarios y permisos del sistema</p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Usuario
          </button>
        </div>

        {/* Grid de usuarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usuarios.map(usuario => (
            <div
              key={usuario.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                    usuario.rol === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {usuario.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{usuario.nombre}</h3>
                    <p className="text-sm text-gray-500">{usuario.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  usuario.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                  usuario.rol === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-indigo-50 text-indigo-700'
                }`}>
                  {usuario.rol === 'ADMIN' ? 'Administrador' : 'Usuario'}
                </span>
                {usuario.ultimoAcceso && (
                  <span className="text-xs text-gray-400">
                    Último acceso: {new Date(usuario.ultimoAcceso).toLocaleDateString('es-ES')}
                  </span>
                )}
              </div>

              {/* Permisos preview para usuarios normales */}
              {usuario.rol === 'USUARIO' && usuario.permisos && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Acceso a:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(usuario.permisos.paginas || {})
                      .filter(([, perms]) => perms.ver)
                      .slice(0, 4)
                      .map(([pagina]) => (
                        <span key={pagina} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {PAGINAS_DISPONIBLES.find(p => p.id === pagina)?.nombre || pagina}
                        </span>
                      ))}
                    {Object.entries(usuario.permisos.paginas || {}).filter(([, perms]) => perms.ver).length > 4 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        +{Object.entries(usuario.permisos.paginas || {}).filter(([, perms]) => perms.ver).length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {usuario.rol === 'ADMIN' && (
                <p className="text-xs text-purple-600 mb-4">Acceso completo al sistema</p>
              )}

              {/* Acciones */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => abrirModal(usuario)}
                  className="flex-1 px-3 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(usuario.id)}
                  className="px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {usuarios.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-gray-500">No hay usuarios registrados</p>
              <button
                onClick={() => abrirModal()}
                className="mt-4 text-indigo-600 font-medium text-sm hover:text-indigo-700"
              >
                Crear primer usuario
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Usuario */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editando ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Datos básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="usuario@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {editando ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      required={!editando}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={editando ? 'Dejar vacío para mantener' : 'Contraseña'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
                    <select
                      value={formData.rol}
                      onChange={e => setFormData({ ...formData, rol: e.target.value as 'ADMIN' | 'USUARIO' })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="USUARIO">Usuario</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                </div>

                {/* Toggle activo */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      formData.activo ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.activo ? 'translate-x-5' : ''
                    }`} />
                  </button>
                  <span className="text-sm text-gray-700">Usuario activo</span>
                </div>

                {/* Panel de permisos (solo para USUARIO) */}
                {formData.rol === 'USUARIO' && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">Permisos por Página</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Configura el acceso a cada sección del sistema</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {PAGINAS_DISPONIBLES.map(pagina => {
                        const perms = formData.permisos?.paginas?.[pagina.id] || { ver: false, crear: false, editar: false, eliminar: false }
                        return (
                          <div key={pagina.id} className="px-4 py-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{pagina.nombre}</p>
                                <p className="text-xs text-gray-500">{pagina.descripcion}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {(['ver', 'crear', 'editar', 'eliminar'] as const).map(permiso => (
                                  <button
                                    key={permiso}
                                    type="button"
                                    onClick={() => togglePermiso(pagina.id, permiso)}
                                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                                      perms[permiso]
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                                  >
                                    {permiso.charAt(0).toUpperCase() + permiso.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {formData.rol === 'ADMIN' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-purple-900">Administrador</p>
                        <p className="text-sm text-purple-700">Tiene acceso completo a todas las funciones del sistema</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} tipo={toast.tipo} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
