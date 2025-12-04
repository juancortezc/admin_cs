/**
 * Admin - Gestión de Empleados
 * CRUD de empleados con registro de pagos de salario
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import MainNavbar from '../../components/MainNavbar'
import Toast from '../../components/Toast'

type PagoSalario = {
  id: string
  periodo: string
  monto: number
  bonos: number
  descuentos: number
  total: number
  fechaPago: string
  formaPago: string | null
  referencia: string | null
  observaciones: string | null
}

type Empleado = {
  id: string
  nombre: string
  celular: string
  email: string | null
  cargo: string
  salario: number
  diaPago: number
  fechaContratacion: string
  activo: boolean
  pagosSalario: PagoSalario[]
}

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalPagoOpen, setModalPagoOpen] = useState(false)
  const [editando, setEditando] = useState<Empleado | null>(null)
  const [empleadoPago, setEmpleadoPago] = useState<Empleado | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState<{ message: string; tipo: 'success' | 'error' } | null>(null)
  const [filtroActivos, setFiltroActivos] = useState(true)

  // Form state para empleado
  const [formData, setFormData] = useState({
    nombre: '',
    celular: '',
    email: '',
    cargo: '',
    salario: '',
    diaPago: '15',
    fechaContratacion: new Date().toISOString().split('T')[0],
    activo: true,
  })

  // Form state para pago de salario
  const [formPago, setFormPago] = useState({
    periodo: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    monto: '',
    bonos: '0',
    descuentos: '0',
    fechaPago: new Date().toISOString().split('T')[0],
    formaPago: 'TRANSFERENCIA',
    referencia: '',
    observaciones: '',
  })

  const cargarEmpleados = useCallback(async () => {
    try {
      const res = await fetch('/api/empleados')
      if (res.ok) {
        setEmpleados(await res.json())
      }
    } catch (error) {
      console.error('Error cargando empleados:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarEmpleados()
  }, [cargarEmpleados])

  const abrirModal = (empleado?: Empleado) => {
    if (empleado) {
      setEditando(empleado)
      setFormData({
        nombre: empleado.nombre,
        celular: empleado.celular,
        email: empleado.email || '',
        cargo: empleado.cargo,
        salario: empleado.salario.toString(),
        diaPago: empleado.diaPago.toString(),
        fechaContratacion: new Date(empleado.fechaContratacion).toISOString().split('T')[0],
        activo: empleado.activo,
      })
    } else {
      setEditando(null)
      setFormData({
        nombre: '',
        celular: '',
        email: '',
        cargo: '',
        salario: '',
        diaPago: '15',
        fechaContratacion: new Date().toISOString().split('T')[0],
        activo: true,
      })
    }
    setModalOpen(true)
  }

  const abrirModalPago = (empleado: Empleado) => {
    setEmpleadoPago(empleado)
    setFormPago({
      periodo: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      monto: empleado.salario.toString(),
      bonos: '0',
      descuentos: '0',
      fechaPago: new Date().toISOString().split('T')[0],
      formaPago: 'TRANSFERENCIA',
      referencia: '',
      observaciones: '',
    })
    setModalPagoOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    try {
      const body = {
        ...formData,
        email: formData.email || null,
      }

      const url = editando ? `/api/empleados/${editando.id}` : '/api/empleados'
      const method = editando ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setToast({ message: editando ? 'Empleado actualizado' : 'Empleado creado', tipo: 'success' })
        setModalOpen(false)
        cargarEmpleados()
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

  const handleSubmitPago = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empleadoPago) return
    setGuardando(true)

    try {
      const monto = parseFloat(formPago.monto)
      const bonos = parseFloat(formPago.bonos)
      const descuentos = parseFloat(formPago.descuentos)

      const body = {
        empleadoId: empleadoPago.id,
        periodo: formPago.periodo,
        monto,
        bonos,
        descuentos,
        total: monto + bonos - descuentos,
        fechaPago: formPago.fechaPago,
        formaPago: formPago.formaPago,
        referencia: formPago.referencia || null,
        observaciones: formPago.observaciones || null,
      }

      const res = await fetch('/api/pagos/salarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setToast({ message: 'Pago registrado', tipo: 'success' })
        setModalPagoOpen(false)
        cargarEmpleados()
      } else {
        const error = await res.json()
        setToast({ message: error.error || 'Error al registrar pago', tipo: 'error' })
      }
    } catch (error) {
      console.error('Error:', error)
      setToast({ message: 'Error al registrar pago', tipo: 'error' })
    } finally {
      setGuardando(false)
    }
  }

  const handleDesactivar = async (id: string) => {
    if (!confirm('¿Desactivar este empleado?')) return

    try {
      const res = await fetch(`/api/empleados/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setToast({ message: 'Empleado desactivado', tipo: 'success' })
        cargarEmpleados()
      } else {
        setToast({ message: 'Error al desactivar', tipo: 'error' })
      }
    } catch (error) {
      console.error('Error:', error)
      setToast({ message: 'Error al desactivar', tipo: 'error' })
    }
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const empleadosFiltrados = empleados.filter(e => filtroActivos ? e.activo : !e.activo)

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
            <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
            <p className="text-sm text-gray-500 mt-1">Gestión de empleados y salarios</p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Empleado
          </button>
        </div>

        {/* Filtro Activos/Inactivos */}
        <div className="flex gap-2">
          <button
            onClick={() => setFiltroActivos(true)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filtroActivos ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Activos ({empleados.filter(e => e.activo).length})
          </button>
          <button
            onClick={() => setFiltroActivos(false)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              !filtroActivos ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Inactivos ({empleados.filter(e => !e.activo).length})
          </button>
        </div>

        {/* Grid de empleados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {empleadosFiltrados.map(empleado => (
            <div
              key={empleado.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-lg font-bold text-indigo-600">
                    {empleado.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{empleado.nombre}</h3>
                    <p className="text-sm text-gray-500">{empleado.cargo}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  empleado.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {empleado.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {empleado.celular}
                </div>
                {empleado.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {empleado.email}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Salario Mensual</p>
                    <p className="text-lg font-bold text-gray-900">{formatMoney(empleado.salario)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Día de pago</p>
                    <p className="font-semibold text-gray-900">{empleado.diaPago}</p>
                  </div>
                </div>
              </div>

              {/* Último pago */}
              {empleado.pagosSalario?.length > 0 && (
                <div className="mb-4 text-sm">
                  <p className="text-xs text-gray-500 mb-1">Último pago</p>
                  <div className="flex justify-between text-gray-700">
                    <span>{empleado.pagosSalario[0].periodo}</span>
                    <span className="font-medium">{formatMoney(empleado.pagosSalario[0].total)}</span>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => abrirModalPago(empleado)}
                  disabled={!empleado.activo}
                  className="flex-1 px-3 py-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pagar Salario
                </button>
                <button
                  onClick={() => abrirModal(empleado)}
                  className="px-3 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {empleado.activo && (
                  <button
                    onClick={() => handleDesactivar(empleado.id)}
                    className="px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}

          {empleadosFiltrados.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-500">
                {filtroActivos ? 'No hay empleados activos' : 'No hay empleados inactivos'}
              </p>
              {filtroActivos && (
                <button
                  onClick={() => abrirModal()}
                  className="mt-4 text-indigo-600 font-medium text-sm hover:text-indigo-700"
                >
                  Agregar primer empleado
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Empleado */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full">
              {/* Header */}
              <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editando ? 'Editar Empleado' : 'Nuevo Empleado'}
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

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Celular</label>
                    <input
                      type="tel"
                      value={formData.celular}
                      onChange={e => setFormData({ ...formData, celular: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="09XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (opcional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cargo</label>
                    <input
                      type="text"
                      value={formData.cargo}
                      onChange={e => setFormData({ ...formData, cargo: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ej: Conserje"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Salario</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.salario}
                      onChange={e => setFormData({ ...formData, salario: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Día de Pago</label>
                    <select
                      value={formData.diaPago}
                      onChange={e => setFormData({ ...formData, diaPago: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha Contratación</label>
                    <input
                      type="date"
                      value={formData.fechaContratacion}
                      onChange={e => setFormData({ ...formData, fechaContratacion: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {editando && (
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
                    <span className="text-sm text-gray-700">Empleado activo</span>
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
                    {guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago de Salario */}
      {modalPagoOpen && empleadoPago && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setModalPagoOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full">
              {/* Header */}
              <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Registrar Pago de Salario</h2>
                  <p className="text-sm text-gray-500">{empleadoPago.nombre}</p>
                </div>
                <button
                  onClick={() => setModalPagoOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitPago} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Período</label>
                    <input
                      type="month"
                      value={formPago.periodo}
                      onChange={e => setFormPago({ ...formPago, periodo: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de Pago</label>
                    <input
                      type="date"
                      value={formPago.fechaPago}
                      onChange={e => setFormPago({ ...formPago, fechaPago: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Salario Base</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formPago.monto}
                      onChange={e => setFormPago({ ...formPago, monto: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Forma de Pago</label>
                    <select
                      value={formPago.formaPago}
                      onChange={e => setFormPago({ ...formPago, formaPago: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="TRANSFERENCIA">Transferencia</option>
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bonos</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formPago.bonos}
                      onChange={e => setFormPago({ ...formPago, bonos: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Descuentos</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formPago.descuentos}
                      onChange={e => setFormPago({ ...formPago, descuentos: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Referencia (opcional)</label>
                    <input
                      type="text"
                      value={formPago.referencia}
                      onChange={e => setFormPago({ ...formPago, referencia: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Número de transferencia o cheque"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Observaciones</label>
                    <textarea
                      value={formPago.observaciones}
                      onChange={e => setFormPago({ ...formPago, observaciones: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      placeholder="Notas adicionales..."
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-between">
                  <span className="font-medium text-emerald-700">Total a Pagar</span>
                  <span className="text-xl font-bold text-emerald-700">
                    {formatMoney(
                      parseFloat(formPago.monto || '0') +
                      parseFloat(formPago.bonos || '0') -
                      parseFloat(formPago.descuentos || '0')
                    )}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalPagoOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {guardando ? 'Registrando...' : 'Registrar Pago'}
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
