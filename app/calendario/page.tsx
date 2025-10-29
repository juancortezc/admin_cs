/**
 * Página de Calendario (Home)
 * Placeholder - Próximamente
 */

import Navbar from '@/app/components/Navbar'

export default function CalendarioPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="Calendario" />

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Calendario
          </h1>
          <p className="text-gray-600">
            Próximamente
          </p>
        </div>
      </main>
    </div>
  )
}
