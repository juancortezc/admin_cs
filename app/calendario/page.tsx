'use client'

/**
 * Bill Calendar Page - Material Design
 * Shows Cobros (bills to collect) and Pagos (bills to pay) in calendar view
 */

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import TabsPill from '@/app/components/TabsPill'

// Importar MainNavbar sin SSR para evitar errores de prerendering
const MainNavbar = dynamic(() => import('@/app/components/MainNavbar'), {
  ssr: false,
  loading: () => <div className="h-16 bg-white border-b border-gray-200" />
})
import { CalendarIcon, TrendingUpIcon, TrendingDownIcon } from '@/app/components/icons'
import CalendarGrid from '@/app/components/CalendarGrid'
import CalendarWeekView from '@/app/components/CalendarWeekView'
import ModalRegistroPago from '@/app/components/ModalRegistroPago'
import Toast from '@/app/components/Toast'

type Bill = {
  id: string
  codigoInterno?: string
  espacioId?: string // UUID for API calls
  espacioIdentificador?: string // Display identifier like "CS1"
  espacioNombre?: string
  arrendatarioNombre?: string
  titulo: string
  concepto?: string
  conceptoPersonalizado?: string
  proveedor?: string
  categoria?: string
  descripcion?: string
  periodo?: string
  monto: number
  montoPagado?: number
  montoPactado?: number
  diferencia?: number
  estado: string
  fechaVencimiento?: Date
  fechaPago?: Date
  fecha: Date
  tipo: 'cobro' | 'pago'
  formaPago?: string
  referencia?: string
  observaciones?: string
  esPagoParcial?: boolean
  abonos?: any[]
  esRecurrente?: boolean
  pagoRecurrenteId?: string
  pagoRecurrenteNombre?: string
  frecuencia?: string
  isCalculated?: boolean
  metodoPago?: string
}

function CalendarioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipo = searchParams.get('tipo') || 'ingresos'
  const activeTab = tipo === 'ingresos' ? 'cobros' : 'pagos'

  const handleTabChange = (tabId: string) => {
    const newTipo = tabId === 'ingresos' ? 'ingresos' : 'egresos'
    router.push(`/calendario?tipo=${newTipo}`)
  }

  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  // Month/Year/Week controls
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1) // 1-12
  const [weekNumber, setWeekNumber] = useState(0) // 0-based week of month
  const weekStartsOn = 'monday' // Fixed to Monday

  // Calculate current week on mount
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const dayOfWeek = firstDay.getDay()
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const firstMonday = new Date(firstDay)
    firstMonday.setDate(1 + daysToMonday)

    const diffTime = now.getTime() - firstMonday.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const currentWeek = Math.max(0, Math.floor(diffDays / 7))

    setWeekNumber(currentWeek)
  }, [])

  // Modal state
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Load bills
  useEffect(() => {
    loadBills()
  }, [activeTab, year, month])

  const loadBills = async () => {
    setLoading(true)
    try {
      const mes = `${year}-${month.toString().padStart(2, '0')}`
      const endpoint = activeTab === 'cobros' ? '/api/calendario/cobros' : '/api/calendario/pagos'
      const res = await fetch(`${endpoint}?mes=${mes}`)
      const data = await res.json()

      // Convert fecha strings to Date objects
      const billsWithDates = data.map((bill: any) => ({
        ...bill,
        fecha: new Date(bill.fecha),
        fechaVencimiento: bill.fechaVencimiento ? new Date(bill.fechaVencimiento) : undefined,
        fechaPago: bill.fechaPago ? new Date(bill.fechaPago) : undefined,
      }))

      setBills(billsWithDates)
    } catch (error) {
      console.error('Error loading bills:', error)
    } finally {
      setLoading(false)
    }
  }

  // Navigation
  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const goToToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth() + 1)

    // Calculate current week
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const dayOfWeek = firstDay.getDay()
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const firstMonday = new Date(firstDay)
    firstMonday.setDate(1 + daysToMonday)

    const diffTime = now.getTime() - firstMonday.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const currentWeek = Math.max(0, Math.floor(diffDays / 7))

    setWeekNumber(currentWeek)
  }

  // Week navigation
  const goToPreviousWeek = () => {
    if (weekNumber > 0) {
      setWeekNumber(weekNumber - 1)
    } else {
      // Go to previous month, last week
      goToPreviousMonth()
      setWeekNumber(3) // Approximate last week
    }
  }

  const goToNextWeek = () => {
    setWeekNumber(weekNumber + 1)
  }

  // Calculate week dates for display
  const getWeekDates = () => {
    const firstDayOfMonth = new Date(year, month - 1, 1)
    const startOfWeek = new Date(firstDayOfMonth)
    startOfWeek.setDate(1 + weekNumber * 7)

    const dayOfWeek = startOfWeek.getDay()
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    startOfWeek.setDate(startOfWeek.getDate() + daysToMonday)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    return { startOfWeek, endOfWeek }
  }

  // Filter bills by estado
  const billsFiltrados = filtroEstado === 'todos'
    ? bills
    : bills.filter((b) => {
        if (filtroEstado === 'pendiente') return b.estado === 'PENDIENTE'
        if (filtroEstado === 'vencido') {
          const isOverdue = b.fechaVencimiento && new Date(b.fechaVencimiento) < new Date()
          return b.estado === 'PENDIENTE' && isOverdue
        }
        if (filtroEstado === 'cobrado') return b.estado === 'COBRADO' || b.estado === 'PAGADO'
        if (filtroEstado === 'parcial') return b.esPagoParcial
        return true
      })

  // Calculate metrics (using all bills, not filtered)
  const pendingCobrosBills = activeTab === 'cobros'
    ? bills.filter((b) => b.estado === 'PENDIENTE')
    : bills.filter((b) => b.estado === 'PENDIENTE')
  const totalBills = pendingCobrosBills.length
  const paidBills = bills.filter((b) =>
    activeTab === 'cobros'
      ? b.estado === 'COBRADO' || b.estado === 'PAGADO'
      : b.estado === 'PAGADO'
  )
  const totalPaid = paidBills.reduce((sum, b) => sum + (b.montoPagado || b.monto), 0)
  const totalPending = bills
    .filter((b) => b.estado === 'PENDIENTE')
    .reduce((sum, b) => sum + b.monto, 0)
  const totalAmount = bills.reduce((sum, b) => sum + (b.montoPactado || b.monto), 0)
  const paymentPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0

  // Handle bill click
  const handleBillClick = (bill: Bill) => {
    setSelectedBill(bill)
  }

  // Handle mark as paid (quick action)
  const handleMarkAsPaid = async (billId: string) => {
    // This would call an API to mark the bill as paid
    // For now, we'll just reload
    setToastMessage('Pago registrado')
    setShowToast(true)
    loadBills()
  }

  // Month name
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar activeSection="calendario" />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar activeSection="calendario" />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header con Material Design 3 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Calendario</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Gestión de ingresos y egresos en vista calendario
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Ingresos/Egresos */}
        <div className="mb-6">
          <TabsPill
            tabs={[
              { id: 'ingresos', nombre: 'Ingresos', icon: <TrendingUpIcon /> },
              { id: 'egresos', nombre: 'Egresos', icon: <TrendingDownIcon /> },
            ]}
            activeTab={tipo}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card-elevated bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-600 mb-1">
              {activeTab === 'cobros' ? 'Cobros a Realizar' : 'Pagos a Realizar'}
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalBills}</div>
          </div>

          <div className="card-elevated bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-600 mb-1">Monto Pagado</div>
            <div className="text-3xl font-bold text-emerald-600">
              ${totalPaid.toLocaleString()}
            </div>
          </div>

          <div className="card-elevated bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-600 mb-1">Monto Pendiente</div>
            <div className="text-3xl font-bold text-amber-600">
              ${totalPending.toLocaleString()}
            </div>
          </div>

          <div className="card-elevated bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-600 mb-1">Porcentaje Pagado</div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-indigo-600">
                {paymentPercentage.toFixed(0)}%
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${paymentPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content: Calendar + Bill List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Views */}
          <div className="lg:col-span-2">
            {/* Desktop: Month/Year Controls */}
            <div className="hidden lg:block card-elevated bg-white rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="text-xl font-bold text-gray-900 min-w-[200px] text-center">
                  {monthNames[month - 1]} {year}
                </div>

                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={goToToday}
                  className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  Hoy
                </button>
              </div>
            </div>

            {/* Mobile: Week Controls */}
            <div className="lg:hidden card-elevated bg-white rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={goToPreviousWeek}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {(() => {
                      const { startOfWeek, endOfWeek } = getWeekDates()
                      return `${startOfWeek.getDate()} - ${endOfWeek.getDate()}`
                    })()}
                  </div>
                  <div className="text-xs text-gray-600">
                    {monthNames[month - 1]} {year}
                  </div>
                </div>

                <button
                  onClick={goToNextWeek}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={goToToday}
                  className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors cursor-pointer text-sm"
                >
                  Hoy
                </button>
              </div>
            </div>

            {/* Desktop: Calendar Grid */}
            <div className="hidden lg:block">
              <CalendarGrid
                year={year}
                month={month}
                bills={bills}
                weekStartsOn={weekStartsOn}
                onBillClick={handleBillClick}
              />
            </div>

            {/* Mobile: Week View */}
            <div className="lg:hidden">
              <CalendarWeekView
                year={year}
                month={month}
                weekNumber={weekNumber}
                bills={bills}
                onBillClick={handleBillClick}
              />
            </div>
          </div>

          {/* Bill List Side Panel */}
          <div className="lg:col-span-1">
            <div className="card-elevated bg-white rounded-2xl p-6 sticky top-24 max-h-[calc(100vh-150px)] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Detalle de {activeTab === 'cobros' ? 'Cobros' : 'Pagos'}
                </h3>
                {activeTab === 'pagos' && (
                  <a
                    href="/administracion/pagos?tab=eventuales"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Crear Pago
                  </a>
                )}
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-200">
                {['todos', 'pendiente', 'vencido', 'cobrado', 'parcial'].map((filtro) => (
                  <button
                    key={filtro}
                    onClick={() => setFiltroEstado(filtro)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      filtroEstado === filtro
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filtro.charAt(0).toUpperCase() + filtro.slice(1)}
                  </button>
                ))}
              </div>

              {billsFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">
                    No hay {activeTab === 'cobros' ? 'cobros' : 'pagos'} para este mes
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {billsFiltrados.map((bill) => {
                    const isPaid =
                      activeTab === 'cobros'
                        ? bill.estado === 'COBRADO' || bill.estado === 'PAGADO'
                        : bill.estado === 'PAGADO'
                    const isOverdue =
                      !isPaid &&
                      bill.fechaVencimiento &&
                      new Date(bill.fechaVencimiento) < new Date()

                    // Determine border color
                    let borderColor = 'border-blue-500' // Pendiente = Azul
                    if (isPaid) borderColor = 'border-gray-500' // Pagado = Gris
                    else if (isOverdue) borderColor = 'border-red-900' // Vencido = Vino

                    // Determine dot color
                    let dotColor = 'bg-blue-500' // Pendiente = Azul
                    if (isPaid) dotColor = 'bg-gray-500' // Pagado = Gris
                    else if (isOverdue) dotColor = 'bg-red-900' // Vencido = Vino
                    if (bill.esPagoParcial) dotColor = 'bg-orange-500' // Parcial = Naranja

                    return (
                      <button
                        key={bill.id}
                        onClick={() => handleBillClick(bill)}
                        className={`w-full text-left p-3 rounded-lg border-2 bg-white transition-all hover:shadow-md cursor-pointer ${borderColor}`}
                      >
                        <div className="flex items-center justify-between">
                          {/* Left: Dot + ID */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`}></div>
                            <span className="font-semibold text-black text-sm truncate">
                              {bill.espacioIdentificador || bill.id.substring(0, 8)}
                            </span>
                          </div>

                          {/* Right: Amount */}
                          <div className="font-bold text-black text-sm ml-2 flex-shrink-0">
                            ${bill.monto.toLocaleString()}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal for bill details (reuse existing ModalRegistroPago for now) */}
      {selectedBill && (
        <ModalRegistroPago
          evento={{
            id: selectedBill.id,
            tipo: activeTab === 'cobros' ? 'arriendo' : 'pago',
            titulo: selectedBill.titulo,
            descripcion: selectedBill.descripcion || selectedBill.arrendatarioNombre || '',
            monto: selectedBill.monto,
            dia: new Date(selectedBill.fecha).getDate(),
            espacioId: selectedBill.espacioId,
            pagoId: activeTab === 'pagos' ? selectedBill.id : undefined,
          }}
          onClose={() => setSelectedBill(null)}
          onSuccess={() => {
            setToastMessage('Pago registrado exitosamente')
            setShowToast(true)
            loadBills()
            setSelectedBill(null)
          }}
        />
      )}

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          tipo="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}

export default function CalendarioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 font-medium">Cargando calendario...</p>
          </div>
        </div>
      </div>
    }>
      <CalendarioContent />
    </Suspense>
  )
}
