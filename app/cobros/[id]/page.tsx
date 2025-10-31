/**
 * Página de Detalle de Cobro - Casa del Sol
 * Vista detallada editable de un cobro individual con Material Design
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/app/components/Navbar'

type Cobro = {
  id: string
  codigoInterno: string
  espacioId: string
  concepto: string
  conceptoPersonalizado: string | null
  periodo: string | null
  montoPagado: number
  montoPactado: number
  diferencia: number
  fechaPago: string
  fechaVencimiento: string
  diasDiferencia: number | null
  metodoPago: string
  numeroComprobante: string | null
  estado: string
  observaciones: string | null
  esParcial: boolean
  espacio: {
    identificador: string
    tipo: string
    arrendatario: {
      nombre: string
    } | null
  }
}

export default function CobroDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [cobro, setCobro] = useState<Cobro | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [confirmacionEliminar, setConfirmacionEliminar] = useState('')
  const [eliminando, setEliminando] = useState(false)

  // Form state para edición
  const [formData, setFormData] = useState({
    montoPagado: 0,
    montoPactado: 0,
    metodoPago: '',
    numeroComprobante: '',
    observaciones: '',
    estado: '',
  })

  useEffect(() => {
    if (params?.id) {
      cargarCobro()
    }
  }, [params?.id])

  const cargarCobro = async () => {
    try {
      setCargando(true)
      setError(null)
      const response = await fetch(`/api/cobros/${params?.id}`)

      if (!response.ok) {
        throw new Error('Cobro no encontrado')
      }

      const data = await response.json()
      setCobro(data)

      // Inicializar form data
      setFormData({
        montoPagado: data.montoPagado,
        montoPactado: data.montoPactado,
        metodoPago: data.metodoPago,
        numeroComprobante: data.numeroComprobante || '',
        observaciones: data.observaciones || '',
        estado: data.estado,
      })
    } catch (error) {
      console.error('Error al cargar cobro:', error)
      setError('No se pudo cargar el cobro')
    } finally {
      setCargando(false)
    }
  }

  const handleGuardar = async () => {
    if (!cobro) return

    try {
      setGuardando(true)
      const response = await fetch(`/api/cobros/${cobro.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar cobro')
      }

      const data = await response.json()
      setCobro(data)
      setModoEdicion(false)
      alert('Cobro actualizado exitosamente')
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('Error al guardar los cambios')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async () => {
    if (!cobro) return

    if (confirmacionEliminar !== cobro.codigoInterno) {
      alert('El código ingresado no coincide')
      return
    }

    try {
      setEliminando(true)
      const response = await fetch(`/api/cobros/${cobro.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar cobro')
      }

      alert('Cobro eliminado exitosamente')
      router.push('/cobros/espacios')
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert('Error al eliminar el cobro')
    } finally {
      setEliminando(false)
      setModalEliminar(false)
    }
  }

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'PAGADO':
      case 'COBRADO':
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20'
      case 'PENDIENTE':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20'
      case 'PARCIAL':
        return 'bg-orange-500/10 text-orange-700 border-orange-500/20'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <Navbar activeTab="Estado de cuenta" />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 font-medium">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !cobro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <Navbar activeTab="Estado de cuenta" />
        <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Cobro no encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/cobros/espacios')}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-semibold"
              >
                Volver
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Navbar activeTab="Estado de cuenta" />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header con Back Button + Título + Acciones */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Left: Back button + Título */}
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all"
                title="Volver"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>

              {/* Título */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{cobro.codigoInterno}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {cobro.espacio.identificador} • {cobro.espacio.arrendatario?.nombre || 'Sin arrendatario'}
                </p>
              </div>
            </div>

            {/* Right: Botones de acción */}
            {!modoEdicion ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setModoEdicion(true)}
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-semibold flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={() => setModalEliminar(true)}
                  className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all font-semibold flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Eliminar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setModoEdicion(false)
                    setFormData({
                      montoPagado: cobro.montoPagado,
                      montoPactado: cobro.montoPactado,
                      metodoPago: cobro.metodoPago,
                      numeroComprobante: cobro.numeroComprobante || '',
                      observaciones: cobro.observaciones || '',
                      estado: cobro.estado,
                    })
                  }}
                  className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all font-semibold"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  disabled={guardando}
                  className="px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-semibold flex items-center gap-2 disabled:opacity-50"
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
            )}
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal - Información del Cobro */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Principal */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Información del Cobro</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  {modoEdicion ? (
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="PENDIENTE">PENDIENTE</option>
                      <option value="PAGADO">PAGADO</option>
                      <option value="COBRADO">COBRADO</option>
                      <option value="PARCIAL">PARCIAL</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold border ${getColorEstado(cobro.estado)}`}>
                      {cobro.estado}
                    </span>
                  )}
                </div>

                {/* Concepto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Concepto</label>
                  <p className="text-gray-900 py-2">{cobro.concepto}</p>
                </div>

                {/* Periodo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
                  <p className="text-gray-900 py-2">{cobro.periodo || '-'}</p>
                </div>

                {/* Fecha de Pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Pago</label>
                  <p className="text-gray-900 py-2">{new Date(cobro.fechaPago).toLocaleDateString('es-EC')}</p>
                </div>

                {/* Monto Pactado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monto Pactado</label>
                  {modoEdicion ? (
                    <input
                      type="number"
                      value={formData.montoPactado}
                      onChange={(e) => setFormData({ ...formData, montoPactado: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">${cobro.montoPactado.toLocaleString()}</p>
                  )}
                </div>

                {/* Monto Pagado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monto Pagado</label>
                  {modoEdicion ? (
                    <input
                      type="number"
                      value={formData.montoPagado}
                      onChange={(e) => setFormData({ ...formData, montoPagado: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-emerald-600">${cobro.montoPagado.toLocaleString()}</p>
                  )}
                </div>

                {/* Método de Pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                  {modoEdicion ? (
                    <select
                      value={formData.metodoPago}
                      onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                      <option value="EFECTIVO">EFECTIVO</option>
                      <option value="CHEQUE">CHEQUE</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2">{cobro.metodoPago}</p>
                  )}
                </div>

                {/* Número de Comprobante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Comprobante</label>
                  {modoEdicion ? (
                    <input
                      type="text"
                      value={formData.numeroComprobante}
                      onChange={(e) => setFormData({ ...formData, numeroComprobante: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      placeholder="Número de comprobante"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{cobro.numeroComprobante || '-'}</p>
                  )}
                </div>

                {/* Observaciones */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                  {modoEdicion ? (
                    <textarea
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      placeholder="Observaciones adicionales"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{cobro.observaciones || '-'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna Lateral - Info del Espacio */}
          <div className="space-y-6">
            {/* Card del Espacio */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Información del Espacio</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Identificador</p>
                  <p className="text-lg font-semibold text-indigo-600">{cobro.espacio.identificador}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <p className="text-gray-900">{cobro.espacio.tipo}</p>
                </div>

                {cobro.espacio.arrendatario && (
                  <div>
                    <p className="text-sm text-gray-600">Arrendatario</p>
                    <p className="text-gray-900">{cobro.espacio.arrendatario.nombre}</p>
                  </div>
                )}

                <button
                  onClick={() => router.push(`/cobros/historial/${cobro.espacioId}`)}
                  className="w-full mt-4 px-4 py-2 rounded-xl border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-all font-semibold"
                >
                  Ver Historial Completo
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Eliminación con Doble Confirmación */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirmar Eliminación</h3>
            </div>

            <p className="text-gray-600 mb-4">
              Esta acción no se puede deshacer. Para confirmar, escribe el código del cobro: <span className="font-bold text-gray-900">{cobro.codigoInterno}</span>
            </p>

            <input
              type="text"
              value={confirmacionEliminar}
              onChange={(e) => setConfirmacionEliminar(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent mb-4"
              placeholder="Escribe el código aquí"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalEliminar(false)
                  setConfirmacionEliminar('')
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all font-semibold"
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminando || confirmacionEliminar !== cobro.codigoInterno}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
