/**
 * Administración - Pagos
 * Vista con 3 tabs: Estado de cuenta (cards por categoría), Pagos eventuales, Pagos recurrentes
 * Material Design 3 con tabs pill style
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import TabsPill from '@/app/components/TabsPill'
import { CreditCardIcon, CashIcon, RefreshIcon, CoinsIcon, WrenchIcon, BoxIcon } from '@/app/components/icons'

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
  ruc: string | null
  cuentaDestino: string | null
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
  const router = useRouter()
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

  // Estados para modales de creación
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [selectedRecurring, setSelectedRecurring] = useState<PagoRecurrente | null>(null)
  const [showAbonoModal, setShowAbonoModal] = useState(false)
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<CuentaParcial | null>(null)
  const [showPagoEventualModal, setShowPagoEventualModal] = useState(false)
  const [showPagoParcialModal, setShowPagoParcialModal] = useState(false)

  // Estado para filtro de categoría
  const [categoriaFiltrada, setCategoriaFiltrada] = useState<string | null>(null)

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

  // Calcular totales para el resumen
  const montoTotalMes = categoriasAgrupadas.reduce((sum, cat) => sum + cat.montoTotal, 0)
  const totalPagosMes = categoriasAgrupadas.reduce((sum, cat) => sum + cat.totalPagos, 0)

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

  const tabs = [
    { id: 'estado', nombre: 'Estado de cuenta', icon: <CreditCardIcon /> },
    { id: 'eventuales', nombre: 'Pagos Eventuales', icon: <CashIcon /> },
    { id: 'recurrentes', nombre: 'Pagos Recurrentes', icon: <RefreshIcon /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Navbar activeTab="Pagos" />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header con Material Design 3 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <CreditCardIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Administración de Pagos</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Gestión de pagos eventuales, recurrentes y estado de cuenta
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Administración */}
        <div className="mb-6">
          <TabsPill
            tabs={[
              { id: 'pagos', nombre: 'Pagos', icon: <CoinsIcon /> },
              { id: 'tickets', nombre: 'Tickets', icon: <WrenchIcon /> },
              { id: 'inventario', nombre: 'Inventario', icon: <BoxIcon /> },
            ]}
            activeTab="pagos"
            onTabChange={(tabId) => {
              if (tabId === 'tickets') router.push('/administracion/tickets')
              else if (tabId === 'inventario') router.push('/administracion/inventario')
            }}
          />
        </div>

        {/* Tabs y Filtros */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <TabsPill
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as any)}
          />

          {/* Selector de Mes - Solo visible en tab Estado */}
          {activeTab === 'estado' && (
            <div className="min-w-[200px]">
              <select
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white shadow-sm"
              >
                {mesesDisponibles.map(mes => (
                  <option key={mes.value} value={mes.value}>{mes.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeTab === 'estado' && (
          <>
            {/* Resumen del Mes */}
            <div className="mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Resumen del Mes</h3>
                      <p className="text-white/80 text-sm mt-1">
                        {mesesDisponibles.find(m => m.value === mesSeleccionado)?.label}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">${montoTotalMes.toLocaleString()}</p>
                      <p className="text-white/80 text-sm mt-1">{totalPagosMes} pago{totalPagosMes !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                {/* Desglose por categorías */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-700">
                      {categoriaFiltrada ? 'Categoría seleccionada' : 'Desglose por Categoría'}
                    </h4>
                    {categoriaFiltrada && (
                      <button
                        onClick={() => setCategoriaFiltrada(null)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                      >
                        Mostrar todas
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categoriasAgrupadas.map((categoria) => (
                      <div
                        key={categoria.categoria}
                        onClick={() => setCategoriaFiltrada(categoriaFiltrada === categoria.categoria ? null : categoria.categoria)}
                        className={`flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                          categoriaFiltrada === categoria.categoria ? 'scale-110 ring-2 ring-indigo-500' : ''
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${categoria.gradiente}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{categoria.nombre}</p>
                          <p className="text-sm font-bold text-gray-900">${categoria.montoTotal.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{categoria.totalPagos} pago{categoria.totalPagos !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="mb-6">
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
                {categoriasFiltradas
                  .filter(cat => !categoriaFiltrada || cat.categoria === categoriaFiltrada)
                  .map((categoria) => (
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
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">{cuentasParciales.length} cuenta{cuentasParciales.length !== 1 ? 's' : ''} con pago parcial</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPagoEventualModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all flex items-center gap-2 text-sm font-medium shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Pago Eventual
                </button>
                <button
                  onClick={() => setShowPagoParcialModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all flex items-center gap-2 text-sm font-medium shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Pago Parcial
                </button>
              </div>
            </div>

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
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">${cuenta.montoPactado.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Total</p>
                        </div>
                        <button
                          onClick={() => {
                            setCuentaSeleccionada(cuenta)
                            setShowAbonoModal(true)
                          }}
                          className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-medium rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-sm"
                        >
                          + Abono
                        </button>
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
            <div className="flex items-center justify-between mb-6">
              <div>
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
              <button
                onClick={() => {
                  setSelectedRecurring(null)
                  setShowRecurringModal(true)
                }}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Pago Recurrente
              </button>
            </div>

            {pagosRecurrentes.length > 0 ? (
              <div className="space-y-3">
                {pagosRecurrentes.map((pago) => (
                  <div key={pago.id} className="group bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all">
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
                      <div className="flex items-start gap-3 ml-4">
                        <div className="text-right">
                          {pago.esMontoVariable ? (
                            <p className="text-sm font-bold text-orange-600">Variable</p>
                          ) : (
                            <p className="text-sm font-bold text-gray-900">${pago.montoFijo?.toLocaleString()}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-0.5">{pago.codigoInterno}</p>
                        </div>
                        {/* Botones de acción */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedRecurring(pago)
                              setShowRecurringModal(true)
                            }}
                            className="p-1.5 hover:bg-indigo-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`¿Eliminar el pago recurrente "${pago.nombre}"?`)) return
                              try {
                                const res = await fetch(`/api/pagos-recurrentes/${pago.id}`, { method: 'DELETE' })
                                if (!res.ok) throw new Error('Error al eliminar')
                                cargarPagosRecurrentes()
                              } catch (error) {
                                alert('Error al eliminar pago recurrente')
                              }
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

        {/* Modal: Crear/Editar Pago Recurrente */}
        {showRecurringModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => {setShowRecurringModal(false); setSelectedRecurring(null);}}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{selectedRecurring ? 'Editar Pago Recurrente' : 'Nuevo Pago Recurrente'}</h2>
                  <button onClick={() => {setShowRecurringModal(false); setSelectedRecurring(null);}} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={async (e) => {e.preventDefault(); const formData = new FormData(e.currentTarget); const esMontoVariable = formData.get('esMontoVariable') === 'true'; try { const body = {nombre: formData.get('nombre'), proveedor: formData.get('proveedor'), ruc: formData.get('ruc') || null, cuentaDestino: formData.get('cuentaDestino') || null, categoria: formData.get('categoria'), descripcion: formData.get('descripcion'), esMontoVariable, montoFijo: esMontoVariable ? null : formData.get('montoFijo'), metodoPago: formData.get('metodoPago'), frecuencia: formData.get('frecuencia'), diaPago: formData.get('diaPago') || null, fechaInicio: formData.get('fechaInicio'), fechaFin: formData.get('fechaFin') || null, activo: formData.get('activo') === 'true', observaciones: formData.get('observaciones') || null}; const url = selectedRecurring ? `/api/pagos-recurrentes/${selectedRecurring.id}` : '/api/pagos-recurrentes'; const method = selectedRecurring ? 'PUT' : 'POST'; const res = await fetch(url, {method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)}); if (!res.ok) throw new Error('Error al guardar'); setShowRecurringModal(false); setSelectedRecurring(null); cargarPagosRecurrentes(); } catch (error) { alert('Error al guardar pago recurrente'); }}} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Pago *</label><input type="text" name="nombre" required defaultValue={selectedRecurring?.nombre} placeholder="Ej: Agua potable mensual" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label><input type="text" name="proveedor" required defaultValue={selectedRecurring?.proveedor} placeholder="Nombre del proveedor" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">RUC</label><input type="text" name="ruc" defaultValue={selectedRecurring?.ruc || ''} placeholder="RUC del proveedor" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
                    <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Cuenta Destino</label><input type="text" name="cuentaDestino" defaultValue={selectedRecurring?.cuentaDestino || ''} placeholder="Número de cuenta para transferencia" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label><select name="categoria" required defaultValue={selectedRecurring?.categoria} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"><option value="">Seleccione...</option><option value="SERVICIOS_BASICOS">Servicios Básicos</option><option value="MANTENIMIENTO">Mantenimiento</option><option value="SEGUROS">Seguros</option><option value="IMPUESTOS">Impuestos</option><option value="NOMINA">Nómina</option><option value="OTROS">Otros</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Monto *</label><select name="esMontoVariable" required defaultValue={selectedRecurring?.esMontoVariable ? 'true' : 'false'} onChange={(e) => {const montoInput = document.getElementById('montoFijo') as HTMLInputElement; if (montoInput) {montoInput.disabled = e.target.value === 'true'; if (e.target.value === 'true') montoInput.value = '';}}} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"><option value="false">Monto Fijo</option><option value="true">Monto Variable</option></select></div>
                    <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Monto Fijo</label><input type="number" id="montoFijo" name="montoFijo" min="0" step="0.01" defaultValue={selectedRecurring?.montoFijo || ''} disabled={selectedRecurring?.esMontoVariable} placeholder="Ej: 150000" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia *</label><select name="frecuencia" required defaultValue={selectedRecurring?.frecuencia} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"><option value="">Seleccione...</option><option value="QUINCENAL">Quincena (día 15)</option><option value="MENSUAL">Mensual</option><option value="BIMENSUAL">Bimensual</option><option value="TRIMESTRAL">Trimestral</option><option value="SEMESTRAL">Semestral</option><option value="ANUAL">Anual</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Día de Pago</label><input type="number" name="diaPago" min="1" max="31" defaultValue={selectedRecurring?.diaPago || ''} placeholder="Día del mes (1-31)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago *</label><select name="metodoPago" required defaultValue={selectedRecurring?.metodoPago} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"><option value="">Seleccione...</option><option value="TRANSFERENCIA">Transferencia</option><option value="EFECTIVO">Efectivo</option><option value="CHEQUE">Cheque</option><option value="DEBITO_AUTOMATICO">Débito Automático</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label><select name="activo" required defaultValue={selectedRecurring?.activo ? 'true' : 'false'} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"><option value="true">Activo</option><option value="false">Inactivo</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label><input type="date" name="fechaInicio" required defaultValue={selectedRecurring ? new Date(selectedRecurring.fechaInicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin (opcional)</label><input type="date" name="fechaFin" defaultValue={selectedRecurring?.fechaFin ? new Date(selectedRecurring.fechaFin).toISOString().split('T')[0] : ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
                    <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label><input type="text" name="descripcion" required defaultValue={selectedRecurring?.descripcion} placeholder="Descripción breve del pago" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" /></div>
                    <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label><textarea name="observaciones" rows={3} defaultValue={selectedRecurring?.observaciones || ''} placeholder="Notas adicionales..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" /></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => {setShowRecurringModal(false); setSelectedRecurring(null);}} className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                    <button type="submit" className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-colors">{selectedRecurring ? 'Actualizar' : 'Crear'} Pago Recurrente</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Crear Pago Eventual */}
        {showPagoEventualModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowPagoEventualModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-green-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Nuevo Pago Eventual</h2>
                    <p className="text-sm text-white/90 mt-1">Registrar un pago único no recurrente</p>
                  </div>
                  <button onClick={() => setShowPagoEventualModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                setGuardando(true)

                try {
                  const body = {
                    proveedor: formData.get('proveedor'),
                    ruc: formData.get('ruc') || null,
                    cuentaDestino: formData.get('cuentaDestino') || null,
                    fechaPago: formData.get('fechaPago'),
                    fechaVencimiento: formData.get('fechaVencimiento') || null,
                    periodo: (formData.get('fechaPago') as string).substring(0, 7),
                    categoria: formData.get('categoria'),
                    monto: parseFloat(formData.get('monto') as string),
                    descripcion: formData.get('descripcion'),
                    numeroFactura: formData.get('numeroFactura') || null,
                    numeroDocumento: formData.get('numeroDocumento') || null,
                    metodoPago: formData.get('metodoPago'),
                    estado: 'PAGADO',
                    observaciones: formData.get('observaciones') || null,
                  }

                  const res = await fetch('/api/otros-pagos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                  })

                  if (!res.ok) {
                    const error = await res.json()
                    alert(error.error || 'Error al crear pago eventual')
                    return
                  }

                  setShowPagoEventualModal(false)
                  cargarPagosEventuales()
                  alert('Pago eventual creado exitosamente')
                } catch (error) {
                  console.error('Error:', error)
                  alert('Error al crear pago eventual')
                } finally {
                  setGuardando(false)
                }
              }} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                    <input type="text" name="proveedor" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Nombre del proveedor" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
                    <input type="text" name="ruc" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="RUC del proveedor" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta Destino</label>
                    <input type="text" name="cuentaDestino" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Número de cuenta" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Pago *</label>
                    <input type="date" name="fechaPago" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Vencimiento</label>
                    <input type="date" name="fechaVencimiento" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                    <select name="categoria" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="">Seleccione...</option>
                      <option value="SERVICIOS_PUBLICOS">Servicios Públicos</option>
                      <option value="SERVICIOS_PERSONALES">Servicios Personales</option>
                      <option value="MANTENIMIENTO">Mantenimiento</option>
                      <option value="LIMPIEZA">Limpieza</option>
                      <option value="HONORARIOS">Honorarios</option>
                      <option value="IMPUESTOS">Impuestos</option>
                      <option value="OTROS">Otros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <input type="number" name="monto" step="0.01" min="0" required className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="0.00" />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                    <input type="text" name="descripcion" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Descripción del pago" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Factura</label>
                    <input type="text" name="numeroFactura" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Nº de factura" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago *</label>
                    <select name="metodoPago" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="">Seleccione...</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="DEBITO_AUTOMATICO">Débito Automático</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Documento/Referencia</label>
                    <input type="text" name="numeroDocumento" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Nº de transacción o referencia" />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                    <textarea name="observaciones" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none" placeholder="Notas adicionales..." />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <button type="button" onClick={() => setShowPagoEventualModal(false)} disabled={guardando} className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">Cancelar</button>
                  <button type="submit" disabled={guardando} className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-medium rounded-lg hover:from-emerald-700 hover:to-green-700 transition-colors disabled:opacity-50">{guardando ? 'Creando...' : 'Crear Pago Eventual'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Crear Pago Parcial (Selector de Cuenta) */}
        {showPagoParcialModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowPagoParcialModal(false)}>
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Registrar Pago Parcial</h2>
                    <p className="text-sm text-white/90 mt-1">Selecciona la cuenta y registra el abono</p>
                  </div>
                  <button onClick={() => setShowPagoParcialModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {cuentasParciales.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4">Selecciona una cuenta para registrar el abono:</p>
                    {cuentasParciales.map((cuenta) => (
                      <div
                        key={cuenta.id}
                        onClick={() => {
                          setCuentaSeleccionada(cuenta)
                          setShowPagoParcialModal(false)
                          setShowAbonoModal(true)
                        }}
                        className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 text-sm">{cuenta.espacioIdentificador} - {cuenta.arrendatarioNombre}</h3>
                              <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-orange-100 text-orange-700">{cuenta.concepto}</span>
                            </div>
                            <p className="text-xs text-gray-600">Período: {cuenta.periodo}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">${cuenta.montoPactado.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Total</p>
                          </div>
                        </div>

                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Progreso</span>
                            <span className="font-medium text-emerald-600">{cuenta.porcentajePagado.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(cuenta.porcentajePagado, 100)}%` }}></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-emerald-600">Abonado: ${cuenta.totalAbonado.toLocaleString()}</span>
                            <span className="text-orange-600 font-semibold">Pendiente: ${cuenta.saldoPendiente.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">{cuenta.cantidadAbonos} abono{cuenta.cantidadAbonos !== 1 ? 's' : ''} registrados</p>
                          <div className="flex items-center gap-1 text-indigo-600 text-xs font-medium">
                            <span>Seleccionar</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">No hay cuentas con pagos parciales pendientes</p>
                    <button
                      onClick={() => setShowPagoParcialModal(false)}
                      className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Registrar Abono */}
        {showAbonoModal && cuentaSeleccionada && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => {setShowAbonoModal(false); setCuentaSeleccionada(null);}}>
            <div className="bg-white rounded-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Registrar Abono</h2>
                    <p className="text-sm text-white/90 mt-1">{cuentaSeleccionada.espacioIdentificador} - {cuentaSeleccionada.arrendatarioNombre}</p>
                  </div>
                  <button onClick={() => {setShowAbonoModal(false); setCuentaSeleccionada(null);}} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                setGuardando(true)
                try {
                  const res = await fetch('/api/cobros/registrar-abono', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      cobroRelacionadoId: cuentaSeleccionada.id,
                      montoPagado: formData.get('monto'),
                      fechaPago: formData.get('fecha'),
                      metodoPago: formData.get('metodoPago'),
                      numeroComprobante: formData.get('numeroComprobante') || null,
                      observaciones: formData.get('observaciones') || null,
                    })
                  })

                  if (!res.ok) {
                    const error = await res.json()
                    alert(error.error || 'Error al registrar abono')
                    return
                  }

                  setShowAbonoModal(false)
                  setCuentaSeleccionada(null)
                  cargarPagosEventuales()
                } catch (error) {
                  console.error('Error:', error)
                  alert('Error al registrar abono')
                } finally {
                  setGuardando(false)
                }
              }} className="p-6 space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">Saldo pendiente:</span>
                    <span className="font-bold text-orange-600">${cuentaSeleccionada.saldoPendiente.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Total abonado:</span>
                    <span>${cuentaSeleccionada.totalAbonado.toLocaleString()} / ${cuentaSeleccionada.montoPactado.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto del Abono *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input type="number" name="monto" step="0.01" max={cuentaSeleccionada.saldoPendiente} required className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="0.00" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Pago *</label>
                  <input type="date" name="fecha" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago *</label>
                  <select name="metodoPago" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Seleccione...</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nº Comprobante</label>
                  <input type="text" name="numeroComprobante" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Opcional" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea name="observaciones" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" placeholder="Opcional" />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => {setShowAbonoModal(false); setCuentaSeleccionada(null);}} disabled={guardando} className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">Cancelar</button>
                  <button type="submit" disabled={guardando} className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-colors disabled:opacity-50">{guardando ? 'Guardando...' : 'Registrar Abono'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
