/**
 * Modal de Registro de Cobro - Estilo Apple
 * Permite registrar nuevos cobros con todos los campos necesarios
 */

'use client'

import { useState, useEffect } from 'react'

type Espacio = {
  id: string
  identificador: string
  tipo: string
  monto: number | null
  montoPactado: number | null
  diaPago: number | null
  conceptoCobro: string
  arrendatario: {
    nombre: string
  } | null
}

type ModalRegistroCobroProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  espacioId?: string // Si viene de un espacio específico
}

export default function ModalRegistroCobro({
  isOpen,
  onClose,
  onSuccess,
  espacioId,
}: ModalRegistroCobroProps) {
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [espacioSeleccionado, setEspacioSeleccionado] = useState<string>(espacioId || '')
  const [concepto, setConcepto] = useState<'RENTA' | 'AIRBNB' | 'OTRO'>('RENTA')
  const [conceptoPersonalizado, setConceptoPersonalizado] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [montoPagado, setMontoPagado] = useState('')
  const [montoPactado, setMontoPactado] = useState('')
  const [fechaPago, setFechaPago] = useState('')
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [metodoPago, setMetodoPago] = useState<'TRANSFERENCIA' | 'EFECTIVO' | 'CHEQUE'>('TRANSFERENCIA')
  const [numeroComprobante, setNumeroComprobante] = useState('')
  const [estado, setEstado] = useState<'PAGADO' | 'PENDIENTE' | 'PARCIAL'>('PAGADO')
  const [observaciones, setObservaciones] = useState('')
  const [esParcial, setEsParcial] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [loading, setLoading] = useState(true)

  // Cargar espacios al montar
  useEffect(() => {
    if (isOpen) {
      fetch('/api/espacios')
        .then((r) => r.json())
        .then((data) => {
          setEspacios(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error:', error)
          setLoading(false)
        })

      // Inicializar con fecha actual
      const hoy = new Date().toISOString().split('T')[0]
      setFechaPago(hoy)

      // Si viene con espacioId, cargarlo
      if (espacioId) {
        setEspacioSeleccionado(espacioId)
      }
    }
  }, [isOpen, espacioId])

  // Cuando se selecciona un espacio, pre-llenar datos
  useEffect(() => {
    if (espacioSeleccionado) {
      const espacio = espacios.find((e) => e.id === espacioSeleccionado)
      if (espacio) {
        // Pre-llenar monto pactado
        if (espacio.montoPactado) {
          setMontoPactado(espacio.montoPactado.toString())
        } else if (espacio.monto) {
          setMontoPactado(espacio.monto.toString())
        }

        // Pre-llenar concepto según el espacio
        if (espacio.conceptoCobro) {
          setConcepto(espacio.conceptoCobro as any)
        }

        // Calcular fecha de vencimiento según día de pago
        if (espacio.diaPago) {
          const hoy = new Date()
          const mesActual = hoy.getMonth()
          const añoActual = hoy.getFullYear()
          const fechaVenc = new Date(añoActual, mesActual, espacio.diaPago)
          setFechaVencimiento(fechaVenc.toISOString().split('T')[0])
        }

        // Pre-llenar período (mes actual)
        const hoy = new Date()
        const periodoActual = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}`
        setPeriodo(periodoActual)
      }
    }
  }, [espacioSeleccionado, espacios])

  // Calcular diferencia automáticamente
  const diferencia = montoPagado && montoPactado ? parseFloat(montoPagado) - parseFloat(montoPactado) : 0

  // Sugerir estado según diferencia
  useEffect(() => {
    if (montoPagado && montoPactado) {
      const diff = parseFloat(montoPagado) - parseFloat(montoPactado)
      if (diff === 0) {
        setEstado('PAGADO')
        setEsParcial(false)
      } else if (diff < 0) {
        setEstado('PARCIAL')
        setEsParcial(true)
      } else {
        setEstado('PAGADO') // Sobrepago se considera pagado
        setEsParcial(false)
      }
    }
  }, [montoPagado, montoPactado])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    try {
      const body = {
        espacioId: espacioSeleccionado,
        concepto,
        conceptoPersonalizado: concepto === 'OTRO' ? conceptoPersonalizado : null,
        periodo: concepto === 'AIRBNB' ? null : periodo, // Airbnb no requiere período
        montoPagado: parseFloat(montoPagado),
        montoPactado: parseFloat(montoPactado),
        fechaPago,
        fechaVencimiento,
        metodoPago,
        numeroComprobante: numeroComprobante || null,
        estado,
        observaciones: observaciones || null,
        esParcial,
      }

      const res = await fetch('/api/cobros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        onSuccess()
        handleClose()
      } else {
        const error = await res.json()
        alert(error.error || 'Error al registrar cobro')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al registrar cobro')
    } finally {
      setGuardando(false)
    }
  }

  const handleClose = () => {
    // Resetear formulario
    setEspacioSeleccionado('')
    setConcepto('RENTA')
    setConceptoPersonalizado('')
    setPeriodo('')
    setMontoPagado('')
    setMontoPactado('')
    setFechaPago('')
    setFechaVencimiento('')
    setMetodoPago('TRANSFERENCIA')
    setNumeroComprobante('')
    setEstado('PAGADO')
    setObservaciones('')
    setEsParcial(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl pointer-events-auto animate-in zoom-in-95 duration-200 my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Registrar Cobro</h2>
              <button
                onClick={handleClose}
                disabled={guardando}
                className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Espacio */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Espacio <span className="text-red-500">*</span>
              </label>
              {loading ? (
                <div className="text-sm text-zinc-500">Cargando espacios...</div>
              ) : (
                <select
                  value={espacioSeleccionado}
                  onChange={(e) => setEspacioSeleccionado(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                >
                  <option value="">Seleccionar espacio</option>
                  {espacios.map((espacio) => (
                    <option key={espacio.id} value={espacio.id}>
                      {espacio.identificador} - {espacio.arrendatario?.nombre || 'Sin arrendatario'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Concepto */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Concepto <span className="text-red-500">*</span>
                </label>
                <select
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                >
                  <option value="RENTA">Renta</option>
                  <option value="AIRBNB">Airbnb</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              {concepto === 'OTRO' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-1.5">Especificar</label>
                  <input
                    type="text"
                    value={conceptoPersonalizado}
                    onChange={(e) => setConceptoPersonalizado(e.target.value)}
                    placeholder="Ej: Mantenimiento"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  />
                </div>
              )}

              {concepto !== 'AIRBNB' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                    Período <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="month"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  />
                </div>
              )}
            </div>

            {/* Montos */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Monto Pactado <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-600 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={montoPactado}
                    onChange={(e) => setMontoPactado(e.target.value)}
                    required
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Monto Pagado <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-600 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={montoPagado}
                    onChange={(e) => setMontoPagado(e.target.value)}
                    required
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Diferencia</label>
                <div
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                    diferencia === 0
                      ? 'bg-zinc-50 text-zinc-700'
                      : diferencia > 0
                      ? 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20'
                      : 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20'
                  }`}
                >
                  {diferencia > 0 ? '+' : ''}${diferencia.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Fecha de Vencimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Fecha de Pago <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={fechaPago}
                  onChange={(e) => setFechaPago(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>
            </div>

            {/* Método de Pago y Comprobante */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Método de Pago <span className="text-red-500">*</span>
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                >
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              {(metodoPago === 'TRANSFERENCIA' || metodoPago === 'CHEQUE') && (
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                    # Comprobante
                  </label>
                  <input
                    type="text"
                    value={numeroComprobante}
                    onChange={(e) => setNumeroComprobante(e.target.value)}
                    placeholder="Número de transacción"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  />
                </div>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              >
                <option value="PAGADO">Pagado</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="PARCIAL">Parcial</option>
              </select>
              {diferencia < 0 && (
                <p className="text-xs text-[#FF9500] mt-1">
                  ⚠️ El monto pagado es menor al pactado. Se sugiere estado "Parcial"
                </p>
              )}
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">Observaciones</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] resize-none"
                placeholder="Información adicional sobre este cobro..."
              />
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-zinc-200 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={guardando}
              className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-300 text-zinc-900 font-medium text-sm hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={guardando || loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#007AFF] text-white font-medium text-sm hover:bg-[#0051D5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {guardando ? 'Guardando...' : 'Registrar Cobro'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
