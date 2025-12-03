/**
 * MainNavbar - Barra de navegación principal
 * Material Design 3 con todos los tabs principales
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { navigationConfig } from '@/app/lib/navigation'

type MainNavbarProps = {
  activeSection: string
}

export default function MainNavbar({ activeSection }: MainNavbarProps) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Tabs visibles en desktop (máximo 7 para que quepan)
  const visibleTabs = navigationConfig.slice(0, 7)
  const menuTabs = navigationConfig.slice(7)

  return (
    <>
      {/* Navbar con Material Design 3 */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: 'linear-gradient(120deg, #312E81 0%, #3730A3 50%, #2563EB 100%)',
          boxShadow: '0 4px 20px rgba(79, 70, 229, 0.25)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Título */}
            <Link
              href="/"
              className="text-xl font-bold text-white hover:scale-105 transition-all tracking-tight"
            >
              Casa del Sol
            </Link>

            {/* Desktop: Tabs principales */}
            <div className="hidden lg:flex items-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1.5 flex gap-1">
                {visibleTabs.map((section) => (
                  <Link
                    key={section.id}
                    href={section.ruta}
                    className={`
                      px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2
                      ${activeSection === section.id
                        ? 'bg-white text-indigo-700 shadow-md'
                        : 'text-white/90 hover:bg-white/10'
                      }
                    `}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                    </svg>
                    <span className="hidden xl:inline">{section.nombre}</span>
                  </Link>
                ))}

                {/* Menú "Más" para tabs adicionales */}
                {menuTabs.length > 0 && (
                  <div className="relative group">
                    <button
                      className={`
                        px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2
                        text-white/90 hover:bg-white/10
                      `}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                      <span className="hidden xl:inline">Más</span>
                    </button>

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      {menuTabs.map((section) => (
                        <Link
                          key={section.id}
                          href={section.ruta}
                          className={`
                            w-full px-4 py-2.5 text-left text-sm font-medium transition-colors flex items-center gap-3
                            ${activeSection === section.id
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                          </svg>
                          {section.nombre}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: Hamburguesa */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6 text-white"
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMenuAbierto(false)}
          />

          {/* Drawer */}
          <div
            className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
            style={{ boxShadow: '-4px 0 30px rgba(0, 0, 0, 0.2)' }}
          >
            <div className="p-6">
              {/* Header del drawer */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Menú</h2>
                <button
                  onClick={() => setMenuAbierto(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                  aria-label="Cerrar"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Links del drawer */}
              <div className="space-y-1">
                {navigationConfig.map((section) => (
                  <div key={section.id}>
                    <Link
                      href={section.ruta}
                      onClick={() => setMenuAbierto(false)}
                      className={`
                        w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3
                        ${activeSection === section.id
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                      </svg>
                      {section.nombre}
                    </Link>

                    {/* Subtabs en mobile */}
                    {activeSection === section.id && section.subtabs && (
                      <div className="ml-8 mt-1 space-y-1">
                        {section.subtabs.map((subtab) => (
                          <Link
                            key={subtab.id}
                            href={subtab.ruta}
                            onClick={() => setMenuAbierto(false)}
                            className="block w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            {subtab.nombre}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
