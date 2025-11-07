/**
 * Página Madre - Administración de Espacios
 * Hub de navegación para Arrendatarios, Espacios y Cobros
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import TabsPill from '@/app/components/TabsPill'
import { UsersIcon, HomeIcon, ClipboardListIcon } from '@/app/components/icons'

export default function EspaciosAdminPage() {
  const router = useRouter()

  // Auto-redirect a la primera pestaña
  useEffect(() => {
    router.replace('/arrendatarios')
  }, [router])

  const tabs = [
    { id: 'arrendatarios', nombre: 'Arrendatarios', icon: <UsersIcon /> },
    { id: 'espacios', nombre: 'Espacios', icon: <HomeIcon /> },
    { id: 'cobros', nombre: 'Cobros', icon: <ClipboardListIcon /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Navbar activeTab="Arrendatarios" />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <HomeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Administración de Espacios</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Gestión de arrendatarios, espacios y cobros
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <TabsPill
            tabs={tabs}
            activeTab="arrendatarios"
            onTabChange={(tabId) => {
              if (tabId === 'arrendatarios') router.push('/arrendatarios')
              else if (tabId === 'espacios') router.push('/espacios')
              else if (tabId === 'cobros') router.push('/cobros')
            }}
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
