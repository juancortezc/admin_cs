/**
 * Página de Cobros por Espacio - Casa del Sol
 * Vista agrupada de cobros organizados por espacio
 */

'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/app/components/Navbar'
import Link from 'next/link'

type CobroPorEspacio = {
  espacioId: string
  espacioIdentificador: string
  espacioTipo: string
  arrendatarioNombre: string | null
  totalCobros: number
  totalRecaudado: number
  montoPactadoMensual: number | null
  ultimoPago: {
    fecha: string
    monto: number
    estado: string
  } | null
  cobros: {
    id: string
    codigoInterno: string
    periodo: string | null
    montoPagado: number
    montoPactado: number
    fechaPago: string
    estado: string
    concepto: string
  }[]
}

export default function EspaciosPage() {
  const [espacios, setEspacios] = useState<CobroPorEspacio[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')

  useEffect(() => {
    cargarCobrosEspacios()
  }, [])

  const cargarCobrosEspacios = async () => {
    try {
      setCargando(true)
      const response = await fetch('/api/cobros?agruparPorEspacio=true')
      const data = await response.json()

      // Transform data to group by space
      const espaciosMap = new Map<string, CobroPorEspacio>()

      data.cobros.forEach((cobro: any) => {
        const espacioId = cobro.espacioId

        if (!espaciosMap.has(espacioId)) {
          espaciosMap.set(espacioId, {
            espacioId,
            espacioIdentificador: cobro.espacio.identificador,
            espacioTipo: cobro.espacio.tipo,
            arrendatarioNombre: cobro.espacio.arrendatario?.nombre || null,
            totalCobros: 0,
            totalRecaudado: 0,
            montoPactadoMensual: cobro.espacio.montoPactado,
            ultimoPago: null,
            cobros: [],
          })
        }

        const espacio = espaciosMap.get(espacioId)!
        espacio.totalCobros++
        espacio.totalRecaudado += cobro.montoPagado
        espacio.cobros.push({
          id: cobro.id,
          codigoInterno: cobro.codigoInterno,
          periodo: cobro.periodo,
          montoPagado: cobro.montoPagado,
          montoPactado: cobro.montoPactado,
          fechaPago: cobro.fechaPago,
          estado: cobro.estado,
          concepto: cobro.concepto,
        })

        // Update last payment
        if (!espacio.ultimoPago || new Date(cobro.fechaPago) > new Date(espacio.ultimoPago.fecha)) {
          espacio.ultimoPago = {
            fecha: cobro.fechaPago,
            monto: cobro.montoPagado,
            estado: cobro.estado,
          }
        }
      })

      // Sort cobros within each space by date descending
      espaciosMap.forEach((espacio) => {
        espacio.cobros.sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime())
      })

      const espaciosArray = Array.from(espaciosMap.values())
      // Sort by total recaudado descending
      espaciosArray.sort((a, b) => b.totalRecaudado - a.totalRecaudado)

      setEspacios(espaciosArray)
    } catch (error) {
      console.error('Error al cargar cobros por espacio:', error)
    } finally {
      setCargando(false)
    }
  }

  const espaciosFiltrados = espacios.filter((espacio) => {
    const matchBusqueda =
      busqueda === '' ||
      espacio.espacioIdentificador.toLowerCase().includes(busqueda.toLowerCase()) ||
      espacio.arrendatarioNombre?.toLowerCase().includes(busqueda.toLowerCase())

    const matchTipo = filtroTipo === 'todos' || espacio.espacioTipo === filtroTipo

    return matchBusqueda && matchTipo
  })

  const totalRecaudadoGeneral = espacios.reduce((sum, e) => sum + e.totalRecaudado, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="Cobros" />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/cobros" className="hover:text-gray-700">
              Cobros
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Por Espacio</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Cobros por Espacio</h1>
              <p className="mt-2 text-sm text-gray-600">
                Historial de cobros agrupado por espacio arrendado
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <Link
              href="/cobros"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Todos los Cobros
            </Link>
            <Link
              href="/cobros/parciales"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Pagos Parciales
            </Link>
            <Link
              href="/cobros/espacios"
              className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Por Espacio
            </Link>
          </nav>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Espacio o Arrendatario
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Ej: L-001 o LORENA PAEZ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Espacio</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="LOCAL">Local</option>
                <option value="CONSULTORIO">Consultorio</option>
                <option value="HABITACION">Habitación</option>
                <option value="OFICINA">Oficina</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500">Espacios con Cobros</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {espaciosFiltrados.length}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500">Total Recaudado</div>
            <div className="mt-2 text-3xl font-semibold text-green-600">
              ${totalRecaudadoGeneral.toFixed(2)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500">Total de Cobros</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {espacios.reduce((sum, e) => sum + e.totalCobros, 0)}
            </div>
          </div>
        </div>

        {/* Content */}
        {cargando ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Cargando cobros por espacio...</p>
          </div>
        ) : espaciosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No se encontraron espacios
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar los filtros de búsqueda.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {espaciosFiltrados.map((espacio) => (
              <div
                key={espacio.espacioId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Space Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/espacios/${espacio.espacioId}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {espacio.espacioIdentificador}
                      </Link>
                      <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {espacio.espacioTipo}
                      </span>
                      {espacio.arrendatarioNombre && (
                        <span className="text-sm text-gray-600">• {espacio.arrendatarioNombre}</span>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total Recaudado</div>
                      <div className="text-2xl font-semibold text-green-600">
                        ${espacio.totalRecaudado.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-6 mt-3 text-sm">
                    <div>
                      <span className="text-gray-500">Cobros registrados:</span>{' '}
                      <span className="font-medium text-gray-900">{espacio.totalCobros}</span>
                    </div>
                    {espacio.montoPactadoMensual && (
                      <div>
                        <span className="text-gray-500">Monto mensual:</span>{' '}
                        <span className="font-medium text-gray-900">
                          ${espacio.montoPactadoMensual.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {espacio.ultimoPago && (
                      <div>
                        <span className="text-gray-500">Último pago:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {new Date(espacio.ultimoPago.fecha).toLocaleDateString('es-EC')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cobros List */}
                <div className="divide-y divide-gray-200">
                  {espacio.cobros.slice(0, 5).map((cobro) => (
                    <Link
                      key={cobro.id}
                      href={`/cobros/${cobro.id}`}
                      className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-blue-600">{cobro.codigoInterno}</div>
                        <div className="text-sm text-gray-600">
                          {cobro.periodo || new Date(cobro.fechaPago).toLocaleDateString('es-EC')}
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {cobro.concepto}
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded ${
                            cobro.estado === 'PAGADO'
                              ? 'bg-green-100 text-green-800'
                              : cobro.estado === 'PENDIENTE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {cobro.estado}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        ${cobro.montoPagado.toFixed(2)}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Show more link */}
                {espacio.cobros.length > 5 && (
                  <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-200">
                    <Link
                      href={`/cobros/historial/${espacio.espacioId}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Ver todos los {espacio.cobros.length} cobros →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
