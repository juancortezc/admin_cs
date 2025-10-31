/**
 * Página Todos los Cobros - Casa del Sol
 * Vista de tabla Excel con todos los cobros y selector de mes
 */

'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/app/components/Navbar'
import { useRouter } from 'next/navigation'

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
    arrendatario: {
      nombre: string
    } | null
  }
}

export default function CobrosPage() {
  const router = useRouter()
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'todos' | 'parciales' | 'espacios'>('todos')

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [mesSeleccionado, setMesSeleccionado] = useState('')

  // Inicializar con el mes actual
  useEffect(() => {
    const now = new Date()
    const mesActual = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
    setMesSeleccionado(mesActual)
  }, [])

  // Cargar cobros
  const cargarCobros = () => {
    if (!mesSeleccionado) return

    setLoading(true)

    const params = new URLSearchParams()
    if (busqueda) params.append('busqueda', busqueda)

    // Filtrar por mes
    const [year, month] = mesSeleccionado.split('-')
    const fechaInicio = `${year}-${month}-01`
    const ultimoDia = new Date(parseInt(year), parseInt(month), 0).getDate()
    const fechaFin = `${year}-${month}-${ultimoDia}`

    params.append('fechaInicio', fechaInicio)
    params.append('fechaFin', fechaFin)

    fetch(`/api/cobros?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        // Ordenar por fecha descendente
        const cobrosOrdenados = data.cobros.sort((a: Cobro, b: Cobro) => {
          return new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime()
        })
        setCobros(cobrosOrdenados)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error:', error)
        setLoading(false)
      })
  }

  useEffect(() => {
    if (mesSeleccionado) {
      cargarCobros()
    }
  }, [mesSeleccionado])

  const handleFiltrar = () => {
    cargarCobros()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Navbar activeTab="Estado de cuenta" />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Navigation Buttons + Back Button + Filters (Primera Fila) */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Left: Back button + Navigation buttons */}
            <div className="flex items-center gap-3 flex-wrap">
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

              {/* Navigation Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setActiveView('espacios')
                    router.push('/cobros/espacios')
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeView === 'espacios'
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200 transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Por Espacio
                </button>
                <button
                  onClick={() => setActiveView('todos')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeView === 'todos'
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200 transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Todos los Cobros
                </button>
                <button
                  onClick={() => {
                    setActiveView('parciales')
                    router.push('/cobros/parciales')
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeView === 'parciales'
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200 transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Pagos Parciales
                </button>
              </div>
            </div>

            {/* Right: Selector de Mes + Búsqueda + Filtrar */}
            <div className="flex gap-2 items-center flex-wrap">
              {/* Selector de Mes */}
              <input
                type="month"
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              />

              {/* Búsqueda compacta */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFiltrar()}
                  className="w-48 px-4 py-2 pl-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white"
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

              {/* Botón Filtrar */}
              <button
                onClick={handleFiltrar}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-sm font-medium"
              >
                Filtrar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Cobros (Excel-like) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Código</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Fecha</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Espacio</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Arrendatario</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Concepto</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold">Monto Pactado</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold">Monto Pagado</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold">Estado</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cobros.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      No se encontraron cobros para este mes
                    </td>
                  </tr>
                ) : (
                  cobros.map((cobro) => (
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
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {cobro.espacio.identificador}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {cobro.espacio.arrendatario?.nombre || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{cobro.concepto}</td>
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
              Total: <span className="font-semibold text-gray-900">{cobros.length}</span> registro(s)
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
