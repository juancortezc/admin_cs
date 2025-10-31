/**
 * Administración - Pagos
 * Vista con 3 tabs: Estado de cuenta (cards por categoría), Pagos eventuales, Pagos recurrentes
 */

'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/app/components/Navbar'

type Pago = {
  id: string
  tipo: 'arriendo' | 'servicio' | 'salario' | 'otro'
  tipoLabel: string
  esIngreso: boolean
  titulo: string
  descripcion: string
  monto: number
  fecha: string
  formaPago: 'TRANSFERENCIA' | 'EFECTIVO' | 'CHEQUE' | null
  referencia: string | null
  observaciones: string | null
}

type CategoriaAgrupada = {
  categoria: string
  nombre: string
  gradiente: string
  totalPagos: number
  montoTotal: number
  pagos: Pago[]
}

type Abono = {
  id: string
  codigoInterno: string
  montoPagado: number
  fechaPago: string
  metodoPago: string | null
}

type CuentaParcial = {
  id: string
  codigoInterno: string
  espacioIdentificador: string
  arrendatarioNombre: string
  concepto: string
  periodo: string
  montoPactado: number
  totalAbonado: number
  saldoPendiente: number
  porcentajePagado: number
  cantidadAbonos: number
  abonos: Abono[]
}

type PagoRecurrente = {
  id: string
  codigoInterno: string
  nombre: string
  proveedor: string
  categoria: string
  descripcion: string
  montoFijo: number | null
  esMontoVariable: boolean
  metodoPago: string
  frecuencia: string
  diaPago: number | null
  fechaInicio: string
  fechaFin: string | null
  activo: boolean
  observaciones: string | null
  _count?: {
    pagosGenerados: number
  }
}

export default function AdministracionPagosPage() {
  const [activeTab, setActiveTab] = useState<'estado' | 'eventuales' | 'recurrentes'>('estado')
  const [pagos, setPagos] = useState<Pago[]>([])
  const [categoriasAgrupadas, setCategoriasAgrupadas] = useState<CategoriaAgrupada[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [cuentasParciales, setCuentasParciales] = useState<CuentaParcial[]>([])
  const [pagosRecurrentes, setPagosRecurrentes] = useState<PagoRecurrente[]>([])
  const [filtroEstado, setFiltroEstado] = useState<string>('true')

  useEffect(() => {
    if (activeTab === 'estado') {
      cargarEstadoCuenta()
    } else if (activeTab === 'eventuales') {
      cargarPagosEventuales()
    } else if (activeTab === 'recurrentes') {
      cargarPagosRecurrentes()
    }
  }, [activeTab, filtroEstado])

  const cargarEstadoCuenta = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pagos')
      const data = await res.json()
      setPagos(data.pagos || [])

      const categorias: CategoriaAgrupada[] = [
        { categoria: 'servicio', nombre: 'Servicios Básicos', gradiente: 'from-blue-500 to-cyan-500', totalPagos: 0, montoTotal: 0, pagos: [] },
        { categoria: 'salario', nombre: 'Salarios', gradiente: 'from-purple-500 to-pink-500', totalPagos: 0, montoTotal: 0, pagos: [] },
        { categoria: 'arriendo', nombre: 'Arriendos', gradiente: 'from-emerald-500 to-teal-500', totalPagos: 0, montoTotal: 0, pagos: [] },
        { categoria: 'otro', nombre: 'Otros', gradiente: 'from-gray-500 to-slate-500', totalPagos: 0, montoTotal: 0, pagos: [] }
      ]

      data.pagos.forEach((pago: Pago) => {
        const cat = categorias.find(c => c.categoria === pago.tipo)
        if (cat) {
          cat.pagos.push(pago)
          cat.totalPagos++
          cat.montoTotal += pago.monto
        }
      })

      categorias.forEach(cat => {
        cat.pagos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      })

      setCategoriasAgrupadas(categorias.filter(c => c.totalPagos > 0))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarPagosEventuales = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cobros/parciales-pendientes')
      const data = await res.json()
      setCuentasParciales(data.cuentas || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarPagosRecurrentes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroEstado !== 'todos') params.append('activo', filtroEstado)
      const res = await fetch(`/api/pagos-recurrentes?${params.toString()}`)
      const data = await res.json()
      setPagosRecurrentes(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const categoriasFiltradas = categoriasAgrupadas.filter(cat => {
    if (!busqueda) return true
    const search = busqueda.toLowerCase()
    return cat.nombre.toLowerCase().includes(search) ||
           cat.pagos.some(p => p.titulo.toLowerCase().includes(search) || p.descripcion.toLowerCase().includes(search))
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <Navbar activeTab="Pagos" />
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
      <Navbar activeTab="Pagos" />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Administración - Pagos</h1>
          <p className="text-sm text-gray-600 mt-1">
            {activeTab === 'estado' && 'Estado de cuenta de pagos administrativos'}
            {activeTab === 'eventuales' && 'Pagos con abonos pendientes'}
            {activeTab === 'recurrentes' && 'Gestión de pagos recurrentes'}
          </p>
        </div>

        <div className="mb-6">
          <div className="inline-flex bg-white/60 backdrop-blur-sm rounded-xl p-1 gap-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('estado')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'estado'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-white/80'
              }`}
            >
              Estado de cuenta
            </button>
            <button
              onClick={() => setActiveTab('eventuales')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'eventuales'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-white/80'
              }`}
            >
              Pagos eventuales
            </button>
            <button
              onClick={() => setActiveTab('recurrentes')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'recurrentes'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-white/80'
              }`}
            >
              Pagos recurrentes
            </button>
          </div>
        </div>

        {activeTab === 'estado' && (
          <>
            <div className="mb-6">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por categoría, título, descripción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400 bg-white"
                />
              </div>
            </div>

            {categoriasFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoriasFiltradas.map((categoria) => (
                  <div key={categoria.categoria} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                    <div className={`bg-gradient-to-r ${categoria.gradiente} p-4`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">{categoria.nombre}</h3>
                          <p className="text-sm text-white/80 mt-0.5">{categoria.totalPagos} pago{categoria.totalPagos !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">${categoria.montoTotal.toLocaleString()}</p>
                          <p className="text-xs text-white/80">Total</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {categoria.pagos.slice(0, 2).map((pago) => (
                        <div key={pago.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{pago.titulo}</p>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{pago.descripcion}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">
                                {new Date(pago.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                              {pago.formaPago && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <p className="text-xs text-gray-500">{pago.formaPago}</p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            <p className={`text-sm font-bold ${pago.esIngreso ? 'text-emerald-600' : 'text-red-600'}`}>
                              {pago.esIngreso ? '+' : '-'}${pago.monto.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {categoria.totalPagos > 2 && (
                      <div className="px-4 pb-4">
                        <button className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                          Ver todos los {categoria.totalPagos} pagos →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
                <p className="text-sm text-gray-500">{busqueda ? 'No se encontraron pagos' : 'No hay pagos registrados'}</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'eventuales' && (
          <>
            <p className="text-sm text-gray-600 mb-4">{cuentasParciales.length} cuenta{cuentasParciales.length !== 1 ? 's' : ''} con pago parcial</p>

            {cuentasParciales.length > 0 ? (
              <div className="space-y-3">
                {cuentasParciales.map((cuenta) => (
                  <div key={cuenta.id} className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{cuenta.espacioIdentificador} - {cuenta.arrendatarioNombre}</h3>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-orange-100 text-orange-700">{cuenta.concepto}</span>
                        </div>
                        <p className="text-xs text-gray-600">Período: {cuenta.periodo} • {cuenta.cantidadAbonos} abono{cuenta.cantidadAbonos !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">${cuenta.montoPactado.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Progreso</span>
                        <span className="font-medium text-emerald-600">{cuenta.porcentajePagado.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(cuenta.porcentajePagado, 100)}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-emerald-600">Abonado: ${cuenta.totalAbonado.toLocaleString()}</span>
                        <span className="text-orange-600">Pendiente: ${cuenta.saldoPendiente.toLocaleString()}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">Historial:</p>
                      <div className="space-y-1.5">
                        {cuenta.abonos.map((abono) => (
                          <div key={abono.id} className="flex justify-between text-xs bg-gray-50 rounded-lg p-2">
                            <div className="flex gap-2">
                              <span className="text-gray-500">{abono.codigoInterno}</span>
                              <span className="text-gray-700">{new Date(abono.fechaPago).toLocaleDateString('es-CL')}</span>
                              {abono.metodoPago && <span className="text-gray-500">• {abono.metodoPago}</span>}
                            </div>
                            <span className="font-medium text-emerald-600">+${abono.montoPagado.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-500">No hay pagos eventuales pendientes</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'recurrentes' && (
          <>
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2 font-medium">Estado</p>
              <div className="flex gap-2">
                {[{ value: 'true', label: 'Activos' }, { value: 'false', label: 'Inactivos' }, { value: 'todos', label: 'Todos' }].map((estado) => (
                  <button
                    key={estado.value}
                    onClick={() => setFiltroEstado(estado.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filtroEstado === estado.value
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {estado.label}
                  </button>
                ))}
              </div>
            </div>

            {pagosRecurrentes.length > 0 ? (
              <div className="space-y-3">
                {pagosRecurrentes.map((pago) => (
                  <div key={pago.id} className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{pago.nombre}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${pago.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {pago.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-indigo-100 text-indigo-700">{pago.categoria.replace('_', ' ')}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{pago.proveedor} • {pago.descripcion}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <span>{pago.frecuencia}{pago.diaPago && ` - Día ${pago.diaPago}`}</span>
                          <span>Desde: {new Date(pago.fechaInicio).toLocaleDateString('es-CL')}</span>
                          {pago.fechaFin && <span className="text-orange-600">Hasta: {new Date(pago.fechaFin).toLocaleDateString('es-CL')}</span>}
                          <span>{pago.metodoPago}</span>
                          {pago._count && pago._count.pagosGenerados > 0 && <span className="text-indigo-600">{pago._count.pagosGenerados} generado{pago._count.pagosGenerados !== 1 ? 's' : ''}</span>}
                        </div>
                        {pago.observaciones && <p className="text-xs text-gray-500 mt-2 italic">{pago.observaciones}</p>}
                      </div>
                      <div className="text-right ml-4">
                        {pago.esMontoVariable ? (
                          <p className="text-sm font-bold text-orange-600">Variable</p>
                        ) : (
                          <p className="text-sm font-bold text-gray-900">${pago.montoFijo?.toLocaleString()}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">{pago.codigoInterno}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-500">No hay pagos recurrentes</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
