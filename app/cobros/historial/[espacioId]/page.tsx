/**
 * Página de Historial de Cobros por Espacio - Casa del Sol
 * Vista detallada Excel-like de todos los cobros de un espacio específico
 */

'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/app/components/Navbar'
import { useRouter } from 'next/navigation'
import { use } from 'react'

type Cobro = {
  id: string
  codigoInterno: string
  concepto: string
  conceptoPersonalizado: string | null
  periodo: string | null
  montoPagado: number
  montoPactado: number
  diferencia: number
  fechaPago: string
  fechaVencimiento: string
  metodoPago: string
  numeroComprobante: string | null
  estado: string
  observaciones: string | null
  esParcial: boolean
}

type Espacio = {
  id: string
  identificador: string
  tipo: string
  montoPactado: number | null
  arrendatario: {
    nombre: string
  } | null
}

export default function HistorialEspacioPage({
  params,
}: {
  params: Promise<{ espacioId: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [espacio, setEspacio] = useState<Espacio | null>(null)
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [resolvedParams.espacioId])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      // Cargar información del espacio
      const espacioRes = await fetch(`/api/espacios/${resolvedParams.espacioId}`)
      const espacioData = await espacioRes.json()
      setEspacio(espacioData)

      // Cargar cobros del espacio
      const cobrosRes = await fetch(`/api/cobros/historial/${resolvedParams.espacioId}`)
      const cobrosData = await cobrosRes.json()

      // Ordenar por fecha descendente
      const cobrosOrdenados = cobrosData.sort((a: Cobro, b: Cobro) => {
        return new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime()
      })

      setCobros(cobrosOrdenados)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const cobrosFiltrados = cobros.filter((cobro) => {
    if (busqueda === '') return true

    return (
      cobro.codigoInterno.toLowerCase().includes(busqueda.toLowerCase()) ||
      cobro.concepto.toLowerCase().includes(busqueda.toLowerCase()) ||
      (cobro.periodo && cobro.periodo.toLowerCase().includes(busqueda.toLowerCase()))
    )
  })

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

  const totalRecaudado = cobros.reduce((sum, c) => sum + c.montoPagado, 0)
  const totalPactado = cobros.reduce((sum, c) => sum + c.montoPactado, 0)

  if (loading) {
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

  if (!espacio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <Navbar activeTab="Estado de cuenta" />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Espacio no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Navbar activeTab="Estado de cuenta" />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header con Back Button + Título + Búsqueda */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Left: Back button + Título */}
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <button
                onClick={() => router.push('/cobros/espacios')}
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

              {/* Título con info del espacio */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Historial de Cobros - {espacio.identificador}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {espacio.tipo}
                  {espacio.arrendatario && ` • ${espacio.arrendatario.nombre}`}
                </p>
              </div>
            </div>

            {/* Right: Búsqueda */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar cobro..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-64 px-4 py-2 pl-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="text-sm text-gray-600 mb-1">Total de Cobros</div>
            <div className="text-3xl font-bold text-gray-900">{cobros.length}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="text-sm text-gray-600 mb-1">Total Recaudado</div>
            <div className="text-3xl font-bold text-emerald-600">
              ${totalRecaudado.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="text-sm text-gray-600 mb-1">Total Pactado</div>
            <div className="text-3xl font-bold text-gray-900">
              ${totalPactado.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Tabla Excel-like de Cobros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Código</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Fecha Pago</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Periodo</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Concepto</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Método</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold">Monto Pactado</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold">Monto Pagado</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold">Estado</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cobrosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      No se encontraron cobros
                    </td>
                  </tr>
                ) : (
                  cobrosFiltrados.map((cobro) => (
                    <tr
                      key={cobro.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/cobros/${cobro.id}`)}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-indigo-600">
                        {cobro.codigoInterno}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(cobro.fechaPago).toLocaleDateString('es-EC')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {cobro.periodo || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{cobro.concepto}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{cobro.metodoPago}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        ${cobro.montoPactado.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-emerald-600">
                        ${cobro.montoPagado.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getColorEstado(
                            cobro.estado
                          )}`}
                        >
                          {cobro.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/cobros/${cobro.id}`)
                            }}
                            className="p-2 rounded-lg hover:bg-indigo-50 transition-all"
                            title="Ver detalles"
                          >
                            <svg
                              className="w-4 h-4 text-indigo-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer con total de registros */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total: <span className="font-semibold text-gray-900">{cobrosFiltrados.length}</span>{' '}
              cobro(s)
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
