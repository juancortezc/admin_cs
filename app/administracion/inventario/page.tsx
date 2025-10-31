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
    <div className="min-h-screen bg-zinc-50">
      <Navbar activeTab="Inventario" />

      <main className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Inventario</h1>
          <p className="text-sm text-zinc-600 mt-1">
            Gestión de stock, movimientos y control kardex
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
          {tabActivo === 'items' && <ItemsTab />}
          {tabActivo === 'movimientos' && <MovimientosTab />}
          {tabActivo === 'kardex' && <KardexTab />}
          {tabActivo === 'kits' && <KitsTab />}
        </div>
      </main>
    </div>
  )
}
