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
  categoria?: string // Para OtrosPagos
}

type CategoriaAgrupada = {
  categoria: string
  nombre: string
  gradiente: string
  totalPagos: number
  montoTotal: number
  pagos: Pago[]
}

type Categoria = 'SERVICIOS_PUBLICOS' | 'SERVICIOS_PERSONALES' | 'MANTENIMIENTO' | 'LIMPIEZA' | 'HONORARIOS' | 'IMPUESTOS' | 'OTROS' | 'ARRIENDO' | 'SERVICIO' | 'SALARIO'

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

  // Nuevos estados para filtros
  const [mesSeleccionado, setMesSeleccionado] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas')
  const [categoriaExpandida, setCategoriaExpandida] = useState<string | null>(null)

  // Estados para edición y eliminación
  const [pagoEditando, setPagoEditando] = useState<Pago | null>(null)
  const [pagoEliminando, setPagoEliminando] = useState<Pago | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (activeTab === 'estado') {
      cargarEstadoCuenta()
    } else if (activeTab === 'eventuales') {
      cargarPagosEventuales()
    } else if (activeTab === 'recurrentes') {
      cargarPagosRecurrentes()
    }
  }, [activeTab, filtroEstado, mesSeleccionado])

  const cargarEstadoCuenta = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pagos')
      const data = await res.json()

      // Filtrar pagos por mes seleccionado
      const [year, month] = mesSeleccionado.split('-').map(Number)
      const pagosFiltradosPorMes = (data.pagos || []).filter((pago: Pago) => {
        const fechaPago = new Date(pago.fecha)
        return fechaPago.getFullYear() === year && fechaPago.getMonth() + 1 === month
      })

      setPagos(pagosFiltradosPorMes)

      // Definir categorías basadas en el campo categoria de OtrosPagos
      const categoriasMap = new Map<string, CategoriaAgrupada>()

      // Categorías predefinidas para tipos especiales
      const categoriasEspeciales: Record<string, {nombre: string, gradiente: string}> = {
        'arriendo': { nombre: 'Arriendos', gradiente: 'from-emerald-500 to-teal-500' },
        'servicio': { nombre: 'Servicios Básicos (BD)', gradiente: 'from-blue-500 to-cyan-500' },
        'salario': { nombre: 'Salarios', gradiente: 'from-purple-500 to-pink-500' },
        'SERVICIOS_PUBLICOS': { nombre: 'Servicios Públicos', gradiente: 'from-blue-500 to-cyan-500' },
        'SERVICIOS_PERSONALES': { nombre: 'Servicios Personales', gradiente: 'from-indigo-500 to-purple-500' },
        'MANTENIMIENTO': { nombre: 'Mantenimiento', gradiente: 'from-orange-500 to-amber-500' },
        'LIMPIEZA': { nombre: 'Limpieza', gradiente: 'from-teal-500 to-emerald-500' },
        'HONORARIOS': { nombre: 'Honorarios', gradiente: 'from-violet-500 to-purple-500' },
        'IMPUESTOS': { nombre: 'Impuestos', gradiente: 'from-red-500 to-rose-500' },
        'OTROS': { nombre: 'Otros', gradiente: 'from-gray-500 to-slate-500' }
      }

      pagosFiltradosPorMes.forEach((pago: Pago) => {
        // Determinar la categoría
        let categoriaKey: string
        let categoriaNombre: string
        let categoriaGradiente: string

        if (pago.tipo === 'arriendo' || pago.tipo === 'servicio' || pago.tipo === 'salario') {
          // Usar el tipo como categoría
          categoriaKey = pago.tipo
          categoriaNombre = categoriasEspeciales[pago.tipo]?.nombre || pago.tipoLabel
          categoriaGradiente = categoriasEspeciales[pago.tipo]?.gradiente || 'from-gray-500 to-slate-500'
        } else if (pago.categoria && categoriasEspeciales[pago.categoria]) {
          // Usar la categoría específica de OtrosPagos
          categoriaKey = pago.categoria
          categoriaNombre = categoriasEspeciales[pago.categoria].nombre
          categoriaGradiente = categoriasEspeciales[pago.categoria].gradiente
        } else {
          // Fallback a OTROS
          categoriaKey = 'OTROS'
          categoriaNombre = 'Otros'
          categoriaGradiente = 'from-gray-500 to-slate-500'
        }

        // Obtener o crear categoría
        if (!categoriasMap.has(categoriaKey)) {
          categoriasMap.set(categoriaKey, {
            categoria: categoriaKey,
            nombre: categoriaNombre,
            gradiente: categoriaGradiente,
            totalPagos: 0,
            montoTotal: 0,
            pagos: []
          })
        }

        const cat = categoriasMap.get(categoriaKey)!
        cat.pagos.push(pago)
        cat.totalPagos++
        cat.montoTotal += pago.monto
      })

      // Ordenar pagos dentro de cada categoría
      categoriasMap.forEach(cat => {
        cat.pagos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      })

      // Convertir a array y ordenar por monto total descendente
      const categoriasArray = Array.from(categoriasMap.values())
        .sort((a, b) => b.montoTotal - a.montoTotal)

      setCategoriasAgrupadas(categoriasArray)
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
    // Filtro por categoría
    if (categoriaSeleccionada !== 'todas' && cat.categoria !== categoriaSeleccionada) {
      return false
    }
    // Filtro por búsqueda
    if (!busqueda) return true
    const search = busqueda.toLowerCase()
    return cat.nombre.toLowerCase().includes(search) ||
           cat.pagos.some(p => p.titulo.toLowerCase().includes(search) || p.descripcion.toLowerCase().includes(search))
  })

  // Generar lista de meses disponibles (últimos 12 meses)
  const generarMesesDisponibles = () => {
    const meses = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      const label = fecha.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
      meses.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
    }
    return meses
  }

  const mesesDisponibles = generarMesesDisponibles()

  // Función para eliminar pago
  const eliminarPago = async (pago: Pago) => {
    if (!pagoEliminando) return

    setGuardando(true)
    try {
      let url = ''

      // Determinar la URL según el tipo de pago
      if (pago.tipo === 'otro') {
        url = `/api/otros-pagos/${pago.id}`
      } else if (pago.tipo === 'servicio') {
        url = `/api/pagos/servicios/${pago.id}`
      } else if (pago.tipo === 'salario') {
        url = `/api/pagos/salarios/${pago.id}`
      } else if (pago.tipo === 'arriendo') {
        url = `/api/cobros/${pago.id}`
      }

      const res = await fetch(url, { method: 'DELETE' })

      if (!res.ok) throw new Error('Error al eliminar')

      // Recargar datos
      await cargarEstadoCuenta()
      setPagoEliminando(null)
    } catch (error) {
      console.error('Error al eliminar pago:', error)
      alert('Error al eliminar el pago')
    } finally {
      setGuardando(false)
    }
  }

  // Función para guardar edición de pago
  const guardarEdicionPago = async () => {
    if (!pagoEditando) return

    setGuardando(true)
    try {
      let url = ''
      let body: any = {}

      // Determinar URL y body según el tipo
      if (pagoEditando.tipo === 'otro') {
        url = `/api/otros-pagos/${pagoEditando.id}`
        body = {
          proveedor: pagoEditando.titulo,
          descripcion: pagoEditando.descripcion,
          monto: pagoEditando.monto,
          fechaPago: pagoEditando.fecha,
          metodoPago: pagoEditando.formaPago,
          numeroDocumento: pagoEditando.referencia,
          observaciones: pagoEditando.observaciones,
          categoria: pagoEditando.categoria || 'OTROS',
          // Campos requeridos adicionales
          periodo: new Date(pagoEditando.fecha).toISOString().slice(0, 7),
          estado: 'PAGADO'
        }
      } else if (pagoEditando.tipo === 'servicio') {
        url = `/api/pagos/servicios/${pagoEditando.id}`
        body = {
          monto: pagoEditando.monto,
          fechaPago: pagoEditando.fecha,
          formaPago: pagoEditando.formaPago,
          referencia: pagoEditando.referencia,
          observaciones: pagoEditando.observaciones
        }
      } else if (pagoEditando.tipo === 'salario') {
        url = `/api/pagos/salarios/${pagoEditando.id}`
        body = {
          total: pagoEditando.monto,
          fechaPago: pagoEditando.fecha,
          formaPago: pagoEditando.formaPago,
          referencia: pagoEditando.referencia,
          observaciones: pagoEditando.observaciones
        }
      } else if (pagoEditando.tipo === 'arriendo') {
        url = `/api/cobros/${pagoEditando.id}`
        body = {
          monto: pagoEditando.monto,
          fechaCobro: pagoEditando.fecha,
          formaPago: pagoEditando.formaPago,
          referencia: pagoEditando.referencia,
          observaciones: pagoEditando.observaciones
        }
      }

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) throw new Error('Error al guardar')

      // Recargar datos
      await cargarEstadoCuenta()
      setPagoEditando(null)
    } catch (error) {
      console.error('Error al guardar pago:', error)
      alert('Error al guardar los cambios')
    } finally {
      setGuardando(false)
    }
  }

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
            {/* Filtros */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-4">
                {/* Selector de mes */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-700 mb-2">Mes</label>
                  <select
                    value={mesSeleccionado}
                    onChange={(e) => setMesSeleccionado(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  >
                    {mesesDisponibles.map(mes => (
                      <option key={mes.value} value={mes.value}>{mes.label}</option>
                    ))}
                  </select>
                </div>

                {/* Selector de categoría */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    value={categoriaSeleccionada}
                    onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="todas">Todas las categorías</option>
                    <option value="arriendo">Arriendos</option>
                    <option value="servicio">Servicios Básicos (BD)</option>
                    <option value="salario">Salarios</option>
                    <option value="SERVICIOS_PUBLICOS">Servicios Públicos</option>
                    <option value="SERVICIOS_PERSONALES">Servicios Personales</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                    <option value="LIMPIEZA">Limpieza</option>
                    <option value="HONORARIOS">Honorarios</option>
                    <option value="IMPUESTOS">Impuestos</option>
                    <option value="OTROS">Otros</option>
                  </select>
                </div>
              </div>

              {/* Barra de búsqueda */}
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por título, descripción..."
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
                    <div
                      className={`bg-gradient-to-r ${categoria.gradiente} p-4 cursor-pointer`}
                      onClick={() => setCategoriaExpandida(categoriaExpandida === categoria.categoria ? null : categoria.categoria)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">{categoria.nombre}</h3>
                          <p className="text-sm text-white/80 mt-0.5">{categoria.totalPagos} pago{categoria.totalPagos !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">${categoria.montoTotal.toLocaleString()}</p>
                          <p className="text-xs text-white/80">Click para ver detalle</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      {categoria.pagos.map((pago) => (
                        <div key={pago.id} className="group flex items-start justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
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
                          <div className="flex items-center gap-2 ml-3">
                            <div className="text-right">
                              <p className={`text-sm font-bold ${pago.esIngreso ? 'text-emerald-600' : 'text-red-600'}`}>
                                {pago.esIngreso ? '+' : '-'}${pago.monto.toLocaleString()}
                              </p>
                            </div>
                            {/* Botones de acción */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPagoEditando(pago)
                                }}
                                className="p-1.5 hover:bg-indigo-100 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPagoEliminando(pago)
                                }}
                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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

            {/* Modal estilo Excel */}
            {categoriaExpandida && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCategoriaExpandida(null)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const categoria = categoriasAgrupadas.find(c => c.categoria === categoriaExpandida)
                    if (!categoria) return null

                    return (
                      <>
                        <div className={`bg-gradient-to-r ${categoria.gradiente} p-6`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h2 className="text-2xl font-bold text-white">{categoria.nombre}</h2>
                              <p className="text-white/90 mt-1">{categoria.totalPagos} pagos • ${categoria.montoTotal.toLocaleString()}</p>
                            </div>
                            <button
                              onClick={() => setCategoriaExpandida(null)}
                              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                            >
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="overflow-auto max-h-[calc(90vh-140px)]">
                          {/* Tabla estilo Excel */}
                          <table className="w-full">
                            <thead className="bg-gray-100 sticky top-0">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Fecha</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Título</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Descripción</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Tipo</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Forma de Pago</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b border-gray-300">Monto</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Referencia</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Observaciones</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-b border-gray-300">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {categoria.pagos.map((pago, idx) => (
                                <tr key={pago.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors`}>
                                  <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200 whitespace-nowrap">
                                    {new Date(pago.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b border-gray-200">
                                    {pago.titulo}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                                    {pago.descripcion}
                                  </td>
                                  <td className="px-4 py-3 text-sm border-b border-gray-200">
                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${pago.esIngreso ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                      {pago.esIngreso ? 'Ingreso' : 'Egreso'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                                    {pago.formaPago || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-bold text-right border-b border-gray-200">
                                    <span className={pago.esIngreso ? 'text-emerald-600' : 'text-red-600'}>
                                      {pago.esIngreso ? '+' : '-'}${pago.monto.toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                                    {pago.referencia || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                                    {pago.observaciones || '-'}
                                  </td>
                                  <td className="px-4 py-3 border-b border-gray-200">
                                    <div className="flex gap-1 justify-center">
                                      <button
                                        onClick={() => {
                                          setPagoEditando(pago)
                                          setCategoriaExpandida(null)
                                        }}
                                        className="p-1.5 hover:bg-indigo-100 rounded-lg transition-colors"
                                        title="Editar"
                                      >
                                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setPagoEliminando(pago)
                                          setCategoriaExpandida(null)
                                        }}
                                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                        title="Eliminar"
                                      >
                                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-gray-100 sticky bottom-0">
                              <tr>
                                <td colSpan={5} className="px-4 py-3 text-sm font-bold text-gray-900 border-t-2 border-gray-300">
                                  Total ({categoria.totalPagos} pagos)
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-right text-gray-900 border-t-2 border-gray-300">
                                  ${categoria.montoTotal.toLocaleString()}
                                </td>
                                <td colSpan={3} className="border-t-2 border-gray-300"></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </>
                    )
                  })()}
                </div>
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

        {/* Modal de Edición */}
        {pagoEditando && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPagoEditando(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Editar Pago</h2>
                  <button
                    onClick={() => setPagoEditando(null)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título / Proveedor</label>
                  <input
                    type="text"
                    value={pagoEditando.titulo}
                    onChange={(e) => setPagoEditando({ ...pagoEditando, titulo: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={pagoEditando.tipo === 'arriendo' || pagoEditando.tipo === 'servicio'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <input
                    type="text"
                    value={pagoEditando.descripcion}
                    onChange={(e) => setPagoEditando({ ...pagoEditando, descripcion: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monto</label>
                    <input
                      type="number"
                      value={pagoEditando.monto}
                      onChange={(e) => setPagoEditando({ ...pagoEditando, monto: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                    <input
                      type="date"
                      value={pagoEditando.fecha.split('T')[0]}
                      onChange={(e) => setPagoEditando({ ...pagoEditando, fecha: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pago</label>
                  <select
                    value={pagoEditando.formaPago || ''}
                    onChange={(e) => setPagoEditando({ ...pagoEditando, formaPago: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Referencia / Nº Documento</label>
                  <input
                    type="text"
                    value={pagoEditando.referencia || ''}
                    onChange={(e) => setPagoEditando({ ...pagoEditando, referencia: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                  <textarea
                    value={pagoEditando.observaciones || ''}
                    onChange={(e) => setPagoEditando({ ...pagoEditando, observaciones: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {pagoEditando.tipo === 'otro' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                    <select
                      value={pagoEditando.categoria || 'OTROS'}
                      onChange={(e) => setPagoEditando({ ...pagoEditando, categoria: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="SERVICIOS_PUBLICOS">Servicios Públicos</option>
                      <option value="SERVICIOS_PERSONALES">Servicios Personales</option>
                      <option value="MANTENIMIENTO">Mantenimiento</option>
                      <option value="LIMPIEZA">Limpieza</option>
                      <option value="HONORARIOS">Honorarios</option>
                      <option value="IMPUESTOS">Impuestos</option>
                      <option value="OTROS">Otros</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="px-6 pb-6 flex gap-3 justify-end">
                <button
                  onClick={() => setPagoEditando(null)}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarEdicionPago}
                  disabled={guardando}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 transition-colors disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación de Eliminación */}
        {pagoEliminando && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPagoEliminando(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Confirmar Eliminación</h2>
                    <p className="text-white/90 text-sm mt-1">Esta acción no se puede deshacer</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-2">¿Estás seguro que deseas eliminar este pago?</p>
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <p className="font-semibold text-gray-900 text-sm">{pagoEliminando.titulo}</p>
                  <p className="text-xs text-gray-600 mt-1">{pagoEliminando.descripcion}</p>
                  <p className="text-sm font-bold text-red-600 mt-2">
                    ${pagoEliminando.monto.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 flex gap-3 justify-end">
                <button
                  onClick={() => setPagoEliminando(null)}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => eliminarPago(pagoEliminando)}
                  disabled={guardando}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-colors disabled:opacity-50"
                >
                  {guardando ? 'Eliminando...' : 'Eliminar Pago'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
