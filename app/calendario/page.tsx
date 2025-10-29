/**
 * Página de Calendario - Vista principal con eventos pendientes
 * Diseño Apple: compacto, minimalista, elegante
 */

'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/app/components/Navbar'

type Evento = {
  id: string
  tipo: 'arriendo' | 'servicio' | 'empleado' | 'otro'
  titulo: string
  descripcion: string
  monto: number | null
  fecha: string
  dia: number
  vencido: boolean
}

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [mesActual, setMesActual] = useState('')

  useEffect(() => {
    // Obtener mes actual en formato YYYY-MM
    const now = new Date()
    const mes = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
    setMesActual(mes)
    cargarEventos(mes)
  }, [])

  const cargarEventos = (mes: string) => {
    setLoading(true)
    fetch(`/api/calendario/eventos?mes=${mes}`)
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

  // Filtrar eventos por tipo
  const eventosFiltrados = filtroTipo === 'todos'
    ? eventos
    : eventos.filter(e => e.tipo === filtroTipo)

  // Separar eventos vencidos y próximos
  const eventosVencidos = eventosFiltrados.filter(e => e.vencido)
  const eventoProximos = eventosFiltrados.filter(e => !e.vencido)

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'arriendo': return 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20'
      case 'servicio': return 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20'
      case 'empleado': return 'bg-[#AF52DE]/10 text-[#AF52DE] border-[#AF52DE]/20'
      case 'otro': return 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/20'
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200'
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'arriendo': return 'Arriendo'
      case 'servicio': return 'Servicio'
      case 'empleado': return 'Salario'
      case 'otro': return 'Otro'
      default: return tipo
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar activeTab="Calendario" />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-zinc-600">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar activeTab="Calendario" />

      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Header compacto */}
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Calendario</h1>
          <p className="text-sm text-zinc-600 mt-0.5">
            {eventos.length} evento{eventos.length !== 1 ? 's' : ''}
            {eventosVencidos.length > 0 && (
              <span className="ml-2 text-[#FF3B30] font-medium">
                · {eventosVencidos.length} vencido{eventosVencidos.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        {/* Filtros compactos */}
        <div className="mb-4 flex flex-wrap gap-2">
          {['todos', 'arriendo', 'servicio', 'empleado', 'otro'].map((tipo) => {
            const count = tipo === 'todos' ? eventos.length : eventos.filter(e => e.tipo === tipo).length
            const isActive = filtroTipo === tipo

            return (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                }`}
              >
                {tipo === 'todos' ? 'Todos' : getTipoLabel(tipo)}
                <span className={`ml-1.5 text-xs ${isActive ? 'opacity-90' : 'opacity-60'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Eventos Vencidos */}
        {eventosVencidos.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-semibold text-[#FF3B30] mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Vencidos ({eventosVencidos.length})
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {eventosVencidos.map((evento) => (
                <div
                  key={evento.id}
                  className="bg-white rounded-xl border border-[#FF3B30]/20 p-3 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-zinc-900 text-sm truncate">{evento.titulo}</h3>
                      <p className="text-xs text-zinc-600 mt-0.5 truncate">{evento.descripcion}</p>
                    </div>
                    <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-md border flex-shrink-0 ${getColorTipo(evento.tipo)}`}>
                      {getTipoLabel(evento.tipo)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-zinc-100">
                    <span className="text-[#FF3B30] font-medium">Día {evento.dia}</span>
                    {evento.monto && (
                      <span className="text-zinc-900 font-semibold">${evento.monto.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eventos Próximos */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Próximos Pagos ({eventoProximos.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eventoProximos.map((evento) => (
              <div
                key={evento.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{evento.titulo}</h3>
                    <p className="text-sm text-gray-600 mt-1">{evento.descripcion}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getColorTipo(evento.tipo)}`}>
                    {getTipoLabel(evento.tipo)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Día {evento.dia}
                  </span>
                  {evento.monto && (
                    <span className="text-gray-900 font-semibold">
                      ${evento.monto.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {eventoProximos.length === 0 && eventosVencidos.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">
                {filtroTipo === 'todos'
                  ? 'No hay eventos registrados para este mes'
                  : `No hay eventos de tipo "${getTipoLabel(filtroTipo)}" para este mes`}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
