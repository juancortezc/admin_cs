/**
 * Modal de Registro de Pago/Cobro - Estilo Apple
 * Permite registrar pagos para eventos del calendario
 */

'use client'

import { useState, useEffect } from 'react'

type Evento = {
  id: string
  tipo: 'arriendo' | 'servicio' | 'empleado' | 'otro' | 'pago' | 'airbnb_checkin' | 'airbnb_checkout'
  titulo: string
  descripcion: string
  monto: number | null
  dia: number
  espacioId?: string
  servicioId?: string
  empleadoId?: string
  pagoId?: string
  reservaId?: string
}

type ModalRegistroPagoProps = {
  evento: Evento | null
  onClose: () => void
  onSuccess: () => void
}

export default function ModalRegistroPago({ evento, onClose, onSuccess }: ModalRegistroPagoProps) {
  const [fecha, setFecha] = useState('')
  const [monto, setMonto] = useState('')
  const [formaPago, setFormaPago] = useState<'TRANSFERENCIA' | 'EFECTIVO' | 'CHEQUE'>('TRANSFERENCIA')
  const [referencia, setReferencia] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (evento) {
      // Inicializar con fecha actual
      const hoy = new Date().toISOString().split('T')[0]
      setFecha(hoy)
      setMonto(evento.monto?.toString() || '')
      setReferencia('')
      setObservaciones('')
      setFormaPago('TRANSFERENCIA')
    }
  }, [evento])

  if (!evento) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('=== FORM SUBMITTED ===')
    console.log('Evento:', evento)
    console.log('Fecha:', fecha, 'Monto:', monto, 'Forma Pago:', formaPago)
    setGuardando(true)

    try {
      let endpoint = ''
      let body: any = {
        monto: parseFloat(monto),
        observaciones,
        formaPago,
        referencia: referencia || undefined,
      }
      console.log('Body inicial:', body)

      // Determinar endpoint y campos específicos según tipo
      if (evento.tipo === 'arriendo') {
        // Check if this is an existing cobro (real ID) or a generated one
        const isExistingCobro = !evento.id.startsWith('generated-')

        if (isExistingCobro) {
          // Update existing cobro
          endpoint = `/api/cobros/${evento.id}`

          // First get the existing cobro data
          const cobroRes = await fetch(endpoint)
          if (!cobroRes.ok) {
            alert('Error al obtener datos del cobro')
            setGuardando(false)
            return
          }
          const cobroData = await cobroRes.json()

          // Update with payment info
          const updateBody = {
            ...cobroData,
            estado: 'PAGADO',
            fechaPago: fecha,
            montoPagado: parseFloat(monto),
            metodoPago: formaPago,
            numeroComprobante: referencia || cobroData.numeroComprobante,
            observaciones: observaciones || cobroData.observaciones,
          }

          console.log('Enviando PUT a:', endpoint)
          console.log('Update body:', updateBody)

          const res = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateBody),
          })

          console.log('Respuesta status:', res.status)

          if (res.ok) {
            console.log('Pago registrado exitosamente')
            onSuccess()
            onClose()
          } else {
            const error = await res.json()
            console.error('Error response:', error)
            alert(error.error || 'Error al registrar pago')
          }
          setGuardando(false)
          return
        } else {
          // Create new cobro for generated/pending event
          endpoint = '/api/cobros'
          body.espacioId = evento.espacioId
          body.fechaPago = fecha
          body.montoPagado = parseFloat(monto)
          body.montoPactado = parseFloat(monto) // Asumimos que paga exacto
          body.concepto = 'RENTA' // Por defecto
          body.metodoPago = formaPago

          // Calcular fecha de vencimiento
          const fechaVencimiento = new Date()
          fechaVencimiento.setDate(evento.dia)
          body.fechaVencimiento = fechaVencimiento.toISOString().split('T')[0]

          // Período actual (YYYY-MM)
          const now = new Date()
          body.periodo = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
          body.estado = 'PAGADO'
          body.numeroComprobante = referencia
        }
      } else if (evento.tipo === 'servicio') {
        endpoint = '/api/pagos/servicios'
        body.servicioBasicoId = evento.servicioId
        body.fechaPago = fecha
      } else if (evento.tipo === 'empleado') {
        endpoint = '/api/pagos/salarios'
        body.empleadoId = evento.empleadoId
        body.fechaPago = fecha
        // Agregar período (YYYY-MM)
        const periodo = fecha.substring(0, 7)
        body.periodo = periodo
        body.total = parseFloat(monto) // Por ahora, sin bonos ni descuentos
      } else if (evento.tipo === 'otro') {
        endpoint = '/api/otros-pagos'
        body.fechaPago = fecha
        body.proveedor = evento.titulo
        body.descripcion = evento.descripcion || 'Pago parcial'
        body.periodo = fecha.substring(0, 7) // YYYY-MM
        body.categoria = 'OTROS'
        body.metodoPago = formaPago
        body.estado = 'PAGADO'
        body.monto = parseFloat(monto)
        body.numeroDocumento = referencia || null
        body.observaciones = observaciones || null
      } else if (evento.tipo === 'pago') {
        // Para pagos existentes pendientes, actualizar a PAGADO
        if (evento.pagoId) {
          // Primero obtener el pago completo
          const pagoRes = await fetch(`/api/otros-pagos/${evento.pagoId}`)
          if (!pagoRes.ok) {
            alert('Error al obtener datos del pago')
            setGuardando(false)
            return
          }
          const pagoData = await pagoRes.json()

          // Actualizar con los nuevos valores
          endpoint = `/api/otros-pagos/${evento.pagoId}`
          const updateBody = {
            ...pagoData,
            estado: 'PAGADO',
            fechaPago: fecha,
            monto: parseFloat(monto),
            metodoPago: formaPago,
            numeroDocumento: referencia || pagoData.numeroDocumento,
            observaciones: observaciones || pagoData.observaciones,
          }

          const res = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateBody),
          })

          if (res.ok) {
            onSuccess()
            onClose()
          } else {
            const error = await res.json()
            alert(error.error || 'Error al registrar pago')
          }
          setGuardando(false)
          return
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        onSuccess()
        onClose()
      } else {
        const error = await res.json()
        alert(error.error || 'Error al registrar pago')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al registrar pago')
    } finally {
      setGuardando(false)
    }
  }

  const mostrarReferencia = formaPago === 'TRANSFERENCIA' || formaPago === 'CHEQUE'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Registrar Pago</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                disabled={guardando}
              >
                <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-zinc-900">{evento.titulo}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{evento.descripcion}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Fecha de Pago
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
              />
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Monto
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-zinc-600 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Forma de Pago */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Forma de Pago
              </label>
              <select
                value={formaPago}
                onChange={(e) => setFormaPago(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
              >
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            {/* Referencia (condicional) */}
            {mostrarReferencia && (
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Número de {formaPago === 'TRANSFERENCIA' ? 'Transferencia' : 'Cheque'}
                </label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                  placeholder="Opcional"
                />
              </div>
            )}

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Observaciones
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all resize-none"
                placeholder="Opcional"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={guardando}
                className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-300 text-zinc-900 font-medium text-sm hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#007AFF] text-white font-medium text-sm hover:bg-[#0051D5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {guardando ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
