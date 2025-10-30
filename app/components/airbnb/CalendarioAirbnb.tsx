/**
 * Calendario de Reservas Airbnb
 * Vista mensual de check-ins y check-outs
 */

'use client'

import { useEffect, useState } from 'react'

type EventoAirbnb = {
  id: string
  tipo: 'airbnb_checkin' | 'airbnb_checkout'
  titulo: string
  descripcion: string
  monto: number | null
  fecha: string
  dia: number
  reservaId: string
  codigoReserva: string
  estadoPago?: string
}

export default function CalendarioAirbnb() {
  const [eventos, setEventos] = useState<EventoAirbnb[]>([])
  const [loading, setLoading] = useState(true)
  const [mesActual, setMesActual] = useState('')

  useEffect(() => {
    const now = new Date()
    const mes = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
    setMesActual(mes)
    cargarEventos(mes)
  }, [])

  const cargarEventos = (mes: string) => {
    setLoading(true)
    fetch(`/api/calendario/eventos?mes=${mes}&tipo=airbnb`)
      .then((r) => r.json())
      .then((data) => {
        setEventos(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error:', error)
        setLoading(false)
      })
  }

  const cambiarMes = (direccion: 'anterior' | 'siguiente') => {
    const [year, month] = mesActual.split('-').map(Number)
    const fecha = new Date(year, month - 1, 1)

    if (direccion === 'anterior') {
      fecha.setMonth(fecha.getMonth() - 1)
    } else {
      fecha.setMonth(fecha.getMonth() + 1)
    }

    const nuevoMes = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`
    setMesActual(nuevoMes)
    cargarEventos(nuevoMes)
  }

  const formatearMes = (mes: string) => {
    const [year, month] = mes.split('-')
    const fecha = new Date(parseInt(year), parseInt(month) - 1, 1)
    return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  }

  // Separar eventos por tipo
  const checkIns = eventos.filter(e => e.tipo === 'airbnb_checkin')
  const checkOuts = eventos.filter(e => e.tipo === 'airbnb_checkout')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-zinc-600">Cargando calendario...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header con navegación de mes */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => cambiarMes('anterior')}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2 className="text-lg font-semibold text-zinc-900 capitalize">
            {formatearMes(mesActual)}
          </h2>

          <button
            onClick={() => cambiarMes('siguiente')}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#34C759]"></div>
            <span className="text-zinc-600">{checkIns.length} Check-ins</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF9500]"></div>
            <span className="text-zinc-600">{checkOuts.length} Check-outs</span>
          </div>
        </div>
      </div>

      {/* Check-ins */}
      {checkIns.length > 0 && (
        <div className="mb-6">
          <h3 className="text-base font-semibold text-[#34C759] mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
            Check-ins ({checkIns.length})
          </h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {checkIns.map((evento) => (
              <div
                key={evento.id}
                className="bg-white rounded-xl border border-[#34C759]/20 p-4 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-zinc-900 text-sm">{evento.titulo}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{evento.descripcion}</p>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20">
                    Día {evento.dia}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-zinc-100">
                  <span className="text-zinc-500">{evento.codigoReserva}</span>
                  {evento.monto && evento.monto > 0 && (
                    <span className="text-[#FF3B30] font-semibold">
                      Pendiente: ${evento.monto.toFixed(2)}
                    </span>
                  )}
                  {(!evento.monto || evento.monto === 0) && (
                    <span className="text-[#34C759] font-semibold">Pagado ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check-outs */}
      {checkOuts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-base font-semibold text-[#FF9500] mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
            Check-outs ({checkOuts.length})
          </h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {checkOuts.map((evento) => (
              <div
                key={evento.id}
                className="bg-white rounded-xl border border-[#FF9500]/20 p-4 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-zinc-900 text-sm">{evento.titulo}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{evento.descripcion}</p>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20">
                    Día {evento.dia}
                  </span>
                </div>
                <div className="text-xs mt-3 pt-3 border-t border-zinc-100">
                  <span className="text-zinc-500">{evento.codigoReserva}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje vacío */}
      {checkIns.length === 0 && checkOuts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-zinc-200">
          <svg className="w-12 h-12 text-zinc-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-zinc-500">
            No hay check-ins ni check-outs programados para este mes
          </p>
        </div>
      )}
    </div>
  )
}
