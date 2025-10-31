/**
 * Página principal de Airbnb - Casa del Sol
 * Sistema de administración de reservas con calendario integrado
 */

'use client'

import { useState } from 'react'
import Navbar from '@/app/components/Navbar'
import CalendarioAirbnb from '@/app/components/airbnb/CalendarioAirbnb'
import ReservasTab from '@/app/components/airbnb/ReservasTab'
import HuespedesTab from '@/app/components/airbnb/HuespedesTab'
import EspaciosTab from '@/app/components/airbnb/EspaciosTab'

export default function AirbnbPage() {
  const [tabActivo, setTabActivo] = useState<'calendario' | 'reservas' | 'huespedes' | 'espacios'>('calendario')

  const tabs = [
    { id: 'calendario', nombre: 'Calendario', icono: '📅' },
    { id: 'reservas', nombre: 'Reservas', icono: '🏠' },
    { id: 'huespedes', nombre: 'Huéspedes', icono: '👥' },
    { id: 'espacios', nombre: 'Espacios', icono: '🏢' },
  ]

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar activeTab="Reservas" />

      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Airbnb</h1>
          <p className="text-sm text-zinc-600 mt-1">
            Gestión de reservas y propiedades de alquiler temporal
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-zinc-200 mb-6">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabActivo(tab.id as any)}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  tabActivo === tab.id
                    ? 'text-[#007AFF]'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span className="mr-2">{tab.icono}</span>
                {tab.nombre}
                {tabActivo === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007AFF]" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido según tab activo */}
        <div className="animate-fadeIn">
          {tabActivo === 'calendario' && <CalendarioAirbnb />}
          {tabActivo === 'reservas' && <ReservasTab />}
          {tabActivo === 'huespedes' && <HuespedesTab />}
          {tabActivo === 'espacios' && <EspaciosTab />}
        </div>
      </main>
    </div>
  )
}
