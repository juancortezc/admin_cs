/**
 * EspaciosContent Component - Casa del Sol
 * Vista de cobros agrupados por espacio
 */

'use client'

import { useEffect, useState } from 'react'
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

export default function EspaciosContent() {
  const router = useRouter()
  const [espacios, setEspacios] = useState<CobroPorEspacio[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')

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
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Search Field */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar espacio o arrendatario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full md:w-64 px-4 py-2 pl-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white"
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

      {/* Espacios Cards */}
      {espaciosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron espacios</h3>
          <p className="mt-1 text-sm text-gray-500">Intenta ajustar la búsqueda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {espaciosFiltrados.map((espacio) => (
            <div
              key={espacio.espacioId}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Space Header */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/espacios/${espacio.espacioId}`}
                      className="text-xl font-bold text-indigo-700 hover:text-indigo-900"
                    >
                      {espacio.espacioIdentificador}
                    </Link>
                    <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full font-medium">
                      {espacio.espacioTipo}
                    </span>
                    {espacio.arrendatarioNombre && (
                      <span className="text-sm text-gray-700 font-medium">
                        • {espacio.arrendatarioNombre}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-600 mb-1">Total Recaudado</div>
                    <div className="text-2xl font-bold text-emerald-600">
                      ${espacio.totalRecaudado.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6 mt-3 text-sm">
                  <div>
                    <span className="text-gray-600">Cobros:</span>{' '}
                    <span className="font-semibold text-gray-900">{espacio.totalCobros}</span>
                  </div>
                  {espacio.montoPactadoMensual && (
                    <div>
                      <span className="text-gray-600">Monto mensual:</span>{' '}
                      <span className="font-semibold text-gray-900">
                        ${espacio.montoPactadoMensual.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {espacio.ultimoPago && (
                    <div>
                      <span className="text-gray-600">Último pago:</span>{' '}
                      <span className="font-semibold text-gray-900">
                        {new Date(espacio.ultimoPago.fecha).toLocaleDateString('es-EC')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cobros Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Código
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Periodo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Concepto
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                        Pactado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                        Pagado
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {espacio.cobros.slice(0, 2).map((cobro) => (
                      <tr
                        key={cobro.id}
                        onClick={() => router.push(`/cobros/${cobro.id}`)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-indigo-600">
                          {cobro.codigoInterno}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {cobro.periodo || new Date(cobro.fechaPago).toLocaleDateString('es-EC')}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{cobro.concepto}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          ${cobro.montoPactado.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-600">
                          ${cobro.montoPagado.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                              cobro.estado === 'PAGADO'
                                ? 'bg-gray-100 text-gray-700'
                                : cobro.estado === 'PENDIENTE'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {cobro.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Show more link */}
              {espacio.cobros.length > 2 && (
                <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-200">
                  <Link
                    href={`/cobros/historial/${espacio.espacioId}`}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    Ver todos los {espacio.cobros.length} cobros →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">{espaciosFiltrados.length}</span> espacio(s)
        </p>
      </div>
    </div>
  )
}
