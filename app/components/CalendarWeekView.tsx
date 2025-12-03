/**
 * CalendarWeekView Component - Mobile-optimized weekly bill view
 * Shows bills organized by day in a list format
 */

'use client'

type Bill = {
  id: string
  codigoInterno?: string
  espacioId?: string
  espacioIdentificador?: string
  arrendatarioNombre?: string
  proveedor?: string
  titulo: string
  monto: number
  estado: string
  tipo: 'cobro' | 'pago'
  fecha: Date
  esPagoParcial?: boolean
}

type CalendarWeekViewProps = {
  year: number
  month: number
  weekNumber: number // 0-based week of month
  bills: Bill[]
  onBillClick: (bill: Bill) => void
}

export default function CalendarWeekView({
  year,
  month,
  weekNumber,
  bills,
  onBillClick,
}: CalendarWeekViewProps) {
  // Calculate week start and end dates
  const firstDayOfMonth = new Date(year, month - 1, 1)
  const startOfWeek = new Date(firstDayOfMonth)
  startOfWeek.setDate(1 + weekNumber * 7)

  // Adjust to Monday
  const dayOfWeek = startOfWeek.getDay()
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  startOfWeek.setDate(startOfWeek.getDate() + daysToMonday)

  // Generate 7 days from Monday to Sunday
  const weekDays: Date[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    weekDays.push(day)
  }

  // Group bills by date
  const billsByDate: { [dateKey: string]: Bill[] } = {}
  bills.forEach((bill) => {
    const billDate = new Date(bill.fecha)
    const dateKey = `${billDate.getFullYear()}-${(billDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${billDate.getDate().toString().padStart(2, '0')}`

    if (!billsByDate[dateKey]) {
      billsByDate[dateKey] = []
    }
    billsByDate[dateKey].push(bill)
  })

  // Get border and dot colors
  const getBorderColor = (bill: Bill) => {
    const isPaid = bill.estado === 'PAGADO' || bill.estado === 'COBRADO'
    const billDate = new Date(bill.fecha)
    billDate.setHours(0, 0, 0, 0)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const isOverdue = !isPaid && billDate < now

    if (isPaid) return 'border-gray-500'
    if (isOverdue) return 'border-red-900'
    return 'border-blue-500'
  }

  const getDotColor = (bill: Bill) => {
    const isPaid = bill.estado === 'PAGADO' || bill.estado === 'COBRADO'
    const billDate = new Date(bill.fecha)
    billDate.setHours(0, 0, 0, 0)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const isOverdue = !isPaid && billDate < now

    if (bill.esPagoParcial) return 'bg-orange-500'
    if (isPaid) return 'bg-gray-500'
    if (isOverdue) return 'bg-red-900'
    return 'bg-blue-500'
  }

  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-4">
      {weekDays.map((day, index) => {
        const dateKey = `${day.getFullYear()}-${(day.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`
        const dayBills = billsByDate[dateKey] || []

        const isToday = day.getTime() === today.getTime()
        const isCurrentMonth = day.getMonth() + 1 === month

        return (
          <div
            key={dateKey}
            className={`card-elevated bg-white rounded-2xl p-4 ${
              isToday ? 'ring-2 ring-indigo-500' : ''
            }`}
          >
            {/* Day header */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div
                  className={`text-center ${
                    isToday ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                  } rounded-xl px-3 py-2 min-w-[60px]`}
                >
                  <div className="text-xs font-medium">{dayNames[index]}</div>
                  <div className="text-xl font-bold">{day.getDate()}</div>
                </div>
                {!isCurrentMonth && (
                  <span className="text-xs text-gray-400">
                    {day.toLocaleDateString('es', { month: 'short' })}
                  </span>
                )}
              </div>

              {dayBills.length > 0 && (
                <div className="text-sm font-semibold text-gray-600">
                  {dayBills.length} {dayBills.length === 1 ? 'factura' : 'facturas'}
                </div>
              )}
            </div>

            {/* Bills for this day */}
            {dayBills.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">
                Sin facturas
              </div>
            ) : (
              <div className="space-y-2">
                {dayBills.map((bill) => (
                  <button
                    key={bill.id}
                    onClick={() => onBillClick(bill)}
                    className={`w-full text-left p-3 rounded-lg border-2 bg-white transition-all hover:shadow-md cursor-pointer ${getBorderColor(
                      bill
                    )}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Dot + ID/Proveedor */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${getDotColor(
                            bill
                          )}`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-black text-sm truncate">
                            {bill.tipo === 'pago'
                              ? bill.proveedor || bill.titulo
                              : bill.arrendatarioNombre || bill.espacioIdentificador || bill.id.substring(0, 8)}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount */}
                      <div className="font-bold text-black text-sm flex-shrink-0">
                        ${bill.monto.toLocaleString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
