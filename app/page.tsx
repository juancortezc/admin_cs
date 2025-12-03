/**
 * Landing Principal - Administracion de Espacios
 * Dashboard con resumen mensual, formularios de registro y recordatorios
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Espacio = {
  id: string
  identificador: string
  monto: number | null
  montoPactado: number | null
  diaPago: number | null
  conceptoCobro: string
  arrendatario: {
    id: string
    nombre: string
  } | null
}

type ResumenMensual = {
  mes: number
  anio: number
  ingresos: {
    total: number
    desglose: { renta: number; airbnb: number; otros: number }
  }
  egresos: {
    total: number
    desglose: { servicios: number; salarios: number; mantenimiento: number; otros: number }
  }
  balance: number
  aniosDisponibles: number[]
}

type Pendiente = {
  id: string
  tipo: string
  tipoLabel: string
  espacio?: string
  arrendatario?: string
  proveedor?: string
  monto: number
  pendiente?: number
  fechaVencimiento?: string
  diasVencido?: number
  isGenerated?: boolean
}

type PendientesResumen = {
  cobrosPendientes: Pendiente[]
  pagosPendientes: Pendiente[]
  resumen: {
    totalCobrosPendientes: number
    totalPagosPendientes: number
    cantidadCobros: number
    cantidadPagos: number
  }
}

type EspacioAirbnb = {
  id: string
  nombre: string
  activo: boolean
  precioBaseNoche: number
  _count: { reservas: number }
  reservas: {
    id: string
    codigoReserva: string
    checkIn: string
    checkOut: string
    estadoReserva: string
    huesped: { nombre: string }
  }[]
}

// Iconos SVG
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

const AirbnbIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.5 2 6 4.5 6 7.5c0 2 1 3.5 2 5l4 6 4-6c1-1.5 2-3 2-5C18 4.5 15.5 2 12 2zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function LandingPage() {
  const router = useRouter()
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1)
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear())
  const [resumen, setResumen] = useState<ResumenMensual | null>(null)
  const [pendientes, setPendientes] = useState<PendientesResumen | null>(null)
  const [espaciosAirbnb, setEspaciosAirbnb] = useState<EspacioAirbnb[]>([])
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [loading, setLoading] = useState(true)
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Formularios inline
  const [formIngreso, setFormIngreso] = useState<'consultorio' | 'horas' | null>(null)
  const [formEgreso, setFormEgreso] = useState<'programado' | 'eventual' | null>(null)

  // Estados del formulario de ingreso
  const [ingresoData, setIngresoData] = useState({
    arrendatarioId: '',
    espacioId: '',
    montoPactado: '',
    montoPagado: '',
    fechaPago: new Date().toISOString().split('T')[0],
    metodoPago: 'TRANSFERENCIA',
    observaciones: '',
  })

  // Estados del formulario de egreso
  const [egresoData, setEgresoData] = useState({
    proveedor: '',
    monto: '',
    fechaPago: new Date().toISOString().split('T')[0],
    categoria: 'SERVICIOS_PUBLICOS',
    metodoPago: 'TRANSFERENCIA',
    descripcion: '',
  })

  const [guardando, setGuardando] = useState(false)

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  // Configuracion de navegacion
  const navItems = [
    { id: 'inicio', nombre: 'Inicio', icon: <HomeIcon />, ruta: '/' },
    { id: 'calendario', nombre: 'Calendario', icon: <CalendarIcon />, ruta: '/calendario' },
    { id: 'espacios', nombre: 'Espacios', icon: <BuildingIcon />, ruta: '/espacios-admin' },
    { id: 'airbnb', nombre: 'Airbnb', icon: <AirbnbIcon />, ruta: '/airbnb' },
    { id: 'admin', nombre: 'Admin', icon: <SettingsIcon />, ruta: '/administracion' },
  ]

  useEffect(() => {
    cargarDatos()
  }, [mesSeleccionado, anioSeleccionado])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [resumenRes, pendientesRes, airbnbRes, espaciosRes] = await Promise.all([
        fetch(`/api/resumen-mensual?mes=${mesSeleccionado}&anio=${anioSeleccionado}`),
        fetch('/api/pendientes'),
        fetch('/api/airbnb/espacios'),
        fetch('/api/espacios'),
      ])

      if (resumenRes.ok) setResumen(await resumenRes.json())
      if (pendientesRes.ok) setPendientes(await pendientesRes.json())
      if (airbnbRes.ok) setEspaciosAirbnb(await airbnbRes.json())
      if (espaciosRes.ok) setEspacios(await espaciosRes.json())
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cuando se selecciona un espacio, pre-llenar monto
  useEffect(() => {
    if (ingresoData.espacioId) {
      const espacio = espacios.find(e => e.id === ingresoData.espacioId)
      if (espacio) {
        setIngresoData(prev => ({
          ...prev,
          montoPactado: (espacio.montoPactado || espacio.monto || 0).toString(),
          arrendatarioId: espacio.arrendatario?.id || '',
        }))
      }
    }
  }, [ingresoData.espacioId, espacios])

  const handleSubmitIngreso = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    try {
      const espacio = espacios.find(e => e.id === ingresoData.espacioId)
      const hoy = new Date()
      const periodo = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
      const fechaVenc = new Date(hoy.getFullYear(), hoy.getMonth(), espacio?.diaPago || 1)

      const body = {
        espacioId: ingresoData.espacioId,
        concepto: 'RENTA',
        periodo,
        montoPagado: parseFloat(ingresoData.montoPagado),
        montoPactado: parseFloat(ingresoData.montoPactado),
        fechaPago: ingresoData.fechaPago,
        fechaVencimiento: fechaVenc.toISOString().split('T')[0],
        metodoPago: ingresoData.metodoPago,
        estado: parseFloat(ingresoData.montoPagado) >= parseFloat(ingresoData.montoPactado) ? 'PAGADO' : 'PARCIAL',
        observaciones: ingresoData.observaciones || null,
      }

      const res = await fetch('/api/cobros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setFormIngreso(null)
        setIngresoData({
          arrendatarioId: '',
          espacioId: '',
          montoPactado: '',
          montoPagado: '',
          fechaPago: new Date().toISOString().split('T')[0],
          metodoPago: 'TRANSFERENCIA',
          observaciones: '',
        })
        cargarDatos()
      } else {
        const error = await res.json()
        alert(error.error || 'Error al registrar')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al registrar')
    } finally {
      setGuardando(false)
    }
  }

  const handleSubmitEgreso = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    try {
      const body = {
        proveedor: egresoData.proveedor,
        monto: parseFloat(egresoData.monto),
        fechaPago: egresoData.fechaPago,
        categoria: egresoData.categoria,
        metodoPago: egresoData.metodoPago,
        descripcion: egresoData.descripcion || null,
        estado: 'PAGADO',
      }

      const res = await fetch('/api/otros-pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setFormEgreso(null)
        setEgresoData({
          proveedor: '',
          monto: '',
          fechaPago: new Date().toISOString().split('T')[0],
          categoria: 'SERVICIOS_PUBLICOS',
          metodoPago: 'TRANSFERENCIA',
          descripcion: '',
        })
        cargarDatos()
      } else {
        const error = await res.json()
        alert(error.error || 'Error al registrar')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al registrar')
    } finally {
      setGuardando(false)
    }
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const handleNavegar = (ruta: string) => {
    setMenuAbierto(false)
    router.push(ruta)
  }

  if (loading && !resumen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Filtrar espacios Airbnb ocupados (con reserva EN_CURSO o CONFIRMADA)
  const espaciosOcupados = espaciosAirbnb.filter(e => {
    if (!e.activo) return false
    return e.reservas?.some(r => r.estadoReserva === 'EN_CURSO' || r.estadoReserva === 'CONFIRMADA')
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header limpio blanco */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Titulo */}
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              Administracion Espacios
            </h1>

            {/* Desktop: Navegacion */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavegar(item.ruta)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    item.id === 'inicio'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.nombre}</span>
                </button>
              ))}
            </nav>

            {/* Selectores Mes/Anio + Hamburguesa Mobile */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <select
                  value={mesSeleccionado}
                  onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
                  className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {meses.map((mes, i) => (
                    <option key={i} value={i + 1}>{mes}</option>
                  ))}
                </select>
                <select
                  value={anioSeleccionado}
                  onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
                  className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {(resumen?.aniosDisponibles || [new Date().getFullYear()]).map(anio => (
                    <option key={anio} value={anio}>{anio}</option>
                  ))}
                </select>
              </div>

              {/* Hamburguesa Mobile */}
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                aria-label="Menu"
              >
                {menuAbierto ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {menuAbierto && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMenuAbierto(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 md:hidden">
            <div className="p-5">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setMenuAbierto(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Selectores en mobile */}
              <div className="mb-6 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-medium text-gray-500 mb-2">Periodo</p>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={mesSeleccionado}
                    onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
                    className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg"
                  >
                    {meses.map((mes, i) => (
                      <option key={i} value={i + 1}>{mes}</option>
                    ))}
                  </select>
                  <select
                    value={anioSeleccionado}
                    onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
                    className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg"
                  >
                    {(resumen?.aniosDisponibles || [new Date().getFullYear()]).map(anio => (
                      <option key={anio} value={anio}>{anio}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavegar(item.ruta)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                      item.id === 'inicio'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    {item.nombre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Cards principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Ingresos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Ingresos {meses[mesSeleccionado - 1]}</p>
                    <p className="text-2xl font-bold text-gray-900">{formatMoney(resumen?.ingresos.total || 0)}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-gray-500">Rentas</p>
                  <p className="font-semibold text-gray-900">{formatMoney(resumen?.ingresos.desglose.renta || 0)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-gray-500">Airbnb</p>
                  <p className="font-semibold text-gray-900">{formatMoney(resumen?.ingresos.desglose.airbnb || 0)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-gray-500">Otros</p>
                  <p className="font-semibold text-gray-900">{formatMoney(resumen?.ingresos.desglose.otros || 0)}</p>
                </div>
              </div>
            </div>

            {/* Dropdown agregar pago */}
            <div className="border-t border-gray-100 p-4">
              <select
                value={formIngreso || ''}
                onChange={(e) => setFormIngreso(e.target.value as 'consultorio' | 'horas' | null || null)}
                className="w-full px-3 py-2.5 text-sm bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">+ Agregar Pago</option>
                <option value="consultorio">Por Consultorio</option>
                <option value="horas">Por Horas de Consultorio</option>
              </select>

              {/* Formulario inline de ingreso */}
              {formIngreso && (
                <form onSubmit={handleSubmitIngreso} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Arrendatario</label>
                    <select
                      value={ingresoData.espacioId}
                      onChange={(e) => setIngresoData({ ...ingresoData, espacioId: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Seleccionar...</option>
                      {espacios.filter(e => e.arrendatario).map(espacio => (
                        <option key={espacio.id} value={espacio.id}>
                          {espacio.arrendatario?.nombre} ({espacio.identificador})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Monto Pactado</label>
                      <input
                        type="number"
                        step="0.01"
                        value={ingresoData.montoPactado}
                        onChange={(e) => setIngresoData({ ...ingresoData, montoPactado: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Monto Pagado</label>
                      <input
                        type="number"
                        step="0.01"
                        value={ingresoData.montoPagado}
                        onChange={(e) => setIngresoData({ ...ingresoData, montoPagado: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
                      <input
                        type="date"
                        value={ingresoData.fechaPago}
                        onChange={(e) => setIngresoData({ ...ingresoData, fechaPago: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Metodo</label>
                      <select
                        value={ingresoData.metodoPago}
                        onChange={(e) => setIngresoData({ ...ingresoData, metodoPago: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="CHEQUE">Cheque</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormIngreso(null)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={guardando}
                      className="flex-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {guardando ? 'Guardando...' : 'Registrar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Card Egresos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Egresos {meses[mesSeleccionado - 1]}</p>
                    <p className="text-2xl font-bold text-gray-900">{formatMoney(resumen?.egresos.total || 0)}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-gray-500">Servicios</p>
                  <p className="font-semibold text-gray-900">{formatMoney(resumen?.egresos.desglose.servicios || 0)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-gray-500">Salarios</p>
                  <p className="font-semibold text-gray-900">{formatMoney(resumen?.egresos.desglose.salarios || 0)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-gray-500">Manten.</p>
                  <p className="font-semibold text-gray-900">{formatMoney(resumen?.egresos.desglose.mantenimiento || 0)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-gray-500">Otros</p>
                  <p className="font-semibold text-gray-900">{formatMoney(resumen?.egresos.desglose.otros || 0)}</p>
                </div>
              </div>
            </div>

            {/* Dropdown agregar pago */}
            <div className="border-t border-gray-100 p-4">
              <select
                value={formEgreso || ''}
                onChange={(e) => setFormEgreso(e.target.value as 'programado' | 'eventual' | null || null)}
                className="w-full px-3 py-2.5 text-sm bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium focus:ring-2 focus:ring-red-500"
              >
                <option value="">+ Agregar Pago</option>
                <option value="programado">Pago Programado</option>
                <option value="eventual">Pago Eventual</option>
              </select>

              {/* Formulario inline de egreso */}
              {formEgreso && (
                <form onSubmit={handleSubmitEgreso} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Proveedor/Concepto</label>
                    <input
                      type="text"
                      value={egresoData.proveedor}
                      onChange={(e) => setEgresoData({ ...egresoData, proveedor: e.target.value })}
                      required
                      placeholder="Ej: CNEL, Agua Potable..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
                      <select
                        value={egresoData.categoria}
                        onChange={(e) => setEgresoData({ ...egresoData, categoria: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                      >
                        <option value="SERVICIOS_PUBLICOS">Servicios Publicos</option>
                        <option value="MANTENIMIENTO">Mantenimiento</option>
                        <option value="LIMPIEZA">Limpieza</option>
                        <option value="NOMINA">Nomina</option>
                        <option value="OTROS">Otros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Monto</label>
                      <input
                        type="number"
                        step="0.01"
                        value={egresoData.monto}
                        onChange={(e) => setEgresoData({ ...egresoData, monto: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
                      <input
                        type="date"
                        value={egresoData.fechaPago}
                        onChange={(e) => setEgresoData({ ...egresoData, fechaPago: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Metodo</label>
                      <select
                        value={egresoData.metodoPago}
                        onChange={(e) => setEgresoData({ ...egresoData, metodoPago: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                      >
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="CHEQUE">Cheque</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Descripcion</label>
                    <input
                      type="text"
                      value={egresoData.descripcion}
                      onChange={(e) => setEgresoData({ ...egresoData, descripcion: e.target.value })}
                      placeholder="Opcional..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormEgreso(null)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={guardando}
                      className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {guardando ? 'Guardando...' : 'Registrar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Balance del Mes</span>
            <span className={`text-xl font-bold ${(resumen?.balance || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatMoney(resumen?.balance || 0)}
            </span>
          </div>
        </div>

        {/* Recordatorios con resumen de totales */}
        {pendientes && (pendientes.cobrosPendientes.length > 0 || pendientes.pagosPendientes.length > 0) && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recordatorios</h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg">
                  <span className="text-red-600 font-medium">Pagos:</span>
                  <span className="text-red-700 font-bold">{formatMoney(pendientes.resumen?.totalPagosPendientes || 0)}</span>
                  <span className="text-red-500 text-xs">({pendientes.resumen?.cantidadPagos || 0})</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg">
                  <span className="text-amber-600 font-medium">Cobros:</span>
                  <span className="text-amber-700 font-bold">{formatMoney(pendientes.resumen?.totalCobrosPendientes || 0)}</span>
                  <span className="text-amber-500 text-xs">({pendientes.resumen?.cantidadCobros || 0})</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Pagos pendientes PRIMERO */}
              {pendientes.pagosPendientes.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border p-4 ${
                    (item.diasVencido || 0) > 0 ? 'border-red-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      {item.tipoLabel}
                    </span>
                    {(item.diasVencido || 0) > 0 && (
                      <span className="text-xs text-red-600 font-medium">
                        {item.diasVencido}d vencido
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{item.proveedor}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-gray-900">{formatMoney(item.monto)}</span>
                    <button className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Pagar
                    </button>
                  </div>
                </div>
              ))}

              {/* Cobros pendientes DESPUES */}
              {pendientes.cobrosPendientes.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border p-4 ${
                    (item.diasVencido || 0) > 0 ? 'border-red-200' : 'border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      (item.diasVencido || 0) > 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.tipoLabel}
                    </span>
                    {(item.diasVencido || 0) > 0 && (
                      <span className="text-xs text-red-600 font-medium">
                        {item.diasVencido}d vencido
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{item.arrendatario || item.espacio}</p>
                  <p className="text-xs text-gray-500">{item.espacio}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-gray-900">{formatMoney(item.pendiente || item.monto)}</span>
                    <button className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                      Cobrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Seccion Airbnb - Solo ocupados */}
        {espaciosOcupados.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Airbnb Ocupados</h2>
              <button
                onClick={() => handleNavegar('/airbnb')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Ver todo
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {espaciosOcupados.map((espacio) => {
                const reservaActiva = espacio.reservas?.find(r =>
                  r.estadoReserva === 'EN_CURSO' || r.estadoReserva === 'CONFIRMADA'
                )

                return (
                  <div
                    key={espacio.id}
                    className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleNavegar('/airbnb')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{espacio.nombre}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Ocupado
                      </span>
                    </div>

                    {reservaActiva && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{reservaActiva.huesped.nombre}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(reservaActiva.checkIn).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - {new Date(reservaActiva.checkOut).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-xs text-gray-400">{reservaActiva.codigoReserva}</p>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">${espacio.precioBaseNoche}/noche</span>
                      <span className="text-xs text-gray-500">{espacio._count?.reservas || 0} reservas</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Link a calendario */}
        <div className="text-center py-4">
          <a
            href="/calendario"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Ver calendario completo
          </a>
        </div>
      </main>
    </div>
  )
}
