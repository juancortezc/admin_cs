/**
 * CalendarGrid Component - Material Design Bill Calendar
 * Displays bills in a monthly calendar grid with color coding
 */

'use client'

type Bill = {
  id: string
  codigoInterno?: string
  espacioId?: string
  proveedor?: string
  titulo: string
  monto: number
  estado: string
  tipo: 'cobro' | 'pago'
  fecha: Date
}

type CalendarGridProps = {
  year: number
  month: number // 1-12
  bills: Bill[]
  weekStartsOn: 'sunday' | 'monday'
  onBillClick: (bill: Bill) => void
}

export default function CalendarGrid({
  year,
  month,
  bills,
  weekStartsOn,
  onBillClick,
}: CalendarGridProps) {
  // Get first day of month and total days
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const totalDays = lastDay.getDate()

  // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
  let startDayOfWeek = firstDay.getDay()

  // Adjust if week starts on Monday
  if (weekStartsOn === 'monday') {
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1
  }

  // Day labels
  const dayLabels = weekStartsOn === 'sunday'
    ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Build calendar grid
  const weeks: (number | null)[][] = []
  let currentWeek: (number | null)[] = []

  // Fill empty cells before first day
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null)
  }

  // Fill days of month
  for (let day = 1; day <= totalDays; day++) {
    currentWeek.push(day)

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  // Fill remaining empty cells
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    weeks.push(currentWeek)
  }

  // Group bills by date
  const billsByDate: { [day: number]: Bill[] } = {}
  bills.forEach((bill) => {
    const billDate = new Date(bill.fecha)
    const day = billDate.getDate()
    if (!billsByDate[day]) {
      billsByDate[day] = []
    }
    billsByDate[day].push(bill)
  })

  // Get today's date for highlighting
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
  const todayDate = today.getDate()

  // Get border color only (white bg, black text)
  const getBorderColor = (bill: Bill) => {
    if (bill.estado === 'PAGADO' || bill.estado === 'COBRADO') {
      return 'border-gray-500' // Pagado = Gris
    }

    const billDate = new Date(bill.fecha)
    billDate.setHours(0, 0, 0, 0)
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    if (billDate < now) {
      return 'border-red-900' // Vencido = Vino
    }

    return 'border-blue-500' // Pendiente = Azul
  }

  return (
    <div className="card-elevated bg-white rounded-2xl p-4">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayLabels.map((label) => (
          <div
            key={label}
            className="text-center text-sm font-semibold text-indigo-600 py-2"
          >
            {label.substring(0, 3)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {weeks.map((week, weekIndex) => (
          week.map((day, dayIndex) => {
            const isToday = isCurrentMonth && day === todayDate
            const dayBills = day ? billsByDate[day] || [] : []

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`min-h-[120px] p-2 rounded-xl border transition-all ${
                  day
                    ? isToday
                      ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                      : 'bg-gray-50 border-gray-200 hover:border-indigo-200'
                    : 'bg-transparent border-transparent'
                }`}
              >
                {day && (
                  <>
                    {/* Day number */}
                    <div
                      className={`text-sm font-semibold mb-2 ${
                        isToday
                          ? 'text-indigo-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {day}
                    </div>

                    {/* Bills for this day - show codigo for cobros, proveedor for pagos */}
                    <div className="space-y-1">
                      {dayBills.slice(0, 5).map((bill) => (
                        <button
                          key={bill.id}
                          onClick={() => onBillClick(bill)}
                          className={`w-full text-center px-2 py-1 rounded-md border-2 bg-white text-black text-xs font-semibold transition-all hover:shadow-md cursor-pointer ${getBorderColor(
                            bill
                          )}`}
                        >
                          <div className="truncate">
                            {bill.tipo === 'pago'
                              ? bill.proveedor || bill.titulo
                              : bill.codigoInterno || bill.id.substring(0, 8)
                            }
                          </div>
                        </button>
                      ))}

                      {/* Show "+X more" if more than 5 bills */}
                      {dayBills.length > 5 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{dayBills.length - 5}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })
        ))}
      </div>
    </div>
  )
}
