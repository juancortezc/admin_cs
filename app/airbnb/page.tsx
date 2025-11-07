/**
 * Página principal de Airbnb - Casa del Sol - Material Design 3
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
    {
      id: 'calendario',
      nombre: 'Calendario',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'reservas',
      nombre: 'Reservas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'huespedes',
      nombre: 'Huéspedes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'espacios',
      nombre: 'Espacios',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Navbar activeTab="Reservas" />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header con Material Design 3 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Airbnb</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Gestión de reservas y propiedades de alquiler temporal
              </p>
            </div>
          </div>
        </div>

        {/* Tabs con Material Design 3 - Pill Style */}
        <div className="mb-6">
          <div className="card-elevated bg-white rounded-2xl p-2 inline-flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabActivo(tab.id as any)}
                className={`
                  px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2
                  ${tabActivo === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200 transform scale-105'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.nombre}</span>
              </button>
            ))}
          </div>
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
