/**
 * Página Madre - Administración
 * Hub de navegación para Pagos, Tickets e Inventario
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import TabsPill from '@/app/components/TabsPill'
import { CoinsIcon, WrenchIcon, BoxIcon } from '@/app/components/icons'

export default function AdministracionPage() {
  const router = useRouter()

  // Auto-redirect a la primera pestaña
  useEffect(() => {
    router.replace('/administracion/pagos')
  }, [router])

  const tabs = [
    { id: 'pagos', nombre: 'Pagos', icon: <CoinsIcon /> },
    { id: 'tickets', nombre: 'Tickets', icon: <WrenchIcon /> },
    { id: 'inventario', nombre: 'Inventario', icon: <BoxIcon /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="Pagos" />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <CoinsIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Administración</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Gestión de pagos, tickets e inventario
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <TabsPill
            tabs={tabs}
            activeTab="pagos"
            onTabChange={(tabId) => router.push(`/administracion/${tabId}`)}
          />
        </div>

        {/* Loading state mientras hace redirect */}
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 font-medium">Redirigiendo...</p>
          </div>
        </div>
      </main>
    </div>
  )
}
