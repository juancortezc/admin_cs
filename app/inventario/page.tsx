/**
 * Página de Inventario - Casa del Sol
 * Sistema completo de gestión de inventario con Kardex y alertas
 */

'use client'

import { useState } from 'react'
import MainNavbar from '@/app/components/MainNavbar'
import ItemsTab from '@/app/components/inventario/ItemsTab'
import MovimientosTab from '@/app/components/inventario/MovimientosTab'
import KardexTab from '@/app/components/inventario/KardexTab'
import KitsTab from '@/app/components/inventario/KitsTab'

type TabInventario = 'items' | 'movimientos' | 'kardex' | 'kits'

export default function InventarioPage() {
  const [tabActivo, setTabActivo] = useState<TabInventario>('items')

  const tabs: { id: TabInventario; nombre: string }[] = [
    { id: 'items', nombre: 'Items' },
    { id: 'movimientos', nombre: 'Movimientos' },
    { id: 'kardex', nombre: 'Kardex' },
    { id: 'kits', nombre: 'Kits Airbnb' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar activeSection="mantenimiento" />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-lg font-semibold text-gray-900">Inventario</h1>
        </div>

        {/* Tabs de inventario */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabActivo(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tabActivo === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tab.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido según tab activo */}
        <div>
          {tabActivo === 'items' && <ItemsTab />}
          {tabActivo === 'movimientos' && <MovimientosTab />}
          {tabActivo === 'kardex' && <KardexTab />}
          {tabActivo === 'kits' && <KitsTab />}
        </div>
      </main>
    </div>
  )
}
