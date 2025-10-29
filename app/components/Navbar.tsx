/**
 * Navbar principal con navegación
 * Desktop: Tabs horizontales
 * Mobile: Menú hamburguesa con drawer lateral
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type NavbarProps = {
  activeTab?: 'Calendario' | 'Caja' | 'Mantenimiento' | 'Espacios' | 'Arrendatarios'
}

export default function Navbar({ activeTab }: NavbarProps) {
  const router = useRouter()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const tabs = [
    { nombre: 'Calendario', ruta: '/calendario' },
    { nombre: 'Caja', ruta: '/caja' },
    { nombre: 'Mantenimiento', ruta: '/mantenimiento' },
    { nombre: 'Espacios', ruta: '/espacios' },
    { nombre: 'Arrendatarios', ruta: '/arrendatarios' },
  ]

  const handleNavegar = (ruta: string) => {
    setMenuAbierto(false)
    router.push(ruta)
  }

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Título */}
            <button
              onClick={() => handleNavegar('/calendario')}
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Casa del Sol
            </button>

            {/* Desktop Tabs */}
            <div className="hidden md:flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.nombre}
                  onClick={() => handleNavegar(tab.ruta)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.nombre
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.nombre}
                </button>
              ))}
            </div>

            {/* Mobile Hamburguesa */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {menuAbierto ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {menuAbierto && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setMenuAbierto(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 md:hidden transform transition-transform duration-300">
            <div className="p-4">
              {/* Header del drawer */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Menú</h2>
                <button
                  onClick={() => setMenuAbierto(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Links del drawer */}
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.nombre}
                    onClick={() => handleNavegar(tab.ruta)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.nombre
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.nombre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
