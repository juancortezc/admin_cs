/**
 * Página de Detalle de Cobro - Casa del Sol
 * Vista detallada de un cobro individual con historial completo
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import Link from 'next/link'

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
  createdAt: string
  updatedAt: string
  espacio: {
    id: string
    identificador: string
    tipo: string
    montoPactado: number | null
    diaPago: number | null
    arrendatario: {
      id: string
      nombre: string
      email: string
      celular: string
    } | null
  }
  cobroRelacionado: {
    id: string
    codigoInterno: string
    montoPagado: number
    fechaPago: string
  } | null
  pagosParciales: {
    id: string
    codigoInterno: string
    montoPagado: number
    fechaPago: string
    estado: string
  }[]
}

export default function CobroDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [cobro, setCobro] = useState<Cobro | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [eliminando, setEliminando] = useState(false)

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
    } catch (error) {
      console.error('Error al cargar cobro:', error)
      setError('No se pudo cargar el cobro')
    } finally {
      setCargando(false)
    }
  }

  const handleEliminar = async () => {
    if (!cobro) return

    try {
      setEliminando(true)
      const response = await fetch(`/api/cobros/${cobro.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar cobro')
      }

      router.push('/cobros')
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert('Error al eliminar el cobro')
    } finally {
      setEliminando(false)
      setModalEliminar(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar activeTab="Cobros" />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Cargando cobro...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !cobro) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar activeTab="Cobros" />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
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
              <Link
                href="/cobros"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Volver a Cobros
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const estadoColor =
    cobro.estado === 'PAGADO'
      ? 'bg-green-100 text-green-800'
      : cobro.estado === 'PENDIENTE'
      ? 'bg-red-100 text-red-800'
      : 'bg-yellow-100 text-yellow-800'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="Cobros" />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/cobros" className="hover:text-gray-700">
            Cobros
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{cobro.codigoInterno}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold text-gray-900">{cobro.codigoInterno}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${estadoColor}`}>
                  {cobro.estado}
                </span>
                {cobro.esParcial && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Pago Parcial
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-6 text-sm">
                <div>
                  <span className="text-gray-500">Espacio:</span>{' '}
                  <Link href={`/espacios/${cobro.espacio.id}`} className="font-medium text-blue-600 hover:text-blue-700">
                    {cobro.espacio.identificador}
                  </Link>
                </div>
                {cobro.espacio.arrendatario && (
                  <div>
                    <span className="text-gray-500">Arrendatario:</span>{' '}
                    <span className="font-medium text-gray-900">{cobro.espacio.arrendatario.nombre}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Concepto:</span>{' '}
                  <span className="font-medium text-gray-900">
                    {cobro.concepto === 'OTRO' && cobro.conceptoPersonalizado
                      ? cobro.conceptoPersonalizado
                      : cobro.concepto}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setModalEliminar(true)}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Eliminar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Pago</h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Monto Pagado</div>
                  <div className="text-2xl font-semibold text-green-600">${cobro.montoPagado.toFixed(2)}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Monto Pactado</div>
                  <div className="text-2xl font-semibold text-gray-900">${cobro.montoPactado.toFixed(2)}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Diferencia</div>
                  <div
                    className={`text-2xl font-semibold ${
                      cobro.diferencia > 0
                        ? 'text-green-600'
                        : cobro.diferencia < 0
                        ? 'text-red-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {cobro.diferencia > 0 ? '+' : ''}${cobro.diferencia.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Método de Pago</div>
                  <div className="text-lg font-medium text-gray-900">{cobro.metodoPago}</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Fecha de Pago</div>
                  <div className="text-base font-medium text-gray-900">
                    {new Date(cobro.fechaPago).toLocaleDateString('es-EC', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Fecha de Vencimiento</div>
                  <div className="text-base font-medium text-gray-900">
                    {new Date(cobro.fechaVencimiento).toLocaleDateString('es-EC', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                {cobro.diasDiferencia !== null && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Días de Diferencia</div>
                    <div
                      className={`text-base font-medium ${
                        cobro.diasDiferencia > 0 ? 'text-red-600' : cobro.diasDiferencia < 0 ? 'text-green-600' : 'text-gray-900'
                      }`}
                    >
                      {cobro.diasDiferencia > 0
                        ? `${cobro.diasDiferencia} días de retraso`
                        : cobro.diasDiferencia < 0
                        ? `${Math.abs(cobro.diasDiferencia)} días anticipado`
                        : 'A tiempo'}
                    </div>
                  </div>
                )}

                {cobro.periodo && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Período</div>
                    <div className="text-base font-medium text-gray-900">{cobro.periodo}</div>
                  </div>
                )}
              </div>

              {cobro.numeroComprobante && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Número de Comprobante</div>
                  <div className="text-base font-mono font-medium text-gray-900">{cobro.numeroComprobante}</div>
                </div>
              )}

              {cobro.observaciones && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Observaciones</div>
                  <div className="text-base text-gray-900">{cobro.observaciones}</div>
                </div>
              )}
            </div>

            {/* Related Partial Payments */}
            {(cobro.cobroRelacionado || cobro.pagosParciales.length > 0) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pagos Parciales Vinculados</h2>

                {cobro.cobroRelacionado && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-2">Este pago está vinculado a:</div>
                    <Link
                      href={`/cobros/${cobro.cobroRelacionado.id}`}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-blue-600">{cobro.cobroRelacionado.codigoInterno}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(cobro.cobroRelacionado.fechaPago).toLocaleDateString('es-EC')}
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        ${cobro.cobroRelacionado.montoPagado.toFixed(2)}
                      </div>
                    </Link>
                  </div>
                )}

                {cobro.pagosParciales.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-500 mb-2">
                      Pagos vinculados a este ({cobro.pagosParciales.length}):
                    </div>
                    <div className="space-y-2">
                      {cobro.pagosParciales.map((pago) => (
                        <Link
                          key={pago.id}
                          href={`/cobros/${pago.id}`}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="font-medium text-blue-600">{pago.codigoInterno}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(pago.fechaPago).toLocaleDateString('es-EC')}
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                pago.estado === 'PAGADO'
                                  ? 'bg-green-100 text-green-800'
                                  : pago.estado === 'PENDIENTE'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {pago.estado}
                            </span>
                          </div>
                          <div className="text-lg font-semibold text-gray-900">${pago.montoPagado.toFixed(2)}</div>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total de pagos parciales:</span>
                        <span className="font-semibold text-gray-900">
                          ${(cobro.montoPagado + cobro.pagosParciales.reduce((sum, p) => sum + p.montoPagado, 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Space Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Espacio</h3>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Identificador</div>
                  <Link
                    href={`/espacios/${cobro.espacio.id}`}
                    className="text-base font-medium text-blue-600 hover:text-blue-700"
                  >
                    {cobro.espacio.identificador}
                  </Link>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Tipo</div>
                  <div className="text-base font-medium text-gray-900">{cobro.espacio.tipo}</div>
                </div>

                {cobro.espacio.montoPactado && (
                  <div>
                    <div className="text-sm text-gray-500">Monto Mensual</div>
                    <div className="text-base font-medium text-gray-900">
                      ${cobro.espacio.montoPactado.toFixed(2)}
                    </div>
                  </div>
                )}

                {cobro.espacio.diaPago && (
                  <div>
                    <div className="text-sm text-gray-500">Día de Pago</div>
                    <div className="text-base font-medium text-gray-900">Día {cobro.espacio.diaPago}</div>
                  </div>
                )}
              </div>

              {cobro.espacio.arrendatario && (
                <>
                  <div className="my-4 border-t border-gray-200"></div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Arrendatario</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-gray-500">Nombre</div>
                      <div className="text-base font-medium text-gray-900">{cobro.espacio.arrendatario.nombre}</div>
                    </div>
                    {cobro.espacio.arrendatario.email && !cobro.espacio.arrendatario.email.includes('@temp.com') && (
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <a
                          href={`mailto:${cobro.espacio.arrendatario.email}`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {cobro.espacio.arrendatario.email}
                        </a>
                      </div>
                    )}
                    {cobro.espacio.arrendatario.celular && (
                      <div>
                        <div className="text-sm text-gray-500">Celular</div>
                        <a
                          href={`tel:${cobro.espacio.arrendatario.celular}`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {cobro.espacio.arrendatario.celular}
                        </a>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500">Creado</div>
                  <div className="text-gray-900">
                    {new Date(cobro.createdAt).toLocaleDateString('es-EC', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500">Última actualización</div>
                  <div className="text-gray-900">
                    {new Date(cobro.updatedAt).toLocaleDateString('es-EC', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar Cobro</h3>
            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro que deseas eliminar el cobro <strong>{cobro.codigoInterno}</strong>? Esta acción no se
              puede deshacer.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModalEliminar(false)}
                disabled={eliminando}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminando}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
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
