/**
 * Vista de detalle de espacio con formulario de edición
 */

'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/app/components/Navbar'

type Arrendatario = {
  id: string
  nombre: string
  email: string
  celular: string
}

type Espacio = {
  id: string
  identificador: string
  tipo: string
  observaciones: string | null
  arrendatario: Arrendatario | null
  arrendatarioId: string | null
  monto: number | null
  diaPago: number | null
  fechaInicio: string | null
  fechaFin: string | null
}

export default function EspacioDetalle({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [espacio, setEspacio] = useState<Espacio | null>(null)
  const [arrendatarios, setArrendatarios] = useState<Arrendatario[]>([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [editando, setEditando] = useState(false)

  // Formulario
  const [formData, setFormData] = useState({
    arrendatarioId: '',
    monto: '',
    diaPago: '',
    fechaInicio: '',
    fechaFin: '',
    observaciones: '',
  })

  // Cargar espacio y arrendatarios
  useEffect(() => {
    Promise.all([
      fetch(`/api/espacios/${id}`).then((r) => r.json()),
      fetch('/api/arrendatarios').then((r) => r.json()),
    ])
      .then(([espacioData, arrendatariosData]) => {
        setEspacio(espacioData)
        setArrendatarios(arrendatariosData)

        // Llenar formulario con datos actuales
        setFormData({
          arrendatarioId: espacioData.arrendatarioId || '',
          monto: espacioData.monto?.toString() || '',
          diaPago: espacioData.diaPago?.toString() || '',
          fechaInicio: espacioData.fechaInicio
            ? new Date(espacioData.fechaInicio).toISOString().split('T')[0]
            : '',
          fechaFin: espacioData.fechaFin
            ? new Date(espacioData.fechaFin).toISOString().split('T')[0]
            : '',
          observaciones: espacioData.observaciones || '',
        })

        setLoading(false)
      })
      .catch((error) => {
        console.error('Error:', error)
        setLoading(false)
      })
  }, [id])

  // Guardar cambios
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    try {
      const res = await fetch(`/api/espacios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const updated = await res.json()
        setEspacio(updated)
        setEditando(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!espacio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Espacio no encontrado</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <button
            onClick={() => router.push('/espacios')}
            className="text-blue-600 hover:text-blue-700 font-medium mb-2"
          >
            ← Volver a Espacios
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {espacio.identificador}
          </h1>
          <p className="text-sm text-gray-600">
            {espacio.tipo}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {!editando ? (
            // Vista de solo lectura
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold text-gray-900">
                  Información del Espacio
                </h2>
                <button
                  onClick={() => setEditando(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Arrendatario
                  </label>
                  <p className="text-gray-900">
                    {espacio.arrendatario?.nombre || 'No asignado'}
                  </p>
                </div>

                {espacio.arrendatario && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Celular
                      </label>
                      <p className="text-gray-900">{espacio.arrendatario.celular}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">{espacio.arrendatario.email}</p>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Monto Arriendo
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {espacio.monto ? `$${espacio.monto.toLocaleString()}` : 'No definido'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Día de Pago
                  </label>
                  <p className="text-gray-900">
                    {espacio.diaPago ? `Día ${espacio.diaPago}` : 'No definido'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Fecha Inicio
                  </label>
                  <p className="text-gray-900">
                    {espacio.fechaInicio
                      ? new Date(espacio.fechaInicio).toLocaleDateString()
                      : 'No definida'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Fecha Fin
                  </label>
                  <p className="text-gray-900">
                    {espacio.fechaFin
                      ? new Date(espacio.fechaFin).toLocaleDateString()
                      : 'No definida'}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Observaciones
                  </label>
                  <p className="text-gray-900">
                    {espacio.observaciones || 'Sin observaciones'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Formulario de edición
            <form onSubmit={handleGuardar} className="space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold text-gray-900">
                  Editar Información
                </h2>
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="text-gray-600 hover:text-gray-700"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arrendatario
                  </label>
                  <select
                    value={formData.arrendatarioId}
                    onChange={(e) =>
                      setFormData({ ...formData, arrendatarioId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  >
                    <option value="">Sin asignar</option>
                    {arrendatarios.map((arr) => (
                      <option key={arr.id} value={arr.id}>
                        {arr.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto Arriendo ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monto}
                    onChange={(e) =>
                      setFormData({ ...formData, monto: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Día de Pago (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.diaPago}
                    onChange={(e) =>
                      setFormData({ ...formData, diaPago: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaInicio: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaFin: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    rows={3}
                    value={formData.observaciones}
                    onChange={(e) =>
                      setFormData({ ...formData, observaciones: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
