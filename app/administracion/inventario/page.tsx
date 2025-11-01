/**
 * Página principal de Inventario - Casa del Sol
 * Sistema completo de gestión de inventario con Kardex y alertas
 */

'use client'

import { useState } from 'react'
import Navbar from '@/app/components/Navbar'
import ItemsTab from '@/app/components/inventario/ItemsTab'
import MovimientosTab from '@/app/components/inventario/MovimientosTab'
import KardexTab from '@/app/components/inventario/KardexTab'
import KitsTab from '@/app/components/inventario/KitsTab'

export default function InventarioPage() {
  const [tabActivo, setTabActivo] = useState<'items' | 'movimientos' | 'kardex' | 'kits'>('items')

  const tabs = [
    { id: 'items', nombre: 'Items', icono: '📦' },
    { id: 'movimientos', nombre: 'Movimientos', icono: '📝' },
    { id: 'kardex', nombre: 'Kardex', icono: '📊' },
    { id: 'kits', nombre: 'Kits Airbnb', icono: '🎁' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar activeTab="Inventario" />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Inventario</h1>
              <p className="text-white/80 text-lg">
                Gestión de stock, movimientos y control kardex
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs con Material Design */}
        <div className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabActivo(tab.id as any)}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative ${
                  tabActivo === tab.id
                    ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">{tab.icono}</span>
                  <span>{tab.nombre}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido según tab activo */}
        <div className="animate-fadeIn">
          {tabActivo === 'items' && <ItemsTab />}
          {tabActivo === 'movimientos' && <MovimientosTab />}
          {tabActivo === 'kardex' && <KardexTab />}
          {tabActivo === 'kits' && <KitsTab />}
        </div>
      </main>
    </div>
  )
}
