/**
 * Página principal de Airbnb - Material Design 3 Clean Style
 */

'use client'

import { useState } from 'react'
import MainNavbar from '@/app/components/MainNavbar'
import CalendarioAirbnb from '@/app/components/airbnb/CalendarioAirbnb'
import ReservasTab from '@/app/components/airbnb/ReservasTab'
import HuespedesTab from '@/app/components/airbnb/HuespedesTab'
import EspaciosTab from '@/app/components/airbnb/EspaciosTab'
import OcupacionTab from '@/app/components/airbnb/OcupacionTab'

export default function AirbnbPage() {
  const [tabActivo, setTabActivo] = useState<'calendario' | 'reservas' | 'huespedes' | 'espacios' | 'ocupacion'>('calendario')

  const tabs = [
    { id: 'calendario', nombre: 'Calendario' },
    { id: 'reservas', nombre: 'Reservas' },
    { id: 'huespedes', nombre: 'Huéspedes' },
    { id: 'espacios', nombre: 'Espacios' },
    { id: 'ocupacion', nombre: 'Ocupación' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar activeSection="airbnb" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Airbnb</h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActivo(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tabActivo === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.nombre}
            </button>
          ))}
        </div>

        {/* Contenido según tab activo */}
        <div>
          {tabActivo === 'calendario' && <CalendarioAirbnb />}
          {tabActivo === 'reservas' && <ReservasTab />}
          {tabActivo === 'huespedes' && <HuespedesTab />}
          {tabActivo === 'espacios' && <EspaciosTab />}
          {tabActivo === 'ocupacion' && <OcupacionTab />}
        </div>
      </main>
    </div>
  )
}
