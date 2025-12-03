/**
 * Página de Por Espacio - Casa del Sol
 * Vista de cobros agrupados por espacio con diseño Material
 */

'use client'

import { useEffect, useState } from 'react'
import MainNavbar from '@/app/components/MainNavbar'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [espacios, setEspacios] = useState<CobroPorEspacio[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [activeView, setActiveView] = useState<'todos' | 'parciales' | 'espacios'>('espacios')

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

    return matchBusqueda
  })

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar activeSection="cobros" />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar activeSection="cobros" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">Cobros por Espacio</h1>
          </div>

          {/* Tabs de navegación */}
          <div className="flex items-center gap-2">
            <Link
              href="/cobros"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Todos
            </Link>
            <button
              className="px-4 py-2 text-sm font-medium bg-indigo-100 text-indigo-700 rounded-lg"
            >
              Por Espacio
            </button>
            <Link
              href="/cobros/parciales"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Parciales
            </Link>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Buscar espacio o arrendatario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-2 pl-10 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Espacios Cards */}
        {espaciosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">No se encontraron espacios</p>
          </div>
        ) : (
          <div className="space-y-4">
            {espaciosFiltrados.map((espacio) => (
              <div
                key={espacio.espacioId}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all"
              >
                {/* Space Header */}
                <div className="px-4 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/espacios/${espacio.espacioId}`}
                        className="text-base font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                      >
                        {espacio.espacioIdentificador}
                      </Link>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {espacio.espacioTipo}
                      </span>
                      {espacio.arrendatarioNombre && (
                        <span className="text-sm text-gray-600">
                          {espacio.arrendatarioNombre}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">
                        ${espacio.totalRecaudado.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">recaudado</p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{espacio.totalCobros} cobros</span>
                    {espacio.montoPactadoMensual && (
                      <span>${espacio.montoPactadoMensual.toLocaleString()}/mes</span>
                    )}
                    {espacio.ultimoPago && (
                      <span>Último: {new Date(espacio.ultimoPago.fecha).toLocaleDateString('es-EC')}</span>
                    )}
                  </div>
                </div>

                {/* Últimos cobros */}
                <div className="divide-y divide-gray-50">
                  {espacio.cobros.slice(0, 2).map((cobro) => (
                    <Link
                      key={cobro.id}
                      href={`/cobros/${cobro.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${
                          cobro.estado === 'PAGADO' || cobro.estado === 'COBRADO'
                            ? 'bg-emerald-500'
                            : cobro.estado === 'PARCIAL'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {cobro.periodo || new Date(cobro.fechaPago).toLocaleDateString('es-EC')}
                          </p>
                          <p className="text-xs text-gray-500">{cobro.concepto}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ${cobro.montoPagado.toLocaleString()}
                        </p>
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          cobro.estado === 'PAGADO' || cobro.estado === 'COBRADO'
                            ? 'bg-emerald-100 text-emerald-700'
                            : cobro.estado === 'PARCIAL'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {cobro.estado}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Show more link */}
                {espacio.cobros.length > 2 && (
                  <Link
                    href={`/cobros/historial/${espacio.espacioId}`}
                    className="block px-4 py-3 text-center text-sm text-indigo-600 hover:bg-indigo-50 transition-colors border-t border-gray-100"
                  >
                    Ver los {espacio.cobros.length} cobros
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <p className="text-sm text-gray-500 text-center">
          {espaciosFiltrados.length} espacio(s) encontrado(s)
        </p>
      </main>
    </div>
  )
}
