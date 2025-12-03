/**
 * Página principal de Inventario - Casa del Sol
 * Sistema completo de gestión de inventario con Kardex y alertas
 * Material Design 3 con tabs pill style
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MainNavbar from '@/app/components/MainNavbar'
import TabsPill from '@/app/components/TabsPill'
import { BoxIcon, ArrowsExchangeIcon, ChartBarIcon, GiftIcon, CoinsIcon, WrenchIcon } from '@/app/components/icons'
import ItemsTab from '@/app/components/inventario/ItemsTab'
import MovimientosTab from '@/app/components/inventario/MovimientosTab'
import KardexTab from '@/app/components/inventario/KardexTab'
import KitsTab from '@/app/components/inventario/KitsTab'

export default function InventarioPage() {
  const router = useRouter()
  const [tabActivo, setTabActivo] = useState<'items' | 'movimientos' | 'kardex' | 'kits'>('items')

  const tabs = [
    { id: 'items', nombre: 'Items', icon: <BoxIcon /> },
    { id: 'movimientos', nombre: 'Movimientos', icon: <ArrowsExchangeIcon /> },
    { id: 'kardex', nombre: 'Kardex', icon: <ChartBarIcon /> },
    { id: 'kits', nombre: 'Kits Airbnb', icon: <GiftIcon /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar activeSection="pagos" />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-lg font-semibold text-gray-900">Inventario</h1>
        </div>

        {/* Navigation Tabs - Administración */}
        <div className="mb-6">
          <TabsPill
            tabs={[
              { id: 'pagos', nombre: 'Pagos', icon: <CoinsIcon /> },
              { id: 'tickets', nombre: 'Tickets', icon: <WrenchIcon /> },
              { id: 'inventario', nombre: 'Inventario', icon: <BoxIcon /> },
            ]}
            activeTab="inventario"
            onTabChange={(tabId) => {
              if (tabId === 'pagos') router.push('/administracion/pagos')
              else if (tabId === 'tickets') router.push('/administracion/tickets')
            }}
          />
        </div>

        {/* Tabs con Material Design 3 - Pill Style */}
        <div className="mb-6">
          <TabsPill
            tabs={tabs}
            activeTab={tabActivo}
            onTabChange={(tabId) => setTabActivo(tabId as any)}
          />
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
