/**
 * Página de Calendario - Vista principal con eventos pendientes
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

  // Colores por tipo de evento
  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'arriendo': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'servicio': return 'bg-green-100 text-green-800 border-green-200'
      case 'empleado': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'otro': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'arriendo': return 'Arriendo'
      case 'servicio': return 'Servicio'
      case 'empleado': return 'Empleado'
      case 'otro': return 'Otro Pago'
      default: return tipo
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar activeTab="Calendario" />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="Calendario" />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header con resumen */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
          <p className="text-sm text-gray-600 mt-1">
            {eventos.length} evento{eventos.length !== 1 ? 's' : ''} este mes
            {eventosVencidos.length > 0 && (
              <span className="ml-2 text-red-600 font-medium">
                · {eventosVencidos.length} vencido{eventosVencidos.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['todos', 'arriendo', 'servicio', 'empleado', 'otro'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroTipo === tipo
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tipo === 'todos' ? 'Todos' : getTipoLabel(tipo)}
              <span className="ml-2 text-sm opacity-75">
                ({tipo === 'todos' ? eventos.length : eventos.filter(e => e.tipo === tipo).length})
              </span>
            </button>
          ))}
        </div>

        {/* Eventos Vencidos */}
        {eventosVencidos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-red-600 mb-4">
              ⚠ Pagos Vencidos ({eventosVencidos.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {eventosVencidos.map((evento) => (
                <div
                  key={evento.id}
                  className="bg-white rounded-lg border-2 border-red-200 p-4 shadow-sm"
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
                    <span className="text-red-600 font-medium">
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
