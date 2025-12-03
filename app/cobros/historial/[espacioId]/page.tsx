/**
 * Página de Historial de Cobros por Espacio - Casa del Sol
 * Vista detallada Excel-like de todos los cobros de un espacio específico
 */

'use client'

import { useEffect, useState } from 'react'
import MainNavbar from '@/app/components/MainNavbar'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

      // Cargar historial completo (incluye espacio, cobros y estadísticas)
      const historialRes = await fetch(`/api/cobros/historial/${resolvedParams.espacioId}`)
      const historialData = await historialRes.json()

      // Extraer espacio y cobros del resultado
      setEspacio(historialData.espacio)

      // Los cobros ya vienen ordenados desde el API
      setCobros(historialData.cobros || [])
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

  const totalRecaudado = cobros.reduce((sum, c) => sum + c.montoPagado, 0)
  const totalPactado = cobros.reduce((sum, c) => sum + c.montoPactado, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar activeSection="cobros" />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!espacio) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar activeSection="cobros" />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Espacio no encontrado</p>
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
            <button
              onClick={() => router.push('/cobros/espacios')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Historial - {espacio.identificador}
              </h1>
              <p className="text-sm text-gray-500">
                {espacio.tipo}
                {espacio.arrendatario && ` • ${espacio.arrendatario.nombre}`}
              </p>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Buscar cobro..."
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Cobros</p>
                <p className="text-xl font-bold text-gray-900">{cobros.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Recaudado</p>
                <p className="text-xl font-bold text-emerald-600">${totalRecaudado.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Pactado</p>
                <p className="text-xl font-bold text-gray-900">${totalPactado.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Cobros */}
        {cobrosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">No se encontraron cobros</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {cobrosFiltrados.map((cobro) => (
                <Link
                  key={cobro.id}
                  href={`/cobros/${cobro.id}`}
                  className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-12 rounded-full ${
                      cobro.estado === 'PAGADO' || cobro.estado === 'COBRADO'
                        ? 'bg-emerald-500'
                        : cobro.estado === 'PARCIAL'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {cobro.periodo || new Date(cobro.fechaPago).toLocaleDateString('es-EC')}
                        </span>
                        <span className="text-xs text-gray-400">{cobro.codigoInterno}</span>
                      </div>
                      <p className="text-sm text-gray-500">{cobro.concepto} • {cobro.metodoPago}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${cobro.montoPagado.toLocaleString()}</p>
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

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-500">
                {cobrosFiltrados.length} cobro(s) encontrado(s)
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
