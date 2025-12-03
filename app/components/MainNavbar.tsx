/**
 * MainNavbar - Barra de navegación principal
 * Header blanco limpio con tabs de navegación
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { navigationConfig, VISIBLE_NAV_TABS } from '@/app/lib/navigation'

type MainNavbarProps = {
  activeSection: string
}

export default function MainNavbar({ activeSection }: MainNavbarProps) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Tabs visibles en desktop (6 principales)
  const visibleTabs = navigationConfig.slice(0, VISIBLE_NAV_TABS)
  const menuTabs = navigationConfig.slice(VISIBLE_NAV_TABS)

  return (
    <>
      {/* Header blanco limpio */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Título */}
            <Link
              href="/"
              className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors tracking-tight"
            >
              Administración Espacios
            </Link>

            {/* Desktop: Tabs principales */}
            <nav className="hidden md:flex items-center gap-1">
              {visibleTabs.map((section) => (
                <Link
                  key={section.id}
                  href={section.ruta}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2
                    ${activeSection === section.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  {section.nombre}
                </Link>
              ))}

              {/* Menú "Más" para tabs adicionales */}
              {menuTabs.length > 0 && (
                <div className="relative group">
                  <button
                    className="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Más
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {menuTabs.map((section) => (
                      <Link
                        key={section.id}
                        href={section.ruta}
                        className={`
                          block w-full px-4 py-2.5 text-left text-sm font-medium transition-colors
                          ${activeSection === section.id
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        {section.nombre}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>

            {/* Mobile: Hamburguesa */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all text-gray-600"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6"
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
      </header>

      {/* Mobile Drawer */}
      {menuAbierto && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMenuAbierto(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 md:hidden overflow-y-auto">
            <div className="p-5">
              {/* Header del drawer */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
                <button
                  onClick={() => setMenuAbierto(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-all text-gray-500"
                  aria-label="Cerrar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3
                        ${activeSection === section.id
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-100'
                        }
                      `}
                    >
                      {section.nombre}
                    </Link>

                    {/* Subtabs en mobile */}
                    {activeSection === section.id && section.subtabs && (
                      <div className="ml-6 mt-1 space-y-1">
                        {section.subtabs.map((subtab) => (
                          <Link
                            key={subtab.id}
                            href={subtab.ruta}
                            onClick={() => setMenuAbierto(false)}
                            className="block w-full text-left px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
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
